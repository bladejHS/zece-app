/* =====================================================================
   v27 · HYBRID — a doua filă de plan din Antrenament, după Alex Viada („The Ultimate Hybrid Athlete”, 2025,
   și interviurile lui de la Rox Lyfe, Jordan Syatt și Coach 'Em Up). Planul full body Wolf rămâne neatins în fila Plan.
   Programul e „Hypertrophy + 5K”, cel pe care Viada îl recomandă ca primul din carte: 4 zile de forță (sus/jos de câte 2 ori),
   sprint + MLSS luni, sesiunea de lângă prag miercuri (sesiunea-cheie, singură în zi), tracțiuni + VT1 joi, alergarea lungă
   sâmbătă, duminică liber.
   Notația lui: ME (efort maxim), DE (efort dinamic, viteză), SKILL (tehnică), HYP (hipertrofie), RIR (repetări în rezervă).
   Ritmurile sunt în % din viteza de prag (100% = prag/VT2), ca în carte; forța merge pe „cercul repetărilor” (3 săptămâni) în jurul
   maximului de antrenament (96% din 1RM), care urcă cu 1% la fiecare cerc. Totul e calculat local, fără antrenorul AI.
   v31: săptămâna verificată pe tabelul din carte (miercuri doar pliometrie + prag, tracțiunile joi, cu VT1), deload-ul exact ca
   varianta Taper/Deload, toate antrenamentele de alergare din carte, ajustarea pragului, deload propus din ridicările ME,
   pliometria pe etape și regulile din capitolele 1–7 (deriva cardiacă, încălzirea RAMP, interferența).
   ===================================================================== */
K.hyb='zece3:hyb'; S.hyb={};
const hyb=()=>Object.assign({wk:0,lvl:0,tm:{},log:{},bj:[]},S.hyb||{});
async function hybSave(o){ await save('hyb',Object.assign({},S.hyb||{},o)); }
/* cercul repetărilor: [serii, repetări, % din maximul de antrenament] pe săptămânile 1–3 ale cercului */
const HYB_CIRC={me:[[2,4,90],[2,3,93],[2,2,96]],de:[[6,3,70],[5,3,75],[5,2,80]],sk:[[4,5,75],[4,4,80],[3,3,85]]};
const HYB_TYPE={me:'ME · efort maxim',de:'DE · efort dinamic',sk:'SKILL · tehnică',hyp:'HYP · hipertrofie',core:'Core',plyo:'Pliometrie',run:'Alergare'};
/* ridicările care merg pe procente (au maxim de antrenament) */
const HYB_TM=['Incline Bench Press','Trap Bar Deadlift','T-Bar Row','Box Squat'];
/* regula 1 și 2a: încălzirea pregătește, nu obosește, iar ultimul set de încălzire e primul de lucru */
const HYB_RAMP='Încălzire RAMP: 3–5 min ușor, mișcările zilei fără greutate, apoi seturi tot mai grele; ultimul set de încălzire e primul de lucru.';
/* exercițiile: [nume, tip, categoria lui Viada, serii×repetări (pentru HYP/core), indicație, sesiunea (0 prima, 1 a doua), deload]
   deload = varianta Taper/Deload din carte: 0 scoate exercițiul, 'de'/'sk' îi schimbă tipul */
const HYB_DAYS=[
 {t:'Upper Push + Speed Run',cat:'mix',ses:['Alergare · dimineața (sprint + MLSS, ~45–50 min)','Forță · la 6–8 ore după, cu o masă completă între'],run:'mon',ex:[
  ['Incline Bench Press','me','Secondary push','',HYB_RAMP+' Oprești setul înainte să se strice tehnica.',1,'de'],
  ['Machine Chest Press','hyp','Braced push','3×6–12 · 1–2 RIR · pauză 120s','Tempo constant: coborâre controlată, urcare puternică, fără excentrice foarte lente.',1],
  ['Chest Supported Row','hyp','Braced pull','3×6–12 · 1–2 RIR · pauză 120s','',1],
  ['Roman Chair Leg Raise','core','Core','3×8–15 · pauză 60s','Core-ul după lucrul principal și înaintea izolării (regula 4 a lui Viada).',1],
  ['Tricep Pushdown','hyp','Focused push (arms) · superset','3×8–12 · 0–2 RIR · alternativ cu curl-ul, 60–90s','',1],
  ['Preacher Curl','hyp','Focused pull (arms) · superset','3×8–12 · 0–2 RIR','',1],
  ['Cable Lateral Raise','hyp','Focused push','3×8–12 · 0–2 RIR · pauză 90s','',1,0]]},
 {t:'Lower Hinge',cat:'lift',ses:['Forță'],ex:[
  ['Trap Bar Deadlift','de','Hinge · viteză','',HYB_RAMP+' Fiecare repetare cât mai rapidă, ca și cum bara ar fi grea; 3–4 RIR. Viteza contează, nu oboseala.',0],
  ['Romanian Deadlift','hyp','Secondary hinge','3×6–10 · 1–2 RIR · pauză 150s','',0],
  ['Back Extension','hyp','Braced hinge · superset','3×8–12 · 1–2 RIR · alternativ cu presa','La 45°, din șold, spatele neutru.',0,0],
  ['Leg Press','hyp','Braced lower push · superset','3×8–12 · 1–2 RIR','',0,0],
  ['Ab Wheel Rollout','core','Core','3×6–12 · pauză 60s','',0],
  ['Hamstring Curl','hyp','Focused hamstring','3×8–12 · 0–2 RIR · pauză 90s','La șezut.',0],
  ['Bulgarian Split Squat','de','Braced push asimetric · viteză','4×4 pe picior · exploziv, 3–4 RIR · pauză 90s','La Smith sau cu gantere ușoare: urcare explozivă, coborâre controlată.',0]]},
 {t:'Plyo + Near-Threshold Run',cat:'run',key:1,ses:['Pliometrie + alergarea de lângă prag (sesiunea-cheie, singură în zi)'],run:'wed',ex:[
  ['Pliometrie','plyo','Încălzire pliometrică','','Cel mult 3–4 exerciții, puține repetări de calitate, pauză completă; te oprești când scade calitatea.',0]]},
 {t:'Upper Pull + VT1',cat:'mix',runAfter:1,ses:['Forță · tracțiuni','VT1 · după forță, în aceeași sesiune sau la 4–6 ore'],run:'thu',ex:[
  ['T-Bar Row','me','Secondary pull','',HYB_RAMP+' Spatele neutru, tragi exploziv.',0],
  ['Lat Pulldown','hyp','Braced pull','3×6–12 · 1–2 RIR · pauză 120s','',0],
  ['Hammer Chest Press','hyp','Braced push','3×6–12 · 1–2 RIR · pauză 120s','',0],
  ['Cable Crunch','core','Core','3×8–12 · pauză 60s','',0],
  ['Tricep Overhead Extension','hyp','Focused push (arms) · superset','3×8–12 · 0–2 RIR · alternativ cu curl-ul','',0],
  ['Incline Dumbbell Curl','hyp','Focused pull (arms) · superset','3×8–12 · 0–2 RIR','',0],
  ['Rear Delt Fly','hyp','Focused pull','3×8–12 · 0–2 RIR · pauză 90s','',0,0]]},
 {t:'Lower Push (Quads)',cat:'lift',ses:['Forță'],ex:[
  ['Box Squat','de','Lower push · viteză','',HYB_RAMP+' Te așezi controlat pe ladă, urci exploziv. Merge și genuflexiunea obișnuită sau cu bara safety.',0,'sk'],
  ['Romanian Deadlift','hyp','Secondary hinge','3×8–12 · 2 RIR · pauză 150s','Mai ușor decât marți: mâine e alergarea lungă.',0],
  ['Back Extension','hyp','Braced hinge · superset','3×8–12 · 1–2 RIR · alternativ cu hack squat-ul','',0,0],
  ['Hack Squat','hyp','Braced lower push · superset','3×8–12 · 1–2 RIR','',0,0],
  ['Roman Chair Leg Raise','core','Core','3×8–15 · pauză 60s','Cu greutate când devine ușor.',0],
  ['Leg Extension','hyp','Focused quadriceps','3×8–12 · 0–2 RIR · pauză 90s','',0],
  ['Bulgarian Split Squat','sk','Braced push asimetric · tehnică','3×4 pe picior · coborâre controlată, urcare rapidă, 3–4 RIR','',0]]},
 {t:'Long Slow Distance',cat:'run',ses:['Alergare lungă · ideal pe teren variat'],run:'sat',ex:[]},
 {t:'Odihnă',cat:'rest',ses:['Liber'],ex:[
  ['Plimbare ușoară','task','','20–40 min, opțional','Viada: ziua liberă nu e obligatorie, dar aici o păstrăm înaintea sprinturilor de luni.',0]]}
];
/* pliometria pe etape (Viada: întâi coordonare și sărituri pe loc, apoi skipping, apoi bounding) */
const HYB_PLYO=['Etapa 1 · coordonare: scara de agilitate (Ickey shuffle) sau șotron, pogo hops pe loc, sărituri pe un picior pe loc · 2–3 serii scurte din fiecare',
  'Etapa 2 · elasticitate: A/B skips, pogo hops, skater hops (de pe un picior pe altul, lateral) · 2–3 serii',
  'Etapa 3 · forță reactivă: A/B skips, bounding (sărituri în lungime alternative), rebound jumps sau sărituri pe un picior · 2–3 serii'];
