import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MODEL_SHOWCASE_CATALOG } from '../src/remoteModelShowcase/modelCatalog';

const DELIVERY_VERSION = '20260828';
const SCENE_LIBRARY_RELEASE = '20260828-145036';
const RUNTIME_SOURCE_COMMIT = 'a205c525ea3ade15718e537fcaab559d5565b66d';
const MENU_VERSION = '20260827-142935';
const EXPECTED_MANIFEST_SHA256 = 'c54f5375db0b99460d5848895b436b47ffe0848aea69590a7d3719e24b7d14bd';
const EXPECTED_MENU_CONTENT_SHA256 = '270ed2cd19452df4e6ec2c5916974042744cea6fdf01e76e544ddd62bbe88951';
const EXPECTED_MANIFEST_NODES = 1050;
const EXPECTED_MANIFEST_ROOTS = 20;
const EXPECTED_MODEL_COUNT = 103;
const DETAIL_PATH = '/three-model/detail';

const projectRoot = process.cwd();
const canonicalManifestPath = resolve(
  projectRoot,
  '主平台统一导航拆分方案-20260820/scene-library-menu.manifest.json',
);
const deliveryDirectory = resolve(
  projectRoot,
  `主项目模型库扩展接入-20260826/主平台导航正式交付包-${DELIVERY_VERSION}`,
);

function sha256(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex');
}

interface ManifestNode {
  viewId: string;
  children: ManifestNode[];
}

interface MenuManifest {
  schemaVersion: string;
  menuVersion: string;
  sourceDirty: boolean;
  defaultViewId: string;
  menuContentSha256: string;
  totalNodeCount: number;
  items: ManifestNode[];
}

const canonicalManifestBytes = readFileSync(canonicalManifestPath);
const canonicalManifestSha256 = sha256(canonicalManifestBytes);
if (canonicalManifestSha256 !== EXPECTED_MANIFEST_SHA256) {
  throw new Error(`正式 manifest 文件哈希不匹配：${canonicalManifestSha256}`);
}

const manifest = JSON.parse(canonicalManifestBytes.toString('utf8')) as MenuManifest;
if (
  manifest.schemaVersion !== '1.0'
  || manifest.menuVersion !== MENU_VERSION
  || manifest.sourceDirty !== false
  || manifest.defaultViewId !== 'smart-ops'
  || manifest.menuContentSha256 !== EXPECTED_MENU_CONTENT_SHA256
  || manifest.totalNodeCount !== EXPECTED_MANIFEST_NODES
  || manifest.items.length !== EXPECTED_MANIFEST_ROOTS
) {
  throw new Error('正式 manifest 元数据不符合已发布契约。');
}

const manifestIds = new Set<string>();
function collectManifestIds(nodes: ManifestNode[]): void {
  nodes.forEach((node) => {
    if (manifestIds.has(node.viewId)) throw new Error(`正式 manifest 存在重复 viewId：${node.viewId}`);
    manifestIds.add(node.viewId);
    collectManifestIds(node.children);
  });
}
collectManifestIds(manifest.items);
if (manifestIds.size !== EXPECTED_MANIFEST_NODES || !manifestIds.has('eq-unit1-model')) {
  throw new Error(`正式 manifest 页面集合不完整：${manifestIds.size}`);
}

const allowlistItems = Object.values(MODEL_SHOWCASE_CATALOG)
  .map((config) => {
    const detailUrl = new URL(config.sourceDetailUrl);
    if (detailUrl.pathname !== DETAIL_PATH || detailUrl.searchParams.get('id') !== String(config.modelId)) {
      throw new Error(`模型详情地址不符合白名单契约：${config.sceneId}/${config.modelId}`);
    }
    return {
      modelId: config.modelId,
      modelName: config.expectedRemoteName,
      sceneId: config.sceneId,
    };
  })
  .sort((left, right) => left.modelId - right.modelId);

if (
  allowlistItems.length !== EXPECTED_MODEL_COUNT
  || new Set(allowlistItems.map((item) => item.modelId)).size !== EXPECTED_MODEL_COUNT
  || new Set(allowlistItems.map((item) => item.sceneId)).size !== EXPECTED_MODEL_COUNT
) {
  throw new Error(`模型白名单数量或唯一性不正确：${allowlistItems.length}`);
}

