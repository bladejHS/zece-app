/* =====================================================================
   v10 · KICKBOXING — filă separată: sac, palmare, sparring (plus shadowboxing ca unealtă).
   Cronometru de runde cu clopot și bătăi la 10 secunde, strigătorul de combinații (v11: pornit la sac, palmare și sparring,
   ritm Lent / Mediu / Rapid, așteaptă să termine vocea înainte de următoarea combinație, încurajări), temă pe rundă,
   ținte ocazionale (stau doar în pagina activității, nu în antrenamentul zilei), istoric și unelte.
   Sesiunile stau în zece3:ext (tip „Kickboxing", src:'manual', detaliile în .kb), deci intră în încărcarea zilei,
   cronologie, export, sincronizare și, dacă vrei, pe Strava. Țintele, preferințele și geanta stau în zece3:kb.
   ===================================================================== */
K.kb='zece3:kb'; S.kb={}; S.kbTab='train';
/* pozele filei (operatorul SRI): build.js pune aici fotografiile, build_site.js le face fișiere */
const KB_PH={"bag":"kb-bag.jpg","band":"kb-band.jpg","pads":"kb-pads.jpg","spar":"kb-spar.jpg","wraps":"kb-wraps.jpg"};
Object.keys(KB_PH).forEach(k=>{ try{ document.documentElement.style.setProperty('--kb-'+k,cssUrl(KB_PH[k])); }catch(e){} });
const kbPh=k=>`var(--kb-${k},var(--cover))`;

Object.assign(IC,{
  glove:'<path d="M7 11V7.5A4.5 4.5 0 0 1 11.5 3H14a5 5 0 0 1 5 5v4.5a4 4 0 0 1-2 3.46V19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3"/><path d="M7 11a2.5 2.5 0 0 0 0 5h3.5"/><path d="M9 18h8"/>',
  bag:'<path d="M9 2l3 3.5L15 2"/><rect x="7" y="6" width="10" height="16" rx="4"/><path d="M7 11h10M7 17h10"/>',
  pads:'<ellipse cx="12" cy="10" rx="6.5" ry="7.5"/><circle cx="12" cy="10" r="2.6"/><path d="M9.5 17.2L8.5 21h7l-1-3.8"/>',
  spar:'<path d="M2.5 9.5A3.5 3.5 0 0 1 6 6h3.5l3 3v2.5l-3 3H6a3.5 3.5 0 0 1-3.5-3.5z"/><path d="M21.5 14.5A3.5 3.5 0 0 1 18 18h-3.5l-3-3v-2.5l3-3H18a3.5 3.5 0 0 1 3.5 3.5z"/>',
  wrap:'<path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3z"/><path d="M6 9l12-3M6 14l12-3M6 19l12-3"/>'
});
/* Kickboxing ca activitate: apare corect în „Activități", cronologie și pe Strava (unde pleacă drept antrenament) */
ACT_T.splice(ACT_T.length-1,0,['Kickboxing','Kickboxing','glove',0]); ST_TYPES.Kickboxing='Kickboxing'; ACT_UP.Kickboxing='Workout';

/* ---------- activitățile: [nume, eticheta mică, iconiță, poză, descriere, strigă combinații, formate [nume, runde, sec/rundă, pauză]] ---------- */
const KB_A={
  bag:{n:'Sac',t:'Heavy bag',ic:'bag',ph:'bag',sh:'Putere, volum și condiție',s:'Putere, volum și condiție, pe runde. Lucrezi singur, în ritmul tău.',call:1,
    fmt:[['Clasic',5,180,60],['Putere',6,120,60],['Volum',8,180,60],['Sprinturi',10,30,30]],
    foc:['Putere: fiecare lovitură cu intenție','Viteză: lovituri scurte, revenire rapidă','Lovituri de picior: low și middle kick','Combinații de 4, apoi ieși din linie','Mișcare: lucrezi din unghiuri, nu pe loc','Lucru la corp și la cap, schimbă nivelul'],
    tips:['Bandajează mâinile de fiecare dată: încheieturile și articulațiile degetelor cedează primele la sac.','Lovește prin sac, nu doar în el, și revino în gardă după fiecare combinație.','Mișcă-te în jurul sacului: unghiuri, nu doar lovituri pe loc.','Expiră scurt la fiecare lovitură, pe nas sau printre dinți.']},
  pads:{n:'Palmare',t:'Pad work',ic:'pads',ph:'pads',sh:'Precizie, viteză, combinații',s:'Precizie, viteză și combinații, cu un partener care ține palmarele.',call:1,
    fmt:[['Tehnic',4,180,60],['Combinații',6,120,60],['Ritm de meci',3,180,60]],
    foc:['Viteză: lovituri scurte și rapide','Putere: fiecare lovitură cu intenție','Revenire în gardă după fiecare combinație','Combinații terminate cu lovitură de picior','Apărare: partenerul atacă, tu răspunzi','Combinații lungi, de 5–6 lovituri'],
    tips:['Cu strigătorul pornit, combinațiile le aude și partenerul: el ține palmarele unde trebuie, tu lovești. Fără strigător, combinațiile vin de la el.','Lovește la înălțimea la care e ținut palmarul, fără să forțezi umărul.','După fiecare combinație: gardă sus, un pas, gata de următoarea.']},
  spar:{n:'Sparring',t:'Sparring',ic:'spar',ph:'spar',sh:'Tehnică pe un adversar viu',s:'Tehnica aplicată pe un adversar viu. Control, nu bătaie.',foc1:1,call:1,lvl:1,
    fmt:[['Tehnic ușor',3,120,60],['Amator',3,180,60],['Pro',5,180,60]],
    foc:['Jab-ul primul: deschizi fiecare atac cu el','Lucru la corp: coboară nivelul','Contre: răspunzi după fiecare lovitură primită','Mișcare: unghiuri, nu sta în linie','Low kick după combinație','Garda sus: mâna din spate la bărbie','Teep pentru distanță','Ritm: schimbi viteza, nu doar puterea','Apărare: blochezi sau eschivezi, apoi răspunzi'],
    tips:['Echipament obligatoriu: mănuși 14–16 oz, apărătoare de dinți, tibiere, cască și cochilie.','Sparring-ul nu e meci: puterea se stabilește dinainte (de obicei 30–50%) și rămâne așa.','Fără sparring cu durere de cap, amețeală sau după o lovitură puternică la cap: pauză și medic.','O singură temă pe rundă: e mai ușor de ținut minte și de corectat.']},
  shadow:{n:'Shadowboxing',t:'Shadow',ic:'glove',ph:'band',sh:'Încălzire și tehnică',s:'Încălzire și tehnică fără partener. Strigătorul îți dă combinațiile.',call:1,
    fmt:[['Încălzire',2,120,30],['Tehnică',3,180,60],['Lung',5,180,45]],
    foc:['Doar jab și mișcare','Combinații de 3','Lovituri de picior, lejer','Apărare: eschivă și răspuns','Viteză maximă, tehnică curată'],
    tips:['În fața unei oglinzi, ca să-ți vezi garda.','Lovituri complete, la viteză controlată: tehnica înainte de putere.']}
};
const KB_MAIN=['bag','pads','spar'];
const KB_LVL=['','Ușor','Mediu','Greu'];

