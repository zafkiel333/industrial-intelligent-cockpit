# 外部可视化模型 API 接入与调整说明（实施版）

> 状态：已实施并完成接口联调；2026-08-10 增加设备数字孪生资源协同状态与模型资源详情入口。
> 对应计划：[`开发计划.md`](./开发计划.md)。
> 用途：说明远端 API、本地代理、前端数据流和后续可调整位置。

---

## 1. 上游服务

```text
人工参考页（业务代码禁止请求）: http://8.146.211.204:3100/three-model/detail?id=<modelId>
唯一业务数据源 API Base:       http://8.146.211.204:3100/three-model-api
```

四个详情页最初用于需求阶段人工识别模型 ID，现作为页面“查看资源详情”按钮的人工追溯入口。用户点击后由浏览器在新标签页打开；本项目业务代码不会请求详情页、解析 HTML 或从 DOM 抓取数据。模型信息、模型文件、运行数据、工况和一致性校验仍全部来自 `/three-model-api/api/...`。

上游 API 无需 JWT。虽然文档说明 CORS 已放行，本项目仍计划通过自身后端代理，原因是：统一错误处理、避免 HTTPS 混合内容、保护模型文件 key、支持缓存和避免形成不受控的跨域依赖。

## 2. 场景与模型映射

| 本地场景 ID | 远端模型 ID | 实际模型 | 模型文件 | 文件大小 | 人工来源入口 |
|---|---:|---|---|---:|---|
| `sim-visual-hydro-turbine` | 2326 | 水轮机总成 | `水轮机总成.fbx` | 7,661,788 B | `/three-model/detail?id=2326` |
| `sim-visual-wastewater-pump` | 2328 | 污水泵 KCM100HD | `污水泵KCM100HD.fbx` | 13,082,652 B | `/three-model/detail?id=2328` |
| `sim-visual-bridge-crane` | 2316 | 桥式起重机 | `crane_08.fbx` | 3,777,248 B | `/three-model/detail?id=2316` |
| `sim-visual-haul-truck` | 2310 | **拖车牵引车** | `拖车牵引车.fbx` | 6,175,120 B | `/three-model/detail?id=2310` |

> 2026-08-09 已确认：接受模型 2310 继续承载“矿卡”页面。页面设备信息仍如实显示远端模型名称“拖车牵引车”。调整时只需修改模型目录配置和页面文案，不应在多个组件里散落硬编码模型 ID。

---

## 3. 上游接口说明

### 3.1 获取模型基本信息

```http
GET /three-model-api/api/v1/three-model/models?model_id=2326
```

主要使用：

- `model_name`、`model_description`、`industry`；
- `model_file[].file_name/file_url/file_size`；
- `model_picture[]`（可用于加载失败时的封面兜底）。

### 3.2 获取模型文件列表

```http
GET /three-model-api/api/v1/three-model/models/files?model_id=2326
```

从 `file_list` 选择支持的文件。优先级建议：GLB → GLTF → FBX；当前四个模型实际均为 FBX。

### 3.3 下载模型文件

```http
GET /three-model-api/api/v1/three-model/models/files?file_url=<URL编码后的对象key>
```

本项目后端根据白名单中的模型 ID自行获取 `file_url`，前端不能提交任意 `file_url`。

### 3.4 Dashboard

```http
GET /three-model-api/api/visual-models/<modelId>/dashboard
```

主要字段：

- `twin_status`：在线状态、同步时间、延迟、数据点；
- `equipment`：设备名称、状态、额定功率；
- `bindable_fields[]`：字段、标签、单位、当前值、基准值、正常范围、趋势、异常标记、3D 绑定描述和建议刷新秒数；
- `model_config`：面数、材质数；
- `render_config`：相机、背景色、自动旋转；
- `acceptance`：响应时间验收信息；
- `scenario_templates`：正常、高负载、故障场景基准。

### 3.5 切换工况

```http
POST /three-model-api/api/visual-models/<modelId>/scenario/normal
POST /three-model-api/api/visual-models/<modelId>/scenario/high_load
POST /three-model-api/api/visual-models/<modelId>/scenario/fault
Content-Type: application/json

{}
```

