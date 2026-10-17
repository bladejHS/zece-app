/**
 * Tipuri TypeScript pentru AI Coach API
 * BYO-key mode: cheia Anthropic stocată în IndexedDB, apel direct la api.anthropic.com
 */

export interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CoachRequest {
  messages: CoachMessage[];
  model?: string;
  max_tokens?: number;
  system?: string;
}

export interface CoachResponse {
  id: string;
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface CoachError {
  type: 'rate_limit' | 'auth' | 'network' | 'guardrail' | 'unknown';
  message: string;
  retryable: boolean;
}

export interface GuardrailViolation {
  rule: string;
  detail: string;
  blockedContent: string;
}

/** Supplement tiers — Tier 3 este BLOCAT ACTIV */
export const SUPPLEMENT_TIERS = {
  TIER1_SAFE: ['creatina', 'd3', 'k2', 'omega-3', 'magneziu', 'vitamina d'],
  TIER2_CONTEXTUAL: ['beta-alanina', 'cofeina', 'electroliti', 'colagen', 'cafea'],
  TIER3_BLOCKED: [
    'test booster', 'testosterone booster', 'fat burner', 'prohormone',
    'prohormon', 'steroid', 'sarm', 'peptide', 'hgh', 'igf-1',
    'tribulus', 'd-aspartic acid', 'daa', 'yohimbine', 'efedrina',
    'dmaa', 'dmha', 'clenbuterol', 't3', 't4', 'thyroid',
  ],
} as const;

/** Limite calorice minime sigure */
export const CALORIE_MINIMUMS = {
  female: 1600,
  male: 2000,
} as const;

/** Max zile consecutive intense fără deload */
export const MAX_CONSECUTIVE_INTENSE_DAYS = 7;