/* =====================================================================
   PERFORMANCE ENGINE — indicatori de antrenament calculați din datele introduse.
   Nu sunt măsurători medicale; fiecare scor își arată sursa și factorii.
   ===================================================================== */
const REG={sus:'partea de sus',jos:'picioare',tot:'tot corpul'};
const PTESTS=[['hang','Dead hang','s','Atârnat la bară, brațe întinse, priză pronată. Cât timp ții.','Grip'],
  ['broad','Săritură în lungime','cm','De pe loc, cu ambele picioare. Cea mai bună din 3 încercări.','Putere'],
  ['reach','Sit and reach','cm','Așezat, genunchii întinși. Centimetri față de vârfurile picioarelor (negativ dacă nu ajungi).','Mobilitate'],
  ['k1','1 km contra-cronometru','s','Un kilometru la efort maxim, după 10 min de încălzire. Scrie timpul ca minute:secunde (ex: 3:45).','Viteză']];
const ATTR=[['str','Forță','dumbbell'],['end','Rezistență','run'],['spd','Viteză','bolt'],['pow','Putere','flame'],['con','Conditioning','refresh'],['grip','Grip','target'],['mob','Mobilitate','leaf'],['rec','Recuperare','sun']];
const CAPS=['str','end','spd','pow','con','grip','mob'];
const lin=(v,a,b)=>clamp((v-a)/(b-a),0,1);
const avgOf=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
function wAt(d){ const L=wl0(); let lo=0, hi=L.length-1; while(lo<=hi){ const m=(lo+hi)>>1; if(L[m].d<=d) lo=m+1; else hi=m-1; }
  if(hi<0) return prof().startW; const c=dayShift(d,-7), r=[]; for(let j=hi;j>=0&&L[j].d>c;j--) r.unshift(L[j].w); return r.length?avgOf(r):L[hi].w; }
const testsOf=(type,from,to)=>(S.ptests||[]).filter(t=>t.type===type&&t.date>=from&&t.date<=to);
function stdPos(n,ratio){ const th=STD[n].map(x=>x*(prof().sex==='f'?.6:1)), pts=[[0,0]].concat(th.map((x,i)=>[x,.1+.2*i])).concat([[th[4]*1.25,1]]);
  for(let i=1;i<pts.length;i++) if(ratio<=pts[i][0]){ const [a,pa]=pts[i-1],[b,pb]=pts[i]; return clamp(pa+(ratio-a)/(b-a)*(pb-pa),0,1); } return 1; }
