/* Migrare unică: monolitul (index.html + vox.json) → sursele proiectului Astro.
   - CSS-ul inline        → src/styles/legacy.css
   - JS-ul inline         → src/legacy/NN-<secțiune>.js (tăiat la antetele „/* =====", aceeași ordine)
   - markup-ul din <body> → src/pages/index.astro
   - vox.json (base64)    → public/vox/<hash>.mp3 + src/data/vox-index.json (fraza → fișier)
   Rulează: node scripts/split-monolith.mjs <index.html> <vox.json> */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const [htmlPath = 'index.html', voxPath = 'vox.json'] = process.argv.slice(2);
const root = process.cwd();
const html = readFileSync(htmlPath, 'utf8');

const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const [themeBoot, app] = scripts;
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('<style>')).trim();
const bodyOpen = html.match(/<body([^>]*)>/);
const body = html.slice(bodyOpen.index + bodyOpen[0].length, html.indexOf('<script>', bodyOpen.index)).trim();

mkdirSync(join(root, 'src/styles'), { recursive: true });
writeFileSync(join(root, 'src/styles/legacy.css'), css.trim() + '\n');

/* JS: o secțiune începe la fiecare antet „/* =====" de la începutul rândului */
const legacyDir = join(root, 'src/legacy');
rmSync(legacyDir, { recursive: true, force: true });
mkdirSync(legacyDir, { recursive: true });
const lines = app.replace(/^\n+/, '').split('\n');
const starts = [0];
lines.forEach((l, i) => { if (i > 0 && /^\/\* ={10,}/.test(l)) starts.push(i); });
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/^\s*v[\d.]+[a-z]?\s*·\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  .split('-').slice(0, 4).join('-') || 'sectiune';
starts.forEach((s, n) => {
  const chunk = lines.slice(s, starts[n + 1] ?? lines.length).join('\n');
  const title = n === 0 ? 'baza' : slug(lines[s + 1] || '');
  writeFileSync(join(legacyDir, `${String(n).padStart(2, '0')}-${title}.js`), chunk.replace(/\s+$/, '') + '\n');
});

/* vocea: un fișier .mp3 pe frază, numit după conținut (se schimbă doar dacă se schimbă sunetul) */
const vox = JSON.parse(readFileSync(voxPath, 'utf8'));
const voxDir = join(root, 'public/vox');
rmSync(voxDir, { recursive: true, force: true });
mkdirSync(voxDir, { recursive: true });
const index = {};
for (const [key, b64] of Object.entries(vox)) {
  const buf = Buffer.from(b64, 'base64');
  const file = createHash('sha256').update(buf).digest('hex').slice(0, 12) + '.mp3';
  writeFileSync(join(voxDir, file), buf);
  index[key] = file;
}
mkdirSync(join(root, 'src/data'), { recursive: true });
writeFileSync(join(root, 'src/data/vox-index.json'), JSON.stringify(index));

/* pagina: <head> fără CSS-ul inline (vine din legacy.css), markup-ul de pornire, apoi aplicația */
const page = `---
/* Pagina unică a aplicației. Markup-ul de pornire (intro, containere) e cel din monolit;
   restul interfeței e desenat de aplicație (src/legacy, unite de vite-plugin-legacy). */
import '../styles/legacy.css';
---
<!DOCTYPE html>
<html lang="ro">
<head>
${head}
<script is:inline>${themeBoot}</script>
</head>
<body${bodyOpen[1]}>
${body}
<script>import '../scripts/main.ts';</script>
</body>
</html>
`;
mkdirSync(join(root, 'src/pages'), { recursive: true });
writeFileSync(join(root, 'src/pages/index.astro'), page);

console.log(`css ${css.length} B · js ${starts.length} secțiuni · vox ${Object.keys(index).length} fraze → ${new Set(Object.values(index)).size} fișiere`);
