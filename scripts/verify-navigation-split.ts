import assert from 'node:assert/strict';
import { MENU_ITEMS } from '../constants';
import type { MenuItem } from '../types';
import {
  DEFAULT_VIEW_ID,
  findMenuItemById,
  isKnownViewId,
} from '../src/integration/menu';
import {
  VIEW_ID_PATTERN,
  resolveSceneLibraryLaunchOptions,
} from '../src/integration/launchOptions';

const expectedRootIds = [
  'smart-ops',
  'product-kb',
  'cockpit',
  'index-analysis',
  'digital-delivery',
  'simulation',
  'customer-data',
  'remote-expert',
  'predictive-maintenance',
  'app-maintenance',
  'spare-parts',
  'mock-maintenance',
  'ops-knowledge',
  'service-data',
  'inspection',
  'maintenance-plan',
  'life-warning',
  'cv-monitor',
  'vibration-monitor',
  'maintenance-training',
];

assert.deepEqual(MENU_ITEMS.map((item) => item.id), expectedRootIds);
assert.equal(DEFAULT_VIEW_ID, 'smart-ops');

const ids = new Set<string>();
let nodeCount = 0;

function verifyItems(items: MenuItem[]): void {
  for (const item of items) {
    nodeCount += 1;
    assert.match(item.id, VIEW_ID_PATTERN, `viewId 格式错误：${item.id}`);
    assert.ok(item.label.trim(), `菜单标题为空：${item.id}`);
    assert.ok(!ids.has(item.id), `viewId 重复：${item.id}`);
    ids.add(item.id);
    assert.equal(isKnownViewId(item.id), true, `无法识别菜单：${item.id}`);
    assert.equal(findMenuItemById(MENU_ITEMS, item.id)?.label, item.label);
    verifyItems(item.children ?? []);
  }
}

verifyItems(MENU_ITEMS);
assert.ok(nodeCount > expectedRootIds.length, '菜单树缺少子页面。');

assert.deepEqual(resolveSceneLibraryLaunchOptions(''), {
  embedded: false,
  viewId: DEFAULT_VIEW_ID,
  requestedViewId: undefined,
  invalidViewId: false,
});
assert.equal(resolveSceneLibraryLaunchOptions('?embedded=1&viewId=eq-0').embedded, true);
assert.equal(resolveSceneLibraryLaunchOptions('?embedded=1&viewId=eq-0').viewId, 'eq-0');
assert.equal(resolveSceneLibraryLaunchOptions('?embedded=false&viewId=eq-0').embedded, false);
assert.equal(resolveSceneLibraryLaunchOptions('?embedded=1&embedded=1&viewId=eq-0').embedded, false);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=unknown-page').viewId, DEFAULT_VIEW_ID);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=unknown-page').invalidViewId, true);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=eq-0&viewId=eq-1').viewId, DEFAULT_VIEW_ID);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=eq-0&viewId=eq-1').invalidViewId, true);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=%2Fetc%2Fpasswd').viewId, DEFAULT_VIEW_ID);
assert.equal(resolveSceneLibraryLaunchOptions('?viewId=').invalidViewId, false);

console.log(`NAVIGATION_SPLIT_VERIFY_OK roots=${MENU_ITEMS.length} nodes=${nodeCount}`);
