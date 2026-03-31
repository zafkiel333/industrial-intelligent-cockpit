export interface PumpStatus {
  leakRate: number;
  pressure: number;
  temperature: number;
  vibrationLevel: number;
  isLeaking: boolean;
  rotationSpeed: number;
}
