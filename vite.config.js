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

function patchGallerySource(code) {
  let next = code;

  next = next.replace(
    "if (keys.has('KeyA') || keys.has('KeyQ')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD') || keys.has('KeyE')) bodyYaw -= turnSpeed * delta;",
    "if (keys.has('KeyA')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD')) bodyYaw -= turnSpeed * delta;",
  );

  next = next.replace(
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
    // Informational boards are canvas UI, not paintings. Multiplying their
    // MeshBasicMaterial by room brightness can turn them almost black on a
    // fresh/public Chromium session before room lighting settles.
    textPanelData.panel.userData.displayBrightness = 1;
    textPanelData.panel.material.color.setScalar(1);
  });`;

  next = next.replace(dimTextPanels, keepTextPanelsReadable);
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