`fault` 场景允许字段超过正常范围。前端不能对故障值再次钳制，否则会丢失告警语义。

### 3.6 数据一致性校验

```http
POST /three-model-api/api/visual-models/<modelId>/data-sync
Content-Type: application/json

{
  "scenario": "normal",
  "actual_values": {
    "rpm": 300,
    "temperature": 68
  }
}
```

该结果只表示实际值与场景基准的一致程度，不等于设备健康度。

---

## 4. 已实现的本地 BFF 接口

前端统一使用本项目地址：

```text
浏览器 → 本项目 /api/model-showcase/* → 上游 /three-model-api/api/*
```

业务调用链中不存在 `/three-model/detail`；该地址只存在于场景白名单的 `sourceDetailUrl`，由“查看资源详情”链接人工打开。

```http
GET  /api/model-showcase/:sceneId/bootstrap
GET  /api/model-showcase/:sceneId/model
GET  /api/model-showcase/:sceneId/dashboard
GET  /api/model-showcase/:sceneId/connection
POST /api/model-showcase/:sceneId/scenario/:type
POST /api/model-showcase/:sceneId/data-sync
POST /api/model-showcase/:sceneId/diagnosis
```

### 4.1 `bootstrap`

聚合模型基本信息和 Dashboard，避免首屏组件分别发起多次请求。实际返回：

```json
{
  "sceneId": "sim-visual-hydro-turbine",
  "modelId": 2326,
  "model": {
    "name": "水轮机总成",
    "description": "...",
    "industry": "水利水电",
    "fileName": "水轮机总成.fbx",
    "fileSize": 7661788,
    "format": "fbx",
    "localAssetUrl": "/api/model-showcase/sim-visual-hydro-turbine/model"
  },
  "dashboard": {}
}
```

### 4.2 `model`

- 后端读取场景白名单中的模型 ID；
- 请求上游模型元数据，选择允许格式的文件；
- 下载后先检查响应类型、文件头和 50 MB 上限，避免把上游 JSON 错误交给 FBXLoader；
- 首次成功后将模型二进制保留在服务进程内存中，页面切换不重复访问上游存储；
- 相同场景的并发模型请求合并为一次，并对非超时错误做有限重试；
- 返回正确的 `Content-Type`、`Content-Length`、`Content-Disposition` 和缓存头；
- 不接受任意 URL 或文件 key。

### 4.3 `diagnosis`（本项目模拟智能诊断服务）

该接口不转发到详情页，也不要求存在真实训练模型。后端读取通过 Dashboard/Scenario API 已采集的当前数据和最近 60 个快照，按设备诊断知识、趋势和统计特征输出模型式结论。

```http
POST /api/model-showcase/sim-visual-hydro-turbine/diagnosis
Content-Type: application/json

{}
```

返回示例：

```json
{
  "diagnosisId": "diag-sim-visual-hydro-turbine-1723200000000",
  "generatedAt": "2026-08-09T10:49:00.000Z",
  "dataWindow": {
    "sampleCount": 24,
    "startAt": "2026-08-09T10:47:00.000Z",
    "endAt": "2026-08-09T10:49:00.000Z"
  },
  "healthScore": 76,
  "riskLevel": "attention",
  "conclusion": "主轴振动呈持续上升趋势，轴承温度接近关注区间，建议加强轴系状态检查。",
  "faultPredictions": [
    {
      "faultCode": "SHAFT_IMBALANCE",
      "faultName": "轴系不平衡风险",
      "probability": 0.68,
      "horizon": "72h",
      "expectedWindow": "未来 24～72 小时",
      "evidence": ["振动连续上升", "温度接近正常上限"]
    }
  ],
  "recommendations": ["复核主轴振动频谱", "检查轴承润滑与温升"],
  "confidence": 0.74
}
```

前端只渲染结论、风险、概率、预测窗口、建议、置信度和时间，不渲染诊断模型、算法、特征权重或推理过程。

