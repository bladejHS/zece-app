/* Construirea unei sesiuni de sporturi de contact în 4 faze: activare → tehnică → condiționare → revenire.
   Fiecare sesiune are și o componentă cognitivă (reacție, decizie, memorare), nu doar efort fizic. */
import type { Injury } from '../coach/guardrails.ts';
import { combatRatio, snapRest } from './ratios.ts';
import { isDeloadWeek, deloadRounds } from './deload.ts';
import {
  PROGRESSION, type AdaptationRule, type CombatRatio, type Discipline, type Load, type PhaseBlock, type PhaseName,
  type WorkoutChunk, type WorkoutSession,
} from './types.ts';

export interface BuildOptions {
  discipline: Discipline;
  /** Formatul principal (condiționarea). */
  rounds: number;
  workSec: number;
  restSec: number;
  level: 1 | 2 | 3;
  kicks: boolean;
  /** Săptămâna din ciclul de 4 (1–4). */
  week: number;
  /** Deload automat în săptămâna a 4-a. */
  deloadAuto: boolean;
  /** Deload cerut din altă parte (HRV sub 90% din media pe 7 zile). */
  forceDeload?: boolean;
  injuries: readonly Injury[];
}

const TECH_ROUNDS = 2;
const TECH_WORK = 120;
const TECH_RATIO: CombatRatio = 2;

/* regulile de adaptare standard pentru fiecare tip de bucată (folosite de check-in, feedback și Offline Coach) */
const RULES_WORK: AdaptationRule[] = [
  { when: 'energyLow', action: 'shorten', amount: 30 },
  { when: 'rpeHigh', action: 'simplify', amount: 1 },
  { when: 'roundHard', action: 'shorten', amount: 15 },
  { when: 'roundEasy', action: 'lengthen', amount: 15 },
  { when: 'pain', action: 'noKicks' },
];
const RULES_EASY: AdaptationRule[] = [{ when: 'pain', action: 'simplify', amount: 1 }];

const DISCIPLINE_CALL: Record<Discipline, boolean> = { bag: true, pads: true, spar: false, shadow: true };
const DISCIPLINE_NAME: Record<Discipline, string> = { bag: 'Sac', pads: 'Palmare', spar: 'Sparring', shadow: 'Shadowboxing' };

