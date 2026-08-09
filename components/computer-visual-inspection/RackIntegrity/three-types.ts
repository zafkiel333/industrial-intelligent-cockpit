export interface RackStatus {
  deformation: number; // mm
  loadWeight: number; // kg
  tiltAngle: number; // degrees
  structuralIntegrity: number; // 0-1
  isOverloaded: boolean;
  location: string;
  lastInspected: string;
}
