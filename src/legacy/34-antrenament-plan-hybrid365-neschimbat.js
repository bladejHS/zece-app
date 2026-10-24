/* =====================================================================
   v8 · ANTRENAMENT — Planul · HYBRID (v27, Alex Viada, în 34b) · Activități · Istoric.
   ===================================================================== */
const TR_TABS=[['plan','Plan','plan'],['hyb','HYBRID','bolt'],['acts','Activități','activity'],['hist','Istoric','history']];
function viewTrain(){
  const T=TR_TABS.some(t=>t[0]===S.trTab)?S.trTab:'plan';
  const body=T==='hist'?trainHist():T==='acts'?viewActs():T==='hyb'?viewHybrid():viewPlan();
  return `<div class="seg scr" style="margin-top:6px">${TR_TABS.map(t=>`<button class="${T===t[0]?'on':''}" data-a="trTab" data-k="${t[0]}">${ic(t[2])} ${t[1]}</button>`).join('')}</div>${body}`;
}
ACT.trTab=(el,{k})=>{ S.trTab=k; render(); window.scrollTo({top:0}); };
/* ---------- istoric ---------- */
function trainHist(){
  const W=workoutsAll(), runs=(S.runs||[]).map((r,i)=>Object.assign({i},r)), by={};
  W.forEach(w=>{ const m=w.date.slice(0,7); (by[m]=by[m]||{w:[],r:[]}).w.push(w); }); runs.forEach(r=>{ const m=r.date.slice(0,7); (by[m]=by[m]||{w:[],r:[]}).r.push(r); });
  const ks=Object.keys(by).sort().reverse().slice(0,S.thN||6);
  if(!ks.length) return `<div class="card"><div class="empty">${ic('history')}<div>Istoricul apare după primul antrenament.</div></div></div>`;
  return ks.map(k=>{ const g=by[k], it=g.w.map(w=>({d:w.date,h:w.kind==='ses'?`<button class="list-row link hl" data-a="histOpen" data-i="${w.hi}" data-ctx="hist:${w.hi}"><span class="ic-s lift">${ic('dumbbell')}</span><span class="sp"><b>${esc(w.t)}</b><span class="xs mu" style="display:block">${fmtDay(w.date)} · ${Math.round((+w.h.dur||0)/60)} min · ${w.h.sets||0} serii${w.h.vol?' · '+num(w.h.vol/1000,1)+' t':''}${w.h.prs?' · '+w.h.prs+' PR':''}</span></span>${ic('right')}</button>`
      :`<button class="list-row link hl" data-a="dayOpen" data-k="${w.date}"><span class="ic-s lift">${ic('dumbbell')}</span><span class="sp"><b>${esc(w.t)}</b><span class="xs mu" style="display:block">${fmtDay(w.date)} · ${w.sets} serii · ${esc(w.ex.slice(0,3).join(', '))}</span></span>${ic('right')}</button>`}))
      .concat(g.r.map(r=>({d:r.date,h:`<button class="list-row link hl" data-a="runOpen" data-i="${r.i}"><span class="ic-s run">${ic('run')}</span><span class="sp"><b>${esc(RUNK[r.kind]||'Alergare')} · ${num(r.km,2)} km</b><span class="xs mu" style="display:block">${fmtDay(r.date)} · ${fmtClock((+r.min||0)*60)} · ${fmtPace(paceOf(r))}</span></span>${ic('right')}</button>`})))
      .sort((a,b)=>a.d<b.d?1:-1);
    const y=+k.slice(0,4), mo=+k.slice(5,7), ag=periodAgg(k+'-01',dayShift(mo===12?(y+1)+'-01-01':y+'-'+pad(mo+1)+'-01',-1));
    return `<div class="card"><div class="card-h"><div class="eyebrow">${ic('history')} ${MON_S[mo-1]} ${y}</div><span class="xs mu">${ag.days} zile · ${num(ag.vol/1000,1)} t · ${num(ag.km,1)} km</span></div>${it.map(x=>x.h).join('')}</div>`; }).join('')
    +(Object.keys(by).length>ks.length?`<button class="btn ghost wide" style="margin-top:12px" data-a="thMore">${ic('down')} Lunile anterioare</button>`:'');
}
ACT.thMore=()=>{ S.thN=(S.thN||6)+6; render(); };
