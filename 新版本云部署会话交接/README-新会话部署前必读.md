# 场景库新版本云部署：新会话接手说明

> 文档用途：把本文件交给一个全新的 AI 会话，使其快速理解本项目的部署目标、服务器现状、用户操作偏好、安全边界和标准发布流程。  
> 初次编写：2026-08-19；最近更新：2026-08-20
> 项目目录：`C:\Users\Administrator\Desktop\NLP_Proj\industrial-intelligent-cockpit`  
> 重要原则：本文记录的是“最后一次已知状态”，新会话必须先做只读核查，不能把旧状态当成当前事实直接切换生产版本。
> 进度来源：每次接手还必须读取本文件夹中日期最新的 `云端更新执行记录-*.md`；只有其中有命令输出证据的阶段才算已经完成。

---

## 1. 可以直接复制给新会话的第一条消息

```text
请先完整阅读：
新版本云部署会话交接/README-新会话部署前必读.md
以及同一文件夹中日期最新的“云端更新执行记录-*.md”。

然后按照文档接手本项目的新版本部署。请遵守以下交互方式：

1. 先只读检查本地仓库和服务器现状，不要立即修改生产环境。
2. 我是部署初学者，请一次只给我一个阶段的一段 PowerShell 命令，并说明这一步做什么、成功时应看到什么。
3. 每一步都等待我粘贴执行结果，再判断是否进入下一步；不要一次发完整套命令让我盲目执行。
4. 我只想在本机 PowerShell 中操作，不进入服务器的交互式命令行。远程操作请使用 ssh "远程命令"。
5. 使用现有 SSH 私钥免密登录，不要让我重复输入密码；不得在命令、文档或聊天中记录密码、私钥正文。
6. 构建、上传、远端安装、切换和验证必须分开。切换生产版本之前先明确告诉我，并再次检查回滚目标。
7. 不要部署、登录或修改主平台服务器 8.146.211.204；主平台由另一团队负责。本次只部署场景库服务器 47.122.104.52。
8. 不要擅自运行 git reset、git clean、git checkout、git stash，不要覆盖或删除我当前未提交的改动。
9. 发现任何信息和本文不一致时，以现场只读检查结果为准，先解释差异，再继续。
10. 每完成一个本地发布或云端阶段，立即更新本次“云端更新执行记录”文件；不得把“本地已构建”写成“云端已更新”。
```

---

## 1.1 2026-08-20 本次待发布版本：主平台统一导航拆分

本节是本次部署最重要的新范围。当前状态是：**场景库侧开发和本地构建验证已完成，但尚未上传、安装或切换到云端。**

目标效果：

- 主平台中只有“场景库”是一级导航；
- 本项目原导航栏中的所有项目，整体下沉为主平台“场景库”的下一级及更深层菜单；
- 由主平台提供统一导航时，本项目只显示右侧业务内容，不显示自己的左侧导航栏；
- 主平台 iframe 应使用 `?embedded=1&viewId=<页面ID>` 打开指定页面；
- `embedded=1` 表示集成显示模式，`viewId` 表示目标业务页面；
- `viewId` 会严格校验。合法值打开对应页面；缺失或非法值回退默认页，并留下可诊断标记/警告，不执行任意 URL 跳转；
- 用户直接访问 `/cockpit/` 且没有 `embedded=1` 时，仍保留本项目原导航栏，作为独立运行和故障排查入口；
- 既有“查看模型详情”跨项目通信协议 `scene-library:navigate` 必须继续保留，不能因拆导航而破坏；
- 主平台菜单代码和主平台部署由对方团队完成，本次只能发布场景库服务器，不能把场景库上线误称为双方联调完成。

本次新增或修改的核心文件：

```text
App.tsx
index.tsx
src/integration/menu.ts
src/integration/launchOptions.ts
scripts/generate-scene-library-menu.ts
scripts/verify-navigation-split.ts
tsconfig.navigation.json
package.json
主平台统一导航拆分方案-20260820/scene-library-menu.manifest.json
```

