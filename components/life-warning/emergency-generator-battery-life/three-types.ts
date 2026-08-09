export interface EmergencyBatteryState {
  voltage: number; // V
  internalResistance: number; // mOhm
  temperature: number; // Celsius
  chargeCycles: number; // count
  operatingHours: number; // hours
}
