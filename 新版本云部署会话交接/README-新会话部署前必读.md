# 场景库新版本云部署：新会话接手说明

> 文档用途：把本文件交给一个全新的 AI 会话，使其快速理解本项目的部署目标、服务器现状、用户操作偏好、安全边界和标准发布流程。  
> 编写日期：2026-08-19  
> 项目目录：`C:\Users\Administrator\Desktop\NLP_Proj\industrial-intelligent-cockpit`  
> 重要原则：本文记录的是“最后一次已知状态”，新会话必须先做只读核查，不能把旧状态当成当前事实直接切换生产版本。

---

## 1. 可以直接复制给新会话的第一条消息

```text
请先完整阅读：
新版本云部署会话交接/README-新会话部署前必读.md

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
```

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
| 公网 Nginx 入口 | `http://47.122.104.52:8081` |
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
http://8.146.211.204:3100
```

主平台由另一团队开发和部署。没有明确新增授权时，新会话不得：

- 尝试 SSH 登录主平台；
- 为主平台配置免密登录；
- 修改或发布主平台代码；
- 修改主平台 Nginx；
- 把“场景库部署完成”等同于“主平台适配代码已经发布”。

本次任务只更新场景库服务器。上线后可以从浏览器验证主平台是否仍能加载场景库，但这只是联调验证，不是修改主平台。

---

## 4. 最后一次已知的生产基线

2026-08-18 最后一次成功切换后：

```text
current  → /nlplabProj/scene-library/releases/20260818-144540
previous → /nlplabProj/scene-library/releases/20260817-154326
```

健康检查当时返回：

```json
{"status":"ok","version":"20260818-144540"}
```

当时确认：

- `scene-library.service` 为 `active`、`enabled`；
- Nginx 配置检查通过；
- `127.0.0.1:3102/api/health` 正常；
- `127.0.0.1:8081/scene-library-api/health` 正常；
- `/cockpit/`、`/microapps/scene-library/` 和 `scene-library.js` 可访问；
- `www/cockpit` 和 `www/microapps/scene-library` 通过软链接跟随 `current`；
- 旧版本保留在独立 release 目录中，可快速回滚。

这些只是历史事实。新会话第一轮必须重新核查，因为在 2026-08-19 进行新部署时它们可能已经变化。

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

编写本文件时，本地工作区存在大量已修改但尚未提交的源码，同时还有未跟踪目录/文件。这很可能就是本次要发布的新版本，但新会话不能自行作出这个决定。

必须先执行只读检查：

```powershell
git status --short
git branch --show-current
git log -5 --oneline
git diff --stat
git diff --check
git diff -- package.json package-lock.json server.ts
```

当前最后已知 Git 提交：

```text
b4ec6eb 页面跳转方法修改完成，现为页内跳转，已经部署并更新
```

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

正常情况下可以使用：

```powershell
npm ci
npm run typecheck
npm run build:all
```

但新会话应先检查 `package.json` 和 `package-lock.json` 是否匹配。如果本次只修改了 `package.json` 却未同步锁文件，必须先解释并修正依赖状态，不能直接假定 `npm ci` 一定正确。

---

## 8. 本次发布包不能盲目复用旧清单

当前代码相较上次部署出现了新的运行依赖：

- `package.json` 的启动命令使用 `scripts/run-tsx.mjs`；
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
npm run typecheck
npm run build:all
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

不要把旧版本固定的 hash 文件名写死，例如不要继续寻找旧的 `index-B7OWG8h6.js`。应从本次 `index.html` 动态读取当前资源名。

### 阶段 5：生成包、列出内容并计算 SHA-256

目标：生成唯一命名的 `scene-library-release-<RELEASE_ID>.tar.gz`。

生成后必须：

- 用 `tar -tzf` 检查关键文件；
- 确认没有顶层多包一层错误目录；
- 计算 `Get-FileHash -Algorithm SHA256`；
- 记录包大小、Release ID、Git commit 和 dirty 状态。

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
/cockpit/ = HTTP 200
standalone 当前 JS = HTTP 200
/microapps/scene-library/ = HTTP 200
/microapps/scene-library/scene-library.js = HTTP 200
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

- 本地类型检查和两套构建通过；
- 发布包内容和 SHA-256 已核验；
- 新 release 独立安装成功；
- `current` 指向新版本；
- `previous` 指向切换前的真实旧版本；
- systemd、内部 API、Nginx API、两套前端入口均正常；
- 新版关键业务功能经浏览器验证；
- 没有改动主平台服务器；
- 回滚路径仍有效；
- 发布记录完整；
- 用户明确知道当前线上版本号。

如果只有技术健康检查通过、尚未进行浏览器业务验收，应准确表述为：

```text
服务器切换和技术检查已通过，仍等待浏览器业务验收；暂不能宣布全部部署完成。
```

