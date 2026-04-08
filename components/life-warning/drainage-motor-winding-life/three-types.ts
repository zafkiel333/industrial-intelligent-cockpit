export interface WindingState {
  temperature: number; // Celsius
  insulationResistance: number; // MΩ
  partialDischarge: number; // pC (picocoulombs)
  operatingHours: number; // hours
  load: number; // %
}
