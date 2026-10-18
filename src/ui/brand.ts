/* ZECE — identitatea vizuală.
   Semnul: cifra romană X (zece), din două bare de oțel cu tăietură de șablon, pe o placă cu colțuri tășiate;
   dedesubt, 10 segmente ca pe un indicator de turație, ultimul în amber: runda de 10 puncte. */

export const BRAND = {
  name: 'ZECE',
  sub: 'Hybrid365',
  tagline: 'Antrenament de contact și hibrid, cu datele tale reale.',
} as const;

let uid = 0;

export interface LogoOptions {
  /** Clase CSS pe <svg>. */
  cls?: string;
  /** Segmentele de sub X (ascunse la dimensiuni foarte mici). */
  ticks?: boolean;
  /** Clase pe părțile animate (intro): plăcuța, barele, segmentele. */
  parts?: boolean;
}

/** Semnul ZECE ca SVG inline (viewBox 100×100). Fiecare apel are id-uri proprii pentru gradiente. */
export function logoSvg({ cls = '', ticks = true, parts = false }: LogoOptions = {}): string {
  const u = `z${++uid}`;
  const p = (c: string): string => (parts ? ` class="${c}"` : '');
  const tk = ticks
    ? Array.from({ length: 10 }, (_, i) =>
        `<rect${p('lg-tk')} x="${21 + i * 6}" y="82" width="4" height="5" rx=".6" fill="${i === 9 ? '#E8A84C' : `url(#${u}t)`}" style="--i:${i}"/>`).join('')
    : '';
  const xY = ticks ? 0 : 6;
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2E34"/><stop offset=".5" stop-color="#121418"/><stop offset="1" stop-color="#050607"/></linearGradient>
<linearGradient id="${u}m" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="74"><stop offset="0" stop-color="#F1F4F7"/><stop offset=".42" stop-color="#D5DAE0"/><stop offset=".55" stop-color="#9AA1AA"/><stop offset="1" stop-color="#5A6069"/></linearGradient>
<linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D5DAE0" stop-opacity=".7"/><stop offset=".5" stop-color="#5A6069" stop-opacity=".5"/><stop offset="1" stop-color="#9AA1AA" stop-opacity=".7"/></linearGradient>
<linearGradient id="${u}t" gradientUnits="userSpaceOnUse" x1="0" y1="82" x2="0" y2="87"><stop offset="0" stop-color="#9AA1AA"/><stop offset="1" stop-color="#4A5058"/></linearGradient>
</defs>
<path${p('lg-plate')} d="M10 0H90L100 10V90L90 100H10L0 90V10Z" fill="url(#${u}b)"/>
<path${p('lg-rim')} d="M11.5 3H88.5L97 11.5V88.5L88.5 97H11.5L3 88.5V11.5Z" fill="none" stroke="url(#${u}r)" stroke-width="1.2" pathLength="100"/>
<g transform="translate(0 ${xY})" fill="url(#${u}m)">
<path${p('lg-a')} d="M24 20H36L76 74H64Z"/>
<path${p('lg-b1')} d="M64 20H76L59.7 42H47.7Z"/>
<path${p('lg-b2')} d="M40.3 52H52.3L36 74H24Z"/>
</g>${tk}</svg>`;
}

/** Iconița aplicației (pătrat plin, sigur pentru „maskable": semnul stă în zona centrală de 76%). */
export function iconSvg(size: number): string {
  const inner = logoSvg({ ticks: true }).replace('<svg class=""', `<svg x="${size * 0.12}" y="${size * 0.12}" width="${size * 0.76}" height="${size * 0.76}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<defs><linearGradient id="ibg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2E34"/><stop offset=".55" stop-color="#121418"/><stop offset="1" stop-color="#050607"/></linearGradient></defs>
<rect width="${size}" height="${size}" fill="url(#ibg)"/>${inner}</svg>`;
}
