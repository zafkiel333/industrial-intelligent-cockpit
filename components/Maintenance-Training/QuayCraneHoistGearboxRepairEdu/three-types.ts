export interface GearboxState {
  step: number; // 0: Normal, 1: Open cover, 2: Remove high-speed shaft, 3: Inspect bearings
  isRunning: boolean;
}
