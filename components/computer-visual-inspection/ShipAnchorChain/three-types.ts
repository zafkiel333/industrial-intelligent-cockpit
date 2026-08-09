export interface AnchorChainState {
  tension: number; // kN
  length: number; // meters
  status: 'stowed' | 'deploying' | 'anchored' | 'warning';
  wearLevel: number; // 0 to 1
}
