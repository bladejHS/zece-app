/* =====================================================================
   10 · ANTRENAMENTUL LIVE — minimalist și rapid: exercițiul curent, seria, kg, repetări,
   pauza și următorul exercițiu. Merge pe zilele planului Hybrid365.
   ===================================================================== */
const sessSec=()=>S.sess?Math.max(0,Math.floor((Date.now()-S.sess.start)/1000)):0;
/* ziua sesiunii: din plan (săptămână + zi) */
const sessDay=s=>dayFor(s.w,s.d);
const sessIsDone=(s,x)=>isDone(s.w,s.d,x);
const sessKey=s=>s.cur;
/* v10: abdomenul de la final e opțional — după ultimul exercițiu obligatoriu poți termina sau continua cu el */
const lastReq=s=>absFrom(s.d)-1;
const fxEnd=(day,x)=>x===day.ex.length-1||x===lastReq(S.sess);
const absOffer=(day,x)=>x===lastReq(S.sess)&&x<day.ex.length-1?`<button class="btn ghost wide fx-abs" data-a="fxNext">${ic('plus')} Fac și abdomenul · opțional ${ic('right')}</button>`:'';
const optBadge=e=>e.opt?`<span class="tag opt">opțional</span> `:'';
async function markDone(s,x,on){ await setDone(s.w,s.d,x,on); }
async function persistSess(){ await store.set(K.sess,S.sess); }
/* întrebarea de dinainte: cum te simți (somn, energie, febră) — se poate sări */
let RD=null;
function rdOpen(w,d){ const j=jOf(todayKey()), h=+j.sleep, sl=!h?(j.sleepQ||3):h<5?1:h<6?2:h<7?3:h<8?4:5; RD={w,d,sleep:sl,energy:j.energy||3,sore:j.sore||2}; rdRender(); }
const rdScore=r=>Math.round(((r.sleep-1)+(r.energy-1)+(5-r.sore))/12*100);
function rdRender(){
  const r=$('#ovRoot'); if(!RD){ if(!r.querySelector('.pr-m')) r.innerHTML=''; return; }
  const sc=rdScore(RD), v=sc>=70?['Zi bună','mergi pe plan și încearcă progresia.','good']:sc>=45?['Zi normală','urmează planul, fără eroisme.','']:['Zi grea','păstrează greutățile și oprește-te dacă apare durere. Sugestiile de azi nu cresc greutatea.','bad'];
  const q=(k,t,lo,hi)=>`<div class="rd-q"><b>${t}</b><div class="scale">${[1,2,3,4,5].map(i=>`<button class="${RD[k]===i?'on':''}" data-a="rd" data-k="${k}" data-i="${i}">${i}</button>`).join('')}</div>
    <div class="scale-l"><span>${lo}</span><span>${hi}</span></div></div>`;
  r.innerHTML=`<div class="ov" data-a="rdClose"><div class="sheet" role="dialog" aria-label="Cum te simți azi"><div class="grab"></div>
    <div class="eyebrow">${DAYN[RD.d]} · ${esc(PLAN[RD.d].t)}</div><div class="h2" style="margin-top:6px">Cum te simți azi?</div>
    ${q('sleep','Somnul de azi-noapte','foarte prost','excelent')}${q('energy','Energia','fără','maximă')}${q('sore','Febră musculară / dureri','deloc','mare')}
    <div class="rd-score"><div class="big" style="color:${v[2]==='good'?'var(--ok)':v[2]==='bad'?'var(--warn)':'var(--tx)'}">${sc}</div><div><b>${v[0]}</b><div class="sm mu">${v[1]}</div></div></div>
    <div class="inrow"><button class="btn ghost" data-a="rdSkip">Sari peste</button><button class="btn pri" style="flex:1" data-a="rdGo">${ic('play')} Începe</button></div></div></div>`;
}
const sessBase=()=>({start:Date.now(),h:new Date().getHours(),sets:{},runs:{},tasks:{},prs:[],best:{},kg:{},rp:{},tmMin:{}});
async function startSess(w,d,ready){
  if(S.sess){
    if(S.sess.w!==w||S.sess.d!==d) toast('Ai deja un antrenament pornit','Termină-l sau renunță la el înainte să începi altul.','info');
    S.fxOpen=true; render(); return;
  }
  const adj=adjFor(w,d), day=dayFor(w,d); let cur=day.ex.findIndex((_,x)=>!isDone(w,d,x)); if(cur<0) cur=0;
  S.sess=Object.assign(sessBase(),{w,d,cur,ready:ready||null,adj});
  S.fxOpen=true; S.fxDir=''; await persistSess(); keepAwake(true); keepAlive(true); render();
}
/* pauza: inel mare, −15 / +15 secunde și „Sari", plus ce urmează */
function restBlock(nextTxt){
  if(!S.rest) return '';
  const left=Math.max(0,(S.rest.end-Date.now())/1000), C=2*Math.PI*36;
  return `<div class="restbox ${left<=3?'urgent':''}" id="restBox">
    <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="36" fill="none" style="stroke:var(--run-bg)" stroke-width="7"/>
      <circle id="restRing" cx="42" cy="42" r="36" fill="none" style="stroke:var(--run);transition:stroke-dashoffset .25s linear" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-left/S.rest.total)).toFixed(2)}" transform="rotate(-90 42 42)"/></svg>
    <div class="sp"><div class="k">${esc(S.rest.lbl||'Pauză')}</div><div class="t" id="restT">${fmtClock(left)}</div>${nextTxt?`<div class="xs mu" style="margin-top:4px">${nextTxt}</div>`:''}</div>
    <div class="acts"><div class="rs-b"><button class="btn sm" data-a="restAdd" data-i="-15" aria-label="Minus 15 secunde">−15</button><button class="btn sm" data-a="restAdd" data-i="15" aria-label="Plus 15 secunde">+15</button></div>
      <button class="btn sm ghost" data-a="restSkip">${ic('skip')} Sari</button></div></div>`;
}
const PLATES=[[25,'#B0645A',64],[20,'#4E9AAB',60],[15,'#E8C46C',54],[10,'#43A047',48],[5,'#ECEFF1',38],[2.5,'#455A64',32],[1.25,'#B0BEC5',26]];
function platesHTML(kg,bar=20){
  kg=+kg||0; if(kg<bar) return `<div class="plates-t">Sub ${bar} kg nu se poate pe bara aleasă: folosește o bară mai ușoară.</div>`;
  let side=(kg-bar)/2; const out=[]; PLATES.forEach(([p])=>{ while(side>=p-1e-9){ out.push(p); side-=p; } });
  const rest=Math.round(side*200)/100;
  return `<div class="plates"><div class="rod"></div>${out.map((p,i)=>{ const pl=PLATES.find(x=>x[0]===p); return `<i class="pl" style="--h:${pl[2]}px;--c:${pl[1]};--i:${i}" title="${num(p)} kg"></i>`; }).join('')}<div class="collar"></div></div>
    <div class="plates-t">${out.length?'Pe fiecare parte: <b>'+out.map(p=>num(p,2)).join(' + ')+' kg</b>':'Doar bara'} · bara ${bar} kg${rest?' · '+num(rest,2)+' kg nu se pot pune exact':''}</div>`;
}
function warmSteps(kg,n){ const bar=BARBELL.test(n), r=x=>bar?Math.max(20,Math.round(x/2.5)*2.5):Math.max(2,Math.round(x/2)*2);
  const out=[]; if(bar) out.push([20,10]); [[.4,8],[.6,5],[.8,3],[.9,1]].forEach(([p,rep])=>{ const w=r(kg*p); if(w<kg&&!out.some(x=>x[0]===w)) out.push([w,rep]); }); return out; }
