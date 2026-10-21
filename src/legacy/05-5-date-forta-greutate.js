/* =====================================================================
   5 · DATE — forță, greutate, alergare, nutriție, apă, măsurători
   ===================================================================== */
const e1rm=(w,r)=>w>0&&r>0?Math.round(w*(1+r/30)):0;
const liftHist=n=>(S.lifts||{})[n]||[];
/* o serie = [kg, repetări] sau [kg, repetări, tip]; tipul e text: 'd' = drop set, 'rp' = rest-pause, 'a' = AMRAP */
const SET_TAG={d:'drop',rp:'rest-pause',a:'AMRAP',ma:'myo · activare',mm:'myo'};
const fmtSet=s=>num(s[0])+'×'+s[1]+(typeof s[2]==='string'&&SET_TAG[s[2]]?' '+SET_TAG[s[2]]:'');
function bestE1(n,before){ let b=0; liftHist(n).forEach(e=>{ if(before&&e.d>=before) return; e.s.forEach(([w,r])=>{ const v=e1rm(w,r); if(v>b) b=v; }); }); return b; }
function lastSession(n,before){ const h=liftHist(n); for(let i=h.length-1;i>=0;i--) if(!before||h[i].d<before) return h[i]; return null; }
/* tot istoricul rămâne (până în v7 se păstrau doar ultimele 80 de sesiuni pe exercițiu) */
async function addSet(n,w,r,tag){
  const L=Object.assign({},S.lifts), h=(L[n]||[]).slice(), tk=todayKey(), cur=h[h.length-1], set=tag&&SET_TAG[tag]?[w,r,tag]:[w,r];
  if(cur&&cur.d===tk) h[h.length-1]=Object.assign({},cur,{s:cur.s.concat([set])}); else h.push({d:tk,s:[set]});
  L[n]=h; await save('lifts',L);
}
async function removeSet(n,w,r){
  const L=Object.assign({},S.lifts), h=(L[n]||[]).slice(), tk=todayKey(), cur=h[h.length-1];
  if(!cur||cur.d!==tk) return;
  const s=cur.s.slice(); for(let i=s.length-1;i>=0;i--) if(s[i][0]===w&&s[i][1]===r){ s.splice(i,1); break; }
  if(s.length) h[h.length-1]=Object.assign({},cur,{s}); else h.pop();
  if(h.length) L[n]=h; else delete L[n];
  await save('lifts',L);
}
/* intervalele de repetări pe care același exercițiu le are în alte zile ale planului */
function otherRanges(n,lo,hi){ const out=[]; PLAN.forEach(p=>p.ex.forEach(([nm,pr])=>{ if(nm!==n) return; const m=/^(\d+)×(\d+)(?:–(\d+))?/.exec(pr);
  if(m){ const a=+m[2], b=+(m[3]||m[2]); if(a!==lo||b!==hi) out.push([a,b]); } })); return out; }
function incFor(n){ return /Leg Press|Hack Squat|Hip Thrust|Romanian Deadlift/.test(n)?5
  :/Dumbbell|Lateral Raise|Curl|Extension|Pushdown|Face Pull|Calf|Hamstring|Lunge|Fly|Deck|Crusher|Shrug|Abduction|Crunch|Split Squat/.test(n)?2:2.5; }
