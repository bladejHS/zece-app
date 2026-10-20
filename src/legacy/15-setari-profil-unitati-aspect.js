/* =====================================================================
   SETĂRI — Profil · Unități · Aspect · Notificări · Acasă · Scurtături · Conexiuni · Antrenor AI · Antrenament · Date
   ===================================================================== */
const SET_SEC=[['sProf','Profil'],['sUnits','Unități'],['sAsp','Aspect'],['sNotif','Notificări'],['sDash','Acasă'],['sConn','Conexiuni'],['sAi','Antrenor AI'],['sTrain','Antrenament'],['sData','Date și copii']];
function viewSet(){
  const P=prof(), p=runPlan(), key=S.aiKey, tg=targets(), nc=notifCfg(), md=S.mode||'dark';
  const rpRow=(lbl,k,f)=>`<span class="n">${lbl}</span>${Array.from({length:WEEKS},(_,w)=>`<input class="inp" type="number" inputmode="numeric" data-rp="${k}|${f}|${w}" value="${p[k][f][w]}" aria-label="${lbl} săptămâna ${w+1}">`).join('')}`;
  const sw=(a,on,lbl,sub,extra)=>`<div class="set-row"><span class="sp"><b>${lbl}</b>${sub?`<div class="sm mu">${sub}</div>`:''}</span><button class="sw ${on?'on':''}" data-a="${a}" ${extra||''} role="switch" aria-checked="${!!on}" aria-label="${esc(lbl)}"></button></div>`;
  const perm='Notification' in window?Notification.permission:'na';
  return `
  <div class="page-h"><div class="sp"><div class="h1">Setări</div></div></div>
  <div class="scrollx set-idx">${SET_SEC.map(([id,l])=>`<button class="chip" data-a="setGo" data-k="${id}">${l}</button>`).join('')}</div>

  <div class="set-h" id="sProf">Profil</div>
  <div class="card"><div class="eyebrow">${ic('user')} Despre tine</div>
    <div class="chips" style="margin-top:12px">${[['m','Bărbat'],['f','Femeie']].map(s=>`<button class="chip ${P.sex===s[0]?'on':''}" data-a="sex" data-k="${s[0]}">${s[1]}</button>`).join('')}</div>
    <div class="form">
      <div class="fld"><label for="pAge">Vârstă</label><input class="inp" id="pAge" data-p="age" type="number" inputmode="numeric" value="${P.age}"></div>
      <div class="fld"><label for="pH">Înălțime (cm)</label><input class="inp" id="pH" data-p="h" type="number" inputmode="numeric" value="${P.h}"></div>
      <div class="fld"><label for="pS">Greutate la start (kg)</label><input class="inp" id="pS" data-p="startW" type="number" step="0.1" inputmode="decimal" value="${P.startW}"></div>
      <div class="fld"><label for="pG">Greutate țintă (kg)</label><input class="inp" id="pG" data-p="goalW" type="number" step="0.1" inputmode="decimal" value="${P.goalW}"></div>
      <div class="fld"><label for="pHr">Puls în repaus (opțional)</label><input class="inp" id="pHr" data-p="hrRest" data-opt="1" type="number" inputmode="numeric" value="${P.hrRest||''}" placeholder="ex: 62"></div>
      <div class="fld"><label for="pHm">Puls maxim (opțional)</label><input class="inp" id="pHm" data-p="hrMax" data-opt="1" type="number" inputmode="numeric" value="${+P.hrMax>0?P.hrMax:''}" placeholder="estimat: ${Math.round(208-.7*P.age)}"></div>
      <div class="fld"><label for="pLt">Puls la prag · LTHR (opțional)</label><input class="inp" id="pLt" data-p="lthr" data-opt="1" type="number" inputmode="numeric" value="${+P.lthr>0?P.lthr:''}" placeholder="din testul de 30 min"></div>
      <div class="fld"><label for="pTp">Ritm de prag (min:sec /km)</label><input class="inp" id="pTp" data-pace="1" inputmode="text" value="${+P.thrPace>0?mmss(+P.thrPace):''}" placeholder="automat"></div></div>
    <div class="note">Vârsta și pulsul în repaus dau zonele de puls; pulsul maxim măsurat le face mai exacte (altfel se estimează din vârstă). Înălțimea și greutatea dau forța relativă și compoziția corporală.</div>
    ${(H=>H.sug?`<button class="chip" style="margin-top:10px" data-a="hrMaxUse" data-i="${H.sug.v}">${ic('heart')} Ai atins ${H.sug.v} bpm (${relDay(H.sug.d)}): folosește-l ca puls maxim</button>`:'')(hrMaxInfo())}
    <button class="btn ghost sm" style="margin-top:10px" data-a="tab" data-k="prog" data-s="t">${ic('heart')} Testul de prag · 30 min</button></div>
  <div class="card"><div class="eyebrow">${ic('flame')} Ținte de nutriție</div>
    <div class="form">
      <div class="fld"><label for="pAct">Activitate</label><select class="inp" id="pAct" data-p="act">${[[1.375,'Ușoară'],[1.55,'Moderată'],[1.725,'Mare'],[1.9,'Foarte mare']].map(a=>`<option value="${a[0]}" ${+P.act===a[0]?'selected':''}>${a[1]} (×${a[0]})</option>`).join('')}</select></div>
      <div class="fld"><label for="pMet">Metabolism</label><select class="inp" id="pMet" data-p="metab">${METAB.map(([v,l])=>`<option value="${v}" ${metabF()===v?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="fld"><label for="pDef">Deficit (kcal/zi)</label><input class="inp" id="pDef" data-p="def" data-opt="1" type="number" inputmode="numeric" value="${P.def||''}" placeholder="auto ${tg.autoDef}"></div>
      <div class="fld"><label for="pK">Calorii/zi (gol = auto ${tg.auto})</label><input class="inp" id="pK" data-p="kcalT" data-opt="1" type="number" inputmode="numeric" value="${P.kcalT||''}" placeholder="${tg.auto}"></div>
      <div class="fld"><label for="pPr">Proteină g/zi</label><input class="inp" id="pPr" data-p="protT" data-opt="1" type="number" inputmode="numeric" value="${P.protT||''}" placeholder="${Math.round(P.goalW*2)}"></div>
      <div class="fld full"><label for="pW">Apă ml/zi</label><input class="inp" id="pW" data-p="waterT" data-opt="1" type="number" inputmode="numeric" value="${P.waterT||''}" placeholder="3500"></div></div>
    <div class="note">Metabolism de bază estimat: <b>${tg.bmr} kcal</b>, consum total: <b>~${tg.tdee} kcal</b>. Nu coborî sub metabolismul de bază fără un medic sau nutriționist.</div></div>

  <div class="set-h" id="sUnits">Unități și echipament</div>
  <div class="card"><div class="eyebrow">${ic('ruler')} Unități</div>
    <div class="set-row"><span class="sp"><b>Sistem metric</b><div class="sm mu">kg, km, min/km, cm. Toate datele sunt salvate în aceste unități.</div></span><span class="tag">kg · km</span></div>
    <div class="note">Pentru livre sau mile folosește convertorul din Unelte: un comutator global ar amesteca unitățile în istoricul tău.</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Bara olimpică pentru discuri</div>
    <div class="seg">${[20,15,10].map(b=>`<button class="${(+P.bar||20)===b?'on':''}" data-a="barSet" data-i="${b}">${b} kg</button>`).join('')}</div>
    <div class="note">Folosită la calculul discurilor de pe fiecare parte și al seriilor de încălzire.</div></div>

  <div class="set-h" id="sAsp">Aspect</div>
  <div class="card"><div class="eyebrow">${ic('sun')} Mod</div>
    <div class="swatches">${[['dark','Întunecată','#050505'],['light','Luminoasă','#F4F5F7'],['auto','Automată','linear-gradient(135deg,#050505 50%,#F4F5F7 50%)']].map(([k,l,c])=>`<button class="swatch mode ${md===k?'on':''}" style="--c1:${k==='auto'?'var(--mu)':c}" data-a="modeSet" data-k="${k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div>
    <div class="note">„Automată" urmează setarea telefonului sau a calculatorului (zi / noapte).</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Fundalul temei întunecate</div>
    <div class="seg">${[['anthr','Grafit'],['black','Negru absolut']].map(([k,l])=>`<button class="${(S.bg||'anthr')===k?'on':''}" data-a="bgSet" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Efecte vizuale</div>
    <div class="seg">${[['min','Minime'],['normal','Normale'],['max','Maxime']].map(e=>`<button class="${S.fx===e[0]?'on':''}" data-a="fxLevel" data-k="${e[0]}">${e[1]}</button>`).join('')}</div>
    <div class="note">„Maxime" adaugă particule și strălucire mai puternică. „Minime" oprește animațiile de fundal (economisește bateria).</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Mișcare</div>
    <div class="seg">${[['auto','Automat'],['on','Mereu animat'],['off','Redusă']].map(e=>`<button class="${S.motion===e[0]?'on':''}" data-a="motionSet" data-k="${e[0]}">${e[1]}</button>`).join('')}</div>
    <div class="note">${MQ_RM.matches?'Sistemul tău cere <b>mișcare redusă</b>. „Automat" respectă asta; „Mereu animat" pornește animațiile doar în FALCO.':'Sistemul tău permite animațiile.'}</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Animația de deschidere</div>
    <div class="seg">${[['full','Completă'],['short','Scurtă'],['off','Oprită']].map(e=>`<button class="${S.intro===e[0]?'on':''}" data-a="introMode" data-k="${e[0]}">${e[1]}</button>`).join('')}</div></div>

  <div class="set-h" id="sNotif">Notificări</div>
  <div class="card"><div class="eyebrow">${ic('bell')} Ce te anunț</div>
    ${Object.keys(NOTIF_K).map(k=>sw('notifT',nc[k],NOTIF_K[k][0],{pr:'Când bați un record (nu și la fiecare repetare în plus)',goal:'La 25, 50, 75 și 100% din drumul spre un obiectiv',ach:'Discret, o singură dată',bk:'Când n-ai mai făcut o copie de 2 săptămâni',sess:'Dacă un antrenament rămâne pornit peste 3 ore'}[k],`data-k="${k}"`)).join('')}
    ${sw('notifSys',nc.sys&&perm==='granted','Și ca notificări de sistem',perm==='na'?'Browserul acesta nu are notificări de sistem.':perm==='denied'?'Blocate din setările browserului.':'Cât timp aplicația e deschisă (fără server, o pagină web nu poate notifica atunci când e închisă).',perm==='na'||perm==='denied'?'disabled':'')}
    <div class="note">Notificările stau în clopoțelul din antet. Niciuna nu se repetă.</div></div>

  <div class="set-h" id="sDash">Acasă</div>
  <div class="card"><div class="eyebrow">${ic('grid')} Centrul de comandă</div>
    <div class="set-row"><span class="sp"><b>Layout: ${esc((DASH_PRESETS[dashCfg().p]||{n:'personalizat'}).n)}</b><div class="sm mu">${dashCfg().o.length} widgeturi vizibile</div></span><button class="btn sm" data-a="dashEdit">${ic('sliders')} Personalizează</button></div>
    ${sw('setupT',!(S.dash||{}).setupOff,'Lista de configurare','Pașii pentru a completa aplicația, pe Acasă, până îi termini')}</div>

  <div class="set-h" id="sConn">Conexiuni</div>
  ${connCard()}
  ${stCard()}

  <div class="set-h" id="sAi">Antrenor AI</div>
  <div class="card" id="aiSet"><div class="eyebrow">${ic('key')} Cheia API · Claude Opus 5.5</div>
    ${key?`<div class="set-row" style="margin-top:6px"><span class="sp">Cheie API salvată <span class="mu sm">· ${esc(key.slice(0,10))}…${esc(key.slice(-4))}</span></span>
        <button class="btn ghost sm danger" data-a="aiKeyDel" data-confirm="Sigur? Apasă iar">${ic('trash')} Șterge</button></div>`
      :`<div class="keybox"><input class="inp" id="aiKeyIn" type="password" autocomplete="off" placeholder="sk-ant-…" aria-label="Cheia API Anthropic"><button class="btn pri" data-a="aiKeySave">Salvează</button></div>`}
    <div class="note">Cheia stă criptată (AES-GCM) doar pe acest dispozitiv, nu intră în export sau în sincronizare și pleacă numai spre api.anthropic.com. O creezi în <b>console.anthropic.com → API Keys</b>; contul are nevoie de credit.</div>
    <div class="sm" style="margin-top:14px;font-weight:600">Cât de mult gândește</div>
    <div class="seg">${[['low','Rapid'],['medium','Echilibrat'],['high','Profund']].map(e=>`<button class="${S.aiEffort===e[0]?'on':''}" data-a="aiEffort" data-k="${e[0]}">${e[1]}</button>`).join('')}</div>
    <div class="note">„Echilibrat" e potrivit pentru aproape orice. „Profund" răspunde mai încet și costă mai mult. Fără cheie, căutarea (Ctrl+K) răspunde oricum la întrebările simple din datele tale.</div></div>
  ${aiSafetyCard()}

  <div class="set-h" id="sTrain">Antrenament</div>
  ${icsCard()}
  <div class="card"><div class="set-row" style="margin-top:0"><span class="sp"><b>Deload automat în săptămâna 4</b><div class="sm mu">Volum −40% (serii, minute, reprize, runde). Oprit implicit: după Dr. Milo Wolf, deload-ul programat nu crește masa; îl faci doar când performanța scade o săptămână (antrenorul adaptiv ți-l propune atunci).</div></span><button class="sw ${S.deload!==false?'on':''}" data-a="deloadToggle" role="switch" aria-checked="${S.deload!==false}" aria-label="Deload automat"></button></div></div>
  ${healthCard()}
  <div class="card"><div class="eyebrow">${ic('run')} Progresia alergării</div>
    <div class="rp-grid"><span></span>${Array.from({length:WEEKS},(_,w)=>`<span class="h">S${w+1}</span>`).join('')}
      ${rpRow('Easy luni (min)','ez1','w')}${rpRow('Prag (reprize)','thr','r')}${rpRow('Easy joi (min)','ez2','w')}</div>
    <div class="note">Reprizele de prag au ${p.thr.m} min, cu ${p.thr.rest}s jog între ele. Exercițiile și zilele planului rămân aceleași.</div>
    <button class="btn ghost sm" style="margin-top:10px" data-a="rpReset" data-confirm="Sigur? Apasă iar">${ic('refresh')} Valorile din program</button></div>
  <div class="card">${sw('sound',S.sound,'Sunet și vibrații','Pauze, cronometru, recorduri')}
    ${sw('voiceCues',S.voice,'Voce','Anunță rundele, pauzele, combinațiile și recordurile și te încurajează')}
    ${voxSettingsHTML()}
    <div class="set-row"><span class="sp"><b>Ghidul de pornire</b><div class="sm mu">Reia pașii de la prima deschidere</div></span><button class="btn ghost sm" data-a="onbOpen">Deschide</button></div></div>

  <div class="set-h" id="sData">Date și copii</div>
  <div class="card">
    <div class="row" style="align-items:flex-start"><div class="sp"><b>Copie de siguranță</b><div class="sm mu">${S.bk&&S.bk.last?'Ultima: '+relDay(S.bk.last)+(S.bk.last!==todayKey()?' ('+fmtDay(S.bk.last)+')':''):'Nu ai făcut încă nicio copie.'}</div></div>
      ${STEST?`<span class="xs mu" style="text-align:right">${STEST}</span>`:''}</div>
    <div class="note">Totul e salvat doar pe acest dispozitiv. Fă o copie măcar o dată la două săptămâni și înainte să schimbi telefonul sau browserul. Pe iPhone fișierul ajunge în Fișiere → Descărcări: mută-l în iCloud Drive.</div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap">
      <button class="btn" data-a="export">${ic('download')} Exportă copia</button>
      <button class="btn ghost" data-a="export" data-i="1">${ic('camera')} Copie cu poze</button>
      <label class="btn file-l">${ic('upload')} Restaurează<input type="file" id="impFile" accept="application/json,.json"></label></div>
    <div class="set-row" style="margin-top:12px"><span class="sp"><b>Ciclul ${cyc()}</b><div class="sm mu">${cycleDaysDone()} din ${WEEKS*7} zile bifate</div></span>
      ${cyc()>1?`<button class="btn ghost sm" data-a="cfOpen">Corectează</button>`:''}<button class="btn ghost sm danger" data-a="resetCycle" data-confirm="Sigur? Apasă iar">Șterge bifele</button></div></div>
  ${ioCard()}
  ${syncCard()}
  ${errCard()}
  <div class="xs mu2" style="text-align:center;margin-top:18px">FALCO · planul hibrid după Dr. Milo Wolf</div>`;
}
ACT.barSet=async(el,{I})=>{ await save('prof',Object.assign({},S.prof||{},{bar:I})); render(); };
ACT.notifT=async(el,{k})=>{ const c=notifCfg(); c[k]=!c[k]; await save('notifCfg',c); render(); };
ACT.notifSys=async()=>{ const c=notifCfg();
  if(!c.sys&&'Notification' in window&&Notification.permission!=='granted'){ try{ const p=await Notification.requestPermission(); if(p!=='granted'){ toast('Notificările de sistem sunt blocate','Le poți permite din setările browserului.','info'); render(); return; } }catch(e){ return; } }
  c.sys=!c.sys; await save('notifCfg',c); render(); };
ACT.setupT=async()=>{ await save('dash',Object.assign({},S.dash||{},{setupOff:!(S.dash||{}).setupOff})); render(); };

function errCard(){ const a=errList().slice().reverse();
  return `<div class="card"><details class="notes" style="border:0;padding:0"><summary>${ic('alert')} Jurnal de erori · ${a.length?a.length+' '+(a.length===1?'înregistrare':'înregistrări'):'gol'}</summary>
    ${a.length?`<div style="margin-top:8px">${a.slice(0,12).map(e=>`<div class="list-row" style="align-items:flex-start"><span class="sp"><b class="xs">${esc(e.m)}</b><div class="xs mu2">${esc(e.t.replace('T',' ').slice(0,16))}${e.s?' · '+esc(e.s):''}</div></span></div>`).join('')}</div>
      <div class="inrow"><button class="btn ghost sm" data-a="errCopy">${ic('copy')} Copiază</button><button class="btn ghost sm danger" data-a="errClear" data-confirm="Sigur?">${ic('trash')} Golește</button></div>`
      :`<p>Nicio eroare înregistrată. Dacă ceva nu merge, aici apar detaliile pe care mi le poți trimite.</p>`}</details></div>`; }
