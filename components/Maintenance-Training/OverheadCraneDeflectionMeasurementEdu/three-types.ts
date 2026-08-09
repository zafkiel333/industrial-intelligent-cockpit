export interface OverheadCraneState {
  mainGirderDeflection: number; // mm
  loadWeight: number; // tons
  trolleyPosition: number; // % (0 to 100, 50 is center)
  bridgePosition: number; // m
  isLifting: boolean;
  isMoving: boolean;
  ambientTemperature: number; // Celsius
  laserSensorStatus: 'Normal' | 'Warning' | 'Error';
  laserReading: number; // mm (raw reading)
  calibrationOffset: number; // mm
}