/* dublă progresie, cu starea de azi luată în calcul */
/* recomandarea, cu ajustarea acceptată azi aplicată peste ea (fără creșteri / procent din greutate) */
function suggest(e){
  const sg=suggestBase(e); if(!(e.noUp||e.loadF)||sg.kg==null) return sg;
  const prev=lastSession(e.n,todayKey()), top=prev&&prev.s.length?Math.max(...prev.s.map(s=>s[0])):null, inc=incFor(e.n);
  if(e.noUp&&sg.kind==='up'&&top!=null){ sg.kg=top; sg.kind='same'; sg.reps=Math.min(e.hi,Math.max(...prev.s.filter(s=>s[0]===top).map(s=>s[1]))); sg.txt='Ajustarea de azi: <b>fără creșteri</b> → rămâi la '+num(top)+' kg, cu repetări curate.'; }
  if(e.loadF&&e.loadF!==1&&sg.kg>0){ const kg=Math.max(inc,Math.round(sg.kg*e.loadF/inc)*inc); if(kg!==sg.kg){ sg.txt+=' <b>Ajustat azi: '+num(kg)+' kg</b> ('+(e.loadF<1?'−':'+')+Math.round(Math.abs(1-e.loadF)*100)+'% din '+num(sg.kg)+').'; sg.kg=kg; sg.kind='same'; } }
  return sg;
}
function suggestBase(e){
  const prev=lastSession(e.n,todayKey()), tired=S.sess&&S.sess.ready&&S.sess.ready.score<45;
  if(!prev||!prev.s.length) return {kg:null,reps:e.lo,kind:'new',
    txt:'Prima sesiune cu acest exercițiu: alege o greutate cu care faci <b>'+e.lo+'–'+e.hi+' repetări</b> curate, cu tehnică bună, fără să ajungi la eșec.'};
  const top=Math.max(...prev.s.map(s=>s[0])), atTop=prev.s.filter(s=>s[0]===top), bestR=Math.max(...atTop.map(s=>s[1]));
  const last=prev.s.map(fmtSet).join(' · '), bw=top===0;
  if(atTop.length>=e.sets&&atTop.every(s=>s[1]>=e.hi)){
    if(bw&&BW_PROG[e.n]) return {kg:0,reps:e.lo,kind:'up',last,d:prev.d,txt:'Ai atins <b>'+e.hi+' repetări</b> la toate seriile → <b>'+BW_PROG[e.n]+'</b> și începe iar de la '+e.lo+'.'};
    if(tired) return {kg:top,reps:e.hi,kind:'same',last,d:prev.d,txt:'Ai fi meritat să urci, dar azi ești obosit → <b>rămâi la '+num(top)+' kg</b> și ține forma.'};
    const kg=top+incFor(e.n);
    return {kg,reps:e.lo,kind:'up',last,d:prev.d,txt:'Ai atins <b>'+e.hi+' repetări</b> la toate seriile → <b>urcă la '+num(kg)+' kg</b> și începe iar de la '+e.lo+'.'}; }
  /* altă schemă de repetări data trecută (ex. Bench Press: luni 6–8, vineri 3–5): greutatea se estimează din 1RM,
     pentru o repetare peste capătul de sus al intervalului, ca să rămână o marjă */
  const minR=Math.min(...atTop.map(s=>s[1])), e1=Math.max(...prev.s.map(([w,r])=>e1rm(w,r))), inc=incFor(e.n);
  const other=otherRanges(e.n,e.lo,e.hi).some(([a,b])=>minR>=a-1&&bestR<=b+1);
  if(!bw&&e1>0&&other&&(minR>e.hi||bestR<e.lo)){
    let kg=Math.max(inc,Math.floor(e1/(1+(e.hi+1)/30)/inc)*inc); if(tired) kg=Math.max(inc,kg-inc);
    return {kg,reps:e.lo,kind:kg>top?'up':'same',last,d:prev.d,
      txt:'Data trecută a fost altă schemă ('+num(top)+' kg × '+(minR===bestR?bestR:minR+'–'+bestR)+'). Pentru '+e.lo+'–'+e.hi+' repetări pornește de la <b>~'+num(kg)+' kg</b> (estimat din 1RM '+e1+' kg).'}; }
  if(bestR<e.lo) return {kg:top,reps:e.lo,kind:'hold',last,d:prev.d,
    txt:'Data trecută ai rămas sub '+e.lo+' repetări → <b>'+(bw?'greutatea corpului':'rămâi la '+num(top)+' kg')+'</b>, cu pauza completă.'};
  return {kg:top,reps:Math.min(e.hi,bestR+(tired?0:1)),kind:'same',last,d:prev.d,
    txt:'<b>'+(bw?'Greutatea corpului':'Rămâi la '+num(top)+' kg')+'</b> și țintește '+(tired?'aceleași repetări (zi grea)':'<b>+1 repetare</b> pe serie (până la '+e.hi+')')+'.'};
}
function prEvents(){
  const ev=[]; Object.keys(S.lifts||{}).forEach(n=>{ let best=0;
    (S.lifts[n]||[]).forEach(e=>{ const b=Math.max(0,...e.s.map(([w,r])=>e1rm(w,r))); if(b>best&&best>0) ev.push({n,d:e.d,b,prev:best}); if(b>best) best=b; }); });
  return ev.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:b.b-a.b);
}
/* lista cântăririlor, sortată; ținută în memorie până la următoarea salvare sau randare (WLC) */
let WLC=null;
function wl0(){ const w=S.weights||{}; if(!WLC||WLC.src!==w) WLC={src:w,a:Object.keys(w).sort().map(d=>({d,w:+w[d]})).filter(x=>x.w>0)}; return WLC.a; }
function wList(){ return wl0().slice(); }
function wStats(){
  const a=wList(); if(!a.length) return null;
  const last=a[a.length-1], anchor=last.d, avg=arr=>arr.reduce((s,x)=>s+x.w,0)/arr.length;
  const l7=a.filter(x=>x.d>dayShift(anchor,-7)), p7=a.filter(x=>x.d<=dayShift(anchor,-7)&&x.d>dayShift(anchor,-14));
  return {last,a7:avg(l7),wk:p7.length?avg(l7)-avg(p7):null,n:a.length};
}
/* media pe 7 zile la fiecare cântărire: fereastră care alunecă pe lista sortată (liniar, nu pătratic) */
function wMA(a){
  for(let i=1;i<a.length;i++) if(!(a[i].d>a[i-1].d)) return a.map(p=>{ const c=dayShift(p.d,-7), win=a.filter(x=>x.d<=p.d&&x.d>c); return {x:p.d,y:win.reduce((s,x)=>s+x.w,0)/win.length}; });
  const out=new Array(a.length); let lo=0;
  for(let i=0;i<a.length;i++){ const c=dayShift(a[i].d,-7); while(a[lo].d<=c) lo++; let s=0; for(let j=lo;j<=i;j++) s+=a[j].w; out[i]={x:a[i].d,y:s/(i-lo+1)}; }
  return out;
}
const paceOf=r=>(+r.km>0&&+r.min>0)?r.min/r.km:null;
const fmtPace=p=>p==null?'—':mmss(p)+' /km';
const runsIn=(a,b)=>(S.runs||[]).filter(r=>r.date>=a&&r.date<=b);
const sumKm=rs=>rs.reduce((a,r)=>a+(+r.km||0),0);
let ACTC=null;
function activity(){
  if(ACTC) return ACTC;
  const L=new Set(), R=new Set();
  Object.values(S.lifts||{}).forEach(h=>h.forEach(e=>L.add(e.d)));
  (S.hist||[]).forEach(h=>L.add(h.date));
  (S.runs||[]).forEach(r=>R.add(r.date));
  (S.ext||[]).forEach(x=>{ if(!x.dup&&ST_STR.indexOf(x.type)>=0) L.add(x.date); });
  ACTC={L,R}; return ACTC;
}
const mlogDay=k=>((S.mlog||{})[k])||[];
const dayTotals=k=>mlogDay(k).reduce((a,m)=>({k:a.k+(+m.k||0),p:a.p+(+m.p||0),c:a.c+(+m.c||0),g:a.g+(+m.g||0)}),{k:0,p:0,c:0,g:0});
/* ---------- nutriție: obiectivul, metabolism, necesar măsurat, faze, ținte ---------- */
const EQS=[['mifflin','Mifflin-St Jeor','greutate'],['harris','Harris-Benedict','greutate'],['cunningham','Cunningham','masă slabă'],['katch','Katch-McArdle','masă slabă']];
/* v17: procentul de grăsime: cel setat, altfel ultima estimare US Navy din măsurători, altfel din IMC (Deurenberg).
   Înainte era 18% fix: la o greutate mare masa slabă ieșea mult prea mare și pragul de disponibilitate energetică urca ținta. */
function bfOf(w){ const P=prof(); if(+P.bf) return clamp(+P.bf,3,60);
  const nv=bList().map(x=>navyBF(x,P)).filter(v=>v!=null&&isFinite(v)).pop(); if(nv!=null) return clamp(nv,3,60);
  const bmi=w/Math.pow((+P.h||180)/100,2); return clamp(Math.round(1.2*bmi+.23*(+P.age||30)-(P.sex==='f'?5.4:16.2)),8,50); }
