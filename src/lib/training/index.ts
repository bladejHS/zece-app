/* Antrenamentul ZECE: sesiuni în 4 faze, rapoarte de contact, check-in, feedback pe rundă, deload și validatorul de siguranță.
   Codul vechi (src/legacy) îl folosește prin `TRAINING`. */
export * from './types.ts';
export { COMBAT_RATIOS, combatRatio, isCombatFormat, ratioOf, restFor, snapRest } from './ratios.ts';
export { deloadCount, deloadMinutes, deloadRounds, isDeloadWeek } from './deload.ts';
export { allChunks, buildCombatSession, checkStructure, isIntense, sessionMinutes, type BuildOptions } from './session.ts';
export { adjustNextRound, applyCheckIn, AREA_LOADS, protectArea, type NextRoundChange } from './adapt.ts';
export { intenseStreak, mondayOf, progressionAllowed, referenceMinutes, validateSession, weekMinutes, type DayLoad } from './validator.ts';
export { coverage, phaseKeys, preloadFiles, REQUIRED, sessionPhases, type VoxIndex } from './vox.ts';
