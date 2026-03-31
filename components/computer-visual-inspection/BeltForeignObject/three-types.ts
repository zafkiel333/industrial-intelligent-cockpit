export interface DetectedObject {
  id: string;
  type: 'foreign' | 'oversize';
  label: string;
  confidence: number;
  position: [number, number, number];
}

export interface BeltState {
  beltSpeed: number;
  loadRate: number;
  detectedObjects: DetectedObject[];
}
