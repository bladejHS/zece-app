# ZECE v9 — UMBRA / Hybrid365

Sistem holistic de pregătire pentru luptători (box/kickboxing), cu AI coaching integrat, periodizare automată și design "Industrial Tactical Premium".

**Arhitectură**: Astro SSG + TypeScript strict + GitHub Pages  
**Status**: Migrare din monolit SPA → arhitectură modernă modulară

---

## Setup Local

```bash
# Clonează repo-ul
git clone https://github.com/bladejhs/zece-app.git
cd zece-app

# Instalează dependențele
npm install

# Development server (HMR activ)
npm run dev

# Build static pentru producție
npm run build

# Preview build local
npm run preview
```

### Cerințe sistem

- Node.js ≥ 20
- npm ≥ 10
- Git

---

## Variabile de Mediu

| Variabilă | Scop | Implicit |
|-----------|------|----------|
| `PUBLIC_COACH_API_URL` | URL endpoint AI Coach (proxy serverless sau Anthropic direct) | `https://api.anthropic.com/v1/messages` |

### Configurare BYO-key (GitHub Pages)

Aplicația folosește modul **BYO-key**: fiecare utilizator introduce propria cheie API Anthropic în Settings. Cheia este criptată cu AES-GCM și stocată în IndexedDB, niciodată expusă în DOM sau source code.

⚠️ **Avertisment**: Pentru securitate maximă, configurează un proxy serverless (Cloudflare Worker / Vercel Edge Function) și setează `PUBLIC_COACH_API_URL` la URL-ul proxy-ului.

### Configurare Proxy Serverless (recomandat)

1. Creează un Cloudflare Worker sau Vercel Edge Function care proxy-ează apelurile către `api.anthropic.com`
2. Stochează `ANTHROPIC_API_KEY` ca env var server-side
3. Setează `PUBLIC_COACH_API_URL=https://your-proxy.workers.dev/api/coach` în repository settings → Variables

---

## Structură Proiect

```
src/
├── components/
│   ├── ui/              # Button, Card, TimerSegmented, ProgressBar
│   ├── workout/         # RoundCard, PreCheckIn
│   └── nutrition/       # MealTracker, SupplementStack, HydrationGauge
├── content/
│   ├── workouts/        # JSON chunks per sesiune antrenament
│   └── nutrition/       # JSON chunks per plan nutrițional
├── layouts/             # BaseLayout.astro (shell PWA)
├── lib/
│   ├── api/             # coach.ts, guardrails.ts, key-store.ts, types.ts
│   ├── audio/           # voice-engine.ts (lazy-load vox chunks)
│   └── offline-coach.ts # Fallback reguli hardcodate
├── pages/
│   ├── index.astro      # Landing page
│   └── workout/[day].astro  # Pagină sesiune antrenament
└── styles/
    └── tokens.css       # Design system complet

public/
├── sw.js                # Service Worker (content hashing granular)
├── vox/                 # Audio chunks .opus + manifest.json
├── icon.svg             # PWA icon
└── manifest.webmanifest # PWA manifest

scripts/
└── split-vox.ts         # Migrare vox.json → chunks .opus
```

---

## Adăugare Conținut Nou

### Workout-uri

Creează un fișier JSON în `src/content/workouts/` conform schemei Zod din `src/content.config.ts`:

```json
{
  "id": "box-combo-w2-d3",
  "title": "Combinații Avansate · Ziua 3",
  "description": "Hook-uri, uppercuts și clinch work",
  "level": 3,
  "durationSeconds": 3600,
  "tags": ["boxing", "advanced", "technique"],
  "equipment": ["bag", "gloves"],
  "contraindicatedInjuries": ["cot"],
  "phases": [
    {
      "type": "warmup",
      "label": "Încălzire Specifică",
      "durationSeconds": 300,
      "instructions": "Shadow boxing + rotiri articulare",
      "audioChunk": "warmup-specific-01"
    },
    {
      "type": "work",
      "label": "Runda 1 · Hook-Uppercut",
      "durationSeconds": 180,
      "instructions": "Combo 3-2-3 la sac. Focus pe rotație.",
      "audioChunk": "r1-hook-uppercut-01",
      "exercises": [
        { "name": "Left Hook-Right Cross-Left Hook", "sets": 4, "reps": "15/set", "restBetweenSetsSeconds": 45 }
      ]
    }
  ],
  "periodization": {
    "cycleWeek": 2,
    "dayOfWeek": 3,
    "intensityPct": 75
  }
}
```

