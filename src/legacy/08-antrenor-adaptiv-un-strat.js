/* =====================================================================
   ANTRENOR ADAPTIV — un strat de ajustări peste planul de bază.
   Propune din datele reale → tu accepți → se aplică doar antrenamentului de azi → revii oricând.
   ===================================================================== */
const SWAPS={'Bench Press':['Flat Dumbbell Press','Incline Dumbbell Press'],'Flat Dumbbell Press':['Bench Press','Incline Dumbbell Press'],'Incline Dumbbell Press':['Flat Dumbbell Press','Bench Press'],'Hammer Chest Press':['Machine Chest Press','Incline Dumbbell Press'],
  'Pull Up / Lat Pulldown':['Weighted Pull Up','Chest Supported Row'],'Weighted Pull Up':['Pull Up / Lat Pulldown'],'Chest Supported Row':['Pull Up / Lat Pulldown'],
  'Seated Overhead Press':['Push Press'],'Push Press':['Seated Overhead Press'],'Hack Squat':['Leg Press'],'Leg Press':['Hack Squat'],'Walking Lunge':['Leg Press'],
  'Romanian Deadlift':['Good Morning','Hamstring Curl','Hip Thrust'],'Hip Thrust':['Romanian Deadlift'],'Hamstring Curl':['Romanian Deadlift'],'Close Grip Bench Press':['Tricep Pushdown'],
  'Lateral Raise':['Dumbbell Lateral Raise'],'Dumbbell Lateral Raise':['Lateral Raise'],'Tricep Pushdown':['Tricep Rope Pushdown','Tricep Overhead Extension'],
  'Tricep Rope Pushdown':['Tricep Pushdown','Tricep Overhead Extension'],'Tricep Overhead Extension':['Tricep Rope Pushdown'],'Cable Face Pull':['Chest Supported Row'],
  'Bicep Curl':['Alternating Dumbbell Curl','Barbell Curl'],'Alternating Dumbbell Curl':['Bicep Curl','Barbell Curl'],'Barbell Curl':['Bicep Curl','Alternating Dumbbell Curl'],
  /* v19: planul după Milo Wolf — alternative cu stretch similar */
  'Lat Pulldown':['Pull Up / Lat Pulldown','Pull Up'],'Pull Up':['Lat Pulldown','Pull Up / Lat Pulldown'],'T-Bar Row':['Chest Supported Row','Dumbbell Row'],'Machine Chest Press':['Hammer Chest Press','Flat Dumbbell Press'],
  'Dumbbell Fly':['Cable Fly','Pec Deck'],'Pec Deck':['Cable Fly','Dumbbell Fly'],'Cable Fly':['Pec Deck','Dumbbell Fly'],'Hammer Curl':['Cable Curl','Preacher Curl'],'Cable Lateral Raise':['Dumbbell Lateral Raise','Lateral Raise'],'Rear Delt Fly':['Cable Face Pull'],'Skull Crusher':['Tricep Overhead Extension','Tricep Rope Pushdown'],
  'Preacher Curl':['Cable Curl','Incline Dumbbell Curl'],'Incline Dumbbell Curl':['Cable Curl','Preacher Curl'],'Cable Curl':['Incline Dumbbell Curl','Preacher Curl'],'Shrug':['Chest Supported Row'],
  'Leg Extension':['Leg Press','Bulgarian Split Squat'],'Good Morning':['Romanian Deadlift'],'Back Extension':['Romanian Deadlift','Hip Thrust'],'Bulgarian Split Squat':['Walking Lunge','Leg Press'],'Nordic Curl':['Hamstring Curl'],'Hip Abduction Machine':['Hip Thrust'],'Cable Crunch':['Ab Wheel Rollout','Hanging Leg Raise']};
const LOWER=['cvadriceps','femurali','fesieri','gambe'];
const regionOf=n=>{ const m=EXM[n]; if(!m) return null; return Object.keys(m).some(k=>m[k]===1&&LOWER.indexOf(k)>=0)?'jos':'sus'; };
const thrReps=e=>+((/^(\d+) ×/.exec(e.p)||[])[1])||0;
const ADJ={busy:null,err:null,ai:{}};
function adjFor(w,d){ const s=S.sess; if(s&&s.w===w&&s.d===d) return s.adj||null;
  const a=(S.adj||{})[dKeyC(cyc(),w,d)]; return a&&a.on&&a.date===todayKey()?a:null; }
