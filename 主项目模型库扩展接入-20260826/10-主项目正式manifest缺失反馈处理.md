# 主项目正式 Manifest 缺失反馈处理

> 处理日期：2026-08-28（Asia/Shanghai）
> 反馈材料：主项目团队《场景库导航更新-正式manifest缺失问题说明.md》
> 处理状态：正式文件已核验并形成可直接转发的交付包；场景库和主平台服务器均未修改

## 1. 结论

正式 manifest 没有丢失，也不需要从生产 bundle 重建。它一直存在于场景库仓库：

```text
主平台统一导航拆分方案-20260820/scene-library-menu.manifest.json
```

主项目团队只能搜索自己的 `ices-union` 仓库，无法访问场景库工作区，因此出现的是“跨仓库交付渠道缺失”，不是正式产物内容缺失。主项目反馈中对旧文件、bundle 和主项目本机目录的排查结论均合理。

## 2. 正式文件核验

```text
schemaVersion=1.0
menuVersion=20260827-142935
根节点=20
总节点=1050
唯一 viewId=1050
defaultViewId=smart-ops
包含 eq-unit1-model=true
menuContentSha256=270ed2cd19452df4e6ec2c5916974042744cea6fdf01e76e544ddd62bbe88951
文件字节数=203513
文件 SHA-256=c54f5375db0b99460d5848895b436b47ffe0848aea69590a7d3719e24b7d14bd
```

GitHub Raw 原文件已从公网重新下载并在内存中计算哈希，返回 HTTP 200、203,513 字节，SHA-256 与仓库原件及发布说明完全一致。

## 3. 已生成的正式交付物

### 3.1 可直接转发 ZIP

```text
主项目模型库扩展接入-20260826/主平台导航正式交付包-20260828.zip
大小=34268 字节
SHA-256=61f0a8e26e00aec5994cf62958a99684e47a745839663a3126ef1a9cf84f7aaa
```

ZIP 内含：

```text
README.md
SHA256SUMS.txt
scene-library-menu.manifest.json
scene-library-model-allowlist.json
```

### 3.2 解压目录

```text
主项目模型库扩展接入-20260826/主平台导航正式交付包-20260828/
```

- `scene-library-menu.manifest.json` 是正式原文件的字节级副本；
- `scene-library-model-allowlist.json` 是从场景库审核运行目录直接生成的 103 模型映射，不再要求主项目从 18 MiB bundle 逆向提取；
- `SHA256SUMS.txt` 包含两个数据文件的校验值；
- `README.md` 给出主平台导入和安全校验保留方式。

白名单文件验收值：

```text
模型总数=103
唯一 modelId=103
唯一 sceneId=103
detailPath=/three-model/detail
SHA-256=cd1b034418d10c460317ad34cce582a00d3715e72cd8d2a14b69c3b07a8c97f1
```

## 4. 在线取件地址

正式 manifest 可直接下载：

```text
https://raw.githubusercontent.com/zafkiel333/industrial-intelligent-cockpit/main/%E4%B8%BB%E5%B9%B3%E5%8F%B0%E7%BB%9F%E4%B8%80%E5%AF%BC%E8%88%AA%E6%8B%86%E5%88%86%E6%96%B9%E6%A1%88-20260820/scene-library-menu.manifest.json
```

交付包提交并推送后，也可从场景库仓库的 `主项目模型库扩展接入-20260826` 目录下载 ZIP。无论采用哪种渠道，主项目都必须按第 2 节文件哈希验收。

## 5. 主项目后续操作

1. 校验 ZIP 外部 SHA-256；
2. 解压后执行 `sha256sum -c SHA256SUMS.txt` 或等价校验；
3. 用正式 manifest 整体替换主项目旧的 1,049 节点文件；
4. 导入官方 103 模型白名单，替换旧 4 模型 Map；
5. 保留现有 `viewId` 校验、20 个首页、动态 Origin、`event.source`、协议版本、路径和模型名称校验；
6. 正式构建主项目，按 `07-主项目导航栏更新列表与发布说明.md` 验证 1,071 条主平台菜单记录和模型详情跳转；
7. 主平台自行备份、发布和回滚；场景库团队不登录或修改主平台服务器。

## 6. 可复现生成与防再发

仓库新增命令：

```text
npm run generate:host-navigation-delivery
```

生成器在复制前强制校验正式 manifest 的文件哈希、版本、节点数、唯一 ID 和 `eq-unit1-model`，并验证 103 个模型 ID/sceneId 唯一及详情路径契约。后续菜单或模型目录发生正式变更时，应先更新生成器中的版本契约，再生成新的日期交付包，不能覆盖本次包或把旧哈希继续当成新版本。
