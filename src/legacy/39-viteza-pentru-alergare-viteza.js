/* =====================================================================
   v9 · VITEZA PENTRU ALERGARE — viteza de bandă pentru fiecare bucată din ziua aleasă (încălzire, reprize, pauze, răcire).
   Model: în alergare, pulsul crește aproape liniar cu viteza. Ecuația ACSM pentru alergare (VO2 = 3,5 + 0,2·v)
   și echivalența %rezervă de puls ≈ %rezervă VO2 (Swain 1997) dau v = v0 · (puls țintă − repaus) / (puls acum − repaus).
   Calibrarea: viteza și pulsul de azi, dacă le scrii; altfel, automat, din ultimele alergări liniștite cu puls (easy, long),
   cu greutate mai mare pentru cele recente. Panta vine din alergările tale când sunt destule și coerente.
   Zonele: Karvonen (Z2 60–70%, prag 80–90% din rezerva de puls), cu pulsul maxim măsurat dacă îl ai;
   cu pulsul la prag (LTHR) din testul de 30 de minute, reprizele țintesc 95–100% din el.
   Modul bandă: aceleași bucăți, pe cronometru, cu viteza mare pe ecran, sunet și voce la fiecare schimbare.
   ===================================================================== */
const SPD_DAYS=[[0,'Luni','ez1'],[1,'Marți','thr'],[3,'Joi','ez2']];
const SPD_K='zece3:spd';
/* pulsul de repaus: din profil, altfel mediana check-in-urilor din ultimele 14 zile */
function restHR(){ const P=prof(); if(+P.hrRest>0) return {v:+P.hrRest,src:'din profil'};
  const tk=todayKey(), xs=[]; for(let i=0;i<14;i++){ const j=(S.journal||{})[dayShift(tk,-i)]; if(j&&+j.rhr>=30&&+j.rhr<=120) xs.push(+j.rhr); }
  if(!xs.length) return null; xs.sort((a,b)=>a-b); return {v:xs[Math.floor(xs.length/2)],src:'mediana check-in-urilor din ultimele 14 zile'}; }
/* alergările liniștite cu puls (fără prag: media lor amestecă încălzirea cu reprizele), cele mai noi întâi */
function spdRuns(days){ const from=dayShift(todayKey(),-(days||60));
  return (S.runs||[]).filter(r=>r.date>=from&&r.kind!=='thr'&&+r.hr>=90&&+r.km>=1&&+r.min>0).map(r=>({date:r.date,h:+r.hr,v:r.km/(r.min/60),r}))
    .filter(p=>p.v>=4&&p.v<=25).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0); }
/* panta personală (km/h pe bătaie): regresie pe alergările din ultimele 4 luni, doar dacă e coerentă */
function spdFit(){
  const pts=spdRuns(120).map(p=>[p.h,p.v]); if(pts.length<6) return null; const n=pts.length, mx=pts.reduce((a,p)=>a+p[0],0)/n, my=pts.reduce((a,p)=>a+p[1],0)/n;
  let sxy=0,sxx=0,syy=0; pts.forEach(([x,y])=>{ sxy+=(x-mx)*(y-my); sxx+=(x-mx)*(x-mx); syy+=(y-my)*(y-my); });
  const hs=pts.map(p=>p[0]); if(Math.max(...hs)-Math.min(...hs)<12||!sxx||!syy) return null;
  const b=sxy/sxx, r=sxy/Math.sqrt(sxx*syy); return b>=.03&&b<=.25&&r>=.5?{b,n,r}:null; }
/* calibrarea automată: media ponderată (timp de înjumătățire 14 zile) a ultimelor 6 alergări liniștite cu puls */
function spdAuto(){ const rs=spdRuns(60).slice(0,6); if(!rs.length) return null; const tk=todayKey(); let sw=0,sh=0,sv=0;
  rs.forEach(p=>{ const w=Math.pow(.5,daysBetween(p.date,tk)/14); sw+=w; sh+=w*p.h; sv+=w*p.v; }); return {v0:sv/sw,h0:sh/sw,n:rs.length,last:rs[0]}; }
