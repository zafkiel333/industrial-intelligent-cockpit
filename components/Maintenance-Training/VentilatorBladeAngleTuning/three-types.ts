export interface VentilatorState {
  bladeAngle: number; // -15 to 15 degrees
  airflow: number; // 0 to 100
  isRunning: boolean;
}
