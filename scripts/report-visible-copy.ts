import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { translateVisibleText } from '../src/localization/chineseUi';

const roots = ['views', 'components', 'src'];
const visibleAttributes = new Set([
  'alt', 'aria-description', 'aria-label', 'label', 'name', 'placeholder', 'subtitle', 'title',
]);
const visibleProperties = new Set([
  'action', 'caption', 'desc', 'description', 'label', 'message', 'name', 'role', 'statusLabel',
  'subtitle', 'text', 'title',
]);
const allowedLatin = new RegExp(
  String.raw`\b(?:A|AC|AGV|AI|API|AR|AtoN|AZI|B|BIM|BOD5|BOR|BPFO|C|CAC|CAD|CES|CFD|CH4|CII|COD|COG|CPU|CSAT|CSS|DC|DO|DSO|EEOI|EGL|ERP|ESD|ETA|ETD|F80|FAT|FFT|FIV|FM|FMEA|FoS|GIS|GNSS|GPS|GPU|HFO|HR|HUD|HVAC|IEC|IFC|II|INC|ISO|KKS|KPI|LNG|LOD|LOTO|MBES|MIBC|MFL|MLSS|MSA|NDT|NPSH|ORP|P|P80|PAX|PDC|PDF|PID|PLC|PM2\.5|PM10|PPV|Q|RMS|ROP|ROV|RPM|RSSI|RUL|RWG|SCADA|SLA|SN|SOG|SOP|SS|STEP|SVI|SWL|THD-U|TN|TOS|TP|TPH|TVD|Uab|Ubc|Uca|UKC|UV|VSI|WOB|X|XRF|Y|Z)\b`,
  'gi',
);

interface Finding {
  original: string;
  translated: string;
  source: string;
  count: number;
  kind: '源文混合' | '翻译后混合' | '英文';
}

const files: string[] = [];
function walk(directory: string): void {
  for (const entry of readdirSync(directory)) {
    const pathname = resolve(directory, entry);
    if (statSync(pathname).isDirectory()) walk(pathname);
    else if (/\.tsx?$/.test(entry)) files.push(pathname);
  }
}
roots.forEach(walk);

const priorityPageNames = new Set([
  'BerthingView.tsx', 'CraneView.tsx', 'CrushingEquipmentView.tsx', 'DrillingRigView.tsx',
  'EquipmentView.tsx', 'GeneratorView.tsx', 'MineHoistView.tsx', 'MineralProcessingView.tsx',
  'NavigationMarkView.tsx', 'OutfallView.tsx', 'PumpStationView.tsx', 'SandMakingView.tsx',
  'ShipView.tsx', 'TachometerView.tsx', 'TransmissionView.tsx', 'TunnelBoringMachineView.tsx',
  'WastewaterView.tsx', 'WindTurbineView.tsx', 'Unit1PredictiveView.tsx',
]);
const menuFirst20Files = process.argv.includes('--menu-first20')
  ? (await import('./resolve-menu-first20')).menuFirst20Files
  : [];
const filesToScan = process.argv.includes('--menu-first20')
  ? menuFirst20Files
  : process.argv.includes('--priority-pages')
    ? files.filter((file) => priorityPageNames.has(file.split(/[\\/]/).at(-1) ?? ''))
    : files;

function propertyName(node: ts.PropertyName | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return undefined;
}

function isInsideJsxExpression(node: ts.Node): boolean {
  let insideExpression = false;
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isPropertyAssignment(current) && !visibleProperties.has(propertyName(current.name) ?? '')) return false;
    if (ts.isJsxAttribute(current) && !visibleAttributes.has(current.name.text)) return false;
    if (ts.isJsxElement(current) && current.openingElement.tagName.getText().toLowerCase() === 'style') return false;
    if (ts.isJsxExpression(current)) {
      if (ts.isJsxAttribute(current.parent) && !visibleAttributes.has(current.parent.name.text)) return false;
      insideExpression = true;
    }
    if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) return false;
    if (ts.isSourceFile(current)) return insideExpression;
  }
  return insideExpression;
}

function isInsidePreservedElement(node: ts.Node): boolean {
  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if (!ts.isJsxElement(current)) continue;
    const preserved = current.openingElement.attributes.properties.some((attribute) => (
      ts.isJsxAttribute(attribute)
      && attribute.name.text === 'data-localization'
      && attribute.initializer != null
      && ts.isStringLiteral(attribute.initializer)
      && attribute.initializer.text === 'preserve'
    ));
    if (preserved) return true;
  }
  return false;
}

