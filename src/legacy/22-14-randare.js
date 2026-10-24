/* =====================================================================
   14 · RANDARE
   ===================================================================== */
const VIEWS={azi:viewHome,plan:viewTrain,prog:viewProg,nutri:viewNutri,coach:viewCoach,set:viewSet,act:viewAct,tools:viewTools};
const NAV=[['azi','Acasă','home'],['plan','Antrenament','dumbbell'],['prog','Performanță','chart'],['nutri','Nutriție','flame'],['coach','Antrenor','coach']];
/* meniul lateral (desktop) are în plus paginile secundare */
const SIDE_X=[['act','Activitate','clock'],['tools','Unelte','tool']];
/* layoutul fiecărui ecran pe desktop: coloane pentru carduri, coloană îngustă pentru liste și formulare */
const VIEW_LAY={azi:'lay-home',plan:'lay-narrow',prog:'lay-mas',nutri:'lay-mas',coach:'lay-narrow',set:'lay-narrow',act:'lay-narrow',tools:'lay-mas'};
let lastTab=null;
function render(){
  STC=null; ACTC=null; TWC=null; TGC=null; ADC=null; IXC=null; WLC=null;
  if(!VIEWS[S.tab]) S.tab='azi';
  const v=$('#view'), changed=S.tab!==lastTab;
  v.innerHTML=(COVER&&BANDS[S.tab]?bandHTML(S.tab):'')+VIEWS[S.tab]();
  v.classList.remove('lay-home','lay-narrow','lay-mas'); v.classList.add(VIEW_LAY[S.tab]||'lay-narrow'); v.dataset.tab=S.tab;
  if(changed){ const oi=NAV.findIndex(n=>n[0]===lastTab), ni=NAV.findIndex(n=>n[0]===S.tab);
    v.dataset.dir=oi<0||ni<0?'':ni>oi?'r':'l'; v.classList.remove('anim'); void v.offsetWidth; v.classList.add('anim'); lastTab=S.tab; countUp(v); reveal(v); }
  else v.classList.remove('anim');
  renderNav(); renderSide(); renderTop(); renderPill(); renderFocus(); coverScroll();
  clearTimeout(render.nt); render.nt=setTimeout(notifTick,400);
  if(SH&&SH.kind==='ci') shRender();
  const ta=$('#aiIn'); if(ta) autosize(ta);
}
/* secțiunile de sub ecran apar lin când ajungi la ele (doar la schimbarea filei, nu la fiecare actualizare) */
let RVO=null;
function reveal(v){ if(RVO){ RVO.disconnect(); RVO=null; } if(motionOff()||!('IntersectionObserver' in window)) return;
  RVO=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); RVO&&RVO.unobserve(e.target); } }),{rootMargin:'0px 0px -6% 0px'});
  const obs=RVO; requestAnimationFrame(()=>{ if(RVO!==obs) return; [...v.children].forEach(el=>{ if(el.getBoundingClientRect().top>innerHeight*.98){ el.classList.add('rv'); obs.observe(el); } }); }); }
/* lumina care urmărește cursorul pe carduri (doar cu mouse) */
let spRaf=0, spEv=null;
document.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse') return; spEv=e; if(spRaf) return; spRaf=requestAnimationFrame(()=>{ spRaf=0; const c=spEv.target.closest&&spEv.target.closest('.card'); if(!c) return;
  const r=c.getBoundingClientRect(); c.style.setProperty('--mx',(spEv.clientX-r.left).toFixed(0)+'px'); c.style.setProperty('--my',(spEv.clientY-r.top).toFixed(0)+'px'); }); },{passive:true});
/* coperta de pe „Azi": antetul e transparent cât timp ești sus, iar poza urcă mai încet decât pagina */
let cvRaf=0;
function coverScroll(){ cvRaf=0; const ph=$(S.tab==='azi'?'.cv-ph':'.band-ph'), y=Math.max(0,scrollY);
  /* antetul transparent peste poză doar pe telefon, în tema întunecată (în rest poza e un card separat) */
  document.body.classList.toggle('ontop',!!ph&&y<24&&!isLight()&&innerWidth<1100);
  if(ph) ph.style.setProperty('--py',motionOff()?'0px':(Math.min(y,500)*.35).toFixed(1)+'px'); }
