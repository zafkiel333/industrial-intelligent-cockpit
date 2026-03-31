export interface RopeDamage {
  id: string;
  position: number; // m
  type: 'broken' | 'corrosion' | 'wear';
  severity: number; // 0-1
}

export interface HoistState {
  speed: number; // m/s
  tension: number; // kN
  depth: number; // m
}