function bmrAll(w){ const P=prof(), f=P.sex==='f', F=w*(1-bfOf(w)/100);
  return {ffm:F,mifflin:Math.round(10*w+6.25*P.h-5*P.age+(f?-161:5)),harris:Math.round(f?447.593+9.247*w+3.098*P.h-4.33*P.age:88.362+13.397*w+4.799*P.h-5.677*P.age),
    cunningham:Math.round(500+22*F),katch:Math.round(370+21.6*F)}; }
/* obiectivul, după Layne Norton: cut 0,5% din greutate pe săptămână (0,4–0,8%, niciodată peste 1%); recompoziție −0,25% pe săptămână
   (menținere sau deficit mic); lean bulk cu creșteri mici. Deficitul (sau surplusul) implicit vine din ritm, la 7700 kcal/kg. */
/* v19–v23: nutriția urmează STRICT Layne Norton (canalele lui de YouTube, Fat Loss Forever, Contest Prep Guide). Proteina pe MASA SLABĂ:
   ~2,4 g/kg optim; în deficit +10–20% (aici +10%, capătul de jos, ca să rămână carbohidrați pentru alergare); +1,5% pe an după 30 de ani;
   plafon ~3,1 g/kg masă slabă (sigur până la 3,5). La anduranță: +5 g pe oră de efort intens. */
const GOALS={cut:{l:'Cut',rate:-.005,pl:2.64},recomp:{l:'Recompoziție',rate:-.0025,pl:2.52},bulk:{l:'Lean bulk',rate:.00175,pl:2.4}};
const protAgeF=()=>1+.015*Math.max(0,(+prof().age||30)-30);
const protPL=g=>Math.round(Math.min(3.1,GOALS[g].pl*protAgeF())*100)/100;
const refKg=(w,ffm)=>Math.min(w,ffm/.85);
const goalMode=()=>GOALS[prof().goalMode]?prof().goalMode:'cut';
const autoDef=w=>Math.round(-w*GOALS[goalMode()].rate*7700/7/50)*50;
/* energia cheltuită la antrenamentul zilei d din săptămâna w, kcal (MET net × 3,5 × kg / 200 pe minut) + activitățile notate în ziua k */
const NET_MET={ez1:6,ez2:6,thr:8.5,lng:6.5};
function exKcalOf(w,d,k,kg){ const b=PLAN[d]; let m=0;
  if(b.run) m+=runTotal(b.run,w)*NET_MET[b.run];
  (b.lift||[]).forEach(([t,x])=>{ m+=x*(t==='hard'?7:3.5); });
  if(b.cat==='rest') m+=b.min*2;
  if(deloadOn(w)) m*=.6;
  (S.ext||[]).filter(x=>x.date===k&&!x.dup).forEach(x=>{ m+=(+x.min||0)*((+x.rpe||0)>=7?8:5); });
  return Math.round(m*.0175*kg); }
/* pauzele de dietă din programul original: săptămânile 1–2 ale ciclului în deficit, 3–4 la menținere */
function nPhase(){ const g=goalMode();
  if(g==='bulk') return {cut:false,goal:g,label:'Lean bulk',sub:'surplus mic, ~0,25% din greutate pe săptămână'};
  if(g==='recomp') return {cut:false,goal:g,label:'Recompoziție',sub:'deficit mic, proteină mare'};
  if(prof().dietBreak===false) return {cut:true,goal:g,label:'Cut',sub:'deficit continuu'};
  /* v23 (Norton, pauzele de dietă): frecvența după cât de slab ești — slab 1:1 (2 săptămâni deficit, 2 la menținere), normal 2:1 (4 + 2),
     cu multă grăsime 1–2 săptămâni la 1–2 luni (6 + 2). Săptămânile se numără din calendar, de la începutul cut-ului (prof.dbStart). */
  const D=dietBreakPlan(), P=prof(), st=P.dbStart||mondayOf(todayKey()), gw=Math.max(0,Math.floor(daysBetween(st,mondayOf(todayKey()))/7)), i=gw%(D.c+D.b);
  return i<D.c?{cut:true,goal:g,label:'Cut',sub:'săptămâna '+(i+1)+' din '+D.c+' de deficit'}:{cut:false,goal:g,brk:true,label:'Pauză de dietă',sub:'săptămâna '+(i-D.c+1)+' din '+D.b+' la menținere'}; }
function dietBreakPlan(){ const ws=wStats(), w=ws?ws.a7:+prof().startW||80, bf=bfOf(w), f=prof().sex==='f';
  if(bf<(f?22:12)) return {c:2,b:2,k:'lean',l:'2 săptămâni deficit, 2 la menținere (ești slab: 1:1)'};
  if(bf>=(f?35:25)) return {c:6,b:2,k:'high',l:'6 săptămâni deficit, 2 la menținere (multă grăsime de pierdut: 1–2 săptămâni la 1–2 luni)'};
  return {c:4,b:2,k:'mid',l:'4 săptămâni deficit, 2 la menținere (raport 2:1)'}; }
const dietCutWeeks=()=>dietBreakPlan().c;
/* începutul numărătorii pentru pauze: o singură dată, lunea curentă */
async function dbMigrate(){ if(prof().dbStart) return; await save('prof',Object.assign({},S.prof||{},{dbStart:mondayOf(todayKey())})); STC=null; }
/* v16: metabolismul declarat (unii oameni ard mai puțin decât spun formulele) */
const METAB=[[1,'Normal'],[.9,'Lent (−10%)'],[.82,'Foarte lent (−18%)']];
const metabF=()=>{ const v=+prof().metab; return METAB.some(m=>m[0]===v)?v:1; };
/* v17: ajustarea din cântar, pe medii săptămânale. Zilnic notez ținta de bază și necesarul folosit (zece3:nlog); o dată pe săptămână
   compar media cântăririlor din ultimele 7 zile cu media celor 7 dinainte și cu ce trebuia să se întâmple cu ce ai mâncat
   (mesele notate complet, altfel ținta). Diferența înseamnă că necesarul real e altul: îl corectez cu jumătate din ea
   (cântarul fluctuează cu apa și glicogenul), cel mult ±200 kcal pe săptămână, în total −900…+500. */
