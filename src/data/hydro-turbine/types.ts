export interface HydroTurbineData {
  timestamp: string;
  // 核心运行
  rpm: number; 
  activePower: number; 
  reactivePower: number;
  frequency: number;
  // 水力学工况
  waterHead: number; 
  flowRate: number; 
  guideVaneOpening: number; 
  spiralCasePressure: number;
  draftTubeVacuum: number;
  // 机械健康
  vibration: { upperGuide: number; lowerGuide: number; thrust: number };
  shaftRunout: { x: number; y: number };
  // 热力场温度
  temperature: { statorWind: number; thrustOil: number; guideOil: number };
  // AI诊断结论
  efficiency: number;
  cavitationRisk: number; // 0-100 空化预警
  status: 'optimal' | 'warning' | 'critical';
}
