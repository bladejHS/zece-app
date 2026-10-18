/* Antrenorul AI — tot ce stă între aplicație și API-ul Anthropic:
   cheia criptată, limita de cereri, filtrul de siguranță pe intrare și ieșire, modul offline și coada de sincronizare.
   Codul vechi (src/legacy) îl folosește prin `COACH`. */
import { checkOutput, gateStream, SAFE_MESSAGE, type GuardContext } from './guardrails.ts';
import * as incidents from './incidents.ts';
import * as limits from './limits.ts';
import { CoachOffline, type AnthropicCtor } from './net.ts';

export { checkImage, checkInput, exerciseConflict, INJURIES, isInjury, KCAL_FLOOR } from './guardrails.ts';
export type { GuardContext, Injury } from './guardrails.ts';
export { client, CoachOffline, isOffline, sdk } from './net.ts';
export * as incidents from './incidents.ts';
export * as limits from './limits.ts';
export * as queue from './queue.ts';
export * as vault from './vault.ts';

/** Cererea nu pleacă: limita de cereri sau o intrare invalidă. */
export class CoachBlocked extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoachBlocked';
  }
}

/** Înainte de fiecare cerere către API. Aruncă CoachBlocked sau CoachOffline. */
export function preflight(): void {
  if (!navigator.onLine) throw new CoachOffline('offline');
  const r = limits.take();
  if (!r.ok) throw new CoachBlocked(`Ai atins limita de cereri către antrenorul AI pe ${r.label}. Mai încearcă peste ${r.retryInMin} min.`);
}

export type Verdict = { ok: true } | { ok: false; message: string };

/** Răspunsul complet de la model, înainte să ajungă pe ecran sau în date. Oprirea se notează pentru verificare. */
export function verify(src: string, text: string, ctx: GuardContext): Verdict {
  const r = checkOutput(text, ctx);
  if (r.ok) return r;
  incidents.log(src, r.code, r.match, text);
  return { ok: false, message: SAFE_MESSAGE[r.code] };
}

/** În timpul stream-ului: ce se poate afișa deja. `blocked` = stream-ul trebuie oprit. */
export function gate(src: string, text: string, ctx: GuardContext): { shown: string; blocked: Verdict | null } {
  const g = gateStream(text, ctx);
  if (!g.blocked || g.blocked.ok) return { shown: g.shown, blocked: null };
  incidents.log(src, g.blocked.code, g.blocked.match, text);
  return { shown: '', blocked: { ok: false, message: SAFE_MESSAGE[g.blocked.code] } };
}

/** Text pentru erorile proprii (rețea, limită); null pentru erorile API, pe care le explică aplicația. */
export function errText(err: unknown, _A: AnthropicCtor | null): string | null {
  if (err instanceof CoachBlocked) return err.message;
  if (err instanceof CoachOffline) return err.why === 'offline'
    ? 'Ești offline. Antrenorul AI revine când se reface conexiunea.'
    : 'Antrenorul AI nu a răspuns în 5 secunde. Încearcă din nou puțin mai târziu.';
  return null;
}
