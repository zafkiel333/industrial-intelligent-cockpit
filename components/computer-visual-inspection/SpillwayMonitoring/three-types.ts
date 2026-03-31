export interface ErosionZone {
  id: string;
  position: [number, number, number];
  depth: number; // mm
  area: number; // m2
  severity: 'low' | 'medium' | 'high';
}

export interface SpillwayState {
  flowRate: number; // m3/s
  waterLevel: number; // m
  vibrationLevel: number; // mm/s
}
