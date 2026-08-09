export interface BrakeState {
  clearance: number; // 0.5 to 2.5 mm
  isBraking: boolean;
  measuring: boolean;
}
