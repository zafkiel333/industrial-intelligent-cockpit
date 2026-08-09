export interface FenderState {
  compression: number; // 0 to 1
  pressure: number; // kPa
  status: 'normal' | 'warning' | 'critical';
  lastImpact: number; // kN
}
