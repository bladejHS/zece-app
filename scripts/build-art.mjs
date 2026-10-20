/* Ilustrațiile FALCO (public/art/*.svg), toate din aceeași siluetă de rândunică (src/ui/brand.ts):
   coperta de pe Acasă, benzile paginilor, cardurile Kickboxing și semnele zilelor.
   Negru adânc, o lumină palidă de cer și rândunici albe; nimic altceva.
   Rulează după o schimbare de siluetă: node scripts/build-art.mjs */
import { mkdirSync, writeFileSync } from 'node:fs';
import { SWALLOW } from '../src/ui/brand.ts';

const out = new URL('../public/art/', import.meta.url);
mkdirSync(out, { recursive: true });

const INK = '#F4F6F8';
const SKY = '156,201,242';

/** o rândunică: [x, y, rotație °, scară, opacitate] */
const bird = ([x, y, r, s, o = 1]) =>
  `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="${SWALLOW}" fill="${INK}"${o < 1 ? ` fill-opacity="${o}"` : ''}/>`;

/** scena: fundal negru, o lumină de cer în (gx, gy), opțional o linie de orizont și urme fine de zbor */
function scene({ w, h, glow: [gx, gy, gr], birds, horizon = null, trails = [] }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="${gx}" cy="${gy}" r="${gr}"><stop offset="0" stop-color="rgb(${SKY})" stop-opacity=".26"/><stop offset=".45" stop-color="rgb(${SKY})" stop-opacity=".08"/><stop offset="1" stop-color="rgb(${SKY})" stop-opacity="0"/></radialGradient>
<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07090C"/><stop offset="1" stop-color="#050505"/></linearGradient>
<linearGradient id="hz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity="0"/><stop offset=".5" stop-color="${INK}" stop-opacity=".22"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#v)"/><rect width="${w}" height="${h}" fill="url(#g)"/>
${horizon != null ? `<rect x="0" y="${horizon}" width="${w}" height="1.5" fill="url(#hz)"/>` : ''}
${trails.map((d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".12" stroke-width="1.2" stroke-linecap="round"/>`).join('')}
${birds.map(bird).join('\n')}
</svg>`;
}

const ART = {
  /* Acasă: trei rândunici urcă spre lumină (portret, partea de sus rămâne liberă pentru dată) */
  cover: scene({ w: 900, h: 1350, glow: [640, 220, 760], horizon: 980,
    trails: ['M100 860C300 760 450 580 560 440'],
    birds: [[640, 300, -26, 4.2], [380, 520, -18, 2.7, 0.92], [400, 180, -32, 2.0, 0.85]] }),
  /* Acasă pe ecrane late: aceleași trei rândunici, în dreapta */
  'cover-wide': scene({ w: 1600, h: 900, glow: [1180, 260, 900], horizon: 700,
    trails: ['M640 700C860 620 1000 470 1100 360'],
    birds: [[1200, 330, -26, 4.4], [960, 520, -18, 2.8, 0.92], [990, 210, -32, 2.1, 0.85]] }),
  /* Antrenament: o rândunică mare, în plin zbor */
  'band-plan': scene({ w: 1280, h: 853, glow: [930, 280, 720], horizon: 640,
    trails: ['M520 640C700 560 820 450 900 360'],
    birds: [[930, 360, -20, 4.2]] }),
  /* Performanță: un stol care urcă în diagonală */
  'band-prog': scene({ w: 1280, h: 853, glow: [1010, 210, 760], horizon: 660,
    birds: [[1040, 230, -30, 2.6], [900, 330, -28, 2.0, 0.9], [780, 430, -26, 1.6, 0.8], [690, 520, -24, 1.25, 0.7], [620, 600, -22, 1.0, 0.6]] }),
  /* Nutriție: două rândunici planează liniștit, aproape de orizont */
  'band-nutri': scene({ w: 1280, h: 853, glow: [960, 420, 700], horizon: 600,
    birds: [[1000, 410, -6, 3.0], [820, 480, -2, 2.1, 0.88]] }),
  /* Kickboxing, banda: o rândunică ascuțită, rapidă */
  'kb-band': scene({ w: 1280, h: 853, glow: [900, 300, 700],
    trails: ['M440 560C620 520 760 420 850 330', 'M480 610C660 570 790 470 880 380'],
    birds: [[900, 330, -34, 3.8]] }),
  /* Sac: picaj */
  'kb-bag': scene({ w: 1280, h: 853, glow: [820, 360, 680],
    trails: ['M560 140C700 220 790 330 820 420'],
    birds: [[830, 450, 48, 3.4]] }),
  /* Palmare: două rândunici care se răspund */
  'kb-pads': scene({ w: 1280, h: 853, glow: [820, 330, 700],
    birds: [[700, 360, -18, 2.6], [980, 300, 198, 2.6, 0.9]] }),
  /* Sparring: două traiectorii care se încrucișează */
  'kb-spar': scene({ w: 1280, h: 853, glow: [840, 380, 700],
    trails: ['M480 640C680 540 840 420 960 300', 'M1180 660C1000 560 840 460 740 360'],
    birds: [[1000, 270, -38, 2.6], [700, 350, 214, 2.4, 0.9]] }),
  /* Bandaje (pregătirea): o rândunică planează jos, la orizont */
  'kb-wraps': scene({ w: 1280, h: 853, glow: [880, 500, 640], horizon: 560,
    birds: [[880, 500, -4, 3.2]] }),
};
for (const [name, svg] of Object.entries(ART)) writeFileSync(new URL(`${name}.svg`, out), svg);

/* semnele zilelor (luni … duminică): aceeași rândunică urcă puțin câte puțin pe parcursul săptămânii */
for (let d = 0; d < 7; d++) {
  const r = 6 - d * 7;
  writeFileSync(new URL(`zi-${d}.svg`, out), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
<defs><radialGradient id="g" cx=".62" cy=".34" r=".8"><stop offset="0" stop-color="#18222D"/><stop offset=".6" stop-color="#0A0C0F"/><stop offset="1" stop-color="#050505"/></radialGradient></defs>
<rect width="96" height="96" fill="url(#g)"/>
${bird([54, 49, r, 0.52])}
</svg>`);
}
console.log(Object.keys(ART).length + ' ilustrații + 7 semne ale zilelor în public/art/');
