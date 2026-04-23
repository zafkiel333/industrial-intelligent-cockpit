export interface InletValveData {
  timestamp: string;
  // 阀门动作
  valveAngle: number;            // 主阀芯转角 (0-90度，90为全开)
  servoStroke: number;           // 接力器活塞行程 (mm)
  isBypassOpen: boolean;         // 旁通阀状态 (充水平压用)
  // 水压环境
  upstreamPressure: number;      // 压力钢管引水压力 (MPa)
  spiralCasingPressure: number;  // 蜗壳内部压力 (MPa)
  sealWaterPressure: number;     // 投入的主轴工作密封水压 (MPa)
  // 动作时间性能 (微秒/毫秒级漂移)
  actionTimeDeviation: number;   // 动作时间与标准曲线偏离度 (ms)
  // 漏水与震动
  leakageFlow: number;           // 漏水排水量 (L/min)
  vibration: number;             // 阀体振动速度有效值 (mm/s)
  healthStatus: 'optimal' | 'warning' | 'critical';
  valveStatus: 'fully_closed' | 'opening' | 'fully_open' | 'closing';
}
