export interface FWGState {
  vacuumLevel: number; // 0 to 100 (percentage of required vacuum)
  ejectorPumpRunning: boolean;
  coolingWaterTemp: number; // 20 to 50
  heatingWaterTemp: number; // 60 to 90
  leakActive: boolean;
}
