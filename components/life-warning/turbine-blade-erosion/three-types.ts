export interface ErosionState {
  erosionLevel: number; // 0 to 1 (0 = new, 1 = fully eroded)
  waterFlowSpeed: number; // m/s
  sedimentConcentration: number; // kg/m3
  cavitationIntensity: number; // 0 to 100
}
