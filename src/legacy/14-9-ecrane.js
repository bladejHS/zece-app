/* =====================================================================
   9 · ECRANE
   ===================================================================== */
const catTag=day=>{ const c=CAT[day.cat]; return `<span class="tag ${c[1]}">${ic(day.cat==='rest'?'leaf':day.cat==='run'?'run':day.cat==='lift'?'dumbbell':'bolt')} ${c[0]}</span>`; };
const short=e=>e.kind==='lift'?e.sets+'×'+e.lo+(e.hi!==e.lo?'–'+e.hi:''):e.planMin?e.planMin+' min':'';
function lastLine(e){ if(e.kind!=='lift') return ''; const p=lastSession(e.n); return p?`<div class="ex-l">Ultima: ${p.s.map(fmtSet).join(' · ')} (${relDay(p.d)})</div>`:''; }
const QUICK=['Fă-mi raportul săptămânii: ce am făcut față de plan, forța, alergarea, greutatea și mâncarea, plus 3 lucruri concrete pentru săptămâna viitoare.',
  'Ce greutăți să încerc la antrenamentul următor?','Slăbesc în ritmul potrivit? Ce ajustez la mâncare?',
  'Am stagnat la vreun exercițiu? Cum trec peste?','Cum alerg corect la prag?','Ce mănânc înainte și după antrenament?'];
const QLBL=['Raportul săptămânii','Ce greutăți încerc data viitoare?','Slăbesc în ritmul potrivit?','Am stagnat la ceva?','Cum alerg la prag?','Ce mănânc înainte și după?'];
function ringsNut(k,size){ const tg=targets(), d=dayTotals(k), sw=size>100?10:6;
  return [ring(d.k/tg.kcal,{s:size,sw,c:TH().ac,inner:size>100?`<text x="${size/2}" y="${size/2+4}" text-anchor="middle" class="ring-b">${Math.round(d.k)}</text><text x="${size/2}" y="${size/2+22}" text-anchor="middle" class="ring-s">din ${tg.kcal} kcal</text>`:''}),
    ring(d.p/tg.p,{s:size,sw,c:COL().run,inner:size>100?`<text x="${size/2}" y="${size/2+4}" text-anchor="middle" class="ring-b">${Math.round(d.p)}</text><text x="${size/2}" y="${size/2+22}" text-anchor="middle" class="ring-s">din ${tg.p} g proteină</text>`:''})]; }

/* Azi, în ordinea în care contează: ce ai de făcut acum → săptămâna → cifrele zilei → scurtături.
   Check-in-ul de dimineață e un rând în cardul antrenamentului și se deschide într-o foaie. */
function rdRow(){
  const R=readiness();
  if(R.v==null) return `<button class="rd-row" data-a="ciOpen"><span class="rd-ic">${ic('target')}</span>
    <span class="sp"><b>Check-in de dimineață · 20 s</b><span class="xs mu">Somn, energie, febră musculară: îți spun cât de pregătit ești azi</span></span>${ic('right')}</button>`;
  const [lbl]=rdLabel(R.v), col=rdCol(R.v);
  return `<button class="rd-row on" data-a="ciOpen" style="--rc:${col}">${ring(R.v/100,{s:42,sw:4,c:col,inner:`<text x="21" y="25.5" text-anchor="middle" class="rd-n">${R.v}</text>`})}
    <span class="sp"><b>${esc(lbl)}</b><span class="xs mu">Pregătire ${R.v}/100 · vezi factorii sau refă check-in-ul</span></span>${ic('right')}</button>`;
}
/* memento de copie: fără copie după prima săptămână de date sau ultima mai veche de 14 zile; „Mai târziu" amână 7 zile */
function bkCard(){
  const tk=todayKey(), bk=S.bk||{}, first=[...wList().map(x=>x.d),...(S.hist||[]).map(h=>h.date),...(S.runs||[]).map(r=>r.date)].sort()[0];
  if(!first||(bk.snooze&&bk.snooze>tk)) return '';
  const age=bk.last?daysBetween(bk.last,tk):daysBetween(first,tk); if(age<(bk.last?14:7)) return '';
  return `<div class="card bk"><div class="row"><span class="rd-ic">${ic('shield')}</span><div class="sp"><b>Fă o copie a datelor</b>
      <div class="xs mu">${bk.last?'Ultima copie e de acum '+age+' de zile.':'Ai '+age+' de zile de date și nicio copie.'} Totul stă doar în acest browser.</div></div></div>
    <div class="inrow"><button class="btn ghost sm" data-a="bkLater">Mai târziu</button><button class="btn pri sm" style="flex:1" data-a="export">${ic('download')} Exportă acum</button></div></div>`;
}
let STEST='';
function briefCard(){
  const ws=wStats(), P=prof(), tk=todayKey(), tg=targets(), dt=dayTotals(tk), wat=waterOf(tk);
  const cur=ws?ws.a7:null, gp=cur!=null&&P.startW>P.goalW?clamp((P.startW-cur)/(P.startW-P.goalW),0,1):0;
  const rs=runsIn(dayShift(tk,-6),tk), km7=sumKm(rs), n7=rs.length, pc=(a,b)=>(clamp(b>0?a/b:0,0,1)*100).toFixed(1), R=readiness(), AW=actWeek();
  return `<div class="card brief"><div class="eyebrow">${ic('chart')} Pe scurt · azi</div>
    <div class="bf-g">
      <button class="bf" data-a="goBody"><span class="k">${ic('scale')} Greutate</span>
        <b>${ws?`<span data-cnt="${num(ws.last.w)}" data-dec="1">${num(ws.last.w)}</span>`:'—'}<small>kg</small></b>
        <span class="s ${ws&&ws.wk!=null?(ws.wk<=0?'good':'bad'):''}">${ws&&ws.wk!=null?(ws.wk>0?'+':'')+num(ws.wk,2)+' kg / săpt.':ws?'mai cântărește-te câteva zile':'nicio cântărire'}</span>
        <i class="bfb" title="spre ${P.goalW} kg"><i style="width:${(gp*100).toFixed(1)}%"></i></i></button>
      <button class="bf" data-a="goRuns"><span class="k">${ic('run')} Alergare · 7 zile</span>
        <b>${km7.toFixed(1)}<small>km</small></b><span class="s">${n7} ${n7===1?'ieșire':'ieșiri'}</span>
        <i class="bfb run"><i style="width:${pc(n7,3)}%"></i></i></button>
      <button class="bf" data-a="ciOpen"><span class="k">${ic('heart')} Recuperare</span>
        <b>${R.v!=null?R.v:'—'}<small>/ 100</small></b><span class="s ${R.v!=null?(rdLabel(R.v)[1]==='good'?'good':rdLabel(R.v)[1]==='bad'?'bad':''):''}">${R.v!=null?esc(rdLabel(R.v)[0]):'fă check-in-ul de azi'}</span>
        <i class="bfb ok"><i style="width:${R.v!=null?R.v:0}%"></i></i></button>
      <button class="bf" data-a="tab" data-k="plan" data-s="acts"><span class="k">${ic('activity')} Activități</span>
        <b>${AW.n}<small>${AW.n===1?'activitate':'activități'}</small></b><span class="s">${AW.n?'săpt. asta · '+num(AW.min,0)+' min':'bike, row, înot, tenis…'}</span>
        <i class="bfb"><i style="width:${pc(AW.min,150)}%"></i></i></button>
      <button class="bf" data-a="tab" data-k="nutri"><span class="k">${ic('flame')} Mâncare</span>
        <b>${Math.round(dt.k)}<small>/ ${tg.kcal} kcal</small></b><span class="s">${Math.round(dt.p)} / ${tg.p} g proteină</span>
        <i class="bfb"><i style="width:${pc(dt.k,tg.kcal)}%"></i></i></button>
      <button class="bf" data-a="tab" data-k="nutri"><span class="k">${ic('drop')} Apă</span>
        <b>${num(wat/1000,1)}<small>/ ${num(tg.water/1000,1)} L</small></b><span class="s">${wat>=tg.water?'ținta atinsă':'mai ai '+num(Math.max(0,tg.water-wat)/1000,1)+' L'}</span>
        <i class="bfb run"><i style="width:${pc(wat,tg.water)}%"></i></i></button></div>
    <div class="inrow"><input class="inp" id="wIn" type="number" step="0.1" inputmode="decimal" placeholder="${ws?'Greutatea de azi · ultima '+num(ws.last.w):'Greutatea de azi (kg)'}" aria-label="Greutatea de azi">
      <button class="btn pri" data-a="wAdd" aria-label="Salvează greutatea">${ic('check')}</button></div></div>`;
}
function viewPlan(){
  const nx=nextDay(), w=S.planW!=null?S.planW:(S.sess?S.sess.w:nx?nx.w:0), full=cycleDaysDone();
  const weekFull=a=>PLAN.every((_,d)=>dayFull(a,d));
  const days=PLAN.map((_,d)=>{ const day=dayFor(w,d), dn=doneCount(w,d), tot=absFrom(d), optN=PLAN[d].ex.length-tot, od=optDone(w,d), open=S.openDay===d, isN=nx&&nx.w===w&&nx.d===d, c=CAT[day.cat], col=catCol(day.cat);
    return `<div class="card day ${open?'open':''} ${isN?'next':''}" id="day${d}" style="--c:${col}">
      <button class="day-h" data-a="toggleDay" data-d="${d}" aria-expanded="${open}">
        <span class="day-bar"></span>${dayBadge(d,dn===tot?'done':isN?'next':'')}
        <span class="sp"><span class="day-k">${DAYN[d]}${isN?' · următorul':''}</span><span class="day-t" style="display:block">${esc(day.t)}</span>
          <span class="day-m" style="display:block">${c[0]} · ${day.min} min · ${dn}/${tot} bifate${optN?od===optN?' · + abdomen':' · abdomen opțional':''}</span></span>
        ${dn===tot?`<span class="tag pr">${ic('check')}</span>`:ring(dn/tot,{s:34,sw:3,c:col})}
        <span class="chev">${ic('down')}</span></button>
      <div class="day-b"><div>
        ${planExHTML(w,d,day)}
        <details class="notes"><summary>${ic('info')} ${esc(day.notes.wk)}</summary>
          ${day.notes.d.map(([t,x])=>`<p><b>${esc(t)}.</b> ${esc(x)}</p>`).join('')}</details>
        <div class="day-act inrow"><button class="btn pri" style="flex:1" data-a="start" data-w="${w}" data-d="${d}">${ic('play')} ${dn&&dn<tot?'Continuă ziua':dn===tot?(optN&&od<optN?'Fă și abdomenul':'Reia ziua'):'Începe ziua'}</button>${day.run?`<button class="btn" data-a="spdOpen" data-d="${d}">${ic('gauge')} Viteza</button>`:''}</div>
      </div></div></div>`; }).join('');
  return `
  <div class="card plan-hd"><div class="h3">Planul de 4 săptămâni</div>
    <div class="sm mu">3 alergări · 3 upper · 1 lower · 1 conditioning · 1 zi de recuperare</div>
    ${COVER?'':`<div class="bar"><i style="width:${(full/(WEEKS*7)*100).toFixed(1)}%"></i></div>
    <div class="cyc-bar"><span>${full} din ${WEEKS*7} zile complete</span><span>${nx?'următorul: S'+(nx.w+1)+' · '+DAYN[nx.d]:'ciclu complet'}</span></div>`}
    ${cycList().length||cyc()>1?`<div class="inrow" style="margin-top:12px">${cycList().length?`<button class="btn ghost sm" style="flex:1" data-a="cycOpen">${ic('star')} Raportul ciclului</button>`:''}${cyc()>1?`<button class="btn ghost sm" style="flex:1" data-a="cfOpen">${ic('refresh')} Corectează ciclul</button>`:''}</div>`:''}</div>
  <div class="seg" role="tablist">${Array.from({length:WEEKS},(_,a)=>`<button class="${a===w?'on':''}" data-a="planW" data-i="${a}" role="tab" aria-selected="${a===w}">S${a+1}${weekFull(a)?` <span class="ok">${ic('check')}</span>`:''}</button>`).join('')}</div>
  ${days}
  <div class="card"><div class="row"><div class="sp"><div class="h3">Ciclu nou</div><div class="sm mu">Reia planul de la săptămâna 1. Istoricul rămâne.</div></div>
    <button class="btn ghost sm" data-a="newCycle" data-confirm="${full<WEEKS*7?'Mai ai '+(WEEKS*7-full)+' zile. Sigur?':'Sigur? Apasă iar'}">${ic('refresh')} Ciclul ${cyc()+1}</button></div></div>`;
}

