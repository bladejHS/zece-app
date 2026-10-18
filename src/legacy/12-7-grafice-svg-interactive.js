/* =====================================================================
   7 · GRAFICE — SVG, interactive: atingi sau treci cu mouse-ul și vezi valoarea exactă.
   Fiecare grafic își înregistrează punctele în CH; un singur ascultător pe document
   mută linia verticală și eticheta. Culorile vin din tokenuri (merg în ambele teme).
   ===================================================================== */
let gid=0;
const isLight=()=>document.documentElement.getAttribute('data-mode')==='light';
/* culorile semantice ca valori (atributele SVG și canvas-ul nu înțeleg var()) */
const COL=()=>{ const c=COL0(); if(S.theme==='otel'||!THEMES[S.theme]) c.run=isLight()?'#0E8C80':'#3CCBBB'; if(!isLight()&&S.bg!=='black'){ c.bg='#0E1013'; c.card='#15181D'; } return c; };
const COL0=()=>isLight()?{run:'#1F78DC',ok:'#12966A',warn:'#C27800',bad:'#D23A3A',z1:'#8A8A93',vio:'#7C4DE8',tx:'#0D0D10',mu:'#55555E',bg:'#F2F2EF',card:'#FFFFFF'}
  :{run:'#4DA3FF',ok:'#3DDC97',warn:'#FFB020',bad:'#FF5C5C',z1:'#9AA0A8',vio:'#8B5CF6',tx:'#F4F4F5',mu:'#A1A1AA',bg:'#050506',card:'#0E0E10'};
function ring(f,o={}){
  const s=o.s||44, sw=o.sw||4, r=s/2-sw/2-1, C=2*Math.PI*r, ff=clamp(f||0,0,1), c=s/2;
  return `<svg class="ring" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true">
    <circle cx="${c}" cy="${c}" r="${r}" style="fill:${o.fill||'none'};stroke:${o.track||'var(--track)'}" stroke-width="${sw}"/>
    ${ff>0?`<circle class="rg" cx="${c}" cy="${c}" r="${r}" fill="none" style="stroke:${o.c||'var(--ac)'};--c:${C.toFixed(2)}" stroke-width="${sw}" stroke-linecap="round"
      stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-ff)).toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`:''}
    ${o.inner||''}</svg>`;
}
/* registrul graficelor de pe ecran (pentru etichetele interactive) */
let CH={}, chN=0;
function chReg(d){ if(chN%200===199){ const live=new Set([...document.querySelectorAll('svg[data-ch]')].map(s=>s.dataset.ch)); Object.keys(CH).forEach(k=>{ if(!live.has(k)) delete CH[k]; }); }
  const id='c'+(++chN); CH[id]=d; return id; }
const fmtDayY=k=>fmtDay(k)+(k.slice(0,4)!==todayKey().slice(0,4)?' '+k.slice(0,4):'');
/* regresia liniară (cele mai mici pătrate) pe perechi [x, y] */
function linReg(xy){ const n=xy.length; if(n<2) return null; const mx=avgOf(xy.map(p=>p[0])), my=avgOf(xy.map(p=>p[1])); let sxy=0,sxx=0;
  xy.forEach(([x,y])=>{ sxy+=(x-mx)*(y-my); sxx+=(x-mx)*(x-mx); }); if(!sxx) return null; const b=sxy/sxx; return {b,a:my-b*mx,at:x=>my-b*mx+b*x}; }
/* grafic linie. o: pts [{x:'YYYY-MM-DD'|număr, y}], ma (linie netezită), s2 [{pts,hex,name}], goal, goalLbl,
   trend, avg, fmt(v), unit, dec, hex, blue, minR, h, label, name, num (x numeric), xfmt(x), inv (valorile mici sus, ex. ritm) */
