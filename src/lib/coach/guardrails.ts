/* Filtrul de siguranță pentru antrenorul AI: ce intră (întrebarea, poza) și ce iese (răspunsul).
   Nimic din ce scrie modelul nu ajunge pe ecran înainte să treacă de checkOutput. */

export type Sex = 'm' | 'f';

/** Zonele pe care utilizatorul le poate declara accidentate (Setări → Antrenor AI). */
export const INJURIES = {
  umar: 'Umăr',
  cot: 'Cot',
  incheietura: 'Încheietură',
  gat: 'Gât',
  lombar: 'Spate (lombar)',
  sold: 'Șold',
  genunchi: 'Genunchi',
  glezna: 'Gleznă',
} as const;
export type Injury = keyof typeof INJURIES;
export const isInjury = (v: unknown): v is Injury => typeof v === 'string' && Object.hasOwn(INJURIES, v);

export interface GuardContext {
  sex: Sex;
  injuries: readonly Injury[];
}

export type GuardCode = 'tier3' | 'kcal' | 'streak' | 'injury';
export type GuardResult = { ok: true } | { ok: false; code: GuardCode; match: string };

/** Pragul minim de calorii pe zi sub care nu se recomandă nimic. */
export const KCAL_FLOOR: Record<Sex, number> = { f: 1600, m: 2000 };
export const MAX_CONSECUTIVE_DAYS = 7;
export const MAX_INPUT_CHARS = 4000;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Text fără diacritice, cu litere mici și spații simple, ca regulile să nu depindă de scriere. */
export const fold = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[‐-―]/g, '-').replace(/\s+/g, ' ');

const sentences = (s: string): string[] => s.split(/(?<=[.!?;])\s+|\n+/).map((x) => x.trim()).filter(Boolean);

/** Propoziția vorbește despre ce să eviți, nu despre ce să faci. */
const NEGATED = /\b(nu|evita|evitati|niciodata|renunta|inlocuieste|in loc de|scoate|elimina|fara sa|pauza de la|interzis|periculos|risc)\b/;

/* Tier 3: suplimente și substanțe care nu se recomandă niciodată (nici măcar ca mențiune) */
const TIER3: readonly RegExp[] = [
  /\btest(osteron)?[ -]?boosters?\b/, /\bbooster[a-z]* (de|pentru) testosteron/, /\bfat[ -]?burners?\b/,
  /\barzato(r|are)[a-z]* de grasim/, /\b(suplimente?|pastile|capsule) termogenice?\b/, /\bthermogenics?\b/,
  /\bpro-?hormon/, /\bsarms?\b/, /\bsteroiz/, /\banaboli(zant|ce\b)/, /\bclenbuterol/, /\b(efedrin|ephedrin)/,
  /\bdnp\b/, /\bdmaa\b/, /\byohimbin/, /\btrenbolon/, /\bnandrolon/, /\b(oxandrolon|anavar)\b/, /\bdianabol/,
  /\b(winstrol|stanozolol)/, /\bdiuretic(e|ele|elor)\b/, /\bfurosemid/, /\btribulus/, /\bhcg\b/, /\bhgh\b/,
  /\bhormon(ul)? de crestere\b/,
];

/* calorii: doar aportul pe zi, nu o masă, o gustare sau un deficit */
const KCAL_NUM = /(\d{1,2}[.\s]\d{3}|\d{3,4})\s*(?:-|–|pana la|si)?\s*(?:(\d{1,2}[.\s]\d{3}|\d{3,4})\s*)?(kcal|calorii|cal)\b/g;
const KCAL_DAY = /(pe zi|\/ ?zi|zilnic|aport|tinta|dieta de|regim de|sa mananci|sa consumi|consum total|total pe zi|nu depasi|sub \d)/;
const KCAL_NOT_INTAKE = /(deficit|surplus|ardere|arzi|arde|ars|cheltui|masa|mese|gustare|portie|pranz|cina|mic dejun|shake|antrenament|alergare|sesiune)/;
const num = (s: string): number => Number(s.replace(/[.\s]/g, ''));

/* zile de antrenament la rând fără odihnă */
const STREAK: readonly RegExp[] = [
  /\b(\d{1,2}) zile (la rand|consecutiv[ea]?|una dupa alta|fara (pauza|odihna|zi libera|repaus))/,
  /\b(\d{1,2}) zile din (\d{1,2})\b/,
];
const STREAK_ALWAYS: readonly RegExp[] = [
  /\b(7|sapte) (zile|antrenamente|sesiuni) (pe|din) (7|sapte|saptamana)\b/,
  /\b(in fiecare zi|zilnic)\b.{0,50}\bfara (nicio |vreo )?(zi (libera|de odihna|de pauza|de repaus)|pauza|odihna|repaus|deload)/,
  /\b(doua|2|trei|3|patru|4) saptamani (la rand |consecutiv[e]? )?fara (nicio )?(zi libera|pauza|odihna|repaus|deload)/,
];
const TRAINING = /(antren|intens|sesiun|sparring|alerg|alearg|forta|sala|exercit|run)/;

