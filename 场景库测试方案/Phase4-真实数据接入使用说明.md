# Phase 4 —— 真实后端数据流转：使用说明

> 覆盖范围：`unit1-predictive`（原有页面，决策 2/3 里提到的"目前唯一有真实后端数据的页面"）+ Phase 4.1~4.10 新接入的 10 个试点页面。
> 本文档只说明"怎么用、数据放哪、怎么算出来的"，架构决策背景见 [`开发计划.md`](./开发计划.md) 第 4 节，逐步验证记录见 [`修改日志.md`](./修改日志.md)。

---

## 1. 整体流程（11 个页面通用）

所有页面遵循同一套流程：**上传 Excel → 后端解析落盘 → 前端拉取 → 图表/3D 联动**。

1. 打开对应页面（见第 3 节的页面列表），点击页面里的"数据入库"/"数据入库集成"按钮，弹出上传弹窗。
2. 弹窗里选择一个本地 `.xls`/`.xlsx` 文件（**格式要求见第 4 节，非常重要，格式不对会导致读到的全是空值**），点击"开始上传解析"。
3. 上传成功后弹窗会提示"成功上传 N 个文件"，页面会自动重新拉取数据（`refetch`），图表、3D 场景、阈值告警都会用新数据重新渲染。
4. 如果要清空当前场景的数据、恢复到"暂无数据"的初始状态，用弹窗里或页面上的"清空数据"操作（对应 `clearData`），会删除该场景目录下的所有文件。
5. 没有上传过数据时，页面会显示"暂无数据"的空状态（后端返回 `isEmpty: true`），不会报错，也不会显示历史的模拟数据。

**这一整套 4.0 通用化的前端代码在哪：**
- 数据拉取 hook：[`src/scenarioLib/useScenarioRealData.ts`](../src/scenarioLib/useScenarioRealData.ts) —— 每个页面用自己的 `SCENARIO_ID` 调用 `useScenarioRealData(SCENARIO_ID)`，拿到 `{ unifiedData, historyDividerIndex, loading, error, refetch, clearData }`。
- 上传弹窗组件：[`src/scenarioLib/ScenarioDataUploadModal.tsx`](../src/scenarioLib/ScenarioDataUploadModal.tsx) —— 10 个试点页面共用同一个组件，只是各自传入不同的 `scenarioId` 和 `metricsHint`（提示文案，告诉用户这个场景需要哪些列）。
- 后端通用路由：[`server.ts`](../server.ts) 第 225~417 行，`SCENARIO_CONFIGS` 之后新增的 `/api/scenarios/:scenarioId/*` 三个接口（见第 5 节）。

**`unit1-predictive` 页面是例外**：它是这套通用方案出现之前就已存在的原型，走的是老的专属接口（`/api/upload`、`/api/data`、`/api/upload/clear`，见 `server.ts` 第 1~223 行），upload 弹窗是页面里内嵌的一次性 JSX，不是共用组件，且需要额外传一个"归档类型"（`power`/`temperature`）来决定数据分两个目录存。本次 4.0 通用化**没有改动** `unit1-predictive` 原有逻辑，只是照着它的思路抽了一套更简单的新通用方案给另外 10 个页面用。

---

## 2. 端到端耗时显示的说明（按你的最新要求）

场景信息条上的"端到端耗时"数值，本次统一处理为：**无论页面是否接了真实数据，标签都只显示"模拟"，不做真实/模拟的区分标注**，页面之间的差异仅体现在具体的毫秒数值大小，不体现在标签文字上。

---

## 3. 数据存储位置

### 3.1 `unit1-predictive`（原有页面，未改动）

| 数据类型 | 磁盘目录 |
|---|---|
| 有功功率 Excel | `src/data/Unit1Pred/有功功率文件/` |
| 机组推力瓦温度 Excel（16 个测点，各一个文件，文件名需含 `N#` 来标识测点号） | `src/data/Unit1Pred/机组推力瓦温度数据/` |

上传时上传弹窗会带一个 `type` 字段（`power`/`temperature`）来决定存进哪个目录；上传接口先把文件存进项目根目录的 `tmp_uploads/` 临时目录，再搬到最终目录。

### 3.2 Phase 4.1~4.10 十个试点页面（新增，彼此独立、也不与 `unit1-predictive` 共用）

