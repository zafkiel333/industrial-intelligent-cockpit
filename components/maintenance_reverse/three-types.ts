export interface DefectZone {
  id: string;
  position: [number, number, number];
  type: 'crack' | 'corrosion' | 'wear';
  severity: number; // 0-1
}

export interface ReverseThreeProps {
  partType: 'motor' | 'pump' | 'circuit';
  defects: DefectZone[];
  isScanning: boolean;
  scanProgress: number; // 0-100
}