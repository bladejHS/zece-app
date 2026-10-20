/* =====================================================================
   Semnele zilelor: o rândunică pe un cer de noapte, care urcă puțin câte puțin de luni până duminică
   (public/art/zi-0…6.svg, generate de scripts/build-art.mjs)
   ===================================================================== */
const DAY_PH={"d0":"art/zi-0.svg","d1":"art/zi-1.svg","d2":"art/zi-2.svg","d3":"art/zi-3.svg","d4":"art/zi-4.svg","d5":"art/zi-5.svg","d6":"art/zi-6.svg"};
/* semnul zilei d (0 = luni): st = 'done' (ziua completă) sau 'next' (următoarea); decorativă, rândul are deja textul */
function dayBadge(d,st='',sz=46){ const src=DAY_PH['d'+d]; if(!src) return '';
  return `<span class="dbg ${st}" style="--bs:${sz}px" aria-hidden="true"><img src="${src}" alt="" decoding="async" width="${sz}" height="${sz}"></span>`; }
/* același semn în interiorul inelului din săptămâna de pe Acasă (decupată rotund) */
const DBG_CLIP='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="dbgClip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath></svg>';
function dayBadgeSvg(d,s){ const src=DAY_PH['d'+d]; if(!src) return ''; const z=Math.round(s*.66), o=(s-z)/2;
  return `<image href="${src}" x="${o}" y="${o}" width="${z}" height="${z}" clip-path="url(#dbgClip)"/>`; }
/* când ziua devine completă, semnul ei se ridică ușor, ca o rândunică ce prinde curentul */
function dbgStamp(card){ const b=card&&card.querySelector('.dbg'); if(!b) return; b.classList.remove('stamp'); void b.offsetWidth; b.classList.add('stamp','done'); }
