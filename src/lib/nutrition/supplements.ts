/* Suplimentele pe niveluri de dovezi:
   Tier 1 — dovezi puternice și siguranță bună; Tier 2 — dovezi moderate sau doar în anumite situații;
   Tier 3 — blocate în aplicație (fără beneficiu dovedit sau cu risc: hormoni, stimulente, diuretice, „cutting" extrem). */
import { checkOutput } from '../coach/guardrails.ts';

export type Tier = 1 | 2 | 3;

export interface Supplement {
  id: string;
  name: string;
  tier: 1 | 2;
  dose: string;
  /** Eticheta scurtă a nivelului de dovezi. */
  evidence: string;
  /** Pentru ce fel de antrenament contează. */
  when?: string;
}

export const SUPPLEMENTS: readonly Supplement[] = [
  { id: 'creatina', name: 'Creatină monohidrat', tier: 1, evidence: 'dovezi puternice', dose: '3–5 g pe zi, oricând, și în zilele libere. Efectul vine din saturare, după 3–4 săptămâni.' },
  { id: 'proteina', name: 'Proteină din zer sau vegetală', tier: 1, evidence: 'dovezi puternice', dose: 'Doar ca să ajungi la ținta zilnică de proteină: 20–40 g pe porție, după antrenament sau când nu ai o masă.' },
  { id: 'cafeina', name: 'Cafeină', tier: 1, evidence: 'dovezi puternice', dose: '3 mg/kg cu 45–60 de minute înainte de sesiunile grele, cel mult 400 mg pe zi și nu după ora 14.', when: 'sesiuni intense' },
  { id: 'vitd', name: 'Vitamina D3', tier: 1, evidence: 'dacă ai deficit', dose: '1000–2000 UI pe zi, mai ales din octombrie până în aprilie. Ideal după un test de sânge.' },
  { id: 'electroliti', name: 'Electroliți (sodiu)', tier: 1, evidence: 'dovezi bune', dose: '300–600 mg sodiu pe oră în sesiunile de peste 60 de minute, la căldură sau dacă transpiri mult (urme albe pe haine). După efort: sare în masă sau 500–1000 mg sodiu în apa de rehidratare.', when: 'sesiuni lungi' },
  { id: 'omega3', name: 'Omega-3 (EPA + DHA)', tier: 2, evidence: 'pentru sănătate', dose: '1–2 g pe zi, dacă mănânci pește gras mai rar de două ori pe săptămână.' },
  { id: 'betaal', name: 'Beta-alanină', tier: 2, evidence: 'dovezi moderate', dose: '3,2–6,4 g pe zi, împărțit, cel puțin 4 săptămâni. Ajută la eforturile de 1–4 minute (rundele); poate furnica.' },
  { id: 'nitrati', name: 'Nitrați (suc de sfeclă)', tier: 2, evidence: 'dovezi moderate', dose: '~400 mg nitrați (70–140 ml concentrat) cu 2–3 ore înainte de alergări sau condiționare.' },
  { id: 'bicarbonat', name: 'Bicarbonat de sodiu', tier: 2, evidence: 'dovezi moderate', dose: '0,2–0,3 g/kg cu 60–90 de minute înainte de eforturi repetate de 1–7 minute. Încearcă întâi într-o zi fără meci: poate deranja stomacul.' },
];

/** Exemple de ce blochează aplicația (explicate, nu recomandate). */
export const BLOCKED: readonly { name: string; why: string }[] = [
  { name: 'Test boosters (tribulus și altele)', why: 'Nu cresc testosteronul în mod relevant la oamenii sănătoși; unele conțin substanțe interzise nedeclarate.' },
  { name: 'Arzătoare de grăsimi', why: 'Stimulente în doze mari (efedrină, yohimbină, DMAA): risc cardiac, fără efect real pe compoziția corporală.' },
  { name: 'Prohormoni, SARMs, steroizi', why: 'Substanțe hormonale cu risc pentru inimă, ficat și fertilitate; interzise în sport.' },
  { name: 'Diuretice și „tăiere" de apă extremă', why: 'Deshidratarea scade forța, crește riscul de accidentare și de leziuni la cap în sporturile de contact.' },
  { name: 'Diete sub pragul sigur', why: 'Sub 1600 kcal pe zi (femei) sau 2000 kcal pe zi (bărbați), aplicația nu propune ținte.' },
];

/** Nivelul unui supliment după nume: cele din listă au nivelul lor; ce pică filtrul Tier 3 e blocat; restul e necunoscut (null). */
export function tierOf(name: string): Tier | null {
  const n = name.trim().toLowerCase();
  const known = SUPPLEMENTS.find((s) => s.name.toLowerCase() === n || s.id === n);
  if (known) return known.tier;
  const r = checkOutput(name, { sex: 'm', injuries: [] });
  return !r.ok && r.code === 'tier3' ? 3 : null;
}
