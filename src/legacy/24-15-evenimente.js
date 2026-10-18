/* =====================================================================
   15 · EVENIMENTE
   ===================================================================== */
document.addEventListener('pointerdown',ev=>{
  const b=ev.target.closest('.btn'); if(!b) return;
  const r=b.getBoundingClientRect(), d=Math.max(r.width,r.height), sp=document.createElement('span');
  sp.className='rip'; sp.style.cssText=`width:${d}px;height:${d}px;left:${ev.clientX-r.left-d/2}px;top:${ev.clientY-r.top-d/2}px`;
  b.appendChild(sp); setTimeout(()=>sp.remove(),520);
},{passive:true});

document.addEventListener('click',async ev=>{
  const el=ev.target.closest('[data-a]'); if(!el||el.disabled) return;
  if((el.classList.contains('ov')||el.classList.contains('celeb'))&&ev.target!==el) return;
  if(el.dataset.confirm&&!el.classList.contains('armed')){ arm(el); return; }
  actxGet();
  const a=el.dataset.a, k=el.dataset.k, tk=todayKey(), I=+el.dataset.i;
  const W=+el.dataset.w, D=+el.dataset.d, X=+el.dataset.x;
  const s=S.sess;
  switch(a){
    case 'tab': { if(SH){ SH=null; shRender(); } if(CAL.open){ CAL.open=false; calRender(); }
      /* data-s = sub-pagina (Performanță: ov, s, r, k1…; Antrenament: plan, hist; Setări: secțiunea); data-f = cardul la care derulez */
      const sub=el.dataset.s, foc=el.dataset.f||(k==='set'&&sub?sub:null);
      if(sub&&k==='prog') S.progTab=sub; if(sub&&k==='plan') S.trTab=sub;
      if(S.tab!==k||sub){ S.tab=k; render(); window.scrollTo({top:0}); } else if(k==='coach') scrollEnd(true); else window.scrollTo({top:0,behavior:'smooth'});
      if(foc) requestAnimationFrame(()=>{ const c=$('#'+foc); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); });
      return; }
    case 'openDay': S.tab='plan'; S.planW=W; S.openDay=D; render(); requestAnimationFrame(()=>{ const c=$('#day'+D); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }); return;
    case 'toggleDay': S.openDay=S.openDay===D?-1:D; { const c=$('#day'+D); if(c){ document.querySelectorAll('.day.open').forEach(o=>{ if(o!==c) o.classList.remove('open'); });
        c.classList.toggle('open',S.openDay===D); c.querySelector('.day-h').setAttribute('aria-expanded',S.openDay===D); } } return;
    case 'planW': S.planW=I; render(); return;
    case 'tick': { const on=!isDone(W,D,X); await setDone(W,D,X,on); render(); if(on){ const t=document.querySelector(`.tick[data-w="${W}"][data-d="${D}"][data-x="${X}"]`); if(t) t.classList.add('pop'); buzz(15);
        if(!optX(D,X)&&dayFull(W,D)){ const c=$('#day'+D); if(c){ const r=c.getBoundingClientRect(); burstAt(r.left+r.width/2,r.top+30,26); dbgStamp(c); } toast('Zi completă',DAYN[D]+' · '+PLAN[D].t); } } return; }
    case 'start': if(S.sess){ await startSess(W,D); return; } rdOpen(W,D); return;
    case 'rd': RD[k]=I; buzz(8); rdRender(); return;
    case 'rdGo': { const r=RD, sc=rdScore(r), rd={sleep:r.sleep,energy:r.energy,sore:r.sore,score:sc}; RD=null; rdRender(); await jSet(tk,{sleepQ:r.sleep,energy:r.energy,sore:r.sore});
      await startSess(r.w,r.d,rd); return; }
    case 'ci': { const v=el.dataset.v, num_=+v; S.ciOpen=true; await jSet(tk,{[k]:k==='soreReg'?(jOf(tk).soreReg===v?null:v):num_}); buzz(8); render(); return; }
    case 'ciSave': { const g=id=>parseInt(($('#'+id)||{}).value,10), o={}, rh=g('ciRhr'), hv=g('ciHrv'), st=g('ciSteps');
      o.rhr=rh>=30&&rh<=120?rh:null; o.hrv=hv>=5&&hv<=300?hv:null; o.steps=st>0&&st<100000?st:null; await jSet(tk,o); S.ciOpen=false; render(); toast('Check-in salvat','','info'); return; }
    case 'ciToggle': S.ciOpen=I===1; render(); return;
    case 'mWin': S.mWin=I; render(); return;
    case 'adjOn': { const key=dKey(W,D), P=ADJ.ai[key]||adaptFor(W,D); if(!P||!(P.ch||[]).length) return;
      const a={date:tk,on:true,src:P.src,kind:P.kind,title:P.title,summary:P.summary||'',v:P.v,groups:P.groups,ch:P.ch};
      const all=Object.assign({},S.adj); Object.keys(all).forEach(x=>{ if(all[x].date<dayShift(tk,-30)) delete all[x]; }); all[key]=a; await save('adj',all);
      buzz(20); toast('Ajustări aplicate','Doar pentru antrenamentul de azi. Planul de bază rămâne neschimbat.','info'); render(); return; }
    case 'adjOff': { const all=Object.assign({},S.adj); delete all[dKey(W,D)]; await save('adj',all); toast('Înapoi la planul de bază','','info'); render(); return; }
    case 'adjNo': { const all=Object.assign({},S.adj); all[dKey(W,D)]={date:tk,on:false,no:true}; await save('adj',all); render(); return; }
    case 'adjShow': { const all=Object.assign({},S.adj); delete all[dKey(W,D)]; await save('adj',all); render(); return; }
    case 'adjAI': adjAI(W,D); return;
    case 'goTwin': if(SH){ SH=null; shRender(); } S.tab='prog'; S.progTab='twin'; render(); window.scrollTo({top:0}); return;
    case 'ciOpen': SH={kind:'ci'}; shRender(); return;
    case 'setGo': { const t=$('#'+k); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); return; }
    case 'goalAdd': SH={kind:'goal',k:k||'lift'}; shRender(); return;
    case 'goalK': if(SH&&SH.kind==='goal'){ SH.k=k; shRender(); } return;
    case 'goalSave': await goalSave(); return;
    case 'goalDel': await save('goals',(S.goals||[]).filter(g=>g.id!==k)); render(); return;
    case 'recM': S.recM=k; render(); return;
    case 'askQ': if(k) aiSend(k); return;
    case 'toolOpen': SH={kind:'tool',k:'menu'}; shRender(); return;
    case 'suppOn': { const on=Object.assign({},S.supp.on); if(on[k]) delete on[k]; else on[k]=true; await save('supp',Object.assign({},S.supp,{on})); render(); return; }
    case 'suppTick': { const log=Object.assign({},S.supp.log), d=(log[tk]||[]).slice(), i=d.indexOf(k); if(i>=0) d.splice(i,1); else { d.push(k); buzz(10); }
      if(d.length) log[tk]=d; else delete log[tk]; await save('supp',Object.assign({},S.supp,{log})); render(); return; }
    case 'toolGo':
      if(k==='tm'){ SH=null; shRender(); TM.open=true; TM.list=true; TM.choose=null; TM.st=null; tmRender(); return; }
      if(k==='food'){ FD.err=null; SH={kind:'food'}; shRender(); return; }
      if(k==='zones'){ SH=null; shRender(); S.tab='prog'; S.progTab='r'; render(); requestAnimationFrame(()=>{ const c=$('#zonesCard'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }); return; }
      toolDefaults(k); SH={kind:'tool',k}; shRender(); { const sh=$('#shRoot .sheet'); if(sh) sh.scrollTop=0; } return;
    case 'tlSet': TL[k]=el.dataset.s!=null?el.dataset.s:String(I); if(SH&&SH.kind==='tool') shRender(); return;
    case 'cycOpen': SH={kind:'cyc'}; shRender(); return;
    case 'syConnect': await syConnect(); return;
    case 'syNow': await syncNow(true); return;
    case 'syAuto': await syPatch({auto:syCfg().auto===false}); syPaint(); return;
    case 'syOff': await store.set(K.sync,{dev:syCfg().dev}); S.sync={dev:syCfg().dev}; SY.msg=''; SY.err=''; render(); toast('Sincronizare oprită','Datele de pe acest dispozitiv rămân. Copia criptată din cloud rămâne pe GitHub.','info'); return;
    case 'errCopy': try{ await navigator.clipboard.writeText(errList().map(e=>e.t+' '+e.m+(e.s?' ('+e.s+')':'')).join('\n')||'gol'); toast('Copiat','Jurnalul de erori e în clipboard.','info'); }catch(e){ toast('Nu pot copia aici','','info'); } return;
    case 'errClear': try{ localStorage.removeItem(ERRK); }catch(e){} render(); return;
    case 'cycPick': if(SH&&SH.kind==='cyc'){ SH.c=I; shRender(); } return;
    case 'cycShare': { const d=cycData(I); if(!d) return; await shareImg({k:'Ciclul '+d.c+' · '+fmtDay(d.from)+' – '+fmtDay(d.to),t:'4 săptămâni',stats:[[d.full+'/28','zile complete'],[d.sets,'serii'],[num(d.km,1),'km'],[d.prs.length,'recorduri']],
      lines:d.lifts.slice(0,3).map(x=>x.n+': '+(x.ch>0?'+':'')+num(x.ch,1)+'%')}); return; }
    case 'cycAsk': { const d=cycData(I); if(!d) return; SH=null; shRender();
      aiSend('Am terminat ciclul '+d.c+' ('+fmtDay(d.from)+' – '+fmtDay(d.to)+'): '+d.full+'/28 zile complete, '+d.hs.length+' antrenamente, '+d.sets+' serii, '+num(d.km,1)+' km, '+d.prs.length+' recorduri'+(d.w0!=null&&d.w1!=null?', greutatea '+num(d.w0,1)+' → '+num(d.w1,1)+' kg':'')+'. Forța: '+(d.lifts.slice(0,6).map(x=>x.n+' '+(x.ch>0?'+':'')+num(x.ch,1)+'%').join(', ')||'fără date')+'. Ce a mers, ce nu și ce ajustez în ciclul următor, fără să schimb exercițiile sau zilele?'); return; }
    case 'vdotThr': { const v=I/600; if(!(v>2&&v<12)) return; await save('prof',Object.assign({},S.prof||{},{thrPace:Math.round(v*1000)/1000})); toast('Ritm de prag setat',mmss(v)+' /km · zonele de ritm s-au actualizat','info'); return; }
    case 'foodOpen': FD.err=null; SH={kind:'food'}; shRender(); return;
    case 'fdCat': FD.cat=k; shRender(); return;
    case 'fdPick': { const f=foodAll().find(x=>x[0]===k); if(!f) return; foodSel({n:f[0],k:f[1],p:f[2],c:f[3],g:f[4],por:f[5]==='m'?(f[6]!==100?f[6]:null):f[6],pl:f[7],mine:f[5]==='m',brand:f[8]||''}); return; }
    case 'fdClear': FD.sel=null; shRender(); return;
    case 'fdG': FD.g=String(I); { const s=$('#fdSel'); if(s) s.innerHTML=foodOutHTML(); } return;
    case 'fdBc': await foodBarcode((($('#fdBc')||{}).value||FD.bc)); return;
    case 'fdAdd': { const f=FD.sel, g=parseFloat(String(FD.g).replace(',','.')); if(!f||!(g>0&&g<=3000)){ shake('#fdG'); return; }
      const m={n:(f.n+' · '+num(g,0)+' g').slice(0,80),k:Math.round(f.k*g/100),p:Math.round(f.p*g/100),c:Math.round(f.c*g/100),g:Math.round(f.g*g/100)};
      await addMeal(m); FD.sel=null; FD.q=''; SH=null; shRender(); render(); toast('Adăugat în jurnal',m.n+' · '+m.k+' kcal · '+m.p+' g proteină','info'); return; }
    case 'fdMine': { const n=(($('#faN')||{}).value||'').trim(), g=id=>parseFloat((($('#'+id)||{}).value||'').replace(',','.')), kc=g('faK'), pr=g('faP');
      if(!n){ shake('#faN'); return; } if(!(kc>=0&&kc<=950)){ shake('#faK'); return; } if(!(pr>=0&&pr<=100)){ shake('#faP'); return; }
      const f={n:n.slice(0,70),k:Math.round(kc),p:+pr.toFixed(1),c:+((g('faC')||0)).toFixed(1),g:+((g('faG')||0)).toFixed(1),por:g('faPor')>0?Math.round(g('faPor')):null};
      await save('foods',[f].concat((S.foods||[]).filter(x=>x.n!==f.n)).slice(0,60)); FD.add=false; FD.cat='m'; shRender(); foodSel(Object.assign({mine:true,pl:'o porție'},f)); toast('Aliment salvat',f.n,'info'); return; }
    case 'tlLift': { const L=liftStats(k), bs=L&&L.bestSet; if(bs&&bs.s){ TL.rw=num(bs.s[0]); TL.rr=String(bs.s[1]); } if(SH&&SH.kind==='tool') shRender(); return; }
    case 'goBody': S.tab='prog'; S.progTab='b'; render(); window.scrollTo({top:0}); return;
    case 'twAttr': S.twAttr=k; render(); return;
    case 'twRange': S.twRange=I; render(); return;
    case 'ptAdd': { const raw=(($('#pt_'+k)||{}).value||'').trim(); let v;
      if(k==='k1'){ const m=/^(\d{1,2}):(\d{2})$/.exec(raw); v=m?(+m[1])*60+(+m[2]):parseFloat(raw); if(!(v>=120&&v<=900)){ shake('#pt_'+k); return; } }
      else { v=parseFloat(raw.replace(',','.')); const lim={hang:[1,600],broad:[50,400],reach:[-40,50]}[k]; if(!(v>=lim[0]&&v<=lim[1])){ shake('#pt_'+k); return; } }
      await save('ptests',(S.ptests||[]).concat([{date:tk,type:k,value:Math.round(v*10)/10}])); render(); toast('Test salvat',PTESTS.find(p=>p[0]===k)[1],'info'); return; }
    case 'ptDel': await save('ptests',(S.ptests||[]).filter((_,j)=>j!==I)); render(); return;
    case 'sumRpe': { const m=S.summary; if(!m) return; m.rpe=I; const h=(S.hist||[]).slice(), j=h.length-1-[...h].reverse().findIndex(x=>x.date===m.date&&x.d===m.d&&x.w===m.w&&x.dur===m.dur);
      if(j>=0&&j<h.length){ h[j]=Object.assign({},h[j],{rpe:I}); await save('hist',h); } buzz(10); renderFocus(); return; }
    case 'rdSkip': { const r=RD; RD=null; rdRender(); await startSess(r.w,r.d,null); return; }
    case 'rdClose': RD=null; rdRender(); return;
    case 'newCycle': { const c=Object.assign({},S.cyc||{}); c.h=cyc()+1; c.t=Date.now(); await save('cyc',c); S.planW=0; S.openDay=-1; render(); toast('Ciclul '+cyc(),'Planul reîncepe de la săptămâna 1.'); return; }
    case 'resetCycle': { const log=Object.assign({},S.wlog), pre='hc'+cyc()+'w'; Object.keys(log).forEach(x=>{ if(x.indexOf(pre)===0) delete log[x]; }); await save('wlog',log); render(); toast('Bife șterse','Ciclul '+cyc()+' reîncepe de la zero.','info'); return; }
    case 'wAdd': { const inp=$('#wIn'), v=parseFloat(String(inp&&inp.value||'').replace(',','.')); if(!(v>30&&v<400)){ shake('#wIn'); return; }
      /* o cântărire cu peste 6% față de media ultimelor zile e, de obicei, o greșeală de tastare: cer confirmare */
      const ws=wStats(); if(ws&&Math.abs(v-ws.a7)/ws.a7>.06&&!el.dataset.ok){ el.dataset.ok='1'; setTimeout(()=>{ delete el.dataset.ok; },5000);
        toast('Verifică greutatea',num(v)+' kg față de media ta de '+num(ws.a7,1)+' kg. Apasă din nou ca s-o salvezi.','info'); return; }
      delete el.dataset.ok; const w=Object.assign({},S.weights); w[tk]=Math.round(v*10)/10; await save('weights',w); render(); toast('Greutate salvată',num(v)+' kg · '+fmtDay(tk),'info'); return; }
    case 'wDel': { const w=Object.assign({},S.weights), old=w[k]; delete w[k]; await save('weights',w); render();
      toast('Cântărire ștearsă',num(old)+' kg · '+fmtDay(k),null,{l:'Anulează',f:async()=>{ const x=Object.assign({},S.weights); x[k]=old; await save('weights',x); render(); }}); return; }
    case 'wRange': S.wRange=I; render(); return;
    case 'progTab': S.progTab=k; render(); return;
    case 'prEx': S.prEx=k; render(); return;
    case 'goRuns': S.tab='prog'; S.progTab='r'; render(); requestAnimationFrame(()=>{ const f=$('#runForm'); if(f) f.scrollIntoView({behavior:'smooth',block:'center'}); }); return;
    case 'runKind': S.runKind=k; render(); return;
    case 'runAdd': { const km=parseFloat(String($('#rKm').value).replace(',','.'))||0, mn=parseMin($('#rMin').value), dt=$('#rDate').value||tk, rpe=parseInt($('#rRpe').value,10);
      if(!(km>0)||km>300){ shake('#rKm'); return; }
      if(mn&&(mn/km<2||mn/km>20)&&!el.dataset.ok){ el.dataset.ok='1'; toast('Verifică timpul',num(km,2)+' km în '+fmtClock(mn*60)+' înseamnă '+mmss(mn/km)+' /km. Apasă din nou ca să salvezi așa.','info'); return; }
      delete el.dataset.ok;
      const run={date:dt>tk?tk:dt,kind:S.runKind,km:Math.round(km*100)/100,min:Math.round(mn*10)/10}; if(rpe>=1&&rpe<=10) run.rpe=rpe;
      const hr=parseInt(($('#rHr')||{}).value,10); if(hr>=60&&hr<=220) run.hr=hr;
      const sp=parseSplits(($('#rSpl')||{}).value,run.km); if(sp) run.spl=sp;
      const pb=prBook().cur, before={dist:pb.dist&&pb.dist.v,pace:pb.pace&&pb.pace.v};
      await save('runs',(S.runs||[]).concat([run])); render();
      const pc=mn?mn/km:null;
      if(before.dist&&run.km>before.dist+1e-9) prMoment({t:'Cea mai lungă alergare',v:num(run.km,2)+' km',p:num(before.dist,2)+' km'});
      else if(pc&&run.km>=1&&before.pace&&pc<before.pace-1e-9) prMoment({t:'Cel mai rapid ritm',v:mmss(pc)+' /km',p:mmss(before.pace)+' /km',s:num(run.km,1)+' km'});
      else toast('Alergare salvată',num(km,2)+' km'+(mn?' · '+fmtPace(mn/km):''),'info'); return; }
    case 'runDel': { const r=(S.runs||[])[I]; if(r&&r.sid) await stPatch({del:(stCfg().del||[]).concat([String(r.sid)]).slice(-500)});
      await save('runs',(S.runs||[]).filter((_,j)=>j!==I)); render(); return; }
    case 'runKind2': { const r=(S.runs||[])[I]; if(!r) return; const ord=RUN_KINDS, rs=(S.runs||[]).slice(); rs[I]=Object.assign({},r,{kind:ord[(ord.indexOf(r.kind)+1)%ord.length]}); await save('runs',rs); render(); return; }
    case 'stGo': S.tab='set'; if(SH){ SH=null; shRender(); } render(); requestAnimationFrame(()=>{ const c=$('#stSet'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }); return;
    case 'stKeys': { const cid=(($('#stCid')||{}).value||'').trim(), sec=(($('#stSec')||{}).value||'').trim();
      if(!/^\d{3,12}$/.test(cid)){ shake('#stCid'); return; } if(!/^[0-9a-f]{30,64}$/i.test(sec)){ shake('#stSec'); return; }
      await stPatch({cid,sec,err:''}); stConnect(); return; }
    case 'stConnect': stConnect(); return;
    case 'stSync': stSync(true); return;
    case 'stAuto': await stPatch({auto:stCfg().auto===false}); render(); return;
    case 'stFlush': ST.msg=''; await stFlush(); if(!S.summary) render(); return;
    case 'stSendPend': if(ST.pend){ const it=ST.pend; ST.pend=null; await stQueue(it); stSumPaint(it.key); await stFlush(); } return;
    case 'stQDrop': await save('stq',[]); ST.msg=''; render(); return;
    case 'stOff': { const c=stCfg(); try{ if(c.tok) await fetch('https://www.strava.com/oauth/deauthorize',{method:'POST',body:new URLSearchParams({access_token:c.tok})}); }catch(e){}
      await save('strava',{cid:c.cid,sec:c.sec,own:c.own||[],del:c.del||[]}); ST.msg=''; render(); toast('Strava deconectat','Antrenamentele importate rămân în ZECE.','info'); return; }
    case 'stReset': await save('strava',{own:stCfg().own||[],del:stCfg().del||[]}); ST.msg=''; render(); return;
    case 'stCopy': try{ await navigator.clipboard.writeText(k); toast('Copiat',k,'info'); }catch(e){ toast('Nu pot copia aici','Selectează textul și copiază-l manual.','info'); } return;
    case 'extDel': await stPatch({del:(stCfg().del||[]).concat([String(k)]).slice(-500)}); await save('ext',(S.ext||[]).filter(x=>String(x.sid)!==String(k))); render(); return;
    case 'measAdd': { const o={}; MEAS.forEach(([m])=>{ const v=parseFloat(($('#m_'+m)||{}).value); if(v>=15&&v<=250) o[m]=Math.round(v*10)/10; });
      const bf=parseFloat(String(($('#m_bf')||{}).value||'').replace(',','.')); if(bf>=3&&bf<=70) o.bf=Math.round(bf*10)/10;
      if(!Object.keys(o).length){ shake('#m_waist'); return; } const b=Object.assign({},S.body); b[tk]=Object.assign({},b[tk]||{},o); await save('body',b); render(); toast('Măsurători salvate','','info'); return; }
    case 'measDel': { const b=Object.assign({},S.body), old=b[k]; delete b[k]; await save('body',b); render();
      toast('Măsurători șterse',fmtDay(k),null,{l:'Anulează',f:async()=>{ const x=Object.assign({},S.body); x[k]=old; await save('body',x); render(); }}); return; }
    case 'water': await addWater(I); buzz(12); render(); if(I>0) floatText(el,'+'+I+' ml'); return;
    case 'mealAdd': { const n=($('#mN').value||'').trim(), kc=parseFloat($('#mK').value), p=parseFloat($('#mP').value)||0;
      if(!n){ shake('#mN'); return; } if(!(kc>=0&&kc<=5000)){ shake('#mK'); return; }
      await addMeal({n:n.slice(0,80),k:Math.round(kc),p:Math.round(p),c:Math.round(parseFloat($('#mC').value)||0),g:Math.round(parseFloat($('#mG').value)||0)}); render(); toast('Masă adăugată',n+' · '+Math.round(kc)+' kcal','info'); return; }
    case 'mealAgain': { let m=null; Object.keys(S.mlog||{}).sort().forEach(d=>(S.mlog[d]||[]).forEach(x=>{ if((x.n||'').toLowerCase()===String(k).toLowerCase()) m=x; }));
      if(m){ await addMeal(Object.assign({},m)); render(); toast('Masă adăugată',m.n+' · '+Math.round(+m.k||0)+' kcal','info'); } return; }
    case 'mealDel': { const ml=Object.assign({},S.mlog); ml[tk]=mlogDay(tk).filter((_,j)=>j!==I); await save('mlog',ml); render(); return; }
    case 'scanRun': await scanRun(); return;
    case 'scanX': Object.assign(SC,{img:null,data:null,res:null,err:null,busy:false,hint:''}); render(); return;
    case 'scanAdd': { const n=($('#scN').value||'').trim()||'Masă', kc=parseFloat($('#scK').value)||0;
      await addMeal({n:n.slice(0,80),k:Math.round(kc),p:Math.round(parseFloat($('#scP').value)||0),c:Math.round(parseFloat($('#scC').value)||0),g:Math.round(parseFloat($('#scG').value)||0)});
      Object.assign(SC,{img:null,data:null,res:null,err:null}); render(); toast('Masă adăugată',n+' · '+Math.round(kc)+' kcal'); burstAt(innerWidth/2,120,18); return; }
    case 'fxOpen': S.fxOpen=true; keepAwake(true); render(); return;
    case 'fxMin': S.fxOpen=false; render(); return;
    case 'fxGo': if(!s) return; S.fxDir=X>s.cur?'r':X<s.cur?'l':''; s.cur=X; await persistSess(); renderFocus(); return;
    case 'fxNext': if(!s) return; { const n=sessDay(s).ex.length; if(s.cur<n-1){ s.cur++; S.fxDir='r'; await persistSess(); renderFocus(); $('#fxRoot .fx').scrollTop=0; } } return;
    case 'fxPrev': if(!s||s.cur<=0) return; s.cur--; S.fxDir='l'; await persistSess(); renderFocus(); return;
    case 'fxFinish': await finishSess(); return;
    case 'fxQuit': await quitSess(); return;
    case 'sumClose': S.summary=null; render(); return;
    case 'sumAsk': { const m=S.summary; S.summary=null; aiSend('Tocmai am terminat antrenamentul de '+DAYN[m.d]+' ('+m.t+')'+'. Cum a mers și la ce să fiu atent data viitoare?'); return; }
    case 'kg': case 'rp': case 'km': case 'mn': { const id={kg:'#inKg',rp:'#inRp',km:'#inKm',mn:'#inMin'}[a], inp=$(id); if(!inp) return;
      const step=parseFloat(el.dataset.v), v=Math.max(0,(parseFloat(inp.value)||0)+step), r=a==='rp'?Math.round(v):Math.round(v*100)/100;
      inp.value=a==='rp'?r:num(r,2); if(s&&a==='kg'){ s.kg[s.cur]=r; updAux(); } if(s&&a==='rp') s.rp[s.cur]=r; if(s&&a==='mn') s.tmMin[s.cur]=r; buzz(8); updPace(); return; }

    case 'logSet': if(s) await logSet(el); return;
    case 'undoSet': if(s) await undoSet(); return;
    case 'logRun': if(s) await logRun(); return;
    case 'exDone': if(s) await exDone(); return;
    case 'restAdd': if(S.rest){ const d=isFinite(I)&&I?I:30, left=(S.rest.end-Date.now())/1000, nd=Math.max(1,left+d)-left; S.rest.end+=nd*1000; S.rest.total=Math.max(1,S.rest.total+nd); restSounds((S.rest.end-Date.now())/1000); tick(); buzz(8); } return;
    case 'restSkip': stopRest(); renderFocus(); renderPill(); return;
    case 'tmList': TM.open=true; TM.list=true; TM.choose=null; TM.st=null; tmRender(); return;
    case 'tmFor': if(!s) return; { const day=sessDay(s), pr=tmPresetFor(day.ex[X],day,s.w); if(pr) tmOpen(pr,X); } return;
    case 'tmPick': { const from=TM.choose?TM.choose.from:null, f=k==='engine'?P_ENGINE:k==='amrap'?P_AMRAP:(TM_LIST().find(t=>t[0]===k)||[])[4]; if(f) tmOpen(f(),from); } return;
    case 'tmGo': tmGo(); return;
    case 'tmPause': { const st=TM.st; if(!st) return; if(st.pAt){ const pd=Date.now()-st.pAt; st.t0+=pd; st.pausedMs+=pd; st.pAt=null; tmSched(); keepAwake(true); cuesFor(st); } else { st.pAt=Date.now(); cancelSched('tm'); cancelSched('cue'); if(!S.sess) keepAwake(false); } buzz([40]); tmRender(); return; }
    case 'tmSkip': if(TM.st&&!TM.st.pAt) tmAdvance(0,false); return;
    case 'tmLap': if(TM.st) tmAdvance(0,false); return;
    case 'tmRound': if(TM.st){ TM.st.rounds++; const r=$('#tmRounds'); if(r) r.textContent=TM.st.rounds; beep(990,.06); buzz(30); floatText(el,'+1'); } return;
    case 'tmApply': { const st=TM.st; if(st&&s&&st.from!=null){ if(st.run){ s.tmMin[st.from]=Math.round(st.total/60*10)/10; s.cur=st.from; await persistSess(); } else { s.cur=st.from; await exDone(); } }
      TM.open=false; TM.st=null; cancelSched('tm'); tmRender(); renderFocus(); return; }
    case 'tmClose': TM.open=false; TM.st=null; TM.list=false; TM.choose=null; cancelSched('tm'); if(!S.sess){ keepAlive(false); keepAwake(false); } tmRender(); return;
    case 'ask': if(RC.open){ RC.open=false; rcRender(); } aiSend(QUICK[I]); return;
    case 'aiSend': { const t=$('#aiIn'); aiSend(t?t.value:''); return; }
    case 'aiStop': if(AI.stream) AI.stream.abort(); return;
    case 'aiRetry': if(!AI.busy&&S.aiChat) await runTurn(null); return;
    case 'aiNew': AI.err=null; AI.usage=null; AI.retry=false; S.aiChat=null; await store.set(K.aiChat,null); render(); return;
    case 'toolOk': await toolDecide(k,true); return;
    case 'toolNo': await toolDecide(k,false); return;
    case 'voice': voice(); return;
    case 'aiKeySave': { const v=($('#aiKeyIn').value||'').trim(); if(!COACH.vault.isApiKey(v)){ shake('#aiKeyIn'); toast('Cheia nu pare validă','O cheie Anthropic începe cu „sk-ant-". O copiezi din console.anthropic.com → API Keys.','info'); return; }
      try{ await COACH.vault.saveKey(v); }catch(e){ toast('Cheia nu s-a putut salva criptat','Browserul nu permite stocarea (poate e modul privat). Cheia merge doar până închizi aplicația.','info'); }
      S.aiKey=v; AI.err=null; render(); toast('Cheie salvată','Criptată pe acest dispozitiv. Antrenorul AI e gata.','info'); setTimeout(aiSyncQueue,500); return; }
    case 'cuesToggle': await save('cues',S.cues===false); render(); return;
    case 'deloadToggle': await save('deload',S.deload===false); STC=null; render(); return;
    case 'aiKeyDel': try{ await COACH.vault.deleteKey(); }catch(e){} S.aiKey=''; render(); return;
    case 'aiInj': { const P=Object.assign({},S.prof||{}), cur=(Array.isArray(P.inj)?P.inj:[]).filter(COACH.isInjury);
      P.inj=cur.indexOf(k)>=0?cur.filter(x=>x!==k):cur.concat([k]); await save('prof',P); render(); return; }
    case 'aiIncClear': COACH.incidents.clear(); render(); return;
    case 'aiEffort': await save('aiEffort',k); render(); return;
    case 'theme': await save('theme',k); applyTheme(); render(); burstAt(innerWidth/2,innerHeight/3,20); return;
    case 'fxLevel': await save('fx',k); applyFx(); render(); return;
    case 'sex': await save('prof',Object.assign({},S.prof||{},{sex:k})); render(); return;
    case 'sound': await save('sound',!S.sound); render(); if(S.sound) beep(880,.08); return;
    case 'rpReset': { const rp=Object.assign({},S.runPlan||{}); delete rp.h; await save('runPlan',rp); render(); return; }
    case 'export': await doExport(I===1); return;
    case 'icsExport': await icsExport(); return;
    case 'bkLater': await save('bk',Object.assign({},S.bk,{snooze:dayShift(tk,7)})); render(); return;
    case 'nTab': S.nTab=k; render(); return;
    case 'shotOpen': S.shotOpen=S.shotOpen===k&&!el.dataset.go?null:k; render(); if(el.dataset.go||S.shotOpen){ const c=document.querySelector('.shot.open'); if(c&&el.dataset.go) c.scrollIntoView({behavior:'smooth',block:'start'}); } return;
    case 'shotF': S.shotF=k; render(); return;
    case 'shotN': S.shotN=I; render(); return;
    case 'shotDrink': { const s=shotOf(k); if(!s) return; floatText(el,'+'+s.m.k+' kcal'); await addMeal({n:'Shot · '+s.n,k:s.m.k,p:s.m.p,c:s.m.c,g:s.m.g,shot:s.id}); buzz(20); render(); toast('Shot notat',s.n+' · '+s.m.k+' kcal','info'); return; }
    case 'planDay': S.planDay=I; render(); return;
    case 'mFilter': { const mf=Object.assign({},S.mf); mf[k]=!mf[k]; await save('mf',mf); render(); return; }
    case 'planNew': { const dk=dayShift(tk,S.planDay||0), mp=Object.assign({},S.mplan); mp[dk]={s:Math.floor(Math.random()*1e9)}; await save('mplan',mp); render(); buzz(15); return; }
    case 'mealEat': { const plan=planFor(tk), mi=plan[I], m=MEALS[mi]; if(!m) return; floatText(el,'+'+m[2]+' kcal'); await planSet(tk,null,null);
      await addMeal({n:m[1],k:m[2],p:m[3],c:m[4],g:m[5],mi,si:I}); buzz(20); render(); toast('Masă notată',m[1]+' · '+m[2]+' kcal','info'); return; }
    case 'mealRe': { const dk=dayShift(tk,S.planDay||0), tg=targets(), plan=planFor(dk,tg), cur=plan[I], others=plan.filter((_,j)=>j!==I);
      const c=slotCands(I,tg).filter(x=>x.i!==cur&&others.indexOf(x.i)<0).slice(0,10); if(!c.length) return; await planSet(dk,I,c[Math.floor(Math.random()*c.length)].i); buzz(10); render(); return; }
    case 'mealAll': SH={kind:'meals',k:dayShift(tk,S.planDay||0),si:I}; shRender(); return;
    case 'mealPick': if(SH&&SH.kind==='meals'){ await planSet(SH.k,SH.si,I); SH=null; shRender(); render(); } return;
    case 'shopDays': S.shopDays=I; render(); return;
    case 'shopTick': { const sh=Object.assign({},S.shop); if(sh[k]) delete sh[k]; else sh[k]=true; await save('shop',sh); buzz(8); render(); return; }
    case 'shopReset': await save('shop',{}); render(); return;
    case 'eqSel': await save('prof',Object.assign({},S.prof||{},{eq:k})); STC=null; render(); return;
    case 'actSet': await save('prof',Object.assign({},S.prof||{},{act:+k})); STC=null; render(); return;
    case 'dietBreak': await save('prof',Object.assign({},S.prof||{},{dietBreak:prof().dietBreak===false})); STC=null; render(); return;
    case 'useMeas': await save('prof',Object.assign({},S.prof||{},{useMeasured:prof().useMeasured===false})); STC=null; render(); return;
    case 'defAdj': { const d=clamp((+prof().def||600)+I,0,1200); await save('prof',Object.assign({},S.prof||{},{def:d})); STC=null; render(); toast('Deficit '+d+' kcal','Ținta nouă: '+targets().kcal+' kcal','info'); return; }
    case 'introMode': await save('intro',k); render(); return;
    case 'motionSet': await save('motion',k); await save('motionAsked',true); applyFx(); if(SH&&SH.kind==='motion'){ SH=null; shRender(); } render();
      if(!motionOff()) burstAt(innerWidth/2,innerHeight/3,30); return;
    case 'calOpen': calOpen(); return;
    case 'calClose': CAL.open=false; calRender(); return;
    case 'calNav': { const [y,m]=CAL.m.split('-').map(Number), dd=new Date(y,m-1+I,1), nm=keyOf(dd).slice(0,7); if(nm>tk.slice(0,7)) return; CAL.m=nm; calRender(); return; }
    case 'dayOpen': SH={kind:'day',k}; shRender(); return;
    case 'shClose': SH=null; shRender(); return;
    case 'hrOpen': SH={kind:'hr'}; shRender(); return;
    case 'hrConnect': hrConnect(); return;
    case 'hrRe': HR.busy=true; HR.off=false; HR.retry=0; shRender(); hrAttach().catch(()=>{ HR.err='Nu s-a putut reconecta. Pornește senzorul sau caută-l din nou.'; }).then(()=>{ HR.busy=false; hrPaint(); shRender(); }); return;
    case 'hrDisc': hrDisconnect(); shRender(); return;
    case 'hrMeasure': hrMeasure(); return;
    case 'hrMStop': hrMeasureStop(false); return;
    case 'jSave': { if(k>tk) return; const sl=parseFloat($('#jdS').value), stp=parseInt($('#jdP').value,10), nt=($('#jdN').value||'').trim().slice(0,400);
      await jSet(k,{sleep:sl>0&&sl<=16?sl:null,steps:stp>0&&stp<100000?stp:null,note:nt||null}); toast('Jurnal salvat',fmtDay(k),'info'); render(); shRender(); if(CAL.open) calRender(); return; }
    case 'jSleep': await jSet(tk,{sleep:I}); buzz(10); render(); return;
    case 'jStepsSave': { const v=parseInt(($('#jSteps')||{}).value,10); if(!(v>0&&v<100000)){ shake('#jSteps'); return; } await jSet(tk,{steps:v}); render(); toast('Pași salvați',v+' pași','info'); return; }
    case 'stepsT': await save('prof',Object.assign({},S.prof||{},{stepsT:I})); render(); return;
    case 'shoeForm': S.shoeForm=!S.shoeForm; render(); return;
    case 'shoeAdd': { const n=(($('#shN')||{}).value||'').trim(), sd=($('#shS')||{}).value||tk, k0=parseFloat(($('#shK')||{}).value)||0, mx=parseInt(($('#shM')||{}).value,10)||700;
      if(!n){ shake('#shN'); return; } if(!(mx>=100&&mx<=3000)){ shake('#shM'); return; }
      await save('shoes',(S.shoes||[]).concat([{id:'s'+Date.now().toString(36),n:n.slice(0,40),since:validDate(sd)?sd:tk,km0:clamp(k0,0,5000),max:mx}])); S.shoeForm=false; render(); toast('Pantofi adăugați',n,'info'); return; }
    case 'shoeRet': await save('shoes',(S.shoes||[]).map(s=>s.id===k?Object.assign({},s,{ret:tk}):s)); render(); return;
    case 'shoeDel': await save('shoes',(S.shoes||[]).filter(s=>s.id!==k)); render(); return;
    case 'muscle': S.mSel=k; render(); return;
    case 'tech': if(GUIDE[k]){ SH={kind:'tech',n:k,busy:false,err:null}; shRender(); return; } await techLoad(k,false); return;
    case 'exNoteSave': { const v=(($('#exNote')||{}).value||'').trim().slice(0,200), o=Object.assign({},S.exNote); if(v) o[k]=v; else delete o[k]; await save('exNote',o); toast(v?'Notiță salvată':'Notiță ștearsă',k,'info'); if(S.sess) renderFocus(); return; }
    case 'techRe': await techLoad(k,true); return;
    case 'phPose': S.phPose=k; render(); return;
    case 'phOpen': { const p=(S.photos||[]).find(x=>x.id===k); if(!p) return; const first=(S.photos||[]).find(x=>x.pose===p.pose)||p; SH={kind:'cmp',a:first.id,b:p.id}; shRender(); return; }
    case 'phCmp': { const ps=(S.photos||[]).filter(x=>x.pose===(S.phPose||'fata')); if(ps.length<2) return; SH={kind:'cmp',a:ps[0].id,b:ps[ps.length-1].id}; shRender(); return; }
    case 'phDel': try{ await phDel(k); }catch(e){} SH=null; shRender(); render(); return;
    case 'rcOpen': await rcOpen(I); return;
    case 'rcClose': RC.open=false; rcRender(); return;
    case 'rcTap': { const held=RC.down&&Date.now()-RC.down>400; RC.down=0; if(held) return; rcGo(ev.clientX<innerWidth*.3?-1:1); return; }
    case 'rcShare': await rcShare(); return;
    case 'rcAsk': RC.open=false; rcRender(); aiSend(QUICK[0]); return;
    case 'sumShare': await sumShare(); return;
    case 'voiceCues': await save('voice',!S.voice); render(); if(S.voice){ actxGet(); say(mot('on')); if(voxCfg().src==='tel'&&VO.ok&&!VO.v) toast('Nu găsesc o voce românească','Instalează limba română în setările de text-to-speech ale telefonului.','info'); } return;
    case 'onbOpen': onbOpen(); return;
    case 'obNext': await onbNext(); return;
    case 'obBack': if(OB&&OB.step>0){ OB.step--; onbRender(); } return;
    case 'obSex': OB.sex=k; onbRender(); return;
    case 'obTheme': OB.theme=k; await save('theme',k); applyTheme(); onbRender(); return;

    default: if(ACT[a]) return ACT[a](el,{k,I,W,D,X,tk,s,ev});
  }
});
document.addEventListener('input',ev=>{
  const t=ev.target, s=S.sess;
  if(t.dataset&&t.dataset.tl!=null){ TL[t.dataset.tl]=t.value; const o=$('#tlOut'); if(o&&SH&&SH.kind==='tool') o.innerHTML=toolOut(SH.k); }
  else if(t.dataset&&t.dataset.fd){ FD[t.dataset.fd]=t.value; if(t.dataset.fd==='q') foodPaint(); else if(t.dataset.fd==='g'&&FD.sel){ const g=parseFloat(String(t.value).replace(',','.')), ok=g>0&&g<=3000, o=$('#fdOut'), b=$('[data-a="fdAdd"]');
      if(o) o.innerHTML=foodMacros(FD.sel,v=>ok?v*g/100:0,ok); if(b) b.disabled=!ok; document.querySelectorAll('#fdSel [data-a="fdG"]').forEach(c=>c.classList.toggle('on',+c.dataset.i===g)); } }
  else if(t.id==='aiIn'){ AI.draft=t.value; autosize(t); }
  else if(s&&t.id==='inKg'){ const v=parseFloat(t.value); s.kg[sessKey(s)]=isFinite(v)?v:''; updAux(); }
  else if(s&&t.id==='inRp'){ const v=parseInt(t.value,10); s.rp[sessKey(s)]=isFinite(v)?v:''; }
  else if(ONIN[t.id]) ONIN[t.id](t);
  else if(t.id==='inKm'||t.id==='inMin'){ if(s&&t.id==='inMin'){ const v=parseFloat(t.value); s.tmMin[s.cur]=isFinite(v)?v:''; } updPace(); }
  else if(t.id==='scHint') SC.hint=t.value;
  else if(t.id==='cmpR'){ const c=$('#cmp'); if(c) c.style.setProperty('--x',t.value+'%'); }
});
document.addEventListener('keydown',ev=>{
  const t=ev.target;
  if(t.id==='aiIn'&&ev.key==='Enter'&&!ev.shiftKey&&!ev.isComposing&&matchMedia('(pointer:fine)').matches){ ev.preventDefault(); aiSend(t.value); }
  else if(t.id==='wIn'&&ev.key==='Enter'){ ev.preventDefault(); $('[data-a="wAdd"]').click(); }
  else if(t.id==='aiKeyIn'&&ev.key==='Enter'){ ev.preventDefault(); $('[data-a="aiKeySave"]').click(); }
  else if(t.id==='fdBc'&&ev.key==='Enter'){ ev.preventDefault(); foodBarcode(t.value); }
  else if(t.id==='fdQ'&&ev.key==='Enter'){ ev.preventDefault(); const b=$('#fdList [data-a="fdPick"]'); if(b) b.click(); }
  else if(ev.key==='Escape'){ if(RC.open){ RC.open=false; rcRender(); } else if(SH){ SH=null; shRender(); } else if(CAL.open){ CAL.open=false; calRender(); } else if(RD){ RD=null; rdRender(); } else if(TM.open&&!(TM.st&&TM.st.started&&!TM.st.done)){ TM.open=false; tmRender(); } else if(S.fxOpen&&!S.summary){ S.fxOpen=false; render(); } }
});
document.addEventListener('change',async ev=>{
  const t=ev.target;
  if(t.dataset.p){ const v=parseFloat(t.value), o={};
    if(t.dataset.opt&&(t.value===''||!(v>0))) o[t.dataset.p]=null; else if(!(v>0)) return; else o[t.dataset.p]=v;
    await save('prof',Object.assign({},S.prof||{},o)); STC=null; toast('Salvat','','info'); return; }
  if(t.dataset.rp){ const [k,f,w]=t.dataset.rp.split('|'), v=parseInt(t.value,10); if(!(v>=0&&v<=300)) return;
    const rp=Object.assign({},S.runPlan||{}), h=JSON.parse(JSON.stringify(rp.h||{})), cur=runPlan();
    const prev=+w>0?cur[k][f][+w-1]:0; if(f!=='m'&&f!=='rest'&&!TRAINING.progressionAllowed(prev,v)){ t.value=cur[k][f][+w]; toast('Creștere prea mare','Cel mult +20% față de săptămâna dinainte ('+prev+' → cel mult '+Math.floor(prev*1.2)+').','info'); return; }
    h[k]=h[k]||{}; h[k][f]=(h[k][f]||cur[k][f]).slice(); h[k][f][+w]=v; rp.h=h; await save('runPlan',rp); toast('Progresie salvată','','info'); return; }
  if(t.dataset.scan&&t.files&&t.files[0]){ await scanPick(t.files[0]); t.value=''; return; }
  if(t.dataset.pace){ const raw=t.value.trim(), m=/^(\d{1,2}):(\d{2})$/.exec(raw); if(raw&&!m){ toast('Format greșit','Scrie ritmul ca 5:10 (minute:secunde pe km).','info'); return; }
    await save('prof',Object.assign({},S.prof||{},{thrPace:m?+m[1]+(+m[2])/60:null})); STC=null; toast('Salvat','','info'); return; }
  if(t.dataset.photo&&t.files&&t.files[0]){
    try{ await phAdd(t.files[0],S.phPose||'fata'); toast('Poză salvată','Rămâne doar pe acest dispozitiv.','info'); }
    catch(e){ toast('Nu am putut salva poza',e&&e.message==='limit'?'Ai atins limita de '+PH_MAX+' poze. Șterge una ca să adaugi alta.':e&&/quota/i.test(e.name+e.message)?'Spațiul browserului e plin. Șterge câteva poze.':'Încearcă altă imagine.','info'); }
    t.value=''; render(); return; }
  if(t.dataset.cmp&&SH&&SH.kind==='cmp'){ SH[t.dataset.cmp]=t.value; shRender(); return; }
  if(t.dataset.bc){ S['bc'+t.dataset.bc]=t.value; render(); return; }
  if(ONCH[t.id]){ await ONCH[t.id](t); return; }
  if(t.dataset.bcimg&&t.files&&t.files[0]){ await foodBarcodeImg(t.files[0]); t.value=''; return; }
  if(t.dataset.csv&&t.files&&t.files[0]){ try{ const rows=parseCSV(await t.files[0].text()); let n=0;
      for(const r of rows){ const o={}; if(r.sleep>0&&r.sleep<=16) o.sleep=Math.round(r.sleep*10)/10; if(r.steps>0) o.steps=Math.round(r.steps); if(r.rhr>=30&&r.rhr<=120) o.rhr=Math.round(r.rhr); if(r.hrv>=5&&r.hrv<=300) o.hrv=Math.round(r.hrv);
        if(Object.keys(o).length){ const j=Object.assign({},S.journal); j[r.d]=Object.assign({},j[r.d]||{},o); S.journal=j; n++; } }
      await save('journal',S.journal); render(); toast(n?'Import reușit':'Nimic de importat',n?n+' zile adăugate în jurnal.':'Verifică coloanele: data, somn, pasi, rhr, hrv.','info');
    }catch(e){ toast('Import eșuat','Fișierul nu a putut fi citit.','info'); } t.value=''; return; }
  if(t.id==='impFile'&&t.files&&t.files[0]){ await doImport(t.files[0]); t.value=''; }
});
/* glisare stânga/dreapta între file */
let sw0=null;
document.addEventListener('touchstart',e=>{
  if(S.fxOpen||TM.open||RD||OB||CAL.open||SH||RC.open||e.touches.length!==1){ sw0=null; return; }
  if(e.target.closest('input,textarea,select,.scrollx,.chart,.heat,.composer,.swatches,.seg')){ sw0=null; return; }
  sw0={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!sw0) return; const t=e.changedTouches[0], dx=t.clientX-sw0.x, dy=t.clientY-sw0.y, dt=Date.now()-sw0.t; sw0=null;
  if(Math.abs(dx)>70&&Math.abs(dy)<45&&dt<600){ const i=NAV.findIndex(n=>n[0]===S.tab); if(i<0) return; const j=i+(dx<0?1:-1);
    if(j>=0&&j<NAV.length){ S.tab=NAV[j][0]; render(); window.scrollTo({top:0}); buzz(8); } }
},{passive:true});

