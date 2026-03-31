export interface CraneRailStatus {
  railWear: number; // mm
  gaugeDeviation: number; // mm
  straightness: number; // mm/m
  wheelLoad: number; // t
  vibrationLevel: number; // mm/s
  isDeformed: boolean;
  deformationType: 'none' | 'wear' | 'gauge_error' | 'loose_bolt' | 'crack';
  lastInspectionTime: string;
}
