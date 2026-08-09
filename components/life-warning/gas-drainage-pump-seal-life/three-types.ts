export interface PumpSealState {
  waterLevel: number; // %
  waterTemperature: number; // Celsius
  vacuumDegree: number; // kPa
  sealWear: number; // %
  operatingHours: number; // hours
}
