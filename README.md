# ZECE

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

## Antrenorul AI (`src/lib/coach/`)

Aplicația e statică (GitHub Pages), deci nu are server: fiecare utilizator își pune propria cheie Anthropic în Setări → Antrenor AI. Nu există variabile de mediu de configurat.

| Modul | Ce face |
|---|---|
| `vault.ts` | Cheia API criptată (AES-GCM 256) în IndexedDB, cu o cheie de criptare neextractibilă generată pe dispozitiv. Nu e în cod, în build, în export sau în sincronizare. Cheia veche din `localStorage` (`zece3:aiKey`) e mutată automat și ștearsă. |
| `guardrails.ts` | Validarea intrării (text ≤ 4000 caractere, poze JPEG/PNG/WebP ≤ 5 MB) și filtrul pe răspuns: blochează suplimentele Tier 3, aportul sub 1600 kcal/zi (femei) sau 2000 kcal/zi (bărbați), peste 7 zile de antrenament la rând și exercițiile care solicită zonele declarate accidentate. În chat se afișează doar propozițiile întregi deja verificate. |
| `incidents.ts` | Răspunsurile oprite, păstrate local pentru verificare manuală (Setări → Antrenor AI). |
| `limits.ts` | Limita de cereri pe dispozitiv: 40 / 10 minute, 300 / 24 de ore. |
| `net.ts` | SDK-ul `@anthropic-ai/sdk` inclus în pachet (nu de pe CDN); fără răspuns în 5 s, cererea se oprește. |
| `queue.ts` | Coada din IndexedDB pentru „Offline Coach": întrebările puse fără conexiune primesc un răspuns după reguli locale și pleacă la AI pentru verificare la revenirea online. |

Toate apelurile (chat, adaptarea antrenamentului, poza cu masa, tehnica exercițiilor) trec prin `COACH.preflight()` și `COACH.verify()`. Antrenamentul nu depinde niciodată de AI.

```bash
npm test          # testele filtrului (node --test)
```

## Service worker

- Pagina: întâi rețeaua (timeout 3 s), apoi cache-ul.
- Fișierele aplicației, pozele, vocea, fonturile: întâi cache-ul.
- Versiuni pe fiecare fișier: build-ul calculează SHA-256 pentru tot ce e în `dist/`; o versiune nouă descarcă doar ce s-a schimbat, iar la activare șterge ce nu mai există.
- Vocea (509 fraze) se descarcă la prima nevoie și, în fundal, toată la câteva secunde după pornire.
- `/api/*`, Anthropic, Strava, Polar, GitHub, Open Food Facts nu trec niciodată prin cache.

Datele utilizatorului rămân în `localStorage` sub cheile `zece3:*` (neschimbate, ca nimic să nu se piardă la actualizare).
