/* =====================================================================
   v15 · NUTRIȚIA PERIODIZATĂ — ținta zilei urmează antrenamentul (intensă, moderată, odihnă, deload),
   hidratare după greutate și pierderi, suplimente pe niveluri (Tier 3 blocat), notare rapidă cu vocea sau text,
   feedback pe mese, meal prep pe săptămână și avertizarea medicală obligatorie. Logica: src/lib/nutrition (NUTRI).
   ===================================================================== */
/* tipul zilei din plan, fără deload și fără activități notate */
const planType=b=>b.cat==='rest'?'rest':(b.run==='thr'||b.run==='lng'||/Conditioning|Power|Lower|picioare grele/.test(b.t))?'high':'moderate';
/* media factorilor de carbohidrați pe săptămâna normală a planului: carbohidrații se mută între zile, totalul săptămânii rămâne baza */
let NMEAN=null; const NUTRI_MEAN=()=>NMEAN||(NMEAN=NUTRI.weekCarbMean(PLAN.map(planType)));
/* tipul zilei k din planul hibrid (aceeași săptămână a ciclului), plus activitățile notate în ziua k: kickboxingul (sau altă activitate) grea face ziua intensă, chiar dacă era de odihnă */
function nutriDay(k){
  const wd=(parseKey(k).getDay()+6)%7, nx=nextDay(), w=nx?nx.w:0, day=dayFor(w,wd,true), ext=(S.ext||[]).filter(x=>x.date===k&&!x.dup);
  const dl=deloadOn(w)||(k===todayKey()&&hrvNow().force), kbHard=ext.some(x=>(+x.rpe||0)>=7), extMin=ext.reduce((a,x)=>a+(+x.min||0),0);
  let type=kbHard?'high':planType(day);
  if(dl&&type!=='rest'&&!kbHard) type='deload';
  return {type,label:NUTRI.DAY_LABEL[type],t:day.t,w,d:wd,extMin,minutes:day.cat==='rest'?0:(+day.min||60),intensity:type==='high'?'high':type==='rest'&&!extMin?'low':'moderate'}; }
/* semnalele de azi pentru adaptare: energia din check-in-ul de kickboxing, readiness, RPE-ul ultimei sesiuni (2 zile) */
/* readiness() → recoveryAt() poate cere la rândul ei targets(): fără reintrare, altfel ar fi o buclă */
let NCI_BUSY=false;
function nutriCi(k){ const kc=(S.kb||{}).ci, o={};
  if(kc&&kc.date===k) o.energy=kc.energy;
  if(!NCI_BUSY){ NCI_BUSY=true; try{ const r=readiness(k); if(r&&r.v!=null) o.readiness=r.v; }catch(e){} finally{ NCI_BUSY=false; } }
  const since=dayShift(k,-2), h=(S.hist||[]).filter(x=>x.date>=since&&x.rpe).pop(), x=(S.ext||[]).filter(e=>e.date>=since&&e.rpe&&!e.dup).pop();
  const rpe=Math.max(h?+h.rpe:0,x?+x.rpe:0); if(rpe) o.lastRpe=rpe;
  return o; }

/* ---------- avertizarea medicală: o dată, înainte de orice țintă ---------- */
const nutriOk=()=>!!prof().nutriOk;
function nutriGate(){ return `<div class="card nutri-gate"><div class="eyebrow">${ic('alert')} Înainte de nutriție</div>
  <div class="h3" style="margin-top:8px">Citește o dată, apoi începem</div>
  ${NUTRI.DISCLAIMER.map(p=>`<p class="sm" style="margin-top:10px;line-height:1.55">${esc(p)}</p>`).join('')}
  <button class="btn pri xl wide" style="margin-top:16px" data-a="nutriOk">${ic('check')} Am înțeles</button></div>`; }
ACT.nutriOk=async()=>{ await save('prof',Object.assign({},S.prof||{},{nutriOk:todayKey()})); STC=null; render(); };

