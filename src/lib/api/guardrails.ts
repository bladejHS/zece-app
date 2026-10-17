/**
 * Post-response guardrails pentru AI Coach
 * Rulează ÎN BROWSER înainte de afișarea oricărui răspuns AI
 * Blochează: Tier 3 suplimente, calorii < minim, >7 zile consecutive, exerciții contraindicate
 */

import {
  SUPPLEMENT_TIERS,
  CALORIE_MINIMUMS,
  MAX_CONSECUTIVE_INTENSE_DAYS,
  type GuardrailViolation,
} from './types';

const SAFE_FALLBACK_MESSAGE =
  'Nu pot oferi acest sfat din motive de siguranță. Te rog consultă un medic sportiv sau nutriționist pentru recomandări personalizate.';

/**
 * Verifică dacă textul conține mențiuni de suplimente Tier 3 (blocate)
 */
function checkTier3Supplements(text: string): GuardrailViolation | null {
  const lower = text.toLowerCase();
  for (const term of SUPPLEMENT_TIERS.TIER3_BLOCKED) {
    if (lower.includes(term)) {
      return {
        rule: 'tier3_supplement_blocked',
        detail: `Mențiune supliment Tier 3 blocat: "${term}"`,
        blockedContent: term,
      };
    }
  }
  return null;
}

/**
 * Verifică recomandări calorice sub minimul sigur
 */
function checkCalorieMinimums(text: string, gender?: 'male' | 'female'): GuardrailViolation | null {
  const min = gender === 'female' ? CALORIE_MINIMUMS.female : CALORIE_MINIMUMS.male;
  // Match patterns like "1200 kcal", "1400kcal/zi", "sub 1500 calorii"
  const caloriePattern = /(\d{3,4})\s*(?:kcal|calorii|cal)/gi;
  let match: RegExpExecArray | null;

  while ((match = caloriePattern.exec(text)) !== null) {
    const value = parseInt(match[1], 10);
    if (value < min) {
      return {
        rule: 'calorie_below_minimum',
        detail: `Recomandare calorică ${value} kcal sub minimul sigur de ${min} kcal/zi`,
        blockedContent: match[0],
      };
    }
  }
  return null;
}

/**
 * Verifică sugestii de antrenament >7 zile consecutive fără deload
 */
function checkConsecutiveDays(text: string): GuardrailViolation | null {
  const lower = text.toLowerCase();
  // Match patterns like "8 zile consecutive", "10 zile fără pauză", "antrenează-te zilnic"
  const dayPatterns = [
    /(\d+)\s*zile\s*(?:consecutive|fără\s*pauză|fără\s*repaus|la\s*rând)/i,
    /antreneaz[ăa]-te\s*(?:zilnic|în\s*fiecare\s*zi)/i,
    /fără\s*(?:zi\s*de\s*)?pauză/i,
  ];

  for (const pattern of dayPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      const days = match[1] ? parseInt(match[1], 10) : MAX_CONSECUTIVE_INTENSE_DAYS + 1;
      if (days > MAX_CONSECUTIVE_INTENSE_DAYS || !match[1]) {
        return {
          rule: 'excessive_consecutive_days',
          detail: `Sugestie antrenament >${MAX_CONSECUTIVE_INTENSE_DAYS} zile consecutive fără deload`,
          blockedContent: match[0],
        };
      }
    }
  }
  return null;
}

/**
 * Verifică exerciții care contrazic accidentările declarate
 */
function checkInjuryContraindications(
  text: string,
  injuries: string[],
): GuardrailViolation | null {
  if (!injuries.length) return null;
  const lower = text.toLowerCase();

  // Mapping simplu: accidentare → exerciții contraindicate
  const contraindications: Record<string, string[]> = {
    'genunchi': ['squat', 'genuflexiune', 'jump', 'săritur', 'box jump', 'burpee'],
    'spate': ['deadlift', 'îndreptare', 'good morning', 'row', 'ramat'],
    'umăr': ['overhead press', 'press militar', 'handstand', 'dip', 'flotări'],
    'cot': ['pull-up', 'tracțiune', 'curl', 'flexie'],
    'încheietură': ['push-up', 'flotări', 'plank', 'planșă', 'burpee'],
    'gleznă': ['alergare', 'run', 'sprint', 'jump rope', 'coardă'],
  };

  for (const injury of injuries) {
    const lowerInjury = injury.toLowerCase();
    const exercises = contraindications[lowerInjury];
    if (exercises) {
      for (const exercise of exercises) {
        if (lower.includes(exercise)) {
          return {
            rule: 'injury_contraindication',
            detail: `Exercițiu "${exercise}" contraindicat pentru accidentare: "${injury}"`,
            blockedContent: exercise,
          };
        }
      }
    }
  }
  return null;
}

export interface ValidateResult {
  safe: boolean;
  violations: GuardrailViolation[];
  safeMessage: string;
}

/**
 * Validează complet un răspuns AI contra tuturor guardrails
 * Returnează mesajul sigur dacă validarea trece, sau fallback dacă eșuează
 */
export function validateCoachResponse(
  responseText: string,
  options?: {
    gender?: 'male' | 'female';
    injuries?: string[];
  },
): ValidateResult {
  const violations: GuardrailViolation[] = [];

  const tier3 = checkTier3Supplements(responseText);
  if (tier3) violations.push(tier3);

  const calories = checkCalorieMinimums(responseText, options?.gender);
  if (calories) violations.push(calories);

  const consecutive = checkConsecutiveDays(responseText);
  if (consecutive) violations.push(consecutive);

  const injury = checkInjuryContraindications(responseText, options?.injuries ?? []);
  if (injury) violations.push(injury);

  if (violations.length > 0) {
    console.warn('[Guardrails] Răspuns AI blocat:', violations);
    return {
      safe: false,
      violations,
      safeMessage: SAFE_FALLBACK_MESSAGE,
    };
  }

  return {
    safe: true,
    violations: [],
    safeMessage: responseText,
  };
}