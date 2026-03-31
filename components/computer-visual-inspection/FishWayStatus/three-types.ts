export interface Fish {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  species: string;
  size: number; // cm
}

export interface FishwayState {
  totalCount: number;
  passageRate: number; // fish/hour
  waterVelocity: number; // m/s
  oxygenLevel: number; // mg/L
}
