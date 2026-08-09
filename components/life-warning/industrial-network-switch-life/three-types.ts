export interface NetworkSwitchState {
  cpuTemperature: number; // Celsius
  packetLoss: number; // %
  portErrors: number; // count/sec
  powerSupplyVoltage: number; // V
  operatingHours: number; // hours
}
