/**
 * AI Coach client wrapper — BYO-key mode pentru GitHub Pages
 * - Cheia Anthropic stocată criptată în IndexedDB (via key-store.ts)
 * - Rate limiting client-side: max 10 req/min (token bucket)
 * - Timeout 5s → fallback offline automat
 * - Post-response guardrails obligatorii
 * - Upgrade path: schimbarea COACH_API_URL activează modul serverless proxy
 */

import { retrieveApiKey } from './key-store';
import { validateCoachResponse, type ValidateResult } from './guardrails';
import type { CoachMessage, CoachResponse, CoachError } from './types';

/** URL-ul endpoint-ului coach — implicit Anthropic direct, switch la proxy prin env var */
const COACH_API_URL = import.meta.env.PUBLIC_COACH_API_URL || 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5-5';
const TIMEOUT_MS = 5000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

/** System prompt pentru coach-ul ZECE */
const SYSTEM_PROMPT = `Ești antrenorul personal ZECE, specializat în box/kickboxing și pregătire hibridă.
Răspunde ÎNTOTDEAUNA în română. Fii concis (max 180 cuvinte), concret și motivațional.
Folosește bold pentru numere și valori cheie. Nu recomanda NICIODATĂ suplimente periculoase
(test boosters, fat burners, prohormones). Recomandările calorice trebuie să fie peste
1600 kcal/zi (femei) sau 2000 kcal/zi (bărbați). Nu sugera mai mult de 7 zile consecutive
de antrenament intens fără deload.`;

// Token bucket pentru rate limiting client-side
let tokenBucket = {
  tokens: RATE_LIMIT_MAX,
  lastRefill: Date.now(),
};

function consumeToken(): boolean {
  const now = Date.now();
  const elapsed = now - tokenBucket.lastRefill;
  const refill = Math.floor((elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_MAX);

  if (refill > 0) {
    tokenBucket.tokens = Math.min(RATE_LIMIT_MAX, tokenBucket.tokens + refill);
    tokenBucket.lastRefill = now;
  }

  if (tokenBucket.tokens > 0) {
    tokenBucket.tokens--;
    return true;
  }
  return false;
}

export interface CoachCallOptions {
  messages: CoachMessage[];
  model?: string;
  maxTokens?: number;
  gender?: 'male' | 'female';
  injuries?: string[];
  signal?: AbortSignal;
}

/**
 * Apelează AI Coach cu validare completă
 * Returnează răspunsul validat sau eroarea structurată
 */
export async function callCoach(options: CoachCallOptions): Promise<{
  response?: CoachResponse;
  validation?: ValidateResult;
  error?: CoachError;
}> {
  // Rate limit check
  if (!consumeToken()) {
    return {
      error: {
        type: 'rate_limit',
        message: 'Prea multe cereri. Așteaptă un minut înainte de a întreba din nou.',
        retryable: true,
      },
    };
  }

  // Retrieve API key
  const apiKey = await retrieveApiKey();
  if (!apiKey) {
    return {
      error: {
        type: 'auth',
        message: 'Cheia API nu este configurată. Adaug-o în Settings.',
        retryable: false,
      },
    };
  }

  // Build request
  const body = {
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || 1024,
    system: SYSTEM_PROMPT,
    messages: options.messages,
  };

  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const mergedSignal = options.signal
      ? mergeAbortSignals(options.signal, controller.signal)
      : controller.signal;

    const res = await fetch(COACH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: mergedSignal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const status = res.status;
      if (status === 401 || status === 403) {
        return {
          error: {
            type: 'auth',
            message: 'Cheia API este invalidă sau expirată. Verific-o în Settings.',
            retryable: false,
          },
        };
      }
      if (status === 429) {
        return {
          error: {
            type: 'rate_limit',
            message: 'Rate limit atins pe server. Așteaptă puțin.',
            retryable: true,
          },
        };
      }
      return {
        error: {
          type: 'unknown',
          message: `Eroare server: ${status}`,
          retryable: status >= 500,
        },
      };
    }

    const data = await res.json();
    const response: CoachResponse = {
      id: data.id,
      content: data.content?.[0]?.text || '',
      model: data.model,
      usage: data.usage,
    };

    // Post-response guardrail validation
    const validation = validateCoachResponse(response.content, {
      gender: options.gender,
      injuries: options.injuries,
    });

    if (!validation.safe) {
      return {
        response,
        validation,
        error: {
          type: 'guardrail',
          message: validation.safeMessage,
          retryable: false,
        },
      };
    }

    return { response, validation };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        error: {
          type: 'network',
          message: 'Timeout — conexiunea a durat prea lung. Mod offline activat.',
          retryable: true,
        },
      };
    }
    return {
      error: {
        type: 'network',
        message: 'Eroare de rețea. Verifică conexiunea la internet.',
        retryable: true,
      },
    };
  }
}

/**
 * Merge două AbortSignal-uri într-unul singur
 */
function mergeAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}