/* ---------- ținte ocazionale: [id, activitate, titlu, descriere, tip ('ok' = reușit / nu încă, 'n' = număr), țintă, unitate, cronometru [runde, sec/rundă, pauză]] ---------- */
const KB_TG=[
  ['bag6','bag','6 runde × 3 min la ritm constant','Pauză 1 min. Ultima rundă la fel de vie ca prima: fără să te sprijini de sac și fără pauze lungi în rundă.','ok',0,'',[6,180,60]],
  ['bag100','bag','100 de lovituri în 60 de secunde','Doar 1-2 (jab, cross) continuu, cu pumnul strâns la impact și brațul care revine în gardă. Numără perechile: 50 de 1-2.','n',100,'lovituri',[1,60,0]],
  ['baglk','bag','50 de low kick-uri pe fiecare picior','Câte o rundă de 3 minute pe picior, cu rotație din șold și revenire în gardă după fiecare lovitură.','ok',0,'',[2,180,60]],
  ['bag3m','bag','3 minute fără oprire, doar combinații de 4','Nicio pauză mai lungă de 2 secunde. Fiecare combinație se termină cu revenirea în gardă sau cu un pas lateral.','ok',0,'',[1,180,0]],
  ['bagtab','bag','Tabata la sac: 8 × 20 de secunde','20 de secunde la maxim, 10 secunde pauză. Ritmul din ultima rundă cât mai aproape de cel din prima.','ok',0,'',[8,20,10]],
  ['bag10','bag','10 runde × 2 min','Testul de anduranță: ritm de antrenament, pauză 1 min, tehnică curată până la capăt.','ok',0,'',[10,120,60]],
  ['padcl','pads','10 combinații 1-2-3-2 curate, la rând','Jab, cross, croșeu, cross. Dacă una iese neclară sau scade garda, numărătoarea pornește de la zero.','ok',0,'',[1,180,0]],
  ['pad6','pads','Combinația de 6 × 10 pe fiecare parte','Jab, cross, croșeu, cross, low kick, high kick, cu echilibru la final, fără să cazi după lovitura de picior.','ok',0,'',[2,180,60]],
  ['padrx','pads','20 de contre într-o rundă','Partenerul atacă ușor cu palmarul; blochezi sau eschivezi și răspunzi imediat cu 1-2. Numără răspunsurile corecte.','n',20,'contre',[1,180,0]],
  ['padfp','pads','3 runde × 3 min la ritm de meci','Partenerul strigă combinațiile, tu nu te oprești. Pauză 1 min. Garda revine după fiecare combinație.','ok',0,'',[3,180,60]],
  ['padtp','pads','20 de teep-uri pe fiecare picior','Lovitura frontală de distanță: împingi cu talpa prin palmar și revii în gardă fără să-ți pierzi echilibrul.','ok',0,'',[2,120,45]],
  ['padsp','pads','30 de lovituri în 15 secunde','Viteză pură: 1-2 scurte și rapide la palmare. Partenerul numără.','n',30,'lovituri',[1,15,0]],
  ['sp3','spar','3 runde × 2 min cu garda sus','Sparring tehnic, la 30–50% putere. Partenerul sau antrenorul îți spune la final dacă garda a rămas sus.','ok',0,'',[3,120,60]],
  ['spjab','spar','O rundă cu jab-ul primul','Deschizi fiecare atac cu jab-ul, o rundă întreagă de 3 minute.','ok',0,'',[1,180,0]],
  ['spctr','spar','Răspuns la fiecare lovitură primită','O rundă în care, după fiecare lovitură primită, răspunzi imediat cu o combinație de cel puțin 2 lovituri.','ok',0,'',[1,180,0]],
  ['spring','spar','O rundă fără să rămâi la corzi','Mișcare laterală și unghiuri: dacă ajungi la corzi sau în colț, ieși în cel mult 2 secunde.','ok',0,'',[1,180,0]],
  ['spbody','spar','10 lovituri la corp într-o rundă','Jab sau croșeu la corp, middle kick: coboară nivelul înainte de lovitură, nu doar brațul.','n',10,'lovituri',[1,180,0]],
  ['sp5','spar','5 runde × 3 min','Condiție de meci: sparring controlat cu pauză 1 min, fără să-ți pierzi forma în ultimele două runde.','ok',0,'',[5,180,60]]
];
const kbTgOf=id=>KB_TG.find(t=>t[0]===id)||null;
const kbTgSt=id=>((S.kb||{}).tg||{})[id]||{};
const kbTgDone=a=>KB_TG.filter(t=>(!a||t[1]===a)&&kbTgSt(t[0]).ok).length;
const kbTgN=a=>KB_TG.filter(t=>!a||t[1]===a).length;

/* ---------- combinațiile: sistemul cu cifre (1 jab, 2 cross, 3 croșeu, 4 croșeu dreapta, 5 uppercut, 6 uppercut dreapta) ---------- */
const KB_P={1:'jab',2:'cross',3:'croșeu',4:'croșeu dreapta',5:'uppercut',6:'uppercut dreapta'};
const KB_NUMV=['','unu','doi','trei','patru','cinci','șase'];
const KB_CMB={1:['1','1-1','1-2','1-2-1','2-3','1-6','1-1-2','3-2'],
  2:['1-2-3','1-2-3-2','1-6-3-2','2-3-2','1-1-2-3','3-2-3','1-2-5-2','1-2-3-4'],
  3:['1-2-3-2-3','1-6-3-2-1','1-2-1-2-3-2','2-3-2-5-2','1-2-3-4-5-6','1-1-2-3-6','5-2-3-2','1-2-5-6-3-2']};
const KB_KCK={1:['low kick','teep','1-2, low kick','1, middle kick'],
  2:['1-2-3, low kick','2-3, middle kick','teep, 1-2','1-2, high kick','low kick, 2-3','genunchi, 2'],
  3:['1-2-3-2, low kick','1-6-3, high kick','teep, 1-2-3, middle kick','low kick, 2-3, high kick','eschivă, 2-3, low kick','blochează, 3-2, middle kick']};
const KB_DEF=['eschivă, 2-3','blochează, 1-2','pas înapoi, 2','eschivă, 3-2'];
const kbNums=p=>/^[1-6](-[1-6])*$/.test(p);
function kbFmtC(c){ const parts=String(c).split(', ');
  return {c,big:parts.join(' · '),names:parts.map(p=>kbNums(p)?p.split('-').map(n=>KB_P[n]).join(' · '):p).join(' · '),
    voice:parts.map(p=>kbNums(p)?p.split('-').map(n=>KB_NUMV[n]).join(', '):p).join(', ')}; }
function kbCombo(lvl,kicks,last){ const pool=kbPool(lvl,kicks);
  let c=pool[Math.floor(Math.random()*pool.length)]; if(c===last&&pool.length>1) c=pool[(pool.indexOf(c)+1)%pool.length]; return kbFmtC(c); }
const kbPool=(lvl,kicks)=>{ lvl=clamp(+lvl||2,1,3); return KB_CMB[lvl].concat(kicks?KB_KCK[lvl]:[],lvl>=2?KB_DEF:[]); };
/* ritmul strigătorului: pauza după ce vocea termină combinația (secunde, min–max) */
const KB_TEMPO={slow:[5.5,7.5],mid:[3.5,5],fast:[2,3]};
const KB_TEMPO_L=[['slow','Lent','cam la 9 secunde'],['mid','Mediu','cam la 6 secunde'],['fast','Rapid','cam la 4 secunde']];
const KB_LIB=[['1-2','Jab, cross','Combinația de bază: jab-ul măsoară distanța, cross-ul lovește.'],
  ['1-2-3','Jab, cross, croșeu','Croșeul din față vine după cross, cu rotația șoldului.'],
  ['1-2-3-2','Jab, cross, croșeu, cross','Combinația de 4 clasică, se termină pe mâna din spate.'],
  ['1-6-3-2','Jab, uppercut dreapta, croșeu, cross','Schimbi nivelul: uppercut-ul deschide garda pentru croșeu.'],
  ['1-2, low kick','Jab, cross, low kick','„Combinația olandeză": mâinile ridică garda adversarului, low kick-ul lovește coapsa.'],
  ['1-2-3, low kick','Jab, cross, croșeu, low kick','Croșeul te așază pe piciorul din față; low kick-ul vine cu piciorul din spate.'],
  ['teep, 1-2','Teep, jab, cross','Teep-ul ține distanța sau oprește atacul, apoi intri cu 1-2.'],
  ['2-3, middle kick','Cross, croșeu, middle kick','Middle kick la corp, după ce mâinile au tras garda în sus.'],
  ['eschivă, 2-3','Eschivă, cross, croșeu','Contră: ieși din linia loviturii și răspunzi imediat.'],
  ['1-2, high kick','Jab, cross, high kick','High kick-ul pe partea pe care garda a coborât.']];
const KB_GEAR=['Mănuși (14–16 oz pentru sparring)','Bandaje','Apărătoare de dinți','Tibiere','Cască','Cochilie','Coardă','Prosop și apă','Șlapi pentru vestiar'];
const KB_WRAP=[['Bucla pe degetul mare','Prinzi bucla pe degetul mare, cu banda pe dosul palmei.'],['3 ture pe încheietură','Sprijin pentru încheietură, fără să strângi ca un garou.'],
  ['3 ture peste articulațiile degetelor','Cu palma deschisă și degetele depărtate, ca să nu strângă când faci pumn.'],['Printre degete','Treci banda în X printre fiecare deget, pe rând.'],
  ['Încă 2 ture peste articulații','Apoi în X pe dosul palmei, până la încheietură.'],['Închide pe încheietură','Prinzi scaiul și strângi pumnul: trebuie să fie ferm, fără să-ți amorțească degetele.']];
const KB_WARM=[['Coardă sau sărituri pe loc',180,'Ritm ușor, pe vârfuri'],['Rotații: gât, umeri, șolduri, glezne',60,'Lent, pe toată amplitudinea'],
  ['Shadow ușor',90,'Doar jab și mișcare'],['Shadow cu lovituri de picior',90,'Lejer, înalțimea crește treptat'],['Genuflexiuni și flotări ușoare',60,'Câte 10, fără grabă']];

