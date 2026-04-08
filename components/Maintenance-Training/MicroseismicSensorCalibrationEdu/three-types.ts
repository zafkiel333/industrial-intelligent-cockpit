export interface SensorState {
  frequency: number; // 10 to 500 Hz
  amplitude: number; // 0 to 10 mm
  isCalibrating: boolean;
  progress: number; // 0 to 100
}
