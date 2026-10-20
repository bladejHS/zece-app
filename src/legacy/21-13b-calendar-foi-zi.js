/* =====================================================================
   13b · CALENDAR, FOI (zi, tehnică, poze), RECAPITULARE, IMAGINE DE DISTRIBUIT
   ===================================================================== */
const CAL={open:false,m:null};
let SH=null;
function calOpen(){ CAL.open=true; CAL.m=CAL.m||todayKey().slice(0,7); calRender(); }
function calRender(){
  const r=$('#calRoot'); if(!CAL.open){ r.innerHTML=''; updLock(); return; }
  const [y,mo]=CAL.m.split('-').map(Number), first=new Date(y,mo-1,1), dim=new Date(y,mo,0).getDate(), off=(first.getDay()+6)%7;
  const start=dayShift(keyOf(first),-off), n=Math.ceil((off+dim)/7)*7, tk=todayKey(), {L,R}=activity(), mm=CAL.m;
  let cells='', act=0;
  for(let i=0;i<n;i++){ const k=dayShift(start,i), inM=k.slice(0,7)===mm, l=L.has(k), rr=R.has(k), ml=mlogDay(k).length, w=(S.weights||{})[k];
    if(inM&&(l||rr)) act++;
    cells+=`<button class="cd ${inM?'':'out'} ${k>tk?'fut':''} ${k===tk?'today':''} ${l||rr?'act':''}" data-a="dayOpen" data-k="${k}" aria-label="${k}"><span>${+k.slice(8)}</span>
      <span class="dots">${l?'<i style="background:var(--ac)"></i>':''}${rr?'<i style="background:var(--run)"></i>':''}${ml?'<i style="background:var(--ok)"></i>':''}${w?'<i style="background:#fff"></i>':''}</span></button>`; }
  const ses=(S.hist||[]).filter(h=>h.date.slice(0,7)===mm).length, km=sumKm((S.runs||[]).filter(x=>x.date.slice(0,7)===mm));
  let sets=0; Object.values(S.lifts||{}).forEach(h=>h.forEach(e=>{ if(e.d.slice(0,7)===mm) sets+=e.s.length; }));
  r.innerHTML=`<div class="tm"><div class="tm-in"><div class="fx-top"><button class="ib" data-a="calClose" aria-label="Închide">${ic('x')}</button>
      <div class="fx-tt"><div class="eyebrow">Istoric</div><div class="t">Calendar</div></div></div>
    <div class="cal-h"><button class="ib" data-a="calNav" data-i="-1" aria-label="Luna trecută">${ic('left')}</button><div class="h2">${esc(first.toLocaleDateString('ro-RO',{month:'long',year:'numeric'}))}</div>
      <button class="ib" data-a="calNav" data-i="1" aria-label="Luna următoare" ${mm>=tk.slice(0,7)?'disabled':''}>${ic('right')}</button></div>
    <div class="cal">${DAYS.map(d=>`<span class="dn">${d}</span>`).join('')}${cells}</div>
    <div class="legend"><span><i style="background:var(--ac)"></i>forță</span><span><i style="background:var(--run)"></i>alergare</span><span><i style="background:var(--ok)"></i>mese</span><span><i style="background:#fff"></i>cântar</span></div>
    <div class="kpis"><div class="kpi"><div class="k">Zile active</div><div class="v">${act}</div></div><div class="kpi"><div class="k">Antrenamente</div><div class="v">${ses}</div></div>
      <div class="kpi"><div class="k">Serii · km</div><div class="v">${sets}<small> · ${num(km)}</small></div></div></div>
    <div class="note">Atinge o zi ca să vezi tot ce ai notat și să completezi jurnalul.</div></div></div>`;
  updLock();
}
function dayHTML(k){
  const ses=(S.hist||[]).filter(h=>h.date===k), lifts=Object.keys(S.lifts||{}).map(n=>({n,e:(S.lifts[n]||[]).find(x=>x.d===k)})).filter(x=>x.e);
  const runs=(S.runs||[]).filter(r=>r.date===k), ml=mlogDay(k), t=dayTotals(k), w=(S.weights||{})[k], b=(S.body||{})[k], wa=waterOf(k), j=jOf(k);
  const sec=(ti,h)=>h?`<div class="dsec"><h4>${ti}</h4>${h}</div>`:'';
  const empty=!ses.length&&!lifts.length&&!runs.length&&!ml.length&&!w&&!b&&!wa;
  return `<div class="eyebrow">${k===todayKey()?'Azi':esc(relDay(k))}</div><div class="h2" style="margin-top:6px">${esc(parseKey(k).toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'}))}</div>
    ${empty?`<div class="note">Nimic notat în ziua asta.</div>`:''}
    ${sec('Antrenamente',ses.map(h=>`<div class="list-row"><span class="sp"><b>${esc(h.t)}</b> <span class="mu sm">· S${h.w+1}</span></span><span class="v">${fmtClock(h.dur)} · ${h.sets} serii</span></div>`).join(''))}
    ${sec('Forță',lifts.map(x=>`<div class="list-row"><span class="sp"><b>${esc(x.n)}</b><div class="sess-l">${x.e.s.map(fmtSet).join(' · ')}</div></span></div>`).join(''))}
    ${sec('Alergare',runs.map(r=>`<div class="list-row"><span class="tag run">${esc(RUNK[r.kind]||r.kind||'—')}</span><span class="sp">${num(r.km,2)} km · ${num(r.min)} min</span><span class="v">${fmtPace(paceOf(r))}</span></div>`).join(''))}
    ${sec('Mâncare',ml.length?`<div class="list-row"><span class="sp"><b>${Math.round(t.k)} kcal</b> · ${Math.round(t.p)} g proteină</span><span class="v">${ml.length} ${ml.length===1?'masă':'mese'}</span></div><div class="sess-l">${ml.map(m=>esc(m.n)).join(' · ')}</div>`:'')}
    ${sec('Corp',(w?`<div class="list-row"><span>Greutate</span><span class="v">${num(w)} kg</span></div>`:'')+(wa?`<div class="list-row"><span>Apă</span><span class="v">${num(wa/1000,2)} L</span></div>`:'')+
      (b?`<div class="list-row"><span>Măsurători</span><span class="v">${MEAS.filter(([q])=>+b[q]>0).map(([q,l])=>l.toLowerCase()+' '+num(b[q])).join(' · ')}</span></div>`:''))}
    ${k<=todayKey()?`<div class="dsec"><h4>Jurnal</h4><div class="form">
      <div class="fld"><label for="jdS">Somn (ore)</label><input class="inp" id="jdS" type="number" step="0.5" inputmode="decimal" value="${j.sleep||''}"></div>
      <div class="fld"><label for="jdP">Pași</label><input class="inp" id="jdP" type="number" inputmode="numeric" value="${j.steps||''}"></div>
      <div class="fld full"><label for="jdN">Notițe</label><textarea class="inp" id="jdN" rows="2" placeholder="cum te-ai simțit, dureri, stres…">${esc(j.note||'')}</textarea></div></div>
      <button class="btn pri wide" style="margin-top:12px" data-a="jSave" data-k="${k}">${ic('check')} Salvează jurnalul</button></div>`:''}`;
}
/* ---------- ghidul de exerciții: tehnica fiecărui exercițiu din plan, fără internet și fără cheie API ----------
   m = mușchi, c = execuție, x = greșeli frecvente, s = siguranță. Indicațiile urmează standardele uzuale de antrenament de forță. */
