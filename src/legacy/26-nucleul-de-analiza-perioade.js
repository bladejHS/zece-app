/* =====================================================================
   v8 · NUCLEUL DE ANALIZĂ — perioade, agregări, recorduri, 1 km, insights, realizări.
   Regula: fiecare cifră vine din date notate; estimările sunt marcate ca estimări;
   sub pragul minim de date nu afișăm statistica (spunem ce lipsește).
   ===================================================================== */
/* ---------- perioade ---------- */
const RANGES=[['d','Zi',1],['w','Săpt.',7],['m','Lună',30],['q','3 luni',91],['h','6 luni',182],['y','An',365],['all','Tot',0]];
const RANGE_L={d:'azi',w:'ultimele 7 zile',m:'ultimele 30 de zile',q:'ultimele 3 luni',h:'ultimele 6 luni',y:'ultimul an',all:'tot istoricul'};
function rangeOf(id){
  const tk=todayKey(), r=RANGES.find(x=>x[0]===id)||RANGES[2];
  if(r[0]==='all'){ const f=IX().first||tk, a=f<tk?f:tk; return {id:'all',a,b:tk,days:daysBetween(a,tk)+1,lbl:RANGE_L.all}; }
  return {id:r[0],a:dayShift(tk,-(r[2]-1)),b:tk,days:r[2],lbl:RANGE_L[r[0]]};
}
function prevRange(R){ if(!R||R.id==='all') return null; const b=dayShift(R.a,-1); return {a:dayShift(b,-(R.days-1)),b,days:R.days}; }
const MON_S=['ian','feb','mar','apr','mai','iun','iul','aug','sept','oct','nov','dec'];
/* găleți pentru grafice: zile (până la o lună), săptămâni (până la 6 luni), luni (an și tot) */
function bucketsOf(R){
  const out=[]; let kind=R.days<=31?'day':R.days<=200?'week':'month';
  if(R.id==='d'){ kind='day'; for(let i=13;i>=0;i--){ const k=dayShift(R.b,-i); out.push({a:k,b:k,lbl:i===0?'azi':String(+k.slice(8)),tip:fmtDay(k),cur:i===0}); } return {kind,list:out}; }
  if(kind==='day'){ for(let k=R.a;k<=R.b;k=dayShift(k,1)) out.push({a:k,b:k,lbl:R.days<=7?DAYS[(parseKey(k).getDay()+6)%7]:String(+k.slice(8)),tip:fmtDay(k),cur:k===R.b}); }
  else if(kind==='week'){ let m=mondayOf(R.a); while(m<=R.b){ const e=dayShift(m,6); out.push({a:m<R.a?R.a:m,b:e>R.b?R.b:e,lbl:String(+m.slice(8))+'.'+(+m.slice(5,7)),tip:'săpt. '+fmtDay(m)+' – '+fmtDay(e),cur:e>=R.b}); m=dayShift(m,7); } }
  else { let y=+R.a.slice(0,4), mo=+R.a.slice(5,7); while(true){ const a=y+'-'+pad(mo)+'-01', nx=mo===12?(y+1)+'-01-01':y+'-'+pad(mo+1)+'-01', b=dayShift(nx,-1);
      if(a>R.b) break; out.push({a:a<R.a?R.a:a,b:b>R.b?R.b:b,lbl:MON_S[mo-1],tip:MON_S[mo-1]+' '+y,cur:b>=R.b}); mo++; if(mo>12){ mo=1; y++; } } }
  return {kind,list:out};
}
/* sumele pe o perioadă: forță (serii, tonaj, repetări), alergare (km, minute, ritm), zile active, sesiuni, încărcare */
function periodAgg(a,b){
  const o=ixSum(a,b); let load=0; const X=IX(); X.days.forEach(d=>{ if(d>=a&&d<=b) load+=dayLoad(d); });
  o.load=Math.round(load); o.pace=o.km>0&&o.rmin>0?o.rmin/o.km:null; o.ton=o.vol/1000;
  /* antrenamente = zile cu antrenament notat (forță, alergare, cronometru sau Strava) */
  o.wk=o.days; return o;
}
const pctCh=(cur,prev)=>prev>0&&isFinite(cur)?(cur-prev)/prev*100:null;
const chgHTML=(c,lowGood)=>c==null?'':`<span class="chg ${Math.abs(c)<.5?'eq':(lowGood?c<0:c>0)?'up':'dn'}">${c>0?'+':''}${num(c,Math.abs(c)<10?1:0)}%</span>`;
/* media greutății pe 7 zile, la o dată (null dacă nu există cântăriri în fereastră) */
function w7At(d){ const c=dayShift(d,-7), a=wl0().filter(x=>x.d<=d&&x.d>c); return a.length?avgOf(a.map(x=>x.w)):null; }

