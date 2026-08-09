export interface FailurePoint {
  id: string;
  position: [number, number, number];
  type: 'crack' | 'corrosion' | 'fatigue' | 'impact';
  severity: number; // 0-1
  description: string;
}

export interface FailureAnalysisThreeProps {
  activePointId: string | null;
  points: FailurePoint[];
  isScanning: boolean;
  partType: 'shaft' | 'gear' | 'bearing';
  onPointClick: (id: string) => void;
}