export interface ConveyorState {
  beltSpeed: number; // m/s
  vibrationIntensity: number; // 0-1
  idlerStatus: 'normal' | 'warning' | 'critical';
  loadWeight: number; // kg/m
  tensionForce: number; // kN
}