K.nlog='zece3:nlog'; S.nlog={};
const nAdj=()=>Object.assign({c:0},prof().nAdj||{});
async function nAdaptRun(){
  const P=prof(), tk=todayKey(); if(P.kcalT) return;
  const L=Object.assign({},S.nlog||{});
  if(!L[tk]){ let tg=null; try{ tg=targets(); }catch(e){} if(tg){ L[tk]={k:tg.base.kcal,t:tg.tdee}; Object.keys(L).forEach(d=>{ if(d<dayShift(tk,-60)) delete L[d]; }); await save('nlog',L); } }
  const A=nAdj(); if(A.d&&daysBetween(A.d,tk)<7) return;
  if(tdeeMeasured().ok&&P.useMeasured!==false) return;
  const W=wWeeks(tk); if(!W) return;
  const days=Object.keys(L).filter(d=>d>dayShift(tk,-14)&&d<=tk); if(days.length<7) return;
  const ate=d=>{ const t=dayTotals(d); return mlogDay(d).length>=3&&t.k>=1200?t.k:null; }, eaten=days.map(ate).filter(v=>v!=null);
  const pred=days.reduce((a,d)=>{ const e=ate(d); return a+((e!=null?e:L[d].k)-L[d].t); },0)/days.length*7/7700, err=W.rate-pred;
  let step=Math.round(-err*7700/7*.5/10)*10; step=clamp(step,-200,200); if(Math.abs(step)<30) step=0;
  const c=clamp((A.c||0)+step,-900,500), r2=v=>Math.round(v*100)/100;
  await save('prof',Object.assign({},S.prof||{},{nAdj:{c,d:tk,r:r2(W.rate),pred:r2(pred),step,n:W.n,h:(A.h||[]).concat([r2(W.rate)]).slice(-4),w0:r2(W.w0),w1:r2(W.w1),eat:eaten.length>=4?Math.round(eaten.reduce((a,x)=>a+x,0)/eaten.length):null}})); STC=null; }
/* media cântăririlor din ultimele 7 zile față de cele 7 dinainte (cel puțin 3 în fiecare), în kg pe săptămână */
function wWeeks(tk){ tk=tk||todayKey(); const a=wList(), m=dayShift(tk,-7), b1=a.filter(x=>x.d>m&&x.d<=tk), b0=a.filter(x=>x.d>dayShift(tk,-14)&&x.d<=m);
  if(b1.length<3||b0.length<3) return null;
  const avg=(b,f)=>b.reduce((s,x)=>s+f(x),0)/b.length, w1=avg(b1,x=>x.w), w0=avg(b0,x=>x.w), gap=avg(b1,x=>daysBetween(m,x.d))-avg(b0,x=>daysBetween(m,x.d));
  return {w0,w1,rate:gap>0?(w1-w0)/gap*7:w1-w0,n:b0.length+b1.length}; }
