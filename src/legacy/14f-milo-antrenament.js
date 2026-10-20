/* =====================================================================
   v18 · ANTRENAMENTUL DUPĂ DR. MILO WOLF — principiile din videoclipurile lui (volum, apropierea de eșec, stretch-ul,
   pauzele, progresia, deload-ul) și câte o indicație de execuție la fiecare exercițiu din plan.
   Seriile și repetările din plan nu se schimbă; se schimbă cum lucrezi fiecare set.
   ===================================================================== */
const MILO_CUE={
  'Bench Press':'Cobori controlat până atingi pieptul, pauză scurtă jos, împingi exploziv. Seturi grele fără spotter: 1–2 repetări în rezervă, fără eșec.',
  'Pull Up / Lat Pulldown':'Atârnare completă sus, cu umerii întinși; tragi exploziv. Pe ultimul set, după eșec, continui cu jumătăți de repetare în partea întinsă.',
  'Weighted Pull Up':'Atârnare completă la fiecare repetare. Pe ultimul set, după eșec, jumătăți de repetare de jos (partea întinsă).',
  'Hammer Chest Press':'Mânerele cât mai în spate (stretch în piept), pauză scurtă, exploziv. Ultimul set până la eșec, apoi jumătăți de repetare în stretch.',
  'Chest Supported Row':'Brațele complet întinse jos, omoplații depărtați. După eșec, jumătăți de repetare în poziția întinsă.',
  'Lateral Raise':'Ganterele sau cablul cu tensiune jos: aplecat puțin lateral sau cu cablul din spatele corpului. După eșec, jumătăți de repetare în partea de jos.',
  'Dumbbell Lateral Raise':'Aplecat puțin în lateral, ca tensiunea să înceapă de jos. După eșec, jumătăți de repetare în partea de jos.',
  'Tricep Pushdown':'Lasă coatele să urce puțin în față la revenire, pentru mai mult stretch. Pentru triceps, extensia peste cap a crescut mai mult mușchiul în studii.',
  'Tricep Rope Pushdown':'Lasă coatele să urce puțin în față la revenire, pentru mai mult stretch. Ultimul set până la eșec.',
  'Tricep Overhead Extension':'Cel mai bun exercițiu pentru triceps (capul lung întins): cobori cât mai jos în spatele capului. După eșec, jumătăți de repetare jos.',
  'Bicep Curl':'Brațul complet întins jos. Cel mai bine: curl pe bancă înclinată (umărul în spate) sau Bayesian la cablu.',
  'Alternating Dumbbell Curl':'Brațul complet întins jos; ideal cu brațul puțin în spatele corpului (curl înclinat). Ultimul set până la eșec.',
  'Barbell Curl':'Brațele complet întinse jos, fără pauză sus. Puțin balans la final e ok (studiu: cheat ≈ strict).',
  'Flat Dumbbell Press':'Ganterele coboară sub nivelul pieptului (stretch adânc), pauză scurtă, exploziv.',
  'Incline Dumbbell Press':'Ganterele coboară adânc, lângă piept, pauză scurtă, exploziv. Primul set la 2–3 repetări în rezervă, ultimul la eșec.',
  'Seated Overhead Press':'Cobori până sub bărbie; primele seturi la 2 repetări în rezervă, ultimul la 0–1.',
  'Cable Face Pull':'Brațele complet întinse în față la revenire. După eșec, jumătăți de repetare.',
  'Close Grip Bench Press':'Coatele aproape de corp, atingi pieptul; 1–2 repetări în rezervă.',
  'Push Press':'Mișcare de putere: viteză maximă la fiecare repetare, fără eșec.',
  'Hack Squat':'Cât de jos poți cu spatele lipit (stretch în cvadriceps). Seturile grele la 1–2 repetări în rezervă.',
  'Romanian Deadlift':'Genunchii rămân pe loc, șoldurile pleacă în spate până simți stretch-ul în femurali (puțin sub genunchi). 1–2 repetări în rezervă: e foarte obositor.',
  'Walking Lunge':'Pas lung, genunchiul din spate aproape de sol (stretch în fesieri). 1–2 repetări în rezervă.',
  'Hip Thrust':'E greu sus (poziția scurtă): după eșec continui cu jumătăți de repetare în partea de jos.',
  'Leg Press':'Cât mai jos fără să se rotunjească spatele. Ultimul set până la eșec, apoi jumătăți de repetare jos.',
  'Hamstring Curl':'Dacă ai aparat la șezut, folosește-l: a crescut femuralii mai mult decât cel culcat (șoldul îndoit îi întinde).',
  'Calf Raise':'Pauză de 1–2 s jos, în stretch maxim. După eșec, jumătăți de repetare în partea de jos (+40% creștere în studiul lui).',
  'Hanging Leg Raise':'Fără balans, până la eșec tehnic: te oprești când o repetare durează câteva secunde.',
  'Dragon Flag':'Până la eșec tehnic, cu negative lente.',
  'Ab Wheel Rollout':'Cât mai întins în față (stretch în abdomen), până la eșec tehnic.',
  'Pallof Press':'Până la eșec tehnic, pe fiecare parte.',
  'Plank':'Pentru creștere, abdomenul răspunde mai bine la exerciții dinamice duse la eșec.'};
