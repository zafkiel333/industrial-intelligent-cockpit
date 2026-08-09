export interface HammerState {
  materialHardness: number; // Mohs scale or similar (e.g., 1-10)
  throughput: number; // tons/hour
  vibration: number; // mm/s
  wearDepth: number; // mm
  operatingHours: number; // hours
}