/* ---------- ziua: tipul, ce s-a schimbat în ținte, hidratarea și alerta de dinainte de antrenament ---------- */
function nutriDayCard(tg,wt){ const dt=tg.day, per=tg.per; if(!dt||!per) return '';
  const nx=nextDay(), trainToday=dt.type!=='rest'&&!(nx&&dayFull(nx.w,(parseKey(todayKey()).getDay()+6)%7));
  const alert=trainToday?NUTRI.preWorkoutAlert(wt,tg.hyd):null;
  return `<div class="card nday nday-${dt.type}"><div class="row"><div class="eyebrow sp">${ic(dt.type==='rest'?'leaf':'flame')} ${esc(dt.label)}</div><span class="xs mu">${esc(dt.t)}</span></div>
    <div class="nday-g"><div><span>Calorii</span><b>${tg.kcal}</b><small>${tg.kcal===tg.base.kcal?'baza zilei':(tg.kcal>tg.base.kcal?'+':'')+(tg.kcal-tg.base.kcal)+' față de bază'}</small></div>
      <div><span>Carbohidrați</span><b>${tg.c} g</b><small>×${num(per.factor,2)}</small></div><div><span>Proteină</span><b>${tg.p} g</b><small>constantă</small></div>
      <div><span>Apă</span><b>${num(tg.water/1000,1)} L</b><small>${tg.hyd.lossMl?'+'+num(tg.hyd.lossMl/1000,1)+' L pierderi':'fără antrenament'}</small></div></div>
    ${per.notes.length?`<div class="nday-n">${per.notes.map(n=>`<p>${ic(per.floorApplied&&/prag|deficit/.test(n)?'alert':'info')} ${esc(n)}</p>`).join('')}</div>`:''}
    ${tg.hyd.sodiumMg>=500?`<div class="nday-n"><p>${ic('drop')} Sodiu pierdut azi: ~${num(tg.hyd.sodiumMg/1000,1)} g${tg.hyd.sodiumPerHour?` · în timpul efortului ${tg.hyd.sodiumPerHour[0]}–${tg.hyd.sodiumPerHour[1]} mg pe oră`:''}. După: sare în masă sau electroliți în apă.</p></div>`:''}
    ${alert?`<div class="nday-alert" role="status">${ic('drop')} ${esc(alert)}</div>`:''}</div>`; }
/* alerta de hidratare la pornirea unui antrenament */
function hydAlert(){ try{ const tg=targets(), m=NUTRI.preWorkoutAlert(waterOf(todayKey()),tg.hyd); if(m) toast('Hidratare',m,'info'); }catch(e){} }

/* ---------- notare rapidă: vocea sau text → AI estimează masa → feedback după antrenamentul zilei ---------- */
const QI={text:'',busy:false,res:null,err:null,rec:null};
const MEAL_TEXT_PROMPT='Estimează conținutul nutrițional al mesei descrise mai jos (în română, poate fi dictată, cu greșeli). Identifică fiecare aliment și cantitatea; dacă lipsește, folosește o porție obișnuită și spune asta în note. Totalurile sunt suma alimentelor. Răspunde în română.\n\nMasa: ';
function mealCtx(k){ const tg=targets(k), d=dayTotals(k), h=new Date().getHours(), done=(S.hist||[]).some(x=>x.date===k)||(S.ext||[]).some(x=>x.date===k&&!x.dup);
  return {dayType:tg.day.type,timing:done?'post':tg.day.type==='rest'?'other':'pre',remaining:{kcal:tg.kcal-d.k,p:tg.p-d.p},eatenKcal:d.k,sex:prof().sex==='f'?'f':'m',hour:h}; }
function mealFbHTML(m){ const fb=NUTRI.mealFeedback({k:+m.kcal||+m.k||0,p:+m.p||0,c:+m.c||0,g:+m.g||0},mealCtx(todayKey()));
  return fb.length?`<div class="meal-fb">${fb.map(x=>`<p>${ic('info')} ${esc(x)}</p>`).join('')}</div>`:''; }
function quickCard(){ const r=QI.res;
  return `<div class="card" id="qiCard"><div class="eyebrow">${ic('mic')} Notează rapid · voce sau text</div>
    <div class="inrow" style="margin-top:10px">${SR?`<button class="btn ghost qi-mic ${QI.rec?'rec':''}" data-a="qiMic" aria-label="Dictează masa">${ic('mic')}</button>`:''}
      <input class="inp" id="qiT" value="${esc(QI.text)}" placeholder="ex: două ouă, o felie de pâine, o banană" aria-label="Ce ai mâncat"></div>
    ${QI.err?`<div class="err" role="alert">${ic('alert')}<span>${esc(QI.err)}</span></div>`:''}
    ${r?`<div class="h3" style="margin-top:12px">${esc(r.name)}</div><div class="sm mu">${r.kcal} kcal · ${r.p} g proteină · ${r.c} g carbohidrați · ${r.g} g grăsimi${r.conf?' · încredere '+esc(r.conf):''}</div>
      ${r.note?`<div class="xs mu2" style="margin-top:4px">${esc(r.note)}</div>`:''}${mealFbHTML(r)}
      <div class="inrow" style="margin-top:10px"><button class="btn ghost" data-a="qiX">Renunță</button><button class="btn pri" style="flex:1" data-a="qiAdd">${ic('check')} Adaugă în jurnal</button></div>`
    :`<button class="btn pri wide" style="margin-top:10px" data-a="qiRun" ${QI.busy?'disabled':''}>${QI.busy?'Estimez…':ic('coach')+' Estimează'}</button>`}</div>`; }
