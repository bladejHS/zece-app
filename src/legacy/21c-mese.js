/* =====================================================================
   v18 · MESELE — zilele din planul tău (antrenament: 6 mese + intra; odihnă: 6 mese), doar alimentele, fără gramajele de pe foaie.
   Ziua de odihnă din planul hibrid ia planul de odihnă, orice altă zi pe cel de antrenament.
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
  iaurt:['iaurt 2%',61,4.2,5.3,2,'p','Proteine']};
/* cele două zile, doar mesele și alimentele lor (fără gramaje). Fiecare masă: [nume, iconiță, notă, parte din proteina, carbohidrații
   și grăsimile zilei, alimente]. Aliment: [cheie, pondere în masă pentru rolul lui] — sau, pentru cele fixe (ou, legume, creatină, EAA), cantitatea.
   Proteina e împărțită egal pe mesele cu proteină (Contest Prep Guide: 3–5+ mese, fiecare cu proteină); în ziua de antrenament
   carbohidrații se strâng în jurul antrenamentului (pre, intra, post), iar grăsimile stau departe de el. */
const MFIX={ou:1,legume:100,creatina:5,eaa:10};
const MPLANS={
  t:{name:'Zi de antrenament',meals:[
    ['Masa 1','sun','',[1/6,.13,.22],[['ovaz',.75],['fruct',.25],['whey',1],['arahide',1]]],
    ['Masa 2','flame','',[1/6,.13,.2],[['orez',1],['pui',1],['ulei',1],['legume']]],
    ['Masa 3','flame','',[1/6,.13,.2],[['orez',1],['pui',1],['ulei',1],['legume']]],
    ['Masa 4 · pre-workout','bolt','cu 60–90 de minute înainte de antrenament',[1/6,.19,.1],[['crema',.6],['whey',1],['fruct',.15],['rondea',.1],['arahide',1],['miere',.15]]],
    ['Intra-workout','drop','în timpul antrenamentului, în apă',[0,.08,0],[['creatina'],['eaa'],['dextrina',1]]],
    ['Masa 5 · post-workout','star','după antrenament',[1/6,.22,0],[['corn',.7],['whey',1],['ananas',.3]]],
    ['Masa 6','moon','',[1/6,.12,.28],[['albus',1],['ou'],['rondea',1],['arahide',1]]]]},
  r:{name:'Zi de odihnă',meals:[
    ['Masa 1','sun','',[1/6,.12,.28],[['albus',1],['ou'],['avocado',1],['toast',1]]],
    ['Masa 2','flame','',[1/6,.22,.2],[['orez',1],['pui',1],['ulei',1],['legume']]],
    ['Masa 3','flame','',[1/6,.22,.08],[['cartof',1],['vita',1],['legume']]],
    ['Masa 4','leaf','',[1/6,.2,.2],[['ovaz',.75],['whey',1],['mar',.25],['arahide',1]]],
    ['Masa 5','star','',[1/6,.16,0],[['corn',1],['whey',1]]],
    ['Masa 6','moon','',[1/6,.08,.24],[['iaurt',.45],['whey',.55],['arahide',1],['fruct',1]]]]}};
const planKind=k=>nutriDay(k).type==='rest'?'r':'t';
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
function dayPlan(k,tg){ tg=tg||targets(k); const kind=planKind(k), P=MPLANS[kind], key=k+'|'+kind+'|'+tg.kcal+'|'+tg.p+'|'+tg.c+'|'+tg.f;
  if(MPC[key]) return MPC[key];
  const MI={p:2,c:3,f:4}, T={p:tg.p,c:tg.c,f:tg.f};
  /* cantitatea de pornire: partea mesei din ținta rolului, împărțită pe alimentele de același rol după pondere */
  const rows=[]; P.meals.forEach(([,,,sh,its],mi)=>{ const rs={p:sh[0],c:sh[1],f:sh[2]};
    its.forEach(([f,w])=>{ const r=MFD[f][5]; if(MFIX[f]!=null){ rows.push({mi,f,r:'x',q:MFIX[f]}); return; }
      const sw=its.filter(([g])=>MFIX[g]==null&&MFD[g][5]===r).reduce((a,[,v])=>a+v,0), per=MFD[f][MI[r]]/100*(MFD[f][7]?MFD[f][8]||1:1);
      rows.push({mi,f,r,q:T[r]*rs[r]*w/sw/per}); }); });
  for(let it=0;it<4;it++){ ['p','c','f'].forEach(r=>{ const own=rows.filter(x=>x.r===r), oth=rows.filter(x=>x.r!==r);
    const from=a=>a.reduce((s,x)=>s+mfMac(x.f,x.q)[MI[r]-1],0), o=from(own); if(o>0){ const s=Math.max(.2,(T[r]-from(oth))/o); own.forEach(x=>{ x.q*=s; }); } }); }
  const meals=P.meals.map(([n,icn,note],mi)=>{ const it=rows.filter(x=>x.mi===mi).map(x=>({f:x.f,q:x.r==='x'?x.q:mfRound(x.f,x.q),opt:x.f==='legume'}));
    const t=mfSum(it.map(x=>[x.f,x.q])); return {n,icn,note,it,k:Math.round(t.k),p:Math.round(t.p),c:Math.round(t.c),g:Math.round(t.g)}; });
  const tot=meals.reduce((a,m)=>({k:a.k+m.k,p:a.p+m.p,c:a.c+m.c,g:a.g+m.g}),{k:0,p:0,c:0,g:0});
  return MPC[key]={kind,name:P.name,meals,tot}; }
/* textul unei cantități: „250 ml”, „3 buc”, „1 felie”, „80 g” */
const mfQty=(f,q)=>{ const u=MFD[f][7]; return u==='buc'?q+' buc':u==='felie'?q+(q===1?' felie':' felii'):u==='ml'?q+' ml':q+' g'; };
/* planurile vechi (rețete generate, filtre, ce ai acasă) nu mai există: o singură dată le șterg */
async function mealsMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:mealsV')||''; }catch(e){}
  if(v==='6') return; await save('mplan',{}); await save('mf',{}); await save('shop',{}); try{ localStorage.setItem('zece3:mealsV','6'); }catch(e){} }
