export interface HullInspectionConfig {
  viewMode: 'hologram' | 'stress' | 'corrosion';
  showSensors: boolean;
  activeZoneId?: string;
}

export interface StructuralPoint {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical';
  stress: number; // 单位: MPa
  thickness: number; // 单位: mm
  corrosionRate: number; // 百分比
  position: [number, number, number];
}

export type HullDefect = {
  id: string;
  type: 'crack' | 'deformation' | 'pitting';
  severity: 1 | 2 | 3; // 1: 轻微, 2: 关注, 3: 危险
  coord: [number, number, number];
};
