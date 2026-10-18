/* =====================================================================
   14b · STRAVA — și Polar Beat prin Strava
   Polar Beat → Polar Flow → Strava → ZECE, iar sesiunile ZECE → Strava.
   API-ul Strava acceptă apeluri direct din browser (CORS). Folosim aplicația API
   a utilizatorului: Client ID și Client Secret stau doar pe dispozitiv, nu în cod.
   ===================================================================== */
const ST={busy:false,flushing:false,msg:'',sum:{},pend:null};
const ST_API='https://www.strava.com/api/v3';
const ST_RUN=['Run','TrailRun','VirtualRun'];
const ST_STR=['WeightTraining','Crossfit','Workout','HighIntensityIntervalTraining'];
const ST_TYPES={WeightTraining:'Forță',Workout:'Antrenament',Crossfit:'CrossFit',HighIntensityIntervalTraining:'HIIT',Ride:'Ciclism',VirtualRide:'Ciclism indoor',
  EBikeRide:'Bicicletă electrică',MountainBikeRide:'MTB',GravelRide:'Gravel',Walk:'Mers',Hike:'Drumeție',Swim:'Înot',Rowing:'Canotaj',VirtualRow:'Canotaj indoor',
  Elliptical:'Eliptică',StairStepper:'Scări',Yoga:'Yoga',Pilates:'Pilates',Soccer:'Fotbal',Tennis:'Tenis',Basketball:'Baschet',Volleyball:'Volei',Padel:'Padel',
  Squash:'Squash',Badminton:'Badminton',RockClimbing:'Escaladă',Kayaking:'Caiac',StandUpPaddling:'SUP',Surfing:'Surf',Run:'Alergare',TrailRun:'Trail',VirtualRun:'Alergare indoor'};
