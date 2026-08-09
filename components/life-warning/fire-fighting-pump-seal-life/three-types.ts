export interface FirePumpSealState {
  leakageRate: number; // drops/min
  waterPressure: number; // MPa
  sealTemperature: number; // Celsius
  vibration: number; // mm/s
  testRuns: number; // count
  operatingHours: number; // hours
}
