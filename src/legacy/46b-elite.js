/* =====================================================================
   v15 · ELITE — HRV cu deload forțat, import de sănătate (CSV), gamificare inversă (mastery), analize,
   squad-uri private (gist secret, criptat), ritualul săptămânal sincronizat pe ceas și vocea dinamică.
   Logica: src/lib/premium (ELITE). Nimic de aici nu apare în modul activ de antrenament (cronometrul e pe tot ecranul).
   ===================================================================== */
K.squad='zece3:squad'; S.squad=null; K.cues='zece3:cues'; S.cues=true;

/* ---------- HRV: deload forțat sub 90% din media pe 7 zile ---------- */
const hrvPts=()=>Object.keys(S.journal||{}).map(k=>({date:k,hrv:+S.journal[k].hrv||undefined,sleep:+S.journal[k].sleep||undefined}));
let HRVC=null;
function hrvAt(k){ if(!HRVC||HRVC.g!==S.journal) HRVC={g:S.journal,m:{}}; return HRVC.m[k]||(HRVC.m[k]=ELITE.hrvStatus(hrvPts(),k)); }
const hrvNow=()=>hrvAt(todayKey());
/* ziua de azi din plan devine deload când HRV-ul o cere (doar următoarea zi de antrenament, adică cea de azi) */
function hrvDeloadDay(w,d){ const nx=nextDay(); return !!(nx&&nx.w===w&&nx.d===d&&hrvNow().force); }
function hrvCard(){ const h=hrvNow(); if(!h.force) return '';
  return `<div class="card elite-hrv"><div class="eyebrow">${ic('heart')} HRV · deload forțat azi</div>
    <div class="sm" style="margin-top:8px">HRV <b>${h.today} ms</b>, sub 90% din media ta pe 7 zile (<b>${h.avg7} ms</b>). Antrenamentul de azi are volum −40%.</div>
    ${UI.segments(Math.min(1,h.ratio||0),20,'rest','HRV față de medie')}</div>`; }

/* ---------- importul de sănătate: CSV din Garmin Connect sau Apple Health (prin export) ---------- */
function healthCard(){ const n=Object.keys(S.journal||{}).filter(k=>S.journal[k].hrv).length;
  return `<div class="card"><div class="eyebrow">${ic('heart')} HRV și somn · import</div>
    <div class="sm mu" style="margin-top:6px">Un fișier CSV cu dată, HRV și/sau somn: din Garmin Connect (Health Stats → HRV Status / Sleep → Export) sau din Apple Health (cu o aplicație de export ca Health Auto Export sau o scurtătură). Aplicațiile web nu pot citi direct Apple Health sau Garmin.</div>
    <label class="btn ghost wide" style="margin-top:10px;position:relative">${ic('file')} Alege fișierul CSV<input type="file" accept=".csv,text/csv" data-hcsv="1" style="position:absolute;inset:0;opacity:0;cursor:pointer" aria-label="Importă HRV și somn"></label>
    <div class="xs mu2" style="margin-top:6px">${n?n+' zile cu HRV notat. ':''}Valorile importate completează doar zilele fără HRV sau somn notat de tine.</div></div>`; }
document.addEventListener('change',async e=>{ const t=e.target; if(!t||!t.dataset||!t.dataset.hcsv||!t.files||!t.files[0]) return;
  try{ const pts=ELITE.parseHealthCsv(await t.files[0].text()); if(!pts.length){ toast('Nu am găsit date','Fișierul trebuie să aibă o coloană de dată și una de HRV sau somn.','info'); return; }
    const j=Object.assign({},S.journal); let n=0; pts.forEach(p=>{ const d=Object.assign({},j[p.date]||{}); let ch=false;
      if(p.hrv&&!d.hrv){ d.hrv=p.hrv; ch=true; } if(p.sleep&&!d.sleep){ d.sleep=p.sleep; ch=true; } if(ch){ j[p.date]=d; n++; } });
    await save('journal',j); STC=null; render(); toast('Import gata',n+' zile completate din '+pts.length+' găsite.','info');
  }catch(err){ toast('Importul nu a mers','Verifică fișierul CSV.','info'); } t.value=''; });