当前开发态菜单清单：

```text
一级菜单节点：20
总节点：1049
menuVersion：dev-46e7605-dirty
menuContentSha256：b7de7be4e41977d0e9fdfc75c204ff93086d4a33b57f9c33e0351cd1fa05b021
```

开发态清单不能直接当作正式交付版本。正式打包时要使用最终 Release ID 重新生成清单，并记录新版本号和哈希。

本次浏览器验收至少包括：

```text
/cockpit/                                      独立模式，仍显示本项目导航栏
/cockpit/?embedded=1&viewId=smart-ops          集成模式，隐藏本项目导航栏并打开一级业务页
/cockpit/?embedded=1&viewId=eq-0               集成模式，隐藏本项目导航栏并打开叶子页面
/cockpit/?embedded=1&viewId=<不存在的ID>       安全回退默认页，不白屏、不跳往任意地址
```

主平台侧最终还要验证：主平台“场景库”菜单层级、iframe URL 参数、菜单点击切页、刷新恢复，以及原模型详情跨项目跳转。主平台若尚未发布其适配代码，场景库侧只能完成独立 URL 验收。

2026-08-21 最新状态：场景库 Release `20260821-112458` 已上线，回滚版本为 `20260821-085852`。本版完成三类更新：303 个目标 Three.js 场景统一工业蓝灰背景并修复部分主平台容器自适应问题；维修计划管理前十页重做为数字化维修计划工作台；计算机视觉监测 6 类页面改用与业务一致的本地巡检图片并清除随机远程图源。双构建、导航/HTTPS/专项验证、3103 独立端口预检、现网 HTTPS/HTTP、独立版、微应用版、主 JS、API 以及 12 个图片端点均通过。详细证据见 `云端更新执行记录-20260821-综合视觉与维修计划.md`。此前模型详情消息 Origin 的主平台热修及分类“首页”子菜单整改仍待主平台团队完成。

---

## 2. 用户真正想要的协作方式

用户不是要求 AI 在后台一次性完成部署，而是希望 AI 像一位谨慎的运维工程师一样逐步引导。

每轮应采用下面的格式：

```text
当前阶段：本地构建前检查

这一步的目的：确认本次要发布的代码和依赖状态。

请在当前 PowerShell 执行：
<一段可以整体复制的命令>

成功时应看到：
<简短说明>

执行后请把完整输出发给我，我再给下一步。
```

必须遵守：

- 一次只推进一个阶段；
- 先解释，再给命令；
- 命令应适用于 Windows PowerShell；
- 不让用户进入 `root@server:~#` 形式的交互式 SSH 会话；
- 多行 Linux 操作用 PowerShell 生成 UTF-8 Base64，再通过一次 SSH 调用交给远端 Bash；
- 用户贴回输出后必须实际分析，不要机械地回复“成功”；
- 任何生产切换都要有切换前检查、失败回滚和切换后验证。

---

## 3. 项目和两台服务器的责任边界

### 3.1 本次允许部署的服务器

| 项目 | 当前已知值 |
|---|---|
| 场景库云服务器 | `47.122.104.52` |
| SSH 用户 | `root` |
| 主平台嵌入用 HTTPS 入口 | `https://47.122.104.52` |
| 兼容保留的 HTTP 入口 | `http://47.122.104.52:8081` |
| 独立版入口 | `/cockpit/` |
| 微应用入口 | `/microapps/scene-library/` |
| 微应用 JS | `/microapps/scene-library/scene-library.js` |
| API 前缀 | `/scene-library-api/` |
| API 健康检查 | `/scene-library-api/health` |
| Express 内部监听 | `127.0.0.1:3102` |
| systemd 服务 | `scene-library.service` |
| 运行用户/组 | `cockpit:cockpit` |

### 3.2 不属于本次部署范围的服务器

主平台地址：

```text
https://8.146.211.204:3100
```

