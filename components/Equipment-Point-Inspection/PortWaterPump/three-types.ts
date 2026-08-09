export interface PortWaterPumpProps {
  pumpStatus: number; // 0: Normal, 1: Warning, 2: Error
  waterPressure: number; // MPa
  flowRate: number; // m³/h
  vibration: number; // mm/s
  isAlert: boolean;
}
