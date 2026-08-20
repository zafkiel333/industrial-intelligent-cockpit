# 模型详情跳转消息 Origin 热修说明

> 编写日期：2026-08-20
> 故障现象：前四个仿真页面点击“查看资源详情”后提示“主平台未响应模型详情跳转请求”。
> 责任边界：模型详情地址和场景库发送逻辑已正确；主平台需要修正 iframe 消息来源校验及响应目标。
> 优先级：阻断性故障，主平台应尽快修改并重新发布前端。

## 1. 给开发人员的结论

这不是模型详情 URL 未切换到 HTTPS。场景库当前四个地址已经是：

```text
https://8.146.211.204:3100/three-model/detail?id=2326
https://8.146.211.204:3100/three-model/detail?id=2328
https://8.146.211.204:3100/three-model/detail?id=2316
https://8.146.211.204:3100/three-model/detail?id=2310
```

场景库嵌入主平台时不会把上述完整 URL 交给浏览器直接打开，而是向父窗口发送受控消息：

```json
{
  "type": "scene-library:navigate",
  "protocolVersion": "1.0",
  "source": "scene-library",
  "target": {
    "path": "/three-model/detail",
    "query": { "id": "2328" }
  },
  "openMode": "host-default"
}
```

主平台收到后执行自己的路由和内标签页策略，再返回 `scene-library:navigate-result`。目前请求超时，是因为主平台在收到消息后的第一轮安全校验中把它丢弃了。

## 2. 已核实的主平台现状

2026-08-20 对主平台当前公开运行代码进行只读核对，宿主页文件为：

```text
src/views/sceneLibrary/index.vue
```

当前代码仍硬编码：

```ts
const SCENE_LIBRARY_ORIGIN = "http://47.122.104.52:8081";
```

并同时用它做两件事：

1. 判断 `event.origin` 是否可信；
2. 把 `scene-library:navigate-result` 发回该 origin。

而主平台当前运行配置是：

```text
VITE_GLOB_SCENE_LIBRARY_ENTRY=/cockpit/
```

所以 iframe 的最终 URL 是主平台同源地址，例如：

```text
https://8.146.211.204:3100/cockpit/?embedded=1&viewId=...
```

浏览器生成的真实 `event.origin` 因而是：

```text
https://8.146.211.204:3100
```

它不可能等于旧硬编码值 `http://47.122.104.52:8081`。`event.origin` 是浏览器安全属性，场景库不能伪造或修改，所以本故障不能靠再次修改场景库详情 URL 解决。

## 3. 主平台必须修改的代码

### 3.1 不再硬编码旧 HTTP Origin

应根据 iframe 实际加载地址动态计算允许来源。示例：

```ts
const expectedSceneLibraryOrigin = computed(() => {
  return new URL(frameSrc.value, window.location.href).origin;
});
```

如果项目里 `frameSrc` 的变量名不同，请替换为实际绑定到 `<iframe :src="...">` 的值。

### 3.2 接收请求时同时校验窗口与实际 Origin

```ts
function handleSceneLibraryMessage(event: MessageEvent) {
  const iframeWindow = iframeRef.value?.contentWindow;

  if (!iframeWindow || event.source !== iframeWindow) return;
  if (event.origin !== expectedSceneLibraryOrigin.value) return;

  const data = event.data;
  if (
    data?.type !== 'scene-library:navigate' ||
    data?.protocolVersion !== '1.0'
  ) {
    return;
  }

  // 后续继续使用主平台既有的路径白名单、ID 校验、内标签页开关和 router.push。
}
```

不能删除 `event.source` 或 origin 校验，也不能把校验改成“允许任意来源”。

### 3.3 返回结果时发回本次已验证的来源

响应函数应接收原始 `MessageEvent`，并在来源校验通过后使用该事件的 `origin`：

```ts
function sendNavigationResult(
  event: MessageEvent,
  requestId: string,
  status: 'accepted' | 'rejected' | 'failed',
  message?: string,
) {
  const targetWindow = event.source as Window | null;
  if (!targetWindow) return;

  targetWindow.postMessage(
    {
      type: 'scene-library:navigate-result',
      protocolVersion: '1.0',
      requestId,
      status,
      message,
    },
    event.origin,
  );
}
```

这里使用 `event.origin` 的前提，是第 3.2 节的窗口与 origin 两项校验均已通过。也可以使用 `expectedSceneLibraryOrigin.value`，但不能继续使用旧 HTTP 常量。

### 3.4 更新备用入口

