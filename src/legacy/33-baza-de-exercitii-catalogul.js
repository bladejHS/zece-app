/* =====================================================================
   v8 · BAZA DE EXERCIȚII — catalogul (pentru căutarea Ctrl+K și harta mușchilor) și
   fișa unui exercițiu (execuție + statisticile tale).
   ===================================================================== */
const MUSC_RO={piept:'Piept',spate:'Spate',umeri:'Umeri',biceps:'Biceps',triceps:'Triceps',cvadriceps:'Cvadriceps',femurali:'Femurali',fesieri:'Fesieri',gambe:'Gambe',abdomen:'Abdomen',oblici:'Oblici',trapez:'Trapez','corp întreg':'Corp întreg'};
const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
let EXC=null;
function exDb(){
  if(EXC&&EXC.v===S.exCustom) return EXC.m; const m={};
  EXDB_RAW.forEach(([n,ro,g,pm,mm,eq,lvl,c,x,vr,alt])=>{ const G=GUIDE[n]; m[n]={n,ro,g,pm,mm:mm||{},eq,lvl,c:c||(G&&G.c)||[],x:x||(G&&G.x)||[],s:G&&G.s||'',var:vr||[],alt:alt||SWAPS[n]||[],plan:!!G}; });
  (S.exCustom||[]).forEach(e=>{ if(e&&e.n&&!m[e.n]) m[e.n]={n:e.n,ro:e.ro||'',g:e.g||'Corp întreg',pm:e.pm||'',mm:e.pm&&MUSC.some(([k])=>k===e.pm)?{[e.pm]:1}:{},eq:e.eq||'',lvl:+e.lvl||1,c:e.c?[e.c]:[],x:[],s:'',var:[],alt:[],custom:true}; });
  /* harta mușchilor (seriile pe grupe) cunoaște acum și exercițiile din catalog și pe cele proprii */
  Object.keys(m).forEach(n=>{ const mm=m[n].mm, ok=Object.keys(mm).filter(k=>MUSC.some(([q])=>q===k)); if(ok.length&&!EXM[n]){ const o={}; ok.forEach(k=>o[k]=mm[k]); EXM[n]=o; } });
  EXC={v:S.exCustom,m}; return m;
}
const exInfo=n=>exDb()[n]||{n,ro:'',g:'',pm:'',mm:EXM[n]||{},eq:'',lvl:0,c:[],x:[],s:'',var:[],alt:SWAPS[n]||[],unknown:true};
const exAllNames=()=>[...new Set(Object.keys(exDb()).concat(Object.keys(S.lifts||{})))].sort((a,b)=>a.localeCompare(b));
const exLast=n=>{ const h=liftHist(n); return h.length?h[h.length-1].d:null; };
const exFav=n=>(S.exFav||[]).indexOf(n)>=0;
function exSearch(q,f){
  const t=fold(q).split(/\s+/).filter(Boolean), db=exDb();
  let L=exAllNames().map(n=>db[n]||exInfo(n));
  if(f.g&&f.g!=='all') L=L.filter(e=>e.g===f.g);
  if(f.eq) L=L.filter(e=>e.eq===f.eq);
  if(f.lvl) L=L.filter(e=>e.lvl===f.lvl);
  if(f.only==='fav') L=L.filter(e=>exFav(e.n)); else if(f.only==='recent') L=L.filter(e=>exLast(e.n)).sort((a,b)=>exLast(a.n)<exLast(b.n)?1:-1); else if(f.only==='mine') L=L.filter(e=>e.custom);
  if(t.length) L=L.filter(e=>{ const hay=fold([e.n,e.ro,e.g,e.pm,MUSC_RO[e.pm],e.eq].concat(Object.keys(e.mm).map(k=>MUSC_RO[k]||k)).join(' ')); return t.every(w=>hay.indexOf(w)>=0); });
  return L;
}
/* fișa exercițiului: execuția, mușchii și statisticile tale */
function exHTML(){
  const n=SH.n, e=exInfo(n), L=liftHist(n).length?liftStats(n):null, rms=L?repMaxes(n):[], pts=liftHist(n).map(x=>({x:x.d,y:Math.max(0,...x.s.map(([w,r])=>e1rm(w,r)))})).filter(p=>p.y>0);
  const vols=liftHist(n).map(x=>({x:x.d,y:x.s.reduce((a,s)=>a+(+s[0]||0)*(+s[1]||0),0)})).filter(p=>p.y>0), sd=stdOf(n), note=exNote(n);
  const mus=Object.keys(e.mm).filter(k=>MUSC.some(([q])=>q===k)), m={}; mus.forEach(k=>m[k]=e.mm[k]*16);
  const back=mus.some(k=>['spate','triceps','fesieri','femurali'].indexOf(k)>=0), front=mus.some(k=>['piept','biceps','cvadriceps','umeri','gambe'].indexOf(k)>=0);
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
    <div class="eyebrow">${ic('dumbbell')} ${esc([e.g,e.eq,e.lvl?EX_LVL[e.lvl]:''].filter(Boolean).join(' · ')||'Exercițiu')}</div>
    <div class="h2" style="margin-top:6px">${esc(n)}</div>${e.ro?`<div class="sm mu">${esc(e.ro)}</div>`:''}
    <div class="inrow" style="flex-wrap:wrap"><a class="btn ghost sm" href="${ytLink(n)}" target="_blank" rel="noopener">${ic('play2')} Video</a></div>
    ${mus.length?`<div class="dsec"><h4>Mușchi</h4><div class="ex-mus"><div class="body-wrap" style="margin:0">${front?bodySVG('f',m,null,true):''}${back?bodySVG('b',m,null,true):''}</div>
      <div class="sp"><div><b>Principal:</b> ${esc(MUSC_RO[e.pm]||e.pm||'—')}</div><div class="mu sm" style="margin-top:4px">${Object.keys(e.mm).filter(k=>e.mm[k]<1).map(k=>MUSC_RO[k]||k).join(', ')?'Secundari: '+Object.keys(e.mm).filter(k=>e.mm[k]<1).map(k=>MUSC_RO[k]||k).join(', '):''}</div></div></div></div>`
      :e.pm?`<div class="dsec"><h4>Mușchi</h4><div><b>Principal:</b> ${esc(MUSC_RO[e.pm]||e.pm)}</div></div>`:''}
    ${e.c.length?`<div class="dsec"><h4>Execuție</h4>${e.c.map((c,i)=>`<div class="cue"><b>${i+1}</b><span>${esc(c)}</span></div>`).join('')}</div>`:''}
    ${e.x.length?`<div class="dsec"><h4>Greșeli frecvente</h4>${e.x.map(c=>`<div class="cue"><span class="xi">${ic('alert')}</span><span>${esc(c)}</span></div>`).join('')}</div>`:''}
    ${e.s?`<div class="note">${ic('shield')} ${esc(e.s)}</div>`:''}
    ${e.var.length||e.alt.length?`<div class="dsec"><h4>Variante și alternative</h4><div class="chips">${e.var.map(v=>exDb()[v]?`<button class="chip" data-a="exOpen" data-k="${esc(v)}">${esc(v)}</button>`:`<span class="tag">${esc(v)}</span>`).join('')}
      ${e.alt.map(v=>`<button class="chip" data-a="exOpen" data-k="${esc(v)}">${ic('swap')} ${esc(v)}</button>`).join('')}</div></div>`:''}
    <div class="dsec"><h4>Notițele tale</h4><button class="exnote" data-a="tech" data-k="${esc(n)}">${ic('edit')}<span>${note?esc(note):'Adaugă o notiță (setarea aparatului, priza, ce simți)'}</span></button></div>
    ${L?`<div class="dsec"><h4>Statisticile tale · ${L.ses.length} ${L.ses.length===1?'sesiune':'sesiuni'}</h4>
      <div class="kpis c4"><div class="kpi"><div class="k">1RM estimat</div><div class="v">${L.bestSet?L.bestSet.v:'—'}<small>kg</small></div></div><div class="kpi"><div class="k">Cea mai bună serie</div><div class="v">${L.bestSet&&L.bestSet.s?num(L.bestSet.s[0])+'×'+L.bestSet.s[1]:'—'}</div></div>
        <div class="kpi"><div class="k">Greutate maximă</div><div class="v">${L.bestW?num(L.bestW.w):'—'}<small>kg</small></div></div><div class="kpi"><div class="k">Volum maxim</div><div class="v">${L.bestVol?num(L.bestVol.v/1000,2):'—'}<small>t</small></div></div></div>
      ${pts.length>=2?lineChart({pts,trend:pts.length>=4,dots:true,unit:'kg',dec:0,label:'1RM estimat',name:'1RM estimat'}):''}
      ${vols.length>=2?`<div class="xs mu" style="margin-top:10px">Tonaj pe sesiune</div>${barChart(vols.slice(-16).map(p=>({lbl:fmtDay(p.x).split(' ')[0],tip:fmtDayY(p.x),v:Math.round(p.y/10)/100,hi:true})),{hex:TH().ac,dec:2,unit:'t',h:120,label:'tonaj pe sesiune',noVal:true})}`:''}
      ${rms.some(x=>x.best)?`<table class="rm"><tr><th>Repetări</th><th>Cel mai greu făcut</th><th>Estimat</th></tr>${rms.filter(x=>x.best||x.est).map(x=>`<tr><td><b>${x.r}</b> RM</td><td>${x.best?`<b>${num(x.best.w)}</b> kg <span class="xs mu">${relDay(x.best.d)}</span>`:'—'}</td><td>${x.est?num(x.est)+' kg':'—'}</td></tr>`).join('')}</table>`:''}
      ${sd?`<div class="note">Nivel orientativ: <b>${sd.lvl<0?'la început':STD_L[sd.lvl]}</b> · ${num(sd.ratio,2)}× greutatea corpului.</div>`:''}
      <div style="margin-top:8px">${L.ses.slice(-5).reverse().map(x=>`<div class="list-row sesr"><span>${relDay(x.d)}</span><span class="sess-l sp">${x.s.map(fmtSet).join(' · ')}</span>${x.tags.length?`<span class="prt">${x.tags.map(t=>`<span class="tag pr">PR ${t}</span>`).join('')}</span>`:''}</div>`).join('')}</div></div>`
      :`<div class="note">Încă nu ai serii la acest exercițiu. După primul antrenament, aici apar 1RM-ul estimat, recordurile și evoluția.</div>`}
    ${e.custom?`<button class="btn ghost sm danger" style="margin-top:12px" data-a="exDelC" data-k="${esc(n)}" data-confirm="Șterg? Apasă iar">${ic('trash')} Șterge exercițiul propriu</button>`:''}`;
}
ACT.exOpen=(el,{k})=>{ SH={kind:'ex',n:k,wide:1}; shRender(); const sh=$('#shRoot .sheet'); if(sh) sh.scrollTop=0; };
ACT.exDelC=async(el,{k})=>{ const old=(S.exCustom||[]).find(e=>e.n===k); await save('exCustom',(S.exCustom||[]).filter(e=>e.n!==k)); SH=null; shRender(); render();
  toast('Exercițiu șters',k+(liftHist(k).length?' · seriile notate rămân':''),'info',{l:'Anulează',f:async()=>{ await save('exCustom',(S.exCustom||[]).concat([old])); render(); }}); };
SHEETS.ex=()=>exHTML();
