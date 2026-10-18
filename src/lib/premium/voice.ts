/* Vocea dinamică și semnalele fără cuvinte: tempo-ul și tonul vocii urmează faza, intensitatea și RPE-ul,
   iar schimbările de fază, respirația și ritmul se aud și fără să te uiți la ecran. */

export interface VoiceStyle { rate: number; detune: number }

export interface VoiceCtx {
  phase?: string;
  kind?: 'work' | 'rest' | 'prep' | 'breath' | 'manual';
  /** RPE țintă al bucății, 1–10. */
  intensity?: number;
  /** Ultimul feedback dat pe rundă. */
  feel?: string;
  /** Secunde rămase din bucată. */
  left?: number;
}

/** Calm la repaus și revenire, ferm la efort, mai alert în ultimele 10 secunde; mai blând dacă runda a fost „la limită". */
export function voiceStyle(c: VoiceCtx): VoiceStyle {
  let rate = 1, detune = 0;
  if (c.kind === 'rest' || c.kind === 'breath' || c.phase === 'cooldown') { rate = 0.92; detune = -60; }
  else if (c.kind === 'work' && (c.intensity ?? 5) >= 7) { rate = 1.05; detune = 25; }
  if (c.kind === 'work' && c.left != null && c.left <= 10) { rate = Math.max(rate, 1.1); detune = Math.max(detune, 40); }
  if (c.feel === 'max') { rate = Math.min(rate, 0.97); detune = Math.min(detune, 0); }
  else if (c.feel === 'easy' && c.kind === 'work') { rate = Math.max(rate, 1.06); }
  return { rate, detune };
}

/** Un semnal: [secunde de la acum, frecvență, durată, volum]. */
export type Cue = [number, number, number, number];

/** Semnalele fără cuvinte pentru o bucată: intrarea în fază (urcă la efort, coboară la repaus), respirația 4-4 și metronomul de tehnică. */
export function nonVerbalCues(c: { kind: string; phase?: string; label?: string; durationSec: number }): Cue[] {
  const out: Cue[] = [];
  if (c.kind === 'work') out.push([0, 523, 0.08, 0.12], [0.1, 659, 0.08, 0.12], [0.2, 784, 0.12, 0.14]);
  else if (c.kind === 'rest') out.push([0, 659, 0.1, 0.1], [0.14, 494, 0.16, 0.1]);
  if (/respira/i.test(c.label ?? '')) {
    for (let t = 1; t < c.durationSec - 1; t += 8) out.push([t, 392, 0.5, 0.05], [t + 4, 294, 0.6, 0.05]);
  } else if (c.phase === 'technique' && c.kind === 'work') {
    for (let t = 2; t < c.durationSec - 2; t += 1.5) out.push([t, 1200, 0.03, 0.025]);
  }
  return out;
}
