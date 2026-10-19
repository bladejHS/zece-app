/* =====================================================================
   v18 · MESELE — cele două planuri ale tale, nu rețete generate: ziua de antrenament (6 mese + intra) și ziua de odihnă (6 mese).
   Ziua de odihnă din planul hibrid ia planul de odihnă, orice altă zi pe cel de antrenament.
   „Ajustat la țintă”: proteina rămâne aproape de cea din plan (×0,8–1,2 după ținta de proteină), legumele și suplimentele nu se schimbă,
   iar carbohidrații și grăsimile se scalează împreună până la caloriile țintei (obiectivul: cut, recompoziție, lean bulk), cu împărțirea din planul tău.
   „Original”: gramajele exact ca pe foaie.
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
/* cantitatea din plan: grame, ml sau bucăți (după unitatea alimentului); al treilea câmp = opțional */
const MPLANS={
  t:{name:'Zi de antrenament',meals:[
    ['Masa 1','sun','',[['ovaz',80],['fruct',100],['whey',35],['arahide',20]]],
    ['Masa 2','flame','',[['orez',200],['pui',150],['ulei',5],['legume',100,1]]],
    ['Masa 3','flame','',[['orez',200],['pui',150],['ulei',5],['legume',100,1]]],
    ['Masa 4 · pre-workout','bolt','cu 60–90 de minute înainte de antrenament',[['crema',80],['whey',40],['fruct',100],['rondea',1],['arahide',20],['miere',20]]],
    ['Intra-workout','drop','în timpul antrenamentului, în apă',[['creatina',10],['eaa',15],['dextrina',30]]],
    ['Masa 5 · post-workout','star','după antrenament',[['corn',80],['whey',40],['ananas',200]]],
    ['Masa 6','moon','',[['albus',250],['ou',1],['rondea',3],['arahide',20]]]]},
  r:{name:'Zi de odihnă',meals:[
    ['Masa 1','sun','',[['albus',250],['ou',1],['avocado',70],['toast',1]]],
    ['Masa 2','flame','',[['orez',130],['pui',150],['ulei',10],['legume',100,1]]],
    ['Masa 3','flame','',[['cartof',180],['vita',150],['legume',100,1]]],
    ['Masa 4','leaf','',[['ovaz',60],['whey',40],['mar',100],['arahide',20]]],
    ['Masa 5','star','',[['corn',70],['whey',40]]],
    ['Masa 6','moon','',[['iaurt',200],['whey',20],['arahide',30],['fruct',80]]]]}};
const planKind=k=>nutriDay(k).type==='rest'?'r':'t';
const mfOrig=()=>!!(S.mf||{}).orig;
/* grame reale ale unei cantități din plan */
const mfG=(f,q)=>{ const F=MFD[f]; return F[7]?q*(F[8]||1):q; };
const mfMac=(f,q)=>{ const F=MFD[f], g=mfG(f,q)/100; return [F[1]*g,F[2]*g,F[3]*g,F[4]*g]; };
function mfSum(items){ return items.reduce((a,[f,q])=>{ const m=mfMac(f,q); return {k:a.k+m[0],p:a.p+m[1],c:a.c+m[2],g:a.g+m[3]}; },{k:0,p:0,c:0,g:0}); }
/* rotunjirea: bucățile la întreg (oul cel puțin 1), gramele la 5 */
const mfRound=(f,q)=>{ const F=MFD[f]; if(F[7]==='buc'||F[7]==='felie') return Math.max(F[5]==='p'?1:0,Math.round(q)); return Math.max(0,Math.round(q/5)*5); };
/* planul zilei k: mesele cu cantitățile (ajustate la țintă sau originale) și totalurile */
const MPC={};
function dayPlan(k,tg){ tg=tg||targets(k); const kind=planKind(k), P=MPLANS[kind], orig=mfOrig(), key=k+'|'+kind+'|'+orig+'|'+tg.kcal+'|'+tg.p+'|'+tg.f;
  if(MPC[key]) return MPC[key];
  const all=[].concat(...P.meals.map(m=>m[3])), base=mfSum(all);
  let sp=1, sc=1, sf=1;
  if(!orig){ sp=clamp(tg.p/base.p,.8,1.2);
    const part=r=>mfSum(all.filter(([f])=>MFD[f][5]===r)), Pp=part('p'), Vx=mfSum(all.filter(([f])=>/[vx]/.test(MFD[f][5]))), C=part('c'), F=part('f');
    /* carbohidrații și grăsimile se scalează la fel, ca împărțirea din planul tău să rămână (Fat Loss Forever: alegi o împărțire și o ții);
       doar dacă grăsimile ar coborî sub 60% din ținta lor, urc grăsimile și iau diferența din carbohidrați (Aceto: tai din carbohidrați) */
    const K0=Pp.k*sp+Vx.k, G0=Pp.g*sp+Vx.g, dK=tg.kcal-K0;
    sc=sf=clamp(dK/(C.k+F.k),.3,1.8);
    const gMin=tg.f*.6; if(G0+sc*C.g+sf*F.g<gMin&&F.g>0){ sf=clamp((gMin-G0-sc*C.g)/F.g,sf,1.6); sc=clamp((dK-F.k*sf)/C.k,.3,1.8); } }
  const meals=P.meals.map(([n,icn,note,its])=>{ const it=its.map(([f,q,opt])=>{ const r=MFD[f][5], s=r==='p'?sp:r==='c'?sc:r==='f'?sf:1; return {f,q:orig?q:mfRound(f,q*s),q0:q,opt:!!opt}; }).filter(x=>x.q>0);
    const t=mfSum(it.map(x=>[x.f,x.q])); return {n,icn,note,it,k:Math.round(t.k),p:Math.round(t.p),c:Math.round(t.c),g:Math.round(t.g)}; });
  const tot=meals.reduce((a,m)=>({k:a.k+m.k,p:a.p+m.p,c:a.c+m.c,g:a.g+m.g}),{k:0,p:0,c:0,g:0});
  return MPC[key]={kind,name:P.name,meals,tot,base:{k:Math.round(base.k),p:Math.round(base.p),c:Math.round(base.c),g:Math.round(base.g)},sc,sf,sp,orig}; }
/* textul unei cantități: „250 ml”, „3 buc”, „1 felie”, „80 g” */
const mfQty=(f,q)=>{ const u=MFD[f][7]; return u==='buc'?q+' buc':u==='felie'?q+(q===1?' felie':' felii'):u==='ml'?q+' ml':q+' g'; };
/* planurile vechi (rețete generate, filtre, ce ai acasă) nu mai există: o singură dată le șterg */
async function mealsMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:mealsV')||''; }catch(e){}
  if(v==='5') return; await save('mplan',{}); await save('mf',{}); await save('shop',{}); try{ localStorage.setItem('zece3:mealsV','5'); }catch(e){} }
