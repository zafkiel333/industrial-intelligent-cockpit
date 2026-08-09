export interface BatteryStatus {
  voltage: number;
  temperature: number;
  corrosionLevel: number; // 0-100
  leakageDetected: boolean;
  terminalResistance: number;
  healthScore: number;
}
