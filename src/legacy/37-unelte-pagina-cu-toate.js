/* =====================================================================
   v8 · UNELTE — pagina cu toate calculatoarele, pe categorii, plus calculatoarele noi:
   ritm · viteză · distanță · timp, intervale, procente din 1RM, volum, forță relativă (DOTS),
   cronometru cu ture, numărătoare inversă și pauză. Rezultatele se recalculează pe loc.
   ===================================================================== */
TOOLS.push(['calc','gauge','Ritm · viteză · distanță · timp','Oricare două → a treia, plus timpul pe tură'],['ivl','repeat','Calculator de intervale','Repetări × distanță la un ritm: timp total și pe repetare'],
  ['pct','hash','Procente din 1RM','Greutățile pentru 50–100% din 1RM'],['vol','layers','Volum și tonaj','Serii × repetări × kg, pe mai multe exerciții'],['dots','scale','Forță relativă (DOTS)','Cât de puternic ești raportat la greutatea corpului'],
  ['sw','stopwatch','Cronometru','Cu ture, pentru orice'],['cd','clock','Numărătoare inversă','Cu sunet la final, și cu ecranul blocat'],['rst','moon','Pauză','60 s, 90 s, 2 min, 3 min sau cât vrei']);
const TOOL_CAT=[['Alergare','run',['calc','pace','ivl','vdot','tread','zones']],['Forță','dumbbell',['rm','pct','plates','vol','dots']],['Cronometre','clock',['tm','sw','cd','rst']],
  ['Recuperare și nutriție','leaf',['sleep','caf','sweat','food']],['Conversii','refresh',['units']]];
