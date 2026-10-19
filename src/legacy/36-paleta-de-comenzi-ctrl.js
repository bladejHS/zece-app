/* =====================================================================
   v8 · PALETA DE COMENZI (Ctrl+K) — căutare globală instantă, comenzi, navigare și
   răspunsuri calculate local din datele tale („cel mai rapid km", „volumul săptămânii"…).
   Plus scurtături de tastatură și meniuri contextuale (clic dreapta / apăsare lungă).
   ===================================================================== */
const PAL={open:false,q:'',i:0,items:[]};
/* comenzile: [titlu, cuvinte-cheie, pictogramă, acțiune] */
function palCmds(){
  const nx=nextDay(), lastH=(S.hist||[]).length?S.hist.length-1:-1, runs=(S.runs||[]).map((r,i)=>Object.assign({i},r)).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.i-a.i);
  const go=(t,s)=>()=>{ S.tab=t; if(t==='prog'&&s) S.progTab=s; if(t==='plan'&&s) S.trTab=s; render(); window.scrollTo({top:0}); };
  const C=[
    nx&&!S.sess?['Începe antrenamentul de azi · '+PLAN[nx.d].t,'incepe start antrenament azi plan','play',()=>rdOpen(nx.w,nx.d)]:null,
    S.sess?['Continuă antrenamentul în desfășurare','continua sesiune live','play',()=>{ S.fxOpen=true; render(); }]:null,
    ['Notează o alergare','adauga alergare run km','run',()=>{ go('prog','r')(); requestAnimationFrame(()=>{ const c=$('#runForm'); if(c) c.scrollIntoView({block:'start'}); const i=$('#rKm'); if(i) i.focus(); }); }],
    ['Notează greutatea de azi','cantarire greutate kg corp','scale',()=>{ go('prog','b')(); requestAnimationFrame(()=>{ const i=$('#wIn'); if(i){ i.scrollIntoView({block:'center'}); i.focus(); } }); }],
    ['Check-in de dimineață','readiness somn energie febra','sun',()=>{ SH={kind:'ci'}; shRender(); }],
    ['Arată-mi recordurile (PR)','pr recorduri personal records cele mai bune','trophy',go('prog','pr')],
    lastH>=0?['Deschide ultimul antrenament · '+(S.hist[lastH].t||''),'ultimul antrenament sesiune deschide','history',()=>{ SH={kind:'hist',i:lastH}; shRender(); }]:null,
    runs.length?['Deschide ultima alergare · '+num(runs[0].km,1)+' km','ultima alergare deschide','run',()=>ACT.runOpen(null,{I:runs[0].i})]:null,
    runs.length>=2?['Compară ultimele două alergări','compara alergari a vs b ultimele doua','swap',()=>{ SH={kind:'rcmp',a:runs[1].i,b:runs[0].i,wide:1}; shRender(); }]:null,
    ['Adaugă un obiectiv','obiectiv tinta goal nou','target',()=>{ SH={kind:'goal',k:'k1'}; shRender(); }],
    ['Personalizează Acasă','dashboard widgeturi layout rearanjeaza','sliders',()=>ACT.dashEdit()],
    ['Notificări','notificari alerte','bell',()=>ACT.notifOpen()],
    [modeNow()==='light'?'Temă întunecată':'Temă luminoasă','tema dark light mod intunecat luminos','moon',()=>ACT.modeToggle()],
    ['Exportă datele (copie)','export backup copie salveaza json','download',()=>doExport(false)],
    ['Exportă în Excel','excel xlsx tabel export','table',()=>ioExport('xlsx')],
    ['Cronometru de intervale','timer cronometru emom amrap','clock',()=>{ TM.open=true; TM.list=true; TM.choose=null; TM.st=null; tmRender(); }],
    ['Pauză 90 de secunde','pauza rest odihna','moon',()=>tmOpen({title:'Pauză · 1:30',kind:'rest',ph:[{k:'rest',d:90,l:'Pauză',s:''}]})],
    ['Pacer 1 km','pacer pista 1km ritm tinta','stopwatch',()=>{ if(k1Goal()) ACT.k1Pace(); else go('prog','k1')(); }]
  ].filter(Boolean).map(([t,k,icn,f])=>({g:'Comenzi',t,k,icn,f}));
  TOOLS.forEach(([id,icn,t,d])=>C.push({g:'Unelte',t,k:'calculator unealta '+d,icn,f:()=>{ if(id==='tm') return TM.open=true,TM.list=true,TM.choose=null,TM.st=null,tmRender(); if(id==='food'){ FD.err=null; SH={kind:'food'}; return shRender(); } toolDefaults(id); SH={kind:'tool',k:id}; shRender(); },s:d}));
  [['azi','Acasă','home'],['plan','Antrenament · Plan Hybrid365','plan','plan'],['plan','Istoric antrenamente','history','hist'],
   ['prog','Performanță · Prezentare','grid','ov'],['prog','Forță','dumbbell','s'],['prog','Running Lab · Alergare','run','r'],['prog','1 KM Lab','stopwatch','k1'],['prog','Corp','ruler','b'],
   ['prog','Recuperare','moon','rec'],['prog','Recorduri și realizări','trophy','pr'],['prog','Profilul atletului','user','twin'],['prog','Teste fizice','medal','t'],
   ['nutri','Nutriție','flame'],['coach','Antrenor AI','coach'],['act','Activitate · cronologie','history'],['tools','Unelte','tool'],['set','Setări','gear']]
   .forEach(([t,l,icn,s])=>C.push({g:'Navigare',t:l,k:'mergi deschide pagina '+t,icn,f:go(t,s)}));
  if(typeof kbPalCmds==='function') kbPalCmds(C);
  return C;
}
/* scorul unei potriviri: toate cuvintele căutate trebuie să apară; titlul contează mai mult */
function palScore(q,t,k){ const a=fold(t), b=fold(k||''), w=q.split(/\s+/).filter(Boolean); let s=0;
  for(const x of w){ const i=a.indexOf(x); if(i===0) s+=6; else if(i>0) s+=a[i-1]===' '?4:2; else if(b.indexOf(x)>=0) s+=1; else return 0; } return s; }
