/* =====================================================================
   v8 · 1 KM LAB — ținta pe 1 km → ritm, viteză, timpi de trecere (100–1000 m);
   rezultatul actual (doar măsurat) → ACUM · ȚINTĂ · DIFERENȚĂ · PROGRES,
   „cursa cu fantoma" (unde ai fi când ținta trece linia), istoric și un pacer cu semnale sonore.
   ===================================================================== */
const K1_MARKS=[100,200,400,600,800,1000];
const k1Goal=()=>(S.goals||[]).find(g=>g.k==='k1')||null;
/* progresul spre țintă: din punctul de pornire (primul rezultat sau cel de la crearea țintei) până la țintă */
function k1Frac(g,cur){ if(!g||cur==null) return 0; const from=g.from!=null?g.from:(k1Results()[0]||{}).sec; if(from==null||from<=g.t) return cur<=g.t?1:0; return clamp((from-cur)/(from-g.t),0,1); }
function k1Lab(){
  const g=k1Goal(), b=k1Best(), res=k1Results(), tgt=g?g.t:S.k1t||null, cur=b?b.sec:null, tk=todayKey();
  const gap=cur!=null&&tgt?cur-tgt:null, frac=g&&cur!=null?k1Frac(g,cur):null;
  const tg=tgt?{pace:tgt/60,kmh:3600/tgt}:null;
  /* cursa cu fantoma: când ținta trece de 1000 m, tu (la ritmul tău actual, constant) ai fi la … m */
  const ghost=cur&&tgt?Math.min(1000,1000*tgt/cur):null;
  return `<div class="card wide k1-hero"><div class="row" style="align-items:flex-start;flex-wrap:wrap;gap:16px"><div class="sp">
      <div class="eyebrow">${ic('stopwatch')} 1 KM Lab</div><div class="h2" style="margin-top:6px">${tgt?'Ținta: '+fmtClock(tgt):'Setează ținta pe 1 km'}</div>
      <div class="sm mu" style="margin-top:4px">${tgt?`Ritm ${mmss(tg.pace)} /km · ${num(tg.kmh,1)} km/h`:'Scrie timpul pe care vrei să-l alergi și îți calculez ritmul, viteza și timpii de trecere.'}</div></div>
      <div class="k1-in"><input class="inp" id="k1T" inputmode="text" placeholder="ex: 4:00" value="${tgt?fmtClock(tgt):''}" aria-label="Timp țintă pe 1 km"><button class="btn pri" data-a="k1Set">${ic('target')} ${g?'Schimbă':'Setează'}</button></div></div>
    <div class="k1-4"><div><span>Acum</span><b>${cur!=null?fmtClock(cur):'—'}</b><em>${b?esc(b.lbl)+' · '+fmtDay(b.date):'niciun rezultat măsurat'}</em></div>
      <div><span>Țintă</span><b>${tgt?fmtClock(tgt):'—'}</b><em>${g&&g.by?'până la '+fmtDay(g.by):g?'fără termen':'&nbsp;'}</em></div>
      <div><span>Diferență</span><b class="${gap!=null&&gap<=0?'good':''}">${gap==null?'—':gap<=0?'atinsă':fmtClock(gap)}</b><em>${gap!=null&&gap>0?num(gap/tgt*100,1)+'% mai lent':gap!=null?'cu '+fmtClock(-gap)+' sub țintă':'&nbsp;'}</em></div>
      <div><span>Progres</span><b>${frac!=null?Math.round(frac*100)+'%':'—'}</b><em>${g&&g.from!=null?'de la '+fmtClock(g.from):'&nbsp;'}</em></div></div>
    ${frac!=null?`<div class="bar" style="height:8px"><i style="width:${(frac*100).toFixed(1)}%"></i></div>`:''}
    ${ghost!=null?`<div class="k1-race"><div class="k1-trk">${K1_MARKS.map(m=>`<i style="left:${m/10}%"><span>${m}</span></i>`).join('')}
        <b class="k1-me" style="left:${(ghost/10).toFixed(1)}%"><span>tu · ${Math.round(ghost)} m</span></b><b class="k1-tg" style="left:100%"><span>ținta</span></b></div>
      <div class="xs mu" style="margin-top:28px">${ghost>=999?'Ai atins ținta: la ritmul tău treci linia odată cu ea sau înaintea ei.':`Când ținta trece linia de 1000 m, tu, la ritmul de acum (${fmtClock(cur)}, constant), ai fi la <b class="tx">${Math.round(ghost)} m</b>: îți lipsesc <b class="tx">${Math.round(1000-ghost)} m</b>.`}</div></div>`:''}</div>
  ${tgt?`<div class="card"><div class="card-h"><div class="eyebrow">${ic('flag')} Timpii de trecere</div><span class="xs mu">ritm constant</span></div>
      <div class="cmp2 ${cur?'c3':'c2'}"><div class="cmp2-h"><span>Distanța</span><span>Ținta</span>${cur?`<span>Acum</span><span>Diferență</span>`:''}</div>
        ${K1_MARKS.map(m=>{ const t=tgt*m/1000, c=cur?cur*m/1000:null; return `<div class="cmp2-r"><span>${m} m</span><span><b>${fmtSecD(t)}</b></span>${c!=null?`<span>${fmtSecD(c)}</span><span class="${c<=t?'good':'bad'}">${c<=t?'−':'+'}${num(Math.abs(c-t),1)} s</span>`:''}</div>`; }).join('')}</div>
      <div class="note">Pe o pistă de 400 m: tura în <b>${fmtSecD(tgt*.4)}</b>, iar 100 m în <b>${fmtSecD(tgt/10)}</b>. ${cur?'Coloana „Acum" presupune ritmul tău actual, constant pe tot kilometrul.':''}</div></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('play2')} Pacer pe pistă</div></div>
      <div class="sm mu" style="margin-top:6px">Un semnal la fiecare reper, pe ritmul țintei: dacă ești la reper când sună, ești pe ritm. Pornește după încălzire.</div>
      <div class="seg" style="margin-top:12px">${[100,200,400].map(m=>`<button class="${(S.k1Cue||200)===m?'on':''}" data-a="k1Cue" data-i="${m}">la fiecare ${m} m</button>`).join('')}</div>
      <button class="btn pri wide xl" style="margin-top:12px" data-a="k1Pace">${ic('play')} Pornește pacerul · ${fmtClock(tgt)}</button></div>
    <div class="card"><div class="card-h"><div class="eyebrow">${ic('repeat')} Sesiuni-cheie pentru țintă</div><span class="xs mu">calculate din ${fmtClock(tgt)}</span></div>
      ${k1Sessions(tgt).map((s,i)=>`<div class="list-row"><span class="sp"><b>${esc(s.t)}</b><span class="xs mu" style="display:block">${esc(s.d)}</span></span><button class="btn ghost sm" data-a="k1Ses" data-i="${i}">${ic('clock')} Cronometru</button></div>`).join('')}
      <div class="note">Distanțe scurte la ritmul țintei (sau puțin mai rapid), cu pauză completă: înveți ritmul fără să te epuizezi. O singură sesiune de acest fel pe săptămână, pe lângă alergările ușoare din plan.</div></div>`:''}
  <div class="card"><div class="card-h"><div class="eyebrow">${ic('plus')} Notează un rezultat</div></div>
    <div class="form"><div class="fld"><label for="k1R">Timp pe 1 km</label><input class="inp" id="k1R" inputmode="text" placeholder="ex: 4:12"></div>
      <div class="fld"><label for="k1D">Data</label><input class="inp" id="k1D" type="date" value="${tk}" max="${tk}"></div></div>
    <button class="btn pri wide" style="margin-top:12px" data-a="k1Add">${ic('check')} Salvează rezultatul</button>
    <div class="note">Contează doar rezultatele măsurate: testul de 1 km la efort maxim (după 10 min de încălzire), o alergare de exact 1 km, efortul „1K" calculat de Strava sau cel mai rapid km dintr-o alergare cu despărțiri. Estimările din alte distanțe nu intră aici.</div></div>
  <div class="card"><div class="card-h"><div class="eyebrow">${ic('history')} Istoric · ${res.length}</div></div>
    ${res.length>=2?lineChart({pts:res.map(x=>({x:x.date,y:x.sec,note:x.lbl})),goal:tgt||undefined,goalLbl:tgt?'țintă '+fmtClock(tgt):'',inv:true,dots:true,trend:res.length>=4,noArea:true,fmt:v=>fmtClock(v),fmtAx:v=>fmtClock(v),label:'rezultate pe 1 km',minR:10}):''}
    ${res.length?res.slice().reverse().slice(0,12).map(x=>`<div class="list-row"><span class="sp"><b>${fmtClock(x.sec)}</b> <span class="xs mu">${esc(x.lbl)}</span></span><span class="xs mu">${fmtDayY(x.date)}</span>
      ${x.src==='test'?`<button class="xb" data-a="k1Del" data-k="${x.date}" data-i="${x.sec}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button>`:x.i!=null?`<button class="xb nh" data-a="runOpen" data-i="${x.i}" aria-label="Alergarea">${ic('right')}</button>`:''}</div>`).join('')
      :`<div class="empty sm">${ic('stopwatch')}<div>Niciun 1 km măsurat încă.</div></div>`}</div>
  <div class="card"><div class="card-h"><div class="eyebrow">${ic('award')} Reperele de pe 1 km</div></div>
    <div class="ach-g">${achAll().filter(a=>/^k1/.test(a.id)).map(a=>`<div class="ach ${a.done?'on':''}"><span class="ach-i">${ic(a.done?'award':'lock')}</span><b>${esc(a.t)}</b><span>${a.done?fmtDayY(a.date):esc(a.d)}</span></div>`).join('')}</div></div>`;
}
const fmtSecD=s=>s<60?num(s,1)+' s':fmtClock(Math.round(s));
/* sesiunile-cheie: repetări scurte la ritmul țintei, cu pauză completă */
function k1Sessions(t){ const r100=t/10, r200=t/5, r400=t*.4;
  return [{t:'10 × 100 m în '+fmtSecD(r100),d:'pauză 45 s mers · ritmul țintei, relaxat',n:10,w:r100,r:45,l:'100 m'},
    {t:'6 × 200 m în '+fmtSecD(r200),d:'pauză 90 s · ritmul țintei',n:6,w:r200,r:90,l:'200 m'},
    {t:'4 × 400 m în '+fmtSecD(r400+2),d:'pauză 2 min · cu 2 s pe tură peste ritmul țintei',n:4,w:r400+2,r:120,l:'400 m'}]; }
