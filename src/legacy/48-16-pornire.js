/* =====================================================================
   16 · PORNIRE
   ===================================================================== */
async function loadAll(){
  const keys=Object.keys(K), vals=await Promise.all(keys.map(k=>store.get(K[k]))), o=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  ['lifts','weights','wlog','cyc','runPlan','prof','mlog','water','body','journal','tech','mplan','shop','adj','strava','exNote','dash','notifCfg','kb','vox'].forEach(k=>{ S[k]=obj(o[k]); });
  S.ach=o.ach&&typeof o.ach==='object'&&!Array.isArray(o.ach)?o.ach:null; S.notif=Array.isArray(o.notif)?o.notif:undefined;
  S.exFav=Array.isArray(o.exFav)?o.exFav:[]; S.exCustom=Array.isArray(o.exCustom)?o.exCustom:[];
  try{ const r=JSON.parse(localStorage.getItem('zece3:rng')||'"m"'); if(RANGES.some(x=>x[0]===r)) S.rng=r; }catch(e){}
  S.ext=Array.isArray(o.ext)?o.ext:[]; S.stq=Array.isArray(o.stq)?o.stq:[]; S.goals=Array.isArray(o.goals)?o.goals:[]; S.foods=Array.isArray(o.foods)?o.foods:[]; S.shoes=Array.isArray(o.shoes)?o.shoes:[]; S.sync=obj(o.sync); S.supp=Object.assign({on:{},log:{}},obj(o.supp)); S.bk=obj(o.bk);
  S.mf=Object.assign({port:false,cold:false},obj(o.mf)); S.intro=['full','short','off'].indexOf(o.intro)>=0?o.intro:'full';
  S.motion=['auto','on','off'].indexOf(o.motion)>=0?o.motion:'auto'; S.motionAsked=!!o.motionAsked;
  S.voice=o.voice!==false; S.recapSeen=+o.recapSeen||0;
  S.runs=Array.isArray(o.runs)?o.runs:[]; S.hist=Array.isArray(o.hist)?o.hist:[];
  S.ptests=Array.isArray(o.ptests)?o.ptests:[]; S.tmlog=Array.isArray(o.tmlog)?o.tmlog:[];
  S.sess=o.sess&&o.sess.start&&o.sess.sets?Object.assign({tmMin:{},tasks:{},runs:{},prs:[],best:{},kg:{},rp:{}},o.sess):null;
  S.sound=o.sound!==false; S.aiKey=typeof o.aiKey==='string'?o.aiKey:''; S.aiUsed=+o.aiUsed||0;
  S.aiEffort=['low','medium','high'].indexOf(o.aiEffort)>=0?o.aiEffort:'medium';
  S.theme=THEMES[o.theme]?o.theme:'otel'; S.mode=['dark','light','auto'].indexOf(o.mode)>=0?o.mode:'dark'; S.bg=o.bg==='black'?'black':'anthr';
  /* designul v9 pornește o singură dată pe tema Oțel (antracit + albastru oțel); după aceea tema aleasă în Setări rămâne */
  if((+o.look||0)<9){ S.theme='otel'; await store.set(K.theme,'otel'); await store.set(K.look,9); }
  S.fx=['min','normal','max'].indexOf(o.fx)>=0?o.fx:'normal'; S.onb=!!o.onb;
  S.seenAch=Array.isArray(o.seenAch)?o.seenAch:null; S.seenLvl=typeof o.seenLvl==='number'?o.seenLvl:null;
  /* conversațiile din v3 au alt set de unelte și alt prompt: le închidem, altfel istoricul nu mai corespunde */
  if(o.aiChat&&Array.isArray(o.aiChat.msgs)&&o.aiChat.msgs.length&&o.aiChat.ver!==4){ S.aiChat=null; AI.note='Conversația veche a fost închisă după actualizarea aplicației. Începe una nouă.'; await store.set(K.aiChat,null); }
  else S.aiChat=o.aiChat&&Array.isArray(o.aiChat.msgs)?Object.assign({tools:{}},o.aiChat):null;
  await migrate(); await cfAchFix(); await planAbsMigrate(+o.planV||0);
  STC=null; S.loaded=true;
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
/* ---------- animația de deschidere ---------- */
const INTRO={on:false,leaving:false,done:null,mode:'full'};
/* v12: praf fin în lumina de studio, iar când cusătura inelului se închide, scântei argintii din jurul insignei */
const IN_T1=1.45; /* secunda (× k) la care cusătura se închide și apare insigna zilei */
function introParticles(mode){
  const cv=$('#introCv'); if(!cv||!cv.getContext) return;
  const ctx=cv.getContext('2d'), dpr=Math.min(2,devicePixelRatio||1), W=cv.width=innerWidth*dpr, H=cv.height=innerHeight*dpr;
  const cols=['#ffffff','#C9D1DA','#8E99A6'], N=mode==='full'?80:44, k=mode==='full'?1:.42;
  const ps=Array.from({length:N},(_,i)=>({x:Math.random()*W,y:Math.random()*H,r:(.4+Math.random()*1.2)*dpr,vx:(Math.random()-.5)*14*dpr,vy:-(6+Math.random()*24)*dpr,
    a:.2+Math.random()*.5,tw:Math.random()*6.283,c:cols[i%3],d:Math.random()*.8}));
  const sp=[]; let burst=false;
  const t0=performance.now(); let last=t0;
  const frame=now=>{ if(!INTRO.on) return; const t=(now-t0)/1000, dt=Math.min(.05,(now-last)/1000); last=now;
    const out=INTRO.leaving?clamp(1-(now-INTRO.leftAt)/350,0,1):1;
    if(!burst&&t>=IN_T1*k){ burst=true; const dl=$('.intro .in-lw'); if(dl){ const r=dl.getBoundingClientRect(), cx=(r.left+r.width/2)*dpr, cy=(r.top+r.height/2)*dpr, R0=r.width*.37*dpr;
      for(let i=0;i<(mode==='full'?64:36);i++){ const an=Math.random()*6.283, v=(170+Math.random()*380)*dpr;
        sp.push({x:cx+Math.cos(an)*R0,y:cy+Math.sin(an)*R0,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:0,L:.55+Math.random()*.6,w:(.8+Math.random()*1.4)*dpr,c:i%3?'#E4E8EE':'#ffffff'}); } } }
    ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='lighter';
    ps.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.tw+=dt*2.2; if(p.y<-10){ p.y=H+10; p.x=Math.random()*W; }
      const cone=1-Math.min(1,Math.abs(p.x/W-.5)*1.6), al=p.a*clamp((t-p.d)/1.2,0,1)*out*(.55+.45*Math.sin(p.tw))*(.35+.65*cone);
      if(al<.01) return; ctx.globalAlpha=al; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill(); });
    ctx.lineCap='round';
    sp.forEach(p=>{ if(p.l>=p.L) return; p.l+=dt; const f=Math.pow(.06,dt); p.vx*=f; p.vy*=f; p.vy+=60*dpr*dt; const x0=p.x, y0=p.y; p.x+=p.vx*dt; p.y+=p.vy*dt;
      const al=(1-p.l/p.L)*out; if(al<.02) return; ctx.globalAlpha=al; ctx.strokeStyle=p.c; ctx.lineWidth=p.w; ctx.beginPath(); ctx.moveTo(x0-(p.x-x0)*2.2,y0-(p.y-y0)*2.2); ctx.lineTo(p.x,p.y); ctx.stroke(); });
    requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}
