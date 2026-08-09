# 水轮机导水机构与伺服控制系统数据字典 (Guide Vane Mechanism Schema)

| 字段名称 | 对应英文键 | 数据类型 | 单位 | 说明 |
| --- | --- | --- | --- | --- |
| 采集时间 | `timestamp` | ISO String | - | 系统采样的时间戳 |
| 接力器活塞行程 | `servoStroke` | Number | mm | 液压伺服接力器的直线推拉位移，决定了控制环的角度 |
| 接力器操作油压 | `servoOilPressure` | Number | MPa | 高压油槽输入油缸的压强 |
| 控制环极限转角 | `ringAngle` | Number | Degree | 控制环(Regulating Ring)的物理旋转移位角 |
| 象限导叶开度 | `vaneAngles` | Array<Number> | Degree | 上下左右四个防区象限内的标志性导叶当前实际物理开度 |
| 导叶轴承摩擦阻矩 | `frictionTorque` | Number | kN.m | 导叶轴套间的卡滞摩擦力，预警轴承泥沙磨损 |
| 剪断销剪切应力 | `shearPinStress` | Number | MPa | 导叶传动臂上的保护性结构（剪断销）受力，超限则导致折断死机 |
| 蜗壳瞬态流速 | `flowVelocity` | Number | m/s | 进入转轮的水流速度 |
| 转轮响应转速 | `turbineRpm` | Number | RPM | 联动效应下的水轮机转速 |
| 综合健康等级 | `overallStatus` | String | Enum | 状态：正常(normal)、卡滞告警(warning)、剪断危险(danger) |
