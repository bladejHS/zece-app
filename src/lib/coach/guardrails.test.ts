import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkImage, checkInput, checkOutput, exerciseConflict, gateStream, type GuardContext } from './guardrails.ts';

const M: GuardContext = { sex: 'm', injuries: [] };
const F: GuardContext = { sex: 'f', injuries: [] };
const code = (t: string, c: GuardContext = M): string | null => { const r = checkOutput(t, c); return r.ok ? null : r.code; };

test('răspunsurile obișnuite trec', () => {
  for (const t of [
    'Azi faci 4×8 la Bench Press cu 80 kg. Pauză 2 minute între serii.',
    'Ținta ta rămâne 2300 kcal pe zi și 160 g proteină.',
    'O masă de 650 kcal după antrenament e potrivită.',
    'Un deficit de 500 kcal pe zi e moderat.',
    'Creatina monohidrat, 3–5 g pe zi, are cele mai solide dovezi.',
    'Cafeaua are un efect diuretic ușor, dar nu te deshidratează.',
    'Antrenează-te 5 zile pe săptămână, cu 2 zile de odihnă.',
    'Nu te antrena 10 zile la rând fără pauză.',
  ]) assert.equal(code(t), null, t);
});

test('Tier 3: orice mențiune e oprită', () => {
  assert.equal(code('Poți încerca un test booster pe bază de tribulus.'), 'tier3');
  assert.equal(code('Un fat burner te-ar ajuta la definire.'), 'tier3');
  assert.equal(code('Arzătoarele de grăsimi nu merită.'), 'tier3');
  assert.equal(code('Prohormonii sunt riscanți.'), 'tier3');
  assert.equal(code('Unii folosesc SARMs.'), 'tier3');
  assert.equal(code('Diureticele înainte de cântar scad apa.'), 'tier3');
});

test('calorii sub prag, pe zi', () => {
  assert.equal(code('Coboară la 1800 kcal pe zi.', M), 'kcal');
  assert.equal(code('Coboară la 1800 kcal pe zi.', F), null);
  assert.equal(code('Ținta zilnică: 1.400 kcal.', F), 'kcal');
  assert.equal(code('Mergi pe un aport de 1200–1300 kcal zilnic.', F), 'kcal');
  assert.equal(code('Cina poate avea 900 kcal pe zi de antrenament.', M), null);
});

test('mai mult de 7 zile la rând', () => {
  assert.equal(code('Fă 10 zile la rând de antrenament intens.'), 'streak');
  assert.equal(code('Antrenează-te 7 zile pe săptămână.'), 'streak');
  assert.equal(code('Aleargă în fiecare zi, fără zi de odihnă.'), 'streak');
  assert.equal(code('Fă 6 zile la rând de antrenament, apoi odihnă.'), null);
});

test('exerciții pe zona accidentată', () => {
  const U: GuardContext = { sex: 'm', injuries: ['umar'] };
  assert.equal(code('Adaugă Push Press 4×5 vineri.', U), 'injury');
  assert.equal(code('Evită Push Press până trece umărul.', U), null);
  assert.equal(code('Adaugă Push Press 4×5 vineri.', M), null);
  assert.equal(exerciseConflict('Romanian Deadlift', ['lombar']), 'lombar');
  assert.equal(exerciseConflict('Leg Press', ['lombar']), null);
});

test('stream: doar propozițiile întregi verificate', () => {
  assert.deepEqual(gateStream('Bună. Fă 3 serii', M), { shown: 'Bună.', blocked: null });
  assert.equal(gateStream('Bună. Încearcă un fat burner. Apoi', M).blocked?.ok, false);
  assert.equal(gateStream('Fă 3 serii', M).shown, '');
});

test('intrări', () => {
  assert.equal(checkInput('  salut\u0007 ').ok, true);
  assert.equal(checkInput('   ').ok, false);
  assert.equal(checkInput('a'.repeat(4001)).ok, false);
  assert.equal(checkImage('QUJD', 'image/jpeg').ok, true);
  assert.equal(checkImage('QUJD', 'image/gif').ok, false);
  assert.equal(checkImage('not base64!', 'image/png').ok, false);
});
