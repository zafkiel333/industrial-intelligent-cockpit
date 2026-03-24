export interface SupportSceneConfig {
  inspectingBoltId?: string;
  showStressHeatmap: boolean;
  robotPosition: number; // 0 to 1 along the path
}

export type BoltStatus = {
  id: string;
  position: [number, number, number];
  tension: number; // kN
  anchorageDepth: number; // meters
  health: 'optimal' | 'warning' | 'critical';
};

export type SurfaceAnomaly = {
  id: string;
  coord: [number, number];
  type: 'crack' | 'spalling' | 'water';
  severity: number;
};