**Reguli obligatorii**:
- Fiecare sesiune ARE 4 faze: warmup → work → rest → cooldown
- Ratio rundă:pauză respectă standarde combat sports (3:1, 2:1, 5:1)
- `cognitiveCue` prezent în fiecare rundă work
- Week 4 = deload automat (40% reducere volum)

### Nutriție

Creează un fișier JSON în `src/content/nutrition/`:

```json
{
  "id": "pre-workout-box",
  "title": "Masă Pre-Antrenament Box",
  "mealType": "pre-workout",
  "calories": 450,
  "macros": { "protein": 30, "carbs": 55, "fat": 12 },
  "ingredients": [
    { "name": "Ovăz", "amount": "60", "unit": "g" },
    { "name": "Banane", "amount": "1", "unit": "buc" },
    { "name": "Proteină whey", "amount": "30", "unit": "g" }
  ],
  "prepTimeMinutes": 5,
  "dietaryTags": ["high-protein"],
  "supplements": [
    { "name": "Creatină", "dose": "5g", "timing": "Cu masa", "tier": "tier1" }
  ]
}
```

**Guardrails automate la build**:
- ❌ Suplimente Tier 3 (test boosters, fat burners) → EROARE BUILD
- ❌ Calorii < 1600 kcal (femei) / < 2000 kcal (bărbați) → EROARE BUILD
- ❌ >7 zile consecutive intense fără deload → EROARE BUILD

### Audio Chunks

1. Rulează scriptul de migrare: `npx tsx scripts/split-vox.ts`
2. Chunks .opus sunt generați în `public/vox/`
3. Manifest `public/vox/manifest.json` mapează chei originale → fișiere
4. Voice engine le încarcă lazy la cerere

---

## Deploy GitHub Pages

Deploy-ul este automat prin GitHub Actions la push pe `main`:

1. Push cod pe branch `main`
2. Workflow `.github/workflows/deploy.yml` rulează build Astro
3. Output static deployat la `https://bladejhs.github.io/zece-app/`

### Configurare inițială

1. Activează GitHub Pages în repo settings → Pages → Source: GitHub Actions
2. (Opțional) Adaugă `PUBLIC_COACH_API_URL` în repo settings → Variables

---

## Securitate

- ✅ Cheia API Anthropic criptată AES-GCM în IndexedDB (niciodată în source/DOM)
- ✅ Post-response guardrails blochează conținut periculos înainte de afișare
- ✅ Rate limiting client-side: max 10 req/min per sesiune
- ✅ Timeout 5s → fallback offline automat
- ✅ Service Worker exclude explicit `/api/coach` și `api.anthropic.com` din cache
- ⚠️ Pentru producție: configurează proxy serverless (vezi secțiunea Variabile de Mediu)

---

## Design System

Tokenuri CSS definite în `src/styles/tokens.css`:

- **Tipografie**: Barlow Condensed (display) + Inter (body) + JetBrains Mono (mono)
- **Culori semantice**: Amber `#E8A84C` (efort), Cyan `#6BB8C9` (repaus), Red `#C95A4A` (erori)
- **Teme**: Dark (implicit), Light, Night Ops (NVG green)
- **Spacing**: Grilă 4px (`--s1x` → `--s16x`)
- **Motion**: Ease-out-expo interacțiuni, 180ms / 350ms tranziții

Componentele folosesc DOAR tokenuri CSS — niciodată culori hardcodate.

---

## Licență

Proprietar. Toate drepturile rezervate.