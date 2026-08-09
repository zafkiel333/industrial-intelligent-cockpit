export interface CrackData {
  id: string;
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high';
  length: number; // in mm
}

export interface BucketState {
  totalCracks: number;
  maxStress: number;
  remainingLife: number; // in hours
  cracks: CrackData[];
}
