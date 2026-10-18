/* =====================================================================
   5b · INDEXUL DATELOR — o singură trecere prin istoric, refolosită de toate ecranele.
   Se reface după fiecare salvare și la fiecare randare (cost O(n)), în loc ca fiecare
   calcul pe zile să parcurgă tot istoricul de forță pentru fiecare zi.
   ===================================================================== */
let IXC=null;
function IX(){
  if(IXC) return IXC;
  const day={}, dd=k=>day[k]||(day[k]={sets:0,vol:0,reps:0,ex:{},runs:[],km:0,rmin:0,tm:[],ext:[],hist:[]});
  const ex={};
  Object.keys(S.lifts||{}).forEach(n=>(S.lifts[n]||[]).forEach(e=>{ if(!e||!e.d||!Array.isArray(e.s)) return; const o=dd(e.d); let v=0, r=0;
    e.s.forEach(s=>{ const w=+s[0]||0, rp=+s[1]||0; v+=w*rp; r+=rp; });
    o.sets+=e.s.length; o.vol+=v; o.reps+=r; o.ex[n]=(o.ex[n]||0)+e.s.length;
    (ex[n]=ex[n]||[]).push({d:e.d,sets:e.s.length,vol:v,reps:r}); }));
  (S.runs||[]).forEach((r,i)=>{ if(!r||!r.date) return; const o=dd(r.date); o.runs.push(Object.assign({i},r)); o.km+=+r.km||0; o.rmin+=+r.min||0; });
  (S.tmlog||[]).forEach(t=>{ if(t&&t.date) dd(t.date).tm.push(t); });
  (S.ext||[]).forEach(x=>{ if(x&&x.date&&!x.dup) dd(x.date).ext.push(x); });
  (S.hist||[]).forEach(h=>{ if(h&&h.date) dd(h.date).hist.push(h); });
  const days=Object.keys(day).sort();
  IXC={day,days,ex,dl:{},first:days[0]||null}; return IXC;
}
const ixDay=d=>IX().day[d]||null;
/* sumele pe un interval de zile [a, b] */
function ixSum(a,b){ const o={sets:0,vol:0,reps:0,km:0,rmin:0,runs:0,days:0,lift:0,run:0,ses:0};
  IX().days.forEach(d=>{ if(d<a||d>b) return; const x=IX().day[d]; o.sets+=x.sets; o.vol+=x.vol; o.reps+=x.reps; o.km+=x.km; o.rmin+=x.rmin; o.runs+=x.runs.length;
    o.ses+=x.hist.length; if(x.sets||x.runs.length||x.hist.length||x.tm.length||x.ext.length) o.days++; if(x.sets) o.lift++; if(x.runs.length) o.run++; });
  return o; }
