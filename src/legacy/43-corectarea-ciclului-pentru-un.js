/* =====================================================================
   v9 · CORECTAREA CICLULUI — pentru un ciclu nou pornit din greșeală.
   „Revino la ciclul anterior": numărul ciclului scade cu 1. Zilele bifate între timp în ciclul nou
   se mută în ciclul vechi, la aceeași zi a săptămânii, în prima săptămână în care ziua aceea nu e făcută;
   antrenamentele terminate primesc ciclul și săptămâna noi. Se poate anula din mesajul de confirmare.
   ===================================================================== */
const cfHas=(c,w,d)=>Object.keys((S.wlog||{})[dKeyC(c,w,d)]||{}).length>0;
function cfCount(c){ let n=0; for(let w=0;w<WEEKS;w++) for(let d=0;d<7;d++) if(fullIn(c,w,d)) n++; return n; }
/* un ciclu terminat de-adevărat: toate cele 28 de zile bifate (în ciclul curent sau într-unul anterior) */
function cycDoneAny(){ if(!nextDay()) return true; for(let c=1;c<cyc();c++) if(cfCount(c)===WEEKS*7) return true; return false; }
/* realizarea deblocată greșit de un ciclu nou pornit din greșeală se șterge */
async function cfAchFix(){ if(S.ach&&S.ach.cyc&&!cycDoneAny()){ const a=Object.assign({},S.ach); delete a.cyc; await save('ach',a); } }
function cfPlan(){
  const h=cyc(); if(h<2) return null; const p=h-1, moves=[], stay=[], taken={};
  for(let w=0;w<WEEKS;w++) for(let d=0;d<7;d++){ if(!cfHas(h,w,d)) continue;
    let to=-1; for(let v=0;v<WEEKS;v++) if(!fullIn(p,v,d)&&!taken[v+'|'+d]){ to=v; break; }
    if(to<0) stay.push({w,d}); else { taken[to+'|'+d]=1; moves.push({w,d,to}); } }
  return {h,p,moves,stay,pf:cfCount(p),cf:cfCount(h)};
}
function cfHTML(){
  const P=cfPlan();
  if(!P) return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('refresh')} Ciclul</div><div class="h2" style="margin-top:6px">Ești în primul ciclu</div>
    <div class="note">Nu există un ciclu anterior la care să revii.</div>`;
  const row=m=>`<div class="list-row"><span class="sp"><b>${DAYN[m.d]}</b> <span class="xs mu">S${m.w+1}, ciclul ${P.h}</span></span><span class="xs mu">${ic('right')}</span><span class="v">S${m.to+1}, ciclul ${P.p}</span></div>`;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('refresh')} Corectează ciclul</div>
    <div class="h2" style="margin-top:6px">Revii la ciclul ${P.p}?</div>
    <div class="kpis c2" style="margin-top:14px"><div class="kpi"><div class="k">Ciclul ${P.p}</div><div class="v">${P.pf}<small>/ ${WEEKS*7} zile</small></div><div class="s">${P.pf<WEEKS*7?'neterminat':'complet'}</div></div>
      <div class="kpi"><div class="k">Ciclul ${P.h} · acum</div><div class="v">${P.cf}<small>/ ${WEEKS*7} zile</small></div><div class="s">${P.moves.length+P.stay.length?(P.moves.length+P.stay.length===1?'1 zi începută':(P.moves.length+P.stay.length)+' zile începute'):'nimic bifat'}</div></div></div>
    ${P.moves.length?`<div class="dsec"><h4>Ce mut în ciclul ${P.p}</h4>${P.moves.map(row).join('')}</div>`:''}
    ${P.stay.length?`<div class="note">${P.stay.map(m=>DAYN[m.d]+' S'+(m.w+1)).join(', ')}: ziua e deja făcută în toate săptămânile ciclului ${P.p}, așa că rămâne în ciclul ${P.h}.</div>`:''}
    <div class="note">Mut doar bifele din plan și eticheta ciclului de pe antrenamentele terminate. Seriile, alergările și restul istoricului rămân neatinse.</div>
    <button class="btn pri xl wide" style="margin-top:14px" data-a="cfGo">${ic('refresh')} Revino la ciclul ${P.p}</button>`;
}
SHEETS.cfix=()=>cfHTML();
ACT.cfOpen=()=>{ if(S.sess) return toast('Ai un antrenament în desfășurare','Termină-l sau închide-l, apoi corectează ciclul.','info'); SH={kind:'cfix'}; shRender(); };
ACT.cfGo=async()=>{
  const P=cfPlan(); if(!P||S.sess) return;
  const before={wlog:S.wlog,hist:S.hist,adj:S.adj,cyc:S.cyc};
  const log=Object.assign({},S.wlog), adj=Object.assign({},S.adj||{});
  P.moves.forEach(m=>{ const a=dKeyC(P.h,m.w,m.d), b=dKeyC(P.p,m.to,m.d), o=Object.assign({},log[b]||{});
    Object.keys(log[a]||{}).forEach(e=>{ o[b+e.slice(a.length)]=1; }); log[b]=o; delete log[a];
    if(adj[a]){ adj[b]=adj[a]; delete adj[a]; } });
  const hist=(S.hist||[]).map(x=>{ if(x.cyc!==P.h) return x; const m=P.moves.find(m=>m.w===x.w&&m.d===x.d); return m?Object.assign({},x,{cyc:P.p,w:m.to}):x; });
  await save('wlog',log); await save('hist',hist); await save('adj',adj); await save('cyc',Object.assign({},S.cyc||{},{h:P.p,t:Date.now()}));
  await cfAchFix(); S.planW=null; S.openDay=-1; SH=null; shRender(); render();
  toast('Ai revenit la ciclul '+P.p,P.moves.length?P.moves.length+(P.moves.length===1?' zi mutată':' zile mutate')+' din ciclul '+P.h+'.':'Continui de unde ai rămas.','',
    {l:'Anulează',f:async()=>{ await save('wlog',before.wlog); await save('hist',before.hist); await save('adj',before.adj); await save('cyc',Object.assign({},before.cyc||{},{t:Date.now()})); render(); toast('Corectarea a fost anulată','','info'); }});
};

/* v9 bifa abdomenul pe zilele terminate înainte să existe. De la v10 abdomenul e opțional și nu mai contează
   la ziua completă, deci nu mai bifez nimic în locul tău: rămâne doar versiunea planului. */
async function planAbsMigrate(v){
  if(v>=2) return; await save('planV',2);
}
