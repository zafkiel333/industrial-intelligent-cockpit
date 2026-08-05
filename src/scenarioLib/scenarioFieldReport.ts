// 2026-07-14 新增：场景库测试方案 Phase 4 修正 —— 试点页面通用"现场报告导出"工具。
// 供 10 个 Phase 4 试点页面共用：把当前真实数据的关键指标 + 结论文案，
// 生成一份 Markdown 报告并触发浏览器下载。纯前端实现，不经过后端接口。
export interface ReportMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface ScenarioReportOptions {
  scenarioId: string;
  title: string;
  metrics: ReportMetric[];
  conclusion: string;
  dataPointCount: number;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export function downloadScenarioReport(opts: ScenarioReportOptions): void {
  const now = new Date();
  const lines: string[] = [];
  lines.push(`# ${opts.title}`);
  lines.push('');
  lines.push(`- 场景 ID: ${opts.scenarioId}`);
  lines.push(`- 报告生成时间: ${now.toLocaleString('zh-CN')}`);
  lines.push(`- 数据点数: ${opts.dataPointCount > 0 ? opts.dataPointCount : '暂无上传数据（当前为默认展示值）'}`);
  lines.push('');
  lines.push('## 关键指标');
  lines.push('');
  lines.push('| 指标 | 数值 |');
  lines.push('|---|---|');
  opts.metrics.forEach((m) => {
    lines.push(`| ${m.label} | ${m.value}${m.unit ? ' ' + m.unit : ''} |`);
  });
  lines.push('');
  lines.push('## 结论与建议');
  lines.push('');
  lines.push(opts.conclusion);
  lines.push('');
  lines.push('---');
  lines.push('*本报告由系统根据当前实时/上传数据自动生成*');

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${opts.title}_${now.getTime()}.md`);
}
