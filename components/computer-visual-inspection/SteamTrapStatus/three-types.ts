export interface TrapStatus {
  inletTemp: number; // °C
  outletTemp: number; // °C
  cycleFrequency: number; // cycles/min
  leakRate: number; // kg/h
  isLeaking: boolean;
  isBlocked: boolean;
  efficiency: number; // 0 to 100
}
