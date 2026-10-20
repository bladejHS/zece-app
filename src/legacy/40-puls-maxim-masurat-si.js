/* =====================================================================
   v9 · PULS MAXIM MĂSURAT ȘI TESTUL DE PRAG (30 MIN)
   Pulsul maxim: cel scris în profil; altfel estimat din vârstă (Tanaka), cu propunerea de a folosi cel mai mare puls
   înregistrat în ultimul an (alergări și activități din Strava, antrenamente FALCO, cronometre), dacă e mai mare.
   Testul de prag (Friel): 15 min încălzire, apoi 30 min cât de tare poți ține egal; pulsul mediu din ultimele 20 de minute
   = pulsul la prag (LTHR), iar ritmul mediu pe 30 de minute = ritmul de prag. Ambele intră în profil, zone și viteze.
   ===================================================================== */
function hrMaxObs(){ const from=dayShift(todayKey(),-365); let b=null;
  const t=(v,d,src)=>{ v=+v; if(v>=120&&v<=230&&d&&d>=from&&(!b||v>b.v)) b={v:Math.round(v),d,src}; };
  (S.runs||[]).forEach(r=>t(r.hrMax,r.date,'alergare')); (S.ext||[]).forEach(x=>t(x.hrMax,x.date,stName(x.type)));
  (S.hist||[]).forEach(h=>{ if(h.hr) t(h.hr.max,h.date,'antrenament'); }); (S.tmlog||[]).forEach(x=>{ if(x.hr) t(x.hr.max,x.date,x.title||'cronometru'); });
  return b; }
function hrMaxInfo(){ const P=prof(), est=Math.round(208-.7*P.age), ob=hrMaxObs();
  if(+P.hrMax>0) return {v:Math.round(+P.hrMax),src:'măsurat',est,ob};
  return {v:est,src:'din vârstă',est,ob,sug:ob&&ob.v>est?ob:null}; }
ACT.hrMaxUse=async(el,{I})=>{ if(!(I>=120&&I<=230)) return; await save('prof',Object.assign({},S.prof||{},{hrMax:I})); STC=null;
  if(SH&&SH.kind==='tool') shRender(); render(); toast('Puls maxim: '+I+' bpm','Zonele și vitezele folosesc acum pulsul tău măsurat.','info'); };

/* ---------- testul de 30 de minute, pe cronometru ---------- */
const P_LT30=()=>({title:'Test de prag · 30 min',kind:'lt30',ph:[
  {k:'prep',d:10,l:'Pregătește-te',s:'15 minute de încălzire ușoară'},
  {k:'work',d:900,l:'Încălzire',s:'Ușor, ultimele 2 minute mai alert',half:true},
  {k:'work',d:600,l:'Test · minutele 1–10',s:'Cât de tare poți ține 30 de minute, egal. Nu porni prea tare.'},
  {k:'work',d:1200,l:'Test · minutele 11–30',s:'Acum se măsoară pulsul. Ține ritmul până la capăt.',meas:true,half:true},
  {k:'work',d:600,l:'Răcire',s:'Ușor, cât să-ți revină respirația'}]});
function lt30Form(st){ const m=st.mh&&st.mh.n>=30?Math.round(st.mh.s/st.mh.n):null, hs=hrSum(st.hr);
  if(TL.ltFor!==st.start){ TL.ltFor=st.start; TL.ltHr=m?String(m):''; TL.ltKm=''; TL.ltMax=hs?String(hs.max):''; }
  if(st.saved) return `<div class="note" style="text-align:center">${ic('check')} Rezultatul e salvat în profil și în Teste.</div>`;
  return `<div class="card"><div class="eyebrow">${ic('medal')} Rezultatul testului</div>
    <div class="form">${tlIn('ltKm','Distanța în cele 30 de minute (km)',{step:'0.01',ph:'de pe bandă sau ceas'})}${tlIn('ltHr','Puls mediu, minutele 11–30',{step:'1',ph:m?'':'de pe ceas'})}
      ${tlIn('ltMax','Puls maxim atins (opțional)',{step:'1',full:1})}</div>
    <div class="xs mu" style="margin-top:6px">${m?'Pulsul mediu vine din senzor ('+st.mh.n+' citiri).':'Fără senzor conectat, ia pulsul mediu al ultimelor 20 de minute de pe ceas (Polar / Strava).'}</div>
    <button class="btn pri wide" style="margin-top:10px" data-a="lt30Save">${ic('check')} Salvează rezultatul</button></div>`; }
