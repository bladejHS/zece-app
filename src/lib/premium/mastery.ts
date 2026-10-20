/* Gamificare inversă: nu numărăm volumul, ci competența. Distincțiile vin din tehnică și recuperare făcute bine;
   nivelul crește din distincții, iar ignorarea limitelor de siguranță scade puncte. */

export interface MasteryInput {
  /** Sesiunile de kickboxing structurate: feedback pe runde, complexitate medie, cognitiv, deload. */
  sessions: { date: string; feels: string[]; cx: number; cog: number; deload: boolean }[];
  /** Ținte de kickboxing atinse. */
  targetsHit: number;
  /** Zile cu somn notat (ore). */
  sleep: { date: string; hours: number }[];
  /** Săptămânile de deload: dacă au fost respectate (fără zile cu RPE ≥ 8). */
  deloadWeeks: { respected: boolean }[];
  /** Zile intense în care HRV cerea deload. */
  ignoredHrv: number;
  /** Serii de peste 7 zile intense la rând. */
  longStreaks: number;
  /** Sesiuni la RPE 10 în ultimele 28 de zile. */
  maxEfforts: number;
  /** Zile de odihnă din plan făcute ca odihnă. */
  restDaysHonored: number;
}

export type Track = 'tech' | 'rec';
export interface Badge { id: string; track: Track; name: string; desc: string; earned: boolean; progress: number }
export interface Penalty { id: string; name: string; points: number; why: string }
export interface Mastery { level: number; points: number; next: number | null; badges: Badge[]; penalties: Penalty[] }

const LEVELS = [0, 40, 100, 180, 280, 400, 540, 700, 880, 1080];
export const LEVEL_NAMES = ['Începător', 'Novice', 'Ucenic', 'Luptător', 'Tehnician', 'Strateg', 'Avansat', 'Expert', 'Maestru', 'Falco'];

const frac = (v: number, goal: number): number => Math.max(0, Math.min(1, v / goal));

export function mastery(i: MasteryInput): Mastery {
  const rounds = i.sessions.flatMap((s) => s.feels);
  const clean = rounds.filter((f) => f === 'ok' || f === 'easy').length;
  const hiCx = i.sessions.filter((s) => s.cx >= 2.5 && s.feels.filter((f) => f === 'ok' || f === 'easy').length >= Math.ceil(s.feels.length * 0.7)).length;
  const cog = i.sessions.reduce((a, s) => a + s.cog, 0);
  let sleepStreak = 0, best = 0;
  for (const s of [...i.sleep].sort((a, b) => a.date.localeCompare(b.date))) { sleepStreak = s.hours >= 7 ? sleepStreak + 1 : 0; best = Math.max(best, sleepStreak); }
  const deloadOk = i.deloadWeeks.filter((w) => w.respected).length;

  const b = (id: string, track: Track, name: string, desc: string, v: number, goal: number, pts: number): Badge & { pts: number } =>
    ({ id, track, name, desc, earned: v >= goal, progress: frac(v, goal), pts });
  const all = [
    b('t1', 'tech', 'Primele faze', '3 sesiuni complete în 4 faze', i.sessions.length, 3, 30),
    b('t2', 'tech', 'Runde curate', '30 de runde notate „potrivit" sau „ușor"', clean, 30, 50),
    b('t3', 'tech', 'Combinații lungi', '5 sesiuni la nivelul greu, cu 70% runde curate', hiCx, 5, 80),
    b('t4', 'tech', 'Minte rapidă', '20 de sarcini cognitive (reacție, decizie, memorare)', cog, 20, 50),
    b('t5', 'tech', 'Ținte', '6 ținte de kickboxing atinse', i.targetsHit, 6, 70),
    b('r1', 'rec', 'Somn de luptător', '7 nopți la rând cu cel puțin 7 ore', best, 7, 60),
    b('r2', 'rec', 'Deload respectat', '2 săptămâni de deload fără zile foarte grele', deloadOk, 2, 80),
    b('r3', 'rec', 'Odihna face parte din plan', '8 zile de odihnă făcute ca odihnă', i.restDaysHonored, 8, 50),
    b('r4', 'rec', 'Ascultă corpul', '0 zile intense când HRV cerea deload (după 2 săptămâni de date)', i.sleep.length >= 14 && i.ignoredHrv === 0 ? 1 : 0, 1, 60),
  ];
  const penalties: Penalty[] = [];
  if (i.ignoredHrv) penalties.push({ id: 'hrv', name: 'HRV ignorat', points: 25 * i.ignoredHrv, why: `${i.ignoredHrv} ${i.ignoredHrv === 1 ? 'zi intensă' : 'zile intense'} când HRV-ul cerea deload` });
  if (i.longStreaks) penalties.push({ id: 'streak', name: 'Fără zi de odihnă', points: 40 * i.longStreaks, why: 'mai mult de 7 zile intense la rând' });
  if (i.maxEfforts > 2) penalties.push({ id: 'max', name: 'Prea des la maxim', points: 10 * (i.maxEfforts - 2), why: `${i.maxEfforts} sesiuni la RPE 10 în 4 săptămâni` });
  const skipped = i.deloadWeeks.filter((w) => !w.respected).length;
  if (skipped) penalties.push({ id: 'deload', name: 'Deload sărit', points: 30 * skipped, why: `${skipped} ${skipped === 1 ? 'săptămână' : 'săptămâni'} de deload cu zile foarte grele` });

  const points = Math.max(0, all.reduce((a, x) => a + (x.earned ? x.pts : Math.round(x.pts * x.progress * 0.5)), 0) - penalties.reduce((a, p) => a + p.points, 0));
  let level = 1;
  LEVELS.forEach((t, k) => { if (points >= t) level = k + 1; });
  return { level, points, next: LEVELS[level] ?? null, badges: all.map(({ pts: _p, ...x }) => x), penalties };
}