/* recuperarea unei zile: pornește de la 70 și fiecare factor adaugă sau scade, vizibil */
function recoveryAt(d){
  const j=jOf(d), f=[]; let s=70, has=false;
  const add=(v,t)=>{ s+=v; f.push([v,t]); };
  if(+j.sleep>0){ has=true; const h=+j.sleep; add(h>=8?10:h>=7?5:h>=6?-6:-14,'Somn '+num(h)+' h'); }
  else if(j.sleepQ){ has=true; add((j.sleepQ-3)*5,'Calitatea somnului '+j.sleepQ+'/5'); }
  if(j.energy){ has=true; add((j.energy-3)*6,'Energie '+j.energy+'/5'); }
  if(j.sore){ has=true; add(-(j.sore-1)*5,'Febră musculară '+j.sore+'/5'+(j.soreReg&&REG[j.soreReg]?' ('+REG[j.soreReg]+')':'')); }
  const base=key=>{ const xs=[]; for(let i=1;i<=14;i++){ const v=+jOf(dayShift(d,-i))[key]; if(v>0) xs.push(v); } return xs.length>=4?avgOf(xs):null; };
  if(+j.rhr>0){ has=true; const b=base('rhr'); if(b){ const dv=j.rhr-b; add(dv>=7?-12:dv>=4?-6:dv<=-3?4:0,'Puls în repaus '+j.rhr+' bpm (media ta '+Math.round(b)+')'); }
    else f.push([0,'Puls în repaus '+j.rhr+' bpm — media ta se formează după 4 zile']); }
  if(+j.hrv>0){ has=true; const b=base('hrv'); if(b){ const r=j.hrv/b; add(r<.85?-12:r<.93?-6:r>1.07?5:0,'HRV '+j.hrv+' ms (media ta '+Math.round(b)+')'); }
    else f.push([0,'HRV '+j.hrv+' ms — media ta se formează după 4 zile']); }
  const y=dayShift(d,-1), t=dayTotals(y); if(has&&mlogDay(y).length>=3){ const tg=TGC||(TGC=targets()); if(t.p>=tg.p*.9) add(3,'Proteina de ieri atinsă'); if(t.k<tg.kcal*.7) add(-5,'Aport foarte mic ieri ('+Math.round(t.k)+' kcal)'); }
  return has?{v:clamp(Math.round(s),0,100),f}:null;
}
/* încărcarea zilei: serii × efort, minute de alergare × efort, conditioning din cronometru */
function dayLoad(d){
  const X=IX(); if(X.dl[d]!=null) return X.dl[d];
  const o=X.day[d]; if(!o) return X.dl[d]=0;
  const h=o.hist.find(x=>x.rpe), rpe=h?h.rpe:6; let L=o.sets*rpe;
  o.runs.forEach(r=>{ L+=(+r.min||0)*(+r.rpe||(r.kind==='thr'?7:r.kind==='lng'?5:4)); });
  o.tm.forEach(t=>{ if(['amrap','engine','emom'].indexOf(t.kind)>=0) L+=Math.round(t.total/60)*8; });
  o.ext.forEach(x=>{ L+=Math.round(+x.min||0)*extRpe(x); });
  return X.dl[d]=L;
}
function loadRatio(d){ let a=0,c=0; for(let i=0;i<28;i++){ const v=dayLoad(dayShift(d,-i)); if(i<7) a+=v; c+=v; } const ch=c/4; return ch>0?{r:a/ch,a:Math.round(a),ch:Math.round(ch)}:null; }
const loadScore=lr=>lr?Math.round(clamp(lr.r<.8?100-(.8-lr.r)*60:lr.r<=1.3?100:100-(lr.r-1.3)*160,0,100)):null;
function readiness(d){
  d=d||todayKey(); const rec=recoveryAt(d), lr=loadRatio(d), ls=loadScore(lr);
  if(!rec) return {v:null,rec:null,lr,ls,f:[]};
  const f=rec.f.slice(); if(lr) f.push([ls>=95?0:-Math.round((100-ls)/4),'Încărcare: '+lr.a+' în 7 zile față de media de '+lr.ch+' ('+num(lr.r,2)+'×'+(lr.r>1.3?', crescută brusc':lr.r<.8?', sub obișnuit':', echilibrată')+')']);
  return {v:Math.round(ls==null?rec.v:.75*rec.v+.25*ls),rec,lr,ls,f};
}
const rdLabel=v=>v>=80?['Pregătit de greu','good']:v>=60?['Antrenament normal','']:v>=45?['Moderat: fără recorduri','mid']:['Zi de recuperare','bad'];
/* atributele atletului la o anumită dată, doar din datele de până atunci.
   Fiecare atribut e o medie ponderată de componente (0–1); componentele permit comparații corecte în timp. */
const mix=(parts,f,src)=>{ if(!parts.length) return null; const sw=parts.reduce((a,p)=>a+p[2],0), v=parts.reduce((a,p)=>a+p[1]*p[2],0)/sw, o={};
  parts.forEach(([k,x,w])=>o[k]=[x,w]); return {v:Math.round(100*v),f,src,parts:o}; };
