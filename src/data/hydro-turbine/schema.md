# 水轮发电机智能运维 - 数据治理与规范指南

## 1. 数据的读取设定目录
按照真实业务场景的架构分离要求，该板块的数据抽离并在项目中设定了专属的数据源获取挂载目录。
- **数据源根目录**: `/src/data/hydro-turbine/`
- **主要类型定义**: `/src/data/hydro-turbine/types.ts`
- **时序波形生成源 (TimeSeries)**: `/src/data/hydro-turbine/hydro-series-data.ts` 
  *(用于向前端提供持续、流式且具有波动周期的动态时序仿真数据，支持持续循环展示：平稳 -> 扰动告警 -> 平抑回填 的完整业务防真流水)*


## 2. 字段意义与数据结构 (TypeScript Interface 映射)

```ts
export interface HydroTurbineData {
  timestamp: string;                      // [系统] SCADA 传感器上传时刻ISO帧
  // ----核心运行电气特征----
  rpm: number;                            // [机械] 转子实时机械转速 (r/min) 额定125
  activePower: number;                    // [电网] 同步并网有功负荷 (MW) 
  reactivePower: number;                  // [电网] 系统无功补偿功率 (MVar)
  frequency: number;                      // [电网] 发电频率，控制闭环基准 50±0.2Hz
  // ----水力学工况参数----
  waterHead: number;                      // [工况] 上下游水位差产生的有效工作水头 (m)
  flowRate: number;                       // [工况] 当期过流管道引用流量 (m³/s)
  guideVaneOpening: number;               // [控制] 调速器下发的活动导叶开度指令 (%)
  spiralCasePressure: number;             // [流场] 蜗壳水流进口动环压力 (MPa)
  draftTubeVacuum: number;                // [流场] 尾水管真空度 (MPa)，过高易诱发强烈空化气蚀
  // ----机械健康度监控----
  vibration: { 
    upperGuide: number;                   // [振动] 上导轴承径向绝对振动 (μm) - 危急监控点
    lowerGuide: number;                   // [振动] 下导轴承径向振动 (μm)
    thrust: number;                       // [振动] 推力轴承轴向震动负荷 (μm)
  };
  shaftRunout: { 
    x: number;                            // [偏心] 发电机大轴X向实时摆度游动轨迹靶心 (mm)
    y: number;                            // [偏心] 发电机大轴Y向实时摆度游动轨迹靶心 (mm)
  };
  // ----热力场温度监测----
  temperature: { 
    statorWind: number;                   // [热力] 定子绕组线圈阻温探测 (℃)
    thrustOil: number;                    // [热力] 推力轴承油槽油温 (℃)
    guideOil: number;                     // [热力] 导轴承油瓦基底温升 (℃)
  };
  // ----边缘侧 AI 联合诊断结论----
  efficiency: number;                     // [诊断] 机组综合转化效率 (%)
  cavitationRisk: number;                 // [诊断] 空化(气蚀)风险评估拟合指数 (0-100)，超80判为危急
  status: 'optimal' | 'warning' | 'critical'; // [诊断] 大脑调度中心结论
}
```

## 3. 标准接入报文示例 (JSON Payload)

以下是模拟从后端/物联网关侧抓取到的任一帧数据的标准化范例图谱：

```json
{
  "device_id": "HT-FRANCIS-01",
  "timestamp": "2026-04-18T08:00:30.000Z",
  "core_ops": {
    "rpm": 125.12,
    "activePower": 298.45,
    "reactivePower": 45.20,
    "frequency": 50.01
  },
  "hydraulic_condition": {
    "waterHead": 105.80,
    "flowRate": 315.20,
    "guideVaneOpening": 76.5,
    "spiralCasePressure": 1.25,
    "draftTubeVacuum": 0.042
  },
  "mechanical_health": {
    "vibration": {
      "upperGuide": 46.50,
      "lowerGuide": 43.10,
      "thrust": 51.50
    },
    "shaftRunout": {
      "x": -0.15,
      "y": 0.22
    }
  },
  "temperature": {
    "statorWind": 65.20,
    "thrustOil": 58.10,
    "guideOil": 55.40
  },
  "diagnostics": {
    "efficiency": 93.80,
    "cavitationRisk": 18.5,
    "status": "optimal"
  }
}
```
*注：该示例数据已完全遵循上述 Typescript 字段解包规范，在实际工程通信中作为 `Payload` 负载跨端流动。*
