export interface GasLeakStatus {
  leakRate: number; // m³/h
  gasConcentration: number; // ppm
  pressure: number; // MPa
  temperature: number; // °C
  leakDetected: boolean;
  leakLocation: { x: number; y: number; z: number };
  lastInspectionTime: string;
}
