# 外部可视化模型 API 接入与调整说明（规划版）

> 状态：规划版，尚未实施。
> 对应计划：[`开发计划.md`](./开发计划.md)。
> 用途：说明远端 API、拟建本地代理、前端数据流和后续可调整位置。实际开发完成后会补充最终文件路径、函数名和行号。

---

## 1. 上游服务

```text
模型详情页: http://8.146.211.204:3100/three-model/detail?id=<modelId>
API Base:   http://8.146.211.204:3100/three-model-api
```

上游接口无需 JWT。虽然文档说明 CORS 已放行，本项目仍计划通过自身后端代理，原因是：统一错误处理、避免 HTTPS 混合内容、保护模型文件 key、支持缓存和避免形成不受控的跨域依赖。

## 2. 场景与模型映射

| 本地场景 ID | 远端模型 ID | 实际模型 | 模型文件 | 文件大小 |
|---|---:|---|---|---:|
| `sim-visual-hydro-turbine` | 2326 | 水轮机总成 | `水轮机总成.fbx` | 7,661,788 B |
| `sim-visual-wastewater-pump` | 2328 | 污水泵 KCM100HD | `污水泵KCM100HD.fbx` | 13,082,652 B |
| `sim-visual-bridge-crane` | 2316 | 桥式起重机 | `crane_08.fbx` | 3,777,248 B |
| `sim-visual-haul-truck` | 2310 | **拖车牵引车** | `拖车牵引车.fbx` | 6,175,120 B |

> 模型 2310 与需求中的“矿卡”名称不一致，必须在开发前确认。调整时只需修改模型目录配置和页面文案，不应在多个组件里散落硬编码模型 ID。

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

## 4. 拟建本地 BFF 接口

前端统一使用本项目地址：

```http
GET  /api/model-showcase/:sceneId/bootstrap
GET  /api/model-showcase/:sceneId/model
GET  /api/model-showcase/:sceneId/dashboard
POST /api/model-showcase/:sceneId/scenario/:type
POST /api/model-showcase/:sceneId/data-sync
```

### 4.1 `bootstrap`

聚合模型基本信息和 Dashboard，避免首屏组件分别发起多次请求。拟返回：

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
- 流式转发二进制；
- 返回正确的 `Content-Type`、`Content-Length`、`Content-Disposition` 和缓存头；
- 不接受任意 URL 或文件 key。

### 4.3 错误响应

建议统一结构：

```json
{
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "模型服务响应超时，请稍后重试",
    "retryable": true
  }
}
```

错误代码至少包括：

- `SCENE_NOT_FOUND`；
- `MODEL_METADATA_EMPTY`；
- `MODEL_FILE_UNSUPPORTED`；
- `UPSTREAM_TIMEOUT`；
- `UPSTREAM_BAD_RESPONSE`；
- `MODEL_STREAM_FAILED`。

### 4.4 环境变量与默认配置

```dotenv
VISUAL_MODEL_API_BASE_URL=http://8.146.211.204:3100/three-model-api
```

可调整项建议集中定义：

```ts
const JSON_TIMEOUT_MS = 10_000;
const MODEL_TIMEOUT_MS = 60_000;
const METADATA_CACHE_TTL_MS = 5 * 60_000;
const DASHBOARD_CACHE_TTL_MS = 1_000;
const MAX_MODEL_BYTES = 50 * 1024 * 1024;
```

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
- 值在两次快照之间做视觉插值，避免数字和模型跳变；
- 历史队列默认保留 60 个快照；
- 页面不可见时暂停，重新可见时立即刷新。

拟调整位置：`useRemoteModelTelemetry.ts`。

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

---

## 8. 健康评估与故障预测调整说明

### 8.1 配置结构

每个设备集中配置字段权重和故障规则：

```ts
interface FaultRule {
  id: string;
  title: string;
  severity: 'attention' | 'warning' | 'critical';
  evidenceFields: string[];
  evaluate: (context: AssessmentContext) => boolean;
  recommendation: string;
}
```

需要调整诊断逻辑时，只改 `riskAssessment.ts` 和 `modelCatalog.ts`，不改 JSX 布局。

### 8.2 建议权重方向

| 设备 | 高权重字段 | 主要故障规则 |
|---|---|---|
| 水轮机 | 振动、温度、压力/流量偏离 | 轴系不平衡、轴承过热、水力异常、功率衰减 |
| 污水泵 | 振动、温度、压力-流量组合 | 气蚀、堵塞、叶轮磨损、密封/轴承异常、电机过载 |
| 起重机 | 负载、速度、电机温度、振动 | 超载、驱动/制动异常、定位风险、结构振动 |
| 车辆 2310 | 温度、振动、液压压力、燃油流量 | 发动机过热、液压异常、传动振动、燃油供给异常、动力衰减 |

### 8.3 免责声明

页面必须显示类似文案：

> 本评估根据可视化模型接口的模拟运行参数与规则阈值推演生成，仅用于功能展示，不代替设备检验、专业诊断或安全决策。

---

## 9. 常用调整入口

| 想调整的内容 | 规划中的修改位置 |
|---|---|
| 上游服务器地址 | `.env.local` 的 `VISUAL_MODEL_API_BASE_URL` |
| 模型 ID/页面标题/菜单 ID | `src/remoteModelShowcase/modelCatalog.ts` + `constants.tsx` |
| 刷新周期/趋势长度 | `useRemoteModelTelemetry.ts` |
| 正常范围显示 | 默认使用上游字段；必要时在模型目录配置覆盖 |
| 风险权重/健康度分级 | `riskAssessment.ts` |
| 故障模式/建议文案 | `modelCatalog.ts` 的设备诊断配置 |
| 模型缩放/角度/相机 | `modelCatalog.ts` 的 `viewerTuning` |
| 3D 节点绑定 | `animationBindings` |
| 页面卡片顺序和栅格 | `RemoteModelSimulationView.tsx` |
| 请求超时/缓存/最大文件体积 | `server.ts` 的模型代理配置 |

---

## 10. 本地验证命令（实施后使用）

```bash
# 首屏聚合数据
curl http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/bootstrap

# 最新快照
curl http://localhost:3000/api/model-showcase/sim-visual-wastewater-pump/dashboard

# 故障工况
curl -X POST http://localhost:3000/api/model-showcase/sim-visual-bridge-crane/scenario/fault \
  -H "Content-Type: application/json" -d "{}"

# 模型响应头，不下载完整文件
curl -I http://localhost:3000/api/model-showcase/sim-visual-hydro-turbine/model
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
8. 实施完成后，本说明会追加实际文件路径、函数名、行号和最终调参示例。
