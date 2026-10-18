/* Iconițele aplicației din semnul ZECE (src/ui/brand.ts): icon.svg + PNG-urile pentru manifest și iOS.
   Rulează după o schimbare de logo: node scripts/build-icons.mjs */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { iconSvg } from '../src/ui/brand.ts';

const out = new URL('../public/', import.meta.url);
writeFileSync(new URL('icon.svg', out), iconSvg(512));
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(Buffer.from(iconSvg(size))).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL(file, out)));
  console.log(file, size);
}
