export interface HVACCompressorState {
  suctionPressure: number; // MPa
  dischargePressure: number; // MPa
  motorTemperature: number; // Celsius
  oilLevel: number; // %
  vibration: number; // mm/s
  operatingHours: number; // hours
}