/* necesarul măsurat: aportul mediu din zilele notate complet minus energia echivalentă variației greutății (regresie pe 21 de zile) */
function tdeeMeasured(){
  const tk=todayKey(), ks=[]; for(let i=1;i<=21;i++){ const k=dayShift(tk,-i), t=dayTotals(k); if(mlogDay(k).length>=3&&t.k>=1500) ks.push(t.k); }
  const a=wList().filter(x=>x.d>=dayShift(tk,-21)&&x.d<=tk), res={ok:false,days:ks.length,weighs:a.length};
  if(ks.length<7||a.length<8) return res;
  const xs=a.map(p=>daysBetween(a[0].d,p.d)), mx=xs.reduce((s,x)=>s+x,0)/xs.length, my=a.reduce((s,p)=>s+p.w,0)/a.length;
  let cov=0,vr=0; xs.forEach((x,i)=>{ cov+=(x-mx)*(a[i].w-my); vr+=(x-mx)*(x-mx); }); if(!vr) return res;
  const slope=cov/vr, intake=ks.reduce((s,x)=>s+x,0)/ks.length, tdee=Math.round(intake-slope*7700);
  if(tdee<1500||tdee>7000) return Object.assign(res,{odd:true});
  return {ok:true,tdee,intake:Math.round(intake),perWeek:slope*7,days:ks.length,weighs:a.length};
}
/* ținta zilei k (implicit azi): baza (necesar, fază, deficit) periodizată după tipul zilei de antrenament (14c, NUTRI) */
function targets(day){
  const P=prof(), ws=wStats(), w=ws?ws.a7:P.startW, A=bmrAll(w), eq=A[P.eq]!=null?P.eq:'mifflin', bmr=A[eq], sex=P.sex==='f'?'f':'m';
  /* bazalul tău real, după metabolismul declarat: din el vin pragurile de jos, altfel formula le-ar ține prea sus */
  const bmrR=Math.round(bmr*metabF()), est=Math.round(bmr*(+P.act||1.55)*metabF()), ms=tdeeMeasured(), useM=ms.ok&&P.useMeasured!==false, adj=useM?0:nAdj().c, tdee=useM?ms.tdee:Math.max(Math.round(bmrR*1.1),est+adj), ph=nPhase();
  const k=day||todayKey(), dt=nutriDay(k), ci=nutriCi(k), ffm=w*(1-bfOf(w)/100);
  /* v17: pragurile de siguranță (deficit maxim 25%, disponibilitatea energetică) se aplică pe media săptămânii, nu pe fiecare zi:
     antrenamentul nu mai ridică ținta zilei peste deficit. Energia de la antrenament se scalează cu metabolismul și cu corecția din cântar. */
  const sc=clamp(tdee/est,.5,1), m0=mondayOf(k);
  const exWk=Math.round(Array.from({length:7},(_,i)=>{ const kk=dayShift(m0,i), x=kk===k?dt:nutriDay(kk); return exKcalOf(x.w,x.d,kk,w); }).reduce((a,x)=>a+x,0)/7*metabF()*sc);
  const def=ph.goal==='cut'?(ph.cut?(+P.def||autoDef(w)):0):autoDef(w), goal=Math.max(Math.round(bmrR*1.1/50)*50,Math.round((tdee-def)/50)*50);
  /* v23 (Norton): caloriile vin din ritm; singura limită e ritmul maxim de 1% din greutate pe săptămână (peste el, până la jumătate din kilograme
     sunt masă slabă) și pragul absolut de siguranță al aplicației. Fără pragul de 30 kcal/kg masă slabă (RED-S, nu e al lui Norton). */
  const wkFloor=def>0?Math.ceil(Math.max(COACH.KCAL_FLOOR[sex],Math.round(tdee-w*.01*7700/7))/50)*50:0;
  const auto=Math.max(goal,wkFloor), kcal=+P.kcalT||auto;
  /* proteina: g/kg masă slabă, după obiectiv (Norton) */
  const rk=refKg(w,ffm), p=+P.protT||Math.round(protPL(ph.goal)*ffm); /* v18: dietă cu puține grăsimi, la cererea utilizatorului: ~20% din calorii, cel puțin 0,6 g/kg masă slabă; restul, carbohidrați */
  let f=Math.max(Math.round(kcal*.2/9),Math.round(.5*rk)), c=Math.round((kcal-p*4-f*9)/4);
  if(c<80){ f=Math.max(Math.round(.5*ffm),Math.round((kcal-p*4-320)/9)); c=Math.max(0,Math.round((kcal-p*4-f*9)/4)); }
  const exKcal=Math.round(exKcalOf(dt.w,dt.d,k,w)*metabF()*sc);
  const per=NUTRI.periodize(Object.assign({base:{kcal,p,c,f},dayType:dt.type,sex,weightKg:w,fatMinG:Math.round(.5*rk),tdee,cut:def>0,weekMean:NUTRI_MEAN(),ffmKg:ffm,exerciseKcal:exKcal,weekly:true},ci));
  const hyd=NUTRI.hydration({weightKg:w,minutes:dt.minutes+dt.extMin,intensity:dt.intensity});
  /* Norton: la anduranță +5 g proteină pe oră de efort intens (pragul) */
  const runB=PLAN[dt.d]&&PLAN[dt.d].run==='thr'&&!P.protT?Math.round(5*(dt.minutes||50)/60):0;
  return {kcal:per.kcal,p:per.p+runB,runB,f:per.f,c:Math.max(0,per.c-runB),water:+P.waterT||hyd.totalMl,hyd,day:dt,per,base:{kcal,p,c,f},bmr,tdee,est,measured:useM,ms,auto,manual:!!P.kcalT,phase:ph,eq,def,A,autoDef:autoDef(w),exKcal,ffm:Math.round(ffm),adj,metab:metabF(),bmrR,exWk,wkFloor,raised:!P.kcalT&&wkFloor>goal,bf:Math.round(bfOf(w)),goal:ph.goal,ref:Math.round(rk),rateT:Math.round(-(P.kcalT?0:def)*7/7700*100)/100,w};
}
/* v17: ținta medie a săptămânii (luni–duminică): zilele intense primesc mai mult, cele de odihnă mai puțin, media rămâne baza */
function weekTargets(k){ const m0=mondayOf(k||todayKey()), a=Array.from({length:7},(_,i)=>{ const kk=dayShift(m0,i), t=targets(kk); return {k:kk,kcal:t.kcal,type:t.day.type}; });
  return {days:a,avg:Math.round(a.reduce((s,x)=>s+x.kcal,0)/7)}; }
const fmtG=g=>g>=1000?num(g/1000,2)+' kg':Math.round(g)+' g';
async function addMeal(m,date){ const k=date||todayKey(), ml=Object.assign({},S.mlog); ml[k]=(ml[k]||[]).concat([m]); await save('mlog',ml); }
const waterOf=k=>+((S.water||{})[k])||0;
async function addWater(ml,date){ const k=date||todayKey(), w=Object.assign({},S.water); w[k]=clamp(waterOf(k)+ml,0,15000); await save('water',w); }
function bList(){ const b=S.body||{}; return Object.keys(b).sort().map(d=>Object.assign({d},b[d])); }
const MEAS=[['waist','Talie'],['neck','Gât'],['hip','Șold'],['chest','Piept'],['arm','Braț'],['thigh','Coapsă']];
const hexA=(h,a)=>{ const n=parseInt(h.slice(1),16); return `rgba(${n>>16},${n>>8&255},${n&255},${a})`; };
/* halou colorat în spatele textului alb: o culoare deschisă (Onix e alb) primește mult mai puțină opacitate, ca textul să rămână lizibil */
const glowA=(h,a)=>{ const n=parseInt(h.slice(1),16), l=(.2126*(n>>16)+.7152*(n>>8&255)+.0722*(n&255))/255; return hexA(h,l>.6?a*.3:a); };
/* jurnalul zilei: somn, pași, notițe */
const jOf=k=>((S.journal||{})[k])||{};
async function jSet(k,o){ const j=Object.assign({},S.journal), d=Object.assign({},j[k]||{},o);
  Object.keys(d).forEach(x=>{ if(d[x]==null||d[x]==='') delete d[x]; }); if(Object.keys(d).length) j[k]=d; else delete j[k]; await save('journal',j); }