| # | 场景 id（`SCENARIO_ID`） | 页面 | 磁盘目录 |
|---|---|---|---|
| 1 | `cv-spillway-monitoring` | 溢洪道监测 | `src/data/cv-spillway-monitoring/uploads/` |
| 2 | `vibe-DamGalleryMicroseism` | 大坝廊道微震监测 | `src/data/vibe-DamGalleryMicroseism/uploads/` |
| 3 | `intake-trash-rack-life` | 进水口拦污栅寿命预警 | `src/data/intake-trash-rack-life/uploads/` |
| 4 | `mpm-16` | 调压室巡检维护计划 | `src/data/mpm-16/uploads/` |
| 5 | `pm-hydro-36` | 压力钢管焊缝疲劳与裂纹预测 | `src/data/pm-hydro-36/uploads/` |
| 6 | `eq-7` | 船舶智能运维 | `src/data/eq-7/uploads/` |
| 7 | `cv-mooring-tension` | 系泊张力监测 | `src/data/cv-mooring-tension/uploads/` |
| 8 | `eq-12` | 矿山提升机智能运维 | `src/data/eq-12/uploads/` |
| 9 | `mining-shovel-rope-life` | 电铲钢丝绳寿命预警 | `src/data/mining-shovel-rope-life/uploads/` |
| 10 | `vibe-ConeCrusherVibration` | 圆锥破碎机振动监测 | `src/data/vibe-ConeCrusherVibration/uploads/` |

> 每个目录下**只会用到第一个** `.xls`/`.xlsx` 文件（按目录里文件名排序取第一个），重复上传新文件不会自动合并，只会在读取时仍然只读第一个——如果要更新数据，建议先清空再上传，避免混淆。
>
> `#2` 和 `#10` 的场景 id 和一开始规划的不完全一样（`vibe-DamGalleryMicroseismic`→`vibe-DamGalleryMicroseism`、`vibe-ConicalCrusher`→`vibe-ConeCrusherVibration`），原因见 `server.ts` 第 238~246 行的注释：原计划草稿对应的文件其实是 Step 2.2 已确认的死代码重复文件，改到了真正被 `App.tsx` 路由到的活文件，指标也据此重新拟定。

---

## 4. Excel 文件格式要求（务必遵守，否则读到的是空值）

后端解析用的是 `xlsx` 库的 `sheet_to_json` 默认行为——**它会把 Excel 第一行当成"表头"，用第一行每个单元格的文本作为字段名**。这套方案沿用 `unit1-predictive` 原有的解析约定，要求：

- **第一行（表头行）必须是字面文本 `_1`、`_2`、`_3` ...**（不是随便写的列名，也不能留空或写中文列名，否则程序读不到对应字段）。
- `_1` 列固定是时间：可以是 Excel 日期格式，也可以是能被 `new Date(...)` 解析的字符串（如 `2026-07-13 08:00:00`）。
- `_2` 及之后的列，按该场景 `metrics` 数组声明的顺序，依次对应各个指标的数值（第 5 节每个场景的表格都按这个顺序列出）。
- 从第二行开始才是真实数据，每一行代表一个时间点。
- 同一个时间点缺失某一列的数值：解析后该单元格会是 `null`，后端会自动用"上一条非空值"向前填充（沿用 `unit1-predictive` 原有的向前填充逻辑，见 `server.ts` 第 394~407 行）。

**示例**（`cv-spillway-monitoring` 场景，3 个指标 `flowRate`/`waterLevel`/`vibrationLevel`）：

| A (`_1`) | B (`_2`) | C (`_3`) | D (`_4`) |
|---|---|---|---|
| 2026-07-13 08:00:00 | 1245.5 | 15.2 | 2.4 |
| 2026-07-13 08:01:00 | 1248.1 | 15.3 | 2.5 |
| ... | ... | ... | ... |

---

## 5. 各场景的数据字段与预测/派生逻辑

> 每个场景只有"headline 指标"来自上传的 Excel，页面上其余装饰性/流程性字段（如工单状态、告警文案措辞、静态图表装饰）维持原有实现不变，不受这次改造影响。

### 5.1 `cv-spillway-monitoring` —— 溢洪道监测
- **上传字段**：`flowRate`(m³/s) / `waterLevel`(m) / `vibrationLevel`(mm/s)
- **派生逻辑**：3D 场景的 `flowIntensity` = `flowRate / 1500` 归一化到 0~1（`views/computer-visual-inspection/SpillwayMonitoring/index.tsx` 第 79 行）；`erosionZones`（冲刷区域标注）仍是静态 mock 数据，未接入真实值。
- **代码位置**：`views/computer-visual-inspection/SpillwayMonitoring/index.tsx`