function attrAt(id,d){
  const f=[], P=[], f90=dayShift(d,-90), f28=dayShift(d,-27), f180=dayShift(d,-180);
  switch(id){
    case 'str':{ const bw=wAt(d);
      Object.keys(STD).forEach(n=>{ let e=0; liftHist(n).forEach(x=>{ if(x.d>d||x.d<f90) return; x.s.forEach(([w,r])=>{ const ld=n==='Weighted Pull Up'?bw+w:w; if(r>0&&ld>0) e=Math.max(e,ld*(1+r/30)); }); });
        if(e){ P.push([n,stdPos(n,e/bw),1]); f.push(n+': '+num(e/bw,2)+'× greutatea corporală'); } });
      return mix(P,f,'1RM estimat raportat la greutatea corporală, pe exercițiile cu standarde (90 de zile)'); }
    case 'end':{ const rs=(S.runs||[]).filter(r=>r.date<=d&&r.date>=f90); if(!rs.length) return null;
      const r28=rs.filter(r=>r.date>=f28), wk=sumKm(r28)/4, lg=Math.max(0,...rs.map(r=>+r.km||0));
      f.push(num(wk,1)+' km pe săptămână (media pe 4 săpt.)','cea mai lungă alergare: '+num(lg,1)+' km',r28.length+' alergări în 4 săptămâni');
      return mix([['wk',lin(wk,0,40),.45],['lg',lin(lg,0,21.1),.35],['n',lin(r28.length,0,12),.2]],f,'volum săptămânal, alergarea lungă și frecvența'); }
    case 'spd':{ let best=null;
      (S.runs||[]).filter(r=>r.date<=d&&r.date>=f90&&+r.km>=1&&+r.min>0).forEach(r=>{ const t5=r.min*60*Math.pow(5/r.km,1.06); if(!best||t5<best.t) best={t:t5,s:num(r.km,1)+' km din '+r.date}; });
      testsOf('k1',f90,d).forEach(t=>{ const t5=t.value*Math.pow(5,1.06); if(!best||t5<best.t) best={t:t5,s:'testul de 1 km din '+t.date}; });
      if(!best) return null; f.push('5 km echivalent: '+fmtClock(best.t)+' (din '+best.s+')');
      return mix([['t5',lin(2400-best.t,0,1380),1]],f,'cel mai bun 5 km echivalent (Riegel): 40:00 → 0, 17:00 → 100'); }
    case 'pow':{ const bj=testsOf('broad',f180,d); if(bj.length){ const v=Math.max(...bj.map(t=>t.value)); P.push(['bj',lin(v,150,290),1]); f.push('săritură în lungime: '+v+' cm'); }
      const bw=wAt(d); let e=0; liftHist('Push Press').forEach(x=>{ if(x.d>d||x.d<f90) return; x.s.forEach(([w,r])=>{ if(w>0&&r>0) e=Math.max(e,w*(1+r/30)); }); });
      if(e){ P.push(['pp',stdPos('Push Press',e/bw),1]); f.push('Push Press: '+num(e/bw,2)+'× greutatea corporală'); }
      return mix(P,f,'săritura în lungime (150 → 290 cm) și Push Press'); }
    case 'con':{ const tl=(S.tmlog||[]).filter(t=>t.date<=d&&t.date>=f90);
      const am=tl.filter(t=>t.kind==='amrap'&&t.rounds>0); if(am.length){ const r=Math.max(...am.map(t=>t.rounds)); P.push(['am',lin(r,2,9),1]); f.push('AMRAP 10 min: '+r+' runde'); }
      const en=tl.filter(t=>t.kind==='engine'&&t.laps&&t.laps.length); if(en.length){ const l=Math.min(...en.map(t=>avgOf(t.laps))); P.push(['en',lin(75-l,0,30),1]); f.push('Engine Builder: '+fmtClock(l)+' pe rundă'); }
      const th=(S.runs||[]).filter(r=>r.kind==='thr'&&r.date<=d&&r.date>=f90&&paceOf(r)); if(th.length){ const p=Math.min(...th.map(paceOf)); P.push(['th',lin(7-p,0,3),1]); f.push('ritm de prag: '+mmss(p)+' /km'); }
      return mix(P,f,'AMRAP și Engine Builder din cronometru, plus ritmul de prag'); }
    case 'grip':{ const h=testsOf('hang',f180,d); if(!h.length) return null; const v=Math.max(...h.map(t=>t.value)); f.push('dead hang: '+v+' s');
      return mix([['dh',lin(v,10,120),1]],f,'testul de dead hang: 10 s → 0, 120 s → 100'); }
    case 'mob':{ const sr=testsOf('reach',f180,d), ses=(S.hist||[]).filter(h=>PLAN[h.d]&&PLAN[h.d].cat==='rest'&&h.date<=d&&h.date>=f28).length;
      if(sr.length){ const v=sr[sr.length-1].value; P.push(['sr',lin(v,-20,20),.7]); f.push('sit and reach: '+(v>0?'+':'')+v+' cm'); }
      if(ses||sr.length){ P.push(['ses',lin(ses,0,4),.3]); if(ses) f.push(ses+' sesiuni de recuperare și mobilitate în 4 săpt.'); }
      return mix(P,f,sr.length?'testul sit and reach (70%) și sesiunile de mobilitate (30%)':'sesiunile de recuperare și mobilitate (4 pe lună = 100)'); }
    case 'rec':{ const xs=[]; for(let i=0;i<7;i++){ const r=recoveryAt(dayShift(d,-i)); if(r) xs.push(r.v); } if(!xs.length) return null;
      f.push('media din '+xs.length+' '+(xs.length===1?'zi':'zile')+' cu check-in'); return mix([['r',avgOf(xs)/100,1]],f,'somn, energie, febră musculară, puls în repaus și HRV (7 zile)'); }
    case 'cons':{ const {L,R}=activity(); let n=0; for(let i=0;i<28;i++){ const k=dayShift(d,-i); if(L.has(k)||R.has(k)) n++; }
      f.push(n+' zile active din ultimele 28'); return mix([['n',lin(n,0,22),1]],f,'zile active în 4 săptămâni (planul are 7 sesiuni pe săptămână)'); }
  }
  return null;
}
/* schimbarea dintre două momente, doar pe componentele prezente în ambele (un exercițiu nou nu „scade” forța) */
function chainDelta(a,b){ if(!a||!b) return null; let sw=0, s=0; Object.keys(b.parts).forEach(k=>{ const x=a.parts[k]; if(x){ const w=b.parts[k][1]; sw+=w; s+=w*(b.parts[k][0]-x[0]); } });
  return sw?100*s/sw:null; }
