import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const cvRoot = path.join(projectRoot, 'views', 'computer-visual-inspection');
const assetRoot = path.join(projectRoot, 'public', 'assets', 'computer-visual-inspection');
const imageRegistryPath = path.join(projectRoot, 'src', 'assets', 'cvMonitoringImages.ts');

const expectedBindings = [
  {
    page: 'SolarPanelHotspot/index.tsx',
    asset: 'solar-panel-inspection.png',
    property: 'solarPanel',
    alt: '光伏阵列无人机巡检画面',
  },
  {
    page: 'InsulatorDefect/index.tsx',
    asset: 'transmission-insulator-inspection.png',
    property: 'transmissionInsulator',
    alt: '输电线路绝缘子串巡检画面',
  },
  {
    page: 'TransformerLeak/index.tsx',
    asset: 'transformer-oil-leak-inspection.png',
    property: 'transformerOilLeak',
    alt: '油浸式变压器可见光巡检画面',
  },
  {
    page: 'SluiceGateSeal/index.tsx',
    asset: 'sluice-gate-seal-inspection.png',
    property: 'sluiceGateSeal',
    alt: '水工闸门止水密封巡检画面',
  },
  {
    page: 'DamCrackDetection/index.tsx',
    asset: 'dam-concrete-crack-inspection.png',
    property: 'damConcreteCrack',
    alt: '大坝混凝土裂缝可见光巡检画面',
  },
  {
    page: 'BeltForeignObject/index.tsx',
    asset: 'conveyor-foreign-object-inspection.png',
    property: 'conveyorForeignObject',
    alt: '输送带异物检测画面',
  },
] as const;

function fail(message: string): never {
  throw new Error(`[cv-monitoring-images] ${message}`);
}

function readPngDimensions(filePath: string): { width: number; height: number } {
  const bytes = fs.readFileSync(filePath);
  const pngSignature = '89504e470d0a1a0a';
  if (bytes.subarray(0, 8).toString('hex') !== pngSignature) {
    fail(`${path.relative(projectRoot, filePath)} 不是有效 PNG 文件`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

const pageFiles = fs
  .readdirSync(cvRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(cvRoot, entry.name, 'index.tsx'))
  .filter((filePath) => fs.existsSync(filePath));

for (const pageFile of pageFiles) {
  const source = fs.readFileSync(pageFile, 'utf8');
  if (source.includes('picsum.photos')) {
    fail(`${path.relative(projectRoot, pageFile)} 仍使用随机图片服务`);
  }
  if (/<img[\s\S]{0,500}?src\s*=\s*["'`]https?:\/\//i.test(source)) {
    fail(`${path.relative(projectRoot, pageFile)} 仍有远程图片直链`);
  }
}

let totalBytes = 0;
const imageRegistrySource = fs.readFileSync(imageRegistryPath, 'utf8');
if (!imageRegistrySource.includes('import.meta.env.BASE_URL')) {
  fail('图片注册表未使用 Vite BASE_URL，无法同时适配独立版和微应用版');
}
for (const item of expectedBindings) {
  const pagePath = path.join(cvRoot, item.page);
  const assetPath = path.join(assetRoot, item.asset);
  if (!fs.existsSync(pagePath)) fail(`缺少页面 ${item.page}`);
  if (!fs.existsSync(assetPath)) fail(`缺少本地业务图 ${item.asset}`);

  const source = fs.readFileSync(pagePath, 'utf8');
  const expectedImport = "import { CV_MONITORING_IMAGES } from '@/src/assets/cvMonitoringImages';";
  if (!source.includes(expectedImport)) fail(`${item.page} 未接入业务图片注册表`);
  if (!source.includes(`src={CV_MONITORING_IMAGES.${item.property}}`)) {
    fail(`${item.page} 未使用 CV_MONITORING_IMAGES.${item.property}`);
  }
  if (!imageRegistrySource.includes(`${item.property}: cvAsset('${item.asset}')`)) {
    fail(`图片注册表中 ${item.property} 未绑定 ${item.asset}`);
  }
  if (!source.includes(`alt="${item.alt}"`)) fail(`${item.page} 缺少业务语义替代文本`);

  const stats = fs.statSync(assetPath);
  const dimensions = readPngDimensions(assetPath);
  if (stats.size < 100_000) fail(`${item.asset} 文件异常小`);
  if (dimensions.width < 1000 || dimensions.height < 600) {
    fail(`${item.asset} 分辨率不足：${dimensions.width}x${dimensions.height}`);
  }
  totalBytes += stats.size;
}

console.log(
  `CV_MONITORING_IMAGES_OK pages=${expectedBindings.length} assets=${expectedBindings.length} `
    + `randomSources=0 baseUrl=verified bytes=${totalBytes}`,
);
