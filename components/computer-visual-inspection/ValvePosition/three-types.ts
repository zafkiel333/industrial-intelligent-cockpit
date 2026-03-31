export interface ValveStatus {
  openingPercentage: number; // 0 to 100
  flowRate: number; // m³/h
  pressureIn: number; // MPa
  pressureOut: number; // MPa
  isOperating: boolean;
  lastAction: 'open' | 'close' | 'adjust';
  lastInspectionTime: string;
}