/* ---------- preferințele fiecărei activități (formatul, combinațiile, tema pe rundă) ---------- */
function kbPref(a){ const A=KB_A[a]||KB_A.bag, f=A.fmt[0];
  return Object.assign({r:f[1],rs:f[2],rest:f[3],cl:!!A.call,lvl:A.lvl||2,tempo:'slow',kicks:true,foc:!!A.foc1},(((S.kb||{}).pref)||{})[a]||{}); }
async function kbPrefSet(a,o){ const pref=Object.assign({},(S.kb||{}).pref); pref[a]=Object.assign({},kbPref(a),o); await save('kb',Object.assign({},S.kb,{pref})); }

/* ---------- sesiunile (din zece3:ext): cele notate aici, plus cele venite din Strava cu nume de kickboxing ---------- */
const KB_RX=/kick|box|sparr|thai|mma|palmar|\bsac\b|shadow/i;
const kbGuess=x=>x.kb&&KB_A[x.kb.a]?x.kb.a:/sparr/i.test(x.name||'')?'spar':/palmar|pad/i.test(x.name||'')?'pads':/\bsac\b|bag/i.test(x.name||'')?'bag':/shadow/i.test(x.name||'')?'shadow':'';
function kbSessions(){ return (S.ext||[]).filter(x=>!x.dup&&(x.type==='Kickboxing'||(x.src!=='manual'&&KB_RX.test(x.name||''))))
  .map(x=>({x,a:kbGuess(x)})).sort((p,q)=>(q.x.start||0)-(p.x.start||0)||(q.x.date<p.x.date?-1:1)); }
const kbAName=a=>KB_A[a]?KB_A[a].n:'Kickboxing';
const kbRounds=x=>x.kb&&+x.kb.r>0?+x.kb.r:0;
function kbAgg(from,to){ const xs=kbSessions().filter(s=>s.x.date>=from&&s.x.date<=to), by={};
  xs.forEach(s=>{ by[s.a||'']=(by[s.a||'']||0)+1; });
  return {n:xs.length,r:xs.reduce((t,s)=>t+kbRounds(s.x),0),min:xs.reduce((t,s)=>t+(+s.x.min||0),0),by}; }
function kbRowMeta(x){ const k=x.kb||{}, rpe=x.rpe?((ACT_RPE.find(r=>r[0]===x.rpe)||[0,''])[1]||'').toLowerCase():'';
  return [k.r?k.r+(k.r===1?' rundă':' runde')+(k.rs?' × '+fmtClock(k.rs):''):'',num(x.min,0)+' min',x.hr?x.hr+' bpm':'',rpe].filter(Boolean).join(' · '); }

/* ---------- banda de sus ---------- */
BANDS.kb=()=>{ const tk=todayKey(), o=kbAgg(dayShift(tk,-29),tk), t=kbTgDone();
  return {e:'Sac · Palmare · Sparring',t:'Kickboxing',s:[o.n?o.n+(o.n===1?' sesiune':' sesiuni')+' în 30 de zile':'Nicio sesiune în ultimele 30 de zile',o.r?o.r+' runde':'',t?'ținte '+t+'/'+KB_TG.length:''].filter(Boolean).join(' · ')}; };

/* ---------- fila ---------- */
const KB_TABS=[['train','Antrenează','glove'],['hist','Istoric','history']];
function viewKb(){
  const T=S.kbTab==='hist'?'hist':'train';
  return `<div class="seg scr" style="margin-top:6px">${KB_TABS.map(t=>`<button class="${T===t[0]?'on':''}" data-a="kbTab" data-k="${t[0]}">${ic(t[2])} ${t[1]}</button>`).join('')}</div>${T==='hist'?kbHist():kbTrain()}`;
}
ACT.kbTab=(el,{k})=>{ S.kbTab=k; render(); window.scrollTo({top:0}); };
function kbCard(a){ const A=KB_A[a], last=kbSessions().find(s=>s.a===a), p=kbPref(a), d=kbTgDone(a), n=kbTgN(a);
  return `<button class="kb-card" data-a="kbOpen" data-k="${a}" style="--ph:${kbPh(A.ph)}" aria-label="${esc(A.n)}">
    <span class="kb-ph" aria-hidden="true"></span><span class="kb-fd" aria-hidden="true"></span>
    <span class="kb-tgc">${ic('target')} ${d}/${n}</span>
    <span class="kb-ct"><span class="eyebrow">${esc(A.t)}</span><span class="kb-t">${esc(A.n)}</span>
      <span class="kb-s">${last?'Ultima: '+relDay(last.x.date)+(kbRounds(last.x)?' · '+kbRounds(last.x)+' runde':''):esc(A.sh)}</span>
      <span class="kb-go">${ic('play')} ${p.r} × ${fmtClock(p.rs)}${p.rest?' · pauză '+fmtClock(p.rest):''}</span></span></button>`; }
const KB_TOOLS=[['kbRounds','clock','Cronometru de runde','Clopot, bătăi la 10 s'],['kbShadow','sound','Strigător de combinații','Shadowboxing ghidat'],['kbWarm','flame','Încălzire','8 minute, ghidat'],
  ['kbLib','list','Combinații','Cifrele și clasicele'],['kbWrap','wrap','Bandaje','Pas cu pas'],['kbGear','check','Geanta','Ce iei la sală']];
function kbTrain(){
  const tk=todayKey(), wk=kbAgg(mondayOf(tk),tk);
  return `<div class="kb-acts">${KB_MAIN.map(kbCard).join('')}</div>
  <div class="card kb-wk"><div class="row"><div class="sp"><div class="eyebrow">${ic('glove')} Săptămâna asta</div>
      <div class="kb-wk-n">${wk.n?`<b>${wk.n}</b> ${wk.n===1?'sesiune':'sesiuni'}${wk.r?` · <b>${wk.r}</b> runde`:''} · <b>${num(wk.min,0)}</b> min`:'Nimic încă. Alege o activitate de mai sus.'}</div></div>
    <button class="btn ghost sm" data-a="kbLog" data-k="">${ic('edit')} Notează</button></div>
    <div class="xs mu2" style="margin-top:8px">Kickboxing-ul e în afara planului Hybrid365: intră în încărcarea zilei, dar nu schimbă antrenamentele planului.</div></div>
  <div class="card"><div class="eyebrow">${ic('tool')} Unelte</div><div class="kb-tools">${KB_TOOLS.map(([k,icn,t,s])=>`<button class="kb-tool" data-a="${k}"><span class="ic-s">${ic(icn)}</span><b>${esc(t)}</b><span>${esc(s)}</span></button>`).join('')}</div></div>`;
}
/* istoric: rezumat pe 4 săptămâni, runde pe săptămână (8 săptămâni), țintele atinse și sesiunile pe luni */
function kbHist(){
  const tk=todayKey(), all=kbSessions(), o=kbAgg(dayShift(tk,-27),tk);
  if(!all.length) return `<div class="card"><div class="empty">${ic('glove')}<div>Aici apar sesiunile de sac, palmare și sparring. Le notezi după cronometru sau de mână, iar cele din Strava cu „box" sau „kickboxing" în nume apar singure.</div>
    <button class="btn pri sm" data-a="kbLog" data-k="bag">${ic('plus')} Notează prima sesiune</button></div></div>`;
  const m0=mondayOf(tk), wks=Array.from({length:8},(_,i)=>{ const a=dayShift(m0,-7*(7-i)), b=dayShift(a,6), g=kbAgg(a,b); return {a,r:g.r,n:g.n}; }), mx=Math.max(1,...wks.map(w=>w.r||w.n));
  const by={}; all.forEach(s=>{ const m=s.x.date.slice(0,7); (by[m]=by[m]||[]).push(s); }); const ks=Object.keys(by).sort().reverse(), shown=ks.slice(0,S.kbN||3);
  const done=KB_TG.filter(t=>kbTgSt(t[0]).ok).sort((p,q)=>kbTgSt(q[0]).ok<kbTgSt(p[0]).ok?-1:1);
  return `<div class="card"><div class="eyebrow">${ic('chart')} Ultimele 4 săptămâni</div>
    <div class="kpis"><div class="kpi"><div class="k">Sesiuni</div><div class="v">${o.n}</div></div><div class="kpi"><div class="k">Runde</div><div class="v">${o.r}</div></div><div class="kpi"><div class="k">Timp</div><div class="v">${num(o.min/60,1)}<small>h</small></div></div></div>
    <div class="kb-mix">${KB_MAIN.concat(['shadow']).filter(a=>o.by[a]).map(a=>`<span class="tag">${ic(KB_A[a].ic)} ${KB_A[a].n} ${o.by[a]}</span>`).join('')||'<span class="xs mu2">Nimic în ultimele 4 săptămâni.</span>'}</div>
    <div class="kb-bars" aria-label="Runde pe săptămână">${wks.map((w,i)=>`<div class="kb-bar ${i===7?'cur':''}"><i style="height:${Math.round((w.r||w.n)/mx*100)}%"></i><span>${w.r||w.n||''}</span></div>`).join('')}</div>
    <div class="xs mu2" style="margin-top:6px">Runde pe săptămână, ultimele 8 săptămâni (unde nu sunt runde notate, numărul de sesiuni).</div></div>
  <div class="card"><div class="card-h"><div class="eyebrow">${ic('target')} Ținte atinse</div><span class="xs mu">${done.length} din ${KB_TG.length}</span></div>
    ${done.length?done.map(t=>`<button class="list-row link hl" data-a="kbTgOpen" data-k="${t[0]}"><span class="ic-s ok">${ic('check')}</span><span class="sp"><b>${esc(t[2])}</b><span class="xs mu" style="display:block">${KB_A[t[1]].n} · ${fmtDay(kbTgSt(t[0]).ok)}${kbTgSt(t[0]).best!=null?' · cel mai bun: '+kbTgSt(t[0]).best+' '+t[6]:''}</span></span>${ic('right')}</button>`).join('')
      :'<div class="note">Țintele stau în pagina fiecărei activități. Le încerci când ai chef, nu fac parte din antrenamentul zilei.</div>'}</div>
  ${shown.map(m=>{ const y=+m.slice(0,4), mo=+m.slice(5,7), g=by[m];
    return `<div class="card"><div class="card-h"><div class="eyebrow">${MON_S[mo-1]} ${y}</div><span class="xs mu">${g.length} · ${g.reduce((t,s)=>t+kbRounds(s.x),0)} runde</span></div>${g.map(kbRow).join('')}</div>`; }).join('')}
  ${ks.length>shown.length?`<button class="btn ghost wide" style="margin-top:12px" data-a="kbMore">${ic('down')} Lunile anterioare</button>`:''}`;
}
ACT.kbMore=()=>{ S.kbN=(S.kbN||3)+3; render(); };
function kbRow(s){ const x=s.x, man=x.src==='manual', A=KB_A[s.a];
  return `<button class="list-row link hl" ${man?`data-a="kbEdit" data-k="${esc(x.sid)}"`:'disabled'}><span class="ic-s kb">${ic(A?A.ic:'glove')}</span><span class="sp"><b>${esc(A?A.n:actName(x))}</b>
    <span class="xs mu" style="display:block">${fmtDay(x.date)} · ${esc(kbRowMeta(x))}</span>${x.kb&&x.kb.tg?`<span class="xs mu2" style="display:block">${ic('target')} ${esc((kbTgOf(x.kb.tg.id)||[0,0,''])[2])}${x.kb.tg.ok?' · reușit':''}</span>`:''}</span>
    ${man?ic('right'):'<span class="tag rest">Strava</span>'}</button>`; }

