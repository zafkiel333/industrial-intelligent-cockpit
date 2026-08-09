export interface ValveSealState {
  pressure: number; // MPa
  operationCycles: number; // count
  leakageRate: number; // L/min
  agingFactor: number; // 0 to 1
  temperature: number; // Celsius
}
