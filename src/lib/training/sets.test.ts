import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextVolSet, VOLUME_RULES, volumeTarget } from './sets.ts';

const PULL = VOLUME_RULES['Pull Up']!, PUSH = VOLUME_RULES['Push Ups']!;

test('Bodyweight: ținta crește după o sesiune reușită, rămâne altfel, deload ignorat', () => {
  assert.equal(volumeTarget(PULL, []).target, 60);
  assert.equal(volumeTarget(PUSH, []).target, 150);
  assert.equal(volumeTarget(PULL, [{ date: '2026-10-23', reps: [12, 10, 9, 8, 8, 7, 6], deload: false }]).target, 65);
  assert.equal(volumeTarget(PULL, [{ date: '2026-10-23', reps: [8, 7, 7, 6, 6, 6, 5, 5, 5, 5], deload: false }]).target, 60); // 60, dar în 10 serii
  assert.equal(volumeTarget(PULL, [{ date: '2026-10-23', reps: [10, 9, 8], deload: false }]).target, 60);
  const h = [{ date: '2026-10-23', reps: [12, 10, 10, 10, 10, 8], deload: false }, { date: '2026-11-13', reps: [8, 8, 8], deload: true }, { date: '2026-11-20', reps: [13, 11, 11, 10, 10, 10], deload: false }];
  const t = volumeTarget(PULL, h);
  assert.equal(t.target, 70); assert.equal(t.prevFirst, 13);
  assert.equal(volumeTarget(PUSH, [{ date: '2026-10-23', reps: [35, 30, 28, 25, 20, 15], deload: false }]).target, 160);
});

test('Bodyweight: seria următoare — prima din istoric, apoi ~90% din ultima, finalul adunat', () => {
  const a = nextVolSet(PULL, 60, [], null); assert.equal(a.reps, 10); assert.equal(a.remaining, 60);
  assert.equal(nextVolSet(PULL, 60, [], 14).reps, 12);
  const b = nextVolSet(PULL, 60, [12, 10], 14); assert.equal(b.reps, 9); assert.equal(b.remaining, 38);
  assert.equal(nextVolSet(PULL, 60, [12, 10, 9, 8, 8, 7, 4], null).reps, 2);
  assert.equal(nextVolSet(PULL, 60, [12, 6], null).restExtra, 30);
  assert.equal(nextVolSet(PUSH, 150, [40, 35, 30, 25, 20], null).done, true);
});