const GUIDE={
 'Bench Press':{m:['Piept','Triceps','Umeri (față)'],c:['Culcă-te cu ochii sub bară, tălpile ferm pe podea, ușor trase spre bancă.','Strânge omoplații spre spate și în jos și păstrează un arc ușor în zona lombară; fesierii rămân pe bancă.','Priza puțin mai lată decât umerii, încheieturile drepte, deasupra coatelor.','Coboară controlat până atingi pieptul la nivelul sternului, cu coatele la 45–70° față de trunchi.','Împinge bara în sus și ușor spre față, apăsând podeaua cu picioarele.'],
  x:['Coatele deschise la 90° față de trunchi: suprasolicită umerii.','Bara sare din piept sau fesierii se ridică de pe bancă.','Încheieturile îndoite spre spate sub bară.'],s:'La seriile grele folosește un partener sau opritoarele de siguranță. Prinde bara cu degetul mare în jurul ei, nu în priză falsă.'},
 'Pull Up / Lat Pulldown':{m:['Dorsal mare','Spate (mijloc)','Biceps'],c:['Priza puțin mai lată decât umerii; pornește cu brațele complet întinse.','Începe coborând umerii departe de urechi, apoi trage coatele în jos spre coaste.','Pieptul urcă spre bară (la aparat, bara coboară spre partea de sus a pieptului).','Coboară controlat 2–3 secunde, până la brațe aproape întinse.','Trunchiul stabil, fără legănat; la aparat, o înclinare ușoară spre spate.'],
  x:['Jumătăți de repetare: brațele nu se întind jos.','Tragi din mâini în loc de coate, iar umerii urcă spre urechi.','Balans sau smucituri ca să treci de bară.'],s:'Dacă te doare umărul la priza largă, îngustează priza sau folosește priza neutră.'},
 'Weighted Pull Up':{m:['Dorsal mare','Spate (mijloc)','Biceps'],c:['Centura cu greutatea atârnă la șolduri; abdomenul strâns, picioarele încrucișate.','Pornește din atârnare completă, cu brațele întinse.','Coboară umerii înainte să tragi, apoi trage coatele spre coaste.','Bărbia trece peste bară, pieptul urcă spre ea.','Coboară controlat 2–3 secunde până la brațe întinse.'],
  x:['Greutate prea mare, din care ies doar jumătăți de repetare.','Legănat din picioare ca să urci.','Coborâre scăpată, fără control.'],s:'Crește greutatea în pași mici (1,25–2,5 kg). La durere în umăr sau cot, revino la greutatea corpului.'},
 'Hammer Chest Press':{m:['Piept','Triceps','Umeri (față)'],c:['Reglează scaunul ca mânerele să fie la nivelul mijlocului pieptului.','Omoplații strânși și lipiți de spătar, tălpile pe podea.','Împinge pe traiectoria aparatului până aproape de brațele întinse, fără să blochezi coatele.','Revino lent, 2 secunde, până simți întinderea în piept.'],
  x:['Umerii se ridică și ies de pe spătar.','Mișcare scurtă, doar din coate.','Coborâre scăpată, cu greutățile lovind stiva.'],s:'Aparatul îți ține traiectoria, așa că poți merge aproape de eșec în siguranță. Brațele pot împinge și pe rând, dacă una e mai slabă.'},
 'Incline Dumbbell Press':{m:['Piept (sus)','Umeri (față)','Triceps'],c:['Banca la 30–45°; omoplații strânși, tălpile ferme pe podea.','Ganterele pornesc deasupra pieptului de sus, cu încheieturile drepte.','Coboară până simți întinderea în piept, coatele la 45–60° față de trunchi.','Împinge în sus și ușor spre interior, fără să lovești ganterele.','Controlează coborârea timp de 2 secunde.'],
  x:['Banca înclinată peste 45°: efortul trece pe umeri.','Coatele deschise complet lateral.','Arc exagerat al spatelui, care transformă mișcarea în împins orizontal.'],s:'Ca să lași ganterele jos, adu-le la piept și ridică genunchii; nu le arunca lateral cu brațele întinse.'},
 'Flat Dumbbell Press':{m:['Piept','Triceps','Umeri (față)'],c:['Așază-te cu ganterele pe coapse, apoi culcă-te și adu-le deasupra pieptului cu ajutorul genunchilor.','Omoplații strânși și coborâți, tălpile ferme pe podea.','Coboară ganterele lateral de piept, coatele la 45–60° față de trunchi.','Coboară până simți o întindere bună în piept, fără durere în umăr.','Împinge în sus, ușor spre interior, până la brațe întinse.'],
  x:['Coatele la 90°, în linie cu umerii.','Amplitudine scurtă: ganterele se opresc mult deasupra pieptului.','Încheieturile îndoite spre spate.'],s:'Pune ganterele jos aducându-le la piept, cu genunchii ridicați, nu lăsându-le să cadă lateral.'},
 'Close Grip Bench Press':{m:['Triceps','Piept','Umeri (față)'],c:['Priza la lățimea umerilor, nu mai îngustă.','Omoplații strânși, ca la Bench Press.','Coatele aproape de trunchi, la 30–45°.','Coboară bara pe partea de jos a pieptului.','Împinge până la brațe întinse, simțind tricepsul.'],
  x:['Priză prea îngustă: încheieturile suferă.','Coatele se deschid lateral.','Bara sare din piept.'],s:'Opritoare de siguranță sau partener la seriile grele.'},
 'Chest Supported Row':{m:['Spate (mijloc)','Dorsal mare','Umeri (spate)','Biceps'],c:['Pieptul lipit de suport pe toată mișcarea, gâtul neutru.','Pornește cu brațele întinse și umerii lăsați ușor în față.','Trage coatele spre spate și spre șolduri, strângând omoplații.','Ține o secundă sus, apoi coboară controlat.','Mâinile relaxate: tragi din coate, nu din încheieturi.'],
  x:['Pieptul se ridică de pe suport ca să ajuți cu trunchiul.','Umerii urcă spre urechi la finalul tracțiunii.','Amplitudine scurtă: brațele nu se întind jos.'],s:'Folosește chingi dacă priza cedează înaintea spatelui.'},
 'Seated Overhead Press':{m:['Umeri (față și lateral)','Triceps'],c:['Spătarul vertical sau aproape vertical, spatele lipit de el.','Abdomenul strâns, fără arc lombar exagerat.','Pornești de la nivelul bărbiei, cu antebrațele verticale.','Împinge în sus până la brațe întinse deasupra capului.','Coboară controlat până la nivelul bărbiei.'],
  x:['Arc lombar mare ca să împingi mai mult.','Coatele trase mult în spate.','Amplitudine scurtă jos.'],s:'Dacă te ciupește umărul sus, folosește gantere cu priză neutră.'},
 'Push Press':{m:['Umeri','Triceps','Picioare (impuls)'],c:['Bara pe umerii din față, priza puțin mai lată decât umerii, coatele ușor în față.','Dip scurt: îndoaie genunchii 10–15 cm, trunchiul rămâne vertical.','Întinde exploziv picioarele și împinge imediat bara deasupra capului.','Capul trece „prin fereastră” sub bară; bara ajunge deasupra mijlocului tălpii.','Blochează brațele sus, apoi coboară bara pe umeri cu genunchii ușor îndoiți, ca să amortizezi.'],
  x:['Dip prea adânc sau cu trunchiul aplecat în față.','Pauză între dip și împins: pierzi impulsul.','Bara pleacă în față, departe de corp.'],s:'Lasă spațiu liber în jur. Dacă nu mai poți, coboară bara în față, pe umeri sau pe suport, niciodată în spate.'},
 'Lateral Raise':{m:['Umeri (lateral)'],c:['Stai drept, genunchii ușor îndoiți, trunchiul ușor înclinat în față.','Ridică brațele lateral, cu coatele ușor îndoite, până la nivelul umerilor.','Gândește-te că împingi mâinile spre pereții laterali, nu în sus.','Degetul mic la același nivel sau ușor sub degetul mare.','Coboară lent, în 2–3 secunde.'],
  x:['Umerii urcă spre urechi și preia trapezul.','Balans din trunchi.','Greutate prea mare, cu mișcare scurtă.'],s:'Dacă te ciupește umărul sus, ridică brațele puțin mai în față, în planul omoplatului.'},
 'Dumbbell Lateral Raise':{m:['Umeri (lateral)'],c:['Ganterele lângă coapse, genunchii ușor îndoiți, trunchiul ușor înclinat în față.','Ridică lateral, cu coatele ușor îndoite, până la nivelul umerilor.','Coatele conduc mișcarea; mâinile nu trec peste coate.','Ține o clipă sus, fără să ridici umerii.','Coboară lent, în 2–3 secunde.'],
  x:['Ridici umerii spre urechi.','Arunci ganterele cu balans din trunchi.','Greutate prea mare: ultimele repetări ies scurte.'],s:'Greutăți mici, repetări curate. Ridică puțin în față dacă simți ciupire în umăr.'},
 'Cable Face Pull':{m:['Umeri (spate)','Spate (sus)','Rotatorii umărului'],c:['Scripetele la nivelul frunții, cu frânghie.','Priza cu degetele mari spre tine.','Trage frânghia spre față, desfăcând capetele lângă urechi.','Coatele rămân sus, la nivelul umerilor.','La final rotește pumnii spre tavan și ține o secundă.'],
  x:['Greutate prea mare: tragi cu trunchiul spre spate.','Coatele cad jos și exercițiul devine un ramat.','Smucituri în loc de mișcare controlată.'],s:'E un exercițiu pentru sănătatea umerilor: greutate moderată, control și strângere la final.'},
 'Tricep Pushdown':{m:['Triceps'],c:['Coatele lipite de corp și fixe pe toată mișcarea.','Trunchiul ușor înclinat în față, umerii jos.','Împinge până la brațe complet întinse și strânge tricepsul o secundă.','Revino controlat până la aproximativ 90° la cot.','Încheieturile drepte.'],
  x:['Coatele pleacă în față la urcare.','Te apleci peste cablu și împingi cu greutatea corpului.','Amplitudine scurtă.'],s:'Dacă te doare cotul, folosește frânghia sau o priză neutră și mai puțină greutate.'},
 'Tricep Rope Pushdown':{m:['Triceps'],c:['Coatele lipite de corp, fixe.','Prinde frânghia cu degetele mari în sus.','Împinge în jos până la brațe întinse.','La final desfă capetele frânghiei lateral și strânge tricepsul.','Revino controlat până la aproximativ 90° la cot.'],
  x:['Coatele se mișcă înainte și înapoi.','Trunchiul se apleacă mult ca să ajute.','Revenire scăpată, fără control.'],s:'Fără smucituri la final; controlul contează mai mult decât greutatea.'},
 'Tricep Overhead Extension':{m:['Triceps (capul lung)'],c:['Coatele sus, aproape de cap, orientate înainte.','Coboară greutatea în spatele capului până simți întinderea în triceps.','Întinde brațele fără să miști coatele.','Abdomenul strâns, fără arc lombar.','Coboară controlat, în 2 secunde.'],
  x:['Coatele se depărtează mult lateral.','Arc lombar ca să împingi greutatea.','Amplitudine scurtă: nu cobori destul.'],s:'Dacă te doare cotul, treci pe cablu și redu greutatea.'},
 'Bicep Curl':{m:['Biceps','Antebraț'],c:['Coatele lângă corp și fixe.','Urcă greutatea fără balans din trunchi.','Strânge sus o secundă, fără să duci coatele în față.','Coboară lent până la brațe aproape întinse.','Încheieturile drepte.'],
  x:['Te lași pe spate ca să urci greutatea.','Coatele pleacă mult în față.','Coborâre scăpată.'],s:'La durere în partea din față a cotului sau a umărului, redu greutatea și volumul.'},
 'Alternating Dumbbell Curl':{m:['Biceps','Antebraț'],c:['Ganterele lângă coapse, palmele spre corp.','Urcă o ganteră, rotind palma în sus pe drum.','Cotul rămâne lângă corp.','Strânge sus o secundă, apoi coboară lent.','Alternează brațele fără să legeni trunchiul.'],
  x:['Balans din trunchi.','Cotul pleacă în față și umărul preia.','Rotația palmei lipsește.'],s:'Greutăți controlabile: bicepsul răspunde la tensiune, nu la smucituri.'},
 'Barbell Curl':{m:['Biceps','Antebraț'],c:['Priza la lățimea umerilor, palmele în sus.','Coatele lângă corp, umerii jos.','Urcă bara fără să te lași pe spate.','Strânge sus o secundă.','Coboară lent până la brațe aproape întinse.'],
  x:['Balans din șolduri și spate.','Coatele pleacă în față.','Amplitudine scurtă jos.'],s:'Dacă te dor încheieturile, folosește o bară EZ.'},
 'Hack Squat':{m:['Cvadriceps','Fesieri','Adductori'],c:['Spatele și bazinul lipite de spătar.','Picioarele la lățimea umerilor, pe mijlocul platformei.','Genunchii merg în direcția vârfurilor.','Coboară controlat cât bazinul rămâne lipit de spătar, ideal până la coapsele paralele sau mai jos.','Împinge prin toată talpa, fără să blochezi brusc genunchii sus.'],
  x:['Călcâiele se ridică de pe platformă.','Genunchii cad spre interior la urcare.','Bazinul se dezlipește jos și spatele se rotunjește.'],s:'Folosește opritoarele de siguranță ale aparatului; deblochează-le doar când ești poziționat.'},
 'Leg Press':{m:['Cvadriceps','Fesieri'],c:['Spatele și bazinul lipite de spătar.','Picioarele la lățimea umerilor, pe mijlocul platformei.','Coboară controlat până la aproximativ 90° la genunchi sau cât bazinul nu se ridică.','Genunchii pe direcția vârfurilor.','Împinge prin toată talpa, fără să blochezi genunchii sus.'],
  x:['Bazinul se ridică jos și lombarul se rotunjește.','Genunchii blocați complet sus.','Amplitudine foarte mică cu greutate mare.'],s:'Nu bloca genunchii sus și eliberează opritoarele doar când ești gata.'},
 'Romanian Deadlift':{m:['Femurali','Fesieri','Lombar'],c:['Pornește în picioare cu bara, genunchii ușor îndoiți și fixați.','Împinge șoldurile în spate, ca și cum ai închide o ușă cu fundul.','Bara alunecă pe coapse, aproape de picioare.','Coboară până simți o întindere puternică în femurali (de obicei puțin sub genunchi), cu spatele drept.','Urcă împingând șoldurile înainte și strângând fesierii.'],
  x:['Spatele se rotunjește la coborâre.','Genunchii se îndoaie mult și devine o îndreptare clasică.','Bara se depărtează de picioare.'],s:'Coboară doar cât spatele rămâne neutru. Chingile ajută dacă priza cedează înaintea femuralilor.'},
 'Walking Lunge':{m:['Cvadriceps','Fesieri','Adductori'],c:['Pas lung înainte, trunchiul drept.','Coboară până genunchiul din spate aproape atinge podeaua.','Genunchiul din față în linie cu vârful piciorului.','Împinge prin călcâiul piciorului din față ca să treci la pasul următor.','Ganterele pe lângă corp, umerii jos.'],
  x:['Pas prea scurt, cu genunchiul mult peste vârf.','Genunchiul din față cade spre interior.','Trunchiul se apleacă mult în față.'],s:'Începe mai ușor până îți găsești echilibrul și asigură-te că ai spațiu liber în față.'},
 'Hip Thrust':{m:['Fesieri','Femurali'],c:['Partea de sus a spatelui pe bancă, chiar sub omoplați; bara pe pliul șoldului, cu pernă.','Tălpile la lățimea șoldurilor; sus, gambele sunt verticale.','Bărbia spre piept, privirea înainte.','Împinge prin călcâie până trunchiul ajunge paralel cu podeaua.','Strânge fesierii 1–2 secunde sus, fără să arcuiești lombarul.'],
  x:['Arcuiești spatele în loc să întinzi șoldul.','Picioarele prea departe: lucrează mai mult femuralii.','Amplitudine scurtă jos.'],s:'Folosește o pernă pentru bară și urcă greutatea treptat.'},
 'Hamstring Curl':{m:['Femurali','Gambe'],c:['Genunchii aliniați cu axa de rotație a aparatului.','Tamponul stă deasupra călcâielor.','Bazinul lipit de bancă (sau coapsele fixate, la varianta șezut).','Îndoaie genunchii complet și strânge o secundă.','Revino lent, în 2–3 secunde.'],
  x:['Bazinul se ridică ca să ajute.','Smucituri la începutul mișcării.','Amplitudine scurtă la întindere.'],s:'Fără smucituri: femuralii se accidentează cel mai des la viteză necontrolată.'},
 'Calf Raise':{m:['Gambe'],c:['Vârful piciorului pe treaptă, călcâiele în aer.','Coboară călcâiele lent, cât mai jos, și ține întinderea 1–2 secunde.','Urcă pe vârfuri cât de sus poți și ține o secundă.','Genunchii drepți, dar nu blocați.','Ritm lent, fără sărituri.'],
  x:['Săltări rapide fără control.','Amplitudine scurtă.','Genunchii se îndoaie ca să ajute.'],s:'Tendonul lui Ahile se adaptează încet: crește volumul treptat, mai ales în săptămânile cu multă alergare.'},
 'Hanging Leg Raise':{m:['Abdomen','Flexorii șoldului'],c:['Atârnat la bară, priza la lățimea umerilor, umerii trași ușor în jos (activi).','Începe cu genunchii: ridică-i spre piept și rulează bazinul în sus, nu doar picioarele.','Sus, ține o secundă; coapsele ajung cel puțin paralele cu podeaua.','Coboară în 2–3 secunde, fără să te legeni.','Când faci 12 repetări curate, treci la picioarele întinse.'],
  x:['Balans și elan din corp.','Doar ridici picioarele, fără să rulezi bazinul: lucrează mai mult flexorii șoldului.','Cobori brusc.'],s:'Dacă priza cedează înaintea abdomenului, folosește chingi pentru încheieturi sau fă varianta pe paralele (sprijinit pe antebrațe).'},
 'Plank':{m:['Abdomen','Fesieri','Umeri'],c:['Pe antebrațe, coatele sub umeri.','Corpul o linie dreaptă de la cap la călcâie.','Strânge abdomenul ca înaintea unei lovituri și strânge fesierii.','Respiră normal, scurt, fără să-ți ții aerul.','Ține 45–60 s; când e ușor, ridică un picior sau pune o greutate pe spate.'],
  x:['Bazinul cade spre podea (lombarul se arcuiește).','Fundul prea sus.','Îți ții respirația.'],s:'Calitatea contează mai mult decât timpul: oprește seria când bazinul începe să cadă.'},
 'Dragon Flag':{m:['Abdomen','Dorsal mare','Fesieri'],c:['Culcat pe bancă, apucă banca (sau un stâlp) în spatele capului.','Urcă genunchii la piept, apoi întinde corpul în sus, sprijinit doar pe umeri și spatele de sus.','Corpul rămâne drept ca o scândură, de la umeri la vârfuri; fesierii strânși.','Coboară încet, în 4–5 secunde, până aproape de bancă, fără să atingi cu fundul.','Începe cu negative (doar coborârea); apoi varianta cu genunchii îndoiți la urcare; apoi repetări complete.'],
  x:['Te îndoi din șold (fundul cade primul): pierzi tensiunea din abdomen.','Lombarul pe bancă se arcuiește.','Cobori necontrolat, prin cădere.','Gâtul împins în bancă.'],s:'E un exercițiu avansat și greu la greutate corporală mare: progresează din negative, fără eșec, și oprește-te la orice durere de spate sau gât.'},
 'Pallof Press':{m:['Abdomen','Oblici'],c:['Lateral față de cablu, mânerul la piept, picioarele la lățimea umerilor.','Strânge abdomenul și fesierii, bazinul stă drept.','Împinge mânerul drept în față și ține 2 secunde.','Nu lăsa trunchiul să se rotească spre cablu.','Revino lent la piept; toate repetările pe o parte, apoi pe cealaltă.'],
  x:['Trunchiul se rotește după cablu.','Greutate prea mare: corpul se înclină.','Brațele fac toată treaba, abdomenul relaxat.'],s:'E un exercițiu anti-rotație: ajută stabilitatea la alergare. Greutatea mică, controlul mare.'},
 'Ab Wheel Rollout':{m:['Abdomen','Dorsal mare','Umeri'],c:['În genunchi, mâinile pe roată sub umeri, spatele ușor rotunjit.','Strânge abdomenul și fesierii înainte să pleci.','Rulează în față doar cât poți ține spatele drept (fără arcuire).','Trage înapoi din abdomen, nu din șold.','Crește distanța treptat; mai târziu, din picioare.'],
  x:['Lombarul se arcuiește la capătul drumului.','Fundul urcă primul la întoarcere.','Ieșire prea lungă de la început.'],s:'Începe cu o ieșire scurtă sau spre un perete care oprește roata; mărește distanța doar când spatele rămâne drept.'}
};
/* mișcările din conditioning și din finisher: câte 3 repere */
const MOVES=[
 ['Wall Balls',['Mingea la piept, coatele sub ea.','Genuflexiune completă, apoi aruncă mingea la țintă din impulsul picioarelor.','Prinde mingea și intră direct în următoarea genuflexiune.']],
 ['Burpee Broad Jumps',['Burpee complet: pieptul atinge podeaua.','Sari în lungime cu ambele picioare, aterizează moale, cu genunchii îndoiți.','Ritm constant, nu sprint la primele runde.']],
 ['Kettlebell Swings',['Mișcarea vine din șolduri, nu din brațe: împinge șoldurile înainte.','Spatele drept, kettlebell-ul trece pe sub fund.','Sus, corpul e drept, cu fesierii strânși.']],
 ['Push Ups',['Corpul într-o linie dreaptă de la cap la călcâie.','Coatele la aproximativ 45° față de trunchi.','Pieptul coboară aproape de podea la fiecare repetare.']],
 ['Ski / Row 250 m',['Vâslit: picioare, apoi trunchi, apoi brațe; la revenire, invers.','Ski: brațele trag în jos, trunchiul se apleacă, șoldurile se închid.','Ține un ritm pe care îl poți repeta în toate cele 8 runde.']],
 ['Med Ball Chest Throws',['Stai cu fața la perete, mingea la piept.','Aruncă exploziv, întinzând brațele complet.','Prinde și repetă imediat: viteza contează, nu greutatea.']],
 ['Plyo Push Ups',['Coboară controlat, apoi împinge exploziv cât să se desprindă palmele.','Aterizează moale, cu coatele ușor îndoite.','Variantă mai ușoară: cu genunchii pe podea sau cu mâinile pe bancă.']]];
