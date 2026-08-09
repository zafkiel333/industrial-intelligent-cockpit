export interface NozzleState {
  waterPressure: number; // MPa
  flowRate: number; // L/min
  waterTurbidity: number; // NTU
  cloggingRate: number; // %
  operatingHours: number; // hours
}
