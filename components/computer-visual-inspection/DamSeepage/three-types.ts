export interface SeepageStatus {
  phreaticLineDepth: number; // m
  seepageArea: number; // m2
  seepageRate: number; // L/s
  riskScore: number; // 0 to 100
  lastInspectionTime: string;
  seepageSpots: { x: number; y: number; z: number; size: number; flowRate: number }[];
}
