
export interface StictionSceneProps {
  position: number; // 0 (Closed) to 100 (Open) %
  skew: number; // mm, causes rotation
  frictionZones: { y: number, intensity: number }[]; // Areas on track with high friction
  waterLevel: number; // meters
  isMoving: boolean;
  jammed: boolean; // Visual shake effect
}
