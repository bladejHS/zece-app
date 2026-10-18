/* =====================================================================
   v8 · ANTRENORUL AI — unelte de citire. Modelul își cere singur datele exacte din aplicație
   (istoric, alergări, recorduri, rezumatul unei perioade, corp, obiective, insights) în loc să
   ghicească dintr-un rezumat. Rulează automat, fără confirmare (doar citesc); uneltele care scriu
   rămân cu confirmarea ta. Fiecare intrare e validată înainte de rulare (vine de la model).
   ===================================================================== */
const AI_RTOOLS=[
  {name:'get_workouts',description:'Antrenamentele de forță dintr-un interval: sesiunile terminate și zilele cu serii, cu seriile pe exercițiu (kg × repetări). Filtrul opțional caută în titlu și în numele exercițiilor (de ex. „picioare" sau „Bench").',eager_input_streaming:true,
   input_schema:{type:'object',properties:{from:{type:'string',description:'Data de început, YYYY-MM-DD.'},to:{type:'string',description:'Data de sfârșit, YYYY-MM-DD. Implicit azi.'},filter:{type:'string',description:'Text căutat în titlu sau exerciții. „picioare", „piept", „spate", „umeri", „brate" filtrează după grupa musculară.'},limit:{type:'integer',description:'Câte zile, cele mai recente primele (1–40, implicit 10).'}}}},
  {name:'get_exercise_history',description:'Istoricul complet al unui exercițiu: fiecare sesiune cu seriile, 1RM estimat (Epley), volumul și recordurile, plus cele mai bune valori.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{exercise:{type:'string',description:'Numele exercițiului (ex: Bench Press). Se acceptă și un nume aproximativ.'},limit:{type:'integer',description:'Câte sesiuni, cele mai recente (1–60, implicit 20).'}},required:['exercise']}},
  {name:'get_runs',description:'Alergările dintr-un interval: distanță, timp, ritm, viteză, puls, tip, despărțiri pe km dacă există, cel mai rapid km.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{from:{type:'string',description:'YYYY-MM-DD'},to:{type:'string',description:'YYYY-MM-DD, implicit azi'},kind:{type:'string',enum:['ez','thr','lng','int','tmp'],description:'Doar un tip de alergare.'},limit:{type:'integer',description:'1–60, implicit 20'}}}},
  {name:'get_records',description:'Recordurile personale actuale (forță: 1RM estimat, greutate, repetări, volum; alergare: distanță, ritm, viteză, timpi pe 1/5/10 km măsurați; conditioning; teste) și ultimele îmbunătățiri, cu date.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{category:{type:'string',enum:['all','lift','run'],description:'Implicit all.'}}}},
  {name:'get_period_summary',description:'Rezumatul unei perioade față de perioada anterioară de aceeași lungime: zile active, sesiuni, tonaj, serii, repetări, km, timp de alergare, ritm mediu, greutate, somn mediu, recorduri.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{from:{type:'string',description:'YYYY-MM-DD'},to:{type:'string',description:'YYYY-MM-DD, implicit azi'}},required:['from']}},
  {name:'get_body',description:'Greutatea (cântăriri și media pe 7 zile), măsurătorile, grăsimea corporală (introdusă sau estimată US Navy, marcată ca atare) dintr-un interval.',eager_input_streaming:true,
   input_schema:{type:'object',properties:{from:{type:'string',description:'YYYY-MM-DD'},to:{type:'string',description:'YYYY-MM-DD, implicit azi'}}}},
  {name:'get_goals',description:'Obiectivele, cu valoarea actuală, ținta, diferența, progresul, reperele atinse și data estimată.',eager_input_streaming:true,input_schema:{type:'object',properties:{}}},
  {name:'get_insights',description:'Observațiile calculate de aplicație din date (volum față de medie, progres pe exerciții, tendințe, somn, recorduri), fiecare cu datele din care rezultă.',eager_input_streaming:true,input_schema:{type:'object',properties:{}}}
];
const AI_RNAMES=new Set(AI_RTOOLS.map(t=>t.name));
const AI_RT_LBL={get_workouts:['dumbbell','antrenamentele'],get_exercise_history:['chart','istoricul exercițiului'],get_runs:['run','alergările'],get_records:['trophy','recordurile'],get_period_summary:['gauge','rezumatul perioadei'],get_body:['scale','datele de corp'],get_goals:['target','obiectivele'],get_insights:['bulb','observațiile din date']};
const isDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parseKey(s));
/* validarea intrării: tipuri, intervale, date; o intrare invalidă nu rulează, modelul primește eroarea */
function aiRead(name,inp){
  inp=inp&&typeof inp==='object'&&!Array.isArray(inp)?inp:{}; const tk=todayKey();
  const lim=(v,a,b,d)=>v==null?d:Number.isInteger(v)&&v>=a&&v<=b?v:NaN;
  const from=inp.from==null?null:isDay(inp.from)?inp.from:'!', to=inp.to==null?tk:isDay(inp.to)?(inp.to>tk?tk:inp.to):'!';
  if(from==='!'||to==='!') return {err:'Datele trebuie să fie în formatul YYYY-MM-DD.'};
  if(from&&from>to) return {err:'Data de început e după data de sfârșit.'};
  const cap=s=>s.length>7000?s.slice(0,7000)+'\n[… tăiat; cere un interval mai scurt]':s;
  switch(name){
    case 'get_workouts':{ const n=lim(inp.limit,1,40,10); if(isNaN(n)) return {err:'limit trebuie să fie un număr întreg între 1 și 40.'};
      if(inp.filter!=null&&typeof inp.filter!=='string') return {err:'filter trebuie să fie text.'};
      const f=fold(inp.filter||'').trim(), reg=REG_RO[f.replace(/\s+/g,'')]||null;
      const match=ex=>{ if(!f) return true; if(reg){ const m=EXM[ex]||{}; if(reg==='jos'||reg==='sus') return regionOf(ex)===reg; if(reg==='brate') return (m.biceps||0)>=1||(m.triceps||0)>=1; return (m[reg]||0)>=1; } return fold(ex).indexOf(f)>=0; };
      const X=IX(), days=X.days.filter(d=>d<=to&&(!from||d>=from)&&(X.day[d].sets||X.day[d].hist.length)).filter(d=>!f||Object.keys(X.day[d].ex).some(match)||X.day[d].hist.some(h=>fold(h.t||'').indexOf(f)>=0)).slice(-n).reverse();
      if(!days.length) return {res:'Niciun antrenament de forță găsit'+(f?' pentru „'+inp.filter+'"':'')+' în interval.'};
      return {res:cap(days.map(d=>{ const o=X.day[d], h=o.hist[0]; const exs=Object.keys(o.ex).filter(ex=>!reg||match(ex));
        return d+(h?' · '+(h.t||'antrenament')+' · '+Math.round((+h.dur||0)/60)+' min'+(h.rpe?' · RPE '+h.rpe:''):'')+' · '+o.sets+' serii, tonaj '+Math.round(o.vol)+' kg\n'+
          exs.map(ex=>{ const e=liftHist(ex).find(x=>x.d===d); return e?'  - '+ex+': '+e.s.map(fmtSet).join(', ')+' (1RM est. '+Math.max(0,...e.s.map(([w,r])=>e1rm(w,r)))+' kg)':''; }).filter(Boolean).join('\n'); }).join('\n'))}; }
    case 'get_exercise_history':{ if(typeof inp.exercise!=='string'||!inp.exercise.trim()) return {err:'exercise lipsește.'}; const n=lim(inp.limit,1,60,20); if(isNaN(n)) return {err:'limit între 1 și 60.'};
      const q=fold(inp.exercise), names=Object.keys(S.lifts||{}), ex=names.find(x=>fold(x)===q)||names.find(x=>fold(x).indexOf(q)>=0)||names.find(x=>q.split(/\s+/).every(w=>fold(x).indexOf(w)>=0));
      if(!ex) return {res:'Nu există serii notate pentru „'+inp.exercise+'". Exerciții cu istoric: '+names.slice(0,40).join(', ')+'.'};
      const L=liftStats(ex);
      return {res:cap(ex+': '+L.ses.length+' sesiuni. Cel mai bun 1RM estimat: '+(L.bestSet?L.bestSet.v+' kg ('+fmtSet(L.bestSet.s)+', '+L.bestSet.d+')':'—')+'; greutate maximă: '+(L.bestW?num(L.bestW.w)+' kg ('+L.bestW.d+')':'—')+'; volum maxim pe sesiune: '+(L.bestVol?L.bestVol.v+' kg ('+L.bestVol.d+')':'—')+'.\n'+
        L.ses.slice(-n).map(x=>'- '+x.d+': '+x.s.map(fmtSet).join(', ')+' · 1RM est. '+x.e1+' · volum '+x.vol+' kg'+(x.tags.length?' · PR: '+x.tags.join(', '):'')).join('\n'))}; }
    case 'get_runs':{ const n=lim(inp.limit,1,60,20); if(isNaN(n)) return {err:'limit între 1 și 60.'}; if(inp.kind!=null&&RUN_KINDS.indexOf(inp.kind)<0) return {err:'kind invalid.'};
      const rs=(S.runs||[]).filter(r=>r.date<=to&&(!from||r.date>=from)&&(!inp.kind||r.kind===inp.kind)).sort((a,b)=>a.date<b.date?1:-1).slice(0,n);
      if(!rs.length) return {res:'Nicio alergare în interval.'};
      return {res:cap(rs.map(r=>{ const sp=runSplits(r), fk=fastestKm(r);
        return '- '+r.date+' '+(RUNK[r.kind]||r.kind)+': '+num(r.km,2)+' km în '+fmtClock((+r.min||0)*60)+' ('+fmtPace(paceOf(r))+', '+(kmh(r)?num(kmh(r),1)+' km/h':'')+')'+(r.hr?', puls mediu '+r.hr:'')+(r.hrMax?' (max '+r.hrMax+')':'')+(r.cad?', cadență '+r.cad:'')+(r.elev!=null?', elevație '+Math.round(r.elev)+' m':'')+(r.rpe?', efort '+r.rpe+'/10':'')+(r.sid?', Strava':'')+
          (sp.length?'\n    despărțiri: '+sp.map(s=>mmss(s.t*1000/s.d/60)).join(' ')+(fk?' · cel mai rapid km '+fmtClock(fk.t):''):''); }).join('\n'))}; }
    case 'get_records':{ const c=inp.category||'all'; if(['all','lift','run'].indexOf(c)<0) return {err:'category invalid.'}; const B=prBook();
      const cur=Object.values(B.cur).filter(p=>c==='all'||(c==='lift'?!!p.ex:!p.ex&&['dist','pace','spd','time'].indexOf(p.cat)>=0));
      const ev=B.ev.filter(p=>c==='all'||(c==='lift'?!!p.ex:!p.ex)).slice(0,15);
      return {res:cap('Recorduri actuale:\n'+cur.map(p=>'- '+prName(p)+': '+prVal(p)+(p.txt?' ('+p.txt+')':'')+(p.d?', '+p.d:'')).join('\n')+'\n\nUltimele îmbunătățiri:\n'+(ev.map(p=>'- '+p.d+' '+prName(p)+': '+(p.prev!=null?(p.cat==='pace'?mmss(p.prev):p.cat==='time'?fmtClock(p.prev):num(p.prev,1))+' → ':'')+prVal(p)).join('\n')||'niciuna')+'\nTimpii pe distanță sunt doar măsurați (alergare de exact distanța sau efort Strava); 1RM e estimat cu Epley.')}; }
    case 'get_period_summary':{ if(!from) return {err:'from lipsește.'}; const days=daysBetween(from,to)+1, pb=dayShift(from,-1), pa=dayShift(pb,-(days-1)), a=periodAgg(from,to), b=periodAgg(pa,pb);
      const ln=(l,x,y,f)=>'- '+l+': '+f(x)+' (înainte '+f(y)+(y>0?', '+(x>=y?'+':'')+num((x-y)/y*100,1)+'%':'')+')';
      const sl=k=>{ const v=[]; for(let d=k[0];d<=k[1];d=dayShift(d,1)){ const s=+jOf(d).sleep; if(s>0) v.push(s); } return v.length?num(avgOf(v),1)+' h din '+v.length+' nopți':'nenotat'; };
      const wa=w7At(to), wb=w7At(dayShift(from,-1)), prs=prBook().ev.filter(p=>p.d>=from&&p.d<=to&&p.cat!=='rep');
      return {res:'Perioada '+from+' – '+to+' ('+days+' zile) față de '+pa+' – '+pb+':\n'+[ln('Zile active',a.days,b.days,v=>v),ln('Sesiuni ghidate',a.ses,b.ses,v=>v),ln('Tonaj',a.vol,b.vol,v=>Math.round(v)+' kg'),ln('Serii',a.sets,b.sets,v=>v),ln('Repetări',a.reps,b.reps,v=>v),
        ln('Alergare',a.km,b.km,v=>num(v,1)+' km'),ln('Timp de alergare',a.rmin,b.rmin,v=>Math.round(v)+' min')].join('\n')+'\n- Ritm mediu: '+(a.pace?mmss(a.pace)+' /km':'—')+(b.pace?' (înainte '+mmss(b.pace)+')':'')+
        '\n- Greutate (media pe 7 zile): '+(wa!=null?num(wa,1)+' kg la final':'—')+(wb!=null?', '+num(wb,1)+' kg la început':'')+'\n- Somn: '+sl([from,to])+'\n- Recorduri: '+(prs.length?prs.map(p=>prName(p)+' '+prVal(p)).join('; '):'niciunul')}; }
    case 'get_body':{ const f=from||dayShift(tk,-90), w=wList().filter(x=>x.d>=f&&x.d<=to), b=bList().filter(x=>x.d>=f&&x.d<=to), P=prof();
      const step=Math.max(1,Math.ceil(w.length/40));
      return {res:cap('Cântăriri ('+w.length+'): '+(w.filter((_,i)=>i%step===0||i===w.length-1).map(x=>x.d+' '+num(x.w,1)).join(', ')||'niciuna')+(w.length?'\nMedia pe 7 zile la '+to+': '+(w7At(to)!=null?num(w7At(to),1)+' kg':'—'):'')+
        '\nMăsurători:\n'+(b.map(x=>'- '+x.d+': '+MEAS.filter(([k])=>+x[k]>0).map(([k,l])=>l.toLowerCase()+' '+num(x[k])+' cm').join(', ')+(x.bf?', grăsime '+num(x.bf,1)+'% (introdus manual)':'')+((()=>{ const e=navyBF(x,P); return e!=null&&e>3&&e<70?', grăsime ~'+num(e,1)+'% (estimare US Navy)':''; })())).join('\n')||'niciuna')+
        '\nPoze de progres: '+(Array.isArray(S.photos)?S.photos.filter(p=>p.date>=f&&p.date<=to).length:'necunoscut')+' (doar pe dispozitiv).')}; }
    case 'get_goals':{ const gs=goalsAll(); if(!gs.length) return {res:'Niciun obiectiv setat.'};
      return {res:gs.map(g=>{ const s=goalState(g); return '- '+goalTitle(g)+': acum '+goalFmt(g,s.cur)+' ('+goalSrc(g)+'), pornit de la '+goalFmt(g,g.from)+', progres '+Math.round(s.frac*100)+'%'+(s.gap?', '+s.gap:'')+(s.done?', ATINS':'')+
        (s.ms.length?', repere: '+s.ms.map(m=>m.m*100+'% pe '+m.d).join(', '):'')+(s.eta&&!s.done?', estimat ~'+s.eta:'')+(g.by?', termen '+g.by+(s.st==='late'?' (în urmă)':s.st==='ok'?' (în grafic)':''):''); }).join('\n')}; }
    case 'get_insights':{ const L=insightsAll(); if(!L.length) return {res:'Nu sunt destule date pentru observații.'};
      return {res:cap(L.map(x=>'- '+x.txt.replace(/<[^>]+>/g,'')+(x.ev&&x.ev.length?'\n    date: '+x.ev.map(([a,b])=>a+' = '+b).join('; '):'')).join('\n'))}; }
  }
  return {err:'Unealtă necunoscută.'};
}
/* cardul compact din conversație: „Am citit: …" */
function aiReadCard(chat,b){ const t=(chat.tools||{})[b.id]||{}, L=AI_RT_LBL[b.name]||['search','date'], inp=b.input||{};
  const det=[inp.exercise,inp.filter,inp.kind?RUNK[inp.kind]:'',inp.from&&inp.to?inp.from+' – '+inp.to:inp.from?'din '+inp.from:''].filter(Boolean).join(' · ');
  return `<div class="tool rd ${t.status==='err'?'no':''}"><div class="ic">${ic(L[0])}</div><div class="sp"><div class="d">${t.status==='err'?'Nu am putut citi ':'Am citit '}${esc(L[1])}${det?' · '+esc(det):''}</div></div></div>`; }
