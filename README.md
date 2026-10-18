# ZECE

Aplicație PWA de antrenament pentru sporturi de contact și antrenament hibrid: kickboxing (sac, palmare, sparring), forță, alergare, nutriție. Merge complet fără internet și se instalează pe telefon.

Design „Industrial Tactical Premium”: carbon → gunmetal, argint metalic, amber pentru efort, cyan pentru repaus. Butoane mari (64–76 px), făcute să meargă și cu mănușile pe mâini.

## Setup

Cerințe: Node.js ≥ 22.22.

```bash
npm install
npm run dev       # http://localhost:4321/zece-app/
npm test          # testele (filtru AI, antrenament, nutriție, funcții elite)
npm run build     # verificare tipuri + build static în dist/ (+ dist/sw.js)
npm run preview   # servește dist/ local
```

La push pe `main`, `.github/workflows/deploy.yml` rulează testele, construiește aplicația și o publică pe GitHub Pages (Settings → Pages → Source: GitHub Actions).

### Variabile de mediu

Nu există. Aplicația e statică (GitHub Pages) și nu are server. Antrenorul AI folosește cheia Anthropic a fiecărui utilizator. Cheia se introduce în Setări → Antrenor AI și e stocată criptat doar pe dispozitiv (vezi mai jos). Nicio cheie nu stă în cod sau în build.

## Arhitectură

Astro (SSG) + Vite + TypeScript strict, fără framework la rulare: o singură pagină HTML și un pachet JS cu hash în nume.

| Cale | Ce conține |
|---|---|
| `src/pages/index.astro` | Pagina unică |
| `src/components/` | `Intro.astro` (deschiderea), `TopBar.astro` (antetul) |
| `src/ui/` | Componente TypeScript: semnul ZECE (`brand.ts`), cadranul segmentat al cronometrului, obturatorul dintre runde, cue-urile ultimelor 3 s (`timer.ts`), progresul segmentat (`segments.ts`) |
| `src/lib/coach/` | Antrenorul AI: cheia criptată, filtrul de siguranță, limita de cereri, modul offline, coada de sincronizare |
| `src/lib/training/` | Sesiuni în 4 faze, rapoarte de contact, check-in, feedback pe rundă, deload, validator, vocea pe faze |
| `src/lib/nutrition/` | Plan periodizat, hidratare, suplimente pe niveluri, feedback pe mese, meal prep, avertizarea medicală |
| `src/lib/premium/` | HRV, mastery, analize, squad-uri, ritualuri, vocea dinamică |
| `src/legacy/NN-*.js` | Interfața aplicației (din monolitul inițial), pe secțiuni, unite de `integrations/legacy-app.ts`. Modulele de mai sus ajung la ea ca `COACH`, `UI`, `TRAINING`, `NUTRI`, `ELITE` |
| `src/styles/` | `tokens.css` (paleta, tipografia, mișcarea), `tactical.css` (componentele), `intro.css`, `fonts.css`, `legacy.css` |
| `src/sw/` | Service worker-ul, compilat la build de `integrations/service-worker.ts` |
| `public/vox/<hash>.mp3` + `src/data/vox-index.json` | Vocea (509 fraze), un fișier pe frază |
| `scripts/` | `build-icons.mjs` (iconițele din semn), `vox-report.mjs` (acoperirea vocii pe faze → `docs/vox-faze.md`), `split-monolith.mjs` (migrarea inițială) |

Datele utilizatorului rămân în `localStorage`, sub cheile `zece3:*` / `zece:*`, aceleași ca înainte, deci nimic nu se pierde la actualizare.

## Antrenorul AI (securitate)

- **Cheia API**: criptată AES-GCM 256 în IndexedDB, cu o cheie de criptare neextractibilă generată pe dispozitiv. Nu intră în export și nici în sincronizare. Cheia veche, salvată în clar, e mutată automat și ștearsă.
- **SDK-ul** `@anthropic-ai/sdk` e inclus în pachet, nu descărcat de pe un CDN la rulare.
- **Filtrul pe răspuns**: nimic nu apare pe ecran înainte să fie verificat. În chat se afișează doar propozițiile întregi deja verificate. Filtrul blochează:
  - suplimentele Tier 3;
  - aportul sub 1600 kcal/zi la femei sau 2000 kcal/zi la bărbați;
  - mai mult de 7 zile de antrenament la rând;
  - exercițiile care contrazic accidentările declarate.

  La blocare apare un mesaj sigur, iar incidentul se salvează local pentru verificare.