const allowlist = {
  schemaVersion: '1.0',
  deliveryVersion: DELIVERY_VERSION,
  sceneLibraryRelease: SCENE_LIBRARY_RELEASE,
  runtimeSourceCommit: RUNTIME_SOURCE_COMMIT,
  detailPath: DETAIL_PATH,
  totalModelCount: allowlistItems.length,
  items: allowlistItems,
};
const allowlistText = `${JSON.stringify(allowlist, null, 2)}\n`;
const allowlistSha256 = sha256(allowlistText);

mkdirSync(deliveryDirectory, { recursive: true });
copyFileSync(canonicalManifestPath, resolve(deliveryDirectory, 'scene-library-menu.manifest.json'));
writeFileSync(resolve(deliveryDirectory, 'scene-library-model-allowlist.json'), allowlistText, 'utf8');

const readme = `# 主平台导航正式交付包

> 交付日期：2026-08-28（Asia/Shanghai）
> 对应场景库 Release：\`${SCENE_LIBRARY_RELEASE}\`
> 正式菜单版本：\`${MENU_VERSION}\`

本目录用于解除主项目团队反馈的“正式 manifest 缺失”阻塞。\`scene-library-menu.manifest.json\` 是场景库仓库正式文件的字节级副本，不是重新推算或从生产 bundle 逆向提取的替代文件。

## 文件

| 文件 | 用途 | SHA-256 |
|---|---|---|
| \`scene-library-menu.manifest.json\` | 替换主平台旧的 1,049 节点菜单快照 | \`${canonicalManifestSha256}\` |
| \`scene-library-model-allowlist.json\` | 将宿主页模型详情白名单从 4 个扩展到 103 个 | \`${allowlistSha256}\` |
| \`SHA256SUMS.txt\` | Linux/macOS/Windows 校验依据 | — |

## manifest 验收值

\`schemaVersion=1.0\`、\`menuVersion=${MENU_VERSION}\`、根节点 20、总节点/唯一 viewId 1,050、包含 \`eq-unit1-model\`，\`menuContentSha256=${EXPECTED_MENU_CONTENT_SHA256}\`。

## 主平台接入

1. 将正式 manifest 放到主平台 \`src/views/sceneLibrary/scene-library-menu.manifest.json\`，完整替换旧文件；
2. 保留现有 \`config.ts\` 的 manifest 驱动 \`isKnownViewId\`；
3. 保留菜单模块的 20 个“首页”合成逻辑；
4. 在宿主页导入白名单 JSON，生成现有字符串键 Map：

\`\`\`ts
import modelAllowlist from './scene-library-model-allowlist.json';

const ALLOWED_MODELS = new Map(
  modelAllowlist.items.map((item) => [String(item.modelId), item.modelName]),
);
\`\`\`

5. 继续校验 \`event.source\`、动态 Origin、\`protocolVersion=1.0\`、\`target.path=${DETAIL_PATH}\`、模型 ID 和名称；不得通过删除安全校验绕过白名单更新；
6. 正式构建并按《主项目导航栏更新列表与发布说明》执行 1,071 条主平台菜单记录、query、iframe、详情跳转和整体回滚验收。

## 在线原文件

正式 manifest 同时可从场景库 GitHub 主分支直接下载：

\`https://raw.githubusercontent.com/zafkiel333/industrial-intelligent-cockpit/main/%E4%B8%BB%E5%B9%B3%E5%8F%B0%E7%BB%9F%E4%B8%80%E5%AF%BC%E8%88%AA%E6%8B%86%E5%88%86%E6%96%B9%E6%A1%88-20260820/scene-library-menu.manifest.json\`

下载后仍须核对文件 SHA-256 为 \`${canonicalManifestSha256}\`。
`;
writeFileSync(resolve(deliveryDirectory, 'README.md'), readme, 'utf8');

const sums = [
  `${canonicalManifestSha256}  scene-library-menu.manifest.json`,
  `${allowlistSha256}  scene-library-model-allowlist.json`,
].join('\n');
writeFileSync(resolve(deliveryDirectory, 'SHA256SUMS.txt'), `${sums}\n`, 'utf8');

console.log(`HOST_NAVIGATION_DELIVERY_OK menuNodes=${manifestIds.size} roots=${manifest.items.length} models=${allowlistItems.length}`);
console.log(`manifestSha256=${canonicalManifestSha256}`);
console.log(`allowlistSha256=${allowlistSha256}`);
console.log(`output=${deliveryDirectory}`);