/* calibrarea de azi (scrisă de tine în unealtă), dacă există */
function spdToday(){ let sv=null; try{ sv=JSON.parse(localStorage.getItem(SPD_K)||'null'); }catch(e){} return sv&&sv.date===todayKey()&&+sv.v>0&&+sv.h>0?{v0:+String(sv.v).replace(',','.'),h0:+sv.h,R:+sv.r||null}:null; }
/* modelul folosit peste tot (unealta, modul bandă, cronometrele din antrenament) */
function spdModel(o){
  const t=o||spdToday(), R=t&&t.R>0?t.R:(restHR()||{}).v, M=hrZones().max, F=spdFit();
  if(!(R>=30&&R<=110)) return {err:'rest',M};
  if(t&&t.v0>0&&t.h0>0){ if(t.h0<=R+15||t.h0>=M||t.v0<3||t.v0>25) return {err:'bad',R,M}; return {v0:t.v0,h0:t.h0,R,M,F,src:'today'}; }
  const a=spdAuto(); if(!a||a.h0<=R+10) return {err:'none',R,M};
  return Object.assign({R,M,F,src:'auto'},a); }
const spdAt=(c,h)=>Math.max(3,c.F?c.v0+c.F.b*(h-c.h0):c.v0*(h-c.R)/(c.h0-c.R));
/* bucățile zilei: [nume, durată, secunde, puls de jos, puls de sus] și vitezele lor */
function spdSegs(kind,w,c){ const p=runPlan(), lt=+prof().lthr>0?+prof().lthr:0, hr=f=>Math.round(c.R+(c.M-c.R)*f);
  const seg=(l,dur,sec,lo,hi,o)=>{ const vl=spdAt(c,lo), vh=spdAt(c,hi); return Object.assign({l,dur,sec,lo,hi,vl,vh,vm:Math.round((vl+vh)*5)/10},o||{}); };
  const ez=(a,b)=>[hr(a),hr(b)], TH=lt?[Math.round(lt*.95),lt]:ez(.8,.9);
  if(kind==='thr'){ const r=p.thr.r[w]||0; return [seg('Încălzire','10–15 min ușor',720,...ez(.55,.65),{wu:1}),seg('Reprize la prag',r+' × '+mmss(p.thr.m),p.thr.m*60,...TH,{main:1,rep:r}),
    seg('Pauză · jog ușor',p.thr.rest+' s',p.thr.rest,...ez(.5,.6),{between:1}),seg('Răcire','10 min ușor',600,...ez(.55,.65),{cd:1})]; }
  if(kind==='lng'){ const n=p.lng.w[w]||0; return [seg('Încălzire','10–15 min ușor',720,...ez(.55,.65),{wu:1}),seg('Long run · zona 2',n+' min continuu',n*60,...ez(.6,.7),{main:1}),seg('Răcire','5–10 min ușor',480,...ez(.55,.65),{cd:1})]; }
  const n=((p[kind]||{}).w||[])[w]||0; return [seg(kind==='ez2'?'Easy run · flush':'Easy run · zona 2',n+' min',n*60,...ez(.6,kind==='ez2'?.65:.7),{main:1})]; }
/* ziua implicită: azi, dacă e zi cu alergare, altfel următoarea zi cu alergare */
function spdDefDay(){ const dow=(new Date().getDay()+6)%7; for(let i=0;i<7;i++){ const d=(dow+i)%7; if(SPD_DAYS.some(x=>x[0]===d)) return d; } return 1; }
/* săptămâna din ciclu în care urmează ziua aleasă */
function spdWeek(d){ if(S.sess&&S.sess.d===d) return S.sess.w; for(let w=0;w<WEEKS;w++) if(!dayFull(w,d)) return w; return WEEKS-1; }
const spdKind=d=>(SPD_DAYS.find(x=>x[0]===d)||[])[2]||null;
function spdDefaults(){
  /* pulsul de repaus se completează oricând apare (din profil sau din check-in-uri) */
  if(!TL.sr){ const rr=restHR(); if(rr) TL.sr=String(rr.v); }
  if(TL.sd!=null) return; const t=spdToday();
  TL.sd=String(spdDefDay()); TL.sv=t?num(t.v0,1):''; TL.sh=t?String(t.h0):''; if(t&&t.R) TL.sr=String(t.R); }
