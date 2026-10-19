/* =====================================================================
   16 · PORNIRE
   ===================================================================== */
async function loadAll(){
  const keys=Object.keys(K), vals=await Promise.all(keys.map(k=>store.get(K[k]))), o=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  ['lifts','weights','wlog','cyc','runPlan','prof','mlog','water','body','journal','tech','mplan','shop','adj','strava','exNote','dash','notifCfg','kb','vox','std','nlog'].forEach(k=>{ S[k]=obj(o[k]); });
  S.ach=o.ach&&typeof o.ach==='object'&&!Array.isArray(o.ach)?o.ach:null; S.notif=Array.isArray(o.notif)?o.notif:undefined;
  S.exFav=Array.isArray(o.exFav)?o.exFav:[]; S.exCustom=Array.isArray(o.exCustom)?o.exCustom:[];
  try{ const r=JSON.parse(localStorage.getItem('zece3:rng')||'"m"'); if(RANGES.some(x=>x[0]===r)) S.rng=r; }catch(e){}
  S.ext=Array.isArray(o.ext)?o.ext:[]; S.stq=Array.isArray(o.stq)?o.stq:[]; S.goals=Array.isArray(o.goals)?o.goals:[]; S.foods=Array.isArray(o.foods)?o.foods:[]; S.shoes=Array.isArray(o.shoes)?o.shoes:[]; S.sync=obj(o.sync); S.supp=Object.assign({on:{},log:{}},obj(o.supp)); S.bk=obj(o.bk);
  S.mf=Object.assign({port:false,cold:false},obj(o.mf)); S.intro=['full','short','off'].indexOf(o.intro)>=0?o.intro:'full';
  S.motion=['auto','on','off'].indexOf(o.motion)>=0?o.motion:'auto'; S.motionAsked=!!o.motionAsked;
  S.voice=o.voice!==false; S.recapSeen=+o.recapSeen||0; S.deload=o.deload!==false; S.cues=o.cues!==false; S.squad=o.squad&&o.squad.pass?o.squad:null;
  S.runs=Array.isArray(o.runs)?o.runs:[]; S.hist=Array.isArray(o.hist)?o.hist:[];
  S.ptests=Array.isArray(o.ptests)?o.ptests:[]; S.tmlog=Array.isArray(o.tmlog)?o.tmlog:[];
  S.sess=o.sess&&o.sess.start&&o.sess.sets?Object.assign({tmMin:{},tasks:{},runs:{},prs:[],best:{},kg:{},rp:{}},o.sess):null;
  S.sound=o.sound!==false; S.aiKey=await COACH.vault.loadKey(); S.aiUsed=+o.aiUsed||0;
  S.aiEffort=['low','medium','high'].indexOf(o.aiEffort)>=0?o.aiEffort:'medium';
  S.theme=THEMES[o.theme]?o.theme:'tactical'; S.mode=['dark','light','auto'].indexOf(o.mode)>=0?o.mode:'dark'; S.bg=o.bg==='black'?'black':'anthr';
  /* designul ZECE (v15) pornește o singură dată pe tema Tactical; după aceea tema aleasă în Setări rămâne */
  if((+o.look||0)<15){ S.theme='tactical'; await store.set(K.theme,'tactical'); await store.set(K.look,15); }
  S.fx=['min','normal','max'].indexOf(o.fx)>=0?o.fx:'normal'; S.onb=!!o.onb;
  S.seenAch=Array.isArray(o.seenAch)?o.seenAch:null; S.seenLvl=typeof o.seenLvl==='number'?o.seenLvl:null;
  /* conversațiile din v3 au alt set de unelte și alt prompt: le închidem, altfel istoricul nu mai corespunde */
  if(o.aiChat&&Array.isArray(o.aiChat.msgs)&&o.aiChat.msgs.length&&o.aiChat.ver!==4){ S.aiChat=null; AI.note='Conversația veche a fost închisă după actualizarea aplicației. Începe una nouă.'; await store.set(K.aiChat,null); }
  else S.aiChat=o.aiChat&&Array.isArray(o.aiChat.msgs)?Object.assign({tools:{}},o.aiChat):null;
  await migrate(); await cfAchFix(); await planAbsMigrate(+o.planV||0);
  STC=null; S.loaded=true;
  await migSplit(); await mealsMigrate(); try{ await nAdaptRun(); }catch(e){} try{ aiWeekAuto(); }catch(e){}
}
/* migrări de date, la fiecare încărcare (și după import sau sincronizare):
   v8 scoate „câte repetări mai puteai" (RIR) din serii: o serie rămâne [kg, repetări] (+ tipul, ca text, la drop set / rest-pause) */
