export interface BatteryState {
  voltage: number; // V
  temperature: number; // Celsius
  internalResistance: number; // mΩ
  transmissionFrequency: number; // times/day
  capacity: number; // %
}
