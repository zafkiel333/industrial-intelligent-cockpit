export interface CrusherImpactData {
  shaftVibration: number;
  linerImpactEnergy: number;
  materialLoad: number;
  motorPower: number;
  linerWearIndex: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
}