function palSearch(raw){
  const q=fold(raw.trim()), out=[];
  if(!q){ return palCmds().filter(c=>c.g==='Comenzi').slice(0,9); }
  const ans=palAnswer(raw); if(ans) out.push(ans);
  palCmds().forEach(c=>{ const s=palScore(q,c.t,c.k); if(s) out.push(Object.assign({sc:s+(c.g==='Comenzi'?2:0)},c)); });
  exSearch(raw,{}).slice(0,6).forEach(e=>out.push({g:'Exerciții',t:e.n,s:[e.ro,e.g].filter(Boolean).join(' · '),icn:'dumbbell',sc:3,f:()=>ACT.exOpen(null,{k:e.n})}));
  const B=prBook(); Object.values(B.cur).forEach(p=>{ const n=prName(p), s=palScore(q,n,'record pr '+(PR_CAT[p.cat]||'')); if(s) out.push({g:'Recorduri',t:n,s:prVal(p)+(p.d?' · '+fmtDay(p.d):''),icn:'trophy',sc:s,f:()=>{ S.tab='prog'; S.progTab='pr'; render(); }}); });
  goalsAll().forEach(g=>{ const s=palScore(q,goalTitle(g),'obiectiv tinta'); if(s) out.push({g:'Obiective',t:goalTitle(g),s:'acum '+goalFmt(g,goalState(g).cur),icn:'target',sc:s,f:()=>ACT.goalOpen(null,{k:g.id})}); });
  (S.runs||[]).forEach((r,i)=>{ const t=num(r.km,2)+' km · '+(RUNK[r.kind]||'alergare')+' · '+fmtDayY(r.date), s=palScore(q,t,'alergare run '+(r.name||'')+' '+r.date); if(s) out.push({g:'Alergări',t,s:fmtClock((+r.min||0)*60)+' · '+fmtPace(paceOf(r)),icn:'run',sc:s,f:()=>ACT.runOpen(null,{I:i})}); });
  (S.hist||[]).forEach((h,i)=>{ const t=(h.t||'Antrenament')+' · '+fmtDayY(h.date), s=palScore(q,t,'antrenament sesiune '+h.date); if(s) out.push({g:'Antrenamente',t,s:Math.round((+h.dur||0)/60)+' min · '+(h.sets||0)+' serii',icn:'dumbbell',sc:s,f:()=>{ SH={kind:'hist',i}; shRender(); }}); });
  if(S.aiKey) out.push({g:'Antrenor AI',t:'Întreabă antrenorul: „'+raw.trim().slice(0,80)+'"',s:'răspunde din datele tale, cu Claude',icn:'coach',sc:.5,f:()=>aiSend(raw.trim())});
  const ord=['Răspuns','Comenzi','Navigare','Exerciții','Recorduri','Obiective','Alergări','Antrenamente','Unelte','Antrenor AI'];
  const grouped={}; out.sort((a,b)=>(b.sc||0)-(a.sc||0)).forEach(x=>{ (grouped[x.g]=grouped[x.g]||[]).push(x); });
  return ord.flatMap(g=>(grouped[g]||[]).slice(0,g==='Comenzi'||g==='Navigare'?6:5));
}
/* ---------- răspunsuri locale: doar cifre din datele tale ---------- */
const REG_RO={picioare:'jos',jos:'jos',sus:'sus',piept:'piept',spate:'spate',umeri:'umeri',brate:'brate',biceps:'brate',triceps:'brate'};
function palAnswer(raw){
  const q=fold(raw), tk=todayKey(), A=(t,html,o={})=>Object.assign({g:'Răspuns',t,ans:html,icn:'bulb',sc:99},o);
  /* „pace-ul pentru 4:00/km", „ritm 5:30" → calculatorul de ritm, direct */
  const tm=/(\d{1,2}:\d{2}(?::\d{2})?)/.exec(raw);
  if(tm&&/(pace|ritm|tempo|\/km)/.test(q)){ const p=parseTime(tm[1]); if(p&&p>=120&&p<=900){ return A('Ritm '+fmtClock(p)+' /km',
    `<div class="pa-g"><div><span>Viteză</span><b>${num(3600/p,1)} km/h</b></div><div><span>400 m</span><b>${fmtSecD(p*.4)}</b></div><div><span>1 km</span><b>${fmtClock(p)}</b></div><div><span>5 km</span><b>${fmtClock(p*5)}</b></div><div><span>10 km</span><b>${fmtClock(p*10)}</b></div><div><span>Semimaraton</span><b>${fmtClock(p*21.0975)}</b></div></div>`,
    {f:()=>{ TL.cm='t'; TL.cP=fmtClock(p); TL.cD='5'; SH={kind:'tool',k:'calc'}; shRender(); },cta:'Deschide calculatorul'}); } }
  if(/(cel mai rapid|cel mai bun|record).*(kilometru|\b1 ?km\b|\bkm\b)|\b1 ?km.*(record|cel mai)/.test(q)){ const b=k1Best(), pr=prBook().cur.pace;
    return A('Cel mai rapid kilometru',b?`<b>${fmtClock(b.sec)}</b> · ${esc(b.lbl)}, ${fmtDayY(b.date)}${pr?`<div class="xs mu" style="margin-top:4px">Cel mai rapid ritm mediu pe o alergare de cel puțin 1 km: ${mmss(pr.v)} /km (${fmtDayY(pr.d)}).</div>`:''}`
      :`Nu ai încă un 1 km măsurat (test, alergare de 1 km sau despărțiri pe km).${pr?' Cel mai rapid ritm mediu: <b>'+mmss(pr.v)+' /km</b>.':''}`,{f:()=>{ S.tab='prog'; S.progTab='k1'; render(); },cta:'1 KM Lab'}); }
  if(/volum|tonaj/.test(q)){ const m=mondayOf(tk), w=ixSum(m,tk), l7=ixSum(dayShift(tk,-6),tk), p7=ixSum(dayShift(tk,-13),dayShift(tk,-7)), mo=ixSum(dayShift(tk,-29),tk);
    return A('Volumul tău',`Săptămâna asta (de luni): <b>${num(w.vol/1000,2)} t</b> în ${w.sets} serii · ultimele 7 zile: <b>${num(l7.vol/1000,2)} t</b>${p7.vol?` (${chgHTML(pctCh(l7.vol,p7.vol))} față de cele 7 dinainte)`:''} · ultimele 30 de zile: <b>${num(mo.vol/1000,1)} t</b>.<div class="xs mu" style="margin-top:4px">Tonaj = kg × repetări, din toate seriile notate.</div>`,
      {f:()=>{ S.tab='prog'; S.progTab='s'; render(); },cta:'Forță'}); }
  if(/\b(recorduri|recordurile|pr|pr-urile|prurile)\b/.test(q)&&!/compara/.test(q)){ const ev=prBook().ev.filter(p=>p.cat!=='rep').slice(0,5);
    return A('Recordurile tale recente',ev.length?ev.map(p=>`<div class="pa-r"><span>${esc(prName(p))}</span><b>${prVal(p)}</b><span class="xs mu">${fmtDay(p.d)}</span></div>`).join(''):'Niciun record încă.',{f:()=>{ S.tab='prog'; S.progTab='pr'; render(); },cta:'Toate recordurile'}); }
  if(/(cum am progresat|progres|cum stau)/.test(q)){ const days=/saptaman/.test(q)?7:30, a=periodAgg(dayShift(tk,-days+1),tk), b=periodAgg(dayShift(tk,-2*days+1),dayShift(tk,-days)), ins=insightsAll().filter(x=>/^ex:|^down:|^wt$/.test(x.id)).slice(0,3);
    return A('Ultimele '+days+' de zile față de cele '+days+' dinainte',`<div class="pa-g"><div><span>Zile active</span><b>${a.days} ${chgHTML(pctCh(a.days,b.days))}</b></div><div><span>Tonaj</span><b>${num(a.vol/1000,1)} t ${chgHTML(pctCh(a.vol,b.vol))}</b></div><div><span>Alergare</span><b>${num(a.km,1)} km ${chgHTML(pctCh(a.km,b.km))}</b></div></div>
      ${ins.map(x=>`<div class="xs" style="margin-top:6px">${x.txt}</div>`).join('')}`,{f:()=>{ S.tab='prog'; S.progTab='ov'; S.rng=days===7?'w':'m'; render(); },cta:'Prezentare'}); }
  if(/(cele mai bune|cel mai bun|cele mai puternice).*exerciti/.test(q)){ const a1=dayShift(tk,-89), rows=Object.keys(S.lifts||{}).map(n=>{ const h=liftHist(n), now=Math.max(0,...h.filter(e=>e.d>=a1).map(e=>Math.max(0,...e.s.map(([w,r])=>e1rm(w,r))))), old=h.filter(e=>e.d<a1).length?Math.max(0,...h.filter(e=>e.d<a1).map(e=>Math.max(0,...e.s.map(([w,r])=>e1rm(w,r))))):null; return {n,now,c:old?pctCh(now,old):null}; }).filter(r=>r.now>0);
    const byC=rows.filter(r=>r.c!=null).sort((a,b)=>b.c-a.c).slice(0,3), byV=rows.sort((a,b)=>b.now-a.now).slice(0,3);
    return A('Cele mai bune exerciții',`${byC.length?'<div class="xs mu">Cel mai mare progres (1RM estimat, 90 de zile față de înainte):</div>'+byC.map(r=>`<div class="pa-r"><span>${esc(r.n)}</span><b>${chgHTML(r.c)}</b><span class="xs mu">${r.now} kg</span></div>`).join(''):''}
      <div class="xs mu" style="margin-top:6px">Cel mai mare 1RM estimat (90 de zile):</div>${byV.map(r=>`<div class="pa-r"><span>${esc(r.n)}</span><b>${r.now} kg</b></div>`).join('')}`,{f:()=>{ S.tab='prog'; S.progTab='s'; render(); },cta:'Forță'}); }
  const cm=/compara.*ultimele (\d+)?\s*antrenamente(?: de| pentru)? (\w+)/.exec(q)||/ultimele (\d+)?\s*antrenamente(?: de| pentru)? (\w+)/.exec(q);
  if(cm&&REG_RO[cm[2]]){ const n=clamp(+cm[1]||5,2,10), reg=REG_RO[cm[2]];
    const match=ex=>{ const m=EXM[ex]||{}; if(reg==='jos'||reg==='sus') return regionOf(ex)===reg; if(reg==='brate') return (m.biceps||0)>=1||(m.triceps||0)>=1; return (m[reg]||0)>=1; };
    const days=IX().days.filter(d=>Object.keys(IX().day[d].ex).some(match)).slice(-n).reverse();
    if(!days.length) return A('Ultimele antrenamente · '+cm[2],'Nu găsesc antrenamente cu exerciții pentru '+esc(cm[2])+'.');
    const rows=days.map(d=>{ let vol=0, sets=0; const exs=Object.keys(IX().day[d].ex).filter(match); exs.forEach(ex=>{ const e=liftHist(ex).find(x=>x.d===d); if(e) e.s.forEach(([w,r])=>{ vol+=w*r; sets++; }); }); return {d,vol,sets,exs}; });
    return A('Ultimele '+rows.length+' antrenamente · '+cm[2],rows.map((r,i)=>{ const nx=rows[i+1]; return `<div class="pa-r"><span>${fmtDay(r.d)}</span><b>${num(r.vol/1000,2)} t</b><span class="xs mu">${r.sets} serii${nx&&nx.vol?' · '+chgHTML(pctCh(r.vol,nx.vol)):''}</span></div>`; }).join('')
      +`<div class="xs mu" style="margin-top:6px">Doar exercițiile pentru ${esc(cm[2])}: ${esc([...new Set(rows.flatMap(r=>r.exs))].slice(0,5).join(', '))}. Schimbarea e față de antrenamentul anterior.</div>`); }
  if(/(cat|cati|câți).*(alerg|km)|kilometri/.test(q)){ const m=mondayOf(tk), w=ixSum(m,tk), mo=ixSum(dayShift(tk,-29),tk), y=ixSum(tk.slice(0,4)+'-01-01',tk);
    return A('Kilometri alergați',`Săptămâna asta: <b>${num(w.km,1)} km</b> (${w.runs} ${w.runs===1?'alergare':'alergări'}) · 30 de zile: <b>${num(mo.km,1)} km</b> · anul acesta: <b>${num(y.km,1)} km</b>.`,{f:()=>{ S.tab='prog'; S.progTab='r'; render(); },cta:'Running Lab'}); }
  if(/(cate|câte|cati).*(antrenamente|sesiuni|zile)/.test(q)){ const a=ixSum(dayShift(tk,-6),tk), b=ixSum(dayShift(tk,-29),tk);
    return A('Antrenamente',`Ultimele 7 zile: <b>${a.days}</b> zile active (${a.lift} cu forță, ${a.run} cu alergare) · ultimele 30 de zile: <b>${b.days}</b>.`); }
  if(/greutat|cantar|kilograme/.test(q)&&!/ridicat/.test(q)){ const ws=wStats(); return A('Greutatea',ws?`Media pe 7 zile: <b>${num(ws.a7,1)} kg</b>${ws.wk!=null?' · '+(ws.wk>0?'+':'')+num(ws.wk,2)+' kg față de săptămâna dinainte':''} · ultima cântărire ${num(ws.last.w,1)} kg (${relDay(ws.last.d)}).`:'Nicio cântărire notată.',{f:()=>{ S.tab='prog'; S.progTab='b'; render(); },cta:'Corp'}); }
  return null;
}
/* ---------- interfața paletei ---------- */
function palOpen(q){ PAL.open=true; PAL.q=q||''; PAL.i=0; palRender(true); }
function palClose(){ PAL.open=false; const r=$('#palRoot'); if(r) r.innerHTML=''; updLock(); }
function palRender(first){
  const r=$('#palRoot'); if(!PAL.open){ r.innerHTML=''; return; }
  PAL.items=palSearch(PAL.q); PAL.i=clamp(PAL.i,0,Math.max(0,PAL.items.length-1));
  let g='', idx=0; const list=PAL.items.map(x=>{ const h=x.g!==g?`<div class="pal-g">${esc(x.g)}</div>`:''; g=x.g; const i=idx++;
    if(x.ans) return h+`<button class="pal-a ${i===PAL.i?'on':''}" data-pi="${i}"><div class="pal-at">${ic('bulb')} ${esc(x.t)}</div><div class="pal-ab">${x.ans}</div>${x.cta?`<span class="pal-cta">${esc(x.cta)} ${ic('right')}</span>`:''}</button>`;
    return h+`<button class="pal-i ${i===PAL.i?'on':''}" data-pi="${i}">${ic(x.icn||'right')}<span class="sp"><b>${esc(x.t)}</b>${x.s?`<span>${esc(x.s)}</span>`:''}</span>${i===PAL.i?'<kbd>Enter</kbd>':''}</button>`; }).join('');
  const html=`<div class="pal-l" id="palL">${list||`<div class="empty sm">Nimic găsit pentru „${esc(PAL.q)}".${S.aiKey?'':' Cu o cheie AI în Setări, poți întreba antrenorul orice.'}</div>`}</div>
    <div class="pal-f"><span><kbd>↑</kbd><kbd>↓</kbd> alegi</span><span><kbd>Enter</kbd> deschizi</span><span><kbd>Esc</kbd> închizi</span></div>`;
  if(first||!r.querySelector('.pal')){ r.innerHTML=`<div class="pal-ov" data-pal="x"><div class="pal" role="dialog" aria-label="Căutare și comenzi"><div class="pal-in">${ic('search')}<input id="palQ" placeholder="Caută sau scrie o comandă: „pace 4:00", „PR-urile", „volumul săptămânii"…" autocomplete="off" value="${esc(PAL.q)}"><button class="xb nh" data-pal="x" aria-label="Închide">${ic('x')}</button></div><div id="palB">${html}</div></div></div>`;
    document.body.classList.add('lock'); const i=$('#palQ'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } }
  else $('#palB').innerHTML=html;
  const on=r.querySelector('.pal-i.on,.pal-a.on'); if(on) on.scrollIntoView({block:'nearest'});
}
async function palRun(i){ const x=PAL.items[i]; if(!x) return; palClose(); try{ await x.f(); }catch(e){ errLog(e&&e.message,'palette'); } }
ACT.palOpen=()=>palOpen('');
document.addEventListener('click',e=>{ const t=e.target; if(!t.closest) return;
  if(t.closest('[data-pal="x"]')&&(t.matches('.pal-ov')||t.closest('button[data-pal="x"]'))){ palClose(); return; }
  const it=t.closest('[data-pi]'); if(it&&PAL.open){ e.stopPropagation(); palRun(+it.dataset.pi); } },true);
