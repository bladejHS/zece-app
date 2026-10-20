/* =====================================================================
   v19 · TACTICA — obiectivul ales (cut, recompoziție, lean bulk). Nutriția urmează Layne Norton (canalele lui de YouTube
   Biolayne și Dr. Layne Norton, Fat Loss Forever, The Complete Contest Prep Guide); antrenamentul, Dr. Milo Wolf.
   Cifrele (ritm, proteină, praguri) sunt în GOALS și targets() (05); aici: verdictul săptămânii, avertismentele și regulile cu cifrele tale.
   ===================================================================== */
const TAC_SRC={FLF:'Norton · Fat Loss Forever',CPG:'Norton · Contest Prep Guide',NY:'Norton · YouTube',MW:'Dr. Milo Wolf'};
/* talia: ultima măsurătoare față de una de acum cel puțin 2 săptămâni */
function waistDelta(){ const b=bList().filter(x=>+x.waist>0); if(b.length<2) return null; const a=b[b.length-1], z=b.filter(x=>daysBetween(x.d,a.d)>=14).pop()||b[0];
  return a===z?null:{d:+a.waist-+z.waist,days:daysBetween(z.d,a.d)}; }
/* verdictul săptămânii: media cântarului pe 7 zile față de cele 7 dinainte, comparată cu ritmul obiectivului.
   Schimbi ceva abia după 2 verificări săptămânale la rând sub jumătate din ritm (Norton), cu 100–200 kcal; o săptămână nu schimbă nimic. */
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
  if(g==='bulk'&&bf>20) out.push(['bad',`Ai ~${bf}% grăsime. Un surplus acum adaugă mai ales grăsime: întâi cut sau recompoziție la menținere, apoi bulk-ul controlat (Norton).`]);
  else if(g==='bulk'&&bf>15) out.push(['warn',`Ai ~${bf}% grăsime: merge un bulk lent (0,5% pe lună), dar și recompoziția la menținere e o opțiune bună.`]);
  if(g==='recomp'&&bf>25) out.push(['warn',`Ai ~${bf}% grăsime: recompoziția merge (Murphy: se câștigă masă chiar și la ~500 kcal deficit), dar un cut te duce mai repede în zona de 10–25%.`]);
  if(tg.raised&&tg.def>0) out.push(['info',tg.wkFloor<=COACH.KCAL_FLOOR[prof().sex==='f'?'f':'m']?`Ținta e ținută la ${tg.wkFloor} kcal, pragul de siguranță al aplicației: deficitul real e mai mic de ~${tg.def} kcal. Restul îl faci din pași (NEAT), nu tăind din mâncare.`:`Ținta e limitată la ${tg.wkFloor} kcal: Norton nu trece de 1% din greutate pe săptămână (peste el, până la jumătate din kilograme sunt masă slabă).`]);
  if(g==='cut'&&ms.ok&&ms.tdee<calc*.75) out.push(['bad',`Menții greutatea cu ~${ms.tdee} kcal, sub 75% din necesarul calculat (${calc} kcal). Norton: nu mai slăbi acum; ridică caloriile spre necesar și mișcă-te mai mult, apoi reiei cut-ul.`]);
  return out; }
