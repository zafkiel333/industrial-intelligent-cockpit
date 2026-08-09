export interface InsulationState {
  temperature: number; // Celsius
  humidity: number; // Percentage
  voltageStress: number; // kV
  partialDischarge: number; // pC (picoCoulombs)
  insulationResistance: number; // MOhms
  agingFactor: number; // 0 to 1
}
