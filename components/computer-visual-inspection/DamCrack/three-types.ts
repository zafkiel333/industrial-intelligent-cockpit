export interface DamCrackStatus {
  crackCount: number;
  maxCrackWidth: number; // mm
  maxCrackLength: number; // m
  riskScore: number; // 0 to 100
  lastInspectionTime: string;
  detectedCracks: { x: number; y: number; z: number; width: number; length: number; severity: 'low' | 'medium' | 'high' }[];
}
