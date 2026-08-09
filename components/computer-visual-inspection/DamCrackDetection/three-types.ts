export interface DamCrackData {
  id: string;
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high';
  length: number;
  width: number;
}

export interface SceneState {
  isScanning: boolean;
  rotationSpeed: number;
}