let SPD_T=0;
function spdKeep(){ clearTimeout(SPD_T); SPD_T=setTimeout(()=>{ try{ if(tlN('sv')>0&&tlN('sh')>0) localStorage.setItem(SPD_K,JSON.stringify({v:TL.sv,h:TL.sh,r:TL.sr,date:todayKey()})); else localStorage.removeItem(SPD_K); }catch(e){} },300); }
TOOLS.push(['spd','gauge','Viteza pentru alergare','Viteza pe bandă pentru ziua din plan, calibrată pe pulsul tău']);
TOOL_CAT[0][2].unshift('spd');
TOOL2.spd={
  in:()=>{ spdDefaults(); const d=+TL.sd, lv=hrLive(), H=hrMaxInfo(), a=spdAuto();
    return `<div class="form">${tlIn('sv','Viteza acum (km/h)',{step:'0.1',ph:a?'auto: '+num(a.v0,1):'ex: 7'})}${tlIn('sh','Pulsul la viteza asta',{step:'1',ph:a?'auto: '+Math.round(a.h0):'ex: 140'})}
        ${tlIn('sr','Puls de repaus',{step:'1',ph:'ex: 60'})}<div class="fld"><label>Puls maxim</label><div class="inp ro">${H.v} <small class="mu">${H.src}</small></div></div></div>
      ${H.sug?`<button class="chip" style="margin-top:10px" data-a="hrMaxUse" data-i="${H.sug.v}">${ic('heart')} Ai atins ${H.sug.v} bpm (${relDay(H.sug.d)}): folosește-l ca puls maxim</button>`:''}
      ${lv?`<button class="chip" style="margin-top:10px" data-a="spdLive">${ic('heart')} Folosește pulsul live · ${HR.bpm}</button>`:''}
      <div class="xs mu" style="margin-top:8px">${a?'Viteza și pulsul de acum sunt opționale: fără ele calculez din alergările tale. Scrie-le dacă vrei să ții cont de forma de azi.':'Aleargă 5 minute la o viteză constantă, apoi scrie viteza și pulsul.'}</div>
      <div class="fld" style="margin-top:14px"><label>Pentru ziua</label><div class="seg" style="margin-top:0">${SPD_DAYS.map(([dd,l])=>`<button class="${d===dd?'on':''}" data-a="tlSet" data-k="sd" data-s="${dd}">${l}</button>`).join('')}</div></div>`; },
  out:()=>{
    const v0=tlN('sv'), h0=tlN('sh'), R=tlN('sr'), d=+TL.sd, D=SPD_DAYS.find(x=>x[0]===d)||SPD_DAYS[1], w=spdWeek(d);
    spdKeep();
    if(!(R>=30&&R<=110)) return `<div class="sm mu">Scrie pulsul de repaus (dimineața, în pat). Fără el nu pot calcula zonele corect.</div>`;
    const man=v0>0&&h0>0;
    if(!man&&(v0>0||h0>0)) return `<div class="sm mu">Scrie și ${v0>0?'pulsul':'viteza'}, sau șterge câmpul ca să folosesc calibrarea automată.</div>`;
    if(man&&(v0<3||v0>25)) return `<div class="sm mu">Viteza pare greșită: scrie-o în km/h (ex. 7 sau 9,5).</div>`;
    const c=spdModel(man?{v0,h0,R}:{R});
    if(c.err==='bad') return `<div class="sm mu">Pulsul trebuie să fie cel din timpul alergării, după câteva minute la aceeași viteză (între ${R+16} și ${c.M-1}).</div>`;
    if(c.err) return `<div class="sm mu">Încă nu am o alergare cu puls din care să mă calibrez. Aleargă 5 minute la o viteză constantă și scrie viteza și pulsul, sau notează o alergare cu puls (vine singură din Strava / Polar).</div>`;
    const pNow=(c.h0-R)/(c.M-R), zNow=pNow<.5?-1:Math.min(4,Math.floor((pNow-.5)/.1+1e-9));
    const rows=spdSegs(D[2],w,c).map(g=>`<div class="spd-r ${g.main?'main':''}"><div class="sp"><b>${g.l}</b><span class="xs mu">${esc(g.dur)} · puls ${g.lo}–${g.hi}</span></div>
        <div class="spd-v"><b>${num(g.vm,1)}</b><small>km/h</small><span class="xs mu">${num(g.vl,1)}–${num(g.vh,1)} · ${mmss(60/g.vm)} /km</span></div></div>`).join('');
    return `<div class="spd-now">${c.src==='today'?`<span class="xs mu">Azi</span> <b>${num(c.v0,1)} km/h la ${Math.round(c.h0)} bpm</b> <span class="xs mu">= ${Math.round(pNow*100)}% din rezerva de puls${zNow>=0?' · zona '+(zNow+1):''}</span>`
        :`<span class="xs mu">Calibrare automată</span> <b>${num(c.v0,1)} km/h la ${Math.round(c.h0)} bpm</b> <span class="xs mu">· din ${c.n} ${c.n===1?'alergare':'alergări'} cu puls (ultima ${relDay(c.last.date)})</span>`}</div>
      <div class="dsec"><h4>${D[1]} · săptămâna ${w+1}</h4>${rows}</div>
      <button class="btn pri xl wide" style="margin-top:12px" data-a="treadGo">${ic('play')} Pornește modul bandă</button>
      ${spdCalHTML(c)}
      <div class="xs mu2" style="margin-top:10px">Pune viteza de la început și nu o crește ca să „prinzi" pulsul: pulsul urcă spre țintă în 2–3 minute. Dacă trece de capătul de sus, scade cu 0,3 km/h.
        ${c.F?`Panta e potrivită pe ${c.F.n} alergări de-ale tale cu puls.`:'Calcul proporțional cu rezerva de puls (repaus → maxim).'}${+prof().lthr>0?' Reprizele țintesc 95–100% din pulsul tău la prag ('+Math.round(+prof().lthr)+').':''} Aceeași înclinație a benzii ca acum.</div>`; }
};
/* cum se potrivesc ultimele alergări cu modelul: arată dacă ești în formă sau obosit, iar calibrarea se mută singură după ele */
function spdCalHTML(c){ const rs=spdRuns(60).slice(0,3); if(!rs.length) return '';
  return `<div class="dsec"><h4>Ultimele alergări față de calibrare</h4>${rs.map(p=>{ const ex=spdAt(c,p.h), df=(p.v-ex)/ex*100, t=Math.abs(df)<3?['în linie','']:df>0?['mai rapid ca de obicei','good']:['mai lent ca de obicei','bad'];
    return `<div class="list-row"><span class="sp"><b>${relDay(p.date)}</b> <span class="xs mu">${num(p.v,1)} km/h la ${p.h} bpm · așteptat ${num(ex,1)}</span></span><span class="xs ${t[1]}">${df>0?'+':''}${Math.round(df)}% · ${t[0]}</span></div>`; }).join('')}
    <div class="xs mu2" style="margin-top:6px">Mai rapid la același puls = formă mai bună; mai lent = oboseală, căldură, somn puțin. Calibrarea automată se mută după fiecare alergare nouă.</div></div>`; }
