export interface FloorStatus {
  waterArea: number; // m2
  oilArea: number; // m2
  isSlippery: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  lastScanTime: string;
  detectedSpots: { x: number; y: number; type: 'water' | 'oil'; size: number }[];
}
