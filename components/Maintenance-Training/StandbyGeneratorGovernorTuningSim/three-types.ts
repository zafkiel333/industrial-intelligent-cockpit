export interface GovernorState {
  engineSpeed: number; // RPM
  targetSpeed: number; // RPM
  loadPercentage: number; // 0-100%
  gainSetting: number; // 0-100% (Proportional gain)
  stabilitySetting: number; // 0-100% (Integral/Derivative)
  actuatorPosition: number; // 0-100% (Fuel rack)
  isEngineRunning: boolean;
  huntingAmplitude: number; // RPM fluctuation
}