/* mușchii lucrați: seriile fiecărui exercițiu, pe grupe (1 = mușchi principal, 0,5 = secundar) */
const MUSC=[['piept','Piept'],['spate','Spate'],['umeri','Umeri'],['biceps','Biceps'],['triceps','Triceps'],['cvadriceps','Cvadriceps'],['femurali','Femurali'],['fesieri','Fesieri'],['gambe','Gambe'],['abdomen','Abdomen']];
const EXM={'Bench Press':{piept:1,triceps:.5,umeri:.5},'Pull Up / Lat Pulldown':{spate:1,biceps:.5},'Incline Dumbbell Press':{piept:1,umeri:.5,triceps:.5},'Hammer Chest Press':{piept:1,triceps:.5,umeri:.5},
  'Chest Supported Row':{spate:1,biceps:.5,umeri:.5},'Lateral Raise':{umeri:1},'Dumbbell Lateral Raise':{umeri:1},'Tricep Pushdown':{triceps:1},'Tricep Rope Pushdown':{triceps:1},
  'Tricep Overhead Extension':{triceps:1},'Bicep Curl':{biceps:1},'Alternating Dumbbell Curl':{biceps:1},'Barbell Curl':{biceps:1},'Weighted Pull Up':{spate:1,biceps:.5},
  'Flat Dumbbell Press':{piept:1,triceps:.5,umeri:.5},'Seated Overhead Press':{umeri:1,triceps:.5},'Cable Face Pull':{umeri:1,spate:.5},'Hack Squat':{cvadriceps:1,fesieri:.5},
  'Romanian Deadlift':{femurali:1,fesieri:.5},'Walking Lunge':{cvadriceps:1,fesieri:1},'Hip Thrust':{fesieri:1,femurali:.5},'Leg Press':{cvadriceps:1,fesieri:.5},
  'Hamstring Curl':{femurali:1},'Calf Raise':{gambe:1},'Push Press':{umeri:1,triceps:.5},'Close Grip Bench Press':{triceps:1,piept:.5},
  'Dragon Flag':{abdomen:1},'Hanging Leg Raise':{abdomen:1},'Ab Wheel Rollout':{abdomen:1},'Pallof Press':{abdomen:1},'Plank':{abdomen:1},
  /* v19: exercițiile din planul după Milo Wolf */
  'Lat Pulldown':{spate:1,biceps:.5},'Pull Up':{spate:1,biceps:.5},'T-Bar Row':{spate:1,biceps:.5,umeri:.5},'Machine Chest Press':{piept:1,triceps:.5,umeri:.5},'Dumbbell Fly':{piept:1},
  'Cable Lateral Raise':{umeri:1},'Rear Delt Fly':{umeri:1},'Skull Crusher':{triceps:1},'Preacher Curl':{biceps:1},'Incline Dumbbell Curl':{biceps:1},'Cable Curl':{biceps:1},'Pec Deck':{piept:1},'Cable Fly':{piept:1},'Hammer Curl':{biceps:1},'Shrug':{spate:.5},
  'Leg Extension':{cvadriceps:1},'Good Morning':{femurali:1,fesieri:.5},'Back Extension':{femurali:1,fesieri:1},'Cable Crunch':{abdomen:1},'Bulgarian Split Squat':{cvadriceps:1,fesieri:1},'Nordic Curl':{femurali:1},'Hip Abduction Machine':{fesieri:1},'Cable Crunch':{abdomen:1}};
/* exerciții cu greutatea corpului: progresia e varianta mai grea, nu kilogramele */
const BW_PROG={'Nordic Curl':'coboară mai lent sau mai jos înainte să te prinzi cu mâinile','Dragon Flag':'coboară mai lent (5–6 s) sau treci de la negative la repetări complete','Hanging Leg Raise':'treci de la genunchi la picioarele întinse','Ab Wheel Rollout':'rulează mai departe sau mai lent, cu spatele drept'};
function muscleSets(from,to){ const m={}, by={}; MUSC.forEach(([k])=>{ m[k]=0; by[k]={}; });
  Object.keys(S.lifts||{}).forEach(n=>{ const map=EXM[n]; if(!map) return; (S.lifts[n]||[]).forEach(e=>{ if(e.d<from||e.d>to) return; const c=e.s.length;
    Object.keys(map).forEach(k=>{ m[k]+=c*map[k]; by[k][n]=(by[k][n]||0)+c; }); }); });
  return {m,by}; }
const mLevel=v=>v<=0?'':v<6?'sub minimul eficient (~6 serii)':v<10?'aproape de zona bună':v<=20?'în zona bună (10–20 serii)':'mult — atenție la recuperare';
/* ținta fiecărui mușchi = seriile pe săptămână prescrise de planul tău (principal 1, secundar 0,5) */
const PLAN_MT=(()=>{ const m={}; MUSC.forEach(([k])=>m[k]=0);
  PLAN.forEach(p=>p.ex.forEach(([n,pr])=>{ const x=/^(\d+)×/.exec(pr), map=EXM[n]; if(x&&map) Object.keys(map).forEach(k=>m[k]+=+x[1]*map[k]); })); return m; })();
const MST={under:['UNDERTRAINED','sub țintă'],opt:['OPTIMAL','în țintă'],high:['HIGH VOLUME','peste țintă'],none:['—','fără date']};
function muscleExposure(win){
  const tk=todayKey(), from=dayShift(tk,-(win-1)); let first=null;
  Object.values(S.lifts||{}).forEach(h=>h.forEach(e=>{ if(!first||e.d<first) first=e.d; }));
  const span=first?clamp(daysBetween(first,tk)+1,Math.min(7,win),win):win, {m,by}=muscleSets(from,tk), o={_span:span,_win:win};
  MUSC.forEach(([k])=>{ const wk=m[k]*7/span, tg=PLAN_MT[k]||10, pct=Math.round(wk/tg*100);
    o[k]={sets:m[k],wk,tg,pct,by:by[k],state:!first?'none':pct<75?'under':pct<=125?'opt':'high'}; });
  return o;
}
/* culorile hărții de mușchi urmează tema (mai închise pe fundal deschis, ca să se citească) */
const MCOL={get under(){ return COL().run; },get opt(){ return COL().ok; },get high(){ return COL().warn; }};
const BODY_BASE='<circle cx="100" cy="34" r="20"/><rect x="91" y="52" width="18" height="16" rx="6"/><path d="M58 76 Q100 64 142 76 L148 150 Q140 202 128 214 L72 214 Q60 202 52 150 Z"/>'+
  '<rect x="32" y="84" width="24" height="76" rx="12"/><rect x="144" y="84" width="24" height="76" rx="12"/><rect x="28" y="158" width="22" height="66" rx="11"/><rect x="150" y="158" width="22" height="66" rx="11"/>'+
  '<rect x="68" y="210" width="30" height="104" rx="15"/><rect x="102" y="210" width="30" height="104" rx="15"/><rect x="71" y="316" width="25" height="86" rx="12"/><rect x="104" y="316" width="25" height="86" rx="12"/>';
