import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { translateVisibleText } from '../src/localization/chineseUi';

const roots = ['views', 'components', 'src'];
const files: string[] = [];

function walk(directory: string): void {
  for (const entry of readdirSync(directory)) {
    const pathname = resolve(directory, entry);
    if (statSync(pathname).isDirectory()) walk(pathname);
    else if (/\.tsx?$/.test(entry)) files.push(pathname);
  }
}

roots.forEach(walk);

const occurrences = new Map<string, { source: string; translated: string; count: number }>();
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/subtitle="([^"]+)"/g)) {
    const original = match[1];
    const translated = translateVisibleText(original);
    // 单位和设备编码可按中文工业界面习惯保留；其余拉丁字母均列入复核。
    const reviewText = translated
      .replace(/\b(?:cm|dB|g|GB|GW|Hz|kg|kHz|km|kN|kPa|kV|kW|kWh|m|mA|MB|mg|MHz|min|ml|mm|mm\/s|MPa|ms|MW|N|Nm|Pa|pH|ppm|RPM|s|t|V|W|Wh)\b/gi, '')
      .replace(/\b[A-Z]+-[A-Z0-9-]+\b/g, '')
      .replace(/\b[A-Z0-9][A-Z0-9_&-]*_[A-Z0-9_&-]+\b/g, '');
    if (!/[A-Za-z]/.test(reviewText)) continue;
    const key = `${original}\u0000${translated}`;
    const existing = occurrences.get(key);
    if (existing) existing.count += 1;
    else occurrences.set(key, { source: original, translated, count: 1 });
  }
}

const unresolved = [...occurrences.values()].sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
for (const item of unresolved.slice(0, 240)) {
  console.log(`${String(item.count).padStart(3)} | ${item.source} => ${item.translated}`);
}
console.log(`待复核副标题：${unresolved.length} 个唯一值。`);

const tokenCounts = new Map<string, number>();
for (const item of unresolved) {
  for (const token of item.translated.match(/[A-Za-z][A-Za-z0-9_-]*/g) ?? []) {
    const normalized = token.toLowerCase();
    tokenCounts.set(normalized, (tokenCounts.get(normalized) ?? 0) + item.count);
  }
}
console.log('高频未收录术语：');
console.log(
  [...tokenCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 320)
    .map(([token, count]) => `${token}:${count}`)
    .join(', '),
);
