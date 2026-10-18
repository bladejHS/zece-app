/* =====================================================================
   v8 · PERFORMANCE CENTER — o perioadă aleasă (zi → tot) pentru toate analizele:
   indicatori cu schimbarea față de perioada anterioară, grafice interactive, distribuții,
   recorduri, recuperare (cu datele care lipsesc spuse explicit).
   ===================================================================== */
const PERF_TABS=[['ov','Prezentare','grid'],['s','Forță','dumbbell'],['r','Alergare','run'],['k1','1 KM','stopwatch'],['b','Corp','ruler'],['rec','Recuperare','moon'],['pr','Recorduri','trophy'],['twin','Atlet','user'],['t','Teste','medal']];
function viewProg(){
  if(S.progTab==='w') S.progTab='b';
  if(!PERF_TABS.some(t=>t[0]===S.progTab)) S.progTab='ov';
  const P=S.progTab, body=P==='s'?perfStrength():P==='r'?runLab():P==='k1'?k1Lab():P==='b'?perfBody():P==='rec'?perfRec():P==='pr'?perfRecords():P==='t'?progTests():P==='twin'?progTwin():perfOverview();
  return `<div class="seg scr wide" style="margin-top:6px">${PERF_TABS.map(t=>`<button class="${P===t[0]?'on':''}" data-a="progTab" data-k="${t[0]}">${ic(t[2])} ${t[1]}</button>`).join('')}</div>${body}`;
}
/* bara de perioadă, comună */
function rangeBar(){ const r=S.rng||'m'; return `<div class="rng-bar wide"><div class="seg sm">${RANGES.map(([k,l])=>`<button class="${r===k?'on':''}" data-a="rng" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="xs mu2 rng-l">${esc(rangeOf(r).lbl)}${r==='all'?'':' · față de perioada anterioară de aceeași lungime'}</div></div>`; }
ACT.rng=(el,{k})=>{ S.rng=k; try{ localStorage.setItem('zece3:rng',JSON.stringify(k)); }catch(e){} render(); };
/* un indicator cu schimbarea față de perioada anterioară */
function kv(k,v,unit,c,o={}){ return `<div class="kpi ${o.a?'link':''}" ${o.a||''}><div class="k">${k}</div><div class="v">${v}${unit?`<small>${unit}</small>`:''}</div><div class="s">${c!=null?chgHTML(c,o.low)+' <span class="mu2">'+(S.rng==='d'?'față de ieri':'față de înainte')+'</span>':o.s||'&nbsp;'}</div></div>`; }

/* ---------- Prezentare ---------- */
function perfOverview(){
  const R=rangeOf(S.rng||'m'), Pv=prevRange(R), a=periodAgg(R.a,R.b), p=Pv?periodAgg(Pv.a,Pv.b):null, B=bucketsOf(R);
  const c=(x,y)=>p&&y>0?pctCh(x,y):null, wa=w7At(R.b), wb=w7At(R.id==='all'?(wList()[0]||{}).d||R.a:dayShift(R.a,-1));
  const pace=a.pace, ppace=p&&p.pace;
  const kpis=`<div class="card wide"><div class="card-h"><div class="eyebrow">${ic('gauge')} ${esc(cap(R.lbl))}</div></div>
    <div class="kpis c4 kv4">
      ${kv('Zile active',a.days,'',c(a.days,p&&p.days))}
      ${kv('Antrenamente',(a.ses||0)+(a.days&&!a.ses?'':''),'',c(a.ses,p&&p.ses),{s:'sesiuni ghidate'})}
      ${kv('Tonaj',a.vol?num(a.vol/1000,a.vol<10000?2:1):'0','t',c(a.vol,p&&p.vol))}
      ${kv('Serii',a.sets,'',c(a.sets,p&&p.sets))}
      ${kv('Alergare',num(a.km,1),'km',c(a.km,p&&p.km),{a:`data-a="progTab" data-k="r"`})}
      ${kv('Timp de alergare',a.rmin?fmtClock(a.rmin*60):'0:00','',c(a.rmin,p&&p.rmin))}
      ${kv('Ritm mediu',pace?mmss(pace):'—',pace?'/km':'',pace&&ppace?pctCh(pace,ppace):null,{low:true,s:'toate alergările'})}
      ${kv('Greutate',wa!=null?num(wa,1):'—',wa!=null?'kg':'',null,{s:wa!=null&&wb!=null?`<span class="chg ${wa-wb<=0?'up':'dn'}">${wa-wb>0?'+':''}${num(wa-wb,1)} kg</span> <span class="mu2">în perioadă</span>`:'media pe 7 zile',a:`data-a="progTab" data-k="b"`})}
    </div></div>`;
  const ton=B.list.map(b=>{ const o=ixSum(b.a,b.b); return {lbl:b.lbl,tip:b.tip,v:Math.round(o.vol/100)/10,hi:true}; }), km=B.list.map(b=>({lbl:b.lbl,tip:b.tip,v:Math.round(ixSum(b.a,b.b).km*10)/10,hi:true}));
  const act=B.list.map(b=>({lbl:b.lbl,tip:b.tip,v:ixSum(b.a,b.b).days,hi:true}));
  const bk=B.kind==='day'?'pe zi':B.kind==='week'?'pe săptămână':'pe lună';
  const has=ton.some(x=>x.v>0)||km.some(x=>x.v>0);
  const wl=wList().filter(x=>x.d>=R.a&&x.d<=R.b);
  /* distribuția pe zilele săptămânii: în ce zile te antrenezi de fapt */
  const dw=[0,0,0,0,0,0,0]; trainDays().forEach(d=>{ if(d>=R.a&&d<=R.b) dw[(parseKey(d).getDay()+6)%7]++; }); const dwm=Math.max(1,...dw);
  return `${rangeBar()}${kpis}
    ${has?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('dumbbell')} Tonaj ${bk}</div><span class="xs mu">${num(a.vol/1000,1)} t în total</span></div>
      ${barChart(ton,{hex:TH().ac,dec:1,unit:'t',label:'tonaj '+bk})}${chStats(ton.map(x=>x.v),{fmt:v=>num(v,1)+' t',cur:a.vol,prev:p&&p.vol>0?p.vol:null,fmtC:1})}</div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('run')} Kilometri ${bk}</div><span class="xs mu">${num(a.km,1)} km în total</span></div>
      ${barChart(km,{dec:1,unit:'km',label:'kilometri '+bk})}${chStats(km.map(x=>x.v),{fmt:v=>num(v,1)+' km',cur:a.km,prev:p&&p.km>0?p.km:null})}</div>`
      :`<div class="card"><div class="empty">${ic('chart')}<div>Nimic notat în ${esc(R.lbl)}. Alege o perioadă mai lungă sau începe un antrenament.</div></div></div>`}
    ${wl.length>=2?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('scale')} Greutate</div><span class="xs mu">${wl.length} cântăriri</span></div>
      ${lineChart({pts:wl.map(x=>({x:x.d,y:x.w})),ma:wMA(wl),trend:wl.length>=4,unit:'kg',dec:1,label:'greutate',goal:prof().goalW,goalLbl:'țintă '+prof().goalW})}
      ${chStats(wl.map(x=>x.w),{fmt:v=>num(v,1)+' kg',down:+prof().goalW<+prof().startW})}<div class="ch-leg"><span><i style="background:var(--ac)"></i>media pe 7 zile</span><span><i class="dash"></i>trend</span></div></div>`:''}
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('flame')} Consecvență</div><span class="xs mu">${a.days} din ${R.days} zile</span></div>
      ${barChart(act,{hex:COL().ok,dec:0,label:'zile active '+bk,unit:B.kind==='day'?'':'zile'})}
      <div class="xs mu" style="margin-top:12px">În ce zile te antrenezi</div>
      <div class="dist">${DAYN.map((n,i)=>`<div class="dist-r"><span>${n}</span><div class="b"><i style="width:${(dw[i]/dwm*100).toFixed(1)}%"></i></div><span>${dw[i]}</span></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('bulb')} Ce spun datele</div></div>
      ${insightsAll().length?`<div class="ins-l">${insightsAll().map(insRow).join('')}</div>`:`<div class="empty sm">Observațiile apar când ai câteva săptămâni de date.</div>`}</div>
    ${goalsCard()}
    ${(()=>{ const ev=prBook().ev.filter(x=>x.d>=R.a&&x.d<=R.b&&x.cat!=='rep'); return `<div class="card"><div class="card-h"><div class="eyebrow">${ic('trophy')} Recorduri în perioadă</div><button class="btn ghost xs" data-a="progTab" data-k="pr">${ic('right')}</button></div>
      ${ev.length?ev.slice(0,8).map(p=>`<div class="pr-row"><span class="tag pr">PR</span><b>${esc(prName(p))}</b><span class="xs mu">${relDay(p.d)}</span><span class="v">${prVal(p)}</span></div>`).join(''):`<div class="empty sm">Niciun record în ${esc(R.lbl)}.</div>`}</div>`; })()}`;
}
const cap=s=>String(s).charAt(0).toUpperCase()+String(s).slice(1);

/* ---------- Forță ---------- */
function perfStrength(){
  const R=rangeOf(S.rng||'m'), Pv=prevRange(R), a=periodAgg(R.a,R.b), p=Pv?periodAgg(Pv.a,Pv.b):null, B=bucketsOf(R), c=(x,y)=>p&&y>0?pctCh(x,y):null;
  const exs=Object.keys(S.lifts||{}).map(n=>{ const h=liftHist(n).filter(e=>e.d>=R.a&&e.d<=R.b); if(!h.length) return null;
    const hp=Pv?liftHist(n).filter(e=>e.d>=Pv.a&&e.d<=Pv.b):[], be=hh=>Math.max(0,...hh.map(e=>Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))));
    const sets=h.reduce((x,e)=>x+e.s.length,0), vol=h.reduce((x,e)=>x+e.s.reduce((y,s)=>y+(+s[0]||0)*(+s[1]||0),0),0), e1=be(h), e0=be(hp);
    return {n,ses:h.length,sets,vol,e1,ch:e1&&e0?pctCh(e1,e0):null,last:h[h.length-1].d}; }).filter(Boolean).sort((x,y)=>y.vol-x.vol);
  const ton=B.list.map(b=>{ const o=ixSum(b.a,b.b); return {lbl:b.lbl,tip:b.tip,v:Math.round(o.vol/100)/10,hi:true}; }), sets=B.list.map(b=>({lbl:b.lbl,tip:b.tip,v:ixSum(b.a,b.b).sets,hi:true}));
  return `${rangeBar()}
    <div class="card wide"><div class="kpis c4">${kv('Tonaj',num(a.vol/1000,a.vol<10000?2:1),'t',c(a.vol,p&&p.vol))}${kv('Serii',a.sets,'',c(a.sets,p&&p.sets))}
      ${kv('Repetări',a.reps,'',c(a.reps,p&&p.reps))}${kv('Zile cu forță',a.lift,'',c(a.lift,p&&p.lift))}</div></div>
    ${a.sets?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('chart')} Tonaj</div></div>${barChart(ton,{hex:TH().ac,dec:1,unit:'t',label:'tonaj'})}${chStats(ton.map(x=>x.v),{fmt:v=>num(v,1)+' t',cur:a.vol,prev:p&&p.vol>0?p.vol:null})}</div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('layers')} Serii</div></div>${barChart(sets,{hex:TH().ac,dec:0,unit:'serii',label:'serii'})}${chStats(sets.map(x=>x.v),{fmt:v=>num(v,0),cur:a.sets,prev:p&&p.sets>0?p.sets:null})}</div>`:''}
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('list')} Exerciții · ${esc(R.lbl)}</div><span class="xs mu">${exs.length}</span></div>
      ${exs.length?`<div class="ex-t"><div class="ex-th"><span>Exercițiu</span><span>Sesiuni</span><span>Serii</span><span>Tonaj</span><span>1RM est.</span></div>
        ${exs.map(x=>`<button class="ex-tr" data-a="exOpen" data-k="${esc(x.n)}"><span class="n">${esc(x.n)}</span><span>${x.ses}</span><span>${x.sets}</span><span>${num(x.vol/1000,2)} t</span><span>${x.e1?x.e1+' kg':'—'} ${x.ch!=null?chgHTML(x.ch):''}</span></button>`).join('')}</div>
        <div class="xs mu2" style="margin-top:8px">Schimbarea la 1RM estimat e față de perioada anterioară, doar dacă ai serii la exercițiu în ambele.</div>`
        :`<div class="empty sm">Nicio serie notată în ${esc(R.lbl)}.</div>`}</div>
    ${progStrength()}`;
}

/* ---------- Corp ---------- */
function perfBody(){ return progWeight()+bodyComp()+bodyTimeline()+bodyCompare()+stepsCard()+progBody(); }
/* cronologia corpului: pe luni, cu media greutății, talia și pozele */
function bodyTimeline(){
  const w=wList(), b=bList(), ph=Array.isArray(S.photos)?S.photos:[], months={};
  const mk=d=>d.slice(0,7), add=(d,k,v)=>{ const m=months[mk(d)]=months[mk(d)]||{w:[],b:[],ph:0}; if(k==='w') m.w.push(v); else if(k==='b') m.b.push(v); else m.ph++; };
  w.forEach(x=>add(x.d,'w',x.w)); b.forEach(x=>add(x.d,'b',x)); ph.forEach(p=>add(p.date,'p'));
  const ks=Object.keys(months).sort().reverse().slice(0,12); if(!ks.length) return '';
  let prevW=null; const avg=ks.slice().reverse().map(k=>{ const m=months[k], a=m.w.length?avgOf(m.w):null, d=a!=null&&prevW!=null?a-prevW:null; if(a!=null) prevW=a; return {k,a,d}; }).reverse();
  return `<div class="card"><div class="card-h"><div class="eyebrow">${ic('history')} Cronologia corpului</div><span class="xs mu">pe luni</span></div>
    <div class="btl">${ks.map((k,i)=>{ const m=months[k], A=avg[i], lb=m.b[m.b.length-1], y=+k.slice(0,4), mo=+k.slice(5,7);
      return `<div class="btl-r"><div class="btl-m"><b>${MON_S[mo-1]}</b><span>${y}</span></div><div class="sp">
        <div class="row" style="gap:8px;flex-wrap:wrap">${A.a!=null?`<span class="tag">${ic('scale')} ${num(A.a,1)} kg</span>${A.d!=null?`<span class="chg ${A.d<=0?'up':'dn'}">${A.d>0?'+':''}${num(A.d,1)} kg</span>`:''}`:''}
          ${lb&&+lb.waist?`<span class="tag">${ic('ruler')} talie ${num(lb.waist)} cm</span>`:''}${lb&&lb.bf?`<span class="tag">grăsime ${num(lb.bf,1)}% <span class="src">manual</span></span>`:''}
          ${m.ph?`<span class="tag">${ic('camera')} ${m.ph} ${m.ph===1?'poză':'poze'}</span>`:''}</div>
        <div class="xs mu2" style="margin-top:4px">${m.w.length} ${m.w.length===1?'cântărire':'cântăriri'}${m.b.length?' · '+m.b.length+' '+(m.b.length===1?'măsurătoare':'măsurători'):''}</div></div></div>`; }).join('')}</div>
    <div class="note">Media lunară a cântăririlor și ultima măsurătoare din lună. Schimbarea e față de luna anterioară cu cântăriri.</div></div>`;
}
/* compară două momente: măsurători, greutate și (dacă există) poze */
function bodyCompare(){
  const b=bList(); if(b.length<2) return '';
  const ds=b.map(x=>x.d), A=S.bcA&&ds.indexOf(S.bcA)>=0?S.bcA:ds[0], Bd=S.bcB&&ds.indexOf(S.bcB)>=0?S.bcB:ds[ds.length-1];
  const xa=b.find(x=>x.d===A), xb=b.find(x=>x.d===Bd), wa=w7At(A), wb=w7At(Bd);
  const rows=[['Greutate (media 7 zile)',wa,wb,'kg',1]].concat(MEAS.map(([k,l])=>[l,+xa[k]||null,+xb[k]||null,'cm',1])).concat([['Grăsime (manual)',xa.bf||null,xb.bf||null,'%',1]]).filter(r=>r[1]!=null||r[2]!=null);
  const opt=sel=>ds.slice().reverse().map(d=>`<option value="${d}" ${d===sel?'selected':''}>${fmtDayY(d)}</option>`).join('');
  return `<div class="card"><div class="card-h"><div class="eyebrow">${ic('swap')} Compară două date</div></div>
    <div class="form"><div class="fld"><label for="bcA">De la</label><select class="inp" id="bcA" data-bc="A">${opt(A)}</select></div><div class="fld"><label for="bcB">Până la</label><select class="inp" id="bcB" data-bc="B">${opt(Bd)}</select></div></div>
    <div class="cmp2"><div class="cmp2-h"><span></span><span>${fmtDay(A)}</span><span>${fmtDay(Bd)}</span><span>Diferență</span></div>
      ${rows.map(([l,x,y,u,dc])=>{ const d=x!=null&&y!=null?y-x:null; return `<div class="cmp2-r"><span>${l}</span><span>${x!=null?num(x,dc)+' '+u:'—'}</span><span>${y!=null?num(y,dc)+' '+u:'—'}</span><span class="${d==null?'':d<=0?'good':'bad'}">${d==null?'—':(d>0?'+':'')+num(d,dc)+' '+u}</span></div>`; }).join('')}</div>
    <div class="note">Doar valorile notate în acele zile; „—" înseamnă că lipsesc. Pentru poze, folosește „Compară" din cardul de poze.</div></div>`;
}

/* ---------- Recuperare ---------- */
const REC_SRC=[['sleep','Somn','check-in de dimineață sau import CSV'],['energy','Energie','check-in de dimineață'],['sore','Febră musculară','check-in de dimineață'],
  ['rhr','Puls în repaus','check-in, măsurarea cu senzorul Polar sau CSV'],['hrv','HRV','măsurarea de 2 minute cu centura (intervale RR) sau CSV'],['steps','Pași','check-in sau CSV']];
function perfRec(){
  const tk=todayKey(), rows=REC_SRC.map(([k,l,src])=>{ let n=0, last=null; for(let i=0;i<14;i++){ const d=dayShift(tk,-i), v=jOf(d)[k]; if(v!=null&&v!==''&&+v>0){ n++; if(!last) last=d; } } return {k,l,src,n,last}; });
  const lr=loadRatio(tk), miss=rows.filter(r=>!r.n);
  return `${readyCard()}${recCard()}${loadCard()}
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('table')} Date de recuperare · 14 zile</div><span class="xs mu">${rows.filter(r=>r.n).length} din ${rows.length} surse</span></div>
      <div class="rs">${rows.map(r=>`<div class="rs-r"><span class="sp"><b>${r.l}</b><span class="xs mu2">${esc(r.src)}</span></span><span class="rs-d">${Array.from({length:14},(_,i)=>{ const v=jOf(dayShift(tk,-13+i))[r.k]; return `<i class="${v!=null&&v!==''&&+v>0?'on':''}"></i>`; }).join('')}</span>
        <span class="v ${r.n?'':'mu2'}">${r.n?r.n+'/14':'lipsește'}</span></div>`).join('')}
        <div class="rs-r"><span class="sp"><b>Încărcare de antrenament</b><span class="xs mu2">calculată din serii, alergări, cronometru și Strava</span></span><span class="v ${lr?'':'mu2'}">${lr?num(lr.r,2)+'×':'lipsește'}</span></div></div>
      ${miss.length?`<div class="note"><b>Lipsesc:</b> ${miss.map(r=>r.l.toLowerCase()).join(', ')}. ZECE nu le estimează și nu le inventează: readiness folosește doar ce există. ${miss.some(r=>r.k==='hrv'||r.k==='rhr')?'HRV și pulsul în repaus vin din măsurarea cu senzorul (Setări → Conexiuni) sau dintr-un CSV exportat din ceas.':''}</div>`
        :'<div class="note">Toate sursele au date în ultimele 14 zile.</div>'}
      <div class="inrow"><button class="btn sm" data-a="ciOpen">${ic('sun')} Check-in acum</button><button class="btn ghost sm" data-a="hrOpen">${ic('heart')} Măsoară cu senzorul</button></div></div>`;
}

/* ---------- Recorduri și realizări ---------- */
function perfRecords(){
  const B=prBook(), cur=B.cur, keys=Object.keys(cur);
  const lift=[...new Set(keys.filter(k=>/^(e1|w|vol|rep)\|/.test(k)).map(k=>k.split('|')[1]))].sort();
  const runK=['dist','pace','spd'].concat(PR_DIST.map(x=>'time|'+x[2])).filter(k=>cur[k]);
  const other=keys.filter(k=>['amrap','engine','hang','broad','reach'].indexOf(k)>=0);
  const cell=k=>{ const p=cur[k]; return p?`<div class="prc"><span class="k">${esc(PR_CAT[p.cat]||'')}</span><b>${prVal(p)}</b><span class="d">${p.txt?esc(p.txt)+' · ':''}${p.d?fmtDay(p.d):''}</span></div>`:'<div class="prc off"><span class="k">—</span></div>'; };
  const A=achAll(), done=A.filter(a=>a.done).length;
  return `<div class="card wide"><div class="card-h"><div class="eyebrow">${ic('award')} Realizări</div><span class="xs mu">${done} din ${A.length}</span></div>
      <div class="ach-g">${A.map(a=>`<div class="ach ${a.done?'on':''}" title="${esc(a.d)}"><span class="ach-i">${ic(a.done?'award':'lock')}</span><b>${esc(a.t)}</b>
        <span>${a.done?fmtDayY(a.date):a.prog!=null?Math.round(a.prog*100)+'%':esc(a.d)}</span>${!a.done&&a.prog!=null?`<i class="ach-b"><i style="width:${(a.prog*100).toFixed(0)}%"></i></i>`:''}</div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('run')} Alergare</div></div>
      ${runK.length?runK.map(k=>{ const p=cur[k]; return `<div class="list-row ${p.ri!=null?'link':''}" ${p.ri!=null?`data-a="runOpen" data-i="${p.ri}"`:''}><span class="sp"><b>${esc(prName(p))}</b><span class="xs mu2" style="display:block">${p.txt?esc(p.txt)+' · ':''}${fmtDayY(p.d)}</span></span><span class="v">${prVal(p)}</span></div>`; }).join('')
        :`<div class="empty sm">Recordurile de alergare apar după primele alergări notate.</div>`}
      <div class="xs mu2" style="margin-top:8px">Timpii pe distanță sunt doar măsurați: o alergare de exact distanța respectivă (±2%) sau efortul calculat de Strava. Estimările Riegel nu intră aici.</div></div>
    ${other.length?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('medal')} Conditioning și teste</div></div>${other.map(k=>{ const p=cur[k]; return `<div class="list-row"><span class="sp"><b>${esc(prName(p))}</b><span class="xs mu2" style="display:block">${fmtDayY(p.d)}</span></span><span class="v">${prVal(p)}</span></div>`; }).join('')}</div>`:''}
    <div class="card wide"><div class="card-h"><div class="eyebrow">${ic('dumbbell')} Forță</div><span class="xs mu">${lift.length} exerciții</span></div>
      ${lift.length?`<div class="prt-t">${lift.map(n=>`<div class="prt-r"><button class="n" data-a="exOpen" data-k="${esc(n)}">${esc(n)}</button>${['e1|','w|','rep|','vol|'].map(p=>cell(p+n)).join('')}</div>`).join('')}</div>`
        :`<div class="empty sm">Recordurile de forță apar după primele serii notate.</div>`}
      <div class="xs mu2" style="margin-top:8px">1RM estimat cu formula Epley din cea mai bună serie · greutate = cea mai mare greutate ridicată · repetări = cele mai multe la cea mai mare greutate · volum = tonajul unei sesiuni.</div></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('history')} Ultimele recorduri</div></div>
      ${B.ev.length?B.ev.slice(0,20).map(p=>`<div class="pr-row"><span class="tag pr">${esc(PR_CAT[p.cat]||'PR')}</span><b>${esc(p.ex||prName(p))}</b><span class="xs mu">${fmtDay(p.d)}</span><span class="v">${p.cat==='rep'?p.prev+'→'+p.v+' rep. · '+esc(p.txt):prVal(p)}</span></div>`).join(''):`<div class="empty sm">Niciun record încă.</div>`}</div>`;
}
