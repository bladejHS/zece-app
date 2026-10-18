/* =====================================================================
   v8 · RUNNING LAB — analiza alergărilor: perioadă, ritm, viteză, puls, despărțiri, ture,
   consecvență, cel mai rapid segment și comparația a două alergări (A vs B).
   Ce nu există în date (cadență, elevație, despărțiri) e marcat ca lipsă, nu ghicit.
   ===================================================================== */
const RUN_KINDS=['ez','thr','lng','int','tmp'];
function runLab(){
  const R=rangeOf(S.rng||'m'), Pv=prevRange(R), B=bucketsOf(R), inR=r=>r.date>=R.a&&r.date<=R.b;
  const all=(S.runs||[]).map((r,i)=>Object.assign({i},r)), rs=all.filter(inR).sort((a,b)=>a.date<b.date?-1:1), ps=Pv?all.filter(r=>r.date>=Pv.a&&r.date<=Pv.b):[];
  const km=sumKm(rs), mn=rs.reduce((a,r)=>a+(+r.min||0),0), pkm=sumKm(ps), pmn=ps.reduce((a,r)=>a+(+r.min||0),0);
  const pace=km>0&&mn>0?mn/km:null, ppace=pkm>0&&pmn>0?pmn/pkm:null, hrR=rs.filter(r=>+r.hr>0), long=rs.reduce((a,r)=>!a||+r.km>+a.km?r:a,null);
  const best=rs.filter(r=>+r.km>=1&&paceOf(r)).reduce((a,r)=>!a||paceOf(r)<paceOf(a)?r:a,null);
  const c=(x,y)=>Pv&&y>0?pctCh(x,y):null;
  const kmB=B.list.map(b=>({lbl:b.lbl,tip:b.tip,v:Math.round(sumKm(all.filter(r=>r.date>=b.a&&r.date<=b.b))*10)/10,hi:true}));
  const pp=rs.filter(r=>+r.km>=1&&paceOf(r));
  const byK=RUN_KINDS.map(k=>({k,n:rs.filter(r=>r.kind===k).length,km:sumKm(rs.filter(r=>r.kind===k))})).filter(x=>x.n), mk=Math.max(1,...byK.map(x=>x.km));
  const Z=hrZones(), zc=[0,0,0,0,0]; hrR.forEach(r=>{ const z=hrZone(+r.hr); if(z>=0) zc[z]++; }); const zm=Math.max(1,...zc);
  /* consecvența ritmului la alergările ușoare: abaterea standard în secunde/km */
  const ez=pp.filter(r=>r.kind==='ez'||r.kind==='lng'), ezsd=ez.length>=3?Math.sqrt(avgOf(ez.map(r=>Math.pow(paceOf(r)*60-avgOf(ez.map(q=>paceOf(q)*60)),2)))):null;
  return `${rangeBar()}
    <div class="card wide"><div class="kpis c4">${kv('Distanță',num(km,1),'km',c(km,pkm))}${kv('Timp',mn?fmtClock(mn*60):'0:00','',c(mn,pmn))}
      ${kv('Alergări',rs.length,'',c(rs.length,ps.length))}${kv('Ritm mediu',pace?mmss(pace):'—',pace?'/km':'',pace&&ppace?pctCh(pace,ppace):null,{low:true})}
      ${kv('Viteză medie',pace?num(60/pace,1):'—',pace?'km/h':'',null,{s:'distanță / timp'})}${kv('Cea mai lungă',long?num(long.km,1):'—',long?'km':'',null,{s:long?fmtDay(long.date):'&nbsp;',a:long?`data-a="runOpen" data-i="${long.i}"`:''})}
      ${kv('Cel mai bun ritm',best?mmss(paceOf(best)):'—',best?'/km':'',null,{s:best?num(best.km,1)+' km · '+fmtDay(best.date):'alergări ≥ 1 km',a:best?`data-a="runOpen" data-i="${best.i}"`:''})}
      ${kv('Puls mediu',hrR.length?Math.round(avgOf(hrR.map(r=>+r.hr))):'—',hrR.length?'bpm':'',null,{s:hrR.length?hrR.length+' din '+rs.length+' alergări au puls':'nicio alergare cu puls'})}</div></div>
    ${rs.length?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('run')} Kilometri ${B.kind==='day'?'pe zi':B.kind==='week'?'pe săptămână':'pe lună'}</div></div>
      ${barChart(kmB,{dec:1,unit:'km',label:'kilometri'})}${chStats(kmB.map(x=>x.v),{fmt:v=>num(v,1)+' km',cur:km,prev:pkm>0?pkm:null})}</div>
    ${pp.length>=2?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('gauge')} Ritmul fiecărei alergări</div><span class="xs mu">sus = mai rapid</span></div>
      ${lineChart({pts:pp.map(r=>({x:r.date,y:paceOf(r),note:(RUNK[r.kind]||'')+' · '+num(r.km,1)+' km'})),inv:true,dots:true,trend:pp.length>=4,noArea:true,hex:COL().run,blue:true,fmt:v=>mmss(v)+' /km',fmtAx:v=>mmss(v),label:'ritmul alergărilor',minR:.3})}
      ${chStats(pp.map(r=>paceOf(r)),{fmt:v=>mmss(v)+' /km',lowGood:true})}
      ${ezsd!=null?`<div class="note">Alergările ușoare și lungi au o variație a ritmului de <b>±${Math.round(ezsd)} s/km</b>${ezsd<=15?': foarte constant.':ezsd<=30?'.':': ritmul la easy variază mult; verifică pulsul, nu ceasul.'}</div>`:''}</div>`:''}
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('layers')} Tipuri de alergare</div></div>
      <div class="dist">${byK.map(x=>`<div class="dist-r"><span>${esc(RUNK[x.k])}</span><div class="b run"><i style="width:${(x.km/mk*100).toFixed(1)}%"></i></div><span>${num(x.km,1)} km</span></div>`).join('')}</div>
      <div class="xs mu2" style="margin-top:8px">${byK.map(x=>x.n+' × '+RUNK[x.k].toLowerCase()).join(' · ')}</div></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('heart')} Alergări după zona pulsului mediu</div></div>
      ${hrR.length?`<div class="dist">${Z.z.map((z,i)=>`<div class="dist-r"><span style="color:${HRZC()[i]}">Z${z.n} · ${z.lo}–${z.hi}</span><div class="b"><i style="width:${(zc[i]/zm*100).toFixed(1)}%;background:${HRZC()[i]}"></i></div><span>${zc[i]}</span></div>`).join('')}</div>
        <div class="note">Fiecare alergare intră în zona pulsului ei <b>mediu</b>; nu e timpul petrecut în fiecare zonă (acela apare doar la sesiunile cu senzorul conectat).</div>`
        :`<div class="empty sm">Nicio alergare cu puls în perioadă. Pulsul vine din Strava (cu ceasul) sau îl scrii când notezi alergarea.</div>`}</div>`
    :`<div class="card"><div class="empty">${ic('run')}<div>Nicio alergare în ${esc(R.lbl)}.</div></div></div>`}
    ${runListCard(rs.slice().reverse())}
    ${aeroCard()}${zonesCard()}${shoesCard()}${runFormCard()}`;
}
/* lista alergărilor din perioadă: atingi una pentru detalii, bifezi două pentru comparație */
function runListCard(rs){
  const sel=S.rSel||[];
  return `<div class="card" id="runList"><div class="card-h"><div class="eyebrow">${ic('list')} Alergări · ${rs.length}</div>
      ${sel.length===2?`<button class="btn pri xs" data-a="runCmp">${ic('swap')} Compară A vs B</button>`:`<span class="xs mu2">bifează două ca să le compari</span>`}</div>
    ${rs.length?rs.slice(0,S.rAll?500:15).map(r=>`<div class="list-row rl" data-ctx="run:${r.i}"><button class="tick ${sel.indexOf(r.i)>=0?'on':''}" data-a="runSel" data-i="${r.i}" aria-label="Selectează pentru comparație">${sel.indexOf(r.i)>=0?`<b style="font:700 12px var(--fb)">${sel.indexOf(r.i)?'B':'A'}</b>`:ic('check')}</button>
      <button class="tag run rl-k" data-a="runKind2" data-i="${r.i}" title="Schimbă tipul alergării">${esc(RUNK[r.kind]||r.kind||'—')}</button>
      <button class="sp rl-b" data-a="runOpen" data-i="${r.i}"><b>${num(r.km,2)} km</b><span class="xs mu">${fmtDayY(r.date)} · ${fmtClock((+r.min||0)*60)}${r.hr?' · '+r.hr+' bpm':''}${r.sid?' · Strava':''}${runSplits(r).length?' · despărțiri':''}</span></button>
      <span class="v">${fmtPace(paceOf(r))}</span></div>`).join('')+(rs.length>15&&!S.rAll?`<button class="btn ghost sm wide" style="margin-top:8px" data-a="rAll">Toate cele ${rs.length}</button>`:'')
      :`<div class="empty sm">Nicio alergare.</div>`}</div>`;
}
ACT.rAll=()=>{ S.rAll=true; render(); };
ACT.runSel=(el,{I})=>{ const s=(S.rSel||[]).slice(), j=s.indexOf(I); if(j>=0) s.splice(j,1); else { s.push(I); if(s.length>2) s.shift(); } S.rSel=s; render(); };
ACT.runCmp=()=>{ const s=S.rSel||[]; if(s.length===2){ SH={kind:'rcmp',a:s[0],b:s[1],wide:1}; shRender(); } };
function zonesCard(){ const z=hrZones(), pz=paceZones(), rp=racePred(), ZC=HRZC();
  return `<div class="card" id="zonesCard"><div class="eyebrow">${ic('target')} Zonele tale de puls</div>
      <div class="zones">${z.z.map((x,i)=>`<div class="zn ${i===1?'hl':''}"><b style="color:${ZC[i]}">Z${x.n}</b><span>${x.l}</span><span class="v">${x.lo}–${x.hi} bpm</span></div>`).join('')}</div>
      <div class="note">Puls maxim ${+prof().hrMax>0?'măsurat':'estimat'} <b>${z.max} bpm</b>${+prof().hrMax>0?'':' (formula Tanaka)'}${z.rest?', cu pulsul în repaus '+z.rest+' (metoda Karvonen)':'. Adaugă pulsul în repaus în Setări pentru zone mai precise'}. Easy run și long run se fac în <b>zona 2</b>.</div>
      ${pz?`<div class="eyebrow" style="margin-top:16px">${ic('run')} Ritmurile tale</div><div class="zones">${pz.z.map(([l,v],i)=>`<div class="zn ${i===0?'hl':''}"><b style="color:${[COL().run,COL().warn,TH().ac][i]}">${['E','P','I'][i]}</b><span>${l}</span><span class="v">${v} /km</span></div>`).join('')}</div>
        <div class="note">Calculate din ritmul de prag de ${mmss(pz.thr)} /km (${pz.src}).</div>`
      :`<div class="note">Notează o alergare de prag sau setează ritmul de prag în Setări ca să-ți calculez ritmurile pe zone.</div>`}</div>
    ${rp?`<div class="card"><div class="eyebrow">${ic('flame')} Predicție de cursă · estimare</div>
      <div class="kpis c2">${rp.list.map(x=>`<div class="kpi"><div class="k">${x.l}</div><div class="v">${fmtClock(x.s)}</div></div>`).join('')}</div>
      <div class="note">Estimare, nu rezultat: din cea mai rapidă alergare recentă (${num(rp.b.km,2)} km în ${num(rp.b.min)} min, ${relDay(rp.b.date)}), cu formula Riegel. Alergările ușoare dau predicții prea lente; un 5 km la efort maxim face estimarea precisă.</div></div>`:''}`; }
