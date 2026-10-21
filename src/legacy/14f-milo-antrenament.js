/* =====================================================================
   v19 · ANTRENAMENTUL DUPĂ DR. MILO WOLF — planul hibrid (04) și antrenorul local din antrenament.
   Principiile din toate videoclipurile lui (volum, apropierea de eșec, stretch-ul, pauzele, progresia, încălzirea, deload-ul la nevoie)
   și câte o indicație de execuție la fiecare exercițiu. Antrenorul local (miloLive) rulează în aplicație, din seriile notate:
   nu folosește antrenorul AI și nu consumă tokeni.
   ===================================================================== */
const MILO_CUE={
  'Bench Press':'Cobori controlat până atingi pieptul, pauză scurtă jos, împingi exploziv. Seturi grele fără spotter: 1–2 repetări în rezervă, fără eșec.',
  'Pull Up / Lat Pulldown':'Atârnare completă sus, cu umerii întinși; tragi exploziv. Pe ultimul set, după eșec, continui cu jumătăți de repetare în partea întinsă.',
  'Pull Up':'Atârnare completă la fiecare repetare; nu contează să treci perfect cu bărbia. După eșec, jumătăți de repetare de jos.',
  'Lat Pulldown':'Priză îngustă sau supinată, brațele complet întinse sus (stretch în dorsali). Fără să te lași pe spate. După eșec, jumătăți de repetare sus.',
  'Weighted Pull Up':'Atârnare completă la fiecare repetare. Pe ultimul set, după eșec, jumătăți de repetare de jos (partea întinsă).',
  'Hammer Chest Press':'Mânerele cât mai în spate (stretch în piept), pauză scurtă, exploziv. Ultimul set până la eșec, apoi jumătăți de repetare în stretch.',
  'Machine Chest Press':'Mânerele cât mai în spate (stretch în piept), pauză scurtă, exploziv. Aparatul e sigur: ultimul set la eșec, apoi jumătăți de repetare în stretch.',
  'Chest Supported Row':'Brațele complet întinse jos, omoplații depărtați. Fără pauză sus. După eșec, jumătăți de repetare în poziția întinsă.',
  'T-Bar Row':'Cu sprijin la piept dacă ai: brațele complet întinse jos, omoplații depărtați, fără pauză sus. E cel mai greu jos — exact unde trebuie.',
  'Lateral Raise':'Cablul la nivelul mâinii, din spatele corpului, ca tensiunea să înceapă de jos. După eșec, jumătăți de repetare în partea de jos.',
  'Cable Lateral Raise':'Cablul la nivelul mâinii, brațul trece prin spatele corpului jos (stretch). Urci până la umăr, nu mai sus. După eșec, jumătăți de repetare jos.',
  'Dumbbell Lateral Raise':'Aplecat puțin în lateral, ca tensiunea să înceapă de jos. După eșec, jumătăți de repetare în partea de jos.',
  'Rear Delt Fly':'La cablu, în cruce: brațul pleacă din partea opusă a corpului (stretch în deltoidul posterior). Face pull-ul nu întinde deltoidul la fel.',
  'Tricep Pushdown':'Lasă coatele să urce puțin în față la revenire, pentru mai mult stretch. Pentru triceps, extensia peste cap a crescut mai mult mușchiul în studii.',
  'Tricep Rope Pushdown':'Lasă coatele să urce puțin în față la revenire, pentru mai mult stretch. Ultimul set până la eșec.',
  'Tricep Overhead Extension':'Cel mai bun exercițiu pentru triceps (capul lung întins; ~50% mai multă creștere decât pushdown-ul în studiul Maeo): coatele spre tavan, cobori cât mai jos. După eșec, jumătăți de repetare jos.',
  'Skull Crusher':'Bara sau ganterele coboară în spatele capului (umărul flexat întinde capul lung). După eșec, jumătăți de repetare în partea de jos.',
  'Bicep Curl':'Brațul complet întins jos. Cel mai bine: curl pe bancă înclinată (umărul în spate) sau Bayesian la cablu.',
  'Preacher Curl':'Cel mai greu jos, cu brațul aproape întins: exact poziția care crește cel mai mult. Nu bloca brusc jos; după eșec, jumătăți de repetare jos.',
  'Incline Dumbbell Curl':'Umărul rămâne în spate, brațul complet întins jos. Sus e ușor: ultimele repetări fă-le ca jumătăți de jos.',
  'Pec Deck':'Brațele pornesc larg, în spatele corpului: pieptul întins sub sarcină. Fără pauză în față, unde nu mai e tensiune; jumătăți de repetare în stretch la final.',
  'Cable Fly':'Un pas în față, brațele larg în spate până simți stretch-ul, coatele ușor îndoite și fixe. Tensiunea rămâne și jos, de aceea e bun după gantere.',
  'Hammer Curl':'Priza neutră lucrează brahialul și brahioradialul: brațul arată mai gros. Brațul complet întins jos, fără balans.',
  'Cable Curl':'Pe bancă, cu cablul în spatele tău la nivelul mâinii (Bayesian): bicepsul e întins și încărcat jos. Fără pauză sus.',
  'Alternating Dumbbell Curl':'Brațul complet întins jos; ideal cu brațul puțin în spatele corpului (curl înclinat). Ultimul set până la eșec.',
  'Barbell Curl':'Brațele complet întinse jos, fără pauză sus. Puțin balans la final e ok.',
  'Flat Dumbbell Press':'Ganterele coboară sub nivelul pieptului (stretch adânc), pauză scurtă, exploziv.',
  'Incline Dumbbell Press':'Banca la 30–45°: crește mai mult partea de sus a pieptului decât împinsul plat. Ganterele coboară adânc, înclinate spre interior, pauză scurtă, exploziv.',
  'Dumbbell Fly':'Cel mai bun „întinzător" al pieptului: coatele ușor îndoite și fixe, cobori până simți stretch-ul, urci doar până la ~jumătate (sus nu e tensiune).',
  'Seated Overhead Press':'Cobori până la claviculă, fără să te sprijini jos. Primele seturi la 2 repetări în rezervă, ultimul la 0–1.',
  'Cable Face Pull':'Brațele complet întinse în față la revenire. După eșec, jumătăți de repetare.',
  'Close Grip Bench Press':'Coatele aproape de corp, atingi pieptul; 1–2 repetări în rezervă.',
  'Push Press':'Mișcare de putere: viteză maximă la fiecare repetare, fără eșec.',
  'Shrug':'Șezând, cu gantere: umerii coboară complet jos (stretch), urci exploziv, fără pauză sus. Poți face ultimul set ca drop set.',
  'Hack Squat':'Cât de jos poți cu spatele lipit (stretch în cvadriceps), pauză scurtă jos, urci exploziv. Seturile grele la 1–2 repetări în rezervă.',
  'Romanian Deadlift':'Genunchii rămân pe loc, șoldurile pleacă în spate până puțin sub genunchi. Partea de jos e cea care crește: poți lucra doar jumătatea de jos. 1–2 repetări în rezervă.',
  'Good Morning':'La Smith: genunchii aproape întinși, împingi șoldurile în spate (nu în jos) până la stretch-ul maxim în femurali. Jumătăți de repetare din partea de jos (2× mai multă creștere în studiul multi-hip).',
  'Bulgarian Split Squat':'La Smith: piciorul din față departe, genunchiul din spate aproape de sol (stretch în fesieri și cvadriceps). Stabil: poți merge aproape de eșec în siguranță.',
  'Walking Lunge':'Pas lung, genunchiul din spate aproape de sol (stretch în fesieri). 1–2 repetări în rezervă.',
  'Hip Thrust':'E greu sus (poziția scurtă): după eșec continui cu jumătăți de repetare în partea de jos.',
  'Leg Press':'Cât mai jos fără să se rotunjească spatele; e deja un exercițiu „din stretch" pentru fesieri. Ultimul set până la eșec, apoi jumătăți de repetare jos.',
  'Leg Extension':'Lasă spătarul pe spate (șoldul întins întinde dreptul femural). Sus e cel mai greu: pauza fă-o jos, nu sus.',
  'Hamstring Curl':'La șezut, aplecat în față din șold: a crescut femuralii mai mult decât cel culcat (șoldul îndoit îi întinde).',
  'Nordic Curl':'Pentru alergători: reduce accidentările femuralilor. Coboară cât de lent poți, te prinzi cu mâinile jos, urci ajutându-te.',
  'Hip Abduction Machine':'Aplecat în față (întinde și fesierul mare). Ultimul set la eșec, apoi jumătăți de repetare cu genunchii apropiați.',
  'Calf Raise':'Genunchii întinși (gastrocnemianul crește mai mult decât la șezut), pauză de 1–2 s jos, în stretch maxim. După eșec, jumătăți de repetare jos.',
  'Seated Calf Raise':'Pauză de 1–2 s jos; la gambe, varianta cu genunchii întinși crește mai mult — folosește-o pe aceea când poți.',
  'Hanging Leg Raise':'Fără balans; rotunjește bazinul spre piept (flexia coloanei lucrează abdomenul), până la eșec tehnic.',
  'Back Extension':'La 45°: cobori cât poți de jos cu spatele neutru (femuralii și fesierii întinși), urci din șold. Când trec 12 repetări, ții o ganteră sau un disc la piept.',
  'Cable Crunch':'Rotunjește coloana (de la cutia toracică spre bazin), nu te îndoi din șold. Sus, abdomenul se întinde complet.',
  'Dragon Flag':'Până la eșec tehnic, cu negative lente.',
  'Ab Wheel Rollout':'Cât mai întins în față (stretch în abdomen), până la eșec tehnic.',
  'Pallof Press':'Până la eșec tehnic, pe fiecare parte.',
  'Plank':'Pentru creștere, abdomenul răspunde mai bine la exerciții dinamice duse la eșec.'};
