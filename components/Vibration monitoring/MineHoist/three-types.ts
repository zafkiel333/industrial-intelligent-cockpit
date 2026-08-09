export interface HoistBearingData {
  bearingVibration: number;
  bearingTemp: number;
  lubricationPressure: number;
  shaftSpeed: number;
  torque: number;
  ropeTension: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
}
