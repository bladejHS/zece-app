/* =====================================================================
   v16 · NOTARE DIRECT ÎN PLAN — kg × repetări la forță și distanța, timpul sau viteza la alergare se notează în cardul zilei,
   fără ecranul complet. Seriile intră în același istoric ca în antrenamentul ghidat; exercițiul se bifează singur
   când ai toate seriile, alergarea când o salvezi. Se oprește din Setări → Antrenament.
   Luni și joi, cardul zilei e împărțit: SESSION 1 forța, SESSION 2 easy run-ul, la ~6 ore după.
   ===================================================================== */
const qlOn=()=>!(S.prof||{}).qlOff;
ACT.qlToggle=async()=>{ await save('prof',Object.assign({},S.prof||{},{qlOff:qlOn()})); render(); };
const qlId=(d,x)=>d+'_'+x;
/* seriile de azi la exercițiul n */
const qlToday=n=>{ const h=liftHist(n), e=h[h.length-1]; return e&&e.d===todayKey()?e.s:[]; };
const qlNum=id=>parseFloat(String(($('#'+id)||{}).value||'').replace(',','.'));

/* exercițiile zilei, cu antetele de sesiune pe zilele împărțite (abdomenul opțional rămâne în SESSION 1) */
function planExHTML(w,d,day){
  const sp=splitDay(d), L=sp?day.ex.filter(e=>e.kind!=='run').concat(day.ex.filter(e=>e.kind==='run')):day.ex, ql=qlOn();
  return L.map((e,i)=>{ const on=isDone(w,d,e.x), prev=L[i-1]||{};
    const hd=sp&&i===0?`<div class="ses-h"><b>SESSION 1</b><span>Forță</span></div>`
      :sp&&e.kind==='run'?`<div class="ses-h"><b>SESSION 2</b><span>Easy Run Z2 · la ~6 ore după forță</span></div>`:'';
    return `${hd}${e.opt&&!prev.opt?`<div class="ex-opt-h"><b>${ic('plus')} Abdomen · opțional</b><span>Nu contează la ziua completă: îl faci când ai chef.</span></div>`:''}<div class="ex ${on?'done':''} ${e.opt?'opt':''}">
      <button class="tick ${on?'on':''}" data-a="tick" data-w="${w}" data-d="${d}" data-x="${e.x}" aria-label="${on?'Debifează':'Bifează'} ${esc(e.n)}">${ic('check')}</button>
      <div class="sp"><div class="ex-n">${esc(e.n)}</div><div class="ex-p">${esc(e.p)}</div>${lastLine(e)}${exNote(e.n)?`<div class="ex-l ex-nt">${ic('edit')} ${esc(exNote(e.n))}</div>`:''}
        ${ql&&e.kind==='lift'?qlLift(w,d,e):ql&&e.kind==='run'?qlRun(w,d,e):''}</div>
      ${e.kind==='lift'?`<button class="xb" data-a="tech" data-k="${esc(e.n)}" aria-label="Tehnică pentru ${esc(e.n)}">${ic('info')}</button>`:''}</div>`; }).join('');
}

/* ---------- forță: kg × repetări, seria următoare, pauza ---------- */
function qlLift(w,d,e){
  const id=qlId(d,e.x), sets=qlToday(e.n); let sg={}; try{ sg=suggest(e)||{}; }catch(_){}
  const last=sets[sets.length-1], kg=last?last[0]:sg.kg!=null?sg.kg:'', rp=last?last[1]:(sg.reps||e.hi), rest=S.rest&&S.qlAt===id;
  return `<div class="ql">${sets.length?`<div class="ql-s">${sets.map((s,i)=>`<span>${i+1}. <b>${num(s[0],2)}</b> × <b>${s[1]}</b></span>`).join('')}</div>`:''}
    <div class="ql-r"><input class="inp" id="qlKg${id}" type="number" step="0.5" min="0" inputmode="decimal" value="${kg===''?'':+kg}" placeholder="kg" aria-label="kg · ${esc(e.n)}"><span class="ql-x">kg ×</span>
      <input class="inp" id="qlRp${id}" type="number" min="1" inputmode="numeric" value="${rp||''}" placeholder="rep." aria-label="repetări · ${esc(e.n)}">
      <button class="btn sm pri" data-a="qlSet" data-w="${w}" data-d="${d}" data-x="${e.x}">${ic('plus')} Seria ${sets.length+1}<small>/${e.sets}</small></button>
      ${sets.length?`<button class="btn sm ghost" data-a="qlUndo" data-w="${w}" data-d="${d}" data-x="${e.x}" aria-label="Șterge ultima serie">${ic('x')}</button>`:''}</div>
    ${rest?`<div class="ql-rest">${ic('clock')} Pauză <b id="restT">${fmtClock((S.rest.end-Date.now())/1000)}</b><button class="btn sm ghost" data-a="qlRestSkip">Sari</button></div>`:''}</div>`;
}
/* ziua tocmai a devenit completă: același semnal ca la bifă */
function qlDayCheck(W,D,X){ if(!optX(D,X)&&dayFull(W,D)) toast('Zi completă',DAYN[D]+' · '+PLAN[D].t); }
ACT.qlSet=async(el,{W,D,X})=>{
  const e=dayFor(W,D).ex[X]; if(!e||e.kind!=='lift') return;
  const id=qlId(D,X), kg=qlNum('qlKg'+id), rp=parseInt(($('#qlRp'+id)||{}).value,10);
  if(!(rp>0&&rp<=200)){ shake('#qlRp'+id); return; }
  const w=isFinite(kg)&&kg>=0?Math.round(kg*100)/100:0;
  if(!setSane(e.n,w,rp,el)) return;
  const before=bestE1(e.n,todayKey()), v=e1rm(w,rp);
  await addSet(e.n,w,rp);
  const n=qlToday(e.n).length;
  if(n>=e.sets&&!isDone(W,D,X)){ await setDone(W,D,X,true); qlDayCheck(W,D,X); }
  if(before>0&&v>before) toast('Record · '+e.n,num(w)+' kg × '+rp+' → 1RM ~'+v+' kg',''); else buzz(25);
  if(n<e.sets){ startRest(e.rest); S.qlAt=id; } else { stopRest(); S.qlAt=null; }
  render(); };
