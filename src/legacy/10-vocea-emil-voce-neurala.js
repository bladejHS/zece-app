/* =====================================================================
   v11 · VOCEA — Emil (voce neurală înregistrată, gravă, mai lentă) și replici motivante peste tot unde vorbește aplicația
   Frazele aplicației sunt înregistrate dinainte (tools/vox: edge-tts ro-RO-EmilNeural, −12 % viteză, −8 Hz ton; combinațiile −18 %),
   scripts/split-monolith.mjs le-a scos din vox.json în public/vox (un fișier pe frază). Se redau pe ceasul audio
   (același AudioContext ca bipurile). Frazele cu numere („Runda 3 din 5", „Viteza 12 virgulă 5") se compun din cuvinte înregistrate;
   ce nu e înregistrat deloc se spune cu vocea telefonului (mai lent, ton mai jos). În Setări poți alege și vocea telefonului.
   Încurajările au variație (nu repetă aceeași replică de două ori la rând); respirația, stretching-ul și mobilitatea rămân calme.
   Preferințele stau în zece3:vox, doar pe acest dispozitiv: nu intră în export și sincronizare.
   ===================================================================== */
K.vox='zece3:vox'; S.vox={};
const VOX_BASE='vox/';
const voxCfg=()=>Object.assign({src:'emil',enc:true},S.vox||{});
async function voxSet(o){ await save('vox',Object.assign({},S.vox,o)); }

