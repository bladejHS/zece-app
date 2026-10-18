/* =====================================================================
   v15 · SESIUNEA STRUCTURATĂ — kickboxing în 4 faze (activare, tehnică, condiționare, revenire), cu check-in înainte,
   feedback după fiecare rundă (ajustează runda următoare pe loc) și validatorul de siguranță.
   Logica e în src/lib/training (TRAINING); aici sunt foaia de check-in, legătura cu cronometrul și vocea pe faze.
   ===================================================================== */
K.deload='zece3:deload'; S.deload=true;
const KB_FEEL=[['easy','Ușor'],['ok','Potrivit'],['hard','Greu'],['max','La limită']];
const KB_PAIN_LVL=[[3,'Ușoară'],[5,'Medie'],[8,'Puternică']];
const KB_REACT=[['Sus','eschivă'],['Jos','lovitură la corp'],['Stânga','pas lateral la stânga'],['Dreapta','pas lateral la dreapta']];
/* săptămâna din ciclul de 4 (aceeași ca planul hibrid): a 4-a e de deload */
const kbWeek=()=>{ const nx=nextDay(); return nx?nx.w+1:WEEKS; };

/* încărcarea zilelor trecute, pentru validator: minute și zile intense (RPE ≥ 7, prag, condiționare) */
function kbDayLoads(){ const m={}, add=(date,min,intense,deload)=>{ if(!date) return; const o=m[date]||(m[date]={date,minutes:0,intense:false,deload:false});
    o.minutes+=Math.max(0,+min||0); o.intense=o.intense||!!intense; o.deload=o.deload||!!deload; };
  (S.hist||[]).forEach(h=>add(h.date,(h.dur||0)/60,(+h.rpe||0)>=7,h.w===3&&S.deload!==false));
  (S.ext||[]).filter(x=>!x.dup).forEach(x=>add(x.date,x.min,(+x.rpe||0)>=7,x.kb&&x.kb.deload));
  (S.runs||[]).forEach(r=>add(r.date,r.min,r.kind==='thr'||(+r.rpe||0)>=7));
  (S.tmlog||[]).filter(t=>!/^(stretch|mobility|breath|warmup|warmrun)$/.test(t.kind||'')).forEach(t=>add(t.date,(t.total||0)/60,/^(emom|amrap|engine|thr|lt30)$/.test(t.kind||'')));
  return Object.values(m); }

/* ---------- check-in-ul de dinainte (20 de secunde, butoane mari) ---------- */
function kbLastRpe(a){ const s=kbSessions().find(x=>x.a===a&&x.x.rpe); return s?+s.x.rpe:0; }
function kbBuild(a,ci){ const p=kbPref(a), inj=aiCtx().injuries;
  let s=TRAINING.buildCombatSession({discipline:a,rounds:p.r,workSec:p.rs,restSec:p.rest,level:p.lvl||2,kicks:p.kicks!==false,week:kbWeek(),deloadAuto:S.deload!==false,forceDeload:hrvNow().force,injuries:inj});
  s=TRAINING.applyCheckIn(s,{energy:ci.energy,sleep:ci.sleep,lastRpe:ci.rpe||undefined,pain:Object.keys(ci.pain).filter(COACH.isInjury).map(area=>({area,level:ci.pain[area]}))});
  return TRAINING.validateSession(s,kbDayLoads(),todayKey(),inj).session; }
