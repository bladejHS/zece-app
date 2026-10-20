/* =====================================================================
   v18 · TACTICA — obiectivul ales (cut, recompoziție, lean bulk) și regulile lui, din cărțile utilizatorului:
   Fat Loss Forever și The Complete Contest Prep Guide (Layne Norton, Peter Baker), ghidul de nutriție Y3T (Neil Hill, Paul Rimmer),
   Championship Bodybuilding (Chris Aceto). Cifrele (ritm, proteină, praguri) sunt în GOALS și targets() (05);
   aici: verdictul săptămânii, avertismentele și regulile cu cifrele tale.
   ===================================================================== */
const TAC_SRC={FLF:'Fat Loss Forever',CPG:'Contest Prep Guide',Y3T:'Y3T',Aceto:'Aceto'};
/* talia: ultima măsurătoare față de una de acum cel puțin 2 săptămâni */
function waistDelta(){ const b=bList().filter(x=>+x.waist>0); if(b.length<2) return null; const a=b[b.length-1], z=b.filter(x=>daysBetween(x.d,a.d)>=14).pop()||b[0];
  return a===z?null:{d:+a.waist-+z.waist,days:daysBetween(z.d,a.d)}; }
/* verdictul săptămânii: media cântarului pe 7 zile față de cele 7 dinainte, comparată cu ritmul obiectivului.
   Platou = 2 verificări săptămânale la rând sub jumătate din ritm (Fat Loss Forever); o singură săptămână nu schimbă nimic. */
function tacStatus(tg){ tg=tg||targets(); const ww=wWeeks(), w=tg.w, T=tg.rateT, h=nAdj().h||[], g=tg.goal;
  if(!ww) return {c:'info',t:'Am nevoie de cel puțin 3 cântăriri în fiecare din ultimele două săptămâni (dimineața, după toaletă), ca să compar mediile.'};
  const r=ww.rate, rs=(r>0?'+':'')+num(r,2)+' kg/săpt.', pc=num(Math.abs(r)/w*100,2)+'%';
  if(tg.phase.brk) return {c:Math.abs(r)<=w*.004?'ok':'warn',t:`Pauză de dietă: greutatea ar trebui să stea pe loc (acum ${rs}). După ea revii la deficit.`};
  const low=x=>T<0?x>T*.5:x<T*.5, two=h.length>=2&&low(h[h.length-1])&&low(h[h.length-2]);
  if(g==='cut'){
    if(r<-w*.01) return {c:'bad',t:`Scazi ${rs} (${pc} din greutate), peste maximul de 1% pe săptămână: riști să pierzi mușchi. Adaugă ~5% calorii, din carbohidrați.`};
    if(low(r)) return two?{c:'bad',t:`Platou: a doua săptămână la rând sub jumătate din ritmul țintă (${num(T,2)} kg/săpt.). Întâi verifică notarea (cântărește tot, cu uleiul și gustările), apoi o singură schimbare: −5…10% din carbohidrați și grăsimi sau +10% activitate. Corecția din cântar scade deja ținta o dată pe săptămână.`}
      :{c:'warn',t:`${rs}: sub jumătate din ritmul țintă (${num(T,2)} kg/săpt.). O săptămână nu e platou: nu schimba nimic încă, dar notează tot ce mănânci.`};
    return {c:'ok',t:`Scazi ${rs} (${pc} pe săptămână), în intervalul de 0,4–0,8%. Nu schimba nimic.`}; }
  if(g==='bulk'){
    if(r>w*.005) return {c:'bad',t:`Crești ${rs}, peste 0,5% pe săptămână: o mare parte e grăsime. Scade ~5% din calorii, din carbohidrați.`};
    if(low(r)) return two?{c:'warn',t:`A doua săptămână sub jumătate din ritmul țintă (+${num(T,2)} kg/săpt.): crește caloriile cu ~5%, din carbohidrați. Corecția din cântar le urcă deja o dată pe săptămână.`}
      :{c:'info',t:`${rs}: sub ritmul țintă (+${num(T,2)} kg/săpt.). Mai așteaptă o săptămână înainte de orice schimbare.`};
    return {c:'ok',t:`Crești ${rs}, în ritmul țintă. Urmărește talia: dacă urcă mai repede decât forța, încetinește.`}; }
  const wd=waistDelta();
  return {c:r>w*.0025?'warn':wd?(wd.d<0?'ok':wd.d>.5?'warn':'info'):'info',t:`Cântarul: ${rs}. La recompoziție judeci după talie și forță, nu după greutate.`+
    (wd?` Talia: ${wd.d>0?'+':''}${num(wd.d,1)} cm în ${wd.days} zile${wd.d<0?', deci merge.':wd.d>.5?': urcă, scade ~5% din calorii.':'.'}`:' Notează talia o dată pe săptămână (Progres → Măsurători).')+(r>w*.0025?' Greutatea urcă prea repede pentru recompoziție: −5% calorii.':'')}; }
