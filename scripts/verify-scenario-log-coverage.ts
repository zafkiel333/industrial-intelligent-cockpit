import assert from 'node:assert/strict';
import path from 'node:path';
import { SCENARIO_REGISTRY } from '../src/scenarioLib/scenarioRegistry';
import { generateMockScenarioLog } from '../src/scenarioLib/mockScenarioLog';
import { MODEL_SHOWCASE_SCENE_IDS, getModelShowcaseConfig, isModelShowcaseSceneId } from '../src/remoteModelShowcase/modelCatalog';
import { getModelOperationalProfile } from '../src/remoteModelShowcase/modelOperationalProfiles';
import { buildOperationalHistoryEntries } from '../src/remoteModelShowcase/unifiedHydroService';

const now = Date.parse('2026-09-11T08:00:00+08:00');
const forbidden = /模拟数据|演示数据|捏造|AI生成|会话交接|上游端点|不再返回有效|文件头|缩略图|开发任务|本次改造/;
const modelIds = new Set(MODEL_SHOWCASE_SCENE_IDS);
const staticPages = SCENARIO_REGISTRY.filter(entry => !isModelShowcaseSceneId(entry.id));
let staticLogs = 0;
let modelLogs = 0;
let criticalStaticPages = 0;
let criticalModelPages = 0;

assert.equal(new Set(SCENARIO_REGISTRY.map(entry => entry.id)).size, SCENARIO_REGISTRY.length, '场景注册表存在重复 ID');

for (const page of staticPages) {
  const entries = generateMockScenarioLog(page.id, page.name, page.categoryName);
  assert.ok(entries.length >= 30, `${page.id} 场景日志少于 30 条`);
  assert.equal(new Set(entries.map(entry => `${entry.time}:${entry.content}`)).size, entries.length, `${page.id} 场景日志存在重复记录`);
  assert.ok(entries.every(entry => entry.content.includes(page.name)), `${page.id} 存在未关联页面业务名称的日志`);
  assert.ok(!forbidden.test(JSON.stringify(entries)), `${page.id} 存在不应展示的内部措辞`);
  assert.ok(['normal', 'info'].includes(entries[0].level), `${page.id} 最新状态不应直接显示为告警`);
  const times = entries.map(entry => Date.parse(entry.time.replace(' ', 'T'))).sort((a, b) => a - b);
  assert.ok(times.at(-1)! - times[0] >= 500 * 86_400_000, `${page.id} 场景日志时间跨度不足`);
  const normal = entries.filter(entry => entry.level === 'normal').length;
  const info = entries.filter(entry => entry.level === 'info').length;
  const attention = entries.filter(entry => entry.level === 'attention').length;
  const warning = entries.filter(entry => entry.level === 'warning').length;
  const critical = entries.filter(entry => entry.level === 'critical').length;
  assert.ok(normal >= 12 && info >= 7, `${page.id} 正常与信息记录占比不足`);
  assert.ok(attention >= 2 && attention <= 4, `${page.id} 关注记录占比不合理`);
  assert.equal(warning, 2, `${page.id} 普通预警应保持为 2 条`);
  assert.ok(critical <= 1, `${page.id} 严重预警过多`);
  if (critical) criticalStaticPages += 1;
  staticLogs += entries.length;
}

for (const sceneId of MODEL_SHOWCASE_SCENE_IDS) {
  assert.ok(modelIds.has(sceneId));
  const config = getModelShowcaseConfig(sceneId)!;
  const profile = getModelOperationalProfile(sceneId);
  const modelRoot = path.join('model-showcase', `${sceneId}__model-${config.modelId}`);
  const entries = buildOperationalHistoryEntries(modelRoot, sceneId, now);
  assert.ok(entries.length >= 30, `${sceneId} 外部模型场景日志少于 30 条`);
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length, `${sceneId} 外部模型场景日志 ID 重复`);
  assert.ok(entries.every(entry => entry.deviceId === `${config.modelId}-01`), `${sceneId} 基础日志设备编号不一致`);
  assert.ok(!forbidden.test(JSON.stringify(entries)), `${sceneId} 外部模型日志存在不应展示的内部措辞`);
  assert.ok(entries.filter(entry => entry.category === 'operation').length >= 10, `${sceneId} 运行业务日志不足`);
  assert.ok(entries.filter(entry => entry.category === 'prediction').length >= 9, `${sceneId} 预测业务日志不足`);
  assert.ok(entries.filter(entry => entry.category === 'verification').length >= 9, `${sceneId} 实测核验日志不足`);
  assert.ok(entries.some(entry => entry.content.includes(profile.normalLog)), `${sceneId} 缺少模型正常状态描述`);
  assert.ok(profile.faultProfiles.slice(0, 2).every(fault => entries.some(entry => entry.content.includes(fault.name))), `${sceneId} 缺少模型故障知识日志`);
  assert.ok(profile.fields.every(field => entries.some(entry => entry.content.includes(field.label))), `${sceneId} 未覆盖全部模型指标`);
  const times = entries.map(entry => Date.parse(entry.timestamp)).sort((a, b) => a - b);
  assert.ok(times.at(-1)! - times[0] >= 330 * 86_400_000, `${sceneId} 外部模型日志时间跨度不足`);
  const warnings = entries.filter(entry => entry.level === 'warning').length;
  const critical = entries.filter(entry => entry.level === 'critical').length;
  assert.equal(warnings, 2, `${sceneId} 外部模型普通预警应保持为 2 条`);
  assert.ok(critical <= 1, `${sceneId} 外部模型严重预警过多`);
  if (critical) criticalModelPages += 1;
  modelLogs += entries.length;
}

console.log('SCENARIO_LOG_COVERAGE_OK', JSON.stringify({
  registryPages: SCENARIO_REGISTRY.length,
  staticPages: staticPages.length,
  modelPages: MODEL_SHOWCASE_SCENE_IDS.length,
  logsPerPage: 34,
  staticLogs,
  modelLogs,
  criticalStaticPages,
  criticalModelPages,
}));
