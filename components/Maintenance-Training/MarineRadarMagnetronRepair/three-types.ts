export interface MagnetronState {
  step: number; // 0: Normal, 1: Power off/Discharge, 2: Remove old, 3: Install new, 4: Warm-up
  isTransmitting: boolean;
}
