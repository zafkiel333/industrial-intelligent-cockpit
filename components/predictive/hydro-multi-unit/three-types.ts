
export interface UnitRiskState {
  id: string;
  health: number;       // 健康度 (0-100)
  power: number;        // 输出功率 (MW)
  riskLevel: number;    // 风险系数 (0-1)
  isPulsing: boolean;   // 是否处于高风险脉动状态
}

export interface MultiUnitSceneProps {
  units: UnitRiskState[];
  globalRisk: number;    // 全站整体风险指数
  connectionStrength: number; // 关联强度系数
  activeLinkIndex: number | null; // 当前聚焦的关联路径
}