/* copie de siguranță — cheia API nu intră în export */
const EXPORT_KEYS=['zece:lifts','zece:weights','zece:runs','zece:wlog','zece:cyc','zece:runPlan','zece:nutri','zece:mlog','zece3:hist','zece3:aiChat','zece3:aiEffort','zece3:sound',
  'zece3:water','zece3:body','zece3:theme','zece3:fx','zece3:aiUsed','zece3:seenAch','zece3:lvl','zece3:journal','zece3:tech','zece3:voice','zece3:recap','zece3:mplan','zece3:shop','zece3:mf','zece3:intro','zece3:motion','zece3:ptests','zece3:tmlog','zece3:adj','zece3:onb','zece3:motionAsked','zece3:ext','zece3:goals','zece3:supp','zece3:exnote','zece3:foods','zece3:shoes','zece3:mode','zece3:bg','zece3:planv','zece3:dash','zece3:ach','zece3:notif','zece3:notifCfg','zece3:exfav','zece3:excustom','zece3:kb','zece:tests','zece:shoes','zece:body','zece:gtg','zece:workouts','zece:counts','zece:curBlock'];
async function doExport(withPh){
  const data={app:'ZECE',v:4,at:new Date().toISOString(),keys:{}};
  for(const k of EXPORT_KEYS){ const v=await store.get(k); if(v!=null) data.keys[k]=v; }
  if(withPh){ await phLoad(); if(Array.isArray(S.photos)&&S.photos.length) data.photos=S.photos; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
  a.download='zece-copie-'+todayKey()+(data.photos?'-cu-poze':'')+'.json'; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000);
  await save('bk',Object.assign({},S.bk,{last:todayKey(),snooze:null})); render();
  toast('Copie exportată',a.download+(data.photos?' · '+data.photos.length+' poze':''),'info');
}
/* pozele dintr-o copie: le adaug pe cele care lipsesc (după id) */
async function phImport(ps){ let n=0;
  for(const p of ps){ if(!p||!p.id||typeof p.data!=='string'||!/^data:image\//.test(p.data)||(S.photos||[]).some(x=>x.id===p.id)) continue;
    const o={id:String(p.id),date:validDate(p.date)?p.date:todayKey(),pose:['fata','profil','spate'].indexOf(p.pose)>=0?p.pose:'fata',data:p.data};
    try{ if(PHDB.mode==='idb') await phTx('readwrite',st=>st.put(o)); else { const a=phLsGet(); if(a.length>=PH_MAX) break; a.push(o); localStorage.setItem(PH_LS,JSON.stringify(a)); } n++; }catch(e){ break; } }
  await phLoad(); return n; }
async function doImport(file){
  try{ const data=JSON.parse(await file.text()); if(!data||!data.keys||typeof data.keys!=='object') throw new Error('format');
    let n=0; for(const k of Object.keys(data.keys)){ if(EXPORT_KEYS.indexOf(k)>=0){ await store.set(k,data.keys[k]); n++; } }
    if(!('zece3:planv' in data.keys)) await store.set(K.planV,1);
    await loadAll(); applyTheme(); applyFx(); syncMark('lifts');
    const np=Array.isArray(data.photos)?await phImport(data.photos):0;
    render(); toast('Copie importată',n+' seturi de date restaurate'+(np?' · '+np+' poze':'')+'.','info');
  }catch(e){ toast('Import eșuat','Fișierul nu pare o copie ZECE.','info'); }
}
