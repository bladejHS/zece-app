/* =====================================================================
   v15 · BODYWEIGHT — opțiunea B a finisher-ului de vineri (A rămâne Power finisher EMOM 10 min):
   60 de tracțiuni și 150 de flotări, în câte serii ai nevoie. Ținta crește singură după fiecare reușită
   (src/lib/training/sets.ts), în săptămâna de deload scade cu 40%, iar după fiecare serie primești recomandarea pentru următoarea.
   Seriile se salvează în istoricul exercițiilor „Pull Up" și „Push Ups" (greutatea corpului = 0 kg).
   ===================================================================== */
const BW_EX={pull:{n:'Pull Up',l:'Tracțiuni',rest:90},push:{n:'Push Ups',l:'Flotări',rest:75}};
const BW_SWITCH_REST=120;
/* istoricul fiecărui exercițiu, pe zile; zilele din săptămâna de deload a planului nu contează la progresie */
function bwHistory(n){ const dl=new Set((S.hist||[]).filter(h=>h.w===3).map(h=>h.date));
  return liftHist(n).filter(e=>e.d<todayKey()).map(e=>({date:e.d,reps:e.s.map(s=>+s[1]||0).filter(r=>r>0),deload:dl.has(e.d)})); }
function bwTarget(key){ const E=BW_EX[key], rule=TRAINING.VOLUME_RULES[E.n], t=TRAINING.volumeTarget(rule,bwHistory(E.n)), nx=nextDay();
  const dl=!!(nx&&deloadOn(nx.w));
  return {target:dl?TRAINING.deloadCount(t.target):t.target,full:t.target,why:dl?'Săptămână de deload: '+TRAINING.deloadCount(t.target)+' în loc de '+t.target+' (−40%).':t.why,prevFirst:t.prevFirst,deload:dl}; }
function bwRec(st,key){ const B=st.bw[key]; return TRAINING.nextVolSet(TRAINING.VOLUME_RULES[BW_EX[key].n],B.target,B.done,B.prevFirst); }
function P_BW(){ const pull=bwTarget('pull'), push=bwTarget('push');
  const bw={pull:Object.assign({done:[]},pull),push:Object.assign({done:[]},push)}, r1=TRAINING.nextVolSet(TRAINING.VOLUME_RULES['Pull Up'],pull.target,[],pull.prevFirst).reps;
  return {title:'Bodyweight · '+pull.target+' tracțiuni + '+push.target+' flotări',kind:'bw',bw,
    ph:[{k:'prep',d:10,l:'Pregătește-te',s:'Tracțiuni · prima serie: '+r1+' repetări'},{k:'manual',l:'Tracțiuni · seria 1',s:'Recomandat: '+r1+' repetări',bw:'pull'}]}; }

/* panoul din cronometru: progresul pe ambele exerciții, recomandarea și notarea seriei */
function bwPanel(st,ph){ const B=st.bw, row=k=>{ const x=B[k], t=x.done.reduce((a,b)=>a+b,0);
    return `<div class="bw-r ${ph.bw===k?'on':''}"><div class="row"><b class="sp">${BW_EX[k].l}</b><span class="v">${t}<small> / ${x.target}</small></span></div>
      ${UI.segments(t/x.target,20,t>=x.target?'ok':'effort',BW_EX[k].l+' '+t+' din '+x.target)}${x.done.length?`<div class="xs mu2">${x.done.join(' · ')}</div>`:''}</div>`; };
  const cur=ph.k==='manual'&&ph.bw?bwRec(st,ph.bw):null;
  return `<div class="bw">${row('pull')}${row('push')}
    ${cur&&!cur.done?`<div class="bw-rec">${ic('target')} <span><b>Seria următoare: ${cur.reps} repetări</b> · mai ai ${cur.remaining}, cam ${cur.setsLeft} ${cur.setsLeft===1?'serie':'serii'}<br><small>${esc(cur.note)}</small></span></div>
      <div class="stp bw-stp"><label for="bwRp">repetări făcute</label><div class="r"><button data-a="bwRp" data-v="-1" aria-label="minus o repetare">−</button>
        <input id="bwRp" type="number" inputmode="numeric" value="${cur.reps}"><button data-a="bwRp" data-v="1" aria-label="plus o repetare">+</button></div></div>`:''}</div>`; }
