import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nutritionSync, recoveryDebt, skillMap, technicalEfficiency } from './analytics.ts';
import { hrvStatus, parseHealthCsv } from './hrv.ts';
import { mastery, type MasteryInput } from './mastery.ts';
import { RITUAL_SEC, ritualState, stepsFrom } from './ritual.ts';
import * as squad from './squad.ts';
import { nonVerbalCues, voiceStyle } from './voice.ts';

test('HRV: deload forțat sub 90% din media pe 7 zile', () => {
  const pts = ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'].map((date) => ({ date, hrv: 60 }));
  assert.equal(hrvStatus([...pts, { date: '2026-10-18', hrv: 53 }], '2026-10-18').force, true);
  assert.equal(hrvStatus([...pts, { date: '2026-10-18', hrv: 55 }], '2026-10-18').force, false);
  assert.equal(hrvStatus([...pts.slice(0, 3), { date: '2026-10-18', hrv: 30 }], '2026-10-18').force, false); // prea puține zile
});

test('import CSV: Garmin și Apple, separatoare și formate diferite', () => {
  const g = parseHealthCsv('Date,Overnight HRV,Sleep Duration\n2026-10-16,58,7h 32m\n2026-10-17,61,6:45\n');
  assert.deepEqual(g, [{ date: '2026-10-16', hrv: 58, sleep: 7.5 }, { date: '2026-10-17', hrv: 61, sleep: 6.8 }]);
  const a = parseHealthCsv('Data;HRV (ms);Somn (min)\n17.10.2026;"44,5";452\n');
  assert.deepEqual(a, [{ date: '2026-10-17', hrv: 45, sleep: 7.5 }]);
  assert.deepEqual(parseHealthCsv('foo,bar\n1,2'), []);
});

const base: MasteryInput = { sessions: [], targetsHit: 0, sleep: [], deloadWeeks: [], ignoredHrv: 0, longStreaks: 0, maxEfforts: 0, restDaysHonored: 0 };

test('mastery: nivel din competență, penalizări pentru limite ignorate', () => {
  assert.equal(mastery(base).level, 1);
  const good = mastery({ ...base, sessions: Array.from({ length: 6 }, (_, i) => ({ date: `2026-10-0${i + 1}`, feels: ['ok', 'ok', 'easy', 'ok', 'ok'], cx: 3, cog: 4, deload: false })), targetsHit: 6, restDaysHonored: 8 });
  assert.ok(good.level >= 4, String(good.level));
  assert.ok(good.badges.find((b) => b.id === 't3')!.earned);
  const bad = mastery({ ...base, sessions: good.badges.length ? [] : [], ignoredHrv: 2, longStreaks: 1 });
  assert.equal(bad.points, 0);
  assert.equal(bad.penalties.length, 2);
});

test('analize: TES, datoria de recuperare, abilități, sincronizarea nutriției', () => {
  assert.equal(technicalEfficiency([]), null);
  const tes = technicalEfficiency([{ feels: ['ok', 'ok', 'hard', 'ok'], cx: 2, planned: 5, done: 5 }]);
  assert.ok(tes! > 50 && tes! < 90, String(tes));
  const calm = recoveryDebt(Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, load: 300, sleep: 8 })));
  const hard = recoveryDebt(Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, load: i > 9 ? 900 : 300, sleep: i > 9 ? 5.5 : 7 })));
  assert.equal(calm.index, 0); assert.ok(hard.index > 40, String(hard.index));
  const sk = skillMap({ byActivity: { bag: 12 }, cx: 2, cleanShare: 0.8, cognitive: 20, kicks: 10, targets: { bag: 2 } });
  assert.equal(sk.find((s) => s.id === 'power')!.level, 67);
  assert.equal(nutritionSync([]), null);
  const sync = nutritionSync(Array.from({ length: 5 }, () => ({ dayType: 'high' as const, kcal: 2600, kcalT: 2600, c: 300, cT: 300, p: 170, pT: 170, water: 3500, waterT: 3500 })));
  assert.equal(sync, 100);
});

test('squad: invitație, membri (max 5), criptare, provocarea săptămânii', async () => {
  const s = squad.createSquad('Sala 5', 'Andrei');
  s.me.gist = 'g0';
  const j = squad.joinSquad(squad.inviteCode(s), 'Ana');
  assert.ok(j && j.pass === s.pass && j.members.length === 1);
  j!.me.gist = 'g1';
  let cur = s;
  const add = squad.addMember(cur, squad.memberCode(j!)); assert.ok(add.ok); if (add.ok) cur = add.squad;
  assert.equal(squad.addMember(cur, squad.memberCode(j!)).ok, false);
  for (let i = 2; i < 5; i++) { const r = squad.addMember(cur, squad.memberCode({ ...j!, me: { name: 'M' + i, gist: 'g' + i } })); if (r.ok) cur = r.squad; }
  assert.equal(cur.members.length, 4);
  assert.equal(squad.addMember(cur, squad.memberCode({ ...j!, me: { name: 'X', gist: 'gx' } })).ok, false);
  const card: squad.SquadCard = { v: 1, name: 'Andrei', week: '2026-10-12', sessions: 3, minutes: 140, rounds: 18, sleepNights: 5, mobility: 1, level: 3, updated: 'x' };
  const sealed = await squad.seal(card, s.pass);
  assert.ok(!JSON.stringify(sealed).includes('Andrei'));
  assert.deepEqual(await squad.open(sealed, s.pass), card);
  await assert.rejects(squad.open(sealed, 'gresit'));
  const c = squad.weekChallenge('2026-10-12');
  assert.deepEqual(squad.challengeProgress(c, [card, card], 2).goal, c.perMember * 2);
});

test('ritual: sincronizat pe ceas, intrare târzie din mijloc', () => {
  const r = { day: 6, hour: 10, minute: 0 };
  const live = ritualState(r, new Date(2026, 9, 18, 10, 3, 30));
  assert.equal(live.live, true); assert.equal(live.offsetSec, 210);
  const steps = stepsFrom(210);
  assert.equal(steps[0]!.l, 'Shadow ușor'); assert.equal(steps[0]!.d, 90);
  assert.equal(steps.reduce((a, s) => a + s.d, 0), RITUAL_SEC - 210);
  const later = ritualState(r, new Date(2026, 9, 18, 11, 0, 0));
  assert.equal(later.live, false); assert.ok(later.startsInSec > 6 * 86400);
});

test('vocea: calmă la repaus, alertă la final, semnale fără cuvinte', () => {
  assert.ok(voiceStyle({ kind: 'rest' }).rate < 1);
  assert.ok(voiceStyle({ kind: 'work', intensity: 8, left: 5 }).rate >= 1.1);
  assert.ok(voiceStyle({ kind: 'work', intensity: 8, feel: 'max' }).rate < 1);
  assert.ok(nonVerbalCues({ kind: 'work', phase: 'technique', durationSec: 120 }).length > 50);
  assert.ok(nonVerbalCues({ kind: 'work', phase: 'cooldown', label: 'Respirație 4-4', durationSec: 90 }).some((c) => c[1] === 294));
});
