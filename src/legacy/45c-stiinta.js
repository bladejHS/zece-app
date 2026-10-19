/* =====================================================================
   v17 · ȘTIINȚĂ — fila cu ce spun studiile (meta-analize, consensuri, practica sportivilor de elită) despre performanță
   și metabolismul lent, cu nivelul dovezilor la fiecare idee. Sus: diagnosticul tău din datele din aplicație
   (somn, pași, proteină, cântăriri, ritmul greutății) și protocolul tău, cu dozele calculate pe greutatea ta.
   ===================================================================== */
IC.flask='<path d="M9 3h6M10 3v6.5L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9.5V3"/><path d="M7.5 15h9"/>';
/* nivelul dovezilor: A = meta-analize și studii randomizate concordante · B = dovezi bune, dar mai puține sau cu limite · C = date preliminare */
const SCI_EV={A:['A','dovezi puternice'],B:['B','dovezi moderate'],C:['C','dovezi preliminare']};
const SCI_SEC=[['all','Toate','grid'],['met','Metabolism lent','flame'],['abd','Abdomen și șolduri','target'],['nut','Nutriție','bowl'],['rec','Recuperare','moon'],['sup','Suplimente','pill'],['trn','Antrenament hibrid','run'],['med','Analize','heart'],['myth','Mituri','alert']];
/* fiecare idee: s secțiune, t titlu, ev nivel, sum pe scurt, do ce faci concret, n cifra-cheie, src sursele principale */
const SCI=[];

/* ---------- diagnosticul tău: din ultimele 7 zile ---------- */
function sciDiag(){ const tk=todayKey(), tg=targets(), days=Array.from({length:7},(_,i)=>dayShift(tk,-i-1)), out=[];
  const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
  const sl=avg(days.map(k=>+jOf(k).sleep).filter(v=>v>0));
  out.push({k:'Somn',v:sl!=null?num(sl,1)+' h':'—',ok:sl==null?null:sl>=7.5,why:sl==null?'Notează somnul în jurnal (Acasă).':sl>=7.5?'În zona bună pentru recuperare.':'Sub 7 h, pierzi mai mult mușchi și mai puțină grăsime în deficit. Țintește 7,5–9 h.'});
  const st=avg(days.map(k=>+jOf(k).steps).filter(v=>v>0));
  out.push({k:'Pași',v:st!=null?Math.round(st).toLocaleString('ro-RO'):'—',ok:st==null?null:st>=8000,why:st==null?'Notează pașii în jurnal: sunt cea mai mare pârghie pe metabolismul „lent”.':st>=8000?'NEAT-ul îți ține cheltuiala sus.':'Mișcarea zilnică scade prima în deficit. Urcă treptat spre 8.000–10.000.'});
  const ld=days.filter(k=>mlogDay(k).length>=3), pd=ld.filter(k=>dayTotals(k).p>=tg.p*.9).length;
  out.push({k:'Proteină',v:ld.length?pd+'/'+ld.length+' zile':'—',ok:ld.length?pd>=ld.length*.7:null,why:ld.length?'Ținta: '+tg.p+' g/zi, în 4–5 mese.':'Notează mesele ca să văd dacă atingi '+tg.p+' g/zi.'});
  const wn=wList().filter(x=>x.d>dayShift(tk,-7)&&x.d<=tk).length;
  out.push({k:'Cântăriri',v:wn+'/7',ok:wn>=3,why:wn>=3?'Suficiente pentru media săptămânii.':'Cântărește-te dimineața, de cel puțin 3 ori pe săptămână.'});
  /* talia raportată la înălțime: cel mai simplu indicator al grăsimii de pe abdomen (ținta: sub 0,5) */
  const bw=bList().filter(x=>+x.waist>0), lw=bw[bw.length-1], h=+prof().h, wh=lw&&h?+lw.waist/h:null, ow=lw?bw.filter(x=>x.d<=dayShift(lw.d,-21)).pop():null;
  out.push({k:'Talie / înălțime',v:wh!=null?num(wh,2)+(ow?' · '+(lw.waist-ow.waist>0?'+':'')+num(lw.waist-ow.waist,1)+' cm':''):'—',ok:wh==null?null:wh<.5,
    why:wh==null?'Măsoară talia dimineața, mereu la buric, la finalul unei expirații, o dată pe săptămână (Performanță → Corp → Măsurători). E cel mai bun semnal pentru abdomen.':wh<.5?'Sub 0,5: risc metabolic scăzut (NICE).':(wh<.6?'0,5–0,59: risc crescut.':'0,6 sau peste: risc mare.')+' Talia scade cu ~1 cm la fiecare kg slăbit; judecă tendința pe o lună.'+(+lw.waist>=94?' Peste 94 cm: cere tensiune, glicemie, HbA1c, lipide și ALT/AST (vezi Abdomen și șolduri).':'')});
  const ww=wWeeks(tk);
  /* ritmul bun: 0,5–1% din greutate pe săptămână, ideal ~0,7% (Garthe 2011); îl socotesc în regulă de la 0,4% */
  const pc=ww?-ww.rate/ww.w1*100:null;
  out.push({k:'Ritm',v:ww?(ww.rate>0?'+':'')+num(ww.rate,2)+' kg/săpt.':'—',ok:ww?pc>=.4&&pc<=1:null,why:!ww?'Am nevoie de 2 săptămâni de cântăriri.':pc<.4?'Sub 0,4% pe săptămână: ținta scade singură din cântar, o dată pe săptămână.':pc>1?'Peste 1% pe săptămână: riști masa musculară. Mănâncă ceva mai mult.':'În ritmul bun ('+num(pc,1)+'% pe săptămână; ideal ~0,7%).'});
  return out; }
