/**
 * Script de migrare vox.json → chunks .opus individuale
 * Rulează: npx tsx scripts/split-vox.ts
 *
 * Input: vox.json (509 chei → base64 audio)
 * Output: public/vox/{key-slug}.opus + public/vox/manifest.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VOX_PATH = join(ROOT, 'vox.json');
const OUTPUT_DIR = join(ROOT, 'public', 'vox');
const MANIFEST_PATH = join(OUTPUT_DIR, 'manifest.json');

interface VoxManifest {
 version: string;
 generatedAt: string;
 totalChunks: number;
 chunks: Record<string, {
   file: string;
   sizeBytes: number;
   originalKey: string;
 }>;
}

function slugify(key: string): string {
 return key
   .toLowerCase()
   .normalize('NFD')
   .replace(/[̀-ͯ]/g, '') // remove diacritics
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '')
   .slice(0, 80); // max filename length
}

async function main() {
 console.log('[split-vox] Citire vox.json...');

 if (!existsSync(VOX_PATH)) {
   console.error(`[split-vox] EROARE: ${VOX_PATH} nu există`);
   process.exit(1);
 }

 const raw = readFileSync(VOX_PATH, 'utf-8');
 const vox: Record<string, string> = JSON.parse(raw);
 const keys = Object.keys(vox);

 console.log(`[split-vox] ${keys.length} chei găsite`);

 // Create output directory
 mkdirSync(OUTPUT_DIR, { recursive: true });

 const manifest: VoxManifest = {
   version: '1.0.0',
   generatedAt: new Date().toISOString(),
   totalChunks: keys.length,
   chunks: {},
 };

 let processed = 0;
 let skipped = 0;
 const seenSlugs = new Set<string>();

 for (const key of keys) {
   const base64Data = vox[key];

   // Skip non-audio entries (e.g., "//NAxAAM..." markers)
   if (!base64Data || typeof base64Data !== 'string' || base64Data.length < 100) {
     skipped++;
     continue;
   }

   let slug = slugify(key);

   // Handle duplicate slugs
   if (seenSlugs.has(slug)) {
     let counter = 1;
     while (seenSlugs.has(`${slug}-${counter}`)) counter++;
     slug = `${slug}-${counter}`;
   }
   seenSlugs.add(slug);

   const fileName = `${slug}.opus`;
   const outputPath = join(OUTPUT_DIR, fileName);

   try {
     // Decode base64 to binary buffer
     const buffer = Buffer.from(base64Data, 'base64');
     writeFileSync(outputPath, buffer);

     manifest.chunks[key] = {
       file: fileName,
       sizeBytes: buffer.length,
       originalKey: key,
     };

     processed++;
     if (processed % 50 === 0) {
       console.log(`[split-vox] Progres: ${processed}/${keys.length} chunks`);
     }
   } catch (err) {
     console.warn(`[split-vox] Skip "${key}": ${err instanceof Error ? err.message : err}`);
     skipped++;
   }
 }

 // Write manifest
 writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

 console.log(`[split-vox] Complet!`);
 console.log(`  Chunks create: ${processed}`);
 console.log(`  Skipped: ${skipped}`);
 console.log(`  Manifest: ${MANIFEST_PATH}`);

 // Calculate total size
 const totalSize = Object.values(manifest.chunks).reduce((sum, c) => sum + c.sizeBytes, 0);
 console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
 console.error('[split-vox] Fatal:', err);
 process.exit(1);
});