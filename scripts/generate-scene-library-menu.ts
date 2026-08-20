import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { MENU_ITEMS } from '../constants';
import type { MenuItem } from '../types';
import { VIEW_ID_PATTERN } from '../src/integration/launchOptions';
import { DEFAULT_VIEW_ID, isKnownViewId } from '../src/integration/menu';

interface ManifestMenuItem {
  viewId: string;
  title: string;
  order: number;
  enabled: true;
  children: ManifestMenuItem[];
}

function readOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function gitOutput(args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

const ids = new Set<string>();

function toManifestItems(items: MenuItem[]): ManifestMenuItem[] {
  return items.map((item, index) => {
    const viewId = item.id.trim();
    const title = item.label.trim();
    if (!VIEW_ID_PATTERN.test(viewId)) throw new Error(`菜单 viewId 格式不合法：${item.id}`);
    if (ids.has(viewId)) throw new Error(`菜单 viewId 重复：${viewId}`);
    if (!title) throw new Error(`菜单标题为空：${viewId}`);
    if (!isKnownViewId(viewId)) throw new Error(`菜单无法被页面注册表识别：${viewId}`);
    ids.add(viewId);
    return {
      viewId,
      title,
      order: (index + 1) * 10,
      enabled: true,
      children: toManifestItems(item.children ?? []),
    };
  });
}

const items = toManifestItems(MENU_ITEMS);
const sourceCommit = gitOutput(['rev-parse', 'HEAD']) ?? 'unknown';
const sourceDirty = Boolean(gitOutput(['status', '--porcelain']));
const shortCommit = sourceCommit === 'unknown' ? 'unknown' : sourceCommit.slice(0, 7);
const menuVersion = readOption('menu-version') ?? `dev-${shortCommit}${sourceDirty ? '-dirty' : ''}`;
const outputPath = resolve(
  readOption('output')
    ?? '主平台统一导航拆分方案-20260820/scene-library-menu.manifest.json',
);
const menuContentSha256 = createHash('sha256')
  .update(JSON.stringify({ defaultViewId: DEFAULT_VIEW_ID, items }))
  .digest('hex');

const manifest = {
  schemaVersion: '1.0',
  menuVersion,
  generatedAt: new Date().toISOString(),
  sourceCommit,
  sourceDirty,
  defaultViewId: DEFAULT_VIEW_ID,
  menuContentSha256,
  totalNodeCount: ids.size,
  items,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`MENU_MANIFEST_OK nodes=${ids.size} roots=${items.length}`);
console.log(`menuVersion=${menuVersion}`);
console.log(`menuContentSha256=${menuContentSha256}`);
console.log(`output=${outputPath}`);