const hybPlyoSt=wk=>Math.max(1,Math.min(3,1+Math.floor((+wk||0)/3)+(+hyb().lvl||0)));
/* ---------- alergarea: antrenamentele din carte, pe niveluri (1–3); {130} = ritmul la 130% din viteza de prag, {VO2} = vVO2max, {VT1} ---------- */
const HYB_RUN={
 spr:[[ '3 runde × 4×50 m mai repede de {VO2}, din start de pe loc · 1′ mers între repetări, 1′ între runde',
        '2 runde × 4×200 m mai repede de {VO2}, cu start lansat · 2′ între repetări, 3′ între runde',
        '2 runde × 3×300 m @ 130–140% ({130}–{140}), din start de pe loc · pauză completă',
        '2 runde × 3×150 m cu start lansat: 50 m mai repede de {VO2} · 50 m maxim · 50 m mai repede de {VO2} · pauză completă',
        '8 × 25/25 m: din patru labe sau culcat, 25 m accelerare maximă, 25 m mai repede de {VO2} · pauză completă'],
      [ '2 runde × 4×50 m mai repede de {VO2} din start de pe loc (1′ mers) + 2 runde × 2×75 m (2′ mers)',
        '2 runde × 2×200 m mai repede de {VO2}, lansat (2′, 3′ între runde) + 4×50 m lansat la viteză maximă, pauză completă',
        '2 runde × 2×200 m @ 140%+ ({140}) + 2 runde × 2×400 m @ 130–140% ({130}–{140}), din start de pe loc · pauză completă',
        '2 runde × 4×150 m cu start lansat: 50 m mai repede de {VO2} · 50 m maxim · 50 m mai repede de {VO2} · pauză completă',
        '6 × 25/25 m din culcat + 4 × 25/25 m din start în doi timpi, cu oprire bruscă · pauză completă'],
      [ '4×25 m maxim din start de pe loc + 2 runde × 5×50 m mai repede de {VO2} (1′ mers) + 3×100 m (2′ mers)',
        '2 runde × 2×200 m mai repede de {VO2}, lansat + 2 runde × 3×50 m lansat la viteză maximă (2′ între runde)',
        '2×(2×200 m @ 140%+) + 2×(2×400 m @ 130–140%) + 2×200 m maxim, lansat · pauză completă',
        '2 runde × 3×150 m (50 m mai repede de {VO2} · 50 m maxim · 50 m mai repede de {VO2}) + 2×200 m: 50 m lansat, 100 m maxim, 50 m ieșire · pauză completă',
        '6 × 25/25 m din bloc sau culcat + 2 runde × 3×25/25 m din start în trei puncte · pauză completă']],
 mlss:[[ '6 runde: 15 s @ 130% ({130}) · 45 s @ 105% ({105}) · 1′ @ VT1',
         '3 seturi × 4 runde: 40 s @ 130% ({130}) · 20 s @ 50% (mers) · 2′ mers între seturi',
         'Piramidă: 3′ @ 120% · 2′ @ 60% · 2′ @ 120% · 1:20 @ 60% · 1′ @ 120% · 40 s @ 60% · 45 s @ 120% · 30 s @ 60% · 30 s @ 120% · 20 s @ 60% (120% = {120}, 60% = mers/jog)',
         '2 seturi × 3 runde: 45 s @ 125% ({125}) · 45 s @ 115% ({115}) · 30 s @ 100% ({100}) · 1:30 @ VT1 · 2′ mers/jog între seturi'],
       [ '2 seturi × 4 runde: 15 s @ 130% ({130}) · 45 s @ 105% ({105}) · 1′ @ VT1 · 2′ între seturi',
         '5 seturi × 4 runde: 40 s @ 130% ({130}) · 20 s @ 50% (mers) · 2′ mers/jog între seturi',
         'Piramida o dată (3′ … 20 s, 120% = {120}), 2′ mers/jog, apoi încă o dată de la 2′ @ 120%',
         '2 seturi × 4 runde: 45 s @ 125% ({125}) · 45 s @ 115% ({115}) · 30 s @ 100% ({100}) · 1:30 @ VT1 · 2′ între seturi',
         '2 seturi × 3 runde: 10 s @ 100% · 10 s maxim · 50 s @ 115% ({115}) · 1′ @ 95% ({95}) · 1′ @ 90% ({90}) · 2′ @ VT1'],
       [ '3 seturi × 4 runde: 15 s @ 130% ({130}) · 45 s @ 105% ({105}) · 1′ @ VT1 · 2′ între seturi',
         '2 seturi mari × 4 seturi × 4 runde: 40 s @ 130% ({130}) · 20 s @ 50% (mers) · 2′ între seturile mici, 4′ între cele mari',
         'Piramida de 3 ori (120% = {120}), cu 1:30–2′ mers/jog între',
         '3 seturi × 4 runde: 45 s @ 125% ({125}) · 1′ @ 115% ({115}) · 1′ @ 100% ({100}) · 1:30 @ VT1 · 2′ între seturi',
         '3 seturi × 4 runde: 10 s @ 100% · 10 s maxim · 50 s @ 115% ({115}) · 1′ @ 95% ({95}) · 1′ @ 90% ({90}) · 1′ @ VT1 · 1:30 mers între seturi']],
 /* înaintea unei curse de 5 km, MLSS+ de luni ia variantele cu blocuri de 3–4 minute peste prag (indici în mlss) */
 mlssR:[1,2],
 /* lângă prag: doar variantele cu intervale de 5–8 minute, cum recomandă Viada pentru acest program */
 nt:[[ '4×1200 m @ 90% ({90}) · pauza = jumătate din timpul repetării',
       '5 runde: 20 s @ 140% ({140}) · 4:40 @ 92% ({92}) · 1′ jog ușor',
       '4 runde: 2′ @ 95% ({95}) · 15 s @ 115% ({115}) · 1:15 @ 95% · 2′ @ 90% ({90}) · 1:30–2′ @ VT1',
       '5 runde: 3:30 @ 90% ({90}) · 1′ @ VT1, apoi 3 runde: 6′ @ 88% ({88}) · 1′ @ VT1'],
     [ '6×1200 m @ 90% ({90}) · pauza = jumătate din timpul repetării',
       '6 runde: 20 s @ 140% ({140}) · 4:40 @ 92% ({92}) · 1′ jog ușor',
       '2 seturi × 4 runde: 2′ @ 95% ({95}) · 15 s @ 115% ({115}) · 1:15 @ 95% · 2′ @ 90% ({90}) · 1:30–2′ @ VT1 · încă 5′ jog VT1 între seturi',
       '6 runde: 4′ @ 90% ({90}) · 1′ @ VT1, apoi 5 runde: 6′ @ 88% ({88}) · 1′ @ VT1'],
     [ '10×1200 m @ 90% ({90}) · pauza = jumătate din timpul repetării',
       '2 seturi × 4 runde: 20 s @ 140% ({140}) · 4:40 @ 92% ({92}) · 1′ jog · 5′ @ VT1 între seturi',
       '3 seturi × 4 runde: 2′ @ 95% ({95}) · 15 s @ 115% ({115}) · 1:15 @ 95% · 2′ @ 90% ({90}) · 1:30–2′ @ VT1 · încă 5′ jog VT1 între seturi',
       '8 runde: 5′ @ 90% ({90}) · 1:30 @ VT1, apoi 6 runde: 6′ @ 88% ({88}) · 1′ @ VT1, apoi 4 runde: 8:30 @ 85% ({85}) · 1′ @ VT1']],
 /* sesiunile specifice de 5 km (în ultimele 6 săptămâni dinaintea cursei) */
 race:['2 × 5′ @ 105% ({105}) · 3–5′ mers/jog între','4 × 4′ @ 105% ({105}) · 3–5′ mers/jog între','4 × 5′ @ 105% ({105}) · 3–5′ mers/jog între'],
 vt1:['25–30 min @ VT1','45–60 min @ VT1','80–90 min @ VT1'],
 lsd:[[ '45 min @ VT1 cu 2 seturi oriunde: 2 runde × (30 s @ 100% ({100}) · 30 s @ 90% ({90}))',
        '30 min @ VT1 + 5 min în ritm de cursă ({105}) la final',
        '1–1,5 h drumeție sau jog ușor pe teren variat'],
      [ '1 h @ VT1 cu 2 seturi oriunde: 2 runde × (1:30 @ 115% ({115}) · 30 s @ VT1)',
        '60 min @ VT1 cu un singur interval de 5 min @ 95% ({95}) la mijloc + 10 min în ritm de cursă ({105}) la final',
        '1,5 h fartlek la VT1, cu 6×3 min @ 85% ({85}) pe parcurs',
        '1,5–2,5 h drumeție sau jog ușor pe teren variat'],
      [ '1,5 h @ VT1 cu 3 seturi: 3 runde × (1′ @ 115% ({115}) · 30 s VT1) sau 2 runde × (4′ @ 95% ({95}) · 1′ VT1)',
        '90–120 min @ VT1 cu 10 min @ 95% ({95}) la mijloc + 15 min în ritm de cursă ({105}) la final',
        '2–2,5 h fartlek la VT1, cu 6×4 min @ 85% ({85})',
        '3 h sau mai mult de drumeție sau jog ușor pe teren variat']]
};
/* nivelurile din carte pentru acest program: sprint 1, MLSS 1, lângă prag 3, VT1 1, lunga 2; „Începător” coboară un nivel, „Avansat” urcă unul */
const HYB_BASE={spr:1,mlss:1,nt:3,vt1:1,lsd:2};
const HYB_LVL=[[-1,'Începător'],[0,'Standard (carte)'],[1,'Avansat']];
const hybL=k=>Math.max(1,Math.min(3,HYB_BASE[k]+hyb().lvl));
const hybPick=(a,i)=>a[((i%a.length)+a.length)%a.length];
/* ritmurile: pragul din testul Viada, altfel cel din aplicație (setat sau din alergările de prag) */
function hybThr(){ const H=hyb(); if(+H.thr>0) return {v:+H.thr,src:'testul vVO2max din HYBRID'}; const t=thrPace(); return t?{v:t.v,src:t.src}:null; }
function hybVt1(){ const H=hyb(), t=hybThr(); if(+H.vt1p>0) return {v:+H.vt1p,src:'testul vorbirii'}; return t?{v:t.v/.8,src:'estimat (~80% din viteza de prag), fă testul vorbirii'}:null; }
const hybPace=p=>{ const t=hybThr(); return t?mmss(t.v/(p/100))+'/km':''; };
function hybFill(s){ const t=hybThr(), v1=hybVt1();
  if(!t) s=s.replace(/ \(\{\d+\}(–\{\d+\})?\)/g,'');
  return s.replace(/\{(\d+)\}/g,(_,p)=>t?hybPace(+p):p+'% din prag').replace(/\{VO2\}/g,t?'vVO2max ('+mmss(t.v*.88)+'/km)':'vVO2max').replace(/VT1(?![\d(])/g,v1?'VT1 (~'+mmss(v1.v)+'/km'+(hyb().vt1h?', ≤'+hyb().vt1h+' bpm':'')+')':'VT1'); }
const HYB_WU={spr:'5′ jog ușor, 3×20 m fandări din mers, 2×30 s călcâie la fese, 3 runde × (10 s pompat cu brațele așezat · 10 s în picioare · 10 s „coate sus”)',
  thr:'10′ jog ușor, 3×20 m fandări din mers, 2×10 genuflexiuni Cossack pe parte · la final 8′ jog ușor'};
/* deriva cardiacă (Viada): sesiunea ușoară se oprește când pulsul urcă cu ~5% la același ritm (5% la sportivii hibrizi cu multe sesiuni) */
const HYB_DRIFT=' · te oprești când, la același ritm, pulsul a urcat cu ~5% (deriva cardiacă)';
/* sesiunea de alergare a zilei, pentru săptămâna wk (rotim antrenamentele: Viada recomandă să le încerci pe toate) */
function hybRunLines(kind,wk,dl){ const H=hyb(), L=[];
  if(kind==='mon'){ const ls=dl?1:hybL('spr'), lm=hybL('mlss'), ml=HYB_RUN.mlss[lm-1];
    L.push(['Încălzire',HYB_WU.spr]); L.push(['Sprint / putere · nivel '+ls,hybFill(hybPick(HYB_RUN.spr[ls-1],wk))+(dl?' · deload':' · fără revenire, treci direct la MLSS')]);
    if(!dl) L.push(['MLSS+ · nivel '+lm,hybFill(hybPick(H.race?HYB_RUN.mlssR.map(i=>ml[i]):ml,wk))+(H.race?' · înaintea cursei: blocuri de 3–4 minute peste prag':'')+' · fără încălzire (o ai de la sprint); poți scoate câteva intervale ca totalul să fie ~45–50 min']);
    L.push(['Revenire','5′ jog ușor sau bicicletă']); }
  else if(kind==='wed'){ L.push(['Încălzire',HYB_WU.thr]);
    if(dl) L.push(['Tempo de cursă · nivel 1',hybFill(HYB_RUN.race[0])+' · deload']);
    else if(H.race) L.push(['Specific 5 km · nivel '+hybL('nt'),hybFill(HYB_RUN.race[hybL('nt')-1])+' · în ultimele 6 săptămâni: ritm de cursă și pauze cu 25% mai lungi']);
    else L.push(['Lângă prag (NT) · nivel '+hybL('nt'),hybFill(hybPick(HYB_RUN.nt[hybL('nt')-1],wk))+' · fiecare interval la fel de bine ca primul']); }
  else if(kind==='thu'){ if(!dl) L.push(['VT1 · nivel '+hybL('vt1'),hybFill(HYB_RUN.vt1[hybL('vt1')-1])+' · după forță · testul vorbirii după 5 și după 20 de minute; merge și pe bicicletă, vâslit sau eliptică'+HYB_DRIFT]); }
  else if(kind==='sat'){ if(dl) L.push(['VT1 · nivel 1',hybFill(HYB_RUN.vt1[0])+' · deload, în locul alergării lungi'+HYB_DRIFT]);
    else { const l=hybL('lsd'); L.push(['Long slow distance · nivel '+l,hybFill(hybPick(HYB_RUN.lsd[l-1],wk))+HYB_DRIFT]); } }
  return L; }
/* ---------- forța: greutatea din maximul de antrenament, după cercul repetărilor ---------- */
const hybR25=v=>Math.round(v/2.5)*2.5;
/* maximul de antrenament în săptămâna wk: +1% la fiecare cerc început după ce l-ai setat (0 înainte de setare) */
function hybTmAt(n,wk){ const t=(hyb().tm||{})[n]; wk=+wk||0; if(!t||!(+t.kg>0)||wk<(+t.wk||0)) return 0; return +t.kg*(1+.01*Math.max(0,Math.floor(wk/3)-Math.floor((+t.wk||0)/3))); }
const hybTmOf=n=>hybTmAt(n,+hyb().wk||0);
/* 1RM estimat din istoricul exercițiului (ultimele 8 săptămâni), pentru a propune maximul de antrenament */
function hybHistTm(n){ const h=(S.lifts||{})[n]||[], from=dayShift(todayKey(),-56); let b=0;
  h.forEach(e=>{ if(e.d>=from) (e.s||[]).forEach(([w,r])=>{ if(r>0&&r<=10) b=Math.max(b,e1rm(w,r)); }); }); return b?hybR25(b*.96):0; }
function hybEx(e,x,wk,dl){ const [n,ty,cat,pr,cue,ses,dx]=e, c=wk%3, t=dl&&typeof dx==='string'?dx:ty;
  let txt=pr;
  if(HYB_CIRC[t]&&HYB_TM.indexOf(n)>=0){ const [s,r,p]=HYB_CIRC[t][c], tm=hybTmOf(n), kg=tm?hybR25(tm*p/100):0;
    txt=(dl&&t!=='me'?Math.max(2,s-2):s)+'×'+r+' @ '+p+'%'+(kg?' → '+num(kg)+' kg':' din maximul de antrenament')+(t==='me'?' · fără eșec · pauză 180s':t==='de'?' · viteză maximă, 3–4 RIR · pauză 120s':' · 3–4 RIR · pauză 120s')+(dl?' · deload':''); }
  else if(ty==='plyo') txt=HYB_PLYO[hybPlyoSt(wk)-1];
  return {x,n,ty:t,cat,p:txt,cue,ses,dx,kind:ty==='hyp'||ty==='core'||HYB_CIRC[ty]?'lift':'task'}; }
function hybDay(d,wk){ const H=hyb(), dl=!!H.dl, b=HYB_DAYS[d]; wk=+wk||0;
  const ex=b.ex.map((e,x)=>hybEx(e,x,wk,dl)).filter(e=>!(dl&&e.dx===0));
  return {d,t:b.t,cat:b.cat,key:b.key,ses:b.ses,runAfter:b.runAfter,ex,run:b.run?hybRunLines(b.run,wk,dl):[]}; }
const hybKey=(wk,d)=>'w'+wk+'d'+d;
const hybDone=(wk,d,x)=>!!(((hyb().log||{})[hybKey(wk,d)]||{})[x]);
/* un antrenament de alergare se bifează ca un singur element, cu cheia 'r' */
function hybItems(day){ return day.ex.map(e=>String(e.x)).concat(day.run.length?['r']:[]); }
const hybDayFull=(wk,d)=>{ const it=hybItems(hybDay(d,wk)); return it.length>0&&it.every(x=>hybDone(wk,d,x)); };
/* ---------- deload la nevoie (Viada): ridicările ME sub țintă două săptămâni la rând ---------- */
/* pentru fiecare săptămână HYBRID făcută în ghidat (fără deload): au ieșit toate ridicările ME la țintă (serii × repetări la greutatea din cerc)? */
function hybMeWeeks(){ const dlw=hyb().dlw||[], res={};
  (S.hist||[]).forEach(r=>{ if(!r.hy||r.w==null||dlw.indexOf(r.w)>=0) return; const b=HYB_DAYS[r.d]; if(!b) return;
    b.ex.forEach(e=>{ if(e[1]!=='me'||HYB_TM.indexOf(e[0])<0) return; const tm=hybTmAt(e[0],r.w), ent=((S.lifts||{})[e[0]]||[]).find(x=>x.d===r.date); if(!tm||!ent) return;
      const [s,rp,p]=HYB_CIRC.me[r.w%3], kg=hybR25(tm*p/100), ok=(ent.s||[]).filter(([w,n])=>w>=kg&&n>=rp).length>=s;
      res[r.w]=res[r.w]!==false&&ok; }); });
  return res; }
/* propunem deload când ultimele două săptămâni cu ME, consecutive și recente, au ieșit sub țintă */
function hybDlHint(){ const H=hyb(), wk=+H.wk||0; if(H.dl) return false; const m=hybMeWeeks(), ws=Object.keys(m).map(Number).filter(w=>w<=wk).sort((a,b)=>b-a);
  return ws.length>=2&&ws[0]>=wk-1&&ws[0]-ws[1]===1&&!m[ws[0]]&&!m[ws[1]]; }
/* ---------- testul de prospețime (Viada): 7 sărituri în lungime luni, fără cea mai lungă și cea mai scurtă, media celorlalte 5 ---------- */
function hybBj(){ const a=(hyb().bj||[]).slice(-8); if(!a.length) return null; const last=a[a.length-1], prev=a.slice(0,-1).slice(-4);
  const ref=prev.length?prev.reduce((s,x)=>s+x.v,0)/prev.length:null; return {last,ref,drop:ref!=null?ref-last.v:0}; }
function hybBjHTML(){ const b=hybBj();
  return `<div class="ex"><span class="tick" style="visibility:hidden"></span><div class="sp"><div class="ex-n">Testul de prospețime</div>
    <div class="ex-p">7 sărituri în lungime de pe loc · scoți cea mai lungă și cea mai scurtă · media celorlalte 5, în cm</div>
    ${b?`<div class="ex-l">Ultima: ${num(b.last.v)} cm (${relDay(b.last.d)})${b.ref!=null?' · media dinainte '+num(b.ref)+' cm':''}</div>`:''}
    ${b&&b.drop>=6?`<div class="ex-l ex-mw">${ic('alert')} Cu ${num(b.drop)} cm sub medie: oboseală centrală. Azi fără sprinturi și pliometrie; fă doar partea MLSS mai ușor sau o alergare VT1.</div>`:b&&b.ref!=null?`<div class="ex-l ex-mw">${ic('check')} Ești proaspăt: sprinturile de azi merg la calitate maximă.</div>`:''}
    <div class="inrow" style="margin-top:8px"><input class="inp" id="hybBj" type="number" inputmode="decimal" step="1" placeholder="Media în cm" aria-label="Media săriturilor în cm"><button class="btn ghost sm" data-a="hybBjSave">${ic('check')} Salvează</button></div></div></div>`; }
/* sesiunea 1: exercițiile ei, apoi alergarea; sesiunea 2: forța (joi invers: forța, apoi VT1 în sesiunea 2) */
function hybExHTML(wk,day){
  const hd=s=>day.ses.length>1?`<div class="ses-h"><b>SESSION ${s+1}</b><span>${esc(day.ses[s])}</span></div>`:'';
  const exRow=e=>{ const on=hybDone(wk,day.d,String(e.x));
    return `<div class="ex ${on?'done':''}"><button class="tick ${on?'on':''}" data-a="hybTick" data-d="${day.d}" data-k="${e.x}" aria-label="${on?'Debifează':'Bifează'} ${esc(e.n)}">${ic('check')}</button>
      <div class="sp"><div class="ex-n">${esc(e.n)}</div><div class="ex-p">${esc([e.kind==='lift'?HYB_TYPE[e.ty]:'',e.cat,e.p].filter(Boolean).join(' · '))}</div>${e.cue?`<div class="ex-l ex-mw">${ic('bolt')} ${esc(e.cue)}</div>`:''}${lastLine(e)}</div>
      ${e.kind==='lift'?`<button class="xb" data-a="tech" data-k="${esc(e.n)}" aria-label="Tehnică pentru ${esc(e.n)}">${ic('info')}</button>`:''}</div>`; };
  const runRow=()=>{ const on=hybDone(wk,day.d,'r');
    return `<div class="ex ${on?'done':''}"><button class="tick ${on?'on':''}" data-a="hybTick" data-d="${day.d}" data-k="r" aria-label="${on?'Debifează':'Bifează'} alergarea">${ic('check')}</button>
      <div class="sp"><div class="ex-n">Alergarea</div>${day.run.map(([h,x])=>`<div class="ex-p"><b>${esc(h)}:</b> ${esc(x)}</div>`).join('')}</div></div>`; };
  const s0=day.ex.filter(e=>!e.ses), s1=day.ex.filter(e=>e.ses), rn=day.run.length?(day.runAfter?hd(1):'')+runRow():'';
  return hd(0)+(day.d===0?hybBjHTML():'')+s0.map(exRow).join('')+rn+(s1.length?hd(1)+s1.map(exRow).join(''):''); }
/* ---------- notele zilelor: de ce e construită așa săptămâna ---------- */
const HYB_NOTES=[
 ['Viteza întâi, apoi forța pentru partea de sus',[
  ['Ordinea','Regula „tehnica întâi”: sprinturile au nevoie de prospețime, deci alergarea e dimineața. După o alergare grea ca asta, Viada lasă 6–8 ore și o masă completă până la forță.'],
  ['Sprint + MLSS','O singură alergare: sprinturi scurte, apoi direct MLSS (timp aproape de prag, cu oboseala ținută sub control). Sprinturile nu sunt antrenament de anduranță, ci de putere: pauză completă între ele.'],
  ['Testul de prospețime','După weekend, oboseala centrală nu se vede în HRV. Viada măsoară săriturile în lungime: dacă media scade cu 6–7 cm, azi nu faci sprinturi.']]],
 ['Ziua de hinge',[
  ['Deadliftul pentru viteză','Prima ridicare e DE: încărcare de 70–80%, puține repetări, viteză maximă. Pregătește sistemul nervos și antrenează forța explozivă, fără să adune oboseală.'],
  ['De ce nu alergi azi','Mâine e sesiunea-cheie. Hinge-ul distribuie oboseala pe spate și femurali, deci picioarele rămân bune pentru intervalele de mâine.'],
  ['Hipertrofia','Seturi de 6–12, 1–2 repetări în rezervă. Viada: mai bine un set în plus cu câteva repetări în rezervă decât unul mai puțin până la eșec.']]],
 ['Sesiunea-cheie a săptămânii',[
  ['De ce e „keystone”','Alergarea de lângă prag e cea mai grea și cea mai importantă. Cere prospețime, de aceea vine după o zi fără picioare grele.'],
  ['Fără sală azi','În tabelul din carte, miercuri are doar pliometria și alergarea: ajungi la sesiunea-cheie odihnit și nu o încarci cu oboseala de la sală. Tracțiunile se fac joi.'],
  ['Cum alergi intervalele','Viada recomandă aici intervale de 5–8 minute, la 85–95% din viteza de prag, cu pauze cât să faci fiecare interval la fel de bine ca primul. Contează timpul total petrecut lângă prag, nu cât de obosit termini: „lucrat, nu distrus”.'],
  ['Pliometria','Câteva exerciții bune înaintea alergării îmbunătățesc calitatea vitezei. Forța + pliometria + alergarea dau cea mai bună economie de alergare. Progresezi pe etape: coordonare și sărituri pe loc, apoi skipping, apoi bounding.'],
  ['Cursă de 5 km','În ultimele 6 săptămâni dinaintea cursei, activează „Cursă de 5 km” din antet: aici intră ritmul de cursă cu pauze cu 25% mai lungi, iar luni MLSS-ul trece pe blocuri de 3–4 minute. În săptămâna cursei folosește deload-ul (varianta Taper din carte).']]],
 ['Tracțiuni, apoi VT1',[
  ['Ordinea','Forța întâi, VT1 la final: munca ușoară e singura care câștigă din puțină preoboseală (regula 5 a lui Viada). O faci imediat după sau separat, la 4–6 ore.'],
  ['Intensitatea VT1','Sub primul prag ventilator: spui fără efort o propoziție de 20 de cuvinte. Fă testul vorbirii după 5 și după 20 de minute.'],
  ['Zona 2 după Viada','Zona 2 e ca carbohidrații într-o dietă de performanță: întâi pui munca de viteză și de prag, apoi completezi cu zona 2 cât poți recupera. Pentru cine are 3–4 ore de anduranță pe săptămână, zona 2 nu trebuie să fie 80%. Primele ~10 minute de alergare ușoară aproape nu contează, deci mai bine o sesiune de 30–40 de minute decât mai multe de 10.'],
  ['Cross-training','Merge bicicleta, vâslitul sau eliptica, dacă ești deja bun la ele. Cross-trainingul e pentru munca ușoară, nu pentru prag sau sprint.']]],
 ['Ziua de cvadricepși',[
  ['Ordinea','Ghemuirea pentru viteză întâi, apoi hipertrofia; core-ul înaintea izolării, iar exercițiul asimetric la final, pentru tehnică.'],
  ['Înainte de alergarea lungă','Puțină oboseală în picioare înaintea alergării lungi e acceptată: Viada o vede ca un plus pentru economie și ritm, iar munca VT1 beneficiază de pre-oboseală.']]],
 ['Alergarea lungă',[
  ['Cum o faci','Ideal pe teren variat. Alergătorii mai buni ajung la 90–100 de minute cu intervale la prag; ceilalți aleg variantele fartlek mai scurte.'],
  ['Cât de lungă','Peste ~2 ore stimulul aproape nu mai crește, iar oasele și tendoanele câștigă mai ales din primele 60–90 de minute. Te oprești când, la același ritm, pulsul a urcat cu ~5% (deriva cardiacă).']]],
 ['Odihnă',[
  ['Recuperarea','Somn, mâncare și o plimbare: astea fac aproape toată recuperarea; gadgeturile de recuperare contează foarte puțin. Programul nu are deload programat: îl iei când trebuie (vezi antetul).'],
  ['Mai ai recuperare?','Viada: dacă simți că rămâne recuperare neconsumată, poți adăuga una-două sesiuni scurte VT1 (alergare sau bicicletă) sau puțin sport de plăcere. Le scoți dacă ridicările ME încep să scadă.']]]
];
/* principiile lui Viada, pe scurt */
const HYB_PRIN=[
 ['Doza minimă eficientă + 1','Nu contează cât poți antrena, ci din cât îți poți reveni și cât te adaptezi. Fiecare serie și fiecare kilometru au un scop; fără volum „de umplutură”.'],
 ['Consolidarea factorilor de stres','Pentru fiecare sesiune te întrebi: de ce am nevoie azi și ce fel de oboseală m-ar împiedica să ating stimulul? Sesiunile-cheie (aici, alergarea de miercuri) se pun acolo unde ești cel mai odihnit.'],
 ['Ordinea dintr-o zi','Tehnica întâi, apoi lucrul exploziv, apoi forța și hipertrofia, iar la final munca ușoară care consumă energie (VT1). După o alergare de prag dimineața, lasă 6–8 ore și o masă completă până la forță; după o alergare VT1 de sub o oră ajung 4–6 ore.'],
 ['Încălzirea','RAMP: ridici pulsul 3–5 minute, faci mișcările zilei fără greutate, apoi încarci progresiv. Fără rulat și stretching lung înainte: încălzirea pregătește, nu obosește. Ultimul set de încălzire e primul set de lucru.'],
 ['Hipertrofia','8–12 seturi pe mușchi pe săptămână, la 0–2 repetări în rezervă, 6–12 repetări (8–10 e un compromis bun), tempo controlat. Compusele grele rămân pentru forță; hipertrofia se face mai ales la aparate și cabluri. Seriile pornesc de la capătul de jos și cresc doar dacă progresezi și îți revii ușor.'],
 ['Progresia','Cercul repetărilor: aceleași procente se rotesc 3 săptămâni (de ex. 90%, 93%, 96% la ME), apoi maximul de antrenament urcă cu 1%. Pragul se ajustează cu câteva secunde pe km după ~6 săptămâni în care sesiunile ies ușor. Fără retestări frecvente.'],
 ['Greu e greu, ușor e ușor','Același stimul merge săptămâni la rând; nu trebuie să bați un record la fiecare antrenament. Progresezi ajustând pragul și maximul de antrenament, nu adăugând kilometri sau niveluri.'],
 ['Oboseala ascunde forma','În antrenamentul hibrid ai mai des zile slabe: judeci tendința pe 2–3 săptămâni, nu o sesiune. Ceasurile inteligente nu deosebesc oboseala bună de după sală de stresul rău, deci le iei doar ca o parte din imagine.'],
 ['Deload la nevoie','Nu e programat. Când ridicările ME ies sub țintă două săptămâni la rând, faci o săptămână de deload (aplicația ți-o propune singură). Dacă nici după deload nu ies, maximul de antrenament e prea sus: refă testul.'],
 ['Interferența','Se rezolvă cu două lucruri: destule calorii pentru recuperare și destulă odihnă între sesiunile care se încurcă. În deficit caloric nu crește volumul, iar kilometrii cresc treptat: oasele se adaptează la alergare mai încet decât mușchii și inima.'],
 ['Deriva cardiacă','La alergările ușoare și lungi te oprești când, la același ritm, pulsul a urcat cu ~5% (Viada: 5% pentru sportivii hibrizi cu multe sesiuni, 10% în rest). Peste ~2 ore câștigul e mic.'],
 ['Pliometria','Alergare + forță + pliometrie dau cea mai bună economie de alergare. Cel mult 3–4 exerciții pe zi, cu pauză completă și fără oboseală; întâi coordonare și sărituri pe loc, apoi skipping și bounding.'],
 ['Tehnica de alergare','Nu-ți forța aterizarea pe vârf; evită doar pasul prea lung, în fața corpului. Pliometria și creșterea treptată a kilometrilor ajută mai mult decât corectarea pasului. Încălțămintea: cea mai comodă, ideal două perechi, schimbate la timp.'],
 ['Variază forma, nu scopul','Schimbi lungimea intervalelor și seriile/repetările, dar păstrezi același stimul. Din când în când schimbi ordinea, ca să nu faci mereu aceeași sesiune obosit.'],
 ['Evoluezi, nu sari','Schimbi volumul fiecărui tip de efort (minute sub VT1, minute lângă prag, seturi grele) cu cel mult 5–10% pe săptămână. Creșterile prea rapide sunt cea mai des întâlnită cauză de eșec. În sportul nou ești „centură albă”: începi mic, dar folosești ce știi deja (forța, săriturile).']
];
/* ---------- fila HYBRID ---------- */
function viewHybrid(){
  const H=hyb(), wk=+H.wk||0, c=wk%3, t=hybThr(), v1=hybVt1(), dl=!!H.dl, dlHint=hybDlHint(), thrDue=!!H.thrAt&&daysBetween(H.thrAt,todayKey())>=42;
  const done=HYB_DAYS.filter((_,d)=>hybDayFull(wk,d)).length;
  const missTm=HYB_TM.filter(n=>!hybTmOf(n));
  const days=HYB_DAYS.map((_,d)=>{ const day=hybDay(d,wk), it=hybItems(day), dn=it.filter(x=>hybDone(wk,d,x)).length, open=S.hybOpen===d, col=catCol(day.cat), cc=CAT[day.cat];
    return `<div class="card day ${open?'open':''}" id="hday${d}" style="--c:${col}">
      <button class="day-h" data-a="hybDayT" data-d="${d}" aria-expanded="${open}">
        <span class="day-bar"></span>${dayBadge(d,it.length&&dn===it.length?'done':'')}
        <span class="sp"><span class="day-k">${DAYN[d]}${day.key?' · sesiunea-cheie':''}</span><span class="day-t" style="display:block">${esc(day.t)}</span>
          <span class="day-m" style="display:block">${cc[0]} · ${dn}/${it.length} bifate${dl?' · deload':''}</span></span>
        ${it.length&&dn===it.length?`<span class="tag pr">${ic('check')}</span>`:ring(it.length?dn/it.length:0,{s:34,sw:3,c:col})}
        <span class="chev">${ic('down')}</span></button>
      <div class="day-b"><div>${hybExHTML(wk,day)}
        <details class="notes"><summary>${ic('info')} ${esc(HYB_NOTES[d][0])}</summary>${HYB_NOTES[d][1].map(([a,x])=>`<p><b>${esc(a)}.</b> ${esc(x)}</p>`).join('')}</details>
        <div class="day-act inrow"><button class="btn pri" style="flex:1" data-a="hybStart" data-d="${d}">${ic('play')} ${S.sess&&S.sess.hy&&S.sess.d===d?'Continuă ziua':dn&&dn<it.length?'Continuă ziua':dn===it.length&&it.length?'Reia ziua':'Începe ziua'}</button></div></div></div></div>`; }).join('');
  const tmRows=HYB_TM.map(n=>{ const v=hybTmOf(n), h=hybHistTm(n);
    return `<div class="list-row"><span class="sp"><b>${esc(n)}</b><span class="xs mu" style="display:block">${v?'maxim de antrenament '+num(hybR25(v))+' kg':'nesetat'}${!v&&h?' · din istoric: '+num(h)+' kg':''}</span></span>
      ${!v&&h?`<button class="btn ghost sm" data-a="hybTmHist" data-k="${esc(n)}">Folosește</button>`:''}</div>`; }).join('');
  return `
  <div class="card plan-hd"><div class="eyebrow">${ic('activity')} HYBRID · Alex Viada</div><div class="h3" style="margin-top:4px">Hypertrophy + 5K</div>
    <div class="sm mu">4 zile de forță (sus și jos de câte 2 ori) · sprint + MLSS · lângă prag · VT1 · alergarea lungă · 1 zi liberă</div>
    <div class="bar"><i style="width:${(done/7*100).toFixed(1)}%"></i></div>
    <div class="cyc-bar"><span>Săptămâna ${wk+1} · cercul repetărilor ${c+1}/3</span><span>${done} din 7 zile complete</span></div>
    <div class="inrow" style="margin-top:12px"><button class="btn ghost sm" data-a="hybWk" data-i="-1" ${wk?'':'disabled'} aria-label="Săptămâna anterioară">${ic('left')}</button>
      <button class="btn ${done===7?'pri':'ghost'} sm" style="flex:1" data-a="hybWk" data-i="1">${ic('right')} Săptămâna ${wk+2}</button>
      <button class="btn ${dl?'pri':'ghost'} sm" data-a="hybDl">${ic('leaf')} Deload</button></div>
    <div class="chips" style="margin-top:12px">${HYB_LVL.map(([v,l])=>`<button class="chip ${(+H.lvl||0)===v?'on':''}" data-a="hybLvl" data-i="${v}">${l}</button>`).join('')}
      <button class="chip ${H.race?'on':''}" data-a="hybRace">${ic('flag')} Cursă de 5 km în ≤6 săpt.</button></div>
    ${dl?`<div class="note">Săptămâna de deload (varianta Taper/Deload din carte): luni DE în loc de ME și doar sprintul; marți și vineri fără supersetul de la aparate, iar vineri genuflexiunea e pentru tehnică; joi fără VT1 și fără fluturări; miercuri tempo de cursă; sâmbătă VT1 în locul alergării lungi. O iei când ridicările ME ies sub țintă două săptămâni la rând sau în săptămâna unei curse.</div>`:''}
    ${dlHint?`<div class="note">${ic('alert')} <b>Ridicările ME au ieșit sub țintă două săptămâni la rând.</b> Viada: o săptămână de deload, apoi continui cercul de unde ai rămas.<div style="margin-top:8px"><button class="btn ghost sm" data-a="hybDl">${ic('leaf')} Pornește deload-ul</button></div></div>`:''}
    ${thrDue?`<div class="note">${ic('target')} Au trecut 6 săptămâni de la ultima ajustare a pragului. Dacă sesiunile de prag au ieșit ușor (puls și efort mai mici), mută-l cu 3 s/km mai repede din Pretestare.</div>`:''}</div>
  <div class="card"><details ${(!t||missTm.length)?'open':''}><summary class="h3" style="cursor:pointer">${ic('target')} Pretestare · ritmuri și maxime</summary>
    <div class="dsec"><h4>Ritmurile</h4>
      <div class="list-row"><span class="sp">Prag (VT2)</span><span class="v">${t?mmss(t.v)+' /km':'—'}</span></div>
      <div class="list-row"><span class="sp">vVO2max</span><span class="v">${t?mmss(t.v*.88)+' /km':'—'}</span></div>
      <div class="list-row"><span class="sp">VT1</span><span class="v">${v1?'~'+mmss(v1.v)+' /km':'—'}${H.vt1h?' · ≤'+H.vt1h+' bpm':''}</span></div>
      <div class="xs mu" style="margin:6px 0">${t?'Sursa pragului: '+esc(t.src)+'.':'Fără ritmuri, alergările arată procentele din prag.'}${v1?' VT1: '+esc(v1.src)+'.':''}</div>
      <div class="list-row"><span class="sp">Ajustarea pragului<span class="xs mu" style="display:block">${H.thrAt?'ultima schimbare: '+relDay(H.thrAt):'după ~6 săptămâni în care sesiunile ies ușor'}</span></span>
        <button class="btn ghost sm" data-a="hybThrAdj" data-i="-3" ${t?'':'disabled'} aria-label="Pragul mai repede cu 3 secunde pe kilometru">−3 s/km</button>
        <button class="btn ghost sm" data-a="hybThrAdj" data-i="3" ${t?'':'disabled'} aria-label="Pragul mai încet cu 3 secunde pe kilometru">+3 s/km</button></div>
      <p class="sm mu" style="margin-top:8px">Viada nu retestează des: când sesiunile ies mai ușor decât trebuie (puls mai mic la final, efort mai mic, pauze de care nu mai ai nevoie), muți pragul cu câteva secunde pe km și continui. Dacă ies constant prea grele, îl muți înapoi.</p>
      <p class="sm mu"><b>Testul vVO2max (Viada).</b> 6–8′ jog, 2 accelerări de 100 m, 3×30 s rapid cu 1′ mers, 1′ pauză, apoi cât de departe poți: 12 min (sub 2 ani de alergare), 10 min (2–4 ani) sau 8 min (peste 4 ani). Pragul = 88% din viteza medie.</p>
      <div class="chips">${[[12,'12 min'],[10,'10 min'],[8,'8 min']].map(([m,l])=>`<button class="chip ${(+H.tMin||10)===m?'on':''}" data-a="hybTMin" data-i="${m}">${l}</button>`).join('')}</div>
      <div class="inrow" style="margin-top:8px"><input class="inp" id="hybKm" type="number" inputmode="decimal" step="0.01" placeholder="Distanța în km (ex. 2,45)" aria-label="Distanța din test în km"><button class="btn ghost sm" data-a="hybTestSave">${ic('check')}</button></div>
      <p class="sm mu" style="margin-top:12px"><b>Testul vorbirii (VT1).</b> Pornești foarte ușor și crești viteza la fiecare 30 s, recitând o propoziție de ~20 de cuvinte. Notezi ultimul ritm și pulsul la care o mai spui fără să tragi aer.</p>
      <div class="inrow"><input class="inp" id="hybVt1p" placeholder="Ritm (ex. 6:45)" aria-label="Ritmul VT1 în minute pe km"><input class="inp" id="hybVt1h" type="number" inputmode="numeric" placeholder="Puls" aria-label="Pulsul la VT1"><button class="btn ghost sm" data-a="hybVt1Save">${ic('check')}</button></div></div>
    <div class="dsec"><h4>Maximul de antrenament</h4>
      <p class="sm mu">Testul de 5 repetări: încălzire până la ~75% din maximul estimat (A) pentru 6 repetări; apoi 5 repetări cu A + 10%; apoi cât poți cu încă +5% (greutatea E, repetările F). Maximul de antrenament = media Epley și Brzycki × 0,96.</p>
      ${tmRows}
      <div class="inrow" style="margin-top:8px"><select class="inp" id="hybTmEx" aria-label="Exercițiul">${HYB_TM.map(n=>`<option>${esc(n)}</option>`).join('')}</select></div>
      <div class="inrow" style="margin-top:8px"><input class="inp" id="hybTmKg" type="number" inputmode="decimal" step="0.5" placeholder="Greutatea E (kg)" aria-label="Greutatea E"><input class="inp" id="hybTmR" type="number" inputmode="numeric" placeholder="Repetări F" aria-label="Repetările F"><button class="btn ghost sm" data-a="hybTmSave">${ic('check')}</button></div></div>
  </details></div>
  ${days}
  <div class="card"><details><summary class="h3" style="cursor:pointer">${ic('bulb')} Principiile lui Viada</summary>
    ${HYB_PRIN.map(([a,x])=>`<p class="sm"><b>${esc(a)}.</b> ${esc(x)}</p>`).join('')}
    <div class="note">Surse: Alex Viada, The Ultimate Hybrid Athlete (Victory Belt, 2025), citită integral: programul Hypertrophy + 5K (varianta standard și Taper/Deload), pretestarea, exercițiile și toate antrenamentele de alergare, plus capitolele despre sisteme, oboseală, factori de stres, programare, sporturi și concepte avansate. Interviuri: Rox Lyfe (2026), Jordan Syatt (2025), Coach 'Em Up ep. 93. Exercițiile de core sunt adăugate peste tabelul din carte, la locul cerut de regula 4. Nutriția din carte nu e folosită: în aplicație, nutriția rămâne după Layne Norton. Fila Plan (Dr. Milo Wolf) rămâne neschimbată.</div></details></div>`;
}
ACT.hybDayT=(el,{D})=>{ S.hybOpen=S.hybOpen===D?-1:D; const c=$('#hday'+D); if(c){ document.querySelectorAll('[id^="hday"].open').forEach(o=>{ if(o!==c) o.classList.remove('open'); });
  c.classList.toggle('open',S.hybOpen===D); c.querySelector('.day-h').setAttribute('aria-expanded',S.hybOpen===D); } };
ACT.hybTick=async(el,{D,k})=>{ const H=hyb(), wk=+H.wk||0, log=Object.assign({},H.log||{}), key=hybKey(wk,D), day=Object.assign({},log[key]||{}), on=!day[k];
  if(on) day[k]=1; else delete day[k]; log[key]=day; await hybSave({log}); render(); if(on) buzz(15); };
ACT.hybWk=async(el,{I})=>{ const H=hyb(), wk=Math.max(0,(+H.wk||0)+I); await hybSave({wk,dl:false}); S.hybOpen=-1; render(); window.scrollTo({top:0});
  if(I>0&&wk%3===0) toast('Cerc nou','Maximele de antrenament au urcat cu 1%.','info'); };
/* săptămânile de deload se țin minte, ca verificarea ridicărilor ME să le sară */
ACT.hybDl=async()=>{ const H=hyb(), on=!H.dl, wk=+H.wk||0, dlw=(H.dlw||[]).filter(x=>x!==wk).concat(on?[wk]:[]); await hybSave({dl:on,dlw}); render(); };
ACT.hybLvl=async(el,{I})=>{ await hybSave({lvl:Math.max(-1,Math.min(1,I))}); render(); };
ACT.hybRace=async()=>{ await hybSave({race:!hyb().race}); render(); };
ACT.hybTMin=async(el,{I})=>{ await hybSave({tMin:I}); render(); };
ACT.hybTestSave=async()=>{ const km=parseFloat(String(($('#hybKm')||{}).value||'').replace(',','.')), m=+hyb().tMin||10;
  if(!(km>.5&&km<8)) return toast('Distanța lipsește','Scrie câți km ai parcurs în test.','info');
  const v=km*60/m, thr=60/(v*.88); await hybSave({thr,thrAt:todayKey()}); toast('Pragul salvat',mmss(thr)+' /km · vVO2max '+mmss(60/v)+' /km','info'); render(); };
/* ajustarea pragului fără retestare (Viada): câteva secunde pe km, când sesiunile ies constant mai ușor sau mai greu */
ACT.hybThrAdj=async(el,{I})=>{ const t=hybThr(); if(!t) return; const thr=t.v+(+I||0)/60;
  await hybSave({thr,thrAt:todayKey()}); toast('Pragul ajustat',mmss(thr)+' /km · vVO2max '+mmss(thr*.88)+' /km','info'); render(); };
ACT.hybVt1Save=async()=>{ const raw=String(($('#hybVt1p')||{}).value||'').trim(), mt=/^(\d{1,2}):(\d{2})$/.exec(raw), h=parseInt(($('#hybVt1h')||{}).value,10), o={};
  if(raw&&!mt) return toast('Format greșit','Scrie ritmul ca 6:45 (minute:secunde pe km).','info');
  if(mt) o.vt1p=+mt[1]+(+mt[2])/60; if(h>=80&&h<=200) o.vt1h=h; if(!Object.keys(o).length) return; await hybSave(o); toast('VT1 salvat','','info'); render(); };
ACT.hybTmSave=async()=>{ const n=($('#hybTmEx')||{}).value, E=parseFloat(String(($('#hybTmKg')||{}).value||'').replace(',','.')), F=parseInt(($('#hybTmR')||{}).value,10);
  if(HYB_TM.indexOf(n)<0||!(E>0)||!(F>=1&&F<=12)) return toast('Date incomplete','Greutatea E și repetările F (1–12).','info');
  const g=(E*(1+.0333*F)+E*36/(37-F))/2, tm=hybR25(g*.96), H=hyb(), o=Object.assign({},H.tm||{});
  o[n]={kg:tm,wk:+H.wk||0}; await hybSave({tm:o}); toast(n,'1RM estimat '+num(Math.round(g))+' kg · maxim de antrenament '+num(tm)+' kg','info'); render(); };
ACT.hybTmHist=async(el,{k})=>{ const v=hybHistTm(k); if(!v) return; const H=hyb(), o=Object.assign({},H.tm||{}); o[k]={kg:v,wk:+H.wk||0}; await hybSave({tm:o}); render(); };
ACT.hybBjSave=async()=>{ const v=parseFloat(String(($('#hybBj')||{}).value||'').replace(',','.')); if(!(v>50&&v<400)) return toast('Media lipsește','Scrie media săriturilor în cm.','info');
  const bj=(hyb().bj||[]).filter(x=>x.d!==todayKey()).concat([{d:todayKey(),v}]).slice(-20); await hybSave({bj}); render(); };
/* =====================================================================
   v28 · PLANUL PRINCIPAL — alegi între Full Body (Wolf, fila Plan) și HYBRID (Viada). Planul principal apare pe Acasă,
   e fila deschisă în Antrenament și dă tipul zilei pentru nutriție și planul de mese. Zilele HYBRID merg și în antrenamentul ghidat.
   ===================================================================== */
const mainHyb=()=>prof().mainPlan==='hyb';
let HYB_TAB0=false;
/* v31: tracțiunile s-au mutat de miercuri pe joi (ca în tabelul din carte); bifele vechi de miercuri (1–7) se mută pe joi (0–6) */
async function hybMigrate(){ const H=S.hyb||{}; if((+H.v||0)>=2||!H.log) return; const log=Object.assign({},H.log);
  Object.keys(log).forEach(k=>{ const m=/^w(\d+)d2$/.exec(k); if(!m) return; const old=log[k]||{}, wed={}, kt='w'+m[1]+'d3', thu=Object.assign({},log[kt]||{});
    Object.keys(old).forEach(x=>{ if(x==='0'||x==='r') wed[x]=old[x]; else if(+x>=1&&+x<=7) thu[String(+x-1)]=old[x]; });
    log[k]=wed; log[kt]=thu; });
  await hybSave({log,v:2}); render(); }
/* la prima încărcare, fila Antrenament se deschide pe planul principal */
function hybTabInit(){ if(HYB_TAB0) return; HYB_TAB0=true; if(mainHyb()&&S.trTab==='plan') S.trTab='hyb'; hybMigrate().catch(e=>errLog((e&&e.message)||e,'hybrid')); }
function mainPlanCard(){ const h=mainHyb();
  return `<div class="card"><div class="eyebrow">${ic('plan')} Planul de antrenament</div>
    <div class="sm mu" style="margin-top:4px">Doar planul ales apare în Antrenament și pe Acasă și dă tipul zilei pentru nutriție. Bifele și progresul celuilalt rămân salvate.</div>
    <div class="seg" style="margin-top:10px" role="radiogroup" aria-label="Planul de antrenament">
      <button class="${h?'':'on'}" data-a="mainPlan" data-k="wolf" role="radio" aria-checked="${!h}">${ic('plan')} Full Body · Wolf</button>
      <button class="${h?'on':''}" data-a="mainPlan" data-k="hyb" role="radio" aria-checked="${h}">${ic('bolt')} HYBRID · Viada</button></div></div>`; }
ACT.mainPlan=async(el,{k})=>{ const hy=k==='hyb'; if(hy===mainHyb()) return;
  if(S.sess) return toast('Ai un antrenament pornit','Termină-l sau renunță la el înainte să schimbi planul.','info');
  await save('prof',Object.assign({},S.prof||{},{mainPlan:hy?'hyb':'wolf'})); NMEAN=null; STC=null; S.trTab=hy?'hyb':'plan'; render();
  toast('Plan vizibil: '+(hy?'HYBRID · Viada':'Full Body · Wolf'),hy?'Antrenament, Acasă și nutriția urmează acum săptămâna HYBRID.':'Antrenament, Acasă și nutriția urmează acum planul Wolf, cu cardio adaptiv.','info'); };
/* ziua următoare din săptămâna HYBRID: azi dacă nu e completă, altfel prima zi necompletă de după */
function hybNext(){ const wk=+hyb().wk||0, wd=(new Date().getDay()+6)%7, order=[0,1,2,3,4,5,6].map(i=>(wd+i)%7);
  const d=order.find(x=>!hybDayFull(wk,x)); return d==null?null:{w:wk,d}; }
/* ziua HYBRID în formatul antrenamentului ghidat: sesiunea 1, alergarea, sesiunea 2; hk = cheia bifei din HYBRID */
const HYB_RK={mon:'int',wed:'thr',thu:'ez',sat:'lng'};
function hybLiveDay(wk,d){ const day=hybDay(d,+wk||0), b=HYB_DAYS[d], dl=!!hyb().dl, ez=dl&&b.run==='sat', out=[];
  const lift=e=>{ const m=/^(\d+)×(\d+)(?:–(\d+))?/.exec(e.p)||[], r=/pauză (\d+)s/.exec(e.p), o={n:e.n,p:e.p,kind:'lift',sets:+m[1]||3,lo:+m[2]||8,hi:+(m[3]||m[2])||12,rest:r?+r[1]:75,hk:String(e.x),cue:e.cue};
    const p0=/@ (\d+)% din maximul/.exec(e.p); if(p0) o.sg={kg:null,reps:o.lo,kind:'new',txt:'Viada: '+o.sets+'×'+o.lo+' la '+p0[1]+'% din maximul de antrenament. Setează maximul în HYBRID → Pretestare și îți calculez greutatea.'};
    const pc=/@ (\d+)% → ([\d.]+) kg/.exec(e.p); if(pc) o.sg={kg:+pc[2],reps:o.lo,kind:'same',txt:'Ținta Viada: <b>'+num(+pc[2])+' kg × '+o.lo+'</b> ('+pc[1]+'% din maximul de antrenament)'+(e.ty==='me'?', fără eșec.':e.ty==='de'?', fiecare repetare cât mai rapidă.':'.')};
    return o; };
  const one=e=>e.kind==='lift'?lift(e):{n:e.n,p:[e.cat,e.p].filter(Boolean).join(' · '),kind:'task',hk:String(e.x),cue:e.cue};
  day.ex.filter(e=>!e.ses).forEach(e=>out.push(one(e)));
  if(day.run.length){ const rk=ez?'ez':HYB_RK[b.run], pm=ez?27:{mon:dl?25:50,wed:50,thu:[27,52,85][hybL('vt1')-1],sat:[45,60,100][hybL('lsd')-1]}[b.run];
    out.push({n:'Alergarea · '+RUNK[rk],p:day.run.map(([h,x])=>h+': '+x).join(' — '),kind:'run',rk,planMin:pm,hk:'r'}); }
  day.ex.filter(e=>e.ses).forEach(e=>out.push(one(e)));
  out.forEach((e,x)=>{ e.x=x; });
  const lifts=out.filter(e=>e.kind==='lift').length, run=out.find(e=>e.kind==='run'), min=(run?run.planMin||45:0)+lifts*9;
  return {w:+wk||0,d,t:b.t,cat:b.cat,run:ez?'ez1':{wed:'thr',sat:'lng'}[b.run]||(b.run?'ez1':null),min:min||30,ex:out,notes:{wk:HYB_NOTES[d][0],d:HYB_NOTES[d][1]},hy:true}; }
async function hybSetDone(wk,d,k,on){ const H=hyb(), log=Object.assign({},H.log||{}), key=hybKey(wk,d), day=Object.assign({},log[key]||{});
  if(on) day[k]=1; else delete day[k]; log[key]=day; await hybSave({log}); }
ACT.hybStart=async(el,{D})=>{ const wk=+hyb().wk||0; if(S.sess){ await startSess(wk,D,null,true); return; } rdOpen(wk,D,true); };
ACT.hybOpenDay=(el,{D})=>{ S.tab='plan'; S.trTab='hyb'; S.hybOpen=D; render(); requestAnimationFrame(()=>{ const c=$('#hday'+D); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }); };
/* ce conține ziua, pe scurt */
function hybWhat(day){ const lifts=day.ex.filter(e=>e.kind==='lift').length, run=day.ex.find(e=>e.kind==='run');
  return [run?run.n.replace(/^Alergarea · /,'')+(run.planMin?' ~'+run.planMin+' min':''):'',lifts?lifts+' exerciții de forță':'',!run&&!lifts?day.ex.length+' activități':''].filter(Boolean).join(' + '); }
const hybProg=(wk,d)=>{ const it=hybItems(hybDay(d,wk)); return {dn:it.filter(x=>hybDone(wk,d,x)).length,tot:it.length}; };
/* Acasă: antrenamentul zilei din HYBRID (pe poză și în cardul clasic) */
function hybCover(){ const nx=hybNext(), wk=+hyb().wk||0;
  if(!nx) return `<div class="cv-k">${ic('star')} HYBRID · săptămâna ${wk+1} · completă</div><div class="cv-h">Ai terminat săptămâna</div>
      <div class="cv-m"><span>${(wk+1)%3===0?'Urmează un cerc nou: maximele urcă cu 1%.':'Săptămâna următoare continuă cercul repetărilor.'}</span></div>
      <div class="cv-b"><button class="btn pri xl glow" data-a="hybWk" data-i="1">${ic('right')} Săptămâna ${wk+2}</button></div>`;
  const day=hybLiveDay(nx.w,nx.d), p=hybProg(nx.w,nx.d), today=(new Date().getDay()+6)%7===nx.d;
  return `<span class="cv-bdg">${dayBadge(nx.d,'next',60)}</span><div class="cv-k">${today?'Azi':'Următorul'} · ${DAYN[nx.d]} · HYBRID S${nx.w+1}${hyb().dl?' · deload':''}</div>
    <div class="cv-h">${esc(day.t)}</div>
    <div class="cv-m"><span>${esc(hybWhat(day))}</span><span>${ic('clock')} ~${day.min} min</span></div>
    <div class="cv-pb" title="${p.dn} din ${p.tot}"><i style="width:${(p.tot?p.dn/p.tot*100:0).toFixed(1)}%"></i></div>
    <div class="cv-b"><button class="btn pri xl glow" data-a="hybStart" data-d="${nx.d}">${ic('play')} ${p.dn?'Continuă':'Începe'}</button>
      <button class="btn cv-alt" data-a="hybOpenDay" data-d="${nx.d}">${ic('list')} Exerciții</button></div>`; }
function hybHeroHTML(){ const nx=hybNext(), wk=+hyb().wk||0;
  if(!nx) return `<div class="card hero"><div class="eyebrow">${ic('star')} HYBRID · săptămâna ${wk+1} · completă</div><div class="h1">Ai terminat săptămâna</div>
      <button class="btn pri xl wide glow" data-a="hybWk" data-i="1">${ic('right')} Săptămâna ${wk+2}</button></div>`;
  const day=hybLiveDay(nx.w,nx.d), p=hybProg(nx.w,nx.d);
  return `<div class="card hero"><span class="hero-wm" aria-hidden="true">${pad(nx.d+1)}</span>
    <div class="hero-top"><div class="sp"><div class="eyebrow">Următorul · ${DAYN[nx.d]} · HYBRID S${nx.w+1}</div><div class="h1">${esc(day.t)}</div>
      <div class="tags">${catTag(day)}<span class="tag">${ic('clock')} ~${day.min} min</span><span class="tag">${p.tot} activități</span></div></div>
      ${ring(p.tot?p.dn/p.tot:0,{s:64,sw:5,inner:`<text x="32" y="37" text-anchor="middle" class="ring-t">${p.dn}/${p.tot}</text>`})}</div>
    <ol class="peek">${day.ex.slice(0,5).map(e=>`<li><span>${esc(e.n)}</span><em>${esc(e.kind==='lift'?e.sets+'×'+e.lo+(e.hi!==e.lo?'–'+e.hi:''):e.planMin?'~'+e.planMin+' min':'')}</em></li>`).join('')}${day.ex.length>5?`<li class="more">+ încă ${day.ex.length-5}</li>`:''}</ol>
    ${rdRow()}
    <button class="btn pri xl wide glow" data-a="hybStart" data-d="${nx.d}">${ic('play')} ${p.dn?'Continuă':'Începe'} antrenamentul</button></div>`; }
function hybWeekHTML(){ const wk=+hyb().wk||0, nx=hybNext();
  const week=HYB_DAYS.map((b,d)=>{ const p=hybProg(wk,d), full=p.tot&&p.dn===p.tot, isN=nx&&nx.d===d, col=catCol(b.cat);
    return `<button class="wd ${isN?'next':''}" data-a="hybOpenDay" data-d="${d}" aria-label="${DAYN[d]}: ${esc(b.t)}">
      ${ring(p.tot?p.dn/p.tot:0,{s:40,sw:3.5,c:full?TH().ac:col,fill:full?TH().ac:'none',track:isN?TH().ac+'88':'var(--track)',
        inner:full?`<path d="M13 20.5l4.5 4.5L27 15.5" fill="none" style="stroke:var(--on)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
          :(dayBadgeSvg(d,40)||`<circle cx="20" cy="20" r="3.5" style="fill:${col}"/>`)})}${DAYS[d]}</button>`; }).join('');
  return `<div class="card"><div class="row"><div class="eyebrow sp">HYBRID · săptămâna ${wk+1} · cercul ${wk%3+1}/3</div>
    <button class="btn ghost sm" data-a="tab" data-k="plan" data-s="hyb">Planul ${ic('right')}</button></div><div class="week">${week}</div></div>`; }
/* nutriția: ziua din săptămâna HYBRID, în forma pe care o citește planType (sprintul + MLSS și pragul contează ca zile intense) */
function hybNutriBase(wd){ const b=HYB_DAYS[wd], lifts=b.ex.filter(e=>e[1]!=='plyo'&&e[1]!=='task').length;
  return {t:b.t,cat:b.cat,run:{mon:'thr',wed:'thr',sat:'lng'}[b.run]||(b.run?'ez1':null),min:b.cat==='rest'?0:(b.run?50:0)+lifts*9}; }
