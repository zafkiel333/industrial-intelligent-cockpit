export interface OilTankStatus {
  corrosionArea: number; // m²
  corrosionDepth: number; // mm
  leakDetected: boolean;
  leakRate: number; // L/h
  oilLevel: number; // %
  pressure: number; // kPa
  temperature: number; // °C
  lastInspectionTime: string;
}
