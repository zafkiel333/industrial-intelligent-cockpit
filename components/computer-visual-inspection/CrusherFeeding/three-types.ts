export interface RockParticle {
  id: string;
  size: number; // mm
  position: [number, number, number];
  isOversized: boolean;
  velocity: number;
  rotationSpeed: [number, number, number];
}

export interface FeedingState {
  throughput: number; // t/h
  avgSize: number; // mm
  oversizeCount: number;
  uniformityIndex: number;
  moistureContent: number;
  systemLoad: number;
}
