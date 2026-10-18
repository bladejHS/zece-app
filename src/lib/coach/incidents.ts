/* Răspunsurile oprite de filtru: păstrate doar pe acest dispozitiv, pentru verificare manuală (Setări → Antrenor AI). */
import type { GuardCode } from './guardrails';

const KEY = 'zece3:aiIncidents';
const MAX = 50;
const MAX_TEXT = 2000;

export interface Incident {
  t: string;
  /** De unde a venit răspunsul: chat, adaptare, poză, tehnică. */
  src: string;
  code: GuardCode;
  match: string;
  text: string;
}

export function list(): Incident[] {
  try {
    const a: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(a) ? (a as Incident[]) : [];
  } catch {
    return [];
  }
}

export function log(src: string, code: GuardCode, match: string, text: string): void {
  const a = list();
  a.push({ t: new Date().toISOString(), src, code, match: match.slice(0, 120), text: text.slice(0, MAX_TEXT) });
  try { localStorage.setItem(KEY, JSON.stringify(a.slice(-MAX))); } catch { /* spațiu plin: incidentul nu se păstrează */ }
}

export function clear(): void {
  try { localStorage.removeItem(KEY); } catch { /* nimic */ }
}
