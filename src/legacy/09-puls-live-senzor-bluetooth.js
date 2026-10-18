/* =====================================================================
   PULS LIVE — senzor Bluetooth cu serviciul standard Heart Rate.
   Polar H10/H9, Verity Sense, OH1 și ceasurile Polar care își partajează pulsul.
   Web Bluetooth: Chrome/Edge pe PC și Android; pe iPhone doar în browserul Bluefy.
   ===================================================================== */
const HR={dev:null,ch:null,on:false,busy:false,bpm:null,at:0,name:'',bat:null,contact:null,hasRR:false,err:null,retry:0,off:false,trace:[],m:null,res:null,iv:null,ps:0};
const hrOK=()=>!!(navigator.bluetooth&&navigator.bluetooth.requestDevice);
function hrParse(dv){ const f=dv.getUint8(0); let i=1, bpm;
  if(f&1){ bpm=dv.getUint16(i,true); i+=2; } else { bpm=dv.getUint8(i); i+=1; }
  if(f&8) i+=2;
  const rr=[]; if(f&16) for(;i+1<dv.byteLength;i+=2) rr.push(Math.round(dv.getUint16(i,true)*1000/1024));
  return {bpm,contact:(f&6)===6?true:(f&6)===4?false:null,rr}; }
const hrLive=()=>HR.on&&HR.bpm>0&&Date.now()-HR.at<5000;
function hrZone(b){ let k=-1; hrZones().z.forEach((x,i)=>{ if(b>=x.lo) k=i; }); return k; }
const HRZC=()=>[COL().z1,COL().run,COL().ok,COL().warn,TH().ac];
const hrNew=()=>({n:0,sum:0,max:0,z:[0,0,0,0,0],pts:[],last:0,lp:0,ex:{}});
function hrAcc(o,b,now,x){ const dt=o.last?Math.min(5,(now-o.last)/1000):1; o.last=now; o.n++; o.sum+=b; if(b>o.max) o.max=b;
  const z=hrZone(b); if(z>=0) o.z[z]+=dt;
  if(x!=null){ const e=o.ex[x]=o.ex[x]||{n:0,sum:0}; e.n++; e.sum+=b; }
  if(!o.lp||now-o.lp>=15000){ if(!o.pts.length) o.t0=now; o.pts.push(b); o.lp=now; if(o.pts.length>600){ o.pts.shift(); o.t0+=15000; } } }
const hrSum=o=>o&&o.n>=10?{avg:Math.round(o.sum/o.n),max:o.max,z:o.z.map(v=>Math.round(v)),pts:o.pts.slice()}:null;
function hrData(ev){ const v=hrParse(ev.target.value), now=Date.now(); if(!(v.bpm>0)) return;
  HR.bpm=v.bpm; HR.at=now; HR.contact=v.contact;
  HR.trace.push(v.bpm); if(HR.trace.length>180) HR.trace.shift();
  if(v.rr.length) HR.hasRR=true;
  if(HR.m){ HR.m.b.push(v.bpm); HR.m.rr.push(...v.rr); }
  if(S.sess){ S.sess.hr=S.sess.hr||hrNew(); hrAcc(S.sess.hr,v.bpm,now,S.sess.cur); if(now-HR.ps>30000){ HR.ps=now; persistSess(); } }
  if(TM.st&&TM.st.started&&!TM.st.done){ TM.st.hr=TM.st.hr||hrNew(); hrAcc(TM.st.hr,v.bpm,now); const tp=TM.st.ph[TM.st.i]; if(tp&&tp.meas&&!TM.st.pAt){ const m=TM.st.mh=TM.st.mh||{n:0,s:0}; m.n++; m.s+=v.bpm; } }
  hrPaint(); }
const hrState=()=>hrLive()?'live':HR.on||HR.busy||(HR.dev&&!HR.off)?'stale':'off';
const hrChip=()=>{ const lv=hrLive(), z=lv?hrZone(HR.bpm):-1;
  return `<button class="hr-live hrc ${hrState()}" data-a="hrOpen" aria-label="Puls" style="--hc:${z>=0?HRZC()[z]:'var(--mu)'};--beat:${lv?(60/HR.bpm).toFixed(2):1}s">${ic('heart')}<span class="v">${lv?HR.bpm:'—'}</span><span class="z">${z>=0?'Z'+(z+1):''}</span></button>`; };