ACT.lt30Save=async()=>{ const st=TM.st; if(!st||st.kind!=='lt30'||st.saved) return;
  const km=tlN('ltKm'), hr=Math.round(tlN('ltHr')||0), mx=Math.round(tlN('ltMax')||0);
  if(!(hr>=100&&hr<=220)) return shake('#tl_ltHr'); if(km!=null&&TL.ltKm!==''&&!(km>1&&km<15)) return shake('#tl_ltKm');
  const pace=km>0?30/km:null, o={lthr:hr}; if(pace) o.thrPace=Math.round(pace*1000)/1000; if(mx>=120&&mx<=230&&mx>hrMaxInfo().v) o.hrMax=mx;
  await save('prof',Object.assign({},S.prof||{},o)); STC=null;
  await save('ptests',(S.ptests||[]).concat([Object.assign({date:todayKey(),type:'lt30',value:hr},pace?{pace:Math.round(pace*1000)/1000,km:Math.round(km*100)/100}:{})]));
  st.saved=true; tmRender(); toast('Pulsul la prag: '+hr+' bpm',pace?'Ritmul de prag: '+mmss(pace)+' /km. Zonele și vitezele s-au actualizat.':'Zonele și vitezele s-au actualizat.','info'); };
ACT.lt30Go=()=>{ SH=null; shRender(); tmOpen(P_LT30()); };
/* cardul din Performanță → Teste */
function lt30Card(){ const P=prof(), h=(S.ptests||[]).filter(t=>t.type==='lt30'), last=h[h.length-1], H=hrMaxInfo();
  return `<div class="card"><div class="row"><div class="sp"><div class="eyebrow">${ic('heart')} Test de prag · 30 min</div><div class="xs mu" style="margin-top:2px">pulsul la prag (LTHR) și ritmul de prag</div></div>
      ${last?`<div style="text-align:right"><div class="big sm">${last.value}<small>bpm</small></div><div class="xs mu">${last.pace?mmss(last.pace)+' /km · ':''}${relDay(last.date)}</div></div>`:''}</div>
    <div class="note">După 15 minute de încălzire, aleargă 30 de minute cât de tare poți ține egal, singur (nu în cursă). Pulsul mediu din ultimele 20 de minute e pulsul tău la prag; distanța dă ritmul de prag. Repetă-l la 6–8 săptămâni, odihnit.</div>
    <div class="kpis c2"><div class="kpi"><div class="k">Puls maxim</div><div class="v">${H.v}<small>bpm</small></div><div class="s">${H.src}</div></div>
      <div class="kpi"><div class="k">Puls la prag</div><div class="v">${+P.lthr>0?Math.round(+P.lthr):'—'}<small>${+P.lthr>0?'bpm':''}</small></div><div class="s">${+P.lthr>0?'din test':'fă testul'}</div></div></div>
    ${H.sug?`<button class="chip" style="margin-top:10px" data-a="hrMaxUse" data-i="${H.sug.v}">${ic('heart')} Ai atins ${H.sug.v} bpm (${relDay(H.sug.d)}): folosește-l ca puls maxim</button>`:''}
    <button class="btn pri wide" style="margin-top:12px" data-a="lt30Go">${ic('play')} Pornește testul ghidat</button></div>`; }
const progTests0=progTests;
progTests=()=>lt30Card()+progTests0();
