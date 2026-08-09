export interface ShovelRopeState {
  tension: number; // kN
  bendingCycles: number; // cycles
  abrasion: number; // %
  brokenWires: number; // count per lay length
  operatingHours: number; // hours
}
