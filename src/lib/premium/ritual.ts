/* Ritualul săptămânal al squad-ului: o sesiune audio ghidată de 12 minute care pornește la aceeași oră pentru toți.
   Fără server: fiecare telefon calculează din ceas unde a ajuns ritualul, deci cine intră mai târziu aude același pas. */
import type { RitualTime } from './squad.ts';

export interface RitualStep { l: string; s: string; d: number; k: 'work' | 'rest' }
export const RITUAL: readonly RitualStep[] = [
  { l: 'Respirație împreună', s: 'Inspiră 4, ține 4, expiră 4, ține 4', d: 120, k: 'work' },
  { l: 'Shadow ușor', s: 'Doar jab și mișcare, relaxat', d: 180, k: 'work' },
  { l: 'Mobilitate', s: 'Umeri, șolduri, glezne', d: 180, k: 'work' },
  { l: 'Shadow cu reacție', s: 'Sus: eschivă · Jos: corp · Stânga, dreapta: pas lateral', d: 120, k: 'work' },
  { l: 'Intenția săptămânii', s: 'Un singur lucru pe care îl lucrezi săptămâna asta', d: 120, k: 'rest' },
];
export const RITUAL_SEC = RITUAL.reduce((a, s) => a + s.d, 0);

/** Începutul ritualului din săptămâna lui `now` (day: 0 = luni). */
function startOfWeekRitual(r: RitualTime, now: Date): Date {
  const d = new Date(now);
  d.setHours(r.hour, r.minute, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + r.day);
  return d;
}

export interface RitualState { live: boolean; offsetSec: number; start: Date; startsInSec: number }

/** Ritualul e în desfășurare (live) sau când începe următorul. */
export function ritualState(r: RitualTime, now = new Date()): RitualState {
  let start = startOfWeekRitual(r, now);
  const el = (now.getTime() - start.getTime()) / 1000;
  if (el >= 0 && el < RITUAL_SEC) return { live: true, offsetSec: Math.floor(el), start, startsInSec: 0 };
  if (el >= RITUAL_SEC) start = new Date(start.getTime() + 7 * 86_400_000);
  return { live: false, offsetSec: 0, start, startsInSec: Math.round((start.getTime() - now.getTime()) / 1000) };
}

/** Pașii rămași de la secunda `offset` (primul pas, scurtat). */
export function stepsFrom(offset: number): RitualStep[] {
  const out: RitualStep[] = [];
  let t = 0;
  for (const s of RITUAL) {
    if (offset < t + s.d) out.push(offset > t ? { ...s, d: t + s.d - offset } : s);
    t += s.d;
  }
  return out;
}