主平台由另一团队开发和部署。没有明确新增授权时，新会话不得：

- 尝试 SSH 登录主平台；
- 为主平台配置免密登录；
- 修改或发布主平台代码；
- 修改主平台 Nginx；
- 把“场景库部署完成”等同于“主平台适配代码已经发布”。

本次任务只更新场景库服务器。上线后可以从浏览器验证主平台是否仍能加载场景库，但这只是联调验证，不是修改主平台。

---

## 4. 当前已知的生产基线

2026-08-21 Release `20260821-112458` 成功切换并完成技术验收后：

```text
current  → /nlplabProj/scene-library/releases/20260821-112458
previous → /nlplabProj/scene-library/releases/20260821-085852
```

健康检查返回：

```json
{"status":"ok","version":"20260821-112458"}
```

当时确认：

- `scene-library.service` 为 `active`、`enabled`；
- Nginx 配置检查通过；
- `127.0.0.1:3102/api/health` 正常；
- `127.0.0.1:8081/scene-library-api/health` 正常；
- `/cockpit/`、`/microapps/scene-library/` 和 `scene-library.js` 可访问；
- `www/cockpit` 和 `www/microapps/scene-library` 通过软链接跟随 `current`；
- 旧版本保留在独立 release 目录中，可快速回滚。

这些只是历史事实。新会话第一轮必须重新核查，因为后续部署或人工操作都可能使其变化。

---

## 5. 服务器真实目录，不要使用旧文档中的 `/opt` 示例

当前生产结构是：

```text
/nlplabProj/scene-library/
├─ releases/
│  ├─ 20260817-154326/
│  ├─ 20260818-144540/
│  └─ <本次新版本>/
├─ current  → 当前运行的 release
├─ previous → 上一次可回滚 release
├─ shared/
│  ├─ data/
│  ├─ model-cache/
│  └─ npm-cache/
└─ www/
   ├─ cockpit → /nlplabProj/scene-library/current/dist-standalone
   └─ microapps/scene-library → /nlplabProj/scene-library/current/dist-microapp
```

其他关键位置：

```text
/etc/scene-library-next.env
/etc/systemd/system/scene-library.service
/etc/nginx/sites-enabled/cockpit
/etc/nginx/snippets/scene-library.conf
```

旧文档中如果出现下面路径，不得直接照抄：

```text
/opt/scene-library
/var/www/cockpit
/etc/scene-library.env
```

应以本节列出的 `/nlplabProj/scene-library` 结构和现场 `readlink`、`systemctl cat`、Nginx 配置为准。

---

## 6. 当前本地工作区的特殊风险

2026-08-20 最后核对时，本地工作区包含本次导航拆分的已修改和未跟踪文件，尚未形成正式发布提交。较早一次工具核查曾显示 `.claude/` 为未跟踪目录，用户随后亲自执行的 `git status --short` 未再列出它；无论它是否被本机忽略，都与本次功能无关，不得自动纳入发布、删除或修改。新会话不能自行决定提交或清理这些内容。

必须先执行只读检查：

```powershell
git status --short
git branch --show-current
git log -5 --oneline
git diff --stat
git diff --check
git diff -- package.json package-lock.json server.ts
```

当前最后已知 Git 提交（2026-08-20 本地只读核对结果）：

```text
46e7605c8c6f1102fdeb6aba1a7984b2e1b062ba 外观修改基本完成，准备拆导航栏
```

上一个已知线上版本 `20260818-144540` 对应的是更早的代码状态，不能因为当前分支在 `46e7605` 就认为导航拆分已经上线。

处理规则：

- 不得因为工作区不干净而擅自清理；
- 不得擅自提交或推送；
- 不得认为只有 Git commit 中的内容才是用户想发布的内容；
- 应向用户说明本次产物会包含哪些未提交修改；
- 最理想做法是测试通过后由用户确认是否先提交，再生成正式发布包；
- 如果用户明确要求部署当前未提交快照，也可以继续，但要在发布记录中注明基准 commit 和 `dirty` 状态。

