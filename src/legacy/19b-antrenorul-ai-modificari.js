/* =====================================================================
   v16 · ANTRENORUL AI — unelte care modifică aplicația: setările de nutriție (metabolism, activitate, deficit, calorii, proteină,
   greutatea-țintă, grăsimea corporală, pauzele de dietă), alimentele din planul de mese, o masă din plan, un exercițiu din plan
   (înlocuit permanent) și câteva setări. Ca toate uneltele care scriu: modelul propune, tu confirmi, abia apoi se aplică.
   Fiecare intrare e validată aici (vine de la model); limitele sigure (pragul de calorii, +20% la alergare) nu se pot ocoli.
   ===================================================================== */
AI_TOOLS.push(
  {name:'set_nutrition',description:'Schimbă setările de nutriție. Trimite doar ce se schimbă. metabolism: cât de repede arde utilizatorul față de formule. kcal_target 0 = automat (din necesar și cântar). protein_g 0 = automat. deficit_kcal 0 = automat (~0,5% din greutate pe săptămână).',eager_input_streaming:true,
   input_schema:{type:'object',properties:{metabolism:{type:'string',enum:['normal','lent','foarte_lent']},activity:{type:'number',enum:[1.375,1.55,1.725,1.9],description:'Factorul de activitate.'},
     deficit_kcal:{type:'integer',description:'0 sau 100–1000.'},kcal_target:{type:'integer',description:'0 sau o țintă fixă de calorii pe zi.'},protein_g:{type:'integer',description:'0 sau 60–400.'},
     scale_correction_kcal:{type:'integer',description:'Corecția necesarului din cântar, −900…+500 (negativ = arde mai puțin decât formula). Înlocuiește corecția de acum.'},goal_weight_kg:{type:'number'},body_fat_pct:{type:'number'},diet_breaks:{type:'boolean',description:'true = 2 săptămâni deficit, 2 menținere; false = deficit continuu.'}}}},
  {name:'set_food_preferences',description:'Scoate alimente din planul de mese (exclude) sau le pune înapoi (include). Numele trebuie să fie din lista de alimente a aplicației (ex: avocado, skyr, mămăligă, somon, ton în apă).',eager_input_streaming:true,
   input_schema:{type:'object',properties:{exclude:{type:'array',items:{type:'string'}},include:{type:'array',items:{type:'string'}}}}},
  {name:'swap_meal',description:'Pune în planul de mese, la o masă, rețeta cea mai apropiată de numele dat (din baza aplicației). slot: 1 mic dejun, 2 gustare 1, 3 prânz, 4 gustare 2, 5 cină.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{slot:{type:'integer',description:'1–5'},meal:{type:'string',description:'Numele rețetei sau o parte din el, ex: „Ovăz cu whey și banană”.'},date:{type:'string',description:'YYYY-MM-DD, azi sau în următoarele 6 zile. Implicit azi.'}},required:['slot','meal']}},
  {name:'swap_exercise',description:'Înlocuiește permanent un exercițiu din planul de antrenament cu altul (seriile, repetările și pauza rămân). replacement „original” pune înapoi exercițiul din program. day: 1 luni … 7 duminică.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{day:{type:'integer',description:'1–7'},exercise:{type:'string',description:'Exercițiul de acum din ziua aceea.'},replacement:{type:'string',description:'Exercițiul nou (din baza de exerciții) sau „original”.'}},required:['day','exercise','replacement']}},
  {name:'set_app_setting',description:'Pornește sau oprește o setare: deload_auto (deload în săptămâna 4), diet_breaks (pauze de dietă), sound, voice.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{setting:{type:'string',enum:['deload_auto','diet_breaks','sound','voice']},value:{type:'boolean'}},required:['setting','value']}}
);
const aiFind=(q,list)=>{ const f=fold(String(q||'')).trim(); if(!f) return null;
  return list.find(n=>fold(n)===f)||list.find(n=>fold(n).indexOf(f)===0)||list.find(n=>fold(n).indexOf(f)>=0)||list.find(n=>f.indexOf(fold(n))>=0)||null; };
const profSet=async o=>{ await save('prof',Object.assign({},S.prof||{},o)); STC=null; };
const AI_WTOOLS={
  set_nutrition(inp){ const n=v=>typeof v==='number'&&isFinite(v), o={}, d=[], P=prof(), sex=P.sex==='f'?'f':'m';
    if(inp.metabolism!=null){ const v={normal:1,lent:.9,foarte_lent:.82}[inp.metabolism]; if(!v) return {err:'metabolism: normal, lent sau foarte_lent.'}; o.metab=v; d.push('metabolism '+METAB.find(m=>m[0]===v)[1].toLowerCase()); }
    if(inp.activity!=null){ if([1.375,1.55,1.725,1.9].indexOf(inp.activity)<0) return {err:'activity: 1.375, 1.55, 1.725 sau 1.9.'}; o.act=inp.activity; d.push('activitate ×'+inp.activity); }
    if(inp.deficit_kcal!=null){ if(!Number.isInteger(inp.deficit_kcal)||(inp.deficit_kcal!==0&&(inp.deficit_kcal<100||inp.deficit_kcal>1000))) return {err:'deficit_kcal: 0 sau 100–1000.'}; o.def=inp.deficit_kcal||null; d.push('deficit '+(inp.deficit_kcal?inp.deficit_kcal+' kcal':'automat')); }
    if(inp.kcal_target!=null){ if(!Number.isInteger(inp.kcal_target)||(inp.kcal_target!==0&&(inp.kcal_target<COACH.KCAL_FLOOR[sex]||inp.kcal_target>6000))) return {err:'kcal_target: 0 (automat) sau între '+COACH.KCAL_FLOOR[sex]+' și 6000.'}; o.kcalT=inp.kcal_target||null; d.push('calorii '+(inp.kcal_target?inp.kcal_target+' kcal':'automat')); }
    if(inp.protein_g!=null){ if(!Number.isInteger(inp.protein_g)||(inp.protein_g!==0&&(inp.protein_g<60||inp.protein_g>400))) return {err:'protein_g: 0 sau 60–400.'}; o.protT=inp.protein_g||null; d.push('proteină '+(inp.protein_g?inp.protein_g+' g':'automat')); }
    if(inp.scale_correction_kcal!=null){ if(!Number.isInteger(inp.scale_correction_kcal)||inp.scale_correction_kcal<-900||inp.scale_correction_kcal>500) return {err:'scale_correction_kcal: −900…+500.'};
      o.nAdj=Object.assign({},nAdj(),{c:inp.scale_correction_kcal,d:todayKey(),step:inp.scale_correction_kcal-(nAdj().c||0),ai:1}); d.push('corecția din cântar '+(inp.scale_correction_kcal>0?'+':'')+inp.scale_correction_kcal+' kcal'); }
    if(inp.goal_weight_kg!=null){ if(!n(inp.goal_weight_kg)||inp.goal_weight_kg<40||inp.goal_weight_kg>300) return {err:'goal_weight_kg: 40–300.'}; o.goalW=Math.round(inp.goal_weight_kg*10)/10; d.push('greutate-țintă '+num(o.goalW)+' kg'); }
    if(inp.body_fat_pct!=null){ if(!n(inp.body_fat_pct)||inp.body_fat_pct<5||inp.body_fat_pct>60) return {err:'body_fat_pct: 5–60.'}; o.bf=Math.round(inp.body_fat_pct*10)/10; d.push('grăsime '+num(o.bf)+'%'); }
    if(inp.diet_breaks!=null){ if(typeof inp.diet_breaks!=='boolean') return {err:'diet_breaks: true sau false.'}; o.dietBreak=inp.diet_breaks; d.push(inp.diet_breaks?'pauze de dietă (2 + 2 săptămâni)':'deficit continuu'); }
    if(!d.length) return {err:'Nicio setare de schimbat.'};
    return {icon:'flame',title:'Schimb setările de nutriție',desc:d.join(' · '),apply:async()=>{ await profSet(o); const tg=targets(); return 'Schimbat: '+d.join(', ')+'. Ținta de azi: '+tg.kcal+' kcal, '+tg.p+' g proteină; media săptămânii: '+weekTargets().avg+' kcal/zi.'; }}; },
  set_food_preferences(inp){ const arr=a=>Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,40):[];
    const exc=arr(inp.exclude).map(q=>[q,aiFind(q,MFOOD)]), inc=arr(inp.include).map(q=>[q,aiFind(q,MFOOD)]), bad=exc.concat(inc).filter(x=>!x[1]).map(x=>x[0]);
    if(bad.length) return {err:'Nu găsesc în lista de alimente: '+bad.join(', ')+'. Lista: '+MFOOD.join(', ')+'.'};
    if(!exc.length&&!inc.length) return {err:'Nimic de schimbat.'};
    const ex=new Set((S.mf||{}).ex||[]); exc.forEach(x=>ex.add(x[1])); inc.forEach(x=>ex.delete(x[1]));
    return {icon:'bowl',title:'Schimb alimentele din planul de mese',desc:[exc.length?'scot: '+exc.map(x=>x[1]).join(', '):'',inc.length?'pun înapoi: '+inc.map(x=>x[1]).join(', '):''].filter(Boolean).join(' · '),
      apply:async()=>{ await fprefSet([...ex]); return 'Alimente scoase acum: '+([...ex].join(', ')||'niciunul')+'.'; }}; },
  swap_meal(inp,date){ if(!Number.isInteger(inp.slot)||inp.slot<1||inp.slot>5) return {err:'slot: 1–5.'}; const tk=todayKey();
    if(date<tk||daysBetween(tk,date)>6) return {err:'Data trebuie să fie azi sau în următoarele 6 zile.'};
    const si=inp.slot-1, cat=MSLOTS[si][1], c=MEALS.map((m,i)=>({m,i})).filter(x=>x.m[0]===cat&&mealOK(x.m));
    const nm=aiFind(inp.meal,c.map(x=>x.m[1])); if(!nm) return {err:'Nu găsesc o rețetă potrivită la '+MSLOTS[si][0].toLowerCase()+' (cu alimentele permise). Exemple: '+[...new Set(c.map(x=>x.m[1].replace(/ · porție.*/,'')))].slice(0,12).join('; ')+'.'};
    const x=c.find(y=>y.m[1]===nm), m=x.m;
    return {icon:'bowl',title:'Schimb o masă din plan',desc:MSLOTS[si][0]+' · '+(date===tk?'azi':fmtDay(date))+' → '+m[1]+' ('+m[2]+' kcal, '+m[3]+' g proteină)',
      apply:async()=>{ await planSet(date,si,x.i); return 'Pus în plan: '+m[1]+' la '+MSLOTS[si][0].toLowerCase()+', '+date+'.'; }}; },
  swap_exercise(inp){ if(!Number.isInteger(inp.day)||inp.day<1||inp.day>7) return {err:'day: 1–7.'}; const d=inp.day-1;
    const day=dayFor(0,d,true), e=day.ex.find(x=>x.kind==='lift'&&fold(x.n)===fold(inp.exercise))||day.ex.find(x=>x.kind==='lift'&&fold(x.n).indexOf(fold(inp.exercise))>=0);
    if(!e) return {err:'Nu găsesc „'+inp.exercise+'” între exercițiile de forță de '+DAYN[d]+': '+day.ex.filter(x=>x.kind==='lift').map(x=>x.n).join(', ')+'.'};
    const orig=PLAN[d].ex[e.x][0], back=/^original$/i.test(String(inp.replacement||'').trim()), rep=back?orig:aiFind(inp.replacement,exAllNames());
    if(!rep) return {err:'Nu găsesc „'+inp.replacement+'” în baza de exerciții.'};
    return {icon:'dumbbell',title:'Schimb un exercițiu din plan',desc:DAYN[d]+': '+e.n+' → '+rep+(back?' (originalul)':'')+' · '+e.p,
      apply:async()=>{ const sw=Object.assign({},prof().exSwap||{}); if(rep===orig) delete sw[d+'_'+e.x]; else sw[d+'_'+e.x]=rep; await profSet({exSwap:sw}); return DAYN[d]+': '+e.n+' a devenit '+rep+'.'; }}; },
  set_app_setting(inp){ if(typeof inp.value!=='boolean') return {err:'value: true sau false.'}; const v=inp.value;
    const S1={deload_auto:['Deload automat',async()=>{ await save('deload',v); STC=null; }],diet_breaks:['Pauze de dietă',async()=>{ await profSet({dietBreak:v}); }],sound:['Sunet și vibrații',async()=>{ await save('sound',v); }],voice:['Voce',async()=>{ await save('voice',v); }]}[inp.setting];
    if(!S1) return {err:'Setare necunoscută.'};
    return {icon:'sliders',title:'Schimb o setare',desc:S1[0]+' → '+(v?'pornit':'oprit'),apply:async()=>{ await S1[1](); return S1[0]+': '+(v?'pornit':'oprit')+'.'; }}; }
};

/* v17: bilanțul săptămânii. O dată pe săptămână (la pornire, dacă ai cheia AI și cântăriri) sau la cerere, antrenorul primește
   mediile săptămânii și propune ajustările; fiecare schimbare o confirmi tu. */
function aiWeekText(){ const tg=targets(), W=weekTargets(), ww=wWeeks(), A=nAdj(), tk=todayKey(), eat=[];
  for(let i=1;i<=7;i++){ const k=dayShift(tk,-i), t=dayTotals(k); if(mlogDay(k).length>=3&&t.k>=1200) eat.push(t.k); }
  return 'Bilanțul săptămânii. '+(ww?`Media cântarului: ${num(ww.w0,1)} kg în săptămâna dinainte, ${num(ww.w1,1)} kg în ultimele 7 zile (${ww.rate>0?'+':''}${num(ww.rate,2)} kg/săpt.). `:'Am prea puține cântăriri pentru media pe două săptămâni. ')+
    `Ținta medie: ${W.avg} kcal/zi (necesar ${tg.tdee}, metabolism ${(METAB.find(m=>m[0]===metabF())||[0,'Normal'])[1].toLowerCase()}, corecția din cântar ${A.c>0?'+':''}${A.c||0} kcal, faza: ${tg.phase.label.toLowerCase()}). `+
    (eat.length?`Am notat mesele complet în ${eat.length} zile, în medie ${Math.round(eat.reduce((a,x)=>a+x,0)/eat.length)} kcal/zi. `:'Nu am notat mesele. ')+
    'Analizează săptămâna pe medii și, dacă greutatea nu scade cum trebuie, ajustează direct (set_nutrition). Spune-mi pe scurt ce schimbi și de ce.'; }
async function aiWeekReview(){ if(!S.aiKey||AI.busy) return; await profSet({aiWk:todayKey()}); await aiSend(aiWeekText()); }
ACT.aiWeek=()=>aiWeekReview();
function aiWeekAuto(){ const P=prof(), tk=todayKey(); if(!S.aiKey||!S.onb||!P.nutriOk||S.sess||AI.busy) return;
  if(P.aiWk&&daysBetween(P.aiWk,tk)<7) return; if(!wWeeks(tk)) return;
  setTimeout(()=>{ if(!AI.busy&&!S.sess) aiWeekReview(); },1500); }
