export interface SealState {
  pressure: number; // MPa (Water pressure)
  temperature: number; // Celsius
  compression: number; // mm
  hardness: number; // Shore A
  agingFactor: number; // 0 to 1
  leakageRate: number; // L/min
}
