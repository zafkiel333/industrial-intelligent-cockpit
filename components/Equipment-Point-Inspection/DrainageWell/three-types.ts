export interface PumpStatus {
  id: string;
  rpm: number;
  temp: number;
  vibration: number;
  flow: number;
  status: 'running' | 'standby' | 'warning';
}

export interface DrainageSceneConfig {
  waterLevel: number; // 0 to 10 meters
  activePumpCount: number;
  isInspecting: boolean;
}
