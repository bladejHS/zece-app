/* =====================================================================
   v8 · IMPORT / EXPORT — Excel (.xlsx real, generat în browser, fără biblioteci), CSV pe seturi de date,
   copia JSON (backup / restaurare, deja existentă) și importul CSV pentru alergări, greutate și jurnal,
   cu previzualizare înainte de salvare (duplicatele sunt sărite).
   ===================================================================== */
/* tabelele exportate: [nume, antet[], rânduri[][]] — doar date notate, fără estimări (1RM estimat e marcat ca atare) */
function ioTables(){
  const T=[];
  T.push(['Antrenamente',['Data','Antrenament','Durata (min)','Serii','Tonaj (kg)','Km','Recorduri','RPE','Puls mediu','Puls maxim'],
    (S.hist||[]).slice().sort((a,b)=>a.date<b.date?-1:1).map(h=>[h.date,h.t||'',Math.round((+h.dur||0)/60),h.sets||0,h.vol||0,h.km||0,h.prs||0,h.rpe||'',h.hr?h.hr.avg:'',h.hr?h.hr.max:''])]);
  const sets=[]; Object.keys(S.lifts||{}).sort().forEach(n=>liftHist(n).forEach(e=>e.s.forEach((s,i)=>sets.push([e.d,n,i+1,+s[0]||0,+s[1]||0,typeof s[2]==='string'&&SET_TAG[s[2]]?SET_TAG[s[2]]:'',e1rm(+s[0],+s[1])||'']))));
  sets.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
  T.push(['Serii',['Data','Exercițiu','Seria','Kg','Repetări','Tip','1RM estimat (Epley)'],sets]);
  T.push(['Alergări',['Data','Tip','Km','Timp (min)','Ritm (min/km)','Viteză (km/h)','Puls mediu','Puls maxim','Cadență','Elevație (m)','Efort','Sursă'],
    (S.runs||[]).slice().sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,RUNK[r.kind]||r.kind||'',+r.km||0,+r.min||0,paceOf(r)?mmss(paceOf(r)):'',kmh(r)?Math.round(kmh(r)*10)/10:'',r.hr||'',r.hrMax||'',r.cad||'',r.elev!=null?Math.round(r.elev):'',r.rpe||'',r.sid?'Strava':'manual'])]);
  T.push(['Greutate',['Data','Kg'],wList().map(x=>[x.d,x.w])]);
  T.push(['Măsurători',['Data'].concat(MEAS.map(m=>m[1]+' (cm)')).concat(['Grăsime % (introdus)']),bList().map(x=>[x.d].concat(MEAS.map(([k])=>+x[k]||'')).concat([x.bf||'']))]);
  T.push(['Jurnal',['Data','Somn (h)','Energie (1-5)','Febră (1-5)','Puls repaus','HRV (ms)','Pași'],Object.keys(S.journal||{}).sort().map(d=>{ const j=S.journal[d]; return [d,j.sleep||'',j.energy||'',j.sore||'',j.rhr||'',j.hrv||'',j.steps||'']; })]);
  const B=prBook(); T.push(['Recorduri',['Categorie','Record','Valoare','Data'],Object.values(B.cur).map(p=>[PR_CAT[p.cat]||'',prName(p),prVal(p),p.d||''])]);
  T.push(['Teste',['Data','Test','Valoare'],(S.ptests||[]).map(t=>{ const pt=PTESTS.find(x=>x[0]===t.type)||[t.type,t.type,'']; return [t.date,pt[1],t.type==='k1'?fmtClock(t.value):t.value+' '+pt[2]]; })]);
  return T;
}
function ioDownload(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); }
const csvCell=v=>{ const s=String(v==null?'':v); return /[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
function ioCSV(name){ const t=ioTables().find(x=>x[0]===name); if(!t) return; const rows=[t[1]].concat(t[2]).map(r=>r.map(csvCell).join(','));
  ioDownload(new Blob(['﻿'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}),'zece-'+fold(name).replace(/[^a-z]+/g,'-')+'-'+todayKey()+'.csv'); toast('CSV exportat',name+' · '+t[2].length+' rânduri','info'); }
/* ---------- .xlsx: arhivă ZIP fără compresie, cu foile ca XML (SpreadsheetML) ---------- */
const CRC_T=(()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
const crc32=b=>{ let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=CRC_T[(c^b[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
function zipStore(files){ const enc=new TextEncoder(), parts=[], cen=[]; let off=0;
  files.forEach(([name,txt])=>{ const nb=enc.encode(name), db=typeof txt==='string'?enc.encode(txt):txt, crc=crc32(db), h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true); h.setUint32(14,crc,true); h.setUint32(18,db.length,true); h.setUint32(22,db.length,true); h.setUint16(26,nb.length,true);
    parts.push(new Uint8Array(h.buffer),nb,db);
    const c=new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint32(16,crc,true); c.setUint32(20,db.length,true); c.setUint32(24,db.length,true); c.setUint16(28,nb.length,true); c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nb); off+=30+nb.length+db.length; });
  const csz=cen.reduce((a,b)=>a+b.length,0), e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,csz,true); e.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}); }
const xmlEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
const colN=i=>{ let s=''; i++; while(i>0){ const m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26); } return s; };
function xlsxSheet(head,rows){ const cell=(v,r,c,st)=>{ const ref=colN(c)+(r+1); if(v===''||v==null) return '';
    return typeof v==='number'&&isFinite(v)?`<c r="${ref}"${st?' s="'+st+'"':''}><v>${v}</v></c>`:`<c r="${ref}" t="inlineStr"${st?' s="'+st+'"':''}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`; };
  const w=head.map((h,c)=>Math.min(40,Math.max(10,String(h).length+2,...rows.slice(0,200).map(r=>String(r[c]==null?'':r[c]).length+2))));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${w.map((x,i)=>`<col min="${i+1}" max="${i+1}" width="${x}" customWidth="1"/>`).join('')}</cols><sheetData><row r="1">${head.map((h,c)=>cell(h,0,c,1)).join('')}</row>${rows.map((r,i)=>`<row r="${i+2}">${r.map((v,c)=>cell(v,i+1,c,0)).join('')}</row>`).join('')}</sheetData></worksheet>`; }
function ioXLSX(){
  const T=ioTables(), names=T.map(t=>t[0]);
  const files=[['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${names.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n,i)=>`<sheet name="${xmlEsc(n.slice(0,31))}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${names.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`]]
    .concat(T.map((t,i)=>['xl/worksheets/sheet'+(i+1)+'.xml',xlsxSheet(t[1],t[2])]));
  ioDownload(zipStore(files),'zece-'+todayKey()+'.xlsx'); toast('Excel exportat',T.map(t=>t[0]+' '+t[2].length).join(' · '),'info');
}
async function ioExport(kind){ if(kind==='xlsx') return ioXLSX(); if(kind==='json') return doExport(false); return ioCSV(kind); }
function ioCard(){
  return `<div class="card" id="ioSet"><div class="eyebrow">${ic('table')} Export pentru Excel și alte aplicații</div>
    <div class="sm mu" style="margin-top:6px">Un fișier Excel cu foi separate: antrenamente, serii, alergări, greutate, măsurători, jurnal, recorduri, teste. Sau un singur set, ca CSV.</div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap"><button class="btn" data-a="ioX" data-k="xlsx">${ic('table')} Excel (.xlsx)</button>
      ${['Serii','Alergări','Greutate','Măsurători','Antrenamente','Jurnal'].map(n=>`<button class="btn ghost sm" data-a="ioX" data-k="${n}">${ic('file')} ${n}.csv</button>`).join('')}</div>
    <div class="eyebrow" style="margin-top:18px">${ic('upload')} Import CSV</div>
    <div class="sm mu" style="margin-top:6px">Alergări (data, distanța, timpul; opțional puls), cântăriri (data, kg) sau jurnal (data, somn, pași, puls în repaus, HRV) din alte aplicații. Îți arăt ce găsesc înainte să salvez.</div>
    <label class="btn file-l" style="margin-top:10px">${ic('upload')} Alege fișierul CSV<input type="file" accept=".csv,text/csv" data-csv2="1"></label></div>`;
}
ACT.ioX=(el,{k})=>ioExport(k);
/* ---------- import CSV cu previzualizare ---------- */
function ioParse(txt){
  const rows=txt.replace(/\r/g,'').split('\n').filter(l=>l.trim()); if(rows.length<2) return null;
  const sep=[';',',','\t'].sort((a,b)=>rows[0].split(b).length-rows[0].split(a).length)[0];
  const split=l=>{ const out=[]; let cur='', q=false; for(const ch of l){ if(ch==='"') q=!q; else if(ch===sep&&!q){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out.map(x=>x.trim()); };
  const H=split(rows[0]).map(h=>fold(h)), col=re=>H.findIndex(h=>re.test(h));
  const ci={d:col(/^(date|data|zi|day)|start/),km:col(/(distan|^km|kilometri)/),t:col(/(timp|time|durat|moving|elapsed)/),hr:col(/(puls|heart|hr)/),w:col(/(greutate|weight|^kg$|masa)/)};
  const nv=v=>{ const x=parseFloat(String(v||'').replace(',','.')); return isFinite(x)?x:null; };
  const dt=v=>{ v=String(v||''); let m; if((m=/^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(v))) return m[3]+'-'+pad(m[2])+'-'+pad(m[1]); return v.slice(0,10); };
  const body=rows.slice(1).map(split);
  if(ci.d>=0&&ci.km>=0&&ci.t>=0){ const out=[]; body.forEach(c=>{ const d=dt(c[ci.d]); let km=nv(c[ci.km]); const tv=c[ci.t]; let min=String(tv).indexOf(':')>=0?(parseTime(tv)||0)/60:nv(tv);
      if(km>200&&km<200000) km=km/1000; if(min>600) min=min/60; if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!(km>0&&km<300)||!(min>0)) return;
      const r={date:d,kind:'ez',km:Math.round(km*100)/100,min:Math.round(min*10)/10,src:'csv'}; const h=ci.hr>=0?nv(c[ci.hr]):null; if(h>=60&&h<=220) r.hr=Math.round(h); out.push(r); });
    return {type:'runs',rows:out}; }
  if(ci.d>=0&&ci.w>=0){ const out=[]; body.forEach(c=>{ const d=dt(c[ci.d]), w=nv(c[ci.w]); if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&w>30&&w<400) out.push({d,w:Math.round(w*10)/10}); }); return {type:'weights',rows:out}; }
  const j=parseCSV(txt); return j.length?{type:'journal',rows:j}:null;
}
async function ioPick(file){ let p=null; try{ p=ioParse(await file.text()); }catch(e){}
  if(!p||!p.rows.length){ toast('Nu am găsit date','Verifică antetul: data + distanța + timpul (alergări), data + kg (greutate) sau data + somn / pași / puls (jurnal).','info'); return; }
  let dup=0, add=[];
  if(p.type==='runs'){ add=p.rows.filter(r=>{ const d=(S.runs||[]).some(x=>x.date===r.date&&Math.abs((+x.km||0)-r.km)<=Math.max(.2,r.km*.03)); if(d) dup++; return !d; }); }
  else if(p.type==='weights'){ add=p.rows.filter(r=>{ const d=S.weights&&S.weights[r.d]!=null; if(d) dup++; return !d; }); }
  else add=p.rows;
  SH={kind:'imp',p,add,dup}; shRender(); }
SHEETS.imp=()=>{ const {p,add,dup}=SH, L={runs:'alergări',weights:'cântăriri',journal:'zile de jurnal'}[p.type];
  const ds=add.map(r=>r.date||r.d).sort();
  return `<button class="ib sh-x" data-a="shClose" aria-label="Închide">${ic('x')}</button><div class="eyebrow">${ic('upload')} Import CSV</div><div class="h2" style="margin-top:6px">${add.length} ${L} noi</div>
    <div class="sm mu" style="margin-top:6px">${ds.length?'Din '+fmtDayY(ds[0])+' până în '+fmtDayY(ds[ds.length-1])+'. ':''}${dup?dup+' există deja și le sar.':''}</div>
    <div style="margin-top:10px">${add.slice(0,8).map(r=>`<div class="list-row"><span>${fmtDayY(r.date||r.d)}</span><span class="v">${p.type==='runs'?num(r.km,2)+' km · '+fmtClock(r.min*60)+(r.hr?' · '+r.hr+' bpm':''):p.type==='weights'?num(r.w,1)+' kg':[r.sleep?'somn '+r.sleep+' h':'',r.steps?r.steps+' pași':'',r.rhr?'puls '+r.rhr:'',r.hrv?'HRV '+r.hrv:''].filter(Boolean).join(' · ')}</span></div>`).join('')}${add.length>8?`<div class="xs mu2" style="margin-top:6px">și încă ${add.length-8}…</div>`:''}</div>
    ${p.type==='runs'?'<div class="note">Alergările importate intră ca „Easy Z2"; schimbi tipul din fișa fiecăreia.</div>':''}
    <div class="inrow"><button class="btn ghost" data-a="shClose">Renunță</button><button class="btn pri" style="flex:1" data-a="impGo" ${add.length?'':'disabled'}>${ic('check')} Importă ${add.length}</button></div>`; };
ACT.impGo=async()=>{ const {p,add}=SH; if(!add.length) return;
  if(p.type==='runs') await save('runs',(S.runs||[]).concat(add));
  else if(p.type==='weights'){ const w=Object.assign({},S.weights); add.forEach(r=>w[r.d]=r.w); await save('weights',w); }
  else { const j=Object.assign({},S.journal); add.forEach(r=>{ const o={}; if(r.sleep>0&&r.sleep<=16) o.sleep=Math.round(r.sleep*10)/10; if(r.steps>0) o.steps=Math.round(r.steps); if(r.rhr>=30&&r.rhr<=120) o.rhr=Math.round(r.rhr); if(r.hrv>=5&&r.hrv<=300) o.hrv=Math.round(r.hrv);
      if(Object.keys(o).length) j[r.d]=Object.assign({},j[r.d]||{},o); }); await save('journal',j); }
  SH=null; shRender(); render(); toast('Import reușit',add.length+' rânduri adăugate.','info'); };
document.addEventListener('change',async e=>{ const t=e.target; if(t.dataset&&t.dataset.csv2&&t.files&&t.files[0]){ await ioPick(t.files[0]); t.value=''; } });
