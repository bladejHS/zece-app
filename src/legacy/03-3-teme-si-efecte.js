/* =====================================================================
   3 · TEME ȘI EFECTE
   ===================================================================== */
/* fiecare culoare de accent are o variantă pentru tema luminoasă (L): mai închisă, ca textul și liniile să rămână lizibile pe alb */
const THEMES={
  otel:{n:'Oțel',ac:'#6E9BC7',ac2:'#A9C6E4',hi:'#86AFD8',lo:'#5584B3',on:'#08111B',L:{ac:'#2F6496',ac2:'#4C82B8',hi:'#3A72A8',lo:'#265583',on:'#FFFFFF'}},
  onix:{n:'Onix',ac:'#F4F4F5',ac2:'#A1A1AA',hi:'#F4F4F5',lo:'#C9C9CE',on:'#0A0A0B',L:{ac:'#0D0D10',ac2:'#55555E',hi:'#2A2A30',lo:'#0D0D10',on:'#FFFFFF'}},
  jar:{n:'Jar',ac:'#FF4D2E',ac2:'#FF8A3D',hi:'#FF5C3D',lo:'#E5391D',on:'#FFFFFF',L:{ac:'#E23E1C',ac2:'#F07A2E',hi:'#EF4C2A',lo:'#CC3416',on:'#FFFFFF'}},
  neon:{n:'Neon',ac:'#A3E635',ac2:'#D9F99D',hi:'#B5F24A',lo:'#7CC21A',on:'#0B0F05',L:{ac:'#4F8F0E',ac2:'#78B81C',hi:'#5DA314',lo:'#43790B',on:'#FFFFFF'}},
  violet:{n:'Violet',ac:'#8B5CF6',ac2:'#C084FC',hi:'#9B6DFF',lo:'#7337E8',on:'#FFFFFF',L:{ac:'#7646E6',ac2:'#A66BF2',hi:'#8455F0',lo:'#6533D6',on:'#FFFFFF'}},
  aur:{n:'Aur',ac:'#F5A524',ac2:'#FFD166',hi:'#FFB53D',lo:'#DC8A0A',on:'#151005',L:{ac:'#BF7A00',ac2:'#DB9C1C',hi:'#CC8608',lo:'#A56A00',on:'#FFFFFF'}},
  roz:{n:'Roz',ac:'#FF2D78',ac2:'#FF7AB0',hi:'#FF4A8C',lo:'#DB1260',on:'#FFFFFF',L:{ac:'#DE1664',ac2:'#F2609A',hi:'#EA2A72',lo:'#C20E55',on:'#FFFFFF'}},
  gheata:{n:'Gheață',ac:'#22D3EE',ac2:'#A5F3FC',hi:'#3ADCF2',lo:'#0EA5C6',on:'#04161A',L:{ac:'#0A8CAD',ac2:'#1FB3D2',hi:'#0C9BBE',lo:'#087894',on:'#FFFFFF'}},
  nightops:{n:'Night Ops',ac:'#39FF14',ac2:'#2BD90E',hi:'#4FFF2A',lo:'#1FA80A',on:'#000000'}
};
/* tema: întunecată (implicit), luminoasă sau automată (după sistem) */
const MQ_LIGHT=matchMedia('(prefers-color-scheme: light)');
const modeNow=()=>S.mode==='light'||(S.mode==='auto'&&MQ_LIGHT.matches)?'light':'dark';
const TH=()=>{ const b=THEMES[S.theme]||THEMES.otel; return modeNow()==='light'&&b.L?Object.assign({},b,b.L):b; };
function applyTheme(){ const m=modeNow(), t=TH(), h=document.documentElement, r=h.style;
  if(m==='light') h.setAttribute('data-mode','light'); else h.removeAttribute('data-mode');
  r.setProperty('--ac',t.ac); r.setProperty('--ac2',t.ac2); r.setProperty('--hi',t.hi); r.setProperty('--lo',t.lo); r.setProperty('--on',t.on);
  Object.keys(THEMES).forEach(k=>h.classList.toggle('th-'+k,k===(THEMES[S.theme]?S.theme:'otel')));
  h.classList.toggle('bg-black',S.bg==='black');
  const mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.setAttribute('content',m==='light'?'#F2F2EF':S.bg==='black'?'#050506':'#0E1013'); }
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