### 4.4 `connection`（设备资源协同状态只读快照）

```http
GET /api/model-showcase/sim-visual-hydro-turbine/connection
Accept: application/json
```

该接口只读取服务进程内已经由现有业务请求采集的状态，不主动访问上游，也不会触发模型下载。前端每 10 秒读取一次；页面隐藏时暂停轮询，重新进入页面时先展示应用运行期保留的上一次快照。

主要返回：

- `sourceProject`：模型资源平台、模型名称和固定资源详情入口；
- `connector`：模型数据安全接入服务、资源就绪状态和安全措施；
- `targetProject`：工业智能驾驶舱业务应用；
- `channels`：设备模型信息、三维模型、实时运行数据、典型工况、数据校验和健康评估的独立状态；
- `provenance`：资源平台提供内容与驾驶舱分析生成成果的边界；
- `overallStatus`：`connected`、`cached`、`degraded`、`offline` 或 `unknown`。

状态只在服务运行期间保留，后端重启后从 `unknown` 重新积累。返回值不包含上游 `file_url`、对象 key、堆栈或服务器路径。

### 4.5 错误响应

已统一为以下结构：

```json
{
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "模型服务响应超时，请稍后重试",
    "retryable": true
  }
}
```

当前错误代码包括：

- `SCENE_NOT_FOUND`；
- `INVALID_SCENARIO` / `INVALID_SYNC_PAYLOAD`；
- `MODEL_FILE_MISSING` / `MODEL_TOO_LARGE`；
- `MODEL_FILE_EMPTY` / `MODEL_FILE_INVALID`；
- `MODEL_STORAGE_UNAVAILABLE` / `MODEL_DOWNLOAD_FAILED`；
- `UPSTREAM_ERROR` / `UPSTREAM_TIMEOUT`；
- `MODEL_DOWNLOAD_TIMEOUT`；
- `DIAGNOSIS_NOT_READY` / `SHOWCASE_ERROR`。

### 4.6 环境变量与默认配置

```dotenv
VISUAL_MODEL_API_BASE_URL=http://8.146.211.204:3100/three-model-api
```

当前集中定义的服务端参数：

```ts
const JSON_TIMEOUT_MS = 10_000;
const MODEL_DOWNLOAD_TIMEOUT_MS = 30_000;
const MODEL_DOWNLOAD_ATTEMPTS = 2;
const METADATA_CACHE_TTL_MS = 5 * 60_000;
const MAX_MODEL_BYTES = 50 * 1024 * 1024;
```

服务监听端口可通过 `PORT` 调整，默认 `3000`。Dashboard 不做服务端缓存，以保证每次轮询都取得新的上游快照；模型元数据缓存 5 分钟。模型二进制首次成功校验后保留在服务进程内存中，同时返回 1 小时浏览器缓存头；停止服务后该运行期缓存自动释放。

---

## 5. 各模型字段

### 5.1 水轮机 2326

| field | 中文 | 单位 | 基准 | 正常范围 | 3D 绑定 |
|---|---|---|---:|---|---|
| `rpm` | 转速 | r/min | 300 | 0～500 | 转轮 |
| `temperature` | 温度 | ℃ | 68 | 0～90 | 轴承 |
| `vibration` | 振动 | mm/s | 2.3 | 0～4.5 | 主轴 |
| `pressure` | 水压 | MPa | 0.5 | 0～0.8 | 蜗壳 |
| `flow_rate` | 流量 | m³/s | 15 | 0～25 | 导叶 |
| `power_output` | 输出功率 | MW | 90 | 0～120 | 发电机 |

### 5.2 污水泵 2328

| field | 中文 | 单位 | 基准 | 正常范围 | 3D 绑定 |
|---|---|---|---:|---|---|
| `rpm` | 转速 | r/min | 300 | 0～500 | 泵体旋转 |
| `temperature` | 温度 | ℃ | 68 | 0～90 | 泵体颜色 |
| `vibration` | 振动 | mm/s | 2.3 | 0～4.5 | 泵体抖动 |
| `pressure` | 出口压力 | MPa | 0.5 | 0～0.8 | 压力表盘 |
| `flow_rate` | 流量 | m³/h | 15 | 0～25 | 管道流速 |
| `power_output` | 功率 | kW | 90 | 0～120 | 功率表盘 |

