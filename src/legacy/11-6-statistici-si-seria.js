/* =====================================================================
   6 · STATISTICI ȘI SERIA DE SĂPTĂMÂNI
   ===================================================================== */
let STC=null;
function stats(){
  if(STC) return STC;
  let sets=0,vol=0,bench=0; Object.keys(S.lifts||{}).forEach(n=>(S.lifts[n]||[]).forEach(e=>e.s.forEach(([w,r])=>{ sets++; vol+=w*r; if(n==='Bench Press'&&r>0&&w>bench) bench=w; })));
  const runs=S.runs||[], km=sumKm(runs), maxRun=Math.max(0,...runs.map(r=>+r.km||0));
  const sessions=(S.hist||[]).length, prs=prEvents().length, weighins=wList().length;
  const meals=Object.values(S.mlog||{}).reduce((a,d)=>a+(Array.isArray(d)?d.length:0),0);
  const tg=targets(), protDays=Object.keys(S.mlog||{}).filter(k=>dayTotals(k).p>=tg.p*.95).length;
  const ws=wStats(), lost=ws?prof().startW-ws.a7:0, streak=streakWeeks();
  STC={sets,vol,bench,km,maxRun,sessions,prs,weighins,meals,protDays,lost,streak};
  return STC;
}
function streakWeeks(){
  const {L,R}=activity(), all=new Set([...L,...R]); let m=mondayOf(todayKey());
  const cnt=m0=>{ let n=0; for(let i=0;i<7;i++) if(all.has(dayShift(m0,i))) n++; return n; };
  let s=0; if(cnt(m)>=3) s++; m=dayShift(m,-7); while(cnt(m)>=3&&s<520){ s++; m=dayShift(m,-7); } return s;
}
