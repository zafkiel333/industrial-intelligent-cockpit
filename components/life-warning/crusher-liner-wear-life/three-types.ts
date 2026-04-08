export interface LinerState {
  materialAbrasiveness: number; // Index 1-10
  throughput: number; // tons/hour
  impactForce: number; // kN
  wearDepth: number; // mm
  operatingHours: number; // hours
}