/* exerciții care solicită zona accidentată */
const INJURY_EX: Record<Injury, RegExp> = {
  umar: /\b(overhead press|military press|push press|presa militara|impins deasupra capului|snatch|smulgere|upright row|ramat vertical|dips|flotari la paralele|behind the neck|handstand|pike push)/,
  cot: /\b(skull crusher|french press|extensii? (de )?triceps (deasupra capului|la ceafa)|overhead extension|dips|flotari diamant|close grip bench)/,
  incheietura: /\b(front squat|power clean|hang clean|clean and jerk|handstand|flotari pe pumni|wrist curl)/,
  gat: /\b(neck bridge|pod pe (cap|gat)|headstand|shrug)/,
  lombar: /\b(deadlift|indreptari|good morning|back squat|genuflexiuni cu bara|kettlebell swing|bent over row|ramat aplecat|rdl|hiperextensi|sit-?ups?|dragon flag)/,
  sold: /\b(sumo|pistol squat|lunges?|fandari|high kick|lovituri? inalte|head kick)/,
  genunchi: /\b(box jump|jump squat|sarituri|pliometri|lunges?|fandari|pistol squat|burpee|sprint|genuflexiuni adanci|leg extension)/,
  glezna: /\b(sarituri|coarda|box jump|sprint|pliometri|burpee|jumping jack)/,
};

/** Verifică un text de la model. Primul motiv găsit oprește tot răspunsul. */
export function checkOutput(text: string, ctx: GuardContext): GuardResult {
  const all = fold(text);
  for (const re of TIER3) {
    const m = re.exec(all);
    if (m) return { ok: false, code: 'tier3', match: m[0] };
  }
  const floor = KCAL_FLOOR[ctx.sex];
  for (const s of sentences(all)) {
    if (KCAL_DAY.test(s) && !KCAL_NOT_INTAKE.test(s)) {
      for (const m of s.matchAll(KCAL_NUM)) {
        const vals = [m[1], m[2]].filter((x): x is string => !!x).map(num);
        const low = Math.min(...vals);
        if (low >= 300 && low < floor) return { ok: false, code: 'kcal', match: m[0] };
      }
    }
    if (TRAINING.test(s) && !NEGATED.test(s)) {
      for (const re of STREAK) {
        const m = re.exec(s);
        if (m && Number(m[1]) > MAX_CONSECUTIVE_DAYS) return { ok: false, code: 'streak', match: m[0] };
      }
      for (const re of STREAK_ALWAYS) {
        const m = re.exec(s);
        if (m) return { ok: false, code: 'streak', match: m[0] };
      }
    }
    if (ctx.injuries.length && !NEGATED.test(s)) {
      for (const inj of ctx.injuries) {
        const m = INJURY_EX[inj].exec(s);
        if (m) return { ok: false, code: 'injury', match: `${INJURIES[inj]}: ${m[0]}` };
      }
    }
  }
  return { ok: true };
}

/** Un exercițiu propus (de ex. o înlocuire) care solicită o zonă declarată accidentată. */
export function exerciseConflict(name: string, injuries: readonly Injury[]): Injury | null {
  const n = fold(name);
  return injuries.find((i) => INJURY_EX[i].test(n)) ?? null;
}

/** Cât din textul care tocmai vine de la model se poate arăta: doar propozițiile întregi care au trecut de filtru. */
export function gateStream(text: string, ctx: GuardContext): { shown: string; blocked: GuardResult | null } {
  const cut = Math.max(text.lastIndexOf('\n'), ...['. ', '! ', '? ', '; '].map((p) => text.lastIndexOf(p) + 1));
  const prefix = cut > 0 ? text.slice(0, cut) : '';
  const r = checkOutput(prefix, ctx);
  return r.ok ? { shown: prefix, blocked: null } : { shown: '', blocked: r };
}

export type InputCheck = { ok: true; text: string } | { ok: false; reason: string };

/** Întrebarea utilizatorului: fără caractere de control, cel mult MAX_INPUT_CHARS. */
export function checkInput(raw: string): InputCheck {
  // eslint-disable-next-line no-control-regex
  const text = String(raw ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (!text) return { ok: false, reason: 'Scrie o întrebare.' };
  if (text.length > MAX_INPUT_CHARS) return { ok: false, reason: `Mesajul e prea lung (${text.length} caractere, cel mult ${MAX_INPUT_CHARS}).` };
  return { ok: true, text };
}

/** Poza trimisă la analiză: JPEG/PNG/WebP în base64, cel mult MAX_IMAGE_BYTES. */
export function checkImage(base64: string, mediaType: string): InputCheck {
  if (!/^image\/(jpeg|png|webp)$/.test(mediaType)) return { ok: false, reason: 'Poza trebuie să fie JPEG, PNG sau WebP.' };
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64)) return { ok: false, reason: 'Poza nu a putut fi citită.' };
  if ((base64.length * 3) / 4 > MAX_IMAGE_BYTES) return { ok: false, reason: 'Poza e prea mare (cel mult 5 MB).' };
  return { ok: true, text: base64 };
}

/** Mesajul afișat în locul unui răspuns oprit. */
export const SAFE_MESSAGE: Record<GuardCode, string> = {
  tier3: 'Am oprit răspunsul: atingea suplimente sau substanțe pe care aplicația nu le recomandă (stimulente hormonale, arzătoare de grăsimi, prohormoni). Pentru suplimente, rămân cele cu dovezi solide din fila Nutriție.',
  kcal: 'Am oprit răspunsul: propunea un aport de calorii sub pragul sigur. Pentru o scădere în greutate, deficitul rămâne moderat; dacă vrei mai mult, discută cu un medic sau nutriționist.',
  streak: 'Am oprit răspunsul: propunea mai mult de 7 zile de antrenament la rând fără odihnă. Recuperarea face parte din plan.',
  injury: 'Am oprit răspunsul: recomanda un exercițiu care solicită o zonă pe care ai declarat-o accidentată. Întreabă din nou sau cere o variantă fără acea zonă.',
};
