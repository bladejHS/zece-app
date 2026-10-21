/* =====================================================================
   v18 · MESELE — zilele din planul tău, doar alimentele, fără gramajele de pe foaie.
   v20: cel mult 4 mese pe zi (antrenament: 4 mese + băutura intra; odihnă: 4 mese), cu aceleași alimente; Norton: 3–5 mese cu proteină.
   Ziua de odihnă din plan ia planul de odihnă, orice altă zi pe cel de antrenament.
   Cantitățile le calculează aplicația din ținta zilei (obiectivul din Tactică: cut, recompoziție, lean bulk).
   Aliment: [nume, kcal, proteină, carbohidrați, grăsimi (la 100 g sau 100 ml), rol, categorie, unitate, grame pe unitate]
   Rol: p proteină, c carbohidrați, f grăsimi, v legume, x suplimente (nu se scalează).
   ===================================================================== */
const MFD={
  ovaz:['fulgi de ovăz',379,13.2,67.7,6.5,'c','Carbohidrați'],
  fruct:['mix de fructe congelate',50,.8,12,.3,'c','Fructe'],
  whey:['whey (pudră proteică)',390,78,7,5.5,'p','Proteine'],
  arahide:['unt de arahide',588,25,20,50,'f','Grăsimi'],
  orez:['orez (cântărit fiert)',130,2.7,28.2,.3,'c','Carbohidrați'],
  pui:['piept de pui (crud)',120,22.5,0,2.6,'p','Proteine'],
  ulei:['ulei de măsline',884,0,0,100,'f','Grăsimi','ml',.92],
  legume:['legume la alegere',30,2,5,.3,'v','Legume'],
  crema:['cremă de orez',370,6,82,1,'c','Carbohidrați'],
  rondea:['rondele de orez',387,8.2,81.5,2.8,'c','Carbohidrați','buc',9],
  miere:['miere',304,.3,82,0,'c','Carbohidrați'],
  creatina:['creatină',0,0,0,0,'x','Suplimente'],
  eaa:['EAA',400,95,0,0,'x','Suplimente'],
  dextrina:['dextrină',380,0,95,0,'c','Suplimente'],
  corn:['corn flakes',378,7,84,.9,'c','Carbohidrați'],
  ananas:['ananas',50,.5,13,.1,'c','Fructe'],
  albus:['albuș de ou',52,10.9,.7,.2,'p','Proteine','ml',1.03],
  ou:['ou întreg',143,12.6,.7,9.5,'p','Proteine','buc',55],
  avocado:['avocado',160,2,8.5,14.7,'f','Grăsimi'],
  toast:['pâine toast',265,8,49,3.5,'c','Carbohidrați','felie',28],
  cartof:['cartofi (cântăriți fierți)',87,1.9,20.1,.1,'c','Carbohidrați'],
  vita:['vită slabă (crudă)',137,21,0,5.5,'p','Proteine'],
  mar:['măr',52,.3,13.8,.2,'c','Fructe'],
  iaurt:['iaurt 2%',61,4.2,5.3,2,'p','Proteine'],
  /* v23: alimente pentru înlocuiri (Norton: dietă flexibilă — schimbi alimentul, păstrezi macronutrienții) */
  curcan:['piept de curcan (crud)',114,23.7,0,1.5,'p','Proteine'],
  ton:['ton în apă (scurs)',116,26,0,1,'p','Proteine'],
  cod:['cod / pește alb (crud)',82,18,0,.7,'p','Proteine'],
  skyr:['skyr',63,11,4,.2,'p','Proteine'],
  vaci:['brânză de vaci slabă',90,13,3.4,2,'p','Proteine'],
  paste:['paste (cântărite fierte)',158,5.8,30.9,.9,'c','Carbohidrați'],
  cartdulce:['cartof dulce (cântărit fiert)',90,2,20.7,.2,'c','Carbohidrați'],
  banana:['banană',89,1.1,22.8,.3,'c','Fructe'],
  migdale:['migdale',579,21,22,50,'f','Grăsimi'],
  nuci:['nuci',654,15,14,65,'f','Grăsimi']};
/* cele două zile, doar mesele și alimentele lor (fără gramaje). Fiecare masă: [nume, iconiță, notă, parte din proteina, carbohidrații
   și grăsimile zilei, alimente]. Aliment: [cheie, pondere în masă pentru rolul lui] — sau, pentru cele fixe (ou, legume, creatină, EAA), cantitatea.
   Proteina e împărțită egal pe mesele cu proteină (Contest Prep Guide: 3–5+ mese, fiecare cu proteină); în ziua de antrenament
   carbohidrații se strâng în jurul antrenamentului (pre, intra, post), iar grăsimile stau departe de el. */