const miloCue=n=>MILO_CUE[n]||'';
/* principiile pentru seturi, pe scurt (cardul din Plan) */
const MILO_RULES=[
  ['target','Cât de greu','Primul set al unui exercițiu la 2–3 repetări în rezervă, apoi te apropii set cu set; ultimul set la 0–1. Eșecul îl lași pentru aparate, cabluri, izolare și finalul ședinței; la compusele grele de picioare rămâi la 1–2. De la 5 repetări în rezervă la eșec, creșterea pe set aproape se dublează (Robinson).'],
  ['clock','Pauzele','Izolare 90 s, compuse pe partea de sus ~2,5 min, compusele grele de picioare 3 min. Sub 60 s creșterea scade; repornești când poți repeta aproximativ setul de dinainte și nu mai gâfâi. Cronometrul din antrenament le pornește singur.'],
  ['bolt','Stretch-ul','Amplitudine completă, frânezi în poziția întinsă, pauză scurtă jos, urci exploziv; fără pauză sus. Unde e sigur, după eșec continui cu jumătăți de repetare în partea întinsă (~+10% creștere; la gambe +50% în studiul lui).'],
  ['chart','Progresia','Dubla progresie, judecată pe primul set: urci repetările până la capătul intervalului, apoi greutatea. La exercițiile cu pași mari de greutate (cabluri, gantere mici), progresezi prin repetări. Păstrezi aceleași exerciții luni de zile.'],
  ['dumbbell','Volumul','10–20 de seturi directe pe mușchi pe săptămână; mai mult doar pentru 1–3 mușchi pe care îi specializezi. Cel mult ~11 seturi pe mușchi într-o ședință. Recuperarea o judeci după performanță, nu după febra musculară.'],
  ['refresh','Deload','Programat nu ajută (o săptămână de pauză la 4 a dat mai puțină forță). Îl faci doar când performanța scade 1–2 săptămâni la rând sau viața o cere (stres, boală, călătorie): mai puține seturi și 2–3 repetări în plus în rezervă. Antrenorul din antrenament îți spune când.'],
  ['run','Încălzirea','Scurtă și specifică, doar la primul exercițiu compus: ~40% × 8, ~70% × 3–4, ~90% × 1. La următoarele, un set ușor sau deloc. Fără stretching static înainte: nu previne accidentările și scade forța.'],
  ['heart','Hibrid','Alergarea separat de forță (~6 ore) sau după ea; pragul la ≥24 de ore de picioare. Forța reduce accidentările la alergare; Nordic Curl protejează femuralii. Cardio-ul cu impact mic (bicicletă, mers în pantă) interferează cel mai puțin.'],
  ['stopwatch','Când ai puțin timp','Superseturi între exerciții fără mușchi comuni (aceeași creștere, ~jumătate din timp) și drop seturi la ultimul set (−20% greutate, 2–3 coborâri, doar la gantere și aparate).']];
