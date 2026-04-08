export interface ForkliftHydraulicState {
  systemPressure: number; // MPa
  pumpSpeed: number; // RPM
  oilTemperature: number; // Celsius
  valveSpoolPosition: number; // % (-100 to 100)
  cylinderPosition: number; // mm
  internalLeakageRate: number; // L/min
  isTesting: boolean;
  testPhase: 'Idle' | 'Pressurizing' | 'Holding' | 'Result';
  pressureDrop: number; // MPa over test period
}
