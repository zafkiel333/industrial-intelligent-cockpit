export interface TearAnomalies {
  id: string;
  position: number; // Position along the belt (0-100)
  length: number; // mm
  severity: 'low' | 'medium' | 'high';
}

export interface BeltState {
  speed: number; // m/s
  tension: number; // kN
  isScanning: boolean;
}
