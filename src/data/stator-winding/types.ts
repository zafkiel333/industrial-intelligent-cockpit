export interface StatorWindingData {
  timestamp: string;
  activePower: number; // MW
  statorVoltage: number; // kV
  coreTempAvg: number; // °C
  slotTemps: number[]; // Array of 6 key slot temperatures in °C
  pdAmplitude: number[]; // Partial discharge amplitudes for PRPD plot (mV)
  pdPhase: number[]; // Partial discharge phase angles (0-360)
  coolantInletTemp: number; // °C
  coolantOutletTemp: number; // °C
  coolantFlowRate: number; // L/min 
  insulationResistance: number; // MΩ
  overallStatus: 'normal' | 'warning' | 'danger';
}