document.addEventListener('input',e=>{ if(e.target.id==='palQ'){ PAL.q=e.target.value; PAL.i=0; palRender(false); } });
/* v16: fără scurtături de tastatură; rămân doar tastele din paleta deschisă și Enter în câmpurile de kg și repetări */
const typing=t=>t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
document.addEventListener('keydown',e=>{
  const k=e.key;
  if(PAL.open){ if(k==='Escape'){ e.preventDefault(); palClose(); }
    else if(k==='ArrowDown'){ e.preventDefault(); PAL.i=Math.min(PAL.items.length-1,PAL.i+1); palRender(false); }
    else if(k==='ArrowUp'){ e.preventDefault(); PAL.i=Math.max(0,PAL.i-1); palRender(false); }
    else if(k==='Enter'){ e.preventDefault(); palRun(PAL.i); } return; }
  if(typing(e.target)&&k==='Enter'&&(e.target.id==='inKg'||e.target.id==='inRp')&&S.sess){ e.preventDefault(); logSet($('[data-a="logSet"]')); }
});

/* ---------- meniuri contextuale: clic dreapta pe desktop, apăsare lungă pe telefon ---------- */
const CTX={
  run:i=>{ const r=(S.runs||[])[i]; if(!r) return []; const last=(S.runs||[]).map((x,j)=>Object.assign({j},x)).filter(x=>x.j!==i).sort((a,b)=>a.date<b.date?1:-1)[0];
    return [['Deschide','right',()=>ACT.runOpen(null,{I:i})],last?['Compară cu cea mai recentă','swap',()=>{ SH={kind:'rcmp',a:i,b:last.j,wide:1}; shRender(); }]:null,
      ['Șterge alergarea','trash',async()=>{ const old=r; if(r.sid) await stPatch({del:(stCfg().del||[]).concat([String(r.sid)]).slice(-500)}); await save('runs',(S.runs||[]).filter((_,j)=>j!==i)); render();
        toast('Alergare ștearsă',num(old.km,2)+' km · '+fmtDay(old.date),null,{l:'Anulează',f:async()=>{ const L=(S.runs||[]).slice(); L.splice(i,0,old); await save('runs',L); render(); }}); },'bad']].filter(Boolean); },
  hist:i=>[['Deschide','right',()=>{ SH={kind:'hist',i}; shRender(); }]]
};
function ctxOpen(spec,x,y){ const ci=spec.indexOf(':'), k=spec.slice(0,ci), v=spec.slice(ci+1), items=CTX[k]?CTX[k](k==='ex'?v:+v):[]; if(!items.length) return;
  const r=$('#menuRoot'); r.innerHTML=`<div class="ctx-ov" data-ctxx="1"></div><div class="ctx" role="menu" style="left:${Math.min(x,innerWidth-230)}px;top:${Math.min(y,innerHeight-items.length*44-20)}px">${items.map((it,i)=>`<button role="menuitem" class="ctx-i ${it[3]||''}" data-ci="${i}">${ic(it[1])}<span>${esc(it[0])}</span></button>`).join('')}</div>`;
  CTX.cur=items; buzz(10); }
