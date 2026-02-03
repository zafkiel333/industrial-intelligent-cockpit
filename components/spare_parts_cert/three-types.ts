export interface CertPartNode {
  id: string;
  type: 'oem' | 'substitute' | 'unauthorized';
  integrity: number; // 0-100
  materialMatch: number; // 0-100
  position: [number, number, number];
}

export interface CertThreeProps {
  activePart: CertPartNode | null;
  isScanning: boolean;
  scanProgress: number;
}