/* ---------- raportul ciclului: ce s-a schimbat între începutul și finalul celor 4 săptămâni ---------- */
const cycList=()=>[...new Set((S.hist||[]).map(h=>h.cyc).filter(c=>c>0))].sort((a,b)=>b-a);
function cycData(c){
  const hs=(S.hist||[]).filter(h=>h.cyc===c); if(!hs.length) return null;
  const tk=todayKey(), from=hs.map(h=>h.date).sort()[0], last=hs.map(h=>h.date).sort().pop(), to=c===cyc()?tk:last, inR=d=>d>=from&&d<=to, span=daysBetween(from,to)+1;
  let full=0; for(let w=0;w<WEEKS;w++) for(let d=0;d<7;d++) if(fullIn(c,w,d)) full++;
  const runs=(S.runs||[]).filter(r=>inR(r.date)), km=sumKm(runs), prs=prEvents().filter(p=>inR(p.d));
  let sets=0, vol=0; Object.values(S.lifts||{}).forEach(h=>h.forEach(e=>{ if(inR(e.d)) e.s.forEach(([w,r])=>{ sets++; vol+=w*r; }); }));
  const wl=wList(), avgW=(a,b)=>{ const x=wl.filter(p=>p.d>=a&&p.d<=b); return x.length?avgOf(x.map(p=>p.w)):null; };
  const w0=avgW(dayShift(from,-3),dayShift(from,6)), w1=avgW(dayShift(to,-6),to);
  const bl=bList().filter(x=>+x.waist>0), b0=bl.filter(x=>x.d<=dayShift(from,7)).pop()||bl.find(x=>inR(x.d)), b1=bl.filter(x=>x.d<=to).pop();
  const lifts=Object.keys(S.lifts||{}).map(n=>{ const h=liftHist(n), inC=h.filter(e=>inR(e.d)); if(!inC.length) return null;
    const be=a=>Math.max(0,...a.map(e=>Math.max(0,...e.s.map(([w,r])=>e1rm(w,r))))), before=h.filter(e=>e.d<from), ref=before.length?be(before.slice(-3)):be([inC[0]]), now=be(inC);
    return ref>0&&now>0?{n,ref,now,ch:(now-ref)/ref*100}:null; }).filter(Boolean).sort((a,b)=>b.ch-a.ch);
  const thr=runs.filter(r=>r.kind==='thr'&&paceOf(r)), th0=thr.length>1?paceOf(thr[0]):null, th1=thr.length>1?paceOf(thr[thr.length-1]):null;
  const rd=[], sl=[]; for(let i=0;i<span;i++){ const d=dayShift(from,i), r=recoveryAt(d), s=+jOf(d).sleep; if(r) rd.push(r.v); if(s>0) sl.push(s); }
  return {c,from,to,span,hs,full,runs,km,prs,sets,vol,w0,w1,b0,b1,lifts,th0,th1,rd:rd.length?avgOf(rd):null,sl:sl.length?avgOf(sl):null,
    mins:hs.reduce((a,h)=>a+(+h.dur||0),0)/60,done:c<cyc()||!nextDay()};
}
function cycHTML(){
  const L=cycList(), c=SH.c!=null?SH.c:L[0], d=cycData(c);
  const chips=L.length>1?`<div class="chips" style="margin-top:12px">${L.map(x=>`<button class="chip ${x===c?'on':''}" data-a="cycPick" data-i="${x}">Ciclul ${x}</button>`).join('')}</div>`:'';
  if(!d) return `<div class="eyebrow">${ic('star')} Raportul ciclului</div><div class="h2" style="margin-top:6px">Încă nu am date</div><div class="note">Raportul apare după primul antrenament terminat în modul ghidat (butonul „Începe antrenamentul”).</div>`;
  const dl=(a,b,dec,inv)=>a!=null&&b!=null?`<span class="${(b-a)*(inv?-1:1)>0?'good':(b-a)===0?'':'bad'}">${b-a>0?'+':''}${num(b-a,dec)}</span>`:'—';
  return `<div class="eyebrow">${ic('star')} Raportul ciclului ${d.c}${d.done?'':' · în desfășurare'}</div><div class="h2" style="margin-top:6px">${fmtDay(d.from)} – ${fmtDay(d.to)}</div>${chips}
    <div class="kpis"><div class="kpi"><div class="k">Zile complete</div><div class="v">${d.full}<small>/ 28</small></div></div><div class="kpi"><div class="k">Antrenamente</div><div class="v">${d.hs.length}</div></div>
      <div class="kpi"><div class="k">Ore</div><div class="v">${num(d.mins/60,1)}</div></div><div class="kpi"><div class="k">Serii</div><div class="v">${d.sets}</div></div>
      <div class="kpi"><div class="k">Volum</div><div class="v">${num(d.vol/1000,1)}<small>t</small></div></div><div class="kpi"><div class="k">Alergare</div><div class="v">${num(d.km,1)}<small>km</small></div></div></div>
    <div class="dsec"><h4>Corp</h4>
      <div class="list-row"><span class="sp">Greutate (media pe 7 zile)</span><span class="xs mu">${d.w0!=null?num(d.w0,1):'—'} → ${d.w1!=null?num(d.w1,1):'—'} kg</span><span class="v cyc-d">${dl(d.w0,d.w1,1,true)}</span></div>
      <div class="list-row"><span class="sp">Talie</span><span class="xs mu">${d.b0?num(d.b0.waist):'—'} → ${d.b1?num(d.b1.waist):'—'} cm</span><span class="v cyc-d">${d.b0&&d.b1&&d.b0.d!==d.b1.d?dl(+d.b0.waist,+d.b1.waist,1,true):'—'}</span></div></div>
    ${d.lifts.length?`<div class="dsec"><h4>Forță · 1RM estimat</h4>${d.lifts.slice(0,8).map(x=>`<div class="list-row"><span class="sp">${esc(x.n)}</span><span class="xs mu">${x.ref} → ${x.now} kg</span><span class="v cyc-d"><span class="${x.ch>0.5?'good':x.ch<-0.5?'bad':''}">${x.ch>0?'+':''}${num(x.ch,1)}%</span></span></div>`).join('')}</div>`:''}
    <div class="dsec"><h4>Alergare și recuperare</h4>
      <div class="list-row"><span class="sp">Alergări</span><span class="v">${d.runs.length} · ${num(d.km/Math.max(1,d.span/7),1)} km/săpt.</span></div>
      ${d.th0?`<div class="list-row"><span class="sp">Ritm la prag</span><span class="xs mu">${mmss(d.th0)} → ${mmss(d.th1)} /km</span><span class="v cyc-d">${d.th1<d.th0?'<span class="good">mai rapid</span>':d.th1>d.th0?'<span class="bad">mai lent</span>':'—'}</span></div>`:''}
      <div class="list-row"><span class="sp">Recuperare medie</span><span class="v">${d.rd!=null?Math.round(d.rd)+' / 100':'—'}</span></div>
      <div class="list-row"><span class="sp">Somn mediu</span><span class="v">${d.sl!=null?num(d.sl,1)+' h':'—'}</span></div></div>
    ${d.prs.length?`<div class="dsec"><h4>Recorduri · ${d.prs.length}</h4>${d.prs.slice(0,6).map(p=>`<div class="pr-row"><span class="tag pr">PR</span><b>${esc(p.n)}</b><span class="v">${p.prev}→${p.b}</span></div>`).join('')}</div>`:''}
    <div class="note">Forța se compară cu ultimele sesiuni dinaintea ciclului (sau cu prima din ciclu). Greutatea: media primelor zile față de media ultimei săptămâni.</div>
    <div class="inrow" style="flex-wrap:wrap"><button class="btn ghost" style="flex:1" data-a="cycShare" data-i="${d.c}">${ic('upload')} Imagine</button>${S.aiKey?`<button class="btn ghost" style="flex:1" data-a="cycAsk" data-i="${d.c}">${ic('coach')} Ce zice antrenorul?</button>`:''}<button class="btn" style="flex:1" data-a="shClose">Închide</button></div>`;
}
/* ---------- Readiness pe ecranul Azi + check-in de dimineață ---------- */
const attrName=id=>id==='cons'?'Consecvență':(ATTR.find(a=>a[0]===id)||[0,id])[1];
const facRow=([v,t])=>`<div class="fac"><span class="d ${v>0?'pos':v<0?'neg':'zero'}">${v>0?'+':''}${v}</span><span class="sp">${esc(t)}</span></div>`;
const rdCol=v=>v>=80?COL().ok:v>=60?TH().ac:v>=45?COL().warn:COL().bad;
function ciForm(){
  const j=jOf(todayKey()), chips=(f,vals)=>vals.map(([v,l])=>`<button class="chip ${String(j[f])===String(v)?'on':''}" data-a="ci" data-k="${f}" data-v="${v}">${l}</button>`).join('');
  return `<div class="ci">
    <div class="lbl">Somn azi-noapte</div><div class="row">${chips('sleep',[[5,'5 h'],[6,'6 h'],[7,'7 h'],[8,'8 h'],[9,'9+ h']])}</div>
    <div class="lbl">Energie <span class="mu2">· 1 = epuizat, 5 = plin de energie</span></div><div class="row">${chips('energy',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']])}</div>
    <div class="lbl">Febră musculară</div><div class="row">${chips('sore',[[1,'deloc'],[2,'ușoară'],[3,'medie'],[4,'mare'],[5,'foarte mare']])}</div>
    ${+j.sore>=2?`<div class="lbl">Unde</div><div class="row">${chips('soreReg',[['sus','Partea de sus'],['jos','Picioare'],['tot','Tot corpul']])}</div>`:''}
    <div class="lbl">Opțional, din ceas sau manual</div>
    <div class="row"><input class="inp" id="ciRhr" type="number" inputmode="numeric" placeholder="Puls" value="${j.rhr||''}" style="flex:1;min-width:0" aria-label="Puls în repaus">
      <input class="inp" id="ciHrv" type="number" inputmode="numeric" placeholder="HRV ms" value="${j.hrv||''}" style="flex:1;min-width:0" aria-label="HRV">
      <input class="inp" id="ciSteps" type="number" inputmode="numeric" placeholder="Pași" value="${j.steps||''}" style="flex:1;min-width:0" aria-label="Pași">
      <button class="btn pri" data-a="ciSave" aria-label="Salvează">${ic('check')}</button></div>
    ${hrLive()?`<button class="btn ghost sm wide" style="margin-top:8px" data-a="hrMeasure">${ic('heart')} Măsoară cu senzorul (2 min)</button>`:`<button class="linkb" data-a="hrOpen">${ic('heart')} Ai Polar? Conectează-l și măsoară automat</button>`}</div>`;
}
function readyCard(){
  const R=readiness(), tw=twinNow();
  if(R.v==null) return `<div class="card rdw"><div class="eyebrow">${ic('target')} Check-in de dimineață · 20 de secunde</div>
    <div class="sm mu" style="margin-top:6px">Din somn, energie și febra musculară calculez cât de pregătit ești azi și cum să ajustezi antrenamentul.</div>${ciForm()}</div>`;
  const [lbl]=rdLabel(R.v), col=rdCol(R.v), C=2*Math.PI*50, cj=jOf(todayKey()), form=S.ciOpen===true||(S.ciOpen==null&&!(cj.energy&&cj.sore&&(cj.sleep||cj.sleepQ)));
  return `<div class="card rdw" style="--rc:${col}"><div class="row"><div class="eyebrow sp">${ic('target')} Readiness azi</div><button class="btn ghost sm" data-a="ciToggle" data-i="${form?0:1}">${form?'Gata':'Check-in'}</button></div>
    <div class="rd-card"><div class="rd-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" style="stroke:rgba(var(--w),.08)" stroke-width="9"/>
        <circle class="rg" cx="60" cy="60" r="50" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-R.v/100)).toFixed(1)}" transform="rotate(-90 60 60)" style="--c:${C.toFixed(1)}"/></svg>
        <div class="c"><div><b data-cnt="${R.v}">${R.v}</b><span>din 100</span></div></div></div>
      <div class="sp"><div class="h3">${lbl}</div><div class="xs mu" style="margin-top:4px">Recuperare ${R.rec.v} · încărcare ${R.ls!=null?R.ls:'—'}</div>
        <div class="lim">${tw.lim?`<span class="tag need">${ic('alert')} limitare: ${attrName(tw.lim)}</span>`:''}${tw.top&&tw.top!==tw.lim?`<span class="tag rest">${ic('star')} punct forte: ${attrName(tw.top)}</span>`:''}</div></div></div>
    <div style="margin-top:10px">${R.f.slice().sort((a,b)=>Math.abs(b[0])-Math.abs(a[0])).slice(0,S.tab==='prog'&&S.progTab==='rec'&&!SH?99:3).map(facRow).join('')}</div>
    ${form?ciForm():''}
    <button class="btn ghost sm wide" style="margin-top:10px" data-a="goTwin">${ic('chart')} Profilul atletului</button></div>`;
}
/* ---------- Performanță: profilul atletului, teste, conexiuni ---------- */
const ATTR_MISS={str:'Notează serii la Bench Press, Romanian Deadlift, Seated Overhead Press, Push Press, Hip Thrust sau Weighted Pull Up.',
  end:'Notează alergări (ultimele 90 de zile).',spd:'Notează o alergare de cel puțin 1 km sau fă testul de 1 km.',pow:'Fă testul de săritură în lungime sau notează Push Press.',
  con:'Folosește cronometrul pentru AMRAP sau Engine Builder, ori notează o alergare de prag.',grip:'Fă testul de dead hang.',mob:'Fă testul sit and reach sau termină sesiunea de recuperare de duminică.',
  rec:'Completează check-in-ul de dimineață.',cons:''};
