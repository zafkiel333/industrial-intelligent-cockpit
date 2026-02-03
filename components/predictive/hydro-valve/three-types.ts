
export interface ValveSceneProps {
  spoolPosition: number; // -100 to 100 (%)
  commandSignal: number; // -100 to 100 (%)
  stictionLevel: number; // 0-100% (affects friction color intensity)
  oilQuality: number; // 0-100% (affects particle clarity)
  isDithering: boolean; // Is dither signal active
}