/* regulile obiectivului, cu cifrele tale: [iconiță, titlu, text, surse] — nutriția după Norton, antrenamentul după Wolf */
function tacRules(tg){ const g=tg.goal, W=weekTargets().avg, P=tg.p, ffm=tg.ffm, w=tg.w, T=Math.abs(GOALS[g].rate*w), d=Math.abs(Math.round(GOALS[g].rate*w*7700/7/50)*50), pl=num(protPL(g),2), age=protAgeF()>1;
  const prot=x=>['bowl','Proteina',`${x}Pe masa slabă (~${ffm} kg): ${pl} g/kg${age?' (cu +1,5% pe an după 30 de ani)':''}, adică ${P} g pe zi. 3–5 mese cu 30–50 g fiecare, distribuite uniform: o masă săracă nu se compensează cu una mare (studiul japonez: mai multă masă slabă la distribuție uniformă).`,'NY'];
  const meal=['clock','Mesele și antrenamentul','Fereastra anabolică e supraevaluată: dacă ai mâncat proteine cu câteva ore înainte și după, e suficient. Carbohidrați înainte de antrenament dacă te ajută (preferință, nu fiziologie). Nu te antrena flămând; postul intermitent a pierdut mai multă masă slabă (65% din kilograme) în studiul Weiss.','NY'];
  const fib=['leaf','Fibre și volum',`Cel puțin 15 g de fibre la 1000 kcal (~${Math.round(W/1000*15)} g pe zi la media ta), legume și fructe, alimente cu densitate calorică mică; proteinele și fibrele au cel mai mare efect termic (20–30%). Numeri tot: legume, sosuri, băuturi, gustări. Alcoolul are 7 kcal/g și se numără la carbohidrați sau grăsimi.`,'NY FLF'];
  const sleep=['heart','Somnul','7,5–9 ore. Sub 5,5 ore, jumătate din kilogramele pierdute au fost masă slabă (față de aproape doar grăsime la 8 ore): foamea crește, NEAT-ul scade.','NY'];
  if(g==='cut') return [
    ['scale','Ritmul',`0,4–0,8% din greutate pe săptămână, niciodată peste 1% (atunci până la jumătate din kilograme pot fi masă slabă). Aplicația: 0,5%, ~${num(T,2)} kg, adică un deficit de ~${d} kcal pe zi.`,'NY FLF'],
    prot('În deficit proteina crește cu 10–20% (aici +10%, ca să rămână carbohidrați pentru alergare). În ziua de prag: +5 g pe oră de efort intens. '),
    ['flame','Grăsimi și carbohidrați','La calorii și proteine egale, împărțirea dintre ele nu schimbă pierderea de grăsime (DIETFITS, 12 luni). Grăsimile puține (~20%, niciodată sub ~15% din calorii: hormonii), restul carbohidrați.','NY'],
    ['run','NEAT și pași','NEAT-ul e partea care scade cel mai mult în dietă (până la −500 kcal pe zi). Notează-ți pașii înainte și ține-i în dietă; dacă scad, plimbări intenționate. Cardio-ul nu e obligatoriu; pe nemâncate nu arde mai multă grăsime.','NY'],
    ['alert','Platoul','Cântar zilnic dimineața, medii săptămânale. Întâi verifici notarea (oamenii își subestimează aportul cu până la 50%), apoi o singură schimbare: −100…200 kcal sau mai mulți pași. Nu schimbi nimic după o singură săptămână.','NY FLF'],
    ['leaf','Pauze de dietă',`MATADOR: mai multă grăsime pierdută și metabolism mai bine păstrat. Frecvența după cât de slab ești (slab 1:1, normal 2:1, multă grăsime 1–2 săptămâni la 1–2 luni). Tu: ${dietBreakPlan().l}. În pauză urmărești tot: menținere, aceeași proteină, carbohidrați mai mulți, grăsimi spre ~0,7 g/kg. ${prof().dietBreak!==false?'Sunt pornite.':'Acum sunt oprite; le pornești din Necesar.'} Opțional, refeed: 2 zile la rând la menținere (din carbohidrați) păstrează masa slabă mai bine decât una izolată.`,'NY FLF CPG'],
    meal, fib, sleep,
    ['bolt','Suplimente (Norton)','Merită: creatină monohidrat 3–5 g pe zi (și în cut: apa e în mușchi, nu grăsime), cafeină 150–250 mg constant, până la 6 mg/kg la sesiunile cheie, proteină pudră doar ca mâncare comodă, vitamina D dacă ai deficit. Nu merită: glutamină, carnitină, BCAA/EAA când proteina zilei e atinsă (leucina singură nu construiește mușchi), boostere și arzătoare.','NY'],
    ['dumbbell','Antrenamentul','Același program ca în bulk (Wolf): aproape de eșec, progresie; forța e cel mai mare factor care păstrează mușchiul în deficit.','MW'],
    ['trophy','După cut','Plan pentru „dieta de după dietă”: la final mănânci până ești plin fizic și te oprești; urci la menținerea REALĂ (din ritmul tău de slăbit, nu din formulă); apoi, dacă vrei mai multe calorii, reverse diet: +2–5% carbohidrați și grăsimi pe săptămână, proteina la fel. Păstrezi antrenamentul și cântarul zilnic.','NY FLF']];
  if(g==='recomp') return [
    ['target','Când are sens','Începător, revenire după pauză sau grăsime moderată: poți pierde grăsime și câștiga masă în același timp. La avansați merge mai lent.','NY'],
    ['scale','Caloriile',`Menținere sau un deficit mic: ~0,25% pe săptămână (~${num(T,2)} kg, ~${d} kcal pe zi), în medie ${W} kcal/zi.`,'NY'],
    prot(''), meal, fib, sleep, ['bolt','Suplimente (Norton)','Merită: creatină monohidrat 3–5 g pe zi (și în cut), cafeină 150–250 mg constant, până la 6 mg/kg la sesiunile cheie, proteină pudră doar ca mâncare comodă, vitamina D dacă ai deficit. Nu merită: glutamină, carnitină, BCAA/EAA când proteina zilei e atinsă (leucina singură nu construiește mușchi), boostere și arzătoare.','NY'],
    ['dumbbell','Antrenamentul face treaba','Nutriția doar permite creșterea; stimulul e antrenamentul (Wolf): volum, aproape de eșec, exerciții cu stretch, progresie.','MW'],
    ['chart','Cum judeci','Nu după cântar: talia o dată pe săptămână, poze la 2 săptămâni, aceeași metodă și aceleași condiții; contează tendința, nu o săptămână.','NY FLF'],
    ['alert','Când schimbi direcția','Dacă după 4 săptămâni talia nu scade și forța stă, treci pe cut sau pe un bulk lent.','FLF']];
  return [
    ['target','Când are sens','Ești sub greutatea pe care o vrei, la o grăsime rezonabilă. Bulk controlat: diferența față de yo-yo e urcarea controlată.','NY'],
    ['scale','Ritmul',`Creșteri mici: aplicația ~0,75% din greutate pe lună (~${num(T*4.33,1)} kg pe lună, ~${d} kcal peste menținere). Dacă vii din cut: întâi menținerea reală, apoi +10–20% calorii.`,'NY FLF'],
    prot(''), meal, fib, sleep,
    ['flame','Carbohidrați și grăsimi','Carbohidrații ajută creșterea musculară (ketogenic cu aceeași proteină = mai puțină masă slabă câștigată); grăsimile puține, restul carbohidrați.','NY'],
    ['dumbbell','Antrenamentul','Bulk lung și lent. E momentul pentru specializare (Wolf): 20–35 de seturi pe săptămână pe 1–3 mușchi, 5–10 pe restul.','MW'],
    ['alert','Prea repede','Peste ~1,3% pe lună sau talia urcă mai repede decât forța: −100…200 kcal.','NY FLF'],
    ['bolt','Suplimente (Norton)','Merită: creatină monohidrat 3–5 g pe zi (și în cut), cafeină 150–250 mg constant, până la 6 mg/kg la sesiunile cheie, proteină pudră doar ca mâncare comodă, vitamina D dacă ai deficit. Nu merită: glutamină, carnitină, BCAA/EAA când proteina zilei e atinsă (leucina singură nu construiește mușchi), boostere și arzătoare.','NY']]; }
