/**
 * Offline Coach — Fallback bazat pe reguli hardcodate când AI nu răspunde
 * - Activare automată la timeout >5s sau eroare rețea
 * - Adaptări locale: lowEnergySubstitution, injuryModifications, deloadCheck
 * - Colectare feedback în IndexedDB pentru sync ulterior
 * - Banner discret "Mod offline activ"
 */

export interface OfflineContext {
  /** Nivel energie raportat (1-10) */
  energyLevel?: number;
  /** Ore de somn noaptea trecută */
  sleepHours?: number;
  /** Durere musculară (DOMS) 1-10 */
  soreness?: number;
  /** Accidentări declarate */
  injuries?: string[];
  /** Zile consecutive de antrenament intens */
  consecutiveIntenseDays?: number;
  /** Săptămâna curentă în ciclu (1-4) */
  cycleWeek?: number;
}

export interface OfflineAdvice {
  message: string;
  adaptations: string[];
  isOffline: true;
}

const OFFLINE_BANNER = 'Mod offline activ. Adaptări bazate pe reguli predefinite.';

/**
 * Generează recomandări adaptative fără AI, bazat pe reguli hardcodate
 */
export function getOfflineCoachAdvice(ctx: OfflineContext): OfflineAdvice {
  const adaptations: string[] = [];
  let message = '';

  // Low energy substitution
  if ((ctx.energyLevel ?? 5) <= 3 || (ctx.sleepHours ?? 7) < 6) {
    adaptations.push('Reducere volum la 50% — energie scăzută detectată');
    adaptations.push('Înlocuiește exercițiile complexe cu variante izometrice');
    adaptations.push('Adaugă 2 minute pauză între seturi');
    message = 'Corpul tău cere recuperare. Antrenament ușor astăzi, focus pe tehnică.';
  }

  // High soreness
  if ((ctx.soreness ?? 0) >= 7) {
    adaptations.push('DOMS sever — schimbă grupa musculară sau fă mobilitate');
    adaptations.push('Hidratează-te suplimentar: +500ml apă cu electroliți');
    if (!message) message = 'Recuperare activă recomandată. Ascultă-ți corpul.';
  }

  // Injury modifications
  if (ctx.injuries && ctx.injuries.length > 0) {
    for (const injury of ctx.injuries) {
      const lower = injury.toLowerCase();
      if (lower.includes('genunchi')) {
        adaptations.push('Genunchi: evită squat-uri profunde, jump-uri, genuflexiuni grele');
        adaptations.push('Înlocuiește cu: leg press ușor, extensii izometrice, înot');
      }
      if (lower.includes('spate') || lower.includes('lombar')) {
        adaptations.push('Spate: evită deadlift, good morning, row din aplecat');
        adaptations.push('Înlocuiește cu: hyperextension, plank lateral, bird-dog');
      }
      if (lower.includes('umăr')) {
        adaptations.push('Umăr: evită overhead press, dip, handstand push-up');
        adaptations.push('Înlocuiește cu: lateral raise ușor, face pull, band pull-apart');
      }
    }
    if (!message) message = 'Antrenament adaptat pentru accidentările tale declarate.';
  }

  // Deload check (week 4 = automatic 40% reduction)
  if (ctx.cycleWeek === 4) {
    adaptations.push('DELOAD WEEK: reducere automată 40% la volum total');
    adaptations.push('Menține intensitatea, scade numărul de seturi');
    adaptations.push('Focus pe mobilitate și recuperare activă');
    message = 'Săptămână de deload. Corpul se regenerează pentru ciclul următor.';
  }

  // Consecutive intense days guardrail
  if ((ctx.consecutiveIntenseDays ?? 0) > 7) {
    adaptations.push('⚠️ Peste 7 zile consecutive intense — zi de repaus OBLIGATORIE');
    adaptations.push('Recomandare: mobilitate 20min + stretching + hidratare');
    message = 'Ai depășit limita sigură. Odihna este parte din antrenament.';
  }

  // Default dacă nimic nu s-a declanșat
  if (adaptations.length === 0) {
    message = 'Planul tău de antrenament rămâne neschimbat. Continuă cu disciplina!';
    adaptations.push('Urmează planul standard al zilei');
  }

  return {
    message,
    adaptations,
    isOffline: true,
  };
}

/**
 * Returnează textul banner-ului offline
 */
export function getOfflineBanner(): string {
  return OFFLINE_BANNER;
}

/**
 * Stochează feedback offline în IndexedDB pentru sync ulterior
 */
export async function storeOfflineFeedback(feedback: {
  timestamp: number;
  context: OfflineContext;
  advice: OfflineAdvice;
  userAction?: string;
}): Promise<void> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('feedback', 'readwrite');
    const store = tx.objectStore('feedback');
    store.add(feedback);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineCoach] Stocare feedback eșuată:', err);
  }
}

/**
 * Recuperează feedback offline nesincronizat
 */
export async function getPendingOfflineFeedback(): Promise<Array<{
  timestamp: number;
  context: OfflineContext;
  advice: OfflineAdvice;
  userAction?: string;
}>> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('feedback', 'readonly');
    const store = tx.objectStore('feedback');
    const req = store.getAll();
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Șterge feedback deja sincronizat
 */
export async function clearSyncedFeedback(): Promise<void> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('feedback', 'readwrite');
    tx.objectStore('feedback').clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineCoach] Curățare feedback eșuată:', err);
  }
}

// IndexedDB helper pentru offline feedback
const OFFLINE_DB_NAME = 'zece-offline-feedback';
const OFFLINE_DB_VERSION = 1;

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('feedback')) {
        db.createObjectStore('feedback', { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}