export interface RotorClearanceState {
  rotorAngle: number; // 0 to 360
  clearanceValue: number; // mm (target ~0.15mm)
  feelerGaugeInserted: boolean;
  feelerGaugeThickness: number; // mm
  isAdjusting: boolean;
  adjustmentScrewPosition: number; // -1 to 1 (relative to ideal)
}