function kbciHTML(){ const a=SH.k, A=KB_A[a], ci=SH.ci; if(!A) return '';
  const seg=(key,vals)=>`<div class="seg kbci-seg">${vals.map(([v,l])=>`<button class="${ci[key]===v?'on':''}" data-a="kbCi" data-k="${key}" data-i="${v}">${l}</button>`).join('')}</div>`;
  if(SH.plan){ const s=SH.plan, cs=TRAINING.allChunks(s);
    return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
      <div class="eyebrow">${ic('list')} ${esc(A.n)} · săptămâna ${s.week}/4${s.deload?' · deload':''}</div><div class="h2" style="margin-top:6px">Sesiunea de azi</div>
      <div class="kbp">${s.phases.filter(p=>p.chunks.length).map(p=>{ const w=p.chunks.filter(c=>c.kind==='work'), min=Math.round(p.chunks.reduce((t,c)=>t+c.durationSec,0)/60);
        return `<div class="kbp-r"><b>${esc(TRAINING.PHASE_LABEL[p.phase])}</b><span>${min} min · ${w.length} ${w.length===1?'bucată':'bucăți'}${w.some(c=>c.cognitive)?' · cognitiv':''}</span></div>`; }).join('')}</div>
      ${UI.segments(Math.min(1,TRAINING.sessionMinutes(s)/60),12,'effort','Durata sesiunii')}
      ${s.notes.length?`<div class="kbp-n">${s.notes.map(n=>`<p>${ic('info')} ${esc(n)}</p>`).join('')}</div>`:''}
      <button class="btn pri xl wide" style="margin-top:14px" data-a="kbFullGo">${ic('play')} Pornește · ${TRAINING.sessionMinutes(s)} min</button>
      <button class="btn ghost wide" style="margin-top:8px" data-a="kbCiBack">${ic('left')} Schimbă check-in-ul</button>
      <div class="xs mu2" style="margin-top:8px">${cs.filter(c=>c.cognitive).map(c=>esc(c.label)).join(' · ')}: componenta cognitivă (reacție, decizie, memorare).</div>`; }
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
    <div class="eyebrow">${ic('target')} ${esc(A.n)} · 4 faze</div><div class="h2" style="margin-top:6px">Cum ești azi?</div>
    <div class="kbci-l">Energia</div>${seg('energy',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']])}
    <div class="kbci-l">Somnul de azi-noapte</div>${seg('sleep',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']])}
    <div class="kbci-l">Ultima sesiune a fost</div>${seg('rpe',[[0,'—']].concat(ACT_RPE))}
    <div class="kbci-l">Dureri</div>
    <div class="chips">${Object.keys(COACH.INJURIES).map(k=>`<button class="chip ${ci.pain[k]?'on':''}" data-a="kbCiPain" data-k="${k}" aria-pressed="${!!ci.pain[k]}">${esc(COACH.INJURIES[k])}${ci.pain[k]?' · '+KB_PAIN_LVL.find(x=>x[0]===ci.pain[k])[1].toLowerCase():''}</button>`).join('')}</div>
    ${SH.painArea?`<div class="kbci-l">${esc(COACH.INJURIES[SH.painArea])}: cât de tare?</div><div class="seg kbci-seg">${KB_PAIN_LVL.map(([v,l])=>`<button class="${ci.pain[SH.painArea]===v?'on':''}" data-a="kbCiLvl" data-i="${v}">${l}</button>`).join('')}<button data-a="kbCiLvl" data-i="0">Fără</button></div>`:''}
    <button class="btn pri xl wide" style="margin-top:16px" data-a="kbCiBuild">${ic('check')} Construiește sesiunea</button>
    <div class="xs mu2" style="margin-top:8px">Fără internet merge la fel: regulile sunt pe telefon.</div>`;
}
SHEETS.kbci=()=>kbciHTML();
ACT.kbFull=()=>{ const a=SH&&SH.k; if(!KB_A[a]) return; SH={kind:'kbci',k:a,ci:{energy:3,sleep:3,rpe:kbLastRpe(a),pain:{}}}; shRender(); };
ACT.kbCi=(el,{k,I})=>{ if(!SH||!SH.ci) return; SH.ci[k]=I; buzz(8); shRender(); };
ACT.kbCiPain=(el,{k})=>{ if(!SH||!SH.ci||!COACH.isInjury(k)) return; SH.painArea=k; if(!SH.ci.pain[k]) SH.ci.pain[k]=3; buzz(8); shRender(); };
ACT.kbCiLvl=(el,{I})=>{ if(!SH||!SH.painArea) return; if(I>0) SH.ci.pain[SH.painArea]=I; else delete SH.ci.pain[SH.painArea]; SH.painArea=null; shRender(); };
ACT.kbCiBuild=async()=>{ if(!SH||!SH.ci) return; const ci=SH.ci; SH.plan=kbBuild(SH.k,ci); shRender();
  /* check-in-ul de azi ajustează și nutriția zilei (energie, RPE) */
  await save('kb',Object.assign({},S.kb,{ci:{date:todayKey(),energy:ci.energy,sleep:ci.sleep,rpe:ci.rpe||0}})); STC=null; };
ACT.kbCiBack=()=>{ if(!SH) return; SH.plan=null; shRender(); };
ACT.kbFullGo=()=>{ if(!SH||!SH.plan) return; if(TM.open&&TM.st&&TM.st.started&&!TM.st.done){ toast('Cronometrul rulează deja','','info'); return; }
  const a=SH.k, s=SH.plan; SH=null; shRender();
  TRAINING.sessionPhases(s).forEach(p=>voxPreload(p));
  tmOpen(kbSessionPreset(a,s)); hydAlert(); };

/* sesiunea → fazele cronometrului; fiecare fază păstrează legătura cu bucata ei (ci), pentru feedback */
function kbSessionPreset(a,s){ const A=KB_A[a]||KB_A.bag, p=kbPref(a), cs=TRAINING.allChunks(s);
  const ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Activare · '+(cs[0]?cs[0].label:''),phase:'activation'}];
  cs.forEach((c,ci)=>ph.push({k:c.kind==='rest'?'rest':'work',d:c.durationSec,l:c.label,s:TRAINING.PHASE_LABEL[c.phase]+' · '+c.cue,phase:c.phase,ci,
    call:c.call,lvl:c.complexity,kicks:c.kicks,cog:c.cognitive?c.cognitive.kind:null,planned:c.durationSec,int:c.intensity}));
  const works=cs.filter(c=>c.kind==='work'&&c.phase==='conditioning').length;
  return {title:A.n+' · 4 faze · '+TRAINING.sessionMinutes(s)+' min',kind:'kb4',ph,kb:{a,r:works,rs:p.rs,rest:p.rest,
    call:A.call?{lvl:p.lvl||2,kicks:p.kicks!==false,tempo:KB_TEMPO[p.tempo]?p.tempo:'slow'}:null,tg:null,cur:null,next:0,ph:-1,n:0,
    plan:{chunks:cs,deload:s.deload,week:s.week,fb:{}}}};
}
/* strigătorul pe bucată: oprit unde bucata nu are combinații, nivelul și picioarele după bucată */
const kbCallFor=(k,ph)=>!k.call||ph.call===false?null:Object.assign({},k.call,ph.lvl?{lvl:ph.lvl}:{},ph.kicks===false?{kicks:false}:{});
/* reacția (componenta cognitivă din activare): un semnal la 3–5 secunde, tu răspunzi cu mișcarea */
function kbReact(st,ph){ const k=st.kb, now=Date.now(), left=ph.d-tmEl();
  if(k.ph!==st.i){ k.ph=st.i; k.next=now+2500; k.cur=null; kbPaintCall(st); return; }
  if(left<3||now<k.next||voTalking()) return;
  const r=KB_REACT[Math.floor(Math.random()*KB_REACT.length)]; k.cur={c:r[0],big:r[0].toUpperCase(),names:r[1]};
  say(r[0]+'!'); k.next=now+3000+Math.round(Math.random()*2000); kbPaintCall(st); }

/* ---------- feedback după rundă: în pauză, patru butoane mari; runda următoare se ajustează pe loc ---------- */
function kbFbHTML(st,ph){ const P=st.kb&&st.kb.plan; if(!P||ph.k!=='rest'||ph.ci==null) return '';
  const prev=st.ph[st.i-1]; if(!prev||prev.k!=='work'||!/^(technique|conditioning)$/.test(prev.phase||'')) return '';
  const f=P.fb[st.i]; if(f) return `<div class="kbfb done" role="status">${ic('check')} ${esc(f.note)}</div>`;
  return `<div class="kbfb"><div class="kbfb-q">Cum a fost runda?</div><div class="kbfb-b">${KB_FEEL.map(([k,l])=>`<button class="btn ${k==='max'?'':'ghost'}" data-a="kbFb" data-k="${k}">${l}</button>`).join('')}</div>
    <details class="kbfb-p"><summary>${ic('alert')} Durere</summary><div class="chips">${Object.keys(COACH.INJURIES).map(k=>`<button class="chip" data-a="kbFbPain" data-k="${k}">${esc(COACH.INJURIES[k])}</button>`).join('')}</div></details></div>`; }
function kbFbApply(fb){ const st=TM.st; if(!st||!st.kb||!st.kb.plan) return; const ph=st.ph[st.i], P=st.kb.plan; if(!ph||ph.k!=='rest'||ph.ci==null||P.fb[st.i]) return;
  /* bucățile urmăresc ce rulează acum (inclusiv ajustările de dinainte) */
  st.ph.forEach(p=>{ if(p.ci==null) return; const c=P.chunks[p.ci]; c.durationSec=p.d; if(p.lvl) c.complexity=p.lvl; c.kicks=p.kicks!==false; c.call=p.call!==false; });
  const nxt=st.ph.slice(st.i+1).find(p=>p.k==='work'&&p.ci!=null);
  const ch=TRAINING.adjustNextRound(P.chunks,ph.ci,fb,nxt?nxt.planned:0);
  if(ch.extendRest) ph.d+=ch.extendRest;
  if(ch.next){ const p=st.ph.find(x=>x.ci===ch.next.index); if(p){ p.d=ch.next.durationSec; p.lvl=ch.next.complexity; p.kicks=ch.next.kicks; p.call=ch.next.call; p.s=TRAINING.PHASE_LABEL[p.phase]+' · '+ch.next.cue; } }
  if(ch.restAfter){ const p=st.ph.find(x=>x.ci===ch.restAfter.index); if(p) p.d=ch.restAfter.durationSec; }
  P.fb[st.i]={feel:fb.feel,pain:fb.pain||null,note:ch.note};
  /* fără internet, feedback-ul așteaptă în IndexedDB; la revenire, antrenorul AI verifică adaptările făcute după reguli */
  if(!navigator.onLine) COACH.queue.add({kind:'feedback',t:new Date().toISOString(),data:{a:st.kb.a,round:(st.ph[st.i-1]||{}).l||'',feel:fb.feel,pain:fb.pain||null,change:ch.note}}).catch(()=>{});
  tmSched(); buzz(20); tmRender(); }
ACT.kbFb=(el,{k})=>{ if(KB_FEEL.some(f=>f[0]===k)) kbFbApply({feel:k}); };
ACT.kbFbPain=(el,{k})=>{ if(COACH.isInjury(k)) kbFbApply({feel:'hard',pain:k}); };

/* ---------- vocea pe faze: frazele fazei se aduc în cache înaintea ei ---------- */
function voxPreload(phase){ if(!('serviceWorker' in navigator)) return;
  const files=TRAINING.preloadFiles(VOX_INDEX,phase).map(f=>VOX_BASE+f);
  navigator.serviceWorker.ready.then(r=>{ if(r.active) r.active.postMessage({type:'warm-files',files}); }).catch(()=>{}); }
