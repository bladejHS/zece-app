/* =====================================================================
   v16 · MESELE — rețete construite din combinații care se potrivesc, nu la întâmplare:
   ovăzul vine mereu cu whey; fructele, lactatele și nucile stau împreună; roșiile, castraveții și avocado doar la mesele sărate;
   un singur amidon pe farfurie; carnea și peștele cu garniturile lor obișnuite.
   Fiecare rețetă are trei mărimi (mică, normală, mare), ca planul să nimerească ținta zilei.
   Format: [categorie, nume, kcal, proteină, carbohidrați, grăsimi, portabil, fără încălzire, [[aliment, grame]…]]
   Categorii: 0 mic dejun, 1 prânz, 2 cină, 3 gustare. Alimentele noi se adaugă doar la finalul listei (indicii rămân aceiași).
   ===================================================================== */
const MFOOD=["albuș de ou", "ardei gras", "avocado", "banană", "broccoli", "brânză cottage", "cartof dulce copt", "cartofi fierți", "castraveți", "ciuperci", "conopidă", "couscous fiert", "dovlecel", "fasole verde", "file de cod", "fructe de pădure", "fulgi de ovăz", "iaurt grecesc 2%", "linte fiartă", "lipie integrală", "mere", "migdale", "morcovi", "mușchi de porc", "mămăligă", "nuci", "orez alb fiert", "orez basmati fiert", "orez brun fiert", "paste integrale fierte", "piept de curcan", "piept de pui la grătar", "pudră proteică (whey)", "pâine integrală", "quinoa fiartă", "roșii", "salată mixtă", "semințe de dovleac", "skyr", "spanac", "tofu", "ton la conservă + ceapă", "ton în apă (scurs)", "ulei de măsline", "unt de arahide", "varză călită", "vită slabă 5%",
  "ou întreg", "somon", "rondele de orez"];
/* la 100 g, gătit sau gata de mâncat: [kcal, proteină, carbohidrați, grăsimi] (USDA FoodData Central și etichete uzuale) */
const MNUT={"albuș de ou":[52,10.9,.7,.2],"ardei gras":[26,1,6,.3],"avocado":[160,2,8.5,14.7],"banană":[89,1.1,22.8,.3],"broccoli":[34,2.8,6.6,.4],"brânză cottage":[81,10.5,4.8,2.3],
  "cartof dulce copt":[90,2,20.7,.2],"cartofi fierți":[87,1.9,20.1,.1],"castraveți":[15,.7,3.6,.1],"ciuperci":[22,3.1,3.3,.3],"conopidă":[25,1.9,5,.3],"couscous fiert":[112,3.8,23.2,.2],
  "dovlecel":[17,1.2,3.1,.3],"fasole verde":[31,1.8,7,.2],"file de cod":[105,22.8,0,.9],"fructe de pădure":[50,.8,12,.3],"fulgi de ovăz":[379,13.2,67.7,6.5],"iaurt grecesc 2%":[73,10,3.9,1.9],
  "linte fiartă":[116,9,20.1,.4],"lipie integrală":[290,9,48,7],"mere":[52,.3,13.8,.2],"migdale":[579,21.2,21.6,49.9],"morcovi":[41,.9,9.6,.2],"mușchi de porc":[143,26,0,3.5],
  "mămăligă":[75,1.7,16,.4],"nuci":[654,15.2,13.7,65.2],"orez alb fiert":[130,2.7,28.2,.3],"orez basmati fiert":[121,3.5,25.2,.4],"orez brun fiert":[123,2.7,25.6,1],
  "paste integrale fierte":[149,6,30,1.7],"piept de curcan":[147,30,0,2.1],"piept de pui la grătar":[165,31,0,3.6],"pudră proteică (whey)":[390,78,7,5.5],"pâine integrală":[252,12.4,42.7,3.5],
  "quinoa fiartă":[120,4.4,21.3,1.9],"roșii":[18,.9,3.9,.2],"salată mixtă":[17,1.3,3.3,.2],"semințe de dovleac":[559,30.2,10.7,49],"skyr":[63,11,4,.2],"spanac":[23,2.9,3.6,.4],
  "tofu":[144,17.3,2.8,8.7],"ton la conservă + ceapă":[120,22,3,2],"ton în apă (scurs)":[116,25.5,0,.8],"ulei de măsline":[884,0,0,100],"unt de arahide":[588,25,20,50],
  "varză călită":[45,1.3,6,2],"vită slabă 5%":[164,26,0,6.4],"ou întreg":[143,12.6,.7,9.5],"somon":[206,22,0,12.4],"rondele de orez":[387,8.2,81.5,2.8]};