/* ---------- alergare: ritm, viteză, surse ---------- */
const kmh=r=>+r.km>0&&+r.min>0?r.km/(r.min/60):null;
const fmtKmh=v=>v==null?'—':num(v,1)+' km/h';
const fmtSec=s=>s==null?'—':fmtClock(s);
const RUN_SRC=r=>r.sid?'Strava':'notat manual';
/* despărțirile unei alergări (din Strava, din cronometru sau introduse): [{d:metri, t:secunde, hr}] — doar cele măsurate */
function runSplits(r){ return Array.isArray(r.spl)?r.spl.filter(s=>s&&+s.d>0&&+s.t>0):[]; }
/* cel mai rapid km dintr-o alergare: doar despărțiri de cel puțin 990 m (ultima, mai scurtă, nu contează) */
function fastestKm(r){ let b=null; runSplits(r).forEach((s,i)=>{ if(s.d>=990&&s.d<=1010){ const t=s.t*1000/s.d; if(!b||t<b.t) b={t,i}; } }); return b; }

/* ---------- 1 km: doar rezultate măsurate ---------- */
/* surse: testul de 1 km, o alergare de ~1 km, efortul „1K" calculat de Strava, cel mai rapid km dintr-o alergare cu despărțiri */
function k1Results(){
  const out=[];
  (S.ptests||[]).forEach(t=>{ if(t.type==='k1'&&+t.value>0) out.push({date:t.date,sec:+t.value,src:'test',lbl:'test de 1 km'}); });
  (S.runs||[]).forEach((r,i)=>{
    if(+r.km>=.98&&+r.km<=1.05&&+r.min>0) out.push({date:r.date,sec:Math.round(r.min*60/ r.km),src:'run',lbl:'alergare de '+num(r.km,2)+' km',i});
    if(r.be&&+r.be['1k']>0) out.push({date:r.date,sec:+r.be['1k'],src:'be',lbl:'cel mai bun 1 km din alergare (Strava)',i});
    else { const f=fastestKm(r); if(f) out.push({date:r.date,sec:Math.round(f.t),src:'split',lbl:'km '+(f.i+1)+' dintr-o alergare de '+num(r.km,1)+' km',i}); }
  });
  return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.sec-b.sec);
}
function k1Best(before){ let b=null; k1Results().forEach(x=>{ if(before&&x.date>=before) return; if(!b||x.sec<b.sec) b=x; }); return b; }

