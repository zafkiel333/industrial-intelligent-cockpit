
export interface RollerSceneProps {
  wearLevel: number; // 0.0 to 1.0 (New to Failed)
  rotationSpeed: number; // Rad/s
  contactStress: number; // 0.0 to 1.0 (Visual intensity of contact patch)
  debrisAmount: number; // 0.0 to 1.0 (Particle density)
  lubricationMode: 'oil' | 'grease' | 'dry' | 'water';
  showHeatmap: boolean;
}