### 5.2 `vibe-DamGalleryMicroseism` —— 大坝廊道微震监测
- **上传字段**：`eventEnergy`(震级 ML) / `stabilityIndex`(0~1) / `waterLevel`(m) / `crackWidth`(mm) / `seepageFlow`(L/min)
- **派生逻辑**：`status` 三态告警改为基于真实值判断：`eventEnergy > 2.0 或 stabilityIndex < 0.85` → `danger`；`eventEnergy > 1.0 或 stabilityIndex < 0.95` → `warning`；否则 `normal`（原逻辑里 danger 分支因为阈值判断顺序重叠，永远进不去，本次一并修复）。3D 场景的 `intensity` = `eventEnergy / 3` 归一化。
- **代码位置**：`views/vibration-monitoring/DamGalleryMicroseism/index.tsx`

### 5.3 `intake-trash-rack-life` —— 进水口拦污栅寿命预警
- **上传字段**：`flowVelocity`(m/s) / `waterLevelDiff`(m) / `vibrationAmplitude`(mm) / `blockageRatio`(0~1)
- **派生逻辑**：
  - `structuralStress`(MPa) = `20 + waterLevelDiff*100 + flowVelocity*10`
  - `corrosionLevel`（0~1）= 按数据序号从 0.1 线性爬升到最多 0.4（`0.1 + (idx/总条数)*0.3`），模拟锈蚀随时间累积
  - `healthScore` = `100 − 应力惩罚 − 锈蚀惩罚`，其中应力惩罚 = `structuralStress>150` 时 `(structuralStress-150)*0.5`，锈蚀惩罚 = `corrosionLevel*30`
  - 告警阈值不变：`waterLevelDiff>1.5m` 或 `structuralStress>180MPa` → 危险；`blockageRatio>0.4` → 警告
- **代码位置**：`views/life-warning/intake-trash-rack-life/View.tsx`

### 5.4 `mpm-16` —— 调压室巡检维护计划
- **上传字段**：`temperature`(°C) / `pressure`(MPa) / `vibration`(mm/s)
- **派生逻辑**：无额外派生，三项直接展示；工单流程状态（`status`/`progress`）保持人工模拟，不接入 Excel。
- **代码位置**：`views/Maintenance-plan-management/SurgeChamberInspection/SurgeChamberInspectionView.tsx`

### 5.5 `pm-hydro-36` —— 压力钢管焊缝疲劳与裂纹预测
- **上传字段**：`pressure`(MPa) / `hoopStress`(MPa)
- **预测逻辑（简化 Miner 累积损伤法则）**：
  ```
  参考应力 REF_STRESS = 300 MPa（沿用原有 stressFactor = hoopStress/300 的换算基准）
  S-N 指数 S_N_EXPONENT = 3（典型金属疲劳曲线量级）
  单位损伤系数 UNIT_DAMAGE = 0.0005
  damageIndex = min(1, Σ (每条记录的 hoopStress/REF_STRESS)^3 × UNIT_DAMAGE)
  fatigueCycles = 184500 + 数据条数 × 1000
  nextInspection（下次检修天数）= max(3, round(45 × (1 − damageIndex)))
  剩余寿命循环数展示 = max(0, round(20000 × (1 − damageIndex)))
  ```
  没有上传数据时用 `damageIndex = 0.42` 兜底（原静态展示值）。裂纹登记表 `CRACK_REGISTRY`、超声波扫描数据 `ULTRASONIC_SCAN` 仍是静态数据，未接入真实值。
- **代码位置**：`views/predictive/hydro/PenstockWeldFatigueView.tsx` 第 61~86 行

### 5.6 `eq-7` —— 船舶智能运维
- **上传字段**：`speed`(kn) / `rpm`(RPM) / `fuelConsumption`(kg/h) / `exhaustTemp`(°C)
- **派生逻辑**：无额外派生。姿态（pitch/roll/ballast）、环境（风速/浪高）等字段保持原有模拟，未纳入本次真实数据范围。
- **代码位置**：`views/ShipView.tsx`

