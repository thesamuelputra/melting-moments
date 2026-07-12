// Regenerates the 1200x630 OpenGraph crops in public/og/ from the source
// photography in public/. Run whenever a source photo changes:
//
//   node scripts/generate-og.mjs
//
// Plain node — no package.json script needed; `sharp` is already a project
// dependency. `position: 'attention'` centers the crop on the most visually
// salient region (matters for the portrait/square sources).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'og');

// [source (relative to public/), output (relative to public/og/)]
const JOBS = [
  ['hero-main.webp', 'og-default.jpg'],
  ['catering_menu_hero.webp', 'og-corporate.jpg'],
  ['catering_menu_hero.webp', 'og-menus.jpg'],
  ['wedding_entree.webp', 'og-weddings.jpg'],
  ['private_dinner.webp', 'og-private-events.jpg'],
  ['copper_pots.webp', 'og-about.jpg'],
  ['macro_roulade.webp', 'og-family-style.jpg'],
  ['chef_plating_sauce.webp', 'og-chef.jpg'],
  // No og-guidos.jpg yet: public/guidos/ has no real hero photo (only
  // placeholder.svg). Add ['guidos/guidos-hero.webp', 'og-guidos.jpg']
  // here once real Guido's photography lands.
];

await mkdir(OUT_DIR, { recursive: true });

for (const [src, out] of JOBS) {
  const srcPath = path.join(PUBLIC_DIR, src);
  const outPath = path.join(OUT_DIR, out);
  const info = await sharp(srcPath)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outPath);
  console.log(`${src} -> og/${out} (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB)`);
}
