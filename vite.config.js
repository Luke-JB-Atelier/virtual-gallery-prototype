import { defineConfig } from 'vite';

const responsiveEditorCss = `
/* TipCore / narrow canvas: keep every editor window inside the visible canvas. */
@media (max-width: 760px), (max-height: 620px) {
  #gallery-panel,
  #light-panel,
  #art-panel,
  #pedestal-panel,
  #build-panel,
  #text-panel-panel,
  #texture-panel,
  #audio-panel {
    left: 8px !important;
    right: 8px !important;
    top: 58px !important;
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: calc(100dvh - 66px - env(safe-area-inset-bottom)) !important;
    padding-bottom: 18px;
  }

  #gallery-title,
  #light-title,
  #art-title,
  #pedestal-title,
  #build-title,
  #text-panel-title,
  #texture-title,
  #audio-title {
    top: -8px;
  }

  .editor-panel-controls {
    position: sticky;
    float: right;
    top: 0;
    right: 0;
    margin: -38px 2px 6px auto;
    width: max-content;
    background: rgba(12, 28, 31, 0.97);
    border-radius: 6px;
  }
}

@media (max-width: 420px) {
  #gallery-editor,
  #light-editor,
  #art-editor,
  #pedestal-editor,
  #build-editor,
  #text-panel-editor,
  #texture-editor,
  #audio-editor {
    max-width: calc(100vw - 16px);
  }
}
`;

function replaceOnce(source, before, after) {
  return source.includes(before) ? source.replace(before, after) : source;
}