/* ---------- recorduri (PR) pe toate categoriile ---------- */
const PR_CAT={e1:'1RM estimat',w:'Greutate',rep:'Repetări',vol:'Volum',dist:'Distanță',pace:'Ritm',spd:'Viteză',time:'Timp',cond:'Conditioning',test:'Test'};
const PR_DIST=[[1,'1 km','1k'],[5,'5 km','5k'],[10,'10 km','10k'],[21.0975,'Semimaraton','hm'],[42.195,'Maraton','m']];
/* recordurile curente și istoricul îmbunătățirilor, calculate o dată pe versiunea datelor */
function prBook(){
  const X=IX(); if(X.pr) return X.pr;
  const cur={}, ev=[], put=(key,o)=>{ const p=cur[key]; o.key=key;
    if(!p){ cur[key]=o; return; } const better=o.low?o.v<p.v-1e-9:o.v>p.v+1e-9; if(better){ ev.push(Object.assign({},o,{prev:p.v,prevD:p.d})); cur[key]=o; } };
  /* forță: pe exercițiu, în ordine cronologică */
  Object.keys(S.lifts||{}).forEach(n=>{ const repAt={};
    liftHist(n).forEach(e=>{ if(!e||!e.s||!e.s.length) return; let e1=0, wMax=0, vol=0, best=null;
      e.s.forEach(s=>{ const w=+s[0]||0, r=+s[1]||0; vol+=w*r; if(w>wMax) wMax=w; const v=e1rm(w,r); if(v>e1){ e1=v; best=[w,r]; } });
      if(e1>0) put('e1|'+n,{cat:'e1',ex:n,v:e1,d:e.d,unit:'kg',txt:num(best[0])+' kg × '+best[1]});
      if(wMax>0) put('w|'+n,{cat:'w',ex:n,v:wMax,d:e.d,unit:'kg'});
      if(vol>0) put('vol|'+n,{cat:'vol',ex:n,v:Math.round(vol),d:e.d,unit:'kg'});
      /* record de repetări: mai multe repetări decât oricând la o greutate cel puțin la fel de mare */
      e.s.forEach(s=>{ const w=+s[0]||0, r=+s[1]||0; if(r<=0) return; const prev=Math.max(0,...Object.keys(repAt).filter(x=>+x>=w).map(x=>repAt[x]));
        if(prev>0&&r>prev) ev.push({cat:'rep',ex:n,v:r,prev,d:e.d,unit:'rep.',txt:num(w)+' kg',key:'rep|'+n+'|'+w}); });
      e.s.forEach(s=>{ const w=+s[0]||0, r=+s[1]||0; if(r>0) repAt[w]=Math.max(repAt[w]||0,r); });
    });
    const rk=Object.keys(repAt); if(rk.length){ const top=Math.max(...rk.map(Number)); cur['rep|'+n]={cat:'rep',ex:n,v:repAt[top],d:null,unit:'rep.',txt:num(top)+' kg',key:'rep|'+n}; }
  });
  /* alergare */
  const runs=(S.runs||[]).map((r,i)=>Object.assign({i},r)).filter(r=>+r.km>0).sort((a,b)=>a.date<b.date?-1:1);
  runs.forEach(r=>{ put('dist',{cat:'dist',v:+r.km,d:r.date,unit:'km',ri:r.i});
    if(+r.km>=1&&+r.min>0) put('pace',{cat:'pace',v:r.min/r.km,d:r.date,low:true,unit:'/km',ri:r.i,txt:num(r.km,1)+' km'});
    if(+r.maxSpd>0) put('spd',{cat:'spd',v:+r.maxSpd*3.6,d:r.date,unit:'km/h',ri:r.i,txt:'viteză maximă (Strava)'});
    PR_DIST.forEach(([D,l,k])=>{ let t=null, how='';
      if(r.be&&+r.be[k]>0){ t=+r.be[k]; how='efort Strava'; }
      else if(+r.km>=D*.98&&+r.km<=D*1.03&&+r.min>0){ t=r.min*60; how='alergare de '+num(r.km,2)+' km'; }
      if(t) put('time|'+k,{cat:'time',dist:l,v:t,d:r.date,low:true,unit:'',ri:r.i,txt:how}); }); });
  /* teste de 1 km fără alergare asociată */
  (S.ptests||[]).filter(t=>t.type==='k1'&&+t.value>0).sort((a,b)=>a.date<b.date?-1:1).forEach(t=>put('time|1k',{cat:'time',dist:'1 km',v:+t.value,d:t.date,low:true,unit:'',txt:'test de 1 km'}));
  /* conditioning din cronometru */
  (S.tmlog||[]).slice().sort((a,b)=>a.date<b.date?-1:1).forEach(t=>{
    if(t.kind==='amrap'&&+t.rounds>0) put('amrap',{cat:'cond',lbl:'AMRAP 10 min',v:+t.rounds,d:t.date,unit:'runde'});
    if(t.kind==='engine'&&t.laps&&t.laps.length>=8) put('engine',{cat:'cond',lbl:'Engine Builder (runda medie)',v:avgOf(t.laps),d:t.date,low:true,unit:''}); });
  /* teste fizice */
  (S.ptests||[]).slice().sort((a,b)=>a.date<b.date?-1:1).forEach(t=>{ if(t.type==='hang') put('hang',{cat:'test',lbl:'Dead hang',v:+t.value,d:t.date,unit:'s'});
    if(t.type==='broad') put('broad',{cat:'test',lbl:'Săritură în lungime',v:+t.value,d:t.date,unit:'cm'});
    if(t.type==='reach') put('reach',{cat:'test',lbl:'Sit and reach',v:+t.value,d:t.date,unit:'cm'}); });
  ev.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0);
  X.pr={cur,ev}; return X.pr;
}
/* textul unui record */
function prVal(p){ if(!p) return '—';
  if(p.cat==='pace') return mmss(p.v)+' /km'; if(p.cat==='time') return fmtClock(p.v); if(p.cat==='dist') return num(p.v,2)+' km'; if(p.cat==='spd') return num(p.v,1)+' km/h';
  if(p.key==='engine') return fmtClock(p.v); return num(p.v,p.cat==='test'?1:p.unit==='kg'?1:0)+(p.unit&&p.unit!=='/km'?' '+p.unit:''); }
