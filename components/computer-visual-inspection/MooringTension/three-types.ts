export interface MooringState {
  lines: { id: string; tension: number; status: 'normal' | 'warning' | 'critical' }[];
  shipMovement: { x: number; y: number; z: number };
}
