
export interface WeldCrack {
  id: string;
  angle: number; // Position around the circumference (degrees)
  length: number; // mm
  depth: number; // mm
  severity: 'low' | 'medium' | 'high';
}

export interface WeldSceneProps {
  pipeDiameter: number;
  weldWidth: number;
  cracks: WeldCrack[];
  stressFactor: number; // 0-1
  isScanning: boolean;
  scanProgress: number; // 0-1
  viewMode: 'standard' | 'xray' | 'ultrasonic';
}
