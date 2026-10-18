/* Adaptarea sesiunii: înainte (check-in: energie, somn, RPE, dureri) și în timpul ei (feedback după fiecare rundă).
   Regulile sunt locale și deterministe: merg fără internet și sunt aceleași pe care le folosește Offline Coach. */
import { INJURIES, type Injury } from '../coach/guardrails.ts';
import { restFor } from './ratios.ts';
import { allChunks } from './session.ts';
import type { CheckIn, Load, RoundFeedback, WorkoutChunk, WorkoutSession } from './types.ts';

/** Ce încarcă fiecare zonă: la durere, aceste solicitări se scot. */
export const AREA_LOADS: Record<Injury, Load[]> = {
  umar: ['punches'], cot: ['punches'], incheietura: ['punches'],
  gat: ['impact'], lombar: ['kicks', 'impact'], sold: ['kicks'], genunchi: ['kicks', 'impact'], glezna: ['kicks', 'impact'],
};

const clampLvl = (n: number): 1 | 2 | 3 => (n <= 1 ? 1 : n >= 3 ? 3 : 2);
const clone = (s: WorkoutSession): WorkoutSession => structuredClone(s);

/** Scoate dintr-o bucată solicitările zonei; bucata rămâne, cu indicații fără zona respectivă. */
export function protectArea(c: WorkoutChunk, area: Injury): void {
  const bad = AREA_LOADS[area];
  if (bad.includes('kicks')) c.kicks = false;
  if (bad.includes('impact') && c.loads.includes('impact')) {
    c.loads = c.loads.filter((l) => l !== 'impact');
    if (c.label === 'Coardă sau pași pe loc') { c.label = 'Pași pe loc, fără sărituri'; c.cue = 'Pași mici, fără impact'; }
  }
  if (bad.includes('punches') && c.loads.includes('punches')) {
    c.loads = c.loads.filter((l) => l !== 'punches');
    c.call = false;
    if (c.kind === 'work' && c.phase !== 'cooldown') c.cue = c.kicks ? 'Doar lovituri de picior și mișcare, brațele în gardă' : 'Doar mișcare și eschive, fără lovituri cu brațele';
  }
  c.loads = c.loads.filter((l) => !bad.includes(l) || l === 'footwork');
}

function dropConditioningRound(s: WorkoutSession): boolean {
  const cond = s.phases.find((p) => p.phase === 'conditioning');
  if (!cond) return false;
  const works = cond.chunks.filter((c) => c.kind === 'work');
  if (works.length <= 1) return false;
  const last = works[works.length - 1] as WorkoutChunk;
  const i = cond.chunks.indexOf(last);
  cond.chunks.splice(i - (cond.chunks[i - 1]?.kind === 'rest' ? 1 : 0), cond.chunks[i - 1]?.kind === 'rest' ? 2 : 1);
  renumber(cond.chunks);
  return true;
}

/** După ce se scot runde, etichetele „runda i/n" rămân corecte. */
export function renumber(chunks: WorkoutChunk[]): void {
  const works = chunks.filter((c) => c.kind === 'work');
  works.forEach((c, i) => {
    c.label = c.label.replace(/runda \d+\/\d+/, `runda ${i + 1}/${works.length}`);
    c.metadata.round = i + 1; c.metadata.rounds = works.length;
  });
}