function auxHTML(e,kg,sets){
  const k=+kg||0;
  const warm=COMPOUND.test(e.n)&&!(sets||[]).length&&k>=30?`<div class="warm">${ic('flame')} Încălzire: ${warmSteps(k,e.n).map(([w,r])=>`<span>${num(w)}×${r}</span>`).join('')}</div>`:'';
  return warm+(BARBELL.test(e.n)?platesHTML(k,+prof().bar||20):'');
}
function updAux(){ const s=S.sess, el=$('#aux'); if(!s||!el) return; const e=sessDay(s).ex[s.cur]; if(!e) return;
  el.innerHTML=auxHTML({n:e.n},($('#inKg')||{}).value,s.sets[s.cur]); }
/* ce urmează după exercițiul curent */
function nextTxt(day,x){ const n=day.ex[x+1]; if(!n) return 'Ultimul exercițiu'; return (n.opt&&!day.ex[x].opt?'Opțional, dacă vrei: ':'Urmează: ')+'<b class="tx">'+esc(n.n)+'</b>'+(short(n)?' · '+esc(short(n)):''); }
/* confirmarea scurtă după o serie („SERIE TERMINATĂ") */
const lvDone=()=>S.lvOk&&Date.now()-S.lvOk.t<1600?`<div class="lv-done">${ic('check')} ${esc(S.lvOk.txt)}</div>`:'';
function fxLift(e,x){
  const s=S.sess, day=sessDay(s), sets=s.sets[x]||[], sg=suggest(e), inc=incFor(e.n), isLast=fxEnd(day,x);
  let kg=s.kg[x]!=null?s.kg[x]:sets.length?sets[sets.length-1][0]:sg.kg!=null?sg.kg:'';
  const rp=s.rp[x]!=null?s.rp[x]:sets.length?sets[sets.length-1][1]:sg.reps, complete=sets.length>=e.sets, setNo=Math.min(sets.length+1,e.sets);
  return `
    <div class="eyebrow">${optBadge(e)}Exercițiul curent · ${e.sets} serii × ${e.lo}${e.hi!==e.lo?'–'+e.hi:''} · pauză ${e.rest} s</div>
    <div class="fx-n">${esc(e.n)}</div>
    <div class="lv-chips">${e.adj?`<span class="adjb">${ic('coach')} Ajustat azi: ${esc(e.adj.join(' · '))}</span>`:''}
      <button class="chip" data-a="tech" data-k="${esc(e.n)}">${ic('info')} Cum se execută?</button></div>
    ${exNote(e.n)?`<button class="exnote" data-a="tech" data-k="${esc(e.n)}">${ic('edit')}<span>${esc(exNote(e.n))}</span></button>`:''}
    ${!sets.length&&x===day.ex.findIndex(q=>q.kind==='lift')&&!Object.keys(s.sets).length?`<button class="btn ghost sm wide" style="margin-top:10px" data-a="tmPick" data-k="wup">${ic('flame')} Încălzire generală · 5 min</button>`:''}
    ${s.ready&&s.ready.score<45?`<div class="easy">${ic('alert')} Zi grea (${s.ready.score}) — fără creșteri azi</div>`:''}
    <div class="lv-set">${complete?`<b>${ic('check')}</b><span>Toate cele ${e.sets} serii sunt notate</span>`:`<span>Seria</span><b>${setNo}</b><span>din ${e.sets}</span>`}</div>
    <div class="sets">${Array.from({length:Math.max(e.sets,sets.length)},(_,i)=>{ const st=sets[i], pr=st&&(s.prs||[]).some(p=>p.n===e.n&&p.i===i);
      return `<div class="sd ${st?'ok':i===sets.length?'cur':''}">${st?`<b>${num(st[0])}</b> × <b>${st[1]}</b>${pr?'<span class="tag pr">PR</span>':''}${typeof st[2]==='string'&&SET_TAG[st[2]]?`<small>${SET_TAG[st[2]]}</small>`:''}`:'Seria '+(i+1)}</div>`; }).join('')}</div>
    ${lvDone()}
    ${restBlock(complete?nextTxt(day,x):'')}
    <div class="logger">
      <div class="stp"><label for="inKg">kg</label><div class="r"><button data-a="kg" data-v="${-inc}" aria-label="minus ${inc} kg">−</button>
        <input id="inKg" type="number" step="0.5" inputmode="decimal" value="${kg===''?'':num(kg,2)}" placeholder="0"><button data-a="kg" data-v="${inc}" aria-label="plus ${inc} kg">+</button></div></div>
      <div class="stp"><label for="inRp">repetări</label><div class="r"><button data-a="rp" data-v="-1" aria-label="minus o repetare">−</button>
        <input id="inRp" type="number" inputmode="numeric" value="${rp}"><button data-a="rp" data-v="1" aria-label="plus o repetare">+</button></div></div></div>
    ${complete
      ?`<button class="btn pri xl wide glow fx-cta" data-a="${isLast?'fxFinish':'fxNext'}">${isLast?ic('trophy')+' Termină antrenamentul':'Următorul exercițiu '+ic('right')}</button>
        ${absOffer(day,x)}<div class="fx-sub"><button class="btn ghost" data-a="logSet">${ic('plus')} Încă o serie</button>${sets.length?`<button class="btn ghost" data-a="undoSet">Șterge ultima</button>`:''}</div>`
      :`<button class="btn pri xl wide ${S.rest?'':'glow'} fx-cta lv-cta" data-a="logSet">${ic('check')} Seria ${setNo} terminată</button>
        ${sets.length?`<div class="fx-sub"><button class="btn ghost" data-a="undoSet">Șterge ultima serie</button><button class="btn ghost" data-a="exDone">Gata cu exercițiul</button></div>`:''}`}
    <div class="sugg ${sg.kind}">${ic(sg.kind==='up'?'trophy':'bolt')}<span>${sg.txt}</span></div>
    ${sg.last?`<div class="last">Data trecută (${relDay(sg.d)}): <b>${esc(sg.last)}</b></div>`:''}
    <details class="lv-more" ${BARBELL.test(e.n)||COMPOUND.test(e.n)?'':''}><summary>${ic('dumbbell')} Discuri și încălzire</summary><div id="aux">${auxHTML(e,kg,sets)}</div></details>
    ${complete?'':`<div class="lv-next">${nextTxt(day,x)}</div>`}`;
}
function fxRun(e,x){
  const s=S.sess, done=s.runs[x], day=sessDay(s), isLast=fxEnd(day,x), pre=tmPresetFor(e,day,s.w);
  const mins=s.tmMin[x]!=null?s.tmMin[x]:e.planMin||'';
  return `
    <div class="eyebrow">${ic('run')} Alergare · ${RUNK[runKindOf(day.run)]}</div>
    <div class="fx-n">${esc(e.n)}</div><div class="fx-p">${esc(e.p)}</div>${e.adj?`<div class="adjb">${ic('coach')} Ajustat azi: ${esc(e.adj.join(' · '))}</div>`:''}
    ${(()=>{ const z=hrZones().z[e.n==='Threshold'?3:1]; return `<div class="tag run" style="margin-top:8px">${ic('target')} ${e.n==='Threshold'?'Zona 4 la reprize':'Zona 2'}: ${z.lo}–${z.hi} bpm</div>`; })()}
    ${done?`<div class="done-box">${ic('check')} ${num(done.km,2)} km în ${num(done.min)} min · ${fmtPace(paceOf(done))}</div>
      <button class="btn pri xl wide glow" data-a="${isLast?'fxFinish':'fxNext'}">${isLast?'Termină antrenamentul':'Următorul exercițiu '+ic('right')}</button>${absOffer(day,x)}`
    :`${pre?`<button class="btn blue wide" style="margin-top:14px" data-a="tmFor" data-x="${x}">${ic('clock')} Pornește cronometrul${e.n==='Threshold'?' de intervale':''}</button>`:''}
      <div class="logger" style="margin-top:14px">
      <div class="stp"><label for="inKm">km</label><div class="r"><button data-a="km" data-v="-0.5">−</button>
        <input id="inKm" type="number" step="0.01" inputmode="decimal" placeholder="0"><button data-a="km" data-v="0.5">+</button></div></div>
      <div class="stp"><label for="inMin">minute</label><div class="r"><button data-a="mn" data-v="-1">−</button>
        <input id="inMin" type="number" step="0.1" inputmode="decimal" value="${mins}"><button data-a="mn" data-v="1">+</button></div></div></div>
      <div class="pace" id="paceOut">Ritmul apare când completezi distanța.</div>
      <button class="btn pri xl wide fx-cta" data-a="logRun">${ic('check')} Salvează alergarea</button>
      <div class="fx-sub"><button class="btn ghost" data-a="exDone">Am făcut-o, fără date</button></div>`}
    <div class="lv-next">${nextTxt(day,x)}</div>`;
}
function fxTask(e,x){
  const s=S.sess, day=sessDay(s), on=sessIsDone(s,x), isLast=fxEnd(day,x), pre=tmPresetFor(e,day,s.w);
  return `
    <div class="eyebrow">${optBadge(e)}${ic(day.cat==='rest'?'leaf':'bolt')} ${day.cat==='rest'?'Recuperare':'Bloc'}</div>
    <div class="fx-n">${esc(e.n)}</div><div class="fx-p" style="font-size:16px;line-height:1.6">${esc(e.p)}</div>
    ${movesHTML(e)}
    ${on?`<div class="done-box">${ic('check')} Făcut.</div>`:''}
    ${pre&&!on?`<button class="btn blue wide xl" style="margin-top:16px" data-a="tmFor" data-x="${x}">${ic('clock')} Pornește cronometrul</button>`:''}
    <button class="btn pri xl wide ${on?'':'glow'} fx-cta" data-a="${on?(isLast?'fxFinish':'fxNext'):'exDone'}">${on?(isLast?'Termină antrenamentul':'Următorul '+ic('right')):ic('check')+' Gata'}</button>
    ${on?absOffer(day,x):''}<div class="lv-next">${nextTxt(day,x)}</div>`;
}
/* reperele de execuție pentru blocurile din plan care nu au serii: conditioning, finisher, încălzirea cu drills */
function movesHTML(e){
  const pick=ns=>MOVES.filter(m=>ns.indexOf(m[0])>=0);
  const list=/^Conditioning/.test(e.n)?pick(['Wall Balls','Burpee Broad Jumps','Kettlebell Swings','Push Ups','Ski / Row 250 m']):/^Power finisher/.test(e.n)?pick(['Med Ball Chest Throws','Plyo Push Ups'])
    :e.n==='Warm up'&&/drills/.test(e.p)?DRILLS.map(([n,h])=>[n,[h]]):null;
  if(!list) return '';
  return `<details class="notes moves"><summary>${ic('info')} Cum se execută mișcările</summary>${list.map(([n,cs])=>`<div class="mv"><b>${esc(n)}</b>${cs.map(c=>`<p>${esc(c)}</p>`).join('')}</div>`).join('')}</details>`;
}
let fxWasOpen=false;
function renderFocus(){
  const root=$('#fxRoot');
  if(S.summary){ root.innerHTML=summaryHTML(); document.body.classList.add('lock'); fxWasOpen=true; return; }
  if(!S.sess||!S.fxOpen){
    const el=root.firstElementChild;
    if(el&&fxWasOpen){ el.classList.add('leave'); setTimeout(()=>{ if(!(S.sess&&S.fxOpen)&&!S.summary) root.innerHTML=''; },190); } else root.innerHTML='';
    fxWasOpen=false; updLock(); return;
  }
  const s=S.sess, day=sessDay(s), n=day.ex.length;
  const x=n?clamp(s.cur,0,n-1):0, e=day.ex[x];
  const prev=root.querySelector('.fx'), keepScroll=prev?prev.scrollTop:0;
  const body=!e?'':e.kind==='lift'?fxLift(e,x):e.kind==='run'?fxRun(e,x):fxTask(e,x);
  root.innerHTML=`<div class="fx ${fxWasOpen?'':'enter'}" role="dialog" aria-label="Antrenament"><div class="fx-in">
    <div class="fx-top"><button class="ib" data-a="fxMin" aria-label="Minimizează">${ic('down')}</button>
      <div class="fx-tt"><div class="eyebrow">S${s.w+1} · ${DAYN[s.d]}${n?' · '+(x+1)+'/'+n:''}</div><div class="t">${esc(day.t)}</div></div>
      ${hrChip()}<div class="fx-clock" id="fxClock">${fmtClock(sessSec())}</div></div>
    ${n?`<div class="fx-prog">${day.ex.map((q,i)=>`<button class="${i===x?'cur':sessIsDone(s,i)?'ok':''} ${q.opt?'opt':''}" data-a="fxGo" data-x="${i}" aria-label="${esc(q.n)}"></button>`).join('')}</div>`:''}
    <div class="fx-body ${S.fxDir}">${body}</div>
    ${n?`<div class="fx-nav"><button class="btn ghost" data-a="fxPrev" ${x===0?'disabled':''}>${ic('left')} Înapoi</button>
      ${x<n-1&&x!==lastReq(s)?`<button class="btn" data-a="fxNext">Următorul ${ic('right')}</button>`:`<button class="btn pri" data-a="fxFinish">${ic('trophy')} Termină</button>`}</div>
      ${x>lastReq(s)&&x<n-1?`<button class="btn ghost wide sm" style="margin-top:8px" data-a="fxFinish">${ic('trophy')} Termină aici, fără restul abdomenului</button>`:''}`:''}
    <button class="btn ghost wide sm danger fx-quit" data-a="fxQuit" data-confirm="Sigur? Seriile notate rămân">Renunță la sesiune</button>
  </div></div>`;
  S.fxDir=''; fxWasOpen=true; document.body.classList.add('lock');
  const fx=root.querySelector('.fx'); if(fx&&keepScroll) fx.scrollTop=keepScroll;
  updPace();
}
function summaryHTML(){
  const m=S.summary;
  return `<div class="fx ${fxWasOpen?'':'enter'}"><div class="fx-in">
    <div class="sum-h"><div class="cc-ic">${ic('trophy')}</div><div class="eyebrow" style="justify-content:center">S${m.w+1} · ${DAYN[m.d]} · ciclul ${m.cyc}</div>
      <div class="h1">${esc(m.t)}</div><div class="mu">Antrenament terminat. Bună treabă.</div></div>
    <div class="kpis">
      <div class="kpi"><div class="k">Durată</div><div class="v">${fmtClock(m.dur)}</div></div>
      <div class="kpi"><div class="k">Serii</div><div class="v">${m.sets}</div></div>
      <div class="kpi"><div class="k">${m.km?'Distanță':'Volum'}</div><div class="v">${m.km?num(m.km,2)+'<small>km</small>':Math.round(m.vol)+'<small>kg</small>'}</div></div></div>
    <div class="card"><div class="eyebrow">${ic('flame')} Cât de greu a fost? (RPE)</div>
      <div class="chips" style="margin-top:10px">${Array.from({length:10},(_,i)=>`<button class="chip ${m.rpe===i+1?'on':''}" data-a="sumRpe" data-i="${i+1}" style="min-width:40px">${i+1}</button>`).join('')}</div>
      <div class="note">1 = foarte ușor · 10 = efort maxim. Intră în calculul încărcării și al pregătirii de mâine.</div></div>
    ${m.hrS?`<div class="card"><div class="row"><div class="eyebrow sp">${ic('heart')} Puls</div><span class="xs mu">medie <b>${m.hrS.avg}</b> · max <b>${m.hrS.max}</b> bpm</span></div>
      <div class="hr-sp">${sparkSVG(m.hrS.pts,TH().ac,60)}</div>
      <div class="zbar">${m.hrS.z.map((s_,i)=>s_?`<i style="flex:${s_};background:${HRZC()[i]}" title="Z${i+1}"></i>`:'').join('')}</div>
      <div class="zleg">${m.hrS.z.map((s_,i)=>`<span><b style="color:${HRZC()[i]}">Z${i+1}</b> ${Math.round(s_/60)} min</span>`).join('')}</div></div>`:''}
    ${m.prList.length?`<div class="card"><div class="eyebrow">${ic('trophy')} Recorduri noi</div>${m.prList.map(p=>`<div class="pr-row"><span class="tag pr">PR</span><b>${esc(p.n)}</b>
      <span class="xs mu">${num(p.w)}×${p.r}</span><span class="v">${p.prev}→${p.v}</span></div>`).join('')}</div>`:''}
    ${m.absT?`<div class="note">${ic(m.absN?'check':'info')} Abdomen opțional: ${m.absN?m.absN+' din '+m.absT+' exerciții făcute':'sărit azi — ziua e completă oricum'}.</div>`:''}
    ${m.skipped.length?`<div class="note">Fără date notate: ${m.skipped.map(esc).join(', ')}. Ziua e bifată oricum, ca ciclul să meargă mai departe.</div>`:''}
    ${stOn()&&stCanWrite()?`<div class="note st-sum" id="stSum">${stSumTxt(m)}</div>`:''}
    <button class="btn pri xl wide glow" style="margin-top:18px" data-a="sumClose">${ic('check')} Gata</button>
    <button class="btn ghost wide" style="margin-top:10px" data-a="sumAsk">${ic('coach')} Ce spune antrenorul AI?</button>
    <button class="btn ghost wide" style="margin-top:10px" data-a="sumShare">${ic('upload')} Distribuie ca imagine</button>
  </div></div>`;
}
function updPace(){
  const o=$('#paceOut'); if(!o) return;
  const km=parseFloat(($('#inKm')||{}).value), mn=parseFloat(($('#inMin')||{}).value);
  o.innerHTML=km>0&&mn>0?`Ritm: <b>${fmtPace(mn/km)}</b>`:'Ritmul apare când completezi distanța.';
}
/* verificarea datelor: o valoare neobișnuită (de 2,5 ori peste cea mai grea serie, peste 60 de repetări) cere o a doua apăsare */
function setSane(n,w,r,btn){
  const top=Math.max(0,...liftHist(n).map(e=>Math.max(0,...e.s.map(s=>+s[0]||0))));
  const odd=(top>=20&&w>top*2.5)||(w>400)||r>60;
  if(odd&&btn&&!btn.dataset.ok){ btn.dataset.ok='1'; toast('Verifică valorile',num(w)+' kg × '+r+(top?' (cea mai grea serie de până acum: '+num(top)+' kg)':'')+'. Apasă din nou ca să salvezi.','info'); setTimeout(()=>{ if(btn) delete btn.dataset.ok; },5000); return false; }
  if(btn) delete btn.dataset.ok; return true;
}
/* o serie nouă: record (1RM estimat sau greutate) → moment discret la primul record al exercițiului din sesiune */
async function recordSet(n,w,rp,tag,pIdx){
  const s=S.sess, before=bestE1(n,todayKey()), bw=Math.max(0,...liftHist(n).filter(e=>e.d<todayKey()).map(e=>Math.max(0,...e.s.map(q=>+q[0]||0)))), v=e1rm(w,rp);
  await addSet(n,w,rp,tag);
  const isE1=before>0&&v>before&&v>(s.best[n]||0), isW=bw>0&&w>bw&&w>((s.bestW||{})[n]||0);
  if(isE1||isW){ const first=!s.prs.some(p=>p.n===n);
    if(isE1){ s.best[n]=v; s.prs.push({n,i:pIdx,w,r:rp,v,prev:Math.max(before,...s.prs.filter(p=>p.n===n).map(p=>p.v))}); }
    if(isW){ s.bestW=Object.assign({},s.bestW,{[n]:w}); }
    if(first) prMoment({t:'Record · '+n,v:isE1?v+' kg 1RM estimat':num(w)+' kg',p:isE1?before+' kg':num(bw)+' kg',s:num(w)+' kg × '+rp});
    else toast('Record · '+n,num(w)+' kg × '+rp+(isE1?' → 1RM ~'+v+' kg':''),'');
  } else buzz(25);
}
async function logSet(btn){
  const s=S.sess, day=sessDay(s), x=s.cur, e=day.ex[x]; if(!e) return;
  const kg=parseFloat($('#inKg').value), rp=parseInt($('#inRp').value,10);
  if(!(rp>0)){ shake('#inRp'); return; }
  const w=isFinite(kg)&&kg>=0?Math.round(kg*100)/100:0;
  if(!setSane(e.n,w,rp,btn)) return;
  const sets=s.sets[x]||[];
  await recordSet(e.n,w,rp,null,sets.length);
  s.sets[x]=sets.concat([[w,rp]]); s.kg[x]=w; s.rp[x]=rp;
  S.lvOk={t:Date.now(),txt:'Seria '+s.sets[x].length+' notată · '+num(w)+' kg × '+rp};
  if(s.sets[x].length>=e.sets&&!sessIsDone(s,x)) await markDone(s,x,true);
  startRest(e.rest);
  await persistSess(); renderFocus();
}
async function undoSet(){
  const s=S.sess, day=sessDay(s), x=s.cur, e=day.ex[x]; if(!e) return;
  const a=(s.sets[x]||[]).slice(); if(!a.length) return;
  const [w,r]=a.pop(); s.sets[x]=a; await removeSet(e.n,w,r);
  s.prs=s.prs.filter(p=>!(p.n===e.n&&p.i===a.length)); s.best[e.n]=Math.max(0,...s.prs.filter(p=>p.n===e.n).map(p=>p.v));
  if(a.length<e.sets&&sessIsDone(s,x)) await markDone(s,x,false);
  stopRest(); await persistSess(); renderFocus();
}
async function logRun(){
  const s=S.sess, day=sessDay(s), x=s.cur;
  const km=parseFloat($('#inKm').value)||0, mn=parseFloat($('#inMin').value)||0;
  if(!(km>0)&&!(mn>0)){ shake('#inKm'); return; }
  const run={date:todayKey(),kind:runKindOf(day.run),km:Math.round(km*100)/100,min:Math.round(mn*10)/10};
  const hx=s.hr&&s.hr.ex[x]; if(hx&&hx.n>=10) run.hr=Math.round(hx.sum/hx.n);
  await save('runs',(S.runs||[]).concat([run])); s.runs[x]=run;
  await markDone(s,x,true); buzz(40); await persistSess(); renderFocus();
}
async function exDone(){ const s=S.sess; s.tasks[s.cur]=1; await markDone(s,s.cur,true); buzz(25);
  const day=sessDay(s); if(s.cur<day.ex.length-1&&s.cur!==lastReq(s)&&day.ex[s.cur].kind!=='task'){ s.cur++; S.fxDir='r'; }
  await persistSess(); renderFocus(); }