const MSH={
  f:{umeri:'<circle cx="58" cy="90" r="15"/><circle cx="142" cy="90" r="15"/>',piept:'<rect x="69" y="82" width="30" height="36" rx="12"/><rect x="101" y="82" width="30" height="36" rx="12"/>',
     biceps:'<ellipse cx="44" cy="124" rx="10" ry="27"/><ellipse cx="156" cy="124" rx="10" ry="27"/>',cvadriceps:'<ellipse cx="83" cy="258" rx="13" ry="42"/><ellipse cx="117" cy="258" rx="13" ry="42"/>',
     gambe:'<ellipse cx="83" cy="352" rx="10" ry="30"/><ellipse cx="117" cy="352" rx="10" ry="30"/>'},
  b:{spate:'<path d="M70 80 Q100 70 130 80 L135 130 Q100 146 65 130 Z"/><path d="M66 134 Q100 150 134 134 L127 192 Q100 202 73 192 Z"/>',umeri:'<circle cx="58" cy="90" r="15"/><circle cx="142" cy="90" r="15"/>',
     triceps:'<ellipse cx="44" cy="124" rx="10" ry="27"/><ellipse cx="156" cy="124" rx="10" ry="27"/>',fesieri:'<ellipse cx="85" cy="222" rx="17" ry="17"/><ellipse cx="115" cy="222" rx="17" ry="17"/>',
     femurali:'<ellipse cx="83" cy="276" rx="12" ry="34"/><ellipse cx="117" cy="276" rx="12" ry="34"/>',gambe:'<ellipse cx="83" cy="346" rx="11" ry="30"/><ellipse cx="117" cy="346" rx="11" ry="30"/>'}};
function bodySVG(view,m,sel,noAct,ex){
  const parts=Object.keys(MSH[view]).map(k=>{ const v=clamp((m[k]||0)/16,0,1), x=ex&&ex[k];
    const fill=x&&x.state!=='none'?`color-mix(in srgb,${MCOL[x.state]} ${Math.round(clamp(.3+.6*Math.min(x.pct,150)/150,.3,.9)*100)}%,rgba(255,255,255,.04))`
      :`color-mix(in srgb,var(--ac) ${Math.round((.06+.88*v)*100)}%,rgba(255,255,255,.05))`;
    const attr=` class="mu ${sel===k?'sel':''} ${(x?x.state==='high':v>.6)?'hot':''}"${noAct?'':` data-a="muscle" data-k="${k}"`} style="fill:${fill}${x&&x.state!=='none'?';stroke:'+MCOL[x.state]:''}"`;
    return MSH[view][k].replace(/\/>/g,attr+'/>'); }).join('');
  return `<svg class="body-svg" viewBox="0 0 200 410" role="img" aria-label="Mușchi, ${view==='f'?'față':'spate'}"><g class="base">${BODY_BASE}</g>${view==='f'?'<rect class="core" x="84" y="124" width="32" height="70" rx="10"/>':''}${parts}</svg>`;
}
/* zone de puls (Tanaka; Karvonen dacă știm pulsul în repaus), ritmuri din ritmul de prag, predicții Riegel */
function hrZones(){ const P=prof(), max=+P.hrMax>0?Math.round(+P.hrMax):Math.round(208-.7*P.age), rest=+P.hrRest||0, Z=[[.5,.6,'Recuperare'],[.6,.7,'Ușor · easy, long run'],[.7,.8,'Aerob'],[.8,.9,'Prag'],[.9,1,'Maxim']];
  return {max,rest,z:Z.map(([a,b,l],i)=>({n:i+1,l,lo:Math.round(rest?rest+(max-rest)*a:max*a),hi:Math.round(rest?rest+(max-rest)*b:max*b)}))}; }
function thrPace(){ const P=prof(); if(+P.thrPace>0) return {v:+P.thrPace,src:'setat de tine'};
  const rs=(S.runs||[]).filter(r=>r.kind==='thr'&&paceOf(r)&&r.date>=dayShift(todayKey(),-56)); if(!rs.length) return null;
  return {v:rs.reduce((a,r)=>a+paceOf(r),0)/rs.length,src:'media alergărilor de prag din ultimele 8 săptămâni'}; }
function paceZones(){ const t=thrPace(); if(!t) return null; const r=(a,b)=>mmss(t.v*a)+'–'+mmss(t.v*b);
  return {src:t.src,thr:t.v,z:[['Easy și long run',r(1.2,1.32)],['Prag',r(.98,1.03)],['Intervale (VO2max)',r(.9,.95)]]}; }
function racePred(){ const rs=(S.runs||[]).filter(r=>+r.km>=3&&+r.min>0&&r.date>=dayShift(todayKey(),-90)); if(!rs.length) return null;
  const pr=(r,D)=>r.min*Math.pow(D/r.km,1.06), b=rs.reduce((a,r)=>!a||pr(r,10)<pr(a,10)?r:a,null);
  return {b,list:[['5 km',5],['10 km',10],['Semimaraton',21.0975],['Maraton',42.195]].map(([l,D])=>({l,D,s:pr(b,D)*60}))}; }