/* ---------- foaia activității: formatul, combinațiile, tema pe rundă, pornirea, țintele ---------- */
function kbStep(k,label,val,shown){ return `<div class="kb-stp"><span>${label}</span><b>${shown}</b><div class="r"><button data-a="kbStep" data-k="${k}" data-i="-1" aria-label="${label}: mai puțin">−</button><button data-a="kbStep" data-k="${k}" data-i="1" aria-label="${label}: mai mult">+</button></div></div>`; }
function kbaHTML(){
  const a=SH.k, A=KB_A[a]; if(!A) return '';
  const p=kbPref(a), tgs=KB_TG.filter(t=>t[1]===a), dn=kbTgDone(a), ses=kbSessions().filter(s=>s.a===a).slice(0,3);
  const sug=tgs.find(t=>!kbTgSt(t[0]).ok);
  return `<div class="kb-hd" style="--ph:${kbPh(A.ph)}"><span class="kb-ph" aria-hidden="true"></span><span class="kb-fd" aria-hidden="true"></span>
      <button class="ib kb-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
      <div class="kb-ct"><div class="eyebrow">${esc(A.t)}</div><div class="h1">${esc(A.n)}</div><div class="sm">${esc(A.s)}</div></div></div>
    ${SH.free?`<div class="act-tg kb-pick">${Object.keys(KB_A).map(k=>`<button class="act-tb ${k===a?'on':''}" data-a="kbSwitch" data-k="${k}">${ic(KB_A[k].ic)}<span>${KB_A[k].n}</span></button>`).join('')}</div>`:''}
    <div class="eyebrow" style="margin-top:16px">${ic('clock')} Format</div>
    <div class="chips" style="margin-top:8px">${A.fmt.map((f,i)=>`<button class="chip ${p.r===f[1]&&p.rs===f[2]&&p.rest===f[3]?'on':''}" data-a="kbFmt" data-i="${i}">${esc(f[0])} · ${f[1]}×${fmtClock(f[2])}</button>`).join('')}</div>
    <div class="kb-stps">${kbStep('r','Runde',p.r,p.r)}${kbStep('rs','Runda',p.rs,fmtClock(p.rs))}${kbStep('rest','Pauză',p.rest,p.rest?fmtClock(p.rest):'fără')}</div>
    ${A.call?`<div class="set-row"><span class="sp"><b>Strigă combinații</b><div class="sm mu">${a==='spar'?'Vocea îți propune combinații de încercat pe partener':'Vocea spune combinația rar și clar, o vezi și mare pe ecran'}</div></span><button class="sw ${p.cl?'on':''}" data-a="kbOpt" data-k="cl" role="switch" aria-checked="${p.cl}" aria-label="Strigă combinații"></button></div>
      ${p.cl?`<div class="kb-cfg"><span>Combinații</span><div class="seg">${[1,2,3].map(l=>`<button class="${p.lvl===l?'on':''}" data-a="kbLvl" data-i="${l}">${KB_LVL[l]}</button>`).join('')}</div>
        <span>Ritm</span><div class="seg">${KB_TEMPO_L.map(([k,l])=>`<button class="${p.tempo===k?'on':''}" data-a="kbTempo" data-k="${k}">${l}</button>`).join('')}</div></div>
        <div class="xs mu2" style="margin-top:6px">${KB_LVL[p.lvl]}: ${p.lvl===1?'1–3 lovituri':p.lvl===2?'3–4 lovituri, plus eschive':'5–6 lovituri, plus eschive'} · ritm ${KB_TEMPO_L.find(x=>x[0]===p.tempo)[1].toLowerCase()}: o combinație ${KB_TEMPO_L.find(x=>x[0]===p.tempo)[2]}, după ce vocea termină.</div>
        <div class="set-row"><span class="sp"><b>Cu lovituri de picior</b><div class="sm mu">Low, middle, high kick, teep, genunchi</div></span><button class="sw ${p.kicks?'on':''}" data-a="kbOpt" data-k="kicks" role="switch" aria-checked="${p.kicks}" aria-label="Cu lovituri de picior"></button></div>
        ${kbCmbList(p)}`:''}`:''}
    <div class="set-row"><span class="sp"><b>Temă pe rundă</b><div class="sm mu">Un singur lucru de urmărit în fiecare rundă${a==='spar'?' (de ex. jab-ul primul)':''}</div></span><button class="sw ${p.foc?'on':''}" data-a="kbOpt" data-k="foc" role="switch" aria-checked="${p.foc}" aria-label="Temă pe rundă"></button></div>
    <button class="btn pri xl wide glow" style="margin-top:12px" data-a="kbGo">${ic('play')} Pornește · ${p.r} × ${fmtClock(p.rs)}</button>
    <button class="btn ghost wide" style="margin-top:8px" data-a="kbLog" data-k="${a}">${ic('edit')} Notează o sesiune făcută la sală</button>
    <details class="kb-tgs" ${SH.tgOpen?'open':''}><summary><span class="sp"><b>${ic('target')} Ținte · ${dn} din ${tgs.length} atinse</b><span class="xs mu">ocazionale, le încerci când ai chef</span></span>${ic('down')}</summary>
      ${tgs.map(t=>{ const st=kbTgSt(t[0]); return `<button class="kb-tg ${st.ok?'ok':''}" data-a="kbTgOpen" data-k="${t[0]}"><span class="ic-s ${st.ok?'ok':''}">${ic(st.ok?'check':'target')}</span>
        <span class="sp"><b>${esc(t[2])}</b><span class="xs mu">${st.ok?'Atinsă · '+fmtDay(st.ok):st.n?st.n+(st.n===1?' încercare':' încercări')+(st.best!=null?' · cel mai bun: '+st.best+' '+t[6]:''):'Neîncercată'}</span></span>${ic('right')}</button>`; }).join('')}</details>
    ${sug&&!SH.tgOpen?`<button class="kb-sug" data-a="kbTgOpen" data-k="${sug[0]}">${ic('target')} <span class="sp">Dacă ai chef azi: <b>${esc(sug[2])}</b></span>${ic('right')}</button>`:''}
    ${ses.length?`<div class="eyebrow" style="margin-top:16px">${ic('history')} Ultimele sesiuni</div>${ses.map(kbRow).join('')}`:''}
    <details class="notes"><summary>${ic('info')} Sfaturi · ${esc(A.n)}</summary>${A.tips.map(x=>`<p>${esc(x)}</p>`).join('')}</details>`;
}
/* lista combinațiilor pe care le poate striga vocea, pentru nivelul și setările alese */
function kbCmbList(p){ const pool=kbPool(p.lvl,p.kicks);
  return `<details class="kb-tgs kb-cmbs" ${SH.cmbOpen?'open':''}><summary><span class="sp"><b>${ic('list')} Combinațiile · ${KB_LVL[p.lvl].toLowerCase()} · ${pool.length}</b><span class="xs mu">pe care le strigă vocea, în ordine aleatorie</span></span>${ic('down')}</summary>
    ${pool.map(c=>{ const f=kbFmtC(c); return `<div class="kb-cmb"><b>${esc(f.big)}</b><span>${esc(f.names)}</span></div>`; }).join('')}
    <button class="linkb" style="margin:4px 14px 12px" data-a="kbLib">${ic('info')} Ce înseamnă cifrele</button></details>`; }
