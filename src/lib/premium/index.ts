/* Funcțiile elite FALCO: HRV cu deload forțat, gamificare inversă (mastery), analize, squad-uri, ritualuri și vocea dinamică.
   Codul vechi (src/legacy) le folosește prin `ELITE`. Toate dispar în modul activ de antrenament. */
export { HRV_DELOAD_RATIO, hrvStatus, parseHealthCsv, type HrvPoint, type HrvStatus } from './hrv.ts';
export { LEVEL_NAMES, mastery, type Badge, type Mastery, type MasteryInput, type Penalty } from './mastery.ts';
export { nutritionSync, recoveryDebt, skillMap, technicalEfficiency, type RecoveryDay, type Skill, type SyncDay, type TesSession } from './analytics.ts';
export * as squad from './squad.ts';
export { RITUAL, RITUAL_SEC, ritualState, stepsFrom, type RitualStep } from './ritual.ts';
export { nonVerbalCues, voiceStyle, type Cue, type VoiceCtx, type VoiceStyle } from './voice.ts';