/* ---------- datele pentru mastery și analize ---------- */
const dayIntense=k=>(S.hist||[]).some(h=>h.date===k&&(+h.rpe||0)>=7)||(S.ext||[]).some(x=>x.date===k&&!x.dup&&(+x.rpe||0)>=7)||(S.runs||[]).some(r=>r.date===k&&r.kind==='thr');
function masteryNow(){
  const tk=todayKey(), last=n=>Array.from({length:n},(_,i)=>dayShift(tk,-i));
  const sleep=Object.keys(S.journal||{}).filter(k=>+S.journal[k].sleep>0).map(k=>({date:k,hours:+S.journal[k].sleep}));
  const cyc={}; (S.hist||[]).filter(h=>h.w===3).forEach(h=>{ (cyc[h.cyc]=cyc[h.cyc]||[]).push(h.date); });
  const deloadWeeks=Object.values(cyc).map(ds=>({respected:!ds.some(d=>(S.hist||[]).some(h=>h.date===d&&(+h.rpe||0)>=8)||(S.ext||[]).some(x=>x.date===d&&!x.dup&&(+x.rpe||0)>=8))}));
  const ignoredHrv=last(28).filter(k=>hrvAt(k).force&&dayIntense(k)).length;
  let run=0, longStreaks=0; last(60).reverse().forEach(k=>{ run=dayIntense(k)?run+1:0; if(run===8) longStreaks++; });
  const maxEfforts=(S.hist||[]).concat(S.ext||[]).filter(x=>x.date>=dayShift(tk,-27)&&+x.rpe===10).length;
  const trained=k=>Array.from({length:6},(_,i)=>dayShift(k,-1-i)).some(d=>dayLoad(d)>0);
  const restDaysHonored=last(56).filter(k=>parseKey(k).getDay()===0&&k<tk&&!dayIntense(k)&&trained(k)).length;
  return ELITE.mastery({sessions:[],targetsHit:0,sleep,deloadWeeks,ignoredHrv,longStreaks,maxEfforts,restDaysHonored}); }

/* ---------- Performanță → Mastery ---------- */
function eliteMastery(){ const m=masteryNow(), nm=ELITE.LEVEL_NAMES[m.level-1]||'', prev=[0,40,100,180,280,400,540,700,880,1080][m.level-1]||0;
  const badge=b=>`<div class="mx-b ${b.earned?'on':''}"><div class="mx-i">${ic(b.track==='tech'?'target':'moon')}</div><div class="sp"><b>${esc(b.name)}</b><span>${esc(b.desc)}</span>${UI.segments(b.progress,10,b.track==='tech'?'effort':'rest')}</div></div>`;
  return `<div class="card wide"><div class="eyebrow">${ic('award')} Nivel de competență</div>
    <div class="mx-l"><b>${m.level}</b><div class="sp"><div class="h2">${esc(nm)}</div><div class="sm mu">${m.points} puncte${m.next?' · următorul nivel la '+m.next:' · nivel maxim'}</div></div></div>
    ${UI.segments(m.next?(m.points-prev)/(m.next-prev):1,24,'effort','Progres spre nivelul următor')}
    <div class="note">Nivelul vine din recuperare și din disciplină, nu din volum. Ignorarea limitelor de siguranță scade puncte.</div></div>
  <div class="card wide"><div class="eyebrow">${ic('moon')} Recuperare</div>${m.badges.filter(b=>b.track==='rec').map(badge).join('')}</div>
  ${m.penalties.length?`<div class="card wide"><div class="eyebrow">${ic('alert')} Penalizări</div>${m.penalties.map(p=>`<div class="list-row"><span class="sp"><b>${esc(p.name)}</b><div class="xs mu">${esc(p.why)}</div></span><span class="v">−${p.points}</span></div>`).join('')}</div>`:''}`; }

/* ---------- Performanță → Analiză ---------- */
function eliteAnalytics(){
  const tk=todayKey(), days=Array.from({length:28},(_,i)=>dayShift(tk,-27+i));
  const rdi=ELITE.recoveryDebt(days.map(k=>{ const j=jOf(k), h=hrvAt(k); return {date:k,load:dayLoad(k),sleep:+j.sleep||undefined,hrvRatio:h.today&&h.avg7?h.today/h.avg7:undefined}; }));
  const sync=nutriOk()?ELITE.nutritionSync(days.slice(-14).filter(k=>mlogDay(k).length).map(k=>{ const t=targets(k), d=dayTotals(k);
    return {dayType:t.day.type,kcal:d.k,kcalT:t.kcal,c:d.c,cT:t.c,p:d.p,pT:t.p,water:waterOf(k),waterT:t.water}; })):null;
  const tile=(t,v,unit,f,tone,txt)=>`<div class="an-t"><div class="k">${t}</div><div class="v">${v==null?'—':v}<small>${v==null?'':unit}</small></div>${UI.segments(v==null?0:f,16,tone)}<div class="s">${txt}</div></div>`;
  return `<div class="card wide"><div class="eyebrow">${ic('activity')} Analiză · ultimele 4 săptămâni</div>
    <div class="an-g">
      ${tile('Datoria de recuperare',rdi.index,'/100',rdi.index/100,rdi.index>60?'bad':rdi.index>30?'warn':'ok',rdi.index>60?'Mare: o zi ușoară sau de odihnă ajută.':rdi.index>30?'Moderată: somnul contează azi.':'Mică: recuperarea ține pasul.')}
      ${tile('Sincronizare nutriție',sync,'/100',(sync||0)/100,'rest',sync==null?'Apare după 3 zile cu mese notate.':'Mâncarea urmează tipul fiecărei zile de antrenament.')}</div></div>`; }

