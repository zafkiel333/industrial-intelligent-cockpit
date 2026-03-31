export interface VibrationState {
  amplitude: number;
  frequency: number;
  status: 'normal' | 'warning' | 'critical';
}