function runFormCard(){ const tk=todayKey();
  return `<div class="card" id="runForm"><div class="eyebrow">${ic('plus')} Notează o alergare</div>
    <div class="chips" style="margin-top:12px">${RUN_KINDS.map(k=>`<button class="chip ${S.runKind===k?'on':''}" data-a="runKind" data-k="${k}">${RUNK[k]}</button>`).join('')}</div>
    <div class="form"><div class="fld"><label for="rKm">Distanță (km)</label><input class="inp" id="rKm" type="number" step="0.01" inputmode="decimal" placeholder="5.0"></div>
      <div class="fld"><label for="rMin">Timp (minute sau h:mm:ss)</label><input class="inp" id="rMin" inputmode="decimal" placeholder="ex: 27:30"></div>
      <div class="fld"><label for="rDate">Data</label><input class="inp" id="rDate" type="date" value="${tk}" max="${tk}"></div>
      <div class="fld"><label for="rRpe">Efort 1–10 (opțional)</label><input class="inp" id="rRpe" type="number" min="1" max="10" inputmode="numeric" placeholder="4"></div>
      <div class="fld"><label for="rHr">Puls mediu (opțional)</label><input class="inp" id="rHr" type="number" inputmode="numeric" placeholder="ex: 138"></div>
      <div class="fld"><label for="rSpl">Timpi pe km (opțional)</label><input class="inp" id="rSpl" inputmode="text" placeholder="ex: 5:10 5:02 4:58"></div></div>
    <button class="btn blue wide" style="margin-top:12px" data-a="runAdd">${ic('check')} Salvează alergarea</button></div>`; }
