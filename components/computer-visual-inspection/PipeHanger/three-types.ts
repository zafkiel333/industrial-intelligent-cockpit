export interface PipeHangerStatus {
  displacementX: number; // mm
  displacementY: number; // mm
  displacementZ: number; // mm
  springLoad: number; // kN
  tiltAngle: number; // degrees
  isFailed: boolean;
  failureType: 'none' | 'overload' | 'corrosion' | 'disconnection' | 'spring_break';
  lastInspectionTime: string;
}
