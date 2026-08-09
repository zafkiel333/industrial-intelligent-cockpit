# 发电机定子绕组温控与绝缘监测数据字典 (Stator Winding Data Schema)

| 字段名称 | 对应英文键 | 数据类型 | 单位 | 说明 |
| --- | --- | --- | --- | --- |
| 采集时间 | `timestamp` | ISO String | - | 系统采样的时间戳 |
| 机组有功功率 | `activePower` | Number | MW | 发电机当前的输出功率，直接影响发热量 |
| 定子机端电压 | `statorVoltage` | Number | kV | 定子绕组两端的实际电压 |
| 铁芯平均温度 | `coreTempAvg` | Number | °C | 定子铁芯的整体背景热负荷 |
| 线棒槽位温度阵列 | `slotTemps` | Array<Number> | °C | 埋设在定子线槽内上、中、下层线棒的热电偶读数（一般取6个特征点） |
| 局放脉冲幅值 | `pdAmplitude` | Array<Number> | mV | 局部放电(Partial Discharge)的超声或高频电流信号幅值 |
| 局放特征相位 | `pdPhase` | Array<Number> | Deg (0-360) | 局放信号发生时的工频相位角，结合幅值用于绘制 PRPD 谱图 |
| 冷却水进水温 | `coolantInletTemp` | Number | °C | 定子空冷/水冷器的入口冷却介质温度 |
| 冷却水出水温 | `coolantOutletTemp` | Number | °C | 带走定子热量后的出口介质温度 |
| 冷却介质流量 | `coolantFlowRate` | Number | L/min | 主纯水回路或风机的流量 |
| 绝缘电阻估算 | `insulationResistance` | Number | MΩ | 根据漏电流折算的实时绝缘阻抗 |
| 综合健康等级 | `overallStatus` | String | Enum | 状态评估：正常(normal)、告警(warning)、危险(danger) |