function heatCard(){
  const tk=todayKey(), {L,R}=activity(), start=dayShift(mondayOf(tk),-15*7); let cells='', act28=0;
  for(let i=0;i<16*7;i++){ const k=dayShift(start,i), l=L.has(k), r=R.has(k), fut=k>tk; if(!fut&&k>dayShift(tk,-28)&&(l||r)) act28++;
    cells+=`<i style="--i:${i}" class="${fut?'fut':l&&r?'both':l?'on':r?'run':''} ${k===tk?'today':''}" title="${k}"${fut?'':` data-a="dayOpen" data-k="${k}"`}></i>`; }
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('flame')} Consecvență · 16 săptămâni</div><b>${act28}</b><span class="xs mu">zile active / 28</span></div>
    <div class="heat">${cells}</div>
    <div class="legend"><span><i style="background:var(--ac)"></i>forță</span><span><i style="background:var(--run)"></i>alergare</span><span><i style="background:linear-gradient(135deg,var(--ac) 50%,var(--run) 50%)"></i>ambele</span>
      <span style="margin-left:auto">${ic('flame')} ${stats().streak} săpt. la rând</span></div>
    <button class="btn ghost sm wide" style="margin-top:12px" data-a="calOpen">${ic('plan')} Calendarul cu tot istoricul</button></div>`;
}
function progTwin(){
  const tw=twinNow(), sel=S.twAttr||'str', rng=S.twRange==null?90:S.twRange, ser=twinSeries(sel,rng);
  const ids=ATTR.map(a=>a[0]).concat(['cons']), cards=ids.map(id=>{ const a=tw.now[id], o=tw.old[id], dl=a&&o?a.v-o.v:null, icn=id==='cons'?'plan':ATTR.find(x=>x[0]===id)[2];
    return `<button class="at ${sel===id?'sel':''}" data-a="twAttr" data-k="${id}"><span class="k">${ic(icn)} ${attrName(id)}</span>
      <span class="bar">${a?`<i style="width:${a.v}%"></i>`:''}</span>
      <span class="v">${a?a.v:'—'}${a&&dl!=null&&dl!==0?`<small style="color:${dl>0?'var(--ok)':'var(--warn)'}">${dl>0?'+':''}${dl}</small>`:''}</span>
      ${a?'':`<span class="src">${esc(ATTR_MISS[id]||'')}</span>`}</button>`; }).join('');
  const cur=tw.now[sel];
  return `
  <div class="card"><div class="eyebrow">${ic('user')} Profilul atletului</div>
    ${radarSVG(tw.now,tw.old)}
    <div class="xs mu" style="text-align:center;margin-top:-4px">plin: acum · punctat: acum 30 de zile · —: fără date</div>
    <div class="lim" style="justify-content:center">${tw.lim?`<span class="tag need">${ic('alert')} cea mai mare limitare: ${attrName(tw.lim)}</span>`:''}${tw.top&&tw.top!==tw.lim?`<span class="tag rest">${ic('star')} cel mai puternic: ${attrName(tw.top)}</span>`:''}</div>
    <div class="attrs">${cards}</div></div>
  <div class="card"><div class="eyebrow">${ic('chart')} ${attrName(sel)} în timp</div>
    <div class="chips" style="margin-top:12px">${[[30,'30 zile'],[90,'90 zile'],[365,'1 an'],[0,'Tot']].map(([v,l])=>`<button class="chip ${rng===v?'on':''}" data-a="twRange" data-i="${v}">${l}</button>`).join('')}</div>
    ${ser.length>=2?lineChart({pts:ser,label:attrName(sel)+' în timp',dec:0}):`<div class="empty sm">${cur?'Evoluția apare când există date din mai multe momente.':esc(ATTR_MISS[sel]||'Nu există încă date.')}</div>`}
    ${cur?`<div class="note"><b>Cum se calculează:</b> ${esc(cur.src)}.</div>`:''}</div>
  ${heatCard()}
  ${extCard()}
  <div class="card recap-cta" data-a="rcOpen" data-i="0"><div class="cc-ic">${ic('star')}</div><div class="sp"><div class="h3">Recapitularea săptămânii</div>
    <div class="sm mu">Săptămâna asta, în povești animate</div></div>${ic('play')}</div>`;
}
function connCard(){
  const row=(icn,t,tag,txt)=>`<div class="int"><span class="ic2">${ic(icn)}</span><div class="sp"><b>${t}</b> ${tag}<p>${txt}</p></div></div>`, need=t=>`<span class="tag need">${t}</span>`;
  return `<div class="card conn">
    ${row('scale','Apple Health / Google Fit',need('necesită aplicație nativă'),'O pagină web nu poate citi direct datele de sănătate ale telefonului. Până atunci: check-in manual sau import CSV (mai jos).')}
    <div class="int"><span class="ic2" style="color:${stOn()?'var(--ok)':'var(--mu)'}">${ic('refresh')}</span><div class="sp"><b>Strava · Polar Beat · Garmin</b> ${stOn()?'<span class="tag rest">conectat</span>':stOnline()?'<span class="tag need">neconectat</span>':'<span class="tag need">doar în versiunea online</span>'}
      <p>${stOn()?'Alergările și celelalte antrenamente vin din Strava; Polar Beat ajunge acolo prin Polar Flow.'+(stCfg().last?' Ultima sincronizare: '+stAgo(stCfg().last)+'.':''):'Conectezi Strava o dată și primești alergările și antrenamentele din Polar Beat, Garmin sau Coros. ZECE poate trimite și antrenamentele lui pe Strava.'}</p>
      <button class="btn sm" style="margin-top:8px" data-a="stGo">${ic('refresh')} ${stOn()?'Setări Strava':'Conectează Strava'}</button></div></div>
    <div class="int"><span class="ic2" style="color:${hrLive()?'var(--ok)':'var(--mu)'}">${ic('heart')}</span><div class="sp"><b>Polar și alți senzori de puls</b> ${hrOK()?'<span class="tag rest">funcționează</span>':'<span class="tag need">pe iPhone: prin Bluefy</span>'}
      <p>${hrLive()?'Conectat: '+esc(HR.name)+' · '+HR.bpm+' bpm.':hrOK()?'Puls live în antrenament, zone, puls mediu salvat și HRV dimineața. Merge cu Polar H10, H9, Verity Sense, OH1 și ceasurile Polar care își partajează pulsul.':'Safari pe iPhone nu permite Bluetooth paginilor web. Cu aplicația gratuită Bluefy merge, după ce punem ZECE online.'}</p>
      <button class="btn sm" style="margin-top:8px" data-a="hrOpen">${ic('heart')} ${hrLive()?'Vezi pulsul':'Conectează senzorul'}</button></div></div>
    <div class="int"><span class="ic2" style="color:var(--ok)">${ic('upload')}</span><div class="sp"><b>Import CSV</b> <span class="tag rest">funcționează</span>
      <p>Un fișier cu coloanele <b>data, somn, pasi, rhr, hrv</b> (de exemplu exportat cu aplicația Scurtături sau Health Auto Export pe iPhone). Datele intră în jurnal și în check-in.</p>
      <label class="btn sm file-l" style="margin-top:8px">${ic('upload')} Alege fișierul CSV<input type="file" accept=".csv,text/csv" data-csv="1"></label></div></div></div>`;
}
function progTests(){
  return PTESTS.map(([type,name,unit,how,attr])=>{ const h=(S.ptests||[]).map((t,i)=>Object.assign({i},t)).filter(t=>t.type===type), last=h[h.length-1];
    const fmt=v=>type==='k1'?fmtClock(v):(type==='reach'&&v>0?'+':'')+num(v,1)+' '+unit;
    return `<div class="card"><div class="row"><div class="sp"><div class="eyebrow">${ic('medal')} ${name}</div><div class="xs mu" style="margin-top:2px">contribuie la: ${attr}</div></div>
        ${last?`<div style="text-align:right"><div class="big sm">${fmt(last.value)}</div><div class="xs mu">${relDay(last.date)}</div></div>`:''}</div>
      <div class="note">${esc(how)}</div>
      <div class="inrow"><input class="inp" id="pt_${type}" ${type==='k1'?'inputmode="numeric" placeholder="m:ss"':'type="number" step="0.5" inputmode="decimal" placeholder="'+unit+'"'} aria-label="${name}">
        <button class="btn pri" data-a="ptAdd" data-k="${type}">${ic('check')} Salvează</button></div>
      ${h.length>1?`<div style="margin-top:8px">${h.slice(-5).reverse().map(t=>`<div class="list-row"><span>${relDay(t.date)}</span><span class="v">${fmt(t.value)}</span>
        <button class="xb" data-a="ptDel" data-i="${t.i}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>`).join('')}</div>`:''}</div>`; }).join('')
    +`<div class="note" style="padding:0 4px">Testele sunt opționale. Fără ele, atributele de grip, putere și mobilitate rămân necalculate în loc să fie ghicite.</div>`;
}
function progWeight(){
  const a=wList(), ws=wStats(), P=prof(), tk=todayKey();
  const from=S.wRange?dayShift(tk,-S.wRange):'0000', vis=a.filter(x=>x.d>=from), ma=wMA(a).filter(p=>p.x>=from);
  const cur=ws?ws.a7:null, left=cur!=null?cur-P.goalW:null;
  const eta=ws&&ws.wk!=null&&ws.wk<-0.05&&left>0?Math.ceil(left/-ws.wk):null;
  return `
  <div class="card"><div class="row"><div class="sp"><div class="eyebrow">Medie 7 zile</div>
      <div class="big" style="margin-top:6px">${cur!=null?`<span data-cnt="${num(cur)}" data-dec="1">${num(cur)}</span>`:'—'}<small>kg</small></div>
      ${ws&&ws.wk!=null?`<div class="delta ${ws.wk<=0?'good':'bad'}">${ws.wk>0?'+':''}${num(ws.wk,2)} kg / săptămână</div>`:''}</div>
    <div style="text-align:right"><div class="eyebrow" style="justify-content:flex-end">Țintă</div><div class="big sm" style="margin-top:6px">${P.goalW}<small>kg</small></div>
      <div class="xs mu">${left!=null?(left>0?num(left)+' kg rămase':'atinsă'):''}${eta?' · ~'+eta+' săpt.':''}</div></div></div>
    <div class="bar"><i style="width:${cur!=null&&P.startW>P.goalW?(clamp((P.startW-cur)/(P.startW-P.goalW),0,1)*100).toFixed(1):0}%"></i></div>
    <div class="cyc-bar"><span>start ${P.startW} kg</span><span>${cur!=null?num(P.startW-cur)+' kg pierduți':''}</span></div>
    <div class="chips" style="margin-top:14px">${[[30,'30 zile'],[90,'90 zile'],[365,'1 an'],[0,'Tot']].map(r=>`<button class="chip ${S.wRange===r[0]?'on':''}" data-a="wRange" data-i="${r[0]}">${r[1]}</button>`).join('')}</div>
    ${vis.length>=2?lineChart({pts:vis.map(x=>({x:x.d,y:x.w})),ma,goal:P.goalW,label:'greutate'})
      :`<div class="empty">${ic('scale')}<div>Graficul apare după a doua cântărire${S.wRange?' din interval':''}.</div></div>`}
    <div class="inrow"><input class="inp" id="wIn" type="number" step="0.1" inputmode="decimal" placeholder="Greutatea de azi (kg)">
      <button class="btn pri" data-a="wAdd">${ic('check')} Salvează</button></div>
    <div class="note">Cântărește-te dimineața, după toaletă, înainte să mănânci. Contează media pe 7 zile, nu ziua de azi.</div></div>
  ${a.length?`<div class="card"><div class="eyebrow">Ultimele cântăriri</div><div style="margin-top:4px">
    ${a.slice(-7).reverse().map(x=>`<div class="list-row"><span>${relDay(x.d)}</span><span class="mu2 xs">${x.d}</span><span class="v">${num(x.w)} kg</span>
      <button class="xb" data-a="wDel" data-k="${x.d}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>`).join('')}</div></div>`:''}`;
}
function muscleCard(){
  const win=S.mWin||7, E=muscleExposure(win), m={}, tot=MUSC.reduce((a,[k])=>(m[k]=E[k].sets,a+m[k]),0);
  const sel=S.mSel&&E[S.mSel]?S.mSel:MUSC.slice().sort((a,b)=>m[b[0]]-m[a[0]])[0][0], X=E[sel], ex=Object.keys(X.by).sort((a,b)=>X.by[b]-X.by[a]), wl=win===7?'7 zile':win+' de zile';
  const st=s=>`<span class="mst ${s}">${MST[s][0]}</span>`;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('target')} Mușchi lucrați</div><span class="xs mu">${num(tot)} serii · ${wl}</span></div>
    <div class="chips" style="margin-top:10px">${[7,14,28].map(v=>`<button class="chip ${win===v?'on':''}" data-a="mWin" data-i="${v}">${v} zile</button>`).join('')}</div>
    <div class="body-wrap">${bodySVG('f',m,sel,false,E)}${bodySVG('b',m,sel,false,E)}</div><div class="body-lbl"><span>față</span><span>spate</span></div>
    <div class="mleg">${['under','opt','high'].map(s=>`<span><i style="background:${MCOL[s]}"></i>${MST[s][0]}</span>`).join('')}</div>
    <div class="msel"><div class="row"><b class="sp">${MUSC.find(x=>x[0]===sel)[1]}</b>${st(X.state)}</div>
      <div class="kpis" style="margin-top:8px"><div class="kpi"><div class="k">Serii</div><div class="v">${num(X.sets)}</div></div>
        <div class="kpi"><div class="k">Pe săptămână</div><div class="v">${num(X.wk)}<small>/ ${num(X.tg)}</small></div></div>
        <div class="kpi"><div class="k">Target exposure</div><div class="v" style="color:${X.state==='none'?'inherit':MCOL[X.state]}">${X.state==='none'?'—':X.pct+'%'}</div></div></div>
      ${ex.length?`<div style="margin-top:8px">${ex.map(n=>`<div class="list-row"><span>${esc(n)}</span><span class="v">${num(X.by[n])} serii</span></div>`).join('')}</div>`
        :`<div class="xs mu" style="margin-top:8px">Nelucrat în ultimele ${wl}.</div>`}</div>
    <div class="ml">${MUSC.map(([k,l])=>{ const x=E[k]; return `<div class="ml-r ${k===sel?'sel':''}" data-a="muscle" data-k="${k}"><span>${l}</span><div class="b"><span class="z" style="left:${(75/2).toFixed(1)}%;width:${(50/2).toFixed(1)}%"></span><i style="width:${(clamp(x.pct/200,0,1)*100).toFixed(1)}%;background:${x.state==='none'?'var(--s3)':MCOL[x.state]};box-shadow:none"></i></div><span class="pc">${x.state==='none'?'—':x.pct+'%'}</span><span>${num(m[k])}</span></div>`; }).join('')}</div>
    <div class="note">Target exposure = serii pe săptămână față de cât prescrie planul tău pentru acel mușchi (mușchiul principal primește o serie întreagă, cei secundari jumătate). Sub 75%: ${MST.under[0]} · 75–125%: ${MST.opt[0]} · peste 125%: ${MST.high[0]}. Ca reper general, 10–20 serii pe săptămână sunt folosite des pentru creștere musculară. Sunt indicatori de volum, nu evaluări medicale.${E._span<win?' Istoricul tău are '+E._span+' zile, așa că media pe săptămână e calculată pe '+E._span+' zile.':''}</div></div>`;
}
function progStrength(){
  const Lf=S.lifts||{}, names=Object.keys(Lf).filter(n=>(Lf[n]||[]).some(e=>e.s.length))
    .sort((a,b)=>{ const la=Lf[a][Lf[a].length-1].d, lb=Lf[b][Lf[b].length-1].d; return la<lb?1:la>lb?-1:a.localeCompare(b); });
  if(!names.length) return muscleCard()+`<div class="card"><div class="empty">${ic('dumbbell')}<div>Seriile apar aici după primul antrenament.<br>Pornește-l din <b>Azi</b> și notează fiecare serie.</div></div></div>`;
  const n=names.indexOf(S.prEx)>=0?S.prEx:names[0], h=Lf[n];
  const pts=h.map(e=>({x:e.d,y:Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))})).filter(p=>p.y>0);
  const L=liftStats(n), bs=L.bestSet, last=L.ses[L.ses.length-1], prs=prEvents().slice(0,8), sd=stdOf(n), rms=repMaxes(n);
  return `${liftTrendCard()}${relStrCard()}${muscleCard()}
  <div class="card"><div class="scrollx">${names.map(x=>`<button class="chip ${x===n?'on':''}" data-a="prEx" data-k="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div class="h2" style="margin-top:14px">${esc(n)}</div>
    <div class="kpis">
      <div class="kpi"><div class="k">1RM estimat</div><div class="v">${bs&&bs.v?bs.v:'—'}<small>kg</small></div></div>
      <div class="kpi"><div class="k">Best set</div><div class="v">${bs&&bs.s?num(bs.s[0])+'×'+bs.s[1]:'—'}</div></div>
      <div class="kpi"><div class="k">Weight PR</div><div class="v">${L.bestW&&L.bestW.w?num(L.bestW.w):'—'}<small>kg</small></div></div>
      <div class="kpi"><div class="k">Volume PR</div><div class="v">${L.bestVol&&L.bestVol.v?L.bestVol.v:'—'}<small>kg</small></div></div>
      <div class="kpi"><div class="k">Rep PR${L.repPR&&L.repPR.w?' · '+num(L.repPR.w)+' kg':''}</div><div class="v">${L.repPR&&L.repPR.r?L.repPR.r:'—'}<small>rep.</small></div></div>
      <div class="kpi"><div class="k">Sesiuni</div><div class="v">${L.ses.length}</div></div></div>
    ${pts.length>=2?lineChart({pts,label:'1RM estimat',dec:0}):`<div class="empty sm">Graficul apare după a doua sesiune cu greutate.</div>`}
    <div style="margin-top:8px">${L.ses.slice(-6).reverse().map(x=>`<div class="list-row sesr"><span>${relDay(x.d)}</span><span class="sess-l sp">${x.s.map(fmtSet).join(' · ')}
        <span class="xs mu2">· ${x.s.length} serii${x.vol?' · '+x.vol+' kg volum':''}${x.e1?' · 1RM ~'+x.e1:''}</span></span>
      ${x.tags.length?`<span class="prt">${x.tags.map(t=>`<span class="tag pr">PR ${t}</span>`).join('')}</span>`:''}</div>`).join('')}</div>
    <div class="xs mu2" style="margin-top:6px">kg × repetări. 1RM estimat cu formula Epley.${last&&last.rp?' Ultimul rep PR: '+last.rp.r+' repetări la '+num(last.rp.w)+' kg (înainte '+last.rp.prev+').':''}</div>
    ${sd?`<div class="std"><div class="row"><div class="eyebrow sp">${ic('medal')} Nivel de forță · orientativ</div><b>${sd.lvl<0?'La început':STD_L[sd.lvl]}</b></div>
      <div class="std-bar">${STD_L.map((_,i)=>`<i class="${i<=sd.lvl?'on':''}"></i>`).join('')}<span class="std-mk" style="left:${(sd.pos*100).toFixed(1)}%"></span></div>
      <div class="std-l">${STD_L.map(l=>`<span>${l}</span>`).join('')}</div>
      <div class="note">1RM estimat ${sd.e} kg${n==='Weighted Pull Up'?' (cu greutatea corpului inclusă)':''} = <b>${num(sd.ratio,2)} ×</b> greutatea ta (${num(sd.bw)} kg).${sd.next?' Pentru „'+sd.next.l+'”: ~'+sd.next.e+' kg 1RM.':''} Pragurile sunt aproximative, folosite des pentru adulți antrenați${prof().sex==='f'?' (ajustate pentru femei)':''}.</div></div>`:''}
    ${rms.some(x=>x.best||x.est)?`<div class="eyebrow" style="margin-top:16px">${ic('trophy')} Recorduri pe repetări</div>
      <table class="rm"><tr><th>Repetări</th><th>Cel mai greu făcut</th><th>Estimat</th></tr>${rms.map(x=>`<tr><td><b>${x.r}</b> RM</td>
        <td>${x.best?`<b>${num(x.best.w)}</b> kg <span class="xs mu">${relDay(x.best.d)}</span>`:'—'}</td><td>${x.est?num(x.est)+' kg':'—'}</td></tr>`).join('')}</table>
      <div class="xs mu2" style="margin-top:6px">Cel mai greu făcut = cea mai mare greutate ridicată de cel puțin atâtea ori. Estimat = din cel mai bun 1RM estimat, aproximativ.</div>`:''}</div>
  ${prs.length?`<div class="card"><div class="eyebrow">${ic('trophy')} Recorduri</div><div style="margin-top:4px">
    ${prs.map(p=>`<div class="pr-row"><span class="tag pr">PR</span><b>${esc(p.n)}</b><span class="xs mu">${relDay(p.d)}</span><span class="v">${p.prev}→${p.b}</span></div>`).join('')}</div></div>`:''}`;
}
function progBody(){
  const a=bList(), first=a[0]||{}, last=a[a.length-1]||{}, waist=a.filter(x=>+x.waist>0);
  return `
  <div class="card"><div class="eyebrow">${ic('ruler')} Măsurători (cm)</div>
    <div class="meas">${MEAS.map(([k,l])=>{ const v=+last[k]||null, f=a.find(x=>+x[k]>0), dv=v&&f&&f.d!==last.d?v-(+f[k]):null;
      return `<div class="kpi"><div class="k">${l}</div><div class="v">${v?num(v):'—'}</div>${dv!=null?`<div class="xs ${dv<=0?'delta good':'delta bad'}" style="margin-top:2px">${dv>0?'+':''}${num(dv)}</div>`:''}</div>`; }).join('')}</div>
    ${whtrHTML(waist)}
    ${waist.length>=2?lineChart({pts:waist.map(x=>({x:x.d,y:+x.waist})),label:'talie',hex:COL().ok}):`<div class="empty sm">Graficul taliei apare după a doua măsurătoare.</div>`}
    <div class="form">${MEAS.map(([k,l])=>`<div class="fld"><label for="m_${k}">${l} (cm)</label><input class="inp" id="m_${k}" type="number" step="0.5" inputmode="decimal" placeholder="${last[k]?num(last[k]):''}"></div>`).join('')}
      <div class="fld full"><label for="m_bf">Grăsime corporală % (opțional, dintr-o măsurare: cântar, DEXA, plicometru)</label><input class="inp" id="m_bf" type="number" step="0.1" inputmode="decimal" placeholder="${last.bf?num(last.bf,1):'ex: 22.5'}"></div></div>
    <button class="btn pri wide" style="margin-top:12px" data-a="measAdd">${ic('check')} Salvează măsurătorile</button>
    <div class="note">Talia, la nivelul buricului, dimineața, relaxat. La slăbit, talia scade adesea și când cântarul stă pe loc.</div></div>
  ${a.length?`<div class="card"><div class="eyebrow">Istoric</div><div style="margin-top:4px">${a.slice(-6).reverse().map(x=>`<div class="list-row"><span>${relDay(x.d)}</span>
    <span class="sess-l sp">${MEAS.filter(([k])=>+x[k]>0).map(([k,l])=>l.toLowerCase()+' '+num(x[k])).join(' · ')}</span>
    <button class="xb" data-a="measDel" data-k="${x.d}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>`).join('')}</div></div>`:''}
  ${photosCard()}`;
}
function photosCard(){
  if(S.photos===undefined) return `<div class="card"><div class="eyebrow">${ic('camera')} Poze de progres</div><div class="note">Se încarcă pozele…</div></div>`;
  if(S.photos===null) return `<div class="card"><div class="eyebrow">${ic('camera')} Poze de progres</div><div class="note">Browserul nu permite salvarea pozelor pe această pagină (de exemplu, în modul privat).</div></div>`;
  const pose=S.phPose||'fata', ps=S.photos.filter(p=>p.pose===pose);
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('camera')} Poze de progres</div><span class="xs mu">${S.photos.length} ${S.photos.length===1?'poză':'poze'}</span></div>
    <div class="chips" style="margin-top:12px">${[['fata','Față'],['profil','Profil'],['spate','Spate']].map(([k,l])=>`<button class="chip ${pose===k?'on':''}" data-a="phPose" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="ph-grid"><label class="ph add">${ic('plus')}<span>Adaugă</span><input type="file" accept="image/*" data-photo="1" aria-label="Adaugă o poză de progres"></label>
      ${ps.slice().reverse().map(p=>`<button class="ph" data-a="phOpen" data-k="${p.id}"><img src="${p.data}" alt="Poză din ${p.date}" loading="lazy"><span>${fmtDay(p.date)}</span></button>`).join('')}</div>
    ${ps.length>=2?`<button class="btn wide" style="margin-top:12px" data-a="phCmp">${ic('refresh')} Compară prima cu ultima</button>`:''}
    <div class="note">Pozele rămân doar pe acest dispozitiv și nu intră în copia exportată.${PHDB.mode==='ls'?` Pagina e deschisă ca fișier, așa că pozele se salvează mai mici, cel mult <b>${PH_MAX}</b> (${S.photos.length}/${PH_MAX}).`:''} Pentru comparații corecte: aceeași lumină, aceeași oră, aceeași poziție.</div></div>`;
}


/* ---------- Performanță v6: obiective, compoziție corporală, încărcare pe 12 săptămâni, recuperare pe 30 de zile ----------
   Totul se calculează din ce notezi deja. Estimările își arată sursa și nu sunt măsurători medicale. */
/* trendul liniar al unei serii (cele mai mici pătrate): valoarea de azi și panta pe zi */
function trendOf(pts,days){
  const tk=todayKey(), p=pts.filter(x=>x.x>=dayShift(tk,-days)&&isFinite(x.y));
  if(p.length<3||daysBetween(p[0].x,p[p.length-1].x)<10) return null;
  const xs=p.map(x=>daysBetween(tk,x.x)), mx=avgOf(xs), my=avgOf(p.map(x=>x.y));
  let sxy=0,sxx=0; p.forEach((q,i)=>{ sxy+=(xs[i]-mx)*(q.y-my); sxx+=(xs[i]-mx)*(xs[i]-mx); });
  if(!sxx) return null; const slope=sxy/sxx; return {now:my-slope*mx,slope,n:p.length};
}
const RACE_D=[[5,'5 km'],[10,'10 km'],[21.0975,'Semimaraton'],[42.195,'Maraton']];
const raceName=D=>(RACE_D.find(r=>Math.abs(r[0]-D)<.01)||[0,num(D)+' km'])[1];
/* timpul estimat pe distanța D din fiecare alergare de cel puțin 3 km (formula Riegel), în secunde */
const rieg=(r,D)=>r.min*Math.pow(D/r.km,1.06)*60;
const goalLifts=()=>Object.keys(S.lifts||{}).filter(n=>bestE1(n)>0).sort();
/* obiective: 1 km (timp măsurat), forță (1RM estimat sau greutate ridicată), repetări (cele mai multe într-o serie),
   alergare (timp pe distanță, estimat din alergări), greutate corporală (media pe 7 zile) */
const GOAL_K=[['k1','1 km'],['lift','Forță'],['reps','Repetări'],['run','Alergare'],['wt','Greutate']];
const goalLow=g=>g.k==='run'||g.k==='k1'||g.k==='wt';
function goalSeries(g){
  const tk=todayKey();
  if(g.k==='lift') return liftHist(g.ex).map(e=>({x:e.d,y:g.m==='w'?Math.max(0,...e.s.map(s=>+s[0]||0)):Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))})).filter(p=>p.y>0);
  if(g.k==='reps') return liftHist(g.ex).map(e=>({x:e.d,y:Math.max(0,...e.s.map(s=>+s[1]||0))})).filter(p=>p.y>0);
  if(g.k==='run') return (S.runs||[]).filter(r=>+r.km>=3&&+r.min>0).map(r=>({x:r.date,y:rieg(r,g.dist)})).sort((a,b)=>a.x<b.x?-1:1);
  if(g.k==='k1'){ const m={}; k1Results().forEach(r=>{ if(!m[r.date]||r.sec<m[r.date].y) m[r.date]={x:r.date,y:r.sec,note:r.lbl}; }); return Object.values(m).sort((a,b)=>a.x<b.x?-1:1); }
  return wMA(wList()).filter(p=>p.x>=dayShift(tk,-120));
}
function goalNow(g,ser){
  const tk=todayKey(), rec=ser.filter(p=>p.x>=dayShift(tk,g.k==='run'?-90:g.k==='k1'||g.k==='reps'?-120:-60));
  if(g.k==='wt'){ const ws=wStats(); return ws?ws.a7:null; }
  if(!ser.length) return null; const src=rec.length?rec:ser;
  return goalLow(g)?Math.min(...src.map(p=>p.y)):Math.max(...src.map(p=>p.y));
}
const goalFmt=(g,v)=>v==null?'—':g.k==='run'||g.k==='k1'?fmtClock(v):g.k==='reps'?Math.round(v)+' rep.':num(v)+' kg';
const goalTitle=g=>g.k==='lift'?g.ex+' · '+num(g.t)+' kg'+(g.m==='w'?'':' 1RM'):g.k==='reps'?g.ex+' · '+g.t+' repetări':g.k==='k1'?'1 km în '+fmtClock(g.t):g.k==='run'?raceName(g.dist)+' în '+fmtClock(g.t):'Greutate · '+num(g.t)+' kg';
const goalSrc=g=>g.k==='lift'?(g.m==='w'?'cea mai mare greutate ridicată (60 de zile)':'1RM estimat (Epley), cel mai bun din 60 de zile'):g.k==='reps'?'cele mai multe repetări într-o serie (120 de zile)'
  :g.k==='k1'?'cel mai bun 1 km măsurat (120 de zile)':g.k==='run'?'estimat din alergări de cel puțin 3 km (Riegel)':'media pe 7 zile';
/* diferența până la țintă, în unitatea obiectivului */
function goalGap(g,cur){ if(cur==null) return ''; const d=g.t-cur, lo=goalLow(g); if(lo?d>=0:d<=0) return '';
  return g.k==='run'||g.k==='k1'?'mai ai '+fmtClock(Math.abs(d)):g.k==='reps'?'mai ai '+Math.round(Math.abs(d))+' rep.':'mai ai '+num(Math.abs(d),1)+' kg'; }
