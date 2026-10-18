/* Nutriția ZECE: plan periodizat pe tipul zilei, hidratare, suplimente pe niveluri, feedback pe mese și meal prep.
   Codul vechi (src/legacy) o folosește prin `NUTRI`. */
export { belowFloor, CARB_FACTOR, DAY_LABEL, MAX_DEFICIT, periodize, type DayType, type Macros, type NutritionPlan, type PeriodizeInput } from './plan.ts';
export { hydration, preWorkoutAlert, SWEAT_L_PER_H, type HydrationPlan, type Intensity } from './hydration.ts';
export { BLOCKED, SUPPLEMENTS, tierOf, type Supplement, type Tier } from './supplements.ts';
export { mealFeedback, mealPrep, type Meal, type MealContext, type MealPrep } from './meals.ts';

/** Textul de avertizare medicală, acceptat o dată înainte de nutriție. */
export const DISCLAIMER = [
  'Țintele de calorii, macronutrienți, apă și suplimente din ZECE sunt estimări pentru oameni sănătoși care se antrenează. Nu sunt sfat medical și nu înlocuiesc un medic sau un nutriționist.',
  'Discută cu un medic înainte să schimbi alimentația dacă ai diabet, boli de inimă, rinichi sau tiroidă, tensiune mare, o tulburare de alimentație (acum sau în trecut), dacă ești însărcinată sau alăptezi, sau dacă iei medicamente.',
  'Aplicația nu propune niciodată un aport sub 1600 kcal pe zi pentru femei sau 2000 kcal pe zi pentru bărbați, un deficit mai mare de 25% din necesar sau suplimente fără dovezi de siguranță.',
  'Oprește-te și cere ajutor medical dacă ai amețeli, leșin, palpitații sau slăbiciune neobișnuită.',
] as const;
