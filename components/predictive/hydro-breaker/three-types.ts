
export interface BreakerSceneProps {
  breakerState: 'open' | 'closed' | 'opening' | 'closing';
  travelPosition: number; // 0 (Open) to 100 (Closed)
  arcIntensity: number; // 0 to 1, visualizes arcing during switching
  springCompression: number; // 0 to 100%
  mechanismVibration: number; // Visual shake amount
  showInternal: boolean; // Toggle transparency
}
