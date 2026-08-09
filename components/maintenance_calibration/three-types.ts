export interface CalibrationPoint {
  id: string;
  vector: [number, number, number]; // x, y, z direction
  deviation: number; // in microns
}

export interface CalibrationThreeProps {
  isScanning: boolean;
  accuracyLevel: number; // 0-100 (100 is perfect)
  scanColor: string;
}