/* =====================================================================
   13 · GHIDUL DE PORNIRE — scurt și opțional: ce urmărești, câteva cifre (le poți sări), aspectul.
   Restul se configurează treptat, din lista de pe Acasă (profil, check-in, obiectiv, copie…).
   ===================================================================== */
const OB_FOCUS=[['str','Forță','dumbbell','Serii, 1RM, recorduri'],['run','Alergare','run','Ritm, km, despărțiri'],['k1','1 km','stopwatch','Ținta și pacerul'],['body','Corp','scale','Greutate, talie, poze'],['plan','Planul Hybrid365','plan','4 săptămâni, 7 zile']];
let OB=null;
function onbOpen(){ const P=prof(); OB={step:0,sex:P.sex,focus:(P.focus||['str','run','plan']).slice(),mode:S.mode||'dark'}; onbRender(); }
function onbRender(){
  const r=$('#ovRoot'); if(!OB){ r.innerHTML=''; updLock(); return; }
  document.body.classList.add('lock');
  const P=prof(), ws=wStats(), N=4, dots=`<div class="onb-dots">${Array.from({length:N},(_,i)=>`<i class="${i===OB.step?'on':''}"></i>`).join('')}</div>`, f=OB.focus;
  let body='';
  if(OB.step===0) body=`<div class="onb-hero"><div class="onb-ph"></div><div class="onb-mark">${UI.logoSvg({})}</div></div>
    <div class="onb-big">FALCO</div><p class="mu" style="text-align:center;margin-top:6px">${esc(UI.BRAND.tagline)}</p>
    <div class="feat"><div>${ic('play')} Antrenament live: serii, pauze, cronometru</div><div>${ic('chart')} Performanță pe orice perioadă, cu grafice interactive</div>
      <div>${ic('stopwatch')} 1 KM Lab, Running Lab, recorduri și obiective</div><div>${ic('shield')} Totul rămâne pe dispozitivul tău</div></div>
    <label class="linkb file-l" style="margin:16px auto 0;display:flex;justify-content:center">${ic('upload')} Am deja o copie: restaurează<input type="file" id="impFile" accept="application/json,.json"></label>`;
  else if(OB.step===1) body=`<div class="eyebrow">Pasul 1 din 3</div><div class="h1">Ce urmărești?</div><p class="mu">Alege oricâte. Îți aranjez ecranul Acasă după asta; poți schimba oricând.</p>
    <div class="ob-f">${OB_FOCUS.map(([k,l,icn,d])=>`<button class="ob-fb ${f.indexOf(k)>=0?'on':''}" data-a="obFocus" data-k="${k}"><span class="ic-s">${ic(icn)}</span><span class="sp"><b>${l}</b><span>${d}</span></span><span class="setup-c">${f.indexOf(k)>=0?ic('check'):''}</span></button>`).join('')}</div>`;
  else if(OB.step===2) body=`<div class="eyebrow">Pasul 2 din 3</div><div class="h1">Câteva cifre</div><p class="mu">Opționale. Le folosesc pentru zonele de puls, forța relativă și ținte. Le poți completa și mai târziu.</p>
    <div class="chips" style="margin-top:14px">${[['m','Bărbat'],['f','Femeie']].map(s=>`<button class="chip ${OB.sex===s[0]?'on':''}" data-a="obSex" data-k="${s[0]}">${s[1]}</button>`).join('')}</div>
    <div class="form"><div class="fld"><label for="obAge">Vârstă</label><input class="inp" id="obAge" type="number" inputmode="numeric" value="${S.prof&&S.prof.age?P.age:''}" placeholder="ani"></div>
      <div class="fld"><label for="obH">Înălțime (cm)</label><input class="inp" id="obH" type="number" inputmode="numeric" value="${S.prof&&S.prof.h?P.h:''}" placeholder="cm"></div>
      <div class="fld"><label for="obW">Greutatea de azi (kg)</label><input class="inp" id="obW" type="number" step="0.1" inputmode="decimal" placeholder="${ws?num(ws.last.w):'kg'}"></div>
      ${f.indexOf('body')>=0?`<div class="fld"><label for="obG">Greutate țintă (kg)</label><input class="inp" id="obG" type="number" step="0.1" inputmode="decimal" value="${S.prof&&S.prof.goalW?P.goalW:''}" placeholder="opțional"></div>`:''}
      ${f.indexOf('k1')>=0?`<div class="fld ${f.indexOf('body')>=0?'':'full'}"><label for="obK">Ținta pe 1 km (min:sec)</label><input class="inp" id="obK" inputmode="text" placeholder="ex: 4:00" value="${k1Goal()?fmtClock(k1Goal().t):''}"></div>`:''}</div>`;
  else body=`<div class="eyebrow">Pasul 3 din 3</div><div class="h1">Cum arată</div><p class="mu">Negru adânc sau alb curat. Se schimbă pe loc.</p>
    <div class="swatches">${[['dark','Întunecată','#050505'],['light','Luminoasă','#F4F5F7'],['auto','Automată','linear-gradient(135deg,#050505 50%,#F4F5F7 50%)']].map(([k,l,c])=>`<button class="swatch mode ${OB.mode===k?'on':''}" style="--c1:var(--mu)" data-a="obMode" data-k="${k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div>
    <div class="note">Mai departe, pe Acasă găsești o listă scurtă cu ce merită configurat (check-in, obiectiv, copia datelor). Antrenorul AI și Strava sunt în Setări, opționale.</div>`;
  r.innerHTML=`<div class="onb"><div class="onb-in">${dots}<div class="onb-step">${body}</div>
    <div class="onb-act">${OB.step>0?`<button class="btn ghost" data-a="obBack">${ic('left')} Înapoi</button>`:''}
      ${OB.step===2?`<button class="btn ghost" data-a="obSkip">Sari</button>`:''}
      <button class="btn pri xl glow" data-a="obNext">${OB.step===0?'Începem':OB.step===3?ic('check')+' Gata':'Continuă '+ic('right')}</button></div></div></div>`;
}
async function onbNext(){
  if(OB.step===1){ await save('prof',Object.assign({},S.prof||{},{focus:OB.focus}));
    /* layoutul de pe Acasă, după ce urmărești */
    const f=OB.focus, o=['next','week','brief','insights'].concat(f.indexOf('k1')>=0?['k1']:[],['goals','prs'],f.indexOf('run')>=0||f.indexOf('k1')>=0?['run']:[],f.indexOf('body')>=0?['body']:[],['std','trend','recent']);
    if(f.indexOf('plan')<0) o.splice(o.indexOf('week'),1); if(!(S.dash||{}).o) await save('dash',Object.assign({},S.dash||{},{o:[...new Set(o)],p:''})); }
  if(OB.step===2){ const g=id=>parseFloat(String(($('#'+id)||{}).value||'').replace(',','.')), o={sex:OB.sex};
    const a=g('obAge'), h=g('obH'), w=g('obW'), gw=g('obG'); if(a>=10&&a<=100) o.age=a; if(h>=120&&h<=230) o.h=h;
    if(w>30&&w<400){ const ww=Object.assign({},S.weights); ww[todayKey()]=Math.round(w*10)/10; await save('weights',ww); if(!(S.prof||{}).startW) o.startW=Math.round(w*10)/10; }
    if(gw>30&&gw<400) o.goalW=gw; await save('prof',Object.assign({},S.prof||{},o));
    const kt=parseTime(($('#obK')||{}).value); if(kt&&kt>=120&&kt<=900){ const b=k1Best(), old=k1Goal(), gl=old?Object.assign({},old,{t:kt}):{id:'g'+Date.now().toString(36),k:'k1',t:kt,d0:todayKey(),by:null,from:b?b.sec:null};
      await save('goals',(S.goals||[]).filter(x=>x.k!=='k1').concat([gl])); } }
  if(OB.step===3){ await save('onb',true); OB=null; onbRender(); STC=null; render(); toast('Totul e pregătit','Spor la antrenament!'); return; }
  OB.step++; onbRender();
}
ACT.obFocus=(el,{k})=>{ const i=OB.focus.indexOf(k); if(i>=0) OB.focus.splice(i,1); else OB.focus.push(k); onbRender(); };
ACT.obSkip=()=>{ OB.step=3; onbRender(); };
ACT.obMode=async(el,{k})=>{ OB.mode=k; await save('mode',k); applyTheme(); onbRender(); };
