export interface TransformerState {
  voltage: number; // kV
  current: number; // A
  oilTemp: number; // Celsius
  partialDischarge: number; // pC (Picocoulombs)
  operatingHours: number; // hours
}