---

## 7. 当前构建和运行方式

`package.json` 中的重要脚本：

```text
npm run typecheck
npm run typecheck:navigation
npm run verify:navigation
npm run generate:menu-manifest
npm run build:standalone
npm run build:microapp
npm run build:all
npm start
```

构建结果：

```text
dist-standalone/   独立运行版，公开在 /cockpit/
dist-microapp/     集成产物，公开在 /microapps/scene-library/
```

当前默认构建路径已在 `vite.config.ts` 中定义：

```text
standalone public base: /cockpit/
microapp public base:   /microapps/scene-library/
API base:               /scene-library-api/
```

本次导航拆分发布的硬性检查顺序：

```powershell
npm ci
npm run typecheck:navigation
npm run verify:navigation
npm run build:all
```

截至 2026-08-20，上述三个导航专项检查/构建已经在本地通过。正式发布前仍需以最终工作区重新执行。

全项目 `npm run typecheck` 当前会被 7 个历史遗留的 `three-types.ts` 非法字符错误阻塞，涉及 `CoolingWaterSystemCleaning`、`DamSeepageMonitoring`、`ExcitationSystemUpgrade`、`GeneratorRotorReplacement`、`GovernorSystemCalibration`、`HydraulicHoistMaintenance`、`HydrologicalStationCalibration`。这些错误不是本次导航拆分引入。发布前仍应运行全量检查并记录原始结果，但不得把历史问题误报成本次回归，也不得为部署导航功能擅自扩大范围修复无关页面。

新会话还应先检查 `package.json` 和 `package-lock.json` 是否匹配。如果本次只修改了 `package.json` 却未同步锁文件，必须先解释并修正依赖状态，不能直接假定 `npm ci` 一定正确。

---

## 8. 本次发布包不能盲目复用旧清单

当前代码相较上次部署出现了新的运行依赖：

- `package.json` 的本地 `dev`/`start` 脚本使用 `scripts/run-tsx.mjs`，但 2026-08-20 现场核对确认生产 systemd 不调用 npm 脚本，而是直接执行 `node_modules/tsx/dist/cli.mjs server.ts`；
- `server.ts` 会导入 `src/remoteModelShowcase/` 下的模块。

所以，发布包至少需要重新核对：

```text
dist-standalone/
dist-microapp/
server.ts
package.json
package-lock.json
scripts/run-tsx.mjs
src/remoteModelShowcase/
```

这不是永远固定的清单。打包前要检查：

```powershell
rg -n '^import .* from "\./|^import .* from ''\./' server.ts src\remoteModelShowcase
Get-Content package.json
```

如果后端又增加了新的本地模块、配置模板、运行时 JSON 或其他资源，必须加入发布包。

`src/integration/` 下的导航协议源码会编译进两套前端产物，当前不是服务器运行时单独读取的目录。正式发布包以构建后的 `dist-standalone/`、`dist-microapp/` 为准。菜单清单 JSON 是交付主平台团队的协作产物，不应被误当作后端运行依赖；是否同时归档进发布包必须明确记录。

云端切换前的独立端口启动检查必须先读取 `systemctl show scene-library.service --property=ExecStart`，然后复用现场真实启动方式。当前真实命令是 `/usr/bin/node <current>/node_modules/tsx/dist/cli.mjs <current>/server.ts`。不要在 Linux 冒烟检查中改用 `scripts/run-tsx.mjs`：该脚本是为部分 Windows/受限账户环境增加的兼容入口，其 `tsx/esm/api` 调用在现场 Node `v22.23.2` 下会给 `node:` 内置模块附加 namespace 查询参数并失败；这不代表 systemd 所用的 tsx CLI 入口失败。

在正式构建前，用最终 Release ID 重新生成主平台菜单清单：

```powershell
npm run generate:menu-manifest -- --menu-version=$ReleaseId
```

