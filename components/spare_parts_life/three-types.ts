export interface WearPoint {
  id: string;
  position: [number, number, number];
  intensity: number; // 0-1 磨损强度
}

export interface LifeThreeProps {
  wearPoints: WearPoint[];
  healthScore: number; // 0-100
  isScanning: boolean;
  partType: 'bearing' | 'turbine' | 'valve';
}