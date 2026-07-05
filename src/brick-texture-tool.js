function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hash2(a, b, seed = 0) {
  let x = Math.imul(a + 374761393, 668265263) ^ Math.imul(b + seed + 1442695041, 2246822519);
  x = Math.imul(x ^ (x >>> 13), 3266489917);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function tileNoise(x, y, size, scale, seed = 0) {
  const gx = x / scale;
  const gy = y / scale;
  const cells = Math.max(2, Math.round(size / scale));
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const tx = smoothstep(gx - x0);
  const ty = smoothstep(gy - y0);
  const x1 = (x0 + 1) % cells;
  const y1 = (y0 + 1) % cells;
  const sx = ((x0 % cells) + cells) % cells;
  const sy = ((y0 % cells) + cells) % cells;
  const n00 = hash2(sx, sy, seed);
  const n10 = hash2(x1, sy, seed);
  const n01 = hash2(sx, y1, seed);
  const n11 = hash2(x1, y1, seed);
  return lerp(lerp(n00, n10, tx), lerp(n01, n11, tx), ty);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean.length === 3
    ? clean.split('').map((part) => part + part).join('')
    : clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function drawTileableMortar(ctx, size, settings) {
  const image = ctx.createImageData(size, size);
  const base = hexToRgb(settings.mortarColor);
  const grain = settings.mortarGrain / 100;
  const dirt = settings.mortarDirt / 100;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const powder = tileNoise(x, y, size, 10, 12);
      const sand = tileNoise(x, y, size, 24, 37);
      const patch = tileNoise(x, y, size, 96, 44);
      const stain = tileNoise(x, y, size, 180, 51);
      const sharpSpeck = hash2(x, y, 91);
      const blackGrit = sharpSpeck > 0.985 ? -62 * dirt : 0;
      const paleGrain = sharpSpeck < 0.012 ? 28 * grain * (1 - dirt * 0.35) : 0;
      const dirtyPatch = Math.max(0, stain - 0.54) * -92 * dirt;
      const wetPatch = Math.max(0, patch - 0.7) * -54 * dirt;
      const value = (powder - 0.5) * 18 * grain
        + (sand - 0.5) * 34 * grain
        + dirtyPatch
        + wetPatch
        + blackGrit
        + paleGrain;
      image.data[i] = clamp(base.r + value, 18, 168);
      image.data[i + 1] = clamp(base.g + value * 0.94, 17, 158);
      image.data[i + 2] = clamp(base.b + value * 0.86, 16, 146);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < Math.round(38 + dirt * 80); i += 1) {
    const cx = hash2(i, 0, 220) * size;
    const cy = hash2(i, 1, 221) * size;
    const radiusX = size * (0.012 + hash2(i, 2, 222) * 0.035);
    const radiusY = size * (0.006 + hash2(i, 3, 223) * 0.024);
    const alpha = (0.025 + hash2(i, 4, 224) * 0.09) * dirt;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusX);
    gradient.addColorStop(0, `rgba(42, 31, 25, ${alpha})`);
    gradient.addColorStop(1, 'rgba(42, 31, 25, 0)');
    ctx.fillStyle = gradient;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, radiusY / radiusX);
    ctx.beginPath();
    ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function createProceduralBrickSource(width = 512, height = 210) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const horizontal = tileNoise(x, y, width, 52, 6);
      const fine = hash2(x, y, 7);
      const stain = tileNoise(x, y, width, 170, 19);
      const pore = fine > 0.986 ? -56 : 0;
      const r = 145 + (horizontal - 0.5) * 48 + (stain - 0.5) * 46 + pore;
      const g = 72 + (horizontal - 0.5) * 26 + (stain - 0.5) * 18 + pore * 0.42;
      const b = 43 + (horizontal - 0.5) * 20 + (stain - 0.5) * 16 + pore * 0.32;
      image.data[i] = clamp(r, 70, 202);
      image.data[i + 1] = clamp(g, 34, 126);
      image.data[i + 2] = clamp(b, 22, 92);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function createRoughBrickSource(width = 620, height = 160) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const nx = x / width;
      const ny = y / height;
      const rough = tileNoise(x, y, width, 28, 72);
      const large = tileNoise(x, y, width, 112, 73);
      const scratches = Math.abs(tileNoise(x, y * 1.8, width, 17, 74) - 0.5);
      const pit = hash2(x, y, 75) > 0.986 ? -72 : 0;
      const upperWear = Math.max(0, 1 - ny * 5.2) * (26 + large * 28);
      const lowerBurn = Math.max(0, (ny - 0.68) * 3.2) * (58 + rough * 36);
      const sideShade = (Math.abs(nx - 0.5) * 2) ** 1.6 * -16;
      const r = 128 + rough * 58 + large * 36 + upperWear - lowerBurn + sideShade + pit;
      const g = 78 + rough * 38 + large * 18 + upperWear * 0.86 - lowerBurn * 0.72 + sideShade * 0.8 + pit * 0.54;
      const b = 56 + rough * 24 + large * 12 + upperWear * 0.62 - lowerBurn * 0.88 + sideShade * 0.65 + pit * 0.44;
      image.data[i] = clamp(r, 58, 216);
      image.data[i + 1] = clamp(g, 34, 174);
      image.data[i + 2] = clamp(b, 26, 132);
      image.data[i + 3] = 255;
      if (scratches > 0.47 && hash2(x, y, 76) > 0.58) {
        image.data[i] = clamp(image.data[i] + 34, 0, 255);
        image.data[i + 1] = clamp(image.data[i + 1] + 24, 0, 255);
        image.data[i + 2] = clamp(image.data[i + 2] + 16, 0, 255);
      }
    }
  }
  ctx.putImageData(image, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.42;
  const bottomShade = ctx.createLinearGradient(0, height * 0.62, 0, height);
  bottomShade.addColorStop(0, 'rgba(255,255,255,0)');
  bottomShade.addColorStop(1, 'rgb(48, 34, 29)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = 'rgba(234, 206, 160, 0.8)';
  for (let i = 0; i < 26; i += 1) {
    const x = hash2(i, 0, 80) * width;
    const y = height * (0.15 + hash2(i, 1, 81) * 0.28);
    const radius = 2 + hash2(i, 2, 82) * 8;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.7, radius, hash2(i, 3, 83) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return canvas;
}

function buildBrickPath(ctx, x, y, width, height, roughness, seedX, seedY) {
  const points = 9;
  const amp = Math.max(0.6, Math.min(width, height) * 0.075 * roughness);
  ctx.beginPath();
  for (let i = 0; i <= points; i += 1) {
    const t = i / points;
    const inset = Math.sin(t * Math.PI) * (hash2(seedX + i, seedY, 4) - 0.5) * amp;
    const px = x + t * width;
    const py = y + (hash2(seedX + i, seedY, 8) - 0.5) * amp - Math.abs(inset) * 0.18;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 1; i <= points; i += 1) {
    const t = i / points;
    ctx.lineTo(
      x + width + (hash2(seedX, seedY + i, 11) - 0.5) * amp,
      y + t * height,
    );
  }
  for (let i = points; i >= 0; i -= 1) {
    const t = i / points;
    ctx.lineTo(
      x + t * width,
      y + height + (hash2(seedX + i, seedY, 17) - 0.5) * amp,
    );
  }
  for (let i = points; i >= 1; i -= 1) {
    const t = i / points;
    ctx.lineTo(
      x + (hash2(seedX, seedY + i, 23) - 0.5) * amp,
      y + t * height,
    );
  }
  ctx.closePath();
}

function drawBrick(ctx, source, brick, settings) {
  const { x, y, width, height, col, row } = brick;
  const roughness = settings.edgeRoughness / 100;
  const blend = settings.edgeBlend / 100;
  const shadowDepth = settings.shadowDepth / 100;
  const colorRandom = settings.colorRandom / 100;
  const seedX = col + 1000;
  const seedY = row + 1000;
  const jitterX = (hash2(col, row, 33) - 0.5) * settings.mortar * 0.3;
  const jitterY = (hash2(col, row, 34) - 0.5) * settings.mortar * 0.2;
  const drawX = x + jitterX;
  const drawY = y + jitterY;
  const drawWidth = width - Math.abs(jitterX) * 0.3;
  const drawHeight = height - Math.abs(jitterY) * 0.3;

  if (shadowDepth > 0) {
    const shadowRandom = 0.76 + hash2(col, row, 55) * 0.72;
    const shadowOffset = settings.mortar * (0.2 + shadowDepth * 0.62 + hash2(col, row, 56) * 0.24);
    const shadowBlur = 1.2 + shadowDepth * 5.6 + hash2(col, row, 57) * 1.4;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      drawX - settings.mortar * 0.45,
      drawY + drawHeight * 0.48,
      drawWidth + settings.mortar * 0.9,
      drawHeight * 0.62 + settings.mortar * 1.55,
    );
    ctx.clip();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = (0.2 + shadowDepth * 0.54) * shadowRandom;
    ctx.strokeStyle = 'rgb(54, 41, 34)';
    ctx.lineWidth = Math.max(1, settings.mortar * (0.5 + shadowDepth * 0.72));
    ctx.lineJoin = 'round';
    ctx.filter = `blur(${shadowBlur}px)`;
    buildBrickPath(ctx, drawX, drawY + shadowOffset, drawWidth, drawHeight, roughness, seedX, seedY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = (0.12 + shadowDepth * 0.28) * (0.75 + hash2(col, row, 54) * 0.5);
    ctx.strokeStyle = 'rgb(34, 27, 23)';
    ctx.lineWidth = Math.max(1, settings.mortar * (0.18 + shadowDepth * 0.26));
    ctx.lineJoin = 'round';
    ctx.filter = `blur(${0.4 + shadowDepth * 1.4}px)`;
    buildBrickPath(ctx, drawX, drawY + settings.mortar * 0.22, drawWidth, drawHeight, roughness, seedX, seedY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = (0.05 + shadowDepth * 0.11) * (0.75 + hash2(col, row, 58) * 0.5);
    ctx.fillStyle = 'rgb(96, 74, 58)';
    ctx.filter = `blur(${0.6 + shadowDepth * 1.4}px)`;
    const dripCount = 2 + Math.floor(hash2(col, row, 59) * 3);
    for (let i = 0; i < dripCount; i += 1) {
      const t = hash2(col + i, row, 60);
      const markWidth = settings.mortar * (0.55 + hash2(col + i, row, 61) * 1.4);
      const markHeight = settings.mortar * (0.32 + hash2(col + i, row, 62) * 1.3);
      ctx.fillRect(
        drawX + drawWidth * t - markWidth * 0.5,
        drawY + drawHeight + settings.mortar * (0.08 + hash2(col + i, row, 63) * 0.38),
        markWidth,
        markHeight,
      );
    }
    ctx.restore();
  }

  ctx.save();
  buildBrickPath(ctx, drawX, drawY, drawWidth, drawHeight, roughness, seedX, seedY);
  ctx.clip();

  const srcPadX = source.width * 0.035;
  const srcPadY = source.height * 0.06;
  const variantZoom = 0.88 + hash2(col, row, 41) * 0.18;
  const srcW = Math.max(8, source.width * variantZoom - srcPadX * 2);
  const srcH = Math.max(8, source.height * variantZoom - srcPadY * 2);
  const srcX = clamp(hash2(col, row, 42) * (source.width - srcW), 0, source.width - srcW);
  const srcY = clamp(hash2(col, row, 43) * (source.height - srcH), 0, source.height - srcH);
  ctx.drawImage(source, srcX, srcY, srcW, srcH, drawX, drawY, drawWidth, drawHeight);

  const warm = (hash2(col, row, 50) - 0.5) * 34 * colorRandom;
  const bright = (hash2(col, row, 51) - 0.5) * 46 * colorRandom;
  ctx.globalCompositeOperation = bright >= 0 ? 'screen' : 'multiply';
  ctx.globalAlpha = Math.min(0.28, Math.abs(bright) / 150);
  ctx.fillStyle = bright >= 0 ? `rgb(${180 + warm}, ${118 + warm * 0.25}, ${80})` : 'rgb(95, 60, 42)';
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);

  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.12 + blend * 0.12;
  const shade = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawHeight);
  shade.addColorStop(0, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(74,52,42,0.72)');
  ctx.fillStyle = shade;
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);

  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22 + blend * 0.32;
  ctx.strokeStyle = '#8a806f';
  ctx.lineWidth = settings.mortar * (0.35 + blend * 0.42);
  ctx.lineJoin = 'round';
  ctx.filter = `blur(${1.2 + blend * 2.8}px)`;
  buildBrickPath(ctx, drawX, drawY, drawWidth, drawHeight, roughness, seedX, seedY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.18 + roughness * 0.14;
  ctx.strokeStyle = 'rgba(62, 48, 39, 0.72)';
  ctx.lineWidth = Math.max(1, settings.mortar * 0.12);
  buildBrickPath(ctx, drawX, drawY, drawWidth, drawHeight, roughness, seedX, seedY);
  ctx.stroke();
  ctx.restore();
}

function makeLayout(settings) {
  const size = settings.outputSize;
  let rows = Math.max(2, Math.round(size / (settings.brickHeight + settings.mortar)));
  if (settings.rowOffset === 0.5 && rows % 2 === 1) rows += 1;
  const cols = Math.max(2, Math.round(size / (settings.brickWidth + settings.mortar)));
  const pitchX = size / cols;
  const pitchY = size / rows;
  return {
    rows,
    cols,
    pitchX,
    pitchY,
    brickWidth: Math.max(12, pitchX - settings.mortar),
    brickHeight: Math.max(10, pitchY - settings.mortar),
  };
}

function pickBrickSource(sources, col, row) {
  if (!sources.length) return createProceduralBrickSource();
  const sourceIndex = Math.floor(hash2(col, row, 101) * sources.length) % sources.length;
  return sources[sourceIndex];
}

function renderTexture(canvas, sources, settings) {
  canvas.width = settings.outputSize;
  canvas.height = settings.outputSize;
  const ctx = canvas.getContext('2d');
  const layout = makeLayout(settings);
  drawTileableMortar(ctx, settings.outputSize, settings);

  for (let row = -2; row < layout.rows + 2; row += 1) {
    const offset = settings.rowOffset === 0.5 && Math.abs(row % 2) === 1 ? layout.pitchX / 2 : 0;
    for (let col = -3; col < layout.cols + 3; col += 1) {
      const normalizedCol = ((col % layout.cols) + layout.cols) % layout.cols;
      const normalizedRow = ((row % layout.rows) + layout.rows) % layout.rows;
      const source = pickBrickSource(sources, normalizedCol, normalizedRow);
      drawBrick(ctx, source, {
        x: col * layout.pitchX + settings.mortar / 2 + offset,
        y: row * layout.pitchY + settings.mortar / 2,
        width: layout.brickWidth,
        height: layout.brickHeight,
        col: normalizedCol,
        row: normalizedRow,
      }, settings);
    }
  }

  return layout;
}

function readSettings(elements) {
  return {
    outputSize: Number(elements.outputSize.value),
    brickWidth: Number(elements.brickWidth.value),
    brickHeight: Number(elements.brickHeight.value),
    mortar: Number(elements.mortar.value),
    mortarColor: elements.mortarColor.value,
    mortarGrain: Number(elements.mortarGrain.value),
    mortarDirt: Number(elements.mortarDirt.value),
    rowOffset: Number(elements.rowOffset.value),
    edgeRoughness: Number(elements.edgeRoughness.value),
    edgeBlend: Number(elements.edgeBlend.value),
    shadowDepth: Number(elements.shadowDepth.value),
    colorRandom: Number(elements.colorRandom.value),
  };
}

function updateLabels(elements) {
  elements.brickWidth.closest('label').firstChild.textContent = `Šířka cihly ${elements.brickWidth.value}px `;
  elements.brickHeight.closest('label').firstChild.textContent = `Výška cihly ${elements.brickHeight.value}px `;
  elements.mortar.closest('label').firstChild.textContent = `Tloušťka spáry ${elements.mortar.value}px `;
  elements.mortarGrain.closest('label').firstChild.textContent = `Zrnitost spáry ${elements.mortarGrain.value}% `;
  elements.mortarDirt.closest('label').firstChild.textContent = `Špinavost spáry ${elements.mortarDirt.value}% `;
  elements.edgeRoughness.closest('label').firstChild.textContent = `Nepravidelné hrany ${elements.edgeRoughness.value}% `;
  elements.edgeBlend.closest('label').firstChild.textContent = `Prolnutí do spáry ${elements.edgeBlend.value}% `;
  elements.shadowDepth.closest('label').firstChild.textContent = `Stín pod cihlou ${elements.shadowDepth.value}% `;
  elements.colorRandom.closest('label').firstChild.textContent = `Random barva/jas ${elements.colorRandom.value}% `;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Obrázek se nepodařilo načíst.'));
    };
    image.src = url;
  });
}