然后记录清单的 `sourceCommit`、`sourceDirty`、`menuContentSha256` 和文件 SHA-256，并把正式清单交付主平台团队。若代码或菜单再变更，必须生成新的 Release ID 和新清单。

发布包不得包含：

- `.git/`；
- 本地 `node_modules/`；
- 私钥；
- `.env` 中的秘密；
- 与运行无关的大型临时文件；
- 旧的 `dist` 和本次构建产物混杂内容。

建议发布 ID 格式与现网保持一致：

```powershell
$ReleaseId = Get-Date -Format 'yyyyMMdd-HHmmss'
$Package = "scene-library-release-$ReleaseId.tar.gz"
```

同一个发布 ID 对应的包生成后不得原地修改。内容变化就生成新的发布 ID。

---

## 9. SSH 免密登录要求

用户已经在 2026-08-18 成功验证公钥认证：

```text
KEY_AUTH_OK
```

验证命令的形式是：

```powershell
ssh -i "$KeyPath" `
  -o IdentitiesOnly=yes `
  -o PreferredAuthentications=publickey `
  -o PasswordAuthentication=no `
  root@47.122.104.52 "echo KEY_AUTH_OK"
```

注意：`$KeyPath` 是用户本机已有私钥的路径变量，私钥正文不在本文保存。

新会话应该：

1. 先询问或帮助用户确认当前 `$KeyPath`；
2. 使用 `Test-Path -LiteralPath $KeyPath` 检查文件存在；
3. 使用上面的 `PasswordAuthentication=no` 命令验证；
4. 验证成功后，后续所有 `ssh` 和 `scp` 都显式使用 `-i "$KeyPath" -o IdentitiesOnly=yes`。

新会话不得：

- 要求用户把私钥内容贴进聊天；
- 把密码写进 PowerShell 命令；
- 使用第三方明文密码工具；
- 因为忘记 `$KeyPath` 就立即重新生成密钥；
- 未经用户同意修改服务器 `authorized_keys`；
- 把场景库免密密钥安装到主平台服务器。

如果原密钥确实找不到，应停下来说明情况，再由用户决定是否重新建立密钥，而不是绕过认证安全。

---

## 10. 标准部署阶段

新会话应按下面阶段推进。每个阶段结束都等待用户粘贴输出。

### 阶段 1：本地只读核查

目标：确认工作区、分支、修改范围、Node/npm 版本、磁盘空间以及本次要发布的代码。

不得修改 Git 状态。发现大量 dirty 文件时先汇总，不要清理。

### 阶段 2：确认本次发布内容

目标：让用户明确：

- 是发布当前工作区，还是先提交；
- 本次新增功能是什么；
- 哪些页面需要重点验收；
- 是否仍需同时生成 standalone 和 microapp 两套产物。

如果从项目现状可以确定两套产物都仍在生产目录中，默认继续构建两套，但应向用户说明。

### 阶段 3：依赖、类型检查和构建

推荐顺序：

```text
npm ci
npm run typecheck:navigation
npm run verify:navigation
npm run build:all
npm run typecheck（全量诊断；若仍只有本文记录的 7 个历史错误，原样记录）
```

构建失败时停在本地解决，绝不上传失败产物。

### 阶段 4：本地产物核查

至少检查：

- `dist-standalone/index.html` 存在；
- standalone HTML 引用 `/cockpit/` 下的资源；
- `dist-microapp/index.html` 存在；
- `dist-microapp/scene-library.js` 存在；
- microapp HTML 引用 `/microapps/scene-library/`；
- API 路径为 `/scene-library-api/`；
- 不意外泄露本地绝对路径或秘密；
- 与本次功能有关的关键文本/协议确实进入构建产物。
- 构建产物包含 `embedded`、`viewId` 页面定位逻辑；
- 构建产物仍包含 `scene-library:navigate` 模型详情跳转协议；
- 不能仅凭关键字存在判定成功，还需在切换后完成四个 URL 的浏览器验证。

