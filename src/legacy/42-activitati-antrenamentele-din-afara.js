/* =====================================================================
   v9 · ACTIVITĂȚI — antrenamentele din afara planului, notate de mână: bicicletă, assault bike, canotaj,
   mers, înot, tenis și altele. Stau lângă cele importate din Strava (zece3:ext, cu src:'manual'),
   deci intră în încărcarea zilei, statistici, cronologie, export și sincronizare.
   Opțional pleacă și pe Strava, ca activitate manuală (fără puls pe secunde).
   ===================================================================== */
/* [tip, nume, iconiță, are distanță] — tipul e cel din Strava, ca importurile și exporturile să se potrivească */
const ACT_T=[['Ride','Bicicletă','bike',1],['AssaultBike','Assault bike','fan',0],['Rowing','Canotaj · row','row',1],['Walk','Mers','walk',1],['Swim','Înot','wave',1],['Tennis','Tenis','racket',0],
  ['Hike','Drumeție','mountain',1],['Elliptical','Eliptică','activity',1],['StairStepper','Scări','up',0],['Soccer','Fotbal','ball',0],['Padel','Padel','racket',0],['Basketball','Baschet','ball',0],
  ['Yoga','Yoga · stretching','leaf',0],['Workout','Altceva','bolt',0]];
const ACT_RPE=[[3,'Ușor'],[5,'Mediu'],[7,'Greu'],[9,'Foarte greu']];
ST_TYPES.AssaultBike='Assault bike';
/* Strava nu are „assault bike": pleacă drept antrenament */
const ACT_UP={AssaultBike:'Workout'};
const actT=t=>ACT_T.find(x=>x[0]===t)||null;
const actIcon=t=>{ const a=actT(t); return a?a[2]:ST_RUN.indexOf(t)>=0?'run':ST_STR.indexOf(t)>=0?'dumbbell':/Ride/.test(t)?'bike':/Row/.test(t)?'row':/Swim/.test(t)?'wave':'activity'; };
const actName=x=>x.name||stName(x.type);
/* rezumatul săptămânii curente (de luni până azi), fără dublurile sesiunilor FALCO */
function actWeek(){ const tk=todayKey(), m=mondayOf(tk), xs=(S.ext||[]).filter(x=>x.date>=m&&x.date<=tk&&!x.dup);
  return {n:xs.length,min:xs.reduce((a,x)=>a+(+x.min||0),0),km:xs.reduce((a,x)=>a+(+x.km||0),0)}; }

