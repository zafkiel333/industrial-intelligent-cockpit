export interface LadderStatus {
  deformationX: number; // mm
  deformationY: number; // mm
  corrosionLevel: number; // 0 to 100
  weldIntegrity: number; // 0 to 100
  loadWeight: number; // kg
  isSafe: boolean;
  lastInspectionTime: string;
}