不要把旧版本固定的 hash 文件名写死，例如不要继续寻找旧的 `index-B7OWG8h6.js`。应从本次 `index.html` 动态读取当前资源名。

### 阶段 5：生成包、列出内容并计算 SHA-256

目标：生成唯一命名的 `scene-library-release-<RELEASE_ID>.tar.gz`。

必须使用仓库脚本生成，不能再手写不完整的 tar 清单：

```powershell
$ReleaseId = Get-Date -Format 'yyyyMMdd-HHmmss'
& .\scripts\create-release-package.ps1 -ReleaseId $ReleaseId
```

`server.ts` 在生产运行时直接导入 `src/remoteModelShowcase`。因此发布包除双构建产物、`server.ts` 和 npm 清单外，还必须包含该目录。只打包 `dist` 与单独一个 `server.ts` 会在新 Release 启动时出现 `ERR_MODULE_NOT_FOUND`，不得切换生产。

生成后必须：

- 用 `tar -tzf` 检查关键文件；
- 确认没有顶层多包一层错误目录；
- 计算 `Get-FileHash -Algorithm SHA256`；
- 记录包大小、Release ID、Git commit 和 dirty 状态。
- 确认输出包含 `SERVER_RUNTIME_SOURCES_INCLUDED`。

### 阶段 6：验证 SSH 密钥并读取远端基线

先验证 `KEY_AUTH_OK`，再使用一次非交互式 SSH 做只读检查：

```text
readlink -f current
readlink -f previous
systemctl is-active/is-enabled
读取环境文件中的 HOST、PORT、APP_VERSION、RELEASE_VERSION
直接访问 3102 健康检查
检查两个 www 软链接
检查磁盘空间
nginx -t
```

如果现场基线不是本文的 `20260818-144540`，停止并解释差异。不得把 `previous` 盲目指向文档中的旧版本。

### 阶段 7：上传到 `/tmp` 并在服务器复核 SHA-256

上传形式：

```powershell
scp -i "$KeyPath" -o IdentitiesOnly=yes `
  ".\$Package" `
  "root@47.122.104.52:/tmp/$Package"
```

上传后先校验远端 SHA-256，不能直接解压。

### 阶段 8：安装新 release，但不切换

新目录：

```text
/nlplabProj/scene-library/releases/<RELEASE_ID>
```

要求：

- 目标目录必须原先不存在；
- 由 `cockpit:cockpit` 持有；
- 解压后检查前端入口、后端代码、启动脚本和后端本地模块；
- 使用共享 npm 缓存执行 `npm ci`；
- 以 `cockpit` 用户安装依赖；
- 检查 `node_modules/.bin/tsx` 或当前 service 所使用的启动文件；
- 这一阶段不得改变 `current`；
- 安装失败时线上旧版本必须继续运行。

历史上使用过的共享缓存：

```text
/nlplabProj/scene-library/shared/npm-cache
```

### 阶段 9：切换前预检

至少确认：

- `current` 仍指向原线上版本；
- 新 release 关键文件完整；
- 新旧 `package-lock.json` 的差异已被理解；
- tsx 能启动/显示版本；
- Nginx 配置通过；
- 旧服务仍为 active；
- 旧健康接口仍正常；
- 已明确记录 `OLD_RELEASE`；
- 回滚脚本会恢复 `OLD_RELEASE` 和旧 `APP_VERSION`。

### 阶段 10：生产切换

这是生产变更点。执行前应明确告诉用户：

```text
下一步会切换线上版本并重启 scene-library.service；脚本已包含失败自动回滚。
```

远端脚本应使用：

```bash
set -Eeuo pipefail
```

并包含：

