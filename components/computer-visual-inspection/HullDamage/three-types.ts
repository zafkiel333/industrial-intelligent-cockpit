export interface DamagePoint {
  id: string;
  type: 'crack' | 'dent' | 'corrosion';
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high';
}

export interface HullState {
  structuralHealth: number; // 0 to 100
  maxDeformation: number; // in mm
  damagePoints: DamagePoint[];
}