/* ---------- Performanță → Squad (max 5, gist secret criptat) ---------- */
const SQ={cards:{},at:0,busy:false,err:null};
const sqTok=()=>(syCfg().tok||(S.squad&&S.squad.tok)||'');
async function sqSave(s){ await save('squad',s); }
function sqMyCard(){ const tk=todayKey(), m=mondayOf(tk), inW=d=>d>=m&&d<=tk, ks=(S.hist||[]).filter(h=>inW(h.date));
  const mins=ks.reduce((a,h)=>a+(+h.dur||0)/60,0);
  const sleepNights=Object.keys(S.journal||{}).filter(k=>inW(k)&&+S.journal[k].sleep>=7).length;
  const mobility=(S.tmlog||[]).filter(t=>inW(t.date)&&/^(mobility|stretch|breath)$/.test(t.kind||'')).length;
  return {v:1,name:S.squad.me.name,week:m,sessions:ks.length,minutes:Math.round(mins),sleepNights,mobility,level:masteryNow().level,updated:new Date().toISOString()}; }
async function sqRefresh(){ const s=S.squad; if(!s||SQ.busy) return; SQ.busy=true; SQ.err=null; render();
  try{ const rs=await Promise.all(s.members.map(m=>ELITE.squad.fetchCard(m.gist,s.pass).catch(()=>null))); s.members.forEach((m,i)=>{ if(rs[i]) SQ.cards[m.gist]=rs[i]; }); SQ.at=Date.now(); }
  catch(e){ SQ.err='Nu am putut citi squad-ul (internet sau limita GitHub).'; }
  SQ.busy=false; if(S.tab==='prog') render(); }
