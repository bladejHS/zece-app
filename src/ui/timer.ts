/* Cadranul cronometrului: 48 de segmente pe un arc de 270°, ca un indicator de turație.
   Se desenează o dată (gauge) și se actualizează doar clasele (setGauge) — fără re-randare la fiecare cadru. */

const N = 48;
const SWEEP = 270;
const START = -225; /* grade, de la ora 7:30 la 4:30, prin sus */

/** SVG-ul cadranului (viewBox 300×300), pus peste inelul existent. */
export function gauge(id = 'tmGauge'): string {
  const segs: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = ((START + (i + 0.5) * (SWEEP / N)) * Math.PI) / 180;
    const major = i % 4 === 0;
    const r1 = major ? 112 : 116, r2 = 138, w = major ? 3.2 : 2.4;
    const cx = 150 + Math.cos(a) * ((r1 + r2) / 2), cy = 150 + Math.sin(a) * ((r1 + r2) / 2);
    const deg = (a * 180) / Math.PI + 90;
    segs.push(`<rect class="sg" x="${(cx - w / 2).toFixed(2)}" y="${(cy - (r2 - r1) / 2).toFixed(2)}" width="${w}" height="${r2 - r1}" rx=".6" transform="rotate(${deg.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)})"/>`);
  }
  return `<svg class="gauge" id="${id}" viewBox="0 0 300 300" aria-hidden="true">${segs.join('')}</svg>`;
}

const lit = new WeakMap<Element, number>();

/** Aprinde segmentele până la fracția f (0…1). `hot` evidențiază ultimul segment aprins (ultimele secunde). */
export function setGauge(el: Element | null, f: number, hot = false): void {
  if (!el) return;
  const n = Math.round(Math.min(1, Math.max(0, f)) * N);
  const key = n * 2 + (hot ? 1 : 0);
  if (lit.get(el) === key) return;
  lit.set(el, key);
  const segs = el.children;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i] as Element;
    s.classList.toggle('on', i < n);
    s.classList.toggle('hot', hot && i === n - 1);
  }
}

/** Ultimele 3 secunde: puls pe cifre, flash pe ecran, vibrație scurtă — o dată pe secundă. */
export function countdownCue(timeEl: Element | null, flashEl: Element | null, secLeft: number, vibrate: (p: number | number[]) => void): void {
  if (!timeEl) return;
  const s = Math.ceil(secLeft);
  const prev = Number((timeEl as HTMLElement).dataset['cue'] ?? '-1');
  if (s === prev) return;
  (timeEl as HTMLElement).dataset['cue'] = String(s);
  if (s < 1 || s > 3) return;
  timeEl.classList.remove('hot'); void (timeEl as HTMLElement).offsetWidth; timeEl.classList.add('hot');
  if (flashEl) { flashEl.classList.remove('go'); void (flashEl as HTMLElement).offsetWidth; flashEl.classList.add('go'); }
  vibrate(s === 1 ? [60] : [30]);
}

/** Trecerea între runde: obturatorul cu numele fazei următoare. */
export function shutter(label: string, rest: boolean): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.createElement('div');
  el.className = `tm-shutter${rest ? ' rest' : ''}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i></i><i></i><b></b>`;
  (el.querySelector('b') as HTMLElement).textContent = label;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 480);
}
