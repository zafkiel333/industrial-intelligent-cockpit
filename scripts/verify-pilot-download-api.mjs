import fs from 'node:fs';
import path from 'node:path';

const baseUrl = (process.env.PILOT_API_BASE_URL || 'http://127.0.0.1:4176/api').replace(/\/$/, '');
const dataRoot = process.env.PILOT_DATA_ROOT || '';
const verifyLifecycle = process.env.PILOT_LIFECYCLE === '1';

const models = [
  { sceneId: 'sim-visual-hydro-turbine', modelId: '2326', title: '水轮机多工况数字孪生分析' },
  { sceneId: 'sim-visual-wastewater-pump', modelId: '2328', title: '污水泵运行效能与故障分析' },
  { sceneId: 'sim-visual-bridge-crane', modelId: '2316', title: '桥式起重机载荷安全数字孪生分析' },
  { sceneId: 'sim-visual-haul-truck', modelId: '2310', title: '矿卡牵引运输状态与故障分析' },
];

const downloads = [
  { kind: 'specification', label: '数据规范', formats: ['pdf', 'docx', 'json'] },
  { kind: 'samples', label: '数据样例', formats: ['csv', 'xlsx', 'json', 'zip'] },
  { kind: 'prediction', label: '预测结果', formats: ['csv', 'xlsx', 'json'] },
  { kind: 'report', label: '分析报告', formats: ['pdf', 'docx', 'json'] },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function suggestedFileName(disposition) {
  const match = /filename\*=UTF-8''([^;]+)/i.exec(disposition || '');
  assert(match, '缺少 RFC 5987 UTF-8 文件名');
  return decodeURIComponent(match[1]);
}

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}/${pathname}`, options);
  if (!response.ok) throw new Error(`${options?.method || 'GET'} ${pathname}: HTTP ${response.status} ${await response.text()}`);
  return response;
}

let downloadCount = 0;
let protocolSampleCount = 0;
for (const model of models) {
  const deviceId = `${model.modelId}-01`;
  for (const group of downloads) {
    for (const format of group.formats) {
      const response = await request(`model-showcase/${model.sceneId}/downloads/${group.kind}?format=${format}&deviceId=${deviceId}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const label = group.kind === 'samples' && format === 'zip' ? '数据样例-全格式' : group.label;
      const expectedName = `${model.modelId}-${model.title}-设备ID-${deviceId}-${label}.${format}`;
      assert(suggestedFileName(response.headers.get('content-disposition')) === expectedName, `${model.sceneId}/${group.kind}/${format}: 文件名错误`);
      assert(bytes.length > 8, `${model.sceneId}/${group.kind}/${format}: 文件为空`);
      if (format === 'csv') assert(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf, `${expectedName}: 缺少 UTF-8 BOM`);
      if (['xlsx', 'docx', 'zip'].includes(format)) assert(bytes[0] === 0x50 && bytes[1] === 0x4b, `${expectedName}: ZIP 文件头错误`);
      if (format === 'pdf') assert(new TextDecoder('ascii').decode(bytes.slice(0, 4)) === '%PDF', `${expectedName}: PDF 文件头错误`);
      if (format === 'json') {
        const value = JSON.parse(new TextDecoder().decode(bytes));
        if (group.kind === 'samples') assert(value.deviceId === deviceId && value.records.every((row) => row.device_id === deviceId), `${expectedName}: 样例设备 ID 错误`);
      }
      downloadCount += 1;
    }
  }
}