function cleanForReview(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/&(?:amp|gt|lt|quot);/gi, '')
    .replace(allowedLatin, '')
    .replace(/\d+(?:\.\d+)?\s*(?:cm|dB|g|GB|GW|h|Hz|kg|kHz|km|kN|kPa|kV|kW|kWh|L|m|mA|MB|mg|mg\/L|MHz|min|mL|mL\/g|mm|mm\/s|MPa|ms|mV|MW|MWh|N|Nm|Pa|ppm|s|t|V|W|Wh)(?:\/s|\/h)?\b/gi, '')
    .replace(/\b(?:bar|cm|dB|g|GB|GB\/s|GW|h|Hz|kg|kgCO2|kgCO₂|kHz|km|kN|kNm|kPa|kV|kW|kWh|L|L\/min|m|mA|MB|MB\/s|mg|mg\/L|MHz|min|mL|mL\/g|mm|mm\/s|MN|MPa|ms|mV|MW|MWh|N|Nm|NTU|Pa|pH|ppb|ppm|s|t|V|W|Wh)\b/gi, '')
    .replace(/\b[A-Z]+-\d[A-Z0-9-]*\b/g, '')
    // 场景路由、设备号、业务编码和变量名属于机器标识，不计入展示文案缺陷。
    .replace(/\b(?:eq|kb|cp|ia|dd|sim|cdm|re|res|pm|am|sp|mm|km|sm|sh|ins|mpm|cv|vibe)-[A-Za-z0-9][A-Za-z0-9-]*\b/gi, '')
    .replace(/\b[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+\b/g, '')
    .replace(/\b[A-Za-z]+-+\d[A-Za-z0-9-]*\b/g, '')
    .replace(/#[A-Za-z0-9][A-Za-z0-9-]*/g, '')
    .replace(/\b0x[A-Fa-f0-9.]+\b/g, '')
    .replace(/\b[A-Z]\d+(?:[-+][A-Z0-9]+)+\b/g, '')
    .replace(/\b[A-Z]\d+\b/g, '')
    .replace(/\b[A-Z0-9][A-Z0-9_&-]*_[A-Z0-9_&-]+\b/g, '')
    .replace(/\bv?\d+(?:\.\d+)+(?:[-+][A-Za-z0-9.-]+)?\b/gi, '');
}

const findings = new Map<string, Finding>();
let candidateCount = 0;
function record(text: string, sourceFile: ts.SourceFile, node: ts.Node): void {
  if (isInsidePreservedElement(node)) return;
  const original = text.replace(/\s+/g, ' ').trim();
  if (!original || !/[A-Za-z]/.test(original) || original.length > 260) return;
  candidateCount += 1;
  const translated = translateVisibleText(original);
  const originalReview = cleanForReview(original);
  const review = cleanForReview(translated);
  const originalIsMixed = /[A-Za-z]/.test(originalReview) && /[\u3400-\u9fff]/.test(originalReview);
  if (!originalIsMixed && !/[A-Za-z]/.test(review)) return;
  const kind: Finding['kind'] = originalIsMixed
    ? '源文混合'
    : /[\u3400-\u9fff]/.test(review)
      ? '翻译后混合'
      : '英文';
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const source = `${relative(process.cwd(), sourceFile.fileName)}:${line}`;
  const key = `${original}\u0000${translated}`;
  const existing = findings.get(key);
  if (existing) existing.count += 1;
  else findings.set(key, { original, translated, source, count: 1, kind });
}

for (const file of filesToScan) {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) record(node.text, sourceFile, node);
    else if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.text)) {
      if (node.initializer && ts.isStringLiteral(node.initializer)) record(node.initializer.text, sourceFile, node);
    } else if (ts.isPropertyAssignment(node) && visibleProperties.has(propertyName(node.name) ?? '')) {
      if (ts.isStringLiteralLike(node.initializer)) record(node.initializer.text, sourceFile, node);
    } else if (ts.isStringLiteralLike(node) && isInsideJsxExpression(node)) {
      record(node.text, sourceFile, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

const unresolved = [...findings.values()].sort((a, b) => {
  const priority: Record<Finding['kind'], number> = { 源文混合: 0, 翻译后混合: 1, 英文: 2 };
  if (a.kind !== b.kind) return priority[a.kind] - priority[b.kind];
  return b.count - a.count || a.original.localeCompare(b.original);
});

for (const kind of ['源文混合', '翻译后混合', '英文'] as const) {
  for (const item of unresolved.filter((finding) => finding.kind === kind).slice(0, 180)) {
    console.log(`${item.kind} | ${String(item.count).padStart(3)} | ${item.source} | ${item.original} => ${item.translated}`);
  }
}
const sourceMixedCount = unresolved.filter((item) => item.kind === '源文混合').length;
const translatedMixedCount = unresolved.filter((item) => item.kind === '翻译后混合').length;
const englishCount = unresolved.filter((item) => item.kind === '英文').length;
console.log(`可见文案待复核：源文混合 ${sourceMixedCount} 项，翻译后混合 ${translatedMixedCount} 项，英文 ${englishCount} 项，共 ${unresolved.length} 个唯一值。`);
console.log(`已扫描 ${filesToScan.length} 个前端源码文件、${candidateCount} 条含拉丁字母的候选可见文案。`);
if (process.argv.includes('--tokens')) {
  const tokenCounts = new Map<string, number>();
  for (const item of unresolved.filter((finding) => finding.kind === '翻译后混合')) {
    for (const token of cleanForReview(item.translated).match(/[A-Za-z][A-Za-z0-9_-]*/g) ?? []) {
      const normalized = token.toLowerCase();
      tokenCounts.set(normalized, (tokenCounts.get(normalized) ?? 0) + item.count);
    }
  }
  console.log('翻译后混杂高频词：');
  console.log(
    [...tokenCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 500)
      .map(([token, count]) => `${token}:${count}`)
      .join(', '),
  );
}
if (process.argv.includes('--fail-on-translated-mixed') && translatedMixedCount > 0) {
  throw new Error(`仍有 ${translatedMixedCount} 项文案在翻译后出现未知中英文混杂。`);
}
