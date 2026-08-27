# 主项目原始 API 说明核对

> 核对日期：2026-08-26  
> 原始文件：`C:\Users\Administrator\Downloads\模型api接口说明文档.md`  
> 文档标题：可视化模型（工业可视化模型）数据接口文档  
> 适用版本：ICES-Union 3d2.0 / `model_category=39`  
> 原文更新日期：2026-08-04  
> 文件大小：38,488 字节  
> SHA-256：`274DC4E6FBAD5FE8090AC496F14873D6FC796B0B31303C4A4E2644DBD5D28F25`

## 1. 阅读结论

原始文档已经完整阅读。项目内的 `外部模型仿真展示方案/API接入与调整说明.md` 是依据该原文形成的实施版，但不是原文副本：它强化了场景库 BFF、缓存、诊断和部署细节，同时省略了部分主项目原始接口能力。

后续扩展应同时使用：

- 原始文档：判断主项目提供了哪些接口和字段；
- 当前场景库代码：判断现有页面实际消费了哪些接口；
- HTTPS 现场只读实测：判断接口、证书、模型文件和数据是否当前可用。

## 2. 原始文档的七类接口

原始 Base URL 写为：

```text
http://8.146.211.204:3100/three-model-api
```

后续部署记录已证明主项目改为只接受 HTTPS，因此当前候选地址应以现场验证过的下列地址为起点：

```text
https://8.146.211.204:3100/three-model-api
```

不得因为原文仍写 HTTP 就把线上环境改回 HTTP。

| 编号 | 主项目接口 | 用途 | 当前场景库覆盖 |
|---:|---|---|---|
| 1 | `GET /api/v1/three-model/models` | 单模型基本信息；也支持分页和 `model_category` 列表过滤 | 已用于单模型元数据；尚未用于分类列表发现 |
| 2 | `GET /api/v1/three-model/models/files?model_id=...` | 获取模型全部文件 | 已覆盖；基本信息没有文件时回退调用 |
| 3 | `GET /api/v1/three-model/models/files?file_url=...` | 下载模型或图片二进制 | 已由 BFF 覆盖；浏览器不接触对象 key |
| 4 | `GET /api/v1/three-model/models/info?model_id=...` | 获取 `info_content` 与 `ai_metadata` | 当前代码未直接调用 |
| 5 | `GET /api/visual-models/{id}/dashboard` | 数字孪生状态、设备、字段、渲染、模板、验收 | 已覆盖，是当前页面核心数据源 |
| 6 | `POST /api/visual-models/{id}/scenario/{type}` | normal/high_load/fault 场景全量数据 | 已覆盖；场景库额外拒绝未知 type |
| 7 | `POST /api/visual-models/{id}/data-sync` | 实际值与理论基准的一致性校验 | 已覆盖汇总展示 |

统一 JSON 包结构为 `code`、`data`、`message`。原文说明无需 JWT 且 CORS 全放行；场景库仍坚持通过 BFF，是为了隐藏对象 key、统一 HTTPS、缓存、超时、格式和错误处理，不应退回浏览器直连。

2026-08-26 现场请求还发现：分类列表模式当前直接返回顶层 `count` 和 `model_list`，没有套用原文所述的 `code/data/message` 包装。单模型、文件、AI 元数据和 Dashboard 调用仍可按各自当前响应处理。若以后在代码中新增列表同步，必须兼容实际列表结构，不能照抄原文统一包装假设。

## 3. 批量扩展最重要的新信息

### 3.1 可通过分类列表发现候选模型

接口 1 不只支持 `model_id`，还支持：

```text
page_num
page_size
model_category
```

本次范围对应 `model_category=39`（工业可视化模型）。收到用户清单后，可用列表接口核对：

- 清单中的 ID 是否仍存在；
- 是否确属工业可视化模型；
- 是否有清单之外但用户随后希望纳入的候选模型。

列表接口只能用于调查，不能自动把全部返回模型加入菜单；实际接入范围仍以用户清单和确认结果为准。

### 3.2 AI 元数据接口可补充自动配置

接口 4 返回 JSON 字符串形式的 `ai_metadata`，包括：

- 行业、可视化类型、2D/3D 维度；
- 4～6 个 bindable fields；
- 正常范围、刷新周期和自然语言 3D 绑定；
- 模型面数和材质数；
- 相机、目标点、自动旋转和背景色；
- normal/high_load/fault 模板；
- 响应和一致性验收配置。