async function finishSess(){
  const s=S.sess; if(!s) return; const day=sessDay(s);
  { const log=Object.assign({},S.wlog), k=dKey(s.w,s.d), dd=Object.assign({},log[k]||{});
    day.ex.forEach((e,x)=>{ if(!e.opt) dd[eId(s.w,s.d,x)]=1; }); log[k]=dd; await save('wlog',log); }
  let sets=0,vol=0; Object.values(s.sets).forEach(a=>a.forEach(([w,r])=>{ sets++; vol+=w*r; }));
  const km=Object.values(s.runs).reduce((a,r)=>a+(+r.km||0),0);
  const has=x=>{ const e=day.ex[x]; return e.kind==='lift'?(s.sets[x]||[]).length:e.kind==='run'?s.runs[x]||s.tasks[x]:s.tasks[x]; };
  const skipped=day.ex.filter((e,x)=>!e.opt&&!has(x)).map(e=>e.n), absN=day.ex.filter((e,x)=>e.opt&&(has(x)||isDone(s.w,s.d,x))).length;
  const rec={date:todayKey(),dur:sessSec(),end:Date.now(),h:s.h,t:day.t,sets,vol:Math.round(vol),km:Math.round(km*100)/100,prs:s.prs.length,ready:s.ready?s.ready.score:null};
  Object.assign(rec,{cyc:cyc(),w:s.w,d:s.d});
  const hs=hrSum(s.hr); if(hs) rec.hr={avg:hs.avg,max:hs.max,z:hs.z}; if(s.adj) rec.adj=s.adj.src==='ai'?'ai':s.adj.kind;
  await save('hist',(S.hist||[]).concat([rec]));
  S.summary=Object.assign({},rec,{hrS:hs,prList:s.prs,skipped,absN,absT:day.ex.filter(e=>e.opt).length});
  if(stOn()&&stCanWrite()){ const it=stItem(rec,s,day,hs); if(stCfg().auto!==false){ await stQueue(it); setTimeout(stFlush,50); } else ST.pend=it; }
  S.sess=null; stopRest(); S.fxOpen=false; await store.set(K.sess,null); keepAwake(false); keepAlive(false);
  render(); burstAt(innerWidth/2,innerHeight*.28,44); flash(); say(voxEnc()?mot('fin'):'Antrenament terminat.'); buzz([80,50,80,50,200]); beep(660,.1); setTimeout(()=>beep(880,.1),120); setTimeout(()=>beep(1320,.18),240);
}
async function quitSess(){ S.sess=null; stopRest(); S.fxOpen=false; await store.set(K.sess,null); keepAwake(false); keepAlive(false); render(); toast('Sesiune închisă','Seriile notate au rămas salvate.','info'); }

