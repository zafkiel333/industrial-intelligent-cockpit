export interface BerthingState {
  distance: number;
  angle: number;
  speed: number;
  status: 'approaching' | 'docked' | 'warning';
}
