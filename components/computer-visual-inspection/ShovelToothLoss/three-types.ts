export interface ToothStatus {
  id: string;
  index: number;
  status: 'normal' | 'missing' | 'worn';
  wearLevel: number; // %
}

export interface ShovelState {
  impactForce: number; // kN
  cycleTime: number; // s
  payload: number; // t
}
