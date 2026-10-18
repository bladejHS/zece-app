/* Deload automat: la fiecare a 4-a săptămână volumul scade cu 40%, frecvența rămâne aceeași. */
import { PROGRESSION } from './types.ts';

export const isDeloadWeek = (week: number): boolean => week > 0 && week % PROGRESSION.deloadEvery === 0;
const keep = 1 - PROGRESSION.deloadVolumeCut;

/** Serii, runde sau reprize: cel puțin 1. */
export const deloadCount = (n: number): number => Math.max(1, Math.round(n * keep));
export const deloadRounds = deloadCount;
/** Minute (alergare, condiționare). */
export const deloadMinutes = (min: number): number => Math.max(1, Math.round(min * keep));