const MFIX={ou:1,legume:100,creatina:5,eaa:10};
/* v25: fibrele la 100 g (Norton: cel puțin 15 g la 1000 kcal) */
const MFIB={ovaz:10.6,fruct:3,arahide:6,orez:.4,legume:2.5,crema:1,rondea:3.4,corn:3,ananas:1.4,avocado:6.7,toast:2.5,cartof:1.8,mar:2.4,paste:1.8,cartdulce:3,banana:2.6,migdale:12.5,nuci:6.7};
const mfFib=(f,q)=>(MFIB[f]||0)*mfG(f,q)/100;
const MPLANS={
  t:{name:'Zi de antrenament',meals:[
    ['Masa 1','sun','dimineața',[1/4,.2,.35],[['ovaz',.75],['fruct',.25],['whey',1],['arahide',1]]],
    ['Masa 2','flame','prânzul',[1/4,.2,.35],[['orez',1],['pui',1],['ulei',1],['legume']]],
    ['Masa 3 · pre-workout','bolt','cu 60–90 de minute înainte de antrenament',[1/4,.27,.1],[['crema',.6],['whey',1],['fruct',.15],['rondea',.1],['arahide',1],['miere',.15]]],
    ['Intra-workout','drop','băutură în timpul antrenamentului, în apă (nu e masă; fără EAA: Norton — inutile când proteina zilei e atinsă)',[0,.08,0],[['creatina'],['dextrina',1]]],
    ['Masa 4 · post-workout','star','după antrenament, ca cină',[1/4,.25,.2],[['orez',.6],['ananas',.4],['pui',.6],['albus',.4],['ou'],['ulei',1],['legume']]]]},
  r:{name:'Zi de odihnă',meals:[
    ['Masa 1','sun','dimineața',[1/4,.2,.35],[['albus',1],['ou'],['avocado',1],['toast',1]]],
    ['Masa 2','flame','prânzul',[1/4,.3,.25],[['orez',1],['pui',1],['ulei',1],['legume']]],
    ['Masa 3','flame','după-amiaza',[1/4,.3,.1],[['cartof',1],['vita',1],['legume']]],
    ['Masa 4','moon','seara',[1/4,.2,.3],[['ovaz',.6],['mar',.2],['fruct',.2],['whey',.7],['iaurt',.3],['arahide',1]]]]}};
const planKind=k=>nutriDay(k).type==='rest'?'r':'t';
/* v23 · înlocuirile (Norton, dieta flexibilă): prof.mSwap['t0:pui']='curcan' — același rol (proteină, carbohidrați, grăsimi), cantitatea
   se recalculează din țintă. Ovăzul doar împreună cu whey (preferința utilizatorului). */
const mSwaps=()=>prof().mSwap||{};
const mfMealFoods=(kind,mi)=>{ const S0=mSwaps(); return MPLANS[kind].meals[mi][4].map(([f])=>S0[kind+mi+':'+f]||f); };
function mfSwapOpts(kind,mi,of){ const now=mSwaps()[kind+mi+':'+of]||of, r=MFD[of][5], foods=mfMealFoods(kind,mi), whey=foods.indexOf('whey')>=0;
  if(of==='whey'&&foods.indexOf('ovaz')>=0) return {now,locked:'Whey rămâne cât timp masa are ovăz (ovăzul doar cu whey).',list:[]};
  const list=Object.keys(MFD).filter(f=>MFD[f][5]===r&&MFIX[f]==null&&f!==now&&(f===of||foods.indexOf(f)<0)&&(f!=='ovaz'||whey)&&f!=='dextrina');
  return {now,list}; }
/* grame reale ale unei cantități (ml și bucăți convertite) */
const mfG=(f,q)=>{ const F=MFD[f]; return F[7]?q*(F[8]||1):q; };
const mfMac=(f,q)=>{ const F=MFD[f], g=mfG(f,q)/100; return [F[1]*g,F[2]*g,F[3]*g,F[4]*g]; };
function mfSum(items){ return items.reduce((a,[f,q])=>{ const m=mfMac(f,q); return {k:a.k+m[0],p:a.p+m[1],c:a.c+m[2],g:a.g+m[3]}; },{k:0,p:0,c:0,g:0}); }
/* rotunjirea: bucățile și feliile la întreg (cel puțin 1), albușul la 10 ml, restul la 5 (cel puțin 5) */
const mfRound=(f,q)=>{ const u=MFD[f][7]; if(u==='buc'||u==='felie') return Math.max(1,Math.round(q)); if(u==='ml'&&f==='albus') return Math.max(10,Math.round(q/10)*10); return Math.max(5,Math.round(q/5)*5); };
/* planul zilei k: cantitățile se calculează din ținta zilei (obiectivul din Tactică). Fiecare aliment primește partea mesei din macronutrientul
   lui (proteină, carbohidrați sau grăsimi); apoi corectez de câteva ori pentru macronutrienții „ascunși” (proteina din ovăz, grăsimea din ou),
   ca totalul zilei să iasă pe țintă. */
