export interface BushingState {
  oilTemperature: number; // Celsius
  oilPressure: number; // MPa
  capacitance: number; // pF
  tanDelta: number; // % (Dielectric loss)
  moistureContent: number; // ppm
  agingFactor: number; // 0 to 1
}
