export interface PropulsionState {
  rotationSpeed: number; // RPM
  vibrationIntensity: number; // 0-1
  bladePitch: number; // degrees
  cavitationRisk: number; // 0-1
  thrustForce: number; // kN
}
