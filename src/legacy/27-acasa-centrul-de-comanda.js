/* =====================================================================
   v8 · ACASĂ — centrul de comandă. Răspunde la „Cum stau acum?": coperta cu rezumatul săptămânii,
   apoi widgeturi pe care le rearanjezi, le ascunzi sau le alegi dintr-un layout gata făcut.
   ===================================================================== */
const DASH_PRESETS={
  bal:{n:'Echilibrat',d:'Antrenamentul, cifrele zilei și analiza',o:['next','adapt','week','brief','std','insights','goals','k1','prs','trend','recent','body','run']},
  train:{n:'Antrenament',d:'Doar ce ai de făcut azi și săptămâna',o:['next','adapt','week','std','prs','run','recent']},
  data:{n:'Analiză',d:'Tendințe, recorduri și obiective',o:['insights','trend','goals','k1','body','run','prs','load','heat','recent','ach']},
  min:{n:'Minimal',d:'Antrenamentul de azi și țintele',o:['next','brief','std']}
};
/* fiecare widget: titlu (pentru personalizare), mărime (l = pe toată lățimea pe desktop) și funcția care îl desenează */
const WIDGETS={
  next:{t:'Următorul antrenament',sz:'l',r:()=>heroHTML()},
  adapt:{t:'Antrenor adaptiv',sz:'l',r:()=>adaptCard(),opt:'apare când ai făcut check-in-ul'},
  week:{t:'Săptămâna din plan',sz:'m',r:()=>weekHTML()},
  brief:{t:'Pe scurt · azi',sz:'m',r:()=>briefCard()},
  insights:{t:'Ce spun datele',sz:'m',r:()=>wInsights()},
  goals:{t:'Obiective',sz:'m',r:()=>wGoals()},
  k1:{t:'1 KM Lab',sz:'m',r:()=>wK1()},
  prs:{t:'Recorduri recente',sz:'m',r:()=>wPrs()},
  trend:{t:'Tendințe · 8 săptămâni',sz:'m',r:()=>wTrend()},
  recent:{t:'Activitate recentă',sz:'m',r:()=>wRecent()},
  body:{t:'Corp',sz:'m',r:()=>wBody()},
  run:{t:'Alergare',sz:'m',r:()=>wRun()},
  ready:{t:'Readiness',sz:'m',r:()=>readyCard()},
  load:{t:'Încărcare · 12 săptămâni',sz:'m',r:()=>loadCard()},
  heat:{t:'Consecvență · 16 săptămâni',sz:'m',r:()=>heatCard()},
  nutri:{t:'Nutriție azi',sz:'m',r:()=>wNutri()},
  ach:{t:'Realizări',sz:'m',r:()=>wAch()}
};
/* un layout gata făcut, neatins după alegere, urmează mereu ordinea lui actuală (ex. scurtăturile urcă sub cifre în v9) */
const dashCfg=()=>{ const d=S.dash||{}, pre=d.p&&DASH_PRESETS[d.p]; const o=Array.isArray(d.o)&&!pre?d.o.filter(id=>WIDGETS[id]):(pre||DASH_PRESETS.bal).o.slice(); return {o,p:d.p||(Array.isArray(d.o)?'':'bal')}; };
/* „Cum stai acum": săptămâna curentă (de luni până azi) în câteva cifre reale */
function nowLine(){
  const tk=todayKey(), m=mondayOf(tk), o=ixSum(m,tk), R=readiness(), bits=[];
  bits.push(o.days?`<b>${o.days}</b> ${o.days===1?'zi activă':'zile active'}`:'nicio zi activă încă');
  if(o.vol>0) bits.push(`<b>${num(o.vol/1000,1)} t</b> ridicate`);
  if(o.km>0) bits.push(`<b>${num(o.km,1)} km</b> alergați`);
  if(R.v!=null) bits.push(`readiness <b>${R.v}</b>`);
  return 'Săptămâna asta: '+bits.join(' · ');
}
function viewHome(){
  const now=new Date(), hr=now.getHours(), dow=(now.getDay()+6)%7;
  const hello=hr<5?'Noapte bună':hr<12?'Bună dimineața':hr<18?'Bună ziua':'Bună seara';
  const dstr=now.toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'});
  const rc=dow===6?0:dow<2?1:-1, cfg=dashCfg();
  const sys=[hrvCard(),ritualCard(),setupCard(),bkCard(),rc>=0?`<div class="card recap-cta" data-a="rcOpen" data-i="${rc}"><div class="cc-ic">${ic('star')}</div>
    <div class="sp"><div class="h3">Recapitularea săptămânii</div><div class="sm mu">${rc?'Săptămâna trecută':'Săptămâna asta'}, în povești animate</div></div>${ic('play')}</div>`:''].filter(Boolean);
  /* v9: antrenamentul zilei stă pe poză (dacă widgetul lui e vizibil); restul widgeturilor vin dedesubt */
  const heroOn=cfg.o.indexOf('next')>=0;
  const wl=cfg.o.filter(id=>!(heroOn&&id==='next')).map(id=>{ let h=''; try{ h=WIDGETS[id].r()||''; }catch(e){ errLog((e&&e.message)||e,'widget '+id); h=`<div class="card"><div class="err">${ic('alert')}<span>Widgetul „${esc(WIDGETS[id].t)}" nu a putut fi afișat.</span></div></div>`; }
    return h?`<section class="wg wg-${WIDGETS[id].sz}" data-w="${id}">${h}</section>`:''; }).filter(Boolean);
  /* check-in-ul și ajustările antrenorului vin imediat sub poză, apoi mementourile, apoi widgeturile */
  const under=heroOn&&!S.sess&&(mainHyb()?hybNext():nextDay())?`<section class="wg wg-l cv-under">${rdRow()}</section>`:'';
  const ws=under+(sys.length?`<section class="wg wg-l dash-sys">${sys.join('')}</section>`:'')+wl.join('');
  let hero=''; if(heroOn){ try{ hero=coverHero(); }catch(e){ errLog((e&&e.message)||e,'widget next'); } }
  return `
  ${COVER?`<div class="hello cover ${hero?'cv-hero':''}"><div class="cv-ph" aria-hidden="true"></div><div class="cv-fd" aria-hidden="true"></div>
    <div class="cv-t"><div class="cv-date"><span>${esc(dstr)}</span><span>${hello}</span></div>${hero||`<div class="h1">${hello}.</div><div class="cv-sub">${nowLine()}</div>`}</div></div>`
    :`<div class="hello"><div class="eyebrow">${esc(dstr)}</div><div class="h1">${hello}.</div><div class="sm mu">${nowLine()}</div></div>${hero?`<div class="card hero cv-card">${hero}</div>`:''}`}
  <div class="dash">${ws}${wl.length||under||sys.length?'':`<div class="card"><div class="empty">${ic('grid')}<div>Ai ascuns toate widgeturile.</div><button class="btn sm" data-a="dashEdit">${ic('sliders')} Alege ce vezi</button></div></div>`}</div>
  <div class="dash-foot"><button class="btn ghost sm" data-a="dashEdit">${ic('sliders')} Personalizează Acasă</button></div>`;
}
/* antrenamentul zilei, așezat direct pe poză: ziua, titlul, ce conține, progresul și butoanele */
function coverHero(){
  const nx=nextDay();
  if(!S.sess&&mainHyb()) return hybCover();
  if(S.sess){ const day=sessDay(S.sess), rq=S.sess.hy?day.ex.length:absFrom(S.sess.d), dn=day.ex.filter((e,x)=>!e.opt&&sessIsDone(S.sess,x)).length;
    return `<span class="cv-bdg">${dayBadge(S.sess.d,'next',60)}</span><div class="cv-k"><span class="dot"></span> În desfășurare · ${DAYN[S.sess.d]} · ${S.sess.hy?'HYBRID ':''}S${S.sess.w+1}</div><div class="cv-h">${esc(day.t)}</div>
      <div class="cv-m"><span class="big sm" id="heroClock">${fmtClock(sessSec())}</span><span>${dn}/${rq} exerciții</span></div>
      <div class="cv-pb"><i style="width:${(dn/rq*100).toFixed(1)}%"></i></div>
      <div class="cv-b"><button class="btn pri xl glow" data-a="fxOpen">${ic('play')} Continuă antrenamentul</button></div>`; }
  if(!nx) return `<div class="cv-k">${ic('star')} Ciclul ${cyc()} · complet</div><div class="cv-h">Ai terminat cele 4 săptămâni</div>
      <div class="cv-m"><span>Ciclul următor reia același plan.</span></div>
      <div class="cv-b"><button class="btn pri xl glow" data-a="newCycle">${ic('refresh')} Începe ciclul ${cyc()+1}</button>${cycList().length?`<button class="btn cv-alt" data-a="cycOpen">${ic('star')} Raport</button>`:''}</div>`;
  const day=dayFor(nx.w,nx.d), dn=doneCount(nx.w,nx.d), tot=absFrom(nx.d), p=runPlan(), lifts=day.ex.filter(e=>e.kind==='lift'&&!e.opt).length;
  const run=day.run==='thr'?(p.thr.r[nx.w]||0)+' × '+mmss(p.thr.m)+' la prag':day.run==='lng'?(p.lng.w[nx.w]||0)+' min long run':day.run?'Easy run '+((p[day.run]||{w:[]}).w[nx.w]||0)+' min':day.cardio==='hiit'?CD_IV[nx.w]+' × 4 min intervale':day.cardio?'cardio Z2 '+cdZ2Min()+' min':'';
  const what=[run,lifts?lifts+' exerciții de forță':'',!run&&!lifts?tot+' exerciții':''].filter(Boolean).join(' + ');
  const today=(new Date().getDay()+6)%7===nx.d;
  return `<span class="cv-bdg">${dayBadge(nx.d,'next',60)}</span><div class="cv-k">${today?'Azi':'Următorul'} · ${DAYN[nx.d]} · S${nx.w+1} · Ciclul ${cyc()}</div>
    <div class="cv-h">${esc(day.t)}</div>
    <div class="cv-m"><span>${esc(what)}</span><span>${ic('clock')} ${day.min} min</span></div>
    ${day.adj?`<div class="adjb">${ic('coach')} Cu ajustările antrenorului adaptiv</div>`:''}
    <div class="cv-pb" title="${dn} din ${tot} exerciții"><i style="width:${(dn/tot*100).toFixed(1)}%"></i></div>
    <div class="cv-b"><button class="btn pri xl glow" data-a="start" data-w="${nx.w}" data-d="${nx.d}">${ic('play')} ${dn?'Continuă':'Începe'}</button>
      ${day.run?`<button class="btn cv-alt" data-a="spdOpen" data-d="${nx.d}">${ic('gauge')} Viteza</button>`:`<button class="btn cv-alt" data-a="openDay" data-w="${nx.w}" data-d="${nx.d}">${ic('list')} Exerciții</button>`}</div>`;
}
/* cardul antrenamentului: în desfășurare, ciclu terminat sau următoarea zi din plan */
function heroHTML(){
  const nx=nextDay();
  if(!S.sess&&mainHyb()) return hybHeroHTML();
  if(S.sess){ const day=sessDay(S.sess), rq=S.sess.hy?day.ex.length:absFrom(S.sess.d), dn=day.ex.filter((e,x)=>!e.opt&&sessIsDone(S.sess,x)).length;
    return `<div class="card hero">
      <div class="eyebrow"><span class="dot"></span> În desfășurare · ${DAYN[S.sess.d]} · săptămâna ${S.sess.w+1}</div>
      <div class="h1">${esc(day.t)}</div>
      <div class="live-clock"><span class="big sm" id="heroClock">${fmtClock(sessSec())}</span><span class="mu">${dn}/${rq} exerciții</span></div>
      <button class="btn pri xl wide glow" data-a="fxOpen">${ic('play')} Continuă antrenamentul</button></div>`; }
  if(!nx) return `<div class="card hero"><div class="eyebrow">${ic('star')} Ciclul ${cyc()} · complet</div>
      <div class="h1">Ai terminat cele 4 săptămâni</div>
      <p class="mu">Ciclul următor reia același plan. Dacă vrei alergări mai lungi, ajustează progresia în Setări.</p>
      ${cycList().length?`<button class="btn wide" style="margin-top:14px" data-a="cycOpen">${ic('star')} Vezi raportul ciclului</button>`:''}
      <button class="btn pri xl wide glow" data-a="newCycle">${ic('refresh')} Începe ciclul ${cyc()+1}</button></div>`;
  const day=dayFor(nx.w,nx.d), dn=doneCount(nx.w,nx.d), tot=absFrom(nx.d);
  return `<div class="card hero"><span class="hero-wm" aria-hidden="true">${pad(nx.d+1)}</span>
      <div class="hero-top"><div class="sp">
        <div class="eyebrow">Următorul · ${DAYN[nx.d]} · săpt. ${nx.w+1}/${WEEKS}</div>
        <div class="h1">${esc(day.t)}</div>
        <div class="tags">${catTag(day)}<span class="tag">${ic('clock')} ${day.min} min</span><span class="tag">${tot} exerciții</span></div></div>
        ${ring(dn/tot,{s:64,sw:5,inner:`<text x="32" y="37" text-anchor="middle" class="ring-t">${dn}/${tot}</text>`})}</div>
      ${day.adj?`<div class="adjb" style="margin-top:10px">${ic('coach')} Cu ajustările antrenorului adaptiv</div>`:''}
      <ol class="peek">${day.ex.slice(0,5).map(e=>`<li class="${e.adj?'adj':''}"><span>${esc(e.n)}</span><em>${esc(short(e))}</em></li>`).join('')}
        ${tot>5?`<li class="more">+ încă ${tot-5}</li>`:''}</ol>
      ${rdRow()}
      <button class="btn pri xl wide glow" data-a="start" data-w="${nx.w}" data-d="${nx.d}">${ic('play')} ${dn?'Continuă':'Începe'} antrenamentul</button></div>`;
}
function weekHTML(){
  if(mainHyb()) return hybWeekHTML();
  const nx=nextDay(), w=S.sess&&!S.sess.hy?S.sess.w:nx?nx.w:WEEKS-1;
  const week=PLAN.map((p,d)=>{ const dn=doneCount(w,d), tot=absFrom(d), full=dn===tot, isN=nx&&nx.w===w&&nx.d===d, col=catCol(p.cat);
    return `<button class="wd ${isN?'next':''}" data-a="openDay" data-w="${w}" data-d="${d}" aria-label="${DAYN[d]}: ${esc(p.t)}">
      ${ring(dn/tot,{s:40,sw:3.5,c:full?TH().ac:col,fill:full?TH().ac:'none',track:isN?TH().ac+'88':'var(--track)',
        inner:full?`<path d="M13 20.5l4.5 4.5L27 15.5" fill="none" style="stroke:var(--on)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
          :(dayBadgeSvg(d,40)||`<circle cx="20" cy="20" r="3.5" style="fill:${col}"/>`)})}${DAYS[d]}</button>`; }).join('');
  return `<div class="card"><div class="row"><div class="eyebrow sp">Săptămâna ${w+1} · ciclul ${cyc()}</div>
    <button class="btn ghost sm" data-a="tab" data-k="plan">Planul ${ic('right')}</button></div>
    <div class="week">${DBG_CLIP}${week}</div></div>`;
}
const wHead=(icn,t,link)=>`<div class="card-h"><div class="eyebrow">${ic(icn)} ${t}</div>${link?`<button class="btn ghost xs" ${link}>${ic('right')}</button>`:''}</div>`;
/* insights: primele trei, fiecare cu datele din care rezultă */
function insRow(x){ return `<div class="ins ${x.tone}"><span class="ins-i">${ic(x.icon)}</span><div class="sp"><div class="ins-t">${x.txt}</div>
    ${x.ev&&x.ev.length?`<details class="ins-ev"><summary>Datele</summary>${x.ev.map(([a,b])=>`<div class="ins-r"><span>${esc(a)}</span><b>${esc(String(b))}</b></div>`).join('')}${x.src?`<div class="xs mu2" style="margin-top:4px">${esc(x.src)}</div>`:''}</details>`:''}</div></div>`; }
function wInsights(){
  const xs=insightsAll().slice(0,3);
  return `<div class="card">${wHead('bulb','Ce spun datele',`data-a="tab" data-k="prog" data-s="ov"`)}
    ${xs.length?`<div class="ins-l">${xs.map(insRow).join('')}</div>`:`<div class="empty sm">${ic('bulb')}<div>Când notezi câteva antrenamente, alergări și cântăriri, aici apar observațiile calculate din ele.</div></div>`}</div>`;
}
function wGoals(){
  const gs=goalsAll().slice(0,3);
  return `<div class="card">${wHead('target','Obiective',`data-a="tab" data-k="prog" data-s="ov"`)}
    ${gs.length?gs.map(g=>{ const s=goalState(g); return `<div class="gm"><div class="row"><b class="sp">${esc(goalTitle(g))}</b><span class="xs mu">${s.done?'atins':Math.round(s.frac*100)+'%'}</span></div>
      <div class="bar" style="height:6px;margin-top:8px"><i style="width:${(s.frac*100).toFixed(1)}%"></i></div>
      <div class="xs mu" style="margin-top:6px">acum ${goalFmt(g,s.cur)}${s.gap?' · '+s.gap:''}${s.eta&&!s.done?' · estimat ~'+fmtDay(s.eta):''}</div></div>`; }).join('')
      :`<div class="empty sm">${ic('target')}<div>Pune-ți un obiectiv: 1 km în 4:00, un 1RM, o greutate țintă.</div><button class="btn sm" data-a="goalAdd">${ic('plus')} Adaugă</button></div>`}</div>`;
}
function wK1(){
  const g=goalsAll().find(x=>x.k==='k1'), b=k1Best(), res=k1Results();
  if(!g&&!b) return `<div class="card">${wHead('stopwatch','1 KM Lab',`data-a="tab" data-k="prog" data-s="k1"`)}
    <div class="sm mu" style="margin-top:8px">Setează timpul țintă pe 1 km și îți calculez ritmul, viteza și timpii de trecere la 100–800 m.</div>
    <button class="btn sm" style="margin-top:12px" data-a="tab" data-k="prog" data-s="k1">${ic('target')} Deschide 1 KM Lab</button></div>`;
  const cur=b?b.sec:null, tg=g?g.t:null, gap=cur!=null&&tg!=null?cur-tg:null;
  return `<div class="card">${wHead('stopwatch','1 KM Lab',`data-a="tab" data-k="prog" data-s="k1"`)}
    <div class="k1-mini"><div><span>Acum</span><b>${cur!=null?fmtClock(cur):'—'}</b></div><div><span>Țintă</span><b>${tg!=null?fmtClock(tg):'—'}</b></div>
      <div><span>Diferență</span><b class="${gap!=null&&gap<=0?'good':''}">${gap==null?'—':gap<=0?'atinsă':'−'+fmtClock(gap)}</b></div></div>
    ${cur!=null&&tg!=null?`<div class="bar" style="height:6px"><i style="width:${(k1Frac(g,cur)*100).toFixed(1)}%"></i></div>`:''}
    <div class="xs mu2" style="margin-top:8px">${b?esc(b.lbl)+' · '+fmtDay(b.date):'niciun rezultat măsurat încă'}${res.length>1?' · '+res.length+' rezultate':''}</div></div>`;
}
function wPrs(){
  const ev=prBook().ev.filter(p=>p.cat!=='rep').slice(0,4);
  return `<div class="card">${wHead('trophy','Recorduri recente',`data-a="tab" data-k="prog" data-s="pr"`)}
    ${ev.length?`<div style="margin-top:4px">${ev.map(p=>`<div class="pr-row"><span class="tag pr">PR</span><b>${esc(prName(p))}</b><span class="xs mu">${relDay(p.d)}</span><span class="v">${prVal(p)}</span></div>`).join('')}</div>`
      :`<div class="empty sm">${ic('trophy')}<div>Recordurile apar aici când le bați: greutate, repetări, volum, distanță, ritm, timp.</div></div>`}</div>`;
}
function wTrend(){
  const m0=mondayOf(todayKey()), wk=[]; for(let i=7;i>=0;i--){ const a=dayShift(m0,-7*i), b=dayShift(a,6), o=ixSum(a,b>todayKey()?todayKey():b); wk.push({a,lbl:String(+a.slice(8))+'.'+(+a.slice(5,7)),o,cur:i===0}); }
  if(!wk.some(w=>w.o.vol||w.o.km)) return `<div class="card">${wHead('chart','Tendințe · 8 săptămâni')}<div class="empty sm">Apar după primele antrenamente notate.</div></div>`;
  const tv=wk.map(w=>({lbl:w.lbl,v:Math.round(w.o.vol/100)/10,hi:w.cur,tip:'săpt. '+fmtDay(w.a)})), km=wk.map(w=>({lbl:w.lbl,v:Math.round(w.o.km*10)/10,hi:w.cur,tip:'săpt. '+fmtDay(w.a)}));
  return `<div class="card">${wHead('chart','Tendințe · 8 săptămâni',`data-a="tab" data-k="prog" data-s="ov"`)}
    <div class="mini2"><div><div class="xs mu">Tonaj (t)</div>${barChart(tv,{w:240,h:120,hex:TH().ac,dec:1,unit:'t',label:'tonaj pe săptămână',noVal:true})}</div>
      <div><div class="xs mu">Kilometri</div>${barChart(km,{w:240,h:120,dec:1,unit:'km',label:'km pe săptămână',noVal:true})}</div></div></div>`;
}
function wRecent(){
  const it=timelineItems(dayShift(todayKey(),-30),todayKey()).slice(0,5);
  return `<div class="card">${wHead('history','Activitate recentă',`data-a="tab" data-k="act"`)}
    ${it.length?`<div class="tl-mini">${it.map(tlRowMini).join('')}</div>`:`<div class="empty sm">Nimic notat în ultimele 30 de zile.</div>`}</div>`;
}
function wBody(){
  const ws=wStats(), a=wList().filter(x=>x.d>=dayShift(todayKey(),-90)), b=bList().filter(x=>+x.waist>0), lb=b[b.length-1], fb=b[0];
  if(!ws) return `<div class="card">${wHead('scale','Corp',`data-a="tab" data-k="prog" data-s="b"`)}<div class="sm mu" style="margin-top:8px">Cântărește-te dimineața, câteva zile la rând, ca să apară tendința.</div>${briefWeightInput()}</div>`;
  return `<div class="card">${wHead('scale','Corp',`data-a="tab" data-k="prog" data-s="b"`)}
    <div class="row" style="margin-top:8px;align-items:flex-end"><div class="big sm">${num(ws.a7,1)}<small>kg · media 7 zile</small></div><span class="sp"></span>
      ${ws.wk!=null?`<span class="chg ${ws.wk<=0?'up':'dn'}">${ws.wk>0?'+':''}${num(ws.wk,2)} kg/săpt.</span>`:''}</div>
    ${a.length>=3?lineChart({pts:a.map(x=>({x:x.d,y:x.w})),ma:wMA(a),h:96,label:'greutate 90 de zile',unit:'kg',dec:1,noArea:false}):''}
    ${lb?`<div class="xs mu" style="margin-top:8px">Talie ${num(lb.waist)} cm${fb&&fb.d!==lb.d?' · '+(lb.waist-fb.waist>0?'+':'')+num(lb.waist-fb.waist,1)+' cm din '+fmtDay(fb.d):''}</div>`:''}</div>`;
}
function wRun(){
  const tk=todayKey(), o=ixSum(dayShift(tk,-6),tk), last=(S.runs||[]).slice().sort((a,b)=>a.date<b.date?1:-1)[0];
  if(!last) return `<div class="card">${wHead('run','Alergare',`data-a="tab" data-k="prog" data-s="r"`)}<div class="empty sm">Nicio alergare notată.</div></div>`;
  return `<div class="card">${wHead('run','Alergare',`data-a="tab" data-k="prog" data-s="r"`)}
    <div class="kpis c2"><div class="kpi"><div class="k">7 zile</div><div class="v">${num(o.km,1)}<small>km</small></div><div class="s">${o.runs} ${o.runs===1?'ieșire':'ieșiri'}</div></div>
      <div class="kpi link" data-a="runOpen" data-i="${(S.runs||[]).indexOf(last)}"><div class="k">Ultima · ${relDay(last.date)}</div><div class="v">${num(last.km,1)}<small>km</small></div><div class="s">${fmtPace(paceOf(last))}${last.hr?' · '+last.hr+' bpm':''}</div></div></div></div>`;
}
/* „Notează greutatea": deschide Corp și pune cursorul în câmpul de greutate */
ACT.wFocus=()=>{ S.tab='prog'; S.progTab='b'; render(); window.scrollTo({top:0}); requestAnimationFrame(()=>{ const i=$('#wIn'); if(i){ i.scrollIntoView({block:'center'}); i.focus(); } }); };
function wNutri(){ const tk=todayKey(), tg=targets(), d=dayTotals(tk);
  return `<div class="card">${wHead('flame','Nutriție azi',`data-a="tab" data-k="nutri"`)}<div class="row" style="margin-top:10px">${ringsNut(tk,64).join('')}
    <div class="sp sm"><div><b>${Math.round(d.k)}</b> / ${tg.kcal} kcal</div><div class="mu"><b class="tx">${Math.round(d.p)}</b> / ${tg.p} g proteină</div></div></div></div>`; }
function wAch(){ const A=achAll(), done=A.filter(a=>a.done).sort((a,b)=>a.date<b.date?1:-1), next=A.filter(a=>!a.done&&a.prog!=null).sort((a,b)=>b.prog-a.prog)[0];
  return `<div class="card">${wHead('award','Realizări',`data-a="tab" data-k="prog" data-s="pr"`)}
    <div class="sm" style="margin-top:8px"><b>${done.length}</b> din ${A.length} deblocate${done[0]?' · cea mai recentă: <b>'+esc(done[0].t)+'</b>':''}</div>
    ${next?`<div class="xs mu" style="margin-top:10px">Următoarea: ${esc(next.t)} · ${Math.round(next.prog*100)}%</div><div class="bar" style="height:5px;margin-top:6px"><i style="width:${(next.prog*100).toFixed(1)}%"></i></div>`:''}</div>`; }
const briefWeightInput=()=>`<div class="inrow"><input class="inp" id="wIn" type="number" step="0.1" inputmode="decimal" placeholder="Greutatea de azi (kg)" aria-label="Greutatea de azi"><button class="btn pri" data-a="wAdd" aria-label="Salvează greutatea">${ic('check')}</button></div>`;

/* ---------- configurarea treptată: o listă scurtă, dispare când e gata sau când o ascunzi ---------- */
function setupSteps(){
  const P=S.prof||{};
  return [
    ['prof','Completează profilul','Vârstă, înălțime, greutate: pentru zone, ținte și forță relativă',!!(P.age&&P.h&&P.startW),'tab|set'],
    ['w','Prima cântărire','Media pe 7 zile e baza graficelor de corp',wList().length>0,'goBody'],
    ['ci','Primul check-in de dimineață','Somn, energie, febră: din ele vine readiness',Object.keys(S.journal||{}).some(k=>{ const j=S.journal[k]; return j&&(j.energy||j.sleep); }),'ciOpen'],
    ['goal','Un obiectiv','1 km, un 1RM sau o greutate țintă',(S.goals||[]).length>0||!!(P.goalW&&P.startW&&P.goalW!==P.startW),'goalAdd'],
    ['first','Primul antrenament','O zi din plan',trainDays().length>0,'tab|plan'],
    ['bk','O copie a datelor','Sau sincronizarea PC ↔ telefon',!!((S.bk||{}).last||(S.sync||{}).gist),'tab|set']
  ];
}
function setupCard(){
  if((S.dash||{}).setupOff) return ''; const st=setupSteps(), n=st.filter(x=>x[3]).length; if(n===st.length) return '';
  /* doar pașii rămași, cel mult doi odată: configurarea crește treptat, nu cere totul din prima */
  /* mementoul de copie are cardul lui când e cazul: nu-l mai repet aici */
  const left=st.filter(x=>!x[3]&&!(x[0]==='bk'&&bkCard())), show=S.setupAll?left:left.slice(0,2);
  if(!left.length) return '';
  return `<div class="card setup"><div class="row"><div class="sp"><div class="eyebrow">${ic('sliders')} Configurare · ${n} din ${st.length}</div></div>
      <button class="xb nh" data-a="setupOff" aria-label="Ascunde">${ic('x')}</button></div>
    <div class="bar" style="height:5px"><i style="width:${(n/st.length*100).toFixed(1)}%"></i></div>
    <div class="setup-l">${show.map(([id,t,d,ok,act])=>{ const [a,k]=act.split('|'); return `<button class="setup-r" data-a="${a}" ${k?`data-k="${k}"`:''}>
      <span class="setup-c"></span><span class="sp"><b>${t}</b><span class="xs mu">${d}</span></span>${ic('right')}</button>`; }).join('')}</div>
    ${left.length>show.length?`<button class="linkb" data-a="setupAll">${ic('down')} Încă ${left.length-show.length} ${left.length-show.length===1?'pas':'pași'}</button>`:''}</div>`;
}
ACT.setupAll=()=>{ S.setupAll=true; render(); };
ACT.setupOff=async()=>{ await save('dash',Object.assign({},S.dash||{},{setupOff:true})); render(); toast('Lista de configurare e ascunsă','O găsești oricând în Setări → Acasă.','info'); };

/* ---------- personalizarea: listă cu ordine (trage sau săgeți), vizibilitate și layouturi gata făcute ---------- */
function dashEditHTML(){
  const cfg=dashCfg(), on=cfg.o, off=Object.keys(WIDGETS).filter(id=>on.indexOf(id)<0);
  const row=(id,vis)=>`<div class="dl-r ${vis?'':'off'}" data-w="${id}">${vis?`<span class="dl-h" data-drag="1" aria-hidden="true">${ic('drag')}</span>`:''}
      <span class="sp"><b>${esc(WIDGETS[id].t)}</b>${WIDGETS[id].opt?`<span class="xs mu2">${esc(WIDGETS[id].opt)}</span>`:''}</span>
      ${vis?`<button class="xb nh" data-a="dashMv" data-k="${id}" data-i="-1" aria-label="Mai sus">${ic('up')}</button><button class="xb nh" data-a="dashMv" data-k="${id}" data-i="1" aria-label="Mai jos">${ic('down')}</button>`:''}
      <button class="xb nh" data-a="dashVis" data-k="${id}" aria-label="${vis?'Ascunde':'Arată'}">${ic(vis?'eye':'eyeoff')}</button></div>`;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('sliders')} Acasă</div><div class="h2" style="margin-top:6px">Personalizează</div>
    <div class="sm mu" style="margin-top:4px">Alege un layout sau aranjează widgeturile cum vrei: trage de mâner sau folosește săgețile.</div>
    <div class="pre-g">${Object.keys(DASH_PRESETS).map(k=>`<button class="pre ${cfg.p===k?'on':''}" data-a="dashPreset" data-k="${k}"><b>${DASH_PRESETS[k].n}</b><span>${DASH_PRESETS[k].d}</span></button>`).join('')}</div>
    <div class="dsec"><h4>Vizibile · ${on.length}</h4><div class="dl" id="dashList">${on.map(id=>row(id,true)).join('')}</div></div>
    ${off.length?`<div class="dsec"><h4>Ascunse · ${off.length}</h4><div class="dl">${off.map(id=>row(id,false)).join('')}</div></div>`:''}
    <div class="inrow"><button class="btn ghost" data-a="dashPreset" data-k="bal">${ic('refresh')} Implicit</button><button class="btn pri" style="flex:1" data-a="shClose">${ic('check')} Gata</button></div>`;
}
async function dashSave(o,p){ await save('dash',Object.assign({},S.dash||{},{o,p:p||''})); }
ACT.dashEdit=()=>{ SH={kind:'dash'}; shRender(); };
ACT.dashPreset=async(el,{k})=>{ if(!DASH_PRESETS[k]) return; await dashSave(DASH_PRESETS[k].o.slice(),k); shRender(); render(); };
ACT.dashVis=async(el,{k})=>{ const o=dashCfg().o.slice(), i=o.indexOf(k); if(i>=0) o.splice(i,1); else o.push(k); await dashSave(o); shRender(); render(); };
ACT.dashMv=async(el,{k,I})=>{ const o=dashCfg().o.slice(), i=o.indexOf(k), j=i+I; if(i<0||j<0||j>=o.length) return; o.splice(j,0,o.splice(i,1)[0]); await dashSave(o); shRender(); render(); };
/* tragere pentru reordonare (mouse și atingere) */
const DRG={el:null};
document.addEventListener('pointerdown',e=>{ const h=e.target.closest&&e.target.closest('[data-drag]'); if(!h) return; const r=h.closest('.dl-r'), list=r&&r.parentElement; if(!r||!list) return;
  e.preventDefault(); DRG.el=r; DRG.list=list; DRG.y0=e.clientY; r.classList.add('drag'); try{ h.setPointerCapture(e.pointerId); }catch(x){} });
document.addEventListener('pointermove',e=>{ if(!DRG.el) return; const r=DRG.el, sib=[...DRG.list.children].filter(x=>x!==r);
  const after=sib.find(x=>{ const b=x.getBoundingClientRect(); return e.clientY<b.top+b.height/2; });
  if(after) DRG.list.insertBefore(r,after); else DRG.list.appendChild(r); });
document.addEventListener('pointerup',async()=>{ if(!DRG.el) return; const r=DRG.el, list=DRG.list; DRG.el=null; r.classList.remove('drag');
  const o=[...list.querySelectorAll('.dl-r')].map(x=>x.dataset.w); if(o.join()!==dashCfg().o.join()){ await dashSave(o); render(); } });