function hrPaint(){
  const live=hrLive(), z=live?hrZone(HR.bpm):-1, st=hrState();
  document.querySelectorAll('.hr-live').forEach(el=>{ el.classList.remove('live','stale','off'); el.classList.add(st);
    el.style.setProperty('--hc',z>=0?HRZC()[z]:'var(--mu)'); el.style.setProperty('--beat',live?(60/HR.bpm).toFixed(2)+'s':'1s');
    const v=el.querySelector('.v'); if(v) v.textContent=live?HR.bpm:'—'; const q=el.querySelector('.z'); if(q) q.textContent=z>=0?'Z'+(z+1):''; });
  if(SH&&SH.kind==='hr'){ const b=$('#hrBig'); if(b){ b.textContent=live?HR.bpm:'—'; const zn=$('#hrZn'), zz=hrZones().z[z];
      if(zn) zn.textContent=live?(zz?'Zona '+(z+1)+' · '+zz.l:'sub zona 1'):HR.on?'aștept date…':'deconectat';
      const sp=$('#hrSpark'); if(sp) sp.innerHTML=sparkSVG(HR.trace,z>=0?HRZC()[z]:TH().ac,70);
      const ct=$('#hrCt'); if(ct) ct.hidden=HR.contact!==false; const mb=$('#shRoot [data-a="hrMeasure"]'); if(mb) mb.disabled=!live;
      const mt=$('#hrMt'); if(mt&&HR.m) mt.textContent=fmtClock(Math.max(0,HR.m.dur-(Date.now()-HR.m.t0)/1000))+' · '+HR.m.b.length+' bătăi'+(HR.m.rr.length?' · '+HR.m.rr.length+' intervale RR':''); } }
}
function sparkSVG(v,col,h){ if(!v||v.length<2) return ''; const W=300,H=h||60, lo=Math.min(...v)-3, hi=Math.max(...v)+3, X=i=>(i/(v.length-1)*W).toFixed(1), Y=x=>(H-4-(x-lo)/(hi-lo)*(H-8)).toFixed(1);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${v.map((x,i)=>X(i)+','+Y(x)).join(' ')}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`; }
async function hrConnect(){
  if(!hrOK()){ SH={kind:'hr'}; shRender(); return; }
  HR.err=null; let dev;
  try{ dev=await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}],optionalServices:['battery_service']}); }
  catch(e){ HR.err=e&&e.name==='NotFoundError'?null:'Nu am putut căuta dispozitive: '+((e&&e.message)||e); hrPaint(); if(SH&&SH.kind==='hr') shRender(); return; }
  HR.dev=dev; HR.name=dev.name||'Senzor de puls'; HR.off=false; HR.busy=true; hrPaint(); if(SH&&SH.kind==='hr') shRender();
  if(!dev._zece){ dev._zece=1; dev.addEventListener('gattserverdisconnected',hrLost); }
  try{ await hrAttach(); toast('Puls conectat',HR.name,'info'); buzz(20); }
  catch(e){ HR.on=false; HR.err='Conectarea a eșuat. Verifică dacă senzorul e pornit și nu e conectat la altă aplicație (Polar Flow, Polar Beat).'; }
  HR.busy=false; hrPaint(); if(SH&&SH.kind==='hr') shRender();
}
async function hrAttach(){ const g=await HR.dev.gatt.connect(), sv=await g.getPrimaryService('heart_rate'), ch=await sv.getCharacteristic('heart_rate_measurement');
  if(HR.ch&&HR.ch!==ch) try{ HR.ch.removeEventListener('characteristicvaluechanged',hrData); }catch(e){}
  if(HR.ch!==ch){ HR.ch=ch; ch.addEventListener('characteristicvaluechanged',hrData); }
  await ch.startNotifications(); HR.on=true; HR.retry=0; if(!HR.iv) HR.iv=setInterval(hrPaint,2000);
  try{ const bs=await g.getPrimaryService('battery_service'), bc=await bs.getCharacteristic('battery_level'); HR.bat=(await bc.readValue()).getUint8(0); }catch(e){ HR.bat=null; } }
function hrLost(){ HR.on=false; hrPaint(); if(SH&&SH.kind==='hr') shRender(); if(HR.off||!HR.dev) return;
  if(HR.retry<6){ const d=[1,2,3,5,8,13][HR.retry++]*1000; setTimeout(()=>{ if(HR.on||HR.off||!HR.dev) return; hrAttach().then(()=>{ hrPaint(); if(SH&&SH.kind==='hr') shRender(); }).catch(hrLost); },d); }
  else toast('Senzorul de puls s-a deconectat','Apasă pe inimioară ca să-l reconectezi.','info'); }
function hrDisconnect(){ HR.off=true; if(HR.m) hrMeasureStop(false); try{ if(HR.dev&&HR.dev.gatt.connected) HR.dev.gatt.disconnect(); }catch(e){}
  HR.on=false; HR.bpm=null; HR.dev=null; HR.ch=null; clearInterval(HR.iv); HR.iv=null; hrPaint(); }
/* HRV dimineața: RMSSD din intervalele RR, cu artefactele scoase (bătăi imposibile sau salturi de peste 20%) */
function rmssd(rr){ const d=[]; let prev=null;
  rr.forEach(x=>{ if(x<300||x>2000){ prev=null; return; } if(prev!=null&&Math.abs(x-prev)/prev>.2){ prev=null; return; } if(prev!=null) d.push(x-prev); prev=x; });
  return d.length>=30?Math.sqrt(d.reduce((a,v)=>a+v*v,0)/d.length):null; }
function hrMeasure(){ if(!hrLive()) return; HR.res=null; HR.m={t0:Date.now(),dur:120,b:[],rr:[]}; clearInterval(HR.mi);
  HR.mi=setInterval(()=>{ if(!HR.m) return; if((Date.now()-HR.m.t0)/1000>=HR.m.dur) hrMeasureStop(true); else hrPaint(); },500); SH={kind:'hr'}; shRender(); }
async function hrMeasureStop(save_){ clearInterval(HR.mi); const m=HR.m; HR.m=null; if(!save_||!m){ if(SH&&SH.kind==='hr') shRender(); return; }
  const half=m.b.slice(Math.floor(m.b.length/2));
  if(half.length<15){ HR.res={err:'Prea puține date de la senzor. Verifică centura și reîncearcă.'}; if(SH&&SH.kind==='hr') shRender(); return; }
  const rhr=Math.round(avgOf(half)), h=rmssd(m.rr), o={rhr:rhr>=30&&rhr<=120?rhr:null}; if(h&&h>=5&&h<=300) o.hrv=Math.round(h);
  await jSet(todayKey(),o); HR.res={rhr:o.rhr,hrv:o.hrv||null,noRR:!m.rr.length}; buzz([60,40,60]);
  toast('Măsurătoare salvată','Puls în repaus '+o.rhr+(o.hrv?' · HRV '+o.hrv+' ms':''),'info'); render(); if(SH&&SH.kind==='hr') shRender(); }
function hrHTML(){
  const head=`<div class="eyebrow">${ic('heart')} Puls live · senzor Bluetooth</div>`;
  if(!hrOK()) return `${head}<div class="h2" style="margin-top:6px">Conectează Polar-ul</div>
    <div class="sm" style="margin-top:8px">Browserul în care ai deschis ZECE nu poate folosi Bluetooth.</div>
    <div class="dsec"><h4>Pe iPhone</h4><div class="cue"><b>1</b><span>Safari nu permite Bluetooth paginilor web (limită Apple).</span></div>
      <div class="cue"><b>2</b><span>Instalează aplicația gratuită <b>Bluefy – Web BLE Browser</b> din App Store.</span></div>
      <div class="cue"><b>3</b><span>Deschide ZECE în Bluefy, de pe adresa web a aplicației (după ce o punem online).</span></div></div>
    <div class="dsec"><h4>Pe Android sau PC</h4><div class="cue"><b>✓</b><span>Merge direct în Chrome sau Edge.</span></div></div>
    <div class="note">ZECE folosește serviciul standard de puls prin Bluetooth: merge cu Polar H10, H9, Verity Sense, OH1 și cu ceasurile Polar care își partajează pulsul.</div>
    <div class="inrow"><button class="btn" style="flex:1" data-a="shClose">Închide</button></div>`;
  if(!HR.on&&!HR.busy) return `${head}<div class="h2" style="margin-top:6px">${HR.dev?esc(HR.name)+' · deconectat':'Conectează Polar-ul'}</div>
    ${HR.err?`<div class="err">${ic('alert')}<span>${esc(HR.err)}</span></div>`:''}
    <button class="btn pri xl wide glow" style="margin-top:14px" data-a="${HR.dev?'hrRe':'hrConnect'}">${ic('heart')} ${HR.dev?'Reconectează':'Caută senzorul'}</button>
    <div class="dsec"><h4>Înainte să apeși</h4>
      <div class="cue"><b>1</b><span><b>Centura H10 / H9:</b> udă electrozii și pune-o pe piept. Pornește singură.</span></div>
      <div class="cue"><b>2</b><span><b>Verity Sense / OH1:</b> pornește-l din buton și pune-l pe braț.</span></div>
      <div class="cue"><b>3</b><span><b>Ceas Polar:</b> pornește partajarea pulsului cu alte dispozitive, din setările ceasului.</span></div>
      <div class="cue"><b>4</b><span>Dacă nu apare în listă, închide Polar Flow sau Polar Beat: senzorul poate fi ocupat de altă aplicație.</span></div></div>
    ${HR.dev?`<button class="btn ghost wide" style="margin-top:10px" data-a="hrConnect">Alt senzor</button>`:''}`;
  const z=hrZones();
  return `${head}<div class="hr-big"><span class="hr-heart hr-live ${hrState()}" style="--beat:${hrLive()?(60/HR.bpm).toFixed(2):1}s">${ic('heart')}</span><b id="hrBig">${hrLive()?HR.bpm:'—'}</b><span>bpm</span></div>
    <div class="sm mu" id="hrZn" style="text-align:center">${HR.busy?'mă conectez…':'aștept date…'}</div>
    <div id="hrSpark" class="hr-sp">${sparkSVG(HR.trace,TH().ac,70)}</div>
    <div class="xs mu" style="text-align:center">${esc(HR.name)}${HR.bat!=null?' · baterie '+HR.bat+'%':''}${HR.hasRR?' · trimite intervale RR':''}</div>
    <div class="easy" id="hrCt" ${HR.contact===false?'':'hidden'}>${ic('alert')} Senzorul nu simte pielea: strânge centura și umezește electrozii.</div>
    <div class="zones" style="margin-top:12px">${z.z.map((x,i)=>`<div class="zn"><b style="color:${HRZC()[i]}">Z${x.n}</b><span>${x.l}</span><span class="v">${x.lo}–${x.hi}</span></div>`).join('')}</div>
    <div class="dsec"><h4>HRV și puls în repaus</h4>
      ${HR.m?`<div class="sm">Stai întins și nemișcat, respiră normal.</div><div class="hr-mt" id="hrMt">2:00</div><button class="btn ghost wide" data-a="hrMStop">Oprește</button>`
      :`<div class="sm mu">Dimineața, întins, înainte de cafea: 2 minute. Rezultatul intră direct în check-in-ul de azi și în Readiness. HRV-ul cere intervale RR, pe care le trimit centurile (H10, H9); senzorii optici dau doar pulsul.</div>
        <button class="btn pri wide" style="margin-top:10px" data-a="hrMeasure" ${hrLive()?'':'disabled'}>${ic('heart')} Măsoară acum (2 min)</button>`}
      ${HR.res?HR.res.err?`<div class="err">${ic('alert')}<span>${esc(HR.res.err)}</span></div>`:`<div class="easy" style="margin-top:10px">${ic('check')} Puls în repaus <b>${HR.res.rhr}</b>${HR.res.hrv?' · HRV <b>'+HR.res.hrv+' ms</b>':HR.res.noRR?' · fără HRV: senzorul nu trimite intervale RR':' · HRV: prea multe artefacte, mai încearcă'}. Salvate azi.</div>`:''}</div>
    <div class="inrow"><button class="btn ghost" data-a="hrDisc">Deconectează</button><button class="btn" style="flex:1" data-a="shClose">Gata</button></div>`;
}
/* vocea (say, VO) stă din v11 în 085-voice.js */
