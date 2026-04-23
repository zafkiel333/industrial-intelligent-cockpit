export interface ExcitationBrushData {
  timestamp: string;
  rotorSpeed: number; // RPM
  excitationVoltage: number; // DC Volts
  excitationCurrent: number; // DC Amps
  slipRingTemp: number; // °C
  brushWearLevels: number[]; // Array of 4 brushes, remaining length in mm
  brushPressures: number[]; // Array of 4 brushes, mechanical pressure in N
  sparkIntensity: number; // 0 to 1 scale indicating arcing severity
  currentHarmonics: number[]; // Array representing FFT of field current
  overallStatus: 'normal' | 'warning' | 'danger';
}
