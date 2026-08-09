export interface ChillerState {
  systemPressure: number; // kPa
  recoveryCylinderPressure: number; // kPa
  compressorRunning: boolean;
  valves: {
    liquidLine: boolean;
    vaporLine: boolean;
    recoveryInlet: boolean;
    recoveryOutlet: boolean;
  };
  refrigerantAmount: number; // kg (in chiller)
  recoveredAmount: number; // kg (in cylinder)
  mode: 'idle' | 'liquid_recovery' | 'vapor_recovery' | 'charging';
  fault: boolean;
}