SHEETS.kba=()=>kbaHTML();
ACT.kbOpen=(el,{k})=>{ if(!KB_A[k]) return; SH={kind:'kba',k}; shRender(); };
ACT.kbRounds=()=>{ const last=kbSessions().find(s=>s.a); SH={kind:'kba',k:last?last.a:'bag',free:true}; shRender(); };
ACT.kbShadow=()=>{ SH={kind:'kba',k:'shadow'}; shRender(); };
ACT.kbSwitch=(el,{k})=>{ if(!SH||!KB_A[k]) return; SH.k=k; shRender(); };
ACT.kbFmt=async(el,{I})=>{ const a=SH&&SH.k, f=KB_A[a]&&KB_A[a].fmt[I]; if(!f) return; await kbPrefSet(a,{r:f[1],rs:f[2],rest:f[3]}); buzz(8); shRender(); };
ACT.kbStep=async(el,{k,I})=>{ const a=SH&&SH.k; if(!KB_A[a]) return; const p=kbPref(a);
  const v=k==='r'?clamp(p.r+I,1,15):k==='rs'?clamp(p.rs+I*(p.rs<60||(p.rs===60&&I<0)?10:30),10,600):clamp(p.rest+I*15,0,180);
  await kbPrefSet(a,{[k]:v}); buzz(8); shRender(); };
ACT.kbOpt=async(el,{k})=>{ const a=SH&&SH.k; if(!KB_A[a]) return; await kbPrefSet(a,{[k]:!kbPref(a)[k]}); shRender(); };
ACT.kbLvl=async(el,{I})=>{ const a=SH&&SH.k; if(!KB_A[a]) return; await kbPrefSet(a,{lvl:I}); shRender(); };
ACT.kbTempo=async(el,{k})=>{ const a=SH&&SH.k; if(!KB_A[a]||!KB_TEMPO[k]) return; await kbPrefSet(a,{tempo:k}); buzz(8); shRender(); };

/* ---------- cronometrul de runde (motorul cronometrului de intervale, cu sunete de ring) ---------- */
function kbFocusList(a,n){ const f=(KB_A[a]||KB_A.bag).foc.slice(); for(let i=f.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [f[i],f[j]]=[f[j],f[i]]; }
  return Array.from({length:n},(_,i)=>f[i%f.length]); }
function kbPreset(a,o,tg){
  const A=KB_A[a]||KB_A.bag, n=clamp(+o.r||1,1,30), rs=clamp(+o.rs||180,5,900), rest=clamp(+o.rest||0,0,600), foc=o.foc?kbFocusList(a,n):null, T=tg?kbTgOf(tg):null;
  const ph=[{k:'prep',d:10,l:'Pregătește-te',s:T?T[2]:foc?'Runda 1: '+foc[0]:'Gardă sus, respiră'}];
  for(let i=1;i<=n;i++){ ph.push({k:'work',d:rs,l:n===1?A.n:'Runda '+i+'/'+n,s:foc?foc[i-1]:T?T[2]:i===n&&n>1?'Ultima rundă — dă tot':A.n});
    if(i<n&&rest>0) ph.push({k:'rest',d:rest,l:'Pauză',s:'Urmează runda '+(i+1)+(foc?': '+foc[i]:'')}); }
  return {title:T?T[2]:A.n+' · '+n+' × '+fmtClock(rs),ph,kb:{a,r:n,rs,rest,call:o.cl&&A.call?{lvl:o.lvl||2,kicks:o.kicks!==false,tempo:KB_TEMPO[o.tempo]?o.tempo:'slow'}:null,tg:tg||null,cur:null,next:0,ph:-1,n:0}};
}
ACT.kbGo=()=>{ const a=SH&&SH.k; if(!KB_A[a]) return; if(TM.open&&TM.st&&TM.st.started&&!TM.st.done){ toast('Cronometrul rulează deja','','info'); return; }
  const pr=kbPreset(a,kbPref(a)); SH=null; shRender(); tmOpen(pr); };
/* clopotul: câteva parțiale care se sting lent; bătăile de la 10 secunde: două lovituri scurte, înalte */
function kbSched(){
  const st=TM.st; cancelSched('tm'); if(!st||!st.started||st.done||st.pAt) return;
  /* un clopot la începutul rundei, trei la final */
  const L=[], bell=(at,n)=>{ for(let i=0;i<n;i++){ const t=at+i*.34; L.push([t,1046,1.4,.32],[t,2793,.8,.09],[t,5320,.4,.04]); } };
  let j=st.i, t=st.ph[j].d-tmEl();
  while(true){ const ph=st.ph[j], nx=st.ph[j+1];
    if(ph.k==='work'&&ph.d>=20&&t>10) L.push([t-10,2200,.035,.45],[t-9.87,2200,.035,.45]);
    if(ph.k!=='work') [3,2,1].forEach(s=>{ if(t>s) L.push([t-s,880,.06]); });
    if(!nx){ bell(t,3); break; }
    if(nx.k==='work') bell(t,1); else if(ph.k==='work') bell(t,3);
    t+=nx.d; j++; if(L.length>900) break; }
  schedule('tm',L);
}
/* strigătorul: o combinație, apoi așteaptă să termine vocea și încă o pauză după ritmul ales (Lent: ~9 s de la o combinație la alta).
   După anunțul rundei, la fiecare 4 combinații o încurajare scurtă; în ultimele 10 secunde nu mai vin combinații: „Dă tot!" */
function kbTick(st){ const k=st.kb, c=k.call, ph=st.ph[st.i]; if(!ph||ph.k!=='work') return;
  const el=tmEl(), left=ph.d-el, now=Date.now();
  if(k.ph!==st.i){ k.ph=st.i; k.next=now+1500; k.cur=null; k.n=0; k.enc=0; k.s10=0; if(c) kbPaintCall(st); return; }
  if(ph.d>=20&&left<=10.5&&!k.s10){ k.s10=1; if(voxEnc()) say(mot('kbS10')); if(c){ k.cur={fin:1}; kbPaintCall(st); } return; }
  if(!c||left<(ph.d>=20?10.5:2)||now<k.next||voTalking()) return;
  const g=KB_TEMPO[c.tempo]||KB_TEMPO.slow, gap=()=>Math.round((g[0]+Math.random()*(g[1]-g[0]))*1000);
  if(voxEnc()&&k.n>0&&k.n%4===0&&!k.enc){ k.enc=1; say(mot('kbEnc'),{end:()=>{ k.next=Date.now()+1200; }}); k.next=now+1500; return; }
  k.enc=0; k.n++; k.cur=kbCombo(c.lvl,c.kicks,k.cur&&k.cur.c);
  const spoke=say(k.cur.voice+'.',{end:()=>{ k.next=Date.now()+gap(); }}); k.next=now+gap()+(spoke?3000:2000); kbPaintCall(st); }
