export interface RollerState {
  rotationalSpeed: number; // RPM
  bearingTemperature: number; // Celsius
  vibration: number; // mm/s
  dustAccumulation: number; // %
  operatingHours: number; // hours
}
