# 主变压器智能监控系统 - 数据字典与规范

## 1. 数据来源设计
- **核心数据目录**: `/src/data/main-transformer/`
- **动态仿形数据源**: `transformer-series-data.ts` (120帧，仿真展示：“平稳运行 -> 负荷突增引起油温/绕组温度攀升 -> 触发散热风机群组启停 -> 伴随隐性局部放电及特种气体微升告警”的完整物理化学变化过程)。

## 2. 字段映射意义 (TypeScript 结构)
```ts
export interface MainTransformerData {
  timestamp: string;               // 数据采集时刻
  // ---电气运行指标---
  voltageHigh: number;             // 高压侧母线电压 (kV)
  voltageLow: number;              // 低压侧(发电机端)母线电压 (kV)
  currentHigh: number;             // 高压侧输出电流 (A)
  activePower: number;             // 跨侧传输有功功率 (MW)
  // ---热力冷却监控---
  topOilTemp: number;              // 变压器顶层绝缘油温度 (℃)
  windingTemp: number;             // 线圈绕组热点温度计算值 (℃)
  coolingPumpStatus: boolean;      // 强油循环油泵启动状态
  fanGroupOn: number;              // 冷却风扇投入群组数 (通常为0-4组)
  // ---化学绝缘分析 (DGA在线色谱 ppm)---
  dga: {
    hydrogen: number;              // 氢气 H2 (受潮或放电分解产生)
    methane: number;               // 甲烷 CH4 (低温过热)
    ethylene: number;              // 乙烯 C2H4 (高温过热)
    acetylene: number;             // 乙炔 C2H2 (电弧放电/极严重故障标志)
    carbonMonoxide: number;        // 一氧化碳 CO (固体绝缘老化分解)
  };
  // ---边缘高频预警---
  partialDischarge: number;        // UHF 超高频局部放电强度峰值 (pC)
  healthStatus: 'optimal' | 'warning' | 'critical'; 
}
```

## 3. 标准接入体范式 (JSON 示例)
```json
{
  "device_id": "MAIN-TRANS-500KV-A",
  "timestamp": "2026-04-18T10:00:30.000Z",
  "electrical": {
    "volt_h_kv": 506.2,
    "volt_l_kv": 18.55,
    "current_h_a": 345.8,
    "active_power_mw": 285.5
  },
  "thermal_coolant": {
    "top_oil_c": 56.4,
    "winding_c": 68.2,
    "pump_running": true,
    "fans_running_qty": 2
  },
  "chromatography_dga_ppm": {
    "H2": 26.5,
    "CH4": 12.1,
    "C2H4": 2.5,
    "C2H2": 0.0,
    "CO": 175.4
  },
  "diagnostics": {
    "partial_discharge_pc": 150,
    "health_eval": "optimal"
  }
}
```