const MPC={};
function dayPlan(k,tg){ tg=tg||targets(k); const kind=planKind(k), P=MPLANS[kind], key=k+'|'+kind+'|'+tg.kcal+'|'+tg.p+'|'+tg.c+'|'+tg.f+'|'+JSON.stringify(mSwaps());
  if(MPC[key]) return MPC[key];
  const MI={p:2,c:3,f:4}, T={p:tg.p,c:tg.c,f:tg.f};
  /* cantitatea de pornire: partea mesei din ținta rolului, împărțită pe alimentele de același rol după pondere */
  const rows=[], SW=mSwaps(); P.meals.forEach(([,,,sh,its0],mi)=>{ const rs={p:sh[0],c:sh[1],f:sh[2]}, its=its0.map(([f,w])=>[SW[kind+mi+':'+f]||f,w,f]);
    its.forEach(([f,w,of])=>{ const r=MFD[f][5]; if(MFIX[f]!=null){ rows.push({mi,f,of,r:'x',q:MFIX[f]}); return; }
      const sw=its.filter(([g])=>MFIX[g]==null&&MFD[g][5]===r).reduce((a,[,v])=>a+v,0), per=MFD[f][MI[r]]/100*(MFD[f][7]?MFD[f][8]||1:1);
      rows.push({mi,f,of,r,q:T[r]*rs[r]*w/sw/per}); }); });
  for(let it=0;it<4;it++){ ['p','c','f'].forEach(r=>{ const own=rows.filter(x=>x.r===r), oth=rows.filter(x=>x.r!==r);
    const from=a=>a.reduce((s,x)=>s+mfMac(x.f,x.q)[MI[r]-1],0), o=from(own); if(o>0){ const s=Math.max(.2,(T[r]-from(oth))/o); own.forEach(x=>{ x.q*=s; }); } }); }
  const meals=P.meals.map(([n,icn,note],mi)=>{ const it=rows.filter(x=>x.mi===mi).map(x=>({f:x.f,of:x.of,sw:x.f!==x.of,q:x.r==='x'?x.q:mfRound(x.f,x.q),opt:x.f==='legume'}));
    const t=mfSum(it.map(x=>[x.f,x.q])), fb=it.reduce((a,x)=>a+mfFib(x.f,x.q),0); return {n,icn,note,it,k:Math.round(t.k),p:Math.round(t.p),c:Math.round(t.c),g:Math.round(t.g),fb:Math.round(fb)}; });
  const tot=meals.reduce((a,m)=>({k:a.k+m.k,p:a.p+m.p,c:a.c+m.c,g:a.g+m.g,fb:a.fb+m.fb}),{k:0,p:0,c:0,g:0,fb:0});
  return MPC[key]={kind,name:P.name,meals,tot}; }
/* textul unei cantități: „250 ml”, „3 buc”, „1 felie”, „80 g” */
const mfQty=(f,q)=>{ const u=MFD[f][7]; return u==='buc'?q+' buc':u==='felie'?q+(q===1?' felie':' felii'):u==='ml'?q+' ml':q+' g'; };
/* planurile vechi (rețete generate, filtre, ce ai acasă) nu mai există: o singură dată le șterg */
async function mealsMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:mealsV')||''; }catch(e){}
  if(v==='6') return; await save('mplan',{}); await save('mf',{}); await save('shop',{}); try{ localStorage.setItem('zece3:mealsV','6'); }catch(e){} }
/* foaia de înlocuire a unui aliment din plan */
SHEETS.mfSwap=()=>{ const [kind,rest]=[SH.k[0],SH.k.slice(1)], mi=+rest.split(':')[0], of=rest.split(':')[1], o=mfSwapOpts(kind,mi,of), M=MPLANS[kind].meals[mi];
  const btn=f=>`<button class="list-row linkb2" style="width:100%" data-a="mfSwapSet" data-k="${esc(SH.k)}" data-v="${f}"><span class="sp"><b>${esc(MFD[f][0])}</b><div class="xs mu">${MFD[f][1]} kcal · P ${MFD[f][2]} · C ${MFD[f][3]} · G ${MFD[f][4]} la 100 ${MFD[f][7]==='ml'?'ml':'g'}</div></span>${f===of?'<span class="tag">original</span>':''}</button>`;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('refresh')} ${esc(MPLANS[kind].name)} · ${esc(M[0])}</div>
    <div class="h2" style="margin-top:6px">În loc de ${esc(MFD[o.now][0])}</div>
    <div class="sm mu" style="margin-top:6px">Norton: dieta flexibilă ține pe termen lung. Alegi alt aliment cu același rol; cantitatea se recalculează ca masa să rămână pe aceeași proteină, carbohidrați și grăsimi. Schimbarea rămâne pentru toate zilele de ${kind==='t'?'antrenament':'odihnă'}.</div>
    ${o.locked?`<div class="note">${ic('info')} ${esc(o.locked)}</div>`:`<div style="margin-top:10px">${o.list.map(btn).join('')}</div>`}`; };
ACT.mfSwap=(el,{k})=>{ SH={kind:'mfSwap',k}; shRender(); };
ACT.mfSwapSet=async(el,{k})=>{ const v=el.dataset.v, of=k.split(':')[1]; if(!MFD[v]) return; const m=Object.assign({},mSwaps()); if(v===of) delete m[k.slice(0)]; else m[k]=v;
  await save('prof',Object.assign({},S.prof||{},{mSwap:m})); STC=null; SH=null; shRender(); render(); toast('Înlocuit',MFD[v][0]+' · cantitățile s-au recalculat','info'); };