function applyAdj(day,a){
  const p=runPlan();
  (a.ch||[]).forEach(c=>{ const e=day.ex[c.x]; if(!e) return; const L=e.kind==='lift'; e.adj=e.adj||[];
    if(c.t==='sets'&&L){ e.sets=c.to; e.p=e.p.replace(/^\d+×/,c.to+'×'); e.adj.push(c.to+' serii în loc de '+c.from); }
    else if(c.t==='load'&&L){ e.loadF=c.to; e.adj.push((c.to<1?'−':'+')+Math.round(Math.abs(1-c.to)*100)+'% greutate'); }
    else if(c.t==='hold'&&L){ e.noUp=true; e.adj.push('fără creșteri'); }
    else if(c.t==='rest'&&L){ e.rest=c.to; e.p=e.p.replace(/pauză \d+s/,'pauză '+c.to+'s'); e.adj.push('pauză '+c.to+' s'); }
    else if(c.t==='run'&&e.planMin&&e.n!=='Threshold'){ e.planMin=c.to; e.p=e.p.replace(/^\d+ min/,c.to+' min'); e.adj.push(c.to+' min în loc de '+c.from); }
    else if(c.t==='iv'&&e.n==='Threshold'){ e.iv=c.to; e.planMin=Math.round(c.to*p.thr.m+Math.max(0,c.to-1)*p.thr.rest/60); e.p=e.p.replace(/^\d+ ×/,c.to+' ×'); e.adj.push(c.to+' reprize în loc de '+c.from); }
    else if(c.t==='swap'&&L&&(SWAPS[e.n]||[]).indexOf(c.to)>=0){ e.orig=e.n; e.n=c.to; e.adj.push('în loc de '+e.orig); }
    else if(c.t==='note'&&c.to) e.adj.push(String(c.to));
  });
  day.adj=a; return day;
}
/* motorul de reguli: fiecare ajustare are un motiv construit din cifrele tale */
let ADC=null;
function adaptFor(w,d){
  const key=w+'|'+d; if(ADC&&ADC.key===key) return ADC.v;
  const v=adaptCalc(w,d); ADC={key,v}; return v;
}
function adaptCalc(w,d){
  const day=dayFor(w,d,true), tk=todayKey(), R=readiness(), j=jOf(tk); if(R.v==null) return null;
  const lifts=day.ex.filter(e=>e.kind==='lift'), runs=day.ex.filter(e=>e.planMin&&e.n!=='Threshold'), thr=day.ex.find(e=>e.n==='Threshold'), acwr=R.lr?R.lr.r:null;
  const G=[], cs={}, add=(why,items)=>{ items=items.filter(Boolean); if(items.length) G.push({why,items}); };
  const down=(e,n,min)=>{ const cur=cs[e.x]!=null?cs[e.x]:e.sets, to=Math.max(min||2,cur-n); if(to>=cur) return null; cs[e.x]=to; return {x:e.x,t:'sets',from:cur,to,n:e.n}; };
  const neg=R.rec.f.filter(f=>f[0]<0).map(f=>f[1].charAt(0).toLowerCase()+f[1].slice(1)), why0='Readiness '+R.v+(neg.length?' ('+neg.slice(0,2).join(', ')+')':'');
  let low=0, seen=0; for(let i=1;i<=7;i++){ const r=readiness(dayShift(tk,-i)); if(r.v!=null){ seen++; if(r.v<55) low++; } }
  let kind='ok';
  const cutRuns=f=>runs.map(e=>({x:e.x,t:'run',from:e.planMin,to:Math.max(10,Math.round(e.planMin*f/5)*5),n:e.n})).filter(c=>c.to<c.from);
  const cutThr=n=>{ if(!thr) return null; const r=thrReps(thr); return r>2?{x:thr.x,t:'iv',from:r,to:Math.max(2,r-n),n:thr.n}:null; };
  if((seen>=3&&low>=3)||(acwr!=null&&acwr>1.5&&R.v<60)){ kind='deload';
    add((low>=3?'În ultimele 7 zile ai avut '+low+' zile cu readiness sub 55 — oboseala se adună.':'Încărcarea ultimelor 7 zile e '+num(acwr,2)+'× media ta pe 4 săptămâni, iar readiness e '+R.v+'.')+' Propun un deload: −40% serii și −10% greutate.',
      lifts.map(e=>down(e,e.sets-Math.max(2,Math.round(e.sets*.6)))).concat(lifts.map(e=>({x:e.x,t:'load',from:1,to:.9,n:e.n}))));
    add('Alergarea rămâne, dar mai scurtă (−30%), ca să se refacă sistemul.',cutRuns(.7).concat([cutThr(2)]));
  } else if(R.v<45){ kind='recovery';
    add(why0+' → antrenament ușor: aproximativ −40% serii și −10% greutate. Mișcarea ajută recuperarea, efortul mare nu.',
      lifts.map(e=>down(e,e.sets-Math.max(2,Math.round(e.sets*.6)))).concat(lifts.map(e=>({x:e.x,t:'load',from:1,to:.9,n:e.n}))));
    add('Alergare mai scurtă (−25%), strict în zona 2.',cutRuns(.75).concat([cutThr(2)]));
  } else {
    if(R.v<60){ kind='easy';
      add(why0+' → fără creșteri de greutate azi și 30 s în plus la pauză la exercițiile compuse.',
        lifts.map(e=>({x:e.x,t:'hold',from:0,to:1,n:e.n})).concat(lifts.filter(e=>COMPOUND.test(e.n)).map(e=>({x:e.x,t:'rest',from:e.rest,to:Math.min(180,e.rest+30),n:e.n}))));
      add('Pragul: o repriză mai puțin, calitatea contează mai mult decât numărul.',[cutThr(1)]); }
    if(+j.sore>=3){ const reg=j.soreReg||'tot', hit=lifts.filter(e=>reg==='tot'||regionOf(e.n)===reg), tot=hit.reduce((a,e)=>a+e.sets,0);
      const items=hit.map(e=>down(e,1)).filter(Boolean), rm=items.reduce((a,c)=>a+c.from-c.to,0);
      if(items.length) add('Febră musculară '+j.sore+'/5'+(j.soreReg?' la '+REG[j.soreReg]:'')+' → am redus volumul pentru '+(reg==='jos'?'picioare':reg==='sus'?'partea de sus':'tot corpul')+' cu '+Math.round(rm/tot*100)+'%.',items); }
    if(acwr!=null&&acwr>1.3&&R.v<80) add('Încărcarea ultimelor 7 zile e '+num(acwr,2)+'× media ta pe 4 săptămâni → o serie mai puțin la exercițiile accesorii.',lifts.filter(e=>!COMPOUND.test(e.n)).map(e=>down(e,1)));
    const ex=muscleExposure(7), hot=MUSC.filter(([k])=>ex[k].state==='high');
    if(hot.length){ const hk=hot.map(h=>h[0]), items=lifts.filter(e=>{ const m=EXM[e.n]; return m&&Object.keys(m).some(k=>m[k]===1&&hk.indexOf(k)>=0); }).map(e=>down(e,1));
      add('Volum mare în ultimele 7 zile la '+hot.map(([k,l])=>l.toLowerCase()+' ('+ex[k].pct+'% din ținta planului)').join(', ')+' → o serie mai puțin la exercițiile lor.',items); }
    if(!G.length&&R.v>=80&&(acwr==null||acwr<=1.3)) kind='go';
  }
  /* comasare: o singură schimbare pe exercițiu și tip */
  const ch=[]; G.forEach(g=>g.items.forEach(c=>{ const o=ch.find(x=>x.x===c.x&&x.t===c.t); if(o){ o.to=c.to; } else ch.push(Object.assign({},c)); }));
  const TT={ok:'Planul rămâne neschimbat',go:'Zi bună pentru progres',easy:'Ajustări ușoare pentru azi',recovery:'Zi de recuperare activă',deload:'Deload propus'};
  return {src:'rule',kind,title:TT[kind],v:R.v,groups:G,ch,
    calm:kind==='go'?'Readiness '+R.v+' și încărcare echilibrată → urmează recomandările de creștere din antrenament.':kind==='ok'?'Readiness '+R.v+(acwr!=null?', încărcare '+num(acwr,2)+'× media':'')+' → nimic de schimbat față de plan.':''};
}
const adjItems=(day,items)=>{ const out=[], by=t=>items.filter(c=>c.t===t), nm=c=>esc((day.ex[c.x]||{}).n||c.n||'');
  by('sets').forEach(c=>out.push(`<b>${nm(c)}</b>: ${c.from} → ${c.to} serii`));
  const ld=by('load'); if(ld.length) out.push(ld.length>2?`${(ld[0].to<1?'−':'+')+Math.round(Math.abs(1-ld[0].to)*100)}% greutate la ${ld.length} exerciții`:ld.map(c=>`<b>${nm(c)}</b>: ${(c.to<1?'−':'+')+Math.round(Math.abs(1-c.to)*100)}% greutate`).join(' · '));
  const hd=by('hold'); if(hd.length) out.push(hd.length>2?`fără creșteri de greutate la ${hd.length} exerciții`:hd.map(c=>`<b>${nm(c)}</b>: fără creșteri`).join(' · '));
  const rs=by('rest'); [...new Set(rs.map(c=>c.to-c.from))].forEach(dv=>out.push(`pauză ${dv>0?'+':'−'}${Math.abs(dv)} s la: ${rs.filter(c=>c.to-c.from===dv).map(c=>'<b>'+nm(c)+'</b> ('+c.to+' s)').join(', ')}`));
  by('run').forEach(c=>out.push(`<b>${nm(c)}</b>: ${c.from} → ${c.to} min`));
  by('iv').forEach(c=>out.push(`<b>${nm(c)}</b>: ${c.from} → ${c.to} reprize`));
  by('swap').forEach(c=>out.push(`<b>${esc(c.from||c.n)}</b> → ${esc(c.to)}`));
  by('note').forEach(c=>out.push(`<b>${nm(c)}</b>: ${esc(c.to)}`));
  return out; };
