export interface MotorHeatingState {
  bearingTemperature: number; // Celsius
  heaterTemperature: number; // Celsius
  ambientTemperature: number; // Celsius
  heatingTime: number; // seconds
  isHeating: boolean;
  targetTemperature: number; // Celsius
  magneticProbeAttached: boolean;
  bearingInnerDiameter: number; // mm
  shaftOuterDiameter: number; // mm
  expansionAmount: number; // mm
  heaterPower: number; // kW
}