/* starea unui obiectiv: progres, repere (25–100%), data estimată din trendul real și dacă ești în grafic față de termen */
function goalState(g){
  const ser=goalSeries(g), cur=goalNow(g,ser), dir=goalLow(g)?-1:1, tk=todayKey();
  const done=cur!=null&&(dir>0?cur>=g.t:cur<=g.t);
  const from=g.from!=null?g.from:cur, span=g.t-from, frac=done?1:cur==null||!span?0:clamp((cur-from)/span,0,1);
  const tr=trendOf(ser,g.k==='wt'?42:g.k==='run'||g.k==='k1'?90:70);
  let eta=null, why='';
  if(done) why='atins';
  else if(cur==null) why=g.k==='lift'||g.k==='reps'?'notează serii la '+g.ex:g.k==='run'?'notează o alergare de cel puțin 3 km':g.k==='k1'?'notează un test de 1 km sau o alergare cu despărțiri':'cântărește-te câteva zile';
  else if(!tr) why='mai am nevoie de date din 2–3 săptămâni ca să estimez';
  else if(tr.slope*dir<=0) why='trendul de acum nu merge spre țintă';
  else { const d=Math.ceil((g.t-tr.now)/tr.slope); if(d>1095) why='peste 3 ani, la ritmul de acum'; else eta=dayShift(tk,Math.max(1,d)); }
  let st=done?'ok':'';
  if(!done&&g.by){ st=eta&&eta<=g.by?'ok':'late'; }
  const need=g.by&&cur!=null&&!done?(g.t-cur)/Math.max(1,daysBetween(tk,g.by))*7:null;
  /* repere: prima zi în care seria (cel mai bun rezultat de până atunci) a trecut de 25, 50, 75 și 100% din drum */
  const ms=[]; if(span&&from!=null){ let best=null; ser.filter(p=>p.x>=(g.d0||'0000')).forEach(p=>{ best=best==null?p.y:dir>0?Math.max(best,p.y):Math.min(best,p.y);
    [.25,.5,.75,1].forEach(m=>{ if(!ms.find(x=>x.m===m)&&(best-from)/span>=m-1e-9) ms.push({m,d:p.x,v:best}); }); }); }
  return {cur,done,frac,eta,why,st,need,rate:tr?tr.slope*7:null,gap:goalGap(g,cur),ms,ser};
}
function goalsAll(){
  const P=prof(), gs=(S.goals||[]).slice();
  if(P.goalW&&P.startW&&P.goalW!==P.startW) gs.unshift({id:'wt',k:'wt',t:+P.goalW,by:P.goalBy||null,from:+P.startW});
  return gs;
}
const goalRate=(g,v)=>g.k==='run'||g.k==='k1'?(Math.abs(v)<1?'':(v>0?'+':'−')+fmtClock(Math.abs(v))):g.k==='reps'?(v>0?'+':'')+num(v,1)+' rep.':(v>0?'+':'')+num(v,g.k==='wt'?2:1)+' kg';
function goalsCard(){
  const gs=goalsAll();
  const rows=gs.map(g=>{ const s=goalState(g), tag=s.done?`<span class="tag rest">${ic('check')} atins</span>`:s.st==='ok'?'<span class="tag rest">în grafic</span>':s.st==='late'?'<span class="tag need">în urmă</span>':'';
    return `<div class="gl-r"><div class="row" style="align-items:flex-start"><div class="sp link" data-a="goalOpen" data-k="${esc(g.id)}"><b>${esc(goalTitle(g))}</b>
        <div class="xs mu">acum ${goalFmt(g,s.cur)} · ${esc(goalSrc(g).split(' (')[0])}${s.gap?' · '+s.gap:''}${s.rate!=null&&!s.done&&goalRate(g,s.rate)?' · '+goalRate(g,s.rate)+' / săpt.':''}</div></div>
        ${tag}${g.id==='wt'?`<button class="xb" data-a="goalAdd" data-k="wt" aria-label="Editează">${ic('edit')}</button>`:`<button class="xb" data-a="goalDel" data-k="${esc(g.id)}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button>`}</div>
      <div class="bar"><i style="width:${(s.frac*100).toFixed(1)}%"></i></div>
      <div class="gl-ms">${[.25,.5,.75,1].map(m=>`<i class="${s.ms.find(x=>x.m===m)?'on':''}" style="left:${m*100}%" title="${m*100}%"></i>`).join('')}</div>
      <div class="gl-m"><span>${s.done?'Obiectiv atins. Pune-ți următorul.':s.eta?`${ic('clock')} estimat ~${fmtDay(s.eta)}${s.eta.slice(0,4)!==todayKey().slice(0,4)?' '+s.eta.slice(0,4):''} (${Math.max(1,Math.round(daysBetween(todayKey(),s.eta)/7))} săpt.)`:esc(s.why)}</span>
        ${g.by?`<span>termen ${fmtDay(g.by)}${s.st==='late'&&s.need!=null?` · ai nevoie de ${goalRate(g,s.need)} / săpt.`:''}</span>`:''}</div></div>`; }).join('');
  return `<div class="card goals"><div class="row"><div class="eyebrow sp">${ic('target')} Obiective</div><button class="btn ghost sm" data-a="goalAdd">${ic('plus')} Adaugă</button></div>
    ${rows||`<div class="empty sm">Pune-ți un obiectiv: 1 km în 4:00, un 1RM, un număr de flotări sau greutatea țintă. Îți arăt progresul, reperele și data estimată.</div>`}
    ${rows?`<div class="note">Data estimată vine din trendul tău real din ultimele săptămâni. Se schimbă pe măsură ce notezi, deci e o orientare, nu o promisiune.</div>`:''}</div>`;
}
/* detaliul unui obiectiv: istoric, repere, sursa cifrei */
function goalHTML(){
  const g=goalsAll().find(x=>x.id===SH.id); if(!g) return `<div class="empty">Obiectivul nu mai există.</div>`;
  const s=goalState(g), fmt=v=>goalFmt(g,v), ser=s.ser.filter(p=>p.x>=dayShift(g.d0||todayKey(),-60));
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('target')} Obiectiv</div><div class="h2" style="margin-top:6px">${esc(goalTitle(g))}</div>
    <div class="kpis c4"><div class="kpi"><div class="k">Acum</div><div class="v" style="font-size:20px">${fmt(s.cur)}</div></div><div class="kpi"><div class="k">Țintă</div><div class="v" style="font-size:20px">${fmt(g.t)}</div></div>
      <div class="kpi"><div class="k">Diferență</div><div class="v" style="font-size:20px">${s.done?'atinsă':s.gap?esc(s.gap.replace('mai ai ','')):'—'}</div></div><div class="kpi"><div class="k">Progres</div><div class="v" style="font-size:20px">${Math.round(s.frac*100)}%</div></div></div>
    <div class="bar"><i style="width:${(s.frac*100).toFixed(1)}%"></i></div>
    ${ser.length>=2?lineChart({pts:ser,goal:g.t,goalLbl:'țintă '+fmt(g.t),fmt,fmtAx:g.k==='run'||g.k==='k1'?(v=>fmtClock(v)):null,inv:goalLow(g)&&g.k!=='wt',label:'istoricul obiectivului',dots:true,trend:true}):`<div class="empty sm">Istoricul apare după ce ai cel puțin două valori.</div>`}
    <div class="dsec"><h4>Repere</h4>${[.25,.5,.75,1].map(m=>{ const x=s.ms.find(y=>y.m===m); return `<div class="list-row"><span class="tag ${x?'rest':''}">${m*100}%</span><span class="sp mu sm">${g.from!=null?fmt(g.from+(g.t-g.from)*m):''}</span><span class="v">${x?fmtDay(x.d):'—'}</span></div>`; }).join('')}</div>
    <div class="note">Cifra de acum: <b>${esc(goalSrc(g))}</b>. Pornit de la ${fmt(g.from)}${g.d0?' pe '+fmtDay(g.d0):''}${g.by?', termen '+fmtDay(g.by):''}. ${s.eta&&!s.done?'Estimarea (~'+fmtDay(s.eta)+') vine din trendul ultimelor săptămâni.':esc(s.why==='atins'?'':s.why)}</div>`;
}
ACT.goalOpen=(el,{k})=>{ SH={kind:'goal1',id:k}; shRender(); };
const parseTime=s=>{ const p=String(s||'').trim().split(':').map(Number); if(!p.length||p.some(x=>!isFinite(x)||x<0)) return null;
  const v=p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:p[0]*60; return v>0?v:null; };
function goalForm(){
  const k=SH.k||'lift', P=prof(), lifts=goalLifts(), rp=racePred(), b1=k1Best();
  const allEx=Object.keys(S.lifts||{}).sort();
  const body=k==='lift'?(lifts.length?`<div class="form"><div class="fld full"><label for="gEx">Exercițiu</label><select class="inp" id="gEx">${lifts.map(n=>`<option>${esc(n)}</option>`).join('')}</select></div>
        <div class="fld"><label>Ce urmărești</label><div class="seg" style="margin-top:0">${[['e1','1RM estimat'],['w','Greutate']].map(([m,l])=>`<button class="${(SH.m||'e1')===m?'on':''}" data-a="goalM" data-k="${m}">${l}</button>`).join('')}</div></div>
        <div class="fld"><label for="gT">${(SH.m||'e1')==='w'?'Greutate țintă (kg)':'1RM țintă (kg)'}</label><input class="inp" id="gT" type="number" step="0.5" inputmode="decimal" placeholder="acum ~${bestE1(lifts[0])} kg"></div></div>`
      :`<div class="empty sm">Notează întâi câteva serii într-un antrenament, ca să am de la ce porni.</div>`)
    :k==='reps'?`<div class="form"><div class="fld full"><label for="gEx">Exercițiu</label><input class="inp" id="gEx" list="gExL" placeholder="ex: Push Ups" value="${esc(SH.ex||'')}"><datalist id="gExL">${exAllNames().map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
        <div class="fld full"><label for="gT">Repetări într-o serie</label><input class="inp" id="gT" type="number" step="1" inputmode="numeric" placeholder="ex: 50"></div></div>
        <div class="xs mu" style="margin-top:6px">Se numără cea mai lungă serie notată la exercițiul ales (în antrenament sau liber).</div>`
    :k==='k1'?`<div class="form"><div class="fld full"><label for="gTm">Timp țintă pe 1 km</label><input class="inp" id="gTm" inputmode="text" placeholder="ex: 4:00" value="${esc(SH.t||'')}"></div></div>
        <div class="xs mu" style="margin-top:6px">${b1?'Cel mai bun 1 km măsurat: <b>'+fmtClock(b1.sec)+'</b> ('+esc(b1.lbl)+').':'Încă nu ai un 1 km măsurat: fă testul din 1 KM Lab sau notează o alergare cu despărțiri.'}</div>`
    :k==='run'?`<div class="form"><div class="fld"><label for="gD">Distanța</label><select class="inp" id="gD">${RACE_D.map(([D,l])=>`<option value="${D}">${l}</option>`).join('')}</select></div>
        <div class="fld"><label for="gTm">Timp țintă</label><input class="inp" id="gTm" inputmode="text" placeholder="${rp?fmtClock(rp.list[0].s):'25:00'}"></div></div>
        <div class="xs mu" style="margin-top:6px">Scrie min:sec (25:00) sau ore:min:sec (1:55:00).${rp?' Estimarea de acum pe 5 km: <b>'+fmtClock(rp.list[0].s)+'</b>.':''}</div>`
    :`<div class="form"><div class="fld full"><label for="gT">Greutate țintă (kg)</label><input class="inp" id="gT" type="number" step="0.1" inputmode="decimal" value="${P.goalW||''}"></div></div>
        <div class="xs mu" style="margin-top:6px">E aceeași țintă ca în Setări → Profil.</div>`;
  const by=k==='wt'?P.goalBy:'';
  return `<div class="eyebrow">${ic('target')} Obiectiv</div><div class="h2" style="margin-top:6px">Ce vrei să atingi?</div>
    <div class="seg scr">${GOAL_K.map(([x,l])=>`<button class="${k===x?'on':''}" data-a="goalK" data-k="${x}">${l}</button>`).join('')}</div>
    ${body}
    <div class="form"><div class="fld full"><label for="gBy">Până la (opțional)</label><input class="inp" id="gBy" type="date" min="${dayShift(todayKey(),7)}" value="${by||''}"></div></div>
    <button class="btn pri wide xl" style="margin-top:16px" data-a="goalSave">${ic('check')} Salvează obiectivul</button>`;
}
ACT.goalM=(el,{k})=>{ if(SH&&SH.kind==='goal'){ SH.m=k; shRender(); } };
async function goalSave(){
  const k=SH.k||'lift', by=($('#gBy')||{}).value||null, g={id:'g'+Date.now().toString(36),k,d0:todayKey(),by:by&&by>todayKey()?by:null};
  if(k==='lift'){ const ex=($('#gEx')||{}).value, t=parseFloat(($('#gT')||{}).value); if(!ex||!(t>0&&t<1000)){ shake('#gT'); return; }
    Object.assign(g,{ex,t}); if(SH.m==='w') g.m='w'; }
  else if(k==='reps'){ const ex=String(($('#gEx')||{}).value||'').trim(), t=parseInt(($('#gT')||{}).value,10); if(!ex){ shake('#gEx'); return; } if(!(t>0&&t<=1000)){ shake('#gT'); return; } Object.assign(g,{ex,t}); }
  else if(k==='k1'){ const t=parseTime(($('#gTm')||{}).value); if(!t||t<120||t>900){ shake('#gTm'); return; } g.t=t;
    (S.goals||[]).filter(x=>x.k==='k1').forEach(x=>{ g.from=x.from; }); }
  else if(k==='run'){ const D=+($('#gD')||{}).value, t=parseTime(($('#gTm')||{}).value); if(!D||!t){ shake('#gTm'); return; } Object.assign(g,{dist:D,t}); }
  else { const t=parseFloat(($('#gT')||{}).value); if(!(t>30&&t<400)){ shake('#gT'); return; }
    await save('prof',Object.assign({},S.prof,{goalW:t,goalBy:g.by})); SH=null; shRender(); render(); toast('Țintă salvată',num(t)+' kg'+(g.by?' până la '+fmtDay(g.by):''),'info'); return; }
  if(g.from==null) g.from=goalNow(g,goalSeries(g));
  /* un singur obiectiv de 1 km: cel nou îl înlocuiește pe cel vechi */
  const rest=(S.goals||[]).filter(x=>!(k==='k1'&&x.k==='k1'));
  await save('goals',rest.concat([g])); SH=null; shRender(); render(); toast('Obiectiv salvat',goalTitle(g),'info');
}

/* compoziție corporală: % grăsime estimat cu formula US Navy (talie, gât, înălțime; la femei și șold) */
function navyBF(x,P){
  const h=+P.h, w=+x.waist, n=+x.neck, hp=+x.hip; if(!(h>0&&w>0&&n>0)) return null;
  if(P.sex==='f'){ if(!(hp>0)||w+hp-n<=0) return null; return 495/(1.29579-.35004*Math.log10(w+hp-n)+.221*Math.log10(h))-450; }
  if(w-n<=0) return null; return 495/(1.0324-.19077*Math.log10(w-n)+.15456*Math.log10(h))-450;
}
function bodyComp(){
  const P=prof(), pts=bList().map(x=>{ const bf=navyBF(x,P); if(bf==null||bf<3||bf>70) return null; const w=wAt(x.d); return {d:x.d,bf,w,fat:w*bf/100,lean:w*(1-bf/100)}; }).filter(Boolean);
  const need=P.sex==='f'?'gâtul și șoldul':'gâtul';
  /* procentul introdus de tine (dintr-o măsurare) are prioritate și e marcat ca atare; estimarea US Navy rămâne separată */
  const man=bList().filter(x=>x.bf>0).map(x=>({d:x.d,bf:+x.bf,w:wAt(x.d)}));
  const manH=man.length?`<div class="list-row"><span class="sp">Grăsime, introdusă de tine <span class="src ms">măsurat</span></span><span class="v">${num(man[man.length-1].bf,1)}% · ${relDay(man[man.length-1].d)}</span></div>
    ${man.length>=2?lineChart({pts:man.map(p=>({x:p.d,y:p.bf})),label:'grăsime introdusă %',dec:1,unit:'%',hex:COL().ok,dots:true,h:130}):''}`:'';
  if(!pts.length) return `<div class="card"><div class="eyebrow">${ic('user')} Compoziție corporală</div>${manH}
    <div class="sm mu" style="margin-top:8px">Adaugă <b>${need}</b> la măsurătorile de mai jos (pe lângă talie) și îți estimez procentul de grăsime și masa slabă. Așa vezi dacă slăbești din grăsime sau din mușchi.</div></div>`;
  const a=pts[0], b=pts[pts.length-1], dW=b.w-a.w, dF=b.fat-a.fat, dL=b.lean-a.lean;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('user')} Compoziție corporală</div><span class="xs mu">${relDay(b.d)}</span></div>
    ${manH}<div class="xs mu2" style="margin-top:10px">Estimare din circumferințe <span class="src est">estimat · US Navy</span></div>
    <div class="kpis">
      <div class="kpi"><div class="k">Grăsime</div><div class="v">${num(b.bf,1)}<small>%</small></div></div>
      <div class="kpi"><div class="k">Masă grasă</div><div class="v">${num(b.fat,1)}<small>kg</small></div></div>
      <div class="kpi"><div class="k">Masă slabă</div><div class="v">${num(b.lean,1)}<small>kg</small></div></div></div>
    ${ffmiHTML(b.lean,P)}
    ${pts.length>=2?`<div class="bc-d"><div><b class="${dF<=0?'good':'bad'}">${dF>0?'+':''}${num(dF,1)} kg</b><span>grăsime</span></div><div><b class="${dL>=-0.3?'good':'bad'}">${dL>0?'+':''}${num(dL,1)} kg</b><span>masă slabă</span></div><div><b>${dW>0?'+':''}${num(dW,1)} kg</b><span>total, din ${fmtDay(a.d)}</span></div></div>
      ${dF<-0.3&&dL>=0?`<div class="note" style="margin-top:8px">Ai pierdut <b>${num(-dF,1)} kg</b> de grăsime și ai păstrat masa slabă${dL>0.3?` (chiar <b>+${num(dL,1)} kg</b>)`:''}. Exact ce vrei la slăbit.</div>`
        :dW<-0.5?`<div class="note" style="margin-top:8px">Din <b>${num(-dW,1)} kg</b> slăbiți, cam <b>${num(clamp(-dF/-dW,0,1)*100,0)}%</b> au fost grăsime.${dL<-1?' Masa slabă scade: ține proteina sus și greutățile grele pe bară.':''}</div>`:''}
      ${lineChart({pts:pts.map(p=>({x:p.d,y:p.bf})),label:'grăsime corporală %',dec:1,hex:COL().ok})}`:''}
    <div class="note">Formula US Navy, din talie, gât${P.sex==='f'?', șold':''} și înălțime. Eroarea tipică e de 3–4 puncte, deci urmărește tendința, nu cifra exactă. Nu e o măsurătoare medicală.</div></div>`;
}

/* raportul talie/înălțime (Ashwell): prezice riscul cardiometabolic mai bine decât IMC-ul; ținta e sub 0,5 */
function whtrHTML(waist){
  const P=prof(), last=waist[waist.length-1]; if(!last||!(+P.h>0)) return '';
  const r=+last.waist/+P.h, pos=clamp((r-.35)/(.75-.35),0,1), cat=r<.4?['sub 0,4','need']:r<.5?['sănătos','rest']:r<.6?['risc crescut','need']:['risc ridicat','bad'];
  const tgt=Math.floor(+P.h*.5), first=waist[0], dr=first&&first.d!==last.d?(+last.waist-+first.waist)/+P.h:null;
  return `<div class="whtr"><div class="row"><div class="sp"><div class="xs mu">Talie / înălțime</div><div class="big sm">${num(r,2)}</div></div><span class="tag ${cat[1]}">${cat[0]}</span></div>
    <div class="wh-bar"><i style="left:${(clamp((.4-.35)/.4,0,1)*100).toFixed(1)}%;width:${(.1/.4*100).toFixed(1)}%"></i><span style="left:${(pos*100).toFixed(1)}%"></span></div>
    <div class="wh-l"><span>0,35</span><span>0,5</span><span>0,6</span><span>0,75</span></div>
    <div class="xs mu" style="margin-top:6px">${r>=.5?`Ținta de sub 0,5 înseamnă o talie sub <b style="color:var(--tx)">${tgt} cm</b> la înălțimea ta (acum ${num(+last.waist)} cm)${dr!=null&&dr<0?`; ai coborât deja cu ${num(-dr,2)} de la prima măsurătoare`:''}.`:'Ești sub 0,5: zona asociată cu cel mai mic risc.'} Reper: „talia sub jumătate din înălțime” (Ashwell, 2012).</div></div>`;
}
/* FFMI: masa slabă raportată la înălțime; varianta normalizată corectează pentru înălțime (Kouri, 1995) */
function ffmiHTML(lean,P){
  const h=+P.h/100; if(!(h>1.2&&lean>20)) return '';
  const f=lean/(h*h), n=f+6.1*(1.8-h), lv=n<18?'sub medie':n<20?'medie':n<22?'peste medie':n<23?'foarte bun':n<25?'excelent':'rar fără substanțe';
  return `<div class="bc-d" style="grid-template-columns:1fr 1fr;margin-top:8px"><div><b>${num(f,1)}</b><span>FFMI</span></div><div><b>${num(n,1)}</b><span>FFMI normalizat · ${lv}</span></div></div>`;
}
/* pașii: cea mai mare parte din mișcarea de zi cu zi (NEAT), care scade adesea fără să-ți dai seama în deficit */
function stepsCard(){
  const tk=todayKey(), T=+prof().stepsT||8000, days=[]; for(let i=13;i>=0;i--){ const k=dayShift(tk,-i); days.push({k,v:+jOf(k).steps||0}); }
  const has=days.filter(d=>d.v>0), l7=days.slice(-7).filter(d=>d.v>0), a7=l7.length?avgOf(l7.map(d=>d.v)):null, hit=l7.filter(d=>d.v>=T).length, today=+jOf(tk).steps||0;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('run')} Pași zilnici</div>${a7!=null?`<span class="tag ${a7>=T?'rest':''}">${hit}/${l7.length} zile la țintă</span>`:''}</div>
    <div class="row" style="margin-top:8px;align-items:flex-end"><div class="big">${a7!=null?Math.round(a7).toLocaleString('ro-RO'):'—'}<small>pași / zi · 7 zile</small></div></div>
    ${has.length>=2?barChart(days.map(d=>({lbl:DAYS[(parseKey(d.k).getDay()+6)%7].charAt(0),v:Math.round(d.v/100)/10,hi:d.v>=T})),{line:T/1000,lineLbl:'țintă '+num(T/1000,0)+'k',dec:1,hex:TH().ac,label:'mii de pași pe zi'}):''}
    <div class="inrow"><input class="inp" id="jSteps" type="number" inputmode="numeric" placeholder="${today?'Azi: '+today+' pași':'Pașii de azi, din telefon sau ceas'}"><button class="btn pri" data-a="jStepsSave">${ic('check')} Salvează</button></div>
    <div class="chips" style="margin-top:10px"><span class="xs mu" style="align-self:center">Ținta:</span>${[6000,8000,10000,12000].map(v=>`<button class="chip ${T===v?'on':''}" data-a="stepsT" data-i="${v}">${num(v/1000,0)} mii</button>`).join('')}</div>
    <div class="note">În deficit caloric corpul se mișcă mai puțin fără să-ți dai seama, iar asta poate anula o parte din deficit. O țintă de pași ține mișcarea sus. 8–10 mii de pași pe zi sunt asociați cu cel mai mic risc de mortalitate la adulții sub 60 de ani (Paluch și colab., 2022).</div></div>`;
}
/* pantofii de alergare: fiecare alergare merge la pantoful folosit în perioada aceea (cel mai recent început înainte de dată) */
const shoeOf=d=>(S.shoes||[]).filter(s=>s.since<=d&&(!s.ret||s.ret>d)).sort((a,b)=>a.since<b.since?1:-1)[0]||null;
const shoeKm=s=>(+s.km0||0)+(S.runs||[]).reduce((a,r)=>{ const o=shoeOf(r.date); return a+(o&&o.id===s.id?(+r.km||0):0); },0);
function shoesCard(){
  const sh=(S.shoes||[]).slice().sort((a,b)=>(a.ret?1:0)-(b.ret?1:0)||(a.since<b.since?1:-1));
  const rows=sh.map(s=>{ const km=shoeKm(s), mx=+s.max||700, f=km/mx, st=s.ret?['retras','']:f>=1?['de schimbat','bad']:f>=.85?['aproape de schimbat','need']:['în formă','rest'];
    return `<div class="gl-r"><div class="row" style="align-items:flex-start"><div class="sp"><b>${esc(s.n)}</b><div class="xs mu">${num(km,0)} din ${mx} km · din ${fmtDay(s.since)}${s.ret?' până la '+fmtDay(s.ret):''}</div></div>
      <span class="tag ${st[1]}">${st[0]}</span>${s.ret?'':`<button class="xb" data-a="shoeRet" data-k="${esc(s.id)}" data-confirm="Retrag?" aria-label="Retrage">${ic('check')}</button>`}<button class="xb" data-a="shoeDel" data-k="${esc(s.id)}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>
      <div class="bar" style="height:6px"><i style="width:${(clamp(f,0,1)*100).toFixed(1)}%;${f>=1?'background:var(--warn)':''}"></i></div></div>`; }).join('');
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('run')} Pantofi de alergare</div><button class="btn ghost sm" data-a="shoeForm">${ic('plus')} Adaugă</button></div>
    ${S.shoeForm?`<div class="form"><div class="fld full"><label for="shN">Model</label><input class="inp" id="shN" placeholder="ex: Pegasus 41"></div>
      <div class="fld"><label for="shS">Folosiți din</label><input class="inp" id="shS" type="date" value="${todayKey()}" max="${todayKey()}"></div>
      <div class="fld"><label for="shK">Km deja făcuți</label><input class="inp" id="shK" type="number" inputmode="decimal" placeholder="0"></div>
      <div class="fld full"><label for="shM">Schimbi la (km)</label><input class="inp" id="shM" type="number" inputmode="numeric" value="700"></div></div>
      <div class="inrow"><button class="btn ghost" data-a="shoeForm">Renunță</button><button class="btn pri" style="flex:1" data-a="shoeAdd">${ic('check')} Salvează</button></div>`:''}
    ${rows||(S.shoeForm?'':`<div class="empty sm">Adaugă pantofii cu care alergi: ZECE adună singur kilometrii din alergări și îți spune când e timpul să-i schimbi.</div>`)}
    ${rows?`<div class="note">Spuma din talpă își pierde amortizarea în timp; reperul uzual e 500–800 km, după greutate, suprafață și model. La ${num(curW(),0)} kg, spre capătul de jos al intervalului. Fiecare alergare intră la pantoful folosit atunci.</div>`:''}</div>`;
}
/* încărcarea pe 12 săptămâni: suma încărcării zilnice pe săptămână și raportul față de media ultimelor 4 */
function weekLoads(n){
  const m0=mondayOf(todayKey()), out=[];
  for(let i=n+2;i>=0;i--){ const m=dayShift(m0,-7*i), ds=[]; for(let j=0;j<7;j++){ const d=dayShift(m,j); ds.push(d>todayKey()?null:dayLoad(d)); }
    const v=ds.reduce((a,x)=>a+(x||0),0); out.push({m,v,ds}); }
  const f0=out.findIndex(w=>w.v>0);
  /* raportul are sens doar cu 4 săptămâni de istoric: înainte de primele date nu există o „medie obișnuită" */
  out.forEach((w,i)=>{ const c=out.slice(Math.max(0,i-3),i+1), s=c.reduce((a,x)=>a+x.v,0); w.r=f0>=0&&i-3>=f0&&s>0?w.v/(s/4):null; });
  return out.slice(3);
}
const zoneOf=r=>r==null?['—','',null]:r>1.5?['crescută brusc','hot','var(--warn)']:r>1.3?['în creștere','up','#F0C483']:r<.8?['sub obișnuit','low','var(--mu2)']:['echilibrată','ok','var(--ac)'];
function loadCard(){
  const ws=weekLoads(12), cur=ws[ws.length-1], max=Math.max(1,...ws.map(w=>w.v)), [zl]=zoneOf(cur.r);
  if(!ws.some(w=>w.v>0)) return `<div class="card"><div class="eyebrow">${ic('chart')} Încărcare · 12 săptămâni</div><div class="empty sm">Apare după primele antrenamente și alergări notate.</div></div>`;
  const W=340,H=150,T=16,B=22,gap=6,bw=(W-gap*11)/12;
  const bars=ws.map((w,i)=>{ const h=Math.max(w.v>0?3:0,(H-T-B)*w.v/max), x=i*(bw+gap), y=H-B-h, [,cls]=zoneOf(w.r);
    return `<rect class="bar-r lz ${cls}${i===ws.length-1?' cur':''}" style="--i:${i}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="5"/>
      ${(ws.length-1-i)%3===0?`<text x="${(x+bw/2).toFixed(1)}" y="${H-5}" text-anchor="middle" class="ax">${fmtDay(w.m)}</text>`:''}`; }).join('');
  const dl=cur.ds.filter(x=>x!=null), mean=avgOf(dl), sd=Math.sqrt(avgOf(dl.map(x=>(x-mean)*(x-mean)))), mono=sd>0?mean/sd:null;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('chart')} Încărcare · 12 săpt.</div><span class="tag">${cur.r!=null?num(cur.r,2)+'×':'—'} · ${zl}</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Încărcarea pe săptămână">${bars}</svg>
    <div class="legend"><span><i class="lzk ok"></i>0,8–1,3× echilibrat</span><span><i class="lzk up"></i>1,3–1,5×</span><span><i class="lzk hot"></i>peste 1,5×</span><span><i class="lzk low"></i>sub 0,8×</span></div>
    <div class="kpis"><div class="kpi"><div class="k">Săptămâna asta</div><div class="v">${Math.round(cur.v)}</div></div>
      <div class="kpi"><div class="k">Media pe 4 săpt.</div><div class="v">${Math.round(avgOf(ws.slice(-4).map(w=>w.v)))}</div></div>
      <div class="kpi"><div class="k">Monotonie</div><div class="v">${mono!=null?num(mono,1):'—'}</div></div></div>
    <div class="note">Încărcarea unei zile = serii × efort (RPE) + minute de alergare × efort + cronometru și antrenamentele din Strava. ${cur.r!=null&&cur.r>1.5?'<b>Ai crescut brusc volumul:</b> riscul de accidentare și de oboseală urcă; ține ziua următoare ușoară.':cur.r!=null&&cur.r<.8?'Săptămână mai ușoară decât de obicei: bună pentru refacere, dar nu prea multe la rând.':'Creșteri de până la ~10–15% pe săptămână sunt de obicei sigure.'} Monotonia peste 2 înseamnă zile prea asemănătoare: alternează zilele grele cu cele ușoare. Indicatori orientativi.</div></div>`;
}