/* pauza dintre serii — sunetele de final sunt programate dinainte */
function restSounds(left){ schedule('rest',[[left-3,880,.06],[left-2,880,.06],[left-1,880,.06],[left,1320,.18],[left+.25,1320,.18]]); }
function startRest(sec,lbl){ if(!sec) return; S.rest={end:Date.now()+sec*1000,total:sec,lbl:lbl||'Pauză'}; restSounds(sec);
  if('mediaSession' in navigator&&window.MediaMetadata) try{ navigator.mediaSession.metadata=new MediaMetadata({title:(lbl||'Pauză')+' '+fmtClock(sec),artist:'ZECE'}); }catch(e){} }
function stopRest(){ S.rest=null; cancelSched('rest'); }
function restDone(){ S.rest=null; AU.sched.rest=[]; buzz([200,100,200]); if(!document.hidden) flash(); say(voxEnc()?mot('rdone'):'Gata pauza. Următoarea serie.'); renderFocus(); renderPill(); }
function tick(){
  if(TM.open) tmTick();
  if(!S.sess&&!S.rest) return;
  const t=fmtClock(sessSec());
  ['#fxClock','#heroClock','#pillClock'].forEach(sel=>{ const el=$(sel); if(el&&el.textContent!==t) el.textContent=t; });
  if(S.rest){
    const left=(S.rest.end-Date.now())/1000;
    if(left<=0){ restDone(); return; }
    const rt=$('#restT'); if(rt) rt.textContent=fmtClock(left);
    const rr=$('#restRing'); if(rr){ const C=2*Math.PI*36; rr.setAttribute('stroke-dashoffset',(C*(1-left/S.rest.total)).toFixed(2)); }
    const rb=$('#restBox'); if(rb) rb.classList.toggle('urgent',left<=3);
    const pr=$('#pillRest'); if(pr) pr.textContent=fmtClock(left);
  }
}
setInterval(tick,250);
