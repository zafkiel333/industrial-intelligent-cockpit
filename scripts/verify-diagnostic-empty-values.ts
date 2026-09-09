import { clearDiagnosticHistory, recordDiagnosticSnapshot, runDiagnosis } from '../src/remoteModelShowcase/diagnosticEngine';
import type { RemoteDashboardData } from '../src/remoteModelShowcase/types';

const sceneId = 'eq-0';
const baseDashboard: RemoteDashboardData = {
  twin_status: { status: '运行数据同步中' },
  equipment: { name: '轴流式水轮机', status: '等待数据更新' },
  bindable_fields: [{
    field: 'rpm',
    label: '转速',
    unit: 'r/min',
    value: null as unknown as number,
    base_value: 150,
    normal_min: 130,
    normal_max: 170,
    abnormal: false,
    trend: 'stable',
  }],
};

clearDiagnosticHistory(sceneId);
recordDiagnosticSnapshot(sceneId, baseDashboard);
if (runDiagnosis(sceneId) !== null) throw new Error('empty telemetry must not create a diagnosis snapshot');

recordDiagnosticSnapshot(sceneId, {
  ...baseDashboard,
  bindable_fields: [{ ...baseDashboard.bindable_fields[0], value: 150 }],
});
const diagnosis = runDiagnosis(sceneId);
if (!diagnosis || !Number.isFinite(diagnosis.healthScore)) throw new Error('numeric telemetry must produce a diagnosis');
console.log('DIAGNOSTIC_EMPTY_VALUES_OK empty=ignored numeric=diagnosed');