function introStart(){
  const intro=$('#intro'); let mode='full';
  try{ const m=JSON.parse(localStorage.getItem(K.intro)||'"full"'); if(['full','short','off'].indexOf(m)>=0) mode=m; }catch(e){}
  try{ const lk=+JSON.parse(localStorage.getItem(K.look)||'0')||0, t=lk>=9?JSON.parse(localStorage.getItem(K.theme)||'null'):'otel'; if(THEMES[t]) S.theme=t; }catch(e){}
  try{ S.bg=JSON.parse(localStorage.getItem(K.bg)||'"anthr"')==='black'?'black':'anthr'; }catch(e){}
  try{ const md=JSON.parse(localStorage.getItem(K.mode)||'"dark"'); if(['dark','light','auto'].indexOf(md)>=0) S.mode=md; }catch(e){}
  applyTheme();
  try{ const m=JSON.parse(localStorage.getItem(K.motion)||'"auto"'); if(['auto','on','off'].indexOf(m)>=0) S.motion=m; }catch(e){}
  applyMotion();
  INTRO.mode=mode;
  INTRO.done=new Promise(res=>{ INTRO.resolve=res; });
  if(mode==='off'||motionOff()){ intro.remove(); $('.top .logo').classList.remove('wait'); INTRO.resolve(); return; }
  if(mode==='short') intro.classList.add('short');
  /* insigna zilei de azi (luni = 0), în centrul animației */
  { const ib=$('#inLogo'), src=DAY_PH['d'+((new Date().getDay()+6)%7)]; if(ib&&src) ib.src=src; }
  INTRO.on=true; introParticles(mode);
  setTimeout(()=>buzz([18,40,30]),Math.round(IN_T1*(mode==='full'?1000:420)));
  intro.addEventListener('click',introExit);
  setTimeout(introExit,mode==='full'?3700:1500);
}
/* ieșirea: insigna zboară în antet, poza se apropie, iar ecranul se strânge ca un iris în jurul logo-ului */
function introExit(){
  if(INTRO.leaving) return; INTRO.leaving=true; INTRO.leftAt=performance.now();
  const intro=$('#intro'), il=$('#inLogo'), hl=$('.top .logo');
  const finish=()=>{ INTRO.on=false; if(intro.isConnected) intro.remove(); hl.classList.remove('wait'); hl.classList.add('land'); setTimeout(()=>hl.classList.remove('land'),520);
    const v=$('#view'); v.classList.remove('anim'); void v.offsetWidth; v.classList.add('anim'); countUp(v); INTRO.resolve(); };
  try{
    const r1=il.getBoundingClientRect(), r2=hl.getBoundingClientRect(), cx=r2.left+r2.width/2, cy=r2.top+r2.height/2;
    const dx=cx-(r1.left+r1.width/2), dy=cy-(r1.top+r1.height/2), sc=r2.width/r1.width;
    il.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(${sc})`,opacity:1}],{duration:560,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
    intro.querySelectorAll('.in-word,.in-bar,.in-sub,.in-skip,.in-ring,.in-stitch,.in-sheen').forEach(el=>el.animate([{opacity:1},{opacity:0,transform:'translateY(14px)'}],{duration:240,fill:'forwards'}));
    const ph=intro.querySelector('.in-ph'); if(ph) ph.animate([{transform:'scale(1.03)'},{transform:'scale(1.12)'}],{duration:700,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
    const a=intro.animate([{clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${cx}px ${cy}px)`},{clipPath:`circle(${r2.width/2}px at ${cx}px ${cy}px)`}],
      {duration:640,delay:60,easing:'cubic-bezier(.7,0,.25,1)',fill:'forwards'});
    a.onfinish=finish; setTimeout(()=>{ if(intro.isConnected) finish(); },1100);
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
  if(!S.onb) setTimeout(onbOpen,200);
  else if(MQ_RM.matches&&S.motion==='auto'&&!S.motionAsked) setTimeout(()=>{ if(!SH&&!OB){ SH={kind:'motion'}; shRender(); } },600);
})();