function kbPaintCall(st){ const el=$('#kbCall'); if(el) el.innerHTML=kbCallInner(st); }
const kbCallInner=st=>st.kb.cur&&st.kb.cur.fin?`<b>10 s</b><span>Dă tot, fără oprire</span>`:st.kb.cur?`<b>${esc(st.kb.cur.big)}</b><span>${esc(st.kb.cur.names)}</span>`:`<span class="mu">Gardă sus · combinațiile vin imediat</span>`;
function kbLive(st,ph){ return st.kb.call&&ph.k==='work'?`<div class="kb-call" id="kbCall" aria-live="polite">${kbCallInner(st)}</div>`:''; }
const kbCtl=st=>`<button class="btn ghost" style="grid-column:1/-1" data-a="kbEnd">${ic('check')} Termină și notează</button>`;
const kbStartNote=st=>`<div class="kb-start">${ic('bell')} Clopot la începutul și la finalul rundei · două bătăi cu 10 secunde înainte de final${st.kb.call?' · combinații: '+KB_LVL[st.kb.call.lvl].toLowerCase()+', ritm '+KB_TEMPO_L.find(x=>x[0]===st.kb.call.tempo)[1].toLowerCase()+(st.kb.call.kicks?', cu picioare':''):''}</div>`;
const kbWorks=st=>st.ph.filter(p=>p.k==='work').length;
ACT.kbEnd=()=>{ const st=TM.st; if(!st||!st.kb||st.done) return; let r=0;
  st.ph.forEach((p,i)=>{ if(p.k==='work'&&i<st.i) r++; }); const cur=st.ph[st.i]; if(cur&&cur.k==='work'&&cur.d&&tmEl()>=cur.d*.5) r++;
  st.kb.rounds=r; if(st.pAt){ const pd=Date.now()-st.pAt; st.t0+=pd; st.pausedMs+=pd; st.pAt=null; } tmFinish(false); };
function kbDoneHTML(st){ const r=st.kb.rounds!=null?st.kb.rounds:kbWorks(st), T=st.kb.tg?kbTgOf(st.kb.tg):null;
  return `<div class="kpis c2"><div class="kpi"><div class="k">Runde</div><div class="v">${r}<small>/ ${kbWorks(st)}</small></div></div><div class="kpi"><div class="k">${esc(kbAName(st.kb.a))}</div><div class="v">${fmtClock(st.kb.rs)}<small>/ rundă</small></div></div></div>
    ${T?`<div class="note" style="text-align:center">${ic('target')} La pasul următor notezi rezultatul la ținta „${esc(T[2])}".</div>`:''}
    <button class="btn pri xl wide glow" style="margin-top:14px" data-a="kbLogTm">${ic('edit')} Notează sesiunea</button>`; }
ACT.kbLogTm=()=>{ const st=TM.st; if(!st||!st.kb) return; const hs=hrSum(st.hr), r=st.kb.rounds!=null?st.kb.rounds:kbWorks(st), d=new Date(st.start||Date.now());
  KF=kfNew({a:st.kb.a,r,rs:st.kb.rs,rest:st.kb.rest,min:Math.max(1,Math.round((st.total||0)/60)),hr:hs?hs.avg:'',tg:st.kb.tg,time:pad(d.getHours())+':'+pad(d.getMinutes())});
  TM.open=false; TM.st=null; cancelSched('tm'); if(!S.sess){ keepAlive(false); keepAwake(false); } tmRender(); SH={kind:'kbf'}; shRender(); };
/* încălzirea ghidată (fără notare: e doar pregătire) */
ACT.kbWarm=()=>{ const ph=[{k:'prep',d:5,l:'Pregătește-te',s:'Încălzire pentru kickboxing'}]; KB_WARM.forEach(([l,d,s])=>ph.push({k:'work',d,l,s})); tmOpen({title:'Încălzire · kickboxing',ph}); };

/* ---------- ținte: foaia țintei, încercarea cu cronometrul și rezultatul notat direct ---------- */
function kbtHTML(){ const T=kbTgOf(SH.k); if(!T) return ''; const st=kbTgSt(T[0]), A=KB_A[T[1]], pr=T[7];
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
    <button class="linkb" style="margin-top:0" data-a="kbOpen" data-k="${T[1]}">${ic('left')} ${esc(A.n)}</button>
    <div class="eyebrow" style="margin-top:10px">${ic('target')} Țintă · ${esc(A.n)}</div><div class="h2" style="margin-top:6px">${esc(T[2])}</div>
    <p class="mu" style="margin-top:8px;line-height:1.55">${esc(T[3])}</p>
    <div class="kb-tg-st ${st.ok?'ok':''}">${st.ok?ic('check')+' Atinsă pe '+fmtDay(st.ok):'Încă neatinsă'}${st.best!=null?' · cel mai bun: <b>'+st.best+'</b> '+esc(T[6]):''}${st.n?' · '+st.n+(st.n===1?' încercare':' încercări'):''}</div>
    <button class="btn pri xl wide glow" style="margin-top:14px" data-a="kbTgGo" data-k="${T[0]}">${ic('play')} Încearcă acum · ${pr[0]>1?pr[0]+' × ':''}${fmtClock(pr[1])}${pr[0]>1&&pr[2]?' · pauză '+fmtClock(pr[2]):''}</button>
    <div class="card kb-tg-q"><div class="sm"><b>Ai făcut-o deja, la sală?</b></div>
      ${T[4]==='n'?`<div class="inrow" style="margin-top:10px"><input class="inp" id="kbTgV" type="number" inputmode="numeric" placeholder="Câte ${esc(T[6])} · ținta ${T[5]}"><button class="btn pri" data-a="kbTgRec" data-k="${T[0]}">${ic('check')} Notează</button></div>`
        :`<div class="inrow" style="margin-top:10px"><button class="btn pri" style="flex:1" data-a="kbTgRec" data-k="${T[0]}" data-i="1">${ic('check')} Am reușit</button><button class="btn ghost" data-a="kbTgRec" data-k="${T[0]}" data-i="0">Nu încă</button></div>`}</div>
    ${(st.tries||[]).length?`<div class="eyebrow" style="margin-top:14px">${ic('history')} Încercări</div>${st.tries.slice().reverse().slice(0,6).map(t=>`<div class="list-row"><span class="sp">${fmtDay(t.d)}</span><span class="v">${t.v!=null?t.v+' '+esc(T[6]):''}${t.ok?' '+ic('check'):''}</span></div>`).join('')}`:''}`; }
SHEETS.kbt=()=>kbtHTML();
ACT.kbTgOpen=(el,{k})=>{ if(!kbTgOf(k)) return; SH={kind:'kbt',k}; shRender(); };
ACT.kbTgGo=(el,{k})=>{ const T=kbTgOf(k); if(!T) return; const p=T[7]; SH=null; shRender(); tmOpen(kbPreset(T[1],{r:p[0],rs:p[1],rest:p[2],cl:false,foc:false},k)); };
async function kbTgMark(id,v,okv,date){ const T=kbTgOf(id); if(!T) return null; const tg=Object.assign({},(S.kb||{}).tg), o=Object.assign({n:0,tries:[]},tg[id]||{});
  const ok=T[4]==='n'?(v!=null&&v>=T[5]):!!okv, first=ok&&!o.ok;
  o.n=(o.n||0)+1; o.last=date; if(v!=null&&(o.best==null||v>o.best)) o.best=v; if(ok&&!o.ok) o.ok=date;
  o.tries=(o.tries||[]).concat([v!=null?{d:date,v,ok}:{d:date,ok}]).slice(-12); tg[id]=o;
  await save('kb',Object.assign({},S.kb,{tg})); return {ok,first,T}; }
function kbTgCelebrate(r){ if(!r) return; if(r.first){ burstAt(innerWidth/2,innerHeight*.3,40); buzz([60,40,60,40,160]); toast('Țintă atinsă',r.T[2]); say(voxEnc()?mot('tg'):'Țintă atinsă.'); }
  else toast(r.ok?'Reușită notată':'Încercare notată',r.T[2],'info'); }
ACT.kbTgRec=async(el,{k,I})=>{ const T=kbTgOf(k); if(!T) return; let v=null;
  if(T[4]==='n'){ v=parseInt(($('#kbTgV')||{}).value,10); if(!(v>=0&&v<10000)) return shake('#kbTgV'); }
  const r=await kbTgMark(k,v,T[4]==='n'?null:I===1,todayKey()); shRender(); render(); kbTgCelebrate(r); };

/* ---------- formularul sesiunii (după cronometru sau notată de mână) ---------- */
let KF=null;
function kfNew(o){ const now=new Date();
  return Object.assign({id:null,a:'bag',date:todayKey(),time:pad(now.getHours())+':'+pad(now.getMinutes()),r:'',rs:180,rest:60,min:'',rpe:0,hr:'',note:'',ok:'',fix:'',who:'',tg:null,tgv:'',tgok:null,
    st:stOn()&&stCanWrite()&&stCfg().auto!==false,up:false},o||{},{r:o&&o.r!=null?String(o.r):'',min:o&&o.min!=null?String(o.min):'',hr:o&&o.hr?String(o.hr):''}); }
