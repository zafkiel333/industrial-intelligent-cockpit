export interface OilPumpState {
  pumpSpeed: number; // RPM
  vibrationIntensity: number; // 0-1
  flowRate: number; // m³/h
  dischargePressure: number; // MPa
  bearingTemp: number; // °C
}