ACT.bwRp=el=>{ const i=$('#bwRp'); if(i){ i.value=Math.max(0,(parseInt(i.value,10)||0)+(+el.dataset.v||0)); buzz(8); } };
ACT.bwSet=async()=>{ const st=TM.st; if(!st||!st.bw||st.done) return; const ph=tmPh(); if(ph.k!=='manual'||!ph.bw) return;
  const r=parseInt(($('#bwRp')||{}).value,10); if(!(r>0&&r<=200)){ shake('#bwRp'); return; }
  const key=ph.bw, B=st.bw[key]; B.done.push(r); await addSet(BW_EX[key].n,0,r);
  const rec=bwRec(st,key), other=key==='pull'?'push':'pull', oRec=bwRec(st,other);
  /* următoarea serie: același exercițiu până la țintă, apoi celălalt; la final, gata */
  const next=!rec.done?key:!oRec.done?other:null;
  if(!next){ ph.l=BW_EX[key].l+' · seria '+B.done.length; tmAdvance(0,false); return; }
  const nr=bwRec(st,next), sw=next!==key, rest=sw?BW_SWITCH_REST:BW_EX[next].rest+(nr.restExtra||0);
  st.ph.splice(st.i+1,0,{k:'rest',d:rest,l:'Pauză',s:'Urmează: '+BW_EX[next].l+' · '+nr.reps+' repetări'+(sw?' (schimbi exercițiul)':'')},
    {k:'manual',l:BW_EX[next].l+' · seria '+(st.bw[next].done.length+1),s:'Recomandat: '+nr.reps+' repetări',bw:next});
  tmAdvance(0,false); };
/* „Treci mai departe": restul țintei la exercițiul curent se lasă pentru data viitoare */
ACT.bwSkip=()=>{ const st=TM.st; if(!st||!st.bw) return; const ph=tmPh(); if(ph.k!=='manual'||!ph.bw) return;
  const other=ph.bw==='pull'?'push':'pull', o=bwRec(st,other);
  if(o.done){ tmAdvance(0,false); return; }
  st.ph.splice(st.i+1,0,{k:'manual',l:BW_EX[other].l+' · seria '+(st.bw[other].done.length+1),s:'Recomandat: '+o.reps+' repetări',bw:other});
  st.ph.splice(st.i+1,0,{k:'rest',d:BW_SWITCH_REST,l:'Pauză',s:'Urmează: '+BW_EX[other].l+' · '+o.reps+' repetări'}); tmAdvance(0,false); };
function bwCtl(st,ph){ if(ph.k!=='manual'||!ph.bw) return '';
  return `<button class="btn pri xl glow" style="grid-column:1/-1" data-a="bwSet">${ic('check')} Seria terminată</button>
    <button class="btn ghost" style="grid-column:1/-1" data-a="bwSkip" data-confirm="Treci mai departe?">${ic('skip')} ${ph.bw==='pull'?'Treci la flotări':'Termină aici'}</button>`; }
function bwDoneHTML(st){ const B=st.bw, line=k=>{ const x=B[k], t=x.done.reduce((a,b)=>a+b,0), ok=t>=x.target;
    return `<div class="list-row"><span class="sp"><b>${BW_EX[k].l}</b><div class="xs mu">${x.done.join(' · ')||'—'}</div></span><span class="v">${t} / ${x.target} ${ok?ic('check'):''}</span></div>`; };
  const pullOk=B.pull.done.reduce((a,b)=>a+b,0)>=B.pull.target&&B.pull.done.length<=TRAINING.VOLUME_RULES['Pull Up'].maxSets;
  const pushOk=B.push.done.reduce((a,b)=>a+b,0)>=B.push.target&&B.push.done.length<=TRAINING.VOLUME_RULES['Push Ups'].maxSets;
  return `<div class="card">${line('pull')}${line('push')}
    <div class="note">${B.pull.deload?'Săptămâna de deload nu schimbă progresia.':`Data viitoare: tracțiuni ${pullOk?'<b>'+(B.pull.full+TRAINING.VOLUME_RULES['Pull Up'].step)+'</b>':'tot '+B.pull.full}, flotări ${pushOk?'<b>'+(B.push.full+TRAINING.VOLUME_RULES['Push Ups'].step)+'</b>':'tot '+B.push.full}. Ținta crește când o faci în cel mult ${TRAINING.VOLUME_RULES['Pull Up'].maxSets} serii la tracțiuni și ${TRAINING.VOLUME_RULES['Push Ups'].maxSets} la flotări.`}</div></div>`; }