/* recuperarea pe 30 de zile: somn, HRV, puls în repaus și energie din check-in, față de media ta */
const REC_M={sleep:['Somn','h',1,1,COL().run],hrv:['HRV','ms',0,1,COL().ok],rhr:['Puls repaus','bpm',0,-1,'#D39A8A'],energy:['Energie','/5',0,1,'#F0C483']};
function recCard(){
  const tk=todayKey(), m=S.recM&&REC_M[S.recM]?S.recM:'sleep', [lbl,unit,dec,good,hex]=REC_M[m];
  const pts=[]; for(let i=29;i>=0;i--){ const d=dayShift(tk,-i), v=+jOf(d)[m]; if(v>0) pts.push({x:d,y:v}); }
  const has=Object.keys(REC_M).filter(k=>{ let n=0; for(let i=0;i<30;i++) if(+jOf(dayShift(tk,-i))[k]>0) n++; return n>=1; });
  const chips=`<div class="chips" style="margin-top:12px">${Object.keys(REC_M).map(k=>`<button class="chip ${m===k?'on':''}" data-a="recM" data-k="${k}">${REC_M[k][0]}${has.indexOf(k)<0?' ·':''}</button>`).join('')}</div>`;
  if(pts.length<3) return `<div class="card"><div class="eyebrow">${ic('moon')} Recuperare · 30 de zile</div>${chips}
    <div class="empty sm">${pts.length?'Mai fă check-in-ul câteva zile':'Fă check-in-ul de dimineață câteva zile'} (somn, energie; opțional HRV și puls din ceas) ca să apară tendința.</div></div>`;
  const avg=avgOf(pts.map(p=>p.y)), last=pts[pts.length-1], dv=last.y-avg, pct=avg?dv/avg*100:0;
  const verdict=m==='sleep'?(avgOf(pts.slice(-7).map(p=>p.y))>=7?'Media pe 7 zile e de cel puțin 7 ore: bine pentru refacere.':'Sub 7 ore în medie pe 7 zile: refacerea și forța au de suferit.')
    :Math.abs(pct)<5?'În jurul mediei tale.':(dv*good>0?'Peste media ta, în direcția bună.':m==='rhr'?'Pulsul de repaus e peste media ta: oboseală, stres, somn slab sau început de răceală. Ia-o mai ușor.':m==='hrv'?'HRV sub media ta: corpul încă se reface. O zi mai ușoară ajută.':'Sub media ta.');
  const short=m==='sleep'?pts.filter(p=>p.y<7).length:null;
  return `<div class="card"><div class="eyebrow">${ic('moon')} Recuperare · 30 de zile</div>${chips}
    <div class="row" style="margin-top:12px;align-items:flex-end"><div class="big">${num(last.y,dec)}<small>${unit} · ${relDay(last.x)}</small></div>
      <span class="sp"></span><div style="text-align:right"><div class="xs mu">media ta</div><b>${num(avg,1)} ${unit}</b></div></div>
    ${lineChart({pts,label:lbl+' în ultimele 30 de zile',dec,hex,goal:avg,goalLbl:'media '+num(avg,1)})}
    <div class="note"><b>${esc(verdict)}</b>${short!=null?` ${short} ${short===1?'noapte':'nopți'} sub 7 ore din ${pts.length} notate.`:''} Comparația e cu tine însuți, nu cu alți oameni.</div></div>`;
}