/* ---------- formularul ---------- */
let AF=null;
function afNew(type,x){
  const now=new Date();
  if(x) return {id:x.sid,type:x.type,date:x.date,time:x.start?new Date(x.start).toTimeString().slice(0,5):'',min:x.min!=null?String(x.min):'',km:x.km?String(x.type==='Swim'?Math.round(x.km*1000):x.km):'',
    hr:x.hr?String(x.hr):'',kcal:x.kcal?String(x.kcal):'',rpe:x.rpe||0,name:x.name||'',note:x.note||'',st:false,up:!!x.strava};
  return {id:null,type:type||'Ride',date:todayKey(),time:pad(now.getHours())+':'+pad(now.getMinutes()),min:'',km:'',hr:'',kcal:'',rpe:0,name:'',note:'',st:stOn()&&stCanWrite()&&stCfg().auto!==false,up:false};
}
ACT.actAdd=(el,{k})=>{ AF=afNew(k); SH={kind:'actf'}; shRender(); };
ACT.actEdit=(el,{k})=>{ const x=(S.ext||[]).find(e=>String(e.sid)===String(k)); if(!x) return; AF=afNew(null,x); SH={kind:'actf'}; shRender(); };
ACT.afType=(el,{k})=>{ if(!AF) return; AF.type=k; shRender(); };
ACT.afRpe=(el,{I})=>{ if(!AF) return; AF.rpe=AF.rpe===I?0:I; shRender(); };
ACT.afSt=()=>{ if(!AF) return; AF.st=!AF.st; shRender(); };
document.addEventListener('input',e=>{ const t=e.target; if(AF&&t&&t.dataset&&t.dataset.af!=null) AF[t.dataset.af]=t.value; });
const afIn=(id,label,o={})=>`<div class="fld ${o.full?'full':''}"><label for="af_${id}">${label}</label><input class="inp" id="af_${id}" data-af="${id}" ${o.type?`type="${o.type}"`:o.text?'':`type="number" step="${o.step||'any'}" inputmode="decimal"`} value="${esc(AF[id]==null?'':AF[id])}" ${o.ph?`placeholder="${esc(o.ph)}"`:''}></div>`;
function actFormHTML(){
  const A=AF, T=actT(A.type)||ACT_T[ACT_T.length-1], swim=A.type==='Swim';
  /* aceeași activitate venită deja din Strava (de ex. din Polar Beat): o semnalez, ca să nu o notezi de două ori */
  const twin=!A.id&&(S.ext||[]).find(x=>x.src!=='manual'&&x.date===A.date&&(stName(x.type)===stName(A.type)||actIcon(x.type)===T[2]));
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic(T[2])} ${A.id?'Modifică activitatea':'Activitate nouă'}</div>
    <div class="h2" style="margin-top:6px">${esc(T[1])}</div>
    <div class="act-tg">${ACT_T.map(([t,l,icn])=>`<button class="act-tb ${A.type===t?'on':''}" data-a="afType" data-k="${t}" aria-pressed="${A.type===t}">${ic(icn)}<span>${l}</span></button>`).join('')}</div>
    <div class="form">${afIn('min','Durata (min)',{step:'1',ph:'ex: 30'})}${T[3]?afIn('km',swim?'Distanța (m)':'Distanța (km)',{step:swim?'25':'0.1',ph:swim?'ex: 1000':'ex: 12'}):''}
      ${afIn('hr','Puls mediu (opțional)',{step:'1',ph:'ex: 135'})}${afIn('kcal','Calorii (opțional)',{step:'10',ph:'de pe ceas'})}
      ${afIn('date','Data',{type:'date'})}${afIn('time','Ora începerii',{type:'time'})}
      ${afIn('name',A.type==='Workout'?'Ce ai făcut':'Nume (opțional)',{text:1,full:1,ph:A.type==='Workout'?'ex: box, înot în mare, ski':'ex: '+T[1]+' ușor'})}</div>
    <div class="fld" style="margin-top:12px"><label>Cât de greu a fost</label><div class="seg" style="margin-top:0">${ACT_RPE.map(([v,l])=>`<button class="${A.rpe===v?'on':''}" data-a="afRpe" data-i="${v}">${l}</button>`).join('')}</div></div>
    <div class="xs mu2" style="margin-top:6px">Intră în încărcarea zilei ca minute × efort. Dacă nu alegi, efortul se estimează din puls.</div>
    ${twin?`<div class="note">${ic('info')} Ai deja din Strava, în aceeași zi: ${esc(actName(twin))} · ${num(twin.min,0)} min. Notează doar dacă e altă activitate.</div>`:''}
    ${!A.id&&stOn()&&stCanWrite()?`<div class="set-row" style="margin-top:10px"><span class="sp"><b>Trimite și pe Strava</b><div class="sm mu">ca activitate manuală</div></span><button class="sw ${A.st?'on':''}" data-a="afSt" role="switch" aria-checked="${!!A.st}" aria-label="Trimite și pe Strava"></button></div>`:''}
    ${A.up?`<div class="xs mu2" style="margin-top:8px">E deja pe Strava. Modificările de aici nu se mai trimit acolo.</div>`:''}
    <div class="inrow" style="margin-top:14px">${A.id?`<button class="btn ghost danger" data-a="actDel" data-k="${esc(A.id)}" data-confirm="Ștergi?">${ic('trash')}</button>`:''}
      <button class="btn pri xl" style="flex:1" data-a="afSave">${ic('check')} ${A.id?'Salvează':'Adaugă activitatea'}</button></div>`;
}
SHEETS.actf=()=>AF?actFormHTML():'';
ACT.afSave=async()=>{
  const A=AF; if(!A) return; const n=v=>{ const x=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(x)?x:null; };
  const min=n(A.min), km0=n(A.km), hr=Math.round(n(A.hr)||0), kcal=Math.round(n(A.kcal)||0);
  if(!(min>0&&min<=1440)) return shake('#af_min');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(A.date||'')||A.date>todayKey()) return shake('#af_date');
  if(A.hr&&!(hr>=40&&hr<=220)) return shake('#af_hr');
  if(A.type==='Workout'&&!String(A.name||'').trim()) return shake('#af_name');
  const km=actT(A.type)&&actT(A.type)[3]&&km0>0?(A.type==='Swim'?km0/1000:km0):0;
  const st=parseKey(A.date); if(/^\d{1,2}:\d{2}$/.test(A.time||'')){ const [h,m]=A.time.split(':').map(Number); st.setHours(h,m,0,0); } else st.setHours(12,0,0,0);
  const old=A.id?(S.ext||[]).find(x=>String(x.sid)===String(A.id)):null;
  const x=Object.assign({},old||{},{sid:A.id||'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),src:'manual',date:A.date,start:st.getTime(),type:A.type,name:String(A.name||'').trim().slice(0,60),
    min:Math.round(min*10)/10,el:Math.round(min),km:Math.round(km*1000)/1000,dup:false});
  ['hr','kcal','rpe','note'].forEach(k=>delete x[k]); if(hr) x.hr=hr; if(kcal) x.kcal=kcal; if(A.rpe) x.rpe=A.rpe; if(String(A.note||'').trim()) x.note=String(A.note).trim().slice(0,200);
  const ext=(S.ext||[]).filter(e=>String(e.sid)!==String(x.sid)).concat([x]).sort((a,b)=>(a.start||0)-(b.start||0));
  await save('ext',ext);
  if(!A.id&&A.st&&stOn()&&stCanWrite()){
    await stQueue({key:x.sid,start:x.start,end:x.start+min*60000,dur:Math.round(min*60),km,sport:ACT_UP[x.type]||x.type,name:x.name||actT(x.type)[1],
      desc:(actT(x.type)[1]+' · '+num(min,0)+' min'+(km?' · '+num(km,2)+' km':'')+(hr?' · puls mediu '+hr:'')+'\n\nNotat în FALCO · Hybrid365'),hr:null,pts:[]});
    setTimeout(stFlush,50); }
  AF=null; SH=null; shRender(); render();
  toast(A.id?'Activitate salvată':'Activitate adăugată',actName(x)+' · '+num(min,0)+' min'+(km?' · '+num(km,1)+' km':''),'info');
};
ACT.actDel=async(el,{k})=>{ const prev=S.ext; const x=(prev||[]).find(e=>String(e.sid)===String(k)); if(!x) return;
  await save('ext',(prev||[]).filter(e=>String(e.sid)!==String(k))); AF=null; SH=null; shRender(); render();
  toast('Activitate ștearsă',actName(x)+(x.strava?' · rămâne pe Strava':''),'',{l:'Anulează',f:async()=>{ await save('ext',prev); render(); }}); };

/* ---------- fila „Activități" din Antrenament ---------- */
function actRow(x){ const man=x.src==='manual';
  return `<div class="list-row act-r"><span class="ic-s ${man?'man':''}">${ic(actIcon(x.type))}</span>
    <button class="sp linkb2" ${man?`data-a="actEdit" data-k="${esc(x.sid)}"`:'disabled'} style="text-align:left"><b>${esc(actName(x))}</b>
      <span class="xs mu" style="display:block">${fmtDay(x.date)} · ${num(x.min,0)} min${x.km?' · '+num(x.km,x.km<10?2:1)+' km':''}${x.hr?' · '+x.hr+' bpm':''}${x.rpe?' · '+((ACT_RPE.find(r=>r[0]===x.rpe)||[0,'efort '+x.rpe])[1]).toLowerCase():''}</span>
      ${x.dup?'<span class="xs mu2" style="display:block">Același antrenament ca sesiunea FALCO: numărat o singură dată.</span>':''}</button>
    <span class="tag ${man?'':'rest'}">${man?'notat':'Strava'}</span>
    ${man?'':`<button class="xb" data-a="extDel" data-k="${esc(x.sid)}" data-confirm="?" aria-label="Șterge">${ic('trash')}</button>`}</div>`; }
function viewActs(){
  const W=actWeek(), xs=(S.ext||[]).slice().sort((a,b)=>(b.start||0)-(a.start||0)), by={};
  xs.forEach(x=>{ const m=String(x.date).slice(0,7); (by[m]=by[m]||[]).push(x); });
  const ks=Object.keys(by).sort().reverse(), shown=ks.slice(0,S.acN||3);
  return `<div class="card act-hd"><div class="row"><div class="sp"><div class="eyebrow">${ic('activity')} În afara planului</div><div class="h2" style="margin-top:6px">Activități</div>
      <div class="sm mu">${W.n?`Săptămâna asta: <b class="tx">${W.n}</b> ${W.n===1?'activitate':'activități'} · ${num(W.min,0)} min${W.km?' · '+num(W.km,1)+' km':''}`:'Nimic notat săptămâna asta.'}</div></div></div>
    <div class="act-q">${ACT_T.slice(0,6).map(([t,l,icn])=>`<button class="act-qb" data-a="actAdd" data-k="${t}">${ic(icn)}<span>${l}</span></button>`).join('')}
      <button class="act-qb" data-a="actAdd" data-k="Hike">${ic('plus')}<span>Altele</span></button></div></div>
  ${shown.length?shown.map(m=>{ const y=+m.slice(0,4), mo=+m.slice(5,7), g=by[m], mins=g.filter(x=>!x.dup).reduce((a,x)=>a+(+x.min||0),0);
      return `<div class="card"><div class="card-h"><div class="eyebrow">${MON_S[mo-1]} ${y}</div><span class="xs mu">${g.length} · ${num(mins/60,1)} h</span></div>${g.map(actRow).join('')}</div>`; }).join('')
    :`<div class="card"><div class="empty">${ic('activity')}<div>Aici apar antrenamentele din afara planului: bicicletă, assault bike, canotaj, mers, înot, tenis. Le notezi de mână sau vin singure din Strava.</div>
      <button class="btn pri sm" data-a="actAdd" data-k="Ride">${ic('plus')} Adaugă prima activitate</button></div></div>`}
  ${ks.length>shown.length?`<button class="btn ghost wide" style="margin-top:12px" data-a="acMore">${ic('down')} Lunile anterioare</button>`:''}`;
}
ACT.acMore=()=>{ S.acN=(S.acN||3)+3; render(); };
