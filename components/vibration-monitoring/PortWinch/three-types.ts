export interface VibrationState { amplitude: number; frequency: number; status: 'normal' | 'warning' | 'critical'; }
export interface WindlassState {
  chainSpeed: number;
  tension: number;
  vibration: number;
  motorTemp: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}