/* avertismentele obiectivului: grăsimea de pornire și pragul de jos al necesarului */
function tacWarn(tg){ const P=prof(), bf=tg.bf, g=tg.goal, out=[], ms=tg.ms, calc=Math.round(tg.bmr*(+P.act||1.55));
  if(tg.manual) out.push(['info',`Ai calorii setate manual (${tg.kcal} kcal): tactica nu le schimbă. Le pui pe automat din Setări → Ținte de nutriție.`]);
  if(g==='bulk'&&bf>15) out.push([bf>20?'bad':'warn',`Ai ~${bf}% grăsime. Y3T pornește lean bulk-ul sub ~15% (Aceto: ideal ≤12%), pentru că peste el surplusul se duce mai ales în grăsime. Mai eficient: întâi un cut.`]);
  if(g==='recomp'&&bf>25) out.push(['warn',`Ai ~${bf}% grăsime. Y3T recomandă ca, peste 25%, prioritatea să fie scăderea cu ~10 puncte procentuale; recompoziția merge, dar cut-ul te duce acolo mai repede.`]);
  if(g==='cut'&&ms.ok&&ms.tdee<calc*.75) out.push(['bad',`Menții greutatea cu ~${ms.tdee} kcal, sub 75% din necesarul calculat (${calc} kcal). Fat Loss Forever: nu mai slăbi acum; fă reverse diet (+2–5% carbohidrați și grăsimi pe săptămână) până urci aproape de necesarul calculat, apoi reiei cut-ul.`]);
  if(g==='cut'&&bf<12) out.push(['info',`La ~${bf}% grăsime platourile vin mai des (la 2–4 săptămâni). Pauzele de dietă și ritmul spre 0,4% te țin departe de pierderea de mușchi.`]);
  return out; }
