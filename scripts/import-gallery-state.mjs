import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const projectRoot = path.resolve(import.meta.dirname, '..');
const outputPath = path.join(projectRoot, 'src', 'public-gallery-state.json');

function findLatestExport() {
  const candidates = [
    path.join(os.homedir(), 'Downloads'),
    'E:\\Stazene',
    'E:\\Stažené',
    'E:\\Downloads',
  ];
  const files = [];

  candidates.forEach((directory) => {
    if (!fs.existsSync(directory)) return;
    fs.readdirSync(directory)
      .filter((name) => /^virtual-gallery-state.*\.json$/i.test(name))
      .forEach((name) => {
        const fullPath = path.join(directory, name);
        const stat = fs.statSync(fullPath);
        files.push({ fullPath, mtimeMs: stat.mtimeMs });
      });
  });

  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files[0]?.fullPath ?? null;
}

function validateExport(data) {
  if (data?.version !== 1) {
    throw new Error('Export musi mit version: 1.');
  }
  if (!Array.isArray(data.gallery?.paintings) || data.gallery.paintings.length === 0) {
    throw new Error('Export neobsahuje zadne obrazy v gallery.paintings.');
  }
  if (!Array.isArray(data.lighting?.ceilingLights)) {
    throw new Error('Export neobsahuje svetla v lighting.ceilingLights.');
  }
}

const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : findLatestExport();

if (!inputPath) {
  console.error('Nenasel jsem export. Zadej cestu: npm run import-gallery -- "E:\\Stazene\\virtual-gallery-state.json"');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);
validateExport(data);

fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(`Importovano: ${inputPath}`);
console.log(`Verejny stav: ${outputPath}`);
console.log(`Obrazy: ${data.gallery.paintings.length}`);
console.log(`Svetla: ${data.lighting.ceilingLights.length}`);