- **Intrarea**: textul are cel mult 4000 de caractere, pozele trebuie să fie JPEG/PNG/WebP de cel mult 5 MB. Limita de cereri e 40 la 10 minute și 300 pe zi.
- **Offline Coach**: dacă nu e internet sau API-ul nu răspunde în 5 s, răspund regulile locale, cu un banner. Întrebările și feedback-ul se salvează în IndexedDB și se trimit AI-ului spre verificare la revenire. Antrenamentul nu depinde niciodată de AI.

Limitarea variantei fără server: cheia se folosește din browser, deci un script rău-intenționat care ar rula în pagină ar putea s-o folosească. Un proxy serverless (de exemplu un Cloudflare Worker cu cheia ca secret) ar elimina riscul ăsta. Deocamdată, proiectul a ales să nu aibă server.

## Antrenament

- **Sesiunea în 4 faze** (kickboxing): activare → tehnică → condiționare → revenire, cu componentă cognitivă (reacție la semnal, decizie, memorare).
- **Rapoarte rundă:pauză**: doar 3:1, 2:1 sau 5:1 (sub 60 s de lucru, doar 5:1). Fără Tabata sau HIIT generic.
- **Check-in înainte** (energie, somn, RPE, dureri pe zone): modifică sesiunea curentă.
- **Feedback după fiecare rundă**, în pauză: ușor / potrivit / greu / la limită / durere. Runda următoare se ajustează pe loc.
- **Deload automat** în săptămâna 4: volum −40%, aceleași zile. Se poate dezactiva din Setări.
- **Deload forțat** când HRV-ul de azi e sub 90% din media pe 7 zile.
- **Validatorul**: cel mult 7 zile intense la rând, volumul săptămânii crește cu cel mult +20% față de săptămâna de referință, fără exercițiile care solicită zonele accidentate. Progresia alergării, fie editată manual, fie de antrenorul AI, e limitată la +20%.
- **Cronometrul**: wake lock cât rulează (eliberat la pauză și la final), vibrație la tranziții, puls și flash în ultimele 3 s, obturator între runde. Vocea are tempo și ton după fază, intensitate și RPE, plus semnale fără cuvinte. Pe iPhone, browserul nu permite vibrația.

## Nutriție

- Ținta zilei urmează tipul zilei din plan: intensă +20% carbohidrați, odihnă −20%, deload −10%, proteina rămâne constantă. Se ajustează după check-in.
- Praguri care nu se pot coborî: 1600/2000 kcal pe zi și un deficit de cel mult 25%.
- Avertizare medicală obligatorie înainte de prima folosire.
- Hidratare: 35 ml/kg plus pierderile estimate × 1,25, cu alertă la pornirea antrenamentului.
- Suplimente Tier 1/2 cu doză și nivel de dovezi. Tier 3 e blocat și explicat.
- Notare rapidă a mesei cu vocea sau text, cu feedback după antrenamentul zilei. Meal prep pe săptămână.

## Funcții elite

- **HRV și somn**: din check-in sau din import CSV (Garmin Connect, Apple Health printr-o aplicație de export). O aplicație web nu poate citi direct Apple Health sau Garmin.
- **Mastery**: insigne de tehnică și recuperare, nivel din competență, penalizări pentru limitele de siguranță ignorate.
- **Analiză**: Technical Efficiency Score, Recovery Debt Index, harta abilităților, sincronizarea nutriție–antrenament.
- **Squad privat** (cel mult 5 oameni), fără server: fiecare membru publică un rezumat săptămânal criptat (PBKDF2 + AES-GCM) într-un gist secret de pe GitHub. Accesul se face prin coduri de invitație, iar provocarea săptămânii e comună.
- **Ritualul săptămânal**, opțional: 12 minute ghidate, sincronizate pe ceas pentru tot squad-ul.

## Service worker

- **Pagina**: întâi din rețea (3 s), apoi din cache.
- **Aplicația, pozele, fonturile, vocea**: întâi din cache.
- **Versiuni pe fiecare fișier**: build-ul calculează un SHA-256 pentru tot ce e în `dist/`. O versiune nouă descarcă doar ce s-a schimbat, iar ce nu mai există se șterge la activare.
- **Vocea** se aduce la prima nevoie și în fundal. Frazele fazei următoare se preîncarcă înaintea ei.
- **Fără cache**: `/api/*`, Anthropic, Strava, Polar, GitHub și Open Food Facts nu trec niciodată prin cache.

## Licențe

Fonturile Chakra Petch și Inter sunt incluse sub SIL Open Font License 1.1 (`src/assets/fonts/LICENSE-*.txt`). Vocea a fost generată cu edge-tts (`ro-RO-EmilNeural`).
