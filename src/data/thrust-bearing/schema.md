# 推力轴承监测数据协议 (Thrust Bearing Protocol)

推力轴承承受整个整机巨大的轴向水推力和转子重量，其瓦温和油膜厚度的监测是防止“烧瓦”事故的核心。

## JSON Payload 示例

```json
{
  "timestamp": "2026-04-19T20:00:00.000Z",
  "axialLoad": 12500.5,
  "oilPressure": 12.4,
  "padTemperatures": [55.2, 56.1, 54.8, 55.9, 57.2, 54.5, 55.0, 56.5],
  "oilFilmThickness": 45.2,
  "coolingWaterFlow": 150.5,
  "overallStatus": "normal"
}
```

## 字段说明

| 字段名 | 类型 | 单位 | 描述 |
| ------ | ---- | ---- | ---- |
| timestamp | string (ISO8601) | - | 采集时间 |
| axialLoad | number | kN | 实时轴向载荷 |
| oilPressure | number | MPa | 高压顶起润滑油压 |
| padTemperatures | number[] | °C | 各推力瓦温度 (通常分布有8-16块)，数组索引代表瓦位 |
| oilFilmThickness | number | μm | 承载端平均油膜厚度 |
| coolingWaterFlow | number | L/min | 冷却水管流量 |
| overallStatus | string | - | 整体状态评估 (`normal`, `warning`, `danger`) |
