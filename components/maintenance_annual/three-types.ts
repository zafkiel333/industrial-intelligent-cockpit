export interface InspectionPoint {
  id: string;
  position: [number, number, number];
  status: 'pending' | 'ok' | 'issue';
  label: string;
}

export interface AnnualThreeProps {
  isScanning: boolean;
  scanProgress: number; // 0-100
  scanColor: string;
  inspectionPoints: InspectionPoint[];
}
