import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const SCENE_ROOTS = [
  'components/Maintenance-plan-management',
  'components/life-warning',
  'components/vibration-monitoring',
  'components/Vibration monitoring',
  'components/Maintenance-Training',
] as const;
const STANDARD_BACKGROUND = '0x315268';

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolutePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });

const failures: string[] = [];
let sceneCount = 0;
let fogCount = 0;

for (const relativeRoot of SCENE_ROOTS) {
  const absoluteRoot = path.join(PROJECT_ROOT, relativeRoot);
  for (const filePath of collectSourceFiles(absoluteRoot)) {
    const source = readFileSync(filePath, 'utf8');
    if (!source.includes('new THREE.WebGLRenderer')) continue;

    sceneCount += 1;
    const relativeFile = path.relative(PROJECT_ROOT, filePath).replaceAll('\\', '/');
    const backgroundAssignments = source.match(/scene\.background\s*=\s*[^;]+;/g) ?? [];

    if (backgroundAssignments.length === 0) {
      failures.push(`${relativeFile}: 缺少 scene.background`);
    } else {
      for (const assignment of backgroundAssignments) {
        if (!assignment.includes(`new THREE.Color(${STANDARD_BACKGROUND})`)) {
          failures.push(`${relativeFile}: 非标准背景：${assignment}`);
        }
      }
    }

    const fogPattern = /new THREE\.Fog(?:Exp2)?\(\s*([^,\s]+)/g;
    for (const match of source.matchAll(fogPattern)) {
      fogCount += 1;
      if (match[1] !== STANDARD_BACKGROUND) {
        failures.push(`${relativeFile}: 非标准雾化颜色：${match[1]}`);
      }
    }
  }
}

if (sceneCount === 0) failures.push('没有扫描到 Three.js 场景，请检查目录配置');

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `SCENE_BACKGROUND_VERIFY_OK scenes=${sceneCount} fogs=${fogCount} color=#315268`,
);
