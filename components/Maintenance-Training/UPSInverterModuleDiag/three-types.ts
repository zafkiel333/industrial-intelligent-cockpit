export interface UPSInverterState {
  inputVoltage: number; // V
  outputVoltage: number; // V
  batteryVoltage: number; // V
  loadPercentage: number; // %
  isBypassMode: boolean;
  inverterStatus: 'Normal' | 'Fault' | 'Off';
  faultCode: string | null;
  igbtTemperature: number; // Celsius
  capacitorHealth: number; // %
  isTesting: boolean;
}
