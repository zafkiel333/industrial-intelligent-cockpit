# 抽蓄水泵/水轮机转轮联控协议 (Pump-Turbine Runner Protocol)

抽水蓄能双向转轮及其导叶监控。需追踪不同工况下的水力学突变和空化（气蚀）风险。

## JSON Payload 示例

```json
{
  "timestamp": "2026-04-19T20:00:00.000Z",
  "operatingMode": "pump",
  "rpm": -300.5,
  "guideVaneAngle": 15.2,
  "flowRate": 250.3,
  "waterHead": 115.4,
  "cavitationIndex": 0.12,
  "draftTubePressurePulse": 0.05
}
```

## 字段说明

| 字段名 | 类型 | 单位 | 描述 |
| ------ | ---- | ---- | ---- |
| timestamp | string (ISO8601) | - | 采集时间 |
| operatingMode | string | - | 工作模式 (`turbine`: 发电, `pump`: 抽水, `idle`: 空转) |
| rpm | number | rpm | 转速 (发电为正，抽水为负) |
| guideVaneAngle | number | 度 (°) | 活动导叶平均开度角 |
| flowRate | number | m³/s | 流量 |
| waterHead | number | m | 工作水头 / 扬程 |
| cavitationIndex | number | - | 无量纲空化系数 (越低越危险，一般低于0.08告警) |
| draftTubePressurePulse | number | MPa | 尾水管压力脉动强度 |
