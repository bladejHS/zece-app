import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { build } from 'esbuild';
import type { SwManifest } from '../src/sw/manifest';

const SKIP = new Set(['sw.js', '.nojekyll']);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]);
}

/**
 * După build: calculează hash-ul fiecărui fișier din dist și compilează src/sw/sw.ts în dist/sw.js
 * cu lista încorporată. Service worker-ul se schimbă (deci se actualizează) doar când se schimbă un fișier.
 */
export default function serviceWorker(): AstroIntegration {
  return {
    name: 'zece:service-worker',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const manifest: SwManifest = {};
        for (const file of walk(out)) {
          const path = relative(out, file).split(sep).join('/');
          if (SKIP.has(path)) continue;
          const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
          manifest[path] = { hash, group: path.startsWith('vox/') ? 'vox' : 'shell' };
        }
        await build({
          entryPoints: [fileURLToPath(new URL('../src/sw/sw.ts', import.meta.url))],
          outfile: join(out, 'sw.js'),
          bundle: true,
          minify: true,
          format: 'iife',
          target: 'es2020',
          define: { __MANIFEST__: JSON.stringify(manifest) },
          logLevel: 'warning',
        });
        const n = Object.values(manifest);
        logger.info(`sw.js: ${n.filter((r) => r.group === 'shell').length} fișiere la instalare, ${n.filter((r) => r.group === 'vox').length} fraze de voce la cerere`);
      },
    },
  };
}