/* recorduri pe repetări și nivel de forță orientativ (raport 1RM / greutate corporală) */
const REP_RANGES=[1,2,3,4,5,6,8,10,12];
/* istoricul unui exercițiu cu recordurile fiecărei sesiuni: 1RM estimat, greutate, volum, repetări la aceeași greutate */
function liftStats(n){
  const h=liftHist(n), repAt={}, ses=[]; let bE=0, bW=0, bV=0, bestSet=null, bestVol=null, bestW=null;
  h.forEach(e=>{ if(!e.s.length) return; let e1=0, wMax=0, vol=0, top=null, rp=null;
    e.s.forEach(s=>{ const [w,r]=s, v=e1rm(w,r); vol+=w*r; if(w>wMax) wMax=w; if(v>e1||(!top&&r>0)){ e1=Math.max(e1,v); top=s; }
      if(r>0){ const prev=Math.max(0,...Object.keys(repAt).filter(x=>+x>=w).map(x=>repAt[x])); if(ses.length&&prev>0&&r>prev&&(!rp||r-prev>rp.r-rp.prev)) rp={w,r,prev}; } });
    const tags=[]; if(ses.length){ if(e1>bE&&bE>0) tags.push('1RM'); if(wMax>bW&&bW>0) tags.push('greutate'); if(vol>bV&&bV>0) tags.push('volum'); if(rp) tags.push('repetări'); }
    e.s.forEach(([w,r])=>{ if(r>0) repAt[w]=Math.max(repAt[w]||0,r); });
    if(e1>bE){ bE=e1; bestSet={s:top,d:e.d,v:e1}; } if(wMax>bW){ bW=wMax; bestW={w:wMax,d:e.d}; } if(vol>bV){ bV=vol; bestVol={v:Math.round(vol),d:e.d}; }
    ses.push({d:e.d,s:e.s,e1,wMax,vol:Math.round(vol),tags,rp}); });
  const last=ses[ses.length-1], cw=last?last.wMax:0, repPR=last?{w:cw,r:Math.max(0,...Object.keys(repAt).filter(x=>+x>=cw).map(x=>repAt[x]))}:null;
  return {ses,bestSet,bestW,bestVol,repPR};
}
function repMaxes(n){ const h=liftHist(n), e1=bestE1(n); return REP_RANGES.map(r=>{ let best=null;
  h.forEach(e=>e.s.forEach(s=>{ if(s[1]>=r&&s[0]>0&&(!best||s[0]>best.w)) best={w:s[0],d:e.d}; })); return {r,best,est:e1?(r===1?e1:Math.round(e1/(1+r/30)*2)/2):null}; }); }
const STD={'Bench Press':[.5,.75,1,1.5,2],'Seated Overhead Press':[.35,.5,.7,.95,1.2],'Romanian Deadlift':[.75,1.1,1.5,1.9,2.3],'Push Press':[.45,.65,.9,1.2,1.5],'Hip Thrust':[.75,1.25,1.75,2.5,3.25],'Weighted Pull Up':[.8,1,1.2,1.5,1.8]};
const STD_L=['Începător','Novice','Intermediar','Avansat','Elită'];
const curW=()=>{ const ws=wStats(); return ws?ws.a7:prof().startW; };
function stdOf(n){ const t=STD[n]; if(!t) return null; const bw=curW(), th=t.map(x=>x*(prof().sex==='f'?.6:1)); let e=0;
  liftHist(n).forEach(x=>x.s.forEach(([w,r])=>{ const load=n==='Weighted Pull Up'?bw+w:w; if(r>0&&load>0){ const v=load*(1+r/30); if(v>e) e=v; } }));
  if(!e) return null; const ratio=e/bw; let lvl=-1; th.forEach((x,i)=>{ if(ratio>=x) lvl=i; });
  const pts=[[0,0]].concat(th.map((x,i)=>[x,.1+.2*i])).concat([[th[4]*1.25,1]]); let pos=1;
  for(let i=1;i<pts.length;i++) if(ratio<=pts[i][0]){ const [a,pa]=pts[i-1],[b,pb]=pts[i]; pos=pa+(ratio-a)/(b-a)*(pb-pa); break; }
  return {ratio,lvl,pos:clamp(pos,0,1),e:Math.round(e),bw,next:lvl<4?{l:STD_L[lvl+1],e:Math.round(th[lvl+1]*bw)}:null}; }
/* pozele de progres stau doar pe acest dispozitiv: în IndexedDB când browserul îl oferă; altfel
   (de exemplu, pagina deschisă ca fișier local în Edge/Chrome) în localStorage, mai mici și cel mult PH_MAX */
const PHDB={p:null,mode:null}, PH_LS='zece3:photos', PH_MAX=15;
const sortPh=a=>a.sort((x,y)=>x.date<y.date?-1:x.date>y.date?1:x.id<y.id?-1:1);
function phLsGet(){ try{ const v=JSON.parse(localStorage.getItem(PH_LS)||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
function phDb(){ if(!window.indexedDB) return Promise.reject(new Error('fără IndexedDB'));
  /* unele browsere (mod privat, pagini locale) nu răspund deloc la deschidere: renunțăm după 2,5 secunde */
  return PHDB.p||(PHDB.p=new Promise((res,rej)=>{ const to=setTimeout(()=>{ PHDB.p=null; rej(new Error('IndexedDB nu răspunde')); },2500);
    try{ const r=indexedDB.open('zece-photos',1); r.onupgradeneeded=()=>{ r.result.createObjectStore('p',{keyPath:'id'}); };
      r.onsuccess=()=>{ clearTimeout(to); res(r.result); }; r.onerror=()=>{ clearTimeout(to); PHDB.p=null; rej(r.error); }; r.onblocked=()=>{ clearTimeout(to); PHDB.p=null; rej(new Error('blocat')); };
    }catch(e){ clearTimeout(to); PHDB.p=null; rej(e); } })); }
function phTx(mode,fn){ return phDb().then(db=>new Promise((res,rej)=>{ const tx=db.transaction('p',mode), rq=fn(tx.objectStore('p')); tx.oncomplete=()=>res(rq&&rq.result); tx.onerror=()=>rej(tx.error); })); }
async function phLoad(){
  if(PHDB.mode!=='ls'){ try{ const a=await phTx('readonly',st=>st.getAll()); PHDB.mode='idb'; S.photos=sortPh(a||[]); return; }catch(e){ PHDB.mode='ls'; } }
  try{ localStorage.getItem(PH_LS); S.photos=sortPh(phLsGet()); }catch(e){ S.photos=null; }
}
async function phAdd(file,pose){
  const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);
  if(PHDB.mode==='idb'){ const r=await resizeImg(file,900,.8); await phTx('readwrite',st=>st.put({id,date:todayKey(),pose,data:r.url})); }
  else { const a=phLsGet(); if(a.length>=PH_MAX) throw new Error('limit'); const r=await resizeImg(file,640,.7);
    a.push({id,date:todayKey(),pose,data:r.url}); localStorage.setItem(PH_LS,JSON.stringify(a)); }
  await phLoad();
}
async function phDel(id){ if(PHDB.mode==='idb') await phTx('readwrite',st=>st.delete(id)); else localStorage.setItem(PH_LS,JSON.stringify(phLsGet().filter(p=>p.id!==id))); await phLoad(); }
