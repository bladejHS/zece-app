/* Modelul de antrenament ZECE: o sesiune are 4 faze obligatorii, fiecare făcută din bucăți (WorkoutChunk). */
import type { Injury } from '../coach/guardrails.ts';

export type PhaseName = 'activation' | 'technique' | 'conditioning' | 'cooldown';
export const PHASES: readonly PhaseName[] = ['activation', 'technique', 'conditioning', 'cooldown'];
export const PHASE_LABEL: Record<PhaseName, string> = {
  activation: 'Activare',
  technique: 'Tehnică',
  conditioning: 'Condiționare',
  cooldown: 'Revenire',
};

export type Discipline = 'bag' | 'pads' | 'spar' | 'shadow';

/** Raportul rundă:pauză din sporturile de contact. */
export type CombatRatio = 3 | 2 | 5;

/** Componenta cognitivă: reacție la semnal, decizie (alegi răspunsul), memorare (repeți secvența). */
export type CognitiveKind = 'reaction' | 'decision' | 'memory';
export interface CognitiveTask {
  kind: CognitiveKind;
  /** Ce face sportivul, pe scurt (se vede și se aude). */
  cue: string;
}

/** Ce solicită bucata: folosit la accidentări și la check-in. */
export type Load = 'punches' | 'kicks' | 'footwork' | 'impact' | 'core' | 'breath' | 'mobility';

/** O regulă de adaptare declarativă: dacă semnalul trece de prag, bucata se schimbă așa. */
export interface AdaptationRule {
  when: 'energyLow' | 'sleepLow' | 'rpeHigh' | 'pain' | 'roundHard' | 'roundEasy';
  action: 'shorten' | 'lengthen' | 'restMore' | 'simplify' | 'harder' | 'drop' | 'noKicks' | 'noPunches';
  /** Cât (secunde pentru durate, trepte pentru complexitate). */
  amount?: number;
}

export interface WorkoutChunk {
  id: string;
  phase: PhaseName;
  kind: 'work' | 'rest';
  label: string;
  cue: string;
  durationSec: number;
  /** Efortul țintă, RPE 1–10. */
  intensity: number;
  /** Complexitatea tehnică, 1–3 (nivelul combinațiilor). */
  complexity: 1 | 2 | 3;
  loads: Load[];
  cognitive?: CognitiveTask;
  /** Strigătorul de combinații pornit în bucata asta. */
  call: boolean;
  /** Lovituri de picior permise (strigătorul și indicațiile). */
  kicks: boolean;
  /** Grupul de fraze audio care se preîncarcă înainte de faza asta. */
  voxGroup: PhaseName;
  adaptationRules: AdaptationRule[];
  metadata: { discipline: Discipline; round?: number; rounds?: number; ratio?: CombatRatio; deload?: boolean };
}

export interface PhaseBlock {
  phase: PhaseName;
  chunks: WorkoutChunk[];
}

export interface ProgressionRules {
  /** Creșterea maximă de volum de la o săptămână la alta. */
  maxWeeklyVolumeIncrease: number;
  /** Săptămâna de deload din ciclu (1-based) și cât scade volumul. */
  deloadEvery: number;
  deloadVolumeCut: number;
  /** Intensitatea crește cu cel mult o treaptă RPE pe săptămână; complexitatea cu un nivel. */
  maxIntensityStep: number;
  maxComplexityStep: number;
  maxConsecutiveIntenseDays: number;
}

export const PROGRESSION: ProgressionRules = {
  maxWeeklyVolumeIncrease: 0.2,
  deloadEvery: 4,
  deloadVolumeCut: 0.4,
  maxIntensityStep: 1,
  maxComplexityStep: 1,
  maxConsecutiveIntenseDays: 7,
};

export interface WorkoutSession {
  id: string;
  discipline: Discipline;
  /** Săptămâna din ciclul de 4 (1–4). */
  week: number;
  deload: boolean;
  phases: PhaseBlock[];
  progressionRules: ProgressionRules;
  /** Ce s-a schimbat față de planul de bază și de ce (check-in, validare). */
  notes: string[];
}

export interface CheckIn {
  /** 1–5. */
  energy: number;
  /** 1–5. */
  sleep: number;
  /** RPE-ul ultimei sesiuni, 1–10 (dacă e cunoscut). */
  lastRpe?: number;
  pain: { area: Injury; level: number }[];
}

export type RoundFeel = 'easy' | 'ok' | 'hard' | 'max';
export interface RoundFeedback {
  feel: RoundFeel;
  pain?: Injury;
}
