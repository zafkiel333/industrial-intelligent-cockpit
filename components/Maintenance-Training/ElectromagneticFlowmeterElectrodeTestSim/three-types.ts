export interface FlowmeterState {
  flowRate: number; // m3/h
  fluidConductivity: number; // uS/cm
  electrodeVoltageA: number; // mV
  electrodeVoltageB: number; // mV
  polarizationVoltage: number; // mV
  isTesting: boolean;
  testPhase: 'Idle' | 'EmptyPipe' | 'FullPipeZeroFlow' | 'Flowing';
  electrodeCoating: number; // 0-100% (simulated scaling/coating)
  magneticFieldStrength: number; // T
}
