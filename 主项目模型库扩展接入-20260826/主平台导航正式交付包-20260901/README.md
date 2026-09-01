# 主平台导航正式交付包

> 交付日期：2026-09-01（Asia/Shanghai）
> 对应场景库 Release：`20260901-093430`
> 正式菜单版本：`20260901-093430`

本目录用于解除主项目团队反馈的“正式 manifest 缺失”阻塞。`scene-library-menu.manifest.json` 是场景库仓库正式文件的字节级副本，不是重新推算或从生产 bundle 逆向提取的替代文件。

## 文件

| 文件 | 用途 | SHA-256 |
|---|---|---|
| `scene-library-menu.manifest.json` | 替换主平台旧的 1,049 节点菜单快照 | `73da22e4f3fc9e3f0673461e11e07263d3b1e8a174c76009380db100a600850c` |
| `scene-library-model-allowlist.json` | 将宿主页模型详情白名单更新到 106 个有效且唯一的模型 | `22d0e7e952b5f9383179bdf809bd331114c43232e87ac3fbed6e253e6c32bce3` |
| `SHA256SUMS.txt` | Linux/macOS/Windows 校验依据 | — |

## manifest 验收值

`schemaVersion=1.0`、`menuVersion=20260901-093430`、根节点 20、总节点/唯一 viewId 1,050、包含 `eq-unit1-model`，`menuContentSha256=d664531146fd033c7b0a23bda35f997e7adfe1396a7e7d58536dc6334b5d9abf`。

## 主平台接入

1. 将正式 manifest 放到主平台 `src/views/sceneLibrary/scene-library-menu.manifest.json`，完整替换旧文件；
2. 保留现有 `config.ts` 的 manifest 驱动 `isKnownViewId`；
3. 保留菜单模块的 20 个“首页”合成逻辑；
4. 在宿主页导入白名单 JSON，生成现有字符串键 Map：

```ts
import modelAllowlist from './scene-library-model-allowlist.json';

const ALLOWED_MODELS = new Map(
  modelAllowlist.items.map((item) => [String(item.modelId), item.modelName]),
);
```

5. 继续校验 `event.source`、动态 Origin、`protocolVersion=1.0`、`target.path=/three-model/detail`、模型 ID 和名称；不得通过删除安全校验绕过白名单更新；
6. 正式构建并按《主项目导航栏更新列表与发布说明》执行 1,071 条主平台菜单记录、query、iframe、详情跳转和整体回滚验收。

## 在线原文件

正式 manifest 同时可从场景库 GitHub 主分支直接下载：

`https://raw.githubusercontent.com/zafkiel333/industrial-intelligent-cockpit/main/%E4%B8%BB%E5%B9%B3%E5%8F%B0%E7%BB%9F%E4%B8%80%E5%AF%BC%E8%88%AA%E6%8B%86%E5%88%86%E6%96%B9%E6%A1%88-20260820/scene-library-menu.manifest.json`

下载后仍须核对文件 SHA-256 为 `73da22e4f3fc9e3f0673461e11e07263d3b1e8a174c76009380db100a600850c`。
