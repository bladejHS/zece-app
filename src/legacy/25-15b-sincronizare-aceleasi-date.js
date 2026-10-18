/* =====================================================================
   15b · SINCRONIZARE — aceleași date pe PC și pe telefon.
   Datele se criptează pe dispozitiv (AES-256-GCM, cheie PBKDF2 din parola ta) și stau într-un gist secret pe GitHub.
   Pe server ajunge doar text criptat. Cine a modificat ultimul trimite; dacă ambele s-au schimbat, le unesc.
   ===================================================================== */
const SY={busy:false,msg:'',err:'',timer:0,applying:false,gen:0,lastAuto:0};
const SY_FILE='zece-sync.json', SY_DESC='ZECE · sincronizare (criptat)', GH='https://api.github.com';
const SYNC_KEYS=EXPORT_KEYS.filter(k=>['zece3:aiChat','zece3:theme','zece3:fx','zece3:intro','zece3:motion','zece3:motionAsked','zece3:sound','zece3:voice','zece3:onb','zece3:mode','zece3:bg','zece3:notif'].indexOf(k)<0);
const syCfg=()=>S.sync||{};
const syOn=()=>{ const c=syCfg(); return !!(c.tok&&c.gist&&c.pass); };
const syOk=()=>!!(window.crypto&&crypto.subtle&&window.fetch);
async function syPatch(o){ S.sync=Object.assign({},S.sync,o); await store.set(K.sync,S.sync); }
function syncMark(p){ const k=K[p]; if(!k||SY.applying||SYNC_KEYS.indexOf(k)<0||!syOn()) return; SY.gen++;
  if(!syCfg().dirty){ S.sync=Object.assign({},S.sync,{dirty:true}); store.set(K.sync,S.sync); }
  clearTimeout(SY.timer); if(syCfg().auto!==false) SY.timer=setTimeout(()=>syncNow(false),15000); }
const b64e=buf=>{ const a=new Uint8Array(buf); let s=''; for(let i=0;i<a.length;i+=0x8000) s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000)); return btoa(s); };
const b64d=s=>{ const b=atob(s), a=new Uint8Array(b.length); for(let i=0;i<b.length;i++) a[i]=b.charCodeAt(i); return a; };
async function syZip(bytes,on){ if(!window.CompressionStream) return null; const cs=on?new CompressionStream('gzip'):new DecompressionStream('gzip');
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(cs)).arrayBuffer()); }
async function syKey(pass,salt){ const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']); }
async function syEnc(obj,pass){ let raw=new TextEncoder().encode(JSON.stringify(obj)), z=0; try{ const c=await syZip(raw,true); if(c){ raw=c; z=1; } }catch(e){}
  const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12)), key=await syKey(pass,salt);
  return {z,salt:b64e(salt),iv:b64e(iv),data:b64e(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,raw))}; }
async function syDec(f,pass){ const key=await syKey(pass,b64d(f.salt)); let pt=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(f.iv)},key,b64d(f.data)));
  if(f.z){ const u=await syZip(pt,false); if(!u) throw new Error('nozip'); pt=u; } return JSON.parse(new TextDecoder().decode(pt)); }
async function gh(path,opt){ opt=opt||{}; const r=await fetch(GH+path,{method:opt.method||'GET',cache:'no-store',body:opt.body,
    headers:Object.assign({'Accept':'application/vnd.github+json','Authorization':'Bearer '+(opt.tok||syCfg().tok)},opt.body?{'Content-Type':'application/json'}:{})});
  if(r.status===401) throw new Error('auth'); if(r.status===403) throw new Error('scope'); if(r.status===404) throw new Error('404'); if(!r.ok) throw new Error('http '+r.status); return r.json(); }
async function syRemote(id){ const g=await gh('/gists/'+(id||syCfg().gist)), f=g.files&&g.files[SY_FILE]; if(!f) return null;
  let txt=f.content; if(f.truncated||txt==null){ const r=await fetch(f.raw_url,{cache:'no-store'}); txt=await r.text(); } const o=JSON.parse(txt); return o&&o.app==='ZECE'&&o.data?o:null; }