const DRILLS=[['A-skip','Genunchiul urcă la nivelul șoldului, piciorul aterizează sub corp pe vârf; brațele lucrează opus.'],
 ['B-skip','Ca la A-skip, dar întinzi piciorul înainte și îl „tragi” sub corp, ca o gheară.'],
 ['Genunchii sus','Pași rapizi pe loc sau în deplasare, genunchii la nivelul șoldului, trunchiul drept.'],
 ['Călcâie la fese','Pași scurți și rapizi, călcâiul atinge fesierul, coapsa rămâne verticală.'],
 ['Accelerări','20 de secunde: pornești ușor și ajungi la ~90% din viteză, relaxat; revii la pas.']];
const STRETCHES=[['Fandare joasă · stânga','Genunchiul drept jos, piciorul stâng în față; împinge bazinul înainte, cu fesierul drept strâns.'],
 ['Fandare joasă · dreapta','Genunchiul stâng jos, piciorul drept în față; împinge bazinul înainte.'],
 ['Porumbelul · stânga','Piciorul stâng îndoit în fața ta, cel drept întins în spate; lasă trunchiul încet înainte.'],
 ['Porumbelul · dreapta','Piciorul drept îndoit în față, cel stâng întins în spate.'],
 ['Femurali','Așezat, un picior întins: apleacă-te din șold, cu spatele drept. Schimbă piciorul la semnal.'],
 ['Cvadriceps','În picioare sau culcat pe o parte: prinde glezna, genunchii apropiați. Schimbă la semnal.'],
 ['Gambe la perete','Mâinile pe perete, piciorul din spate întins, călcâiul jos. Schimbă la semnal.'],
 ['Piept în cadrul ușii','Antebrațele pe tocul ușii, la nivelul umerilor; pas înainte până simți întinderea.'],
 ['Poziția copilului','În genunchi, brațele întinse mult înainte, șoldurile spre călcâie: se întinde dorsalul.'],
 ['Rotație toracică','Culcat pe o parte, genunchii la 90°: deschide brațul de sus spre podeaua din spate.']];
