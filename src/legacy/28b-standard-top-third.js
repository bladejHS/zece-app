/* =====================================================================
   v16 · STANDARDUL TOP-THIRD SOLDIER — 13 ținte: alergare, forță relativă la greutatea corpului, calistenie, marș, ramat, farmer's carry.
   Cifra de acum e cel mai bun rezultat: din datele tale (alergări notate, serii) sau din testele notate aici.
   Pe Performanță (toate) și pe Acasă (cele mai apropiate de atins).
   ===================================================================== */
K.std='zece3:std'; S.std={};
/* u: time (secunde, mai puțin e mai bine) · bw (kg, raportat la greutatea corpului) · reps · m (metri) */
const TT3=[
  {id:'r5',g:'Alergare',n:'5 km',u:'time',t:20*60,km:5},
  {id:'r2',g:'Alergare',n:'2 km',u:'time',t:7*60+30,km:2},
  {id:'r15',g:'Alergare',n:'1.5 mile · 2,41 km',u:'time',t:9*60,km:2.414},
  {id:'r10',g:'Alergare',n:'10 km',u:'time',t:43*60,km:10},
  {id:'dl',g:'Forță',n:'Deadlift',u:'bw',t:2,ex:['Deadlift','Conventional Deadlift']},
  {id:'sq',g:'Forță',n:'Back Squat',u:'bw',t:1.5,ex:['Back Squat']},
  {id:'bp',g:'Forță',n:'Bench Press',u:'bw',t:1.25,ex:['Bench Press']},
  {id:'pu',g:'Calistenie',n:'Tracțiuni stricte',u:'reps',t:15,ex:['Pull Up','Pull Up / Lat Pulldown','Weighted Pull Up'],sfx:'+'},
  {id:'pp',g:'Calistenie',n:'Flotări fără pauză',u:'reps',t:60,ex:['Push Ups'],sfx:'+ fără pauză'},
  {id:'su',g:'Calistenie',n:'Abdomene în 2 minute',u:'reps',t:70,sfx:'+ în 2 min'},
  {id:'lm',g:'Marș și condiție',n:'Marș cu 20 kg · 8 mile (12,9 km)',u:'time',t:110*60},
  {id:'row',g:'Marș și condiție',n:'Ramat 2 km',u:'time',t:7*60+30},
  {id:'fc',g:'Marș și condiție',n:"Farmer's carry 2 × 24 kg",u:'m',t:100,sfx:' m fără pauză'}
];
const ttBw=()=>+curW()||0;
const ttFmt=(x,v)=>v==null?'—':x.u==='time'?fmtClock(v):x.u==='bw'?num(v,1)+' kg':x.u==='m'?Math.round(v)+' m':String(Math.round(v));
const ttGoal=x=>x.u==='time'?'sub '+fmtClock(x.t):x.u==='bw'?num(x.t,2)+'× greutatea'+(ttBw()?' = '+Math.round(x.t*ttBw())+' kg':''):x.u==='m'?x.t+(x.sfx||' m'):x.t+(x.sfx||'');
/* din datele tale: alergări de aceeași lungime (timpul adus la distanța exactă), serii (1RM estimat din cel mult 10 repetări), serii fără greutate */
function ttAuto(x){ let b=null;
  if(x.km) (S.runs||[]).forEach(r=>{ const k=+r.km, m=+r.min; if(!(m>0&&k>=x.km*.995&&k<=x.km*1.08)) return; const v=m*60*x.km/k; if(!b||v<b.v) b={v,d:r.date,src:'din alergări'}; });
  if(x.u==='bw') (x.ex||[]).forEach(n=>liftHist(n).forEach(e=>e.s.forEach(([w,r])=>{ if(!(w>0&&r>0&&r<=10)) return; const v=r===1?+w:e1rm(w,r); if(!b||v>b.v) b={v,d:e.d,src:r===1?'din serii':'1RM estimat din serii'}; })));
  if(x.u==='reps') (x.ex||[]).forEach(n=>liftHist(n).forEach(e=>e.s.forEach(([w,r])=>{ if(+w===0&&r>0&&(!b||r>b.v)) b={v:+r,d:e.d,src:'din serii'}; })));
  return b; }
