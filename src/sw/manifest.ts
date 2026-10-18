/** Grupul decide când se descarcă un fișier:
 *  - `shell`: la instalarea service worker-ului (aplicația, pozele, iconițele);
 *  - `vox`: la prima nevoie, sau în fundal când aplicația cere `warm`. */
export type SwGroup = 'shell' | 'vox';

export interface SwResource {
  /** Primele 12 caractere din SHA-256 al conținutului. */
  hash: string;
  group: SwGroup;
}

/** Calea relativă la aplicație (fără „/" la început) → versiunea fișierului. */
export type SwManifest = Record<string, SwResource>;
