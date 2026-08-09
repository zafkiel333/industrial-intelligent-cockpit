export interface BladeData {
  id: number;
  wearLevel: number; // 0 to 1
  isCritical: boolean;
}

export interface BeltCleanerState {
  beltSpeed: number;
  vibration: number;
  pressure: number;
  blades: BladeData[];
}
