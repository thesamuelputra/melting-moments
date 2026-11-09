// Regenerates the 1200x630 OpenGraph crops in public/og/ from the source
// photography in public/. Run whenever a source photo changes:
//
//   node scripts/generate-og.mjs
//
// Plain node; no package.json script needed, and `sharp` is already a project
// dependency. `position: 'attention'` centers the crop on the most visually
// salient region (matters for the portrait/square sources).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'og');

// [source (relative to public/), output (relative to public/og/), crop position]
// The position is sharp's: 'attention' finds the busiest part of the photo,
// a compass point picks that edge instead.
const JOBS = [
  ['hero-main.webp', 'og-default.jpg'],
  ['catering_menu_hero.webp', 'og-menus.jpg'],
  ['wedding_entree.webp', 'og-weddings.jpg'],
  ['private_dinner.webp', 'og-events.jpg'],
  ['copper_pots.webp', 'og-about.jpg'],
  ['chef_plating_sauce.webp', 'og-chef.jpg'],
  // The Guido's page opens on the same kitchen photograph until product
  // photography arrives, cropped to the plate at the bottom rather than the
  // pots above it. Point this at the Guido's photo once there is one.
  ['chef_plating_sauce.webp', 'og-guidos.jpg', 'south'],
];

await mkdir(OUT_DIR, { recursive: true });

for (const [src, out, position = 'attention'] of JOBS) {
  const srcPath = path.join(PUBLIC_DIR, src);
  const outPath = path.join(OUT_DIR, out);
  const info = await sharp(srcPath)
    .resize(1200, 630, { fit: 'cover', position })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outPath);
  console.log(`${src} -> og/${out} (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB)`);
}
