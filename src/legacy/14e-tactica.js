/* =====================================================================
   v18 · TACTICA — obiectivul ales (cut, recompoziție, lean bulk) și regulile lui, după Layne Norton
   (Fat Loss Forever și The Complete Contest Prep Guide, cu Peter Baker) și Dr. Milo Wolf (canalul lui de YouTube).
   Cifrele (ritm, proteină, praguri) sunt în GOALS și targets() (05); aici: verdictul săptămânii, avertismentele și regulile cu cifrele tale.
   Unde cei doi nu spun același lucru (ieșirea din cut), regula le arată pe amândouă.
   ===================================================================== */
const TAC_SRC={FLF:'Norton · Fat Loss Forever',CPG:'Norton · Contest Prep Guide',MW:'Dr. Milo Wolf'};
/* talia: ultima măsurătoare față de una de acum cel puțin 2 săptămâni */
function waistDelta(){ const b=bList().filter(x=>+x.waist>0); if(b.length<2) return null; const a=b[b.length-1], z=b.filter(x=>daysBetween(x.d,a.d)>=14).pop()||b[0];
  return a===z?null:{d:+a.waist-+z.waist,days:daysBetween(z.d,a.d)}; }
/* verdictul săptămânii: media cântarului pe 7 zile față de cele 7 dinainte, comparată cu ritmul obiectivului.
   Schimbi ceva abia după 2 verificări săptămânale la rând sub jumătate din ritm (Norton), cu 100–200 kcal (Wolf); o săptămână nu schimbă nimic. */
function tacStatus(tg){ tg=tg||targets(); const ww=wWeeks(), w=tg.w, T=tg.rateT, h=nAdj().h||[], g=tg.goal;
  if(!ww) return {c:'info',t:'Am nevoie de cel puțin 3 cântăriri în fiecare din ultimele două săptămâni (dimineața, după toaletă), ca să compar mediile.'};
  const r=ww.rate, rs=(r>0?'+':'')+num(r,2)+' kg/săpt.', pc=num(Math.abs(r)/w*100,2)+'%';
  if(tg.phase.brk) return {c:Math.abs(r)<=w*.004?'ok':'warn',t:`Pauză de dietă: greutatea ar trebui să stea pe loc (acum ${rs}). După ea revii la deficit.`};
  const low=x=>T<0?x>T*.5:x<T*.5, two=h.length>=2&&low(h[h.length-1])&&low(h[h.length-2]);
  if(g==='cut'){
    if(r<-w*.01) return {c:'bad',t:`Scazi ${rs} (${pc} din greutate), peste maximul de 1% pe săptămână: riști să pierzi mușchi. Adaugă 100–200 kcal, din carbohidrați.`};
    if(low(r)) return two?{c:'bad',t:`Platou: a doua săptămână la rând sub jumătate din ritmul țintă (${num(T,2)} kg/săpt.). Întâi verifică notarea (zilele nenotate umflă aportul), apoi o singură schimbare: −100…200 kcal sau +2000 de pași pe zi. Corecția din cântar scade deja ținta o dată pe săptămână.`}
      :{c:'warn',t:`${rs}: sub jumătate din ritmul țintă (${num(T,2)} kg/săpt.). O săptămână nu e platou: nu schimba nimic încă, dar notează tot ce mănânci.`};
    return {c:'ok',t:`Scazi ${rs} (${pc} pe săptămână), în ritmul bun. Nu schimba nimic.`}; }
  if(g==='bulk'){
    if(r>w*.003) return {c:'bad',t:`Crești ${rs}, peste ~1,3% pe lună: în mare parte grăsime (Gee: bulk-ul dublu de rapid a adus de 5 ori mai multă grăsime). Scade 100–200 kcal, din carbohidrați.`};
    if(low(r)) return two?{c:'warn',t:`A doua săptămână sub jumătate din ritmul țintă (+${num(T,2)} kg/săpt.): crește caloriile cu 100–200 kcal, din carbohidrați. Corecția din cântar le urcă deja o dată pe săptămână.`}
      :{c:'info',t:`${rs}: sub ritmul țintă (+${num(T,2)} kg/săpt.). Mai așteaptă o săptămână înainte de orice schimbare.`};
    return {c:'ok',t:`Crești ${rs}, în ritmul țintă. Urmărește talia: dacă urcă mai repede decât forța, încetinește.`}; }
  const wd=waistDelta();
  return {c:r>w*.002?'warn':wd?(wd.d<0?'ok':wd.d>.5?'warn':'info'):'info',t:`Cântarul: ${rs}. La recompoziție judeci după talie și forță, nu după greutate.`+
    (wd?` Talia: ${wd.d>0?'+':''}${num(wd.d,1)} cm în ${wd.days} zile${wd.d<0?', deci merge.':wd.d>.5?': urcă, scade 100–200 kcal.':'.'}`:' Notează talia o dată pe săptămână (Progres → Măsurători).')+(r>w*.002?' Greutatea urcă prea repede pentru recompoziție: −100…200 kcal.':'')}; }
