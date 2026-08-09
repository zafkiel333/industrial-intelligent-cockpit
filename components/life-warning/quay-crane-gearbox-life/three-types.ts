export interface GearboxState {
  inputRpm: number;
  loadTorque: number; // kNm
  oilTemperature: number; // Celsius
  vibrationLevel: number; // mm/s
  gearWear: number; // %
  operatingHours: number; // hours
}
