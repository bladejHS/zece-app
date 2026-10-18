import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adjustNextRound, applyCheckIn } from './adapt.ts';
import { deloadCount, deloadMinutes, isDeloadWeek } from './deload.ts';
import { combatRatio, isCombatFormat, snapRest } from './ratios.ts';
import { allChunks, buildCombatSession, checkStructure, isIntense, type BuildOptions } from './session.ts';
import { intenseStreak, progressionAllowed, referenceMinutes, validateSession, type DayLoad } from './validator.ts';
import { coverage, preloadFiles } from './vox.ts';

const base: BuildOptions = { discipline: 'bag', rounds: 5, workSec: 180, restSec: 60, level: 2, kicks: true, week: 1, deloadAuto: true, injuries: [] };
const works = (s: ReturnType<typeof buildCombatSession>, phase: string) => s.phases.find((p) => p.phase === phase)!.chunks.filter((c) => c.kind === 'work');

test('rapoarte de contact: 3:1, 2:1, 5:1 da; Tabata și 1:1 nu', () => {
  assert.equal(combatRatio(180, 60), 3);
  assert.equal(combatRatio(120, 60), 2);
  assert.equal(combatRatio(50, 10), 5);
  assert.equal(combatRatio(20, 10), null); // Tabata
  assert.equal(combatRatio(30, 30), null);
  assert.equal(combatRatio(40, 20), null);
  assert.equal(isCombatFormat(8, 20, 10), false);
  assert.equal(isCombatFormat(1, 60, 0), true);
  assert.equal(isCombatFormat(10, 30, 30), false);
  assert.deepEqual(snapRest(30, 30), { rest: 5, ratio: 5 });
  assert.deepEqual(snapRest(120, 30), { rest: 40, ratio: 3 });
});

test('sesiunea are 4 faze și componentă cognitivă', () => {
  const s = buildCombatSession(base);
  assert.deepEqual(s.phases.map((p) => p.phase), ['activation', 'technique', 'conditioning', 'cooldown']);
  assert.deepEqual(checkStructure(s), []);
  assert.ok(allChunks(s).some((c) => c.cognitive?.kind === 'reaction'));
  assert.ok(allChunks(s).some((c) => c.cognitive?.kind === 'decision'));
  assert.ok(allChunks(s).some((c) => c.cognitive?.kind === 'memory'));
  assert.equal(works(s, 'conditioning').length, 5);
  assert.ok(isIntense(s));
});

test('formatul 1:1 primește pauza unui raport de contact', () => {
  const s = buildCombatSession({ ...base, rounds: 10, workSec: 30, restSec: 30 });
  const rest = s.phases[2]!.chunks.find((c) => c.kind === 'rest')!;
  assert.equal(rest.durationSec, 5);
  assert.match(s.notes.join(' '), /raportul/);
});

test('deload: săptămâna 4, volum −40%, aceeași frecvență', () => {
  assert.equal(isDeloadWeek(4), true);
  assert.equal(isDeloadWeek(3), false);
  assert.equal(deloadCount(5), 3);
  assert.equal(deloadCount(1), 1);
  assert.equal(deloadMinutes(50), 30);
  const s = buildCombatSession({ ...base, week: 4 });
  assert.equal(s.deload, true);
  assert.equal(works(s, 'conditioning').length, 3);
  assert.equal(buildCombatSession({ ...base, week: 4, deloadAuto: false }).deload, false);
});

test('check-in: oboseala scoate o rundă, durerea scoate zona, durerea mare oprește condiționarea', () => {
  const s = buildCombatSession(base);
  const tired = applyCheckIn(s, { energy: 2, sleep: 3, pain: [] });
  assert.equal(works(tired, 'conditioning').length, 4);
  assert.match(works(tired, 'conditioning').at(-1)!.label, /runda 4\/4/);
  const knee = applyCheckIn(s, { energy: 3, sleep: 3, pain: [{ area: 'genunchi', level: 5 }] });
  assert.ok(allChunks(knee).every((c) => !c.kicks && !c.loads.includes('impact')));
  const sh = applyCheckIn(s, { energy: 3, sleep: 3, pain: [{ area: 'umar', level: 5 }] });
  assert.ok(works(sh, 'conditioning').every((c) => !c.loads.includes('punches') && !c.call));
  const bad = applyCheckIn(s, { energy: 3, sleep: 3, pain: [{ area: 'lombar', level: 8 }] });
  assert.equal(works(bad, 'conditioning').length, 0);
  const fresh = applyCheckIn(s, { energy: 5, sleep: 5, lastRpe: 5, pain: [] });
  assert.ok(works(fresh, 'technique').every((c) => c.complexity === 3));
  assert.equal(works(fresh, 'conditioning').length, 5);
});