const MOBILITY=[['Pisică–cămilă',60,'În patru labe: rotunjește și arcuiește spatele, lent, după respirație.'],
 ['Fandare cu rotație · stânga',60,'Piciorul stâng în față, mâna dreaptă pe podea; rotește trunchiul și ridică brațul stâng spre tavan.'],
 ['Fandare cu rotație · dreapta',60,'Piciorul drept în față, mâna stângă pe podea; ridică brațul drept spre tavan.'],
 ['Șolduri 90/90',60,'Așezat, ambii genunchi la 90°: rotește genunchii dintr-o parte în alta, controlat.'],
 ['Genuflexiune adâncă',60,'Stai jos în genuflexiune, coatele împing genunchii în afară, pieptul sus.'],
 ['Glezne la perete',60,'Genunchiul împinge spre perete peste vârful piciorului, călcâiul rămâne jos. Schimbă la semnal.',1],
 ['Rotații toracice în patru labe',60,'Mâna la ceafă: rotește cotul spre tavan și înapoi. Schimbă la semnal.',1],
 ['Treceri cu banda sau bățul',60,'Brațele întinse, priză largă: treci banda peste cap și în spate, fără să îndoi coatele.'],
 ['Pod pentru fesieri',60,'Culcat pe spate: ridică șoldurile și strânge fesierii 2 secunde sus.'],
 ['Atârnat la bară',30,'Atârnă relaxat, cu brațele întinse; lasă umerii să se întindă.'],
 ['Respirație pe burtă',90,'Culcat, mâna pe abdomen: inspiră 4 secunde pe nas, expiră 6 secunde.']];