function prName(p){ if(p.ex) return p.ex+' · '+PR_CAT[p.cat]; if(p.cat==='time') return p.dist+' · timp'; if(p.cat==='dist') return 'Cea mai lungă alergare';
  if(p.cat==='pace') return 'Cel mai rapid ritm mediu (≥ 1 km)'; if(p.cat==='spd') return 'Viteză maximă'; return p.lbl||PR_CAT[p.cat]; }

/* ---------- antrenamente: istoric unificat (sesiuni ghidate, zile cu serii, alergări) ---------- */
function workoutsAll(){
  const X=IX(); if(X.wo) return X.wo; const out=[];
  (S.hist||[]).forEach((h,i)=>out.push({kind:'ses',date:h.date,t:h.t||'Antrenament',h,hi:i}));
  X.days.forEach(d=>{ const o=X.day[d]; if(o.sets&&!o.hist.length) out.push({kind:'lift',date:d,t:'Serii notate',sets:o.sets,vol:o.vol,ex:Object.keys(o.ex)}); });
  out.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.h&&b.h.end||0)-(a.h&&a.h.end||0));
  X.wo=out; return out;
}
const trainDays=()=>IX().days.filter(d=>{ const o=IX().day[d]; return o.sets||o.runs.length||o.hist.length||o.tm.length||o.ext.length; });

