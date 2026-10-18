/* =====================================================================
   2 · STOCARE — aceleași chei ca versiunile vechi, ca istoricul să rămână
   ===================================================================== */
const store={
  _mem:{},
  async get(k){
    try{ if(window.storage&&window.storage.get){ const r=await window.storage.get(k,false); return r?JSON.parse(r.value):null; } }catch(e){}
    try{ const v=localStorage.getItem(k); if(v!=null) return JSON.parse(v); }catch(e){}
    return this._mem[k]!==undefined?this._mem[k]:null;
  },
  async set(k,v){
    this._mem[k]=v;
    try{ if(window.storage&&window.storage.set){ await window.storage.set(k,JSON.stringify(v),false); return; } }catch(e){}
    try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){ storeFail(e); }
  }
};
/* o salvare eșuată nu mai trece neobservată: spațiul plin sau modul privat → avertisment (cel mult o dată pe minut) */
let SFAIL=0;
function storeFail(e){ const now=Date.now(); if(now-SFAIL<60000) return; SFAIL=now;
  setTimeout(()=>toast('Nu s-a putut salva',/quota/i.test(String(e&&(e.name+' '+e.message)))?'Spațiul browserului e plin. Exportă o copie din Setări → Datele tale.':'Browserul a refuzat salvarea (poate e modul privat). Exportă o copie din Setări.','info'),0); }
const K={lifts:'zece:lifts',weights:'zece:weights',runs:'zece:runs',wlog:'zece:wlog',cyc:'zece:cyc',runPlan:'zece:runPlan',prof:'zece:nutri',mlog:'zece:mlog',
  hist:'zece3:hist',sess:'zece3:sess',sound:'zece3:sound',aiChat:'zece3:aiChat',aiEffort:'zece3:aiEffort',aiUsed:'zece3:aiUsed',
  water:'zece3:water',body:'zece3:body',theme:'zece3:theme',fx:'zece3:fx',onb:'zece3:onb',seenAch:'zece3:seenAch',seenLvl:'zece3:lvl',
  journal:'zece3:journal',tech:'zece3:tech',voice:'zece3:voice',recapSeen:'zece3:recap',
  mplan:'zece3:mplan',shop:'zece3:shop',mf:'zece3:mf',intro:'zece3:intro',motion:'zece3:motion',motionAsked:'zece3:motionAsked',
  ptests:'zece3:ptests',tmlog:'zece3:tmlog',adj:'zece3:adj',strava:'zece3:strava',ext:'zece3:ext',stq:'zece3:stq',look:'zece3:look',goals:'zece3:goals',supp:'zece3:supp',bk:'zece3:bk',exNote:'zece3:exnote',foods:'zece3:foods',shoes:'zece3:shoes',sync:'zece3:sync',mode:'zece3:mode',
  dash:'zece3:dash',bg:'zece3:bg',planV:'zece3:planv',ach:'zece3:ach',notif:'zece3:notif',notifCfg:'zece3:notifCfg',exFav:'zece3:exfav',exCustom:'zece3:excustom'};
const S={tab:'azi',lifts:{},weights:{},runs:[],wlog:{},cyc:{},runPlan:{},prof:{},mlog:{},hist:[],sess:null,sound:true,
  aiKey:'',aiChat:null,aiEffort:'medium',aiUsed:0,water:{},body:{},theme:'tactical',bg:'anthr',mode:'dark',fx:'normal',onb:false,seenAch:null,seenLvl:null,
  journal:{},tech:{},voice:true,recapSeen:0,photos:undefined,mSel:null,phPose:'fata',
  mplan:{},shop:{},mf:{port:false,cold:false},intro:'full',nTab:'azi',planDay:0,shopDays:7,motion:'auto',motionAsked:false,
  ptests:[],tmlog:[],twAttr:'str',twRange:90,ciOpen:null,adj:{},strava:{},ext:[],stq:[],mWin:7,shotN:1,shotF:'all',shotOpen:null,
  exNote:{},rest:null,fxOpen:false,fxDir:'',summary:null,planW:null,openDay:-1,progTab:'ov',prEx:null,wRange:90,runKind:'ez',
  dash:{},ach:null,notif:undefined,notifCfg:{},exFav:[],exCustom:[],rng:'m',trTab:'plan',loaded:false};
async function save(p,v){ S[p]=v; STC=null; ACTC=null; TWC=null; TGC=null; ADC=null; IXC=null; WLC=null; await store.set(K[p],v); syncMark(p); }
const prof=()=>Object.assign({sex:'m',age:30,h:180,startW:90,goalW:80,act:1.55,def:600},S.prof||{});