function nutriTactic(){ const tg=targets(), g=tg.goal, st=tacStatus(tg), W=weekTargets(), ww=wWeeks();
  const cls={ok:'ok',warn:'warn',bad:'bad',info:'info'};
  return `<div class="card tac-hero"><div class="eyebrow">${ic('target')} Obiectivul tău</div>
      <div class="seg tac-seg" role="tablist" style="margin-top:10px">${Object.keys(GOALS).map(k=>`<button class="${g===k?'on':''}" data-a="goalSet" data-k="${k}" role="tab" aria-selected="${g===k}">${GOALS[k].l}</button>`).join('')}</div>
      <div class="kpis c2" style="grid-template-columns:repeat(2,1fr)">
        <div class="kpi"><div class="k">Media săptămânii</div><div class="v">${W.avg}<small>kcal/zi</small></div><div class="s">${tg.def>0?'deficit ~'+tg.def:tg.def<0?'surplus ~'+(-tg.def):'menținere'} kcal</div></div>
        <div class="kpi"><div class="k">Proteină</div><div class="v">${tg.p}<small>g</small></div><div class="s">${num(protPL(g),2)} g/kg masă slabă · ${tg.ffm} kg</div></div>
        <div class="kpi"><div class="k">Ritmul țintă</div><div class="v">${tg.rateT>0?'+':''}${num(tg.rateT,2)}<small>kg/săpt.</small></div><div class="s">${tg.phase.brk?'pauză de dietă':g==='bulk'?'0,75% pe lună':num(Math.abs(GOALS[g].rate)*100,2)+'% pe săptămână'}</div></div>
        <div class="kpi"><div class="k">Ritmul tău</div><div class="v">${ww?(ww.rate>0?'+':'')+num(ww.rate,2):'—'}<small>kg/săpt.</small></div><div class="s">media cântarului pe 7 zile</div></div></div>
      <div class="tac-st ${cls[st.c]}" role="status">${ic(st.c==='ok'?'check':st.c==='info'?'info':'alert')}<span>${esc(st.t)}</span></div>
      ${tacWarn(tg).map(([c,t])=>`<div class="tac-st ${cls[c]}">${ic(c==='info'?'info':'alert')}<span>${esc(t)}</span></div>`).join('')}</div>
    <div class="card"><div class="eyebrow">${ic('shield')} Tactica · ${esc(GOALS[g].l)}</div>
      <ol class="tac-r">${tacRules(tg).map(([icn,t,x,src])=>`<li><span class="tac-i">${ic(icn)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p><div class="tac-src">${src.split(' ').map(s=>`<span>${esc(TAC_SRC[s]||s)}</span>`).join('')}</div></div></li>`).join('')}</ol></div>
    <div class="card"><div class="eyebrow">${ic('info')} De unde vine</div>
      <div class="tac-bk"><b>Layne Norton · nutriția</b><span>PhD în științe nutriționale (metabolismul proteinelor). Canalele de YouTube Biolayne și Dr. Layne Norton (seriile Why Diets Fail, How Fat Loss Works, How Protein Works), Fat Loss Forever și The Complete Contest Prep Guide: ritmul de 0,4–0,8%, proteina pe masa slabă și distribuția ei, pauzele de dietă și refeed-urile, NEAT-ul, platourile, dieta de după dietă și reverse diet-ul.</span></div>
      <div class="tac-bk"><b>Dr. Milo Wolf · antrenamentul</b><span>PhD în știința sportului, toate videoclipurile de pe canalul lui: planul hibrid, seriile, pauzele, stretch-ul, progresia și antrenorul local din antrenament. Mai multe în Știință → Milo Wolf.</span></div>
      <p class="xs mu" style="margin-top:10px">Ritmul, pragurile, pauzele de dietă și corecția din cântar le aplică singură aplicația.</p></div>`; }
