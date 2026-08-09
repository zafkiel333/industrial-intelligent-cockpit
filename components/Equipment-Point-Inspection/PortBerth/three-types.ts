export interface BerthSceneConfig {
  shipDistance: number; // meters from fender
  shipVelocity: number; // m/s
  shipAngle: number; // degrees
  isInspecting: boolean;
  alertMarkerId?: string;
}

export type StructuralNode = {
  id: string;
  type: 'bollard' | 'fender' | 'wall';
  condition: 'good' | 'fair' | 'poor';
  stressValue: number;
  position: [number, number, number];
};
