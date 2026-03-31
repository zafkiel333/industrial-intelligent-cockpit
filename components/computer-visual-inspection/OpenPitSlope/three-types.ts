export interface SlopePoint {
  id: string;
  position: [number, number, number];
  displacement: number; // in mm
  velocity: number; // in mm/day
}

export interface SlopeState {
  maxDisplacement: number;
  avgVelocity: number;
  safetyFactor: number;
  points: SlopePoint[];
}
