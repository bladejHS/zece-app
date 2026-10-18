/* Nutriția periodizată: ținta zilei urmează tipul zilei de antrenament (intensă, moderată, odihnă, deload),
   cu ajustări după check-in și praguri sigure care nu se pot coborî. */
import { KCAL_FLOOR, type Sex } from '../coach/guardrails.ts';

export type DayType = 'high' | 'moderate' | 'rest' | 'deload';
export const DAY_LABEL: Record<DayType, string> = { high: 'Zi intensă', moderate: 'Zi moderată', rest: 'Zi de odihnă', deload: 'Zi de deload' };

export interface Macros { kcal: number; p: number; c: number; f: number }

export interface NutritionPlan extends Macros {
  dayType: DayType;
  base: Macros;
  /** Ce s-a schimbat față de baza zilei și de ce. */
  notes: string[];
  /** Ținta a fost ridicată la pragul sigur. */
  floorApplied: boolean;
}

export interface PeriodizeInput {
  base: Macros;
  dayType: DayType;
  sex: Sex;
  weightKg: number;
  /** Necesarul (estimat sau măsurat), pentru limita de deficit. */
  tdee: number;
  /** În faza de deficit. */
  cut: boolean;
  /** Energia din check-in, 1–5 (dacă există azi). */
  energy?: number;
  /** Readiness 0–100 (dacă există). */
  readiness?: number;
  /** RPE-ul ultimei sesiuni, 1–10. */
  lastRpe?: number;
}

/** Cât se schimbă carbohidrații pe tip de zi (proteina rămâne constantă). */
export const CARB_FACTOR: Record<DayType, number> = { high: 1.2, moderate: 1, rest: 0.8, deload: 0.9 };
/** Deficitul nu trece de 25% din necesar. */
export const MAX_DEFICIT = 0.25;
const PROTEIN_MIN_G_PER_KG = 1.6;
const FAT_MIN_G_PER_KG = 0.6;

const r5 = (n: number): number => Math.round(n / 5) * 5;

export function periodize(i: PeriodizeInput): NutritionPlan {
  const notes: string[] = [];
  const kg = Math.max(35, i.weightKg);
  let p = Math.max(i.base.p, Math.round(PROTEIN_MIN_G_PER_KG * kg));
  let f = Math.max(i.base.f, Math.round(FAT_MIN_G_PER_KG * kg));
  let c = Math.round(i.base.c * CARB_FACTOR[i.dayType]);
  if (i.dayType === 'high') notes.push('Zi intensă: +20% carbohidrați, pentru efort și refacerea glicogenului.');
  if (i.dayType === 'rest') notes.push('Zi de odihnă: −20% carbohidrați; proteina rămâne la fel.');
  if (i.dayType === 'deload') notes.push('Săptămână de deload: carbohidrați puțin mai puțini, proteina neschimbată.');

  const training = i.dayType !== 'rest';
  const tired = (i.energy != null && i.energy <= 2) || (i.readiness != null && i.readiness < 45);
  if (training && tired && i.cut) { c += 40; notes.push('Energie scăzută azi: deficitul scade cu ~150 kcal, din carbohidrați.'); }
  if ((i.lastRpe ?? 0) >= 8) { c = Math.round(c * 1.1); notes.push('Sesiunea trecută a fost foarte grea: +10% carbohidrați pentru recuperare.'); }

  let kcal = p * 4 + c * 4 + f * 9;
  let floorApplied = false;
  const minByDeficit = Math.round(i.tdee * (1 - MAX_DEFICIT));
  const floor = Math.max(KCAL_FLOOR[i.sex], i.cut ? minByDeficit : 0);
  if (kcal < floor) {
    c += Math.ceil((floor - kcal) / 4);
    kcal = p * 4 + c * 4 + f * 9;
    floorApplied = true;
    notes.push(kcal <= KCAL_FLOOR[i.sex] + 4
      ? `Ținta a fost ridicată la pragul sigur de ${KCAL_FLOOR[i.sex]} kcal pe zi.`
      : `Deficitul a fost limitat la ${Math.round(MAX_DEFICIT * 100)}% din necesar (${i.tdee} kcal).`);
  }
  return { kcal: r5(kcal), p, c: Math.max(0, c), f, dayType: i.dayType, base: i.base, notes, floorApplied };
}

/** Un aport propus (de utilizator sau de altcineva) e sub pragul sigur? */
export const belowFloor = (kcal: number, sex: Sex): boolean => kcal > 0 && kcal < KCAL_FLOOR[sex];
