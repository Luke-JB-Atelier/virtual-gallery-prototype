from pathlib import Path


def read_text_preserve_bom(path):
    p = Path(path)
    raw = p.read_bytes()
    bom = raw.startswith(b'\xef\xbb\xbf')
    text = raw.decode('utf-8-sig')
    return p, text, bom


def write_text_preserve_bom(p, text, bom):
    data = text.encode('utf-8')
    if bom:
        data = b'\xef\xbb\xbf' + data
    p.write_bytes(data)


def replace_once(path, old, new):
    p, text, bom = read_text_preserve_bom(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, found {count}')
    text = text.replace(old, new, 1)
    write_text_preserve_bom(p, text, bom)


replace_once(
    'src/main.js',
    "  if (keys.has('KeyA') || keys.has('KeyQ')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD') || keys.has('KeyE')) bodyYaw -= turnSpeed * delta;",
    "  if (keys.has('KeyA')) bodyYaw += turnSpeed * delta;\n  if (keys.has('KeyD')) bodyYaw -= turnSpeed * delta;",
)

replace_once(
    'src/main.js',
    "  if (keys.has('KeyW')) movement.add(forward);\n  if (keys.has('KeyS')) movement.sub(forward);\n  if (isTouchDevice) {",
    "  if (keys.has('KeyW')) movement.add(forward);\n  if (keys.has('KeyS')) movement.sub(forward);\n  if (keys.has('KeyQ')) movement.sub(right);\n  if (keys.has('KeyE')) movement.add(right);\n  if (isTouchDevice) {",
)

replace_once(
    'src/main.js',
    "  displayTextPanels.forEach((textPanelData) => {\n    if (!textPanelData.panel?.material?.color) return;\n    const targetBrightness = getMainRoomLightBrightness(textPanelData.group.position);\n    const currentBrightness = textPanelData.panel.userData.displayBrightness ?? targetBrightness;\n    const nextBrightness = THREE.MathUtils.lerp(currentBrightness, targetBrightness, 1 - Math.pow(0.0003, delta));\n    textPanelData.panel.userData.displayBrightness = nextBrightness;\n    textPanelData.panel.material.color.setScalar(nextBrightness);\n  });",
    "  displayTextPanels.forEach((textPanelData) => {\n    if (!textPanelData.panel?.material?.color) return;\n    // Textové informační tabule používají vlastní CanvasTexture + MeshBasicMaterial.\n    // Nesmí se ještě jednou ztmavovat podle světla místnosti, jinak mohou v Chromium zčernat.\n    textPanelData.panel.userData.displayBrightness = 1;\n    textPanelData.panel.material.color.setScalar(1);\n  });",
)

replace_once(
    'index.html',
    'Klikni do scény: myš otáčí tělo · W/S chůze · C skrčení · mezerník skok · Shift rychleji · A/D otočení · Esc vypnout pohled · pravý klik otevře odkaz',
    'Klikni do scény: myš otáčí tělo · W/S chůze · Q/E úkrok do stran · C skrčení · mezerník skok · Shift rychleji · A/D otočení · Esc vypnout pohled · pravý klik otevře odkaz',
)

css_path, css, css_bom = read_text_preserve_bom('src/styles.css')
marker = '/* TIPCORE_EMBEDDED_VIEWPORT_FIX_20260816 */'
if marker not in css:
    css += '''

/* TIPCORE_EMBEDDED_VIEWPORT_FIX_20260816 */
/* Dialogy a editory musí zůstat ovladatelné i v úzkém vloženém plátně TipCore. */
#action-dialog {
  box-sizing: border-box;
  overflow: auto;
  padding: clamp(8px, 2.5vw, 20px);
}

#action-dialog-box {
  box-sizing: border-box;
  width: min(520px, 100%);
  max-width: 100%;
  max-height: calc(100vh - 24px);
  max-height: calc(100dvh - 24px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

#action-dialog-buttons {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding-top: 8px;
  background: #111821;
}

#toggle-gallery-editor,
#toggle-light-editor,
#toggle-art-editor,
#toggle-pedestal-editor,
#toggle-build-editor,
#toggle-text-panel-editor,
#toggle-texture-editor,
#toggle-audio-editor {
  position: relative;
  z-index: 32;
}

#gallery-panel,
#light-panel,
#art-panel,
#pedestal-panel,
#build-panel,
#text-panel-panel,
#texture-panel,
#audio-panel {
  box-sizing: border-box;
  min-width: 0;
  height: auto;
  bottom: 14px;
  max-height: none;
  overscroll-behavior: contain;
}

/* Pravé editory nechávají volný pruh pro svá tlačítka, takže je lze vždy zavřít. */
#text-panel-panel,
#texture-panel,
#audio-panel {
  left: auto;
  right: 152px;
  width: min(300px, calc(100vw - 176px));
  min-width: 0;
  max-width: calc(100vw - 176px);
}

@media (max-width: 520px) {
  #gallery-panel,
  #light-panel,
  #art-panel,
  #pedestal-panel,
  #build-panel {
    left: 146px;
    width: calc(100vw - 160px);
    max-width: calc(100vw - 160px);
  }

  #text-panel-panel,
  #texture-panel,
  #audio-panel {
    right: 146px;
    width: calc(100vw - 160px);
    max-width: calc(100vw - 160px);
  }
}
'''
    write_text_preserve_bom(css_path, css, css_bom)

print('Gallery hotfix applied.')