/* ---------- progres pe exerciții, forță relativă, eficiență aerobă ---------- */
/* fiecare exercițiu: urcă (1RM estimat nou în ultimele 3 sesiuni), stă pe loc sau scade (media ultimelor 3 sub 95% din cel mai bun) */
function liftTrend(n){
  const tk=todayKey(), ses=liftHist(n).map(e=>({d:e.d,e1:Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))})).filter(x=>x.e1>0);
  if(ses.length<2) return null;
  const cur=ses[ses.length-1], last3=ses.slice(-3), prev=ses.slice(0,-3);
  const bestPrev=prev.length?Math.max(...prev.map(x=>x.e1)):0, best3=Math.max(...last3.map(x=>x.e1)), best=Math.max(bestPrev,best3);
  let st=ses.length<4?'new':best3>bestPrev?'up':avgOf(last3.map(x=>x.e1))<bestPrev*.95?'down':'flat';
  if(st==='flat'&&daysBetween(last3[0].d,cur.d)<10) st='up';
  const old=ses.filter(x=>x.d<=dayShift(tk,-28)), ref=old.length?old[old.length-1]:ses[0], ch=ref.e1?(best3-ref.e1)/ref.e1*100:0;
  return {n,st,ch,refD:ref.d,best,cur:cur.e1,last:cur.d,ses:ses.length};
}
const TREND_L={up:['urcă','rest'],flat:['stă pe loc','need'],down:['scade','bad'],new:['prea devreme','']};
function liftTrendCard(){
  const tk=todayKey(), ts=Object.keys(S.lifts||{}).map(liftTrend).filter(t=>t&&t.last>=dayShift(tk,-28));
  if(!ts.length) return '';
  const ord={down:0,flat:1,up:2,new:3}; ts.sort((a,b)=>ord[a.st]-ord[b.st]||b.ch-a.ch);
  const stuck=ts.filter(t=>t.st==='flat'||t.st==='down'), tg=targets();
  let sl=0,sn=0,pd=0; for(let i=0;i<7;i++){ const k=dayShift(tk,-i), s=+jOf(k).sleep; if(s>0){ sl+=s; sn++; } if(dayTotals(k).p>=tg.p*.9) pd++; }
  const q='Am stagnat la '+stuck.map(t=>t.n).join(', ')+'. Ce pot schimba ca să progresez din nou, fără să modific exercițiile sau zilele planului?';
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('chart')} Progres pe exerciții</div><span class="xs mu">ultimele 4 săpt.</span></div>
    <div style="margin-top:6px">${ts.map(t=>`<button class="lt-r" data-a="prEx" data-k="${esc(t.n)}"><span class="sp"><b>${esc(t.n)}</b><span class="xs mu">1RM ~${t.cur} kg${t.best>t.cur?' · record '+t.best+' kg':''}</span></span>
      <span class="lt-c ${t.ch>0.5?'good':t.ch<-0.5?'bad':''}">${t.st==='new'?'':(t.ch>0?'+':'')+num(t.ch,1)+'%'}</span><span class="tag ${TREND_L[t.st][1]}">${TREND_L[t.st][0]}</span></button>`).join('')}</div>
    ${stuck.length?`<div class="ag"><p><b>${stuck.length===1?esc(stuck[0].n)+' stă pe loc':stuck.length+' exerciții stau pe loc'}.</b> Înainte să schimbi ceva, verifică recuperarea:</p>
      <ul><li>Somn: ${sn?`media <b>${num(sl/sn,1)} h</b> în ultimele ${sn} nopți notate`:'nu ai notat somnul în ultimele 7 zile'} (ținta: 7–9 h).</li>
        <li>Proteină la țintă: <b>${pd} din 7</b> zile.</li>
        <li>Dacă recuperarea e bună: urmărește <b>1–2 repetări în plus</b> la aceeași greutate înainte să crești kilogramele.</li>
        <li>Dacă readiness e scăzut câteva zile, antrenorul adaptiv îți propune o zi sau o săptămână mai ușoară.</li></ul>
      <button class="btn ghost sm" style="margin-top:10px" data-a="askQ" data-k="${esc(q)}">${ic('coach')} Întreabă antrenorul AI</button></div>`:''}
    <div class="xs mu2" style="margin-top:8px">„Urcă” = 1RM estimat nou în ultimele 3 sesiuni. „Stă pe loc” = nimic nou în 3 sesiuni (cel puțin 10 zile). „Scade” = media ultimelor 3 sub 95% din cel mai bun.</div></div>`;
}
/* forța raportată la greutatea corpului: la slăbit, raportul arată dacă devii mai puternic pe kilogram */
function relStrCard(){
  const tk=todayKey(), back=dayShift(tk,-56), rows=Object.keys(STD).map(n=>{ const h=liftHist(n); if(!h.length) return null;
    const best=(to,from)=>{ let b=0; h.forEach(e=>{ if(e.d>to||(from&&e.d<from)) return; const bw=wAt(e.d); e.s.forEach(([w,r])=>{ const v=e1rm(n==='Weighted Pull Up'?bw+w:w,r); if(v>b) b=v; }); }); return b; };
    const now=best(tk,dayShift(tk,-42))||best(tk), then=best(back);
    return now?{n,now:now/curW(),then:then?then/wAt(back):null}:null; }).filter(Boolean);
  if(!rows.length) return '';
  const both=rows.filter(r=>r.then), avgCh=both.length?avgOf(both.map(r=>(r.now-r.then)/r.then*100)):null, ws=wStats(), dW=ws?ws.a7-wAt(back):null;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('scale')} Forță relativă · pe kg de corp</div>${avgCh!=null?`<span class="tag ${avgCh>=0?'rest':'need'}">${avgCh>0?'+':''}${num(avgCh,1)}% în 8 săpt.</span>`:''}</div>
    <div style="margin-top:6px">${rows.map(r=>`<div class="list-row"><span class="sp">${esc(r.n)}</span>${r.then?`<span class="xs mu">${num(r.then,2)}× →</span>`:''}<span class="v">${num(r.now,2)}×</span></div>`).join('')}</div>
    <div class="note">1RM estimat împărțit la greutatea ta din ziua respectivă${dW!=null&&both.length?` (${dW<=0?'ai slăbit':'ai pus'} ${num(Math.abs(dW),1)} kg în 8 săptămâni)`:''}. Dacă raportul urcă în timp ce slăbești, devii mai puternic pe fiecare kilogram, ceea ce te ajută și la alergare.</div></div>`;
}
/* eficiența aerobă: metri pe bătaie de inimă la alergările ușoare; crește când baza aerobă se îmbunătățește */
function aeroCard(){
  const tk=todayKey(), rs=(S.runs||[]).filter(r=>+r.hr>0&&paceOf(r)&&(r.kind==='ez'||r.kind==='lng')&&r.date>=dayShift(tk,-150)).sort((a,b)=>a.date<b.date?-1:1);
  if(rs.length<2) return `<div class="card"><div class="eyebrow">${ic('heart')} Eficiență aerobă</div>
    <div class="sm mu" style="margin-top:8px">Notează pulsul mediu la alergările ușoare și lungi (sau vin singure din Strava cu ceasul). Îți arăt apoi dacă alergi mai repede la același puls, semnul că baza aerobă crește.</div></div>`;
  const pts=rs.map(r=>({x:r.date,y:1000/paceOf(r)/r.hr})), tr=trendOf(pts,120), hrRef=Math.round(avgOf(rs.slice(-6).map(r=>+r.hr)));
  const paceAt=ef=>1000/(ef*hrRef), first=pts[0].y, last=tr?tr.now:pts[pts.length-1].y, ch=(last-first)/first*100;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('heart')} Eficiență aerobă</div><span class="tag ${ch>=0?'rest':'need'}">${ch>0?'+':''}${num(ch,1)}%</span></div>
    <div class="row" style="margin-top:8px;align-items:flex-end"><div class="big">${num(last,2)}<small>m / bătaie</small></div></div>
    <div class="sm mu" style="margin-top:4px">La pulsul tău obișnuit de easy (~${hrRef} bpm) alergi acum cam <b style="color:var(--tx)">${fmtPace(paceAt(last))}</b>${pts.length>=3?`, față de ${fmtPace(paceAt(first))} la început`:''}.</div>
    ${lineChart({pts,label:'eficiență aerobă',dec:2,blue:true,hex:COL().run,minR:.15})}
    <div class="note">Viteza împărțită la pulsul mediu, doar la alergările ușoare și lungi. Căldura, dealurile și oboseala o scad pe moment, așa că urmărește tendința pe câteva săptămâni.</div></div>`;
}


/* ---------- nutriție pentru performanță: mesele din jurul antrenamentului, suplimente cu dovezi, proteina pe mese ----------
   Recomandări după pozițiile ISSN (nutrient timing, cafeină, creatină) și ACSM (nutriție și hidratare la sportivi).
   Cantitățile pe kg folosesc greutatea țintă, la fel ca ținta de proteină; hidratarea folosește greutatea de acum. */
const refW=()=>{ const P=prof(); return +P.goalW>0?Math.min(+P.goalW,curW()):curW(); };
function fuelPlan(){
  const s=S.sess, nx=s?{w:s.w,d:s.d}:nextDay(); if(!s&&!nx) return null;
  const day=s?sessDay(s):dayFor(nx.w,nx.d), cat=day.cat, min=+day.min||60, R=refW(), W=curW();
  const runs=day.ex.filter(e=>e.planMin), runMin=runs.reduce((a,e)=>a+(+e.planMin||0),0), long=runs.some(e=>/long/i.test(e.n))||runMin>=75, thr=day.ex.some(e=>e.n==='Threshold');
  const g=(a,b)=>`${Math.round(a*R/5)*5}–${Math.round(b*R/5)*5} g`;
  const hard=long||thr||min>=90;
  const pre=cat==='rest'?null:hard?`Cu 2–3 ore înainte: o masă cu <b>${g(1,1.5)} carbohidrați</b> (orez, paste, ovăz, pâine, cartofi) și 25–40 g proteină, puține grăsimi și fibre.`
    :`Cu 2–3 ore înainte: o masă normală cu <b>${g(.5,1)} carbohidrați</b> și 25–40 g proteină. Dacă mănânci mai târziu, cu 30–60 de minute înainte doar ceva mic: o banană sau un iaurt.`;
  const during=cat==='rest'?null:long||min>=90?`Dacă trece de 60–75 de minute: <b>30–60 g carbohidrați pe oră</b> (gel, banană, băutură sport) și apă în înghițituri.`:`Apă, după sete. Sub o oră de efort nu ai nevoie de carbohidrați în timpul lui.`;
  const post=cat==='rest'?null:`În cele ~2 ore după: <b>${g(.3,.4)} proteină</b>${hard?` și ${g(1,1.2)} carbohidrați, ca să refaci glicogenul`:' și o porție de carbohidrați'}. Contează mai mult totalul zilei decât minutul exact.`;
  const hyd=cat==='rest'?null:`Bea <b>${Math.round(W*5/50)*50}–${Math.round(W*7/50)*50} ml</b> cu 2–4 ore înainte. Urina deschisă la culoare = hidratat.${min>60?' Peste o oră de efort: 300–600 mg sodiu pe oră (electroliți), mai ales la căldură.':''}`;
  /* proteina de seară: 30–40 g cu digestie lentă susțin sinteza proteică peste noapte */
  const night=`Înainte de somn: <b>30–40 g proteină</b> cu digestie lentă (brânză de vaci, skyr, iaurt grecesc sau cazeină).`;
  return {day,cat,min,long,thr,hard,pre,during,post,hyd,night,live:!!s};
}
function fuelCard(){
  const f=fuelPlan(); if(!f) return '';
  const tg=targets(), R=refW(), pt=clamp(Math.round(.4*R),25,50);
  if(f.cat==='rest') return `<div class="card fuel"><div class="eyebrow">${ic('leaf')} Zi de recuperare · nutriție</div>
    <div class="sm" style="margin-top:8px">Fără mese speciale azi. Proteina împărțită în 3–5 mese de câte <b>~${pt} g</b>, ultima seara, înainte de somn; legume și fructe din belșug și somn bun: azi se face progresul de ieri.</div></div>`;
  const rows=[['clock','Înainte',f.pre],['run','În timpul efortului',f.during],['check','După',f.post],['drop','Hidratare',f.hyd],['moon','Seara',f.night]].filter(r=>r[2]);
  return `<div class="card fuel"><div class="row"><div class="eyebrow sp">${ic('flame')} ${f.live?'Antrenamentul de acum':'Antrenamentul următor'} · nutriție</div><span class="tag">${f.min} min</span></div>
    <div class="h3" style="margin-top:8px">${esc(f.day.t)}</div>
    <div class="fu">${rows.map(([icn,t,h])=>`<div class="fu-r"><span class="fu-i">${ic(icn)}</span><div class="sp"><b>${t}</b><p>${h}</p></div></div>`).join('')}</div>
    <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-a="toolGo" data-k="caf">${ic('cup')} Cafeină: doza și ora</button>
      ${f.long?`<button class="btn ghost sm" data-a="toolGo" data-k="sweat">${ic('drop')} Cât să bei</button>`:''}</div>
    <div class="note">Cantitățile pe kg sunt calculate la ${num(R,0)} kg (greutatea țintă), la fel ca proteina. ${tg.phase&&tg.phase.cut?'În deficit, mută carbohidrații zilei în jurul antrenamentului: aceleași calorii, antrenament mai bun.':''}</div></div>`;
}
/* suplimente: doar cele cu dovezi bune pentru performanță sau pentru lipsuri frecvente; bifezi ce iei, ZECE ține seria */
/* suplimentele pe niveluri (src/lib/nutrition/supplements.ts): [id, nume, doză, nivel, clasă]; Tier 3 e doar explicat, blocat */
const SUPP=NUTRI.SUPPLEMENTS.map(s=>[s.id,s.name,s.dose,'Tier '+s.tier+' · '+s.evidence,s.tier===1?'ev3':'ev2']);
const suppOn=id=>!!(S.supp&&S.supp.on&&S.supp.on[id]);
const suppTook=(id,k)=>((S.supp&&S.supp.log&&S.supp.log[k])||[]).indexOf(id)>=0;
function suppStreak(id){ let n=0, k=todayKey(); if(!suppTook(id,k)) k=dayShift(k,-1); while(suppTook(id,k)&&n<999){ n++; k=dayShift(k,-1); } return n; }
function suppCard(){
  const tk=todayKey(), on=SUPP.filter(s=>suppOn(s[0])), off=SUPP.filter(s=>!suppOn(s[0]));
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('pill')} Suplimente azi</div>${on.length?`<span class="xs mu">${on.filter(s=>suppTook(s[0],tk)).length}/${on.length} luate</span>`:''}</div>
    ${on.length?`<div style="margin-top:6px">${on.map(([id,n,d,ev,cl])=>{ const t=suppTook(id,tk), st=suppStreak(id);
      return `<div class="sp-r"><button class="tick ${t?'on':''}" data-a="suppTick" data-k="${id}" aria-label="${esc(n)} luat azi">${ic('check')}</button>
        <div class="sp"><b>${esc(n)}</b><div class="xs mu">${st?st+(st===1?' zi':' zile')+' la rând':'nebifat de ieri'}</div></div>
        <button class="xb" data-a="suppOn" data-k="${id}" aria-label="Nu mai urmări">${ic('x')}</button></div>`; }).join('')}</div>`
      :`<div class="sm mu" style="margin-top:8px">Alege ce iei și bifează zilnic. Le-am păstrat doar pe cele cu dovezi bune.</div>`}
    ${off.length?`<details class="notes sp-more"${on.length?'':' open'}><summary>${ic('plus')} ${on.length?'Adaugă altele':'Ce merită luat'}</summary>
      ${off.map(([id,n,d,ev,cl])=>`<div class="sp-o"><div class="sp"><b>${esc(n)}</b> <span class="shot-t" style="display:inline-flex;margin:0"><span class="${cl}">${esc(ev)}</span></span><p>${esc(d)}</p></div>
        <button class="btn ghost sm" data-a="suppOn" data-k="${id}">Îl iau</button></div>`).join('')}</details>`:''}
    <div class="note">Cafeina are calculatorul ei la Unelte; nitrații (sfeclă) sunt la Shot-uri. Proteina pudră e doar mâncare comodă: contează totalul zilei. Suplimentele nu înlocuiesc somnul și mâncarea.</div>${suppBlockedHTML()}</div>`;
}
/* câte mese de azi au destulă proteină: ~0,4 g/kg pe masă, de 3–5 ori pe zi */
function protMeals(k){ const R=refW(), thr=clamp(Math.round(.4*R),25,50), ml=mlogDay(k), n=ml.filter(m=>(+m.p||0)>=thr*.85).length; return {thr,n,tot:ml.length}; }


