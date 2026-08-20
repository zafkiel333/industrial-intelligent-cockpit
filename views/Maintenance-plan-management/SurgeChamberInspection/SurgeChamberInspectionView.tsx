import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/SurgeChamberInspection/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-16]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-16';
// 2026-07-13 新增：场景库测试方案 Phase 4.4 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '../../../src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '../../../src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实温度/压力/振动趋势图 + 真实风险列表 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '../../../src/scenarioLib/scenarioFieldReport';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const SCENARIO_ID = 'mpm-16';
import { Upload, Trash2, FileDown } from 'lucide-react';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';

export const SurgeChamberInspectionView: React.FC = () => {
  // 2026-07-13 重塑：temperature/pressure/vibration 改为真实数据；
  // status(工单状态)/progress(检修进度) 属于工单流程状态而非传感器读数，保持原有随机模拟。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [workOrderState, setWorkOrderState] = useState({ status: '正常', progress: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkOrderState({
        status: Math.random() > 0.8 ? '异常' : '正常',
        progress: Math.floor(Math.random() * 100),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const latest = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;
  const data = {
    status: workOrderState.status,
    progress: workOrderState.progress,
    temperature: latest ? Number(latest.temperature) : 45,
    pressure: latest ? Number(latest.pressure) : 12,
    vibration: latest ? Number(latest.vibration) : 0.5,
  };

  const handleClear = async () => {
    if (!window.confirm('确定要清空全部已上传数据吗？清空后无法恢复。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const mockParams = [
    { label: '系统状态', value: data.status || '正常', status: data.status === '异常' ? 'critical' : 'normal' },
    { label: '当前进度', value: data.progress || 0, unit: '%' },
    { label: '核心温度', value: (data.temperature || 45).toFixed(1), unit: '°C', status: data.temperature > 55 ? 'warning' : 'normal' },
    { label: '运行压力', value: (data.pressure || 12).toFixed(2), unit: 'MPa' },
    { label: '振动烈度', value: (data.vibration || 0.5).toFixed(2), unit: 'mm/s' },
    { label: '能耗效率', value: '92.4', unit: '%' }
  ];

  const mockTimeline = [
    { time: '08:00', title: '安全隔离与断电', status: 'done' },
    { time: '09:30', title: '设备拆解与排查', status: 'done' },
    { time: '11:00', title: '核心部件更换', status: 'active' },
    { time: '14:00', title: '系统调试与校验', status: 'pending' },
    { time: '16:30', title: '恢复供电与试运行', status: 'pending' }
  ];

  const mockResources = {
    workers: 12,
    tools: ['液压扳手', '千斤顶', '扭矩仪', '绝缘手套'],
    parts: [
      { name: '高压密封圈', qty: 4 },
      { name: '润滑脂 (桶)', qty: 2 },
      { name: '滤芯组件', qty: 6 }
    ]
  };

  // 2026-07-14 新增：真实风险列表——按真实 temperature/pressure/vibration 阈值动态生成
  // （替换原来与数值无关的静态清单），并补充真实趋势图与现场报告导出。
  const realRisks: { level: 'high' | 'medium' | 'low'; desc: string }[] = [];
  if (data.temperature > 55) realRisks.push({ level: 'high', desc: `核心温度 ${data.temperature.toFixed(1)}°C 已超过 55°C 报警阈值，存在密封件过热老化风险` });
  if (data.pressure > 16) realRisks.push({ level: 'high', desc: `运行压力 ${data.pressure.toFixed(2)}MPa 偏高，高压流体泄漏风险上升，作业需穿戴防护服` });
  if (data.vibration > 1.5) realRisks.push({ level: 'medium', desc: `振动烈度 ${data.vibration.toFixed(2)}mm/s 偏高，建议检查基础紧固与联轴器对中` });
  realRisks.push({ level: 'low', desc: '受限空间及交叉作业注意通风与协调，遵循标准作业流程' });

  const trendSeries = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        temperature: Number(row.temperature),
        pressure: Number(row.pressure),
        vibration: Number(row.vibration),
      }))
    : [{ time: '--', temperature: data.temperature, pressure: data.pressure, vibration: data.vibration }];

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '调压室结构安全巡检报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '核心温度', value: data.temperature.toFixed(1), unit: '°C' },
        { label: '运行压力', value: data.pressure.toFixed(2), unit: 'MPa' },
        { label: '振动烈度', value: data.vibration.toFixed(2), unit: 'mm/s' },
        { label: '工单状态', value: data.status },
        { label: '检修进度', value: data.progress.toString(), unit: '%' },
      ],
      conclusion: realRisks.some((r) => r.level === 'high')
        ? '监测到高优先级风险项，建议提前安排现场复核并按 SOP 执行相应防护措施。'
        : '当前各项参数均在正常范围内，按既定 SOP 计划推进检修作业即可。',
    });
  };

  const mockDocs = [
    { name: '设备维护手册_v2.pdf', type: 'PDF', date: '2026-01-15' },
    { name: '安全操作规程.doc', type: 'DOCX', date: '2026-02-20' },
    { name: '历史检修记录.xls', type: 'EXCEL', date: '2026-03-01' }
  ];

  const mockChartData = [
    { name: '周一', value: 85 },
    { name: '周二', value: 88 },
    { name: '周三', value: 92 },
    { name: '周四', value: 90 },
    { name: '周五', value: 87 },
    { name: '周六', value: 95 },
    { name: '周日', value: 91 }
  ];

  const mockRadarData = [
    { subject: '可靠性', value: 90 },
    { subject: '效率', value: 85 },
    { subject: '安全性', value: 95 },
    { subject: '经济性', value: 80 },
    { subject: '环保', value: 88 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wider">调压井结构安全巡检计划</h1>
          <p className="text-slate-400 mt-2">智能维保管理系统 / 实时监控与调度</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload size={14} /> 数据入库
          </button>
          <button
            onClick={handleClear}
            className="text-sm px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> 一键清空
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        <SciFiCard title="标准作业流程 (SOP)" className="h-[150px] overflow-y-auto">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mockTimeline.map((step, i) => (
              <div key={i} className="flex-shrink-0 w-48 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${step.status === 'done' ? 'bg-green-500' : step.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono text-slate-400">{step.time}</span>
                </div>
                <p className={`text-sm ${step.status === 'active' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>{step.title}</p>
              </div>
            ))}
          </div>
        </SciFiCard>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SciFiCard title="3D 结构解析" className="h-[400px]">
            <div className="absolute inset-0 m-4 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/50">
              <ThreeScene {...data} />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
          <SciFiCard title="温度/压力/振动趋势（真实数据）" className="h-[400px]">
            <div className="h-full w-full p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="temperature" name="温度(°C)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pressure" name="压力(MPa)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="vibration" name="振动(mm/s)" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SciFiCard title="参数矩阵" className="h-[250px] overflow-y-auto">
            <ParameterWidget params={mockParams} />
          </SciFiCard>
          <SciFiCard title="安全风险评估" className="h-[250px] overflow-y-auto">
            <div className="flex flex-col gap-3 h-full">
              <RiskWidget risks={realRisks} />
              <button
                onClick={handleExportReport}
                className="mt-auto w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                导出巡检报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="temperature(°C) / pressure(MPa) / vibration(mm/s)"
      />
    </div>
  );
};
