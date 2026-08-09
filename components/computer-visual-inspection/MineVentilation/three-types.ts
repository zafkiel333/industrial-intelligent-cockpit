export interface VentilationStatus {
  airVolume: number; // m3/s
  staticPressure: number; // Pa
  fanSpeed: number; // RPM
  vibration: number; // mm/s
  motorTemp: number; // °C
  healthScore: number; // 0 to 100
  isOperating: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
}
