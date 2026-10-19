/* =====================================================================
   4 · PLANUL — exercițiile și zilele, neschimbate
   ===================================================================== */
const DAYN=['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'];
const DAYS=['Lu','Ma','Mi','Jo','Vi','Sâ','Du'];
const WEEKS=4;
const PLAN=[
 {t:'Upper + Easy run',cat:'mix',min:90,run:'ez1',lift:[['cal',70]],ex:[
  ['Bench Press','4×6–8 · pauză 240s'],
  ['Pull Up / Lat Pulldown','4×6–10 · pauză 90s'],
  ['Hammer Chest Press','3×8–10 · pauză 90s'],
  ['Chest Supported Row','3×8–10 · pauză 90s'],
  ['Lateral Raise','3×12–15 · pauză 60s'],
  ['Tricep Pushdown','3×10–12 · pauză 60s'],
  ['Bicep Curl','3×10–12 · pauză 60s'],
  ['Easy run Z2','30 min · ritm conversațional, zona 2'],
  ['Hanging Leg Raise','3×8–12 · pauză 60s — genunchii la piept, apoi picioarele întinse'],
  ['Plank','3 × 45–60 s · pauză 45s']]},
 {t:'Threshold run',cat:'run',min:50,run:'thr',lift:[],ex:[
  ['Warm up','10–15 min alergare ușoară + drills'],
  ['Threshold','4 × 6:00 @ ritm de prag · pauză 90s jog ușor'],
  ['Cool down','10 min alergare ușoară']]},
 {t:'Upper + Conditioning',cat:'lift',min:90,lift:[['cal',75],['hard',15]],ex:[
  ['Weighted Pull Up','4×5–8 · pauză 90s'],
  ['Flat Dumbbell Press','4×6–8 · pauză 90s'],
  ['Chest Supported Row','4×8–10 · pauză 90s'],
  ['Seated Overhead Press','3×8–10 · pauză 90s'],
  ['Cable Face Pull','3×12–15 · pauză 60s'],
  ['Dumbbell Lateral Raise','3×12–15 · pauză 60s'],
  ['Tricep Rope Pushdown','3×10–12 · pauză 60s'],
  ['Alternating Dumbbell Curl','3×10–12 · pauză 60s'],
  ['Conditioning — opțiunea A sau B','A · Engine Builder: 8 runde pentru timp — 250 m Ski/Row, pauză 45s. B · Hybrid Circuit, 10 min AMRAP: 10 Wall Balls, 10 Burpee Broad Jumps, 10 Kettlebell Swings, 10 Push Ups. Apoi 2–3 min pauză'],
  ['Dragon Flag','4×3–6 · pauză 90s — negative lente (cobori în 4–5 s) până reușești repetări complete'],
  ['Pallof Press','3×10–12 pe parte · pauză 45s']]},
 {t:'Lower + Easy run',cat:'mix',min:95,run:'ez2',lift:[['cal',65]],ex:[
  ['Hack Squat','4×4–6 · pauză 240s — în loc de Back Squat'],
  ['Romanian Deadlift','4×6–8 · pauză 90s'],
  ['Walking Lunge','3×8–10 pe picior · pauză 90s'],
  ['Hip Thrust','3×8–10 · pauză 90s'],
  ['Leg Press','3×10–12 · pauză 60s'],
  ['Hamstring Curl','3×10–12 · pauză 60s'],
  ['Calf Raise','3×12–15 · pauză 60s'],
  ['Easy run Z2','30 min · ușor — e flush, nu antrenament']]},
 {t:'Upper Strength + Power',cat:'lift',min:98,lift:[['cal',88],['hard',10]],ex:[
  ['Bench Press','5×3–5 · pauză 240s'],
  ['Weighted Pull Up','4×4–6 · pauză 150s'],
  ['Incline Dumbbell Press','4×6–8 · pauză 90s'],
  ['Chest Supported Row','4×6–8 · pauză 90s'],
  ['Push Press','4×3–5 · pauză 180s'],
  ['Close Grip Bench Press','3×8–10 · pauză 90s'],
  ['Barbell Curl','3×8–10 · pauză 90s'],
  ['Tricep Overhead Extension','3×10–12 · pauză 90s'],
  ['Power finisher — EMOM 10 min','minutele impare: 6 Med Ball Chest Throws · minutele pare: 8 Plyo Push Ups'],
  ['Dragon Flag','3×3–6 · pauză 90s — negative lente sau repetări complete'],
  ['Ab Wheel Rollout','3×8–10 · pauză 60s']]},
 {t:'Long run',cat:'run',min:65,run:'lng',lift:[],ex:[
  ['Warm up','10–15 min alergare ușoară'],
  ['Long run Z2','45 min continuu · ritm conversațional, zona 2'],
  ['Cool down','5–10 min ușor']]},
 {t:'Recovery & Mobility',cat:'rest',min:40,lift:[],ex:[
  ['Light walk / easy bike','5–10 min'],
  ['Mobility flow','10–15 min · full body'],
  ['Stretching','10–15 min · ține fiecare întindere 45–60s'],
  ['Foam roll / trigger point','după nevoie'],
  ['Deep breathing / mindset reset','5 min']]}
];
/* v9: abdomen la finalul zilelor de upper; [zi, câte exerciții avea ziua înainte] — pentru bifarea automată a zilelor deja terminate */
const PLAN_ABS=[[0,8],[2,9],[4,9]];
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
 {wk:'Bază aerobă + forță pe partea de sus',d:[
  ['Coaching','Alergarea rămâne UȘOARĂ — stai în zona 2. Tempo controlat și amplitudine completă la ridicări. Începi săptămâna construind elan, nu oboseală.'],
  ['Progresie','Adaugi 5–10 min la alergare în fiecare săptămână. La ridicări crești întâi repetările, apoi greutatea.'],
  ['Abdomen','La final, ridicări la bară și planșă: lent, controlat, fără balans. Când faci 12 repetări curate cu genunchii, treci la picioarele întinse.']]},
 {wk:'Pragul lactic — sesiunea-cheie de performanță',d:[
  ['Coaching','Asta e sesiunea-cheie. Ritm controlat și puternic în fiecare repriză. Rămâi relaxat, nu forța efortul. Reprize egale. Calitate peste cantitate.'],
  ['Progresie','Săptămânile 1–3: 4, 5, apoi 6 reprize; săptămâna 4 e deload. La fiecare ciclu nou repriza crește cu 30 s, până la 7 min. Apoi progresezi prin ritm (refaci testul de prag).']]},
 {wk:'Forță pe partea de sus + conditioning hibrid',d:[
  ['Coaching','Greu, cu intenție, fără să ajungi la eșec la exercițiile principale. Amplitudine completă. Conditioning-ul trebuie să fie provocator, nu maximal.'],
  ['Progresie','Adaugi repetări sau greutate la exercițiile principale în fiecare săptămână. Crești densitatea la conditioning.'],
  ['Dragon Flag','Începe cu negative: urci cu genunchii la piept, întinzi corpul sus și cobori drept, în 4–5 secunde. Doar umerii și spatele de sus stau pe bancă, lombarul nu se arcuiește. Când controlezi toată coborârea, încearcă repetări complete.']]},
 {wk:'Alergare ușoară + forță pe picioare',d:[
  ['Hack Squat în loc de Back Squat','Spatele stă lipit de spătar și traiectoria e ghidată, dar greutatea tot pe umeri apasă — coboară doar cât bazinul rămâne lipit de spătar.'],
  ['Coaching','Alergarea rămâne ușoară — e flush, nu antrenament. Forță și calitate la ridicări, nu volum. Fără eșec la exercițiile compuse.'],
  ['Progresie','Adaugi 5 min la easy run sau păstrezi și alergi mai ușor. Crești greutatea când ai făcut toate seriile și repetările.']]},
 {wk:'Forță maximă + putere explozivă',d:[
  ['Coaching','Intenție grea și explozivă la ridicările principale. Amplitudine completă la fiecare repetare. Pauză corectă, ridici cu scop. Calitate peste cantitate.'],
  ['Progresie','Adaugi greutate la ridicările principale în fiecare săptămână. Încerci să bați seria de top de săptămâna trecută. Viteză mai bună a barei.'],
  ['Abdomen','A doua sesiune de Dragon Flag din săptămână (48 de ore după miercuri), cu o serie mai puțin; apoi roata, doar cât spatele rămâne drept.']]},
 {wk:'Rezistență + motorul aerob',d:[
  ['Coaching','Pulsul în zona 2. Respirație relaxată, ritm fluid. Constant, nu vânezi ritmul. Hidratare înainte și după. Termini simțindu-te mai bine decât ai început.'],
  ['Progresie','Vârful e în săptămâna 3, săptămâna 4 e deload. Fiecare ciclu nou pornește cu 5 min mai sus. Intensitatea rămâne aceeași — nu devine tempo. Urmărești distanța sau timpul și încerci să le bați.']]},
 {wk:'Recuperare — 30–45 min, intensitate mică',d:[
  ['Coaching','Aici te faci mai bun — nu o sări. Mișcare cu intenție, nu cu intensitate. Insiști pe zonele tensionate sau cu febră musculară. Hidratare, mâncare bună, somn de calitate.'],
  ['Progresie','Notezi cum te simți și cum recuperezi în fiecare săptămână. Îmbunătățești calitatea somnului.']]}
];
/* v16: vârful e în săptămâna 3; săptămâna 4 are valorile vârfului, din care deload-ul automat taie 40% (cu deload-ul oprit, săptămâna 4 repetă vârful) */
const RUN_DEFAULT={ez1:{w:[30,30,35,35]},thr:{m:6,r:[4,5,6,6],rest:90},ez2:{w:[30,35,40,40]},lng:{w:[45,50,60,60]}};
/* v16: progresia între cicluri — fiecare ciclu nou pornește mai sus: +2 min la easy, +5 min la long run (cel mult 4 cicluri),
   +30 s pe repriza de prag (până la 7 min); ce ai editat manual rămâne exact cum l-ai salvat */
const RUN_CYC={max:4,ez1:2,ez2:2,lng:5,thrStep:.5,thrMax:7};
const RUN_WU={thr:22.5,lng:20};
const RUNK={ez:'Easy Z2',thr:'Prag',lng:'Long run',int:'Intervale',tmp:'Tempo'};
const RUN_EX=/^(Easy run|Threshold$|Long run)/;
const BARBELL=/^(Bench Press|Push Press|Close Grip Bench Press|Romanian Deadlift|Barbell Curl)$/;
const COMPOUND=/^(Bench Press|Hack Squat|Romanian Deadlift|Push Press|Seated Overhead Press|Leg Press|Close Grip Bench Press|Flat Dumbbell Press|Incline Dumbbell Press|Hammer Chest Press|Hip Thrust)$/;

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
const deloadOn=w=>S.deload!==false&&TRAINING.isDeloadWeek(w+1);
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