ACT.kbLog=(el,{k})=>{ const a=KB_A[k]?k:(kbSessions().find(s=>s.a)||{}).a||'bag', p=kbPref(a); KF=kfNew({a,rs:p.rs,rest:p.rest}); SH={kind:'kbf'}; shRender(); };
ACT.kbEdit=(el,{k})=>{ const x=(S.ext||[]).find(e=>String(e.sid)===String(k)); if(!x) return; kbEditX(x); };
function kbEditX(x){ const b=x.kb||{};
  KF=kfNew({id:x.sid,a:KB_A[b.a]?b.a:kbGuess(x)||'bag',date:x.date,time:x.start?new Date(x.start).toTimeString().slice(0,5):'',r:b.r||'',rs:b.rs||180,rest:b.rest!=null?b.rest:60,min:x.min,rpe:x.rpe||0,hr:x.hr||'',
    note:x.note||'',ok:b.ok||'',fix:b.fix||'',who:b.who||'',st:false,up:!!x.strava}); SH={kind:'kbf'}; shRender(); }
/* din „Activități": sesiunile de kickboxing se deschid în formularul lor */
{ const _ed=ACT.actEdit; ACT.actEdit=(el,o)=>{ const x=(S.ext||[]).find(e=>String(e.sid)===String(o.k)); if(x&&x.type==='Kickboxing'&&x.src==='manual') return kbEditX(x); return _ed(el,o); }; }
document.addEventListener('input',e=>{ const t=e.target; if(KF&&t&&t.dataset&&t.dataset.kf!=null) KF[t.dataset.kf]=t.value; });
const kfIn=(id,label,o={})=>`<div class="fld ${o.full?'full':''}"><label for="kf_${id}">${label}</label>${o.area?`<textarea class="inp" id="kf_${id}" data-kf="${id}" rows="2" ${o.ph?`placeholder="${esc(o.ph)}"`:''}>${esc(KF[id]||'')}</textarea>`
  :`<input class="inp" id="kf_${id}" data-kf="${id}" ${o.type?`type="${o.type}"`:o.text?'':`type="number" step="${o.step||'any'}" inputmode="decimal"`} value="${esc(KF[id]==null?'':KF[id])}" ${o.ph?`placeholder="${esc(o.ph)}"`:''}>`}</div>`;
