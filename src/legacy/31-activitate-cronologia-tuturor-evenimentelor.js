/* =====================================================================
   v8 · ACTIVITATE — cronologia tuturor evenimentelor (antrenamente, alergări, recorduri,
   obiective, corp, realizări) și centrul de notificări.
   ===================================================================== */
const TL_KINDS=[['all','Toate','list'],['wo','Antrenamente','dumbbell'],['run','Alergări','run'],['pr','Recorduri','trophy'],['goal','Obiective','target'],['body','Corp','scale'],['ach','Realizări','award']];
/* toate evenimentele dintr-un interval, cele mai noi primele: {d, k (tip), icon, t (titlu), s (detalii), a/k2/i (acțiune la atingere), ord} */
function timelineItems(a,b){
  const out=[], inR=d=>d&&d>=a&&d<=b, X=IX();
  (S.hist||[]).forEach((h,i)=>{ if(!inR(h.date)) return; out.push({d:h.date,k:'wo',icon:'dumbbell',t:h.t||'Antrenament',
    s:[Math.round((+h.dur||0)/60)+' min',h.sets?h.sets+' serii':'',h.vol?num(h.vol/1000,1)+' t':'',h.km?num(h.km,1)+' km':'',h.prs?h.prs+(h.prs===1?' record':' recorduri'):''].filter(Boolean).join(' · '),a:'histOpen',i,ord:h.end||0}); });
  X.days.forEach(d=>{ if(!inR(d)) return; const o=X.day[d]; if(o.sets&&!o.hist.length) out.push({d,k:'wo',icon:'dumbbell',t:'Serii notate',s:o.sets+' serii · '+Object.keys(o.ex).slice(0,3).join(', ')+(Object.keys(o.ex).length>3?'…':''),a:'dayOpen',k2:d,ord:1});
    o.tm.forEach(t=>out.push({d,k:'wo',icon:'clock',t:t.title||'Cronometru',s:fmtClock(t.total)+(t.rounds?' · '+t.rounds+' runde':''),ord:2}));
    o.ext.forEach(x=>out.push({d,k:'wo',icon:actIcon(x.type),t:stName(x.type)+(x.name?' · '+x.name:''),s:num(x.min,0)+' min'+(x.km?' · '+num(x.km,1)+' km':'')+(x.src==='manual'?'':' · Strava'),ord:x.start||3})); });
  (S.runs||[]).forEach((r,i)=>{ if(!inR(r.date)) return; out.push({d:r.date,k:'run',icon:'run',t:(RUNK[r.kind]||'Alergare')+' · '+num(r.km,2)+' km',s:fmtClock((+r.min||0)*60)+' · '+fmtPace(paceOf(r))+(r.hr?' · '+r.hr+' bpm':'')+(r.sid?' · Strava':''),a:'runOpen',i,ord:4}); });
  prBook().ev.forEach(p=>{ if(!inR(p.d)) return; if(p.cat==='rep') return; out.push({d:p.d,k:'pr',icon:'trophy',t:'Record · '+prName(p),s:(p.prev!=null?(p.cat==='pace'?mmss(p.prev)+' /km':p.cat==='time'?fmtClock(p.prev):num(p.prev,1))+' → ':'')+prVal(p),a:'tab',k2:'prog',s2:'pr',ord:5}); });
  goalsAll().forEach(g=>{ if(g.d0&&inR(g.d0)&&g.id!=='wt') out.push({d:g.d0,k:'goal',icon:'target',t:'Obiectiv nou · '+goalTitle(g),s:'pornit de la '+goalFmt(g,g.from),a:'goalOpen',k2:g.id,ord:6});
    const st=goalState(g); st.ms.forEach(m=>{ if(inR(m.d)) out.push({d:m.d,k:'goal',icon:m.m===1?'check':'flag',t:(m.m===1?'Obiectiv atins · ':'Reper '+m.m*100+'% · ')+goalTitle(g),s:goalFmt(g,m.v),a:'goalOpen',k2:g.id,ord:7}); }); });
  wList().forEach(x=>{ if(inR(x.d)) out.push({d:x.d,k:'body',icon:'scale',t:'Cântărire · '+num(x.w,1)+' kg',s:'',a:'goBody',ord:0}); });
  bList().forEach(x=>{ if(!inR(x.d)) return; const m=MEAS.filter(([k])=>+x[k]>0).map(([k,l])=>l.toLowerCase()+' '+num(x[k])); if(m.length||x.bf) out.push({d:x.d,k:'body',icon:'ruler',t:'Măsurători',s:m.concat(x.bf?['grăsime '+num(x.bf,1)+'% (introdus)']:[]).join(' · '),a:'goBody',ord:0}); });
  (S.photos||[]).forEach(p=>{ if(inR(p.date)) out.push({d:p.date,k:'body',icon:'camera',t:'Poză de progres',s:p.pose==='profil'?'profil':p.pose==='spate'?'spate':'față',a:'goBody',ord:0}); });
  (S.ptests||[]).forEach(t=>{ if(!inR(t.date)) return; const pt=PTESTS.find(x=>x[0]===t.type); if(pt) out.push({d:t.date,k:t.type==='k1'?'run':'wo',icon:'medal',t:'Test · '+pt[1],s:t.type==='k1'?fmtClock(t.value):num(t.value,1)+' '+pt[2],a:'tab',k2:'prog',s2:t.type==='k1'?'k1':'t',ord:4}); });
  achAll().forEach(x=>{ if(x.done&&inR(x.date)) out.push({d:x.date,k:'ach',icon:'award',t:'Realizare · '+x.t,s:x.d,a:'tab',k2:'prog',s2:'pr',ord:8}); });
  return out.sort((p,q)=>p.d<q.d?1:p.d>q.d?-1:(q.ord||0)-(p.ord||0));
}
const tlAct=x=>x.a?`data-a="${x.a}"${x.k2!=null?` data-k="${esc(x.k2)}"`:''}${x.i!=null?` data-i="${x.i}"`:''}${x.s2?` data-s="${x.s2}"`:''}`:'';
const tlIc=k=>k==='run'?'run':k==='pr'||k==='ach'?'ok':k==='goal'?'warn':k==='body'?'':'lift';
function tlRowMini(x){ return `<button class="tl-r" ${tlAct(x)}><span class="ic-s ${tlIc(x.k)}">${ic(x.icon)}</span><span class="sp"><b>${esc(x.t)}</b>${x.s?`<span class="xs mu">${esc(x.s)}</span>`:''}</span><span class="xs mu2">${relDay(x.d)}</span></button>`; }
function viewAct(){
  const f=S.tlF||'all', n=S.tlN||45, tk=todayKey(), from=dayShift(tk,-n+1);
  const all=timelineItems(from,tk), it=f==='all'?all:all.filter(x=>x.k===f);
  const by={}; it.forEach(x=>{ (by[x.d]=by[x.d]||[]).push(x); });
  const hdr=d=>{ const r=relDay(d); return r==='azi'?'Azi':r==='ieri'?'Ieri':parseKey(d).toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'}); };
  const older=IX().first&&IX().first<from;
  return `<div class="page-h"><div class="sp"><div class="eyebrow">${ic('history')} Cronologie</div><div class="h1">Activitate</div>
      <div class="sub">Tot ce ai notat, în ordine: antrenamente, alergări, recorduri, obiective, corp și realizări.</div></div></div>
    <div class="scrollx" style="margin-top:12px">${TL_KINDS.map(([k,l,icn])=>`<button class="chip ${f===k?'on':''}" data-a="tlF" data-k="${k}">${ic(icn)} ${l}</button>`).join('')}</div>
    ${Object.keys(by).length?`<div class="tl">${Object.keys(by).map(d=>`<div class="tl-d"><div class="tl-dh">${esc(hdr(d))}<span>${by[d].length}</span></div>
      ${by[d].map(x=>`<button class="tl-i k-${x.k}" ${tlAct(x)}><span class="tl-dot">${ic(x.icon)}</span><span class="sp"><b>${esc(x.t)}</b>${x.s?`<span>${esc(x.s)}</span>`:''}</span>${x.a?ic('right'):''}</button>`).join('')}</div>`).join('')}</div>`
      :`<div class="card"><div class="empty">${ic('history')}<div>${f==='all'?'Nimic notat în ultimele '+n+' de zile.':'Nimic de acest tip în ultimele '+n+' de zile.'}</div></div></div>`}
    ${older?`<button class="btn ghost wide" style="margin-top:14px" data-a="tlMore">${ic('down')} Arată încă 60 de zile</button>`:''}`;
}
ACT.tlF=(el,{k})=>{ S.tlF=k; render(); };
ACT.tlMore=()=>{ S.tlN=(S.tlN||45)+60; render(); };
/* detaliul unei sesiuni terminate */
function histHTML(){
  const h=(S.hist||[])[SH.i]; if(!h) return `<div class="empty">Sesiunea nu mai există.</div>`;
  const o=ixDay(h.date)||{ex:{}}, ex=Object.keys(o.ex);
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('dumbbell')} ${fmtDay(h.date)}${h.w!=null&&h.d!=null?' · S'+(h.w+1)+' · '+DAYN[h.d]:''}</div><div class="h2" style="margin-top:6px">${esc(h.t||'Antrenament')}</div>
    <div class="kpis"><div class="kpi"><div class="k">Durată</div><div class="v">${fmtClock(h.dur||0)}</div></div><div class="kpi"><div class="k">Serii</div><div class="v">${h.sets||0}</div></div>
      <div class="kpi"><div class="k">${h.km?'Distanță':'Volum'}</div><div class="v">${h.km?num(h.km,2)+'<small>km</small>':num((h.vol||0)/1000,2)+'<small>t</small>'}</div></div></div>
    ${h.hr?`<div class="list-row"><span class="sp">Puls mediu · maxim</span><span class="v">${h.hr.avg} · ${h.hr.max} bpm</span></div>`:''}
    ${h.rpe?`<div class="list-row"><span class="sp">Efort (RPE)</span><span class="v">${h.rpe}/10</span></div>`:''}
    ${h.ready!=null?`<div class="list-row"><span class="sp">Starea dinainte</span><span class="v">${h.ready}/100</span></div>`:''}
    ${ex.length?`<div class="dsec"><h4>Seriile din ziua respectivă</h4>${ex.map(n=>{ const e=liftHist(n).find(x=>x.d===h.date); return e?`<div class="list-row sesr"><b class="sp">${esc(n)}</b><span class="sess-l">${e.s.map(fmtSet).join(' · ')}</span></div>`:''; }).join('')}</div>`:''}`;
}
ACT.histOpen=(el,{I})=>{ SH={kind:'hist',i:I}; shRender(); };

/* ---------- notificări: utile, nu spam ----------
   Se generează din date (record nou, reper de obiectiv, realizare, copie de siguranță, antrenament neterminat),
   o singură dată fiecare; dacă permiți, apar și ca notificări de sistem cât timp aplicația e deschisă. */
const NOTIF_K={pr:['Recorduri noi','trophy'],goal:['Repere de obiective','target'],ach:['Realizări','award'],bk:['Memento pentru copie','shield'],sess:['Antrenament neterminat','clock']};
const notifCfg=()=>Object.assign({pr:true,goal:true,ach:true,bk:true,sess:true,sys:false},S.notifCfg||{});
const notifUnread=()=>(S.notif||[]).filter(n=>!n.r).length;
function notifGen(){
  const cfg=notifCfg(), tk=todayKey(), have=new Set((S.notif||[]).map(n=>n.id)), add=[];
  const push=(id,k,t,b,link)=>{ if(have.has(id)||!cfg[k]) return; have.add(id); add.push({id,k,t,b,link,at:new Date().toISOString(),d:tk}); };
  prBook().ev.filter(p=>p.d>=dayShift(tk,-1)&&p.cat!=='rep').forEach(p=>push('pr:'+p.key+':'+p.d,'pr','Record nou · '+prName(p),prVal(p)+(p.prev!=null?' (înainte '+(p.cat==='pace'?mmss(p.prev):p.cat==='time'?fmtClock(p.prev):num(p.prev,1))+')':''),'prog|pr'));
  goalsAll().forEach(g=>goalState(g).ms.forEach(m=>{ if(m.d>=dayShift(tk,-1)) push('goal:'+g.id+':'+m.m,'goal',m.m===1?'Obiectiv atins':'Reper atins · '+m.m*100+'%',goalTitle(g),'goal|'+g.id); }));
  achAll().forEach(x=>{ if(x.done&&x.date>=dayShift(tk,-1)) push('ach:'+x.id,'ach','Realizare · '+x.t,x.d,'prog|pr'); });
  if(bkCard()) push('bk:'+mondayOf(tk),'bk','Fă o copie a datelor','Totul stă doar în acest browser. Setări → Datele tale.','set|');
  if(S.sess&&Date.now()-S.sess.start>3*3600e3) push('sess:'+S.sess.start,'sess','Antrenament neterminat','Îl continui sau îl închizi? Seriile notate rămân.','fx|');
  return add;
}
let NOTIF_BUSY=false;
async function notifTick(){
  if(NOTIF_BUSY||!S.loaded) return; NOTIF_BUSY=true;
  try{
    /* realizările: prima rulare le înregistrează în liniște; după aceea, o realizare nouă = un toast discret */
    const A=achAll().filter(x=>x.done), seen=S.ach;
    if(!seen) await save('ach',Object.fromEntries(A.map(x=>[x.id,x.date])));
    else { const nw=A.filter(x=>!seen[x.id]); if(nw.length){ await save('ach',Object.assign({},seen,Object.fromEntries(nw.map(x=>[x.id,x.date||todayKey()]))));
      toast('Realizare deblocată',nw.map(x=>x.t).join(' · '),'info'); } }
    const add=notifGen(); if(add.length){ const first=!Array.isArray(S.notif);
      /* prima rulare după actualizare: ce exista deja intră ca citit, fără să sune */
      if(first) add.forEach(n=>n.r=true);
      await save('notif',(S.notif||[]).concat(add).slice(-120));
      if(!first){ const cfg=notifCfg(); add.forEach(n=>{ if(cfg.sys&&'Notification' in window&&Notification.permission==='granted'&&document.hidden) try{ new Notification(n.t,{body:n.b,tag:n.id,icon:'icon-192.png'}); }catch(e){} });
        renderTop(); renderSide(); } }
    else if(!Array.isArray(S.notif)) await save('notif',[]);
  }catch(e){ errLog(e&&e.message,'notif'); }
  NOTIF_BUSY=false;
}
function notifHTML(){
  const L=(S.notif||[]).slice().reverse();
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('bell')} Notificări</div><div class="h2" style="margin-top:6px">${L.length?'Ce e nou':'Nimic nou'}</div>
    ${L.length?`<div class="nt-l">${L.slice(0,40).map(n=>`<button class="nt ${n.r?'':'new'}" data-a="notifGo" data-k="${esc(n.id)}"><span class="ic-s">${ic((NOTIF_K[n.k]||['','bell'])[1])}</span>
      <span class="sp"><b>${esc(n.t)}</b><span class="xs mu">${esc(n.b||'')}</span></span><span class="xs mu2">${relDay(n.d)}</span></button>`).join('')}</div>
      <div class="inrow"><button class="btn ghost sm" data-a="notifRead">${ic('check')} Marchează tot ca citit</button><button class="btn ghost sm" data-a="tab" data-k="set" data-s="sNotif">${ic('sliders')} Setări</button></div>`
    :`<div class="empty">${ic('bell')}<div>Aici apar recordurile noi, reperele obiectivelor, realizările și mementourile. Fără spam.</div></div>`}`;
}
ACT.notifOpen=()=>{ SH={kind:'notif'}; shRender(); };
ACT.notifRead=async()=>{ await save('notif',(S.notif||[]).map(n=>Object.assign({},n,{r:true}))); shRender(); renderTop(); renderSide(); };
ACT.notifGo=async(el,{k})=>{ const n=(S.notif||[]).find(x=>x.id===k); if(!n) return;
  await save('notif',(S.notif||[]).map(x=>x.id===k?Object.assign({},x,{r:true}):x)); SH=null; shRender();
  const [t,s]=String(n.link||'').split('|');
  if(t==='goal'){ SH={kind:'goal1',id:s}; shRender(); renderTop(); return; }
  if(t==='fx'){ if(S.sess){ S.fxOpen=true; render(); } return; }
  if(t==='prog'){ S.tab='prog'; S.progTab=s||'ov'; } else if(t==='set'){ S.tab='set'; }
  render(); window.scrollTo({top:0}); };
