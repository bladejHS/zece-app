/* Limita de cereri către Anthropic, pe acest dispozitiv: ferește de costuri scăpate de sub control
   (o buclă de unelte, apăsări repetate). Nu e o măsură de securitate: cheia e a utilizatorului. */

const KEY = 'zece3:aiRate';
export const LIMITS = [
  { windowMs: 10 * 60_000, max: 40, label: '10 minute' },
  { windowMs: 24 * 3_600_000, max: 300, label: '24 de ore' },
] as const;
const KEEP_MS = Math.max(...LIMITS.map((l) => l.windowMs));

function read(): number[] {
  try {
    const a: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(a) ? a.filter((t): t is number => typeof t === 'number') : [];
  } catch {
    return [];
  }
}

function write(ts: number[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(ts)); } catch { /* fără stocare: limita ține doar în sesiune */ }
}

/** Mai e voie la o cerere acum? Dacă da, o numără. */
export function take(now = Date.now()): { ok: true } | { ok: false; retryInMin: number; label: string } {
  const ts = read().filter((t) => now - t < KEEP_MS);
  for (const l of LIMITS) {
    const inWin = ts.filter((t) => now - t < l.windowMs);
    if (inWin.length >= l.max) {
      const oldest = Math.min(...inWin);
      return { ok: false, retryInMin: Math.max(1, Math.ceil((oldest + l.windowMs - now) / 60_000)), label: l.label };
    }
  }
  ts.push(now);
  write(ts);
  return { ok: true };
}

/** Câte cereri s-au făcut în fiecare fereastră (pentru Setări). */
export function usage(now = Date.now()): { label: string; used: number; max: number }[] {
  const ts = read();
  return LIMITS.map((l) => ({ label: l.label, used: ts.filter((t) => now - t < l.windowMs).length, max: l.max }));
}
