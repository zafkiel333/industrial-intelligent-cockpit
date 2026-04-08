export interface SeparatorState {
  rpm: number; // 0 to 8000
  bowlOpen: boolean;
  oilFeed: boolean;
  waterSeal: boolean;
  vibration: number; // 0 to 10
  sludgeLevel: number; // 0 to 100%
}
