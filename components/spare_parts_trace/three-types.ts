export interface QualityMarker {
  id: string;
  position: [number, number, number];
  type: 'ndt' | 'material' | 'dimension';
  label: string;
  status: 'passed' | 'warning';
}

export interface TraceThreeProps {
  markers: QualityMarker[];
  isScanning: boolean;
  scanProgress: number; // 0-100
}