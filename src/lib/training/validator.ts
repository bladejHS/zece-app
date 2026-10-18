/* Validatorul de siguranță (reguli fixe, nu se pot ocoli din interfață sau de antrenorul AI):
   - cel mult 7 zile intense la rând;
   - volumul săptămânii crește cu cel mult 20% față de săptămâna de referință (ultima săptămână normală, nu de deload);
   - fără exerciții care solicită zonele declarate accidentate. */
import type { Injury } from '../coach/guardrails.ts';
import { protectArea, renumber } from './adapt.ts';
import { allChunks, isIntense, sessionMinutes } from './session.ts';
import { PROGRESSION, type WorkoutSession } from './types.ts';

export interface DayLoad {
  /** YYYY-MM-DD */
  date: string;
  minutes: number;
  intense: boolean;
  deload?: boolean;
}

const day = (k: string): number => Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / 86_400_000;
const keyOf = (n: number): string => new Date(n * 86_400_000).toISOString().slice(0, 10);
/** Luni din săptămâna zilei k. */
export const mondayOf = (k: string): string => { const n = day(k); return keyOf(n - ((new Date(n * 86_400_000).getUTCDay() + 6) % 7)); };

/** Zile intense la rând care se termină ieri (azi nu se numără). */
export function intenseStreak(days: readonly DayLoad[], today: string): number {
  const intense = new Set(days.filter((d) => d.intense).map((d) => d.date));
  let n = 0;
  for (let t = day(today) - 1; intense.has(keyOf(t)); t--) n++;
  return n;
}

export function weekMinutes(days: readonly DayLoad[], monday: string): number {
  const a = day(monday);
  return days.filter((d) => day(d.date) >= a && day(d.date) < a + 7).reduce((s, d) => s + d.minutes, 0);
}

/** Referința de volum: cea mai mare dintre ultimele 2 săptămâni încheiate fără deload. null = prea puține date (fără limită). */
export function referenceMinutes(days: readonly DayLoad[], today: string): number | null {
  const m = day(mondayOf(today));
  const weeks = [1, 2].map((i) => {
    const mon = keyOf(m - 7 * i);
    const inWeek = days.filter((d) => day(d.date) >= m - 7 * i && day(d.date) < m - 7 * i + 7);
    return { min: weekMinutes(days, mon), deload: inWeek.some((d) => d.deload), n: inWeek.length };
  }).filter((w) => w.n > 0 && !w.deload);
  return weeks.length ? Math.max(...weeks.map((w) => w.min)) : null;
}

export interface Validation { session: WorkoutSession; blocked: string[] }

export function validateSession(input: WorkoutSession, history: readonly DayLoad[], today: string, injuries: readonly Injury[]): Validation {
  const s = structuredClone(input);
  const blocked: string[] = [];
  const cond = s.phases.find((p) => p.phase === 'conditioning');

  if (injuries.length) {
    const before = JSON.stringify(allChunks(s));
    allChunks(s).forEach((c) => injuries.forEach((i) => protectArea(c, i)));
    if (JSON.stringify(allChunks(s)) !== before) blocked.push('Exercițiile care solicită zonele declarate accidentate au fost scoase.');
  }

  const streak = intenseStreak(history, today);
  if (isIntense(s) && streak + 1 > PROGRESSION.maxConsecutiveIntenseDays && cond) {
    cond.chunks = [];
    blocked.push(`Ai ${streak} zile intense la rând: azi nu se adaugă a ${streak + 1}-a. Sesiunea devine tehnică și recuperare.`);
  }

  const ref = referenceMinutes(history, today);
  if (ref != null && ref > 0 && cond) {
    const limit = ref * (1 + PROGRESSION.maxWeeklyVolumeIncrease);
    const done = weekMinutes(history, mondayOf(today));
    let trimmed = 0;
    while (done + sessionMinutes(s) > limit && cond.chunks.filter((c) => c.kind === 'work').length > 1) {
      const works = cond.chunks.filter((c) => c.kind === 'work');
      const last = works[works.length - 1]!;
      const i = cond.chunks.indexOf(last);
      const withRest = cond.chunks[i - 1]?.kind === 'rest';
      cond.chunks.splice(withRest ? i - 1 : i, withRest ? 2 : 1);
      trimmed++;
    }
    if (done + sessionMinutes(s) > limit) { cond.chunks = []; trimmed = -1; }
    if (trimmed) {
      renumber(cond.chunks);
      blocked.push(trimmed < 0
        ? `Volumul săptămânii ar trece de +20% față de referință (${Math.round(ref)} min): azi fără condiționare.`
        : `Volumul săptămânii ar trece de +20% față de referință (${Math.round(ref)} min): ${trimmed} ${trimmed === 1 ? 'rundă scoasă' : 'runde scoase'}.`);
    }
  }
  s.notes.push(...blocked);
  return { session: s, blocked };
}

/** O valoare nouă de progresie (minute, reprize) față de săptămâna dinainte: cel mult +20%. */
export function progressionAllowed(prev: number, next: number): boolean {
  return prev <= 0 || next <= prev * (1 + PROGRESSION.maxWeeklyVolumeIncrease) + 1e-9;
}
