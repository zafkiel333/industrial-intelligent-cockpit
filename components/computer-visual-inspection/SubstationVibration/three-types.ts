export interface SubstationStatus {
  vibrationAmplitude: number; // μm
  vibrationFrequency: number; // Hz
  transformerTemp: number; // °C
  oilLevel: number; // %
  healthScore: number; // 0 to 100
  isOperating: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
}