/* timpul alergării: minute (27.5) sau min:sec (27:30) sau h:mm:ss */
const parseMin=s=>{ s=String(s||'').trim().replace(',','.'); if(!s) return 0; if(s.indexOf(':')>=0){ const t=parseTime(s); return t?t/60:0; } const v=parseFloat(s); return v>0?v:0; };
/* timpii pe km, scriși de mână: „5:10 5:02, 4:58" → despărțiri de 1000 m (ultima poate fi parțială) */
function parseSplits(txt,km){ const ts=String(txt||'').split(/[\s,;]+/).map(parseTime).filter(t=>t&&t>60&&t<1800); if(!ts.length) return null;
  const full=Math.floor(km+1e-9), rest=Math.round((km-full)*1000); return ts.map((t,i)=>({d:i<full?1000:rest>=100?rest:1000,t})); }

/* ---------- detaliul unei alergări ---------- */
const RUN_MISS=r=>[[!(+r.hr>0),'puls'],[!(+r.cad>0),'cadență'],[r.elev==null,'elevație'],[!runSplits(r).length,'despărțiri pe km']].filter(x=>x[0]).map(x=>x[1]);
function runHTML(){
  const r=(S.runs||[])[SH.i]; if(!r) return `<div class="empty">Alergarea nu mai există.</div>`;
  const sp=runSplits(r), pace=paceOf(r), fk=fastestKm(r), miss=RUN_MISS(r);
  const kps=[['Distanță',num(r.km,2),'km'],['Timp',fmtClock((+r.min||0)*60),''],['Ritm',pace?mmss(pace):'—',pace?'/km':''],['Viteză',kmh(r)?num(kmh(r),1):'—',kmh(r)?'km/h':''],
    ['Puls mediu',r.hr||'—',r.hr?'bpm':''],['Puls maxim',r.hrMax||'—',r.hrMax?'bpm':''],['Cadență',r.cad||'—',r.cad?'pași/min':''],['Elevație',r.elev!=null?Math.round(r.elev):'—',r.elev!=null?'m':'']];
  const sec=sp.map(s=>s.t*1000/s.d), mn=sec.length?Math.min(...sec):0, mx=sec.length?Math.max(...sec):0, mean=sec.length?avgOf(sec):0, sd=sec.length>=3?Math.sqrt(avgOf(sec.map(x=>(x-mean)*(x-mean)))):null;
  const half=Math.floor(sec.length/2), neg=sec.length>=4?avgOf(sec.slice(half))<avgOf(sec.slice(0,half)):null;
  let cum=0;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('run')} ${fmtDayY(r.date)} · <span class="src ${r.sid?'ms':''}">${RUN_SRC(r)}</span></div>
    <div class="h2" style="margin-top:6px">${esc(r.name||RUNK[r.kind]||'Alergare')} · ${num(r.km,2)} km</div>
    <div class="chips" style="margin-top:10px">${RUN_KINDS.map(k=>`<button class="chip ${r.kind===k?'on':''}" data-a="runKindSet" data-k="${k}" data-i="${SH.i}">${RUNK[k]}</button>`).join('')}</div>
    <div class="kpis c4">${kps.map(([k,v,u])=>`<div class="kpi"><div class="k">${k}</div><div class="v" style="font-size:20px">${v}${u?`<small>${u}</small>`:''}</div></div>`).join('')}</div>
    ${r.rpe?`<div class="list-row"><span class="sp">Efort</span><span class="v">${r.rpe}/10</span></div>`:''}
    ${sp.length?`<div class="dsec"><h4>Despărțiri</h4>
      <div class="spl">${sp.map((s,i)=>{ cum+=s.t; const t=sec[i], f=mx>mn?(t-mn)/(mx-mn):0; return `<div class="spl-r ${fk&&fk.i===i?'best':''}"><span class="n">${s.d===1000?'km '+(i+1):num(s.d/1000,2)+' km'}</span>
        <span class="b"><i style="width:${(100-f*55).toFixed(1)}%"></i></span><span class="t">${mmss(t/60)}</span><span class="c">${fmtClock(cum)}</span>${s.hr?`<span class="h">${Math.round(s.hr)}</span>`:'<span class="h"></span>'}</div>`; }).join('')}</div>
      ${sp.length>=2?lineChart({pts:sp.map((s,i)=>({x:i+1,y:sec[i]/60})),num:true,xfmt:x=>'km '+x,inv:true,dots:true,noArea:true,hex:COL().run,blue:true,fmt:v=>mmss(v)+' /km',fmtAx:v=>mmss(v),label:'ritm pe km',minR:.2,h:140}):''}
      <div class="kpis c4"><div class="kpi"><div class="k">Cel mai rapid km</div><div class="v" style="font-size:20px">${fk?fmtClock(fk.t):'—'}</div></div><div class="kpi"><div class="k">Cel mai lent</div><div class="v" style="font-size:20px">${mx?mmss(mx/60):'—'}</div></div>
        <div class="kpi"><div class="k">Constanță</div><div class="v" style="font-size:20px">${sd!=null?'±'+Math.round(sd)+'<small>s/km</small>':'—'}</div></div><div class="kpi"><div class="k">A doua jumătate</div><div class="v" style="font-size:20px">${neg==null?'—':neg?'mai rapidă':'mai lentă'}</div></div></div></div>`:''}
    ${Array.isArray(r.laps)&&r.laps.length>1?`<div class="dsec"><h4>Ture (laps) · ${r.laps.length}</h4>${r.laps.map((l,i)=>`<div class="list-row"><span class="sp">${esc(l.n||'Tura '+(i+1))} <span class="xs mu">${num(l.d/1000,2)} km</span></span><span class="xs mu">${l.hr?Math.round(l.hr)+' bpm':''}</span><span class="v">${fmtClock(l.t)} · ${l.d>0?mmss(l.t/60/(l.d/1000)):'—'}</span></div>`).join('')}</div>`:''}
    ${r.be&&Object.keys(r.be).length?`<div class="dsec"><h4>Cele mai bune eforturi (Strava)</h4>${PR_DIST.filter(([,,k])=>r.be[k]).map(([,l,k])=>`<div class="list-row"><span class="sp">${l}</span><span class="v">${fmtClock(r.be[k])}</span></div>`).join('')}</div>`:''}
    ${miss.length?`<div class="note"><b>Lipsesc:</b> ${miss.join(', ')}. ${r.sid&&!r.det?'Le pot aduce din Strava, dacă ceasul le-a înregistrat.':!r.sid&&miss.indexOf('despărțiri pe km')>=0?'Poți scrie timpii pe km mai jos.':''}</div>`:''}
    <div class="inrow" style="flex-wrap:wrap">
      ${r.sid&&!r.det&&stOn()?`<button class="btn" data-a="runDetails" data-i="${SH.i}">${ic('download')} Încarcă detaliile din Strava</button>`:''}
      ${!sp.length&&!r.sid?`<button class="btn ghost" data-a="runSplEd" data-i="${SH.i}">${ic('edit')} Timpii pe km</button>`:''}
      <button class="btn ghost" data-a="runCmpPick" data-i="${SH.i}">${ic('swap')} Compară cu…</button>
      <button class="btn ghost danger" data-a="runDel" data-i="${SH.i}" data-confirm="Sigur? Apasă iar">${ic('trash')} Șterge</button></div>
    ${SH.ed?`<div class="form"><div class="fld full"><label for="rSplE">Timpii pe km (min:sec, separați prin spațiu)</label><input class="inp" id="rSplE" inputmode="text" placeholder="5:10 5:02 4:58"></div></div>
      <button class="btn pri wide" style="margin-top:10px" data-a="runSplSave" data-i="${SH.i}">${ic('check')} Salvează despărțirile</button>`:''}
    ${SH.pick?`<div class="dsec"><h4>Alege alergarea B</h4>${(S.runs||[]).map((x,j)=>Object.assign({j},x)).filter(x=>x.j!==SH.i).sort((a,b)=>a.date<b.date?1:-1).slice(0,30)
        .map(x=>`<button class="list-row link" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;text-align:left;cursor:pointer" data-a="runCmpGo" data-i="${x.j}"><span class="sp"><b>${num(x.km,2)} km</b> <span class="xs mu">${fmtDayY(x.date)} · ${esc(RUNK[x.kind]||'')}</span></span><span class="v">${fmtPace(paceOf(x))}</span></button>`).join('')}</div>`:''}`;
}
ACT.runOpen=(el,{I})=>{ if(!(S.runs||[])[I]) return; SH={kind:'run',i:I,wide:1}; shRender(); };
ACT.runKindSet=async(el,{k,I})=>{ const rs=(S.runs||[]).slice(); if(!rs[I]) return; rs[I]=Object.assign({},rs[I],{kind:k}); await save('runs',rs); shRender(); render(); };
ACT.runSplEd=()=>{ if(SH){ SH.ed=!SH.ed; shRender(); } };
ACT.runSplSave=async(el,{I})=>{ const rs=(S.runs||[]).slice(), r=rs[I]; if(!r) return; const sp=parseSplits(($('#rSplE')||{}).value,+r.km); if(!sp){ shake('#rSplE'); return; }
  const tot=sp.reduce((a,s)=>a+s.t,0); rs[I]=Object.assign({},r,{spl:sp}); await save('runs',rs); SH.ed=false; shRender(); render();
  toast('Despărțiri salvate',sp.length+' segmente · '+fmtClock(tot)+(Math.abs(tot-r.min*60)>30?' (totalul diferă de timpul alergării)':''),'info'); };