1. 现场解析旧 `current`；
2. 把 `previous` 指向现场旧 `current`；
3. 更新 `/etc/scene-library-next.env` 中的版本标识；
4. 原子更新 `current` 到新 release；
5. 检查两个 `www` 软链接仍跟随 `current`；
6. 重启 `scene-library.service`；
7. 检查 active 和内部健康接口版本；
8. 检查 Nginx 页面、JS 和公开健康接口；
9. 任何一步失败都恢复旧 `current`、旧环境版本并重启旧服务。

为了让用户始终停留在本机 PowerShell，可使用：

```powershell
$RemoteScriptB64 = [Convert]::ToBase64String(
  [Text.Encoding]::UTF8.GetBytes($RemoteScript)
)

ssh -i "$KeyPath" -o IdentitiesOnly=yes root@47.122.104.52 `
  "echo $RemoteScriptB64 | base64 -d | bash"
```

不要在 Base64 脚本中包含密码或私钥。Base64 只是传输编码，不是加密。

### 阶段 11：切换后技术验收

正确结果至少包括：

```text
current  → 新 release
previous → 切换前的真实 OLD_RELEASE
scene-library.service = active
内部 health.version = 新 Release ID
公开 health.version = 新 Release ID
https://47.122.104.52/cockpit/ = HTTP 状态码 200
standalone 当前 JS（HTTPS）= HTTP 状态码 200
https://47.122.104.52/microapps/scene-library/ = HTTP 状态码 200
https://47.122.104.52/microapps/scene-library/scene-library.js = HTTP 状态码 200
http://47.122.104.52:8081/cockpit/ = HTTP 状态码 200（兼容入口）
```

还要检查：

- `127.0.0.1:3102` 仍只监听回环地址；
- `3102` 没有暴露为 `0.0.0.0:3102`；
- systemd 日志没有启动异常；
- Nginx error log 没有新错误；
- 持久化数据和模型缓存目录仍存在且未被 release 覆盖。

### 阶段 12：浏览器业务验收

技术健康不代表业务一定正确。应让用户在浏览器验证：

- 场景库主页能打开；
- 本次修改的页面和功能正确；
- 数据上传、模型数据或三维资源按本次变更范围正常；
- 从主平台进入场景库仍正常；
- 独立访问 `/cockpit/` 时本项目导航栏仍存在；
- 使用 `embedded=1&viewId=smart-ops` 时本项目导航栏隐藏，页面内容正确；
- 使用合法叶子 `viewId` 时能直接打开对应页面；
- 使用非法 `viewId` 时安全回退且不白屏；
- 主平台中只有“场景库”是一级入口，本项目原菜单整体位于其下级；
- 涉及模型详情跳转时，主平台内标签开启和关闭两种状态符合预期；
- 浏览器强制刷新后仍正常；
- 控制台没有新增严重错误。

本次具体新增功能应根据 `git diff` 补充为验收清单，不能只重复上次的模型详情跳转测试。

### 阶段 13：发布记录和清理

记录：

- Release ID；
- Git commit；
- 工作区是否 dirty；
- 发布包 SHA-256；
- 原版本和新版本；
- 发布时间；
- 技术验证结果；
- 业务验证结果；
- 回滚目标。
- 正式菜单清单版本、内容哈希、文件哈希以及交付主平台的时间；
- `新版本云部署会话交接/云端更新执行记录-<日期>-<主题>.md` 中对应阶段的证据。

只有用户确认新版本稳定后，才可以询问是否删除 `/tmp` 中的上传包。不要自动删除旧 release，不要自动清空共享缓存或持久化数据。

---

## 11. 回滚要求

发生以下任一情况，应优先回滚：

- service 无法启动；
- 健康接口版本不正确；
- Nginx 入口返回 5xx；
- 前端入口引用不存在的资源；
- 关键业务页面无法使用；
- 数据读取或模型资源出现明显回归；
- 新版错误持续且无法在短时间内安全修复。

回滚目标不能写死为 `20260817-154326` 或 `20260818-144540`，必须使用切换前现场记录的 `OLD_RELEASE`。

回滚后必须再次验证：

```text
current = OLD_RELEASE
service = active
内部/公开健康版本 = OLD_VERSION
独立版和集成入口可访问
关键业务恢复
```

代码回滚不等于数据回滚。不得删除或恢复 `shared/data`、`shared/model-cache`，除非有单独的数据恢复方案和用户明确授权。

---

## 12. 禁止事项

新会话不得执行或建议用户盲目执行：

- `git reset --hard`；
- `git clean -fd`；
- 覆盖当前工作区；
- 在生产 `current` 目录中逐文件覆盖；
- 删除整个 `/nlplabProj/scene-library`；
- 删除 `shared/data` 或 `shared/model-cache`；
- 使用未解析的空变量执行递归删除或移动；
- 在没有 `nginx -t` 的情况下 reload Nginx；
- 在未记录旧版本的情况下切换 `current`；
- 失败后只说“重试”，却不检查日志或回滚；
- 把私钥、密码、Token、完整环境文件输出到聊天；
- 修改主平台服务器；
- 将旧 qiankun 文档当成当前 iframe 集成事实；
- 因为发布成功就宣称主平台配套开发一定完成。

---

## 13. 新会话第一轮建议只做什么

第一轮不要构建，也不要连接服务器做写操作。建议先：

1. 读取本文；
2. 读取 `package.json`、`vite.config.ts`、`server.ts` 和 `scripts/run-tsx.mjs`；
3. 查看 `git status`、`git diff --stat` 和最近提交；
4. 查看后端相对导入，确认运行包依赖；
5. 向用户汇报本次待发布变更规模和发现的风险；
6. 给出“本地构建前检查”这一段命令；
7. 等待用户输出。

如果用户只说“开始部署”，也不要跳过上述核查。

---

## 14. 可参考但不能盲目照抄的项目资料

以下资料有助于理解历史和架构：

```text
跨项目门户集成方案/云部署Git版本控制与应用更新技术初学者进阶指南-20260818.md
跨项目门户集成方案/项目集成与跨项目跳转初学者说明-20260818.md
跨项目门户集成方案/主项目微前端集成与运维交付手册-20260817.md
跨项目门户集成方案/本项目服务器端前后端部署指导.md
主平台统一导航拆分方案-20260820/00-方案总览与文档交付清单.md
主平台统一导航拆分方案-20260820/04-菜单清单与页面定位协议.md
主平台统一导航拆分方案-20260820/06-修改日志.md
主平台统一导航拆分方案-20260820/scene-library-menu.manifest.json
```

但要特别注意：

- 旧资料可能记录过 qiankun 方案，当前实际主平台集成已改为 iframe；
- 旧资料可能使用 `/opt/scene-library` 示例，当前生产使用 `/nlplabProj/scene-library`；
- 旧资料记录的构建文件清单可能不包含本次新增的 `scripts/` 和后端源码模块；
- 旧资料记录的版本号只是历史版本；
- 所有生产判断必须以现场只读检查为准。

---

## 15. 最终完成标准

只有同时满足下面条件，才能告诉用户“本次部署完成”：

- 导航专项类型检查、导航协议验证和两套构建通过；全量类型检查结果已如实记录；
- 发布包内容和 SHA-256 已核验；
- 新 release 独立安装成功；
- `current` 指向新版本；
- `previous` 指向切换前的真实旧版本；
- systemd、内部 API、Nginx API、两套前端入口均正常；
- 新版关键业务功能经浏览器验证；
- 没有改动主平台服务器；
- 回滚路径仍有效；
- 发布记录完整；
- 本次云端更新执行记录已逐阶段补全，能明确区分本地、上传、安装、切换和验收状态；
- 正式菜单清单已经按最终 Release ID 生成并完成主平台交付记录；
- 用户明确知道当前线上版本号。

如果只有技术健康检查通过、尚未进行浏览器业务验收，应准确表述为：

```text
服务器切换和技术检查已通过，仍等待浏览器业务验收；暂不能宣布全部部署完成。
```