/* ---------- protocolul tău: doze pe greutatea ta ---------- */
function sciProto(){ const w=Math.round(+curW()||+prof().startW||80), tg=targets();
  return [['dumbbell','Proteină',tg.p+' g/zi','~'+Math.round(w*.4)+' g pe masă, 4–5 mese, una înainte de somn'],
    ['pill','Creatină monohidrat','3–5 g/zi','zilnic, oricând; +1–2 kg pe cântar din apă în primele săptămâni (nu e grăsime)'],
    ['cup','Cafeină','~'+Math.round(w*3)+' mg','3 mg/kg cu ~60 min înainte, doar la sesiunile de dimineață; după-amiaza ≤100 mg; ultima cafea cu ~9 h înainte de culcare'],
    ['run','Pași','8.000–10.000+','zilnic, în afara antrenamentelor; cea mai mare pârghie pe cheltuiala zilnică'],
    ['moon','Somn','8–9 h în pat','oră fixă de trezire; fără sesiuni grele devreme după o noapte scurtă'],
    ['drop','Apă',num(tg.water/1000,1)+' L','+ sare sau electroliți după antrenamentele cu transpirație mare'],
    ['bowl','Între 2 sesiuni grele','~'+Math.round(w*.8)+' g carbo + '+Math.round(w*.3)+' g proteină/oră','2–3 ore, doar dacă ambele sesiuni sunt grele; după forță + Z2 ușor ajunge o masă normală'],
    ['scale','Ritm de slăbire','~'+num(w*.007,2)+' kg/săpt.','0,7% din greutate; între 0,5 și 1%']]; }

function viewSci(){ const sec=S.sciSec||'all', D=sciDiag(), ok=D.filter(x=>x.ok===true).length, known=D.filter(x=>x.ok!=null).length;
  const L=SCI.filter(x=>sec==='all'||x.s===sec);
  return `<div class="card sci-hero">${COVER?'':`<div class="eyebrow">${ic('flask')} Bazat pe studii</div><div class="sci-ttl">Știința performanței</div>`}
      <p class="sm mu" style="margin:0">Ce funcționează cu adevărat, după meta-analize, consensuri și practica sportivilor de elită. Fiecare idee are nivelul dovezilor: <b>A</b> puternice, <b>B</b> moderate, <b>C</b> preliminare.</p></div>
    <div class="card"><div class="row"><div class="eyebrow sp">${ic('target')} Diagnosticul tău · ultimele 7 zile</div><span class="xs mu">${known?ok+' din '+known+' în regulă':'fără date'}</span></div>
      ${D.map(x=>`<div class="sci-d ${x.ok===true?'ok':x.ok===false?'bad':''}"><span class="sci-dk">${esc(x.k)}</span><b>${esc(x.v)}</b><span class="sci-dw">${esc(x.why)}</span></div>`).join('')}</div>
    <div class="card"><div class="eyebrow">${ic('list')} Protocolul tău</div>
      ${sciProto().map(([icn,k,v,why])=>`<div class="sci-p"><span class="sci-pi">${ic(icn)}</span><div class="sp"><b>${esc(k)}</b><span>${esc(why)}</span></div><span class="sci-pv">${esc(v)}</span></div>`).join('')}
      <div class="note">Dozele sunt orientative pentru un adult sănătos. Dacă ai o afecțiune sau iei medicamente, întreabă medicul înainte de suplimente.</div></div>
    <div class="card"><div class="eyebrow">${ic('trophy')} Cele 10 pârghii, de la cea mai mare</div>
      <ol class="sci-top">${SCI_TOP.map(([t,d])=>`<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol></div>
    <div class="scrollx sci-chips">${SCI_SEC.map(([k,l,icn])=>`<button class="chip ${sec===k?'on':''}" data-a="sciSec" data-k="${k}">${ic(icn)} ${l}</button>`).join('')}</div>
    ${L.map(x=>{ const e=SCI_EV[x.ev]||SCI_EV.B, sc=SCI_SEC.find(s=>s[0]===x.s)||SCI_SEC[0];
      return `<details class="card sci-i"><summary><span class="sci-ev ev-${e[0]}" title="${e[1]}">${e[0]}</span><div class="sp"><span class="sci-it">${esc(x.t)}</span><span class="sci-is">${ic(sc[2])} ${esc(sc[1])}${x.n?' · '+esc(x.n):''}</span></div>${ic('down')}</summary>
        <p class="sci-sum">${esc(x.sum)}</p>
        ${x.do&&x.do.length?`<ul class="sci-do">${x.do.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`:''}
        ${x.src?`<div class="sci-src">${ic('bookmark')} ${esc(x.src)}</div>`:''}</details>`; }).join('')}
    <div class="note">Informații educaționale, nu sfat medical. La simptome (oboseală persistentă, frig, căderea părului, libido scăzut, amețeli) mergi la medic.</div>`; }
ACT.sciSec=(el,{k})=>{ S.sciSec=SCI_SEC.some(s=>s[0]===k)?k:'all'; render(); };
/* fila în meniu, înainte de Antrenor; banda de sus ca la celelalte pagini */
NAV.splice(NAV.findIndex(n=>n[0]==='coach'),0,['sci','Știință','flask']); VIEWS.sci=viewSci; VIEW_LAY.sci='lay-narrow';
BANDS.sci=()=>({e:'Bazat pe studii',t:'Știință',s:SCI.length+' idei · metabolism, abdomen, nutriție, recuperare, suplimente, antrenament'});
