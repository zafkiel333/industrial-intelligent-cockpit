
export interface BearingInternalStatus {
  id: string;
  name: string;
  loadVector: [number, number, number]; // 载荷矢量方向
  oilFilmThickness: number; // 润滑油膜厚度 (μm)
  viscosityIndex: number; // 粘度指数
  vibrationPeak: number; // 振动峰值 (G)
  tempGradient: number; // 温度梯度
  isMaintenanceMode: boolean;
}

export interface MiningBearingThreeProps {
  status: BearingInternalStatus;
  onPartClick: (partName: string) => void;
  rotationSpeed: number;
  viewMode: 'standard' | 'stress' | 'lubrication';
}