### 5.3 桥式起重机 2316

| field | 中文 | 单位 | 基准 | 正常范围 | 3D 绑定 |
|---|---|---|---:|---|---|
| `load_weight` | 负载重量 | 吨 | 20 | 0～50 | 吊钩 |
| `trolley_position` | 小车位置 | 米 | 10 | 0～20 | 小车轨道 |
| `crane_speed` | 运行速度 | 米/分钟 | 30 | 0～60 | 大车车轮 |
| `motor_temperature` | 电机温度 | ℃ | 60 | 20～85 | 电机外壳 |
| `vibration` | 振动 | 毫米/秒 | 2.0 | 0～4.5 | 电机底座 |

### 5.4 模型 2310（远端实际为拖车牵引车）

| field | 中文 | 单位 | 基准 | 正常范围 | 3D 绑定 |
|---|---|---|---:|---|---|
| `rpm` | 发动机转速 | rpm | 300 | 0～500 | 车轮旋转速度 |
| `temperature` | 发动机温度 | ℃ | 68 | 60～90 | 发动机颜色渐变 |
| `vibration` | 振动幅度 | mm/s | 2.3 | 0～4.5 | 车身抖动幅度 |
| `pressure` | 液压压力 | MPa | 0.5 | 0.4～0.8 | 液压杆伸缩位置 |
| `flow_rate` | 燃油流量 | L/h | 15 | 10～25 | 排气管粒子效果 |
| `power_output` | 输出功率 | kW | 90 | 50～120 | 仪表盘指针 |

---

## 6. 动态展示规则

### 6.1 轮询

- 上游字段的 `refresh_s` 为 2 秒；文档最佳实践建议 Dashboard 每 5 秒请求；
- 默认采用 5 秒网络轮询，减少上游压力；
- 历史队列默认保留 60 个快照；
- 四个场景分别使用模块级运行期缓存；离开页面不会清空 Bootstrap、最后快照、趋势、诊断和工况；
- 重新进入页面时先同步显示该场景缓存，再立即发出一次新请求；新数据签名发生变化才替换旧快照，没有变化则保留原数据；
- 接口失败时继续展示最后一次成功数据，并标注“数据更新”和“最近检查”时间；
- 页面不可见时不发起定时轮询，重新进入页面时立即刷新。

实际调整位置：`useRemoteModelTelemetry.ts`。

```ts
export const POLL_INTERVAL_MS = 5_000;
export const HISTORY_LIMIT = 60;
export const MAX_RETRY_INTERVAL_MS = 30_000;
```

### 6.2 数据来源标记

| 状态 | 含义 | UI |
|---|---|---|
| `live` | 最新数据来自上游 Dashboard | 绿色“上游同步” |
| `stale` | 当前显示最后一次成功快照 | 橙色“数据陈旧”及时间差 |
| `fallback` | 字段缺失时按范围本地兜底 | 紫色“本地模拟” |
| `offline` | 无任何可用快照 | 红色离线和重试按钮 |

### 6.3 工况切换

- `normal`：正常范围；
- `high_load`：接近正常范围上沿；
- `fault`：允许越界；
- 切换成功后立即更新参数卡、图表、3D 状态和评估报告；
- 场景切换失败时保留原场景，不做乐观伪成功。

---

## 7. 3D 调整说明

建议在 `modelCatalog.ts` 为每个模型保留以下可调参数：

```ts
interface ViewerTuning {
  scale?: number;
  rotation?: [number, number, number];
  offset?: [number, number, number];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  autoRotateSpeed?: number;
  animationBindings?: Record<string, string[]>;
}
```

常见调整：

