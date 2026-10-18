/* =====================================================================
   12 · ANTRENORUL AI — Claude prin SDK-ul oficial Anthropic (inclus în aplicație), direct din browser, cu cheia utilizatorului.
   Tot ce ține de siguranță e în src/lib/coach (COACH): cheia criptată, limita de cereri, filtrul pe răspunsuri, modul offline.
   ===================================================================== */
const AI_MODEL='claude-opus-5-5';
const AI={busy:false,stream:null,live:'',err:null,draft:'',usage:null,usageModel:null,retry:false,note:null,rec:null,offline:null};
const loadSdk=COACH.sdk;
/* contextul filtrului: sexul (pragul de calorii) și accidentările declarate */
const aiCtx=()=>{ const P=prof(); return {sex:P.sex==='f'?'f':'m',injuries:(Array.isArray(P.inj)?P.inj:[]).filter(COACH.isInjury)}; };
const AI_SYS=`Ești antrenorul personal din aplicația ZECE, care urmează programul hibrid Hybrid365 (forță + alergare).
Programul are cicluri de 4 săptămâni cu aceeași săptămână-tip:
- Luni: Easy run Z2 + Upper (Bench Press, Pull Up / Lat Pulldown, Incline Dumbbell Press, Chest Supported Row, Lateral Raise, Tricep Pushdown, Bicep Curl)
- Marți: Threshold run (încălzire, reprize la ritm de prag, răcire)
- Miercuri: Upper + Conditioning (Weighted Pull Up, Flat Dumbbell Press, Chest Supported Row, Seated Overhead Press, Cable Face Pull, Dumbbell Lateral Raise, Tricep Rope Pushdown, Alternating Dumbbell Curl, conditioning A sau B)
- Joi: Easy run Z2 (flush) + Lower (Hack Squat în loc de Back Squat, Romanian Deadlift, Walking Lunge, Hip Thrust, Leg Press, Hamstring Curl, Calf Raise)
- Vineri: Upper Strength + Power (Bench Press 5×3–5, Weighted Pull Up, Incline Dumbbell Press, Chest Supported Row, Push Press, Close Grip Bench Press, Barbell Curl, Tricep Overhead Extension, EMOM de putere)
- Sâmbătă: Long run Z2
- Duminică: recuperare și mobilitate
Alergările cresc de la o săptămână la alta (minute la easy și long run, reprize la prag).

Primești datele utilizatorului din aplicație: profil, greutate, măsurători, serii notate (kg × repetări), alergări, mâncare și apă, cum s-a simțit înainte de antrenamente, unde a ajuns în ciclu și antrenamentele terminate. Dacă primești în conversație un mesaj de sistem cu date actualizate, folosește versiunea cea mai nouă.

Cum răspunzi:
- În limba română, direct și concret, ca un antrenor care îl cunoaște. Folosește cifrele lui reale și dă recomandări pe care le poate aplica la următorul antrenament.
- Exercițiile și zilele planului rămân cele din program. Poți recomanda greutăți, repetări, ritmuri, ajustări de volum când e obosit, recuperare, somn și alimentație.
- La forță folosește dubla progresie: întâi repetările până la capătul intervalului la toate seriile, apoi crești greutatea. La alergare, zona 2 rămâne ușoară (poate vorbi în propoziții întregi), iar pragul e controlat, nu maximal.
- Țintele de calorii și proteină din aplicație sunt estimări; judecă după trendul greutății pe mai multe săptămâni.
- Dacă îți lipsesc date ca să răspunzi bine, spune exact ce să noteze în aplicație. Nu inventa valori.
- Siguranță: la durere ascuțită, durere în piept, amețeală sau o posibilă accidentare, recomanzi să se oprească și să meargă la medic sau kinetoterapeut; nu pui diagnostice. Nu recomanda deficite calorice extreme sau o scădere în greutate mai rapidă de aproximativ 1% din greutatea corporală pe săptămână.
- Limite fixe (aplicația oprește răspunsurile care le încalcă): nu pomeni deloc test boosters, arzătoare de grăsimi, prohormoni, SARMs, steroizi sau diuretice, nici măcar ca să le descurajezi; nu propune un aport sub 1600 kcal pe zi pentru femei sau 2000 kcal pe zi pentru bărbați; nu propune mai mult de 7 zile de antrenament la rând fără o zi de odihnă; nu recomanda exerciții care solicită zonele declarate accidentate (le găsești în profil) și nici nu le numi, propune direct alternativa.
- Ai unelte de citire (get_workouts, get_exercise_history, get_runs, get_records, get_period_summary, get_body, get_goals, get_insights) care întorc date exacte din aplicație. Folosește-le ori de câte ori întrebarea cere mai mult decât rezumatul de mai jos: istoric complet, comparații între antrenamente sau alergări, recorduri, perioade anume. Răspunde doar din ce întorc; dacă o unealtă nu găsește date, spune ce lipsește.
- Ai unelte prin care notezi date în aplicație (greutate, alergare, masă, apă, măsurători) și schimbi progresia alergărilor. Folosește-le doar când utilizatorul îți dă valorile și vrea să le notezi (de exemplu „am 131,4 kg azi" sau „notează-mi alergarea de 8 km în 55 de minute"); nu inventa valori pentru unelte. Utilizatorul confirmă fiecare acțiune în aplicație; după rezultat, confirmă pe scurt ce s-a notat.
- Format: răspunsuri scurte (de regulă sub 180 de cuvinte), paragrafe scurte și liste cu liniuță, **bold** pentru cifrele-cheie. Fără tabele.`;
const AI_TOOLS=[
  {name:'log_weight',description:'Notează greutatea corporală a utilizatorului într-o zi.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{kg:{type:'number',description:'Greutatea în kilograme.'},date:{type:'string',description:'Data, format YYYY-MM-DD. Implicit azi.'}},required:['kg']}},
  {name:'log_run',description:'Notează o alergare terminată.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{km:{type:'number',description:'Distanța în km.'},minutes:{type:'number',description:'Durata în minute.'},
     kind:{type:'string',enum:['ez','thr','lng'],description:'ez = easy Z2, thr = prag, lng = long run.'},date:{type:'string',description:'Data, format YYYY-MM-DD. Implicit azi.'}},required:['km','minutes','kind']}},
  {name:'log_meal',description:'Notează o masă în jurnalul de nutriție, cu valorile estimate.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{name:{type:'string',description:'Numele scurt al mesei, în română.'},kcal:{type:'number'},protein_g:{type:'number'},carbs_g:{type:'number'},fat_g:{type:'number'},
     date:{type:'string',description:'Data, format YYYY-MM-DD. Implicit azi.'}},required:['name','kcal','protein_g']}},
  {name:'log_water',description:'Adaugă apă băută azi, în mililitri.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{ml:{type:'number',description:'Cantitatea în ml.'}},required:['ml']}},
  {name:'log_measurements',description:'Notează măsurători corporale în centimetri (cel puțin una).',eager_input_streaming:true,
   input_schema:{type:'object',properties:{waist_cm:{type:'number'},chest_cm:{type:'number'},arm_cm:{type:'number'},thigh_cm:{type:'number'},date:{type:'string',description:'Data, format YYYY-MM-DD. Implicit azi.'}}}},
  {name:'set_run_progression',description:'Schimbă o valoare din progresia alergărilor pentru o săptămână a ciclului: minutele de easy de luni (ez1) sau de joi (ez2), numărul de reprize de prag (thr) sau minutele de long run (lng). Exercițiile și zilele nu se schimbă.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{row:{type:'string',enum:['ez1','thr','ez2','lng']},week:{type:'integer',description:'Săptămâna ciclului, 1–4.'},value:{type:'integer',description:'Minute (ez1, ez2, lng) sau reprize (thr).'}},required:['row','week','value']}}
];
/* intrările uneltelor vin de la model: le verificăm înainte de orice scriere */
function toolInfo(name,inp){
  inp=inp&&typeof inp==='object'?inp:{}; const n=v=>typeof v==='number'&&isFinite(v);
  const date=inp.date==null?todayKey():validDate(inp.date)?inp.date:null;
  if(date==null) return {err:'Data trebuie să fie YYYY-MM-DD, din ultimul an, nu din viitor.'};
  const dl=date===todayKey()?'azi':fmtDay(date);
  switch(name){
    case 'log_weight': if(!n(inp.kg)||inp.kg<30||inp.kg>400) return {err:'Greutate invalidă.'};
      return {icon:'scale',title:'Notez greutatea',desc:num(inp.kg)+' kg · '+dl,apply:async()=>{ const w=Object.assign({},S.weights); w[date]=Math.round(inp.kg*10)/10; await save('weights',w); return 'Notat: '+num(inp.kg)+' kg pe '+date+'.'; }};
    case 'log_run': if(!n(inp.km)||inp.km<=0||inp.km>100||!n(inp.minutes)||inp.minutes<=0||inp.minutes>600||['ez','thr','lng'].indexOf(inp.kind)<0) return {err:'Alergare invalidă.'};
      return {icon:'run',title:'Notez alergarea',desc:num(inp.km,2)+' km în '+num(inp.minutes)+' min · '+RUNK[inp.kind]+' · '+dl,apply:async()=>{ await save('runs',(S.runs||[]).concat([{date,kind:inp.kind,km:Math.round(inp.km*100)/100,min:Math.round(inp.minutes*10)/10}])); return 'Notat: '+num(inp.km,2)+' km în '+num(inp.minutes)+' min ('+RUNK[inp.kind]+') pe '+date+'.'; }};
    case 'log_meal': if(typeof inp.name!=='string'||!inp.name.trim()||!n(inp.kcal)||inp.kcal<0||inp.kcal>5000||!n(inp.protein_g)||inp.protein_g<0||inp.protein_g>400) return {err:'Masă invalidă.'};
      { const m={n:inp.name.trim().slice(0,80),k:Math.round(inp.kcal),p:Math.round(inp.protein_g),c:n(inp.carbs_g)?Math.round(clamp(inp.carbs_g,0,800)):0,g:n(inp.fat_g)?Math.round(clamp(inp.fat_g,0,400)):0};
        return {icon:'flame',title:'Notez masa',desc:m.n+' · '+m.k+' kcal · '+m.p+' g proteină · '+dl,apply:async()=>{ await addMeal(m,date); return 'Notat: '+m.n+', '+m.k+' kcal, '+m.p+' g proteină, pe '+date+'.'; }}; }
    case 'log_water': if(!n(inp.ml)||inp.ml<50||inp.ml>5000) return {err:'Cantitate de apă invalidă.'};
      return {icon:'drop',title:'Adaug apă',desc:Math.round(inp.ml)+' ml · azi',apply:async()=>{ await addWater(Math.round(inp.ml)); return 'Adăugat: '+Math.round(inp.ml)+' ml apă azi.'; }};
    case 'log_measurements': { const o={}; [['waist','waist_cm'],['chest','chest_cm'],['arm','arm_cm'],['thigh','thigh_cm']].forEach(([k,f])=>{ if(n(inp[f])&&inp[f]>=15&&inp[f]<=250) o[k]=Math.round(inp[f]*10)/10; });
      if(!Object.keys(o).length) return {err:'Nicio măsurătoare validă.'};
      return {icon:'ruler',title:'Notez măsurătorile',desc:MEAS.filter(([k])=>o[k]).map(([k,l])=>l+' '+num(o[k])+' cm').join(' · ')+' · '+dl,
        apply:async()=>{ const b=Object.assign({},S.body); b[date]=Object.assign({},b[date]||{},o); await save('body',b); return 'Notat pe '+date+': '+JSON.stringify(o)+' (cm).'; }}; }
    case 'set_run_progression': { const lim={ez1:[5,180],ez2:[5,180],lng:[10,240],thr:[1,10]}[inp.row];
      if(!lim||!Number.isInteger(inp.week)||inp.week<1||inp.week>4||!Number.isInteger(inp.value)||inp.value<lim[0]||inp.value>lim[1]) return {err:'Valoare de progresie invalidă.'};
      { const f0=inp.row==='thr'?'r':'w', prev=inp.week>1?runPlan()[inp.row][f0][inp.week-2]:0; if(!TRAINING.progressionAllowed(prev,inp.value)) return {err:'Creștere nesigură: cel mult +20% față de săptămâna '+(inp.week-1)+' ('+prev+').'}; }
      const lbl={ez1:'Easy luni',ez2:'Easy joi',lng:'Long run',thr:'Prag'}[inp.row], f=inp.row==='thr'?'r':'w', unit=inp.row==='thr'?' reprize':' min';
      return {icon:'run',title:'Schimb progresia alergării',desc:lbl+' · săptămâna '+inp.week+' → '+inp.value+unit,apply:async()=>{
        const rp=Object.assign({},S.runPlan||{}), h=JSON.parse(JSON.stringify(rp.h||{})), cur=runPlan(); h[inp.row]=h[inp.row]||{}; h[inp.row][f]=(h[inp.row][f]||cur[inp.row][f]).slice(); h[inp.row][f][inp.week-1]=inp.value; rp.h=h; await save('runPlan',rp);
        return 'Schimbat: '+lbl+', săptămâna '+inp.week+' = '+inp.value+unit+'.'; }}; }
  }
  return {err:'Unealtă necunoscută.'};
}
function snapshot(){
  const out=[], tk=todayKey(), P=prof();
  const sec=(t,f)=>{ try{ const v=f(); if(v) out.push('## '+t+'\n'+v); }catch(e){} };
  sec('Numele aplicației',()=>'Aplicația se numește ZECE (a purtat o vreme numele VULTUR și UMBRA). Când o pomenești, spune-i ZECE.');
  sec('Data de azi',()=>tk+', '+DAYN[(parseKey(tk).getDay()+6)%7]);
  sec('Profil',()=>`${P.sex==='f'?'Femeie':'Bărbat'}, ${P.age} ani, ${P.h} cm. Greutate la start ${P.startW} kg, țintă ${P.goalW} kg.`);
  sec('Accidentări declarate (evită exercițiile care solicită aceste zone)',()=>aiCtx().injuries.map(i=>COACH.INJURIES[i]).join(', '));
  sec('Greutate',()=>{ const a=wList(); if(!a.length) return 'Nicio cântărire notată.'; const ws=wStats();
    return `Ultima cântărire: ${num(ws.last.w)} kg (${ws.last.d}). Media pe 7 zile: ${num(ws.a7)} kg.`+(ws.wk!=null?` Ritm: ${ws.wk>0?'+':''}${num(ws.wk,2)} kg/săptămână.`:'')+
      `\nCântăriri recente: ${a.slice(-14).map(x=>x.d.slice(5)+' '+num(x.w)).join(', ')}.`; });
  sec('Măsurători (cm)',()=>bList().slice(-4).map(x=>`- ${x.d}: `+MEAS.filter(([k])=>+x[k]>0).map(([k,l])=>l.toLowerCase()+' '+num(x[k])).join(', ')).join('\n'));
  sec('Nutriție',()=>{ const tg=targets(); let s=`Tipul zilei: ${tg.day.label.toLowerCase()} (${tg.day.t}); ținta e periodizată: ${tg.per.notes.join(' ')||'baza zilei'}. Faza: ${tg.phase.label.toLowerCase()} (${tg.phase.sub}). Ținte: ${tg.kcal} kcal, ${tg.p} g proteină, ${tg.c} g carbohidrați, ${tg.f} g grăsimi, ${num(tg.water/1000,1)} L apă pe zi (bazal ~${tg.bmr}, necesar ${tg.measured?'măsurat din date':'estimat'} ~${tg.tdee} kcal).`;
    const days=[]; for(let i=0;i<7;i++){ const k=dayShift(tk,-i), d=dayTotals(k); if(mlogDay(k).length) days.push(`${k.slice(5)}: ${Math.round(d.k)} kcal, ${Math.round(d.p)} g prot.`); }
    s+=days.length?'\nUltimele zile cu mese notate:\n- '+days.join('\n- '):'\nNicio masă notată în ultimele 7 zile.';
    const today=mlogDay(tk); if(today.length) s+='\nMesele de azi: '+today.map(m=>`${m.n} (${Math.round(+m.k||0)} kcal, ${Math.round(+m.p||0)} g)`).join('; ')+'.';
    s+=`\nApă azi: ${waterOf(tk)} ml.`; return s; });
  sec('Unde a ajuns în program',()=>{ const nx=nextDay(); let s=`Ciclul ${cyc()}.`;
    if(!nx) return s+' Toate cele 4 săptămâni sunt bifate; urmează un ciclu nou.';
    const day=dayFor(nx.w,nx.d);
    s+=` Următorul antrenament: săptămâna ${nx.w+1}/4, ${DAYN[nx.d]} — ${day.t} (~${day.min} min):\n`+day.ex.map(e=>{ const p=e.kind==='lift'?lastSession(e.n):null;
      return `- ${e.n}${e.opt?' (opțional)':''}: ${e.p}`+(p?` (ultima dată, ${p.d}: ${p.s.map(fmtSet).join(', ')})`:''); }).join('\n');
    s+=`\nExerciții bifate în săptămâna ${nx.w+1}: `+PLAN.map((p,d)=>`${DAYS[d]} ${doneCount(nx.w,d)}/${absFrom(d)}`).join(', ')+'.';
    return s; });
  sec('Antrenor adaptiv azi (ajustări peste planul de bază)',()=>{ const nx=nextDay(); if(!nx) return ''; const a=adjFor(nx.w,nx.d), P=a||adaptFor(nx.w,nx.d); if(!P) return 'Fără check-in azi: nu există propunere.';
    return (a?'Aplicate de utilizator ('+(a.src==='ai'?'AI':'reguli')+'): ':'Propunere neaplicată ('+P.title+'): ')+((P.groups||[]).map(g=>g.why).join(' ')||P.calm||'fără schimbări'); });
  sec('Antrenament în desfășurare',()=>{ if(!S.sess) return ''; const s=S.sess, day=sessDay(s);
    const nm=k=>{ const [x,mi]=String(k).split('.'), e=day.ex[+x]; return !e?'?':mi!=null&&e.members?e.members[+mi].n:e.n; };
    const done=Object.keys(s.sets).filter(k=>(s.sets[k]||[]).length).map(k=>`${nm(k)}: ${s.sets[k].map(fmtSet).join(', ')}`);
    return `${DAYN[s.d]} — ${day.t}, pornit azi.`+(s.ready?` Starea dinainte: ${s.ready.score}/100 (somn ${s.ready.sleep}/5, energie ${s.ready.energy}/5, febră musculară ${s.ready.sore}/5).`:'')+
      (day.ex[s.cur]?` Exercițiul curent: ${day.ex[s.cur].n}.`:'')+(done.length?'\nSerii notate până acum:\n- '+done.join('\n- '):''); });
  sec('Forță (kg×repetări; 1RM estimat cu Epley)',()=>{ const Lf=S.lifts||{};
    const names=Object.keys(Lf).filter(n=>Lf[n]&&Lf[n].length).sort((a,b)=>Lf[a][Lf[a].length-1].d<Lf[b][Lf[b].length-1].d?1:-1).slice(0,26);
    if(!names.length) return 'Nicio serie notată încă.';
    return names.map(n=>`- ${n}: 1RM maxim ${bestE1(n)} kg; `+Lf[n].slice(-3).map(e=>`${e.d}: ${e.s.map(fmtSet).join(', ')}`).join(' | ')).join('\n'); });
  sec('Alergare',()=>{ const rs=(S.runs||[]).slice().sort((a,b)=>a.date<b.date?-1:1).slice(-12); if(!rs.length) return 'Nicio alergare notată.';
    const m0=mondayOf(tk), wk=[]; for(let i=5;i>=0;i--){ const a=dayShift(m0,-7*i); wk.push(num(sumKm(runsIn(a,dayShift(a,6))))); }
    return 'Ultimele alergări:\n'+rs.map(r=>`- ${r.date} ${RUNK[r.kind]||r.kind}: ${num(r.km,2)} km în ${num(r.min)} min (${fmtPace(paceOf(r))})`+(r.rpe?`, efort ${r.rpe}/10`:'')+(r.hr?`, puls mediu ${r.hr}`:'')+(r.sid?', din Strava':'')).join('\n')+
      `\nKm pe săptămână, ultimele 6 săptămâni (cea curentă la final): ${wk.join(', ')}.`; });
  sec('Antrenamente terminate',()=>(S.hist||[]).slice(-10).map(h=>`- ${h.date}: ${h.t} (ciclul ${h.cyc}, S${h.w+1}), ${Math.round(h.dur/60)} min, ${h.sets} serii`+(h.km?`, ${num(h.km,2)} km`:'')+(h.ready!=null?`, stare ${h.ready}/100`:'')+(h.rpe?`, RPE ${h.rpe}`:'')+(h.hr?`, puls mediu ${h.hr.avg} (max ${h.hr.max})`:'')).join('\n'));
  sec('Abdomen adăugat în plan (la cererea utilizatorului)',()=>'La finalul zilelor de upper: luni Hanging Leg Raise 3×8–12 și Plank 3 × 45–60 s; miercuri Dragon Flag 4×3–6 (negative lente până la repetări complete) și Pallof Press 3×10–12 pe parte; vineri Dragon Flag 3×3–6 și Ab Wheel Rollout 3×8–10. Sunt opționale: le face când vrea, iar o zi fără ele e tot completă (bifele numără doar exercițiile de dinainte). Nu trata sărirea lor ca pe o abatere de la plan.');
  sec('Kickboxing (în afara planului)',()=>kbAiCtx());
  sec('Alte antrenamente, importate din Strava (ex. Polar Beat) sau notate manual (ultimele 14 zile)',()=>(S.ext||[]).filter(x=>x.date>=dayShift(tk,-13)).sort((a,b)=>a.start-b.start)
    .map(x=>`- ${x.date} ${stName(x.type)}${x.name?' „'+x.name+'”':''}: ${num(x.min,0)} min`+(x.km?`, ${num(x.km,1)} km`:'')+(x.hr?`, puls mediu ${x.hr}`+(x.hrMax?` (max ${x.hrMax})`:''):'')+(x.rpe?`, efort ${x.rpe}/10`:'')+(x.dup?' — același antrenament ca o sesiune ZECE, numărat o singură dată':'')).join('\n'));
  sec('Readiness și profilul atletului (indicatori de antrenament, nu medicali)',()=>{ const R=readiness(), tw=twinNow();
    let s=R.v!=null?`Readiness azi: ${R.v}/100 (recuperare ${R.rec.v}, echilibru încărcare ${R.ls!=null?R.ls:'—'}). Factori: `+R.f.map(([v,t])=>(v>0?'+':'')+v+' '+t).join('; ')+'.':'Fără check-in azi.';
    s+='\nAtribute (0–100): '+ATTR.concat([['cons','Consecvență']]).map(([id,l])=>{ const a=tw.now[id]; return l+' '+(a?a.v:'—'); }).join(', ')+'.';
    if(tw.lim) s+=` Cea mai mare limitare: ${attrName(tw.lim)}; cel mai puternic: ${attrName(tw.top)}.`;
    const lr=R.lr; if(lr) s+=`\nÎncărcare (serii×efort + minute×efort): ${lr.a} în 7 zile, media săptămânală pe 28 de zile ${lr.ch} (raport ${num(lr.r,2)}).`;
    const tests=PTESTS.map(([t,n,u])=>{ const x=(S.ptests||[]).filter(p=>p.type===t).pop(); return x?`${n} ${t==='k1'?fmtClock(x.value):x.value+' '+u} (${x.date})`:null; }).filter(Boolean);
    if(tests.length) s+='\nTeste: '+tests.join(', ')+'.'; return s; });
  sec('Recorduri recente',()=>prEvents().slice(0,6).map(p=>`- ${p.d} ${p.n}: 1RM estimat ${p.b} kg (înainte ${p.prev} kg)`).join('\n'));
  sec('Jurnal (somn, pași, notițe)',()=>{ const a=[]; for(let i=0;i<7;i++){ const k=dayShift(tk,-i), j=jOf(k);
    if(j.sleep||j.steps||j.note) a.push(`- ${k}: `+[j.sleep?'somn '+num(j.sleep)+' h':'',j.steps?j.steps+' pași':'',j.note?'notă: '+j.note:''].filter(Boolean).join(', ')); } return a.join('\n'); });
  sec('Serii pe grupe musculare, ultimele 7 zile',()=>{ const m=muscleSets(dayShift(tk,-6),tk).m; return MUSC.map(([k,l])=>l+' '+num(m[k])).join(', ')+'. Ținta uzuală: 10–20 serii pe săptămână.'; });
  sec('Zone de alergare',()=>{ const z=hrZones(), p=paceZones(), rp=racePred(); let s=`Puls maxim estimat ${z.max}${z.rest?', în repaus '+z.rest:''}; zona 2: ${z.z[1].lo}–${z.z[1].hi} bpm.`;
    if(p) s+=` Ritm de prag ~${mmss(p.thr)}/km (${p.src}); easy ${p.z[0][1]}/km.`;
    if(rp) s+=` Predicții Riegel din ${num(rp.b.km,1)} km pe ${rp.b.date}: `+rp.list.map(x=>x.l+' '+fmtClock(x.s)).join(', ')+'.'; return s; });
  sec('Obiective',()=>goalsAll().map(g=>{ const s=goalState(g); return `- ${goalTitle(g)}: acum ${goalFmt(g,s.cur)}${s.done?', atins':s.eta?', estimat '+s.eta:', '+s.why}${g.by?', termen '+g.by+(s.st==='late'?' (în urmă)':s.st==='ok'?' (în grafic)':''):''}.`; }).join('\n'));
  sec('Compoziție corporală (estimare US Navy)',()=>{ const P=prof(), a=bList().map(x=>({d:x.d,bf:navyBF(x,P)})).filter(x=>x.bf!=null); if(!a.length) return '';
    const l=a[a.length-1], w=wAt(l.d); return `${l.d}: ~${num(l.bf,1)}% grăsime, ~${num(w*(1-l.bf/100),1)} kg masă slabă.`+(a.length>1?` Prima estimare (${a[0].d}): ~${num(a[0].bf,1)}%.`:''); });
  sec('Progres pe exerciții (4 săptămâni)',()=>Object.keys(S.lifts||{}).map(liftTrend).filter(t=>t&&t.last>=dayShift(tk,-28)&&t.st!=='new').map(t=>`- ${t.n}: ${TREND_L[t.st][0]}, ${t.ch>0?'+':''}${num(t.ch,1)}% (1RM ~${t.cur} kg)`).join('\n'));
  sec('Suplimente urmărite',()=>SUPP.filter(s=>suppOn(s[0])).map(s=>`- ${s[1]}: ${suppStreak(s[0])} zile la rând`).join('\n'));
  sec('Motivație',()=>{ const st=stats(); return `Serie de ${st.streak} săptămâni active la rând (cel puțin 3 zile active pe săptămână).`; });
  return out.join('\n\n');
}
function echoable(c){ const a=Array.isArray(c)?c:[]; let lf=-1; a.forEach((b,i)=>{ if(b&&b.type==='fallback') lf=i; });
  return a.filter((b,i)=>!(i<lf&&/^(thinking|redacted_thinking|tool_use)$/.test(b.type))); }
const msgText=m=>typeof m.content==='string'?m.content:(m.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n\n');
function aiErrText(e,A){
  const own=COACH.errText(e,A); if(own) return own;
  if(!A) return 'Nu am putut încărca SDK-ul Anthropic. Verifică conexiunea la internet și încearcă din nou.';
  if(e instanceof A.AuthenticationError) return 'Cheia API nu e validă. Verific-o în Setări → Antrenor AI.';
  if(e instanceof A.PermissionDeniedError) return 'Cheia nu are acces la acest model. Verifică organizația din console.anthropic.com.';
  if(e instanceof A.RateLimitError) return 'Prea multe cereri într-un timp scurt. Mai încearcă peste un minut.';
  if(e instanceof A.APIConnectionError) return 'Nu ajung la api.anthropic.com. Verifică internetul.';
  if(e instanceof A.InternalServerError) return 'Serverele Anthropic au o problemă momentan. Mai încearcă o dată.';
  if(e instanceof A.APIError){ if(e.type==='billing_error'||/credit/i.test(e.message||'')) return 'Contul Anthropic nu are credit. Adaugă credit în console.anthropic.com → Billing.';
    return 'Eroare de la API'+(e.status?' ('+e.status+')':'')+': '+(e.message||''); }
  return 'Eroare: '+((e&&e.message)||e);
}
function costOf(u,model){ if(!u||model!==AI_MODEL) return null;
  return ((u.input_tokens||0)*4+(u.cache_creation_input_tokens||0)*5+(u.cache_read_input_tokens||0)*.2+(u.output_tokens||0)*20)/1e6; }
async function saveChat(){ await store.set(K.aiChat,S.aiChat); }
/* uneltele din ultimul răspuns care încă așteaptă rezultat */
function lastToolIds(chat){ const m=chat&&chat.msgs[chat.msgs.length-1]; if(!m||m.role!=='assistant'||!Array.isArray(m.content)) return []; return m.content.filter(b=>b.type==='tool_use').map(b=>b.id); }
function toolResults(chat,refuseMsg){ return lastToolIds(chat).map(id=>{ const t=chat.tools[id]||{status:'pending'};
  if(t.status==='pending'){ chat.tools[id]={status:'no',res:refuseMsg}; }
  const r=chat.tools[id]; return Object.assign({type:'tool_result',tool_use_id:id,content:r.res},r.status==='ok'?{}:{is_error:true}); }); }
async function aiSend(text){
  text=(text||'').trim(); if(!text||AI.busy) return;
  S.tab='coach';
  const ci=COACH.checkInput(text); if(!ci.ok){ AI.err=ci.reason; AI.draft=text; render(); return; } text=ci.text;
  if(!S.aiKey){ AI.err='Adaugă mai întâi cheia API (mai jos), apoi trimite din nou.'; AI.draft=text; render(); return; }
  if(AI.rec) try{ AI.rec.stop(); }catch(e){}
  let chat=S.aiChat&&S.aiChat.msgs&&S.aiChat.msgs.length?S.aiChat:null;
  const rb={before:chat?chat.msgs.length:0,prevLast:chat?chat.last:null,text,reopen:[]};
  if(!chat){ chat={ver:4,started:todayKey(),snap:snapshot(),msgs:[],tools:{}}; chat.last=chat.snap; }
  const pend=lastToolIds(chat).filter(id=>(chat.tools[id]||{}).status==='pending'); rb.reopen=pend;
  const results=toolResults(chat,'Utilizatorul nu a confirmat acțiunea și a trimis un mesaj nou.');
  chat.msgs=chat.msgs.concat([{role:'user',content:results.length?results.concat([{type:'text',text}]):text}]);
  /* datele noi se adaugă la final ca mesaj de sistem: istoricul nu se rescrie, deci cache-ul și raționamentul anterior rămân valide */
  if(rb.before){ const now=snapshot(); if(now!==chat.last){ chat.msgs.push({role:'system',content:'Datele din aplicație s-au schimbat. Versiunea actuală:\n\n'+now}); chat.last=now; } }
  S.aiChat=chat; AI.draft=''; AI.note=null; AI.depth=0; AI.jsonRetry=0;
  await runTurn(rb);
}
async function runTurn(rb){
  const chat=S.aiChat; AI.busy=true; AI.err=null; AI.live=''; AI.retry=false; let again=false;
  render(); scrollEnd(true);
  let A=null;
  try{
    COACH.preflight();
    A=await loadSdk();
    const client=COACH.client(A,S.aiKey);
    const stream=client.beta.messages.stream({
      model:AI_MODEL, max_tokens:64000,
      betas:['server-side-fallback-2026-07-01'], fallbacks:'default',
      output_config:{effort:S.aiEffort||'medium'},
      cache_control:{type:'ephemeral'},
      system:[{type:'text',text:AI_SYS},{type:'text',text:'Datele utilizatorului la începutul conversației ('+chat.started+'):\n\n'+chat.snap}],
      tools:AI_TOOLS.concat(AI_RTOOLS),
      messages:chat.msgs
    });
    AI.stream=stream; AI.shown=''; AI.blocked=null;
    /* pe ecran ajung doar propozițiile întregi care au trecut de filtru; la prima problemă stream-ul se oprește */
    stream.on('text',d=>{ AI.live+=d; if(AI.blocked) return; const g=COACH.gate('chat',AI.live,aiCtx()); AI.shown=g.shown;
      if(g.blocked&&!AI.blocked){ AI.blocked=g.blocked.message; try{ stream.abort(); }catch(e){} } paintLive(); });
    const msg=await stream.finalMessage();
    AI.stream=null;
    if(msg.stop_reason==='refusal'){
      if(rb) rollback(chat,rb); else AI.retry=true;
      AI.err='Modelul a refuzat cererea (filtrele de siguranță). Reformulează întrebarea.';
    } else {
      let content=echoable(msg.content);
      const v=COACH.verify('chat',content.filter(b=>b.type==='text').map(b=>b.text).join('\n\n'),aiCtx());
      /* răspuns oprit: în istoric rămâne doar mesajul sigur (fără uneltele propuse în același răspuns) */
      if(!v.ok) content=[{type:'text',text:v.message}];
      chat.msgs.push({role:'assistant',content});
      AI.usage=msg.usage; AI.usageModel=msg.model; await save('aiUsed',(S.aiUsed||0)+1);
      const tus=content.filter(b=>b.type==='tool_use');
      if(tus.length&&msg.stop_reason==='max_tokens'){ tus.forEach(b=>{ chat.tools[b.id]={status:'err',res:'Intrarea uneltei a fost tăiată la limita de lungime; nu am executat-o.'}; });
        chat.msgs.push({role:'user',content:toolResults(chat,'')}); AI.err='Răspunsul a fost tăiat; scrie din nou ce vrei să notez.'; }
      else tus.forEach(b=>{
        /* uneltele de citire rulează imediat (intrarea e validată în aiRead); cele care scriu așteaptă confirmarea ta */
        if(AI_RNAMES.has(b.name)){ const r=aiRead(b.name,b.input); chat.tools[b.id]=r.err?{status:'err',res:'Intrare invalidă: '+r.err,rd:1}:{status:'ok',res:r.res,rd:1}; }
        else chat.tools[b.id]={status:'pending'}; });
      if(!tus.length&&msg.stop_reason==='max_tokens') AI.err='Răspunsul a fost tăiat la limita de lungime.';
      /* doar citiri în acest pas: trimit rezultatele și continui singur (cel mult 8 pași la o întrebare) */
      if(tus.length&&msg.stop_reason!=='max_tokens'&&!tus.some(b=>chat.tools[b.id].status==='pending')){
        chat.msgs.push({role:'user',content:toolResults(chat,'')});
        if((AI.depth=(AI.depth||0)+1)<=8) again=true; else AI.err='M-am oprit după 8 citiri la rând. Întreabă din nou, mai precis.';
      }
      AI.jsonRetry=0;
    }
  }catch(err){
    AI.stream=null;
    if(AI.blocked){ chat.msgs.push({role:'assistant',content:[{type:'text',text:AI.blocked}]}); AI.blocked=null; AI.busy=false; AI.live=''; AI.shown='';
      await saveChat(); if(S.tab==='coach'){ render(); scrollEnd(); } else renderNav(); return; }
    if(rb&&COACH.isOffline(err,A)){ AI.busy=false; AI.live=''; AI.shown=''; await aiOffline(chat,rb); return; }
    const aborted=!!(A&&err instanceof A.APIUserAbortError);
    /* intrarea unei unelte n-a putut fi citită deloc (JSON invalid): reiau pasul, de cel mult două ori; erorile API merg mai departe */
    if(A&&!aborted&&!(err instanceof A.APIError)&&(AI.jsonRetry||0)<2){ AI.jsonRetry=(AI.jsonRetry||0)+1; AI.busy=false; AI.live=''; return runTurn(rb); }
    if(aborted&&(AI.shown||'').trim()) chat.msgs.push({role:'assistant',content:[{type:'text',text:AI.shown.trim()+' […]'}]});
    else if(rb) rollback(chat,rb);
    else if(!aborted) AI.retry=true;
    if(!aborted) AI.err=aiErrText(err,A);
  }
  AI.busy=false; AI.live=''; AI.shown='';
  if(S.aiChat&&!S.aiChat.msgs.length) S.aiChat=null;
  await saveChat();
  if(again&&S.aiChat) return runTurn(null);
  if(S.tab==='coach'){ render(); scrollEnd(); } else renderNav();
}
/* ---------- Setări: filtrul de siguranță ---------- */
function aiSafetyCard(){
  const inj=aiCtx().injuries, inc=COACH.incidents.list().slice().reverse(), use=COACH.limits.usage();
  const SRC={tier3:'suplimente nesigure',kcal:'calorii sub prag',streak:'prea multe zile la rând',injury:'zonă accidentată'};
  return `<div class="card"><div class="eyebrow">${ic('alert')} Filtrul de siguranță</div>
    <div class="sm" style="margin-top:6px;font-weight:600">Accidentări declarate</div>
    <div class="chips" style="margin-top:6px">${Object.keys(COACH.INJURIES).map(k=>`<button class="chip ${inj.indexOf(k)>=0?'on':''}" data-a="aiInj" data-k="${k}" aria-pressed="${inj.indexOf(k)>=0}">${esc(COACH.INJURIES[k])}</button>`).join('')}</div>
    <div class="note">Antrenorul AI nu recomandă exerciții care solicită zonele bifate; răspunsurile care o fac sunt oprite.</div>
    <div class="note">Orice răspuns e verificat înainte să apară: fără suplimente nesigure (test boosters, arzătoare de grăsimi, prohormoni), fără sub ${COACH.KCAL_FLOOR[aiCtx().sex]} kcal pe zi, fără mai mult de 7 zile de antrenament la rând. Cereri: ${use.map(u=>`${u.used}/${u.max} în ${u.label}`).join(' · ')}.</div>
    ${inc.length?`<details class="notes" style="border:0;padding:0;margin-top:8px"><summary class="sm">${inc.length} ${inc.length===1?'răspuns oprit':'răspunsuri oprite'} · de verificat</summary>
      ${inc.slice(0,20).map(x=>`<div class="note"><b>${esc(fmtDay(x.t.slice(0,10)))} · ${esc(x.src)} · ${esc(SRC[x.code]||x.code)}</b> („${esc(x.match)}")<div class="xs mu" style="margin-top:4px;white-space:pre-wrap">${esc(x.text.slice(0,600))}</div></div>`).join('')}
      <button class="btn ghost sm" data-a="aiIncClear" data-confirm="Sigur? Apasă iar">${ic('trash')} Șterge lista</button></details>`:''}</div>`;
}
/* ---------- Offline Coach: fără conexiune răspund regulile locale; întrebarea așteaptă în IndexedDB ---------- */
function offlineAnswer(q){
  try{ const a=palAnswer(q); if(a) return '<b>'+esc(a.t)+'</b><div>'+a.ans+'</div>'; }catch(e){}
  try{ const nx=nextDay(), P=nx&&(adjFor(nx.w,nx.d)||adaptFor(nx.w,nx.d));
    if(P) return '<b>Următorul antrenament · '+esc(P.title||'')+'</b><div>'+esc((P.groups||[]).map(g=>g.why).join(' ')||P.calm||'Planul rămâne neschimbat.')+'</div>'; }catch(e){}
  return 'Fără conexiune nu pot răspunde la întrebare. Planul de azi rămâne valabil; ajustările după check-in se fac în continuare după reguli.';
}
async function aiOffline(chat,rb){
  rollback(chat,rb); AI.draft=''; AI.err=null;
  const html=offlineAnswer(rb.text), tmp=document.createElement('div'); tmp.innerHTML=html;
  AI.offline={q:rb.text,html};
  try{ await COACH.queue.add({kind:'chat',t:new Date().toISOString(),question:rb.text,localAnswer:tmp.textContent.trim().slice(0,600)}); }catch(e){}
  if(S.aiChat&&!S.aiChat.msgs.length) S.aiChat=null;
  await saveChat(); if(S.tab==='coach'){ render(); scrollEnd(); } else renderNav();
}
/* la revenirea online: întrebările puse offline pleacă împreună la antrenorul AI, cu răspunsurile locale, ca să le verifice;
   adaptările de azi făcute după reguli sunt verificate de AI (adjAI) */
let aiSyncing=false;
async function aiSyncQueue(){
  if(aiSyncing||!S.aiKey||!navigator.onLine||AI.busy) return; aiSyncing=true;
  try{ const items=await COACH.queue.all(), chats=items.filter(x=>x.item.kind==='chat'), adjs=items.filter(x=>x.item.kind==='adj');
    for(const x of adjs){ await COACH.queue.remove(x.id); if(x.item.day===todayKey()) await adjAI(x.item.w,x.item.d); }
    const fbs=items.filter(x=>x.item.kind==='feedback');
    if(chats.length||fbs.length){ for(const x of chats.concat(fbs)) await COACH.queue.remove(x.id);
      const hm=t=>new Date(t).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'});
      AI.offline=null;
      const FEEL={easy:'ușor',ok:'potrivit',hard:'greu',max:'la limită'};
      const qs=chats.map(x=>'- ('+hm(x.item.t)+') '+x.item.question+'\n  Răspunsul local, după reguli: '+x.item.localAnswer).join('\n');
      const fs=fbs.map(x=>{ const d=x.item.data||{}; return '- ('+hm(x.item.t)+') '+(d.round||'rundă')+': '+(FEEL[d.feel]||d.feel)+(d.pain?', durere: '+(COACH.INJURIES[d.pain]||d.pain):'')+' → '+(d.change||''); }).join('\n');
      await aiSend(((qs?'Cât am fost offline am întrebat:\n'+qs+'\n':'')+(fs?'Cât am fost offline, sesiunea de kickboxing s-a adaptat după reguli:\n'+fs+'\n':'')+'Verifică răspunsurile și adaptările locale și corectează-le dacă e cazul.').slice(0,3900)); }
  }catch(e){ errLog('sincronizare antrenor: '+((e&&e.message)||e),'coach'); }
  aiSyncing=false;
}
addEventListener('online',()=>setTimeout(aiSyncQueue,1500));
function rollback(chat,rb){ chat.msgs=chat.msgs.slice(0,rb.before); chat.last=rb.before?rb.prevLast:null; rb.reopen.forEach(id=>{ chat.tools[id]={status:'pending'}; }); AI.draft=rb.text; }
async function toolDecide(id,ok){
  const chat=S.aiChat; if(!chat||AI.busy) return; const t=chat.tools[id]; if(!t||t.status!=='pending') return;
  const m=chat.msgs[chat.msgs.length-1], blk=m&&Array.isArray(m.content)?m.content.find(b=>b.type==='tool_use'&&b.id===id):null; if(!blk) return;
  if(ok){ const info=toolInfo(blk.name,blk.input);
    if(info.err) chat.tools[id]={status:'err',res:'Nu am executat: '+info.err};
    else { try{ chat.tools[id]={status:'ok',res:await info.apply()}; buzz(30); floatText($('[data-a="toolOk"][data-k="'+id+'"]'),'✓'); }catch(e){ chat.tools[id]={status:'err',res:'Eroare la salvare.'}; } } }
  else chat.tools[id]={status:'no',res:'Utilizatorul a refuzat această acțiune.'};
  await saveChat();
  if(lastToolIds(chat).some(i=>(chat.tools[i]||{}).status==='pending')){ render(); return; }
  chat.msgs.push({role:'user',content:toolResults(chat,'')});
  AI.depth=0; await runTurn(null);
}
let liveRaf=0;
function paintLive(){ if(liveRaf) return; liveRaf=requestAnimationFrame(()=>{ liveRaf=0; const el=$('#aiLive');
  if(el){ const near=innerHeight+scrollY>=document.documentElement.scrollHeight-160; el.innerHTML=AI.shown?md(AI.shown):typingDots; if(near) scrollEnd(); } }); }
const typingDots='<span class="typing"><i></i><i></i><i></i></span>';
function scrollEnd(smooth){ requestAnimationFrame(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:smooth?'smooth':'auto'})); }
function md(src){
  const inline=s=>s.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<i>$2</i>');
  let out='', list=null; const close=()=>{ if(list){ out+='</'+list+'>'; list=null; } };
  esc(src).split('\n').forEach(raw=>{ const l=raw.replace(/\s+$/,''); let m;
    if((m=/^\s*[-*•]\s+(.*)$/.exec(l))){ if(list!=='ul'){ close(); out+='<ul>'; list='ul'; } out+='<li>'+inline(m[1])+'</li>'; return; }
    if((m=/^\s*\d+[.)]\s+(.*)$/.exec(l))){ if(list!=='ol'){ close(); out+='<ol>'; list='ol'; } out+='<li>'+inline(m[1])+'</li>'; return; }
    close(); if(!l.trim()) return;
    if((m=/^#{1,6}\s+(.*)$/.exec(l))){ out+='<h4>'+inline(m[1])+'</h4>'; return; }
    if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)){ out+='<hr>'; return; }
    out+='<p>'+inline(l)+'</p>'; });
  close(); return out;
}
function toolCard(chat,b){
  if(AI_RNAMES.has(b.name)) return aiReadCard(chat,b);
  const t=(chat.tools||{})[b.id]||{status:'pending'}, info=toolInfo(b.name,b.input);
  const title=info.err?'Acțiune invalidă':info.title, desc=info.err||info.desc;
  if(t.status==='pending') return `<div class="tool"><div class="ic">${ic(info.icon||'alert')}</div><div class="sp"><b>${esc(title)}</b><div class="d">${esc(desc)}</div></div>
    <div class="acts"><button class="btn sm ghost" data-a="toolNo" data-k="${esc(b.id)}" ${AI.busy?'disabled':''}>Refuză</button><button class="btn sm pri" data-a="toolOk" data-k="${esc(b.id)}" ${AI.busy||info.err?'disabled':''}>Aplică</button></div></div>`;
  return `<div class="tool ${t.status==='ok'?'ok':'no'}"><div class="ic">${ic(t.status==='ok'?'check':'x')}</div><div class="sp"><b>${esc(title)}</b><div class="d">${esc(desc)}</div></div>
    <span class="st">${t.status==='ok'?'Aplicat':t.status==='no'?'Refuzat':'Neaplicat'}</span></div>`;
}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function voice(){
  if(!SR) return; if(AI.rec){ try{ AI.rec.stop(); }catch(e){} return; }
  try{ const r=new SR(), ta=$('#aiIn'), base=((ta&&ta.value)||'').trim(); r.lang='ro-RO'; r.interimResults=true; r.continuous=false;
    r.onresult=e=>{ let t=''; for(const x of e.results) t+=x[0].transcript; const v=(base?base+' ':'')+t, a=$('#aiIn'); if(a){ a.value=v; autosize(a); } AI.draft=v; };
    r.onend=()=>{ AI.rec=null; const b=$('.mic'); if(b) b.classList.remove('rec'); };
    r.onerror=e=>{ AI.rec=null; const b=$('.mic'); if(b) b.classList.remove('rec'); if(e.error==='not-allowed'||e.error==='service-not-allowed') toast('Microfonul nu e permis','Permite accesul la microfon pentru această pagină.','info'); };
    AI.rec=r; r.start(); const b=$('.mic'); if(b) b.classList.add('rec'); buzz(20);
  }catch(e){ AI.rec=null; toast('Dictarea nu merge aici','Browserul nu permite recunoașterea vocală pe această pagină.','info'); }
}
function viewCoach(){
  const chat=S.aiChat, msgs=(chat&&chat.msgs)||[], key=S.aiKey;
  const lastA=[...msgs].reverse().find(m=>m.role==='assistant'), cost=costOf(AI.usage,AI.usageModel);
  let log='';
  msgs.forEach(m=>{
    if(m.role==='user'){ const t=msgText(m); if(t) log+=`<div class="msg me">${esc(t)}</div>`; }
    else if(m.role==='system') log+=`<div class="sysnote">${ic('refresh')} date actualizate trimise antrenorului</div>`;
    else { const t=msgText(m); if(t) log+=`<div class="msg ai">${md(t)}</div>`;
      (Array.isArray(m.content)?m.content:[]).filter(b=>b.type==='tool_use').forEach(b=>{ log+=toolCard(chat,b); });
      if(m===lastA&&AI.usage&&!AI.busy) log+=`<div class="msg-meta">${AI.usageModel===AI_MODEL?'':'răspuns de la '+esc(AI.usageModel)+' · '}${AI.usage.input_tokens+(AI.usage.cache_read_input_tokens||0)+(AI.usage.cache_creation_input_tokens||0)} tokeni intrare${AI.usage.cache_read_input_tokens?' ('+AI.usage.cache_read_input_tokens+' din cache)':''} · ${AI.usage.output_tokens} ieșire${cost!=null?' · ~$'+cost.toFixed(3):''}</div>`; }
  });
  if(AI.busy) log+=`<div class="msg ai" id="aiLive">${AI.shown?md(AI.shown):typingDots}</div>`;
  const off=AI.offline?`<div class="card" role="status" style="border-color:var(--a40)"><div class="eyebrow">${ic('alert')} Mod offline activ. Adaptări bazate pe reguli predefinite.</div>
    <div class="msg me" style="margin-top:8px">${esc(AI.offline.q)}</div><div class="msg ai">${AI.offline.html}</div>
    <div class="note">Întrebarea e salvată pe dispozitiv. O trimit antrenorului AI când revine conexiunea, ca să verifice răspunsul de mai sus.</div></div>`:'';
  const setup=key?'':`<div class="card" style="border-color:var(--a40)"><div class="eyebrow">${ic('key')} Pornește antrenorul</div>
    <ol class="ai-steps"><li>Intră pe <b>console.anthropic.com</b> → <b>API Keys</b> și creează o cheie (contul are nevoie de credit; un răspuns costă de regulă câțiva cenți).</li>
      <li>Lipește cheia aici. Rămâne doar pe acest dispozitiv.</li></ol>
    <div class="keybox"><input class="inp" id="aiKeyIn" type="password" autocomplete="off" placeholder="sk-ant-…" aria-label="Cheia API Anthropic"><button class="btn pri" data-a="aiKeySave">Salvează</button></div></div>`;
  const empty=!msgs.length&&!AI.busy?`<div class="sugg-list">${QUICK.map((q,i)=>`<button class="chip ask" data-a="ask" data-i="${i}">${esc(QLBL[i])}</button>`).join('')}</div>`:'';
  return `
  <div class="card"><div class="ai-head"><div class="cc-ic">${ic('coach')}</div>
    <div class="sp"><div class="h3">Antrenorul AI</div><div class="sm mu">Claude Opus 5.5 · citește singur istoricul, alergările, recordurile și obiectivele tale · notează date doar cu acordul tău</div></div>
    ${msgs.length?`<button class="btn ghost sm" data-a="aiNew" ${AI.busy?'disabled':''} data-confirm="Sigur?">${ic('refresh')} Nouă</button>`:''}</div></div>
  ${AI.note?`<div class="note">${esc(AI.note)}</div>`:''}
  ${setup}
  ${empty}
  <div class="msgs">${log}</div>
  ${off}
  ${AI.err?`<div class="err" role="alert">${ic('alert')}<span>${esc(AI.err)}</span>${AI.retry?`<button class="btn sm" data-a="aiRetry">${ic('refresh')} Reîncearcă</button>`:''}</div>`:''}
  <div class="composer">${SR?`<button class="btn send ghost mic ${AI.rec?'rec':''}" data-a="voice" aria-label="Dictează">${ic('mic')}</button>`:''}
    <textarea id="aiIn" rows="1" placeholder="Întreabă antrenorul…" aria-label="Mesaj pentru antrenor">${esc(AI.draft)}</textarea>
    ${AI.busy?`<button class="btn send" data-a="aiStop" aria-label="Oprește">${ic('stop')}</button>`:`<button class="btn pri send" data-a="aiSend" aria-label="Trimite">${ic('send')}</button>`}</div>`;
}
function autosize(t){ t.style.height='auto'; t.style.height=Math.min(150,t.scrollHeight)+'px'; }

