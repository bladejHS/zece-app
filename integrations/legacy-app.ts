import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const ID = 'virtual:legacy-app';
const RESOLVED = '\0' + ID;
const DIR = join(process.cwd(), 'src/legacy');

/**
 * Codul vechi (src/legacy/NN-*.js) e împărțit pe secțiuni, dar toate secțiunile împart
 * aceeași rază de vizibilitate (funcțiile se cheamă între ele direct). Plugin-ul le unește,
 * în ordinea numelui, într-un singur modul virtual, pe care Vite îl minifică și îl numește după conținut.
 * Secțiunile ies de aici una câte una, pe măsură ce devin module TypeScript cu import/export.
 */
export default function legacyApp(): Plugin {
  const files = (): string[] => readdirSync(DIR).filter((f) => f.endsWith('.js')).sort();
  return {
    name: 'zece:legacy-app',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      const parts = files().map((f) => {
        const path = join(DIR, f);
        this.addWatchFile(path);
        return `/* ── ${f} ── */\n${readFileSync(path, 'utf8')}`;
      });
      const imports = [
        `import VOX_INDEX from '/src/data/vox-index.json';`,
        `import * as COACH from '/src/lib/coach/index.ts';`,
        `import * as UI from '/src/ui/index.ts';`,
      ];
      return `${imports.join('\n')}\n${parts.join('\n')}`;
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(DIR)) return;
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
