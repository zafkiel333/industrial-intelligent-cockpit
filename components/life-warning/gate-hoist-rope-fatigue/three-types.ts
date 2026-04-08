export interface RopeState {
  tension: number; // kN
  bendingCycles: number; // count
  corrosionLevel: number; // 0 to 1
  brokenWires: number; // count per lay length
  fatigueFactor: number; // 0 to 1
}
