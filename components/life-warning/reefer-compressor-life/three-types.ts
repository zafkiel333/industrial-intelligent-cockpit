export interface ReeferCompressorState {
  suctionPressure: number; // bar
  dischargePressure: number; // bar
  motorTemp: number; // Celsius
  vibration: number; // mm/s
  operatingHours: number; // hours
}
