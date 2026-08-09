export interface PumpState {
  pressure: number; // MPa
  oilTemperature: number; // Celsius
  flowRate: number; // L/min
  internalLeakage: number; // %
  operatingHours: number; // hours
}
