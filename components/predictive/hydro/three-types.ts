
export type HydroPart = 'stator' | 'rotor' | 'turbine' | 'shaft' | 'bearing' | 'all';

export interface HydroSceneProps {
  activePart?: HydroPart;
  rotationSpeed?: number;
  vibrationLevel?: number;
  heatLevel?: number; // 0-1, affects color intensity
  onPartClick?: (part: HydroPart) => void;
}