/* ---------- insights: afirmații din datele tale, fiecare cu datele din care rezultă ---------- */
const sumOf=xs=>xs.reduce((a,b)=>a+b,0);
function insightsAll(){
  const X=IX(); if(X.ins) return X.ins; const tk=todayKey(), out=[];
  const win=(k,len)=>({a:dayShift(tk,-(k+1)*len+1),b:dayShift(tk,-k*len)});
  const add=(o)=>out.push(Object.assign({pri:50,tone:'info',icon:'bulb'},o));
  /* 1. volumul de forță din ultimele 7 zile față de media celor 4 săptămâni dinainte */
  { const w=[0,1,2,3,4].map(k=>{ const r=win(k,7); return Object.assign(r,{v:ixSum(r.a,r.b).vol}); }), prev=w.slice(1), act=prev.filter(x=>x.v>0);
    if(w[0].v>0&&act.length>=3){ const av=avgOf(act.map(x=>x.v)), c=pctCh(w[0].v,av);
      if(c!=null&&Math.abs(c)>=5) add({id:'vol7',icon:'dumbbell',tone:c>0?'up':'down',pri:80,link:['prog','s'],
        txt:`Volumul de forță din ultimele 7 zile (<b>${num(w[0].v/1000,1)} t</b>) e cu <b>${num(Math.abs(c),0)}% ${c>0?'mai mare':'mai mic'}</b> decât media celor ${act.length} săptămâni dinainte (${num(av/1000,1)} t).`,
        ev:w.map((x,i)=>[i?'acum '+i+' săpt. ('+fmtDay(x.a)+' – '+fmtDay(x.b)+')':'ultimele 7 zile',x.v?num(x.v/1000,2)+' t':'—']),src:'tonaj = kg × repetări, toate seriile notate'}); } }
  /* 2. kilometri */
  { const w=[0,1,2,3,4].map(k=>{ const r=win(k,7); return Object.assign(r,{v:ixSum(r.a,r.b).km}); }), act=w.slice(1).filter(x=>x.v>0);
    if(w[0].v>0&&act.length>=3){ const av=avgOf(act.map(x=>x.v)), c=pctCh(w[0].v,av);
      if(c!=null&&Math.abs(c)>=8) add({id:'km7',icon:'run',tone:c>0?'up':'down',pri:75,link:['prog','r'],
        txt:`Ai alergat <b>${num(w[0].v,1)} km</b> în ultimele 7 zile, cu <b>${num(Math.abs(c),0)}% ${c>0?'mai mult':'mai puțin'}</b> decât media săptămânilor dinainte (${num(av,1)} km).`,
        ev:w.map((x,i)=>[i?'acum '+i+' săpt.':'ultimele 7 zile',num(x.v,1)+' km'])}); } }
  /* 3. zile active în ultimele 14 zile */
  { const r=win(0,14), o=ixSum(r.a,r.b); if(o.days>0) add({id:'act14',icon:'flame',pri:40,link:['act'],
      txt:`Ai avut <b>${o.days} ${o.days===1?'zi activă':'zile active'}</b> în ultimele 14 zile${o.lift||o.run?' ('+[o.lift?o.lift+' cu forță':'',o.run?o.run+' cu alergare':''].filter(Boolean).join(', ')+')':''}.`,
      ev:[['zile cu forță',o.lift],['zile cu alergare',o.run],['serii',o.sets],['kilometri',num(o.km,1)]]}); }
  /* 4. cel mai bun 1 km */
  { const b=k1Best(); if(b){ const g=goalsAll().find(g=>g.k==='k1'); add({id:'k1',icon:'stopwatch',pri:70,link:['prog','k1'],
      txt:`Cel mai bun rezultat la 1 km: <b>${fmtClock(b.sec)}</b> (${esc(b.lbl)}, ${fmtDay(b.date)})${g?` · ținta ta: ${fmtClock(g.t)}, mai ai <b>${b.sec>g.t?fmtClock(b.sec-g.t):'0:00'}</b>`:''}.`,
      ev:k1Results().slice(-6).reverse().map(x=>[fmtDay(x.date)+' · '+x.lbl,fmtClock(x.sec)])}); } }
  /* 5. progres pe exerciții: cel mai bun 1RM estimat din ultimele 28 de zile față de cele 28 dinainte */
  { const a1=dayShift(tk,-27), a0=dayShift(tk,-55), rows=[];
    Object.keys(S.lifts||{}).forEach(n=>{ let now=0, then=0; liftHist(n).forEach(e=>{ const v=Math.max(0,...e.s.map(([w,r])=>e1rm(w,r))); if(e.d>=a1) now=Math.max(now,v); else if(e.d>=a0) then=Math.max(then,v); });
      if(now>0&&then>0) rows.push({n,now,then,c:pctCh(now,then)}); });
    rows.sort((a,b)=>Math.abs(b.c)-Math.abs(a.c)).slice(0,2).forEach(r=>{ if(Math.abs(r.c)<1) return;
      add({id:'ex:'+r.n,icon:'chart',tone:r.c>0?'up':'down',pri:65,link:['ex',r.n],
        txt:`La <b>${esc(r.n)}</b>, 1RM estimat ${r.c>0?'a crescut':'a scăzut'} cu <b>${num(Math.abs(r.c),1)}%</b> (${r.then} → ${r.now} kg) față de luna anterioară.`,
        ev:[['cel mai bun, zilele 29–56 în urmă',r.then+' kg'],['cel mai bun, ultimele 28 de zile',r.now+' kg']],src:'1RM estimat cu formula Epley din cea mai bună serie'}); }); }
  /* 6. tendință descendentă: ultimele 3 sesiuni la un exercițiu, fiecare mai slabă decât precedenta */
  { Object.keys(S.lifts||{}).forEach(n=>{ const ses=liftHist(n).map(e=>({d:e.d,v:Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))})).filter(x=>x.v>0); if(ses.length<4) return;
      const l=ses.slice(-3); if(l[2].d<dayShift(tk,-21)) return; if(l[0].v>l[1].v&&l[1].v>l[2].v&&(l[0].v-l[2].v)/l[0].v>=.03)
        add({id:'down:'+n,icon:'alert',tone:'down',pri:72,link:['ex',n],txt:`Ultimele 3 sesiuni la <b>${esc(n)}</b> au avut o tendință descendentă: ${l.map(x=>x.v).join(' → ')} kg (1RM estimat).`,
          ev:l.map(x=>[fmtDay(x.d),x.v+' kg']),src:'o scădere poate veni din oboseală, somn sau o zi mai grea; verifică Recuperarea'}); }); }
  /* 7. stagnare */
  { Object.keys(S.lifts||{}).map(liftTrend).filter(t=>t&&t.st==='flat'&&t.last>=dayShift(tk,-21)).slice(0,2).forEach(t=>add({id:'flat:'+t.n,icon:'minus',tone:'down',pri:55,link:['ex',t.n],
      txt:`<b>${esc(t.n)}</b> stă pe loc: niciun 1RM estimat nou în ultimele 3 sesiuni (record ${t.best} kg).`,ev:[['sesiuni',t.ses],['ultimul 1RM estimat',t.cur+' kg'],['record',t.best+' kg']]})); }
  /* 8. greutatea */
  { const ws=wStats(), a=wList(), l7=a.filter(x=>x.d>dayShift(tk,-7)), p7=a.filter(x=>x.d<=dayShift(tk,-7)&&x.d>dayShift(tk,-14));
    if(ws&&ws.wk!=null&&l7.length>=3&&p7.length>=3&&Math.abs(ws.wk)>=.1) add({id:'wt',icon:'scale',tone:'info',pri:60,link:['prog','b'],
      txt:`Media greutății pe 7 zile ${ws.wk<0?'a scăzut':'a crescut'} cu <b>${num(Math.abs(ws.wk),1)} kg</b> față de săptămâna dinainte (acum ${num(ws.a7,1)} kg).`,
      ev:[['media ultimelor 7 zile ('+l7.length+' cântăriri)',num(avgOf(l7.map(x=>x.w)),1)+' kg'],['media celor 7 dinainte ('+p7.length+' cântăriri)',num(avgOf(p7.map(x=>x.w)),1)+' kg']]}); }
  /* 9. somnul */
  { const sl=k=>+jOf(k).sleep||0, l=[], b=[]; for(let i=0;i<7;i++){ const v=sl(dayShift(tk,-i)); if(v>0) l.push(v); } for(let i=7;i<35;i++){ const v=sl(dayShift(tk,-i)); if(v>0) b.push(v); }
    if(l.length>=5&&b.length>=7){ const d=avgOf(l)-avgOf(b); if(Math.abs(d)>=.4) add({id:'sleep',icon:'moon',tone:d>0?'up':'down',pri:58,link:['prog','rec'],
      txt:`Ai dormit în medie <b>${num(avgOf(l),1)} h</b> în ultimele ${l.length} nopți notate, ${num(Math.abs(d),1)} h ${d>0?'mai mult':'mai puțin'} decât media ta (${num(avgOf(b),1)} h).`,
      ev:[['ultimele 7 zile',l.length+' nopți · '+num(avgOf(l),1)+' h'],['cele 4 săptămâni dinainte',b.length+' nopți · '+num(avgOf(b),1)+' h']]}); } }
  /* 10. recorduri în ultimele 30 de zile */
  { const ev=prBook().ev.filter(p=>p.d>=dayShift(tk,-29)&&p.cat!=='rep'); if(ev.length) add({id:'pr30',icon:'trophy',tone:'up',pri:68,link:['prog','pr'],
      txt:`<b>${ev.length} ${ev.length===1?'record nou':'recorduri noi'}</b> în ultimele 30 de zile${ev[0]?', cel mai recent: '+esc(prName(ev[0]))+' '+prVal(ev[0]):''}.`,
      ev:ev.slice(0,6).map(p=>[fmtDay(p.d)+' · '+prName(p),prVal(p)])}); }
  /* 11. seria de săptămâni active */
  { const st=streakWeeks(); if(st>=2) add({id:'streak',icon:'flame',tone:'up',pri:35,link:['act'],txt:`Ești la <b>${st} săptămâni la rând</b> cu cel puțin 3 zile active.`}); }
  out.sort((a,b)=>b.pri-a.pri); X.ins=out; return out;
}

