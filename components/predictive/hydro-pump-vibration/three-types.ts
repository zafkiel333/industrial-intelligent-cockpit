
export interface PumpVibrationProps {
  rpm: number;
  pressure: number; // MPa, affects color intensity
  vibration: number; // mm/s, affects shake amplitude
  temperature: number; // Celsius
  cavitation: boolean; // Triggers bubble particles
  flowRate: number; // Affects particle speed
}
