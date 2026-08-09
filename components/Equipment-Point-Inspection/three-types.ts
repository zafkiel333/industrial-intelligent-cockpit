export interface RailSceneConfig {
  speed: number;
  isScanning: boolean;
  alertPosition: [number, number, number] | null;
}

export type TrackAnomaly = {
  id: string;
  type: 'crack' | 'foreign_body' | 'displacement';
  position: number; // Z distance
  severity: 'low' | 'high';
};
