export interface LimitSwitchState {
  davitPosition: number; // 0 (stowed) to 100 (fully deployed)
  winchRunning: boolean;
  winchDirection: 'up' | 'down' | null;
  limitSwitchEngaged: boolean;
  powerSupply: boolean;
  switchAdjusted: boolean; // True if user has properly adjusted it
}
