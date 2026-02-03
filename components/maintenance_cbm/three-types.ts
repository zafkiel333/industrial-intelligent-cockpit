export interface CbmThreeProps {
  status: 'critical' | 'warning' | 'calibrating' | 'optimal';
  stability: number; // 0 (chaotic) to 1 (stable)
  pulseSpeed: number;
}
