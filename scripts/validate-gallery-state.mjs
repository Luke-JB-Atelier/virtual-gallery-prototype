import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!inputPath || !fs.existsSync(inputPath)) throw new Error('Chybi soubor stavu galerie.');
const state = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (state?.version !== 1) throw new Error('Stav galerie nema version: 1.');
if (!Array.isArray(state.gallery?.paintings)) throw new Error('Chybi gallery.paintings.');
if (!Array.isArray(state.gallery?.pedestals)) throw new Error('Chybi gallery.pedestals.');
if (!Array.isArray(state.gallery?.textPanels)) throw new Error('Chybi gallery.textPanels.');
if (!state.gallery?.wallTexture?.dataUrl?.startsWith('data:image/')) throw new Error('Chybi platna textura sten.');
if (!Array.isArray(state.lighting?.ceilingLights)) throw new Error('Chybi lighting.ceilingLights.');
if (state.buildLayout?.version !== 1 || !Array.isArray(state.buildLayout.rooms) || !Array.isArray(state.buildLayout.openings)) {
  throw new Error('Chybi kompletni buildLayout.');
}
console.log(`Validni stav: ${state.gallery.paintings.length} obrazu, ${state.gallery.pedestals.length} stojanu, ${state.gallery.textPanels.length} tabulek, ${state.buildLayout.rooms.length} mistnosti.`);