/* avertismentele obiectivului: grăsimea de pornire, pragurile de jos */
function tacWarn(tg){ const P=prof(), bf=tg.bf, g=tg.goal, out=[], ms=tg.ms, calc=Math.round(tg.bmr*(+P.act||1.55));
  if(tg.manual) out.push(['info',`Ai calorii setate manual (${tg.kcal} kcal): tactica nu le schimbă. Le pui pe automat din Setări → Ținte de nutriție.`]);
  if(g==='bulk'&&bf>20) out.push(['bad',`Ai ~${bf}% grăsime. Un surplus acum adaugă mai ales grăsime; Wolf: între 10 și 25% grăsime, aproape de greutatea dorită, recompoziția la menținere e cea mai simplă cale, iar peste, întâi cut.`]);
  else if(g==='bulk'&&bf>15) out.push(['warn',`Ai ~${bf}% grăsime: merge un bulk lent (0,5% pe lună), dar și recompoziția la menținere e o opțiune bună (Wolf).`]);
  if(g==='recomp'&&bf>25) out.push(['warn',`Ai ~${bf}% grăsime: recompoziția merge (Murphy: se câștigă masă chiar și la ~500 kcal deficit), dar un cut te duce mai repede în zona de 10–25%.`]);
  if(tg.raised&&tg.def>0) out.push(['info',`Ținta e ținută sus de pragul de siguranță (cel puțin 30 kcal/kg masă slabă, ~${Math.round(30*tg.ffm)} kcal): sub el, sinteza proteică scade (Wolf). Deficitul în plus îl faci din pași (+2000/zi), nu din mâncare.`]);
  if(g==='cut'&&ms.ok&&ms.tdee<calc*.75) out.push(['bad',`Menții greutatea cu ~${ms.tdee} kcal, sub 75% din necesarul calculat (${calc} kcal). Norton: nu mai slăbi acum; ridică caloriile spre necesar și mișcă-te mai mult, apoi reiei cut-ul.`]);
  return out; }
