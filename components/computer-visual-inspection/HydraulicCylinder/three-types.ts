export interface CylinderScratch {
  id: string;
  position: number; // 0-1 along the rod
  depth: number; // mm
  length: number; // mm
}

export interface CylinderState {
  pressure: number; // MPa
  stroke: number; // mm
  leakage: 'none' | 'slight' | 'severe';
}
