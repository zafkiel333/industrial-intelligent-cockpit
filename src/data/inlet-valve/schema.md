# 进水球阀流控系统 - 数据字典与规范

## 1. 数据来源设计
- **核心数据目录**: `/src/data/inlet-valve/`
- **动态仿形数据源**: `valve-series-data.ts` (120帧，仿真展示水轮机开机前的核心前置流程：“全关待命 -> 开启旁通阀平压预组水 -> 主接力器动作开启主球芯 -> 全开工作状态(受动态水流冲击振动) -> 关闭退出”的过程)。

## 2. 字段映射意义 (TypeScript 结构)
```ts
export interface InletValveData {
  timestamp: string;               // 数据采集绝对时间 ISO-8601
  // ---动作与接力器状态---
  valveAngle: number;              // 主阀芯机械转动绝对参考角 (0-90度，0为全关，90为全开)
  servoStroke: number;             // 液压接力器当前机械伸缩行程 (mm)
  isBypassOpen: boolean;           // 旁通阀电磁阀启闭状态 (平压用)
  // ---水压与水封流场布置---
  upstreamPressure: number;        // 引水压力钢管直接进水静压 (MPa)
  spiralCasingPressure: number;    // 蜗壳内部受水压力 (MPa)
  sealWaterPressure: number;       // 工作密封环注水顶起压力 (MPa，需大于工作水压)
  // ---动作效能微秒级诊断---
  actionTimeDeviation: number;     // 机组开启或关闭时的接力器动作迟滞偏离标准标定线的绝对时差 (ms)
  // ---物理磨损泄露监控---
  leakageFlow: number;             // 轴端检修密封或主密封滴漏导流水量 (L/min)
  vibration: number;               // 阀壳外部绝对振动速度烈度 RMS 值 (mm/s)
  // ---系统状态反馈---
  valveStatus: 'fully_closed' | 'opening' | 'fully_open' | 'closing';
  healthStatus: 'optimal' | 'warning' | 'critical'; 
}
```

## 3. 标准接入体范式 (JSON 示例)
```json
{
  "device_id": "MAIN-VALVE-SPHERE-01",
  "timestamp": "2026-04-18T11:00:30.000Z",
  "actuator_state": {
    "valve_angle_deg": 45.5,
    "servo_stroke_mm": 302.5,
    "bypass_running": true
  },
  "hydro_pressure_mpa": {
    "upstream_tube": 4.52,
    "spiral_casing": 4.45,
    "seal_water": 5.12
  },
  "diagnostic_wear": {
    "action_delay_ms": -12,
    "leakage_lpm": 26.5,
    "vibration_rms_mms": 4.8
  },
  "conclusions": {
    "current_phase": "opening",
    "health_eval": "warning"
  }
}
```