/* ---------- realizări (discrete) ---------- */
function achAll(){
  const X=IX(); if(X.ach) return X.ach;
  const days=trainDays(), runs=(S.runs||[]).slice().sort((a,b)=>a.date<b.date?-1:1), k1=k1Results(), prs=prBook().ev.slice().reverse();
  const nth=(arr,n)=>arr.length>=n?arr[n-1]:null;
  let tonD=null, ton=0; IX().days.forEach(d=>{ const before=ton; ton+=IX().day[d].vol; X._t=X._t||{}; [10000,100000,1000000].forEach(t=>{ if(before<t&&ton>=t) X._t[t]=d; }); });
  let kmAcc=0; const kmD={}; runs.forEach(r=>{ const b=kmAcc; kmAcc+=+r.km||0; [100,500,1000].forEach(t=>{ if(b<t&&kmAcc>=t) kmD[t]=r.date; }); });
  const firstRunAtLeast=D=>{ const r=runs.find(r=>+r.km>=D); return r?r.date:null; };
  const k1Under=s=>{ const r=k1.find(x=>x.sec<s); return r?r.date:null; };
  const A=[
    ['first','Primul antrenament','Primul antrenament notat în FALCO',days[0]||null,null],
    ['w10','10 antrenamente','10 zile de antrenament notate',nth(days,10),[days.length,10]],
    ['w50','50 de antrenamente','50 de zile de antrenament notate',nth(days,50),[days.length,50]],
    ['w100','100 de antrenamente','100 de zile de antrenament notate',nth(days,100),[days.length,100]],
    ['w250','250 de antrenamente','250 de zile de antrenament notate',nth(days,250),[days.length,250]],
    ['pr1','Primul record','Primul record personal',prs[0]?prs[0].d:null,null],
    ['k1','Primul 1 km','Primul rezultat măsurat pe 1 km',k1[0]?k1[0].date:null,null],
    ['k1_5','Sub 5:00','1 km în mai puțin de 5 minute',k1Under(300),null],
    ['k1_45','Sub 4:30','1 km în mai puțin de 4:30',k1Under(270),null],
    ['k1_4','Sub 4:00','1 km în mai puțin de 4 minute',k1Under(240),null],
    ['r5','Primii 5 km','O alergare de cel puțin 5 km',firstRunAtLeast(5),null],
    ['r10','10 km','O alergare de cel puțin 10 km',firstRunAtLeast(10),null],
    ['r21','Semimaraton','O alergare de cel puțin 21,1 km',firstRunAtLeast(21.0975),null],
    ['km100','100 km alergați','Total cumulat',kmD[100]||null,[kmAcc,100]],
    ['km500','500 km alergați','Total cumulat',kmD[500]||null,[kmAcc,500]],
    ['t10','10 tone ridicate','Tonaj cumulat (kg × repetări)',(X._t||{})[10000]||null,[ton/1000,10]],
    ['t100','100 de tone ridicate','Tonaj cumulat (kg × repetări)',(X._t||{})[100000]||null,[ton/1000,100]],
    ['st4','4 săptămâni la rând','4 săptămâni consecutive cu cel puțin 3 zile active',streakWeeks()>=4?todayKey():null,[streakWeeks(),4]],
    ['cyc','Primul ciclu complet','Toate cele 28 de zile ale unui ciclu',cycDoneAny()?(S.hist||[]).map(h=>h.date).sort().pop()||null:null,null]
  ].map(([id,t,d,date,pr])=>({id,t,d,date,done:!!date,prog:pr&&!date?clamp(pr[0]/pr[1],0,1):null,pv:pr}));
  /* data păstrată la prima deblocare (seria de săptămâni poate scădea, realizarea rămâne) */
  const seen=S.ach||{}; A.forEach(a=>{ if(seen[a.id]&&!a.done&&a.id!=='cyc'){ a.done=true; a.date=seen[a.id]; a.prog=null; } else if(seen[a.id]&&a.done&&seen[a.id]<a.date) a.date=seen[a.id]; });
  X.ach=A; return A;
}