function adaptCard(){
  if(S.sess) return ''; const nx=nextDay(); if(!nx) return '';
  const key=dKey(nx.w,nx.d), st=(S.adj||{})[key], today=st&&st.date===todayKey()?st:null, on=today&&today.on, base=dayFor(nx.w,nx.d,true);
  const P=on?today:ADJ.ai[key]||adaptFor(nx.w,nx.d); if(!P) return '';
  const src=P.src==='ai'?'<span class="tag lift">'+ic('coach')+' AI</span>':'<span class="tag">din datele tale</span>';
  const head=`<div class="row"><div class="eyebrow sp">${ic('coach')} Antrenor adaptiv · ${DAYN[nx.d]}</div>${src}</div>`;
  const ai=S.aiKey&&!on?(ADJ.busy===key?`<div class="msg ai" style="margin-top:12px">${typingDots} Antrenorul AI analizează datele…</div>`
    :`<button class="btn ghost sm wide" style="margin-top:10px" data-a="adjAI" data-w="${nx.w}" data-d="${nx.d}">${ic('coach')} ${ADJ.ai[key]?'Altă analiză AI':'Cere și analiza antrenorului AI'}</button>`):'';
  const err=ADJ.err&&ADJ.err.key===key?`<div class="err">${ic('alert')}<span>${esc(ADJ.err.t)}</span></div>`:'';
  if(today&&today.no&&!on) return `<div class="card adapt">${head}<div class="sm mu" style="margin-top:6px">Ai păstrat planul de bază pentru azi.</div>
    <button class="btn ghost sm" style="margin-top:10px" data-a="adjShow" data-w="${nx.w}" data-d="${nx.d}">Arată din nou propunerea</button></div>`;
  const groups=(P.groups||[]).map(g=>`<div class="ag"><p>${esc(g.why)}</p><ul>${adjItems(base,g.items).map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
  return `<div class="card adapt ${on?'on':''}">${head}
    <div class="h3" style="margin-top:8px">${esc(on?'Ajustări aplicate':P.title)}</div>
    ${P.summary?`<div class="sm" style="margin-top:6px">${esc(P.summary)}</div>`:''}
    ${groups||`<div class="sm mu" style="margin-top:6px">${esc(P.calm||'Nimic de schimbat față de plan.')}</div>`}
    ${P.dropped?`<div class="xs mu2" style="margin-top:6px">${P.dropped} propuneri AI ignorate: nu respectau limitele planului.</div>`:''}
    ${on?`<button class="btn ghost sm wide" style="margin-top:12px" data-a="adjOff" data-w="${nx.w}" data-d="${nx.d}">${ic('refresh')} Revino la planul de bază</button>`
      :(P.ch||[]).length?`<div class="inrow"><button class="btn pri" style="flex:1" data-a="adjOn" data-w="${nx.w}" data-d="${nx.d}">${ic('check')} Aplică</button><button class="btn ghost" data-a="adjNo" data-w="${nx.w}" data-d="${nx.d}">Păstrez planul</button></div>`:''}
    ${err}${ai}
    <div class="xs mu2" style="margin-top:10px">Planul de bază nu se schimbă: ajustările sunt doar pentru antrenamentul de azi și le poți anula oricând.</div></div>`;
}
/* AI: aceeași idee, cu structured output; fiecare schimbare e verificată înainte să ți-o arăt */
const ADJ_SCHEMA={type:'object',additionalProperties:false,required:['summary','changes'],properties:{summary:{type:'string'},
  changes:{type:'array',items:{type:'object',additionalProperties:false,required:['x','type','value','text','why'],properties:{
    x:{type:'integer'},type:{type:'string',enum:['sets','load','hold','rest','run','iv','swap','note']},value:{type:'number'},text:{type:'string'},why:{type:'string'}}}}}};
function adjPrompt(w,d,rule){ const day=dayFor(w,d,true);
  return 'Ești antrenorul adaptiv din aplicația FALCO. Propune ajustări DOAR pentru antrenamentul de azi; planul de bază nu se schimbă. '+
    'Folosește numai datele de mai jos, nu inventa valori, și explică fiecare schimbare cu cifre concrete din date (readiness, somn, febră musculară, puls, încărcare, volum pe mușchi, recorduri). '+
    'Dacă datele nu justifică schimbări, întoarce lista goală și spune de ce în summary. Scrie în română, concis.\n\n'+
    'Tipuri permise (pune value 0 și text "" acolo unde nu se folosesc):\n- sets: value = noul număr de serii (cel mult cu 1 peste plan)\n- load: value = factor aplicat greutății recomandate (0.6–1.1)\n- hold: fără creșteri de greutate azi\n- rest: value = secunde de pauză (30–240)\n- run: value = minute pentru alergarea ușoară sau lungă\n- iv: value = numărul de reprize la Threshold\n- swap: text = un exercițiu din lista de alternative a exercițiului\n- note: text = o indicație scurtă\n\n'+
    'Antrenamentul de azi — '+day.t+' (x = indexul exercițiului):\n'+day.ex.map(e=>'x='+e.x+' '+e.n+': '+e.p+(e.kind==='lift'&&SWAPS[e.n]?' · alternative: '+SWAPS[e.n].join(', '):'')).join('\n')+
    '\n\nPropunerea motorului de reguli (orientativ): '+(rule&&rule.groups.length?rule.groups.map(g=>g.why).join(' '):'fără schimbări')+'\n\nDATE:\n'+snapshot();
}
function adjValidate(w,d,res){
  const day=dayFor(w,d,true), names=day.ex.map(e=>e.n), out=[], G=[]; let dropped=0;
  (res.changes||[]).forEach(c=>{ const e=day.ex[c.x], v=+c.value, L=e&&e.kind==='lift', why=String(c.why||'').slice(0,240); let o=null;
    if(!e){ dropped++; return; }
    if(c.type==='sets'&&L&&Number.isInteger(v)&&v>=1&&v<=e.sets+1&&v!==e.sets) o={t:'sets',from:e.sets,to:v};
    else if(c.type==='load'&&L&&v>=.6&&v<=1.1&&v!==1) o={t:'load',from:1,to:Math.round(v*100)/100};
    else if(c.type==='hold'&&L) o={t:'hold',from:0,to:1};
    else if(c.type==='rest'&&L&&v>=30&&v<=240) o={t:'rest',from:e.rest,to:Math.round(v/15)*15};
    else if(c.type==='run'&&e.planMin&&e.n!=='Threshold'&&v>=10&&v<=Math.round(e.planMin*1.25)&&Math.round(v)!==e.planMin) o={t:'run',from:e.planMin,to:Math.round(v)};
    else if(c.type==='iv'&&e.n==='Threshold'&&Number.isInteger(v)&&v>=1&&v<=thrReps(e)+1&&v!==thrReps(e)) o={t:'iv',from:thrReps(e),to:v};
    else if(c.type==='swap'&&L&&(SWAPS[e.n]||[]).indexOf(c.text)>=0&&names.indexOf(c.text)<0) o={t:'swap',from:e.n,to:c.text};
    else if(c.type==='note'&&String(c.text||'').trim()) o={t:'note',from:'',to:String(c.text).trim().slice(0,160)};
    if(!o||out.some(x=>x.x===c.x&&x.t===o.t)){ dropped++; return; }
    o.x=c.x; o.n=e.n; out.push(o); const g=G.find(g=>g.why===why); if(g) g.items.push(o); else G.push({why:why||'Ajustare propusă de antrenorul AI.',items:[o]}); });
  return {src:'ai',kind:out.length?'ai':'ok',title:out.length?'Propunerea antrenorului AI':'Antrenorul AI: fără schimbări',summary:String(res.summary||'').slice(0,400),groups:G,ch:out,dropped,v:readiness().v};
}
async function adjAI(w,d){
  const key=dKey(w,d); if(ADJ.busy) return; ADJ.busy=key; ADJ.err=null; render(); let A=null;
  try{ COACH.preflight(); A=await loadSdk(); const client=COACH.client(A,S.aiKey);
    const msg=await client.beta.messages.stream({model:AI_MODEL,max_tokens:16000,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
      output_config:{effort:'medium',format:{type:'json_schema',schema:ADJ_SCHEMA}},messages:[{role:'user',content:adjPrompt(w,d,adaptFor(w,d))}]}).finalMessage();
    if(msg.stop_reason==='refusal') throw new Error('__refuz');
    if(msg.stop_reason==='max_tokens') throw new SyntaxError('trunchiat');
    const P=adjValidate(w,d,JSON.parse(msg.content.filter(b=>b.type==='text').map(b=>b.text).join(''))), ctx=aiCtx();
    /* propunerea trece prin același filtru ca restul antrenorului: textul, notele și exercițiile de înlocuire */
    const bad=(P.ch||[]).find(c=>c.t==='swap'&&COACH.exerciseConflict(c.to,ctx.injuries));
    const v=bad?{ok:false,message:'Am oprit propunerea: înlocuia un exercițiu cu '+bad.to+', care solicită o zonă declarată accidentată.'}
      :COACH.verify('adaptare',[P.summary].concat((P.groups||[]).map(g=>g.why),(P.ch||[]).filter(c=>c.t==='note').map(c=>c.to)).join('. '),ctx);
    if(!v.ok) throw new Error('__filtru:'+v.message);
    ADJ.ai[key]=P;
    await save('aiUsed',(S.aiUsed||0)+1);
  }catch(e){
    /* fără conexiune rămâne propunerea după reguli; AI-ul o verifică la revenirea online (aiSyncQueue) */
    if(COACH.isOffline(e,A)){ try{ const R=adaptFor(w,d); await COACH.queue.add({kind:'adj',t:new Date().toISOString(),day:todayKey(),w,d,rules:R?String(R.title||''):''}); }catch(x){}
      ADJ.err={key,t:'Mod offline activ. Adaptări bazate pe reguli predefinite. Antrenorul AI le verifică când revine conexiunea.'}; }
    else ADJ.err={key,t:e&&e.message==='__refuz'?'Modelul a refuzat cererea.':e&&/^__filtru:/.test(e.message)?e.message.slice(9):e instanceof SyntaxError?'Răspunsul nu a putut fi citit. Mai încearcă.':aiErrText(e,A)}; }
  ADJ.busy=null; render();
}
