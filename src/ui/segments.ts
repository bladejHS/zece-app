/* Progres segmentat, ca un indicator de turație (nu bare colorate pline). Stiluri: .seg-g în src/styles/tactical.css. */

export type Tone = 'effort' | 'rest' | 'ok' | 'warn' | 'bad';

/** n segmente, primele round(f·n) aprinse. f între 0 și 1. */
export function segments(f: number, n = 20, tone: Tone = 'effort', label = ''): string {
  const on = Math.round(Math.min(1, Math.max(0, f)) * n);
  const cls = tone === 'effort' ? '' : ` ${tone}`;
  const aria = label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true"';
  return `<div class="seg-g${cls}"${aria}>${Array.from({ length: n }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('')}</div>`;
}
