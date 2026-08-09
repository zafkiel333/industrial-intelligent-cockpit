
export interface CorrosionSceneProps {
  ageYears: number; // 0 to 50+
  stressLoad: number; // 0 to 100% current load
  showStress: boolean;
  showCracks: boolean;
  corrosionRate: number; // 0-1 factor for visual intensity
}