function ttState(x){
  const low=x.u==='time', tests=((S.std||{})[x.id]||[]).filter(t=>+t.v>0);
  let b=ttAuto(x); tests.forEach(t=>{ if(!b||(low?t.v<b.v:t.v>b.v)) b={v:+t.v,d:t.d,src:'test notat'}; });
  const bw=ttBw(), val=b?(x.u==='bw'?(bw?b.v/bw:null):b.v):null;
  const done=val!=null&&(low?val<x.t:val>=x.t), frac=val==null?0:Math.min(1,low?x.t/val:val/x.t);
  const cur=b?(x.u==='bw'?ttFmt(x,b.v)+(bw?' · '+num(b.v/bw,2)+'×':''):ttFmt(x,b.v)):'—';
  return {b,val,done,frac,cur,tests}; }
function ttRow(x,s){
  return `<div class="std-r ${s.done?'ok':''}" data-a="stdOpen" data-k="${x.id}" role="button" tabindex="0">
    <div class="row"><b class="sp">${esc(x.n)}</b><span class="v">${s.done?ic('check')+' ':''}${esc(s.cur)}</span></div>
    <div class="xs mu">Țintă: ${esc(ttGoal(x))}${s.b?' · '+esc(s.b.src)+' · '+relDay(s.b.d):' · fără rezultat încă'}</div>
    <div class="bar"><i style="width:${(s.frac*100).toFixed(1)}%"></i></div></div>`; }
function ttCard(compact){
  const L=TT3.map(x=>({x,s:ttState(x)})), n=L.filter(o=>o.s.done).length;
  const head=`<div class="row"><div class="sp"><div class="eyebrow">${ic('target')} Standard Top-Third Soldier</div><div class="sm mu" style="margin-top:4px"><b>${n}</b> din ${TT3.length} ținte atinse</div></div>
    ${compact?`<button class="btn ghost xs" data-a="tab" data-k="prog" data-s="ov" data-f="ttCard" aria-label="Toate țintele">${ic('right')}</button>`:''}</div>
    <div class="bar" style="margin-top:10px"><i style="width:${(n/TT3.length*100).toFixed(1)}%"></i></div>`;
  if(compact){ const next=L.filter(o=>!o.s.done).sort((a,b)=>b.s.frac-a.s.frac).slice(0,4);
    return `<div class="card std">${head}${next.map(o=>ttRow(o.x,o.s)).join('')||`<div class="empty sm">Toate țintele sunt atinse.</div>`}</div>`; }
  const groups=[...new Set(TT3.map(x=>x.g))];
  return `<div class="card std" id="ttCard">${head}${groups.map(g=>`<div class="dsec"><h4>${esc(g)}</h4>${L.filter(o=>o.x.g===g).map(o=>ttRow(o.x,o.s)).join('')}</div>`).join('')}
    <div class="note">Apasă pe o țintă ca să notezi un test. Forța se raportează la greutatea de acum (media pe 7 zile${ttBw()?': '+num(ttBw(),1)+' kg':''}). Alergările notate de aceeași lungime intră singure.</div></div>`; }
WIDGETS.std={t:'Standard Top-Third',sz:'m',r:()=>ttCard(true)};

