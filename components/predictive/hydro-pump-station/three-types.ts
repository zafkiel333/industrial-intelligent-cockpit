
export interface PumpState {
  id: number;
  isRunning: boolean;
  speed: number; // 0-1 normalized
  health: number; // 0-100
}

export interface PumpStationSceneProps {
  waterLevel: number; // 0-100% of sump capacity
  pumps: PumpState[];
  flowRate: number; // Total flow, affects particle speed
  turbidity: number; // Affects water color/clarity
}