function viewTools(){
  const T=k=>TOOLS.find(t=>t[0]===k);
  return `<div class="page-h wide"><div class="sp"><div class="eyebrow">${ic('tool')} Unelte</div><div class="h1">Calculatoare și cronometre</div>
      <div class="sub">Tot ce îți trebuie în jurul antrenamentului. Câmpurile se completează din datele tale unde se poate.</div></div></div>
    ${TOOL_CAT.map(([c,icn,ks])=>`<div class="card"><div class="card-h"><div class="eyebrow">${ic(icn)} ${c}</div></div>
      <div class="tl-g">${ks.map(k=>{ const t=T(k); return t?`<button class="tl-b" data-a="toolGo" data-k="${t[0]}"><span class="ic">${ic(t[1])}</span><b>${t[2]}</b><span>${t[3]}</span></button>`:''; }).join('')}</div></div>`).join('')}`;
}
const pctMaxW=(w,p)=>r25(w*p/100);
/* intrările calculatoarelor noi */
const TOOL2={
  calc:{in:()=>`<div class="seg">${[['t','Timpul'],['d','Distanța'],['p','Ritmul']].map(([v,l])=>`<button class="${(TL.cm||'t')===v?'on':''}" data-a="tlSet" data-k="cm" data-s="${v}">Calculez ${l.toLowerCase()}</button>`).join('')}</div>
      <div class="form">${(TL.cm||'t')!=='d'?tlIn('cD','Distanța (km)',{step:'0.01',ph:'ex: 5'}):''}${(TL.cm||'t')!=='t'?tlIn('cT','Timpul (min:sec sau h:min:sec)',{text:1,ph:'ex: 25:00'}):''}
        ${(TL.cm||'t')!=='p'?`${tlIn('cP','Ritmul (min:sec / km)',{text:1,ph:'ex: 5:00'})}${tlIn('cS','sau viteza (km/h)',{step:'0.1',ph:'ex: 12'})}`:''}</div>`,
    out:()=>{ const m=TL.cm||'t', D=tlN('cD'), T=parseTime(TL.cT), sp=tlN('cS'), P=parseTime(TL.cP)||(sp>0?3600/sp:null);
      let d=D, t=T, p=P; if(m==='t'&&d>0&&p) t=d*p; else if(m==='d'&&t&&p) d=t/p; else if(m==='p'&&d>0&&t) p=t/d; else return `<div class="sm mu">Completează ${m==='t'?'distanța și ritmul (sau viteza)':m==='d'?'timpul și ritmul (sau viteza)':'distanța și timpul'}.</div>`;
      return `<div class="kpis"><div class="kpi"><div class="k">Timp</div><div class="v">${fmtClock(t)}</div></div><div class="kpi"><div class="k">Distanță</div><div class="v">${num(d,2)}<small>km</small></div></div><div class="kpi"><div class="k">Ritm</div><div class="v">${mmss(p/60)}<small>/km</small></div></div></div>
        <div class="kpis"><div class="kpi"><div class="k">Viteză</div><div class="v">${num(3600/p,1)}<small>km/h</small></div></div><div class="kpi"><div class="k">Tura de 400 m</div><div class="v">${fmtSecD(p*.4)}</div></div><div class="kpi"><div class="k">100 m</div><div class="v">${fmtSecD(p/10)}</div></div></div>
        <div class="xs mu2" style="margin-top:8px">Ritm = timp / distanță; viteza = 60 / ritm (în minute). Timpul pe tură presupune ritm constant.</div>`; }},
  ivl:{in:()=>`<div class="form">${tlIn('iN','Repetări',{step:'1',ph:'ex: 6'})}${tlIn('iD','Distanța unei repetări (m)',{step:'50',ph:'ex: 400'})}
      ${tlIn('iP','Ritm (min:sec / km)',{text:1,ph:'ex: 4:00'})}${tlIn('iR','Pauză între repetări (s)',{step:'5',ph:'ex: 90'})}</div>`,
    out:()=>{ const n=Math.round(tlN('iN')||0), d=tlN('iD'), p=parseTime(TL.iP), r=tlN('iR')||0; if(!(n>0&&d>0&&p)) return `<div class="sm mu">Scrie numărul de repetări, distanța și ritmul.</div>`;
      const per=p*d/1000, work=per*n, tot=work+r*Math.max(0,n-1);
      return `<div class="kpis"><div class="kpi"><div class="k">O repetare</div><div class="v">${fmtSecD(per)}</div></div><div class="kpi"><div class="k">Lucru total</div><div class="v">${fmtClock(work)}</div></div><div class="kpi"><div class="k">Cu pauze</div><div class="v">${fmtClock(tot)}</div></div></div>
        <div class="list-row"><span class="sp">Distanță de lucru</span><span class="v">${num(n*d/1000,2)} km</span></div><div class="list-row"><span class="sp">Viteză</span><span class="v">${num(3600/p,1)} km/h</span></div>
        <button class="btn blue wide" style="margin-top:12px" data-a="ivlGo">${ic('clock')} Pornește cronometrul: ${n} × ${fmtSecD(per)}${r?' · pauză '+r+' s':''}</button>`; }},
  pct:{in:()=>{ const ls=goalLifts().slice(0,8); return `${ls.length?`<div class="scrollx" style="margin-top:14px">${ls.map(n=>`<button class="chip" data-a="tlPct" data-k="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}<div class="form">${tlIn('pR','1RM (kg)',{step:'0.5',ph:'ex: 120'})}${tlIn('pX','Alt procent (%)',{step:'1',ph:'ex: 72'})}</div>`; },
    out:()=>{ const w=tlN('pR'), x=tlN('pX'); if(!(w>0)) return `<div class="sm mu">Scrie 1RM-ul (sau alege un exercițiu: îl iau pe cel estimat din seriile tale).</div>`;
      return `<table class="rm tl-t"><tr><th>%</th><th>Greutate</th><th>Repetări aproximative</th></tr>${[100,95,90,85,80,75,70,65,60,55,50].map(p=>`<tr class="${x&&Math.abs(x-p)<2.5?'sel':''}"><td><b>${p}%</b></td><td>${num(pctMaxW(w,p))} kg</td><td class="mu">${p===100?1:Math.max(1,Math.round(30*(100/p-1)))}</td></tr>`).join('')}</table>
        ${x>0?`<div class="list-row"><span class="sp">${num(x)}% din ${num(w)} kg</span><span class="v">${num(w*x/100,1)} kg (≈ ${num(pctMaxW(w,x))})</span></div>`:''}<div class="xs mu2" style="margin-top:8px">Rotunjit la 2,5 kg. Repetările sunt aproximative (inversul formulei Epley), la efort maxim.</div>`; }},
  vol:{in:()=>`<div class="vol-g">${[1,2,3,4].map(i=>`<div class="form c3" style="margin-top:${i>1?6:12}px">${tlIn('vs'+i,i===1?'Serii':'',{step:'1',ph:'serii'})}${tlIn('vr'+i,i===1?'Repetări':'',{step:'1',ph:'rep.'})}${tlIn('vk'+i,i===1?'kg':'',{step:'0.5',ph:'kg'})}</div>`).join('')}</div>`,
    out:()=>{ let t=0, sets=0, reps=0, rows=[]; [1,2,3,4].forEach(i=>{ const s=tlN('vs'+i), r=tlN('vr'+i), k=tlN('vk'+i); if(s>0&&r>0&&k>=0){ t+=s*r*k; sets+=s; reps+=s*r; rows.push([s,r,k]); } });
      if(!rows.length) return `<div class="sm mu">Completează cel puțin un rând: serii, repetări, kg.</div>`;
      const wk=ixSum(dayShift(todayKey(),-6),todayKey()).vol;
      return `<div class="kpis"><div class="kpi"><div class="k">Tonaj</div><div class="v">${num(t,0)}<small>kg</small></div></div><div class="kpi"><div class="k">Serii</div><div class="v">${sets}</div></div><div class="kpi"><div class="k">Repetări</div><div class="v">${reps}</div></div></div>
        ${wk>0?`<div class="xs mu2" style="margin-top:8px">Pentru comparație: în ultimele 7 zile ai notat ${num(wk/1000,2)} t în total.</div>`:''}`; }},
  dots:{in:()=>`<div class="form">${tlIn('dW','Greutatea ridicată (kg)',{step:'0.5',ph:'ex: 120 sau totalul a trei ridicări'})}${tlIn('dB','Greutatea corpului (kg)',{step:'0.1',ph:num(curW(),1)})}</div>
      <div class="seg" style="margin-top:10px">${[['m','Bărbat'],['f','Femeie']].map(([v,l])=>`<button class="${(TL.dS||prof().sex)===v?'on':''}" data-a="tlSet" data-k="dS" data-s="${v}">${l}</button>`).join('')}</div>`,
    out:()=>{ const w=tlN('dW'), b=tlN('dB')||curW(), f=(TL.dS||prof().sex)==='f'; if(!(w>0&&b>30)) return `<div class="sm mu">Scrie greutatea ridicată (un 1RM sau totalul genuflexiune + împins + îndreptare).</div>`;
      const c=f?[-0.0000010706,0.0005158568,-0.1126655495,13.6175032,-57.96288]:[-0.000001093,0.0007391293,-0.1918759221,24.0900756,-307.75076], bb=clamp(b,f?40:40,f?150:210);
      const den=c[0]*Math.pow(bb,4)+c[1]*Math.pow(bb,3)+c[2]*bb*bb+c[3]*bb+c[4], sc=w*500/den;
      return `<div class="kpis c2"><div class="kpi"><div class="k">Scor DOTS</div><div class="v">${num(sc,1)}</div></div><div class="kpi"><div class="k">Raport</div><div class="v">${num(w/b,2)}<small>× corp</small></div></div></div>
        <div class="xs mu2" style="margin-top:8px">DOTS e formula folosită în powerlifting ca să compare sportivi de greutăți diferite. Are sens pe totalul celor trei ridicări; pe un singur exercițiu, compară-te doar cu tine în timp.</div>`; }},
  sw:{in:()=>'',out:()=>{ const st=SW, el=swEl(); return `<div class="sw-big" id="swT">${fmtCs(el)}</div>
      <div class="inrow"><button class="btn ${st.on?'':'pri'} xl" style="flex:1" data-a="swGo">${st.on?ic('pause')+' Pauză':ic('play')+' '+(el?'Continuă':'Start')}</button><button class="btn xl" style="flex:1" data-a="swLap" ${st.on?'':'disabled'}>${ic('flag')} Tură</button></div>
      ${el&&!st.on?`<button class="btn ghost wide" style="margin-top:8px" data-a="swReset">${ic('refresh')} Resetează</button>`:''}
      ${st.laps.length?`<div style="margin-top:10px" id="swL">${st.laps.map((l,i)=>`<div class="list-row"><span class="sp">Tura ${st.laps.length-i}</span><span class="xs mu">${fmtCs(l.t)}</span><span class="v">${fmtCs(l.d)}</span></div>`).join('')}</div>`:''}`; }},
  cd:{in:()=>`<div class="chips" style="margin-top:14px">${[60,120,300,600,900].map(s=>`<button class="chip" data-a="tlSet" data-k="cdT" data-s="${fmtClock(s)}">${fmtClock(s)}</button>`).join('')}</div><div class="form">${tlIn('cdT','Durata (min:sec)',{text:1,ph:'ex: 10:00'})}${tlIn('cdL','Pentru ce (opțional)',{text:1,ph:'ex: plank'})}</div>`,
    out:()=>{ const t=parseTime(TL.cdT); return t?`<button class="btn pri wide xl" data-a="cdGo">${ic('play')} Pornește · ${fmtClock(t)}</button><div class="xs mu2" style="margin-top:8px">Sună cu 3 secunde înainte și la final, și cu telefonul blocat (lasă volumul pornit).</div>`:`<div class="sm mu">Alege sau scrie o durată.</div>`; }},
  rst:{in:()=>'',out:()=>`<div class="tl-g">${[60,90,120,180,240,300].map(s=>`<button class="tl-b" data-a="rstGo" data-i="${s}"><span class="ic">${ic('moon')}</span><b>${s<120?s+' s':fmtClock(s)+' min'}</b><span>pauză</span></button>`).join('')}</div>`}
};
/* calculatoarele noi intră în aceeași foaie ca cele vechi */
const toolIn0=toolIn, toolOut0=toolOut;
toolIn=k=>TOOL2[k]?TOOL2[k].in():toolIn0(k);
toolOut=k=>{ const box=h=>`<div class="tl-o">${h}</div>`; return TOOL2[k]?box(TOOL2[k].out()):toolOut0(k); };
ACT.tlPct=(el,{k})=>{ TL.pR=String(bestE1(k)||''); if(SH&&SH.kind==='tool') shRender(); };
ACT.ivlGo=()=>{ const n=Math.round(tlN('iN')||0), d=tlN('iD'), p=parseTime(TL.iP), r=tlN('iR')||0; if(!(n>0&&d>0&&p)) return; const per=Math.round(p*d/1000), ph=[{k:'prep',d:10,l:'Pregătește-te',s:n+' × '+d+' m în '+fmtSecD(per)}];
  for(let i=1;i<=n;i++){ ph.push({k:'work',d:per,l:d+' m · '+i+'/'+n,s:'în '+fmtSecD(per)}); if(i<n&&r) ph.push({k:'rest',d:r,l:'Pauză',s:'Urmează '+(i+1)+'/'+n}); }
  SH=null; shRender(); tmOpen({title:n+' × '+d+' m',kind:'interval',ph}); };
ACT.cdGo=()=>{ const t=parseTime(TL.cdT); if(!t) return; SH=null; shRender(); tmOpen({title:(TL.cdL||'Numărătoare inversă')+' · '+fmtClock(t),kind:'cd',ph:[{k:'prep',d:3,l:'Pregătește-te',s:''},{k:'work',d:t,l:TL.cdL||'Timp',s:''}]}); };
ACT.rstGo=(el,{I})=>{ SH=null; shRender(); tmOpen({title:'Pauză · '+fmtClock(I),kind:'rest',ph:[{k:'rest',d:I,l:'Pauză',s:'respiră, bea apă'}]}); };
/* cronometrul cu ture: rulează în foaie, se actualizează de 10 ori pe secundă */
const SW={on:false,t0:0,acc:0,laps:[],iv:0};
const swEl=()=>SW.acc+(SW.on?Date.now()-SW.t0:0);
const fmtCs=ms=>{ const s=Math.floor(ms/1000), cs=Math.floor(ms%1000/10); return fmtClock(s)+'.'+pad(cs); };
function swPaint(){ const t=$('#swT'); if(!t||!(SH&&SH.kind==='tool'&&SH.k==='sw')){ clearInterval(SW.iv); SW.iv=0; return; } t.textContent=fmtCs(swEl()); }
const swRe=()=>{ const o=$('#tlOut'); if(o) o.innerHTML=toolOut('sw'); };
ACT.swGo=()=>{ if(SW.on){ SW.acc+=Date.now()-SW.t0; SW.on=false; clearInterval(SW.iv); SW.iv=0; } else { SW.t0=Date.now(); SW.on=true; actxGet(); if(!SW.iv) SW.iv=setInterval(swPaint,100); } buzz(10); swRe(); };
ACT.swLap=()=>{ const t=swEl(), prev=SW.laps[0]?SW.laps[0].t:0; SW.laps.unshift({t,d:t-prev}); buzz(10); beep(990,.05); swRe(); };
ACT.swReset=()=>{ SW.on=false; SW.acc=0; SW.laps=[]; clearInterval(SW.iv); SW.iv=0; swRe(); };