/* regulile obiectivului, cu cifrele tale: [iconiță, titlu, text, surse] */
function tacRules(tg){ const g=tg.goal, W=weekTargets().avg, P=tg.p, ffm=tg.ffm, w=tg.w, rk=tg.ref, T=Math.abs(GOALS[g].rate*w), d=Math.abs(Math.round(GOALS[g].rate*w*7700/7/50)*50);
  const pre=Math.round(.3*rk)+'–'+Math.round(.6*rk), meal=['clock','Mesele',`Cel puțin 3–4 mese cu proteină: una cât mai devreme dimineața, una la prânz, una seara și una aproape de culcare sau înainte de antrenament. Cu 0–2 ore înainte de antrenament, ${pre} g de carbohidrați (1–2 fructe); nu te antrena flămând.`,'MW CPG'];
  if(g==='cut') return [
    ['scale','Ritmul',`~0,5% din greutate pe săptămână: ~${num(T,2)} kg, adică un deficit de ~${d} kcal pe zi. Până la ~500 kcal deficit, masa slabă se păstrează (Murphy); Norton: 0,4–0,8%, niciodată peste 1%.`,'MW FLF'],
    ['bowl','Proteina',`Minim 2,35 g/kg, în cut spre 2,6–3 (beneficiul crește în deficit). Ți-o socotesc pe greutatea de referință (~${rk} kg, masa slabă la ~15% grăsime): ${P} g pe zi.`,'MW'],
    ['flame','Grăsimi și carbohidrați',`Fără procente fixe: grăsimile puține (~20% din calorii, cel puțin 0,5 g/kg), restul carbohidrați — ideal 2–4 g/kg, minim 1 g/kg. La aceleași calorii și proteine, împărțirea dintre ele nu schimbă masa musculară.`,'MW FLF'],
    ['shield','Pragul de jos',`Nu sub 30 kcal/kg masă slabă (~${Math.round(30*ffm)} kcal pe zi): sub el sinteza proteică scade în câteva zile. Dacă nu mai slăbești deasupra pragului, mai mulți pași, nu mai puțină mâncare. Norton: dacă menții greutatea sub 75% din necesarul calculat, oprești cut-ul.`,'MW FLF'],
    ['alert','Ajustările',`Cântar zilnic dimineața, medii pe săptămână. Schimbi ceva doar după 2 săptămâni la rând sub jumătate din ritm (sub ${num(T/2,2)} kg/săpt.): −100…200 kcal, cel mult o dată pe săptămână. Întâi verifici notarea: oamenii subraportează până la 47%.`,'MW FLF'],
    ['run','Mișcarea',`8–12k pași pe zi; peste, cheltuiala nu mai crește liniar. Cardio-ul cu oboseală mică (bicicletă, mers în pantă, ramat, în ritm de conversație) e opțional. Nu poți compensa dieta prin sport: în studiul Foster, cardio singur a dat −2 kg, dieta −7,2 kg.`,'MW'],
    ['dumbbell','Antrenamentul',`Același program ca în bulk: aproape de eșec, progresie, chiar puțin mai mult volum ca să menții masa. Repetările multe „pentru definire” sunt un mit.`,'MW CPG'],
    ['leaf','Pauze de dietă',`Opțional: 2 săptămâni în deficit, 2 la menținere (MATADOR: mai multă grăsime pierdută pe săptămâna de dietă). ${prof().dietBreak!==false?'Sunt pornite.':'Acum sunt oprite; le pornești din Necesar.'}`,'FLF CPG'],
    meal,
    ['heart','Sațietatea',`Volum mare la puține calorii, fibre, proteina în centrul fiecărei mese, 5–10 porții de fructe și legume pe zi, fără calorii lichide; te oprești la ~80% sătul. Foamea ușoară nu e o urgență.`,'MW'],
    ['trophy','După cut',`Wolf: revii direct la menținere (reverse diet-ul lent nu crește metabolismul mai mult) și păstrezi obiceiurile, puțin mai relaxat (ex. 10k → 8k pași). Norton preferă urcarea treptată (+2–5% pe săptămână), dacă vrei să limitezi grăsimea revenită.`,'MW FLF']];
  if(g==='recomp') return [
    ['target','Când are sens',`Ai 10–25% grăsime și ești aproape de greutatea dorită (Wolf). Merge și la avansați, doar mai lent. Tu: ~${tg.bf}%.`,'MW'],
    ['scale','Caloriile',`Menținere sau un deficit mic: ~0,25% din greutate pe săptămână (~${num(T,2)} kg, ~${d} kcal pe zi), în medie ${W} kcal/zi. Până la ~500 kcal deficit oamenii încă pun masă (Murphy).`,'MW'],
    ['bowl','Proteina',`2,5 g/kg din greutatea de referință (~${rk} kg): ${P} g pe zi.`,'MW'],
    ['dumbbell','Antrenamentul face treaba',`Nutriția doar permite creșterea; stimulul e antrenamentul: volum mare, aproape de eșec, exerciții cu stretch, progresie.`,'MW'],
    meal,
    ['chart','Cum judeci',`Nu după cântar: talia o dată pe săptămână, poze la 2 săptămâni, forța la exercițiile de bază.`,'MW FLF'],
    ['alert','Când schimbi direcția',`Dacă după 4 săptămâni talia nu scade și forța stă, treci pe cut sau pe un bulk lent.`,'FLF']];
  return [
    ['target','Când are sens',`Ești sub greutatea pe care o vrei, la o grăsime rezonabilă. La 10–25% grăsime și aproape de greutatea dorită, recompoziția la menținere e alternativa (Wolf). Tu: ~${tg.bf}%.`,'MW'],
    ['scale','Ritmul',`0,5–1% din greutate pe LUNĂ (0,5% avansați, 1% începători); aplicația: 0,75%, ~${num(T*4.33,1)} kg pe lună (~${d} kcal peste menținere). Creșterea musculară costă doar 5–50 kcal pe zi; mai repede = de 5 ori mai multă grăsime (Gee).`,'MW'],
    ['bowl','Proteina',`2,35 g/kg din greutatea de referință (~${rk} kg): ${P} g pe zi.`,'MW'],
    ['flame','Carbohidrați și grăsimi',`Carbohidrații 1–3 g/kg ajung, grăsimile puține (minim 0,5 g/kg); restul caloriilor cum preferi.`,'MW'],
    ['dumbbell','Antrenamentul',`Bulk lung și lent, nu scurt și rapid. E momentul pentru specializare: 20–40 de seturi pe săptămână pe 2–3 mușchi, 5–10 pe restul.`,'MW'],
    meal,
    ['alert','Prea repede',`Peste ~1,3% pe lună sau talia urcă mai repede decât forța: −100…200 kcal.`,'MW FLF'],
    ['refresh','Dacă vii din cut',`Wolf: revii direct la menținere, apoi surplusul mic. Norton: urcare treptată, +2–5% carbohidrați și grăsimi pe săptămână.`,'MW FLF'],
    ['bolt','Suplimente',`Creatină monohidrat 3–5 g pe zi, singurul supliment recomandat tuturor; proteina din pudră doar cât te ajută să atingi ținta.`,'MW']]; }
