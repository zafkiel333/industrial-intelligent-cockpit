export interface ValveState {
  oilCleanliness: number; // NAS grade (e.g., 5 to 12)
  spoolDisplacement: number; // mm
  pressureDrop: number; // MPa
  frictionForce: number; // N
  wearDepth: number; // micrometers
  healthIndex: number; // 0 to 100
}