const kfAuto=()=>{ const r=parseInt(KF.r,10)||0; return r?Math.round((r*(+KF.rs||0)+Math.max(0,r-1)*(+KF.rest||0))/60):0; };
function kbfHTML(){
  const F=KF, A=KB_A[F.a]||KB_A.bag, T=F.tg?kbTgOf(F.tg):null, auto=kfAuto();
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('glove')} ${F.id?'Modifică sesiunea':'Sesiune de kickboxing'}</div>
    <div class="h2" style="margin-top:6px">${esc(A.n)}</div>
    <div class="act-tg kb-pick">${Object.keys(KB_A).map(k=>`<button class="act-tb ${k===F.a?'on':''}" data-a="kfA" data-k="${k}" aria-pressed="${k===F.a}">${ic(KB_A[k].ic)}<span>${KB_A[k].n}</span></button>`).join('')}</div>
    ${T?`<div class="card kb-tg-q"><div class="eyebrow">${ic('target')} Ținta încercată</div><div class="sm" style="margin-top:6px"><b>${esc(T[2])}</b></div>
      ${T[4]==='n'?`<div class="fld" style="margin-top:10px"><label for="kf_tgv">Câte ${esc(T[6])} ai făcut · ținta ${T[5]}</label><input class="inp" id="kf_tgv" data-kf="tgv" type="number" inputmode="numeric" value="${esc(F.tgv)}"></div>`
        :`<div class="inrow" style="margin-top:10px"><button class="chip ${F.tgok===true?'on':''}" style="flex:1" data-a="kfTg" data-i="1">${ic('check')} Am reușit</button><button class="chip ${F.tgok===false?'on':''}" style="flex:1" data-a="kfTg" data-i="0">Nu încă</button></div>`}</div>`:''}
    <div class="form">${kfIn('r','Runde',{step:'1',ph:'ex: 5'})}${kfIn('min','Durata totală (min)',{step:'1',ph:auto?'≈ '+auto+' din runde':'ex: 45'})}
      <div class="fld"><label>Runda</label><div class="seg" style="margin-top:0">${[[120,'2 min'],[180,'3 min']].map(([v,l])=>`<button class="${+F.rs===v?'on':''}" data-a="kfRs" data-i="${v}">${l}</button>`).join('')}</div></div>
      ${kfIn('hr','Puls mediu (opțional)',{step:'1',ph:'ex: 150'})}
      ${kfIn('date','Data',{type:'date'})}${kfIn('time','Ora începerii',{type:'time'})}
      ${F.a==='spar'?kfIn('who','Partener (opțional)',{text:1,full:1,ph:'cu cine ai făcut sparring'})+kfIn('ok','Ce a mers',{area:1,full:1,ph:'ex: jab-ul, low kick-ul după 1-2'})+kfIn('fix','De lucrat',{area:1,full:1,ph:'ex: garda cade după croșeu'})
        :kfIn('note','Notițe (opțional)',{area:1,full:1,ph:'ex: combinațiile lungi, putere bună'})}</div>
    <div class="fld" style="margin-top:12px"><label>Cât de greu a fost</label><div class="seg" style="margin-top:0">${ACT_RPE.map(([v,l])=>`<button class="${F.rpe===v?'on':''}" data-a="kfRpe" data-i="${v}">${l}</button>`).join('')}</div></div>
    <div class="xs mu2" style="margin-top:6px">Intră în încărcarea zilei ca minute × efort, ca orice activitate din afara planului.</div>
    ${!F.id&&stOn()&&stCanWrite()?`<div class="set-row" style="margin-top:10px"><span class="sp"><b>Trimite și pe Strava</b><div class="sm mu">ca antrenament („Kickboxing · ${esc(A.n)}")</div></span><button class="sw ${F.st?'on':''}" data-a="kfSt" role="switch" aria-checked="${!!F.st}" aria-label="Trimite și pe Strava"></button></div>`:''}
    ${F.up?`<div class="xs mu2" style="margin-top:8px">E deja pe Strava. Modificările de aici nu se mai trimit acolo.</div>`:''}
    <div class="inrow" style="margin-top:14px">${F.id?`<button class="btn ghost danger" data-a="kbDel" data-k="${esc(F.id)}" data-confirm="Ștergi?">${ic('trash')}</button>`:''}
      <button class="btn pri xl" style="flex:1" data-a="kfSave">${ic('check')} ${F.id?'Salvează':'Salvează sesiunea'}</button></div>`;
}
SHEETS.kbf=()=>KF?kbfHTML():'';
ACT.kfA=(el,{k})=>{ if(!KF||!KB_A[k]) return; KF.a=k; shRender(); };
ACT.kfRs=(el,{I})=>{ if(!KF) return; KF.rs=I; shRender(); };
ACT.kfRpe=(el,{I})=>{ if(!KF) return; KF.rpe=KF.rpe===I?0:I; shRender(); };
ACT.kfTg=(el,{I})=>{ if(!KF) return; KF.tgok=I===1; shRender(); };
ACT.kfSt=()=>{ if(!KF) return; KF.st=!KF.st; shRender(); };
ACT.kfSave=async()=>{
  const F=KF; if(!F) return; const n=v=>{ const x=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(x)?x:null; };
  const r=Math.round(n(F.r)||0), hr=Math.round(n(F.hr)||0), min=n(F.min)||kfAuto();
  if(F.r!==''&&!(r>=1&&r<=30)) return shake('#kf_r');
  if(!(min>0&&min<=600)) return shake('#kf_min');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(F.date||'')||F.date>todayKey()) return shake('#kf_date');
  if(F.hr&&!(hr>=40&&hr<=220)) return shake('#kf_hr');
  const T=F.tg?kbTgOf(F.tg):null, tv=T&&T[4]==='n'&&String(F.tgv).trim()!==''?Math.round(n(F.tgv)):null;
  if(T&&T[4]==='n'&&String(F.tgv).trim()!==''&&!(tv>=0&&tv<10000)) return shake('#kf_tgv');
  const A=KB_A[F.a]||KB_A.bag, st=parseKey(F.date); if(/^\d{1,2}:\d{2}$/.test(F.time||'')){ const [h,m]=F.time.split(':').map(Number); st.setHours(h,m,0,0); } else st.setHours(18,0,0,0);
  const old=F.id?(S.ext||[]).find(x=>String(x.sid)===String(F.id)):null;
  const kb=Object.assign({},(old&&old.kb)||{},{a:F.a,rs:+F.rs||180,rest:+F.rest||0}); if(r) kb.r=r; else delete kb.r;
  ['ok','fix','who'].forEach(k=>{ const v=String(F[k]||'').trim(); if(F.a==='spar'&&v) kb[k]=v.slice(0,200); else delete kb[k]; });
  let tr=null; if(T&&(tv!=null||F.tgok!=null)){ tr=await kbTgMark(T[0],tv,F.tgok,F.date); kb.tg={id:T[0],ok:tr.ok}; if(tv!=null) kb.tg.v=tv; }
  const x=Object.assign({},old||{},{sid:F.id||'k'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),src:'manual',date:F.date,start:st.getTime(),type:'Kickboxing',name:'Kickboxing · '+A.n,
    min:Math.round(min*10)/10,el:Math.round(min),km:0,dup:false,kb});
  ['hr','rpe','note'].forEach(k=>delete x[k]); if(hr) x.hr=hr; if(F.rpe) x.rpe=F.rpe; if(F.a!=='spar'&&String(F.note||'').trim()) x.note=String(F.note).trim().slice(0,200);
  const ext=(S.ext||[]).filter(e=>String(e.sid)!==String(x.sid)).concat([x]).sort((p,q)=>(p.start||0)-(q.start||0));
  await save('ext',ext);
  if(!F.id&&F.st&&stOn()&&stCanWrite()){
    const sp=F.a==='spar'?[kb.ok?'Ce a mers: '+kb.ok:'',kb.fix?'De lucrat: '+kb.fix:''].filter(Boolean).join('\n'):x.note||'';
    await stQueue({key:x.sid,start:x.start,end:x.start+min*60000,dur:Math.round(min*60),km:0,sport:'Workout',name:x.name,
      desc:(A.n+(r?' · '+r+(r===1?' rundă':' runde')+' × '+fmtClock(kb.rs)+(kb.rest&&r>1?' · pauză '+fmtClock(kb.rest):''):'')+' · '+num(min,0)+' min'+(hr?' · puls mediu '+hr:'')+(sp?'\n\n'+sp:'')+'\n\nNotat în UMBRA · Hybrid365'),hr:null,pts:[]});
    setTimeout(stFlush,50); }
  KF=null; SH=null; shRender(); render();
  if(tr&&tr.first) kbTgCelebrate(tr); else toast(F.id?'Sesiune salvată':'Sesiune notată',A.n+(r?' · '+r+(r===1?' rundă':' runde'):'')+' · '+num(min,0)+' min','info');
};
ACT.kbDel=async(el,{k})=>{ const prev=S.ext, x=(prev||[]).find(e=>String(e.sid)===String(k)); if(!x) return;
  await save('ext',(prev||[]).filter(e=>String(e.sid)!==String(k))); KF=null; SH=null; shRender(); render();
  toast('Sesiune ștearsă',actName(x)+(x.strava?' · rămâne pe Strava':''),'',{l:'Anulează',f:async()=>{ await save('ext',prev); render(); }}); };

/* ---------- uneltele: combinațiile, bandajarea, geanta ---------- */
SHEETS.kbLib=()=>`<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('list')} Kickboxing</div><div class="h2" style="margin-top:6px">Combinații</div>
  <p class="mu" style="margin-top:8px;line-height:1.55">Antrenorii strigă loviturile cu cifre. Pentru gardă normală (stânga în față):</p>
  <div class="kb-nums">${[1,2,3,4,5,6].map(n=>`<div><b>${n}</b><span>${KB_P[n]}</span></div>`).join('')}</div>
  <p class="xs mu2" style="margin-top:8px">Picioare: low kick (coapsă), middle kick (corp), high kick (cap), teep (frontală, de distanță), genunchi.</p>
  <div class="eyebrow" style="margin-top:16px">${ic('star')} Clasice</div>
  ${KB_LIB.map(([c,n,d])=>`<div class="kb-lib"><b>${esc(kbFmtC(c).big)}</b><div class="sm">${esc(n)}</div><div class="xs mu">${esc(d)}</div></div>`).join('')}
  <button class="btn pri wide" style="margin-top:14px" data-a="kbShadow">${ic('sound')} Exersează cu strigătorul</button>`;
SHEETS.kbWrap=()=>`<div class="kb-hd sm" style="--ph:${kbPh('wraps')}"><span class="kb-ph" aria-hidden="true"></span><span class="kb-fd" aria-hidden="true"></span>
  <button class="ib kb-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="kb-ct"><div class="eyebrow">Înainte de sac și palmare</div><div class="h1">Bandaje</div></div></div>
  <ol class="kb-steps">${KB_WRAP.map(([t,d])=>`<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol>
  <div class="note">Bandajele de 4–4,5 m ajung pentru mâini mari. Spală-le după fiecare antrenament.</div>`;
SHEETS.kbGear=()=>{ const g=(S.kb||{}).gear||{}, n=KB_GEAR.filter((_,i)=>g[i]).length;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('check')} Înainte să pleci</div><div class="h2" style="margin-top:6px">Geanta · ${n}/${KB_GEAR.length}</div>
  <div style="margin-top:10px">${KB_GEAR.map((t,i)=>`<button class="kb-gear ${g[i]?'on':''}" data-a="kbGearT" data-i="${i}" aria-pressed="${!!g[i]}"><span class="tick ${g[i]?'on':''}">${ic('check')}</span><span>${esc(t)}</span></button>`).join('')}</div>
  ${n?`<button class="btn ghost wide" style="margin-top:12px" data-a="kbGearR">${ic('refresh')} Golește bifele</button>`:''}`; };
ACT.kbLib=()=>{ SH={kind:'kbLib'}; shRender(); };
ACT.kbWrap=()=>{ SH={kind:'kbWrap'}; shRender(); };
ACT.kbGear=()=>{ SH={kind:'kbGear'}; shRender(); };
ACT.kbGearT=async(el,{I})=>{ const g=Object.assign({},(S.kb||{}).gear); if(g[I]) delete g[I]; else g[I]=1; await save('kb',Object.assign({},S.kb,{gear:g})); buzz(10); shRender(); };
ACT.kbGearR=async()=>{ await save('kb',Object.assign({},S.kb,{gear:{}})); shRender(); };

/* ---------- comenzile din Ctrl+K și contextul antrenorului AI ---------- */
function kbPalCmds(C){
  const go=()=>{ S.tab='kb'; render(); window.scrollTo({top:0}); };
  [['Kickboxing · sac','sac heavy bag box kickboxing runde','bag',()=>{ go(); ACT.kbOpen(null,{k:'bag'}); }],
   ['Kickboxing · palmare','palmare pad work kickboxing','pads',()=>{ go(); ACT.kbOpen(null,{k:'pads'}); }],
   ['Kickboxing · sparring','sparring kickboxing meci','spar',()=>{ go(); ACT.kbOpen(null,{k:'spar'}); }],
   ['Cronometru de runde','runde box clopot ring kickboxing timer','clock',ACT.kbRounds],
   ['Strigător de combinații · shadowboxing','shadow combinatii strigator voce kickboxing','sound',ACT.kbShadow],
   ['Notează o sesiune de kickboxing','noteaza kickboxing sesiune sac sparring palmare','edit',()=>ACT.kbLog(null,{k:''})]
  ].forEach(([t,k,icn,f])=>C.push({g:'Comenzi',t,k,icn,f}));
  C.push({g:'Navigare',t:'Kickboxing',k:'mergi deschide pagina kb kickboxing',icn:'glove',f:go});
}
function kbAiCtx(){ const tk=todayKey(), xs=kbSessions().filter(s=>s.x.date>=dayShift(tk,-27)), t=kbTgDone();
  const tail=` Ținte de kickboxing atinse: ${t} din ${KB_TG.length} (sunt ocazionale, le alege utilizatorul; nu fac parte din planul zilnic).`;
  if(!xs.length) return 'Nicio sesiune de kickboxing în ultimele 4 săptămâni.'+tail;
  const o=kbAgg(dayShift(tk,-27),tk), l=xs[0];
  return `În ultimele 4 săptămâni: ${o.n} sesiuni (${Object.keys(o.by).map(a=>kbAName(a).toLowerCase()+' '+o.by[a]).join(', ')}), ${o.r} runde, ${num(o.min/60,1)} h. Ultima: ${kbAName(l.a).toLowerCase()}, ${l.x.date}, ${kbRowMeta(l.x)}.`+tail; }

/* ---------- fila în meniu: după Antrenament ---------- */
NAV.splice(2,0,['kb','Kickboxing','glove']); VIEWS.kb=viewKb; VIEW_LAY.kb='lay-narrow';
/* lista de ținte rămâne deschisă cât lucrezi în foaie (foaia se redesenează la fiecare setare) */
document.addEventListener('toggle',e=>{ const t=e.target; if(t&&t.classList&&t.classList.contains('kb-tgs')&&SH&&SH.kind==='kba') SH[t.classList.contains('kb-cmbs')?'cmbOpen':'tgOpen']=t.open; },true);
