import { readFileSync } from 'node:fs';

const stylesheet = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const marker = '最终对比度防线';
const guardIndex = stylesheet.lastIndexOf(marker);

if (guardIndex < 0) throw new Error('未找到全站最终对比度防线。');

const finalGuard = stylesheet.slice(guardIndex);
const requiredRules = [
  '[class*="text-"]',
  '[role="button"]',
  '.recharts-wrapper',
  '.industrial-visual-surface',
  '.remote-model-viewer',
  '.unit1-predictive-visual-shell .unit1-predictive-hud',
];

for (const selector of requiredRules) {
  if (!finalGuard.includes(selector)) throw new Error(`最终对比度规则缺少：${selector}`);
}

function rgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const channels = rgb(hex).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs: Array<[string, string, string]> = [
  ['主文字', '#172033', '#ffffff'],
  ['次要文字', '#3f4d60', '#ffffff'],
  ['蓝色按钮', '#173f5a', '#e6f0f5'],
  ['绿色按钮', '#194c32', '#e8f3ec'],
  ['暖色按钮', '#5d3a0c', '#f7efe1'],
  ['红色按钮', '#762929', '#f7eaea'],
  ['紫色按钮', '#46326f', '#eeeaf6'],
  ['三维悬浮信息', '#f1f5f9', '#29485e'],
];

for (const [name, foreground, background] of pairs) {
  const ratio = contrast(foreground, background);
  if (ratio < 4.5) throw new Error(`${name}对比度不足：${ratio.toFixed(2)}:1`);
}

console.log(`对比度审计通过：${pairs.length} 组关键配色均达到 4.5:1，浅色页面深字与三维视窗例外规则完整。`);