function nutriTactic(){ const tg=targets(), g=tg.goal, st=tacStatus(tg), W=weekTargets(), ww=wWeeks();
  const cls={ok:'ok',warn:'warn',bad:'bad',info:'info'};
  return `<div class="card tac-hero"><div class="eyebrow">${ic('target')} Obiectivul tău</div>
      <div class="seg tac-seg" role="tablist" style="margin-top:10px">${Object.keys(GOALS).map(k=>`<button class="${g===k?'on':''}" data-a="goalSet" data-k="${k}" role="tab" aria-selected="${g===k}">${GOALS[k].l}</button>`).join('')}</div>
      <div class="kpis c2" style="grid-template-columns:repeat(2,1fr)">
        <div class="kpi"><div class="k">Media săptămânii</div><div class="v">${W.avg}<small>kcal/zi</small></div><div class="s">${tg.def>0?'deficit ~'+tg.def:tg.def<0?'surplus ~'+(-tg.def):'menținere'} kcal</div></div>
        <div class="kpi"><div class="k">Proteină</div><div class="v">${tg.p}<small>g</small></div><div class="s">${num(GOALS[g].pk,2)} g/kg · referință ${tg.ref} kg</div></div>
        <div class="kpi"><div class="k">Ritmul țintă</div><div class="v">${tg.rateT>0?'+':''}${num(tg.rateT,2)}<small>kg/săpt.</small></div><div class="s">${tg.phase.brk?'pauză de dietă':g==='bulk'?'0,75% pe lună':num(Math.abs(GOALS[g].rate)*100,2)+'% pe săptămână'}</div></div>
        <div class="kpi"><div class="k">Ritmul tău</div><div class="v">${ww?(ww.rate>0?'+':'')+num(ww.rate,2):'—'}<small>kg/săpt.</small></div><div class="s">media cântarului pe 7 zile</div></div></div>
      <div class="tac-st ${cls[st.c]}" role="status">${ic(st.c==='ok'?'check':st.c==='info'?'info':'alert')}<span>${esc(st.t)}</span></div>
      ${tacWarn(tg).map(([c,t])=>`<div class="tac-st ${cls[c]}">${ic(c==='info'?'info':'alert')}<span>${esc(t)}</span></div>`).join('')}</div>
    <div class="card"><div class="eyebrow">${ic('shield')} Tactica · ${esc(GOALS[g].l)}</div>
      <ol class="tac-r">${tacRules(tg).map(([icn,t,x,src])=>`<li><span class="tac-i">${ic(icn)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p><div class="tac-src">${src.split(' ').map(s=>`<span>${esc(TAC_SRC[s]||s)}</span>`).join('')}</div></div></li>`).join('')}</ol></div>
    <div class="card"><div class="eyebrow">${ic('info')} De unde vine</div>
      <div class="tac-bk"><b>Fat Loss Forever</b><span>Layne Norton, Peter Baker · ritmul de 0,4–0,8%, platourile (2 verificări sub jumătate din ritm), pauzele de dietă, pragul de 75% din necesar, subraportarea.</span></div>
      <div class="tac-bk"><b>The Complete Contest Prep Guide</b><span>Norton, Baker · mesele cu proteină, carbohidrații în jurul antrenamentului, refeed-urile doar dacă te ajută să ții dieta.</span></div>
      <div class="tac-bk"><b>Dr. Milo Wolf</b><span>PhD în știința sportului, canalul de YouTube · proteina de 2,35–3 g/kg, minimele de carbohidrați și grăsimi, 0,5%/săpt. în cut și 0,5–1%/lună în bulk, pragul de 30 kcal/kg masă slabă, ajustările de 100–200 kcal, pașii, recompoziția, ieșirea din cut fără reverse diet. Antrenamentul de la el e în Știință → Milo Wolf și la fiecare exercițiu din plan.</span></div>
      <p class="xs mu" style="margin-top:10px">Unde cei doi nu spun același lucru, regula îi arată pe amândoi. Ritmul, pragurile și corecția din cântar le aplică singură aplicația.</p></div>`; }
