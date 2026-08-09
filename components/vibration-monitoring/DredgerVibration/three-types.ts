export interface DredgerState {
  cutterSpeed: number; // RPM
  vibrationIntensity: number; // 0-1
  pumpPressure: number; // MPa
  swingSpeed: number; // m/min
  dredgingDepth: number; // m
}