/* NUTRIȚIE */
const SC={img:null,data:null,hint:'',busy:false,res:null,err:null};
function viewNutri(){
  const tabs=[['azi','Azi','flame'],['plan','Mese','bowl'],['shots','Shot-uri','glass'],['shop','Listă','cart'],['nec','Necesar','calc']];
  if(!nutriOk()) return nutriGate();
  const body=S.nTab==='plan'?nutriPlan():S.nTab==='shop'?nutriShop():S.nTab==='nec'?nutriNeed():S.nTab==='shots'?nutriShots():nutriToday();
  return `<div class="seg scr" style="margin-top:6px">${tabs.map(t=>`<button class="${S.nTab===t[0]?'on':''}" data-a="nTab" data-k="${t[0]}">${ic(t[2])} ${t[1]}</button>`).join('')}</div>${body}`;
}
/* ---------- Shot-uri: rețete scurte, cu nivelul real de dovezi pentru fiecare ---------- */
const SHOT_TAGS={alergare:'Alergare',recuperare:'Recuperare',somn:'Somn',energie:'Energie',hidratare:'Hidratare',imunitate:'Imunitate',digestie:'Digestie'};
const SHOT_EV=[null,['Dovezi slabe','ev1'],['Dovezi moderate','ev2'],['Dovezi bune','ev3']];
const SHOTS=[
 {id:'sfecla',n:'Sfeclă roșie',col:['#B36A78','#5A3A40'],tags:['alergare'],ev:3,when:'Cu 2–3 ore înainte de antrenamentul de prag sau de alergarea lungă.',
  why:'Nitrații din sfeclă cresc oxidul nitric: mușchii folosesc oxigenul mai eficient. E unul dintre puținele shot-uri cu efect demonstrat la alergare: în medie câteva procente mai bine pe cronometru, mai mult la amatori.',
  ing:[[250,'g','sfeclă roșie crudă'],[10,'ml','zeamă de lămâie'],[5,'g','ghimbir proaspăt']],
  steps:['Curăță sfecla și tai-o bucăți.','Trece-o prin storcător împreună cu ghimbirul. Fără storcător: mixeaz-o cu 50 ml apă și strecoar-o printr-o sită fină.','Adaugă lămâia și bea imediat.'],
  m:{k:50,p:1,c:11,g:0},note:'Variantă rapidă: un shot concentrat de sfeclă din magazin (~400 mg nitrați). În ziua respectivă evită apa de gură antibacteriană: oprește transformarea nitraților. Urina roșiatică e normală. Atenție dacă ai avut pietre la rinichi.'},
 {id:'visine',n:'Vișine',col:['#A55848','#3A2A28'],tags:['recuperare','somn'],ev:2,when:'Seara (și dimineața) în zilele cu antrenament greu și 2–3 zile după.',
  why:'Antocianii din vișine reduc febra musculară și pierderea de forță după antrenamentele grele. Vișinele conțin și puțină melatonină; câteva studii mici arată un somn mai bun.',
  ing:[[150,'g','vișine fără sâmburi (proaspete sau congelate)'],[50,'ml','apă']],
  steps:['Mixează vișinele cu apa.','Strecoară printr-o sită dacă vrei shot-ul fin.','Bea-l rece.'],
  m:{k:75,p:1,c:18,g:0},note:'Merge și sucul de vișine 100% fără zahăr adăugat (~100 ml). Are zahăr natural (~16 g), deci intră în calorii.'},
 {id:'ghimbir',n:'Ghimbir și lămâie',col:['#F0C483','#E8A84C'],tags:['recuperare','digestie'],ev:2,when:'Dimineața. Contează să-l iei zilnic 1–2 săptămâni, nu un shot izolat.',
  why:'2–4 g de ghimbir pe zi, luate câteva zile la rând, reduc moderat durerea musculară după efort. Ajută și la greață și digestie.',
  ing:[[30,'g','ghimbir proaspăt'],[25,'ml','zeamă de lămâie (½ lămâie)'],[7,'g','miere (1 linguriță)'],[30,'ml','apă']],
  steps:['Rade sau mixează ghimbirul cu apa.','Strecoară și stoarce bine pulpa.','Amestecă cu lămâia și mierea.'],
  m:{k:35,p:0,c:9,g:0},note:'Ustură, e normal. Atenție dacă iei anticoagulante sau ai reflux.'},
 {id:'turmeric',n:'Turmeric și piper',col:['#E8A84C','#B5703A'],tags:['recuperare'],ev:1,when:'Oricând, după o masă.',
  why:'Curcumina e antiinflamatoare, dar se absoarbe foarte slab: piperina din piperul negru crește absorbția de până la ~20 de ori, iar grăsimea ajută și ea. Studiile cu efect pe febra musculară au folosit doze de supliment, mult peste ce e într-un shot.',
  ing:[[3,'g','turmeric pudră (1 linguriță rasă)'],[1,'vârf','piper negru măcinat'],[50,'ml','suc de portocale'],[5,'ml','ulei de măsline']],
  steps:['Pune totul într-un borcan mic.','Agită energic 10 secunde.','Bea imediat, înainte să se separe.'],
  m:{k:70,p:0,c:6,g:5},note:'Evită dacă iei anticoagulante sau ai probleme cu fierea. Pătează hainele și blatul.'},
 {id:'electroliti',n:'Electroliți de casă',col:['#E1F5FE','#86C6D4'],tags:['hidratare','alergare'],ev:3,when:'Înainte de alergările de peste 75 de minute sau pe căldură, și după antrenamentele în care transpiri mult.',
  why:'Prin transpirație pierzi mult sodiu, iar la greutatea ta chiar mai mult. Sodiul te ajută să reții apa băută și scade riscul de crampe și amețeală la efortul lung.',
  ing:[[150,'ml','apă'],[20,'ml','zeamă de lămâie sau lime'],[1.5,'g','sare (¼ linguriță, ~600 mg sodiu)'],[7,'g','miere']],
  steps:['Dizolvă sarea și mierea în puțină apă caldă.','Adaugă restul apei rece și lămâia.','Bea-l cu 15–30 de minute înainte de start.'],
  m:{k:25,p:0,c:7,g:0},note:'Dacă ai tensiune mare, vorbește întâi cu medicul.'},
 {id:'espresso',n:'Espresso pre-antrenament',col:['#A1887F','#2B1A14'],tags:['energie'],ev:3,when:'Cu 30–60 de minute înainte de antrenament. Nu după ora 14–15.',
  why:'Cafeina e cel mai bine dovedit „booster” legal: mai multă putere, rezistență și concentrare, iar efortul pare mai ușor.',
  ing:[[2,'shot','espresso (~120–150 mg cafeină)'],[5,'g','miere (opțional)']],
  steps:['Fă un espresso dublu.','Îndulcește cu miere dacă vrei.','Bea-l și pornește încălzirea după ~30 de minute.'],
  m:{k:20,p:0,c:5,g:0},note:'Maximum ~400 mg de cafeină pe zi, în total. Cafeina târzie îți strică somnul, iar somnul cântărește cel mai mult în Readiness.'},
 {id:'otet',n:'Oțet de mere',col:['#F3D6A8','#C98B3C'],tags:['digestie'],ev:1,when:'Cu 10–20 de minute înainte de o masă bogată în carbohidrați.',
  why:'Poate reduce puțin creșterea glicemiei după masă. Efectul asupra slăbitului e mic și nesigur: nu e un arzător de grăsimi.',
  ing:[[15,'ml','oțet de mere (1 lingură)'],[150,'ml','apă']],
  steps:['Diluează oțetul în apă.','Bea-l cu un pai.','Clătește gura cu apă după.'],
  m:{k:3,p:0,c:0,g:0},note:'Niciodată nediluat: acidul atacă smalțul dinților. Evită dacă ai reflux.'},
 {id:'verde',n:'Verde: spanac, măr, lămâie',col:['#C5E1A5','#558B2F'],tags:['imunitate'],ev:1,when:'Dimineața sau între mese.',
  why:'Spanacul aduce nitrați și folați, mărul și lămâia vitamina C. E o porție de legume și fructe, nu un „detox”: detoxul îl fac ficatul și rinichii.',
  ing:[[40,'g','spanac baby'],[1,'buc','măr verde (~150 g)'],[10,'ml','zeamă de lămâie'],[5,'g','ghimbir'],[50,'ml','apă']],
  steps:['Taie mărul bucăți.','Mixează totul până devine fin.','Strecoară dacă vrei, sau bea-l cu fibre (sățios).'],
  m:{k:70,p:1,c:16,g:0},note:'Cu fibrele păstrate te ține mai mult sătul.'},
 {id:'vitc',n:'Portocală și kiwi',col:['#F0C483','#C98D35'],tags:['imunitate','somn'],ev:2,when:'Zilnic în sezonul rece. Kiwi seara, dacă dormi prost.',
  why:'La oamenii obișnuiți, vitamina C luată zilnic nu previne răceala. La cei care fac efort intens (maratoniști, schiori) a redus însă riscul la jumătate. Un studiu mic a legat și kiwi-ul seara de un somn mai bun.',
  ing:[[1,'buc','portocală (~130 g)'],[1,'buc','kiwi (~75 g)'],[50,'ml','apă']],
  steps:['Curăță portocala și kiwi-ul.','Mixează cu apa.','Strecoară dacă vrei shot-ul fin.'],
  m:{k:90,p:2,c:20,g:0},note:'Un shot are ~120 mg de vitamina C, mai mult decât necesarul zilnic.'}
];
const shotOf=id=>SHOTS.find(s=>s.id===id);
/* shot-ul zilei, ales din planul și check-in-ul tău */
function shotPick(){
  const tk=todayKey(), j=jOf(tk), nx=nextDay(), hr=new Date().getHours(), day=S.sess?dayBase(S.sess.w,S.sess.d):nx?dayBase(nx.w,nx.d):null;
  const last=(S.hist||[]).filter(h=>h.date>=dayShift(tk,-1)).pop();
  if(day&&(day.run==='thr'||day.run==='lng')&&hr<17) return ['sfecla','Următorul antrenament e '+(day.run==='thr'?'cel de prag':'alergarea lungă')+': sfecla cu 2–3 ore înainte.'];
  if(+j.sore>=3) return ['visine','Febră musculară '+j.sore+'/5 azi: vișinele ajută recuperarea.'];
  if(last&&last.rpe>=8) return ['visine','Ultimul antrenament a fost greu (RPE '+last.rpe+'): vișine seara, pentru recuperare.'];
  if(+j.sleep>0&&+j.sleep<7) return ['visine','Ai dormit '+num(+j.sleep)+' h: un shot de vișine seara poate ajuta somnul.'];
  if(day&&(day.cat==='lift'||day.cat==='mix')&&hr<14) return ['espresso','Urmează forță ('+day.t+'): espresso cu 30–60 de minute înainte.'];
  const mo=new Date().getMonth(); if(mo>=9||mo<=2) return ['vitc','Sezonul rece și antrenament intens: vitamina C zilnic.'];
  return ['ghimbir','Ghimbir și lămâie dimineața, pentru recuperare și digestie.'];
}
const glassSVG=(s,big)=>{ const id='gl'+s.id+(big?'b':'');
  return `<svg class="glass ${big?'big':''}" viewBox="0 0 40 52" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.col[0]}"/><stop offset="1" stop-color="${s.col[1]}"/></linearGradient>
    <clipPath id="${id}c"><path d="M7.2 5h25.6l-2.9 40.2a3.4 3.4 0 0 1-3.4 3.2H13.5a3.4 3.4 0 0 1-3.4-3.2z"/></clipPath></defs>
    <g clip-path="url(#${id}c)"><path class="wave" d="M-40 17q5-3 10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0V60H-40z" fill="url(#${id})"/><rect x="0" y="40" width="40" height="12" fill="rgba(0,0,0,.18)"/></g>
    <path d="M6 4h28l-3 41.4a4.4 4.4 0 0 1-4.4 4.1H13.4A4.4 4.4 0 0 1 9 45.4z" fill="none" style="stroke:rgba(var(--w),.42)" stroke-width="1.4"/>
    <path d="M10.4 9l1.8 33" style="stroke:rgba(var(--w),.3)" stroke-width="1.8" stroke-linecap="round"/></svg>`; };
