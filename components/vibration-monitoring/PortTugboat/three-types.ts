export interface TugboatState {
  engineSpeed: number; // RPM
  vibrationIntensity: number; // 0-1
  hullStability: number; // 0-1
  fuelFlow: number; // L/h
  propellerThrust: number; // kN
}