ACT.spdLive=()=>{ if(hrLive()) TL.sh=String(HR.bpm); if(SH&&SH.kind==='tool') shRender(); };
/* deschiderea directă, de pe copertă sau din plan, cu ziua deja aleasă */
ACT.spdOpen=(el,{D})=>{ spdDefaults(); if(D>=0&&SPD_DAYS.some(x=>x[0]===D)) TL.sd=String(D); SH={kind:'tool',k:'spd'}; shRender(); };

/* ---------- modul bandă ---------- */
function treadPhases(kind,w,c){ const sg=spdSegs(kind,w,c), rest=sg.find(g=>g.between), ph=[{k:'prep',d:10,l:'Pregătește-te',s:'Pornește banda',sp:sg[0].vm}];
  sg.forEach(g=>{ if(g.between) return;
    if(g.rep){ for(let i=1;i<=g.rep;i++){ ph.push({k:'work',d:g.sec,l:'Repriza '+i+'/'+g.rep,s:'Prag · puls '+g.lo+'–'+g.hi,sp:g.vm,hr:[g.lo,g.hi]});
      if(i<g.rep&&rest) ph.push({k:'rest',d:rest.sec,l:'Jog ușor',s:'puls '+rest.lo+'–'+rest.hi,sp:rest.vm,hr:[rest.lo,rest.hi]}); } }
    else ph.push({k:'work',d:g.sec,l:g.l,s:'puls '+g.lo+'–'+g.hi,sp:g.vm,hr:[g.lo,g.hi],half:g.sec>=600&&!!g.main}); });
  return ph; }
