/* Bodyweight (opțiunea B a finisher-ului de vineri): ținte de volum (60 de tracțiuni, 150 de flotări, în câte serii ai nevoie),
   cu progresie automată și recomandarea pentru seria următoare. */
import { progressionAllowed } from './validator.ts';

/* ---------- ținta de volum ---------- */

export interface VolumeRule {
  /** Ținta de pornire (total repetări pe sesiune). */
  base: number;
  /** Cât crește ținta după o sesiune reușită. */
  step: number;
  /** Ținta e „reușită" dacă iese în cel mult atâtea serii. */
  maxSets: number;
  /** Cea mai mică serie recomandată (sub ea nu are rost încă o serie, termini cu restul). */
  minSet: number;
  /** Prima serie, fără istoric. */
  firstSet: number;
}

export const VOLUME_RULES: Readonly<Record<string, VolumeRule>> = {
  'Pull Up': { base: 60, step: 5, maxSets: 8, minSet: 3, firstSet: 10 },
  'Push Ups': { base: 150, step: 10, maxSets: 6, minSet: 8, firstSet: 30 },
};

export interface VolSession { date: string; reps: number[]; deload: boolean }

export interface VolumeTarget {
  target: number;
  /** De ce e ținta asta (ultima sesiune). */
  why: string;
  /** Prima serie din ultima sesiune normală (reper pentru prima serie de azi). */
  prevFirst: number | null;
}

/** Ținta de azi, din istoric: crește cu `step` după fiecare sesiune în care ai atins ținta în cel mult `maxSets` serii
 *  (cel mult +20% pe săptămână); rămâne pe loc altfel. Sesiunile de deload nu contează la progresie. */
export function volumeTarget(rule: VolumeRule, history: readonly VolSession[]): VolumeTarget {
  let t = rule.base, why = `Ținta de pornire: ${rule.base} de repetări.`, prevFirst: number | null = null;
  for (const s of [...history].sort((a, b) => a.date.localeCompare(b.date))) {
    if (s.deload || !s.reps.length) continue;
    const total = s.reps.reduce((a, b) => a + b, 0);
    prevFirst = s.reps[0] ?? null;
    if (total >= t && s.reps.length <= rule.maxSets) {
      const next = progressionAllowed(t, t + rule.step) ? t + rule.step : Math.floor(t * 1.2);
      why = `Data trecută: ${total} în ${s.reps.length} serii (țintă ${t} atinsă) → acum ${next}.`;
      t = next;
    } else if (total >= t) {
      why = `Data trecută: ${total} în ${s.reps.length} serii. Ținta rămâne ${t} până o faci în cel mult ${rule.maxSets} serii.`;
    } else {
      why = `Data trecută: ${total} din ${t}. Ținta rămâne ${t}.`;
    }
  }
  return { target: t, why, prevFirst };
}

export interface NextVolSet {
  reps: number;
  remaining: number;
  setsLeft: number;
  done: boolean;
  /** Secunde de adăugat la pauză (când seriile scad mult). */
  restExtra: number;
  note: string;
}

/** Seria următoare la o țintă de volum: la prima, ~85% din prima serie de data trecută; apoi ~90% din ultima,
 *  ca să rămână 1–2 repetări în rezervă și calitatea să țină până la final. */
export function nextVolSet(rule: VolumeRule, target: number, done: readonly number[], prevFirst: number | null): NextVolSet {
  const total = done.reduce((a, b) => a + b, 0), remaining = Math.max(0, target - total);
  if (remaining <= 0) return { reps: 0, remaining: 0, setsLeft: 0, done: true, restExtra: 0, note: `Țintă atinsă: ${total} în ${done.length} serii.` };
  let reps: number, note: string, restExtra = 0;
  if (!done.length) {
    reps = prevFirst ? Math.max(rule.minSet, Math.round(prevFirst * 0.85)) : rule.firstSet;
    note = prevFirst ? `Prima serie: ~85% din prima de data trecută (${prevFirst}), cu 1–2 repetări în rezervă.` : 'Prima serie: lasă 1–2 repetări în rezervă, nu merge la eșec.';
  } else {
    const last = done[done.length - 1]!, first = done[0]!;
    reps = Math.max(rule.minSet, Math.round(last * 0.9));
    note = 'Cu 1–2 repetări în rezervă, ca forma să țină până la final.';
    if (last < first * 0.6) { restExtra = 30; note = 'Seriile au scăzut mult: pauză cu 30 s mai lungă.'; }
  }
  reps = Math.min(reps, remaining);
  /* dacă după seria asta ar rămâne mai puțin de o serie mică, o termini acum (dacă e realist) */
  const rest = remaining - reps;
  if (rest > 0 && rest < rule.minSet && remaining <= (done[done.length - 1] ?? rule.firstSet) + 1) reps = remaining;
  return { reps, remaining, setsLeft: Math.ceil(remaining / Math.max(1, reps)), done: false, restExtra, note };
}