async function qiRun(){
  const t=(($('#qiT')||{}).value||QI.text||'').trim(); QI.text=t; const ci=COACH.checkInput(t);
  if(!ci.ok){ QI.err=ci.reason; render(); return; }
  if(!S.aiKey){ QI.err='Estimarea cere cheia AI (Setări → Antrenor AI). Poți nota manual mai jos.'; render(); return; }
  QI.busy=true; QI.err=null; QI.res=null; render(); let A=null;
  try{ COACH.preflight(); A=await loadSdk(); const client=COACH.client(A,S.aiKey);
    const msg=await client.beta.messages.stream({model:AI_MODEL,max_tokens:16000,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
      output_config:{effort:'low',format:{type:'json_schema',schema:MEAL_SCHEMA}},messages:[{role:'user',content:MEAL_TEXT_PROMPT+ci.text}]}).finalMessage();
    if(msg.stop_reason==='refusal') throw new Error('__refuz');
    const r=JSON.parse(msg.content.filter(b=>b.type==='text').map(b=>b.text).join(''));
    const v=COACH.verify('masă rapidă',[r.name,r.note].concat(Array.isArray(r.items)?r.items.map(i=>typeof i==='string'?i:JSON.stringify(i)):[]).filter(Boolean).join('. '),aiCtx());
    if(!v.ok) throw new Error('__filtru:'+v.message);
    QI.res={name:String(r.name||'Masă').slice(0,80),kcal:Math.round(+r.kcal||0),p:Math.round(+r.protein_g||0),c:Math.round(+r.carbs_g||0),g:Math.round(+r.fat_g||0),conf:r.confidence,note:r.note};
    await save('aiUsed',(S.aiUsed||0)+1);
  }catch(e){ QI.err=e&&e.message==='__refuz'?'Modelul a refuzat cererea.':e&&/^__filtru:/.test(e.message)?e.message.slice(9):e instanceof SyntaxError?'Răspunsul nu a putut fi citit. Mai încearcă.':aiErrText(e,A); }
  QI.busy=false; if(S.tab==='nutri') render(); }
ACT.qiRun=()=>qiRun();
ACT.qiX=()=>{ Object.assign(QI,{res:null,err:null}); render(); };
ACT.qiAdd=async()=>{ const r=QI.res; if(!r) return; await addMeal({n:r.name,k:r.kcal,p:r.p,c:r.c,g:r.g}); Object.assign(QI,{text:'',res:null,err:null}); render(); toast('Masă adăugată',r.name+' · '+r.kcal+' kcal'); };
ACT.qiMic=()=>{ if(!SR) return; if(QI.rec){ try{ QI.rec.stop(); }catch(e){} return; }
  try{ const r=new SR(); r.lang='ro-RO'; r.interimResults=true; r.continuous=false;
    r.onresult=e=>{ let t=''; for(const x of e.results) t+=x[0].transcript; QI.text=t; const el=$('#qiT'); if(el) el.value=t; };
    r.onend=()=>{ QI.rec=null; const b=$('.qi-mic'); if(b) b.classList.remove('rec'); if(QI.text.trim()) qiRun(); };
    r.onerror=()=>{ QI.rec=null; const b=$('.qi-mic'); if(b) b.classList.remove('rec'); };
    QI.rec=r; r.start(); const b=$('.qi-mic'); if(b) b.classList.add('rec'); buzz(20); }catch(e){ QI.rec=null; toast('Dictarea nu merge aici','Scrie masa în câmp.','info'); } };

/* ---------- suplimente: Tier 3, explicat ---------- */
function suppBlockedHTML(){ return `<details class="notes"><summary>${ic('alert')} Blocate în aplicație · Tier 3</summary>
  ${NUTRI.BLOCKED.map(b=>`<p><b>${esc(b.name)}</b>: ${esc(b.why)}</p>`).join('')}</details>`; }

/* ---------- meal prep pe săptămâna planului ---------- */
function mealPrepCard(){ const tk=todayKey(), wk=Array.from({length:7},(_,i)=>{ const k=dayShift(tk,i), dt=nutriDay(k); return {label:i===0?'Azi':DAYS[(parseKey(k).getDay()+6)%7],dayType:dt.type,t:dt.t}; });
  const mp=NUTRI.mealPrep(wk);
  return `<div class="card"><div class="eyebrow">${ic('bowl')} Meal prep · după antrenamentele săptămânii</div>
    ${mp.batches.map(b=>`<div class="mp-b"><b>${esc(b.day)}</b><span>${esc(b.what)}</span><small>pentru ${esc(b.covers)}</small></div>`).join('')}
    <div class="mp-d">${mp.days.map((d,i)=>`<div class="mp-r mp-${d.dayType}"><b>${esc(d.label)}</b><span><i>${esc(wk[i].t)}</i>${esc(d.carbs)}</span></div>`).join('')}</div></div>`; }
