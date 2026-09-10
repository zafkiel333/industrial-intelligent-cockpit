import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const configuredRoot = process.env.MODEL_DATA_ROOT;
assert.ok(configuredRoot, 'MODEL_DATA_ROOT is required');
const dataRoot = path.resolve(configuredRoot);
const expectedSuffix = path.join('model-showcase', 'sim-visual-hydro-turbine__model-2326');
assert.ok(dataRoot.endsWith(expectedSuffix), `Unexpected model data root: ${dataRoot}`);

const backupRoot = path.resolve(process.env.MIGRATION_BACKUP_ROOT || path.join(dataRoot, '..', '..', '..', 'migrations', 'hydro-identifier-sanitization'));
assert.notEqual(backupRoot, dataRoot);
fs.mkdirSync(backupRoot, { recursive: true });

const replacements = new Map([
  ['2326-01', '2326-JZ-01'],
  ['2326-DEMO-ABNORMAL-0908', '2326-JZ-02'],
  ['2326-DEMO-SURGE-0908', '2326-JZ-03'],
  ['260909-dv1', '2326-JZ-04'],
  ['11111111111', '2326-JZ-05'],
  ['260910-001', '2326-JZ-06'],
  ['hydro-abnormal-180min.csv', '水轮机组工况记录-02.csv'],
  ['hydro-surge-240min.csv', '水轮机组工况记录-03.csv'],
  ['initial-data.json', '水轮机组历史运行数据-01.json'],
]);

const changedFiles = new Set();

function transformed(text) {
  let result = text;
  for (const [from, to] of replacements) result = result.split(from).join(to);
  return result;
}

function backup(target) {
  const relative = path.relative(dataRoot, target);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Unsafe target: ${target}`);
  const backupTarget = path.join(backupRoot, relative);
  fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
  if (!fs.existsSync(backupTarget)) fs.copyFileSync(target, backupTarget);
}

function atomicWrite(target, content) {
  backup(target);
  const temporary = `${target}.migration-${process.pid}`;
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, target);
  changedFiles.add(path.relative(dataRoot, target));
}

function updateTextFile(target) {
  const original = fs.readFileSync(target, 'utf8');
  const updated = transformed(original);
  if (updated !== original) atomicWrite(target, updated);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(?:csv|json|jsonl|md|txt)$/i.test(entry.name)) updateTextFile(target);
  }
}

const statePath = path.join(dataRoot, 'current', 'state.json');
assert.ok(fs.existsSync(statePath), `Missing state: ${statePath}`);
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
state.records = state.records.map(record => ({ ...record, device_id: replacements.get(record.device_id) || record.device_id }));
state.batches = state.batches.map(batch => ({
  ...batch,
  deviceId: replacements.get(batch.deviceId) || batch.deviceId,
  fileName: replacements.get(batch.fileName) || batch.fileName,
}));

for (const batch of state.batches) {
  const batchDirectory = path.join(dataRoot, 'batches');
  const batchFileName = fs.existsSync(batchDirectory)
    ? fs.readdirSync(batchDirectory).find(file => file.startsWith(`${batch.batchId}.`))
    : null;
  if (!batchFileName) continue;
  const batchPath = path.join(batchDirectory, batchFileName);
  if (/\.(?:csv|json)$/i.test(batchFileName)) updateTextFile(batchPath);
  const bytes = fs.readFileSync(batchPath);
  batch.fileSize = bytes.byteLength;
  batch.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
}

atomicWrite(statePath, `${JSON.stringify(state, null, 2)}\n`);
walk(path.join(dataRoot, 'validation'));
walk(path.join(dataRoot, 'logs'));

console.log('HYDRO_OPERATIONAL_IDENTIFIERS_SANITIZED', JSON.stringify({
  dataRoot,
  backupRoot,
  changedFiles: [...changedFiles].sort(),
}));