async function syLocal(){ const o={}; for(const k of SYNC_KEYS){ const v=await store.get(k); if(v!=null) o[k]=v; } return o; }
async function syApply(o){ SY.applying=true; try{ for(const k of SYNC_KEYS){ if(o[k]!==undefined) await store.set(k,o[k]); } const keep=S.sync; await loadAll(); S.sync=keep; } finally { SY.applying=false; } }
const syHas=o=>['zece:weights','zece:lifts','zece:runs','zece:mlog','zece3:hist'].some(k=>{ const v=o[k]; return v&&(Array.isArray(v)?v.length:Object.keys(v).length); });
/* unirea a două versiuni: nimic nu se pierde; la aceeași înregistrare modificată pe ambele, rămâne cea de pe dispozitivul acesta */
function syMerge(L,R){ const out={}; new Set([...Object.keys(L),...Object.keys(R)]).forEach(k=>{ const a=L[k], b=R[k]; out[k]=a===undefined?b:b===undefined?a:syMergeKey(k,a,b); });
  /* bifele dintr-un ciclu mai mare decât cel curent (rămase de pe celălalt dispozitiv după o corectare) nu au cum să fie valabile */
  const h=+((out['zece:cyc']||{}).h)||1, wl=out['zece:wlog']; if(wl&&typeof wl==='object'){ const o={}; Object.keys(wl).forEach(x=>{ const m=/^hc(\d+)w/.exec(x); if(!m||+m[1]<=h) o[x]=wl[x]; }); out['zece:wlog']=o; }
  return out; }
const SY_ID={'zece3:goals':x=>x.id,'zece3:ext':x=>'s'+x.sid,'zece3:shoes':x=>x.id,'zece3:foods':x=>x.n,'zece3:hist':x=>x.date+'|'+x.w+'|'+x.d+'|'+x.dur,
  'zece:runs':x=>x.sid?'s'+x.sid:x.date+'|'+x.km+'|'+x.min,'zece3:ptests':x=>x.date+'|'+x.type+'|'+x.value};
function syMergeKey(k,a,b){
  if(k==='zece:lifts'&&a&&b&&typeof a==='object'){ const o=Object.assign({},b,a); Object.keys(o).forEach(n=>{ const m={}; (b[n]||[]).forEach(e=>m[e.d]=e);
      (a[n]||[]).forEach(e=>{ const x=m[e.d]; m[e.d]=!x||(e.s||[]).length>=(x.s||[]).length?e:x; }); o[n]=Object.values(m).sort((x,y)=>x.d<y.d?-1:x.d>y.d?1:0).slice(-80); }); return o; }
  /* ciclul: câștigă ultima schimbare (ciclu nou sau corectare); versiunile fără oră iau numărul mai mare */
  if(k==='zece:cyc'){ const ta=+(a&&a.t)||0, tb=+(b&&b.t)||0; if(ta||tb) return ta>=tb?a:b; return {h:Math.max(+(a&&a.h)||1,+(b&&b.h)||1)}; }
  if(k==='zece3:aiUsed'||k==='zece3:recap'||k==='zece3:planv') return Math.max(+a||0,+b||0);
  if(Array.isArray(a)&&Array.isArray(b)){ const id=SY_ID[k]||(x=>JSON.stringify(x)), seen=new Set(), out=[];
    a.concat(b).forEach(x=>{ const i=id(x); if(seen.has(i)) return; seen.add(i); out.push(x); });
    if(/^(zece:runs|zece3:hist|zece3:ptests|zece3:tmlog)$/.test(k)) out.sort((x,y)=>(x.date||'')<(y.date||'')?-1:(x.date||'')>(y.date||'')?1:0); return out; }
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){ const o=Object.assign({},b); Object.keys(a).forEach(x=>{ o[x]=b[x]===undefined?a[x]:syMergeKey(k+'/',a[x],b[x]); }); return o; }
  return a;
}
const syDevName=()=>matchMedia('(pointer:coarse)').matches?'Telefon':'PC';
async function syPush(obj,gen){ const c=syCfg(), at=new Date().toISOString(), enc=await syEnc(obj,c.pass);
  const file=Object.assign({app:'ZECE',v:1,at,dev:c.dev,name:c.name||syDevName()},enc);
  await gh('/gists/'+c.gist,{method:'PATCH',body:JSON.stringify({files:{[SY_FILE]:{content:JSON.stringify(file)}}})});
  await syPatch({base:at,last:Date.now(),dirty:gen!=null&&gen!==SY.gen}); }