export function buildCombatSession(o: BuildOptions): WorkoutSession {
  let n = 0;
  const id = (): string => `c${++n}`;
  const weekDeload = o.deloadAuto && isDeloadWeek(o.week);
  const deload = weekDeload || !!o.forceDeload;
  const lvl = o.level;
  const notes: string[] = [];
  const meta = { discipline: o.discipline };
  const chunk = (phase: PhaseName, kind: 'work' | 'rest', label: string, cue: string, durationSec: number, intensity: number, loads: Load[],
    extra: Partial<WorkoutChunk> = {}): WorkoutChunk => ({
    id: id(), phase, kind, label, cue, durationSec, intensity, complexity: lvl, loads, call: false, kicks: o.kicks, voxGroup: phase,
    adaptationRules: kind === 'work' && intensity >= 6 ? RULES_WORK : RULES_EASY, metadata: { ...meta }, ...extra,
  });

  const activation: PhaseBlock = { phase: 'activation', chunks: [
    chunk('activation', 'work', 'Coardă sau pași pe loc', 'Ritm ușor, pe vârfuri', 150, 3, ['footwork', 'impact']),
    chunk('activation', 'work', 'Mobilitate articulară', 'Gât, umeri, șolduri, glezne: lent, pe toată amplitudinea', 60, 2, ['mobility']),
    chunk('activation', 'work', 'Shadow cu reacție', 'Sus: eschivă · Jos: lovitură la corp · Stânga, dreapta: pas lateral', 120, 4, ['punches', 'footwork'],
      { cognitive: { kind: 'reaction', cue: 'Reacționezi la semnal: sus, jos, stânga, dreapta' } }),
  ] };

  const technique: PhaseBlock = { phase: 'technique', chunks: [] };
  for (let i = 1; i <= TECH_ROUNDS; i++) {
    technique.chunks.push(chunk('technique', 'work', `Tehnică · runda ${i}/${TECH_ROUNDS}`, 'Combinația strigată, apoi alegi singur ieșirea: pas lateral sau eschivă',
      TECH_WORK, 5, o.kicks ? ['punches', 'kicks', 'footwork'] : ['punches', 'footwork'],
      { call: o.discipline !== 'spar', cognitive: { kind: 'decision', cue: 'După fiecare combinație alegi ieșirea' }, metadata: { ...meta, round: i, rounds: TECH_ROUNDS, ratio: TECH_RATIO } }));
    if (i < TECH_ROUNDS) technique.chunks.push(chunk('technique', 'rest', 'Pauză', 'Respiră pe nas, gardă jos', Math.round(TECH_WORK / TECH_RATIO), 1, ['breath']));
  }

  /* condiționarea: formatul ales, cu pauza adusă la un raport de contact dacă e nevoie */
  let rest = o.restSec;
  let ratio = combatRatio(o.workSec, o.restSec);
  if (o.rounds > 1 && !ratio) {
    const s = snapRest(o.workSec, o.restSec);
    rest = s.rest; ratio = s.ratio;
    notes.push(`Pauza a devenit ${rest} s: raportul rundă:pauză rămâne ${ratio}:1, ca în sporturile de contact (nu 1:1 sau Tabata).`);
  }
  let rounds = Math.max(1, Math.round(o.rounds));
  if (deload) {
    const r = deloadRounds(rounds);
    notes.push(weekDeload
      ? `Săptămâna ${o.week} e de deload: ${r} runde în loc de ${rounds} (volum −${Math.round(PROGRESSION.deloadVolumeCut * 100)}%), aceeași frecvență.`
      : `HRV-ul de azi e sub 90% din media ta pe 7 zile: deload forțat, ${r} runde în loc de ${rounds}.`);
    rounds = r;
  }
  const conditioning: PhaseBlock = { phase: 'conditioning', chunks: [] };
  for (let i = 1; i <= rounds; i++) {
    conditioning.chunks.push(chunk('conditioning', 'work', `${DISCIPLINE_NAME[o.discipline]} · runda ${i}/${rounds}`, i === rounds && rounds > 1 ? 'Ultima rundă: ritm constant până la clopot' : 'Ritm de meci, revii în gardă după fiecare combinație',
      o.workSec, deload ? 6 : 7, o.kicks ? ['punches', 'kicks', 'impact'] : ['punches', 'impact'],
      { call: DISCIPLINE_CALL[o.discipline], metadata: { ...meta, round: i, rounds, ...(ratio ? { ratio } : {}), deload } }));
    if (i < rounds && rest > 0) conditioning.chunks.push(chunk('conditioning', 'rest', 'Pauză', `Urmează runda ${i + 1}`, rest, 1, ['breath']));
  }

  const cooldown: PhaseBlock = { phase: 'cooldown', chunks: [
    chunk('cooldown', 'work', 'Respirație 4-4', 'Inspiră 4 secunde, expiră 4 secunde', 90, 1, ['breath']),
    chunk('cooldown', 'work', 'Întinderi', 'Umeri, piept, șolduri, gambe', 150, 1, ['mobility']),
    chunk('cooldown', 'work', 'Memorare', 'Spune din memorie ultimele 3 combinații și unde ai greșit', 60, 1, ['breath'],
      { cognitive: { kind: 'memory', cue: 'Repeți din memorie combinațiile din sesiune' } }),
  ] };

  return {
    id: `s-${o.discipline}-${o.week}`, discipline: o.discipline, week: o.week, deload,
    phases: [activation, technique, conditioning, cooldown], progressionRules: PROGRESSION, notes,
  };
}

export const allChunks = (s: WorkoutSession): WorkoutChunk[] => s.phases.flatMap((p) => p.chunks);
export const sessionMinutes = (s: WorkoutSession): number => Math.round(allChunks(s).reduce((a, c) => a + c.durationSec, 0) / 60);
/** Sesiune intensă = are condiționare cu RPE ≥ 7. */
export const isIntense = (s: WorkoutSession): boolean => allChunks(s).some((c) => c.phase === 'conditioning' && c.kind === 'work' && c.intensity >= 7);
/** Fiecare sesiune are cele 4 faze și cel puțin o sarcină cognitivă. */
export function checkStructure(s: WorkoutSession): string[] {
  const missing = (['activation', 'technique', 'cooldown'] as const).filter((p) => !s.phases.some((b) => b.phase === p && b.chunks.length));
  const out = missing.map((p) => `lipsește faza ${p}`);
  if (!allChunks(s).some((c) => c.cognitive)) out.push('lipsește componenta cognitivă');
  return out;
}