function miloCard(){ return `<details class="card mw-card"><summary><span class="eyebrow">${ic('dumbbell')} Cum lucrezi seriile · Dr. Milo Wolf</span><span class="xs mu">${MILO_RULES.length} reguli</span></summary>
  <ol class="tac-r">${MILO_RULES.map(([icn,t,x])=>`<li><span class="tac-i">${ic(icn)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join('')}</ol>
  <p class="xs mu" style="margin-top:6px">Planul e construit după principiile lui: upper/lower de 4 ori pe săptămână, 2 alergări ușoare în zona 2 și una la prag, plus o zi opțională. În antrenament, antrenorul local îți spune la fiecare serie cât de greu, cât pauză și ce schimbi — fără antrenorul AI.</p></details>`; }
/* o singură dată: deload-ul automat din săptămâna 4 se oprește (Wolf: doar la nevoie). Îl poți porni înapoi din Setări. */
async function miloMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:miloV')||''; }catch(e){}
  if(v==='1') return; await save('deload',false); STC=null; try{ localStorage.setItem('zece3:miloV','1'); }catch(e){} }

/* ---------------------------------------------------------------------
   ANTRENORUL LOCAL (Wolf) — în timp real, din seriile notate, fără tokeni
   --------------------------------------------------------------------- */
/* exerciții unde eșecul e sigur (aparate, cabluri, gantere mici, greutatea corpului) — acolo merg partialele după eșec */
const MW_SAFE=/Machine|Cable|Pulldown|Pull Up|Row|Fly|Raise|Curl|Extension|Pushdown|Crusher|Shrug|Abduction|Crunch|Leg Press|Hammer|Calf|Rollout|Split Squat/;
/* compusele grele de picioare: fără eșec */
const MW_HEAVY=/^(Hack Squat|Romanian Deadlift|Good Morning|Back Squat|Front Squat|Deadlift|Bench Press|Push Press|Close Grip Bench Press)$/;
const mwIso=n=>!COMPOUND.test(n);
/* repetări în rezervă țintă pentru seria i (0..N-1) */
function mwRir(n,i,N){ const [a,b]=MW_HEAVY.test(n)?[3,1]:mwIso(n)?[2,0]:[3,1]; if(N<=1) return b; return Math.round(a-(a-b)*Math.min(i,N-1)/(N-1)); }
const mwRirTxt=r=>r===0?'până la eșec':r+' '+(r===1?'repetare':'repetări')+' în rezervă';
/* tendința de performanță: primul set al ultimelor sesiuni (1RM estimat) */
function mwTrend(n){ const h=liftHist(n).filter(e=>e.d<todayKey()&&e.s.length).slice(-3), v=h.map(e=>e1rm(+e.s[0][0]||0,+e.s[0][1]||0));
  if(v.length<3||v.some(x=>!x)) return null;
  return v[2]<v[0]*.97&&v[1]<v[0]*.985?{drop:true,pct:Math.round((1-v[2]/v[0])*100)}:null; }
/* recomandarea în timp real pentru exercițiul curent: [clasă, text] */
function mwAdvice(e,sets){ const out=[], N=e.sets, i=sets.length, inc=incFor(e.n), last=sets[i-1], first=sets[0];
  const tr=mwTrend(e.n);
  if(!i&&tr) out.push(['warn',`Performanța la ${e.n} a scăzut două sesiuni la rând (−${tr.pct}%). Azi: o serie mai puțin și 2–3 repetări în plus în rezervă — deload doar pe ce are nevoie (Wolf).`]);
  if(last){
    const prev=sets[i-2];
    if(i===1){ const ls=lastSession(e.n,todayKey()), p1=ls&&ls.s[0]?e1rm(+ls.s[0][0]||0,+ls.s[0][1]||0):0, c1=e1rm(+last[0]||0,+last[1]||0);
      if(p1&&c1) out.push(c1>=p1*1.01?['ok',`Primul set e mai bun decât data trecută (+${Math.round((c1/p1-1)*100)}%): ești recuperat și progresezi.`]
        :c1<p1*.95?['warn',`Primul set e cu ${Math.round((1-c1/p1)*100)}% sub data trecută. O zi slabă e normală; dacă se repetă și la următorul antrenament, e semn de oboseală.`]:['info','Primul set, cam ca data trecută.']); }
    if(+last[1]>e.hi+2&&i<N) out.push(['warn',`${last[1]} repetări, peste interval (${e.lo}–${e.hi}): greutatea e prea mică. Urcă ~${num(inc)} kg la seria următoare.`]);
    else if(+last[1]>=e.hi&&i===1&&N>1) out.push(['ok',`Ai atins capătul intervalului pe primul set: data viitoare urci greutatea (dubla progresie se judecă pe primul set).`]);
    else if(+last[1]<e.lo&&i<N) out.push(['warn',`${last[1]} repetări, sub ${e.lo}: scade ~5–10% (≈${num(Math.max(0,Math.round(+last[0]*.92/inc)*inc))} kg) ca să rămâi în interval. Sub 5 repetări setul crește puțin mușchiul.`]);
    if(prev&&+prev[1]-+last[1]>=3&&+last[0]===+prev[0]&&i<N) out.push(['info',`Ai pierdut ${+prev[1]-+last[1]} repetări de la un set la altul: pauza e prea scurtă — ți-am adăugat 30 s la cronometru.`]);
  }
  return out; }
/* ce face seria următoare: ținta de repetări în rezervă, tempo, partialele, pauza */
function mwNext(e,sets){ const N=e.sets, i=Math.min(sets.length,N-1), r=mwRir(e.n,i,N), lastSet=sets.length>=N-1;
  const part=lastSet&&MW_SAFE.test(e.n)&&!MW_HEAVY.test(e.n)?' Apoi, după eșec, 3–5 jumătăți de repetare în partea întinsă.':'';
  return `Seria ${Math.min(sets.length+1,N)}: <b>${mwRirTxt(r)}</b>. Coborâre 2–3 s, pauză scurtă jos, urcare explozivă.${part}`; }
const mwRestCat=e=>MW_HEAVY.test(e.n)&&regionOf(e.n)==='jos'?'compus greu, picioare':COMPOUND.test(e.n)?(regionOf(e.n)==='jos'?'compus, picioare':'compus, partea de sus'):'izolare';
function myoLive(e,x){ const s=S.sess, sets=s.sets[x]||[], M=myoSt(sets), last=sets[sets.length-1], cue=miloCue(e.n), L=[];
  if(M.done) L.push(['ok','Ambele runde sunt gata. Data viitoare: aceeași greutate până faci 20 de repetări la activare, apoi crești.']);
  else if(M.next==='ma') L.push(['info',`Runda ${M.r+1}: <b>12–20 de repetări, la 1–2 de eșec</b>, cu greutatea de la seriile obișnuite sau ceva mai ușoară. Coborâre controlată, stretch jos.`]);
  else L.push(['info',`Mini-setul ${M.mini+1}: <b>3–5 repetări</b> cu aceeași greutate, după ${MYO_PAUZA} s. Te oprești când nu mai faci 3 (sau după ${MYO_MINI} mini-seturi).`]);
  if(last&&last[2]==='ma'&&+last[1]<12) L.push(['warn','Sub 12 repetări la activare: greutatea e prea mare pentru myo-reps. Scade ~10–15% la runda următoare.']);
  if(last&&last[2]==='ma'&&+last[1]>20) L.push(['warn','Peste 20 de repetări: crește greutatea la runda următoare.']);
  return `<div class="mw-live" aria-live="polite"><div class="eyebrow">${ic('coach')} Antrenorul local · Wolf <span class="xs mu">· myo-reps · fără AI</span></div>
    ${L.map(([c,t])=>`<div class="tac-st ${c}">${ic(c==='ok'?'check':c==='info'?'target':'alert')}<span>${t}</span></div>`).join('')}
    ${cue?`<p class="xs mu" style="margin-top:8px">${ic('bolt')} ${esc(cue)}</p>`:''}
    <p class="xs mu2" style="margin-top:6px">Wolf: myo-reps au dovezi mai slabe decât superseturile și drop set-urile; le folosești ca să câștigi timp, cu ~50% mai mult volum (2 runde). Între runde: ${e.rest} s.</p></div>`; }
function miloLive(e,x){ if(myoOn(S.sess,x)) return myoLive(e,x); const s=S.sess, sets=s.sets[x]||[], adv=mwAdvice(e,sets), done=sets.length>=e.sets, cue=miloCue(e.n);
  return `<div class="mw-live" aria-live="polite"><div class="eyebrow">${ic('coach')} Antrenorul local · Wolf <span class="xs mu">· fără AI</span></div>
    ${done?'':`<div class="tac-st info">${ic('target')}<span>${mwNext(e,sets)}</span></div>`}
    ${adv.map(([c,t])=>`<div class="tac-st ${c}">${ic(c==='ok'?'check':c==='info'?'info':'alert')}<span>${esc(t)}</span></div>`).join('')}
    ${cue?`<p class="xs mu" style="margin-top:8px">${ic('bolt')} ${esc(cue)}</p>`:''}
    <p class="xs mu2" style="margin-top:6px">Pauza: ${e.rest} s (${mwRestCat(e)}). Repornești când poți repeta setul și nu mai gâfâi.</p></div>`; }
/* pauza după o serie: +30 s dacă s-au pierdut ≥3 repetări de la setul de dinainte cu aceeași greutate */
function mwRestFor(e,sets){ const n=sets.length, a=sets[n-2], b=sets[n-1];
  return e.rest+(a&&b&&+a[0]===+b[0]&&+a[1]-+b[1]>=3&&n<e.sets?30:0); }