- 模型过大/过小：调 `scale`，但默认先用包围盒归一化；
- 模型躺倒：调 `rotation`，FBX 常见需要绕 X 轴旋转；
- 模型不居中：调 `offset`；
- 相机太近/太远：调 `cameraPosition`；
- 部件没有联动：查看运行时打印的节点名，把真实节点关键字加入 `animationBindings`；
- 模型材质太暗：调环境光、方向光和材质兼容处理，不直接把所有材质强制改成同一颜色。

当前模型加载链路：

1. 前端请求同源 `/api/model-showcase/:sceneId/model`；
2. 后端拒绝上游返回的 JSON 错误内容，只接受通过文件头校验的 FBX/GLB/GLTF；
3. 前端再次检查 HTTP 状态、`Content-Type` 和文件头，再使用 `FBXLoader.parse` / `GLTFLoader.parse`；
4. 成功取得的 `ArrayBuffer` 在浏览器运行期按场景缓存，重新进入页面只重新构建 Three.js 对象，不重复下载；
5. 加载失败时显示后端返回的真实原因，保留可操作的视窗，每 30 秒自动重试，也可手动重试。

因此，“模型窗口存在但没有实体”需要先看错误提示：如果提示存储下载失败或超时，说明上游没有返回模型二进制，不属于 FBXLoader 不支持；如果通过文件校验后仍提示解析失败，才需要检查 FBX 文件版本或模型内部结构。

---

## 8. 模拟智能诊断与故障预测调整说明

### 8.1 系统边界

- 后端表现为独立诊断服务：读取已采集数据，返回结构化结论；
- 当前不加载真实机器学习模型，使用统计特征和设备故障知识构造合理输出；
- 前端不计算诊断，也不展示预测模型，只调用 `/diagnosis` 并展示结果；
- 以后接入真实模型时，只替换 `diagnosticEngine.ts` 内部实现或转发真实模型服务，保持接口结构不变。

### 8.2 配置结构

每个设备集中配置诊断特征和故障知识：

```ts
interface DiagnosticPattern {
  id: string;
  title: string;
  severity: 'attention' | 'warning' | 'critical';
  evidenceFields: string[];
  evaluate: (context: DiagnosticContext) => DiagnosticMatch;
  recommendation: string;
}
```

需要调整诊断逻辑时，只改后端 `diagnosticEngine.ts` 和 `modelCatalog.ts`，不改前端 JSX 布局。

### 8.3 建议诊断方向

| 设备 | 高权重字段 | 主要故障规则 |
|---|---|---|
| 水轮机 | 振动、温度、压力/流量偏离 | 轴系不平衡、轴承过热、水力异常、功率衰减 |
| 污水泵 | 振动、温度、压力-流量组合 | 气蚀、堵塞、叶轮磨损、密封/轴承异常、电机过载 |
| 起重机 | 负载、速度、电机温度、振动 | 超载、驱动/制动异常、定位风险、结构振动 |
| 车辆 2310 | 温度、振动、液压压力、燃油流量 | 发动机过热、液压异常、传动振动、燃油供给异常、动力衰减 |

### 8.4 前端展示边界

前端显示：

- 健康分与风险等级；
- 诊断结论；
- 故障类型、概率和预测窗口；
- 维护建议；
- 置信度和结论生成时间。

前端不显示：模型结构、算法名称、特征工程、权重、规则公式、训练过程和调参控件。

---

## 9. 常用调整入口

