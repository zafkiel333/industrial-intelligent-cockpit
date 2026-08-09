export interface PumpVibrationStatus {
  vibrationAmplitude: number; // mm/s
  vibrationFrequency: number; // Hz
  motorTemp: number; // °C
  bearingTemp: number; // °C
  flowRate: number; // m³/h
  pressure: number; // MPa
  isAbnormal: boolean;
  anomalyType: 'none' | 'unbalance' | 'misalignment' | 'looseness' | 'bearing_fault';
  lastInspectionTime: string;
}
