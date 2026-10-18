/* HRV și somn: deload forțat când HRV-ul de azi e sub 90% din media ultimelor 7 zile.
   Datele vin din check-in (manual sau măsurat cu senzorul de puls) sau din importul CSV (Garmin Connect, Apple Health prin export). */

export interface HrvPoint { date: string; hrv?: number; sleep?: number }

export const HRV_DELOAD_RATIO = 0.9;
const MIN_BASELINE_DAYS = 4;

export interface HrvStatus {
  today: number | null;
  avg7: number | null;
  ratio: number | null;
  /** Deload forțat azi. */
  force: boolean;
  /** Câte zile intră în medie (cel puțin 4). */
  days: number;
}

const prevDay = (k: string, n: number): string => new Date(Date.parse(`${k}T12:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);

export function hrvStatus(points: readonly HrvPoint[], today: string): HrvStatus {
  const by = new Map(points.filter((p) => (p.hrv ?? 0) > 0).map((p) => [p.date, p.hrv as number]));
  const t = by.get(today) ?? null;
  const prev = Array.from({ length: 7 }, (_, i) => by.get(prevDay(today, i + 1))).filter((v): v is number => v != null);
  const avg7 = prev.length >= MIN_BASELINE_DAYS ? prev.reduce((a, b) => a + b, 0) / prev.length : null;
  const ratio = t != null && avg7 ? t / avg7 : null;
  return { today: t, avg7: avg7 != null ? Math.round(avg7) : null, ratio, force: ratio != null && ratio < HRV_DELOAD_RATIO, days: prev.length };
}

/** Importul CSV: găsește coloanele de dată, HRV și somn după nume (română sau engleză), oricare ar fi exportul. */
export function parseHealthCsv(text: string): HrvPoint[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const sep = [',', ';', '\t'].sort((a, b) => (lines[0]!.split(b).length - lines[0]!.split(a).length))[0]!;
  const cells = (l: string): string[] => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
  const head = cells(lines[0]!).map((h) => h.toLowerCase());
  const col = (rx: RegExp): number => head.findIndex((h) => rx.test(h));
  const iDate = col(/date|dat[aă]|day|zi/);
  const iHrv = col(/hrv|rmssd|sdnn|variabil/);
  const iSleep = col(/sleep|somn|asleep|durat/);
  if (iDate < 0 || (iHrv < 0 && iSleep < 0)) return [];
  const out = new Map<string, HrvPoint>();
  for (const l of lines.slice(1)) {
    const c = cells(l);
    const d = toDate(c[iDate] ?? '');
    if (!d) continue;
    const p = out.get(d) ?? { date: d };
    const hv = iHrv >= 0 ? num(c[iHrv]) : null;
    const sl = iSleep >= 0 ? sleepHours(c[iSleep] ?? '') : null;
    if (hv != null && hv >= 5 && hv <= 300) p.hrv = Math.round(hv);
    if (sl != null && sl > 0 && sl <= 16) p.sleep = Math.round(sl * 10) / 10;
    if (p.hrv != null || p.sleep != null) out.set(d, p);
  }
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
}

const num = (s: string | undefined): number | null => { const v = parseFloat(String(s ?? '').replace(',', '.').replace(/[^\d.]/g, '')); return Number.isFinite(v) ? v : null; };

function toDate(s: string): string | null {
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(s);
  if (m) return `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
  return null;
}

/** „7:32", „7h 32m", „452" (minute) sau „7.5" (ore). */
function sleepHours(s: string): number | null {
  const hm = /(\d+)\s*[:h]\s*(\d+)/.exec(s);
  if (hm) return +hm[1]! + +hm[2]! / 60;
  const v = num(s);
  if (v == null) return null;
  return v > 24 ? v / 60 : v;
}
