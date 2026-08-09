export interface SlopeAnomalies {
  id: string;
  position: [number, number, number];
  displacement: number; // mm
  velocity: number; // mm/d
  severity: 'low' | 'medium' | 'high';
}

export interface SlopeState {
  safetyFactor: number;
  rainfall: number; // mm
  groundwaterLevel: number; // m
}
