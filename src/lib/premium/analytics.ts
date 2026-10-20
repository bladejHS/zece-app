/* Analizele specifice FALCO:
   - Technical Efficiency Score: cât de curate sunt rundele, la ce complexitate, câte din cele planificate se termină;
   - Recovery Debt Index: datoria de recuperare acumulată (încărcare peste capacitate, cu somnul și HRV-ul ca factori);
   - Skill Progression Map: nivelul pe fiecare abilitate de luptă;
   - Nutrition-Training Sync: cât de bine se potrivește mâncarea cu tipul fiecărei zile. */

export interface TesSession { feels: string[]; cx: number; planned: number; done: number }

/** 0–100. Rundele curate cântăresc mai mult la complexitate mare. */
export function technicalEfficiency(sessions: readonly TesSession[]): number | null {
  const s = sessions.filter((x) => x.feels.length);
  if (!s.length) return null;
  const score = s.reduce((acc, x) => {
    const clean = x.feels.filter((f) => f === 'ok' || f === 'easy').length / x.feels.length;
    const cxW = 0.7 + 0.15 * Math.min(3, Math.max(1, x.cx));
    const completion = x.planned ? Math.min(1, x.done / x.planned) : 1;
    return acc + clean * cxW * (0.6 + 0.4 * completion);
  }, 0) / s.length;
  return Math.round(Math.min(1, score / 1.15) * 100);
}

export interface RecoveryDay { date: string; load: number; sleep?: number; hrvRatio?: number }

/** 0–100 (mai mare = mai multă datorie). Datoria scade cu 15% pe zi și crește cu încărcarea care depășește capacitatea. */
export function recoveryDebt(days: readonly RecoveryDay[]): { index: number; trend: number[] } {
  const ds = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-28);
  if (!ds.length) return { index: 0, trend: [] };
  const avg = ds.reduce((a, d) => a + d.load, 0) / ds.length || 1;
  let debt = 0;
  const trend: number[] = [];
  for (const d of ds) {
    const sleepF = d.sleep == null ? 1 : d.sleep >= 8 ? 1.15 : d.sleep >= 7 ? 1 : d.sleep >= 6 ? 0.85 : 0.7;
    const hrvF = d.hrvRatio == null ? 1 : Math.max(0.7, Math.min(1.15, d.hrvRatio));
    const capacity = avg * sleepF * hrvF;
    debt = Math.max(0, debt * 0.85 + d.load - capacity);
    trend.push(debt);
  }
  return { index: Math.round(Math.min(100, (debt / (avg * 3)) * 100)), trend: trend.map((v) => Math.round(Math.min(100, (v / (avg * 3)) * 100))) };
}

export interface Skill { id: string; name: string; level: number }

export interface SkillInput {
  /** Sesiuni pe activitate (bag, pads, spar, shadow). */
  byActivity: Record<string, number>;
  /** Complexitatea medie a combinațiilor din sesiunile structurate (1–3). */
  cx: number;
  /** Runde curate din total (0–1). */
  cleanShare: number;
  /** Sarcini cognitive făcute. */
  cognitive: number;
  /** Sesiuni cu lovituri de picior. */
  kicks: number;
  /** Ținte atinse pe activitate. */
  targets: Record<string, number>;
}

/** Fiecare abilitate 0–100, din volum de practică calitativă și ținte. */
export function skillMap(i: SkillInput): Skill[] {
  const lv = (v: number, goal: number): number => Math.round(Math.min(1, v / goal) * 100);
  return [
    { id: 'power', name: 'Putere la sac', level: lv((i.byActivity['bag'] ?? 0) + 2 * (i.targets['bag'] ?? 0), 24) },
    { id: 'precision', name: 'Precizie la palmare', level: lv((i.byActivity['pads'] ?? 0) + 2 * (i.targets['pads'] ?? 0), 20) },
    { id: 'combos', name: 'Combinații', level: Math.round(((i.cx - 1) / 2) * 60 + i.cleanShare * 40) },
    { id: 'kicks', name: 'Lovituri de picior', level: lv(i.kicks, 20) },
    { id: 'ring', name: 'Ring (sparring)', level: lv((i.byActivity['spar'] ?? 0) + 2 * (i.targets['spar'] ?? 0), 16) },
    { id: 'mind', name: 'Reacție și decizie', level: lv(i.cognitive, 40) },
  ].map((s) => ({ ...s, level: Math.max(0, Math.min(100, s.level)) }));
}

export interface SyncDay { dayType: 'high' | 'moderate' | 'rest' | 'deload'; kcal: number; kcalT: number; c: number; cT: number; p: number; pT: number; water: number; waterT: number }

/** 0–100: calorii aproape de țintă, carbohidrații urmează ziua, proteina atinsă, apa atinsă. Doar zilele cu mese notate. */
export function nutritionSync(days: readonly SyncDay[]): number | null {
  const ds = days.filter((d) => d.kcal > 0);
  if (ds.length < 3) return null;
  const s = ds.reduce((acc, d) => {
    const kc = 1 - Math.min(1, Math.abs(d.kcal - d.kcalT) / (d.kcalT * 0.2));
    const cb = d.cT ? 1 - Math.min(1, Math.abs(d.c - d.cT) / (d.cT * 0.3)) : 1;
    const pr = Math.min(1, d.p / (d.pT * 0.9));
    const wa = d.waterT ? Math.min(1, d.water / d.waterT) : 1;
    return acc + 0.3 * kc + 0.25 * cb + 0.3 * pr + 0.15 * wa;
  }, 0) / ds.length;
  return Math.round(s * 100);
}
