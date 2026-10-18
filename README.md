# GARDĂ (fost ZECE / VULTUR / UMBRA)

Aplicație PWA de antrenament hibrid (forță, alergare, kickboxing, nutriție), care merge complet offline.

## Setup

Cerințe: Node.js ≥ 22.22.

```bash
npm install
npm run dev       # http://localhost:4321/zece-app/
npm run build     # verificare tipuri + build static în dist/ (+ dist/sw.js)
npm run preview   # servește dist/ local
```

La push pe `main`, `.github/workflows/deploy.yml` construiește și publică pe GitHub Pages.

## Structură

| Cale | Ce conține |
|---|---|
| `src/pages/index.astro` | Pagina unică: `<head>`, markup-ul de pornire, încărcarea scriptului |
| `src/legacy/NN-*.js` | Codul aplicației din monolit, pe secțiuni; unite în ordine de `integrations/legacy-app.ts` (aceeași rază de vizibilitate) |
| `src/scripts/main.ts` | Punctul de intrare TypeScript |
| `src/styles/legacy.css` | Stilurile din monolit |
| `src/sw/` | Service worker-ul (TypeScript strict), compilat la build de `integrations/service-worker.ts` |
| `src/data/vox-index.json` | Fraza → fișierul audio |
| `public/vox/<hash>.mp3` | Vocea (Emil, edge-tts `ro-RO-EmilNeural`), un fișier pe frază |
| `scripts/split-monolith.mjs` | Migrarea unică din `index.html` + `vox.json` (păstrată pentru istoric) |

## Service worker

- Pagina: întâi rețeaua (timeout 3 s), apoi cache-ul.
- Fișierele aplicației, pozele, vocea, fonturile: întâi cache-ul.
- Versiuni pe fiecare fișier: build-ul calculează SHA-256 pentru tot ce e în `dist/`; o versiune nouă descarcă doar ce s-a schimbat, iar la activare șterge ce nu mai există.
- Vocea (509 fraze) se descarcă la prima nevoie și, în fundal, toată la câteva secunde după pornire.
- `/api/*`, Anthropic, Strava, Polar, GitHub, Open Food Facts nu trec niciodată prin cache.

Datele utilizatorului rămân în `localStorage` sub cheile `zece3:*` (neschimbate, ca nimic să nu se piardă la actualizare).
