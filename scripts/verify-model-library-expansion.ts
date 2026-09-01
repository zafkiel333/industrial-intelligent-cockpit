import { readFileSync } from 'node:fs';
import { MENU_ITEMS, MODEL_ENABLED_CHILD_ORDER } from '../constants';
import { MODEL_SHOWCASE_CATALOG } from '../src/remoteModelShowcase/modelCatalog';
import { PAGE_MODEL_BINDINGS } from '../src/remoteModelShowcase/pageModelBindings';
import type { MenuItem } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`MODEL_LIBRARY_EXPANSION_VERIFY_FAILED: ${message}`);
}

function flatten(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children || [])]);
}

assert(PAGE_MODEL_BINDINGS.length === 102, `expected 102 bindings, got ${PAGE_MODEL_BINDINGS.length}`);
assert(new Set(PAGE_MODEL_BINDINGS.map((item) => item.viewId)).size === 102, 'viewId must be unique');
assert(new Set(PAGE_MODEL_BINDINGS.map((item) => item.modelId)).size === 102, 'modelId must be unique');
assert(!PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-18'), 'eq-18 must never be model-enabled');
assert(PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-unit1-model' && item.modelId === 6691), 'independent unit-1 model page is missing');
assert(PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-0' && item.modelId === 2363), 'invalid eq-0 model replacement is missing');
assert(PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-15' && item.modelId === 8741), 'crusher model page is missing');
assert(PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-16' && item.modelId === 8736), 'mineral processing model page is missing');
assert(PAGE_MODEL_BINDINGS.some((item) => item.viewId === 'eq-17' && item.modelId === 8740), 'sand screening model page is missing');
assert(PAGE_MODEL_BINDINGS.every((item) => Number.parseFloat(item.fileSize) <= 50), 'a selected model exceeds the 50 MiB BFF limit');

const modelEnabledPageFrameSource = readFileSync('components/remote-model-showcase/ModelEnabledPageFrame.tsx', 'utf8');
assert(!modelEnabledPageFrameSource.includes('原业务页'), 'model-enabled pages must not expose the legacy business-page entry');
assert(!modelEnabledPageFrameSource.includes('role="tablist"'), 'model-enabled pages must not expose a model/business mode switch');

const modelViewerSource = readFileSync('components/remote-model-showcase/RemoteModelViewer.tsx', 'utf8');
assert(modelViewerSource.includes('new AbortController()'), 'model downloads must support cancellation');
assert(modelViewerSource.includes('pendingForAsset'), 'metadata/content version changes must reuse an in-flight model request');
assert(modelViewerSource.includes("phase: 'downloading'"), 'model viewer must expose byte download progress');

const allItems = flatten(MENU_ITEMS);
const allIds = new Set(allItems.map((item) => item.id));
PAGE_MODEL_BINDINGS.forEach((binding) => assert(allIds.has(binding.viewId), `menu page missing: ${binding.viewId}`));

assert(Object.keys(MODEL_SHOWCASE_CATALOG).length === 106, 'catalog must include 102 expanded pages plus 4 existing samples');
PAGE_MODEL_BINDINGS.forEach((binding) => {
  assert(MODEL_SHOWCASE_CATALOG[binding.viewId]?.modelId === binding.modelId, `catalog model mismatch: ${binding.viewId}`);
});

Object.entries(MODEL_ENABLED_CHILD_ORDER).forEach(([sectionId, expectedOrder]) => {
  const section = MENU_ITEMS.find((item) => item.id === sectionId);
  assert(section?.children, `section missing: ${sectionId}`);
  const actual = section.children.slice(0, expectedOrder.length).map((item) => item.id);
  assert(JSON.stringify(actual) === JSON.stringify(expectedOrder), `front order mismatch: ${sectionId}`);
});

const smartOps = MENU_ITEMS.find((item) => item.id === 'smart-ops')?.children || [];
assert(smartOps[18]?.id === 'eq-18', 'eq-18 must stay at smart-ops position 19');
assert(smartOps[19]?.id === 'eq-unit1-model', 'independent unit-1 model page must be at smart-ops position 20');

const simulation = MENU_ITEMS.find((item) => item.id === 'simulation')?.children || [];
assert(
  JSON.stringify(simulation.slice(0, 4).map((item) => item.id)) === JSON.stringify([
    'sim-visual-hydro-turbine',
    'sim-visual-wastewater-pump',
    'sim-visual-bridge-crane',
    'sim-visual-haul-truck',
  ]),
  'the first four simulation sample pages must keep their positions',
);

console.log(`MODEL_LIBRARY_EXPANSION_VERIFY_OK bindings=${PAGE_MODEL_BINDINGS.length} showcasePages=${Object.keys(MODEL_SHOWCASE_CATALOG).length} menuNodes=${allItems.length} legacySwitch=hidden`);
