/* =====================================================================
   v12 · insignele zilelor și animația de deschidere cu operatorul SRI
   ===================================================================== */
/* insignele (src/assets/days/d0…d6.jpg) și portretul de la deschidere (src/assets/intro), făcute în Canva:
   build.js pune aici fotografiile, build_site.js le face fișiere */
const DAY_PH={"d0":"day-d0.jpg","d1":"day-d1.jpg","d2":"day-d2.jpg","d3":"day-d3.jpg","d4":"day-d4.jpg","d5":"day-d5.jpg","d6":"day-d6.jpg"};
const INTRO_PH={"sri":"intro-sri.jpg"};
Object.keys(INTRO_PH).forEach(k=>{ try{ document.documentElement.style.setProperty('--intro-'+k,cssUrl(INTRO_PH[k])); }catch(e){} });
/* insigna zilei d (0 = luni): st = 'done' (ziua completă) sau 'next' (următoarea); decorativă, rândul are deja textul */
function dayBadge(d,st='',sz=46){ const src=DAY_PH['d'+d]; if(!src) return '';
  return `<span class="dbg ${st}" style="--bs:${sz}px" aria-hidden="true"><img src="${src}" alt="" decoding="async" width="${sz}" height="${sz}"></span>`; }
/* aceeași insignă în interiorul inelului din săptămâna de pe Acasă (decupată rotund) */
const DBG_CLIP='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="dbgClip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath></svg>';
function dayBadgeSvg(d,s){ const src=DAY_PH['d'+d]; if(!src) return ''; const z=Math.round(s*.66), o=(s-z)/2;
  return `<image href="${src}" x="${o}" y="${o}" width="${z}" height="${z}" clip-path="url(#dbgClip)"/>`; }
/* „ștampila": când ziua devine completă, insigna ei sare și o străbate luciul metalic */
function dbgStamp(card){ const b=card&&card.querySelector('.dbg'); if(!b) return; b.classList.remove('stamp'); void b.offsetWidth; b.classList.add('stamp','done'); }