/* regulile obiectivului, cu cifrele tale: [iconiță, titlu, text, surse] */
function tacRules(tg){ const g=tg.goal, W=weekTargets().avg, P=tg.p, ffm=tg.ffm, w=tg.w, T=Math.abs(GOALS[g].rate*w), d=Math.abs(Math.round(GOALS[g].rate*w*7700/7/50)*50);
  const fib=Math.round(W/1000*10)+'–'+Math.round(W/1000*15), thr=clamp(Math.round(.4*refW()),25,50);
  if(g==='cut') return [
    ['scale','Ritmul',`0,4–0,8% din greutate pe săptămână, maxim 1%. Ținta ta: ~${num(T,2)} kg/săpt. (0,6%), adică un deficit de ~${d} kcal pe zi față de necesar.`,'FLF'],
    ['bowl','Proteina',`2,2–2,4 g/kg de masă slabă în deficit: ${P} g pe zi (la ~${ffm} kg masă slabă). Mai multă nu protejează mai bine mușchiul, doar ia locul carbohidraților.`,'FLF'],
    ['flame','De unde tai',`Proteina nu se atinge; grăsimile stau jos (~20% din calorii, ~${tg.f} g azi), restul sunt carbohidrați; ții împărțirea constantă, iar când tai, tai din amândouă. Fibre: 10–15 g la 1000 kcal, adică ${fib} g pe zi.`,'FLF Aceto'],
    ['chart','Media săptămânii',`Contează totalul săptămânii (${W} kcal/zi în medie): zilele grele primesc mai mulți carbohidrați, cele de odihnă mai puțini. E zig-zag-ul lui Aceto (zile jos, apoi o zi sus), pe care aplicația îl face singură.`,'Aceto FLF'],
    ['leaf','Pauze de dietă',`2 săptămâni în deficit, 2 la menținere: în studiul MATADOR s-a pierdut mai multă grăsime pe săptămâna de dietă și s-a păstrat bazalul. ${prof().dietBreak!==false?'Sunt pornite.':'Acum sunt oprite; le pornești din Necesar.'}`,'FLF CPG'],
    ['alert','Platoul',`Schimbi ceva doar când 2 verificări săptămânale la rând arată sub jumătate din ritm (sub ${num(T/2,2)} kg/săpt.) sau când stau 2 din 3 indicatori (greutate, talie, poze). Întâi verifici notarea: oamenii subraportează până la 47%. Apoi −5…10% din carbohidrați și grăsimi sau +10% activitate, o singură schimbare, și aștepți o săptămână.`,'FLF Aceto'],
    ['run','Cardio',`Întâi caloriile; cardio adaugi doar când tăierea nu mai merge, treptat, cel mult ~45 de minute de 6 ori pe săptămână. Prea mult cardio fură din forță. Pașii sunt cel mai ieftin cardio.`,'Aceto'],
    ['dumbbell','Antrenamentul',`Păstrezi greutățile grele: ele îi dau corpului motivul să țină mușchiul în deficit. Nu adăuga volum ca să „arzi”.`,'Aceto CPG'],
    ['refresh','Când ai greșit',`Ai mâncat ~1000 kcal peste? Scazi 200–250 kcal pe zi în următoarele 4–5 zile și mergi mai departe. Nu compensa înfometându-te.`,'FLF'],
    ['shield','Pragul de jos',`Dacă ajungi să menții greutatea cu mai puțin de 75% din necesarul calculat (sau sub ~25 kcal/kg masă slabă, la tine ~${Math.round(25*ffm)} kcal), oprești cut-ul și faci reverse diet.`,'FLF'],
    ['trophy','După cut',`Nu sări înapoi la mâncare: reverse diet, cu +2–5% carbohidrați și grăsimi pe săptămână cât timp greutatea stă, până la menținere. Aici se îngrașă la loc cei mai mulți dintre cei care slăbesc.`,'FLF']];
  if(g==='recomp') return [
    ['target','Când are sens',`Merge când ai grăsime de dat și antrenezi greu, cu proteină mare. Peste ~25% grăsime, Y3T recomandă întâi o scădere de ~10 puncte procentuale. Tu: ~${tg.bf}%.`,'Y3T'],
    ['scale','Caloriile',`Puțin sub menținere: ~0,25% din greutate pe săptămână (~${num(T,2)} kg/săpt., ~${d} kcal pe zi), în medie ${W} kcal/zi; mai mult în zilele de antrenament, mai puțin în cele de odihnă.`,'Y3T FLF'],
    ['bowl','Proteină mare',`2,6 g/kg de masă slabă: ${P} g pe zi. În studiul citat de Y3T, proteina mare a adus aceeași masă musculară, dar mai puțină grăsime.`,'Y3T FLF'],
    ['dumbbell','Progresia',`În fiecare săptămână, o repetare sau puțină greutate în plus la exercițiile de bază. Fără ea nu se construiește nimic.`,'Aceto CPG'],
    ['bolt','Carbohidrații în jurul antrenamentului',`Masa dinainte, intra-workout-ul și masa de după iau cei mai mulți carbohidrați; planul tău de antrenament e construit deja așa.`,'CPG'],
    ['clock','Mesele',`3–5 mese cu proteină (planul tău are 6), fiecare cu cel puțin ~${thr} g de proteină, la 3–5 ore distanță.`,'CPG Y3T'],
    ['chart','Cum judeci',`Nu după cântar: talia o dată pe săptămână, poze la 2 săptămâni, forța la exercițiile de bază. Schimbi ceva doar când stagnează 2 din 3.`,'FLF Y3T'],
    ['alert','Când treci pe cut',`Dacă după 4 săptămâni talia nu scade și forța stă, recompoziția nu mai lucrează: treci pe cut.`,'FLF']];
  return [
    ['target','De unde pornești',`Lean bulk de la sub ~15% grăsime (Y3T); ideal ≤12%, spune Aceto: mușchiul crește cel mai bine într-un corp slab. Tu: ~${tg.bf}%.`,'Y3T Aceto'],
    ['refresh','Dacă vii din cut',`Nu sări direct la surplus: reverse diet, +2–5% carbohidrați și grăsimi pe săptămână cât timp greutatea stă, apoi surplusul.`,'FLF'],
    ['scale','Surplusul',`Mic: ~0,25% din greutate pe săptămână (+${num(T,2)} kg/săpt., ~${num(T*4.3,1)} kg pe lună), adică ~${d} kcal peste menținere. Y3T pornește de la +300–500 kcal.`,'Y3T FLF'],
    ['flame','Creșterile, din carbohidrați',`Când greutatea stă 2 săptămâni, crești din carbohidrați. Aceto îi urcă cu 25%, apoi 35%, apoi 50% peste bază, la câte 2 săptămâni fără creștere; aplicația merge mai prudent, ~5% din calorii odată.`,'Aceto'],
    ['bowl','Proteina',`1,8–2,0 g/kg de masă slabă ajung în surplus: ${P} g. Mai multă nu mai construiește mușchi, doar ia locul carbohidraților care alimentează antrenamentul.`,'FLF Aceto'],
    ['drop','Grăsimile',`Puține: ~20% din calorii (~${tg.f} g), ca surplusul să meargă în carbohidrații care alimentează antrenamentul. Și nu doar saturate: omega-3 (pește gras, semințe de in) și uleiuri presate la rece. Untul de arahide și uleiul de măsline din planul tău sunt bune.`,'Aceto'],
    ['dumbbell','Progresia',`Surplusul fără suprasolicitare progresivă e doar grăsime: urmărește repetările și greutățile din plan.`,'Aceto CPG'],
    ['alert','Prea repede',`Peste ~0,5% pe săptămână sau talia urcă mai repede decât forța: −5% calorii. Când ajungi la ~15% grăsime, faci un mini-cut.`,'Y3T FLF']]; }