/** Check-in-ul de dinainte: modifică sesiunea curentă și explică fiecare schimbare. */
export function applyCheckIn(session: WorkoutSession, ci: CheckIn): WorkoutSession {
  const s = clone(session);
  const maxPain = Math.max(0, ...ci.pain.map((p) => p.level));
  if (maxPain >= 7) {
    const cond = s.phases.find((p) => p.phase === 'conditioning');
    if (cond) cond.chunks = [];
    allChunks(s).forEach((c) => { c.intensity = Math.min(c.intensity, 4); c.complexity = 1; });
    ci.pain.forEach((p) => allChunks(s).forEach((c) => protectArea(c, p.area)));
    s.notes.push('Durere puternică: azi doar activare, tehnică ușoară și revenire. Dacă durerea e ascuțită sau nu scade, oprește-te și mergi la medic.');
    return s;
  }
  for (const p of ci.pain.filter((x) => x.level >= 4)) {
    allChunks(s).forEach((c) => protectArea(c, p.area));
    s.notes.push(`Durere la ${INJURIES[p.area].toLowerCase()} (${p.level}/10): exercițiile care o solicită sunt scoase din sesiune.`);
  }
  const tired = ci.energy <= 2 || ci.sleep <= 2 || (ci.lastRpe ?? 0) >= 9;
  const fresh = ci.energy >= 4 && ci.sleep >= 4 && (ci.lastRpe ?? 6) <= 6;
  if (tired) {
    const dropped = dropConditioningRound(s);
    allChunks(s).forEach((c) => {
      if (c.phase === 'conditioning' && c.kind === 'work') c.intensity = Math.max(5, c.intensity - 1);
      if (c.phase !== 'activation') c.complexity = clampLvl(c.complexity - 1);
    });
    s.notes.push(`Oboseală (energie ${ci.energy}/5, somn ${ci.sleep}/5${ci.lastRpe ? `, RPE anterior ${ci.lastRpe}` : ''}): ${dropped ? 'o rundă mai puțin, ' : ''}intensitate și combinații cu o treaptă mai jos.`);
  } else if (fresh) {
    s.phases.find((p) => p.phase === 'technique')?.chunks.forEach((c) => { c.complexity = clampLvl(c.complexity + 1); });
    s.notes.push('Ești odihnit: combinațiile de tehnică sunt cu un nivel mai complexe. Volumul rămâne cel din plan.');
  }
  return s;
}

export interface NextRoundChange {
  /** Secunde adăugate pauzei care rulează acum. */
  extendRest: number;
  /** Indexul bucății de lucru modificate (în lista plată) și noua ei formă. */
  next?: { index: number; durationSec: number; complexity: 1 | 2 | 3; kicks: boolean; call: boolean; cue: string };
  /** Pauza de după runda următoare, recalculată după raport. */
  restAfter?: { index: number; durationSec: number };
  note: string;
}

/** Feedback-ul după o rundă (în pauză): ajustează runda următoare în timp real. `planned` = durata inițială a rundei. */
export function adjustNextRound(chunks: readonly WorkoutChunk[], restIndex: number, fb: RoundFeedback, planned: number): NextRoundChange {
  const j = chunks.findIndex((c, i) => i > restIndex && c.kind === 'work');
  if (j < 0) return { extendRest: 0, note: 'Ultima rundă a trecut.' };
  const nx = chunks[j] as WorkoutChunk;
  let d = nx.durationSec, cx = nx.complexity, kicks = nx.kicks, call = nx.call, cue = nx.cue, extendRest = 0;
  const notes: string[] = [];
  const minD = Math.max(45, Math.round(planned * 0.5)), maxD = Math.round(planned * 1.2);
  switch (fb.feel) {
    case 'max': d = Math.max(minD, d - 30); cx = clampLvl(cx - 1); extendRest = 15; notes.push('Runda următoare e mai scurtă și mai simplă, iar pauza de acum crește cu 15 s.'); break;
    case 'hard': d = Math.max(minD, d - 15); cx = clampLvl(cx - 1); notes.push('Runda următoare: 15 s mai scurtă, combinații mai simple.'); break;
    case 'easy': d = Math.min(maxD, d + 15); cx = clampLvl(cx + 1); notes.push('Runda următoare: 15 s mai lungă, combinații mai complexe.'); break;
    default: notes.push('Runda următoare rămâne la fel.');
  }
  if (fb.pain) {
    const tmp = structuredClone(nx); tmp.kicks = kicks; tmp.call = call; protectArea(tmp, fb.pain);
    kicks = tmp.kicks; call = tmp.call; cue = tmp.cue;
    notes.push('Zona dureroasă e scoasă din runda următoare.');
  }
  const out: NextRoundChange = { extendRest, next: { index: j, durationSec: d, complexity: cx, kicks, call, cue }, note: notes.join(' ') };
  const r = chunks[j + 1];
  if (r?.kind === 'rest' && nx.metadata.ratio) out.restAfter = { index: j + 1, durationSec: restFor(d, nx.metadata.ratio) };
  return out;
}
