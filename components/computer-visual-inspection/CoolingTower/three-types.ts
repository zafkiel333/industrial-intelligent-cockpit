export interface CoolingTowerStatus {
  scalingLevel: number; // 0 to 100
  waterFlowRate: number; // m³/h
  fanSpeed: number; // rpm
  inletTemp: number; // °C
  outletTemp: number; // °C
  efficiency: number; // %
  lastInspectionTime: string;
}