/* ---------- banca de fraze înregistrate ---------- */
const VB={buf:{},load:null,gen:0,src:[],miss:[]};
const vbKey=s=>String(s).toLowerCase().replace(/[„"”]/g,'').replace(/\s+/g,' ').replace(/^[\s.,!?:;·—-]+|[\s.,!?:;·—-]+$/g,'');
/* banca: un .mp3 mic pe frază (vox/<hash>.mp3), adus la prima nevoie; indexul fraza → fișier (VOX_INDEX) vine în pachetul aplicației.
   Service worker-ul le ține în cache (întâi cache-ul) și le aduce pe toate în fundal (voxWarm), ca vocea să meargă și fără internet */
const vbHas=k=>Object.prototype.hasOwnProperty.call(VOX_INDEX,k);
function vbBuf(k){ if(VB.buf[k]) return VB.buf[k];
  return VB.buf[k]=new Promise((res,rej)=>{ const c=actxGet(); if(!c||!vbHas(k)) return rej();
    fetch(VOX_BASE+VOX_INDEX[k]).then(r=>{ if(!r.ok) throw new Error('vox '+r.status); return r.arrayBuffer(); })
      .then(ab=>{ const p=c.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); }).catch(rej); }).catch(()=>{ delete VB.buf[k]; return null; }); }
function voxWarm(){ if(!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(r=>{ if(r.active) r.active.postMessage({type:'warm',group:'vox'}); }).catch(()=>{}); }
/* textul pentru voce, citit corect în română: „3/5" → „3 din 5", „5–6" → „5 până la 6", „puls 140–150" → „puls între 140 și 150",
   „1:32" → „un minut și 32 de secunde", „22,5 s", „200 m", „10 min", „90°", „~90%", „×", „Z2", „1-2-3-2"; „·" desparte frazele.
   „2f"/„22f" = forma de feminin („două", „douăzeci și două"), pentru bucățile înregistrate */
const vxDe=n=>{ const r=n%100; return n>=20&&(r===0||r>=20)?' de':''; };
const vxFem=n=>n===1?'o':n<100&&(n%10===2||n===12)?n+'f':String(n);
function vxNorm(t){ return String(t).replace(/\b90\/90\b/g,'90 90').replace(/(\d+)\/(\d+)/g,'$1 din $2').replace(/\bZ(\d)\b/g,'zona $1')
  .replace(/~\s*(\d+)\s*%/g,'aproape $1 la sută').replace(/(\d+)\s*%/g,'$1 la sută').replace(/(\d+)°/g,'$1 de grade')
  .replace(/\b\d(?:-\d)+\b/g,m=>m.split('-').join(', '))
  .replace(/de 6 × 10/g,'de 6, de 10 ori').replace(/(\d+) runde × /g,'$1 runde a câte ').replace(/(\d+) × (\d+) de secunde/g,'$1 runde a câte $2 de secunde').replace(/ × /g,' ori ')
  .replace(/puls (\d+)\s*–\s*(\d+)/g,'puls între $1 și $2').replace(/(\d+)\s*–\s*(\d+)/g,'$1 până la $2').replace(/ · /g,'. ')
  .replace(/(\d+):(\d\d)\b/g,(m,a,b)=>{ a=+a; b=+b; return (a===1?'un minut':a===2?'două minute':a+vxDe(a)+' minute')+(b?' și '+vxFem(b)+vxDe(b)+(b===1?' secundă':' secunde'):''); })
  .replace(/(\d+)[.,](\d)\b/g,'$1 virgulă $2')
  .replace(/(\d+) min\b/g,(m,a)=>+a===1?'un minut':vxFem(+a)+vxDe(+a)+' minute')
  .replace(/(\d+) s\b/g,(m,a)=>vxFem(+a)+vxDe(+a)+(+a===1?' secundă':' secunde'))
  .replace(/(\d+) m\b/g,(m,a)=>a+vxDe(+a)+' metri')
  .replace(/\b(\d+) (minute|secunde|runde|repetări|lovituri|contre|repere|ture)\b/g,(m,a,w)=>vxFem(+a)+' '+w)
  .replace(/(^|\s)în un minut/g,'$1într-un minut'); }
/* textul → bucăți înregistrate, cât mai lungi (sună natural): fraze întregi (și mai multe la rând, ca „Start! Hai, poți!"),
   apoi bucățile despărțite de „:", apoi cuvinte la rând („w:trebuie să fii la", „w:runda 3", „w:din 5") și numere („h:2" + „n:45").
   null dacă lipsește ceva: atunci vorbește vocea telefonului */
function vbNum(w){ const f=/f$/.test(w), n=parseInt(w,10); if(f) return ['f:'+n];
  if(n<100) return ['n:'+n]; if(n===1000) return ['n:1000']; if(n>1000) return [null]; return ['h:'+Math.floor(n/100)].concat(n%100?vbNum(String(n%100)):[]); }
const vbSegs=t=>(vxNorm(t).match(/[^.!?]+[.!?]*/g)||[]).map(s=>s.trim()).filter(s=>vbKey(s));
const vbToks=u=>vbKey(u).split(/[\s,:;]+/).filter(Boolean);
function vbUnit(u){ const ws=vbToks(u), part=[];
  for(let i=0;i<ws.length;){ let j=ws.length, hit=null;
    for(;j>i;j--){ const k='w:'+ws.slice(i,j).join(' '); if(vbHas(k)){ hit=k; break; } }
    if(hit){ part.push(hit); i=j; continue; }
    if(!/^\d+f?$/.test(ws[i])) return null; const ks=vbNum(ws[i]); if(ks.some(x=>!x||!vbHas(x))) return null; part.push(...ks); i++; }
  return part; }
/* cel mai lung șir de bucăți [i, j) care există întreg în bancă, unite cu sep */
function vbLong(xs,i,sep){ for(let j=xs.length;j>i;j--){ const k=vbKey(xs.slice(i,j).join(sep)); if(vbHas(k)) return [k,j]; } return null; }
function vbPlan(t){
  const segs=vbSegs(t), out=[];
  for(let i=0;i<segs.length;){ const w=vbLong(segs,i,' '); if(w){ out.push([w[0],.22]); i=w[1]; continue; }
    const us=segs[i].split(':').map(s=>s.trim()).filter(s=>vbKey(s));
    for(let a=0;a<us.length;){ const h=vbLong(us,a,': '); if(h){ out.push([h[0],.12]); a=h[1]; continue; }
      const p=vbUnit(us[a]); if(!p) return null; p.forEach(x=>out.push([x,.04])); out[out.length-1][1]=.12; a++; }
    if(out.length) out[out.length-1][1]=.22; i++; }
  return out.length?out:null; }
function vbStop(){ VB.gen++; VB.src.forEach(s=>{ try{ s.stop(); }catch(e){} }); VB.src=[]; }
async function vbSay(plan,o,gen){
  const bufs=await Promise.all(plan.map(p=>vbBuf(p[0]))); if(gen!==VB.gen) return;
  if(bufs.some(b=>!b)) return ttsSay(o.text,o);
  const c=actxGet(); if(!c) return; let t=c.currentTime+.04; const g=c.createGain(); g.gain.value=1; g.connect(c.destination);
  /* vocea dinamică: tempo și ton după fază, intensitate și RPE (VOXCTX, 46b) */
  const rate=VOXCTX.rate||1;
  bufs.forEach((b,i)=>{ const s=c.createBufferSource(); s.buffer=b; s.playbackRate.value=rate; if(s.detune) s.detune.value=VOXCTX.detune||0; s.connect(g); s.start(t); VB.src.push(s);
    if(i===bufs.length-1) s.onended=()=>{ if(gen===VB.gen){ VO.end=0; VB.src=[]; if(o.end) o.end(); } };
    t+=b.duration/rate+(i<bufs.length-1?plan[i][1]:0); });
  VO.end=Date.now()+Math.round((t-c.currentTime)*1000)+300; }

/* ---------- vocea telefonului (rezerva): o voce românească, mai lentă și mai gravă ---------- */
const VO={ok:'speechSynthesis' in window,v:null,list:[],end:0};
function voRo(){ try{ return speechSynthesis.getVoices().filter(v=>/^ro/i.test(v.lang)); }catch(e){ return []; } }
const voScore=v=>(/natural|neural|enhanced|premium|online/i.test(v.name)?10:0)+(/emil|andrei/i.test(v.name)?2:0)+(v.localService?1:0);
function pickVoice(){ const l=voRo(); VO.list=l; VO.v=l.slice().sort((a,b)=>voScore(b)-voScore(a))[0]||null; }
if(VO.ok){ pickVoice(); try{ speechSynthesis.addEventListener('voiceschanged',pickVoice); }catch(e){} }
function ttsSay(t,o){ o=o||{}; if(!VO.ok) return false; if(!VO.v) pickVoice(); if(!VO.v) return false;
  try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(vxNorm(t).replace(/(\d+)f\b/g,'$1')); u.lang='ro-RO'; u.voice=VO.v;
    u.rate=.85*(o.rate||1)*(VOXCTX.rate||1); u.pitch=.85*(1+(VOXCTX.detune||0)/1200); VO.end=Date.now()+Math.min(12000,900+String(t).length*95/u.rate);
    const fin=()=>{ VO.end=0; if(o.end) o.end(); }; u.onend=fin; u.onerror=fin; speechSynthesis.speak(u); return true; }catch(e){ return false; } }

/* vorbește acum (oprește ce se spunea) sau, cu o.queue, doar dacă vocea e liberă; o.end se apelează la final */
function say(t,o){ o=Object.assign({},o,{text:t}); if(!S.voice||!S.sound||document.hidden||!t) return false;
  if(o.queue&&voTalking()) return false;
  vbStop(); try{ VO.ok&&speechSynthesis.cancel(); }catch(e){}
  if(voxCfg().src==='emil'){
    const p=vbPlan(t); if(p&&actxGet()){ vbSay(p,o,VB.gen); VO.end=Date.now()+4000; return true; }
    VB.miss.push(String(t)); if(VB.miss.length>50) VB.miss.shift(); }
  return ttsSay(t,o); }
/* toată banca se aduce în cache în fundal la câteva secunde după pornire, ca să fie gata la primul antrenament și fără internet */
setTimeout(()=>{ if(S.voice&&voxCfg().src==='emil') voxWarm(); },4000);
function voTalking(){ if(!VO.end) return false; if(Date.now()>VO.end){ VO.end=0; return false; } return true; }

/* ---------- replicile motivante ---------- */
const MOT={
  go:['Start! Hai, poți!','Începem! Dă tot ce ai!','Hai! Arată ce poți!','Start! Concentrare și dă-i!'],
  work:['Hai, poți!','Dă-i tare!','Concentrare, hai!','Ești pe drumul cel bun!','Fiecare secundă contează!','Hai, arată ce poți!'],
  last:['Ultimul! Dă tot ce ai!','Ultimul! Termină puternic!','Ultimul, hai, încă puțin!','Ultimul! Totul acum!'],
  rest:['Bravo! Respiră adânc.','Foarte bine! Respiră și recuperează-te.','Super treabă! Relaxează umerii.','Excelent! Ia-ți aer, urmează și mai bine.'],
  restS:['Respiră!','Bine, respiră!','Bravo, aer!'],
  half:['Jumătate! Ține ritmul!','Ai trecut de jumătate! Continuă!','Jumătate gata! Hai, poți!'],
  min1:['Ultimul minut! Ține-te tare!','Încă un minut! Finalul e aproape!','Ultimul minut! Hai, termină frumos!'],
  s10:['Zece secunde! Rezistă!','Încă zece secunde! Hai!','Zece secunde! Dă tot!'],
  done:['Gata! Ai fost excelent. Bravo!','Ai terminat! Bravo, asta a fost muncă serioasă!','Gata! Încă un antrenament bifat. Felicitări!'],
  calmDone:['Gata. Foarte bine.','Gata. Te-ai descurcat foarte bine.'],
  fin:['Antrenament terminat! Ai muncit din greu azi. Bravo!','Gata antrenamentul! Felicitări, ești mai puternic decât ieri!','Antrenament terminat! Disciplina ta face diferența. Bravo!'],
  rdone:['Gata pauza! Hai, următoarea serie!','Pauza s-a terminat. Încă o serie, poți!','Înapoi la treabă! Următoarea serie!'],
  pr:['Record nou! Ești de neoprit!','Record nou! Bravo, asta e progres!','Record nou! Felicitări, muncă răsplătită!'],
  tg:['Țintă atinsă! Bravo, ai reușit!','Țintă atinsă! Felicitări, asta e muncă!'],
  on:['Vocea e pornită. Hai să ne antrenăm!'],
  test:['Seria unu din trei. Hai, la treabă!']
};
const MOT_LAST={};
function mot(k){ const a=MOT[k]||[]; if(!a.length) return ''; let i=Math.floor(Math.random()*a.length); if(a.length>1&&a[i]===MOT_LAST[k]) i=(i+1)%a.length; return MOT_LAST[k]=a[i]; }
const voxEnc=()=>voxCfg().enc!==false;
/* cronometrele calme: respirație, stretching, mobilitate, foam rolling */
const tmCalm=st=>!!st&&(/^(breath|stretch|mobility)$/.test(st.kind||'')||/foam roll|respira/i.test(st.title||''));

/* ce spune vocea la începutul fiecărei bucăți din cronometru */
function voxPhase(p,st){
  if(!p) return '';
  if(p.k==='breath') return p.l;
  const sp=p.sp?'. Viteza '+spSay(p.sp):'', calm=tmCalm(st)||!voxEnc();
  if(p.k==='rest'){ if(calm) return p.l+sp;
    return p.l+'. '+((p.d||0)<15?mot('restS'):mot('rest'))+sp; }
  /* eticheta + prima parte din descriere (fără numele activității repetat și fără „Ultima rundă — dă tot", spusă motivant mai jos) */
  const s=p.s?p.s.split(' — ')[0]:'', base=p.l+(s&&!/^Ultima rundă/.test(s)?'. '+s:'')+sp;
  if(calm||p.k==='prep') return base;
  const works=st.ph.filter(x=>x.k==='work'||x.k==='manual'), wi=works.indexOf(p), last=works.length>1&&wi===works.length-1;
  return base+'. '+(last?mot('last'):wi===0?mot('go'):mot('work'));
}

/* încurajările din mijlocul bucății (jumătate, ultimul minut, ultimele 10 secunde): o dată pe bucată, doar dacă vocea e liberă */
function voxTick(st){
  if(!st||!st.started||st.done||st.pAt||st.kb||!voxEnc()||tmCalm(st)) return;
  const ph=st.ph[st.i]; if(!ph||ph.k!=='work'||ph.d==null) return;
  const el=tmEl(), left=ph.d-el, q=st.vq&&st.vq.i===st.i?st.vq:(st.vq={i:st.i});
  if(ph.d>=120&&!q.h&&el>=ph.d/2&&left>20){ q.h=1; say(mot('half'),{queue:true}); return; }
  if(ph.d>=300&&!q.m&&left<=60&&left>50){ q.m=1; say(mot('min1'),{queue:true}); return; }
  if(ph.d>=45&&st.kind!=='emom'&&!q.s&&left<=10.5&&left>6){ q.s=1; say(mot('s10'),{queue:true}); }
}

/* ---------- Setări: vocea, încurajări, „Ascultă" ---------- */
function voxSettingsHTML(){
  if(!S.voice) return '';
  const c=voxCfg();
  return `<div class="vox-set"><div class="eyebrow" style="margin-top:4px">${ic('sound')} Vocea</div>
    <div class="seg" style="margin-top:8px">${[['emil','Emil · antrenor'],['tel','Vocea telefonului']].map(([k,t])=>`<button class="${c.src===k?'on':''}" data-a="voxSrc" data-k="${k}">${t}</button>`).join('')}</div>
    <div class="sm mu" style="margin-top:6px">${c.src==='emil'?'Voce gravă, înregistrată în aplicație: sună la fel pe orice telefon, vorbește rar și clar.':VO.ok?(voRo().length?'Vocea românească instalată pe acest dispozitiv, mai rar și pe un ton mai jos.':'Nu găsesc o voce românească pe acest dispozitiv.'):'Browserul nu are sinteză vocală.'}</div>
    <div class="set-row"><span class="sp"><b>Semnale fără cuvinte</b><div class="sm mu">În sesiunile în 4 faze: ton la intrarea în fază, ritm discret la tehnică, tonuri de respirație la revenire</div></span><button class="sw ${S.cues!==false?'on':''}" data-a="cuesToggle" role="switch" aria-checked="${S.cues!==false}" aria-label="Semnale fără cuvinte"></button></div>
    <div class="set-row"><span class="sp"><b>Încurajări</b><div class="sm mu">Vocea te motivează în intervale, pauze, la final și la recorduri</div></span><button class="sw ${c.enc?'on':''}" data-a="voxEnc" role="switch" aria-checked="${!!c.enc}" aria-label="Încurajări"></button></div>
    <button class="btn ghost sm" style="margin-top:4px" data-a="voxTest">${ic('sound')} Ascultă vocea</button></div>`;
}
ACT.voxSrc=async(el,{k})=>{ if(k!=='emil'&&k!=='tel') return; await voxSet({src:k}); render(); say(mot('go')); };
ACT.voxEnc=async()=>{ await voxSet({enc:!voxCfg().enc}); render(); };
ACT.voxTest=()=>{ actxGet(); if(!say(mot('test'))) toast('Vocea nu pornește','Verifică: Sunet și vibrații pornit, Voce pornită și volumul telefonului.','info'); };