const WARMUP=[['Cardio ușor',120,'Bicicletă, ski, vâslit sau mers alert: pulsul urcă puțin, te încălzești.'],['Cercuri cu brațele',30,'Mici, apoi mari, înainte și înapoi.'],
 ['Desfaceri cu banda',30,'Brațele întinse în față: depărtează banda spre piept, cu omoplații strânși.'],['Genuflexiuni fără greutate',30,'Lent, cât mai jos, cu pieptul sus.'],
 ['Fandări cu rotație',30,'Alternează picioarele și rotește trunchiul spre piciorul din față.'],['Pisică–cămilă',30,'Mobilizează coloana înainte de greutăți.'],['Flotări ușoare',30,'8–10 repetări controlate, la podea sau cu mâinile pe bancă.']];
const exNote=n=>((S.exNote||{})[n])||'';
const ytLink=n=>'https://www.youtube.com/results?search_query='+encodeURIComponent(n+' exercise technique');
const TECH_SCHEMA={type:'object',additionalProperties:false,required:['muscles','cues','mistakes','safety'],properties:{
  muscles:{type:'array',items:{type:'string'}},cues:{type:'array',items:{type:'string'}},mistakes:{type:'array',items:{type:'string'}},safety:{type:'string'}}};
const techPrompt=n=>'Exercițiul de forță: "'+n+'"'+(n==='Hack Squat'?' (la aparatul de hack squat, în locul genuflexiunilor cu bara)':'')+
  '. Scrie în română, concis: mușchii principali lucrați (2–4, nume scurte); 5 indicații de execuție corectă, fiecare o propoziție scurtă la imperativ; 3 greșeli frecvente, fiecare o propoziție scurtă; o notă de siguranță de o propoziție.';
async function techLoad(n,force){
  SH={kind:'tech',n,busy:false,err:null};
  if(S.tech[n]&&!force){ shRender(); return; }
  if(!S.aiKey){ SH.err='nokey'; shRender(); return; }
  SH.busy=true; shRender(); let A=null;
  try{ COACH.preflight(); A=await loadSdk(); const client=COACH.client(A,S.aiKey);
    const msg=await client.beta.messages.stream({model:AI_MODEL,max_tokens:16000,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
      output_config:{effort:'low',format:{type:'json_schema',schema:TECH_SCHEMA}},messages:[{role:'user',content:techPrompt(n)}]}).finalMessage();
    if(msg.stop_reason==='refusal') throw new Error('__refuz');
    const r=JSON.parse(msg.content.filter(b=>b.type==='text').map(b=>b.text).join(''));
    /* indicațiile de tehnică trec prin filtru fără accidentări: descriu exercițiul cerut, nu îl recomandă */
    const v=COACH.verify('tehnică',[].concat(r.muscles||[],r.cues||[],r.mistakes||[],[r.safety||'']).join('. '),Object.assign(aiCtx(),{injuries:[]}));
    if(!v.ok) throw new Error('__filtru:'+v.message);
    const t=Object.assign({},S.tech); t[n]={muscles:(r.muscles||[]).slice(0,5),cues:(r.cues||[]).slice(0,7),mistakes:(r.mistakes||[]).slice(0,5),safety:r.safety||'',at:todayKey()};
    await save('tech',t); await save('aiUsed',(S.aiUsed||0)+1);
    if(SH&&SH.kind==='tech'&&SH.n===n){ SH.busy=false; SH.err=null; }
  }catch(e){ if(SH&&SH.kind==='tech'&&SH.n===n){ SH.busy=false; SH.err=e&&e.message==='__refuz'?'Modelul a refuzat cererea.':e&&/^__filtru:/.test(e.message)?e.message.slice(9):e instanceof SyntaxError?'Răspunsul nu a putut fi citit. Mai încearcă.':aiErrText(e,A); } }
  if(SH&&SH.kind==='tech'&&SH.n===n) shRender();
  STC=null;
}
/* v19: ghidul fără internet și fără AI — GUIDE pentru exercițiile vechi din plan, altfel instrucțiunile din catalog (32) */
function guideOf(n){ if(GUIDE[n]) return GUIDE[n]; const i=exInfo(n); if(!i||!i.c||!i.c.length) return null;
  return {m:Object.keys(i.mm||{}).sort((a,b)=>(i.mm[b]||0)-(i.mm[a]||0)).map(k=>MUSC_RO[k]||k),c:i.c,x:i.x||[],s:i.s||''}; }
