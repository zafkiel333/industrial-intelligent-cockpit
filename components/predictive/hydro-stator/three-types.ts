
export interface StatorSceneProps {
  activeSlot?: number | null; // Highlight specific slot (1-72)
  pdLocation?: number[]; // [x, y, z] normalized position of partial discharge
  tempMap?: number[]; // Array of temperatures for slots
  vibrationAmp?: number; // Amplitude of end-winding vibration
  wireframe?: boolean;
}
