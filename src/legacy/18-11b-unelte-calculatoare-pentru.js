/* =====================================================================
   11b · UNELTE — calculatoare pentru antrenament, într-o foaie; rezultatul se recalculează pe loc
   ===================================================================== */
const TOOLS=[['rm','calc','Calculator 1RM','1RM estimat și greutăți de lucru pe repetări'],['pace','run','Ritm și cursă','Ritm, despărțiri pe km, predicție'],
  ['plates','dumbbell','Discuri și încălzire','Ce pui pe bară și seriile de încălzire'],['sweat','drop','Rata de transpirație','Cât să bei la alergările lungi'],
  ['caf','cup','Cafeină','Doza și ora potrivite înainte de antrenament'],['tm','clock','Cronometru de intervale','EMOM, AMRAP, prag, încălzire, mobilitate'],['zones','heart','Zone de puls și ritm','Din vârstă, puls de repaus și prag'],
  ['vdot','target','Ritmuri de antrenament','VDOT: easy, maraton, prag, intervale, repetări'],['tread','run','Banda de alergare','km/h în ritm pe km și înclinația potrivită'],
  ['sleep','moon','Somn','Ora de culcare, cafeina și seara dinainte'],['food','bowl','Calculator alimente','Calorii și proteină la gram, cod de bare'],['units','refresh','Convertor','kg ↔ lb · km ↔ mile']];
