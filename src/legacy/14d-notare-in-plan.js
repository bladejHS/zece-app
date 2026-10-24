/* =====================================================================
   v16 · EXERCIȚIILE ZILEI ÎN PLAN — luni și joi, cardul zilei e împărțit: SESSION 1 forța, SESSION 2 easy run-ul, la ~6 ore după.
   v17: seriile și alergările se notează doar din „Începe ziua” (notarea direct în card a fost scoasă, la cererea ta).
   ===================================================================== */
/* exercițiile zilei, cu antetele de sesiune pe zilele împărțite (abdomenul opțional rămâne în SESSION 1) */
function planExHTML(w,d,day){
  const s2=e=>e.kind==='run'||e.kind==='cardio', sp=splitDay(d), L=sp?day.ex.filter(e=>!s2(e)).concat(day.ex.filter(s2)):day.ex;
  return L.map((e,i)=>{ const on=isDone(w,d,e.x), prev=L[i-1]||{};
    const hd=sp&&i===0?`<div class="ses-h"><b>SESSION 1</b><span>Forță</span></div>`
      :sp&&s2(e)?`<div class="ses-h"><b>SESSION 2</b><span>${e.kind==='cardio'?'Cardio Z2 · imediat după forță sau la ~6 ore':'Easy Run Z2 · la ~6 ore după forță'}</span></div>`:'';
    return `${hd}${e.opt&&!prev.opt?`<div class="ex-opt-h"><b>${ic('plus')} Abdomen · opțional</b><span>Nu contează la ziua completă: îl faci când ai chef.</span></div>`:''}<div class="ex ${on?'done':''} ${e.opt?'opt':''}">
      <button class="tick ${on?'on':''}" data-a="tick" data-w="${w}" data-d="${d}" data-x="${e.x}" aria-label="${on?'Debifează':'Bifează'} ${esc(e.n)}">${ic('check')}</button>
      <div class="sp"><div class="ex-n">${esc(e.n)}</div><div class="ex-p">${esc(e.p)}</div>${e.kind==='lift'&&miloCue(e.n)?`<div class="ex-l ex-mw">${ic('bolt')} ${esc(miloCue(e.n))}</div>`:''}${lastLine(e)}${exNote(e.n)?`<div class="ex-l ex-nt">${ic('edit')} ${esc(exNote(e.n))}</div>`:''}</div>
      ${e.kind==='lift'?`<button class="xb" data-a="tech" data-k="${esc(e.n)}" aria-label="Tehnică pentru ${esc(e.n)}">${ic('info')}</button>`:''}</div>`; }).join('');
}
