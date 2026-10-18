/// <reference lib="webworker" />
/* Service worker — aplicația pornește și fără internet.
   - Pagina (navigarea): întâi rețeaua (vin actualizările), după 3 s sau fără semnal din cache.
   - Fișierele aplicației, pozele, vocea, fonturile: întâi cache-ul.
   - Versiuni pe fiecare fișier: la o versiune nouă se descarcă doar fișierele al căror hash s-a schimbat
     (lista vine din build: integrations/service-worker.ts), cele care nu mai există se șterg la activare.
   - API-urile (/api/*, Anthropic, Strava, GitHub etc.) nu trec niciodată prin cache. */
import type { SwManifest } from './manifest';

declare const self: ServiceWorkerGlobalScope;
declare const __MANIFEST__: SwManifest;

const MANIFEST = __MANIFEST__;
const CACHE = 'garda-res';
const FONTS = 'garda-fonts';
const META = 'garda-meta';
const META_KEY = 'meta.json';
const KEEP = new Set([CACHE, FONTS, META]);
const NAV_TIMEOUT_MS = 3000;
const WARM_PARALLEL = 6;

const SCOPE = new URL(self.registration.scope);
const abs = (path: string): string => new URL(path, SCOPE).href;
const SHELL = abs('index.html');

/** Calea relativă la aplicație („", „/" și „index.html" sunt aceeași pagină). */
function rel(url: URL): string | null {
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return null;
  const p = decodeURIComponent(url.pathname.slice(SCOPE.pathname.length));
  return p === '' || p === '/' ? 'index.html' : p;
}

/** Cereri care nu se pun niciodată în cache și nu sunt atinse de service worker. */
function isApi(url: URL): boolean {
  return /\/api\//.test(url.pathname)
    || /(^|\.)(anthropic\.com|claude\.ai|strava\.com|polar\.com|github\.com|githubusercontent\.com|openfoodfacts\.org|workers\.dev)$/.test(url.hostname);
}

const isFont = (url: URL): boolean => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

/* hash-ul copiei din cache, pentru fiecare fișier cu nume fix (index.html, poze, iconițe) */
type Meta = Record<string, string>;
async function readMeta(): Promise<Meta> {
  const res = await (await caches.open(META)).match(META_KEY);
  return res ? ((await res.json()) as Meta) : {};
}
async function writeMeta(meta: Meta): Promise<void> {
  await (await caches.open(META)).put(META_KEY, new Response(JSON.stringify(meta), { headers: { 'content-type': 'application/json' } }));
}

async function fetchInto(cache: Cache, path: string): Promise<void> {
  const res = await fetch(abs(path), { cache: 'reload' });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  await cache.put(abs(path), res);
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const [cache, meta] = await Promise.all([caches.open(CACHE), readMeta()]);
    const stale = Object.entries(MANIFEST).filter(([p, r]) => r.group === 'shell' && meta[p] !== r.hash);
    await Promise.all(stale.map(async ([p, r]) => { await fetchInto(cache, p); meta[p] = r.hash; }));
    await writeMeta(meta);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => !KEEP.has(n)).map((n) => caches.delete(n)));
    const cache = await caches.open(CACHE);
    const live = new Set(Object.keys(MANIFEST).map(abs));
    await Promise.all((await cache.keys()).filter((r) => !live.has(r.url)).map((r) => cache.delete(r)));
    const meta = await readMeta();
    for (const p of Object.keys(meta)) if (!MANIFEST[p]) delete meta[p];
    await writeMeta(meta);
    await self.clients.claim();
  })());
});

async function cacheFirst(req: Request, cacheName: string, key: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(key, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') await cache.put(key, res.clone());
  return res;
}

async function networkFirst(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then(async (res) => {
    if (res.ok) await cache.put(SHELL, res.clone());
    return res;
  });
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), NAV_TIMEOUT_MS));
  try {
    const res = await Promise.race([net, timeout]);
    if (res) return res;
  } catch { /* fără semnal: pagina din cache */ }
  const hit = await cache.match(SHELL);
  return hit ?? net;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (isApi(url)) return;
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req)); return; }
  const path = rel(url);
  if (path && MANIFEST[path]) { e.respondWith(cacheFirst(req, CACHE, abs(path))); return; }
  if (isFont(url)) e.respondWith(cacheFirst(req, FONTS, req.url));
});

/* aplicația cere, în fundal, tot un grup (de ex. vocea), ca să fie disponibil fără internet */
self.addEventListener('message', (e) => {
  const data = e.data as { type?: string; group?: string } | null;
  if (data?.type !== 'warm' || !data.group) return;
  const group = data.group;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const have = new Set((await cache.keys()).map((r) => r.url));
    const todo = Object.entries(MANIFEST).filter(([p, r]) => r.group === group && !have.has(abs(p))).map(([p]) => p);
    for (let i = 0; i < todo.length; i += WARM_PARALLEL) {
      await Promise.allSettled(todo.slice(i, i + WARM_PARALLEL).map((p) => fetchInto(cache, p)));
    }
  })());
});
