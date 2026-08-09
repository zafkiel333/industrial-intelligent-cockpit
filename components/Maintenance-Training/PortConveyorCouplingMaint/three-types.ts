export interface CouplingState {
  oilLevel: number; // 0 to 100%
  oilTemp: number; // Celsius
  inputSpeed: number; // RPM
  outputSpeed: number; // RPM
  isRunning: boolean;
  isLeaking: boolean;
  plugRemoved: boolean;
}