function syErrText(e){ const m=String(e&&e.message||e);
  return m==='auth'?'Tokenul GitHub nu e valid sau a expirat. Creează altul, cu permisiunea „gist”.':m==='scope'?'Tokenul nu are voie să lucreze cu gist-uri. Creează-l cu permisiunea „gist”.'
    :m==='404'?'Nu găsesc copia din cloud (gist-ul a fost șters?). Deconectează și conectează din nou.':e&&e.name==='OperationError'?'Parola de criptare nu se potrivește cu cea folosită pe celălalt dispozitiv.'
    :e instanceof TypeError?'Nu ajung la GitHub. Verifică internetul.':'Sincronizarea a eșuat: '+m; }
function syncNow(manual){ if(SY.busy) return SY.p||Promise.resolve(); SY.p=syRun(manual); return SY.p; }
async function syRun(manual){
  if(!syOn()||!syOk()) return; if(!manual&&navigator.onLine===false) return;
  SY.busy=true; SY.err=''; if(manual) SY.msg=''; syPaint(); const gen=SY.gen;
  try{ const c=syCfg(), R=await syRemote();
    if(R&&R.at!==c.base){ const rd=await syDec(R,c.pass);
      if(!c.dirty){ await syApply(rd); await syPatch({base:R.at,last:Date.now(),dirty:false}); SY.msg='Am adus datele de pe '+(R.name||'celălalt dispozitiv')+'.'; SY.busy=false; render(); }
      else { const M=syMerge(await syLocal(),rd); await syApply(M); await syPush(M,gen); SY.msg='Am unit datele de pe ambele dispozitive.'; SY.busy=false; render(); } }
    else if(!R||c.dirty){ await syPush(await syLocal(),gen); SY.msg='Datele sunt salvate și în cloud.'; }
    else { await syPatch({last:Date.now()}); SY.msg='Totul e la zi.'; }
  }catch(e){ SY.err=syErrText(e); errLog('sincronizare: '+(e&&e.message||e),'sync'); }
  SY.busy=false; syPaint();
}
/* prima conectare: găsesc copia existentă (de pe celălalt dispozitiv) sau o creez */
async function syConnect(){
  const tok=(($('#syTok')||{}).value||'').trim(), pass=(($('#syPass')||{}).value||''), name=(($('#syName')||{}).value||'').trim()||syDevName();
  if(tok.length<20){ shake('#syTok'); return; } if(pass.length<8){ shake('#syPass'); SY.err='Parola de criptare are cel puțin 8 caractere.'; syPaint(); return; }
  SY.busy=true; SY.err=''; SY.msg=''; syPaint();
  try{ const list=await gh('/gists?per_page=100',{tok}), g=(Array.isArray(list)?list:[]).find(x=>x.files&&x.files[SY_FILE]&&x.description===SY_DESC);
    const dev=syCfg().dev||('d'+Math.random().toString(36).slice(2,10));
    if(g){ const prev=S.sync; S.sync={tok,pass,gist:g.id,dev,name,auto:true}; let R;
      try{ R=await syRemote(g.id); }catch(e){ S.sync=prev; throw e; }
      let rd=null; if(R){ try{ rd=await syDec(R,pass); }catch(e){ S.sync=prev; throw e; } }
      await syPatch({tok,pass,gist:g.id,dev,name,auto:true,base:null,dirty:false});
      const L=await syLocal();
      if(rd&&syHas(L)){ const M=syMerge(L,rd); await syApply(M); await syPush(M); SY.msg='Conectat. Am unit datele de aici cu cele din cloud.'; }
      else if(rd){ await syApply(rd); await syPatch({base:R.at,last:Date.now()}); SY.msg='Conectat. Am adus datele de pe '+(R.name||'celălalt dispozitiv')+'.'; }
      else { await syPush(L); SY.msg='Conectat. Datele de aici sunt acum și în cloud.'; } }
    else { const enc=await syEnc(await syLocal(),pass), at=new Date().toISOString();
      const ng=await gh('/gists',{tok,method:'POST',body:JSON.stringify({description:SY_DESC,public:false,files:{[SY_FILE]:{content:JSON.stringify(Object.assign({app:'ZECE',v:1,at,dev,name},enc))}}})});
      await syPatch({tok,pass,gist:ng.id,dev,name,auto:true,base:at,last:Date.now(),dirty:false}); SY.msg='Gata: am creat copia criptată în cloud. Conectează și celălalt dispozitiv cu același token și aceeași parolă.'; }
  }catch(e){ SY.err=syErrText(e); }
  SY.busy=false; render(); syPaint();
}
function syAuto(){ if(!syOn()||syCfg().auto===false||Date.now()-SY.lastAuto<60000) return; SY.lastAuto=Date.now(); syncNow(false); }
function syPaint(){ const el=$('#sySet'); if(el) el.outerHTML=syncCard(); }
function syncCard(){
  const c=syCfg(), on=syOn();
  const msg=(SY.err?`<div class="err">${ic('alert')}<span>${esc(SY.err)}</span></div>`:'')+(SY.msg&&!SY.err?`<div class="easy" style="margin-top:10px">${ic('check')} ${esc(SY.msg)}</div>`:'');
  if(!syOk()) return `<div class="card" id="sySet"><div class="eyebrow">${ic('refresh')} Sincronizare între dispozitive</div><div class="note">Browserul acesta nu permite criptarea datelor pe această pagină (are nevoie de https sau de Chrome/Edge). Folosește versiunea online a aplicației.</div></div>`;
  if(on) return `<div class="card" id="sySet"><div class="row"><div class="eyebrow sp">${ic('refresh')} Sincronizare între dispozitive</div><span class="tag ${SY.err?'need':'rest'}">${SY.busy?'sincronizez…':SY.err?'eroare':'activă'}</span></div>
    <div class="sm" style="margin-top:8px">Dispozitivul acesta: <b>${esc(c.name||syDevName())}</b> · ultima sincronizare ${c.last?esc(stAgo(c.last/1000)):'—'}${c.dirty?' · <span class="mu">modificări de trimis</span>':''}</div>${msg}
    <div class="inrow"><button class="btn pri" style="flex:1" data-a="syNow" ${SY.busy?'disabled':''}>${ic('refresh')} ${SY.busy?'Sincronizez…':'Sincronizează acum'}</button></div>
    <div class="set-row" style="margin-top:8px"><span class="sp"><b>Automat</b><div class="sm mu">La deschidere și la 15 secunde după fiecare modificare</div></span><button class="sw ${c.auto!==false?'on':''}" data-a="syAuto" role="switch" aria-checked="${c.auto!==false}" aria-label="Sincronizare automată"></button></div>
    <div class="note">Criptat pe dispozitiv cu parola ta (AES-256) înainte să plece spre GitHub. Pozele și conversația cu antrenorul rămân pe fiecare dispozitiv.</div>
    <button class="btn ghost sm danger" style="margin-top:8px" data-a="syOff" data-confirm="Sigur? Apasă iar">Deconectează acest dispozitiv</button></div>`;
  return `<div class="card" id="sySet"><div class="eyebrow">${ic('refresh')} Sincronizare între dispozitive</div>
    <div class="sm" style="margin-top:8px">Aceleași date pe PC și pe iPhone: ce notezi pe unul apare și pe celălalt.</div>
    <div class="dsec"><h4>Cum o pornești (o singură dată)</h4>
      <div class="cue"><b>1</b><span>Creează un token GitHub cu permisiunea <b>gist</b> (butonul de mai jos deschide pagina gata completată). Copiază-l.</span></div>
      <div class="cue"><b>2</b><span>Lipește-l aici și alege o <b>parolă de criptare</b>. Pe celălalt dispozitiv folosești același token și aceeași parolă.</span></div></div>
    <a class="btn ghost wide" href="https://github.com/settings/tokens/new?scopes=gist&description=ZECE%20sync" target="_blank" rel="noopener">${ic('key')} Creează tokenul pe GitHub</a>
    <div class="form"><div class="fld full"><label for="syTok">Token GitHub</label><input class="inp" id="syTok" type="password" autocomplete="off" placeholder="ghp_… sau github_pat_…"></div>
      <div class="fld"><label for="syPass">Parolă de criptare</label><input class="inp" id="syPass" type="password" autocomplete="new-password" placeholder="minim 8 caractere"></div>
      <div class="fld"><label for="syName">Numele dispozitivului</label><input class="inp" id="syName" value="${esc(syDevName())}"></div></div>${msg}
    <button class="btn pri wide" style="margin-top:12px" data-a="syConnect" ${SY.busy?'disabled':''}>${ic('refresh')} ${SY.busy?'Mă conectez…':'Conectează'}</button>
    <div class="note">Datele se criptează pe dispozitiv cu parola ta înainte să plece. Pe GitHub ajunge doar text criptat, într-un gist secret: fără parolă nu-l poate citi nimeni, nici GitHub. Dacă uiți parola, copia din cloud nu mai poate fi deschisă, dar datele de pe dispozitive rămân. Tokenul și parola stau doar pe acest dispozitiv.</div></div>`;
}
