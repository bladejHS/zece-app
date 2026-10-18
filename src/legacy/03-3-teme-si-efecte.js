/* =====================================================================
   3 · TEME ȘI EFECTE
   ===================================================================== */
/* fiecare culoare de accent are o variantă pentru tema luminoasă (L): mai închisă, ca textul și liniile să rămână lizibile pe alb */
/* paletele ZECE (Industrial Tactical Premium): doar culori desaturate. Tactical: efort amber, repaus cyan */
const THEMES={
  tactical:{n:'Tactical',ac:'#E8A84C',ac2:'#6BB8C9',hi:'#EDB765',lo:'#C98D35',on:'#0B0C0E',L:{ac:'#A8721F',ac2:'#3D8597',hi:'#B57D27',lo:'#8F5F17',on:'#FFFFFF'}},
  otel:{n:'Oțel',ac:'#8FAFC9',ac2:'#B9CCDC',hi:'#A0BCD3',lo:'#7095B5',on:'#0A1118',L:{ac:'#3F6788',ac2:'#5A80A0',hi:'#4A7394',lo:'#355A78',on:'#FFFFFF'}},
  onix:{n:'Onix',ac:'#D5DAE0',ac2:'#9AA1AA',hi:'#E4E8EC',lo:'#B5BCC4',on:'#0B0C0E',L:{ac:'#121418',ac2:'#4A5058',hi:'#2A2E34',lo:'#121418',on:'#FFFFFF'}}
};
/* tema: întunecată (implicit), luminoasă sau automată (după sistem) */
const MQ_LIGHT=matchMedia('(prefers-color-scheme: light)');
const modeNow=()=>S.mode==='light'||(S.mode==='auto'&&MQ_LIGHT.matches)?'light':'dark';
const TH=()=>{ const b=THEMES[S.theme]||THEMES.tactical; return modeNow()==='light'&&b.L?Object.assign({},b,b.L):b; };
function applyTheme(){ const m=modeNow(), t=TH(), h=document.documentElement, r=h.style;
  if(m==='light') h.setAttribute('data-mode','light'); else h.removeAttribute('data-mode');
  r.setProperty('--ac',t.ac); r.setProperty('--ac2',t.ac2); r.setProperty('--hi',t.hi); r.setProperty('--lo',t.lo); r.setProperty('--on',t.on);
  Object.keys(THEMES).forEach(k=>h.classList.toggle('th-'+k,k===(THEMES[S.theme]?S.theme:'tactical')));
  h.classList.toggle('bg-black',S.bg==='black');
  const mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.setAttribute('content',m==='light'?'#E9EBEE':'#050607'); }
try{ MQ_LIGHT.addEventListener('change',()=>{ if(S.mode==='auto'){ applyTheme(); render(); } }); }catch(e){}
/* schimbarea temei, cu o tranziție scurtă doar pe culori */
async function setMode(m){ if(['dark','light','auto'].indexOf(m)<0) return; const h=document.documentElement; h.classList.add('mode-tr');
  await save('mode',m); applyTheme(); render(); setTimeout(()=>h.classList.remove('mode-tr'),350); }
ACT.modeToggle=()=>setMode(modeNow()==='light'?'dark':'light');
ACT.modeSet=(el,{k})=>setMode(k);
ACT.bgSet=async(el,{k})=>{ if(['anthr','black'].indexOf(k)<0) return; await save('bg',k); applyTheme(); render(); };
/* poza de copertă (ecranul de pornire și „Azi"): build.ps1 o pune aici ca data:, versiunea online o ia din cover.jpg */
const COVER='cover.jpg';
/* url() într-o variabilă CSS se citește față de foaia de stil (în _astro/), nu față de pagină: adresa se face completă */
const cssUrl=p=>`url("${new URL(p,document.baseURI).href}")`;
if(COVER) document.documentElement.style.setProperty('--cover',cssUrl(COVER));
/* „Automat" urmează setarea sistemului (Windows: Efecte de animație; iPhone: Reducere mișcare) */
const MQ_RM=matchMedia('(prefers-reduced-motion: reduce)');
const motionOff=()=>S.motion==='off'||(S.motion!=='on'&&MQ_RM.matches);
function applyMotion(){ document.documentElement.classList.toggle('rm',motionOff()); }
function applyFx(){
  applyMotion();
  document.body.classList.remove('fx-min','fx-normal','fx-max'); document.body.classList.add('fx-'+S.fx);
  if(S.fx==='max'&&!motionOff()&&!document.hidden) ptStart(); else ptStop();
}
const catCol=c=>c==='lift'?TH().ac:c==='mix'?TH().ac2:c==='run'?COL().run:COL().ok;
const CAT={mix:['Alergare + forță','mix'],run:['Alergare','run'],lift:['Forță','lift'],rest:['Recuperare','rest']};
/* particule (doar la efecte maxime) */
const PT={on:false,raf:0,ps:[]};
function ptStart(){
  if(PT.on) return; const c=$('#pt'); if(!c||!c.getContext) return; PT.on=true;
  const ctx=c.getContext('2d'), dpr=Math.min(2,devicePixelRatio||1);
  const size=()=>{ c.width=innerWidth*dpr; c.height=innerHeight*dpr; }; size(); PT.size=size; addEventListener('resize',size);
  PT.ps=Array.from({length:30},()=>({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.8,v:.0002+Math.random()*.0005,a:.15+Math.random()*.5,w:Math.random()*6.28}));
  const step=()=>{ if(!PT.on) return; ctx.clearRect(0,0,c.width,c.height); const col=TH().ac;
    ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8*dpr;
    PT.ps.forEach(p=>{ p.y-=p.v; p.w+=.012; if(p.y<-.02){ p.y=1.02; p.x=Math.random(); }
      ctx.globalAlpha=p.a*(.55+.45*Math.sin(p.w*3)); ctx.beginPath(); ctx.arc((p.x+Math.sin(p.w)*.012)*c.width,p.y*c.height,p.r*dpr,0,6.283); ctx.fill(); });
    PT.raf=requestAnimationFrame(step); };
  step();
}
function ptStop(){ if(!PT.on) return; PT.on=false; cancelAnimationFrame(PT.raf); if(PT.size) removeEventListener('resize',PT.size);
  const c=$('#pt'); if(c&&c.getContext) c.getContext('2d').clearRect(0,0,c.width,c.height); }
