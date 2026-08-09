export interface PumpRunnerData {
  timestamp: string;
  operatingMode: 'turbine' | 'pump' | 'idle';
  rpm: number; 
  guideVaneAngle: number; // 0-45 degrees
  flowRate: number; // m3/s
  waterHead: number; // m
  cavitationIndex: number; 
  draftTubePressurePulse: number; // MPa
}