function nutriTactic(){ const tg=targets(), g=tg.goal, st=tacStatus(tg), W=weekTargets(), ww=wWeeks();
  const cls={ok:'ok',warn:'warn',bad:'bad',info:'info'};
  return `<div class="card tac-hero"><div class="eyebrow">${ic('target')} Obiectivul tău</div>
      <div class="seg tac-seg" role="tablist" style="margin-top:10px">${Object.keys(GOALS).map(k=>`<button class="${g===k?'on':''}" data-a="goalSet" data-k="${k}" role="tab" aria-selected="${g===k}">${GOALS[k].l}</button>`).join('')}</div>
      <div class="kpis c2" style="grid-template-columns:repeat(2,1fr)">
        <div class="kpi"><div class="k">Media săptămânii</div><div class="v">${W.avg}<small>kcal/zi</small></div><div class="s">${tg.def>0?'deficit ~'+tg.def:tg.def<0?'surplus ~'+(-tg.def):'menținere'} kcal</div></div>
        <div class="kpi"><div class="k">Proteină</div><div class="v">${tg.p}<small>g</small></div><div class="s">${GOALS[g].pk} g/kg masă slabă</div></div>
        <div class="kpi"><div class="k">Ritmul țintă</div><div class="v">${tg.rateT>0?'+':''}${num(tg.rateT,2)}<small>kg/săpt.</small></div><div class="s">${tg.phase.brk?'pauză de dietă':num(Math.abs(GOALS[g].rate)*100,2)+'% din greutate'}</div></div>
        <div class="kpi"><div class="k">Ritmul tău</div><div class="v">${ww?(ww.rate>0?'+':'')+num(ww.rate,2):'—'}<small>kg/săpt.</small></div><div class="s">media cântarului pe 7 zile</div></div></div>
      <div class="tac-st ${cls[st.c]}" role="status">${ic(st.c==='ok'?'check':st.c==='info'?'info':'alert')}<span>${esc(st.t)}</span></div>
      ${tacWarn(tg).map(([c,t])=>`<div class="tac-st ${cls[c]}">${ic(c==='info'?'info':'alert')}<span>${esc(t)}</span></div>`).join('')}</div>
    <div class="card"><div class="eyebrow">${ic('shield')} Tactica · ${esc(GOALS[g].l)}</div>
      <ol class="tac-r">${tacRules(tg).map(([icn,t,x,src])=>`<li><span class="tac-i">${ic(icn)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p><div class="tac-src">${src.split(' ').map(s=>`<span>${esc(TAC_SRC[s]||s)}</span>`).join('')}</div></div></li>`).join('')}</ol></div>
    <div class="card"><div class="eyebrow">${ic('info')} De unde vine</div>
      <div class="tac-bk"><b>Fat Loss Forever</b><span>Layne Norton, Peter Baker · ritmul de 0,4–0,8%, proteina pe masă slabă, platourile, pauzele de dietă, reverse diet, pragul de 75%.</span></div>
      <div class="tac-bk"><b>The Complete Contest Prep Guide</b><span>Norton, Baker · 3–5 mese cu proteină, carbohidrații în jurul antrenamentului, refeed-urile doar dacă te ajută să ții dieta.</span></div>
      <div class="tac-bk"><b>Y3T Nutrition Guide</b><span>Neil Hill, Paul Rimmer · ±300–500 kcal ca pornire, recompoziția cu proteină mare, cut-ul întâi peste 25% grăsime.</span></div>
      <div class="tac-bk"><b>Championship Bodybuilding</b><span>Chris Aceto · tai din carbohidrați, nu din proteină; zig-zag; întâi caloriile, apoi cardio; masa se construiește din carbohidrați.</span></div>
      <p class="xs mu" style="margin-top:10px">N-am preluat dieta low-carb a lui Aceto pentru endomorfi (100 g, apoi 30 g de carbohidrați pe zi) și ideea că insulina blochează arderea: Fat Loss Forever arată că, la aceleași calorii și aceeași proteină, carbohidrații și grăsimile se pot schimba între ele fără diferență în slăbire. Ritmul, pragurile și corecția din cântar rămân cele din fila Știință și din Necesar.</p></div>`; }
