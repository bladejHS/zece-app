/* Squad-uri private (cel mult 5 oameni), fără server: fiecare membru își publică săptămânal un rezumat criptat
   într-un gist secret de pe GitHub; ceilalți îl citesc cu parola squad-ului. Pe GitHub ajunge doar text criptat. */

export const MAX_MEMBERS = 5;
const ITER = 210_000;
const FILE = 'zece-squad.json';
const GH = 'https://api.github.com';

export interface SquadMember { name: string; gist: string }
export interface RitualTime { day: number; hour: number; minute: number }
export interface Squad {
  name: string;
  pass: string;
  me: SquadMember;
  members: SquadMember[];
  ritual: RitualTime & { on: boolean };
}

/** Rezumatul săptămânii unui membru (doar cifre, fără date personale). */
export interface SquadCard {
  v: 1;
  name: string;
  week: string;
  sessions: number;
  minutes: number;
  rounds: number;
  sleepNights: number;
  mobility: number;
  level: number;
  updated: string;
}

export interface Challenge { id: string; name: string; metric: keyof Pick<SquadCard, 'sessions' | 'rounds' | 'sleepNights' | 'mobility' | 'minutes'>; perMember: number; desc: string }
export const CHALLENGES: readonly Challenge[] = [
  { id: 'rounds', name: 'Rundele echipei', metric: 'rounds', perMember: 15, desc: 'Împreună, câte 15 runde de fiecare membru săptămâna asta.' },
  { id: 'sleep', name: 'Somnul echipei', metric: 'sleepNights', perMember: 5, desc: 'Câte 5 nopți cu cel puțin 7 ore de fiecare membru.' },
  { id: 'sessions', name: 'Sesiuni în 4 faze', metric: 'sessions', perMember: 3, desc: 'Câte 3 sesiuni complete de fiecare membru.' },
  { id: 'mobility', name: 'Mobilitate', metric: 'mobility', perMember: 2, desc: 'Câte 2 sesiuni de mobilitate sau respirație de fiecare membru.' },
];

/** Provocarea săptămânii (aceeași pentru toți membrii: depinde doar de săptămână). */
export function weekChallenge(monday: string): Challenge {
  const n = Math.floor(Date.parse(`${monday}T12:00:00Z`) / (7 * 86_400_000));
  return CHALLENGES[((n % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length]!;
}

export function challengeProgress(c: Challenge, cards: readonly SquadCard[], members: number): { done: number; goal: number } {
  return { done: cards.reduce((a, x) => a + (x[c.metric] || 0), 0), goal: c.perMember * Math.max(1, members) };
}

/* ---------- criptarea (PBKDF2-SHA256 + AES-GCM 256) ---------- */
const enc = new TextEncoder();
const b64 = (b: Uint8Array): string => btoa(String.fromCharCode(...b));
const unb64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function keyFrom(pass: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export interface Sealed { v: 1; salt: string; iv: string; ct: string }

export async function seal(card: SquadCard, pass: string): Promise<Sealed> {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(pass, salt), enc.encode(JSON.stringify(card))));
  return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

export async function open(s: Sealed, pass: string): Promise<SquadCard> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv) }, await keyFrom(pass, unb64(s.salt)), unb64(s.ct));
  return JSON.parse(new TextDecoder().decode(pt)) as SquadCard;
}

/* ---------- invitațiile ---------- */
/* codurile vechi (ZECE1 / ZECEM1) rămân valabile */
const toCode = (prefix: string, o: unknown): string => `${prefix}.${btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
function fromCode<T>(prefix: string, code: string): T | null {
  const m = new RegExp(`^${prefix}\\.([A-Za-z0-9_-]+)$`).exec(code.trim());
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1]!.replace(/-/g, '+').replace(/_/g, '/'))))) as T; } catch { return null; }
}

/** O parolă lungă, aleatorie, pentru squad (nu o alege omul). */
export function newPass(): string {
  const a = crypto.getRandomValues(new Uint8Array(18));
  return b64(a).replace(/[+/=]/g, '').slice(0, 24);
}

export function createSquad(name: string, myName: string): Squad {
  return { name: name.trim().slice(0, 40) || 'Squad', pass: newPass(), me: { name: myName.trim().slice(0, 24) || 'Eu', gist: '' }, members: [], ritual: { day: 6, hour: 10, minute: 0, on: false } };
}

/** Invitația squad-ului: numele, parola, ritualul și membrii cunoscuți (inclusiv tu). */
export function inviteCode(s: Squad): string {
  return toCode('FALCO1', { n: s.name, p: s.pass, r: s.ritual, m: [s.me, ...s.members].filter((x) => x.gist) });
}

export function joinSquad(code: string, myName: string): Squad | null {
  const o = fromCode<{ n: string; p: string; r?: RitualTime & { on: boolean }; m: SquadMember[] }>('(?:FALCO1|ZECE1)', code);
  if (!o || !o.p || !o.n) return null;
  return { name: o.n, pass: o.p, me: { name: myName.trim().slice(0, 24) || 'Eu', gist: '' }, members: (o.m || []).slice(0, MAX_MEMBERS - 1), ritual: o.r ?? { day: 6, hour: 10, minute: 0, on: false } };
}

/** Codul tău, pe care îl dai celorlalți ca să te vadă (după prima publicare). */
export const memberCode = (s: Squad): string => toCode('FALCOM1', { n: s.name, m: s.me });

export function addMember(s: Squad, code: string): { ok: true; squad: Squad } | { ok: false; reason: string } {
  const o = fromCode<{ n: string; m: SquadMember }>('(?:FALCOM1|ZECEM1)', code);
  if (!o || !o.m?.gist) return { ok: false, reason: 'Codul nu e valid.' };
  if (o.n !== s.name) return { ok: false, reason: 'Codul e pentru alt squad.' };
  if (o.m.gist === s.me.gist || s.members.some((m) => m.gist === o.m.gist)) return { ok: false, reason: 'Membrul e deja în squad.' };
  if (s.members.length + 1 >= MAX_MEMBERS) return { ok: false, reason: `Un squad are cel mult ${MAX_MEMBERS} oameni.` };
  return { ok: true, squad: { ...s, members: [...s.members, { name: String(o.m.name).slice(0, 24), gist: o.m.gist }] } };
}

/* ---------- GitHub (gist secret) ---------- */
export async function publish(token: string, s: Squad, card: SquadCard): Promise<string> {
  const body = JSON.stringify({ description: 'FALCO · squad (criptat)', public: false, files: { [FILE]: { content: JSON.stringify(await seal(card, s.pass)) } } });
  const r = await fetch(s.me.gist ? `${GH}/gists/${s.me.gist}` : `${GH}/gists`, {
    method: s.me.gist ? 'PATCH' : 'POST', body,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return ((await r.json()) as { id: string }).id;
}

export async function fetchCard(gist: string, pass: string): Promise<SquadCard | null> {
  const r = await fetch(`${GH}/gists/${encodeURIComponent(gist)}`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
  if (!r.ok) return null;
  const j = (await r.json()) as { files?: Record<string, { content?: string }> };
  const c = j.files?.[FILE]?.content;
  if (!c) return null;
  try { return await open(JSON.parse(c) as Sealed, pass); } catch { return null; }
}