当前场景库通过 Dashboard 获得其中大部分运行形态，因此没有直接调用 `/models/info`。批量接入时，该接口仍可用于预生成目录配置、发现字段和检查 Dashboard 兜底来源，但页面不能把 AI 生成值误写成现场真实测量。

### 3.3 Dashboard 声明具有默认兜底

原文明确说明，当模型没有 `ai_metadata` 或字段缺失时，主项目后端使用 `DEFAULT_METADATA` 提供六个通用字段和标准场景模板，理论上所有工业可视化模型都能得到完整 Dashboard。

这意味着清单模型可以优先尝试完整模板，但实施前仍需逐 ID 验证：

- `code=200` 且 `data` 非空；
- `twin_status`、`equipment`、`bindable_fields` 结构完整；
- 返回设备名与模型元数据不发生错误串用；
- 默认字段与设备业务是否合理；
- 页面是否应明确标注为模拟数据。

若只是机械使用六个通用字段而业务语义不成立，应采用精简展示或为该模型补齐专属 AI 元数据，不能仅因接口有返回就认定内容合格。

## 4. 与当前代码的契约差异

### 4.1 data-sync 明细字段名不一致

原始响应使用：

```json
{
  "fields_comparison": []
}
```

当前 `src/remoteModelShowcase/types.ts` 的 `ConsistencyResult` 声明为：

```ts
fields?: ConsistencyFieldResult[];
```

`server.ts` 当前原样转发 data-sync 结果，没有做字段重命名。现有页面只显示 `overall_consistency_pct` 和 `summary`，因此暂未受影响；如果后续展示逐字段 expected/actual/deviation，必须把共享类型和 UI 改为 `fields_comparison`，或者在 BFF 中显式归一化后再固定本地契约。

### 4.2 未直接消费 AI 元数据接口

当前代码没有请求 `/models/info`。这不是现有四页的功能缺失，因为 Dashboard 已返回页面所需字段；但若要自动化批量生成新模型配置，该接口值得纳入只读调查工具或接入脚本。

### 4.3 场景类型处理更严格

原文称未知 scenario type 会回退到 normal；场景库 BFF 只允许 `normal`、`high_load`、`fault`，未知值返回 400。场景库做法更安全、结果更明确，应继续保持。

### 4.4 下载安全边界更严格

原始文档允许浏览器拿到 `file_url` 后直接下载。当前场景库只允许后端根据已批准模型 ID 读取对象 key，并执行格式、大小、文件头和哈希校验。后续新增模型也必须延续此边界。

### 4.5 数据性质必须明确

原始 Dashboard 明确写明运行值是 AI 基准值上下约 5% 的模拟波动，`data_source` 示例也是 `Modbus TCP (Simulated)`。因此：

- “API ONLINE”只表示接口链路在线；
- Dashboard 值不应描述为真实设备遥测；
- 场景库本地诊断结果也只能作为仿真演示；
- 新页面、导出报告和验收记录需要继续保留数据性质说明。

## 5. 收到模型清单后的原始 API 核验顺序

```text
1. GET  /api/v1/three-model/models?model_category=39&page_num=...&page_size=...
2. GET  /api/v1/three-model/models?model_id=<ID>
3. GET  /api/v1/three-model/models/info?model_id=<ID>
4. GET  /api/v1/three-model/models/files?model_id=<ID>
5. GET  /api/visual-models/<ID>/dashboard
6. POST /api/visual-models/<ID>/scenario/normal
7. POST /api/visual-models/<ID>/scenario/high_load
8. POST /api/visual-models/<ID>/scenario/fault
9. POST /api/visual-models/<ID>/data-sync
10. 通过场景库 BFF 下载所选模型并校验格式、字节数、解析和网格
```

核验过程不得把接口返回的 `file_url`、对象存储 key 或完整错误堆栈写入公开页面和普通日志。

## 6. 对后续开发计划的影响

在原计划的模型目录扩展之外，后续正式开发计划还应包含：

1. 增加工业可视化模型列表和 `/models/info` 的只读调查步骤；
2. 建立“用户清单 ID—分类列表—单模型元数据—Dashboard 设备名”的一致性矩阵；
3. 根据 `ai_metadata` 和 Dashboard 自动生成配置草案，但由人工确认页面标题、字段风险、故障知识和菜单排序；
4. 修正或归一化 `fields_comparison` 类型契约；
5. 明确哪些字段来自主项目 AI 元数据、哪些值来自主项目模拟 Dashboard、哪些结论由场景库本地生成；
6. 保持 HTTPS、BFF、白名单和模型文件安全校验，不照搬原文中的浏览器直连示例。