| 想调整的内容 | 实际修改位置 |
|---|---|
| 上游服务器地址 | 启动进程环境变量 `VISUAL_MODEL_API_BASE_URL`；未设置时使用 `server.ts` 默认值 |
| 模型 ID/页面标题/菜单 ID | `src/remoteModelShowcase/modelCatalog.ts` + `constants.tsx` |
| “查看资源详情”跳转地址 | `modelCatalog.ts` 各场景的 `sourceDetailUrl`；必须使用固定可信 URL，不接收页面输入 |
| 刷新周期/趋势长度 | `useRemoteModelTelemetry.ts` |
| 资源协同状态轮询周期 | `useModelShowcaseConnection.ts` 的 `CONNECTION_POLL_INTERVAL_MS` |
| 资源协同状态聚合、服务名称和脱敏规则 | `connectionRegistry.ts` |
| 资源协同卡和状态抽屉样式 | `ProjectConnectionMap.tsx`、`ConnectionDetailDrawer.tsx` |
| 正常范围显示 | 默认使用上游字段；必要时在模型目录配置覆盖 |
| 诊断特征/健康度分级 | 后端 `diagnosticEngine.ts` |
| 故障模式/概率/预测窗口/建议文案 | `modelCatalog.ts` 的设备诊断配置 |
| 模型缩放/角度/相机 | `modelCatalog.ts` 的 `viewer` 与 `RemoteModelViewer.tsx` |
| 3D 数据联动 | `RemoteModelViewer.tsx` 的动画循环；细粒度节点绑定可在此扩展 |
| 页面卡片顺序和栅格 | `RemoteModelSimulationView.tsx` |
| 请求超时/缓存/最大文件体积 | `server.ts` 的模型代理配置 |

---

## 10. 本地验证命令

```bash
# 首屏聚合数据
curl http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/bootstrap

# 最新快照
curl http://localhost:3000/api/model-showcase/sim-visual-wastewater-pump/dashboard

# 故障工况
curl -X POST http://localhost:3000/api/model-showcase/sim-visual-bridge-crane/scenario/fault \
  -H "Content-Type: application/json" -d "{}"

# 下载模型并校验文件大小
curl -o hydro-turbine.fbx http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/model

# 生成诊断结论
curl -X POST http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/diagnosis \
  -H "Content-Type: application/json" -d "{}"

# 查看本项目已采集的设备资源协同状态（不会额外请求上游）
curl http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/connection
```

Windows PowerShell 可用 `Invoke-RestMethod`/`Invoke-WebRequest` 执行同等请求。

---

## 11. 已知注意事项

1. 模型 2310 实际为拖车牵引车，不是矿卡；
2. 上游为 HTTP 服务，生产环境必须保持后端代理；
3. 上游 Dashboard 当前包含模拟波动，页面报告也只能作为仿真演示；
4. 四个模型的 `visual_binding` 是自然语言，不保证 FBX 节点可直接匹配；
5. 污水泵 FBX 超过 13 MB，首次打开需要加载进度和缓存；
6. 前端不得在每次 Dashboard 轮询时重新请求模型文件；
7. 如果上游中文出现乱码，应检查上游响应头 charset；本项目代理统一以 UTF-8 JSON 返回；
8. 诊断输出由本项目模拟智能诊断服务构造，用于仿真展示，不等同于生产设备的真实预测模型结论。
9. “查看资源详情”使用 HTTP 外部地址并打开新标签页，只用于人工追溯；详情页失效不会影响 API、缓存、3D 或诊断功能。
10. `/connection` 状态是当前 Node.js 服务进程的运行观测，服务重启后不会保留历史状态。

---

## 12. 实际实现文件索引

