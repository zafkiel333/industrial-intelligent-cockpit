export interface BrakePadState {
  temperature: number; // Celsius
  brakingForce: number; // kN
  padThickness: number; // mm
  frictionCoefficient: number; // 0-1
  operatingHours: number; // hours
}
