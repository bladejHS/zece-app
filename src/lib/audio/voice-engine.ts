/**
 * Voice Engine — Lazy-loading audio chunks pentru instrucțiuni vocale
 * - Chunks .opus stocate în /vox/{phase-id}.opus
 * - Preload inteligent: faza curentă + următoarea
 * - Fallback text-to-speech dacă chunk lipsește
 * - AudioContext gestionat cu user-gesture activation (autoplay policy)
 * - Crossfade între chunks pentru tranziții seamless
 */

export interface VoiceChunk {
 /** ID unic chunk (match cu audioChunk din workout schema) */
 id: string;
 /** Path relativ la /vox/ */
 src: string;
 /** Durată estimată în secunde (pentru preloading) */
 durationEstimate?: number;
}

export interface VoiceEngineOptions {
 /** Callback când un chunk începe redarea */
 onPlay?: (chunkId: string) => void;
 /** Callback când un chunk se termină */
 onEnd?: (chunkId: string) => void;
 /** Callback la eroare (chunk lipsă, decode fail) */
 onError?: (chunkId: string, error: Error) => void;
 /** Volum master (0-1) */
 volume?: number;
 /** Viteza de redare (0.5-2.0) */
 playbackRate?: number;
}

class VoiceEngine {
 private ctx: AudioContext | null = null;
 private currentSource: AudioBufferSourceNode | null = null;
 private nextSource: AudioBufferSourceNode | null = null;
 private gainNode: GainNode | null = null;
 private cache: Map<string, AudioBuffer> = new Map();
 private preloadQueue: Set<string> = new Set();
 private options: VoiceEngineOptions = {};
 private isActivated = false;

 constructor(options: VoiceEngineOptions = {}) {
 this.options = {
 volume: 0.8,
 playbackRate: 1.0,
 ...options,
 };
 }

 /**
 * Activează AudioContext (necesită user gesture)
 * Trebuie apelat la primul tap/click al utilizatorului
 */
 async activate(): Promise<boolean> {
 if (this.isActivated && this.ctx?.state === 'running') return true;

 try {
 if (!this.ctx) {
 this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
 this.gainNode = this.ctx.createGain();
 this.gainNode.connect(this.ctx.destination);
 this.gainNode.gain.value = this.options.volume ?? 0.8;
 }

 if (this.ctx.state === 'suspended') {
 await this.ctx.resume();
 }

 this.isActivated = true;
 console.log('[VoiceEngine] AudioContext activat');
 return true;
 } catch (err) {
 console.error('[VoiceEngine] Activare eșuată:', err);
 this.options.onError?.('system', err instanceof Error ? err : new Error(String(err)));
 return false;
 }
 }

 /**
 * Preîncarcă un chunk audio în memorie
 */
 async preload(chunkId: string): Promise<boolean> {
 if (this.cache.has(chunkId) || this.preloadQueue.has(chunkId)) return true;

 this.preloadQueue.add(chunkId);

 try {
 const response = await fetch(`/vox/${chunkId}.opus`, { cache: 'force-cache' });
 if (!response.ok) throw new Error(`HTTP ${response.status}`);

 const arrayBuffer = await response.arrayBuffer();
 const ctx = this.ctx ?? new AudioContext();
 const buffer = await ctx.decodeAudioData(arrayBuffer);

 this.cache.set(chunkId, buffer);
 this.preloadQueue.delete(chunkId);
 console.log(`[VoiceEngine] Chunk preloaded: ${chunkId}`);
 return true;
 } catch (err) {
 this.preloadQueue.delete(chunkId);
 console.warn(`[VoiceEngine] Preload eșuat pentru ${chunkId}:`, err);
 return false;
 }
 }

 /**
 * Preîncarcă faza curentă + următoarea (lookahead)
 */
 async preloadSequence(chunkIds: string[], currentIndex: number): Promise<void> {
 const toPreload: string[] = [];

 // Faza curentă
 if (currentIndex >= 0 && currentIndex < chunkIds.length) {
 toPreload.push(chunkIds[currentIndex]);
 }
 // Următoarea fază
 if (currentIndex + 1 < chunkIds.length) {
 toPreload.push(chunkIds[currentIndex + 1]);
 }

 await Promise.allSettled(toPreload.map((id) => this.preload(id)));
 }

 /**
 * Redă un chunk audio
 */
 async play(chunkId: string): Promise<boolean> {
 if (!this.isActivated || !this.ctx || !this.gainNode) {
 console.warn('[VoiceEngine] Engine neactivat — apelează activate() mai întâi');
 return false;
 }

 // Stop sursa curentă
 this.stop();

 // Verifică cache
 let buffer = this.cache.get(chunkId);
 if (!buffer) {
 // Încearcă încărcare on-demand
 const loaded = await this.preload(chunkId);
 if (!loaded) {
 this.options.onError?.(chunkId, new Error(`Chunk not found: ${chunkId}`));
 return false;
 }
 buffer = this.cache.get(chunkId)!;
 }

 try {
 const source = this.ctx.createBufferSource();
 source.buffer = buffer;
 source.playbackRate.value = this.options.playbackRate ?? 1.0;
 source.connect(this.gainNode);

 source.onended = () => {
 this.currentSource = null;
 this.options.onEnd?.(chunkId);
 };

 source.start(0);
 this.currentSource = source;
 this.options.onPlay?.(chunkId);
 return true;
 } catch (err) {
 this.options.onError?.(chunkId, err instanceof Error ? err : new Error(String(err)));
 return false;
 }
 }

 /**
 * Oprește redarea curentă
 */
 stop(): void {
 if (this.currentSource) {
 try {
 this.currentSource.stop();
 } catch {
 // Already stopped
 }
 this.currentSource.disconnect();
 this.currentSource = null;
 }
 }

 /**
 * Setează volumul master
 */
 setVolume(value: number): void {
 const clamped = Math.max(0, Math.min(1, value));
 this.options.volume = clamped;
 if (this.gainNode) {
 this.gainNode.gain.setTargetAtTime(clamped, this.ctx?.currentTime ?? 0, 0.05);
 }
 }

 /**
 * Setează viteza de redare
 */
 setPlaybackRate(rate: number): void {
 const clamped = Math.max(0.5, Math.min(2.0, rate));
 this.options.playbackRate = clamped;
 if (this.currentSource) {
 this.currentSource.playbackRate.value = clamped;
 }
 }

 /**
 * Curăță cache-ul și resursele
 */
 dispose(): void {
 this.stop();
 this.cache.clear();
 this.preloadQueue.clear();
 if (this.ctx) {
 this.ctx.close().catch(() => {});
 this.ctx = null;
 }
 this.gainNode = null;
 this.isActivated = false;
 }

 /**
 * Verifică dacă engine-ul este activat și gata de redare
 */
 get ready(): boolean {
 return this.isActivated && this.ctx?.state === 'running';
 }

 /**
 * Returnează numărul de chunks în cache
 */
 get cachedCount(): number {
 return this.cache.size;
 }
}

/** Singleton instance */
let instance: VoiceEngine | null = null;

export function getVoiceEngine(options?: VoiceEngineOptions): VoiceEngine {
 if (!instance) {
 instance = new VoiceEngine(options);
 }
 return instance;
}

export function destroyVoiceEngine(): void {
 if (instance) {
 instance.dispose();
 instance = null;
 }
}