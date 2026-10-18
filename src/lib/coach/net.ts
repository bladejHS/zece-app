/* Clientul Anthropic, inclus în aplicație (nu mai vine de pe un CDN la rulare).
   Dacă serverul nu răspunde în 5 s, cererea se oprește și aplicația trece pe „Offline Coach". */
import type Anthropic from '@anthropic-ai/sdk';

export type AnthropicCtor = typeof Anthropic;

export const CONNECT_TIMEOUT_MS = 5000;
/** După un timeout, încercările din următoarele 30 s eșuează imediat (fără încă 5 s de așteptare la reîncercare). */
const FAIL_FAST_MS = 30_000;
let lastTimeout = 0;

/** Eroare de rețea: fără internet, sau serverul nu a răspuns la timp. */
export class CoachOffline extends Error {
  constructor(readonly why: 'offline' | 'timeout') {
    super(why === 'offline' ? 'Fără conexiune la internet' : 'Antrenorul AI nu a răspuns în 5 secunde');
    this.name = 'CoachOffline';
  }
}

let sdkP: Promise<AnthropicCtor> | null = null;
export function sdk(): Promise<AnthropicCtor> {
  return (sdkP ??= import('@anthropic-ai/sdk').then((m) => m.default).catch((e: unknown) => { sdkP = null; throw e; }));
}

/** fetch cu limită de 5 s până la primul răspuns (antetele). Corpul (stream-ul) poate dura cât e nevoie. */
const timedFetch: typeof fetch = (input, init) => {
  if (!navigator.onLine) return Promise.reject(new CoachOffline('offline'));
  if (Date.now() - lastTimeout < FAIL_FAST_MS) return Promise.reject(new CoachOffline('timeout'));
  const ctl = new AbortController();
  const outer = init?.signal;
  if (outer) {
    if (outer.aborted) ctl.abort(outer.reason);
    else outer.addEventListener('abort', () => ctl.abort(outer.reason), { once: true });
  }
  const timer = setTimeout(() => { lastTimeout = Date.now(); ctl.abort(new CoachOffline('timeout')); }, CONNECT_TIMEOUT_MS);
  return fetch(input, { ...init, signal: ctl.signal }).then(
    (r) => { clearTimeout(timer); lastTimeout = 0; return r; },
    (e: unknown) => { clearTimeout(timer); throw ctl.signal.reason instanceof CoachOffline ? ctl.signal.reason : e; },
  );
};

export function client(A: AnthropicCtor, apiKey: string): Anthropic {
  return new A({ apiKey, dangerouslyAllowBrowser: true, fetch: timedFetch, maxRetries: 1 });
}

/** Eroarea înseamnă „fără conexiune" (nu o eroare de la API, nu o oprire cerută de utilizator)? */
export function isOffline(err: unknown, A: AnthropicCtor | null): boolean {
  if (err instanceof CoachOffline) return true;
  if (!A) return !navigator.onLine;
  if (err instanceof A.APIUserAbortError) return false;
  if (err instanceof A.APIConnectionError) return true;
  return !navigator.onLine;
}
