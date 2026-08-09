export interface BreakerState {
  status: 'open' | 'closed' | 'moving';
  position: number; // 0 to 100 (0 = open, 100 = closed)
  testMode: 'none' | 'opening' | 'closing';
}
