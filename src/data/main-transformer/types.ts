export interface MainTransformerData {
  timestamp: string;
  // 电气参数
  voltageHigh: number;     // 高压侧电压 (kV)
  voltageLow: number;      // 低压侧电压 (kV)
  currentHigh: number;     // 高压侧电流 (A)
  activePower: number;     // 传输有功功率 (MW)
  // 热力参数
  topOilTemp: number;      // 顶层油温 (℃)
  windingTemp: number;     // 绕组热点温度 (℃)
  // 色谱分析 (DGA - ppm)
  dga: {
    hydrogen: number;      // 氢气 (H2)
    methane: number;       // 甲烷 (CH4)
    ethylene: number;      // 乙烯 (C2H4)
    acetylene: number;     // 乙炔 (C2H2)
    carbonMonoxide: number;// 一氧化碳 (CO)
  };
  // 冷却系统
  coolingPumpStatus: boolean; // 强迫油循环泵运行状态
  fanGroupOn: number;         // 启动的风扇组数 (0-4)
  // 综合评估
  partialDischarge: number;   // 局放幅值 (pC)
  healthStatus: 'optimal' | 'warning' | 'critical';
}