### 5.7 `cv-mooring-tension` —— 系泊张力监测
- **上传字段**：`tensionL1` / `tensionL2` / `tensionL3` / `tensionL4`（4 根缆绳张力，kN）
- **派生逻辑**：每根缆绳的告警状态判断不变：`>250kN` → critical，`>180kN` → warning，否则 normal。`shipMovement.x/z`（船体摇摆位移）仍是模拟数据。
- **代码位置**：`views/computer-visual-inspection/MooringTension/index.tsx`

### 5.8 `eq-12` —— 矿山提升机智能运维
- **上传字段**：`depth`(m) / `velocity`(m/s) / `payload`(t) / `brakePressure`(MPa) / `ropeTensionR1`~`ropeTensionR4`(kN，4 根钢丝绳张力)
- **派生逻辑**：`drumSpeed`（卷筒转速）= `velocity × 4.5`，仍是纯派生值；`direction`/`mode` 状态量维持原有派生逻辑。
- **代码位置**：`views/MineHoistView.tsx`

### 5.9 `mining-shovel-rope-life` —— 电铲钢丝绳寿命预警
- **上传字段**：`tension`(kN) / `abrasion`(0~100%)
- **预测逻辑（阈值穿越计数法）**：
  ```
  bendingCycles（弯曲循环次数）= 150000 + 数据序号 idx × 150
  operatingHours（运行小时数）= 1200 + idx
  highTensionCrossings = 统计 tension 历史中 "> 1800kN" 的记录条数
  brokenWires（断丝数）= min(12, 2 + highTensionCrossings)
  健康分惩罚：断丝惩罚 = min(60, brokenWires × 5)
  剩余寿命 remainingLife = max(0, floor((基准寿命 baseLife − operatingHours) × 健康分/100))
  ```
  告警阈值不变：`tension>1800kN` → 危急；`brokenWires>=6` → 报废标准；`brokenWires>2` → 注意；`abrasion>60` → 警告。
- **代码位置**：`views/life-warning/mining-shovel-rope-life/View.tsx`

### 5.10 `vibe-ConeCrusherVibration` —— 圆锥破碎机振动监测
- **上传字段**：`vibration`(mm/s) / `oilPressure`(MPa) / `motorCurrent`(A) / `crushingForce`(kN)
- **派生逻辑**：`status` 二态判断改为基于真实 `vibration` 阈值：`>10mm/s` → warning，否则 normal（原随机判断的重叠 bug 一并修复）。
- **代码位置**：`views/vibration-monitoring/ConeCrusherVibration/index.tsx`

---

## 6. 通用后端接口（供开发参考）

| 方法 | 路径 | 用途 |
|---|---|---|
| `POST` | `/api/scenarios/:scenarioId/upload` | 上传 Excel（`multipart/form-data`，字段名 `files`），落盘到该场景目录 |
| `DELETE` | `/api/scenarios/:scenarioId/upload/clear` | 清空该场景目录下所有文件 |
| `GET` | `/api/scenarios/:scenarioId/data` | 读取该场景目录下第一个 Excel，解析并返回 `{ unifiedData, historyDividerIndex, isEmpty? }` |

`:scenarioId` 必须是 `server.ts` 里 `SCENARIO_CONFIGS` 已登记的 10 个 id 之一（见第 3.2 节表格），否则接口返回 `404`。

`unit1-predictive` 走的是独立的旧接口（`/api/upload`、`/api/data`、`/api/upload/clear`，不带 `scenarioId`），两套接口并存，互不影响。

---

## 7. 已知局限（暂不在本次范围内，供后续参考）

- **`historyDividerIndex`（历史/预测分界点）目前是占位算法**：固定取"数据总条数的 75% 位置"，不是真实的预测模型输出，11 个页面（含 `unit1-predictive`）都是如此，`server.ts` 里的注释也说明了这一点。
- **每个场景目录只读取第一个文件**：多次上传不会自动合并多个文件的数据，需要更新数据时建议先清空再上传。
- **端到端耗时的"真实数据"计时功能尚未实现**：`src/scenarioLib/ScenarioTelemetryContext.tsx` 里定义了 `reportRealTiming` 接口，但目前没有任何页面调用它，所有页面（含这 10 个新接入的）显示的耗时都是同一套"渲染耗时"模拟测算，且按本次要求统一标注为"模拟"，不做真实/模拟区分。
- **Excel 解析格式较为严格**（见第 4 节），后续如果要允许用户上传"带真实中文列名"的表格，需要改造 `server.ts` 里的解析逻辑，目前为了和 `unit1-predictive` 保持一致未做改动。