/* ---------- foaia unei ținte: rezultatul de acum, testul nou, istoricul testelor ---------- */
function ttSheet(){
  const x=TT3.find(y=>y.id===SH.id); if(!x) return '';
  const s=ttState(x), today=todayKey();
  const form=x.u==='time'?`<div class="fld full"><label for="stdT">Timp (min:sec sau ore:min:sec)</label><input class="inp" id="stdT" inputmode="text" placeholder="${fmtClock(x.t)}"></div>`
    :x.u==='bw'?`<div class="fld"><label for="stdKg">kg</label><input class="inp" id="stdKg" type="number" step="0.5" inputmode="decimal"></div><div class="fld"><label for="stdRp">repetări</label><input class="inp" id="stdRp" type="number" inputmode="numeric" value="1"></div>`
    :`<div class="fld full"><label for="stdV">${x.u==='m'?'Metri fără să lași jos':'Repetări'}</label><input class="inp" id="stdV" type="number" inputmode="numeric"></div>`;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
    <div class="eyebrow">${ic('target')} ${esc(x.g)} · Top-Third</div><div class="h2" style="margin-top:6px">${esc(x.n)}</div>
    <div class="kpis c2"><div class="kpi"><div class="k">Acum</div><div class="v" style="font-size:20px">${esc(s.cur)}</div><div class="s">${s.b?esc(s.b.src):'fără rezultat'}</div></div>
      <div class="kpi"><div class="k">Țintă</div><div class="v" style="font-size:20px">${esc(ttGoal(x))}</div><div class="s">${s.done?'atinsă':Math.round(s.frac*100)+'%'}</div></div></div>
    <div class="bar"><i style="width:${(s.frac*100).toFixed(1)}%"></i></div>
    <div class="dsec"><h4>Test nou · ${fmtDay(today)}</h4><div class="form">${form}</div>
      ${x.u==='bw'?`<div class="xs mu" style="margin-top:6px">Peste o repetare se calculează 1RM-ul estimat.</div>`:''}
      <button class="btn pri wide xl" style="margin-top:12px" data-a="stdSave" data-k="${x.id}">${ic('check')} Salvează testul</button></div>
    ${s.tests.length?`<div class="dsec"><h4>Teste notate</h4>${s.tests.map((t,i)=>({t,i})).sort((a,b)=>a.t.d<b.t.d?1:-1).map(({t,i})=>`<div class="list-row"><span class="sp">${fmtDay(t.d)}</span><span class="v">${esc(ttFmt(x,+t.v))}</span>
      <button class="xb" data-a="stdDel" data-k="${x.id}" data-i="${i}" data-confirm="?" aria-label="Șterge testul">${ic('trash')}</button></div>`).join('')}</div>`:''}`; }
SHEETS.std=()=>ttSheet();
ACT.stdOpen=(el,{k})=>{ if(!TT3.some(x=>x.id===k)) return; SH={kind:'std',id:k}; shRender(); };
ACT.stdSave=async(el,{k})=>{ const x=TT3.find(y=>y.id===k); if(!x) return; let v=null;
  if(x.u==='time'){ v=parseTime(($('#stdT')||{}).value); if(!v||v<60||v>6*3600){ shake('#stdT'); return; } }
  else if(x.u==='bw'){ const kg=parseFloat(String(($('#stdKg')||{}).value||'').replace(',','.')), r=parseInt(($('#stdRp')||{}).value,10)||1;
    if(!(kg>0&&kg<=500)){ shake('#stdKg'); return; } if(!(r>=1&&r<=10)){ shake('#stdRp'); return; } v=r===1?kg:e1rm(kg,r); }
  else { v=parseInt(($('#stdV')||{}).value,10); if(!(v>0&&v<=(x.u==='m'?5000:1000))){ shake('#stdV'); return; } }
  const o=Object.assign({},S.std||{}); o[k]=(o[k]||[]).concat([{d:todayKey(),v}]); await save('std',o);
  const s=ttState(x); shRender(); render(); toast(s.done?'Țintă atinsă · '+x.n:'Test salvat · '+x.n,ttFmt(x,v)+' · țintă '+ttGoal(x),s.done?'':'info'); };
ACT.stdDel=async(el,{k,I})=>{ const o=Object.assign({},S.std||{}), a=(o[k]||[]).slice(); if(!(I>=0&&I<a.length)) return; a.splice(I,1); o[k]=a; await save('std',o); shRender(); render(); };
