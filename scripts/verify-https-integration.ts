import fs from 'node:fs';
import path from 'node:path';
import { MODEL_SHOWCASE_CATALOG } from '../src/remoteModelShowcase/modelCatalog';

const projectRoot = process.cwd();
const insecureMainOrigin = 'http://8.146.211.204:3100';
const secureMainOrigin = 'https://8.146.211.204:3100';

function read(relativePath: string): string {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function listSourceFiles(relativeDirectory: string): string[] {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(relativePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [relativePath] : [];
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const scopedRuntimeFiles = [
  'server.ts',
  'src/integration/hostModelNavigation.ts',
  ...listSourceFiles('src/remoteModelShowcase'),
  ...listSourceFiles('components/remote-model-showcase'),
  ...listSourceFiles('views/simulation/remote-model'),
];

for (const relativePath of scopedRuntimeFiles) {
  const source = read(relativePath);
  assert(
    !source.includes(insecureMainOrigin),
    `${relativePath} still contains the insecure main-platform origin`,
  );
}

const serverSource = read('server.ts');
assert(
  serverSource.includes(`${secureMainOrigin}/three-model-api`),
  'server.ts does not default to the HTTPS three-model-api endpoint',
);

const hostNavigationSource = read('src/integration/hostModelNavigation.ts');
const catalogEntries = Object.values(MODEL_SHOWCASE_CATALOG);
assert(catalogEntries.length === 106, `expected 106 model showcase pages, got ${catalogEntries.length}`);
assert(new Set(catalogEntries.map((item) => item.modelId)).size === 106, 'model showcase IDs must be unique');
for (const config of catalogEntries) {
  assert(
    config.sourceDetailUrl === `${secureMainOrigin}/three-model/detail?id=${config.modelId}`,
    `model ${config.modelId} does not use the approved HTTPS detail URL`,
  );
}
assert(
  hostNavigationSource.includes("target: {\n      path: MODEL_DETAIL_PATH"),
  'host navigation must send the approved route instead of a full external URL',
);
assert(
  hostNavigationSource.includes('iframeOrigin: window.location.origin') &&
    hostNavigationSource.includes('expectedParentOrigin: parentOrigin'),
  'host navigation timeout diagnostics do not expose the actual iframe/parent origins',
);
assert(
  hostNavigationSource.includes('消息来源白名单是否一致'),
  'host navigation timeout does not explain the likely iframe origin whitelist mismatch',
);

const remoteModelUiFiles = [
  ...listSourceFiles('components/remote-model-showcase'),
  ...listSourceFiles('views/simulation/remote-model'),
];
for (const relativePath of remoteModelUiFiles) {
  const source = read(relativePath);
  assert(!/target\s*=\s*["']_blank["']/.test(source), `${relativePath} still opens a browser tab`);
  assert(!/window\.open\s*\(/.test(source), `${relativePath} still calls window.open`);
}

console.log(`HTTPS_INTEGRATION_VERIFY_OK models=${catalogEntries.length} files=${scopedRuntimeFiles.length}`);
