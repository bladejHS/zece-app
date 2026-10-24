/* =====================================================================
   11 · CRONOMETRU DE INTERVALE
   ===================================================================== */
const TM={open:false,st:null,choose:null,list:false};
const P_EMOM=()=>({title:'EMOM 10 min',kind:'emom',ph:[{k:'prep',d:10,l:'Pregătește-te',s:'Minutul 1: 6 Med Ball Chest Throws'}].concat(Array.from({length:10},(_,i)=>({k:'work',d:60,l:'Minutul '+(i+1)+'/10',s:i%2===0?'6 Med Ball Chest Throws':'8 Plyo Push Ups'})))});
const P_AMRAP=()=>({title:'AMRAP 10 min',kind:'amrap',amrap:true,ph:[{k:'prep',d:10,l:'Pregătește-te',s:'Numără rundele cu butonul mare'},{k:'work',d:600,l:'AMRAP',s:'10 Wall Balls · 10 Burpee Broad Jumps · 10 KB Swings · 10 Push Ups'}]});
const P_ENGINE=()=>{ const ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Runda 1: 250 m Ski sau Row'}]; for(let i=1;i<=8;i++){ ph.push({k:'manual',l:'Runda '+i+'/8',s:'250 m Ski sau Row — apasă când termini'}); if(i<8) ph.push({k:'rest',d:45,l:'Pauză',s:'Urmează runda '+(i+1)}); } return {title:'Engine Builder 8 runde',kind:'engine',ph}; };
const P_STRETCH=()=>{ const ph=[{k:'prep',d:5,l:'Pregătește-te',s:'Prima: '+STRETCHES[0][0]}]; STRETCHES.forEach(([n,how],i)=>{ ph.push({k:'work',d:45,l:n,s:how+' · '+(i+1)+'/10',half:/la semnal/.test(how)}); if(i<9) ph.push({k:'rest',d:15,l:'Schimbă',s:'Urmează: '+STRETCHES[i+1][0]}); }); return {title:'Stretching 45s × 10',kind:'stretch',ph}; };
const P_MOBILITY=()=>{ const ph=[{k:'prep',d:5,l:'Pregătește-te',s:'Prima: '+MOBILITY[0][0]}]; MOBILITY.forEach(([n,d,how,h],i)=>{ ph.push({k:'work',d,l:n,s:how,half:!!h}); if(i<MOBILITY.length-1) ph.push({k:'rest',d:10,l:'Schimbă',s:'Urmează: '+MOBILITY[i+1][0]}); }); return {title:'Mobility flow · 12 min',kind:'mobility',ph}; };
const P_WARMUP=()=>{ const ph=[{k:'prep',d:5,l:'Pregătește-te',s:'Încălzire generală înainte de greutăți'}]; WARMUP.forEach(([n,d,how])=>ph.push({k:'work',d,l:n,s:how})); return {title:'Încălzire pentru forță · 5 min',kind:'warmup',ph}; };
const P_WARMRUN=()=>{ const ph=[{k:'prep',d:5,l:'Pornește',s:'Alergare ușoară'},{k:'work',d:600,l:'Alergare ușoară',s:'Zona 1–2, relaxat',half:true}];
  DRILLS.slice(0,4).forEach(([n,how])=>{ ph.push({k:'work',d:30,l:n,s:how}); ph.push({k:'rest',d:30,l:'Mers înapoi',s:'Revino la pas'}); });
  for(let i=1;i<=4;i++){ ph.push({k:'work',d:20,l:'Accelerare '+i+'/4',s:'Până la ~90% din viteză, relaxat'}); if(i<4) ph.push({k:'rest',d:40,l:'Pas',s:'Respiră, urmează accelerarea '+(i+1)}); }
  return {title:'Încălzire · alergare + drills',kind:'warmrun',ph}; };
const P_BREATH=()=>{ const ph=[]; for(let i=1;i<=19;i++) [['Inspiră','pe nas, lent'],['Ține','aerul'],['Expiră','pe gură, complet'],['Ține','plămânii goi']].forEach(([l,s])=>ph.push({k:'breath',d:4,l,s:s+' · ciclul '+i+'/19'})); return {title:'Respirație 4-4-4-4',kind:'breath',ph}; };
const P_FREE=()=>({title:'Cronometru liber',kind:'free',ph:[{k:'manual',l:'Cronometru',s:'Apasă Gata când termini'}]});
function P_THR(w,rOv){ const p=runPlan(), r=rOv||p.thr.r[w]||4, m=p.thr.m, rs=p.thr.rest, ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Prima repriză la ritm de prag'}];
  for(let i=1;i<=r;i++){ ph.push({k:'work',d:m*60,l:'Repriza '+i+'/'+r,s:'Ritm de prag — controlat, egal'}); if(i<r) ph.push({k:'rest',d:rs,l:'Jog ușor',s:'Urmează repriza '+(i+1)}); }
  return {title:'Threshold '+r+' × '+mmss(m),kind:'thr',ph}; }
/* v29: cardio-ul Z2 din planul Wolf, cu pulsul țintă din zonele tale */
function tmPresetFor(e,day,w){
  if(e.kind==='cardio'&&e.planMin){ const H=cdHr(); return {title:e.n,kind:'cardio',cd:true,ph:[{k:'prep',d:5,l:'Pornește',s:'Zona 2'},{k:'work',d:e.planMin*60,l:e.n,s:'Zona 2 · '+H.z2[0]+'–'+H.z2[1]+' bpm, poți vorbi în propoziții întregi',half:true}]}; }
  if(e.n==='Threshold') return P_THR(w,e.iv);
  if(/^(Easy run|Long run)/.test(e.n)&&e.planMin) return {title:e.n,kind:'run',run:true,ph:[{k:'prep',d:5,l:'Pornește',s:'Zona 2'},{k:'work',d:e.planMin*60,l:e.n,s:'Zona 2 — poți vorbi în propoziții întregi',half:true}]};
  if(/^Power finisher/.test(e.n)) return P_EMOM();
  if(/^Conditioning/.test(e.n)) return {choose:true,title:'Conditioning'};
  if(e.n==='Stretching') return P_STRETCH();
  if(e.n==='Mobility flow') return P_MOBILITY();
  if(e.n==='Warm up'&&/drills/.test(e.p)) return P_WARMRUN();
  if(/^Deep breathing/.test(e.n)) return P_BREATH();
  if(e.n==='Plank'){ const ph=[{k:'prep',d:5,l:'Pregătește-te',s:'Pe antebrațe, corpul drept'}]; for(let i=1;i<=3;i++){ ph.push({k:'work',d:50,l:'Planșă '+i+'/3',s:'Abdomen și fesieri strânși, respiră normal'}); if(i<3) ph.push({k:'rest',d:45,l:'Pauză',s:'Urmează planșa '+(i+1)}); } return {title:'Plank 3 × 50 s',kind:'plank',ph}; }
  if(/Foam roll/.test(e.n)) return {title:e.n,ph:[{k:'work',d:300,l:e.n,s:'Insistă pe zonele tensionate'}]};
  const m=/(\d+)(?:–(\d+))?\s*min/.exec(e.p); if(m){ const mins=Math.round((+m[1]+ +(m[2]||m[1]))/2); return {title:e.n,ph:[{k:'prep',d:5,l:'Pregătește-te',s:''},{k:'work',d:mins*60,l:e.n,s:e.p}]}; }
  return null;
}
const TM_LIST=()=>{ const nx=nextDay(), w=nx?nx.w:0; return [
  ['cz2','heart','Cardio Z2 · '+cdZ2Min()+' min','Cardio-ul din plan, cu pulsul țintă',()=>{ const H=cdHr(); return {title:'Cardio Z2',kind:'cardio',ph:[{k:'prep',d:5,l:'Pornește',s:'Zona 2'},{k:'work',d:cdZ2Min()*60,l:'Cardio Z2',s:'Zona 2 · '+H.z2[0]+'–'+H.z2[1]+' bpm',half:true}]}; }],
  ['emom','bolt','EMOM 10 min','Power finisher de vineri',P_EMOM],['amrap','flame','AMRAP 10 min','Conditioning B de miercuri',P_AMRAP],
  ['engine','refresh','Engine Builder','Conditioning A: 8 runde × 250 m',P_ENGINE],['stretch','leaf','Stretching 45/15','10 întinderi',P_STRETCH],
  ['wup','flame','Încălzire pentru forță','5 minute înainte de greutăți',P_WARMUP],['warmrun','run','Încălzire de alergare','10 min ușor + drills + accelerări',P_WARMRUN],
  ['mob','leaf','Mobility flow','11 mișcări ghidate, 12 minute',P_MOBILITY],['breath','sun','Respirație 4-4-4-4','5 minute de calm',P_BREATH],['lt30','heart','Test de prag · 30 min','Pulsul și ritmul de prag, ghidat',()=>P_LT30()],['free','clock','Cronometru liber','Pornește, apasă Gata când termini',P_FREE]]; };
function tmOpen(pr,from){
  TM.open=true; TM.list=false; TM.choose=null;
  if(pr.choose){ TM.choose={from}; tmRender(); return; }
  TM.st=Object.assign({},pr,{i:0,t0:null,pAt:null,pausedMs:0,start:null,done:false,rounds:0,laps:[],from:from==null?null:from,total:0});
  keepAwake(true); tmRender();
}
const tmPh=()=>TM.st.ph[TM.st.i];
function tmEl(){ const st=TM.st; if(!st||!st.t0) return 0; return ((st.pAt||Date.now())-st.t0)/1000; }
function tmGo(){ const st=TM.st; st.start=Date.now(); st.t0=Date.now(); st.started=true; actxGet(); keepAlive(true); tmSched(); tmRender(); voxStyleFor(st,tmPh(),tmPh().d); cuesFor(st); say(voxPhase(tmPh(),st)); }
const spSay=v=>{ const r=Math.round(v*10)/10, i=Math.floor(r), d=Math.round((r-i)*10); return i+(d?' virgulă '+d:''); };
/* ce spune vocea la fiecare bucată: voxPhase (085-voice.js), cu încurajări unde nu e un cronometru calm */
const tmSay=p=>say(voxPhase(p,TM.st));
function tmSched(){
  cancelSched('tm'); const st=TM.st; if(!st||!st.started||st.done||st.pAt) return;
  const list=[]; let j=st.i, cur=st.ph[j]; if(cur.d==null) return;
  let t=cur.d-tmEl();
  if(cur.half&&tmEl()<cur.d/2){ const h=cur.d/2-tmEl(); list.push([h,990,.1],[h+.2,990,.1]); }
  if(cur.d>=300&&t>60) list.push([t-60,880,.08],[t-59.8,880,.08]);
  while(true){
    const ph=st.ph[j], nx=st.ph[j+1];
    if(ph.k!=='breath'&&ph.d>=6) list.push([t-3,880,.06],[t-2,880,.06],[t-1,880,.06]);
    if(!nx){ list.push([t,660,.12],[t+.15,880,.12],[t+.3,1320,.25]); break; }
    list.push(ph.k==='breath'?[t,nx.l==='Inspiră'?660:520,.12,.18]:[t,nx.k==='rest'?660:1320,.25]);
    if(nx.d==null) break;
    if(nx.half) list.push([t+nx.d/2,990,.1],[t+nx.d/2+.2,990,.1]);
    t+=nx.d; j++; if(list.length>400) break;
  }
  schedule('tm',list);
}
function tmAdvance(over,auto){
  const st=TM.st; if(tmPh().k==='manual') st.laps.push(tmEl());
  if(st.i>=st.ph.length-1){ tmFinish(auto); return; }
  st.i++; st.t0=Date.now()-(over||0)*1000; if(!auto) tmSched();
  const np=tmPh(); if(np.k!=='breath'&&!tmCalm(st)) UI.shutter(np.k==='rest'?'Pauză':np.l,np.k==='rest');
  buzz(np.k==='rest'?[80]:[150,60,150]); tmRender(); voxStyleFor(st,np,np.d); cuesFor(st); tmSay(np);
}
function tmTick(){
  const st=TM.st; if(!st||!st.started||st.done||st.pAt) return;
  let g=0; while(!st.done&&tmPh().d!=null&&tmEl()>=tmPh().d&&g++<500) tmAdvance(tmEl()-tmPh().d,true);
  voxTick(st);
  tmPaint();
}
function tmFinish(auto){
  const st=TM.st; st.done=true; st.total=(Date.now()-st.start-st.pausedMs)/1000; cancelSched('tm'); cancelSched('cue'); voxStyleFor(null,null);
  if(!auto){ beep(660,.12); setTimeout(()=>beep(880,.12),150); setTimeout(()=>beep(1320,.25),300); }
  if(!S.sess){ keepAlive(false); keepAwake(false); }
  /* rezultatul intră în istoricul de conditioning (folosit de profilul atletului) */
  if(st.kind&&st.total>=20) save('tmlog',(S.tmlog||[]).concat([{date:todayKey(),kind:st.kind,title:st.title,total:Math.round(st.total),rounds:st.rounds||0,laps:(st.laps||[]).map(x=>Math.round(x)),hr:(h=>h?{avg:h.avg,max:h.max}:undefined)(hrSum(st.hr))}]));
  burstAt(innerWidth/2,innerHeight*.35,40); buzz([100,60,100,60,250]); tmRender(); say(tmCalm(st)?mot('calmDone'):voxEnc()?mot('done'):'Gata!');
}
function tmPaint(){
  const st=TM.st; if(!st||!st.started||st.done) return; const ph=tmPh(), el=tmEl();
  const tEl=$('#tmTime'); if(tEl) tEl.textContent=fmtClock(ph.d!=null?Math.ceil(Math.max(0,ph.d-el)):el);
  const left=ph.d!=null?ph.d-el:null, f=ph.d!=null?clamp(el/ph.d,0,1):(el%60)/60;
  UI.setGauge($('#tmGauge'),f,left!=null&&left<=3); voxStyleFor(st,ph,left);
  if(left!=null&&ph.k!=='breath'&&ph.d>=6) UI.countdownCue(tEl,$('#tmFlash'),left,buzz);
  const tot=$('#tmTot'); if(tot) tot.textContent=fmtClock(((st.pAt||Date.now())-st.start-st.pausedMs)/1000);
  const hz=$('#tmHrz'); if(hz&&ph.hr){ const lv=hrLive(), b=HR.bpm, c=!lv?'':b<ph.hr[0]?'lo':b>ph.hr[1]?'hi':'ok';
    hz.className='tm-hrz '+c; hz.textContent=lv?b+' bpm · '+(c==='ok'?'în țintă':c==='hi'?'peste țintă: scade 0,3 km/h':'sub țintă'):'țintă puls '+ph.hr[0]+'–'+ph.hr[1]; }
}
function tmRender(){
  const r=$('#tmRoot'); if(!TM.open){ r.innerHTML=''; cancelSched('cue'); voxStyleFor(null,null); updLock(); return; }
  document.body.classList.add('lock');
  const top=(t)=>`<div class="fx-top"><button class="ib" data-a="tmClose" ${TM.st&&TM.st.started&&!TM.st.done?'data-confirm="Stop?"':''} aria-label="Închide">${ic('x')}</button>
    <div class="fx-tt"><div class="eyebrow">Cronometru</div><div class="t">${esc(t)}</div></div>${hrChip()}${TM.st&&TM.st.started&&!TM.st.done?`<div class="fx-clock" id="tmTot">0:00</div>`:''}</div>`;
  if(TM.list){ r.innerHTML=`<div class="tm"><div class="tm-in">${top('Alege un program')}<div class="tm-list">${TM_LIST().map(t=>`<button class="tm-pick" data-a="tmPick" data-k="${t[0]}"><span class="ic">${ic(t[1])}</span><span><b>${esc(t[2])}</b><span>${esc(t[3])}</span></span></button>`).join('')}</div></div></div>`; return; }
  if(TM.choose){ r.innerHTML=`<div class="tm"><div class="tm-in">${top('Conditioning')}<div class="tm-list">
      <button class="tm-pick" data-a="tmPick" data-k="engine"><span class="ic">${ic('refresh')}</span><span><b>A · Engine Builder</b><span>8 runde pentru timp: 250 m Ski/Row, 45s pauză</span></span></button>
      <button class="tm-pick" data-a="tmPick" data-k="amrap"><span class="ic">${ic('flame')}</span><span><b>B · Hybrid Circuit</b><span>AMRAP 10 min: Wall Balls, Burpee Broad Jumps, KB Swings, Push Ups</span></span></button></div></div></div>`; return; }
  const st=TM.st, ph=tmPh();
  const totalD=st.ph.reduce((a,p)=>a+(p.d||0),0), works=st.ph.filter(p=>p.k==='work'||p.k==='manual');
  if(!st.started){
    r.innerHTML=`<div class="tm"><div class="tm-in">${top(st.title)}
      <div class="tm-ring">${UI.gauge()}
        <div class="c"><div><div class="tm-lbl">Gata?</div><div class="tm-time">${totalD?fmtClock(totalD):'∞'}</div><div class="tm-sub">${st.kb?works.length+(works.length===1?' rundă':' runde')+' × '+fmtClock(st.kb.rs):works.length+' '+(works.length===1?'bloc':'blocuri')+' de lucru'}${st.ph.some(p=>p.k==='manual')?' · rundele se termină când apeși tu':''}</div></div></div></div>
      ${st.ph.some(p=>p.sp)?`<div class="tm-spl">${st.ph.filter(p=>p.sp&&p.k!=='prep').filter((p,i,a)=>i===0||p.l.replace(/\d+\/\d+/,'')!==a[i-1].l.replace(/\d+\/\d+/,'')).slice(0,6).map(p=>`<span><b>${num(p.sp,1)}</b> km/h · ${esc(p.l.replace(/ \d+\/\d+/,''))}</span>`).join('')}</div>`:''}
      <div class="note" style="text-align:center">Sunetele te anunță la fiecare schimbare, inclusiv cu telefonul blocat (lasă volumul pornit).${st.ph.some(p=>p.sp)?' Vocea îți spune viteza la fiecare bucată.':''}</div>
      <div class="tm-ctl" style="grid-template-columns:1fr"><button class="btn pri xl glow" data-a="tmGo">${ic('play')} Start</button></div></div></div>`; return; }
  if(st.done){
    r.innerHTML=`<div class="tm"><div class="tm-in">${top(st.title)}
      <div class="sum-h"><div class="cc-ic">${ic('trophy')}</div><div class="h1">Gata!</div><div class="mu">${esc(st.title)}</div></div>
      <div class="kpis"><div class="kpi"><div class="k">Timp total</div><div class="v">${fmtClock(st.total)}</div></div>
        ${st.amrap?`<div class="kpi"><div class="k">Runde</div><div class="v">${st.rounds}</div></div>`:''}
        ${st.laps.length?`<div class="kpi"><div class="k">Runda medie</div><div class="v">${fmtClock(st.laps.reduce((a,b)=>a+b,0)/st.laps.length)}</div></div>`:''}</div>
      ${st.laps.length>1?`<div class="card">${st.laps.map((l,i)=>`<div class="list-row"><span>Runda ${i+1}</span><span class="v">${fmtClock(l)}</span></div>`).join('')}</div>`:''}
      ${st.kind==='lt30'?lt30Form(st):st.kind==='tread'&&st.from==null?treadDone(st):''}
      <div class="tm-ctl" style="grid-template-columns:1fr">${st.from!=null&&S.sess?`<button class="btn pri xl" data-a="tmApply">${ic('check')} ${st.run?'Folosește timpul: '+num(st.total/60,1)+' min':'Marchează exercițiul ca făcut'}</button>`:''}
        <button class="btn ghost" data-a="tmClose" ${st.kb?'data-confirm="Închizi fără să notezi?"':''}>Închide</button></div></div></div>`; return; }
  const next=st.ph[st.i+1], cls=ph.k==='rest'?'rest':ph.k==='prep'?'prep':'';
  const dots=st.ph.length<=40?`<div class="tm-dots">${st.ph.filter(p=>p.k!=='prep').map((p,i)=>{ const idx=st.ph.indexOf(p); return `<i class="${idx<st.i?'ok':idx===st.i?'cur':''}"></i>`; }).join('')}</div>`:'';
  r.innerHTML=`<div class="tm ${cls}"><div class="tm-in">${top(st.title)}
    <div class="tm-flash" id="tmFlash" aria-hidden="true"></div>
    <div class="tm-ring">${UI.gauge()}
      <div class="c"><div><div class="tm-lbl">${esc(ph.l)}</div><div class="tm-time" id="tmTime">0:00</div><div class="tm-sub">${esc(ph.s||'')}</div></div></div></div>
    ${ph.sp?`<div class="tm-spd"><b>${num(ph.sp,1)}</b><small>km/h</small><span>${mmss(60/ph.sp)} /km</span></div>`:''}${ph.hr?`<div class="tm-hrz" id="tmHrz">țintă puls ${ph.hr[0]}–${ph.hr[1]}</div>`:''}
    ${st.amrap&&ph.k==='work'?`<div class="tm-next">Runde: <b id="tmRounds">${st.rounds}</b></div>`:''}
    ${next?`<div class="tm-next">Urmează: <b>${esc(next.l)}</b>${next.d?' · '+fmtClock(next.d):''}${next.sp?' · <b>'+num(next.sp,1)+' km/h</b>':''}</div>`:`<div class="tm-next">Ultimul bloc</div>`}
    ${dots}
    <div class="tm-ctl">
      ${ph.k==='manual'?`<button class="btn pri xl glow" style="grid-column:1/-1" data-a="tmLap">${ic('check')} ${st.ph.length===1?'Gata':'Gata runda'}</button>`:''}
      ${st.amrap&&ph.k==='work'?`<button class="btn pri xl" style="grid-column:1/-1" data-a="tmRound">${ic('plus')} Rundă terminată</button>`:''}
      <button class="btn xl" data-a="tmPause">${st.pAt?ic('play')+' Continuă':ic('pause')+' Pauză'}</button>
      <button class="btn xl ghost" data-a="tmSkip">${ic('skip')} Sari</button></div></div></div>`;
  tmPaint();
}
