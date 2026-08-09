
export interface BushingSceneProps {
  phase: 'A' | 'B' | 'C';
  voltageLevel: number; // kV, affects glow intensity
  pdIntensity: number; // pC, affects spark frequency
  tanDelta: number; // Dielectric loss, affects material opacity/color
  oilLevel: number; // %
  viewMode: 'external' | 'internal' | 'field'; // View mode
}
