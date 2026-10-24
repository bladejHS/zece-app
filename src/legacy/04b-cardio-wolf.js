/* =====================================================================
   v29 · CARDIO ÎN PLANUL WOLF — în locul alergării, la cererea ta. Se adaptează singur la datele tale.
   v30: cardio pentru bodybuilding, nu pentru VO2max (la cererea ta): doar LISS în zona 2, fără intervale. Rolul lui e să adauge cheltuială
   de energie la deficit fără să coste recuperare și mușchi; luni și joi după forță, marți o sesiune separată, mai lungă.
   Ce spun studiile (și de ce arată așa):
   - Wilson și colab. 2012 (J Strength Cond Res, meta-analiză, 21 de studii): interferența cu masa musculară și forța crește cu frecvența
     și durata cardio-ului; alergarea interferează mai mult decât bicicleta → bicicleta e implicită, 3 sesiuni, 20–40 min.
   - Schumann și colab. 2022 (Sports Med, meta-analiză, 43 de studii): cardio-ul făcut alături de forță nu scade hipertrofia și forța maximă
     (doar forța explozivă, mai ales în aceeași ședință) → Z2 poate veni imediat după forță sau la ~6 ore.
   - Wewege și colab. 2017 (Obes Rev): intervalele nu scad mai multă grăsime decât cardio-ul moderat continuu → nu e nevoie de intensitate,
     care obosește mai mult și concurează cu recuperarea pentru forță.
   - Schoenfeld și colab. 2014 (JISSN): cardio-ul pe nemâncate nu scade mai multă grăsime → îl faci la ora care îți convine.
   - OMS 2020: 150–300 min moderat (sau 75–150 intens) pe săptămână. Wolf: cardio-ul moderat nu „mănâncă” mușchii.
   Adaptarea (o dată pe săptămână, luni): minutele de Z2 urcă sau coboară cu 5 după trendul greutății pe 21 de zile față de ritmul țintă
   al obiectivului (cut −0,5%/săpt.), doar dacă ai făcut cel puțin 2 din 3 sesiuni; marți = 1,5 × minutele de luni; pulsul țintă vine din zonele tale (puls maxim + repaus);
   deload-ul, HRV-ul scăzut și antrenorul adaptiv scurtează sesiunile din ziua respectivă.
   ===================================================================== */
const CD_MOD={bike:['Bicicletă staționară','pe bicicletă'],walk:['Mers înclinat pe bandă','mers pe bandă înclinată (10–15%)'],ell:['Eliptică','pe eliptică'],row:['Aparat de vâslit','la aparatul de vâslit']};
const cdMod=()=>CD_MOD[prof().cdMod]?prof().cdMod:'bike';
const CD_BASE={cut:30,recomp:25,bulk:20};
const CD_LV=[-2,4], CD_STEP=5;
/* pozițiile cardio-ului în plan: [zi, exercițiu] */
const CD_X=[[0,8],[1,0],[3,8]];
const cdState=()=>Object.assign({lvl:0,wk:null,why:[],log:[]},prof().cd||{});
const cdZ2Min=()=>clamp(CD_BASE[goalMode()]+CD_STEP*clamp(+cdState().lvl||0,CD_LV[0],CD_LV[1]),15,60);
/* marți, sesiunea separată: de 1,5 ori mai lungă, cel mult 60 min */
const cdLissMin=()=>Math.min(60,Math.round(cdZ2Min()*1.5/5)*5);
/* pulsul țintă: zona 2 din zonele tale */
function cdHr(){ const z=hrZones(); return {z2:[z.z[1].lo,z.z[1].hi],max:z.max,rest:z.rest}; }
/* textul exercițiului de cardio din ziua d (dayBase) */
function cdEx(d){ const H=cdHr(), m=CD_MOD[cdMod()][1], liss=PLAN[d]&&PLAN[d].cardio==='liss', mn=liss?cdLissMin():cdZ2Min();
  return {txt:mn+' min · zona 2: '+H.z2[0]+'–'+H.z2[1]+' bpm, poți vorbi în propoziții întregi · '+m+(liss?' · oricând în zi':' · imediat după forță sau la ~6 h'),planMin:mn}; }