function patchGallerySource(code) {
  let next = code;

  next = replaceOnce(
    next,
    "if (keys.has('KeyA') || keys.has('KeyQ')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD') || keys.has('KeyE')) bodyYaw -= turnSpeed * delta;",
    "if (keys.has('KeyA')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD')) bodyYaw -= turnSpeed * delta;",
  );

  next = replaceOnce(
    next,
    "if (keys.has('KeyW')) movement.add(forward);\n  if (keys.has('KeyS')) movement.sub(forward);",
    "if (keys.has('KeyW')) movement.add(forward);\n  if (keys.has('KeyS')) movement.sub(forward);\n  if (keys.has('KeyQ')) movement.sub(right);\n  if (keys.has('KeyE')) movement.add(right);",
  );

  const dimTextPanels = `displayTextPanels.forEach((textPanelData) => {
    if (!textPanelData.panel?.material?.color) return;
    const targetBrightness = getMainRoomLightBrightness(textPanelData.group.position);
    const currentBrightness = textPanelData.panel.userData.displayBrightness ?? targetBrightness;
    const nextBrightness = THREE.MathUtils.lerp(currentBrightness, targetBrightness, 1 - Math.pow(0.0003, delta));
    textPanelData.panel.userData.displayBrightness = nextBrightness;
    textPanelData.panel.material.color.setScalar(nextBrightness);
  });`;

  const keepTextPanelsReadable = `displayTextPanels.forEach((textPanelData) => {
    if (!textPanelData.panel?.material?.color) return;
    // Informational boards are canvas UI, not paintings. Keep them readable
    // even before room lighting settles in a fresh/public Chromium session.
    textPanelData.panel.userData.displayBrightness = 1;
    textPanelData.panel.material.color.setScalar(1);
  });`;

  next = replaceOnce(next, dimTextPanels, keepTextPanelsReadable);

  // GitHub Pages is served below /virtual-gallery-prototype/. Absolute
  // /textures/... paths therefore 404 even though the texture files exist.
  // Route every support-prop texture through Vite's BASE_URL helper.
  next = replaceOnce(
    next,
    "const loadSupportPropTexture = (path, repeat = 1) => {\n  const texture = new THREE.TextureLoader().load(path);",
    "const loadSupportPropTexture = (path, repeat = 1) => {\n  const texture = new THREE.TextureLoader().load(publicAssetPath(path));",
  );
  next = replaceOnce(
    next,
    "new THREE.TextureLoader().load('/textures/support/money/50_Kc.png')",
    "new THREE.TextureLoader().load(publicAssetPath('textures/support/money/50_Kc.png'))",
  );
  next = replaceOnce(
    next,
    'new THREE.TextureLoader().load(`/textures/support/money/${value}_Kc.png`)',
    'new THREE.TextureLoader().load(publicAssetPath(`textures/support/money/${value}_Kc.png`))',
  );

  // Public viewer must keep mouse-look usable even when Pointer Lock is denied
  // by an embed/browser policy. Pointer Lock remains preferred; passive look is
  // the fallback only outside the editor.
  next = replaceOnce(
    next,
    `  canvas.focus();
  lookEnabled = true;
  passiveMouseLook = false;
  passiveLookInitialized = false;
  draggingLook = true;
  fallbackTurning = true;
  fallbackOriginX = event.clientX;
  fallbackOriginY = event.clientY;`,
    `  canvas.focus();
  lookEnabled = true;
  passiveMouseLook = !editorMode;
  passiveLookInitialized = false;
  draggingLook = editorMode;
  fallbackTurning = editorMode;
  fallbackOriginX = event.clientX;
  fallbackOriginY = event.clientY;`,
  );
  next = replaceOnce(
    next,
    `  if (pointerLocked) {
    lookEnabled = true;
    fallbackTurning = false;
    fallbackTurnVelocity = 0;
    fallbackPitchVelocity = 0;`,
    `  if (pointerLocked) {
    lookEnabled = true;
    passiveMouseLook = false;
    passiveLookInitialized = false;
    draggingLook = false;
    fallbackTurning = false;
    fallbackTurnVelocity = 0;
    fallbackPitchVelocity = 0;`,
  );

  // Keep the current donor-board fallback until the first authoritative Stripe
  // snapshot is written. This prevents an empty board while repository secrets
  // are being configured.
  next = replaceOnce(
    next,
    'savedTextPanels.filter(isValidTextPanelConfig).forEach((config) => {\n    createTextPanel({',
    `savedTextPanels.filter(isValidTextPanelConfig).forEach((config) => {
    if (!editorMode && getTextPanelKind(config.kind) === 'donors' && !String(config.text ?? '').trim()) {
      config.text = 'Ondřej Korba | 500 Kč';
    }
    createTextPanel({`,
  );

  // Use the exact TipCore logo on the donor board. The image is intentionally
  // separate from layout/state so syncing the PC editor cannot move the board.
  if (!next.includes('const tipCoreDonorLogoImage = new Image();')) {
    next = replaceOnce(
      next,
      'function drawDonorBoardPanel(ctx, labelCanvas, textPanelData) {',
      `const tipCoreDonorLogoImage = new Image();
tipCoreDonorLogoImage.src = publicAssetPath('art/banners/tipcore-logo-original.png');

function drawDonorBoardPanel(ctx, labelCanvas, textPanelData) {`,
    );
  }

  const donorHeaderMarker = `  ctx.fillStyle = '#4ce0d2';
  ctx.fillRect(labelCanvas.width * 0.3, 0, labelCanvas.width * 0.16, 10);

  const titleSize = Math.min(92, Math.max(48, labelCanvas.height * 0.09));`;
  const donorHeaderWithLogo = `  ctx.fillStyle = '#4ce0d2';
  ctx.fillRect(labelCanvas.width * 0.3, 0, labelCanvas.width * 0.16, 10);

  if (tipCoreDonorLogoImage.complete && tipCoreDonorLogoImage.naturalWidth > 0) {
    const logoSize = Math.min(labelCanvas.width, labelCanvas.height) * 0.145;
    const logoX = innerX + logoSize * 0.52;
    const logoY = innerY + logoSize * 0.48;
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoSize * 0.47, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(tipCoreDonorLogoImage, logoX - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
    ctx.restore();
  }

  const titleSize = Math.min(92, Math.max(48, labelCanvas.height * 0.09));`;
  next = replaceOnce(next, donorHeaderMarker, donorHeaderWithLogo);

  // Public donors are deliberately a tiny sanitized JSON file. Stripe secrets
  // stay in GitHub Actions; the browser sees only display name + total amount.
  if (!next.includes('async function refreshPublicDonorBoard()')) {
    const publicDonorRuntime = `

function formatPublicDonorAmount(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  const formatted = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(amount);
  return formatted + ' ' + String(currency || 'CZK').toUpperCase();
}

function getPublicDonorBoard() {
  return displayTextPanels.find((item) => getTextPanelKind(item.kind) === 'donors') || null;
}

function redrawPublicDonorBoard() {
  const donorBoard = getPublicDonorBoard();
  if (donorBoard) redrawTextPanel(donorBoard);
}

async function refreshPublicDonorBoard() {
  if (editorMode) return;
  try {
    const url = publicAssetPath('data/gallery-donors.json') + '?tipcore_donors=' + Date.now();
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload || !payload.generatedAt || !Array.isArray(payload.donors)) return;
    const donorBoard = getPublicDonorBoard();
    if (!donorBoard) return;
    donorBoard.text = payload.donors
      .map((donor) => {
        const name = String(donor?.name || '').trim();
        const amount = formatPublicDonorAmount(donor?.amount, donor?.currency || payload.currency || 'CZK');
        return name && amount ? name + ' | ' + amount : '';
      })
      .filter(Boolean)
      .join('\\n');
    redrawTextPanel(donorBoard);
  } catch {
    // Keep the last embedded/public state when GitHub Pages is temporarily stale.
  }
}

if (!editorMode) {
  if (tipCoreDonorLogoImage.complete) redrawPublicDonorBoard();
  else tipCoreDonorLogoImage.addEventListener('load', redrawPublicDonorBoard, { once: true });
  refreshPublicDonorBoard();
  window.setInterval(refreshPublicDonorBoard, 60_000);
}
`;
    next = replaceOnce(next, 'addSavedTextPanels();', 'addSavedTextPanels();' + publicDonorRuntime);
  }

  return next;
}

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'tipcore-gallery-runtime-fixes',
      enforce: 'pre',
      transform(code, id) {
        const normalizedId = id.replace(/\\/g, '/').split('?')[0];
        if (normalizedId.endsWith('/src/main.js')) {
          return { code: patchGallerySource(code), map: null };
        }
        if (normalizedId.endsWith('/src/styles.css')) {
          return { code: `${code}\n${responsiveEditorCss}`, map: null };
        }
        return null;
      },
      transformIndexHtml(html) {
        return html.replace(
          'W/S chůze · C skrčení · mezerník skok · Shift rychleji · A/D otočení',
          'W/S chůze · Q/E krok do stran · C skrčení · mezerník skok · Shift rychleji · A/D otočení',
        );
      },
    },
  ],
});
