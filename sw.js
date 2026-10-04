/* ZECE — service worker: aplicația pornește și fără internet.
   Fișierele aplicației: întâi rețeaua (ca să vină actualizările), iar fără semnal din cache.
   Fonturile și SDK-ul antrenorului AI: din cache, actualizate în fundal.
   Cererile către API-ul Anthropic nu trec niciodată prin cache. */
const V='zece-8f15b6670e';
const SHELL=['./','index.html','manifest.webmanifest','icon.svg','apple-touch-icon.png','icon-192.png','icon-512.png','cover.jpg'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; })
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));
    return;
  }
  if(/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/.test(u.hostname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(m=>{
      const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>m);
      return m||net; })));
  }
});