const ctxClose=()=>{ const r=$('#menuRoot'); if(r) r.innerHTML=''; CTX.cur=null; };
document.addEventListener('contextmenu',e=>{ const el=e.target.closest&&e.target.closest('[data-ctx]'); if(!el) return; e.preventDefault(); ctxOpen(el.dataset.ctx,e.clientX,e.clientY); });
document.addEventListener('click',e=>{ if(!CTX.cur) return; const b=e.target.closest&&e.target.closest('[data-ci]'); e.stopPropagation(); e.preventDefault(); const it=b?CTX.cur[+b.dataset.ci]:null; ctxClose(); if(it) it[2](); },true);
let LP=null;
document.addEventListener('touchstart',e=>{ const el=e.target.closest&&e.target.closest('[data-ctx]'); if(!el||e.touches.length!==1) return; const t=e.touches[0];
  LP={x:t.clientX,y:t.clientY,tm:setTimeout(()=>{ LP.fired=true; ctxOpen(el.dataset.ctx,t.clientX,t.clientY); },520)}; },{passive:true});
document.addEventListener('touchmove',e=>{ if(LP&&!LP.fired){ const t=e.touches[0]; if(Math.abs(t.clientX-LP.x)>10||Math.abs(t.clientY-LP.y)>10){ clearTimeout(LP.tm); LP=null; } } },{passive:true});
document.addEventListener('touchend',e=>{ if(LP){ clearTimeout(LP.tm); if(LP.fired) e.preventDefault(); LP=null; } });