const MEALS=(()=>{
  const out=[], fi=n=>{ const i=MFOOD.indexOf(n); if(i<0) throw new Error('aliment necunoscut: '+n); return i; };
  /* it: [aliment, grame, se scalează]; whey: o măsură (30 g), 40 g la porția mare */
  const SIZES={main:[['',1],[' · porție mică',.75],[' · porție mare',1.3]],snack:[['',1],[' · porție mică',.8],[' · porție mare',1.25]]};
  const add=(cat,name,its,port,cold,sz)=>{ SIZES[sz||'main'].forEach(([sfx,k])=>{
    const ing=its.filter(Boolean).map(([n,g,s])=>[fi(n),n==='pudră proteică (whey)'?(k>1.1?40:g):s?Math.max(5,Math.round(g*k/5)*5):g]);
    const t=ing.reduce((a,[i,g])=>{ const v=MNUT[MFOOD[i]]; return [a[0]+v[0]*g/100,a[1]+v[1]*g/100,a[2]+v[2]*g/100,a[3]+v[3]*g/100]; },[0,0,0,0]);
    out.push([cat,name+sfx,Math.round(t[0]),Math.round(t[1]),Math.round(t[2]),Math.round(t[3]),port?1:0,cold?1:0,ing]); }); };
  const FRUIT=[['banană','banană'],['fructe de pădure','fructe de pădure'],['mere','măr']];
  const NUTS=[['migdale','migdale'],['nuci','nuci'],['unt de arahide','unt de arahide'],['semințe de dovleac','semințe de dovleac']];
  const fg={'banană':100,'fructe de pădure':125,'mere':150};
  /* ---------- mic dejun ---------- */
  FRUIT.forEach(([f,fl])=>[null].concat(NUTS).forEach(nu=>add(0,'Ovăz cu whey și '+fl+(nu?' și '+nu[1]:''),
    [['fulgi de ovăz',60,1],['pudră proteică (whey)',30],[f,fg[f],1],nu&&[nu[0],15]])));
  FRUIT.forEach(([f,fl])=>add(0,'Overnight oats cu whey, skyr și '+fl,[['fulgi de ovăz',50,1],['pudră proteică (whey)',30],['skyr',150,1],[f,fg[f],1]],1,1));
  [['skyr','Skyr'],['iaurt grecesc 2%','Iaurt grecesc'],['brânză cottage','Brânză cottage']].forEach(([d,dl])=>FRUIT.forEach(([f,fl])=>NUTS.forEach(([nu,nl])=>
    add(0,dl+' cu '+fl+' și '+nl,[[d,d==='brânză cottage'?250:350,1],[f,fg[f]+30,1],[nu,25,1]],1,1))));
  [['pâine integrală','pâine integrală'],['lipie integrală','lipie integrală']].forEach(([b,bl])=>[['roșii',150,'roșii'],['ardei gras',150,'ardei'],['spanac',100,'spanac'],['ciuperci',150,'ciuperci']].forEach(([v,vg,vl])=>
    [0,1].forEach(av=>add(0,'Omletă din 2 ouă și albușuri cu '+vl+', '+bl+(av?' și avocado':''),[['ou întreg',100,1],['albuș de ou',150,1],[b,80,1],[v,vg],av&&['avocado',50]]))));
  [['piept de curcan',120,'piept de curcan'],['ton în apă (scurs)',120,'ton'],['brânză cottage',150,'brânză cottage']].forEach(([p,pg,pl])=>[['roșii','roșii'],['castraveți','castraveți'],['ardei gras','ardei']].forEach(([v,vl])=>
    [0,1].forEach(av=>add(0,'Sandviș integral cu '+pl+' și '+vl+(av?' și avocado':''),[['pâine integrală',100,1],[p,pg,1],[v,120],av&&['avocado',50]],1,1))));
  /* ---------- prânz și cină: proteina, garnitura ei și o legumă; ulei doar unde carnea e slabă ---------- */
  const P={pui:['piept de pui la grătar',170,'Pui la grătar'],curcan:['piept de curcan',170,'Piept de curcan'],vita:['vită slabă 5%',160,'Vită slabă'],porc:['mușchi de porc',170,'Mușchi de porc'],
    cod:['file de cod',220,'File de cod'],somon:['somon',150,'Somon'],ton:['ton în apă (scurs)',150,'Ton'],tofu:['tofu',250,'Tofu']};
  const V={'broccoli':'broccoli','ardei gras':'ardei la cuptor','morcovi':'morcovi','fasole verde':'fasole verde','dovlecel':'dovlecel','ciuperci':'ciuperci','spanac':'spanac','conopidă':'conopidă','salată mixtă':'salată','varză călită':'varză călită'};
  const ST=[['orez basmati fiert',250,'orez basmati',['pui','curcan','vita','porc','cod','somon','tofu'],['broccoli','ardei gras','morcovi','fasole verde','dovlecel','ciuperci']],
    ['orez brun fiert',250,'orez brun',['pui','curcan','vita','somon','tofu'],['broccoli','spanac','conopidă','ardei gras']],
    ['cartofi fierți',350,'cartofi',['pui','porc','vita','cod','somon','curcan'],['fasole verde','salată mixtă','broccoli','morcovi']],
    ['cartof dulce copt',300,'cartof dulce',['pui','curcan','vita','somon','cod'],['broccoli','salată mixtă','spanac','fasole verde']],
    ['paste integrale fierte',230,'paste integrale',['pui','vita','ton','curcan'],['broccoli','spanac','ciuperci','dovlecel']],
    ['quinoa fiartă',220,'quinoa',['pui','somon','tofu','curcan'],['salată mixtă','spanac','ardei gras','dovlecel']],
    ['couscous fiert',230,'couscous',['pui','curcan','vita','cod'],['dovlecel','ardei gras','salată mixtă','morcovi']],
    ['mămăligă',350,'mămăligă',['porc','pui','vita'],['varză călită','salată mixtă','ciuperci']]];
  [1,2].forEach(cat=>ST.forEach(([s,sg,sl,ps,vs])=>ps.forEach(pk=>vs.forEach(v=>{ const [p,pg,pl]=P[pk];
    add(cat,pl+' cu '+sl+' și '+V[v],[[p,pg,1],[s,cat===2?Math.round(sg*.8/5)*5:sg,1],[v,200],pk==='somon'||pk==='porc'?null:['ulei de măsline',10]]); }))));
  [['piept de pui la grătar','pui'],['piept de curcan','curcan'],['ton în apă (scurs)','ton']].forEach(([p,pl])=>
    add(1,'Wrap integral cu '+pl+', salată, roșii și avocado',[['lipie integrală',90,1],[p,140,1],['salată mixtă',80],['roșii',80],['avocado',50]],1,1));
  [1,2].forEach(cat=>{ add(cat,'Linte cu orez basmati și spanac',[['linte fiartă',250,1],['orez basmati fiert',150,1],['spanac',150],['ulei de măsline',10]]);
    add(cat,'Ton cu quinoa, salată și roșii',[['ton în apă (scurs)',150,1],['quinoa fiartă',200,1],['salată mixtă',100],['roșii',100],['ulei de măsline',10]],1,1); });
  /* ---------- gustări ---------- */
  const sg={'banană':100,'fructe de pădure':125,'mere':150};
  [['skyr',200,'Skyr'],['iaurt grecesc 2%',200,'Iaurt grecesc'],['brânză cottage',150,'Brânză cottage']].forEach(([d,dg,dl])=>FRUIT.forEach(([f,fl])=>[null].concat(NUTS).forEach(nu=>
    add(3,dl+' cu '+fl+(nu?' și '+nu[1]:''),[[d,dg,1],[f,sg[f],1],nu&&[nu[0],10]],1,1,'snack'))));
  FRUIT.slice(0,2).forEach(([f,fl])=>add(3,'Shake de whey cu '+fl,[['pudră proteică (whey)',30],[f,sg[f],1]],1,1,'snack'));
  add(3,'Ovăz cu whey și fructe de pădure (mic)',[['fulgi de ovăz',30,1],['pudră proteică (whey)',30],['fructe de pădure',80,1]],0,0,'snack');
  add(3,'Rondele de orez cu piept de curcan și castraveți',[['rondele de orez',27,1],['piept de curcan',80,1],['castraveți',100]],1,1,'snack');
  add(3,'Rondele de orez cu brânză cottage și roșii',[['rondele de orez',27,1],['brânză cottage',120,1],['roșii',100]],1,1,'snack');
  [['piept de curcan',70,'piept de curcan'],['ton în apă (scurs)',80,'ton']].forEach(([p,pg,pl])=>[['castraveți','castraveți'],['roșii','roșii']].forEach(([v,vl])=>
    add(3,'Sandviș mic cu '+pl+' și '+vl,[['pâine integrală',50,1],[p,pg,1],[v,80]],1,1,'snack')));
  [['roșii','roșii'],['castraveți','castraveți']].forEach(([v,vl])=>add(3,'2 ouă fierte cu '+vl+' și o felie de pâine integrală',[['ou întreg',100,1],[v,120],['pâine integrală',35,1]],1,1,'snack'));
  return out;
})();
/* planurile salvate țin indicii rețetelor vechi: o singură dată, după ce s-a schimbat baza de rețete, le iau de la capăt */
async function mealsMigrate(){ let v=''; try{ v=localStorage.getItem('zece3:mealsV')||''; }catch(e){}
  if(v==='3') return; if(v!=='2') await save('mplan',{});
  /* v17: alimentele bifate în lista veche de cumpărături (cele cumpărate) devin ce ai acasă, iar planul de azi încolo se reface din ele */
  const got=Object.keys(S.shop||{}).filter(n=>S.shop[n]&&MFOOD.indexOf(n)>=0);
  if(got.length) await save('mf',Object.assign({},S.mf,{have:got.sort(),useHave:true}));
  await planUnlock(); try{ localStorage.setItem('zece3:mealsV','3'); }catch(e){} }
