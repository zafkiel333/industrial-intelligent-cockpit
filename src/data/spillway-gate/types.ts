export interface SpillwayGateData {
  timestamp: string;
  // 液压启闭系统
  openingPercentage: number;     // 开度百分比 (0-100)
  cylinderPressureLeft: number;  // 左侧油缸压力 (MPa)
  cylinderPressureRight: number; // 右侧油缸压力 (MPa)
  motorCurrent: number;          // 泵站电机电流 (A)
  // 水文与流体
  upstreamLevel: number;         // 库区水位 (m)
  downstreamLevel: number;       // 尾水水位 (m)
  dischargeFlow: number;         // 实时泄量 (m³/s)
  // 机械应力健康
  armStressLeft: number;         // 左支臂应力 (MPa)
  armStressRight: number;        // 右支臂应力 (MPa)
  vibration: number;             // 闸门面板振动频率 (Hz)
  // 综合状态
  gateStatus: 'closed' | 'opening' | 'closing' | 'hold';
  healthStatus: 'optimal' | 'warning' | 'critical';
}
