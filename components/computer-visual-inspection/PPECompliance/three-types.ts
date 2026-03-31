export interface PPEStatus {
  personnelCount: number;
  complianceRate: number; // 0 to 100
  violations: number;
  helmetDetected: boolean;
  vestDetected: boolean;
  glovesDetected: boolean;
  bootsDetected: boolean;
  isViolation: boolean;
  violationTypes: string[];
}