/* lățimea de desen a graficelor: pe ecrane late, cardurile sunt mai late, așa că desenăm mai lat (textul rămâne la aceeași mărime) */
const chW=()=>innerWidth>=1100?520:innerWidth>=760?640:340;
/* repere „rotunde" pe axa Y: pas de 1, 2, 2,5 sau 5 × 10^k */
function niceTicks(lo,hi,n){ const span=hi-lo||1, raw=span/(n||3), p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p, st=(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p;
  const a=Math.floor(lo/st)*st, b=Math.ceil(hi/st)*st, out=[]; for(let v=a;v<=b+st/2;v+=st) out.push(+v.toFixed(10));
  const dec=Math.max(0,-Math.floor(Math.log10(st)+1e-9)+(String(st/p).indexOf('.')>=0?1:0)); return {t:out,a,b,dec:Math.min(3,dec)}; }
function lineChart(o){
  const W=chW(),H=o.h||172,L=o.yw||40,R=8,T=14,B=24, pts=(o.pts||[]).filter(p=>p&&isFinite(p.y)), numX=!!o.num, tx=p=>numX?+p.x:+parseKey(p.x);
  if(!pts.length) return '';
  const extra=(o.s2||[]).filter(s=>s&&s.pts&&s.pts.length);
  let all=pts.concat(...extra.map(s=>s.pts)), x0=Math.min(...all.map(tx)), x1=Math.max(...all.map(tx));
  if(x1-x0<(numX?1e-9:864e5)){ const pad=numX?.5:3*864e5; x0-=pad; x1+=pad; }
  let ys=all.map(p=>p.y); if(o.ma) ys=ys.concat(o.ma.map(p=>p.y));
  if(o.goal!=null){ const lo=Math.min(...ys), hi=Math.max(...ys); if(o.goal>=lo-Math.max(3,(hi-lo)*1.5)&&o.goal<=hi+Math.max(3,(hi-lo)*1.5)) ys.push(o.goal); }
  let y0=Math.min(...ys), y1=Math.max(...ys); const mr=o.minR!=null?o.minR:2; if(y1-y0<mr){ const c=(y0+y1)/2; y0=c-mr/2; y1=c+mr/2; } const py=(y1-y0)*.08; y0-=py; y1+=py;
  const nt=niceTicks(y0,y1,3); y0=Math.min(y0,nt.a); y1=Math.max(y1,nt.b);
  const X=t=>L+(t-x0)/(x1-x0)*(W-L-R), Y=v=>o.inv?T+(v-y0)/(y1-y0)*(H-T-B):T+(y1-v)/(y1-y0)*(H-T-B);
  const P=arr=>arr.map((p,i)=>(i?'L':'M')+X(tx(p)).toFixed(1)+','+Y(p.y).toFixed(1)).join('');
  const dec=o.dec==null?1:o.dec, fv=o.fmt||(v=>num(v,dec)+(o.unit?' '+o.unit:'')), fa=o.fmtAx||o.fmt||(v=>num(v,nt.dec));
  const main=o.ma&&o.ma.length>1?o.ma:pts, hex=o.hex||'var(--ac)', gidn='lg'+(++gid);
  let g=''; nt.t.forEach(v=>{ const y=Y(v).toFixed(1);
    g+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="gl"/><text x="${L-6}" y="${(+y+3.5).toFixed(1)}" text-anchor="end" class="ax">${esc(fa(v))}</text>`; });
  const gl=o.goal!=null&&o.goal>=y0&&o.goal<=y1?`<line x1="${L}" x2="${W-R}" y1="${Y(o.goal).toFixed(1)}" y2="${Y(o.goal).toFixed(1)}" class="goal"/>
    <text x="${W-R}" y="${(Y(o.goal)-5).toFixed(1)}" text-anchor="end" class="goal-t">${esc(o.goalLbl||'țintă '+fa(o.goal))}</text>`:'';
  const av=o.avg&&pts.length>1?avgOf(pts.map(p=>p.y)):null;
  const avl=av!=null?`<line x1="${L}" x2="${W-R}" y1="${Y(av).toFixed(1)}" y2="${Y(av).toFixed(1)}" class="avg"/><text x="${L+4}" y="${(Y(av)-5).toFixed(1)}" class="avg-t">medie ${esc(fa(av))}</text>`:'';
  let tr=''; if(o.trend&&pts.length>=3){ const lr=linReg(pts.map(p=>[tx(p),p.y])); if(lr){ const a=tx(pts[0]), b=tx(pts[pts.length-1]);
    tr=`<line class="trend" x1="${X(a).toFixed(1)}" y1="${Y(lr.at(a)).toFixed(1)}" x2="${X(b).toFixed(1)}" y2="${Y(lr.at(b)).toFixed(1)}"/>`; } }
  const area=o.noArea?'':P(main)+`L${X(tx(main[main.length-1])).toFixed(1)},${H-B}L${X(tx(main[0])).toFixed(1)},${H-B}Z`;
  const dots=o.ma||o.dots?pts.map(p=>`<circle cx="${X(tx(p)).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.2" class="raw"/>`).join(''):'';
  const s2=extra.map(s=>`<path d="${P(s.pts)}" class="ln b2" style="stroke:${s.hex||'var(--mu)'}" ${s.dash?'stroke-dasharray="5 4"':''} pathLength="1"/>`).join('');
  const last=main[main.length-1];
  const xl=x=>numX?(o.xfmt?o.xfmt(x):num(x)):fmtDay(keyOf(new Date(x)));
  /* punctele pentru etichetă: seria principală (valorile brute), plus valoarea celorlalte serii la același x */
  const tp=pts.map(p=>({px:X(tx(p)),py:Y(p.y),t:numX?(o.xfmt?o.xfmt(p.x):num(p.x)):fmtDayY(p.x),v:fv(p.y),n:o.name||'',
    more:extra.map(s=>{ const q=s.pts.find(z=>tx(z)===tx(p)); return q?{n:s.name||'',v:fv(q.y),c:s.hex}:null; }).filter(Boolean).concat(p.note?[{n:p.note,v:'',c:''}]:[])}));
  const id=chReg({k:'l',pts:tp,hex});
  return `<svg class="chart" data-ch="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'grafic')}">
    <defs><linearGradient id="${gidn}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${hex}" stop-opacity=".3"/><stop offset="1" style="stop-color:${hex}" stop-opacity="0"/></linearGradient></defs>
    ${g}${gl}${avl}${area?`<path d="${area}" fill="url(#${gidn})" class="area"/>`:''}${dots}${s2}
    <path d="${P(main)}" class="ln ${o.blue?'blue':''}" style="stroke:${hex}" pathLength="1"/>${tr}
    <circle class="endpt" cx="${X(tx(last)).toFixed(1)}" cy="${Y(last.y).toFixed(1)}" r="4.5" style="fill:${hex}"/>
    <line class="hx" x1="0" x2="0" y1="${T}" y2="${H-B}"/><circle class="hd" r="5" cx="0" cy="0" style="fill:${hex}"/>
    <text x="${L}" y="${H-5}" class="ax">${esc(xl(x0))}</text>
    <text x="${W-R}" y="${H-5}" text-anchor="end" class="ax">${esc(xl(x1))}</text></svg>`;
}
/* grafic cu bare. items [{lbl, v, hi, v2 (comparație, opțional), tip}], o: line, lineLbl, dec, hex, fmt, unit, h, label, noVal */
function barChart(items,o={}){
  const W=o.w||chW(),H=o.h||158,T=18,B=22,n=items.length,gap=n>20?3:n>12?5:8,bw=(W-gap*(n-1))/n,max=Math.max(1e-9,o.line||0,...items.map(i=>Math.max(i.v||0,i.v2||0))),hex=o.hex||COL().run,gidn='bg'+(++gid);
  const yL=o.line?H-B-(H-T-B)*o.line/max:null, dec=o.dec==null?1:o.dec, fv=o.fmt||(v=>num(v,dec)+(o.unit?' '+o.unit:''));
  const showV=!o.noVal&&n<=14, lblEvery=n>16?Math.ceil(n/8):1;
  const tp=[]; const bars=items.map((it,i)=>{ const h=Math.max(it.v>0?3:0,(H-T-B)*(it.v||0)/max), x=i*(bw+gap), y=H-B-h;
      tp.push({px:x+bw/2,py:y,t:it.tip||it.lbl,v:fv(it.v||0),more:it.v2!=null?[{n:o.v2Lbl||'înainte',v:fv(it.v2),c:'var(--mu)'}]:[]});
      const h2=it.v2!=null?Math.max(it.v2>0?2:0,(H-T-B)*it.v2/max):0;
      return (it.v2!=null&&h2>0?`<rect x="${(x+1).toFixed(1)}" y="${(H-B-h2).toFixed(1)}" width="${Math.max(1,bw-2).toFixed(1)}" height="${h2.toFixed(1)}" rx="5" style="fill:none;stroke:rgba(var(--w),.28)" stroke-dasharray="3 3"/>`:'')+
        `<rect class="bar-r" style="--i:${i};fill:${it.hi?`url(#${gidn})`:'rgba(var(--w),.12)'}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${n>20?3:6}"/>
        ${showV&&it.v>0?`<text x="${(x+bw/2).toFixed(1)}" y="${(y-5).toFixed(1)}" text-anchor="middle" class="bv">${num(it.v,dec)}</text>`:''}
        ${i%lblEvery===0||i===n-1?`<text x="${(x+bw/2).toFixed(1)}" y="${H-5}" text-anchor="middle" class="ax">${esc(it.lbl)}</text>`:''}`; }).join('');
  const id=chReg({k:'b',pts:tp,hex});
  return `<svg class="chart" data-ch="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'grafic')}">
    <defs><linearGradient id="${gidn}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${hex}"/><stop offset="1" style="stop-color:${hex}" stop-opacity=".35"/></linearGradient></defs>
    ${bars}
    ${yL!=null?`<line x1="0" x2="${W}" y1="${yL.toFixed(1)}" y2="${yL.toFixed(1)}" class="goal"/><text x="${W}" y="${(yL-5).toFixed(1)}" text-anchor="end" class="goal-t">${esc(o.lineLbl||'')}</text>`:''}
    <line class="hx" x1="0" x2="0" y1="${T}" y2="${H-B}"/></svg>`;
}
/* rezumatul unei serii: medie, minim, maxim și schimbarea (prima → ultima valoare sau față de perioada anterioară) */
function chStats(vals,o={}){
  const v=vals.filter(x=>isFinite(x)); if(v.length<2) return '';
  const f=o.fmt||(x=>num(x,o.dec==null?1:o.dec)), a=avgOf(v), lo=Math.min(...v), hi=Math.max(...v);
  /* schimbarea: totalul perioadei față de perioada anterioară (cur/prev), altfel prima → ultima valoare */
  const hasP=o.prev!=null&&o.cur!=null, ref=hasP?o.prev:v[0], cur=hasP?o.cur:v[v.length-1], ch=ref?(cur-ref)/Math.abs(ref)*100:null, good=o.lowGood||o.down?ch<0:ch>0;
  return `<div class="ch-stats"><div><span>Medie</span><b>${esc(f(a))}</b></div><div><span>${o.lowGood?'Cel mai bun':'Minim'}</span><b>${esc(f(lo))}</b></div>
    <div><span>${o.lowGood?'Cel mai lent':'Maxim'}</span><b>${esc(f(hi))}</b></div>
    <div><span>${hasP?'Total vs. înainte':'Prima → ultima'}</span><b class="${ch==null||Math.abs(ch)<.5?'':good?'good':'bad'}">${ch==null?'—':(ch>0?'+':'')+num(ch,Math.abs(ch)<10?1:0)+'%'}</b></div></div>`;
}
/* eticheta interactivă */
const CHT={svg:null,t:0};
function chShow(svg,cx,cy){
  const d=CH[svg.dataset.ch]; if(!d||!d.pts.length) return; const m=svg.getScreenCTM(); if(!m) return;
  const p=new DOMPoint(cx,cy).matrixTransform(m.inverse()); let bi=0, bd=1e9;
  d.pts.forEach((q,i)=>{ const dd=Math.abs(q.px-p.x); if(dd<bd){ bd=dd; bi=i; } });
  const q=d.pts[bi], hx=svg.querySelector('.hx'), hd=svg.querySelector('.hd');
  if(hx){ hx.setAttribute('x1',q.px.toFixed(1)); hx.setAttribute('x2',q.px.toFixed(1)); }
  if(hd){ hd.setAttribute('cx',q.px.toFixed(1)); hd.setAttribute('cy',q.py.toFixed(1)); }
  if(d.k==='b') svg.querySelectorAll('.bar-r').forEach((r,i)=>r.classList.toggle('hl',i===bi));
  if(CHT.svg&&CHT.svg!==svg) chHide(); CHT.svg=svg; svg.classList.add('hov');
  const sp=new DOMPoint(q.px,q.py).matrixTransform(m), tip=$('#chTip'); if(!tip) return;
  tip.innerHTML=`<b>${esc(q.v)}</b>${q.n?`<div>${esc(q.n)}</div>`:''}<div>${esc(q.t)}</div>${(q.more||[]).map(x=>`<div class="r">${x.c?`<i style="background:${x.c}"></i>`:''}${esc(x.n)}${x.v?' · <b style="display:inline;font-size:13px">'+esc(x.v)+'</b>':''}</div>`).join('')}`;
  const x=clamp(sp.x,70,innerWidth-70), y=Math.max(sp.y,tip.offsetHeight+16);
  tip.style.left=x+'px'; tip.style.top=y+'px'; tip.classList.add('on');
}
function chHide(){ if(CHT.svg){ CHT.svg.classList.remove('hov'); CHT.svg.querySelectorAll('.bar-r.hl').forEach(r=>r.classList.remove('hl')); CHT.svg=null; } const t=$('#chTip'); if(t) t.classList.remove('on'); }
document.addEventListener('pointermove',e=>{ const svg=e.target&&e.target.closest?e.target.closest('svg.chart[data-ch]'):null;
  if(svg) chShow(svg,e.clientX,e.clientY); else if(CHT.svg&&e.pointerType==='mouse') chHide(); },{passive:true});
document.addEventListener('pointerdown',e=>{ const svg=e.target&&e.target.closest?e.target.closest('svg.chart[data-ch]'):null;
  if(svg){ chShow(svg,e.clientX,e.clientY); clearTimeout(CHT.t); CHT.t=setTimeout(chHide,2600); } else chHide(); },{passive:true});
addEventListener('scroll',()=>{ if(CHT.svg) chHide(); },{passive:true});
/* la trecerea între telefon, tabletă și desktop graficele se redesenează la noua lățime */
let chBp=chW(), chRz=0;
addEventListener('resize',()=>{ clearTimeout(chRz); chRz=setTimeout(()=>{ const b=chW(); if(b!==chBp){ chBp=b; if(typeof render==='function'&&!S.fxOpen) render(); } else coverScroll(); },180); });
