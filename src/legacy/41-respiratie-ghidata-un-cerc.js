/* =====================================================================
   v9 · RESPIRAȚIE GHIDATĂ — un cerc care crește la inspir, stă pe loc la pauză și scade la expir.
   Sunet discret și vibrație la fiecare schimbare (dacă sunetul e pornit). Cu „Reducere mișcare",
   cercul nu se mai mișcă: rămân textul, secundele și bara de progres.
   ===================================================================== */
const BR_PAT={
  box:{n:'Pătrat · 4-4-4-4',d:'Calm și concentrare, înainte de antrenament',ph:[['in',4],['hold',4],['out',4],['rest',4]]},
  f478:{n:'4-7-8',d:'Relaxare seara, înainte de somn',ph:[['in',4],['hold',7],['out',8]]},
  calm:{n:'Calmare · 4-6',d:'După antrenament: expirul mai lung ajută corpul să se liniștească',ph:[['in',4],['out',6]]},
  slow:{n:'Ritm lent · 5,5',d:'Cam 5,5 respirații pe minut, inspir și expir egale',ph:[['in',5.5],['out',5.5]]}
};
const BR_L={in:['Inspiră','pe nas, lent'],hold:['Ține','aerul în piept'],out:['Expiră','lung, pe gură'],rest:['Ține','plămânii goi']};
const BR={on:false,t0:0,raf:0,pi:-1,done:false};
TOOLS.push(['br','wind','Respirație ghidată','Pătrat, 4-7-8, calmare după efort']);
TOOL_CAT[3][2].unshift('br');
const brPat=()=>BR_PAT[TL.bp]||BR_PAT.box;
const brDur=()=>(+TL.bd||3)*60;
/* unde suntem în exercițiu la secunda t: faza, cât a trecut din ea, scara cercului */
function brAt(t){ const P=brPat().ph, L=P.reduce((a,p)=>a+p[1],0); let x=t%L, i=0; while(i<P.length-1&&x>=P[i][1]){ x-=P[i][1]; i++; }
  const [k,len]=P[i], f=clamp(x/len,0,1), e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2;
  const sc=k==='in'?.56+.44*e:k==='out'?1-.44*e:k==='hold'?1:.56;
  return {i,k,len,left:Math.ceil(len-x-1e-6),sc,round:Math.floor(t/L)+1}; }
TOOL2.br={
  in:()=>`<div class="chips" style="margin-top:14px">${Object.keys(BR_PAT).map(k=>`<button class="chip ${(TL.bp||'box')===k?'on':''}" data-a="brSet" data-k="bp" data-s="${k}">${BR_PAT[k].n}</button>`).join('')}</div>
      <div class="xs mu" style="margin-top:8px">${esc(brPat().d)}</div>
      <div class="chips" style="margin-top:12px">${[1,2,3,5,10].map(m=>`<button class="chip ${String(TL.bd||3)===String(m)?'on':''}" data-a="brSet" data-k="bd" data-s="${m}">${m} min</button>`).join('')}</div>`,
  out:()=>{ const s=BR.on?brAt((performance.now()-BR.t0)/1000):null, l=s?BR_L[s.k]:null;
    return `<div class="br-st ${BR.on?'on':''}"><div class="br-c" id="brC" style="--sc:${s?s.sc.toFixed(3):.56}"><span class="br-g"></span><span class="br-r"></span></div>
        <div class="br-t"><b id="brL">${l?l[0]:BR.done?'Gata':'Pregătit'}</b><span id="brN">${s?s.left:''}</span><small id="brS">${l?l[1]:BR.done?'ai terminat':'apasă Start'}</small></div></div>
      <div class="bar" style="height:4px;margin-top:12px"><i id="brB" style="width:0%"></i></div>
      <div class="xs mu" style="text-align:center;margin-top:6px" id="brM">${BR.on?'':brPat().n+' · '+(+TL.bd||3)+' min'}</div>
      <button class="btn ${BR.on?'':'pri'} xl wide" style="margin-top:12px" data-a="brGo">${BR.on?ic('stop')+' Oprește':ic('play')+' Start'}</button>`; }
};
ACT.brSet=(el,{k})=>{ if(BR.on) return; TL[k]=el.dataset.s; BR.done=false; if(SH&&SH.kind==='tool') shRender(); };
function brStop(done){ BR.on=false; cancelAnimationFrame(BR.raf); BR.raf=0; BR.pi=-1; BR.done=!!done; keepAwake(false); }
ACT.brGo=()=>{ if(BR.on){ brStop(false); shRender(); return; }
  BR.on=true; BR.done=false; BR.t0=performance.now(); BR.pi=-1; keepAwake(true); shRender(); brTick(); };
function brTick(){
  const c=$('#brC'); if(!BR.on) return; if(!c||!(SH&&SH.kind==='tool'&&SH.k==='br')){ brStop(false); return; }
  const t=(performance.now()-BR.t0)/1000, T=brDur(), s=brAt(t), L=brPat().ph.reduce((a,p)=>a+p[1],0);
  /* se termină la capătul unei runde întregi, după durata aleasă */
  if(t>=Math.ceil(T/L)*L){ brStop(true); beep(523,.12); setTimeout(()=>beep(784,.18),160); buzz([30,60,30]); shRender(); toast('Respirație terminată',brPat().n+' · '+Math.round(t/60)+' min','info'); return; }
  if(!motionOff()) c.style.setProperty('--sc',s.sc.toFixed(3));
  const key=s.round+'|'+s.i; if(key!==BR.pi){ BR.pi=key; const l=BR_L[s.k]; $('#brL').textContent=l[0]; $('#brS').textContent=l[1]; c.dataset.k=s.k;
    beep(s.k==='in'?440:s.k==='out'?330:392,.06); buzz(12); }
  $('#brN').textContent=s.left; const b=$('#brB'); if(b) b.style.width=(Math.min(1,t/T)*100).toFixed(1)+'%';
  const m=$('#brM'); if(m) m.textContent='runda '+s.round+' · '+fmtClock(Math.max(0,T-t))+' rămas';
  BR.raf=requestAnimationFrame(brTick);
}
