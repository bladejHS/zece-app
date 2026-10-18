/* Vocea pe faze: ce fraze înregistrate aparțin fiecărei faze, ce lipsește și ce se preîncarcă înainte de o fază. */
import type { PhaseName, WorkoutSession } from './types.ts';

/** Fraza → fișier (src/data/vox-index.json). */
export type VoxIndex = Readonly<Record<string, string>>;

const PHASE_RX: Record<PhaseName, RegExp> = {
  activation: /încălzire|warm up|coardă|rotații|shadow ușor|mobiliz|ritm ușor|lejer|cardio ușor|gardă sus, respiră|pregătește|vocea e pornită|începem/,
  technique: /jab|teep|eschivă|blochează|apărare|contre|lucru la corp|mișcare|revenire în gardă|combinații|garda sus|low kick|middle kick|high kick|^(unu|doi|trei|patru|cinci|șase)\b/,
  conditioning: /rund|zece secunde|ultimele zece|ultimul|dă tot|dă-i|start|ține ritmul|putere|viteză|hai|fiecare secundă|jumătate|concentrare|gata pauza|pauză/,
  cooldown: /respir|inspiră|expiră|răcire|cool down|întinde|poziția copilului|pisică|porumbel|bravo|antrenament terminat|gata!|relaxează/,
};

/** Frazele care trebuie să existe pentru fiecare fază a unei sesiuni de contact (cele care lipsesc se spun cu vocea telefonului). */
export const REQUIRED: Record<PhaseName, readonly string[]> = {
  activation: ['încălzire pentru kickboxing', 'coardă sau sărituri pe loc', 'rotații: gât, umeri, șolduri, glezne', 'shadow cu reacție', 'sus', 'jos', 'stânga', 'dreapta'],
  technique: ['tehnică', 'combinația strigată, apoi alegi ieșirea', 'pas lateral', 'eschivă'],
  conditioning: ['runda unu din trei. gardă sus și dă-i', 'ultima rundă! dă tot ce ai', 'zece secunde! dă tot', 'pauză'],
  cooldown: ['răcire', 'respirație 4-4', 'întinderi', 'memorare', 'spune din memorie ultimele trei combinații'],
};

const keysOf = (ix: VoxIndex): string[] => Object.keys(ix).filter((k) => !/^[wnhf]:/.test(k));

export function phaseKeys(ix: VoxIndex, phase: PhaseName): string[] {
  return keysOf(ix).filter((k) => PHASE_RX[phase].test(k));
}

export interface PhaseCoverage { phase: PhaseName; phrases: number; missing: string[] }

/** Câte fraze are fiecare fază și ce fraze cerute lipsesc. */
export function coverage(ix: VoxIndex): PhaseCoverage[] {
  const has = new Set(Object.keys(ix));
  return (Object.keys(PHASE_RX) as PhaseName[]).map((phase) => ({
    phase, phrases: phaseKeys(ix, phase).length, missing: REQUIRED[phase].filter((r) => !has.has(r)),
  }));
}

/** Fișierele audio de preîncărcat pentru o fază (frazele fazei + cuvintele și numerele, folosite peste tot). */
export function preloadFiles(ix: VoxIndex, phase: PhaseName): string[] {
  const words = Object.keys(ix).filter((k) => /^[wnhf]:/.test(k));
  return [...new Set([...phaseKeys(ix, phase), ...words].map((k) => ix[k]).filter((f): f is string => !!f))];
}

/** Ordinea în care se preîncarcă fazele unei sesiuni (prima, apoi restul). */
export const sessionPhases = (s: WorkoutSession): PhaseName[] => s.phases.filter((p) => p.chunks.length).map((p) => p.phase);
