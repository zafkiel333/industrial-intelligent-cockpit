
export interface FloodPoint {
  id: string;
  position: [number, number, number];
  type: 'danger' | 'supply' | 'sensor';
  label: string;
  intensity: number; // 0-1 风险强度
}

export interface FloodThreeProps {
  waterLevel: number; // 0-1 模拟水位高度
  rainIntensity: number; // 0-1 降雨强度，影响粒子系统
  hotspots: FloodPoint[];
  activePointId: string | null;
  onPointClick: (id: string) => void;
}
