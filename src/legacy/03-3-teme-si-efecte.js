/* =====================================================================
   3 · TEME ȘI EFECTE
   ===================================================================== */
/* FALCO are un singur sistem vizual: negru adânc, alb curat, albastru de cer folosit cu măsură.
   ac = accentul (cer), ac2 = al doilea ton (argint luminos); L = varianta pentru modul luminos, mai închisă, ca să rămână lizibilă pe alb */
const THEMES={
  falco:{n:'FALCO',ac:'#9CC9F2',ac2:'#DCE4EC',hi:'#B7D8F6',lo:'#7DB2E3',on:'#06121D',L:{ac:'#2C679C',ac2:'#4F5A66',hi:'#3577B0',lo:'#235684',on:'#FFFFFF'}}
};
/* tema: întunecată (implicit), luminoasă sau automată (după sistem) */
const MQ_LIGHT=matchMedia('(prefers-color-scheme: light)');
const modeNow=()=>S.mode==='light'||(S.mode==='auto'&&MQ_LIGHT.matches)?'light':'dark';
const TH=()=>{ const b=THEMES.falco; return modeNow()==='light'&&b.L?Object.assign({},b,b.L):b; };
function applyTheme(){ const m=modeNow(), t=TH(), h=document.documentElement, r=h.style;
  if(m==='light') h.setAttribute('data-mode','light'); else h.removeAttribute('data-mode');
  r.setProperty('--ac',t.ac); r.setProperty('--ac2',t.ac2); r.setProperty('--hi',t.hi); r.setProperty('--lo',t.lo); r.setProperty('--on',t.on);
  Object.keys(THEMES).forEach(k=>h.classList.toggle('th-'+k,k==='falco'));
  h.classList.toggle('bg-black',S.bg==='black');
  const mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.setAttribute('content',m==='light'?'#F4F5F7':'#050505'); }
try{ MQ_LIGHT.addEventListener('change',()=>{ if(S.mode==='auto'){ applyTheme(); render(); } }); }catch(e){}
/* schimbarea temei, cu o tranziție scurtă doar pe culori */
async function setMode(m){ if(['dark','light','auto'].indexOf(m)<0) return; const h=document.documentElement; h.classList.add('mode-tr');
  await save('mode',m); applyTheme(); render(); setTimeout(()=>h.classList.remove('mode-tr'),350); }
ACT.modeToggle=()=>setMode(modeNow()==='light'?'dark':'light');
ACT.modeSet=(el,{k})=>setMode(k);
ACT.bgSet=async(el,{k})=>{ if(['anthr','black'].indexOf(k)<0) return; await save('bg',k); applyTheme(); render(); };
/* ilustrația de copertă (Acasă și ghidul de pornire): trei rândunici, generată de scripts/build-art.mjs */
const COVER='art/cover.svg';
/* url() într-o variabilă CSS se citește față de foaia de stil (în _astro/), nu față de pagină: adresa se face completă */
const cssUrl=p=>`url("${new URL(p,document.baseURI).href}")`;
if(COVER){ document.documentElement.style.setProperty('--cover',cssUrl(COVER)); document.documentElement.style.setProperty('--cover-wide',cssUrl('art/cover-wide.svg')); }
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
const CAT={mix:['Forță + alergare','mix'],run:['Alergare','run'],lift:['Forță','lift'],rest:['Recuperare','rest']};
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