function nutriShots(){
  const n=S.shotN||1, f=S.shotF||'all', [pid,why]=shotPick(), P=shotOf(pid), tk=todayKey(), drank=mlogDay(tk).filter(m=>m.shot).map(m=>m.shot);
  const list=SHOTS.filter(s=>f==='all'||s.tags.indexOf(f)>=0), qty=x=>num(x*n,x*n<10?1:0);
  const card=s=>{ const op=S.shotOpen===s.id, ev=SHOT_EV[s.ev];
    return `<div class="card shot ${op?'open':''}" style="--sc:${s.col[0]}">
      <button class="shot-h" data-a="shotOpen" data-k="${s.id}" aria-expanded="${op}">${glassSVG(s)}
        <span class="sp"><b>${esc(s.n)}</b><span class="shot-t">${s.tags.map(t=>`<span>${SHOT_TAGS[t]}</span>`).join('')}<span class="ev ${ev[1]}">${ev[0]}</span></span></span>
        <span class="shot-k">${s.m.k}<small>kcal</small></span>${ic('down','chev')}</button>
      ${op?`<div class="shot-b">
        <p>${esc(s.why)}</p>
        <div class="when">${ic('clock')} ${esc(s.when)}</div>
        <div class="dsec"><h4>Ingrediente${n>1?' · '+n+' shot-uri':''}</h4>${s.ing.map(([q,u,t])=>`<div class="list-row"><span class="sp">${esc(t)}</span><span class="v">${qty(q)} ${u}</span></div>`).join('')}</div>
        <div class="dsec"><h4>Preparare</h4>${s.steps.map((t,i)=>`<div class="cue"><b>${i+1}</b><span>${esc(t)}</span></div>`).join('')}</div>
        <div class="easy">${ic('alert')} ${esc(s.note)}</div>
        <div class="xs mu2" style="margin-top:8px">Un shot: ~${s.m.k} kcal · P ${s.m.p} g · C ${s.m.c} g · G ${s.m.g} g (aproximativ)</div>
        <button class="btn pri wide" style="margin-top:12px" data-a="shotDrink" data-k="${s.id}">${ic('check')} Am băut${drank.indexOf(s.id)>=0?' încă unul':''} · intră în jurnal</button></div>`:''}</div>`; };
  return `
  <div class="card shot-hero" style="--sc:${P.col[0]}"><div class="eyebrow">${ic('star')} Shot-ul zilei</div>
    <div class="row" style="margin-top:10px;gap:14px">${glassSVG(P,true)}<div class="sp"><div class="h3">${esc(P.n)}</div><div class="sm mu" style="margin-top:4px">${esc(why)}</div>
      <div class="inrow" style="margin-top:10px"><button class="btn sm" data-a="shotOpen" data-k="${P.id}" data-go="1">Rețeta</button><button class="btn pri sm" data-a="shotDrink" data-k="${P.id}">${ic('check')} Am băut</button></div></div></div>
    ${drank.length?`<div class="xs mu" style="margin-top:10px">Azi: ${drank.map(id=>esc((shotOf(id)||{}).n||id)).join(', ')}</div>`:''}</div>
  <div class="scrollx" style="margin-top:12px">${[['all','Toate']].concat(Object.entries(SHOT_TAGS)).map(([k,l])=>`<button class="chip ${f===k?'on':''}" data-a="shotF" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="row" style="margin-top:10px"><span class="xs mu sp">Cantități</span>${[[1,'1 shot'],[3,'3 zile'],[7,'o săptămână']].map(([v,l])=>`<button class="chip ${n===v?'on':''}" data-a="shotN" data-i="${v}">${l}</button>`).join('')}</div>
  ${list.map(card).join('')}
  <div class="note" style="padding:0 4px">Shot-urile nu înlocuiesc mâncarea, somnul sau medicul. La fiecare ai nivelul real de dovezi științifice, ca să știi la ce să te aștepți.</div>`;
}
function nutriToday(){
  const tk=todayKey(), tg=targets(), d=dayTotals(tk), ml=mlogDay(tk), wt=waterOf(tk), [rk,rp]=ringsNut(tk,132);
  const remK=tg.kcal-d.k, remP=tg.p-d.p, cups=Math.min(20,Math.ceil(tg.water/250)), full=Math.floor(wt/250);
  const freq={}; Object.keys(S.mlog||{}).forEach(k=>(S.mlog[k]||[]).forEach(m=>{ const n=(m.n||'').trim(); if(!n) return; const key=n.toLowerCase(); freq[key]=freq[key]||{n,c:0,m}; freq[key].c++; freq[key].m=m; }));
  const top=Object.values(freq).sort((a,b)=>b.c-a.c).slice(0,8);
  const wk=[]; for(let i=6;i>=0;i--){ const k=dayShift(tk,-i); wk.push({lbl:DAYS[(parseKey(k).getDay()+6)%7],v:Math.round(dayTotals(k).k),hi:i===0}); }
  const scan=SC.img?`<div class="card" id="scanCard"><div class="eyebrow">${ic('camera')} Masa ta · analiză AI</div>
      <div class="scan-wrap ${SC.busy?'busy':''}"><img class="scan-img" src="${SC.img}" alt="Poza mesei"></div>
      ${SC.res?`<div class="h3" style="margin-top:12px">${esc(SC.res.name)}</div>
        <div class="items">${SC.res.items.map(it=>`<div class="list-row"><span class="sp">${esc(it.food)}</span><span class="mu sm">~${Math.round(it.grams)} g</span><span class="v">${Math.round(it.kcal)} kcal</span></div>`).join('')}</div>
        <div class="form"><div class="fld full"><label for="scN">Nume</label><input class="inp" id="scN" value="${esc(SC.res.name)}"></div>
          <div class="fld"><label for="scK">kcal</label><input class="inp" id="scK" type="number" inputmode="numeric" value="${SC.res.kcal}"></div>
          <div class="fld"><label for="scP">Proteină (g)</label><input class="inp" id="scP" type="number" inputmode="numeric" value="${SC.res.p}"></div>
          <div class="fld"><label for="scC">Carbohidrați (g)</label><input class="inp" id="scC" type="number" inputmode="numeric" value="${SC.res.c}"></div>
          <div class="fld"><label for="scG">Grăsimi (g)</label><input class="inp" id="scG" type="number" inputmode="numeric" value="${SC.res.g}"></div></div>
        <div class="note">Încredere: <b>${esc(SC.res.conf||'—')}</b>. ${esc(SC.res.note||'')}${SC.res.cost!=null?' · analiza a costat ~$'+SC.res.cost.toFixed(3):''}</div>${mealFbHTML(SC.res)}
        <div class="inrow"><button class="btn ghost" data-a="scanX">Renunță</button><button class="btn pri" style="flex:1" data-a="scanAdd">${ic('check')} Adaugă în jurnal</button></div>`
      :`<div class="fld" style="margin-top:12px"><label for="scHint">Detalii (opțional): cantități, ulei, sosuri</label><input class="inp" id="scHint" value="${esc(SC.hint)}" placeholder="ex: 200 g piept de pui, o lingură de ulei"></div>
        ${SC.err?`<div class="err">${ic('alert')}<span>${esc(SC.err)}</span></div>`:''}
        <div class="inrow"><button class="btn ghost" data-a="scanX" ${SC.busy?'disabled':''}>Renunță</button>
          <button class="btn pri" style="flex:1" data-a="scanRun" ${SC.busy?'disabled':''}>${SC.busy?'Analizez…':ic('coach')+' Analizează cu AI'}</button></div>`}</div>`:'';
  return `
  <div class="card"><div class="row"><div class="eyebrow sp">${ic('flame')} Azi · ${fmtDay(tk)}</div><span class="tag ${tg.phase.cut?'lift':'rest'}" title="${esc(tg.phase.sub)}">${tg.phase.label}</span></div>
    <div class="nrings"><div class="nr-c">${rk}<div class="k">calorii</div></div><div class="nr-c">${rp}<div class="k">proteină</div></div></div>
    <div class="macro"><span class="tag">${remK>=0?'mai ai '+Math.round(remK)+' kcal':'peste cu '+Math.round(-remK)+' kcal'}</span>
      <span class="tag run">${remP>0?'mai ai '+Math.round(remP)+' g proteină':'proteină atinsă'}</span>
      </div>
    <div class="mbars">${[['Carbohidrați',d.c,tg.c,COL().warn],['Grăsimi',d.g,tg.f,'#B3AECB']].map(([l,v,t,c])=>`<div><div class="row"><span class="sm">${l}</span><span class="xs mu sp" style="text-align:right">${Math.round(v)} / ${t} g</span></div>
      <div class="bar" style="margin-top:6px"><i style="width:${(clamp(t?v/t:0,0,1)*100).toFixed(1)}%;background:${c};box-shadow:0 0 12px ${c}"></i></div></div>`).join('')}</div>
    <div class="xs mu" style="margin-top:10px">${esc(tg.phase.sub)} · necesar ${tg.measured?'măsurat':'estimat'} ${tg.tdee} kcal${tg.manual?' · țintă manuală':''}</div></div>
  ${nutriDayCard(tg,wt)}
  <div class="card"><div class="row"><div class="sp"><div class="eyebrow">${ic('drop')} Apă</div>
      <div class="big sm" style="margin-top:6px">${num(wt/1000,2)}<small>/ ${num(tg.water/1000,1)} L</small></div></div>
    <button class="btn sm ghost" data-a="water" data-i="-250" aria-label="minus 250 ml">−</button>
    <button class="btn sm blue" data-a="water" data-i="250">+250</button><button class="btn sm blue" data-a="water" data-i="500">+500</button></div>
    <div class="water">${Array.from({length:cups},(_,i)=>`<svg class="glass ${i<full?'':'e'}" viewBox="0 0 26 34" aria-hidden="true"><path d="M3 3h20l-2.5 27a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8z" fill="none" style="stroke:rgba(var(--w),.2)" stroke-width="1.6"/><path class="w" d="M4.6 11h16.8l-1.9 19a1.4 1.4 0 0 1-1.4 1.2H7.9a1.4 1.4 0 0 1-1.4-1.2z" style="transition-delay:${i*25}ms"/></svg>`).join('')}</div></div>
  ${fuelCard()}
  ${suppCard()}
  ${quickCard()}
  ${scan||`<label class="card link row" style="display:flex">${'<div class="cc-ic">'+ic('camera')+'</div>'}<div class="sp"><div class="h3">Scanează o masă</div>
    <div class="sm mu">Faci o poză, iar AI-ul estimează caloriile și proteina.</div></div>${ic('right')}<input type="file" accept="image/*" capture="environment" data-scan="1" style="position:absolute;inset:0;opacity:0;cursor:pointer" aria-label="Scanează o masă"></label>`}
  <button class="card link row fd-cta" data-a="foodOpen" style="display:flex;width:100%;text-align:left;color:inherit"><div class="cc-ic">${ic('bowl')}</div><div class="sp"><div class="h3">Caută un aliment</div>
    <div class="sm mu">${FOODS.length} alimente la gram, cod de bare${(S.foods||[]).length?' și '+S.foods.length+' ale tale':''}</div></div>${ic('right')}</button>
  <div class="card"><div class="eyebrow">${ic('plus')} Adaugă manual</div>
    ${top.length?`<div class="scrollx" style="margin-top:12px">${top.map(f=>`<button class="chip" data-a="mealAgain" data-k="${esc(f.n)}">${ic('plus')} ${esc(f.n)}</button>`).join('')}</div>`:''}
    <div class="form"><div class="fld full"><label for="mN">Ce ai mâncat</label><input class="inp" id="mN" placeholder="ex: omletă cu 4 ouă"></div>
      <div class="fld"><label for="mK">kcal</label><input class="inp" id="mK" type="number" inputmode="numeric" placeholder="450"></div>
      <div class="fld"><label for="mP">Proteină (g)</label><input class="inp" id="mP" type="number" inputmode="numeric" placeholder="30"></div>
      <div class="fld"><label for="mC">Carbohidrați (g)</label><input class="inp" id="mC" type="number" inputmode="numeric" placeholder="opțional"></div>
      <div class="fld"><label for="mG">Grăsimi (g)</label><input class="inp" id="mG" type="number" inputmode="numeric" placeholder="opțional"></div></div>
    <button class="btn pri wide" style="margin-top:12px" data-a="mealAdd">${ic('check')} Adaugă</button></div>
  ${ml.length?`<div class="card"><div class="row"><div class="eyebrow sp">Mesele de azi</div>${(()=>{ const pm=protMeals(tk); return `<span class="xs mu">${pm.n} cu ≥${pm.thr} g proteină</span>`; })()}</div><div style="margin-top:4px">${ml.map((m,i)=>`<div class="list-row"><span class="sp"><b>${esc(m.n||'Masă')}</b>
      <span class="mu sm"> · ${Math.round(+m.p||0)} g prot.</span></span><span class="v">${Math.round(+m.k||0)} kcal</span>
      <button class="xb" data-a="mealDel" data-i="${i}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>`).join('')}</div>
    <div class="xs mu2" style="margin-top:8px">Pentru masa musculară contează și cum împarți proteina: ideal 3–5 mese a câte ~${protMeals(tk).thr} g, la 3–5 ore distanță.</div></div>`:''}
  <div class="card"><div class="eyebrow">${ic('chart')} Ultimele 7 zile · kcal</div>${barChart(wk,{line:tg.kcal,lineLbl:'țintă '+tg.kcal,dec:0,hex:TH().ac,label:'calorii pe zi'})}
    <div class="note">Cum se calculează țintele vezi în <b>Necesar</b>. Contează media pe săptămână și trendul greutății, nu o zi anume.</div></div>`;
}
function nutriPlan(){
  const tk=todayKey(), off=S.planDay||0, k=dayShift(tk,off), tg=targets(), plan=planFor(k,tg), eaten=mlogDay(k);
  const days=Array.from({length:7},(_,i)=>{ const dk=dayShift(tk,i); return `<button class="chip ${i===off?'on':''}" data-a="planDay" data-i="${i}">${i===0?'Azi':i===1?'Mâine':DAYS[(parseKey(dk).getDay()+6)%7]+' '+(+dk.slice(8))}</button>`; }).join('');
  const tot={k:0,p:0,c:0,g:0};
  const cards=MSLOTS.map(([name,,share,icn],si)=>{ const mi=plan[si], m=mi!=null?MEALS[mi]:null, sk=Math.round(tg.kcal*share);
    if(m){ tot.k+=m[2]; tot.p+=m[3]; tot.c+=m[4]; tot.g+=m[5]; }
    const done=m&&eaten.some(x=>x.mi===mi&&x.si===si);
    return `<div class="card mcard ${done?'eaten':''}"><div class="row"><div class="eyebrow sp">${ic(icn)} ${name} · țintă ~${sk} kcal</div>${done?`<span class="tag rest">${ic('check')} mâncat</span>`:''}</div>
      ${m?`<div class="meal-t">${esc(m[1])}</div>
        <div class="tags"><span class="tag lift">${m[2]} kcal</span><span class="tag run">P ${m[3]} g</span><span class="tag">C ${m[4]} g</span><span class="tag">G ${m[5]} g</span>${m[6]?'<span class="tag">portabil</span>':''}${m[7]?'<span class="tag">fără încălzire</span>':''}</div>
        <div class="ingr">${m[8].map(([f,g])=>`<span><b>${g} g</b> ${esc(MFOOD[f]||'?')}</span>`).join('')}</div>
        <div class="inrow" style="flex-wrap:wrap">${off===0?`<button class="btn ${done?'ghost':'pri'} sm" data-a="mealEat" data-i="${si}" ${done?'disabled':''}>${ic('check')} ${done?'Notat':'Am mâncat'}</button>`:''}
          <button class="btn ghost sm" data-a="mealRe" data-i="${si}">${ic('refresh')} Altă variantă</button><button class="btn ghost sm" data-a="mealAll" data-i="${si}">Toate variantele</button></div>`
      :`<div class="note">Nicio rețetă pentru filtrele alese.</div>`}</div>`; }).join('');
  const bar=(l,v,t,c)=>`<div class="kpi"><div class="k">${l}</div><div class="v" style="font-size:20px">${Math.round(v)}<small>/${t}</small></div><div class="bar" style="margin-top:6px;height:5px"><i style="width:${(clamp(t?v/t:0,0,1.2)/1.2*100).toFixed(0)}%;background:${c}"></i></div></div>`;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('bowl')} Planul de mese</div><span class="tag ${tg.phase.cut?'lift':'rest'}">${tg.phase.label}</span></div>
    <div class="scrollx" style="margin-top:12px">${days}</div>
    <div class="chips" style="margin-top:10px"><button class="chip ${S.mf.port?'on':''}" data-a="mFilter" data-k="port">Portabil</button><button class="chip ${S.mf.cold?'on':''}" data-a="mFilter" data-k="cold">Fără încălzire</button>
      <button class="chip" data-a="planNew">${ic('refresh')} Altă zi întreagă</button></div>
    <div class="kpis" style="grid-template-columns:repeat(4,1fr)">${bar('kcal',tot.k,tg.kcal,TH().ac)}${bar('Proteină',tot.p,tg.p,COL().run)}${bar('Carbo',tot.c,tg.c,COL().warn)}${bar('Grăsimi',tot.g,tg.f,'#B3AECB')}</div>
    ${tg.kcal-tot.k>150?`<div class="easy" style="margin-top:12px">${ic('info')} Rețetele ajung la ${tot.k} kcal, cu ~${tg.kcal-tot.k} sub țintă. Adaugă o gustare în plus sau o porție mai mare de carbohidrați la prânz ori cină.</div>`:''}
    <div class="note">Rețetele vin din baza ta de <b>${MEALS.length}</b> variante; din 40 de combinații o aleg pe cea mai apropiată de ținta zilei. „Am mâncat” o notează direct în jurnalul de azi.</div></div>
    ${cards}`;
}
const FOOD_CAT=n=>{ const c=FCAT.find(([,re])=>re.test(n)); return c?c[0]:'Altele'; };
function nutriShop(){
  const n=S.shopDays||7, tk=todayKey(), tg=targets(), agg={};
  const prep=mealPrepCard();
  for(let i=0;i<n;i++){ planFor(dayShift(tk,i),tg).forEach(mi=>{ if(mi==null) return; MEALS[mi][8].forEach(([f,g])=>{ agg[f]=(agg[f]||0)+g; }); }); }
  const groups={}; Object.keys(agg).forEach(f=>{ const nm=MFOOD[f]||'?', c=FOOD_CAT(nm); (groups[c]=groups[c]||[]).push({nm,g:agg[f]}); });
  const order=FCAT.map(x=>x[0]).concat(['Altele']), all=Object.values(groups).reduce((a,x)=>a+x.length,0), got=Object.keys(agg).filter(f=>S.shop[MFOOD[f]]).length;
  return prep+`<div class="card"><div class="row"><div class="eyebrow sp">${ic('cart')} Lista de cumpărături</div><span class="xs mu">${got}/${all} bifate</span></div>
    <div class="chips" style="margin-top:12px">${[[1,'Azi'],[3,'3 zile'],[7,'7 zile']].map(([d,l])=>`<button class="chip ${n===d?'on':''}" data-a="shopDays" data-i="${d}">${l}</button>`).join('')}
      <button class="chip" data-a="shopReset">${ic('refresh')} Debifează tot</button></div>
    <div class="note">Din planul de mese pentru ${n===1?'azi':'următoarele '+n+' zile'}. Gramajele sunt cele din rețete; rotunjește la ambalaje.</div></div>
    ${order.filter(c=>groups[c]).map(c=>`<div class="card"><div class="eyebrow">${esc(c)}</div><div style="margin-top:4px">
      ${groups[c].sort((a,b)=>b.g-a.g).map(it=>{ const on=!!S.shop[it.nm]; return `<div class="shop-r ${on?'on':''}"><button class="tick ${on?'on':''}" data-a="shopTick" data-k="${esc(it.nm)}" aria-label="Bifează ${esc(it.nm)}">${ic('check')}</button>
        <span class="sp nm">${esc(it.nm)}</span><b class="v">${fmtG(it.g)}</b>${/albuș/.test(it.nm)?`<span class="xs mu">~${Math.round(it.g/33)} ouă</span>`:''}</div>`; }).join('')}</div></div>`).join('')}`;
}
function nutriNeed(){
  const P=prof(), tg=targets(), w=curW(), ms=tg.ms, ws=wStats(), rate=(tg.def*7/7700);
  const eqRows=EQS.map(([k,l,b])=>`<tr class="${tg.eq===k?'sel':''}" data-a="eqSel" data-k="${k}" style="cursor:pointer"><td>${tg.eq===k?'▸ ':''}${l}</td><td><b>${tg.A[k]}</b> kcal</td><td class="mu">${b}</td></tr>`).join('');
  const vals=EQS.map(([k])=>tg.A[k]), lo=Math.min(...vals), hi=Math.max(...vals);
  let verdict='Ai nevoie de cel puțin două săptămâni de cântăriri ca să judec ritmul.';
  if(ws&&ws.wk!=null){ const pct=-ws.wk/ws.a7*100;
    verdict=!tg.phase.cut?`Săptămână de menținere: scopul e ca greutatea să stea pe loc (acum ${ws.wk>0?'+':''}${num(ws.wk,2)} kg/săpt.).`
      :pct>1?`Scazi ${num(-ws.wk,2)} kg/săpt. (${num(pct,1)}% din greutate) — prea repede; riști să pierzi masă musculară. Adaugă ~150 kcal.`
      :ws.wk<=-0.2?`Scazi ${num(-ws.wk,2)} kg/săpt. — în ritmul bun. Nu schimba nimic.`
      :`Greutatea aproape că stă (${ws.wk>0?'+':''}${num(ws.wk,2)} kg/săpt.). Dacă rămâne așa încă o săptămână, scade ~150 kcal, din carbohidrați.`; }
  return `<div class="card"><div class="eyebrow">${ic('target')} Ținta de azi</div>
      <div class="row" style="margin-top:8px;align-items:flex-end"><div class="big">${tg.kcal}<small>kcal</small></div><span class="tag ${tg.phase.cut?'lift':'rest'}" style="margin-left:auto">${tg.phase.label}</span></div>
      <div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><div class="k">Proteină</div><div class="v">${tg.p}<small>g</small></div></div>
        <div class="kpi"><div class="k">Carbohidrați</div><div class="v">${tg.c}<small>g</small></div></div><div class="kpi"><div class="k">Grăsimi</div><div class="v">${tg.f}<small>g</small></div></div></div>
      <div class="note">Necesar ${tg.measured?'<b>măsurat</b>':'estimat'} ${tg.tdee} kcal${tg.def?' − deficit '+tg.def+' kcal (~'+num(rate,2)+' kg/săpt.)':' (menținere)'}${tg.manual?' · ai setat manual '+tg.kcal+' kcal':''}.
        Proteina: 2 g/kg din greutatea-țintă; grăsimile: 0,7 g/kg (minim 0,6); restul, carbohidrați. Nu coborî sub metabolismul bazal (${tg.bmr} kcal) fără un medic sau nutriționist.</div>
      <div class="inrow"><button class="btn ghost sm" data-a="defAdj" data-i="-150">− 150 kcal</button><button class="btn ghost sm" data-a="defAdj" data-i="150">+ 150 kcal</button><span class="xs mu" style="align-self:center">deficit: ${+P.def||600} kcal</span></div></div>
    <div class="card"><div class="eyebrow">${ic('scale')} Ritmul de slăbire</div><p class="sm">${verdict}</p></div>
    <div class="card"><div class="row"><div class="eyebrow sp">${ic('chart')} Necesar măsurat</div>${ms.ok?`<button class="sw ${P.useMeasured!==false?'on':''}" data-a="useMeas" role="switch" aria-checked="${P.useMeasured!==false}" aria-label="Folosește necesarul măsurat"></button>`:''}</div>
      ${ms.ok?`<div class="kpis"><div class="kpi"><div class="k">Necesar</div><div class="v">${ms.tdee}</div></div><div class="kpi"><div class="k">Aport mediu</div><div class="v">${ms.intake}</div></div>
          <div class="kpi"><div class="k">Greutate</div><div class="v" style="font-size:20px">${ms.perWeek>0?'+':''}${num(ms.perWeek,2)}<small>kg/săpt</small></div></div></div>
        <div class="note">Din ${ms.days} zile notate complet și ${ms.weighs} cântăriri în ultimele 3 săptămâni. Bate orice formulă, pentru că vine din corpul tău. ${P.useMeasured!==false?'Îl folosesc pentru ținte.':'Acum folosesc estimarea din formulă.'}</div>`
      :`<div class="note">Calculez necesarul real din ce mănânci și cum se mișcă cântarul. Am nevoie, în ultimele 3 săptămâni, de cel puțin <b>7 zile notate complet</b> (minim 3 mese și 1500 kcal) și <b>8 cântăriri</b>.${ms.odd?' Datele de acum dau un rezultat neverosimil; mai notează câteva zile.':''}</div>
        <div class="mbars"><div><div class="xs mu">Zile complete: ${ms.days}/7</div><div class="bar" style="margin-top:6px"><i style="width:${clamp(ms.days/7,0,1)*100}%"></i></div></div>
          <div><div class="xs mu">Cântăriri: ${ms.weighs}/8</div><div class="bar" style="margin-top:6px"><i style="width:${clamp(ms.weighs/8,0,1)*100}%"></i></div></div></div>`}</div>
    <div class="card"><div class="eyebrow">${ic('calc')} Metabolism bazal la ${num(w,1)} kg</div>
      <table class="rm" style="margin-top:10px"><tr><th>Ecuație</th><th>Bazal</th><th>Pe baza</th></tr>${eqRows}</table>
      <div class="note">Atinge un rând ca s-o alegi. Între ele e o diferență de <b>${hi-lo} kcal</b> pe zi: atâta incertitudine au toate calculatoarele. Ecuațiile pe masă slabă folosesc grăsimea corporală.</div>
      <div class="form"><div class="fld"><label for="pBf">Grăsime corporală (%)</label><input class="inp" id="pBf" data-p="bf" type="number" step="0.5" inputmode="decimal" value="${+P.bf||28}"></div>
        <div class="fld"><label>Masă slabă</label><div class="big sm" style="padding-top:4px">${num(tg.A.ffm,1)}<small>kg</small></div></div></div>
      <div class="sm" style="margin-top:12px;font-weight:600">Activitate</div>
      <div class="chips" style="margin-top:8px">${[[1.375,'Ușoară'],[1.55,'Moderată'],[1.725,'Mare'],[1.9,'Foarte mare']].map(([v,l])=>`<button class="chip ${Math.abs((+P.act||1.55)-v)<.01?'on':''}" data-a="actSet" data-k="${v}">${l} ×${v}</button>`).join('')}</div></div>
    <div class="card"><div class="set-row" style="border:0;padding:0"><span class="sp"><b>Pauze de dietă</b><div class="sm mu">Săptămânile 1–2 ale ciclului în deficit, 3–4 la menținere, ca în programul tău original.</div></span>
      <button class="sw ${P.dietBreak!==false?'on':''}" data-a="dietBreak" role="switch" aria-checked="${P.dietBreak!==false}" aria-label="Pauze de dietă"></button></div></div>`;
}


/* memento-uri în calendar: o aplicație web nu poate trimite notificări programate (mai ales pe iPhone),
   așa că exportăm următoarele 4 săptămâni ale planului ca fișier .ics, cu alarmă înainte de fiecare antrenament */
function icsText(time,alarm){
  const tk=todayKey(), nx=nextDay(), m=/^(\d{1,2}):(\d{2})$/.exec(time||'18:00')||[0,18,0], h=+m[1], mi=+m[2];
  const esc_=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  const fold=l=>{ const out=[]; let s=l; while(s.length>72){ out.push(s.slice(0,72)); s=' '+s.slice(72); } out.push(s); return out.join('\r\n'); };
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  const w0=nx?nx.w:0, m0=mondayOf(tk), L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ZECE//Hybrid365//RO','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:ZECE · antrenamente'];
  for(let i=0;i<28;i++){ const k=dayShift(tk,i), d=(parseKey(k).getDay()+6)%7, wk=(w0+Math.floor(daysBetween(m0,k)/7))%WEEKS, day=dayFor(wk,d,true);
    const st=new Date(k+'T00:00'); st.setHours(h,mi,0,0); const en=new Date(st.getTime()+(+day.min||60)*6e4);
    const f=x=>keyOf(x).replace(/-/g,'')+'T'+pad(x.getHours())+pad(x.getMinutes())+'00';
    L.push('BEGIN:VEVENT','UID:zece-'+k+'@hybrid365','DTSTAMP:'+stamp,'DTSTART:'+f(st),'DTEND:'+f(en),
      fold('SUMMARY:'+esc_('ZECE · '+day.t)),
      fold('DESCRIPTION:'+esc_('Săptămâna '+(wk+1)+' · '+DAYN[d]+' · '+day.min+' min\n'+day.ex.map(e=>'• '+e.n+(short(e)?' · '+short(e):'')).join('\n'))));
    if(alarm>0) L.push('BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:-PT'+alarm+'M',fold('DESCRIPTION:'+esc_('ZECE în '+alarm+' de minute: '+day.t)),'END:VALARM');
    L.push('END:VEVENT'); }
  L.push('END:VCALENDAR'); return L.join('\r\n')+'\r\n';
}
async function icsExport(){
  const t=($('#icsT')||{}).value||'18:00', al=+(($('#icsA')||{}).value||30);
  await save('prof',Object.assign({},S.prof||{},{icsT:t,icsA:al}));
  const blob=new Blob([icsText(t,al)],{type:'text/calendar'}), file=new File([blob],'zece-antrenamente.ics',{type:'text/calendar'});
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})&&matchMedia('(pointer:coarse)').matches){ await navigator.share({files:[file],title:'ZECE · antrenamente'}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=file.name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000); toast('Calendar exportat','Deschide fișierul ca să adaugi antrenamentele cu alarmă.','info');
}
function icsCard(){ const P=prof();
  return `<div class="card"><div class="eyebrow">${ic('clock')} Memento-uri în calendar</div>
    <div class="sm mu" style="margin-top:8px">Pune următoarele 4 săptămâni din plan în calendarul telefonului, cu alarmă înainte. Așa îți amintește chiar și când ZECE e închis.</div>
    <div class="form"><div class="fld"><label for="icsT">Ora antrenamentului</label><input class="inp" id="icsT" type="time" value="${esc(P.icsT||'18:00')}"></div>
      <div class="fld"><label for="icsA">Alarmă înainte</label><select class="inp" id="icsA">${[[0,'Fără'],[15,'15 min'],[30,'30 min'],[60,'1 oră'],[120,'2 ore']].map(([v,l])=>`<option value="${v}" ${+(P.icsA==null?30:P.icsA)===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
    <button class="btn wide" style="margin-top:12px" data-a="icsExport">${ic('download')} Adaugă în calendar (.ics)</button>
    <div class="note">Pe iPhone deschide fișierul și apasă „Adaugă tot”. Dacă reiei exportul mai târziu, evenimentele se actualizează, nu se dublează.</div></div>`; }