/* analiza unei poze cu mâncare: cerere separată, cu răspuns structurat (JSON după schemă) */
const MEAL_SCHEMA={type:'object',additionalProperties:false,required:['name','items','kcal','protein_g','carbs_g','fat_g','confidence','note'],properties:{
  name:{type:'string',description:'Numele scurt al mesei, în română.'},
  items:{type:'array',items:{type:'object',additionalProperties:false,required:['food','grams','kcal'],properties:{food:{type:'string'},grams:{type:'number'},kcal:{type:'number'}}}},
  kcal:{type:'number'},protein_g:{type:'number'},carbs_g:{type:'number'},fat_g:{type:'number'},
  confidence:{type:'string',enum:['mică','medie','mare']},note:{type:'string',description:'1–2 propoziții: ce e incert (ulei, sosuri, porții ascunse).'}}};
const MEAL_PROMPT='Estimează conținutul nutrițional al mesei din poză. Identifică fiecare aliment vizibil și cantitatea aproximativă în grame, folosind farfuria, tacâmurile sau mâna ca reper. Totalurile trebuie să fie suma alimentelor. Include uleiul sau sosul probabil folosit dacă e vizibil. Dacă poza nu arată mâncare, întoarce o listă goală, 0 la toate valorile și explică în note. Răspunde în română.';
async function resizeImg(file,max=1024,q=.8){
  const url=URL.createObjectURL(file);
  try{ const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
    const sc=Math.min(1,max/Math.max(img.width,img.height)), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(img.width*sc)); c.height=Math.max(1,Math.round(img.height*sc));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height); const d=c.toDataURL('image/jpeg',q); return {url:d,data:d.split(',')[1]};
  }finally{ URL.revokeObjectURL(url); }
}
async function scanPick(file){
  try{ const r=await resizeImg(file); Object.assign(SC,{img:r.url,data:r.data,res:null,err:null,busy:false,hint:''}); }
  catch(e){ Object.assign(SC,{img:null,data:null}); toast('Nu am putut citi poza','Încearcă altă imagine.','info'); }
  S.tab='nutri'; render(); requestAnimationFrame(()=>{ const c=$('#scanCard'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); });
}
async function scanRun(){
  if(SC.busy||!SC.data) return;
  const h=$('#scHint'); if(h) SC.hint=h.value.trim().slice(0,200);
  if(!S.aiKey){ SC.err='Ai nevoie de cheia API (Setări → Antrenor AI) ca să analizez poza.'; render(); return; }
  const ci=COACH.checkImage(SC.data,'image/jpeg'); if(!ci.ok){ SC.err=ci.reason; render(); return; }
  SC.busy=true; SC.err=null; SC.res=null; render(); let A=null;
  try{
    COACH.preflight(); A=await loadSdk(); const client=COACH.client(A,S.aiKey);
    const msg=await client.beta.messages.stream({model:AI_MODEL,max_tokens:16000,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
      output_config:{effort:'low',format:{type:'json_schema',schema:MEAL_SCHEMA}},
      messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:SC.data}},{type:'text',text:MEAL_PROMPT+(SC.hint?'\n\nDetalii de la utilizator: '+SC.hint:'')}]}]}).finalMessage();
    if(msg.stop_reason==='refusal') throw new Error('__refuz');
    const r=JSON.parse(msg.content.filter(b=>b.type==='text').map(b=>b.text).join(''));
    const v=COACH.verify('poză masă',[r.name,r.note].concat(Array.isArray(r.items)?r.items.map(i=>typeof i==='string'?i:JSON.stringify(i)):[]).filter(Boolean).join('. '),aiCtx());
    if(!v.ok){ SC.err=v.message; SC.busy=false; if(S.tab==='nutri') render(); return; }
    SC.res={name:r.name||'Masă',kcal:Math.round(+r.kcal||0),p:Math.round(+r.protein_g||0),c:Math.round(+r.carbs_g||0),g:Math.round(+r.fat_g||0),items:Array.isArray(r.items)?r.items:[],conf:r.confidence,note:r.note,cost:costOf(msg.usage,msg.model)};
    await save('aiUsed',(S.aiUsed||0)+1);
  }catch(e){ SC.err=e&&e.message==='__refuz'?'Modelul a refuzat analiza pozei.':e instanceof SyntaxError?'Răspunsul nu a putut fi citit. Mai încearcă o dată.':aiErrText(e,A); }
  SC.busy=false; if(S.tab==='nutri') render();
}