for (const model of models) {
  const deviceId = `${model.modelId}-PROTOCOL-SAMPLE`;
  for (const source of ['modbus', 'iec61850']) {
    for (const format of ['csv', 'xlsx', 'json', 'zip']) {
      const response = await request(`model-showcase/${model.sceneId}/downloads/samples?format=${format}&deviceId=${deviceId}&source=${source}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const sourceLabel = source === 'modbus' ? 'Modbus' : 'IEC61850';
      const expectedName = `${model.modelId}-${model.title}-设备ID-${deviceId}-${sourceLabel}数据样例${format === 'zip' ? '-全格式' : ''}.${format}`;
      assert(suggestedFileName(response.headers.get('content-disposition')) === expectedName, `${model.sceneId}/${source}/${format}: 协议样例文件名错误`);
      assert(bytes.length > 8, `${model.sceneId}/${source}/${format}: 协议样例为空`);
      if (format === 'json') {
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        assert(payload.source === source && payload.deviceId === deviceId && payload.records.length > 0, `${model.sceneId}/${source}: 协议 JSON 样例结构错误`);
        assert(Array.isArray(payload.requiredColumns) && payload.requiredColumns.length > 0 && payload.exceptionPolicy, `${model.sceneId}/${source}: 协议 JSON 样例缺少固定字段或异常处理说明`);
        const first = payload.records[0];
        if (source === 'modbus') assert(first.address && 'raw_value' in first && first.data_type, `${model.sceneId}: Modbus 样例缺少寄存器字段`);
        else assert(first.object_reference && 'value' in first && first.functional_constraint, `${model.sceneId}: IEC 61850 样例缺少对象字段`);
      }
      protocolSampleCount += 1;
    }
  }
}

async function waitForTask(sceneId, batchId) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const response = await request(`model-showcase/${sceneId}/data/imports/${batchId}`);
    const task = await response.json();
    if (task.stage === 'completed' || task.stage === 'failed') return task;
  }
  throw new Error(`上传任务超时：${batchId}`);
}

async function importFile(sceneId, deviceId, mode, fileName, bytes) {
  const created = await (await request(`model-showcase/${sceneId}/data/imports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId, mode, conflictPolicy: 'replace-existing', fileName, fileSize: bytes.length }),
  })).json();
  await request(`model-showcase/${sceneId}/data/imports/${created.batchId}/chunks/0`, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream', 'x-upload-offset': '0' },
    body: bytes,
  });
  await request(`model-showcase/${sceneId}/data/imports/${created.batchId}/complete`, { method: 'POST' });
  return waitForTask(sceneId, created.batchId);
}