function getImageFromClipboardEvent(event) {
  const items = [...(event.clipboardData?.items ?? [])];
  const item = items.find((clipboardItem) => clipboardItem.type.startsWith('image/'));
  return item?.getAsFile() ?? null;
}

const galleryWallTextureStorageKey = 'virtual-gallery-wall-texture-v1';

function makeGalleryTexturePayload(canvas) {
  const maxSize = 1024;
  const size = Math.min(maxSize, canvas.width, canvas.height);
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = size;
  exportCanvas.height = size;
  const exportCtx = exportCanvas.getContext('2d');
  exportCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);
  const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.82);
  return {
    version: 1,
    kind: 'brick-wall',
    width: size,
    height: size,
    mime: 'image/jpeg',
    dataUrl,
    createdAt: new Date().toISOString(),
  };
}

export function initBrickTextureTool() {
  const tool = document.querySelector('#brick-texture-tool');
  if (!tool) return;
  const elements = {
    sourceFile: document.querySelector('#brick-source-file'),
    loadSource: document.querySelector('#brick-load-source'),
    roughPreset: document.querySelector('#brick-rough-preset'),
    generate: document.querySelector('#brick-generate'),
    download: document.querySelector('#brick-download'),
    applyGallery: document.querySelector('#brick-apply-gallery'),
    outputSize: document.querySelector('#brick-output-size'),
    brickWidth: document.querySelector('#brick-width'),
    brickHeight: document.querySelector('#brick-height'),
    mortar: document.querySelector('#brick-mortar'),
    mortarColor: document.querySelector('#brick-mortar-color'),
    mortarGrain: document.querySelector('#brick-mortar-grain'),
    mortarDirt: document.querySelector('#brick-mortar-dirt'),
    rowOffset: document.querySelector('#brick-row-offset'),
    edgeRoughness: document.querySelector('#brick-edge-roughness'),
    edgeBlend: document.querySelector('#brick-edge-blend'),
    shadowDepth: document.querySelector('#brick-shadow-depth'),
    colorRandom: document.querySelector('#brick-color-random'),
    status: document.querySelector('#brick-texture-status'),
    preview: document.querySelector('#brick-texture-preview'),
  };
  let sources = [createProceduralBrickSource()];
  tool.hidden = false;
  document.body.classList.add('brick-texture-mode');

  const generate = () => {
    updateLabels(elements);
    const settings = readSettings(elements);
    const layout = renderTexture(elements.preview, sources, settings);
    elements.status.textContent = `Hotovo: ${layout.cols} sloupců x ${layout.rows} řad, zdrojových obrázků: ${sources.length}, cihla upravená na ${Math.round(layout.brickWidth)} x ${Math.round(layout.brickHeight)} px kvůli bezešvému opakování.`;
  };

  elements.loadSource.addEventListener('click', () => elements.sourceFile.click());
  elements.roughPreset.addEventListener('click', () => {
    sources = [createRoughBrickSource()];
    elements.brickWidth.value = '176';
    elements.brickHeight.value = '52';
    elements.mortar.value = '8';
    elements.mortarColor.value = '#4a3e34';
    elements.mortarGrain.value = '82';
    elements.mortarDirt.value = '72';
    elements.edgeRoughness.value = '72';
    elements.edgeBlend.value = '66';
    elements.shadowDepth.value = '58';
    elements.colorRandom.value = '36';
    elements.status.textContent = 'Používám hrubou testovací cihlu podle ukázky.';
    generate();
  });
  elements.sourceFile.addEventListener('change', async () => {
    const files = [...(elements.sourceFile.files ?? [])];
    if (!files.length) return;
    elements.status.textContent = files.length === 1 ? 'Načítám cihlu...' : `Načítám ${files.length} cihel...`;
    try {
      sources = await Promise.all(files.map(loadImageFromFile));
      elements.status.textContent = files.length === 1 ? `Načteno: ${files[0].name}` : `Načteno ${files.length} zdrojových cihel.`;
      generate();
    } catch (error) {
      elements.status.textContent = error.message;
    }
  });

  elements.generate.addEventListener('click', generate);
  window.addEventListener('paste', async (event) => {
    const file = getImageFromClipboardEvent(event);
    if (!file) return;
    elements.status.textContent = 'Vkládám obrázek ze schránky...';
    try {
      sources = [await loadImageFromFile(file)];
      elements.status.textContent = 'Vloženo ze schránky jako zdrojová cihla.';
      generate();
    } catch (error) {
      elements.status.textContent = error.message;
    }
  });
  elements.download.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `textura-zdiva-${elements.preview.width}.png`;
    link.href = elements.preview.toDataURL('image/png');
    document.body.append(link);
    link.click();
    link.remove();
  });
  elements.applyGallery.addEventListener('click', () => {
    try {
      const payload = makeGalleryTexturePayload(elements.preview);
      localStorage.setItem(galleryWallTextureStorageKey, JSON.stringify(payload));
      const kilobytes = Math.round(payload.dataUrl.length * 0.75 / 1024);
      elements.status.textContent = `Textura uložena pro galerii jako ${payload.width} x ${payload.height} JPG, přibližně ${kilobytes} kB. Otevírám editor...`;
      window.location.href = `${window.location.origin}${window.location.pathname}?edit=1&wallTexture=1`;
    } catch (error) {
      elements.status.textContent = `Texturu se nepodařilo uložit pro galerii: ${error.message}`;
    }
  });

  [
    elements.outputSize,
    elements.brickWidth,
    elements.brickHeight,
    elements.mortar,
    elements.mortarColor,
    elements.mortarGrain,
    elements.mortarDirt,
    elements.rowOffset,
    elements.edgeRoughness,
    elements.edgeBlend,
    elements.shadowDepth,
    elements.colorRandom,
  ].forEach((element) => element.addEventListener('input', generate));

  generate();
}
