export interface PressureSwitchState {
  pressure: number; // MPa
  isPumpRunning: boolean;
  switchCutIn: number; // MPa (Start pressure)
  switchCutOut: number; // MPa (Stop pressure)
  isTesting: boolean;
  testValveOpen: boolean;
  switchState: 'ON' | 'OFF';
}
