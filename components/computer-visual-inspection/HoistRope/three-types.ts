export interface BrokenWire {
  id: string;
  position: [number, number, number];
  severity: 'minor' | 'major';
}

export interface HoistRopeState {
  ropeSpeed: number;
  totalBrokenWires: number;
  diameterReduction: number; // in %
  wearLevel: number; // 0 to 1
  brokenWires: BrokenWire[];
}
