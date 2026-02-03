
export interface GuideVaneSceneProps {
  opening: number; // 0-100%
  servoPressure: number; // MPa (affects cylinder color intensity)
  frictionIndex: number[]; // Array of friction levels for individual vanes (0-1)
  isMoving: boolean; // Is the mechanism currently actuating
  showForces?: boolean; // Visualize force vectors
}
