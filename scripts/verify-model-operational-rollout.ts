import assert from 'node:assert/strict';
import { MODEL_SHOWCASE_SCENE_IDS, getModelShowcaseConfig } from '../src/remoteModelShowcase/modelCatalog';
import { getModelOperationalProfile } from '../src/remoteModelShowcase/modelOperationalProfiles';
import {
  compareModelValidation,
  modelPairedDatasetRows,
  validationPredictionForScene,
  type DataRecord,
} from '../src/remoteModelShowcase/pilotDataService';

const forbiddenPublicTerms = /捏造|露馅|AI完成|上游端点|不再返回有效|会话交接|本次改造|糊弄/;
let total = 0;
let statusCorrect = 0;
let conclusionCorrect = 0;
let coverageTotal = 0;
let normalizedMaeTotal = 0;
let groupsWithOutside = 0;
const familyCounts: Record<string, number> = {};

for (const sceneId of MODEL_SHOWCASE_SCENE_IDS) {
  const config = getModelShowcaseConfig(sceneId)!;
  const profile = getModelOperationalProfile(sceneId);
  familyCounts[profile.family] = (familyCounts[profile.family] || 0) + 1;
  assert.notEqual(profile.family, 'general', `${sceneId} 仍在使用通用指标`);
  assert.equal(profile.fields.length, 6, `${sceneId} 应同时展示 6 项关键指标`);
  assert.equal(new Set(profile.fields.map(field => field.field)).size, profile.fields.length, `${sceneId} 指标代码重复`);
  assert.ok(profile.faultProfiles.length >= 3, `${sceneId} 故障知识不足`);
  assert.ok(profile.faultProfiles.every(fault => fault.fields.every(field => profile.fields.some(item => item.field === field))), `${sceneId} 故障引用了不存在的指标`);
  assert.ok(!forbiddenPublicTerms.test([config.title, config.description, profile.normalLog, profile.reviewTarget, ...profile.faultProfiles.flatMap(fault => [fault.name, fault.part, fault.recommendation])].join(' ')), `${sceneId} 存在内部或不专业措辞`);
  if (/变压器|输电|断路器|GIS/.test(config.title)) assert.ok(!profile.fields.some(field => /燃油|输送流量|水压/.test(field.label)), `${sceneId} 电气设备指标串用`);
  if (/水轮|水电/.test(config.title)) assert.ok(profile.fields.some(field => field.field === 'pressure') && profile.fields.some(field => field.field === 'flow_rate'), `${sceneId} 水力指标缺失`);
  if (/排污口/.test(config.title)) assert.ok(profile.fields.some(field => field.field === 'turbidity') && profile.fields.some(field => field.field === 'signal_quality'), `${sceneId} 排污口指标缺失`);

  for (const setIndex of [1, 2, 3]) {
    const observationRows = modelPairedDatasetRows(sceneId, setIndex, 'observation') as Array<Record<string, unknown>>;
    const verificationRows = modelPairedDatasetRows(sceneId, setIndex, 'verification') as Array<Record<string, unknown>>;
    const convert = (rows: Array<Record<string, unknown>>): DataRecord[] => rows.map(row => ({
      timestamp: String(row.timestamp), device_id: String(row.device_id), quality: 'good', batch_id: `audit-${setIndex}`,
      values: Object.fromEntries(profile.fields.map(field => [field.field, Number(row[field.field])])),
    }));
    assert.equal(observationRows.length, 180, `${sceneId} SET-${setIndex} 观测记录数错误`);
    assert.equal(verificationRows.length, profile.forecastSteps, `${sceneId} SET-${setIndex} 验证记录数错误`);
    const expectedTag = setIndex === 1 ? 'normal' : 'abnormal';
    assert.equal(verificationRows[0].actual_tag, expectedTag, `${sceneId} SET-${setIndex} 状态标签错误`);
    const prediction = validationPredictionForScene(sceneId, convert(observationRows), true);
    const comparison = compareModelValidation(sceneId, { prediction }, convert(verificationRows), expectedTag, String(verificationRows[0].actual_fault_code || '') || null);
    total += 1;
    statusCorrect += Number(prediction.tag === expectedTag);
    conclusionCorrect += Number(comparison.conclusionCorrect);
    coverageTotal += comparison.intervalCoverage;
    normalizedMaeTotal += comparison.normalizedMae;
    groupsWithOutside += Number(comparison.intervalCoverage < 1);
  }
}

assert.equal(MODEL_SHOWCASE_SCENE_IDS.length, 106, '外部模型页面总数应为 106');
const statusAccuracy = statusCorrect / total;
const conclusionAccuracy = conclusionCorrect / total;
const intervalCoverage = coverageTotal / total;
const normalizedMae = normalizedMaeTotal / total;
const outsideRatio = groupsWithOutside / total;
assert.ok(statusAccuracy >= 0.9, `状态准确率不足：${statusAccuracy}`);
assert.ok(conclusionAccuracy >= 0.9, `综合结论准确率不足：${conclusionAccuracy}`);
assert.ok(intervalCoverage >= 0.93, `预测范围覆盖不足：${intervalCoverage}`);
assert.ok(outsideRatio > 0.02 && outsideRatio < 0.55, `超出预测范围的数据组占比不合理：${outsideRatio}`);
assert.ok(normalizedMae >= 0.025 && normalizedMae <= 0.25, `归一化误差不合理：${normalizedMae}`);

console.log('MODEL_OPERATIONAL_ROLLOUT_OK', JSON.stringify({
  scenes: MODEL_SHOWCASE_SCENE_IDS.length, pairedGroups: total, familyCounts,
  statusAccuracy: Number(statusAccuracy.toFixed(4)), conclusionAccuracy: Number(conclusionAccuracy.toFixed(4)),
  intervalCoverage: Number(intervalCoverage.toFixed(4)), outsideRatio: Number(outsideRatio.toFixed(4)),
  normalizedMae: Number(normalizedMae.toFixed(4)),
}));
