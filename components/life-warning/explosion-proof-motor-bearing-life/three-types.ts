export interface MotorBearingState {
  temperature: number; // Celsius
  vibrationVelocity: number; // mm/s
  acousticEmission: number; // dB (High frequency noise)
  greaseLife: number; // %
  operatingHours: number; // hours
}
