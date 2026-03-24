export interface FuelTankData {
  id: string;
  name: string;
  level: number; // 0-1
  temperature: number;
  viscosity: number;
  density: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface InspectionPoint {
  id: string;
  type: 'leak' | 'thermal' | 'structural';
  position: [number, number, number];
  intensity: number; // 告警强度
}

export interface TankSceneConfig {
  showInternal: boolean;
  scanActive: boolean;
  viewMode: 'volumetric' | 'thermal' | 'schematic';
}
