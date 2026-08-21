import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const SCENE_ROOT = path.join(PROJECT_ROOT, 'components/knowledge-manage');
const STANDARD_BACKGROUND = '0xe8f1f6';
const EXPECTED_SCENE_COUNT = 32;
const EXPECTED_FOG_COUNT = 32;

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolutePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });

const failures: string[] = [];
let sceneCount = 0;
let fogCount = 0;

for (const filePath of collectSourceFiles(SCENE_ROOT)) {
  const source = readFileSync(filePath, 'utf8');
  if (!source.includes('new THREE.WebGLRenderer')) continue;

  sceneCount += 1;
  const relativeFile = path.relative(PROJECT_ROOT, filePath).replaceAll('\\', '/');
  const backgroundAssignments = source.match(/scene\.background\s*=\s*[^;]+;/g) ?? [];

  if (backgroundAssignments.length !== 1) {
    failures.push(`${relativeFile}: scene.background 数量应为 1，实际 ${backgroundAssignments.length}`);
  }

  for (const assignment of backgroundAssignments) {
    if (!assignment.includes(`new THREE.Color(${STANDARD_BACKGROUND})`)) {
      failures.push(`${relativeFile}: 非标准浅色背景：${assignment}`);
    }
  }

  const fogPattern = /new THREE\.Fog(?:Exp2)?\(\s*([^,\s]+)/g;
  for (const match of source.matchAll(fogPattern)) {
    fogCount += 1;
    if (match[1] !== STANDARD_BACKGROUND) {
      failures.push(`${relativeFile}: 非标准雾化基色：${match[1]}`);
    }
  }
}

if (sceneCount !== EXPECTED_SCENE_COUNT) {
  failures.push(`运维知识管理三维场景数量异常：实际 ${sceneCount}，预期 ${EXPECTED_SCENE_COUNT}`);
}

if (fogCount !== EXPECTED_FOG_COUNT) {
  failures.push(`运维知识管理雾化配置数量异常：实际 ${fogCount}，预期 ${EXPECTED_FOG_COUNT}`);
}

const appSource = readFileSync(path.join(PROJECT_ROOT, 'App.tsx'), 'utf8');
for (const marker of [
  "activeTabId === 'ops-knowledge'",
  "activeTabId.startsWith('km-')",
  'knowledge-management-theme',
]) {
  if (!appSource.includes(marker)) failures.push(`App.tsx 缺少栏目作用域标记：${marker}`);
}

const cssSource = readFileSync(path.join(PROJECT_ROOT, 'index.css'), 'utf8');
for (const marker of [
  '.smart-ops-theme.knowledge-management-theme button {',
  '.smart-ops-theme.knowledge-management-theme button * {',
  '> .absolute button:not([class*="bg-"])',
  'button:not(:disabled):not([aria-disabled="true"]):hover',
  '.smart-ops-theme.knowledge-management-theme button:disabled',
  'color: #20384a !important;',
  'background-color: #e7edf1 !important;',
  '-webkit-text-fill-color: inherit !important;',
]) {
  if (!cssSource.includes(marker)) failures.push(`index.css 缺少按钮状态保护：${marker}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `KNOWLEDGE_MANAGEMENT_VISUALS_OK scenes=${sceneCount} fogs=${fogCount} color=#E8F1F6 buttons=state-paired`,
);
