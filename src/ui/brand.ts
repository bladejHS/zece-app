/* FALCO — identitatea vizuală.
   Semnul: trei rândunici în zbor, urcând în diagonală spre dreapta (libertate, puritate, zbor).
   Silueta e una singură, desenată din curbe: cap mic, aripi lungi în formă de seceră, coada bifurcată cu fire lungi.
   Coordonatele siluetei: corpul pe axa x (capul spre +x), aripile simetrice față de y = 0. */

export const BRAND = {
  name: 'FALCO',
  sub: 'Forță · anduranță',
  motto: 'Libertatea de a zbura',
  tagline: 'Antrenament de contact și hibrid, cu datele tale reale.',
} as const;

/** Corpul: capul, trunchiul și coada bifurcată. */
export const SWALLOW_BODY =
  'M26 0C25-3.4 21-5.8 16-6.2C12-6.6 8-7.6 4-7.6C-4-7.4-14-5-22-3C-33-6.5-43-12-54-18C-45-9-37-3-30 0C-37 3-45 9-54 18C-43 12-33 6.5-22 3C-14 5-4 7.4 4 7.6C8 7.6 12 6.6 16 6.2C21 5.8 25 3.4 26 0Z';
/** Aripile, ca seceri trase spre spate (aceeași orientare ca a corpului, ca să nu apară goluri la suprapunere). */
export const SWALLOW_WINGS =
  'M8-7C13-20 4-36-26-48C-9-37-2-22-5-7ZM-5 7C-2 22-9 37-26 48C4 36 13 20 8 7Z';
export const SWALLOW = SWALLOW_BODY + SWALLOW_WINGS;

/** Formația semnului (viewBox 100×100): [x, y, rotație °, scară]. Prima e rândunica din față. */
export const FLOCK: ReadonlyArray<readonly [number, number, number, number]> = [
  [71, 42, -22, 0.54],
  [38, 68, -16, 0.36],
  [35, 31, -28, 0.27],
];

export interface LogoOptions {
  /** Clase CSS pe <svg>. */
  cls?: string;
  /** Păstrat pentru compatibilitate: semnul nu mai are detalii care se ascund la dimensiuni mici. */
  ticks?: boolean;
}

/** Semnul FALCO ca SVG inline (viewBox 100×100), în culoarea textului (currentColor). */
export function logoSvg({ cls = '' }: LogoOptions = {}): string {
  const birds = FLOCK.map(([x, y, r, s]) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="${SWALLOW}"/>`).join('');
  return `<svg class="${cls}" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">${birds}</svg>`;
}

/** Iconița aplicației (pătrat negru, sigur pentru „maskable": formația stă în zona centrală de 72%). */
export function iconSvg(size: number): string {
  const inner = logoSvg()
    .replace('<svg class=""', `<svg x="${size * 0.14}" y="${size * 0.14}" width="${size * 0.72}" height="${size * 0.72}"`)
    .replace('fill="currentColor"', 'fill="#F4F6F8"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<defs><radialGradient id="ibg" cx=".7" cy=".22" r=".95"><stop offset="0" stop-color="#16202B"/><stop offset=".55" stop-color="#0A0C0F"/><stop offset="1" stop-color="#050505"/></radialGradient></defs>
<rect width="${size}" height="${size}" fill="url(#ibg)"/>${inner}</svg>`;
}
