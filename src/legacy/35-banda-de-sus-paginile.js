/* =====================================================================
   v9 · BANDA DE SUS — paginile principale încep cu o bandă din poza de pe copertă, cu titlul și cifra-cheie a paginii,
   în același stil cu Acasă (antetul e transparent peste ea cât timp ești sus).
   ===================================================================== */
/* antetele Antrenament, Performanță și Nutriție au ilustrațiile lor (scripts/build-art.mjs); restul păstrează coperta */
const BAND_PH={"nutri":"art/band-nutri.svg","plan":"art/band-plan.svg","prog":"art/band-prog.svg"};
Object.keys(BAND_PH).forEach(k=>{ try{ document.documentElement.style.setProperty('--band-'+k,cssUrl(BAND_PH[k])); }catch(e){} });
const BANDS={
  plan:()=>{ if(trTabNow()==='hyb'){ const wk=+hyb().wk||0, full=HYB_DAYS.filter((_,d)=>hybDayFull(wk,d)).length, nh=hybNext(); return {e:'HYBRID · Alex Viada'+(mainHyb()?' · principal':''),t:'Antrenament',s:'Săptămâna '+(wk+1)+' · '+full+' din 7 zile complete'+(nh?' · următorul: '+DAYN[nh.d]:''),p:full/7}; }
    const nx=nextDay(), full=cycleDaysDone(); return {e:'Ciclul '+cyc()+' · planul hibrid',t:'Antrenament',s:full+' din '+WEEKS*7+' zile complete'+(nx?' · următorul: S'+(nx.w+1)+' · '+DAYN[nx.d]:' · ciclu complet'),p:full/(WEEKS*7)}; },
  prog:()=>{ const tk=todayKey(), o=ixSum(dayShift(tk,-29),tk); return {e:'Ultimele 30 de zile',t:'Performanță',s:[o.days+(o.days===1?' zi activă':' zile active'),o.vol>0?num(o.vol/1000,1)+' t ridicate':'',o.km>0?num(o.km,1)+' km alergați':''].filter(Boolean).join(' · ')}; },
  nutri:()=>{ const tk=todayKey(), tg=targets(), d=dayTotals(tk); return {e:'Azi',t:'Nutriție',s:Math.round(d.k)+' / '+tg.kcal+' kcal · '+Math.round(d.p)+' / '+tg.p+' g proteină',p:tg.kcal>0?clamp(d.k/tg.kcal,0,1):0}; },
  set:()=>({e:'FALCO',t:'Setări',s:'Profil, aspect, conexiuni și datele tale'})
};
function bandHTML(k){ let b=null; try{ b=BANDS[k](); }catch(e){ errLog((e&&e.message)||e,'band '+k); return ''; }
  return `<div class="band" data-b="${k}"><div class="band-ph" aria-hidden="true"></div><div class="band-fd" aria-hidden="true"></div>
    <div class="band-t"><div class="eyebrow">${esc(b.e)}</div><div class="h1">${esc(b.t)}</div><div class="band-s">${esc(b.s)}</div>${b.p!=null?`<div class="cv-pb"><i style="width:${(b.p*100).toFixed(1)}%"></i></div>`:''}</div></div>`; }