/* minutele de cardio ale zilei, pentru durată și energie */
function cdDayMin(d){ const b=PLAN[d]; if(!b||!b.cardio) return 0; return b.cardio==='liss'?cdLissMin():cdZ2Min(); }
/* cât cardio ai bifat într-o săptămână din plan */
function cdDone(c,w){ if(c<1) return null; const L=S.wlog||{}; return CD_X.filter(([d,x])=>{ const k=dKeyC(c,w,d); return !!(L[k]||{})[k+'e'+x]; }).length; }
/* săptămâna din plan dinaintea celei curente */
function cdPrevWeek(){ const nx=nextDay(), c=cyc(); if(!nx) return {c,w:WEEKS-1}; return nx.w>0?{c,w:nx.w-1}:{c:c-1,w:WEEKS-1}; }
/* ritmul greutății: panta trendului pe 21 de zile, în % din greutate pe săptămână */
function cdRate(){ const tr=trendOf(wList().map(p=>({x:p.d,y:p.w})),21); return tr&&tr.now?tr.slope*7/tr.now*100:null; }
function cdEval(st){
  const why=[], G=goalMode(), ph=nPhase(), tgt=GOALS[G].rate*100, rate=cdRate(), pw=cdPrevWeek(), dn=cdDone(pw.c,pw.w), T=+prof().stepsT||8000;
  const pc=v=>(v>0?'+':v<0?'−':'')+num(Math.abs(v),2)+'%';
  let d=0;
  if(rate==null) why.push('Ai prea puține cântăriri în ultimele 3 săptămâni (trebuie cel puțin 3, pe minimum 10 zile), așa că minutele rămân la fel.');
  else if(ph.brk) why.push('Ești în pauza de dietă (la menținere): cardio-ul rămâne la fel, greutatea poate urca puțin din glicogen.');
  else if(G==='bulk'){ if(rate>.5){ d=1; why.push('Urci '+pc(rate)+' pe săptămână, peste ~0,25–0,5% cât e util la lean bulk: +'+CD_STEP+' min la fiecare Z2.'); }
    else if(rate<0){ d=-1; why.push('Scazi '+pc(rate)+' pe săptămână în lean bulk: −'+CD_STEP+' min la fiecare Z2.'); }
    else why.push('Urci '+pc(rate)+' pe săptămână, în grafic: minutele rămân la fel.'); }
  else { const lo=Math.min(-1,tgt*2);
    if(rate>tgt*.5){ d=1; why.push('Trendul greutății e '+pc(rate)+' pe săptămână, ținta e '+pc(tgt)+': +'+CD_STEP+' min la fiecare Z2.'); }
    else if(rate<lo){ d=-1; why.push('Scazi '+pc(rate)+' pe săptămână, mai repede decât '+pc(lo)+' (pierzi și mușchi): −'+CD_STEP+' min la fiecare Z2.'); }
    else why.push('Trendul greutății e '+pc(rate)+' pe săptămână, aproape de ținta de '+pc(tgt)+': minutele rămân la fel.'); }
  if(d>0&&dn!=null&&dn<2){ d=0; why.push('Săptămâna trecută ai făcut '+dn+' din 3 sesiuni de cardio: întâi le faci pe cele din plan, apoi creștem.'); }
  const st7=[]; for(let i=1;i<=7;i++){ const v=+jOf(dayShift(todayKey(),-i)).steps||0; if(v) st7.push(v); }
  if(st7.length>=4){ const a=avgOf(st7); if(a<T*.8) why.push('Media pașilor e '+Math.round(a).toLocaleString('ro-RO')+' pe zi, sub ținta de '+T.toLocaleString('ro-RO')+': plimbările ard aproape cât o sesiune de cardio și nu obosesc picioarele.'); }
  const lvl=clamp((+st.lvl||0)+d,CD_LV[0],CD_LV[1]);
  if(d&&lvl===(+st.lvl||0)) why.push(d>0?'Ești deja la maximul de '+cdZ2MinAt(lvl)+' min: mai departe ajustezi din calorii sau pași.':'Ești deja la minimul de '+cdZ2MinAt(lvl)+' min.');
  return {lvl,d:lvl-(+st.lvl||0),why,rate,dn}; }
const cdZ2MinAt=l=>clamp(CD_BASE[goalMode()]+CD_STEP*l,15,60);
async function cdSave(o){ await save('prof',Object.assign({},S.prof||{},{cd:o})); STC=null; NMEAN=null; }
/* o dată pe săptămână (luni), la pornire: prima dată doar fixează punctul de plecare */
async function cdWeekly(force){
  const wk=mondayOf(todayKey()), st=cdState(); if(!force&&st.wk===wk) return;
  if(!st.wk&&!force) return cdSave(Object.assign(st,{wk,why:['Pornești de la '+cdZ2Min()+' min de Z2 ('+(GOALS[goalMode()]||{l:''}).l.toLowerCase()+'). Din săptămâna viitoare minutele se ajustează după trendul greutății.']}));
  const r=cdEval(st), log=(st.log||[]).concat([{wk,lvl:r.lvl,d:r.d,rate:r.rate==null?null:Math.round(r.rate*100)/100}]).slice(-12);
  await cdSave(Object.assign(st,{wk,lvl:r.lvl,why:r.why,log}));
  if(r.d) toast('Cardio ajustat: '+cdZ2Min()+' min de Z2',r.why[0],'info'); }