test('feedback pe rundă: greu scurtează următoarea runda, ușor o lungește (cel mult +20%)', () => {
  const cs = allChunks(buildCombatSession(base));
  const restIdx = cs.findIndex((c) => c.phase === 'conditioning' && c.kind === 'rest');
  const hard = adjustNextRound(cs, restIdx, { feel: 'hard' }, 180);
  assert.equal(hard.next!.durationSec, 165);
  assert.equal(hard.restAfter!.durationSec, 55);
  const max = adjustNextRound(cs, restIdx, { feel: 'max' }, 180);
  assert.equal(max.extendRest, 15);
  assert.equal(adjustNextRound(cs, restIdx, { feel: 'easy' }, 180).next!.durationSec, 195);
  const pain = adjustNextRound(cs, restIdx, { feel: 'ok', pain: 'glezna' }, 180);
  assert.equal(pain.next!.kicks, false);
});

const days = (from: string, n: number, f: (i: number) => Partial<DayLoad>): DayLoad[] =>
  Array.from({ length: n }, (_, i) => { const d = new Date(Date.parse(from) + i * 86_400_000).toISOString().slice(0, 10); return { date: d, minutes: 60, intense: true, ...f(i) }; });

test('validator: cel mult 7 zile intense la rând', () => {
  const h = days('2026-10-11', 7, () => ({}));
  assert.equal(intenseStreak(h, '2026-10-18'), 7);
  const v = validateSession(buildCombatSession(base), h, '2026-10-18', []);
  assert.equal(works(v.session, 'conditioning').length, 0);
  assert.equal(validateSession(buildCombatSession(base), h.slice(1), '2026-10-18', []).session.phases[2]!.chunks.length > 0, true);
});

test('validator: volumul săptămânii crește cu cel mult 20%', () => {
  /* săptămâna trecută: 3 × 60 = 180 min (referința); săptămâna asta deja 195 min, limita 216 → sesiunea de ~35 min se scurtează */
  const h = [...days('2026-10-05', 3, () => ({ intense: false })), ...days('2026-10-12', 3, () => ({ intense: false, minutes: 65 }))];
  assert.equal(referenceMinutes(h, '2026-10-15'), 180);
  const v = validateSession(buildCombatSession(base), h, '2026-10-15', []);
  const n = works(v.session, 'conditioning').length;
  assert.ok(n >= 1 && n < 5, String(n));
  assert.match(v.blocked.join(' '), /20%/);
  assert.equal(progressionAllowed(50, 60), true);
  assert.equal(progressionAllowed(50, 61), false);
});

test('validator: zonele accidentate declarate', () => {
  const v = validateSession(buildCombatSession(base), [], '2026-10-18', ['glezna']);
  assert.ok(allChunks(v.session).every((c) => !c.kicks));
});

test('vocea: acoperirea pe faze și preîncărcarea', () => {
  const ix = { 'încălzire pentru kickboxing': 'a.mp3', 'răcire': 'b.mp3', 'ultima rundă! dă tot ce ai': 'c.mp3', 'w:runda': 'd.mp3' };
  const cov = coverage(ix);
  assert.equal(cov.find((c) => c.phase === 'activation')!.phrases, 1);
  assert.ok(cov.find((c) => c.phase === 'cooldown')!.missing.includes('memorare'));
  assert.deepEqual(preloadFiles(ix, 'conditioning').sort(), ['c.mp3', 'd.mp3']);
});