ACT.k1Set=async()=>{ const t=parseTime(($('#k1T')||{}).value); if(!t||t<120||t>900){ shake('#k1T'); return; }
  const old=k1Goal(), b=k1Best(), g=old?Object.assign({},old,{t}):{id:'g'+Date.now().toString(36),k:'k1',t,d0:todayKey(),by:null,from:b?b.sec:null};
  await save('goals',(S.goals||[]).filter(x=>x.k!=='k1').concat([g])); render(); toast('Ținta pe 1 km',fmtClock(t)+' · ritm '+mmss(t/60)+' /km','info'); };
ACT.k1Add=async()=>{ const t=parseTime(($('#k1R')||{}).value), d=($('#k1D')||{}).value||todayKey(); if(!t||t<120||t>1200){ shake('#k1R'); return; }
  const before=k1Best(); await save('ptests',(S.ptests||[]).concat([{type:'k1',value:t,date:d>todayKey()?todayKey():d}]));
  const g=k1Goal(); if(g&&g.from==null){ await save('goals',(S.goals||[]).map(x=>x===g?Object.assign({},x,{from:t}):x)); }
  render(); if(before&&t<before.sec) prMoment({t:'Record pe 1 km',v:fmtClock(t),p:fmtClock(before.sec)}); else toast('Rezultat salvat','1 km în '+fmtClock(t),'info'); };