addEventListener('scroll',()=>{ if(!cvRaf) cvRaf=requestAnimationFrame(coverScroll); },{passive:true});
function renderTop(){
  $('#gear').innerHTML=ic('gear'); $('#gear').classList.toggle('on',S.tab==='set');
  const b=$('#bell'); if(b){ const n=typeof notifUnread==='function'?notifUnread():0; b.innerHTML=ic('bell')+(n?'<span class="dot-n"></span>':''); b.setAttribute('aria-label',n?'Notificări · '+n+' noi':'Notificări'); }
}
/* meniul lateral: aceleași ecrane ca bara de jos, plus Activitate și Unelte; jos, tema și Setările */
function renderSide(){
  const sd=$('#side'); if(!sd) return;
  const it=([k,l,icn],kb)=>`<button class="sb ${S.tab===k?'on':''}" data-a="tab" data-k="${k}" ${S.tab===k?'aria-current="page"':''}>${ic(icn)}<span>${l}</span>${k==='coach'&&AI.busy&&S.tab!=='coach'?'<span class="cnt">·</span>':kb?`<span class="kb">${kb}</span>`:''}</button>`;
  const lt=modeNow()==='light';
  sd.innerHTML=`<button class="side-br" data-a="tab" data-k="azi" aria-label="Acasă">${UI.logoSvg({cls:'logo',ticks:false})}
      <div class="brand">FALCO<small>Forță · anduranță</small></div></button>
    <button class="side-search" data-a="palOpen">${ic('search')}<span>Caută sau comandă</span></button>
    ${NAV.map((n,i)=>it(n,'Alt '+(i+1))).join('')}
    <div class="side-h">Mai mult</div>
    ${SIDE_X.map(n=>it(n)).join('')}
    <div class="side-bot">
      <button class="sb" data-a="modeToggle">${ic(lt?'moon':'sun')}<span>${lt?'Temă întunecată':'Temă luminoasă'}</span></button>
      ${it(['set','Setări','gear'])}</div>`;
}
function renderNav(){
  const nav=$('#nav'), i=NAV.findIndex(n=>n[0]===S.tab);
  if(!nav.firstChild) nav.innerHTML=`<div class="nav-in" style="--n:${NAV.length}"><i class="nav-ind"></i>${NAV.map(n=>`<button class="nb" data-a="tab" data-k="${n[0]}">${ic(n[2])}<span>${n[1]}</span></button>`).join('')}</div>`;
  nav.querySelectorAll('.nb').forEach((b,j)=>{ b.classList.toggle('on',j===i); b.setAttribute('aria-current',j===i?'page':'false');
    const bd=b.querySelector('.badge'), want=NAV[j][0]==='coach'&&AI.busy&&S.tab!=='coach';
    if(want&&!bd) b.insertAdjacentHTML('beforeend','<span class="badge"></span>'); if(!want&&bd) bd.remove(); });
  const ind=nav.querySelector('.nav-ind'); ind.style.opacity=i<0?'0':'1'; if(i>=0) ind.style.transform=`translateX(${i*100}%)`;
}
function renderPill(){
  const r=$('#pillRoot'), show=S.sess&&!S.fxOpen;
  document.body.classList.toggle('has-pill',!!show);
  if(!show){ r.innerHTML=''; return; }
  r.innerHTML=`<button class="pill" data-a="fxOpen"><span class="dot"></span>Antrenament <b id="pillClock">${fmtClock(sessSec())}</b>
    ${S.rest?`<span class="rb">· pauză <b id="pillRest">${fmtClock((S.rest.end-Date.now())/1000)}</b></span>`:''}${ic('right')}</button>`;
}
function countUp(root){
  root.querySelectorAll('[data-cnt]').forEach(el=>{ const to=parseFloat(el.dataset.cnt); if(!isFinite(to)) return;
    const final=el.textContent, dec=+el.dataset.dec||0, dur=450; let t0=null;
    const st=now=>{ if(!el.isConnected) return; if(t0==null) t0=now; const k=clamp((now-t0)/dur,0,1), e=1-Math.pow(1-k,3);
      el.textContent=k<1?(to*e).toFixed(dec):final; if(k<1) requestAnimationFrame(st); };
    requestAnimationFrame(st); });
}
/* toast; cu act={l:'Anulează',f:async()=>…} primește un buton și stă 6 secunde (ex. anularea unei ștergeri) */
function toast(title,sub,kind,act){
  document.querySelectorAll('.toast').forEach(x=>x.remove());
  const t=document.createElement('div'); t.className='toast '+(kind||'')+(act?' act':''); t.setAttribute('role','status');
  t.innerHTML=`<div class="tx-w"><b>${esc(title)}</b>${sub?`<span>${esc(sub)}</span>`:''}</div>${act?`<button class="btn sm">${esc(act.l)}</button>`:''}`;
  document.body.appendChild(t); setTimeout(()=>t.remove(),act?6000:3000);
  if(act){ const b=t.querySelector('.btn'); b.addEventListener('click',async()=>{ t.remove(); try{ await act.f(); }catch(e){ errLog(e&&e.message,'toast'); } }); }
}
function burstAt(x,y,n){
  if(S.fx==='min') n=Math.min(n||24,12);
  const b=document.createElement('div'); b.className='burst'; b.style.left=x+'px'; b.style.top=y+'px';
  const cols=[TH().ac,TH().ac2,isLight()?'#0D0D10':'#FFFFFF',COL().run,COL().warn];
  for(let i=0;i<(n||24)*(S.fx==='max'?1.5:1);i++){ const a=Math.random()*Math.PI*2, d=70+Math.random()*(S.fx==='max'?190:130), e=document.createElement('i');
    e.style.cssText=`--x:${(Math.cos(a)*d).toFixed(0)}px;--y:${(Math.sin(a)*d-50).toFixed(0)}px;--r:${(Math.random()*540-270).toFixed(0)}deg;--c:${cols[i%cols.length]};--t:${(.6+Math.random()*.5).toFixed(2)}s`;
    b.appendChild(e); }
  document.body.appendChild(b); setTimeout(()=>b.remove(),1300);
}
function flash(){ const f=document.createElement('div'); f.className='flash'; document.body.appendChild(f); setTimeout(()=>f.remove(),550); }
function floatText(el,text){ if(!el||!el.getBoundingClientRect) return; const r=el.getBoundingClientRect(), f=document.createElement('div'); f.className='float'; f.textContent=text;
  f.style.left=(r.left+r.width/2)+'px'; f.style.top=(r.top)+'px'; document.body.appendChild(f); setTimeout(()=>f.remove(),950); }
function shake(sel){ const el=$(sel); if(!el) return; el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:220}); el.focus(); }
function arm(el){
  if(!el.dataset.html) el.dataset.html=el.innerHTML;
  el.classList.add('armed'); el.innerHTML=el.dataset.confirm==='?'?ic('trash'):esc(el.dataset.confirm);
  clearTimeout(el._t); el._t=setTimeout(()=>{ el.classList.remove('armed'); el.innerHTML=el.dataset.html; },3000);
}
