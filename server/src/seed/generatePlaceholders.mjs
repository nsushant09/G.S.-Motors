// One-off generator for placeholder car photos. Run with:
//   node server/src/seed/generatePlaceholders.mjs
// Reads cars.seed.json, writes a tasteful 16:10 SVG per image path so the
// layout is correct before real photos are dropped in (same filenames).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cars = JSON.parse(readFileSync(path.join(__dirname, 'cars.seed.json'), 'utf-8'));
const outDir = path.join(__dirname, '..', '..', '..', 'client', 'public', 'cars');
mkdirSync(outDir, { recursive: true });

const FOREST = '#12301F';
const FOREST_DEEP = '#0A1B12';
const MOSS = '#2E5E42';
const CREAM = '#FDF8E3';
const BONE = '#F6F4EE';

const W = 800;
const H = 500;

function carSilhouette(stroke) {
  return `
    <g transform="translate(${W / 2 - 170}, ${H / 2 - 30})" fill="none" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path d="M10 70 L40 70 L70 30 L190 30 L245 70 L330 70 L330 95 L10 95 Z" />
      <circle cx="70" cy="95" r="20" />
      <circle cx="270" cy="95" r="20" />
      <line x1="95" y1="30" x2="80" y2="70" />
      <line x1="165" y1="30" x2="165" y2="70" />
    </g>
  `;
}

function makeSvg({ make, model, variant, year, index }) {
  const title = `${make} ${model}`.toUpperCase();
  const sub = [variant, year].filter(Boolean).join(' · ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${FOREST}" />
  <rect x="0" y="${H - 90}" width="${W}" height="90" fill="${FOREST_DEEP}" />
  <line x1="0" y1="${H - 45}" x2="${W}" y2="${H - 45}" stroke="${CREAM}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="18 14" />
  ${carSilhouette(CREAM)}
  <text x="48" y="64" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="14" letter-spacing="3" fill="${MOSS}" opacity="0.9">GS MOTORS &#183; PHOTO ${index}</text>
  <text x="48" y="${H - 140}" font-family="'Bricolage Grotesque', 'Arial Black', sans-serif" font-size="40" font-weight="700" letter-spacing="-1" fill="${CREAM}">${title}</text>
  <text x="48" y="${H - 108}" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="16" letter-spacing="1" fill="${BONE}" opacity="0.7">${sub}</text>
</svg>`;
}

let count = 0;
for (const car of cars) {
  car.images.forEach((imgPath, i) => {
    const filename = path.basename(imgPath);
    const svg = makeSvg({ make: car.make, model: car.model, variant: car.variant, year: car.year, index: i + 1 });
    writeFileSync(path.join(outDir, filename), svg, 'utf-8');
    count += 1;
  });
}

console.log(`Generated ${count} placeholder SVGs in ${outDir}`);
