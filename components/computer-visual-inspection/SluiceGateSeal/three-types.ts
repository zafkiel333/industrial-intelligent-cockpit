export interface SealDefect {
  id: string;
  position: [number, number, number];
  type: 'wear' | 'crack' | 'deformation';
  severity: number; // 0 to 1
}

export interface GateState {
  opening: number; // 0 to 100%
  leakageRate: number; // L/s
  waterPressure: number; // kPa
}