| 文件 | 作用 |
|---|---|
| `server.ts` | BFF、超时/错误映射、模型格式校验、二进制运行期缓存、白名单校验和本地接口 |
| `src/remoteModelShowcase/types.ts` | 前后端共用数据结构 |
| `src/remoteModelShowcase/modelCatalog.ts` | 四页面 ID、远端模型 ID、字段权重、故障知识和展示配置 |
| `src/remoteModelShowcase/diagnosticEngine.ts` | 最近 60 个快照、健康度、故障概率、预测窗口和建议输出 |
| `src/remoteModelShowcase/useRemoteModelTelemetry.ts` | 四场景运行期缓存、5 秒轮询、进页刷新、时序累计、失联保持和一致性校验 |
| `src/remoteModelShowcase/connectionRegistry.ts` | 六类资源服务的运行期状态、总体状态聚合、资源就绪标记和错误脱敏 |
| `src/remoteModelShowcase/useModelShowcaseConnection.ts` | 资源协同状态运行期保留、10 秒轮询、失联保留和手动刷新 |
| `components/remote-model-showcase/RemoteModelViewer.tsx` | 模型二进制校验/缓存、FBX/GLB/GLTF 解析、自动重试、居中缩放、资源释放和参数联动 |
| `components/remote-model-showcase/RemoteMetricCard.tsx` | 实时参数、范围和数据来源状态 |
| `components/remote-model-showcase/AssessmentPanel.tsx` | 只展示诊断结论、故障概率、预测窗口和建议 |
| `components/remote-model-showcase/ProjectConnectionMap.tsx` | 模型资源平台 → 安全接入服务 → 业务应用端三节点资源协同卡和资源详情按钮 |
| `components/remote-model-showcase/ConnectionStatusBadge.tsx` | 五种资源同步状态的统一业务文案和样式 |
| `components/remote-model-showcase/ConnectionDetailDrawer.tsx` | 资源服务状态、最近可用时间、异常和资源入口抽屉 |
| `components/remote-model-showcase/DataProvenancePanel.tsx` | 资源平台提供内容与驾驶舱分析生成成果边界 |
| `views/simulation/remote-model/RemoteModelSimulationView.tsx` | 四页面共用布局、趋势图、资源协同、同步状态和资源信息 |
| `views/simulation/remote-model/index.tsx` | 四个轻量页面包装入口 |
| `constants.tsx` / `App.tsx` | 仿真分析前四位菜单及页面路由 |

关键定位（以 2026-08-09 21:35 修复版本为准）：上游地址与限制从 `server.ts:439` 开始，模型下载/校验/服务端运行期缓存位于 `server.ts:603`，六类 BFF 路由位于 `server.ts:699～784`；四模型目录从 `modelCatalog.ts:41` 开始；前端场景运行期缓存从 `useRemoteModelTelemetry.ts:33` 开始，轮询 Hook 从 `useRemoteModelTelemetry.ts:199` 开始；模型二进制浏览器缓存从 `RemoteModelViewer.tsx:17` 开始，3D Viewer 从 `RemoteModelViewer.tsx:117` 开始；诊断入口位于 `diagnosticEngine.ts:121`；共享页面从 `RemoteModelSimulationView.tsx:51` 开始；菜单和路由分别位于 `constants.tsx:135`、`App.tsx:1138`。

## 13. 2026-08-09 联调结果

- 四个 `bootstrap` 接口均返回 200，分别识别模型 2326、2328、2316、2310，字段数为 6、6、5、6；
- 四个模型代理下载字节数与元数据完全一致：7,661,788、13,082,652、3,777,248、6,175,120；
- 水轮机故障工况返回 3 个越限字段，诊断接口输出 `critical`、3 项故障预测，一致性校验返回 100%；
- `npm run build` 成功；本次新增 TypeScript 文件的独立类型检查通过；
- 全项目 `tsc --noEmit` 仍被既有 `components/Maintenance-plan-management/*/three-types.ts` 非法字符错误阻断，本次未修改这些历史文件。

## 14. 2026-08-10 设备资源协同联调结果

- 四页面均接入“资源来源：ICES-Union 3d2.0”“接入服务：模型数据安全接入”、三节点资源协同卡和状态抽屉；
- “查看资源详情”按钮按场景打开模型 2326、2328、2316、2310 的固定详情页，使用 `target="_blank"` 与 `rel="noreferrer noopener"`；
- 独立 3108 测试实例依次完成四场景 `bootstrap`、`model`、`diagnosis` 和 `connection` 请求；
- 四个模型 ID、来源详情 URL 全部匹配，模型字节数仍为 7,661,788、13,082,652、3,777,248、6,175,120；
- 四场景模型通道显示运行期缓存可用，Dashboard 和本地诊断通道显示连接成功；
- 四个连接快照均未出现 `file_url=` 或 `3d_model/` 对象 key；
- 本次相关 TypeScript/TSX 定向类型检查通过，`npm.cmd run build` 通过（5,554 个模块）；
- 全项目类型检查仍仅被既有维护计划 `three-types.ts` 非法字符问题阻断。