const TL={};
const tlN=k=>{ const v=parseFloat(String(TL[k]==null?'':TL[k]).replace(',','.')); return isFinite(v)?v:null; };
const tlIn=(id,label,o={})=>`<div class="fld ${o.full?'full':''}"><label for="tl_${id}">${label}</label><input class="inp" id="tl_${id}" data-tl="${id}" ${o.text?'inputmode="text"':`type="number" step="${o.step||'any'}" inputmode="decimal"`} value="${esc(TL[id]==null?'':String(TL[id]))}" placeholder="${esc(o.ph||'')}"></div>`;
const r25=x=>Math.round(x/2.5)*2.5;
function toolDefaults(k){
  const now=new Date(), hh=d=>pad(d.getHours())+':'+pad(d.getMinutes());
  if(k==='sweat'&&TL.sb==null){ const ws=wStats(); if(ws) TL.sb=num(ws.last.w); TL.sm='60'; TL.sd='500'; }
  if(k==='caf'&&TL.cw==null){ TL.cw=num(curW(),0); const t=new Date(now.getTime()+60*6e4); t.setMinutes(t.getMinutes()<30?30:60,0,0); TL.ct=hh(t); TL.cb='23:00'; }
  if(k==='pace'&&TL.pd==null){ TL.pd='5'; TL.pm=TL.pm||'t'; }
  if(k==='plates'&&TL.pb==null) TL.pb='20';

  if(k==='vdot'&&TL.vd==null){ const rp=racePred(), b=rp&&rp.b; TL.vd=b?num(b.km,2):'5'; TL.vt=b?fmtClock(b.min*60):''; }
  if(k==='tread'&&TL.ts==null){ TL.ts='10'; TL.ti='1'; }
  if(k==='sleep'&&TL.sw==null){ TL.sw=prof().wake||'07:00'; TL.sh=String(prof().sleepT||8); }
}
function toolHTML(){
  const k=SH.k||'menu';
  if(k==='menu') return `<div class="eyebrow">${ic('tool')} Unelte</div><div class="h2" style="margin-top:6px">Unelte pentru antrenament</div>
    <div class="tl-g">${TOOLS.map(([id,icn,t,d])=>`<button class="tl-b" data-a="toolGo" data-k="${id}"><span class="ic">${ic(icn)}</span><b>${t}</b><span>${d}</span></button>`).join('')}</div>`;
  const T=TOOLS.find(x=>x[0]===k)||TOOLS[0];
  return `<div class="row"><button class="ib" data-a="toolGo" data-k="menu" aria-label="Înapoi la unelte">${ic('left')}</button>
      <div class="sp"><div class="eyebrow">${ic(T[1])} Unelte</div><div class="h3" style="margin-top:3px">${T[2]}</div></div></div>
    ${toolIn(k)}<div id="tlOut" aria-live="polite">${toolOut(k)}</div>`;
}
function toolIn(k){
  if(k==='rm'){ const ls=goalLifts().slice(0,8);
    return `${ls.length?`<div class="scrollx" style="margin-top:14px">${ls.map(n=>`<button class="chip" data-a="tlLift" data-k="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}
      <div class="form">${tlIn('rw','Greutate (kg)',{step:'0.5',ph:'ex: 100'})}${tlIn('rr','Repetări',{step:'1',ph:'ex: 5'})}</div>`; }
  if(k==='pace') return `<div class="seg">${[['t','Am timpul'],['p','Am ritmul']].map(([v,l])=>`<button class="${(TL.pm||'t')===v?'on':''}" data-a="tlSet" data-k="pm" data-s="${v}">${l}</button>`).join('')}</div>
      <div class="chips" style="margin-top:12px">${RACE_D.map(([D,l])=>`<button class="chip ${Math.abs((tlN('pd')||0)-D)<.01?'on':''}" data-a="tlSet" data-k="pd" data-s="${D}">${l}</button>`).join('')}</div>
      <div class="form">${tlIn('pd','Distanța (km)',{step:'0.1'})}${(TL.pm||'t')==='t'?tlIn('pt','Timp (min:sec sau h:min:sec)',{text:1,ph:'ex: 27:30'}):tlIn('pp','Ritm (min:sec / km)',{text:1,ph:'ex: 5:30'})}</div>`;
  if(k==='plates') return `<div class="form">${tlIn('pk','Greutatea de lucru (kg)',{step:'0.5',ph:'ex: 100'})}
      <div class="fld"><label>Bara</label><div class="seg" style="margin-top:0">${[20,15,10].map(v=>`<button class="${String(TL.pb||'20')===String(v)?'on':''}" data-a="tlSet" data-k="pb" data-i="${v}">${v} kg</button>`).join('')}</div></div></div>`;
  if(k==='sweat') return `<div class="form">${tlIn('sb','Greutate înainte (kg)',{step:'0.1'})}${tlIn('sa','Greutate după (kg)',{step:'0.1',ph:'cântărit după, uscat'})}
      ${tlIn('sd','Ai băut în timpul efortului (ml)',{step:'50'})}${tlIn('sm','Durata (min)',{step:'5'})}</div>
      <div class="xs mu" style="margin-top:8px">Cântărește-te fără haine înainte și imediat după o alergare de cel puțin 45–60 de minute, după ce te ștergi de transpirație.</div>`;
  if(k==='vdot') return `<div class="chips" style="margin-top:14px">${RACE_D.concat([[3,'3 km']]).sort((a,b)=>a[0]-b[0]).map(([D,l])=>`<button class="chip ${Math.abs((tlN('vd')||0)-D)<.01?'on':''}" data-a="tlSet" data-k="vd" data-s="${D}">${l}</button>`).join('')}</div>
      <div class="form">${tlIn('vd','Distanța (km)',{step:'0.1'})}${tlIn('vt','Timpul (min:sec sau h:min:sec)',{text:1,ph:'ex: 26:30'})}</div>
      <div class="xs mu" style="margin-top:8px">Folosește o cursă sau un test la efort maxim din ultimele 4–6 săptămâni. Am completat cea mai rapidă alergare recentă, dacă există.</div>`;
  if(k==='tread') return `<div class="form">${tlIn('ts','Viteza benzii (km/h)',{step:'0.1'})}
      <div class="fld"><label>Înclinație</label><div class="seg" style="margin-top:0">${['0','1','2'].map(v=>`<button class="${String(TL.ti||'1')===v?'on':''}" data-a="tlSet" data-k="ti" data-s="${v}">${v}%</button>`).join('')}</div></div></div>`;
  if(k==='sleep') return `<div class="form"><div class="fld"><label for="tl_sw">Ora de trezire</label><input class="inp" id="tl_sw" data-tl="sw" type="time" value="${esc(TL.sw||'')}"></div>
      <div class="fld"><label>Câte ore vrei să dormi</label><div class="seg" style="margin-top:0">${['7.5','8','8.5','9'].map(v=>`<button class="${String(TL.sh||'8')===v?'on':''}" data-a="tlSet" data-k="sh" data-s="${v}">${v.replace('.',',')}</button>`).join('')}</div></div></div>`;
  if(k==='units') return `<div class="form">${tlIn('ukg','Kilograme',{step:'0.5',ph:'ex: 100'})}${tlIn('ulb','Livre (lb)',{step:'0.5',ph:'ex: 45'})}${tlIn('ukm','Kilometri',{step:'0.1',ph:'ex: 10'})}${tlIn('umi','Mile',{step:'0.1',ph:'ex: 3.1'})}</div>`;
  if(k==='caf') return `<div class="form">${tlIn('cw','Greutatea ta (kg)',{step:'1'})}
      <div class="fld"><label for="tl_ct">Ora antrenamentului</label><input class="inp" id="tl_ct" data-tl="ct" type="time" value="${esc(TL.ct||'')}"></div>
      <div class="fld full"><label for="tl_cb">Ora de culcare</label><input class="inp" id="tl_cb" data-tl="cb" type="time" value="${esc(TL.cb||'')}"></div></div>`;
  return '';
}
function toolOut(k){
  const box=(h)=>`<div class="tl-o">${h}</div>`;
  if(k==='rm'){ const w=tlN('rw'), r=Math.round(tlN('rr')||0);
    if(!(w>0&&r>0)) return box(`<div class="sm mu">Scrie greutatea și repetările unei serii grele (sau alege un exercițiu de mai sus) și îți calculez 1RM-ul și greutățile pentru celelalte repetări.</div>`);
    const e=r===1?w:w*(1+r/30), reps=[1,2,3,4,5,6,8,10,12,15];
    return box(`<div class="row" style="align-items:flex-end"><div><div class="xs mu">1RM estimat</div><div class="big">${num(r25(e))}<small>kg</small></div></div>
        <span class="sp"></span><div class="xs mu" style="text-align:right">${num(w)} kg × ${r}<br>formula Epley${r>12?' · peste 12 rep. e mai puțin precisă':''}</div></div>
      <table class="rm tl-t"><tr><th>Repetări</th><th>Greutate</th><th>% 1RM</th></tr>
        ${reps.map(n=>`<tr class="${n===r?'sel':''}"><td><b>${n}</b></td><td>${num(r25(n===1?e:e/(1+n/30)))} kg</td><td class="mu">${num(n===1?100:100/(1+n/30),0)}%</td></tr>`).join('')}</table>
      <div class="xs mu2" style="margin-top:8px">Greutăți rotunjite la 2,5 kg: cât poți ridica de atâtea ori, la efort maxim. Pentru seriile de lucru alege o greutate puțin mai mică.</div>`); }
  if(k==='pace'){ const D=tlN('pd'), mode=TL.pm||'t';
    let sec=null; if(D>0){ if(mode==='t') sec=parseTime(TL.pt); else { const p=parseTime(TL.pp); if(p) sec=p*D; } }
    if(!(D>0&&sec>0)) return box(`<div class="sm mu">Alege distanța și scrie ${mode==='t'?'timpul':'ritmul'}. Îți dau ${mode==='t'?'ritmul':'timpul'}, viteza, despărțirile pe kilometru și estimări pentru alte distanțe.</div>`);
    const pace=sec/D, kmh=D/(sec/3600), spl=[]; const n=Math.min(Math.ceil(D),12); for(let i=1;i<=n;i++) spl.push([Math.min(i,D),Math.min(i,D)*pace]);
    return box(`<div class="kpis"><div class="kpi"><div class="k">Ritm</div><div class="v">${fmtClock(pace)}<small>/km</small></div></div>
        <div class="kpi"><div class="k">Timp</div><div class="v">${fmtClock(sec)}</div></div><div class="kpi"><div class="k">Viteză</div><div class="v">${num(kmh,1)}<small>km/h</small></div></div></div>
      <div class="dsec"><h4>Despărțiri</h4><div class="tl-spl">${spl.map(([d,t])=>`<span><b>${num(d,1)} km</b>${fmtClock(t)}</span>`).join('')}${D>12?`<span><b>${num(D,1)} km</b>${fmtClock(sec)}</span>`:''}</div></div>
      <div class="dsec"><h4>Același efort pe alte distanțe</h4>${RACE_D.filter(([x])=>Math.abs(x-D)>.01).map(([x,l])=>{ const t=sec*Math.pow(x/D,1.06); return `<div class="list-row"><span class="sp">${l}</span><span class="xs mu">${fmtClock(t/x)} /km</span><span class="v">${fmtClock(t)}</span></div>`; }).join('')}
        <div class="xs mu2" style="margin-top:6px">Formula Riegel: e realistă dacă te-ai pregătit și pentru distanța mai lungă.</div></div>`); }
  if(k==='plates'){ const kg=tlN('pk'), bar=+TL.pb||20;
    if(!(kg>0)) return box(`<div class="sm mu">Scrie greutatea de lucru și îți arăt discurile pe fiecare parte și seriile de încălzire.</div>`);
    const ws=warmSteps(kg,'Bench Press').map(([w,r])=>[Math.max(bar,w),r]).filter((x,i,a)=>x[0]<kg&&a.findIndex(y=>y[0]===x[0])===i);
    return box(`${platesHTML(kg,bar)}
      ${ws.length?`<div class="dsec"><h4>Încălzire</h4>${ws.map(([w,r])=>`<div class="list-row"><span class="sp"><b>${num(w)} kg</b> × ${r}</span><span class="xs mu">${w>bar?'pe parte: '+platesSide(w,bar):'doar bara'}</span></div>`).join('')}
        <div class="list-row"><span class="sp"><b>${num(kg)} kg</b> · serii de lucru</span><span class="xs mu">pe parte: ${platesSide(kg,bar)}</span></div></div>`:''}`); }
  if(k==='sweat'){ const b=tlN('sb'), a=tlN('sa'), dr=tlN('sd')||0, m=tlN('sm');
    if(!(b>0&&a>0&&m>0)) return box(`<div class="sm mu">Completează greutatea înainte și după, ce ai băut și durata. Îți calculez cât transpiri pe oră și cât să bei la alergările lungi.</div>`);
    const loss=(b-a)*1000+dr, rate=loss/(m/60), pct=(b-a)/b*100;
    if(loss<=0) return box(`<div class="sm mu">Greutatea de după e mai mare decât pierderea de lichide: verifică cifrele.</div>`);
    return box(`<div class="kpis"><div class="kpi"><div class="k">Transpirație</div><div class="v">${num(rate/1000,2)}<small>L/h</small></div></div>
        <div class="kpi"><div class="k">Pierdut</div><div class="v">${num(pct,1)}<small>% corp</small></div></div><div class="kpi"><div class="k">De băut după</div><div class="v">${num(Math.max(0,b-a)*1.5,1)}<small>L</small></div></div></div>
      <div class="ag"><ul><li>La alergări peste 60–90 de minute: <b>~${Math.round(rate*.6/50)*50}–${Math.round(rate*.8/50)*50} ml pe oră</b>, în înghițituri la 15–20 de minute. Nu bea mai mult decât transpiri.</li>
        <li>Peste 90 de minute sau pe căldură: și sodiu, cam <b>300–600 mg pe oră</b> (pastile de electroliți sau o băutură sport).</li>
        <li>După efort: <b>~1,5 L pentru fiecare kg pierdut</b>, împreună cu o masă sărată.</li>
        ${pct>2?'<li><b>Ai pierdut peste 2% din greutate</b>: de aici performanța scade vizibil. Bea mai mult în timpul efortului.</li>':''}</ul></div>
      <div class="xs mu2" style="margin-top:8px">Rata se schimbă cu temperatura și intensitatea: refă calculul vara și iarna. Recomandări după ghidurile ACSM.</div>`); }
  if(k==='vdot'){ const D=tlN('vd'), sec=parseTime(TL.vt);
    if(!(D>=1.5&&D<=50&&sec>0)) return box(`<div class="sm mu">Scrie distanța și timpul unei curse sau al unui test la efort maxim. Îți calculez VDOT-ul și ritmurile pentru fiecare tip de antrenament.</div>`);
    const vd=vdotOf(D,sec); if(!(vd>=20&&vd<=90)) return box(`<div class="sm mu">Rezultatul iese în afara tabelelor (VDOT ${num(vd,1)}). Verifică distanța și timpul.</div>`);
    const P=f=>fmtClock(paceAtV(vd,f)*60), M=raceAtV(vd,42.195)/42.195, rows=[['E','Easy și long run',P(.70)+'–'+P(.62),'conversațional, zona 2: aici e grosul kilometrilor'],
      ['M','Ritm de maraton',fmtClock(M),'efort controlat, susținut'],['T','Prag',P(.88),'„confortabil de greu”: reprizele de marți'],['I','Intervale (VO2max)',P(.975),'reprize de 3–5 min, pauză aproape egală'],['R','Repetări',P(1.04),'scurte și rapide, cu pauză completă']];
    const thr=paceAtV(vd,.88);
    return box(`<div class="row" style="align-items:flex-end"><div><div class="xs mu">VDOT</div><div class="big">${num(vd,1)}</div></div><span class="sp"></span><div class="xs mu" style="text-align:right">${num(D,2)} km în ${fmtClock(sec)}<br>${fmtClock(sec/D)} /km</div></div>
      <div class="zones">${rows.map(([b,l,v,h])=>`<div class="zn ${b==='T'?'hl':''}"><b>${b}</b><span>${l}<span class="xs mu" style="display:block">${h}</span></span><span class="v">${v}</span></div>`).join('')}</div>
      <div class="dsec"><h4>Curse echivalente</h4>${RACE_D.map(([x,l])=>{ const s=raceAtV(vd,x); return `<div class="list-row"><span class="sp">${l}</span><span class="xs mu">${fmtClock(s/x)} /km</span><span class="v">${fmtClock(s)}</span></div>`; }).join('')}</div>
      <button class="btn ghost sm wide" style="margin-top:10px" data-a="vdotThr" data-i="${Math.round(thr*600)}">${ic('check')} Folosește ${mmss(thr)} /km ca ritm de prag în FALCO</button>
      <div class="xs mu2" style="margin-top:8px">Formulele Daniels–Gilbert din „Daniels' Running Formula”. Ritmurile sunt pe teren plat, pe vreme răcoroasă; pe căldură sau deal, mergi după efort și puls. Ritmul de prag setat aici schimbă zonele de ritm, nu planul.</div>`); }
  if(k==='tread'){ const v=tlN('ts'), inc=+TL.ti||0;
    if(!(v>=3&&v<=30)) return box(`<div class="sm mu">Scrie viteza benzii în km/h.</div>`);
    const pace=60/v, tab=[6,7,8,9,10,11,12,13,14,15,16];
    return box(`<div class="kpis"><div class="kpi"><div class="k">Ritm</div><div class="v">${mmss(pace)}<small>/km</small></div></div><div class="kpi"><div class="k">Pe milă</div><div class="v">${mmss(pace*1.609344)}</div></div>
        <div class="kpi"><div class="k">mph</div><div class="v">${num(v/1.609344,1)}</div></div></div>
      <div class="ag"><ul><li>Pe bandă nu există rezistența aerului: <b>1% înclinație</b> face efortul asemănător cu alergarea afară, la ritmuri de antrenament.${inc===0?' La 0% efortul e ceva mai mic decât afară.':inc===2?' La 2% e ceva mai greu decât afară, pe plat.':''}</li>
        <li>Pentru zona 2, mergi după puls, nu după viteză: pe bandă e mai cald și pulsul urcă mai repede.</li></ul></div>
      <div class="dsec"><h4>Viteze uzuale</h4><div class="tl-spl">${tab.map(s=>`<span class="${Math.abs(s-v)<.05?'on':''}"><b>${s} km/h</b>${mmss(60/s)} /km</span>`).join('')}</div></div>
      <div class="xs mu2" style="margin-top:8px">Reperul de 1%: Jones și Doust (1996), pe alergători antrenați.</div>`); }
  if(k==='sleep'){ const w=hm(TL.sw), h=parseFloat(TL.sh)||8;
    if(w==null) return box(`<div class="sm mu">Alege ora la care te trezești.</div>`);
    const bed=w-h*60-15, tk=todayKey(); let sl=[],sh7=0; for(let i=0;i<7;i++){ const v=+jOf(dayShift(tk,-i)).sleep; if(v>0){ sl.push(v); if(v<7) sh7++; } }
    const avg=sl.length?avgOf(sl):null, debt=avg!=null?Math.max(0,(h-avg)*sl.length):null;
    return box(`<div class="kpis"><div class="kpi"><div class="k">În pat la</div><div class="v">${fmHM(bed)}</div></div><div class="kpi"><div class="k">Ultima cafeină</div><div class="v">${fmHM(bed-8*60)}</div></div>
        <div class="kpi"><div class="k">Fără ecrane de la</div><div class="v">${fmHM(bed-60)}</div></div></div>
      <div class="ag"><ul><li>Am pus 15 minute pentru adormit: ca să dormi <b>${num(h,1)} ore</b> și să te trezești la ${fmHM(w)}, intră în pat la <b>${fmHM(bed)}</b>.</li>
        <li>Ultima masă mare cu 2–3 ore înainte (până la <b>${fmHM(bed-150)}</b>); o gustare mică, cu proteină, e în regulă.</li>
        <li>Efortul intens se termină cu cel puțin o oră înainte de culcare.</li>
        <li>Cameră răcoroasă (17–19 °C), întunecată și liniștită. Aceeași oră de trezire și în weekend contează mai mult decât orice supliment.</li></ul></div>
      ${avg!=null?`<div class="note">Ultimele ${sl.length} nopți notate: media <b>${num(avg,1)} h</b>${sh7?', '+sh7+' sub 7 ore':''}${debt>.5?` · cam <b>${num(debt,1)} h</b> sub ținta ta`:''}.</div>`:`<div class="note">Notează somnul la check-in și îți arăt aici media și cât ești sub țintă.</div>`}
      <div class="xs mu2" style="margin-top:8px">Sportivii au nevoie de 7–9 ore, iar prelungirea somnului a îmbunătățit performanța în studii (Mah și colab., 2011). Repere după ghidurile de igienă a somnului.</div>`); }
  if(k==='units'){ const kg=tlN('ukg'), lb=tlN('ulb'), km=tlN('ukm'), mi=tlN('umi'), r=[];
    if(kg>0) r.push(`<div class="list-row"><span class="sp">${num(kg,2)} kg</span><span class="v">${num(kg*2.20462,1)} lb</span></div>`);
    if(lb>0) r.push(`<div class="list-row"><span class="sp">${num(lb,2)} lb</span><span class="v">${num(lb*.453592,2)} kg</span></div>`);
    if(km>0) r.push(`<div class="list-row"><span class="sp">${num(km,2)} km</span><span class="v">${num(km/1.609344,2)} mile</span></div>`);
    if(mi>0) r.push(`<div class="list-row"><span class="sp">${num(mi,2)} mile</span><span class="v">${num(mi*1.609344,2)} km</span></div>`);
    return box(r.length?r.join('')+`<div class="xs mu2" style="margin-top:8px">Ganterele și discurile în lb: 45 lb ≈ 20,4 kg · 25 lb ≈ 11,3 kg · 10 lb ≈ 4,5 kg.</div>`:`<div class="sm mu">Scrie o valoare în oricare câmp.</div>`); }
  if(k==='caf'){ const w=tlN('cw'), ct=TL.ct, cb=TL.cb;
    if(!(w>0)) return box(`<div class="sm mu">Scrie greutatea și ora antrenamentului.</div>`);
    const lo=Math.round(w*3/10)*10, hi=Math.round(w*6/10)*10, start=Math.min(lo,200);
    const tm=s=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(s||''); return m?+m[1]*60+ +m[2]:null; }, fm=v=>{ v=((v%1440)+1440)%1440; return pad(Math.floor(v/60))+':'+pad(v%60); };
    const t0=tm(ct), tb=tm(cb), take=t0!=null?t0-50:null, last=tb!=null?tb-8*60:null, late=take!=null&&last!=null&&take>last;
    return box(`<div class="kpis"><div class="kpi"><div class="k">Doză de pornire</div><div class="v">${start}<small>mg</small></div></div>
        <div class="kpi"><div class="k">Interval studiat</div><div class="v" style="font-size:20px">${lo}–${Math.min(hi,400)}<small>mg</small></div></div>
        <div class="kpi"><div class="k">${take!=null?'Ia-o la':'Cu'}</div><div class="v" style="font-size:20px">${take!=null?fm(take):'45–60 min'}</div></div></div>
      <div class="ag"><ul><li>Studiile folosesc <b>3–6 mg/kg</b> cu 45–60 de minute înainte. Începe de jos: efectul crește puțin peste 3 mg/kg, efectele adverse cresc mult.</li>
        <li>Nu trece de <b>400 mg pe zi</b>, din toate sursele.</li>
        ${last!=null?`<li>Ca să nu-ți strici somnul: ultima cafeină până la <b>${fm(last)}</b> (cu ~8 ore înainte de culcare).${late?' <b>Antrenamentul e prea aproape de somn:</b> o doză mică sau deloc. Somnul contează mai mult decât cafeina.':''}</li>`:''}
        <li>Orientativ: espresso ~60–80 mg · cafea la filtru 250 ml ~100–150 mg · energizant 250 ml ~80 mg.</li></ul></div>
      <div class="xs mu2" style="margin-top:8px">După poziția ISSN despre cafeină. Dacă ai probleme cu inima sau tensiunea, întreabă întâi medicul.</div>`); }
  return '';
}
/* ---------- calculatorul de alimente: valori medii la 100 g (USDA FoodData Central și etichete uzuale), crud dacă nu scrie altfel ----------
   [nume, kcal, proteină, carbohidrați, grăsimi, categorie, porție (g), porția în cuvinte] */
const FOODS=[
 ['Piept de pui crud',120,22.5,0,2.6,'p',150,'o bucată'],['Piept de pui gătit',165,31,0,3.6,'p',120,'o porție'],['Pulpă de pui fără piele, gătită',209,26,0,10.9,'p',120,'o porție'],
 ['Piept de curcan gătit',147,30,0,2.1,'p',120,'o porție'],['Piept de curcan feliat (șuncă)',104,17,3.5,2.5,'p',50,'3–4 felii'],['Vită slabă 5% crudă',137,21.4,0,5,'p',150,'o porție'],
 ['Vită slabă 5% gătită',164,26,0,6.4,'p',120,'o porție'],['Carne tocată de vită 15%, crudă',215,18.6,0,15,'p',150,'o porție'],['Mușchi de porc crud',120,21,0,3.5,'p',150,'o porție'],
 ['Somon crud',208,20.4,0,13.4,'p',150,'un file'],['Ton în apă, scurs',116,25.5,0,0.8,'p',120,'o conservă scursă'],['File de cod crud',82,17.8,0,0.7,'p',150,'un file'],
 ['Creveți cruzi',85,20.1,0,0.5,'p',150,'o porție'],['Ou întreg',143,12.6,0.7,9.5,'p',50,'un ou'],['Albuș de ou',52,10.9,0.7,0.2,'p',33,'un albuș'],
 ['Tofu ferm',144,17.3,2.8,8.7,'p',100,'o porție'],['Pudră proteică (whey)',390,78,7,5.5,'p',30,'o măsură'],
 ['Iaurt grecesc 2%',73,10,3.9,1.9,'l',150,'un pahar'],['Iaurt grecesc 5%',95,9,3.5,5,'l',150,'un pahar'],['Skyr',63,11,4,0.2,'l',150,'un pahar'],
 ['Brânză cottage 2%',81,10.5,4.8,2.3,'l',150,'o porție'],['Lapte 1,5%',47,3.4,4.9,1.5,'l',250,'o cană'],['Lapte 3,5%',64,3.3,4.7,3.5,'l',250,'o cană'],
 ['Kefir 2%',50,3.3,4.2,2,'l',250,'o cană'],['Telemea / feta',264,14.2,4.1,21.3,'l',50,'o felie'],['Cașcaval',356,25,2,28,'l',30,'o felie groasă'],['Mozzarella',254,22,2.2,17,'l',125,'o bilă'],
 ['Orez alb crud',365,7.1,80,0.7,'c',75,'o porție crudă'],['Orez alb fiert',130,2.7,28.2,0.3,'c',200,'o porție'],['Orez brun fiert',123,2.7,25.6,1,'c',200,'o porție'],
 ['Paste crude',371,13,74.7,1.5,'c',85,'o porție crudă'],['Paste fierte',158,5.8,30.9,0.9,'c',200,'o porție'],['Fulgi de ovăz',379,13.2,67.7,6.5,'c',50,'o porție'],
 ['Cartofi cruzi',77,2,17.5,0.1,'c',250,'o porție'],['Cartofi fierți',87,1.9,20.1,0.1,'c',250,'o porție'],['Cartof dulce copt',90,2,20.7,0.2,'c',200,'un cartof'],
 ['Pâine albă',266,8.9,49,3.3,'c',30,'o felie'],['Pâine integrală',252,12.4,42.7,3.5,'c',35,'o felie'],['Lipie de grâu (tortilla)',306,8,51,7.5,'c',60,'o lipie'],
 ['Mămăligă',75,1.7,16,0.4,'c',250,'o porție'],['Mălai (făină de porumb)',362,8.1,76.9,3.6,'c',60,'o porție'],['Quinoa fiartă',120,4.4,21.3,1.9,'c',185,'o porție'],
 ['Couscous fiert',112,3.8,23.2,0.2,'c',160,'o porție'],['Bulgur fiert',83,3.1,18.6,0.2,'c',180,'o porție'],['Linte fiartă',116,9,20.1,0.4,'c',200,'o porție'],
 ['Năut fiert',164,8.9,27.4,2.6,'c',160,'o porție'],['Fasole boabe fiartă',127,8.7,22.8,0.5,'c',180,'o porție'],['Fulgi de porumb (cereale)',357,7.5,84,0.4,'c',40,'un bol'],
 ['Rondele de orez',387,8.2,81.5,2.8,'c',9,'o rondea'],['Miere',304,0.3,82.4,0,'c',21,'o lingură'],['Gem',278,0.4,69,0.1,'c',20,'o lingură'],['Zahăr',387,0,100,0,'c',5,'o linguriță'],
 ['Banană',89,1.1,22.8,0.3,'f',120,'o banană'],['Măr',52,0.3,13.8,0.2,'f',180,'un măr'],['Portocală',47,0.9,11.8,0.1,'f',150,'o portocală'],['Afine',57,0.7,14.5,0.3,'f',100,'un pumn mare'],
 ['Căpșuni',32,0.7,7.7,0.3,'f',150,'un bol'],['Struguri',69,0.7,18.1,0.2,'f',150,'un ciorchine mic'],['Kiwi',61,1.1,14.7,0.5,'f',75,'un kiwi'],['Pară',57,0.4,15.2,0.1,'f',180,'o pară'],
 ['Curmale',282,2.5,75,0.4,'f',24,'3 curmale'],['Stafide',299,3.1,79,0.5,'f',30,'un pumn'],['Pepene roșu',30,0.6,7.6,0.2,'f',300,'o felie'],
 ['Broccoli',34,2.8,6.6,0.4,'v',150,'o porție'],['Roșii',18,0.9,3.9,0.2,'v',120,'o roșie'],['Castraveți',15,0.7,3.6,0.1,'v',150,'un castravete'],['Ardei gras roșu',26,1,6,0.3,'v',150,'un ardei'],
 ['Morcovi',41,0.9,9.6,0.2,'v',80,'un morcov'],['Spanac',23,2.9,3.6,0.4,'v',100,'o porție'],['Salată verde',15,1.4,2.9,0.2,'v',80,'un bol'],['Varză',25,1.3,5.8,0.1,'v',150,'o porție'],
 ['Ciuperci',22,3.1,3.3,0.3,'v',100,'o porție'],['Dovlecel',17,1.2,3.1,0.3,'v',200,'un dovlecel'],['Ceapă',40,1.1,9.3,0.1,'v',100,'o ceapă'],['Fasole verde',31,1.8,7,0.2,'v',150,'o porție'],
 ['Conopidă',25,1.9,5,0.3,'v',150,'o porție'],['Mazăre',81,5.4,14.5,0.4,'v',100,'o porție'],
 ['Ulei de măsline',884,0,0,100,'g',10,'o lingură'],['Unt',717,0.9,0.1,81,'g',10,'o porție'],['Unt de arahide',588,25,20,50,'g',16,'o lingură'],['Migdale',579,21.2,21.6,49.9,'g',30,'un pumn'],
 ['Nuci',654,15.2,13.7,65.2,'g',30,'un pumn'],['Arahide',567,25.8,16.1,49.2,'g',30,'un pumn'],['Caju',553,18.2,30.2,43.9,'g',30,'un pumn'],['Semințe de dovleac',559,30.2,10.7,49,'g',30,'un pumn'],
 ['Semințe de floarea-soarelui',584,20.8,20,51.5,'g',30,'un pumn'],['Semințe de chia',486,16.5,42.1,30.7,'g',15,'o lingură'],['Avocado',160,2,8.5,14.7,'g',100,'jumătate'],
 ['Ciocolată neagră 70–85%',598,7.8,45.9,42.6,'g',20,'2 pătrățele'],['Măsline',115,0.8,6.3,10.7,'g',30,'8–10 măsline'],
 ['Hummus',166,7.9,14.3,9.6,'a',60,'2 linguri'],['Maioneză',680,1,0.6,75,'a',15,'o lingură'],['Ketchup',101,1,27,0.1,'a',15,'o lingură'],['Pizza (margherita)',266,11.4,33.3,9.7,'a',300,'o pizza mică'],
 ['Suc de portocale',45,0.7,10.4,0.2,'a',250,'un pahar'],['Bere 5%',43,0.5,3.6,0,'a',500,'o halbă'],['Vin roșu',85,0.1,2.6,0,'a',150,'un pahar'],['Cola',42,0,10.6,0,'a',330,'o doză'],
 ['Băutură izotonică',26,0,6.4,0,'a',500,'o sticlă'],
 ['Sardine în ulei, scurse',208,24.6,0,11.5,'p',90,'o conservă scursă'],['Pastramă de curcan',110,20,2,2.5,'p',50,'3–4 felii'],['Piept de pui la cuptor, cu piele',197,29.8,0,7.8,'p',150,'o porție'],
 ['Lapte de soia neîndulcit',33,3.3,0.6,1.8,'l',250,'o cană'],['Smântână 12%',133,2.7,4,12,'l',30,'o lingură mare'],['Ou fiert',155,12.6,1.1,10.6,'p',50,'un ou']];
const FCATS={p:'Carne, pește, ouă',l:'Lactate',c:'Carbohidrați',f:'Fructe',v:'Legume',g:'Grăsimi și semințe',a:'Altele',m:'Alimentele mele'};
const FD={q:'',cat:'',sel:null,g:'',bc:'',busy:false,err:null,add:false};
const fnorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const foodAll=()=>(S.foods||[]).map(f=>[f.n,f.k,f.p,f.c,f.g,'m',f.por||100,f.por?'o porție':'100 g',f.brand||'']).concat(FOODS);
function foodList(){
  const q=fnorm(FD.q).trim(), ws=q.split(/\s+/).filter(Boolean), cat=FD.cat;
  return foodAll().filter(f=>(!cat||f[5]===cat)&&ws.every(w=>fnorm(f[0]+' '+(f[8]||'')).indexOf(w)>=0)).slice(0,q||cat?40:12);
}
function foodListHTML(){
  const L=foodList();
  if(!L.length) return `<div class="empty sm">Nimic găsit${FD.q?' pentru „'+esc(FD.q)+'”':''}. Încearcă alt cuvânt sau adaugă alimentul tău, de pe etichetă.</div>`;
  return L.map(f=>`<button class="fd-r ${FD.sel&&FD.sel.n===f[0]?'on':''}" data-a="fdPick" data-k="${esc(f[0])}"><span class="sp"><b>${esc(f[0])}</b><span class="xs mu">${f[8]?esc(f[8])+' · ':''}${num(f[1],0)} kcal · P ${num(f[2],1)} · C ${num(f[3],1)} · G ${num(f[4],1)} la 100 g</span></span>${ic('plus')}</button>`).join('');
}
function foodOutHTML(){
  const f=FD.sel; if(!f) return '';
  const g=parseFloat(String(FD.g).replace(',','.')), ok=g>0&&g<=3000, x=v=>ok?v*g/100:0;
  return `<div class="tl-o fd-sel"><div class="row"><div class="sp"><b>${esc(f.n)}</b><div class="xs mu">${f.src==='off'?'Open Food Facts'+(f.brand?' · '+esc(f.brand):''):f.mine?'alimentul tău':'valori medii'} · la 100 g: ${num(f.k,0)} kcal, P ${num(f.p,1)} g</div></div><button class="xb" data-a="fdClear" aria-label="Alt aliment">${ic('x')}</button></div>
    <div class="chips" style="margin-top:10px">${[[100,'100 g']].concat(f.por&&f.por!==100?[[f.por,f.pl||'o porție']]:[]).concat(f.por?[[f.por*2,'2 porții']]:[]).map(([v,l])=>`<button class="chip ${+FD.g===v?'on':''}" data-a="fdG" data-i="${v}">${esc(l)}${l.indexOf(' g')<0?' · '+num(v,0)+' g':''}</button>`).join('')}</div>
    <div class="form"><div class="fld full"><label for="fdG">Cantitatea (grame)</label><input class="inp" id="fdG" data-fd="g" type="number" step="1" inputmode="decimal" value="${esc(FD.g)}" placeholder="ex: 150"></div></div>
    <div id="fdOut">${foodMacros(f,x,ok)}</div>
    <button class="btn pri wide" style="margin-top:12px" data-a="fdAdd" ${ok?'':'disabled'}>${ic('check')} Adaugă în jurnalul de azi</button></div>`;
}
const foodMacros=(f,x,ok)=>`<div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">kcal</div><div class="v">${ok?Math.round(x(f.k)):'—'}</div></div>
  <div class="kpi"><div class="k">Proteină</div><div class="v">${ok?num(x(f.p),1):'—'}<small>g</small></div></div><div class="kpi"><div class="k">Carbo</div><div class="v">${ok?num(x(f.c),1):'—'}<small>g</small></div></div>
  <div class="kpi"><div class="k">Grăsimi</div><div class="v">${ok?num(x(f.g),1):'—'}<small>g</small></div></div></div>`;
function foodHTML(){
  const bd='BarcodeDetector' in window;
  return `<div class="eyebrow">${ic('bowl')} Calculator alimente</div><div class="h2" style="margin-top:6px">Ce ai mâncat?</div>
    <div class="fld" style="margin-top:12px"><input class="inp" id="fdQ" data-fd="q" value="${esc(FD.q)}" placeholder="Caută: pui, orez, ovăz, iaurt…" aria-label="Caută un aliment" autocomplete="off"></div>
    <div class="scrollx" style="margin-top:10px">${[['','Toate']].concat(Object.entries(FCATS).filter(([k])=>k!=='m'||(S.foods||[]).length)).map(([k,l])=>`<button class="chip ${FD.cat===k?'on':''}" data-a="fdCat" data-k="${k}">${l}</button>`).join('')}</div>
    <div id="fdSel">${foodOutHTML()}</div>
    <div class="fd-list" id="fdList">${foodListHTML()}</div>
    <div class="dsec"><h4>Produs ambalat · cod de bare</h4>
      <div class="inrow" style="margin-top:6px"><input class="inp" id="fdBc" data-fd="bc" inputmode="numeric" value="${esc(FD.bc)}" placeholder="cifrele de sub codul de bare" aria-label="Cod de bare">
        <button class="btn" data-a="fdBc" ${FD.busy?'disabled':''}>${FD.busy?'Caut…':'Caută'}</button></div>
      ${bd?`<label class="btn ghost sm wide file-l" style="margin-top:8px">${ic('camera')} Fotografiază codul de bare<input type="file" accept="image/*" capture="environment" data-bcimg="1"></label>`:''}
      ${FD.err?`<div class="err">${ic('alert')}<span>${esc(FD.err)}</span></div>`:''}
      <div class="xs mu2" style="margin-top:6px">Datele vin din Open Food Facts, o bază deschisă cu produse din magazine. Verifică eticheta: are prioritate.</div></div>
    <details class="notes sp-more"${FD.add?' open':''}><summary>${ic('plus')} Adaugă un aliment al tău (de pe etichetă)</summary>
      <div class="form"><div class="fld full"><label for="faN">Nume</label><input class="inp" id="faN" placeholder="ex: Baton proteic X"></div>
        <div class="fld"><label for="faK">kcal / 100 g</label><input class="inp" id="faK" type="number" inputmode="decimal"></div><div class="fld"><label for="faP">Proteină / 100 g</label><input class="inp" id="faP" type="number" inputmode="decimal"></div>
        <div class="fld"><label for="faC">Carbo / 100 g</label><input class="inp" id="faC" type="number" inputmode="decimal"></div><div class="fld"><label for="faG">Grăsimi / 100 g</label><input class="inp" id="faG" type="number" inputmode="decimal"></div>
        <div class="fld full"><label for="faPor">Porția (g, opțional)</label><input class="inp" id="faPor" type="number" inputmode="decimal" placeholder="ex: 60"></div></div>
      <button class="btn wide" style="margin-top:10px" data-a="fdMine">${ic('check')} Salvează în alimentele mele</button></details>
    <div class="note">Valori medii la 100 g, pentru alimente crude dacă nu scrie „fiert” sau „gătit”. Cântărește crud când poți: e cel mai precis.</div>`;
}
function foodPaint(){ const l=$('#fdList'); if(l) l.innerHTML=foodListHTML(); }
function foodSel(f){ FD.sel=f; FD.g=String(f.por&&f.por!==100?f.por:100); FD.err=null; const s=$('#fdSel'); if(s){ s.innerHTML=foodOutHTML(); const sh=$('#shRoot .sheet'); if(sh) sh.scrollTo({top:0,behavior:'smooth'}); } foodPaint(); }
async function foodBarcode(code){
  code=String(code||'').replace(/\D/g,''); if(code.length<8||code.length>14){ FD.err='Codul de bare are 8–14 cifre.'; shRender(); return; }
  FD.bc=code; FD.busy=true; FD.err=null; shRender();
  try{ const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+code+'.json?fields=product_name,product_name_ro,brands,nutriments,serving_quantity');
    if(!r.ok&&r.status!==404) throw new Error('http');
    const d=await r.json(), p=d&&d.product, nu=p&&p.nutriments||{};
    let k=+nu['energy-kcal_100g']; if(!(k>0)&&+nu.energy_100g>0) k=nu.energy_100g/4.184;
    if(!p||d.status===0) FD.err='Produsul nu e în Open Food Facts. Adaugă-l mai jos, de pe etichetă.';
    else if(!(k>=0)||nu.proteins_100g==null) FD.err='Produsul există, dar fără valori nutriționale complete. Adaugă-l de pe etichetă.';
    else { const f={n:String(p.product_name_ro||p.product_name||'Produs '+code).trim().slice(0,70),brand:String(p.brands||'').split(',')[0].trim().slice(0,40),k:Math.round(k),p:+(+nu.proteins_100g||0).toFixed(1),
        c:+(+nu.carbohydrates_100g||0).toFixed(1),g:+(+nu.fat_100g||0).toFixed(1),por:+p.serving_quantity>0&&+p.serving_quantity<2000?Math.round(+p.serving_quantity):null,pl:'o porție',src:'off',code};
      const mine=(S.foods||[]).filter(x=>x.code!==code&&x.n!==f.n); await save('foods',[{n:f.n,brand:f.brand,k:f.k,p:f.p,c:f.c,g:f.g,por:f.por,code}].concat(mine).slice(0,60));
      FD.busy=false; FD.bc=''; shRender(); foodSel(f); return; }
  }catch(e){ FD.err='Nu ajung la Open Food Facts. Verifică internetul și mai încearcă.'; }
  FD.busy=false; shRender();
}
async function foodBarcodeImg(file){
  try{ const bmp=await createImageBitmap(file), det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']}), r=await det.detect(bmp);
    if(r&&r.length) await foodBarcode(r[0].rawValue); else { FD.err='Nu am găsit un cod de bare în poză. Apropie telefonul și asigură lumină bună, sau scrie cifrele.'; shRender(); } }
  catch(e){ FD.err='Nu am putut citi poza. Scrie cifrele de sub codul de bare.'; shRender(); }
}
/* ---------- VDOT (Daniels și Gilbert): capacitatea aerobă din timpul de cursă și ritmurile de antrenament ---------- */
const vo2At=v=>-4.6+0.182258*v+0.000104*v*v;
const pctMax=t=>0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
const vdotOf=(D,sec)=>{ const t=sec/60; return vo2At(D*1000/t)/pctMax(t); };
const velAt=vo2=>(-0.182258+Math.sqrt(0.182258*0.182258+4*0.000104*(vo2+4.6)))/(2*0.000104);
const paceAtV=(vd,f)=>1000/velAt(vd*f);
function raceAtV(vd,D){ let a=D*1.5,b=D*20; for(let i=0;i<60;i++){ const m=(a+b)/2; if(vdotOf(D,m*60)>vd) a=m; else b=m; } return (a+b)/2*60; }
/* somnul: ora de culcare din ora de trezire și ținta de ore */
const hm=s=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(s||''); return m?+m[1]*60+ +m[2]:null; }, fmHM=v=>{ v=((Math.round(v)%1440)+1440)%1440; return pad(Math.floor(v/60))+':'+pad(v%60); };
/* discurile pe o parte, ca text (pentru încălzire) */
function platesSide(kg,bar){ let side=(kg-bar)/2; const out=[]; PLATES.forEach(([p])=>{ while(side>=p-1e-9){ out.push(p); side-=p; } }); return out.length?out.map(p=>num(p,2)).join(' + '):'—'; }
