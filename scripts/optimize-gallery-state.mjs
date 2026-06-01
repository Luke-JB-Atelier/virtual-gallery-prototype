import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const projectRoot = path.resolve(import.meta.dirname, '..');
const defaultOutputPath = path.join(projectRoot, 'src', 'public-gallery-state.json');
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultOutputPath;
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOutputPath;

const maxDimension = Number(process.env.GALLERY_IMAGE_MAX_DIMENSION ?? 1600);
const jpegQuality = Number(process.env.GALLERY_IMAGE_JPEG_QUALITY ?? 0.82);
const jpegReencodeMinBytes = Number(process.env.GALLERY_IMAGE_JPEG_REENCODE_MIN_BYTES ?? 700 * 1024);
const pngReencodeMinBytes = Number(process.env.GALLERY_IMAGE_PNG_REENCODE_MIN_BYTES ?? 450 * 1024);
const minSavings = 0.08;

function validateState(data) {
  if (data?.version !== 1) {
    throw new Error('Gallery state must have version: 1.');
  }
  if (!Array.isArray(data.gallery?.paintings)) {
    throw new Error('Gallery state is missing gallery.paintings.');
  }
}

function getDataImageMime(value) {
  const match = typeof value === 'string' ? value.match(/^data:image\/([a-z0-9.+-]+);base64,/i) : null;
  if (!match) return null;
  return match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase();
}

function shouldPreserveImageMime(slot) {
  if (slot.key !== 'imageSrc') return true;
  if (slot.mime !== 'png') return false;

  const searchable = [
    slot.holder?.labelTitle,
    slot.holder?.labelMedium,
    slot.holder?.labelSize,
  ].filter(Boolean).join(' ').toLowerCase();

  return /\bqr\b|donate|twitch|stream|sporitel|podpor/.test(searchable);
}

function collectImageSlots(value, slots = [], pathParts = []) {
  if (!value || typeof value !== 'object') return slots;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectImageSlots(item, slots, [...pathParts, index]));
    return slots;
  }

  Object.entries(value).forEach(([key, item]) => {
    const mime = getDataImageMime(item);
    if (mime && ['jpeg', 'png', 'webp'].includes(mime)) {
      slots.push({ holder: value, key, mime, path: [...pathParts, key].join('.') });
      return;
    }
    collectImageSlots(item, slots, [...pathParts, key]);
  });

  return slots;
}

async function optimizeImage(page, dataUrl, preserveMime = false) {
  return page.evaluate(async ({ source, maxDimension: maxSize, jpegQuality: quality, preserveMime: keepMime, jpegReencodeMinBytes: jpegMinBytes, pngReencodeMinBytes: pngMinBytes }) => {
    const sourceMimeMatch = source.match(/^data:(image\/[a-z0-9.+-]+);base64,/i);
    const sourceMime = sourceMimeMatch?.[1]?.toLowerCase() ?? 'image/jpeg';
    const blob = await fetch(source).then((response) => response.blob());
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const shouldResize = width !== bitmap.width || height !== bitmap.height;
    const shouldReencode = shouldResize
      || (sourceMime === 'image/jpeg' && source.length >= jpegMinBytes)
      || (sourceMime !== 'image/jpeg' && !keepMime && source.length >= pngMinBytes);

    if (!shouldReencode) {
      const originalWidth = bitmap.width;
      const originalHeight = bitmap.height;
      bitmap.close();
      return {
        dataUrl: source,
        width: originalWidth,
        height: originalHeight,
        outputMime: sourceMime,
        skipped: true,
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let hasAlpha = false;
    if (sourceMime !== 'image/jpeg') {
      const pixels = ctx.getImageData(0, 0, width, height).data;
      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] < 250) {
          hasAlpha = true;
          break;
        }
      }
    }

    const outputMime = keepMime || hasAlpha
      ? (sourceMime === 'image/webp' ? 'image/png' : sourceMime)
      : 'image/jpeg';

    let dataUrl;
    if (outputMime === 'image/jpeg') {
      const jpegCanvas = document.createElement('canvas');
      jpegCanvas.width = width;
      jpegCanvas.height = height;
      const jpegCtx = jpegCanvas.getContext('2d');
      jpegCtx.fillStyle = '#ffffff';
      jpegCtx.fillRect(0, 0, width, height);
      jpegCtx.drawImage(canvas, 0, 0);
      dataUrl = jpegCanvas.toDataURL(outputMime, quality);
    } else {
      dataUrl = canvas.toDataURL(outputMime);
    }

    return {
      dataUrl,
      width,
      height,
      outputMime,
      hasAlpha,
      skipped: false,
    };
  }, { source: dataUrl, maxDimension, jpegQuality, preserveMime, jpegReencodeMinBytes, pngReencodeMinBytes });
}

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);
validateState(data);

const slots = collectImageSlots(data);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const report = [];

for (const slot of slots) {
  const original = slot.holder[slot.key];
  const originalLength = original.length;
  const optimized = await optimizeImage(page, original, shouldPreserveImageMime(slot));
  const optimizedLength = optimized.dataUrl.length;
  const savings = 1 - optimizedLength / originalLength;
  if (optimizedLength < originalLength && savings >= minSavings) {
    slot.holder[slot.key] = optimized.dataUrl;
    report.push({
      path: slot.path,
      beforeKb: Math.round(originalLength / 1024),
      afterKb: Math.round(optimizedLength / 1024),
      width: optimized.width,
      height: optimized.height,
      outputMime: optimized.outputMime,
    });
  }
}

await browser.close();

fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

const beforeBytes = Buffer.byteLength(raw, 'utf8');
const afterBytes = fs.statSync(outputPath).size;
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`Images optimized: ${report.length}/${slots.length}`);
console.log(`State size: ${(beforeBytes / 1024 / 1024).toFixed(2)} MB -> ${(afterBytes / 1024 / 1024).toFixed(2)} MB`);
report.forEach((item) => {
  console.log(`${item.path}: ${item.beforeKb} KB -> ${item.afterKb} KB (${item.width}x${item.height}, ${item.outputMime})`);
});
