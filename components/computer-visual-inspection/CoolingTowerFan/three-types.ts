export interface FanStatus {
  rotationSpeed: number; // RPM
  vibrationX: number; // mm/s
  vibrationY: number; // mm/s
  vibrationZ: number; // mm/s
  icingThickness: number; // mm
  isIcing: boolean;
  isVibrating: boolean;
  healthScore: number; // 0 to 100
}