function techHTML(){
  const n=SH.n, g=guideOf(n);
  if(!g) return techAiHTML();
  const t=S.tech[n], cue=(c,i)=>`<div class="cue"><b>${i+1}</b><span>${esc(c)}</span></div>`, bad=c=>`<div class="cue"><span class="xi">${ic('x')}</span><span>${esc(c)}</span></div>`;
  return `<div class="eyebrow">${ic('info')} Ghidul exercițiului</div><div class="h2" style="margin-top:6px">${esc(n)}</div>
    <div class="chips" style="margin-top:12px">${g.m.map(m=>`<span class="tag lift">${esc(m)}</span>`).join('')}</div>
    ${miloCue(n)?`<div class="easy" style="margin-top:12px">${ic('bolt')} <b>Dr. Milo Wolf:</b> ${esc(miloCue(n))}</div>`:''}
    <div class="dsec"><h4>Execuție</h4>${g.c.map(cue).join('')}</div>
    <div class="dsec"><h4>Greșeli frecvente</h4>${g.x.map(bad).join('')}</div>
    ${g.s?`<div class="easy" style="margin-top:12px">${ic('alert')} ${esc(g.s)}</div>`:''}
    <a class="btn ghost wide" style="margin-top:14px" href="${ytLink(n)}" target="_blank" rel="noopener">${ic('play')} Vezi execuția pe YouTube</a>
    <div class="dsec"><h4>Notița ta</h4><textarea class="inp" id="exNote" rows="2" maxlength="200" placeholder="ex: scaunul pe 4, picioarele sus pe platformă, priza pe inelul 2">${esc(exNote(n))}</textarea>
      <button class="btn sm" style="margin-top:8px" data-a="exNoteSave" data-k="${esc(n)}">${ic('check')} Salvează notița</button>
      <div class="xs mu2" style="margin-top:6px">Apare în antrenament, sub numele exercițiului: setările aparatului, priza, ce să nu uiți.</div></div>
    ${t&&!SH.busy?`<div class="dsec"><h4>De la antrenorul AI</h4>${t.cues.map(cue).join('')}${t.mistakes.map(bad).join('')}</div>`
      :SH.busy?`<div class="msg ai" style="margin-top:14px">${typingDots} Pregătesc indicațiile…</div>`
      :SH.err==='nokey'?`<div class="note">Detaliile suplimentare vin de la antrenorul AI și au nevoie de cheia API (Setări → Antrenor AI).</div>`
      :SH.err?`<div class="err">${ic('alert')}<span>${esc(SH.err)}</span></div>`:''}
    <div class="inrow">${S.aiKey&&!SH.busy?`<button class="btn ghost sm" data-a="techRe" data-k="${esc(n)}">${ic('coach')} ${t?'Alte indicații AI':'Mai multe de la AI'}</button>`:''}<button class="btn" style="flex:1" data-a="shClose">Închide</button></div>`;
}
function techAiHTML(){
  const n=SH.n, t=S.tech[n];
  return `<div class="eyebrow">${ic('info')} Tehnică · AI</div><div class="h2" style="margin-top:6px">${esc(n)}</div>
    ${t&&!SH.busy?`<div class="chips" style="margin-top:12px">${t.muscles.map(m=>`<span class="tag lift">${esc(m)}</span>`).join('')}</div>
      <div class="dsec"><h4>Execuție</h4>${t.cues.map((c,i)=>`<div class="cue"><b>${i+1}</b><span>${esc(c)}</span></div>`).join('')}</div>
      <div class="dsec"><h4>Greșeli frecvente</h4>${t.mistakes.map(c=>`<div class="cue"><span class="xi">${ic('x')}</span><span>${esc(c)}</span></div>`).join('')}</div>
      ${t.safety?`<div class="easy" style="margin-top:12px">${ic('alert')} ${esc(t.safety)}</div>`:''}
      <div class="inrow"><button class="btn ghost sm" data-a="techRe" data-k="${esc(n)}">${ic('refresh')} Regenerează</button><button class="btn" style="flex:1" data-a="shClose">Închide</button></div>`
    :SH.busy?`<div class="msg ai" style="margin-top:14px">${typingDots} Pregătesc indicațiile…</div>`
    :SH.err==='nokey'?`<div class="note">Indicațiile sunt generate de antrenorul AI și au nevoie de cheia API (Setări → Antrenor AI).</div><div class="inrow"><button class="btn pri" style="flex:1" data-a="tab" data-k="set">Deschide Setări</button></div>`
    :SH.err?`<div class="err">${ic('alert')}<span>${esc(SH.err)}</span><button class="btn sm" data-a="techRe" data-k="${esc(n)}">Reîncearcă</button></div>`:''}`;
}
function cmpHTML(){
  const ps=S.photos||[], a=ps.find(p=>p.id===SH.a), b=ps.find(p=>p.id===SH.b);
  if(!a||!b) return `<div class="note">Pozele nu mai există.</div>`;
  const L={fata:'față',profil:'profil',spate:'spate'}, opts=sel=>ps.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${fmtDay(p.date)} · ${L[p.pose]||p.pose}</option>`).join('');
  return `<div class="eyebrow">${ic('camera')} Înainte și după</div>
    <div class="form"><div class="fld"><label for="cmpA">Înainte</label><select class="inp" id="cmpA" data-cmp="a">${opts(a.id)}</select></div>
      <div class="fld"><label for="cmpB">După</label><select class="inp" id="cmpB" data-cmp="b">${opts(b.id)}</select></div></div>
    <div class="cmp" id="cmp"><img src="${b.data}" alt="După, ${b.date}"><img class="top" src="${a.data}" alt="Înainte, ${a.date}"><span class="line"></span>
      <span class="lb" style="left:10px">${fmtDay(a.date)}</span><span class="lb" style="right:10px">${fmtDay(b.date)}</span></div>
    <input type="range" class="rng" id="cmpR" min="0" max="100" value="50" aria-label="Glisor înainte și după">
    <div class="note">${daysBetween(a.date,b.date)>0?daysBetween(a.date,b.date)+' zile între poze.':''} Trage de glisor ca să compari.</div>
    <div class="inrow"><button class="btn ghost danger" data-a="phDel" data-k="${b.id}" data-confirm="Sigur? Apasă iar">${ic('trash')} Șterge „după”</button><button class="btn" style="flex:1" data-a="shClose">Închide</button></div>`;
}
function motionHTML(){
  return `<div class="eyebrow">${ic('bolt')} Animații</div><div class="h2" style="margin-top:6px">Animațiile sunt reduse</div>
    <p class="mu">Dispozitivul tău are setată <b>mișcarea redusă</b> (pe Windows: „Efecte de animație” oprite; pe iPhone: „Reducere mișcare”), așa că FALCO a oprit animațiile, inclusiv cea de deschidere.
    Poți să le pornești doar în aplicație, fără să schimbi setarea sistemului.</p>
    <div class="inrow" style="flex-direction:column"><button class="btn pri xl wide" data-a="motionSet" data-k="on">${ic('bolt')} Pornește animațiile în FALCO</button>
      <button class="btn ghost wide" data-a="motionSet" data-k="auto">Las-o după sistem</button></div>
    <div class="note">Poți schimba oricând din Setări → Aspect → Mișcare.</div>`;
}
/* foile modulelor noi: SHEETS.tip=()=>html */
const SHEETS={dash:()=>dashEditHTML(),goal1:()=>goalHTML(),hist:()=>histHTML(),notif:()=>notifHTML(),run:()=>runHTML(),rcmp:()=>rcmpHTML()};
function shRender(){
  const r=$('#shRoot'); if(!SH){ r.innerHTML=''; updLock(); return; }
  const inner=SHEETS[SH.kind]?SHEETS[SH.kind]():SH.kind==='day'?dayHTML(SH.k):SH.kind==='tech'?techHTML():SH.kind==='motion'?motionHTML():SH.kind==='hr'?hrHTML()
    :SH.kind==='ci'?readyCard():SH.kind==='goal'?goalForm():SH.kind==='tool'?toolHTML():SH.kind==='food'?foodHTML():SH.kind==='cyc'?cycHTML():cmpHTML();
  /* aceeași foaie deja deschisă: înlocuiesc doar conținutul, fără să reiau animația de intrare și fără să pierd derularea */
  const sh=r.querySelector('.sheet');
  if(sh&&r.dataset.k===SH.kind){ sh.innerHTML=`<div class="grab"></div>${inner}`; return; }
  r.dataset.k=SH.kind;
  r.innerHTML=`<div class="ov" data-a="shClose"><div class="sheet ${SH.wide?'wide':''}" role="dialog"><div class="grab"></div>${inner}</div></div>`; updLock();
}
/* recapitularea săptămânii, ca povești */
const RC={open:false,i:0,sl:[],d:null,down:0};
function recapData(off){
  const m0=dayShift(mondayOf(todayKey()),-7*off), m1=dayShift(m0,6), tk=todayKey(), inW=d=>d>=m0&&d<=m1;
  const ses=(S.hist||[]).filter(h=>inW(h.date)); let sets=0,vol=0; const ex={};
  Object.keys(S.lifts||{}).forEach(n=>(S.lifts[n]||[]).forEach(e=>{ if(!inW(e.d)) return; e.s.forEach(([w,r])=>{ sets++; vol+=w*r; ex[n]=(ex[n]||0)+1; }); }));
  const prs=prEvents().filter(p=>inW(p.d)), runs=runsIn(m0,m1), km=sumKm(runs), longest=runs.reduce((a,r)=>Math.max(a,+r.km||0),0);
  const paces=runs.map(paceOf).filter(Boolean), {L,R}=activity(); let active=0; for(let i=0;i<7;i++){ const k=dayShift(m0,i); if(L.has(k)||R.has(k)) active++; }
  const wl=wList(), avgIn=(a,b)=>{ const x=wl.filter(p=>p.d>=a&&p.d<=b); return x.length?x.reduce((s,p)=>s+p.w,0)/x.length:null; };
  const tg=targets(); let kd=0,ks=0,pd=0,wd=0,ws=0,meals=0;
  for(let i=0;i<7;i++){ const k=dayShift(m0,i); if(k>tk) break; const ml=mlogDay(k); if(ml.length){ kd++; meals+=ml.length; const t=dayTotals(k); ks+=t.k; if(t.p>=tg.p*.95) pd++; } const w=waterOf(k); if(w){ wd++; ws+=w; } }
  const ms=muscleSets(m0,m1).m, topM=MUSC.map(([k,l])=>({k,l,v:ms[k]})).sort((a,b)=>b.v-a.v)[0], topEx=Object.keys(ex).sort((a,b)=>ex[b]-ex[a])[0]||null;

  return {m0,m1,ses,sets,vol,ex,topEx,prs,runs,km,longest,bestPace:paces.length?Math.min(...paces):null,active,wNow:avgIn(m0,m1),wPrev:avgIn(dayShift(m0,-7),dayShift(m0,-1)),
    kd,kAvg:kd?ks/kd:null,pd,wAvg:wd?ws/wd:null,ms,topM,tg};
}
function recapSlides(d){
  const A=TH().ac, A2=TH().ac2, sl=[], range=fmtDay(d.m0)+' – '+fmtDay(d.m1), N=(v,dec=0)=>`<span data-cnt="${(+v).toFixed(dec)}" data-dec="${dec}">${num(v,dec)}</span>`;
  const st=stats();
  sl.push({c1:A,c2:'#9CC9F2',h:`<div class="rc-k">Recapitularea săptămânii</div><div class="rc-t">${esc(range)}</div><div class="rc-n">${N(d.active)}<small> din 7 zile active</small></div>
    <div class="rc-p">${d.active>=5?'O săptămână plină. Hai să vedem cifrele.':d.active>=3?'Ritm bun. Hai să vedem cifrele.':'Fiecare zi contează. Hai să vedem ce a ieșit.'}</div>`});
  sl.push({c1:A2,c2:A,h:`<div class="rc-k">Antrenamente terminate</div><div class="rc-n">${N(d.ses.length)}</div>
    <div class="rc-p">${d.ses.length?d.ses.map(h=>'<b>'+esc(DAYN[h.d])+'</b> · '+esc(h.t)).join('<br>'):'Niciun antrenament terminat în modul ghidat. Data viitoare apasă „Începe antrenamentul” pe ecranul Azi.'}</div>`});
  sl.push({c1:A,c2:'#9A94B8',h:`<div class="rc-k">Forță</div><div class="rc-n">${N(d.sets)}<small> serii</small></div>
    <div class="rc-grid"><div class="rc-c"><b>${N(d.vol/1000,1)} t</b><span>volum ridicat</span></div><div class="rc-c"><b>${Object.keys(d.ex).length}</b><span>exerciții</span></div>
      <div class="rc-c"><b>${d.prs.length}</b><span>recorduri</span></div><div class="rc-c"><b class="t">${esc(d.topEx||'—')}</b><span>cel mai lucrat</span></div></div>`});
  if(d.prs.length) sl.push({c1:'#E5C07B',c2:A,h:`<div class="rc-k">Recorduri noi</div><div class="rc-n">${N(d.prs.length)}</div>
    <div class="rc-p">${d.prs.slice(0,5).map(p=>`<b>${esc(p.n)}</b>: ${p.prev} → ${p.b} kg (1RM estimat)`).join('<br>')}</div>`});
  sl.push({c1:'#9CC9F2',c2:'#9CC9F2',h:`<div class="rc-k">Alergare</div><div class="rc-n">${N(d.km,1)}<small> km</small></div>
    <div class="rc-grid"><div class="rc-c"><b>${d.runs.length}</b><span>ieșiri</span></div><div class="rc-c"><b>${num(d.longest,1)} km</b><span>cea mai lungă</span></div>
      <div class="rc-c"><b>${d.bestPace?mmss(d.bestPace):'—'}</b><span>cel mai bun ritm /km</span></div><div class="rc-c"><b>${num(d.runs.reduce((a,r)=>a+(+r.min||0),0),0)}</b><span>minute în mișcare</span></div></div>`});
  if(d.wNow!=null){ const dl=d.wPrev!=null?d.wNow-d.wPrev:null;
    sl.push({c1:'#8FBFA0',c2:'#9CC9F2',h:`<div class="rc-k">Corp</div><div class="rc-n">${dl!=null?(dl>0?'+':'')+num(dl,1):num(d.wNow,1)}<small> kg</small></div>
      <div class="rc-p">${dl!=null?'Media săptămânii: <b>'+num(d.wNow,1)+' kg</b>, față de '+num(d.wPrev,1)+' kg săptămâna dinainte. '+(dl<=0?'Merge în direcția bună.':'Greutatea fluctuează normal; contează trendul pe mai multe săptămâni.'):'Media săptămânii: <b>'+num(d.wNow,1)+' kg</b>.'}</div>`}); }
  if(d.kd||d.wAvg) sl.push({c1:'#8FBFA0',c2:A2,h:`<div class="rc-k">Nutriție</div><div class="rc-n">${d.kAvg?N(d.kAvg):'—'}<small> kcal pe zi</small></div>
    <div class="rc-grid"><div class="rc-c"><b>${d.kd}</b><span>zile notate</span></div><div class="rc-c"><b>${d.pd}</b><span>zile cu proteina atinsă</span></div>
      <div class="rc-c"><b>${d.wAvg?num(d.wAvg/1000,1)+' L':'—'}</b><span>apă pe zi</span></div><div class="rc-c"><b>${d.tg.kcal}</b><span>ținta de kcal</span></div></div>`});
  sl.push({c1:A,c2:'#9A94B8',h:`<div class="rc-k">Mușchii săptămânii</div><div class="rc-t">${d.topM&&d.topM.v?esc(d.topM.l)+' a dus greul':'Mușchii s-au odihnit'}</div>
    <div class="body-wrap rc-body">${bodySVG('f',d.ms,null,true)}${bodySVG('b',d.ms,null,true)}</div>`});
  sl.push({c1:'#9A94B8',c2:A,h:`<div class="rc-k">Consecvența ta</div><div class="rc-n">${N(st.streak)}<small> ${st.streak===1?'săptămână activă':'săptămâni active'} la rând</small></div>
    <div class="rc-p">O săptămână activă înseamnă cel puțin 3 zile cu antrenament sau alergare.</div>`});
  sl.push({c1:A,c2:'#9CC9F2',d:900,h:`<div class="rc-k">${esc(range)}</div><div class="rc-t">Săptămâna ta în cifre</div>
    <div class="rc-grid"><div class="rc-c"><b>${d.active}</b><span>zile active</span></div><div class="rc-c"><b>${d.sets}</b><span>serii</span></div>
      <div class="rc-c"><b>${num(d.km,1)}</b><span>km</span></div><div class="rc-c"><b>${d.prs.length}</b><span>recorduri</span></div></div>
    <div class="rc-acts"><button class="btn pri xl" data-a="rcShare">${ic('upload')} Distribuie ca imagine</button><button class="btn" data-a="rcAsk">${ic('coach')} Ce zice antrenorul?</button>
      <button class="btn ghost" data-a="rcClose">Închide</button></div>`});
  return sl;
}
async function rcOpen(off){ RC.d=recapData(off); RC.sl=recapSlides(RC.d); RC.i=0; RC.open=true; rcRender(); await save('recapSeen',(S.recapSeen||0)+1); }
function rcRender(){
  const r=$('#rcRoot'); if(!RC.open){ r.innerHTML=''; updLock(); return; }
  const s=RC.sl[RC.i];
  r.innerHTML=`<div class="rc" data-a="rcTap" style="--rc1:${glowA(s.c1,.6)};--rc2:${glowA(s.c2,.5)}"><div class="rc-bg"></div>
    <div class="rc-bars">${RC.sl.map((x,i)=>`<i class="${i<RC.i?'done':i===RC.i?'cur':''}" style="--d:${x.d||6}s"><b></b></i>`).join('')}</div>
    <button class="ib rc-x" data-a="rcClose" aria-label="Închide">${ic('x')}</button>
    <div class="rc-s">${s.h}</div></div>`;
  countUp(r); updLock(); buzz(8);
}
function rcGo(dir){ const n=RC.i+dir; if(n<0||n>=RC.sl.length) return; RC.i=n; rcRender(); }
document.addEventListener('animationend',e=>{ if(e.animationName==='rcfill'&&RC.open&&e.target.closest('.rc-bars i.cur')) rcGo(1); });
document.addEventListener('pointerdown',e=>{ const rc=e.target.closest&&e.target.closest('.rc'); if(rc&&!e.target.closest('button')){ RC.down=Date.now(); rc.classList.add('paused'); } },{passive:true});
document.addEventListener('pointerup',()=>{ const rc=$('.rc'); if(rc) rc.classList.remove('paused'); },{passive:true});
/* imagine de distribuit (1080 × 1350), desenată pe canvas */
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
async function shareImg(o){
  const fd='"Inter Variable",Inter,system-ui,sans-serif', fb=fd;
  try{ await document.fonts.load('700 100px "Inter Variable"'); }catch(e){}
  const W=1080,H=1350,c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'), t=TH();
  g.fillStyle='#050505'; g.fillRect(0,0,W,H);
  let gr=g.createRadialGradient(860,180,0,860,180,900); gr.addColorStop(0,'rgba(156,201,242,.22)'); gr.addColorStop(1,'rgba(5,5,5,0)'); g.fillStyle=gr; g.fillRect(0,0,W,H);
  /* semnul: cele trei rândunici, în dreapta sus */
  try{ const sw=new Path2D(UI.SWALLOW); g.fillStyle='#F4F6F8'; UI.FLOCK.forEach(([x,y,r,s])=>{ g.save(); g.translate(820+x*1.9,40+y*1.9); g.rotate(r*Math.PI/180); g.scale(s*1.9,s*1.9); g.fill(sw); g.restore(); }); }catch(e){}
  g.fillStyle='#F4F6F8'; g.font='300 64px '+fd; try{ g.letterSpacing='22px'; }catch(e){} g.fillText('FALCO',80,140); try{ g.letterSpacing='0px'; }catch(e){} g.fillStyle=t.ac; g.fillRect(82,166,72,3);
  g.fillStyle='rgba(255,255,255,.72)'; g.font='600 34px '+fb; g.fillText(String(o.k).toUpperCase(),80,280);
  g.fillStyle='#fff'; g.font='700 104px '+fd; let y=400; const words=String(o.t).toUpperCase().split(' '); let line='';
  words.forEach(wd=>{ const tst=line?line+' '+wd:wd; if(g.measureText(tst).width>W-160&&line){ g.fillText(line,80,y); y+=110; line=wd; } else line=tst; }); g.fillText(line,80,y);
  y+=70; const bw=(W-160-30)/2, bh=210;
  o.stats.slice(0,4).forEach((s,i)=>{ const x=80+(i%2)*(bw+30), yy=y+Math.floor(i/2)*(bh+30);
    rr(g,x,yy,bw,bh,28); g.fillStyle='rgba(255,255,255,.07)'; g.fill(); g.strokeStyle='rgba(255,255,255,.14)'; g.lineWidth=2; g.stroke();
    g.fillStyle='#fff'; g.font='700 92px '+fd; g.fillText(String(s[0]),x+30,yy+120); g.fillStyle='rgba(255,255,255,.7)'; g.font='600 30px '+fb; g.fillText(String(s[1]),x+32,yy+172); });
  y+=2*(bh+30)+30; g.font='600 32px '+fb;
  (o.lines||[]).slice(0,3).forEach(l=>{ g.fillStyle=t.ac; rr(g,80,y-30,14,36,6); g.fill(); g.fillStyle='#fff'; g.fillText(String(l).slice(0,48),112,y); y+=56; });
  g.fillStyle='rgba(255,255,255,.55)'; g.font='600 28px '+fb; g.fillText('FALCO',80,H-80); g.textAlign='right'; g.fillText(fmtDay(todayKey()),W-80,H-80); g.textAlign='left';
  const blob=await new Promise(res=>c.toBlob(res,'image/png')); if(!blob){ toast('Nu am putut crea imaginea','','info'); return; }
  const file=new File([blob],'falco-'+todayKey()+'.png',{type:'image/png'});
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'FALCO'}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=file.name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000); toast('Imagine salvată',file.name,'info');
}
async function rcShare(){ const d=RC.d; await shareImg({k:'Săptămâna '+fmtDay(d.m0)+' – '+fmtDay(d.m1),t:'Recapitulare',stats:[[d.active,'zile active'],[d.sets,'serii'],[num(d.km,1),'km'],[d.prs.length,'recorduri']],
  lines:d.prs.slice(0,3).map(p=>'PR '+p.n+': '+p.b+' kg')}); }
async function sumShare(){ const m=S.summary; if(!m) return; await shareImg({k:DAYN[m.d]+' · '+fmtDay(m.date),t:m.t,
  stats:[[fmtClock(m.dur),'durată'],[m.sets,'serii'],[m.km?num(m.km,2):Math.round(m.vol),m.km?'km':'kg volum'],[m.prList.length,m.prList.length===1?'record':'recorduri']],lines:m.prList.map(p=>'PR '+p.n+': '+num(p.w)+' × '+p.r)}); }
function updLock(){ document.body.classList.toggle('lock',!!((S.fxOpen&&S.sess)||S.summary||TM.open||OB||RD||CAL.open||SH||RC.open)); }
