import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const base = 'http://127.0.0.1:3000/api/model-showcase/sim-visual-hydro-turbine/data/validation';
const caseId = 'HT-50';
const dataset = path.join(root, 'src', 'data', 'model-showcase', 'sim-visual-hydro-turbine__model-2326', 'reference', 'forecast-validation');

async function json(pathname, init) {
  const response = await fetch(`${base}${pathname}`, init);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function upload(kind, filePath) {
  return json(`/cases/${caseId}/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: path.basename(filePath), content: fs.readFileSync(filePath, 'utf8') }),
  });
}

let failed = false;
try {
  await json(`/cases/${caseId}`, { method: 'DELETE' });

  const verificationFirst = await upload('verification', path.join(dataset, caseId, `${caseId}-验证数据.csv`));
  if (verificationFirst.response.status !== 409) throw new Error(`验证先于观测时应返回 409，实际为 ${verificationFirst.response.status}`);

  const wrongCase = await upload('observation', path.join(dataset, 'HT-49', 'HT-49-观测数据.csv'));
  if (wrongCase.response.status !== 400) throw new Error(`错组文件应返回 400，实际为 ${wrongCase.response.status}`);

  const observation = await upload('observation', path.join(dataset, caseId, `${caseId}-观测数据.csv`));
  if (observation.response.status !== 201 || observation.body.record?.status !== 'predicted') throw new Error('观测数据未形成冻结预测');
  if (observation.body.record.prediction.forecasts.length !== 2160) throw new Error('6 个指标应生成 2160 个预测点');

  const verification = await upload('verification', path.join(dataset, caseId, `${caseId}-验证数据.csv`));
  if (!verification.response.ok || verification.body.record?.status !== 'verified') throw new Error('验证数据未完成对照核验');
  if (verification.body.record.result?.actualSeries?.length !== 360) throw new Error('验证记录未保存 360 个实测时点');

  const detail = await json(`/cases/${caseId}`);
  if (!detail.response.ok || detail.body.record?.result?.fieldMetrics?.length !== 6) throw new Error('验证详情缺少 6 项指标误差');

  const overview = await json('/overview');
  if (!overview.response.ok || !overview.body.records?.some((record) => record.caseId === caseId && record.status === 'verified')) throw new Error('累计验证台账未记录已验证工况');

  const download = await fetch(`${base}/datasets?caseId=${caseId}`);
  if (!download.ok || !String(download.headers.get('content-type')).includes('application/zip')) throw new Error('本组数据包下载接口异常');

  console.log('HYDRO_VALIDATION_API_OK', JSON.stringify({
    predictedTag: verification.body.record.prediction.tag,
    actualTag: verification.body.record.result.actualTag,
    conclusionCorrect: verification.body.record.result.conclusionCorrect,
    normalizedMae: verification.body.record.result.normalizedMae,
    actualPoints: verification.body.record.result.actualSeries.length,
  }));
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  const cleanup = await json(`/cases/${caseId}`, { method: 'DELETE' });
  if (!cleanup.response.ok) {
    failed = true;
    console.error('测试记录清理失败');
  }
}

if (failed) process.exitCode = 1;