const stName=t=>ST_TYPES[t]||String(t||'Activitate').replace(/([a-z])([A-Z])/g,'$1 $2');
const stWait=ms=>new Promise(r=>setTimeout(r,ms));
function stCfg(){ return S.strava||{}; }
function stOn(){ const c=stCfg(); return !!(c.cid&&c.sec&&c.ref); }
function stCanWrite(){ return /activity:write/.test(stCfg().scope||''); }
function stOnline(){ return location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'; }
function stRedirect(){ return location.origin+location.pathname; }
function stAgo(sec){ const m=Math.round((Date.now()/1000-sec)/60); return m<1?'acum':m<60?'acum '+m+' min':m<1440?'acum '+Math.round(m/60)+' h':relDay(keyOf(new Date(sec*1000))); }
/* efortul unei activități importate: cel notat pe Strava, altfel din zona pulsului mediu, altfel 5/10 */
function extRpe(x){ if(+x.rpe>=1) return +x.rpe; if(+x.hr>0) return [2,3,4,6,7,8][hrZone(+x.hr)+1]; return 5; }
async function stPatch(o){ await save('strava',Object.assign({},stCfg(),o)); }
function stErr(code,msg){ const e=new Error(msg||code); e.code=code; return e; }
function stErrText(e){ const c=e&&e.code;
  if(c==='auth') return 'Conexiunea cu Strava a expirat sau a fost retrasă. Apasă „Conectează din nou”.';
  if(c==='limit') return 'Strava limitează numărul de cereri. Încearcă din nou peste 15 minute.';
  if(c==='scope') return 'Strava nu a primit permisiunea de a crea activități. Conectează din nou și lasă bifată opțiunea de upload.';
  if(c==='net') return 'Nu am putut ajunge la Strava (fără internet?). Reîncerc la următoarea deschidere.';
  return 'Strava a răspuns cu o eroare'+(e&&e.message?': '+e.message:'.'); }
async function stTokenReq(params){
  const c=stCfg(); let r;
  try{ r=await fetch('https://www.strava.com/oauth/token',{method:'POST',body:new URLSearchParams(Object.assign({client_id:c.cid,client_secret:c.sec},params))}); }catch(e){ throw stErr('net'); }
  const j=await r.json().catch(()=>({}));
  if(r.status===429) throw stErr('limit');
  if(r.status===400||r.status===401) throw stErr('auth',j&&j.message);
  if(!r.ok||!j||!j.access_token) throw stErr('http',(j&&j.message)||'HTTP '+r.status);
  return j;
}
async function stToken(force){
  const c=stCfg(); if(!c.ref) throw stErr('auth');
  if(!force&&c.tok&&+c.exp>Date.now()/1000+120) return c.tok;
  const j=await stTokenReq({grant_type:'refresh_token',refresh_token:c.ref});
  await stPatch({tok:j.access_token,ref:j.refresh_token||c.ref,exp:j.expires_at});
  return j.access_token;
}
async function stApi(method,path,body){
  for(let attempt=0;attempt<2;attempt++){
    const tok=await stToken(attempt>0); let r;
    try{ r=await fetch(ST_API+path,{method,headers:{Authorization:'Bearer '+tok},body:body||undefined}); }catch(e){ throw stErr('net'); }
    if(r.status===401&&attempt===0) continue;
    if(r.status===401) throw stErr('auth');
    if(r.status===403) throw stErr('scope');
    if(r.status===429) throw stErr('limit');
    const j=await r.json().catch(()=>null);
    if(!r.ok) throw stErr('http',(j&&j.message)||'HTTP '+r.status);
    return j;
  }
}
function stAuthUrl(state){
  return 'https://www.strava.com/oauth/authorize?'+new URLSearchParams({client_id:stCfg().cid,response_type:'code',redirect_uri:stRedirect(),approval_prompt:'auto',scope:'read,activity:read_all,activity:write',state}).toString();
}
function stConnect(){
  const c=stCfg(); if(!c.cid||!c.sec) return;
  const state=Math.random().toString(36).slice(2,12); try{ localStorage.setItem('zece3:stState',state); }catch(e){}
  location.href=stAuthUrl(state);
}
/* întoarcerea din Strava: ?state=…&code=…&scope=… (sau ?error=access_denied) */
async function stCallback(search){
  const q=new URLSearchParams(search||''); if(!q.has('code')&&!q.has('error')) return;
  let exp=null; try{ exp=localStorage.getItem('zece3:stState'); localStorage.removeItem('zece3:stState'); }catch(e){}
  try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){}
  if(!exp||q.get('state')!==exp) return;
  S.tab='set';
  if(q.get('error')){ ST.msg='Ai refuzat accesul în Strava. Poți încerca din nou oricând.'; return; }
  try{ const j=await stTokenReq({code:q.get('code'),grant_type:'authorization_code'}), a=j.athlete||{};
    await stPatch({tok:j.access_token,ref:j.refresh_token,exp:j.expires_at,scope:q.get('scope')||'',ath:{id:a.id||null,name:[a.firstname,a.lastname].filter(Boolean).join(' ')},err:''});
    ST.msg=''; toast('Strava conectat',(a.firstname?'Salut, '+a.firstname+'! ':'')+'Aduc antrenamentele din ultimele 60 de zile.','info');
    setTimeout(()=>stSync(true),300);
  }catch(e){ ST.msg=stErrText(e); }
}
function stRender(){ const a=document.activeElement; if(S.sess||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return; render(); }
function stPaint(){ const b=$('#stSyncBtn'); if(b){ b.disabled=ST.busy; b.innerHTML=ic('refresh')+(ST.busy?' Sincronizez…':' Sincronizează'); } }
async function stSync(manual){
  if(!stOn()||ST.busy) return; ST.busy=true; ST.msg=''; stPaint();
  let n=null;
  try{
    const c=stCfg(), now=Math.floor(Date.now()/1000), after=c.last?c.last-3*86400:now-60*86400;
    let all=[]; for(let p=1;p<=10;p++){ const a=await stApi('GET','/athlete/activities?after='+after+'&per_page=100&page='+p); if(!Array.isArray(a)||!a.length) break; all=all.concat(a); if(a.length<100) break; }
    n=await stIngest(all); await stPatch({last:now,err:''});
  }catch(e){ ST.msg=stErrText(e); await stPatch({err:ST.msg}); }
  ST.busy=false;
  if(n&&(manual||n.runs||n.ext)) toast('Strava sincronizat',n.runs||n.ext?[n.runs?n.runs+(n.runs===1?' alergare nouă':' alergări noi'):'',n.ext?n.ext+(n.ext===1?' alt antrenament nou':' alte antrenamente noi'):''].filter(Boolean).join(' · '):'Nimic nou de la ultima sincronizare.','info');
  else if(!n&&manual) toast('Strava',ST.msg,'info');
  if(manual||(n&&(n.runs||n.ext))||S.tab==='set') stRender(); else stPaint();
  if(n) await stFlush();
}
function stAuto(){ if(!stOn()||ST.busy||S.sess) return; const c=stCfg(); if(!c.last||Date.now()/1000-c.last>1800) stSync(false); else if((S.stq||[]).length) stFlush(); }
/* sesiunea ZECE din care vine o activitate importată (același antrenament înregistrat și în Polar Beat) */
function stOverlapsZece(x){ const end=x.start+(x.el||x.min||0)*60000;
  return (S.hist||[]).some(h=>h.end&&h.dur&&x.start<h.end+5*60000&&end>h.end-h.dur*1000-5*60000); }
async function stIngest(list){
  const c=stCfg(), own=new Set((c.own||[]).map(String)), del=new Set((c.del||[]).map(String));
  const runs=(S.runs||[]).slice(), ext=(S.ext||[]).slice(); let nr=0, ne=0, ch=false;
  for(const a of list||[]){
    if(!a||a.id==null) continue; const id=String(a.id);
    if(own.has(id)||del.has(id)||/^zece-/.test(a.external_id||'')) continue;
    const t=a.sport_type||a.type, date=String(a.start_date_local||'').slice(0,10); if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const km=Math.round((+a.distance||0)/10)/100, min=Math.round((+a.moving_time||+a.elapsed_time||0)/6)/10, hr=+a.average_heartrate>0?Math.round(+a.average_heartrate):null;
    if(ST_RUN.indexOf(t)>=0){
      if(!(km>0)) continue;
      const ix=runs.findIndex(r=>String(r.sid)===id);
      /* câmpuri în plus din rezumatul Strava (fără cereri suplimentare): elevație, cadență, puls maxim, viteză maximă, nume */
      const ex={}; if(a.total_elevation_gain!=null) ex.elev=+a.total_elevation_gain; if(+a.average_cadence>0) ex.cad=Math.round(+a.average_cadence*2);
      if(+a.max_heartrate>0) ex.hrMax=Math.round(+a.max_heartrate); if(+a.max_speed>0) ex.maxSpd=+a.max_speed; if(a.name) ex.name=String(a.name).slice(0,60);
      if(ix>=0){ const r=runs[ix]; if(r.km!==km||r.min!==min||r.date!==date||Object.keys(ex).some(k=>r[k]!==ex[k])){ runs[ix]=Object.assign({},r,{date,km,min},ex); ch=true; } continue; }
      const tw=runs.findIndex(r=>!r.sid&&r.date===date&&Math.abs((+r.km||0)-km)<=Math.max(.3,km*.05));
      if(tw>=0){ runs[tw]=Object.assign({},runs[tw],{sid:id},hr&&!runs[tw].hr?{hr}:{}); ch=true; continue; }
      const kind=a.workout_type===2||km>=14||min>=80?'lng':a.workout_type===1||a.workout_type===3?'thr':'ez';
      const run=Object.assign({date,kind,km,min,src:'strava',sid:id},ex); if(hr) run.hr=hr; if(+a.perceived_exertion>=1) run.rpe=Math.round(+a.perceived_exertion);
      runs.push(run); nr++; ch=true;
    } else {
      const start=Date.parse(a.start_date)||parseKey(date).getTime();
      const x={sid:id,date,start,type:t||'Workout',name:String(a.name||'').slice(0,60),min,el:Math.round((+a.elapsed_time||0)/60),km:km>0?km:0};
      if(hr) x.hr=hr; if(+a.max_heartrate>0) x.hrMax=Math.round(+a.max_heartrate); if(+a.perceived_exertion>=1) x.rpe=Math.round(+a.perceived_exertion);
      x.dup=stOverlapsZece(x);
      const ix=ext.findIndex(e=>String(e.sid)===id); if(ix>=0) ext[ix]=Object.assign({},ext[ix],x); else { ext.push(x); ne++; } ch=true;
    }
  }
  if(ch){ await save('runs',runs); await save('ext',ext.sort((a,b)=>(a.start||0)-(b.start||0)).slice(-3000)); }
  return {runs:nr,ext:ne};
}
function stIso(ms){ const d=new Date(ms), o=-d.getTimezoneOffset(), ao=Math.abs(o);
  return keyOf(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())+(o>=0?'+':'-')+pad(Math.floor(ao/60))+':'+pad(ao%60); }
function stTCX(it){
  const z=ms=>new Date(ms).toISOString().replace(/\.\d{3}Z$/,'Z'), t0=it.t0||it.start;
  const tp=(it.pts||[]).map((b,i)=>`<Trackpoint><Time>${z(t0+i*15000)}</Time><HeartRateBpm><Value>${Math.round(b)}</Value></HeartRateBpm></Trackpoint>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities><Activity Sport="${it.sport==='Run'?'Running':'Other'}"><Id>${z(it.start)}</Id>`+
    `<Lap StartTime="${z(it.start)}"><TotalTimeSeconds>${Math.round(it.dur)}</TotalTimeSeconds><DistanceMeters>${Math.round((it.km||0)*1000)}</DistanceMeters><Calories>0</Calories>`+
    (it.hr?`<AverageHeartRateBpm><Value>${it.hr.avg}</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>${it.hr.max}</Value></MaximumHeartRateBpm>`:'')+
    `<Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod><Track>${tp}</Track></Lap></Activity></Activities></TrainingCenterDatabase>`;
}
/* ce trimitem pe Strava la finalul unei sesiuni */
function stItem(rec,s,day,hs){
  const lines=day.ex.flatMap((e,x)=>{ const a=s.sets[x]||[]; if(a.length) return ['• '+e.n+': '+a.map(fmtSet).join(', ')];
    const r=s.runs[x]; return [r&&+r.km>0?'• '+e.n+': '+num(r.km,2)+' km în '+num(r.min)+' min':null]; }).filter(Boolean);
  const sport=rec.km>0&&!rec.sets?'Run':rec.km>0?'Workout':'WeightTraining';
  const head=`S${rec.w+1} · ${DAYN[rec.d]} · ciclul ${rec.cyc}\n${rec.sets} serii · ${Math.round(rec.vol)} kg volum`+(rec.km?` · ${num(rec.km,2)} km`:'')+(rec.prs?` · ${rec.prs} ${rec.prs===1?'record':'recorduri'}`:'');
  return {key:String(rec.end),start:s.start,end:rec.end,dur:rec.dur,km:rec.km||0,sport,name:'ZECE · '+rec.t,
    desc:(head+(lines.length?'\n\n'+lines.join('\n'):'')+'\n\nÎnregistrat cu ZECE · Hybrid365').slice(0,3000),
    hr:hs?{avg:hs.avg,max:hs.max}:null,pts:hs&&hs.pts?hs.pts.slice():[],t0:(s.hr&&s.hr.t0)||s.start};
}
async function stQueue(it){ await save('stq',(S.stq||[]).filter(x=>x.key!==it.key).concat([it]).slice(-20)); }
async function stUploadOne(it){
  if(!stCanWrite()) throw stErr('scope');
  let aid=null;
  if((it.pts||[]).length>=4){
    /* cu puls: fișier TCX, ca graficul de puls să apară pe Strava */
    const fd=new FormData(); fd.append('file',new Blob([stTCX(it)],{type:'application/xml'}),'zece-'+it.key+'.tcx');
    fd.append('data_type','tcx'); fd.append('name',it.name); fd.append('description',it.desc); fd.append('external_id','zece-'+it.key);
    let u=await stApi('POST','/uploads',fd);
    for(let i=0;i<20&&u&&!u.activity_id&&!u.error;i++){ await stWait(1500); u=await stApi('GET','/uploads/'+u.id); }
    if(u&&u.error){ const m=String(u.error).match(/activities\/(\d+)|activity (\d+)/); if(/duplicate/i.test(u.error)&&m) aid=m[1]||m[2]; else throw stErr('http',String(u.error).replace(/<[^>]+>/g,'')); }
    else aid=u&&u.activity_id;
    if(!aid) throw stErr('http','Strava încă procesează fișierul');
    if(it.sport==='WeightTraining'){ try{ await stApi('PUT','/activities/'+aid,new URLSearchParams({sport_type:'WeightTraining'})); }catch(e){} }
  } else {
    const p={name:it.name,sport_type:it.sport,start_date_local:stIso(it.start),elapsed_time:String(Math.max(60,Math.round(it.dur))),description:it.desc};
    if(it.km>0) p.distance=String(Math.round(it.km*1000));
    const a=await stApi('POST','/activities',new URLSearchParams(p)); aid=a&&a.id;
    if(!aid) throw stErr('http','răspuns fără activitate');
  }
  return String(aid);
}
async function stFlush(){
  if(!stOn()||ST.flushing||!(S.stq||[]).length) return; ST.flushing=true;
  for(const it of (S.stq||[]).slice()){
    ST.sum[it.key]='wait'; stSumPaint(it.key);
    try{
      const aid=await stUploadOne(it);
      await stPatch({own:(stCfg().own||[]).concat([aid]).slice(-500)});
      await save('stq',(S.stq||[]).filter(x=>x.key!==it.key));
      const h=(S.hist||[]).slice(), ix=h.findIndex(x=>String(x.end)===it.key); if(ix>=0){ h[ix]=Object.assign({},h[ix],{strava:aid}); await save('hist',h); }
      const xe=(S.ext||[]).slice(), jx=xe.findIndex(x=>x.src==='manual'&&String(x.sid)===it.key); if(jx>=0){ xe[jx]=Object.assign({},xe[jx],{strava:aid}); await save('ext',xe); }
      ST.sum[it.key]='ok'; ST.msg=''; stSumPaint(it.key);
    }catch(e){ ST.sum[it.key]='err'; ST.msg=stErrText(e); stSumPaint(it.key); if(e.code!=='http') break; }
  }
  ST.flushing=false;
  if(S.tab==='set'&&!S.summary) stRender();
}
function stSumTxt(m){
  const key=String(m.end), st=ST.sum[key];
  if(st==='ok'||(!st&&(S.hist||[]).some(h=>String(h.end)===key&&h.strava))) return `${ic('check')} Trimis pe Strava.`;
  if(st==='wait') return `${ic('refresh')} Se trimite pe Strava…`;
  if(st==='err') return `${esc(ST.msg||'Nu s-a putut trimite pe Strava.')} <button class="linkb" data-a="stFlush">Reîncearcă</button>`;
  if((S.stq||[]).some(x=>x.key===key)) return `${ic('refresh')} În așteptare pentru Strava.`;
  if(ST.pend&&ST.pend.key===key) return `<button class="btn sm" data-a="stSendPend">${ic('upload')} Trimite pe Strava</button>`;
  return '';
}
function stSumPaint(key){ const el=$('#stSum'); if(el&&S.summary&&String(S.summary.end)===key) el.innerHTML=stSumTxt(S.summary); }
function stCard(){
  const c=stCfg(), head=`<div class="eyebrow">${ic('refresh')} Strava · Polar Beat</div>`;
  if(!stOnline()) return `<div class="card" id="stSet">${head}<div class="note">Strava se poate conecta doar când ZECE e deschis de la adresa online (https://…), nu din fișierul salvat pe telefon sau pe calculator.</div></div>`;
  const cp=(lbl,v)=>`<div class="set-row"><span class="sp"><span class="xs mu">${lbl}</span><div style="font-family:ui-monospace,Consolas,monospace;font-size:13px;word-break:break-all">${esc(v)}</div></span><button class="btn ghost sm" data-a="stCopy" data-k="${esc(v)}">${ic('copy')} Copiază</button></div>`;
  const polar=`<div class="dsec"><h4>Polar Beat → Strava → ZECE</h4>
      <div class="cue"><b>1</b><span>Pe <a href="https://flow.polar.com" target="_blank" rel="noopener"><b>flow.polar.com</b></a>: numele tău (dreapta sus) → <b>Setări → Parteneri → Strava → Conectează</b>, apoi „Authorize” în Strava. Se face o singură dată.</span></div>
      <div class="cue"><b>2</b><span>Antrenamentele înregistrate cu <b>Polar Beat</b> urcă în Polar Flow, iar de acolo automat pe Strava. Merg doar cele cu puls sau GPS; cele adăugate manual în Flow nu se trimit.</span></div>
      <div class="cue"><b>3</b><span>ZECE le preia la deschidere sau cu „Sincronizează”, cu tot cu puls. Dacă același antrenament e și sesiune ZECE, se numără o singură dată.</span></div></div>
    <div class="note">Același drum îl au Garmin, Coros, Suunto sau Apple Watch: tot ce ajunge pe Strava intră și în ZECE.</div>`;
  if(!c.cid||!c.sec) return `<div class="card" id="stSet">${head}
    <div class="sm" style="margin-top:8px">ZECE vorbește cu Strava prin aplicația ta Strava. O creezi o singură dată, în două minute:</div>
    <div class="dsec"><div class="cue"><b>1</b><span>Deschide <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener"><b>strava.com/settings/api</b></a>, creează o aplicație (categoria <b>Training</b>) și completează:</span></div></div>
    ${cp('Application Name','ZECE')}${cp('Website',stRedirect())}${cp('Authorization Callback Domain',location.hostname)}
    <div class="dsec"><div class="cue"><b>2</b><span>Copiază aici <b>Client ID</b> și <b>Client Secret</b> din pagina aplicației.</span></div></div>
    <div class="form"><div class="fld"><label for="stCid">Client ID</label><input class="inp" id="stCid" inputmode="numeric" autocomplete="off" value="${esc(c.cid||'')}" placeholder="ex: 123456"></div>
      <div class="fld"><label for="stSec">Client Secret</label><input class="inp" id="stSec" type="password" autocomplete="off" placeholder="40 de caractere"></div></div>
    <button class="btn wide" style="margin-top:12px;background:#FC4C02;color:#fff;border-color:#FC4C02" data-a="stKeys">Salvează și conectează cu Strava</button>
    <div class="note">Secretul rămâne doar pe acest dispozitiv și pleacă numai spre strava.com. Aplicația Strava e doar a ta: o poate folosi numai contul tău.</div></div>`;
  if(!stOn()) return `<div class="card" id="stSet">${head}
    <div class="sm" style="margin-top:8px">Aplicația Strava e configurată (Client ID ${esc(c.cid)}). Mai rămâne să-i dai acces la contul tău.</div>
    ${ST.msg||c.err?`<div class="note" style="color:var(--warn)">${esc(ST.msg||c.err)}</div>`:''}
    <button class="btn wide" style="margin-top:12px;background:#FC4C02;color:#fff;border-color:#FC4C02" data-a="stConnect">Conectează cu Strava</button>
    <div class="note">Pe pagina Strava lasă bifate toate permisiunile: citirea activităților (și a celor private) și crearea de activități.</div>
    <button class="btn ghost sm" style="margin-top:8px" data-a="stReset" data-confirm="Sigur? Apasă iar">Schimbă Client ID / Secret</button></div>`;
  const q=S.stq||[], nr=(S.runs||[]).filter(r=>r.sid).length, ne=(S.ext||[]).length, no=(c.own||[]).length, w=stCanWrite(), auto=c.auto!==false&&w;
  return `<div class="card" id="stSet">${head}
    <div class="row" style="margin-top:8px"><span class="sp"><b>${esc((c.ath&&c.ath.name)||'Cont Strava')}</b><div class="xs mu">${ST.busy?'se sincronizează…':c.last?'sincronizat '+stAgo(c.last):'încă nesincronizat'}</div></span>
      <button class="btn sm" id="stSyncBtn" data-a="stSync" ${ST.busy?'disabled':''}>${ic('refresh')} ${ST.busy?'Sincronizez…':'Sincronizează'}</button></div>
    <div class="kpis"><div class="kpi"><div class="k">Alergări din Strava</div><div class="v">${nr}</div></div><div class="kpi"><div class="k">Alte antrenamente</div><div class="v">${ne}</div></div><div class="kpi"><div class="k">Trimise din ZECE</div><div class="v">${no}</div></div></div>
    <div class="set-row"><span class="sp"><b>Trimite automat antrenamentele ZECE</b><div class="sm mu">${w?'La final, cu durata, seriile și pulsul de la senzor':'Strava nu a primit permisiunea de upload. Conectează din nou și las-o bifată.'}</div></span>
      <button class="sw ${auto?'on':''}" data-a="stAuto" role="switch" aria-checked="${auto}" aria-label="Trimite automat pe Strava" ${w?'':'disabled'}></button></div>
    ${q.length?`<div class="set-row"><span class="sp"><b>${q.length===1?'1 antrenament':q.length+' antrenamente'} de trimis</b><div class="sm mu">${esc(q.map(x=>x.name).join(', '))}</div></span>
      <button class="btn sm" data-a="stFlush">Trimite</button><button class="xb" data-a="stQDrop" data-confirm="?" aria-label="Renunță la trimitere">${ic('trash')}</button></div>`:''}
    ${ST.msg||c.err?`<div class="note" style="color:var(--warn)">${esc(ST.msg||c.err)}</div>`:''}
    ${polar}
    <div class="row" style="margin-top:12px;flex-wrap:wrap"><button class="btn ghost sm" data-a="stConnect">${ic('refresh')} Conectează din nou</button>
      <button class="btn ghost sm danger" data-a="stOff" data-confirm="Sigur? Apasă iar">Deconectează Strava</button></div></div>`;
}
function extCard(){
  const xs=(S.ext||[]).filter(x=>x.src!=='manual').sort((a,b)=>(b.start||0)-(a.start||0)).slice(0,8); if(!xs.length) return '';
  return `<div class="card"><div class="eyebrow">${ic('refresh')} Alte antrenamente · din Strava</div><div style="margin-top:4px">
    ${xs.map(x=>`<div class="list-row"><span class="tag ${x.dup?'':'rest'}">${esc(stName(x.type))}</span><span class="sp"><b>${esc(x.name||stName(x.type))}</b> <span class="mu sm">· ${num(x.min,0)} min${x.km?' · '+num(x.km,1)+' km':''}${x.hr?' · '+x.hr+' bpm':''} · ${relDay(x.date)}</span>${x.dup?'<div class="xs mu">Același antrenament ca sesiunea ZECE: numărat o singură dată.</div>':''}</span>
      <button class="xb" data-a="extDel" data-k="${esc(x.sid)}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button></div>`).join('')}</div>
    <div class="note">Intră în încărcarea zilei ca minute × efort: efortul notat pe Strava, altfel estimat din pulsul mediu (zona 1 = 3/10 … zona 5 = 8/10), altfel 5/10.</div></div>`;
}