ACT.runCmpPick=()=>{ if(SH){ SH.pick=!SH.pick; shRender(); } };
ACT.runCmpGo=(el,{I})=>{ const a=SH&&SH.i; SH={kind:'rcmp',a,b:I,wide:1}; shRender(); };
/* detaliile din Strava: despărțiri pe km, ture, cele mai bune eforturi, cadență, elevație */
ACT.runDetails=async(el,{I})=>{ const r=(S.runs||[])[I]; if(!r||!r.sid) return; el.disabled=true; el.innerHTML=ic('refresh')+' Se încarcă…';
  try{ const a=await stApi('GET','/activities/'+encodeURIComponent(r.sid)+'?include_all_efforts=false'), o={det:true};
    if(Array.isArray(a.splits_metric)) o.spl=a.splits_metric.filter(s=>+s.distance>50).map(s=>{ const x={d:Math.round(+s.distance),t:+s.moving_time||+s.elapsed_time}; if(+s.average_heartrate>0) x.hr=Math.round(+s.average_heartrate); return x; });
    if(Array.isArray(a.laps)&&a.laps.length>1) o.laps=a.laps.map(l=>{ const x={n:String(l.name||'').slice(0,30),d:Math.round(+l.distance||0),t:+l.moving_time||+l.elapsed_time||0}; if(+l.average_heartrate>0) x.hr=Math.round(+l.average_heartrate); return x; });
    if(Array.isArray(a.best_efforts)){ const m={'1K':'1k','5K':'5k','10K':'10k','Half-Marathon':'hm','Marathon':'m'}, be={}; a.best_efforts.forEach(b=>{ const k=m[b.name]; if(k&&+b.elapsed_time>0) be[k]=+b.elapsed_time; }); if(Object.keys(be).length) o.be=be; }
    if(+a.average_cadence>0) o.cad=Math.round(+a.average_cadence*2); if(a.total_elevation_gain!=null) o.elev=+a.total_elevation_gain; if(+a.max_heartrate>0) o.hrMax=Math.round(+a.max_heartrate); if(+a.max_speed>0) o.maxSpd=+a.max_speed;
    const rs=(S.runs||[]).slice(), j=rs.findIndex(x=>String(x.sid)===String(r.sid)); if(j<0) return; rs[j]=Object.assign({},rs[j],o); await save('runs',rs); shRender(); render();
    toast('Detalii încărcate',[o.spl?o.spl.length+' despărțiri':'',o.laps?o.laps.length+' ture':'',o.be?'cele mai bune eforturi':''].filter(Boolean).join(' · ')||'Strava nu are detalii în plus pentru această alergare.','info');
  }catch(e){ toast('Nu am putut încărca detaliile',stErrText(e),'info'); shRender(); } };

