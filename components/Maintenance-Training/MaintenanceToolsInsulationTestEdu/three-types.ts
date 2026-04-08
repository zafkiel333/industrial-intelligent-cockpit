export interface InsulationState {
  toolType: 'Gloves' | 'Boots' | 'Mat';
  testVoltage: number; // kV
  leakageCurrent: number; // mA
  testDuration: number; // seconds
  isTesting: boolean;
  testResult: 'Pending' | 'Pass' | 'Fail';
  defectLevel: number; // 0-100% (0 is perfect, 100 is punctured)
  waterLevel: number; // 0-100% (for gloves/boots test tank)
}