let TWC=null, TGC=null;
function twinNow(){ if(TWC) return TWC; const tk=todayKey(), now={}, old={}; ATTR.concat([['cons']]).forEach(([id])=>{ now[id]=attrAt(id,tk); const o=attrAt(id,dayShift(tk,-30)), dl=chainDelta(o,now[id]);
    old[id]=dl==null?null:{v:clamp(Math.round(now[id].v-dl),0,100)}; });
  const caps=CAPS.filter(id=>now[id]), sorted=caps.slice().sort((a,b)=>now[a].v-now[b].v);
  TWC={now,old,lim:sorted[0]||null,top:sorted[sorted.length-1]||null}; return TWC; }
/* seria în timp: indice legat în lanț, ancorat la valoarea de azi */
function twinSeries(id,range){
  const tk=todayKey(), {L,R}=activity(), first=[...L,...R,...wList().map(x=>x.d),...(S.ptests||[]).map(t=>t.date)].sort()[0]||tk;
  const span=range?range:Math.max(30,daysBetween(first,tk)), step=Math.max(1,Math.round(span/24)), raw=[];
  for(let i=span;i>0;i-=step){ const d=dayShift(tk,-i); if(d<first) continue; const a=attrAt(id,d); if(a) raw.push({x:d,a}); }
  const last=attrAt(id,tk); if(!last) return []; raw.push({x:tk,a:last});
  const pts=new Array(raw.length); let y=last.v; pts[raw.length-1]={x:tk,y};
  for(let i=raw.length-2;i>=0;i--){ const dl=chainDelta(raw[i].a,raw[i+1].a); y=dl==null?raw[i].a.v:y-dl; pts[i]={x:raw[i].x,y:clamp(Math.round(y),0,100)}; }
  return pts;
}
function radarSVG(now,old){
  const n=ATTR.length, c=160, R=108, P=(i,v)=>{ const a=-Math.PI/2+i*2*Math.PI/n, r=R*clamp(v,0,100)/100; return [c+Math.cos(a)*r,c+Math.sin(a)*r]; };
  const poly=src=>ATTR.map(([id],i)=>P(i,src[id]?src[id].v:0).map(x=>x.toFixed(1)).join(',')).join(' ');
  let g=''; [25,50,75,100].forEach(l=>{ g+=`<polygon class="lv" points="${ATTR.map((_,i)=>P(i,l).join(',')).join(' ')}"/>`; });
  ATTR.forEach(([id,l],i)=>{ const [x,y]=P(i,100), [lx,ly]=P(i,124), v=now[id]; g+=`<line class="ax" x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>
    <text class="lb" x="${lx.toFixed(1)}" y="${(ly-2).toFixed(1)}" text-anchor="middle">${l}</text><text class="lbv" x="${lx.toFixed(1)}" y="${(ly+13).toFixed(1)}" text-anchor="middle">${v?v.v:'—'}</text>`; });
  return `<svg class="radar" viewBox="-20 -6 360 340" role="img" aria-label="Profilul atletului">${g}${ATTR.some(([id])=>old[id])?`<polygon class="old" points="${poly(old)}"/>`:''}<polygon class="now" points="${poly(now)}"/></svg>`;
}
/* import CSV (de ex. exportat din Apple Health cu Scurtături, sau din alt ceas): dată, somn, pași, puls în repaus, HRV */
function parseCSV(txt){
  const rows=txt.replace(/\r/g,'').split('\n').filter(l=>l.trim()); if(rows.length<2) return [];
  const sep=rows[0].indexOf(';')>=0?';':',', H=rows[0].split(sep).map(h=>h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''));
  const col=re=>H.findIndex(h=>re.test(h)), ci={d:col(/^(date|data|zi|day)/),s:col(/sleep|somn/),p:col(/step|pasi/),r:col(/rhr|resting|repaus|puls/),h:col(/hrv/)};
  if(ci.d<0) return [];
  const nv=v=>{ const x=parseFloat(String(v||'').replace(',','.')); return isFinite(x)?x:null; };
  return rows.slice(1).map(l=>{ const c=l.split(sep).map(x=>x.trim()); let d=c[ci.d]||''; let m;
    if((m=/^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(d))) d=m[3]+'-'+pad(m[2])+'-'+pad(m[1]); else d=d.slice(0,10);
    return {d,sleep:ci.s>=0?nv(c[ci.s]):null,steps:ci.p>=0?nv(c[ci.p]):null,rhr:ci.r>=0?nv(c[ci.r]):null,hrv:ci.h>=0?nv(c[ci.h]):null}; }).filter(x=>validDate(x.d));
}
