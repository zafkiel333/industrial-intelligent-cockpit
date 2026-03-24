export interface ExcavationSceneConfig {
  shearerPosition: number; // 0-1 along the face
  isCutting: boolean;
  strataPressure: number[]; // Array of pressure values for color mapping
  showHeatmap: boolean;
}

export type MachineAnomaly = {
  id: string;
  part: 'blade' | 'arm' | 'motor';
  severity: 'low' | 'high';
  coord: [number, number, number];
};
