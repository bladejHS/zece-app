/* Raportul vocii pe faze: câte fraze înregistrate are fiecare fază a sesiunii și ce lipsește.
   Rulează: node scripts/vox-report.mjs > docs/vox-faze.md */
import { readFileSync } from 'node:fs';
import { coverage, phaseKeys } from '../src/lib/training/vox.ts';
import { PHASE_LABEL } from '../src/lib/training/types.ts';

const ix = JSON.parse(readFileSync(new URL('../src/data/vox-index.json', import.meta.url), 'utf8'));
const words = Object.keys(ix).filter((k) => /^[wnhf]:/.test(k)).length;
const out = [
  '# Vocea pe faze',
  '',
  `Banca are ${Object.keys(ix).length} înregistrări: ${Object.keys(ix).length - words} fraze întregi și ${words} cuvinte și numere (pentru „runda 3 din 5", vitezele, minutele).`,
  'Frazele care lipsesc se spun cu vocea telefonului (mai lent, ton mai jos), deci sesiunea merge oricum.',
  '',
  '| Fază | Fraze | Lipsesc (cerute de sesiunea în 4 faze) |',
  '|---|---|---|',
  ...coverage(ix).map((c) => `| ${PHASE_LABEL[c.phase]} | ${c.phrases} | ${c.missing.length ? c.missing.map((m) => `„${m}"`).join(', ') : '—'} |`),
  '',
  '## Concluzii',
  '',
  '- Activarea și condiționarea sunt bine acoperite (încălzire, coardă, rotații, runde, ultimele 10 secunde, încurajări).',
  '- Tehnica are toate combinațiile de pumni și picioare, dar nu și indicațiile noi de decizie („alegi ieșirea", „pas lateral").',
  '- Revenirea are respirația și întinderile din cronometrele calme, dar nu și sarcina de memorare.',
  '- Semnalele de reacție („sus", „jos") nu sunt înregistrate; „stânga" și „dreapta" sunt.',
  '- Pentru a le înregistra: edge-tts `ro-RO-EmilNeural`, −12 % viteză, −8 Hz ton (ca restul băncii), apoi `node scripts/split-monolith.mjs` sau adăugate direct în `public/vox` + `src/data/vox-index.json`.',
  '',
  '## Frazele pe faze',
  '',
  ...['activation', 'technique', 'conditioning', 'cooldown'].flatMap((p) => [`### ${PHASE_LABEL[p]}`, '', phaseKeys(ix, p).map((k) => `„${k}"`).join(' · '), '']),
];
console.log(out.join('\n'));