async function migrate(){
  let ch=false; const L={};
  Object.keys(S.lifts||{}).forEach(n=>{ const h=Array.isArray(S.lifts[n])?S.lifts[n]:[];
    L[n]=h.filter(e=>e&&e.d&&Array.isArray(e.s)).map(e=>{ if(!e.s.some(s=>Array.isArray(s)&&s.length>2&&typeof s[2]!=='string')) return e;
      ch=true; return Object.assign({},e,{s:e.s.map(s=>Array.isArray(s)&&s.length>2&&typeof s[2]!=='string'?[s[0],s[1]]:s)}); }); });
  if(ch){ S.lifts=L; await store.set(K.lifts,L); }
  if(S.sess&&S.sess.sets){ let sc=false; const ss={};
    Object.keys(S.sess.sets).forEach(x=>{ ss[x]=(S.sess.sets[x]||[]).map(s=>{ if(Array.isArray(s)&&s.length>2&&typeof s[2]!=='string'){ sc=true; return [s[0],s[1]]; } return s; }); });
    if(sc||S.sess.rir){ S.sess=Object.assign({},S.sess,{sets:ss}); delete S.sess.rir; await store.set(K.sess,S.sess); } }
}
/* ---------- animația de deschidere (src/components/Intro.astro, src/styles/intro.css) ---------- */
const INTRO={on:false,leaving:false,done:null,mode:'full'};
/* secunda (× k) la care se aprinde al 10-lea segment: vibrația scurtă cade pe el */
const IN_T10=1.75;
function introStart(){
  const intro=$('#intro'); let mode='full';
  try{ const m=JSON.parse(localStorage.getItem(K.intro)||'"full"'); if(['full','short','off'].indexOf(m)>=0) mode=m; }catch(e){}
  try{ const lk=+JSON.parse(localStorage.getItem(K.look)||'0')||0, t=lk>=15?JSON.parse(localStorage.getItem(K.theme)||'null'):'tactical'; S.theme=THEMES[t]?t:'tactical'; }catch(e){}
  try{ S.bg=JSON.parse(localStorage.getItem(K.bg)||'"anthr"')==='black'?'black':'anthr'; }catch(e){}
  try{ const md=JSON.parse(localStorage.getItem(K.mode)||'"dark"'); if(['dark','light','auto'].indexOf(md)>=0) S.mode=md; }catch(e){}
  applyTheme();
  try{ const m=JSON.parse(localStorage.getItem(K.motion)||'"auto"'); if(['auto','on','off'].indexOf(m)>=0) S.motion=m; }catch(e){}
  applyMotion();
  INTRO.mode=mode;
  INTRO.done=new Promise(res=>{ INTRO.resolve=res; });
  if(mode==='off'||motionOff()){ intro.remove(); $('.top .logo').classList.remove('wait'); INTRO.resolve(); return; }
  if(mode==='short') intro.classList.add('short');
  INTRO.on=true;
  const k=mode==='full'?1:.45;
  setTimeout(()=>{ if(INTRO.on) buzz([22]); },Math.round(IN_T10*k*1000));
  intro.addEventListener('click',introExit);
  setTimeout(introExit,Math.round((mode==='full'?2.9:1.35)*1000));
}
/* ieșirea: semnul zboară în antet, iar cele două lame se deschid ca un obturator */
function introExit(){
  if(INTRO.leaving) return; INTRO.leaving=true;
  const intro=$('#intro'), il=$('#inLogo'), hl=$('.top .logo');
  const finish=()=>{ INTRO.on=false; if(intro.isConnected) intro.remove(); hl.classList.remove('wait'); hl.classList.add('land'); setTimeout(()=>hl.classList.remove('land'),460);
    const v=$('#view'); v.classList.remove('anim'); void v.offsetWidth; v.classList.add('anim'); countUp(v); INTRO.resolve(); };
  try{
    /* animațiile de intrare încă în curs sar direct la final, ca semnul să plece întreg */
    intro.getAnimations({subtree:true}).forEach(a=>{ try{ a.finish(); }catch(e){} });
    const r1=il.getBoundingClientRect(), r2=hl.getBoundingClientRect(), cx=r2.left+r2.width/2, cy=r2.top+r2.height/2;
    const dx=cx-(r1.left+r1.width/2), dy=cy-(r1.top+r1.height/2), sc=r2.width/r1.width;
    intro.classList.add('out');
    const a=il.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx}px,${dy}px) scale(${sc})`}],{duration:520,easing:'cubic-bezier(.25,.46,.45,.94)',fill:'forwards'});
    a.onfinish=finish; setTimeout(()=>{ if(intro.isConnected) finish(); },900);
  }catch(e){ finish(); }
}
(async function init(){
  introStart();
  /* online (https) merge și fără internet; local (file://) nu e nevoie */
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')) navigator.serviceWorker.register('sw.js').catch(()=>{});
  await loadAll(); applyTheme(); applyFx();
  /* stocare permanentă: browserul nu mai șterge datele unui site nefolosit (ex. Safari după 7 zile) */
  try{ if(navigator.storage&&navigator.storage.persist){ navigator.storage.persisted().then(p=>p||navigator.storage.persist()).then(p=>{
    if(navigator.storage.estimate) navigator.storage.estimate().then(e=>{ STEST=(e.usage?num(e.usage/1048576,1)+' MB folosiți':'')+(p?' · stocare permanentă':''); }); }).catch(()=>{}); } }catch(e){}
  await stCallback(location.search);
  try{ const d=new Date(), h=d.getHours(); $('#inSub').textContent=(h<5?'Noapte bună':h<12?'Bună dimineața':h<18?'Bună ziua':'Bună seara')+' · '+d.toLocaleDateString('ro-RO',{weekday:'long'}); }catch(e){}
  render();
  phLoad().then(()=>{ if(S.tab==='prog') render(); });
  if(S.sess) keepAlive(true);
  await INTRO.done;
  stAuto(); syAuto();
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ stAuto(); syAuto(); } else if(syOn()&&syCfg().dirty&&!SY.busy){ clearTimeout(SY.timer); syncNow(false); } });
  addEventListener('online',()=>{ if(syOn()&&syCfg().dirty) syncNow(false); });
  setTimeout(aiSyncQueue,5000);
  if(!S.onb) setTimeout(onbOpen,200);
  else if(MQ_RM.matches&&S.motion==='auto'&&!S.motionAsked) setTimeout(()=>{ if(!SH&&!OB){ SH={kind:'motion'}; shRender(); } },600);
})();