如果主平台保留场景库入口默认值，旧默认值：

```ts
"http://47.122.104.52:8081/cockpit/"
```

应改为：

```ts
"https://47.122.104.52/cockpit/"
```

当前正式配置 `/cockpit/` 可以继续使用。它由主平台服务端代理到场景库 HTTP 兼容入口，浏览器看到的仍是主平台 HTTPS 同源地址，不构成混合内容。动态计算 Origin 的方案同时兼容这两种部署方式：

| iframe 配置 | 主平台应识别的实际 Origin |
|---|---|
| `/cockpit/` | `https://8.146.211.204:3100` |
| `https://47.122.104.52/cockpit/` | `https://47.122.104.52` |

## 4. 不要采用的临时办法

- 不要让场景库伪造 `event.origin`，浏览器不允许这样做；
- 不要将 `postMessage` 的接收校验删除；
- 不要长期使用 `targetOrigin="*"`；
- 不要把 HTTPS 主平台中的 iframe 降回 HTTP，浏览器会按混合内容拦截；
- 不要改成 `window.top.location` 强行跳转，这会绕过主平台内标签页开关，并破坏既定导航方式；
- 不要恢复 `window.open` 或 `target="_blank"`。

## 5. 路由与内标签页行为保持不变

主平台完成安全校验后，应继续按既有开关执行：

- 内标签页开启：在同一个浏览器标签内新增或激活主平台内标签；
- 内标签页关闭：在当前浏览器标签中执行主平台页内路由跳转；
- 路由统一为 `/three-model/detail?id=<模型ID>`；
- 当前主平台使用 history 路由，不应写成 `#/three-model/detail`。

## 6. 主平台发布前的自动检查建议

在主平台仓库中搜索并清理旧值：

```bash
rg -n "http://47\.122\.104\.52:8081|SCENE_LIBRARY_ORIGIN" src .env*
```

需要确认：

1. 接收校验使用 iframe 最终 URL 的 origin；
2. 返回消息也使用同一个已验证 origin；
3. 备用入口已是 HTTPS；
4. 路由白名单仍只允许 `/three-model/detail`；
5. 模型 ID 仍只允许 `2326`、`2328`、`2316`、`2310`；
6. 内标签页开关逻辑没有被改动。

## 7. 联合验收

主平台重新构建并发布后，分别验证四个页面：

1. 打开前四个外部模型仿真页；
2. 点击“查看资源详情”；
3. 页面不再出现“主平台未响应”；
4. 内标签页开启时出现主平台内标签，并进入正确模型 ID；
5. 内标签页关闭时在当前浏览器标签内跳到正确详情页；
6. 浏览器控制台没有 origin 不匹配或 `postMessage` 目标来源错误；
7. 主平台向场景库返回 `scene-library:navigate-result`，且 `requestId` 与请求一致；
8. 非四个仿真页面的其他链接行为没有变化。

## 8. 本次场景库同步调整

场景库会发布一个诊断增强版本：

- 四个 HTTPS 模型详情 URL 保持不变；
- 受控导航协议保持 `1.0`，不要求主平台改变消息结构；
- 超时错误改为直接提示检查 iframe 实际来源与消息白名单；
- 控制台记录 `iframeOrigin`、`expectedParentOrigin`、目标路径和模型 ID，便于联调；
- 不增加强制顶层跳转或新浏览器标签兜底。

该版本能让原因更清晰，但浏览器的 `event.origin` 无法由场景库改变。按钮真正恢复必须以主平台完成第 3 节修改并发布为准。

## 9. 额外发现的部署风险

主平台当前对公网暴露了 Vite 开发服务器源文件路径（例如 `/src/views/...`）。这不是本次按钮超时的直接原因，但生产环境建议使用正式构建产物并由 Nginx 等 Web 服务器提供，不应长期公开开发服务器和源代码。此项可单独整改，不必阻塞 Origin 热修。

## 10. 可直接发给主平台开发的短消息

> 场景库四个模型详情 URL 已全部为 HTTPS。当前超时根因是主平台 `src/views/sceneLibrary/index.vue` 仍用 `http://47.122.104.52:8081` 校验和回复 postMessage，而正式 iframe 配置 `/cockpit/` 的实际 event.origin 是 `https://8.146.211.204:3100`。请按 iframe 最终 frameSrc 动态计算 origin，同时修改接收校验和 navigate-result 的 targetOrigin；保留既有路径白名单、模型 ID 校验和内标签页开关。详见本文第 3 节。