function eliteSquad(){ const s=S.squad;
  if(!s) return `<div class="card wide"><div class="eyebrow">${ic('user')} Squad privat · cel mult 5 oameni</div>
    <div class="sm mu" style="margin-top:6px">Progresul se împarte asincron: fiecare își publică rezumatul săptămânii, criptat cu parola squad-ului, într-un gist secret pe GitHub. Doar membrii îl pot citi.</div>
    <div class="form"><div class="fld full"><label for="sqMe">Numele tău în squad</label><input class="inp" id="sqMe" maxlength="24" placeholder="ex: Andrei"></div>
      <div class="fld full"><label for="sqName">Numele squad-ului (pentru unul nou)</label><input class="inp" id="sqName" maxlength="40" placeholder="ex: Sala de la 7"></div></div>
    <button class="btn pri wide" style="margin-top:10px" data-a="sqCreate">${ic('plus')} Creează squad</button>
    <div class="form"><div class="fld full"><label for="sqCode">Sau intră cu un cod de invitație</label><input class="inp" id="sqCode" placeholder="FALCO1.…"></div></div>
    <button class="btn wide" style="margin-top:8px" data-a="sqJoin">${ic('check')} Intră în squad</button></div>`;
  const tk=todayKey(), m=mondayOf(tk), ch=ELITE.squad.weekChallenge(m), mine=sqMyCard(), cards=[mine].concat(s.members.map(x=>SQ.cards[x.gist]).filter(c=>c&&c.week===m));
  const pr=ELITE.squad.challengeProgress(ch,cards,s.members.length+1), rit=ELITE.ritualState(s.ritual);
  const row=(c,name,me)=>`<div class="sq-r"><b>${esc(name)}${me?' (tu)':''}</b><span>${c?`${c.sessions} sesiuni · ${c.minutes} min · nivel ${c.level}`:'încă nimic publicat săptămâna asta'}</span></div>`;
  return `<div class="card wide"><div class="row"><div class="eyebrow sp">${ic('user')} ${esc(s.name)} · ${s.members.length+1}/5</div>
      <button class="btn ghost sm" data-a="sqRefresh" ${SQ.busy?'disabled':''}>${ic('refresh')} ${SQ.busy?'Citesc…':'Actualizează'}</button></div>
    ${row(mine,mine.name,true)}${s.members.map(x=>{ const c=SQ.cards[x.gist]; return row(c&&c.week===m?c:null,x.name,false); }).join('')}
    ${SQ.err?`<div class="err">${ic('alert')}<span>${esc(SQ.err)}</span></div>`:''}</div>
  <div class="card wide"><div class="eyebrow">${ic('flag')} Provocarea echipei · ${esc(ch.name)}</div><div class="sm mu" style="margin-top:6px">${esc(ch.desc)}</div>
    ${UI.segments(pr.done/pr.goal,20,pr.done>=pr.goal?'ok':'effort',ch.name)}<div class="xs mu" style="margin-top:6px">${pr.done} / ${pr.goal}${pr.done>=pr.goal?' · gata, împreună':''}</div></div>
  <div class="card wide"><div class="eyebrow">${ic('sound')} Ritualul săptămânal · ${DAYN[s.ritual.day]} ${pad(s.ritual.hour)}:${pad(s.ritual.minute)}</div>
    <div class="sm mu" style="margin-top:6px">12 minute ghidate cu vocea, pornite la aceeași oră pentru tot squad-ul. Cine intră mai târziu aude același pas ca ceilalți.</div>
    <div class="set-row"><span class="sp"><b>Particip</b></span><button class="sw ${s.ritual.on?'on':''}" data-a="sqRitOn" role="switch" aria-checked="${s.ritual.on}" aria-label="Particip la ritual"></button></div>
    ${s.ritual.on?`<div class="inrow"><select class="inp" id="sqRitDay" aria-label="Ziua">${DAYN.map((n,i)=>`<option value="${i}" ${i===s.ritual.day?'selected':''}>${n}</option>`).join('')}</select><input class="inp" id="sqRitTime" type="time" value="${pad(s.ritual.hour)}:${pad(s.ritual.minute)}" aria-label="Ora"><button class="btn" data-a="sqRitSet">${ic('check')}</button></div>
      <button class="btn ${rit.live?'pri':''} xl wide" style="margin-top:10px" data-a="sqRitGo" ${rit.live?'':'disabled'}>${ic('play')} ${rit.live?'Intră în ritual · a început':'Începe în '+fmtDur(rit.startsInSec)}</button>`:''}</div>
  <div class="card wide"><div class="eyebrow">${ic('link')} Invitații și publicare</div>
    <div class="sm mu" style="margin-top:6px">Publică-ți rezumatul (cu un token GitHub cu dreptul „gist"), apoi dă-le celorlalți codul tău; tu adaugi codurile lor.</div>
    ${syCfg().tok?'':`<div class="fld" style="margin-top:8px"><label for="sqTok">Token GitHub (gist), dacă nu ai sincronizarea pornită</label><input class="inp" id="sqTok" type="password" autocomplete="off" value="${esc(s.tok||'')}"></div>`}
    <button class="btn pri wide" style="margin-top:8px" data-a="sqPublish">${ic('upload')} Publică săptămâna mea</button>
    <div class="inrow" style="margin-top:8px"><button class="btn ghost" style="flex:1" data-a="sqCopy" data-k="invite">${ic('copy')} Codul squad-ului</button><button class="btn ghost" style="flex:1" data-a="sqCopy" data-k="me" ${s.me.gist?'':'disabled'}>${ic('copy')} Codul meu</button></div>
    <div class="inrow" style="margin-top:8px"><input class="inp" id="sqMember" placeholder="Codul unui membru: FALCOM1.…"><button class="btn" data-a="sqAdd">${ic('plus')}</button></div>
    <button class="linkb" style="margin-top:10px" data-a="sqLeave" data-confirm="Sigur? Apasă iar">${ic('trash')} Ieși din squad</button></div>`; }
function fmtDur(s){ const d=Math.floor(s/86400), h=Math.floor(s%86400/3600), m=Math.floor(s%3600/60); return d?d+' z '+h+' h':h?h+' h '+m+' min':m+' min'; }
ACT.sqCreate=async()=>{ const me=($('#sqMe').value||'').trim(), n=($('#sqName').value||'').trim(); if(!me) return shake('#sqMe'); if(!n) return shake('#sqName');
  await sqSave(ELITE.squad.createSquad(n,me)); render(); toast('Squad creat','Publică-ți săptămâna, apoi trimite codul squad-ului.','info'); };
ACT.sqJoin=async()=>{ const me=($('#sqMe').value||'').trim(); if(!me) return shake('#sqMe'); const s=ELITE.squad.joinSquad($('#sqCode').value||'',me); if(!s) return shake('#sqCode');
  await sqSave(s); render(); sqRefresh(); toast('Ai intrat în '+s.name,'Publică-ți săptămâna și trimite-le codul tău.','info'); };
