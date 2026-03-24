export interface BallastTank {
  id: string;
  name: string;
  level: number; // 0-1 (百分比)
  capacity: number; // m3
  currentVolume: number; // m3
  status: 'optimal' | 'warning' | 'alert';
}

export interface BallastSceneConfig {
  isPumping: boolean;
  flowDirection: 'ballast' | 'deballast' | 'idle';
  activePumps: string[];
}

export type InspectionPoint = {
  id: string;
  part: 'valve' | 'pump' | 'sensor';
  position: [number, number, number];
  health: number; // 0-100
};
