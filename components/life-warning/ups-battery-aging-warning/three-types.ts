export interface UPSBatteryState {
  capacity: number; // % (State of Health)
  internalResistance: number; // mOhm
  temperature: number; // Celsius
  dischargeTime: number; // minutes (estimated runtime)
  operatingHours: number; // hours
}