function cdSummary(){ const st=cdState(), z=cdZ2Min(), l=cdLissMin();
  return {z,l,wkMin:2*z+l,why:st.why||[],mod:CD_MOD[cdMod()][0],H:cdHr(),log:st.log||[]}; }
/* cardul din fila Plan */
function cardioCard(){ const c=cdSummary(), H=c.H;
  return `<div class="card"><div class="row"><div class="eyebrow sp">${ic('heart')} Cardio adaptiv · ${esc(c.mod)}</div><span class="tag">${c.wkMin} min / săpt.</span></div>
    <div class="list-row"><span class="sp"><b>Luni și joi · Z2 ${c.z} min</b><div class="xs mu">${H.z2[0]}–${H.z2[1]} bpm · după forță</div></span></div>
    <div class="list-row"><span class="sp"><b>Marți · Z2 ${c.l} min</b><div class="xs mu">${H.z2[0]}–${H.z2[1]} bpm · sesiune separată, oricând în zi</div></span></div>
    ${c.why.length?`<div class="note">${c.why.map(esc).join(' ')}</div>`:''}
    <details class="notes"><summary>${ic('info')} De ce așa, după studii</summary>
      <p><b>Bicicleta, nu alergarea.</b> Meta-analiza lui Wilson (2012) arată că interferența cu mușchii crește cu frecvența și durata cardio-ului și e mai mare la alergare decât la bicicletă.</p>
      <p><b>Mușchii nu suferă.</b> Schumann (2022, 43 de studii): cardio-ul alături de forță nu scade hipertrofia sau forța maximă. Wolf spune la fel despre cardio-ul moderat.</p>
      <p><b>Cardio pentru bodybuilding, nu pentru VO2max.</b> Rolul lui e să adauge cheltuială de energie la deficit, ca să nu tai și mai mult din mâncare. Wewege (2017): intervalele nu scad mai multă grăsime decât Z2, dar obosesc mai mult și concurează cu recuperarea pentru forță. De aceea doar zona 2, pe un aparat fără impact.</p>
      <p><b>Oricând în zi.</b> Schoenfeld (2014): cardio-ul pe nemâncate nu scade mai multă grăsime. Luni și joi după forță (sau la ~6 ore), marți separat.</p>
      <p><b>Cum se adaptează.</b> Luni, după trendul greutății pe 21 de zile: dacă slăbești mai încet de jumătate din ritmul țintă, +5 min la Z2; dacă slăbești mai repede de 1% pe săptămână, −5 min (doar dacă ai făcut cel puțin 2 din 3 sesiuni). Pulsul țintă vine din zonele tale, deci pe măsură ce te antrenezi, aceeași zonă cere mai mult efort. Deload-ul, HRV-ul scăzut și antrenorul adaptiv scurtează sesiunea zilei.</p></details></div>`; }
/* cardul din Setări */
function cardioSetCard(){ const c=cdSummary(), st=cdState();
  return `<div class="card"><div class="eyebrow">${ic('heart')} Cardio · planul Wolf</div>
    <div class="sm" style="margin-top:12px;font-weight:600">Aparatul</div>
    <div class="seg">${Object.keys(CD_MOD).map(k=>`<button class="${cdMod()===k?'on':''}" data-a="cdMod" data-k="${k}">${CD_MOD[k][0]}</button>`).join('')}</div>
    <div class="note">Bicicleta are cea mai mică interferență cu forța picioarelor (Wilson, 2012). Mersul înclinat și eliptica sunt la fel de blânde; vâslitul lucrează și spatele.</div>
    <div class="set-row"><span class="sp"><b>Z2 acum: ${c.z} min</b><div class="sm mu">${st.lvl?'Ajustat automat cu '+(st.lvl>0?'+':'−')+Math.abs(st.lvl)*CD_STEP+' min față de pornire':'Valoarea de pornire pentru obiectivul tău'}${st.wk?' · verificat '+relDay(st.wk):''}</div></span>
      <button class="btn ghost sm" data-a="cdReset" data-confirm="Sigur? Apasă iar">${ic('refresh')} De la zero</button></div>
    <div class="note">Minutele de Z2 se ajustează singure în fiecare luni după trendul greutății; marți e de 1,5 ori mai lung. Pulsul țintă vine din vârsta, pulsul în repaus și pulsul maxim de la Profil.</div></div>`; }
ACT.cdMod=async(el,{k})=>{ if(!CD_MOD[k]) return; await save('prof',Object.assign({},S.prof||{},{cdMod:k})); render(); };
ACT.cdReset=async()=>{ await cdSave(Object.assign(cdState(),{lvl:0,why:['Ai pornit din nou de la '+cdZ2MinAt(0)+' min de Z2.']})); render(); };