ACT.sqAdd=async()=>{ const r=ELITE.squad.addMember(S.squad,$('#sqMember').value||''); if(!r.ok){ toast('Nu am adăugat',r.reason,'info'); return; } await sqSave(r.squad); render(); sqRefresh(); };
ACT.sqRefresh=()=>sqRefresh();
ACT.sqPublish=async()=>{ const s=Object.assign({},S.squad), ti=$('#sqTok'); if(ti&&ti.value.trim()) s.tok=ti.value.trim(); const tok=syCfg().tok||s.tok; if(!tok){ shake('#sqTok'); return; }
  try{ const id=await ELITE.squad.publish(tok,s,sqMyCard()); s.me=Object.assign({},s.me,{gist:id}); await sqSave(s); render(); toast('Publicat','Rezumatul săptămânii tale e criptat în gist.','info'); }
  catch(e){ toast('Publicarea nu a mers','Verifică tokenul (dreptul „gist") și internetul.','info'); } };
ACT.sqCopy=async(el,{k})=>{ const s=S.squad; const c=k==='me'?ELITE.squad.memberCode(s):ELITE.squad.inviteCode(s);
  try{ await navigator.clipboard.writeText(c); toast('Copiat',k==='me'?'Codul tău, pentru ceilalți membri.':'Codul squad-ului (conține parola: trimite-l doar membrilor).','info'); }catch(e){ prompt('Copiază codul:',c); } };
ACT.sqLeave=async()=>{ await save('squad',null); SQ.cards={}; render(); };
ACT.sqRitOn=async()=>{ const s=Object.assign({},S.squad); s.ritual=Object.assign({},s.ritual,{on:!s.ritual.on}); await sqSave(s); render(); };
ACT.sqRitSet=async()=>{ const s=Object.assign({},S.squad), d=+$('#sqRitDay').value, t=($('#sqRitTime').value||'10:00').split(':').map(Number);
  s.ritual=Object.assign({},s.ritual,{day:clamp(d,0,6),hour:clamp(t[0]||0,0,23),minute:clamp(t[1]||0,0,59)}); await sqSave(s); render(); toast('Ritual salvat','Toți membrii trebuie să aibă aceeași oră: trimite din nou codul squad-ului.','info'); };
ACT.sqRitGo=()=>{ const s=S.squad; if(!s) return; const st=ELITE.ritualState(s.ritual); if(!st.live) return;
  const steps=ELITE.stepsFrom(st.offsetSec); tmOpen({title:'Ritualul · '+s.name,kind:'ritual',ph:steps.map(x=>({k:x.k,d:x.d,l:x.l,s:x.s}))}); tmGo(); };
function ritualCard(){ const s=S.squad; if(!s||!s.ritual.on) return ''; const st=ELITE.ritualState(s.ritual); if(!st.live&&st.startsInSec>1800) return '';
  return `<div class="card link" data-a="${st.live?'sqRitGo':'sqOpen'}"><div class="eyebrow">${ic('sound')} Ritualul squad-ului ${st.live?'a început':'începe în '+fmtDur(st.startsInSec)}</div><div class="sm mu" style="margin-top:6px">${esc(s.name)} · 12 minute, toți în același timp.</div></div>`; }

/* ---------- vocea dinamică și semnalele fără cuvinte (în cronometru) ---------- */
const VOXCTX={rate:1,detune:0};
function voxStyleFor(st,ph,left){ const P=st&&st.kb&&st.kb.plan, fb=P?Object.values(P.fb).pop():null;
  Object.assign(VOXCTX,ph?ELITE.voiceStyle({phase:ph.phase,kind:ph.k,intensity:ph.int,feel:fb&&fb.feel,left}):{rate:1,detune:0}); }
function cuesFor(st){ if(!S.cues||!st||!st.started||st.pAt||st.done) return; const ph=st.ph[st.i]; if(!ph||ph.d==null) return;
  if(!(st.kb&&st.kb.plan)&&st.kind!=='ritual') return;
  const left=ph.d-tmEl(), el=ph.d-left; schedule('cue',ELITE.nonVerbalCues({kind:ph.k,phase:ph.phase,label:ph.l,durationSec:ph.d}).map(c=>[c[0]-el,c[1],c[2],c[3]]).filter(c=>c[0]>-.05)); }
ACT.sqOpen=()=>{ S.tab='prog'; S.progTab='sq'; render(); };
