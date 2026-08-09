export interface CraneRailWearStatus {
  wearDepth: number; // mm
  surfaceRoughness: number; // Ra
  flatnessDeviation: number; // mm
  jointGap: number; // mm
  vibrationAmplitude: number; // mm
  isAnomalyDetected: boolean;
  anomalyType: 'none' | 'pitting' | 'spalling' | 'crack' | 'deformation';
  lastInspectionTime: string;
}
