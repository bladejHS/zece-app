/* =====================================================================
   4 · PLANUL — exercițiile și zilele, neschimbate
   ===================================================================== */
const DAYN=['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'];
const DAYS=['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];
const WEEKS=4;
/* v20: cel mai bun antrenament după Dr. Milo Wolf: FULL BODY de 4 ori pe săptămână, așa cum se antrenează și cum recomandă el:
   fiecare ședință are compusele unei jumătăți a corpului și izolarea celeilalte (picioarele grele nu se adună într-o singură zi,
   iar ședințele rămân scurte), fiecare mușchi de 2–3 ori pe săptămână, ~10–15 seturi directe pe săptămână, cel mult ~11 pe ședință,
   repetări 5–15 la compuse și 10–20 la izolare, exerciții cu tensiune în poziția întinsă.
   Alergarea: 2 × Easy Z2 ca a doua sesiune, la ~6 ore după forță, în zilele fără compuse de picioare; pragul marți, la ≥24 h de orice zi de picioare.
   v22: înapoi la planul full body inițial, cu Skull Crusher, Good Morning și Nordic Curl înlocuite (extensie deasupra capului la cablu,
   Back Extension la 45°, Hamstring Curl la șezut) și abdomenul obligatoriu în 4 ședințe: ~12 seturi pe săptămână, cu stretch și greutate.
   Pauze: izolare 90 s, compuse sus 150 s, compuse grele de picioare 180 s. Vineri recuperare, duminică odihnă. Easy-urile luni și joi. */
const PLAN=[
 {t:'Full Body A + Easy Run',cat:'mix',min:100,run:'ez1',lift:[['cal',65]],ex:[
  ['Incline Dumbbell Press','3×6–10 · pauză 150s — banca la 30–45°, ganterele coboară adânc'],
  ['Chest Supported Row','3×6–10 · pauză 150s — brațele complet întinse jos'],
  ['Lat Pulldown','3×8–12 · pauză 120s — priză îngustă sau supinată'],
  ['Seated Overhead Press','2×8–12 · pauză 120s'],
  ['Leg Extension','3×10–15 · pauză 90s — spătarul lăsat pe spate'],
  ['Hamstring Curl','2×10–15 · pauză 90s — la șezut, aplecat în față'],
  ['Calf Raise','3×8–12 · pauză 90s — genunchii întinși, 1–2 s jos'],
  ['Cable Crunch','3×10–15 · pauză 60s — sus lași abdomenul să se întindă complet, apoi rotunjești coloana; nu îndoi din șold'],
  ['Easy run Z2','30 min · ritm conversațional, zona 2']]},
 {t:'Threshold run',cat:'run',min:50,run:'thr',lift:[],ex:[
  ['Warm up','10–15 min alergare ușoară + drills'],
  ['Threshold','4 × 6:00 @ ritm de prag · pauză 90s jog ușor'],
  ['Cool down','10 min alergare ușoară']]},
 {t:'Full Body B · Heavy Legs',cat:'lift',min:80,lift:[['cal',70]],ex:[
  ['Hack Squat','3×5–8 · pauză 180s — cât mai jos, pauză scurtă jos'],
  ['Romanian Deadlift','3×6–10 · pauză 180s — până puțin sub genunchi, fără eșec'],
  ['Hip Abduction Machine','2×12–20 · pauză 60s — aplecat în față'],
  ['Cable Lateral Raise','3×10–15 · pauză 90s — cablul la nivelul mâinii, din spatele corpului'],
  ['Tricep Overhead Extension','3×8–12 · pauză 90s — cotul sus, tricepsul întins jos'],
  ['Preacher Curl','3×8–12 · pauză 90s'],
  ['Roman Chair Leg Raise','3×8–15 · pauză 60s — sprijinit pe antebrațe, ridici bazinul spre piept (rotunjești spatele jos), nu doar picioarele']]},
 {t:'Full Body C + Easy Run',cat:'mix',min:100,run:'ez2',lift:[['cal',65]],ex:[
  ['Machine Chest Press','3×8–12 · pauză 150s'],
  ['Pull Up / Lat Pulldown','3×6–12 · pauză 150s — atârnare completă la fiecare repetare'],
  ['Seated Cable Row','3×8–12 · pauză 120s — priză neutră sau largă, brațele complet întinse și omoplații depărtați în față'],
  ['Cable Fly','3×10–15 · pauză 90s — cable crossover: brațele larg în spate (stretch), mâinile se încrucișează în față'],
  ['Rear Delt Fly','2×12–20 · pauză 90s — la cablu, cruce în fața corpului'],
  ['Hamstring Curl','3×10–15 · pauză 90s — la șezut, aplecat în față'],
  ['Calf Raise','3×10–15 · pauză 90s — genunchii întinși, 1–2 s jos'],
  ['Ab Wheel Rollout','3×6–12 · pauză 60s — cât mai departe cu spatele neutru; din genunchi la început'],
  ['Easy run Z2','30 min · ușor — e flush, nu antrenament']]},
 {t:'Recovery & Mobility',cat:'rest',min:40,lift:[],ex:[
  ['Light walk / easy bike','5–10 min'],
  ['Mobility flow','10–15 min · full body'],
  ['Stretching','10–15 min · ține fiecare întindere 45–60s'],
  ['Foam roll / trigger point','după nevoie'],
  ['Deep breathing / mindset reset','5 min']]},
 {t:'Full Body D · Heavy Legs',cat:'lift',min:80,lift:[['cal',70]],ex:[
  ['Bulgarian Split Squat','3×6–10 pe picior · pauză 150s — la Smith, genunchiul din spate aproape de sol'],
  ['Back Extension','3×8–12 · pauză 120s — la 45°, cobori adânc cu spatele neutru, urci din șold; greutate la piept când devine ușor'],
  ['Leg Press','2×10–15 · pauză 120s — cât mai jos fără să se rotunjească spatele'],
  ['Hamstring Curl','3×10–15 · pauză 90s — la șezut, aplecat în față (cel mai bun exercițiu pentru femurali)'],
  ['Pec Deck','3×10–15 · pauză 90s — brațele larg în spate (stretch), fără pauză în față; a treia zi de piept pe săptămână'],
  ['Cable Lateral Raise','3×12–20 · pauză 90s'],
  ['Tricep Overhead Extension','3×10–15 · pauză 90s — la cablu, cu frânghia, cu spatele la aparat'],
  ['Incline Dumbbell Curl','3×10–15 · pauză 90s'],
  ['Cable Crunch','3×10–15 · pauză 60s — greutate mai mare decât luni, 8–12 repetări']]},
 {t:'Odihnă & mobilitate',cat:'rest',min:30,lift:[],ex:[
  ['Light walk / easy bike','20–30 min ușor, sau doar plimbare'],
  ['Mobility flow','10 min · full body'],
  ['Deep breathing / mindset reset','5 min']]}
];
/* v19: versiunea planului; la prima pornire cu planul nou începe un ciclu nou (bifele vechi rămân în ciclul lor) */
const PLAN_V='milo4';
/* v25: piept de 3 ori pe săptămână (Pec Deck sâmbătă, ~12 seturi), flexiile de luni 2 serii (femuralii ~14 seturi, plus alergarea) */
async function planMigrate(){ const P=prof(); if(P.planV===PLAN_V) return;
  const c=cyc(), any=Object.keys(S.wlog||{}).some(k=>k.indexOf('hc'+c+'w')===0&&Object.keys(S.wlog[k]||{}).some(e=>e!==SPLIT_MK));
  if(any) await save('cyc',Object.assign({},S.cyc||{},{h:c+1,t:Date.now()}));
  if(S.sess){ S.sess=null; await store.set(K.sess,null); }
  await save('prof',Object.assign({},S.prof||{},{planV:PLAN_V,exSwap:{}})); STC=null; }
/* v22: abdomenul face parte din plan (Wolf: îl antrenezi ca pe orice mușchi), deci nu mai e nicio zi cu exerciții opționale; [zi, câte exerciții obligatorii] */
const PLAN_ABS=[];
/* v10: abdomenul e opțional — o zi e completă când sunt bifate exercițiile de dinaintea lui */
const absFrom=d=>{ const pa=PLAN_ABS.find(a=>a[0]===d); return pa?pa[1]:PLAN[d].ex.length; };
const optX=(d,x)=>x>=absFrom(d);
/* v16: luni și joi sunt două sesiuni: SESSION 1 forța, SESSION 2 easy run-ul, la ~6 ore după.
   Easy run-ul a trecut de pe primul loc după ultimul exercițiu de forță (înaintea abdomenului opțional), deci bifele vechi se mută o dată:
   vechiul 0 (alergarea) → 7, vechile 1–7 (forța) → 0–6. Ziua mutată poartă marcajul m16, care trece și prin sincronizare. */
const SPLIT_DAYS=[0,3];
const splitDay=d=>SPLIT_DAYS.indexOf(d)>=0;
const splitX=x=>x===0?7:x<=7?x-1:x;
const SPLIT_MK='m16';
function migSplitLog(log){ let ch=false; const out=Object.assign({},log||{});
  Object.keys(out).forEach(k=>{ if(!/^hc\d+w\d+d[03]$/.test(k)) return; const o=out[k]||{}; if(o[SPLIT_MK]) return;
    const n={[SPLIT_MK]:1}; Object.keys(o).forEach(e=>{ if(e.indexOf(k+'e')!==0) return; const x=+e.slice(k.length+1); if(isFinite(x)) n[k+'e'+splitX(x)]=1; });
    out[k]=n; ch=true; });
  return ch?out:null; }
const remapX=o=>{ if(!o||typeof o!=='object') return o; const n={}; Object.keys(o).forEach(x=>{ n[isFinite(+x)?splitX(+x):x]=o[x]; }); return n; };
/* la pornire (și după o sincronizare): bifele, ajustările de azi și antrenamentul pornit, o singură dată */
async function migSplit(){
  const L=migSplitLog(S.wlog); if(L) await save('wlog',L);
  let done=false; try{ done=localStorage.getItem('zece3:m16')==='1'; }catch(e){}
  if(done) return;
  const A=Object.assign({},S.adj||{}); let ca=false;
  Object.keys(A).forEach(k=>{ if(!/d[03]$/.test(k)||!A[k]||!Array.isArray(A[k].ch)) return; A[k]=Object.assign({},A[k],{ch:A[k].ch.map(c=>Object.assign({},c,{x:splitX(c.x)}))}); ca=true; });
  if(ca) await save('adj',A);
  const s=S.sess; if(s&&splitDay(s.d)&&!s[SPLIT_MK]){ ['sets','runs','tasks','kg','rp','tmMin'].forEach(f=>{ s[f]=remapX(s[f]); });
    if(s.hr&&s.hr.ex) s.hr.ex=remapX(s.hr.ex); if(s.adj&&Array.isArray(s.adj.ch)) s.adj.ch=s.adj.ch.map(c=>Object.assign({},c,{x:splitX(c.x)}));
    s.cur=splitX(s.cur); s[SPLIT_MK]=1; await store.set(K.sess,s); }
  try{ localStorage.setItem('zece3:m16','1'); }catch(e){} }
const NOTES=[
 {wk:'Full Body A — compusele de sus, izolarea picioarelor, abdomen + alergare ușoară',d:[
  ['De ce full body','Wolf își face singur antrenamentele full body: fiecare mușchi de 2–3 ori pe săptămână, seturile împărțite pe mai multe zile (primele seturi dintr-o ședință cresc cel mai mult), ședințe mai scurte. Azi compusele pentru partea de sus și izolarea pentru picioare, ca să poți alerga diseară.'],
  ['Cum lucrezi','Primul set al fiecărui exercițiu la 2–3 repetări în rezervă, ultimul la 0–1. Coborâre controlată 2–3 s, pauză scurtă în poziția întinsă, urcare explozivă, fără pauză sus.'],
  ['Superseturi','Dacă ai puțin timp: împinsul cu ramatul, extensiile cu flexiile, alternativ, cu 60–90 s între ele (aceeași creștere în ~jumătate din timp).'],
  ['Abdomenul (Wolf)','Îl antrenezi ca pe orice mușchi: de 4 ori pe săptămână, ~12 seturi, aproape de eșec, cu amplitudine completă și stretch (coloana se întinde sus la cable crunch, corpul se lungește la ab wheel), și cu greutate care crește. Ridicările de picioare lucrează abdomenul doar dacă rotunjești bazinul. Pătrățelele se văd când scade grăsimea: abdomenul nu „arde” grăsimea de pe burtă.'],
  ['Alergarea','Easy run-ul e a doua sesiune, la ~6 ore după forță. Zona 2, poți vorbi în propoziții întregi.']]},
 {wk:'Pragul lactic — sesiunea-cheie de alergare',d:[
  ['Coaching','Ritm controlat și puternic, reprize egale, relaxat. Calitate peste cantitate.'],
  ['Progresie','Săptămânile 1–3: 4, 5, apoi 6 reprize. La fiecare ciclu nou repriza crește cu 30 s, până la 7 min; apoi progresezi prin ritm (refaci testul de prag).'],
  ['De ce marți','Ieri picioarele au făcut doar izolare, iar compusele grele vin abia mâine: pragul e la peste 24 de ore de ele (Norton: interferența dispare la ≥24 h).']]},
 {wk:'Full Body B — Heavy Legs, izolare pentru partea de sus, abdomen',d:[
  ['Cum lucrezi','Hack squat și RDL la 1–2 repetări în rezervă, fără eșec (eșecul la compusele grele de picioare costă mult și aduce puțin). Izolările de sus: ultimul set la eșec, apoi 3–5 jumătăți de repetare în partea întinsă.'],
  ['Ordinea','Compusele întâi, cât ești proaspăt; brațele și umerii nu suferă după picioare.'],
  ['Mâine','Joi doar izolare la picioare (flexii, gambe), cu greutăți moderate: frecvența mare ajută, iar easy run-ul de seară e ușor.']]},
 {wk:'Full Body C — compusele de sus, izolarea picioarelor, abdomen + alergare ușoară',d:[
  ['Cum lucrezi','Repetări ceva mai multe decât luni (8–15). Aparatele și cablurile sunt sigure până la eșec: acolo mergi la 0 pe ultimul set și continui cu jumătăți de repetare în stretch.'],
  ['Spatele','Tracțiunile cu atârnare completă jos; ramatul cu brațele complet întinse și omoplații depărtați. Fără pauză în contracție.'],
  ['Alergarea','Easy run-ul la ~6 ore după forță, ușor — e flush, nu antrenament.']]},
 {wk:'Recuperare — 30–45 min, intensitate mică',d:[
  ['Coaching','Mișcare cu intenție, nu cu intensitate. Somn 7–9 ore, mâncare bună, apă.'],
  ['Progresie','Notezi cum te simți și cum recuperezi în fiecare săptămână.']]},
 {wk:'Full Body D — Heavy Legs, izolare pentru partea de sus, abdomen',d:[
  ['Cum lucrezi','Fandarea bulgărească la Smith întâi, la 1–2 repetări în rezervă. Back extension la 45°: hinge ca la RDL, dar cu încărcare mică pe spate, după alergare e mai blând. Ultimul set la presă până la eșec.'],
  ['Femuralii','Flexiile la șezut sunt exercițiul preferat al lui Wolf pentru femurali: îi lucrează întinși (aplecat în față). Partea excentrică lentă ajută și la protecția lor la alergare.'],
  ['Weekend','Mâine e odihnă, apoi luni doar izolare la picioare: ajung odihnite la pragul de marți.']]},
 {wk:'Odihnă — plimbare și mobilitate',d:[
  ['Coaching','Zi liberă de antrenament. O plimbare de 20–30 min ajută la pași și la recuperare.'],
  ['Wolf','Recuperarea o judeci după performanță, nu după febra musculară: dacă luni primele seturi sunt ca data trecută sau mai bune, ești refăcut.']]}
];
/* v16: vârful e în săptămâna 3; săptămâna 4 are valorile vârfului, din care deload-ul automat taie 40% (cu deload-ul oprit, săptămâna 4 repetă vârful) */
const RUN_DEFAULT={ez1:{w:[30,30,35,35]},thr:{m:6,r:[4,5,6,6],rest:90},ez2:{w:[30,35,40,40]},lng:{w:[45,50,60,60]}};
/* v16: progresia între cicluri — fiecare ciclu nou pornește mai sus: +2 min la easy, +5 min la long run (cel mult 4 cicluri),
   +30 s pe repriza de prag (până la 7 min); ce ai editat manual rămâne exact cum l-ai salvat */
const RUN_CYC={max:4,ez1:2,ez2:2,lng:5,thrStep:.5,thrMax:7};
const RUN_WU={thr:22.5,lng:20};
const RUNK={ez:'Easy Z2',thr:'Prag',lng:'Long run',int:'Intervale',tmp:'Tempo'};
const RUN_EX=/^(Easy run|Threshold$|Long run)/;
const BARBELL=/^(Bench Press|Push Press|Close Grip Bench Press|Romanian Deadlift|Barbell Curl|Good Morning)$/;
const COMPOUND=/^(Bench Press|Hack Squat|Romanian Deadlift|Push Press|Seated Overhead Press|Leg Press|Close Grip Bench Press|Flat Dumbbell Press|Incline Dumbbell Press|Hammer Chest Press|Hip Thrust|Machine Chest Press|Chest Supported Row|T-Bar Row|Seated Cable Row|Lat Pulldown|Pull Up \/ Lat Pulldown|Weighted Pull Up|Good Morning|Bulgarian Split Squat)$/;

function runPlan(){
  const d=JSON.parse(JSON.stringify(RUN_DEFAULT)), sv=(S.runPlan||{}).h||{}, n=Math.max(0,Math.min(RUN_CYC.max,cyc()-1));
  ['ez1','ez2','lng'].forEach(k=>{ d[k].w=d[k].w.map(v=>v+RUN_CYC[k]*n); });
  d.thr.m=Math.min(RUN_CYC.thrMax,d.thr.m+RUN_CYC.thrStep*n);
  Object.keys(d).forEach(k=>{ if(sv[k]) Object.assign(d[k],sv[k]); });
  return d;
}
function runWork(kind,w){ const p=runPlan();
  if(kind==='thr'){ const r=p.thr.r[w]||0; return r*p.thr.m+Math.max(0,r-1)*p.thr.rest/60; }
  return (p[kind]&&p[kind].w[w])||0; }
function runTotal(kind,w){ const p=runPlan(), wk=runWork(kind,w);
  if(kind==='thr') return (p.thr.r[w]||0)?RUN_WU.thr+wk:0;
  if(kind==='lng') return wk?wk+RUN_WU.lng:0;
  return wk; }
const runKindOf=run=>run==='thr'?'thr':run==='lng'?'lng':'ez';
function parseEx(n,p,base){
  if(base.run&&RUN_EX.test(n)) return {kind:'run'};
  const m=/^(\d+)×(\d+)(?:–(\d+))?/.exec(p);
  if(m){ const r=/pauză (\d+)s/.exec(p); return {kind:'lift',sets:+m[1],lo:+m[2],hi:+(m[3]||m[2]),rest:r?+r[1]:90}; }
  return {kind:'task'};
}
function dayFor(w,d,raw){
  const day=dayBase(w,d), a=raw?null:adjFor(w,d); return a?applyAdj(day,a):day; }
function dayBase(w,d){
  const base=PLAN[d], p=runPlan();
  const sw=(S.prof||{}).exSwap||{};
  /* v16: exercițiile înlocuite permanent (de tine sau de antrenorul AI) păstrează seriile, repetările și pauza */
  const ex=base.ex.map(([n0,pr],x)=>{ const n=sw[d+'_'+x]||n0;
    let txt=pr, planMin=null;
    if(base.run==='thr'&&n==='Threshold'){ const r=p.thr.r[w]||0; txt=r+' × '+mmss(p.thr.m)+' @ ritm de prag · pauză '+p.thr.rest+'s jog ușor'; planMin=Math.round(runWork('thr',w)); }
    else if(base.run==='lng'&&/^Long run/.test(n)){ planMin=p.lng.w[w]||0; txt=planMin+' min continuu · ritm conversațional, zona 2'; }
    else if((base.run==='ez1'||base.run==='ez2')&&/^Easy run/.test(n)){ planMin=p[base.run].w[w]||0; txt=planMin+' min · ritm conversațional, zona 2'+(base.run==='ez2'?' — flush, nu antrenament':'')+' · la ~6 h după forță'; }
    return Object.assign({x,n,p:txt,planMin,opt:optX(d,x)},parseEx(n,txt,base));
  });
  const liftMin=(base.lift||[]).reduce((a,s)=>a+s[1],0);
  let min=base.run?Math.round(runTotal(base.run,w)+liftMin):base.min;
  const dl=deloadOn(w)||hrvDeloadDay(w,d);
  if(dl){ ex.forEach(deloadEx); min=TRAINING.deloadMinutes(min); }
  return {w,d,t:base.t,cat:base.cat,run:base.run,min,ex,notes:NOTES[d],deload:dl};
}
/* deload automat (src/lib/training): săptămâna a 4-a din ciclu are volum −40%, aceleași zile; se poate opri din Setări */
/* v26 (Wolf, articolul despre pauzele de dietă): în cut, deload-ul vine în săptămâna la menținere (prof.dbDl, setat la pornire de dbDeloadSync) */
const dbDl=w=>{ const x=prof().dbDl; return !!(x&&x.c===cyc()&&x.w===w); };
const deloadOn=w=>(S.deload!==false&&TRAINING.isDeloadWeek(w+1))||dbDl(w);
function deloadEx(e){
  if(e.kind==='lift'&&e.sets){ const n=TRAINING.deloadCount(e.sets); e.p=e.p.replace(/^\d+×/,n+'×')+' · deload'; e.sets=n; }
  else if(e.n==='Threshold'){ const r=+((/^(\d+) ×/.exec(e.p)||[])[1])||0; if(r){ const n=TRAINING.deloadCount(r); e.iv=n; e.p=e.p.replace(/^\d+ ×/,n+' ×')+' · deload'; e.planMin=TRAINING.deloadMinutes(e.planMin||0); } }
  else if(e.planMin){ const m=TRAINING.deloadMinutes(e.planMin); e.p=e.p.replace(/^\d+ min/,m+' min')+' · deload'; e.planMin=m; }
}
const cyc=()=>((S.cyc||{}).h)||1;
const dKeyC=(c,w,d)=>'hc'+c+'w'+w+'d'+d;
const dKey=(w,d)=>dKeyC(cyc(),w,d);
const eId=(w,d,x)=>dKey(w,d)+'e'+x;
const isDone=(w,d,x)=>!!((S.wlog||{})[dKey(w,d)]||{})[eId(w,d,x)];
/* exercițiile obligatorii bifate (abdomenul opțional se numără separat, în optDone) */
function doneCount(w,d){ let n=0; for(let x=0;x<absFrom(d);x++) if(isDone(w,d,x)) n++; return n; }
function optDone(w,d){ let n=0; for(let x=absFrom(d);x<PLAN[d].ex.length;x++) if(isDone(w,d,x)) n++; return n; }
const dayFull=(w,d)=>doneCount(w,d)===absFrom(d);
function fullIn(c,w,d){ const k=dKeyC(c,w,d), o=(S.wlog||{})[k]||{}; for(let x=0;x<absFrom(d);x++) if(!o[k+'e'+x]) return false; return true; }
function nextDay(){ for(let w=0;w<WEEKS;w++) for(let d=0;d<7;d++) if(!dayFull(w,d)) return {w,d}; return null; }
function cycleDaysDone(){ let n=0; for(let w=0;w<WEEKS;w++) for(let d=0;d<7;d++) if(dayFull(w,d)) n++; return n; }
async function setDone(w,d,x,on){
  const log=Object.assign({},S.wlog), k=dKey(w,d), day=Object.assign({},log[k]||{});
  if(on) day[eId(w,d,x)]=1; else delete day[eId(w,d,x)];
  if(splitDay(d)) day[SPLIT_MK]=1;
  log[k]=day; await save('wlog',log);
}