/* ---------- A vs B ---------- */
function rcmpHTML(){
  const A=(S.runs||[])[SH.a], B=(S.runs||[])[SH.b]; if(!A||!B) return `<div class="empty">Una dintre alergări nu mai există.</div>`;
  const pA=paceOf(A), pB=paceOf(B), rows=[
    ['Data',fmtDayY(A.date),fmtDayY(B.date),null],['Tip',RUNK[A.kind]||'—',RUNK[B.kind]||'—',null],
    ['Distanță',num(A.km,2)+' km',num(B.km,2)+' km',[+A.km,+B.km,'km',2,false]],['Timp',fmtClock(A.min*60),fmtClock(B.min*60),[A.min*60,B.min*60,'t',0,true]],
    ['Ritm',fmtPace(pA),fmtPace(pB),pA&&pB?[pA*60,pB*60,'p',0,true]:null],['Viteză',fmtKmh(kmh(A)),fmtKmh(kmh(B)),kmh(A)&&kmh(B)?[kmh(A),kmh(B),'km/h',1,false]:null],
    ['Puls mediu',A.hr?A.hr+' bpm':'—',B.hr?B.hr+' bpm':'—',A.hr&&B.hr?[+A.hr,+B.hr,'bpm',0,true]:null],
    ['Eficiență (m/bătaie)',A.hr&&pA?num(1000/pA/A.hr,2):'—',B.hr&&pB?num(1000/pB/B.hr,2):'—',A.hr&&pA&&B.hr&&pB?[1000/pA/A.hr,1000/pB/B.hr,'',2,false]:null],
    ['Cadență',A.cad?A.cad+' pași/min':'—',B.cad?B.cad+' pași/min':'—',A.cad&&B.cad?[+A.cad,+B.cad,'pași/min',0,false]:null],['Elevație',A.elev!=null?Math.round(A.elev)+' m':'—',B.elev!=null?Math.round(B.elev)+' m':'—',null],
    ['Cel mai rapid km',fastestKm(A)?fmtClock(fastestKm(A).t):'—',fastestKm(B)?fmtClock(fastestKm(B).t):'—',fastestKm(A)&&fastestKm(B)?[fastestKm(A).t,fastestKm(B).t,'t',0,true]:null]];
  const dl=d=>{ if(!d) return ''; const [a,b,u,dc,low]=d, x=b-a; if(Math.abs(x)<1e-9) return '<span class="mu2">la fel</span>';
    const good=low?x<0:x>0, v=u==='t'?fmtClock(Math.abs(x)):u==='p'?Math.round(Math.abs(x))+' s/km':num(Math.abs(x),dc)+(u?' '+u:''); return `<span class="${good?'good':'bad'}">B ${x>0?'+':'−'}${v}</span>`; };
  const sa=runSplits(A), sb=runSplits(B);
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('swap')} Comparație</div><div class="h2" style="margin-top:6px">Alergarea A vs B</div>
    <div class="cmp2 c3"><div class="cmp2-h"><span></span><span>A</span><span>B</span><span>Diferență</span></div>
      ${rows.map(([l,a,b,d])=>`<div class="cmp2-r"><span>${l}</span><span>${esc(a)}</span><span>${esc(b)}</span><span>${dl(d)}</span></div>`).join('')}</div>
    ${sa.length>=2&&sb.length>=2?`<div class="dsec"><h4>Ritm pe km</h4>${lineChart({pts:sa.map((s,i)=>({x:i+1,y:s.t*1000/s.d/60})),s2:[{pts:sb.map((s,i)=>({x:i+1,y:s.t*1000/s.d/60})),hex:'var(--mu)',name:'B',dash:1}],name:'A',num:true,xfmt:x=>'km '+x,inv:true,noArea:true,hex:COL().run,blue:true,fmt:v=>mmss(v)+' /km',fmtAx:v=>mmss(v),label:'ritm pe km A vs B',minR:.2,h:150})}
      <div class="ch-leg"><span><i style="background:${COL().run}"></i>A · ${fmtDay(A.date)}</span><span><i style="background:var(--mu)"></i>B · ${fmtDay(B.date)}</span></div></div>`
      :`<div class="note">Graficul pe km apare când ambele alergări au despărțiri (din Strava sau scrise de tine).</div>`}
    <div class="note">Verde = B mai bun decât A (mai rapid, mai lung, puls mai mic la același efort). Diferențele de traseu, vreme și oboseală nu apar în cifre.</div>
    <div class="inrow"><button class="btn ghost" data-a="runCmpSwap">${ic('swap')} Inversează A și B</button><button class="btn" style="flex:1" data-a="shClose">Gata</button></div>`;
}
ACT.runCmpSwap=()=>{ if(SH&&SH.kind==='rcmp'){ const t=SH.a; SH.a=SH.b; SH.b=t; shRender(); } };
