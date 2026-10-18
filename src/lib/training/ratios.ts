/* Raportul rundă:pauză. În sporturile de contact: 3:1 (runda clasică, 3 min / 1 min), 2:1 (tehnic, putere), 5:1 (sprinturi scurte la sac).
   Nu Tabata sau HIIT generic (20/10, 30/30, 40/20): sub un minut de lucru, doar 5:1 (sprinturi scurte, pauză scurtă). */
import type { CombatRatio } from './types.ts';

export const COMBAT_RATIOS: readonly CombatRatio[] = [3, 2, 5];
const TOLERANCE = 0.08;
/** Sub atâtea secunde de lucru, runda e un sprint: doar 5:1. */
const SHORT_SEC = 60;

export const ratioOf = (workSec: number, restSec: number): number => (restSec > 0 ? workSec / restSec : Infinity);

/** Raportul combat cel mai apropiat de work/rest, sau null dacă nu e niciunul (în toleranță). O singură rundă fără pauză e validă. */
export function combatRatio(workSec: number, restSec: number): CombatRatio | null {
  if (restSec <= 0) return null;
  const r = ratioOf(workSec, restSec);
  const hit = COMBAT_RATIOS.find((c) => Math.abs(r - c) / c <= TOLERANCE) ?? null;
  return hit && (workSec >= SHORT_SEC || hit === 5) ? hit : null;
}

export function isCombatFormat(rounds: number, workSec: number, restSec: number): boolean {
  if (rounds <= 1 && restSec === 0) return true;
  return combatRatio(workSec, restSec) !== null;
}

/** Pauza (rotunjită la 5 s) pentru raportul combat cel mai apropiat de cel cerut. */
export function snapRest(workSec: number, restSec: number): { rest: number; ratio: CombatRatio } {
  const r = ratioOf(workSec, Math.max(1, restSec));
  /* cel mai apropiat raport; la egalitate, cel cu mai multă pauză */
  const ratio = workSec < SHORT_SEC ? 5 : ([...COMBAT_RATIOS].sort((a, b) => Math.abs(r - a) - Math.abs(r - b) || a - b)[0] as CombatRatio);
  return { rest: Math.max(5, Math.round(workSec / ratio / 5) * 5), ratio };
}

/** Pauza pentru un raport anume. */
export const restFor = (workSec: number, ratio: CombatRatio): number => Math.max(10, Math.round(workSec / ratio / 5) * 5);
