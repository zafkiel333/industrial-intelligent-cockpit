export interface CraneState {
  hoistSpeed: number; // m/min
  vibrationIntensity: number; // 0-1
  loadWeight: number; // tons
  boomAngle: number; // degrees
  slewingSpeed: number; // RPM
}
