# 溢洪道弧形闸门系统 - 数据字典与规范

## 1. 数据来源设计
- **核心数据目录**: `/src/data/spillway-gate/`
- **动态仿形数据源**: `spillway-series-data.ts` (120帧，呈现“全关 -> 平稳开启 -> 最大泄量持续(伴随应力异常偏载) -> 重新关闭”的过程)。

## 2. 字段映射意义 (TypeScript 结构)
```ts
export interface SpillwayGateData {
  timestamp: string;             // SCADA采集绝对时间
  // ---液压与启闭驱动---
  openingPercentage: number;     // 闸门开度控制值 (%)
  cylinderPressureLeft: number;  // 左侧液压系统油缸工作压力 (MPa)
  cylinderPressureRight: number; // 右侧液压系统油缸工作压力 (MPa)
  motorCurrent: number;          // 液压泵站主驱电机电流强度 (A)
  // ---水力特征---
  upstreamLevel: number;         // 库前实时水位标高 (m)
  downstreamLevel: number;       // 消力池/尾水标高 (m)
  dischargeFlow: number;         // 推算总下泄流量 (m³/s)
  // ---结构力学与健康---
  armStressLeft: number;         // 左侧径向支臂承压力应力计读数 (MPa)
  armStressRight: number;        // 右侧径向支臂承压力应力计读数 (MPa)
  vibration: number;             // 面板流激振动频率 (Hz)
  // ---结论与状态---
  gateStatus: 'closed' | 'opening' | 'closing' | 'hold'; 
  healthStatus: 'optimal' | 'warning' | 'critical';
}
```

## 3. 标准接入体范式 (JSON 示例)
```json
{
  "device_id": "GATE-SPILLWAY-03",
  "timestamp": "2026-04-18T09:00:30.000Z",
  "hydraulic_drive": {
    "opening_perc": 45.5,
    "cylinder_press_L": 16.52,
    "cylinder_press_R": 16.35,
    "motor_current": 125.4
  },
  "hydro_environment": {
    "upstream_level_m": 230.45,
    "downstream_level_m": 181.25,
    "discharge_flow_cms": 780.5
  },
  "structural_health": {
    "arm_stress_L": 55.4,
    "arm_stress_R": 54.8,
    "vibration_hz": 12.3
  },
  "system_status": {
    "gate_state": "opening",
    "health_eval": "optimal"
  }
}
```