/* planul de azi încolo se reface (după ce schimbi alimentele); zilele trecute rămân cum au fost */
async function planUnlock(){ const tk=todayKey(), mp=Object.assign({},S.mplan||{}); let ch=false;
  Object.keys(mp).forEach(k=>{ if(k>=tk&&mp[k]&&mp[k].m){ const o=Object.assign({},mp[k]); delete o.m; mp[k]=o; ch=true; } }); if(ch) await save('mplan',mp); }
/* planul zilelor din lista de cumpărături se fixează, ca mesele să rămână cele pentru care ai cumpărat */
let PLOCK=false;
async function planLock(ks){ if(PLOCK) return; PLOCK=true;
  try{ const mp=Object.assign({},S.mplan||{}); let ch=false;
    ks.forEach(k=>{ const sv=mp[k]||{}; if(!sv.m){ mp[k]=Object.assign({},sv,{m:planFor(k)}); ch=true; } }); if(ch) await save('mplan',mp); }
  finally{ PLOCK=false; } }
/* ---------- ce ai acasă: cu „doar ce am acasă” pornit, planul alege rețetele făcute numai din alimentele tale
   (uleiul se consideră în casă); dacă la o masă nu ajung, acceptă rețete cu un singur aliment lipsă ---------- */
let MHV={src:null,on:null,set:null};
const mealHave=()=>{ const mf=S.mf||{}, a=mf.useHave?mf.have:null; if(MHV.src!==a||MHV.on!==!!mf.useHave){ MHV={src:a,on:!!mf.useHave,set:Array.isArray(a)&&a.length?new Set(a.map(n=>MFOOD.indexOf(n)).filter(i=>i>=0)):null}; } return MHV.set; };
const mealMiss=m=>{ const h=mealHave(); return h?m[8].filter(([i])=>!h.has(i)&&!/^ulei/.test(MFOOD[i])).length:0; };

