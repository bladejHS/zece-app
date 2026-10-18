import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hydration, preWorkoutAlert } from './hydration.ts';
import { mealFeedback, mealPrep } from './meals.ts';
import { belowFloor, periodize, type PeriodizeInput } from './plan.ts';
import { tierOf } from './supplements.ts';

const base: PeriodizeInput = { base: { kcal: 2500, p: 180, c: 260, f: 70 }, dayType: 'moderate', sex: 'm', weightKg: 85, tdee: 2800, cut: true };

test('periodizare: carbohidrații urmează ziua, proteina rămâne', () => {
  const hi = periodize({ ...base, dayType: 'high' }), mo = periodize(base), re = periodize({ ...base, dayType: 'rest' });
  assert.equal(hi.c, 312); assert.equal(mo.c, 260); assert.equal(re.c, 208);
  assert.equal(hi.p, mo.p); assert.equal(re.p, mo.p);
  assert.ok(hi.kcal > mo.kcal && mo.kcal > re.kcal);
  assert.equal(periodize({ ...base, dayType: 'deload' }).c, 234);
});

test('check-in: energie scăzută micșorează deficitul, RPE mare adaugă carbohidrați', () => {
  assert.equal(periodize({ ...base, energy: 2 }).c, 300);
  assert.equal(periodize({ ...base, energy: 2, dayType: 'rest' }).c, 208);
  assert.equal(periodize({ ...base, lastRpe: 9 }).c, 286);
});

test('praguri sigure: 2000 kcal bărbați, 1600 femei, deficit cel mult 25%', () => {
  const low = periodize({ ...base, base: { kcal: 1500, p: 120, c: 120, f: 50 }, weightKg: 60, tdee: 2200 });
  assert.ok(low.kcal >= 2000); assert.equal(low.floorApplied, true);
  const f = periodize({ ...base, sex: 'f', base: { kcal: 1300, p: 100, c: 110, f: 40 }, weightKg: 55, tdee: 1900 });
  assert.ok(f.kcal >= 1600);
  const deep = periodize({ ...base, base: { kcal: 2100, p: 180, c: 150, f: 70 }, tdee: 3400 });
  assert.ok(deep.kcal >= 2550 - 5, String(deep.kcal));
  assert.equal(belowFloor(1500, 'f'), true); assert.equal(belowFloor(1700, 'f'), false);
});

test('hidratare: bază + pierderi, înainte/în timpul/după', () => {
  const h = hydration({ weightKg: 80, minutes: 60, intensity: 'high' });
  assert.equal(h.baseMl, 2800); assert.equal(h.lossMl, 1100); assert.equal(h.totalMl, 4200);
  assert.deepEqual(h.preMl, [400, 550]); assert.deepEqual(h.duringMlPerHour, [400, 800]); assert.equal(h.postMl, 1650);
  assert.equal(hydration({ weightKg: 80, minutes: 0, intensity: 'low' }).totalMl, 2800);
  assert.match(preWorkoutAlert(100, h) ?? '', /300 ml/);
  assert.equal(preWorkoutAlert(600, h), null);
});

test('suplimente: niveluri și blocări', () => {
  assert.equal(tierOf('Creatină monohidrat'), 1);
  assert.equal(tierOf('betaal'), 2);
  assert.equal(tierOf('fat burner extrem'), 3);
  assert.equal(tierOf('test booster'), 3);
  assert.equal(tierOf('ceai verde'), null);
});

test('feedback pe masă și meal prep', () => {
  const ctx = { dayType: 'high' as const, timing: 'post' as const, remaining: { kcal: 1200, p: 90 }, eatenKcal: 1500, sex: 'm' as const, hour: 13 };
  const fb = mealFeedback({ k: 400, p: 12, c: 20, g: 10 }, ctx);
  assert.ok(fb.some((x) => /proteină/.test(x)) && fb.some((x) => /glicogenul/.test(x)));
  assert.ok(mealFeedback({ k: 300, p: 20, c: 30, g: 10 }, { ...ctx, timing: 'other', hour: 21, eatenKcal: 1200 }).some((x) => /pragul sigur/.test(x)));
  const wk = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'].map((label, i) => ({ label, dayType: (i === 6 ? 'rest' : i % 2 ? 'high' : 'moderate') as 'rest' | 'high' | 'moderate' }));
  const mp = mealPrep(wk);
  assert.equal(mp.batches.length, 2); assert.equal(mp.days.length, 7);
  assert.match(mp.batches[0]!.what, /4 porții/);
});
