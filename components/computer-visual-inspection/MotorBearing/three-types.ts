export interface MotorBearingState {
  temperature: number; // Celsius
  vibration: number; // mm/s
  oilLeakLevel: 'none' | 'trace' | 'minor' | 'major';
  leakArea: number; // cm2
}

export interface MotorState {
  bearingDE: MotorBearingState; // Drive End
  bearingNDE: MotorBearingState; // Non-Drive End
  rpm: number;
  load: number; // Percentage
}