ACT.qlUndo=async(el,{W,D,X})=>{
  const e=dayFor(W,D).ex[X]; if(!e) return; const sets=qlToday(e.n); if(!sets.length) return;
  const [w,r]=sets[sets.length-1]; await removeSet(e.n,w,r);
  if(sets.length-1<e.sets&&isDone(W,D,X)) await setDone(W,D,X,false);
  stopRest(); S.qlAt=null; render(); };
ACT.qlRestSkip=()=>{ stopRest(); S.qlAt=null; render(); };

/* ---------- alergare: două din trei (km, minute, km/h), al treilea se calculează ---------- */
function qlRun(w,d,e){
  const id=qlId(d,e.x), kind=runKindOf(PLAN[d].run), r=(S.runs||[]).filter(x=>x.date===todayKey()&&x.kind===kind).pop();
  if(isDone(w,d,e.x)&&r&&+r.km>0&&+r.min>0) return `<div class="ql ql-done">${ic('check')} <span>${num(r.km,2)} km · ${num(r.min,1)} min · <b>${num(r.km/(r.min/60),1)} km/h</b> · ${fmtPace(paceOf(r))}</span></div>`;
  return `<div class="ql"><div class="ql-r ql-run">
      <label><span>km</span><input class="inp" id="qlKm${id}" type="number" step="0.01" min="0" inputmode="decimal" placeholder="—"></label>
      <label><span>min</span><input class="inp" id="qlMn${id}" type="number" step="0.1" min="0" inputmode="decimal" value="${e.planMin||''}"></label>
      <label><span>km/h</span><input class="inp" id="qlSp${id}" type="number" step="0.1" min="0" inputmode="decimal" placeholder="—"></label>
      <button class="btn sm pri" data-a="qlRun" data-w="${w}" data-d="${d}" data-x="${e.x}">${ic('check')} Salvează</button></div>
    <div class="xs mu2">Completezi două din trei; al treilea se calculează.</div></div>`;
}
ACT.qlRun=async(el,{W,D,X})=>{
  const e=dayFor(W,D).ex[X]; if(!e||e.kind!=='run') return;
  const id=qlId(D,X); let km=qlNum('qlKm'+id), mn=qlNum('qlMn'+id); const sp=qlNum('qlSp'+id);
  if(!(km>0)&&sp>0&&mn>0) km=sp*mn/60;
  else if(!(mn>0)&&km>0&&sp>0) mn=km/sp*60;
  if(!(km>0&&km<=100)){ shake('#qlKm'+id); return; }
  if(!(mn>0&&mn<=600)){ shake('#qlMn'+id); return; }
  const v=km/(mn/60); if(v>30){ shake('#qlSp'+id); toast('Verifică valorile',num(v,1)+' km/h e prea rapid pentru o alergare.','info'); return; }
  const run={date:todayKey(),kind:runKindOf(PLAN[D].run),km:Math.round(km*100)/100,min:Math.round(mn*10)/10};
  await save('runs',(S.runs||[]).concat([run]));
  if(!isDone(W,D,X)){ await setDone(W,D,X,true); qlDayCheck(W,D,X); }
  buzz(40); toast('Alergare salvată',num(run.km,2)+' km · '+num(run.min,1)+' min · '+num(v,1)+' km/h','');
  render(); };