/* ---------- ce alimente vrei: cele excluse nu mai apar în nicio rețetă din plan ---------- */
let MEX={src:null,set:new Set()};
const mealEx=()=>{ const a=(S.mf||{}).ex; if(MEX.src!==a){ MEX={src:a,set:new Set((Array.isArray(a)?a:[]).map(n=>MFOOD.indexOf(n)).filter(i=>i>=0))}; } return MEX.set; };
const mealHasEx=m=>{ const ex=mealEx(); return ex.size>0&&m[8].some(([i])=>ex.has(i)); };
function fprefHTML(){
  const mf=S.mf||{}, home=SH.m==='have', ex=new Set(mf.ex||[]), hv=new Set(mf.have||[]), groups={}; MFOOD.forEach(n=>{ const c=FOOD_CAT(n); (groups[c]=groups[c]||[]).push(n); });
  const order=FCAT.map(x=>x[0]).concat(['Altele']).filter(c=>groups[c]);
  const left=MSLOTS.map(([l,cat])=>[l,MEALS.filter(m=>m[0]===cat&&mealOK(m)&&mealMiss(m)===0).length]);
  const got=Object.keys(S.shop||{}).filter(n=>S.shop[n]&&MFOOD.indexOf(n)>=0);
  const chip=n=>home?`<button class="chip fp ${hv.has(n)?'have':'off'}" data-a="fprefH" data-k="${esc(n)}" aria-pressed="${hv.has(n)}">${hv.has(n)?ic('check')+' ':''}${esc(n)}</button>`
    :`<button class="chip fp ${ex.has(n)?'off':'on'}" data-a="fprefT" data-k="${esc(n)}" aria-pressed="${!ex.has(n)}">${esc(n)}</button>`;
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button>
    <div class="eyebrow">${ic('bowl')} Planul de mese</div><div class="h2" style="margin-top:6px">${home?'Ce ai acasă':'Ce alimente mănânci'}</div>
    <div class="seg" role="tablist" style="margin-top:10px"><button class="${home?'':'on'}" data-a="fprefM" data-k="ex" role="tab" aria-selected="${!home}">Nu mănânc</button><button class="${home?'on':''}" data-a="fprefM" data-k="have" role="tab" aria-selected="${home}">Am acasă · ${hv.size}</button></div>
    ${home?`<div class="row" style="margin-top:12px"><div class="sp"><b>Planul folosește doar ce am acasă</b><div class="xs mu">Uleiul se consideră în casă. Dacă la o masă nu ajung rețetele, intră și cele cu un singur aliment lipsă.</div></div>
        <button class="sw ${mf.useHave?'on':''}" data-a="fprefUse" role="switch" aria-checked="${!!mf.useHave}" aria-label="Doar ce am acasă"></button></div>
      <div class="inrow" style="margin-top:10px">${got.length?`<button class="btn ghost sm" data-a="fprefGot">${ic('cart')} Preia din lista bifată (${got.length})</button>`:''}${hv.size?`<button class="btn ghost sm" data-a="fprefHClr">${ic('trash')} Golește</button>`:''}</div>`
      :`<div class="note">Apasă pe un aliment ca să-l scoți (tăiat) sau să-l pui înapoi. Rețetele cu alimente scoase nu mai apar în plan. Ovăzul vine mereu cu whey.</div>`}
    ${order.map(c=>`<div class="dsec"><h4>${esc(c)}</h4><div class="chips">${groups[c].map(chip).join('')}</div></div>`).join('')}
    <div class="dsec"><h4>Rețete ${mf.useHave&&hv.size?'din ce ai acasă':'rămase'}</h4>${left.filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i).map(([l,n])=>`<div class="list-row"><span class="sp">${esc(l)}</span><span class="v ${n?'':'bad'}">${n}</span></div>`).join('')}</div>
    <div class="inrow" style="margin-top:12px">${!home&&ex.size?`<button class="btn ghost" data-a="fprefAll">${ic('refresh')} Toate alimentele</button>`:''}<button class="btn pri" style="flex:1" data-a="shClose">${ic('check')} Gata</button></div>`; }
SHEETS.fpref=()=>fprefHTML();
ACT.fprefOpen=(el,{k})=>{ SH={kind:'fpref',m:k==='have'?'have':'ex'}; shRender(); };
ACT.fprefM=(el,{k})=>{ if(SH&&SH.kind==='fpref'){ SH.m=k==='have'?'have':'ex'; shRender(); } };
async function fprefSet(ex){ await save('mf',Object.assign({},S.mf,{ex:[...new Set(ex)].filter(n=>MFOOD.indexOf(n)>=0).sort()})); await planUnlock(); }
async function haveSet(hv,use){ const mf=Object.assign({},S.mf,{have:[...new Set(hv)].filter(n=>MFOOD.indexOf(n)>=0).sort()}); if(use!=null) mf.useHave=use; await save('mf',mf); await planUnlock(); }
const fpRe=()=>{ shRender(); render(); };
ACT.fprefH=async(el,{k})=>{ if(MFOOD.indexOf(k)<0) return; const hv=new Set((S.mf||{}).have||[]); if(hv.has(k)) hv.delete(k); else hv.add(k); await haveSet([...hv]); fpRe(); };
ACT.fprefUse=async()=>{ await haveSet((S.mf||{}).have||[],!(S.mf||{}).useHave); fpRe(); };
ACT.fprefGot=async()=>{ const got=Object.keys(S.shop||{}).filter(n=>S.shop[n]); await haveSet(((S.mf||{}).have||[]).concat(got),true); fpRe(); toast('Ce ai acasă',got.length+' alimente din lista bifată','info'); };
ACT.fprefHClr=async()=>{ await haveSet([],false); fpRe(); };
ACT.fprefT=async(el,{k})=>{ if(MFOOD.indexOf(k)<0) return; const ex=new Set((S.mf||{}).ex||[]); if(ex.has(k)) ex.delete(k); else ex.add(k); await fprefSet([...ex]); shRender(); render(); };
ACT.fprefAll=async()=>{ await fprefSet([]); shRender(); render(); };
