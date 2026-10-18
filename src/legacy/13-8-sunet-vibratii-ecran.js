/* =====================================================================
   8 · SUNET, VIBRAȚII, ECRAN APRINS
   Sunetele pauzei și ale cronometrului sunt programate pe ceasul audio,
   ca să se audă la timp și când browserul încetinește pagina (ecran blocat).
   ===================================================================== */
const AU={ctx:null,sched:{},keep:null};
function actxGet(){ try{ AU.ctx=AU.ctx||new (window.AudioContext||window.webkitAudioContext)(); if(AU.ctx.state==='suspended') AU.ctx.resume(); }catch(e){} return AU.ctx; }
function tone(f,d,at,vol){ const c=actxGet(); if(!c||!S.sound) return null;
  try{ const o=c.createOscillator(), g=c.createGain(), t=at!=null?at:c.currentTime, v=vol||.35;
    o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+d+.03); return o; }catch(e){ return null; } }
const beep=(f=1000,d=.09)=>{ tone(f,d); };
function schedule(group,list){ cancelSched(group); const c=actxGet(); if(!c||!S.sound) return; const now=c.currentTime;
  AU.sched[group]=list.filter(x=>x[0]>-.05).map(([at,f,d,v])=>tone(f,d,now+Math.max(.01,at),v)).filter(Boolean); }
function cancelSched(group){ (AU.sched[group]||[]).forEach(o=>{ try{ o.stop(); }catch(e){} }); AU.sched[group]=[]; }
/* un sunet silențios în buclă ține sesiunea audio activă pe telefon cât timp rulează antrenamentul */
function keepAlive(on){
  try{
    if(on){ if(!AU.keep){ const sr=8000,n=sr,buf=new ArrayBuffer(44+n),v=new DataView(buf),w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
        w(0,'RIFF'); v.setUint32(4,36+n,true); w(8,'WAVE'); w(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
        v.setUint32(24,sr,true); v.setUint32(28,sr,true); v.setUint16(32,1,true); v.setUint16(34,8,true); w(36,'data'); v.setUint32(40,n,true);
        for(let i=0;i<n;i++) v.setUint8(44+i,128);
        AU.keep=new Audio(URL.createObjectURL(new Blob([buf],{type:'audio/wav'}))); AU.keep.loop=true; AU.keep.volume=.01; }
      const p=AU.keep.play(); if(p&&p.catch) p.catch(()=>{});
      if('mediaSession' in navigator&&window.MediaMetadata) navigator.mediaSession.metadata=new MediaMetadata({title:'Antrenament în desfășurare',artist:'ZECE'});
    } else if(AU.keep) AU.keep.pause();
  }catch(e){}
}
function buzz(p){ if(!S.sound) return; try{ navigator.vibrate&&navigator.vibrate(p); }catch(e){} }
let wakeLock=null;
async function keepAwake(on){ try{ if(on&&!wakeLock&&navigator.wakeLock){ wakeLock=await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release',()=>{ wakeLock=null; }); }
  if(!on&&wakeLock){ await wakeLock.release(); wakeLock=null; } }catch(e){} }
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&(S.sess||TM.open)) keepAwake(true); applyFx(); });
