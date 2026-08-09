export interface CargoHoldStatus {
  temperature: number;
  humidity: number;
  o2Level: number;
  structuralIntegrity: number; // 0-100
  isScanning: boolean;
  cargoProgress: number; // 0-1
}

export type StructuralDefect = {
  id: string;
  type: 'crack' | 'corrosion' | 'deformation';
  severity: 'low' | 'medium' | 'high';
  position: [number, number, number];
};
