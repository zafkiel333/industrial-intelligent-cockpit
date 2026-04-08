export interface VacuumState {
  waterLevel: number; // 0 to 100
  vacuum: number; // 0 to -100 kPa
  rpm: number; // 0 to 1500
  hasLeak: boolean;
}
