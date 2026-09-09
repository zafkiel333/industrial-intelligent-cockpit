import assert from 'assert';
import { generateHydroValidationCase, hydroValidationDefinitions } from '../src/remoteModelShowcase/hydroValidationSuite';
import { compareHydroValidation, validationPrediction, type DataRecord } from '../src/remoteModelShowcase/pilotDataService';

const toRecords = (rows: ReturnType<typeof generateHydroValidationCase>['observation'], phase: string): DataRecord[] => rows.map((row) => ({
  timestamp: row.timestamp,
  device_id: row.device_id,
  quality: row.quality,
  values: {
    rpm: row.rpm,
    temperature: row.temperature,
    vibration: row.vibration,
    pressure: row.pressure,
    flow_rate: row.flow_rate,
    power_output: row.power_output,
  },
  batch_id: `${row.case_id}-${phase}`,
}));

const summaries = hydroValidationDefinitions().map((definition) => {
  const data = generateHydroValidationCase(definition.caseId);
  const observation = toRecords(data.observation, 'observation');
  const actual = toRecords(data.verification, 'verification');
  const prediction = validationPrediction(observation);
  const record = {
    caseId: definition.caseId,
    deviceId: definition.deviceId,
    status: 'predicted' as const,
    observation: {
      fileName: `${definition.caseId}-观测数据.csv`,
      sha256: '',
      rowCount: observation.length,
      startAt: observation[0].timestamp,
      endAt: observation.at(-1)!.timestamp,
      uploadedAt: '',
    },
    prediction,
  };
  const result = compareHydroValidation(record, actual, definition.actualTag, definition.faultCode);
  return {
    caseId: definition.caseId,
    actual: definition.actualTag,
    expectedFault: definition.faultCode,
    predicted: prediction.tag,
    predictedFault: prediction.faultCode,
    statusCorrect: result.statusCorrect,
    faultCorrect: result.faultCorrect,
    conclusionCorrect: result.conclusionCorrect,
    normalizedMae: result.normalizedMae,
    smape: result.smape,
    coverage: result.intervalCoverage,
  };
});

const ratio = (values: boolean[]) => values.filter(Boolean).length / values.length;
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const statusAccuracy = ratio(summaries.map((item) => item.statusCorrect));
const conclusionAccuracy = ratio(summaries.map((item) => item.conclusionCorrect));
const abnormal = summaries.filter((item) => item.actual === 'abnormal');
const faultAccuracy = ratio(abnormal.map((item) => item.faultCorrect));
const normalizedMae = mean(summaries.map((item) => item.normalizedMae));
const smape = mean(summaries.map((item) => item.smape));
const coverage = mean(summaries.map((item) => item.coverage));

console.log('HYDRO_VALIDATION_MISMATCHES', JSON.stringify(summaries.filter((item) => !item.conclusionCorrect)));
console.log('HYDRO_VALIDATION_SUITE_VERIFY_OK', JSON.stringify({
  cases: summaries.length,
  normal: summaries.length - abnormal.length,
  abnormal: abnormal.length,
  statusAccuracy,
  conclusionAccuracy,
  faultAccuracy,
  normalizedMae,
  smape,
  intervalCoverage: coverage,
}));

assert.equal(summaries.length, 50);
assert.equal(abnormal.length, 23);
assert(statusAccuracy >= 0.9, `状态准确率不足：${statusAccuracy}`);
assert(conclusionAccuracy >= 0.9, `结论准确率不足：${conclusionAccuracy}`);
assert(faultAccuracy >= 0.9, `异常故障类型准确率不足：${faultAccuracy}`);
assert(normalizedMae >= 0.12 && normalizedMae <= 0.32, `区间归一化误差不合理：${normalizedMae}`);
assert(smape >= 0.03 && smape <= 0.3, `SMAPE 不合理：${smape}`);
