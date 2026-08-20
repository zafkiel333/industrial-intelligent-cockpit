import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import ts from 'typescript';
import { MENU_ITEMS } from '../constants';

interface MenuNode { id: string; label: string; children?: MenuNode[] }
const appPath = resolve('App.tsx');
const appText = readFileSync(appPath, 'utf8');
const appFile = ts.createSourceFile(appPath, appText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function leaves(items: MenuNode[]): MenuNode[] {
  return items.flatMap((item) => item.children?.length ? leaves(item.children) : [item]);
}

const targets = (MENU_ITEMS as MenuNode[]).flatMap((category) => leaves(category.children ?? []).slice(0, 20));
const componentModules = new Map<string, string>();
for (const statement of appFile.statements) {
  if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
  const modulePath = statement.moduleSpecifier.text;
  const clause = statement.importClause;
  if (clause?.name) componentModules.set(clause.name.text, modulePath);
  if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    for (const element of clause.namedBindings.elements) componentModules.set(element.name.text, modulePath);
  }
}

const routeComponents = new Map<string, string>();
const routeModules = new Map<string, string>();
const pairPatterns = [
  /if\s*\(\s*activeTabId\s*===\s*['"]([^'"]+)['"]\s*\)\s*return\s*<([A-Za-z0-9_]+)/g,
  /if\s*\(\s*activeTabId\s*===\s*['"]([^'"]+)['"]\s*\)\s*\{\s*return\s*<([A-Za-z0-9_]+)/g,
  /case\s+['"]([^'"]+)['"]\s*:\s*return\s*<([A-Za-z0-9_]+)/g,
  /['"]([^'"]+)['"]\s*:\s*<([A-Za-z0-9_]+)/g,
];
for (const pattern of pairPatterns) {
  for (const match of appText.matchAll(pattern)) routeComponents.set(match[1], match[2]);
}
for (const match of appText.matchAll(/['"]([^'"]+)['"]\s*:\s*lazy\s*\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
  routeModules.set(match[1], match[2]);
}
for (const match of appText.matchAll(/if\s*\(id\s*===\s*(\d+)\)\s*return\s*<([A-Za-z0-9_]+)/g)) {
  routeComponents.set(`eq-${match[1]}`, match[2]);
}

function addIndexedSwitch(prefix: string): void {
  const start = appText.indexOf(`activeTabId.startsWith('${prefix}')`);
  if (start < 0) return;
  const segment = appText.slice(start, start + 12000);
  for (const match of segment.matchAll(/case\s+(\d+)\s*:\s*return\s*<([A-Za-z0-9_]+)/g)) {
    routeComponents.set(`${prefix}${match[1]}`, match[2]);
  }
}
addIndexedSwitch('pm-hydro-');
addIndexedSwitch('pm-mining-');

const allFiles: string[] = [];
function walk(directory: string): void {
  for (const entry of readdirSync(directory)) {
    const pathname = resolve(directory, entry);
    if (statSync(pathname).isDirectory()) walk(pathname);
    else if (/\.tsx?$/.test(entry)) allFiles.push(pathname);
  }
}
walk('views');

function resolveModule(modulePath: string): string | undefined {
  const absolute = resolve(dirname(appPath), modulePath);
  for (const candidate of [`${absolute}.tsx`, `${absolute}.ts`, resolve(absolute, 'index.tsx'), resolve(absolute, 'View.tsx')]) {
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

function findByComponent(component: string): string | undefined {
  const modulePath = componentModules.get(component);
  if (modulePath) return resolveModule(modulePath);
  return allFiles.find((file) => basename(file, extname(file)) === component || basename(dirname(file)) === component);
}

const mpmStart = appText.indexOf("activeTabId.startsWith('mpm-')");
const mpmNames = mpmStart < 0 ? [] : [...appText.slice(mpmStart, mpmStart + 8000).matchAll(/'([A-Za-z0-9]+View)'/g)].map((match) => match[1]);

const resolved = new Map<string, string>();
const unresolved: MenuNode[] = [];
for (const page of targets) {
  let file: string | undefined;
  if (routeModules.has(page.id)) file = resolveModule(routeModules.get(page.id)!);
  if (!file && routeComponents.has(page.id)) file = findByComponent(routeComponents.get(page.id)!);
  if (!file && page.id.startsWith('mpm-')) file = findByComponent(mpmNames[Number(page.id.slice(4))] ?? '');
  if (!file && page.id.startsWith('vibe-')) {
    const module = routeModules.get(page.id);
    if (module) file = resolveModule(module);
  }
  if (!file && page.id.startsWith('cv-')) {
    const module = routeModules.get(page.id);
    if (module) file = resolveModule(module);
  }
  if (!file && allFiles.some((candidate) => candidate.includes(`life-warning\\${page.id}\\View.tsx`))) {
    file = allFiles.find((candidate) => candidate.includes(`life-warning\\${page.id}\\View.tsx`));
  }
  if (!file && allFiles.some((candidate) => candidate.includes(`Maintenance-Training\\${page.id}\\index.tsx`))) {
    file = allFiles.find((candidate) => candidate.includes(`Maintenance-Training\\${page.id}\\index.tsx`));
  }
  if (file) resolved.set(page.id, file);
  else unresolved.push(page);
}

export const menuFirst20Files = [...new Set(resolved.values())];
export const unresolvedMenuFirst20Pages = unresolved;

if (process.argv[1]?.replace(/\\/g, '/').endsWith('/scripts/resolve-menu-first20.ts')) {
  console.log(`目标入口 ${targets.length} 个，已解析 ${resolved.size} 个，未解析 ${unresolved.length} 个。`);
  for (const page of unresolved) console.log(`未解析 | ${page.id} | ${page.label}`);
  console.log('---FILES---');
  for (const file of menuFirst20Files) console.log(file);
}
