export interface PumpBearingState {
  vibrationVelocity: number; // mm/s (low freq)
  vibrationAcceleration: number; // G (high freq/acoustic emission)
  temperature: number; // Celsius
  load: number; // %
  operatingHours: number; // hours
}
