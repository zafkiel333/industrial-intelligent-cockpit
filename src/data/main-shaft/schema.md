# 发电机主轴与导轴承摆度监测协议 (Main Shaft Runout Protocol)

监测巨大转动部件（主轴与转子）在XY轴水平方向的偏心与振动情况。过大摆度会导致动静碰摩。

## JSON Payload 示例

```json
{
  "timestamp": "2026-04-19T20:00:00.000Z",
  "displacementX": 15.2,
  "displacementY": -10.5,
  "phaseAngle": 125.4,
  "vibrationVelocity": 1.2,
  "guideBearingTemp": 45.2,
  "activePower": 350.5
}
```

## 字段说明

| 字段名 | 类型 | 单位 | 描述 |
| ------ | ---- | ---- | ---- |
| timestamp | string (ISO8601) | - | 采集时间 |
| displacementX | number | μm | X方向相对位移 (摆度) |
| displacementY | number | μm | Y方向相对位移 (摆度) |
| phaseAngle | number | 度 (°) | 偏心绝对相位角 |
| vibrationVelocity | number | mm/s | 导轴承绝对振动速度 (RMS) |
| guideBearingTemp | number | °C | 导轴承瓦温 |
| activePower | number | MW | 发电机有功功率 (负荷经常引发摆度变化) |