ACT.treadGo=()=>{ const d=+TL.sd, kind=spdKind(d), w=spdWeek(d), v0=tlN('sv'), h0=tlN('sh'), R=tlN('sr'), c=spdModel(v0>0&&h0>0?{v0,h0,R}:{R});
  if(!kind||c.err) return; SH=null; shRender();
  tmOpen({title:'Modul bandă · '+DAYN[d],kind:'tread',run:true,tread:{d,w,kind},ph:treadPhases(kind,w,c)}); };
/* cronometrele din antrenament (încălzire, prag, easy, long, răcire) primesc și ele vitezele, când există o calibrare */
function spdDecorate(pr,e,day,w){
  if(!pr||!pr.ph||!day||!day.run) return pr; const kind=day.run, c=spdModel(); if(c.err) return pr;
  const sg=spdSegs(kind,w,c), main=sg.find(g=>g.main), rest=sg.find(g=>g.between), wu=sg.find(g=>g.wu), cd=sg.find(g=>g.cd);
  const put=(p,g)=>{ if(p&&g){ p.sp=g.vm; p.hr=[g.lo,g.hi]; } };
  if(e.n==='Threshold') pr.ph.forEach(p=>put(p,p.k==='work'?main:p.k==='rest'?rest:null));
  else if(/^(Easy run|Long run)/.test(e.n)) pr.ph.forEach(p=>put(p,p.k==='work'?main:null));
  else if(e.n==='Warm up') pr.ph.forEach(p=>put(p,p.k==='work'&&/Alergare ușoară|Warm up/.test(p.l)?wu:null));
  else if(e.n==='Cool down') pr.ph.forEach(p=>put(p,p.k==='work'?cd:null));
  return pr; }
const tmPresetFor0=tmPresetFor;
tmPresetFor=(e,day,w)=>{ const pr=tmPresetFor0(e,day,w); try{ spdDecorate(pr,e,day,w); }catch(x){ errLog((x&&x.message)||x,'spd decorate'); } return pr; };
/* distanța din viteze (bucățile terminate întregi + cea curentă, cât s-a alergat din ea) */
function treadKm(st){ let km=0; st.ph.forEach((p,i)=>{ if(!p.sp||p.d==null) return; if(i<st.i||st.done) km+=p.sp*p.d/3600; }); return km; }
function treadDone(st){ const km=treadKm(st), hs=hrSum(st.hr); TL.trKm=TL.trKm!=null&&TL.trFor===st.start?TL.trKm:num(km,2); TL.trFor=st.start;
  if(st.saved) return `<div class="note" style="text-align:center">${ic('check')} Alergarea e salvată${hs?' cu pulsul mediu '+hs.avg+' bpm':''}.</div>`;
  return `<div class="card"><div class="eyebrow">${ic('run')} Salvează alergarea</div>
    <div class="form">${tlIn('trKm','Distanța (km), de pe bandă',{step:'0.01'})}<div class="fld"><label>Timp</label><div class="inp ro">${fmtClock(st.total)}</div></div></div>
    <div class="xs mu" style="margin-top:6px">Am estimat distanța din viteze; corecteaz-o după afișajul benzii.${hs?' Puls mediu '+hs.avg+' bpm: alergarea intră și în calibrare.':''}</div>
    <button class="btn pri wide" style="margin-top:10px" data-a="treadSave">${ic('check')} Salvează în alergări</button></div>`; }
ACT.treadSave=async()=>{ const st=TM.st; if(!st||st.kind!=='tread'||st.saved) return; const km=tlN('trKm'); if(!(km>0&&km<100)) return shake('#tl_trKm');
  const hs=hrSum(st.hr), r={date:todayKey(),kind:st.tread.kind==='thr'?'thr':st.tread.kind==='lng'?'lng':'ez',km:Math.round(km*100)/100,min:Math.round(st.total/6)/10,src:'tread',name:'Modul bandă'};
  if(hs){ r.hr=hs.avg; r.hrMax=hs.max; } await save('runs',(S.runs||[]).concat([r])); st.saved=true; tmRender(); toast('Alergare salvată',num(r.km,2)+' km · '+fmtClock(st.total),'info'); };
