import fs from 'fs';
import path from 'path';
import {
  generateHydroValidationCase,
  hydroValidationCsv,
  hydroValidationDefinitions,
} from '../src/remoteModelShowcase/hydroValidationSuite';

const root = path.resolve(
  process.cwd(),
  'src/data/model-showcase/sim-visual-hydro-turbine__model-2326/reference/forecast-validation',
);
fs.mkdirSync(root, { recursive: true });

const manifest = hydroValidationDefinitions();
for (const definition of manifest) {
  const data = generateHydroValidationCase(definition.caseId);
  const directory = path.join(root, definition.caseId);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${definition.caseId}-观测数据.csv`), `\ufeff${hydroValidationCsv(data.observation, false)}`, 'utf8');
  fs.writeFileSync(path.join(directory, `${definition.caseId}-验证数据.csv`), `\ufeff${hydroValidationCsv(data.verification, true)}`, 'utf8');
}

fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({
  schemaVersion: 1,
  modelId: 2326,
  modelName: '水轮机多工况数字孪生分析',
  generatedAt: '2026-09-09T00:00:00.000Z',
  caseCount: manifest.length,
  observationPurpose: '用于冻结预测结果的连续观测窗口',
  verificationPurpose: '用于预测后对照的连续后续实测窗口',
  cases: manifest,
}, null, 2), 'utf8');

fs.writeFileSync(path.join(root, 'README.md'), `# 水轮机预测验证数据集

本目录包含 50 组按时间连续的观测数据与验证数据。每组观测窗口为 180 分钟，验证窗口为紧随其后的 360 分钟，采样间隔 60 秒。

- 先上传 \`<组号>-观测数据.csv\`，系统仅依据该窗口冻结预测和状态结论。
- 再上传同组 \`<组号>-验证数据.csv\`，系统将预测与后续实测对齐并计算误差和结论命中情况。
- 实际状态与故障类型只放在验证数据中；页面在验证文件上传前不显示实际标签。
- 全部数值使用水轮机页面既有六项字段、单位与工程参考范围，包含正常运行、四类异常及少量弱先兆或工况恢复情况。
- \`manifest.json\` 是程序读取的 50 组清单，\`水轮机预测验证数据集索引.xlsx\` 用于人工核对组号、设备、记录数和时间边界。
- 原始数据集存放于 \`reference/forecast-validation/\`；页面产生的冻结预测、上传副本和核验结果单独存放于模型目录的 \`validation/\`，互不覆盖。
`, 'utf8');

console.log(`HYDRO_VALIDATION_SUITE_OK cases=${manifest.length} root=${root}`);