ACT.k1Del=async(el,{k,I})=>{ const i=(S.ptests||[]).findIndex(x=>x.type==='k1'&&x.date===k&&+x.value===I); if(i<0) return; const old=S.ptests[i];
  await save('ptests',S.ptests.filter((_,j)=>j!==i)); render(); toast('Rezultat șters',fmtClock(I),'info',{l:'Anulează',f:async()=>{ await save('ptests',(S.ptests||[]).concat([old])); render(); }}); };
ACT.k1Cue=(el,{I})=>{ S.k1Cue=I; render(); };
/* pacerul: cronometrul de intervale, cu un reper la fiecare 100/200/400 m pe ritmul țintei */
ACT.k1Pace=()=>{ const g=k1Goal(), t=g?g.t:null; if(!t) return; const cue=S.k1Cue||200, n=1000/cue, d=t*cue/1000, ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Start la semnal · '+n+' repere de '+cue+' m'}];
  for(let i=1;i<=n;i++) ph.push({k:'work',d,l:(i*cue)+' m',s:i<n?'trebuie să fii la '+(i*cue)+' m în '+fmtSecD(d*i):'linia de sosire: '+fmtClock(t)});
  tmOpen({title:'Pacer 1 km · '+fmtClock(t),kind:'pacer',k1:t,ph}); };
ACT.k1Ses=(el,{I})=>{ const g=k1Goal(); if(!g) return; const s=k1Sessions(g.t)[I]; if(!s) return; const ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Prima: '+s.l+' în '+fmtSecD(s.w)}];
  for(let i=1;i<=s.n;i++){ ph.push({k:'work',d:Math.round(s.w),l:s.l+' · '+i+'/'+s.n,s:'în '+fmtSecD(s.w)}); if(i<s.n) ph.push({k:'rest',d:s.r,l:'Pauză',s:'Urmează '+s.l+' '+(i+1)+'/'+s.n}); }
  tmOpen({title:s.t,kind:'k1ses',ph}); };
/* momentul unui record: o carte discretă care se închide singură (doar pentru recorduri care contează) */
function prMoment(o){
  const r=$('#ovRoot'); if(!r||r.firstChild) { toast(o.t,o.v+(o.p?' (înainte '+o.p+')':''),''); return; }
  r.innerHTML=`<div class="celeb" data-a="celebX"><div class="celeb-c pr-m"><div class="rays"><div class="core">${ic('trophy')}</div></div>
    <div class="eyebrow" style="justify-content:center">${esc(o.t)}</div><div class="pr-v">${esc(o.v)}</div>${o.p?`<div class="sm mu">înainte: ${esc(o.p)}</div>`:''}${o.s?`<div class="xs mu2" style="margin-top:6px">${esc(o.s)}</div>`:''}</div></div>`;
  buzz([60,40,60,40,120]); beep(990,.08); setTimeout(()=>beep(1320,.12),110); say(voxEnc()?mot('pr'):'Record nou!');
  clearTimeout(prMoment.t); prMoment.t=setTimeout(()=>{ if(r.querySelector('.pr-m')) r.innerHTML=''; },3800);
}
ACT.celebX=()=>{ const r=$('#ovRoot'); if(r&&r.querySelector('.celeb')) r.innerHTML=''; };