async function previewProtocolFile(sceneId, source, deviceId, fileName, bytes, scl) {
  const created = await (await request(`model-showcase/${sceneId}/data/imports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source, deviceSource: 'new', deviceId, mode: 'append', conflictPolicy: 'replace-existing', fileName, fileSize: bytes.length, sclFileName: scl?.fileName, sclFileSize: scl?.bytes.length }),
  })).json();
  await request(`model-showcase/${sceneId}/data/imports/${created.batchId}/chunks/0`, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream', 'x-upload-offset': '0' },
    body: bytes,
  });
  if (scl) {
    await request(`model-showcase/${sceneId}/data/imports/${created.batchId}/scl/chunks/0`, {
      method: 'PUT',
      headers: { 'content-type': 'application/octet-stream', 'x-upload-offset': '0' },
      body: scl.bytes,
    });
  }
  return (await request(`model-showcase/${sceneId}/data/imports/${created.batchId}/preview`, { method: 'POST' })).json();
}

if (verifyLifecycle) {
  assert(dataRoot, 'PILOT_LIFECYCLE=1 时必须设置 PILOT_DATA_ROOT');
  const sceneId = models[0].sceneId;
  const deviceId = '2326-PREFLIGHT-CLEANUP';
  const sampleResponse = await request(`model-showcase/${sceneId}/downloads/samples?format=csv&deviceId=${deviceId}`);
  const sample = new Uint8Array(await sampleResponse.arrayBuffer());
  const sceneRoot = path.join(dataRoot, 'model-showcase', `${sceneId}__model-2326`);

  const first = await importFile(sceneId, deviceId, 'append', 'first.csv', sample);
  assert(first.stage === 'completed', `第一次导入失败：${first.error || ''}`);
  const firstPath = path.join(sceneRoot, 'batches', `${first.batchId}.csv`);
  assert(fs.existsSync(firstPath), '第一次导入的原始批次不存在');

  const second = await importFile(sceneId, deviceId, 'replace', 'second.csv', sample);
  assert(second.stage === 'completed', `覆盖导入失败：${second.error || ''}`);
  const secondPath = path.join(sceneRoot, 'batches', `${second.batchId}.csv`);
  assert(!fs.existsSync(firstPath) && fs.existsSync(secondPath), '覆盖导入未正确替换原始批次');

  await request(`model-showcase/${sceneId}/data?scope=device&target=${deviceId}`, { method: 'DELETE' });
  assert(!fs.existsSync(secondPath), '按设备删除后原始批次仍存在');

  for (const source of ['modbus', 'iec61850']) {
    const protocolDeviceId = `2326-${source.toUpperCase()}-VERIFY`;
    const before = await (await request(`model-showcase/${sceneId}/data/overview`)).json();
    const sampleResponse = await request(`model-showcase/${sceneId}/downloads/samples?format=json&deviceId=${protocolDeviceId}&source=${source}`);
    const protocolSample = new Uint8Array(await sampleResponse.arrayBuffer());
    const scl = source === 'iec61850' ? { fileName: '水轮机设备配置.cid', bytes: new TextEncoder().encode('<?xml version="1.0" encoding="UTF-8"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL"><IED name="VERIFY_IED"><AccessPoint name="S1"><Server><LDevice inst="LD0"><LN0 lnClass="LLN0" inst=""/></LDevice></Server></AccessPoint></IED></SCL>') } : undefined;
    const previewed = await previewProtocolFile(sceneId, source, protocolDeviceId, `${source}.json`, protocolSample, scl);
    assert(previewed.stage === 'previewed', `${source}: 未进入预检完成状态`);
    assert(previewed.preview.source === source, `${source}: 预检来源错误`);
    assert(previewed.preview.validRecordCount === 12, `${source}: 完整时间记录数错误`);
    assert(previewed.preview.mappedPointCount === previewed.preview.requiredPointCount, `${source}: 必需点位未全部映射`);
    assert(previewed.preview.unmappedPoints.length === 0, `${source}: 样例出现未映射点位`);
    const afterPreview = await (await request(`model-showcase/${sceneId}/data/overview`)).json();
    assert(afterPreview.recordCount === before.recordCount && !afterPreview.devices.includes(protocolDeviceId), `${source}: 预检阶段提前写入了数据`);
    if (scl) {
      const sclDirectory = path.join(sceneRoot, 'protocol', 'scl');
      assert(!fs.readdirSync(sclDirectory).some((name) => name.startsWith(previewed.batchId)), 'IEC 61850: 预检阶段提前永久保存了 SCL');
      assert(previewed.preview.scl?.fileName === scl.fileName && previewed.preview.scl.savedAfterConfirmation === false, 'IEC 61850: SCL 预检信息错误');
    }
    await request(`model-showcase/${sceneId}/data/imports/${previewed.batchId}/complete`, { method: 'POST' });
    const completed = await waitForTask(sceneId, previewed.batchId);
    assert(completed.stage === 'completed', `${source}: 确认导入失败：${completed.error || ''}`);
    const afterCommit = await (await request(`model-showcase/${sceneId}/data/overview`)).json();
    assert(afterCommit.devices.includes(protocolDeviceId), `${source}: 导入后未出现协议设备`);
    assert(afterCommit.batches.some((batch) => batch.batchId === previewed.batchId && batch.source === source), `${source}: 批次未保存协议来源`);
    if (scl) {
      const batch = afterCommit.batches.find((item) => item.batchId === previewed.batchId);
      const sclTarget = path.join(sceneRoot, ...batch.sclPath.split('/'));
      assert(batch.sclFileName === scl.fileName && batch.sclSha256 && fs.existsSync(sclTarget), 'IEC 61850: 确认后未永久保存 SCL 或批次元数据不完整');
      await request(`model-showcase/${sceneId}/data?scope=device&target=${protocolDeviceId}`, { method: 'DELETE' });
      assert(fs.existsSync(sclTarget), 'IEC 61850: 删除运行数据时不应删除永久归档的 SCL');
      continue;
    }
    await request(`model-showcase/${sceneId}/data?scope=device&target=${protocolDeviceId}`, { method: 'DELETE' });
  }

  const abnormalDeviceId = '2326-MODBUS-ABNORMAL';
  const abnormalResponse = await request(`model-showcase/${sceneId}/downloads/samples?format=json&deviceId=${abnormalDeviceId}&source=modbus`);
  const abnormalPayload = await abnormalResponse.json();
  abnormalPayload.records[0].raw_value = ' 150 ';
  abnormalPayload.records[1].raw_value = 'not-a-number';
  abnormalPayload.records[7].raw_value = '';
  abnormalPayload.records.push({ ...abnormalPayload.records[6], raw_value: abnormalPayload.records[6].raw_value + 0.1 });
  const abnormalBytes = new TextEncoder().encode(JSON.stringify(abnormalPayload));
  const abnormalPreview = await previewProtocolFile(sceneId, 'modbus', abnormalDeviceId, 'modbus-abnormal.json', abnormalBytes);
  assert(abnormalPreview.preview.correctedValueCount >= 1, '明显异常：简单格式未自动规范化或未计数');
  assert(abnormalPreview.preview.invalidValueCount >= 2, '明显异常：空值或非数值未剔除或未计数');
  assert(abnormalPreview.preview.incompleteRecordCount >= 1, '明显异常：缺点时间记录未拒绝或未计数');
  assert(abnormalPreview.preview.duplicatePointCount >= 1, '明显异常：重复点位未按最后值处理或未计数');
  await request(`model-showcase/${sceneId}/data/imports/${abnormalPreview.batchId}`, { method: 'DELETE' });

  // 最后一个重复点无效时，不能保留此前有效值；全部点无效的时间组也应计入拒绝统计。
  const duplicatePayload = await (await request(`model-showcase/${sceneId}/downloads/samples?format=json&deviceId=2326-LAST-INVALID&source=modbus`)).json();
  duplicatePayload.records.push({ ...duplicatePayload.records[0], raw_value: 'NaN' });
  const duplicatePreview = await previewProtocolFile(sceneId, 'modbus', '2326-LAST-INVALID', 'last-invalid.json', new TextEncoder().encode(JSON.stringify(duplicatePayload)));
  assert(duplicatePreview.preview.validRecordCount === 11 && duplicatePreview.preview.incompleteRecordCount === 1 && duplicatePreview.preview.duplicatePointCount === 1, '重复点最后值无效时仍保留了旧值');
  await request(`model-showcase/${sceneId}/data/imports/${duplicatePreview.batchId}`, { method: 'DELETE' });
  const invalidTime = duplicatePayload.records[0].timestamp;
  duplicatePayload.records.pop();
  duplicatePayload.records = duplicatePayload.records.map((row) => row.timestamp === invalidTime ? { ...row, raw_value: 'NaN' } : row);
  const emptyGroupPreview = await previewProtocolFile(sceneId, 'modbus', '2326-ALL-INVALID', 'all-invalid.json', new TextEncoder().encode(JSON.stringify(duplicatePayload)));
  assert(emptyGroupPreview.preview.validRecordCount === 11 && emptyGroupPreview.preview.incompleteRecordCount === 1, '全部点无效的时间组未计入缺点统计');
  await request(`model-showcase/${sceneId}/data/imports/${emptyGroupPreview.batchId}`, { method: 'DELETE' });

  const invalidColumns = structuredClone(abnormalPayload);
  invalidColumns.records = invalidColumns.records.map(({ unit_id, ...row }) => row);
  const invalidBytes = new TextEncoder().encode(JSON.stringify(invalidColumns));
  let fixedFieldRejected = false;
  try {
    await previewProtocolFile(sceneId, 'modbus', '2326-MODBUS-BAD-COLUMNS', 'bad-columns.json', invalidBytes);
  } catch (error) {
    fixedFieldRejected = String(error).includes('unit_id');
  }
  assert(fixedFieldRejected, '固定字段：缺少 unit_id 的 Modbus 长表未被明确拒绝');
}

console.log(`PILOT_DOWNLOAD_API_VERIFY_OK downloads=${downloadCount} protocolSamples=${protocolSampleCount} chineseNames=ok deviceIds=ok lifecycle=${verifyLifecycle ? 'ok' : 'skipped'}`);
