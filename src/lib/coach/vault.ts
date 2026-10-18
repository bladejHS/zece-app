/* Cheia API Anthropic: criptată (AES-GCM 256) în IndexedDB, cu o cheie de criptare generată pe dispozitiv
   și marcată „neextractibilă" — browserul o folosește, dar nu o dă nimănui, nici paginii.
   Cheia API nu e în cod, în build, în export sau în sincronizare; în clar există doar în memorie, cât e deschisă aplicația. */
import { idbDel, idbGet, idbPut } from './idb.ts';

const LEGACY_KEY = 'zece3:aiKey';
const WRAP = 'wrap';
const SECRET = 'aiKey';

interface Sealed { iv: Uint8Array<ArrayBuffer>; ct: ArrayBuffer }

/** O cheie Anthropic arată așa: sk-ant-<tip>-<caractere>. */
export const isApiKey = (v: string): boolean => /^sk-ant-[A-Za-z0-9_-]{20,300}$/.test(v);

async function wrapKey(): Promise<CryptoKey> {
  const k = await idbGet<CryptoKey>('vault', WRAP);
  if (k) return k;
  const nk = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await idbPut('vault', nk, WRAP);
  return nk;
}

export async function saveKey(apiKey: string): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await wrapKey(), new TextEncoder().encode(apiKey));
  await idbPut('vault', { iv, ct } satisfies Sealed, SECRET);
}

export async function deleteKey(): Promise<void> {
  await idbDel('vault', SECRET);
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* nimic de șters */ }
}

/** Citește cheia. La prima pornire după actualizare mută cheia veche (în clar, în localStorage) în seif și o șterge de acolo. */
export async function loadKey(): Promise<string> {
  let legacy = '';
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? '""') as string; } catch { /* format necunoscut */ }
  try {
    if (typeof legacy === 'string' && legacy) {
      await saveKey(legacy);
      localStorage.removeItem(LEGACY_KEY);
      return legacy;
    }
    const s = await idbGet<Sealed>('vault', SECRET);
    if (!s) return '';
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: s.iv }, await wrapKey(), s.ct);
    return new TextDecoder().decode(pt);
  } catch {
    /* fără IndexedDB (mod privat): cheia veche rămâne folosibilă doar în această sesiune */
    return typeof legacy === 'string' ? legacy : '';
  }
}
