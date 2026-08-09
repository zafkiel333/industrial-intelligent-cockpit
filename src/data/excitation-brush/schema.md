# 发电机励磁系统与滑环碳刷集电装置数据字典 (Excitation & Brush Schema)

| 字段名称 | 对应英文键 | 数据类型 | 单位 | 说明 |
| --- | --- | --- | --- | --- |
| 采集时间 | `timestamp` | ISO String | - | 系统采样的时间戳 |
| 转子恒动转速 | `rotorSpeed` | Number | RPM | 发电机的基础同步转速 |
| 励磁母线电压 | `excitationVoltage` | Number | V | 输入励磁滑环的直流标称电压 |
| 转子励磁电流 | `excitationCurrent` | Number | A | 通过碳刷导入转子的激磁电流，直接影响无功输出计算 |
| 滑环表面温度 | `slipRingTemp` | Number | °C | 高频摩擦结合电流热效应导致的核心金属环高温 |
| 碳刷微米磨损余量 | `brushWearLevels` | Array<Number> | mm | 4组关键部位碳刷的剩余物理长度，预警更换周期 |
| 恒压弹簧压强 | `brushPressures` | Array<Number> | N | 弹簧压近碳刷端面的机械力，压力过低产生电火花 |
| 放电火花烈度 | `sparkIntensity` | Number | 0-1 | 0无火花，1为环火危险状态。基于视觉监控与电流尖峰联合估算 |
| 励磁电流杂波频域 | `currentHarmonics` | Array<Number> | - | 傅里叶变换(FFT)后的谐波柱列图，指示整流异常或接触不良 |
| 综合健康等级 | `overallStatus` | String | Enum | 状态：正常(normal)、磨损告警(warning)、环火危险(danger) |
