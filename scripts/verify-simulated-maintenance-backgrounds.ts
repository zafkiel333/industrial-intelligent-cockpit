import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const SCENE_ROOT = path.join(PROJECT_ROOT, 'components/maintenance');
const STANDARD_BACKGROUND = '0xe8f1f6';
const EXPECTED_SCENE_COUNT = 46;

// mining-comparison-v2 目前没有挂载到“模拟维修服务”mm-01～mm-46 路由，
// 根目录 ThreeScene.tsx 则属于“应用维修服务”首页，两者均不在本次栏位范围内。
const EXCLUDED_DIRECTORIES = new Set(['mining-comparison-v2']);

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolutePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });

const targetDirectories = readdirSync(SCENE_ROOT, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !EXCLUDED_DIRECTORIES.has(entry.name))
  .map(entry => path.join(SCENE_ROOT, entry.name));

const failures: string[] = [];
let sceneCount = 0;
let fogCount = 0;

for (const directory of targetDirectories) {
  for (const filePath of collectSourceFiles(directory)) {
    const source = readFileSync(filePath, 'utf8');
    const relativeFile = path.relative(PROJECT_ROOT, filePath).replaceAll('\\', '/');

    if (source.includes('new THREE.WebGLRenderer')) {
      sceneCount += 1;
      const backgroundAssignments = source.match(/scene\.background\s*=\s*[^;]+;/g) ?? [];

      if (backgroundAssignments.length === 0) {
        failures.push(`${relativeFile}: 缺少 scene.background`);
      } else {
        for (const assignment of backgroundAssignments) {
          if (!assignment.includes(`new THREE.Color(${STANDARD_BACKGROUND})`)) {
            failures.push(`${relativeFile}: 非浅色标准背景：${assignment}`);
          }
        }
      }
    }

    const fogPattern = /new THREE\.Fog(?:Exp2)?\(\s*([^,\s]+)/g;
    for (const match of source.matchAll(fogPattern)) {
      fogCount += 1;
      if (match[1] !== STANDARD_BACKGROUND) {
        failures.push(`${relativeFile}: 非浅色标准雾化颜色：${match[1]}`);
      }
    }
  }
}

if (sceneCount !== EXPECTED_SCENE_COUNT) {
  failures.push(
    `模拟维修场景数量异常：实际 ${sceneCount}，预期 ${EXPECTED_SCENE_COUNT}`,
  );
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `SIMULATED_MAINTENANCE_BACKGROUND_OK scenes=${sceneCount} fogs=${fogCount} color=#E8F1F6`,
);