const miloCue=n=>MILO_CUE[n]||'';
/* principiile pentru seturi, pe scurt (cardul din Plan) */
const MILO_RULES=[
  ['target','Cât de greu','Primul set al unui exercițiu la 2–3 repetări în rezervă, apoi te apropii set cu set; ultimul set la 0–1, adică la eșec. Eșecul îl lași pentru exercițiile de izolare și pentru finalul ședinței (Refalo: eșecul devreme a scăzut creșterea la exercițiul de după).'],
  ['clock','Pauzele','Cronometrate: 60–90 s la izolare și partea de sus, 90–120 s la compusele de picioare. Peste 2 minute nu crește masa (meta-analiză, 9 studii); pauzele lungi rămân doar la seturile grele de forță.'],
  ['bolt','Stretch-ul','Amplitudine completă, frânezi în poziția întinsă, pauză scurtă jos, urci exploziv; fără pauză sus. Unde e sigur, după eșec continui cu jumătăți de repetare în partea întinsă (~40 de studii: varianta întinsă bate sau egalează mereu).'],
  ['chart','Progresia','La izolare adaugi o repetare, la compusele grele ~2,5 kg; în intervalul de repetări urci până la capătul de sus, apoi crești greutatea. Fără progresie, creșterea s-a înjumătățit (Kassiano 2026). Tehnica mai bună (mai adânc) e cea mai bună progresie.'],
  ['dumbbell','Volumul','Mai multe seturi = mai multă creștere, cu randamente descrescătoare (dublarea volumului ≈ +50%); cel mult ~11 seturi pe mușchi într-o ședință. Recuperarea o judeci după performanță, nu după febra musculară.'],
  ['refresh','Deload','Programat nu crește masa (Pelland: 99% șanse ca antrenamentul continuu să fie mai bun). Îl faci doar când performanța scade o săptămână sau viața o cere: 2–4 seturi pe mușchi, cu 2–3 repetări în plus în rezervă.'],
  ['run','Încălzirea','Scurtă și specifică: bara goală, apoi urci treptat la greutatea de lucru. Fără stretching static înainte: nu previne accidentările și scade forța.'],
  ['stopwatch','Când ai puțin timp','Superseturi între exerciții fără mușchi comuni (aceeași creștere, ~jumătate din timp) și drop seturi la ultimul set (−20% greutate, 2–3 coborâri).']];
function miloCard(){ return `<details class="card mw-card"><summary><span class="eyebrow">${ic('dumbbell')} Cum lucrezi seriile · Dr. Milo Wolf</span><span class="xs mu">${MILO_RULES.length} reguli</span></summary>
  <ol class="tac-r">${MILO_RULES.map(([icn,t,x])=>`<li><span class="tac-i">${ic(icn)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join('')}</ol>
  <p class="xs mu" style="margin-top:6px">Seriile și repetările din plan au rămas aceleași. La fiecare exercițiu vezi indicația lui de execuție; mai multe în Știință → Milo Wolf.</p></details>`; }
/* o singură dată: deload-ul automat din săptămâna 4 se oprește (Wolf: doar la nevoie). Îl poți porni înapoi din Setări. */
async function miloMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:miloV')||''; }catch(e){}
  if(v==='1') return; await save('deload',false); STC=null; try{ localStorage.setItem('zece3:miloV','1'); }catch(e){} }
