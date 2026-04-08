export interface TrashRackState {
  waterLevelDiff: number; // meters (Head loss)
  vibrationAmplitude: number; // mm
  corrosionLevel: number; // 0 to 1
  flowVelocity: number; // m/s
  blockageRatio: number; // 0 to 1
  structuralStress: number; // MPa
}
