import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/SpillwayMonitoring/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-spillway-monitoring]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-spillway-monitoring';
// 2026-07-13 新增：场景库测试方案 Phase 4.1 —— 真实后端数据流转（重大修改）。
// 参照 unit1-predictive 模式：Excel 上传 → server.ts 解析 → 前端联动。
import { useScenarioRealData } from '@/src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '@/src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实数据驱动的历史趋势图 + 结论文案 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '@/src/scenarioLib/scenarioFieldReport';
const SCENARIO_ID = 'cv-spillway-monitoring';
import { ErosionZone, SpillwayState } from '@/components/computer-visual-inspection/SpillwayMonitoring/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import {
  Waves,
  Activity,
  AlertTriangle,
  Maximize2,
  BarChart3,
  History,
  Settings,
  Droplets,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Upload,
  Trash2
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const MOCK_ZONES: ErosionZone[] = [
  { id: '1', position: [-2, 4, -4], depth: 45, area: 1.2, severity: 'high' },
  { id: '2', position: [3, 2, 0], depth: 12, area: 0.5, severity: 'low' },
];

const RADAR_DATA = [
  { subject: '冲刷深度', A: 85, fullMark: 100 },
  { subject: '结构强度', A: 70, fullMark: 100 },
  { subject: '振动频率', A: 45, fullMark: 100 },
  { subject: '表面平整', A: 30, fullMark: 100 },
  { subject: '抗震等级', A: 90, fullMark: 100 },
];

const SpillwayMonitoringView: React.FC = () => {
  // 2026-07-13 重塑：真实数据接入，替换原来的静态占位值。
  const { unifiedData, loading, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const latest = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;
  const state: SpillwayState = {
    flowRate: latest ? Number(latest.flowRate) : 1245.5,
    waterLevel: latest ? Number(latest.waterLevel) : 15.2,
    vibrationLevel: latest ? Number(latest.vibrationLevel) : 2.4,
  };
  // 流量归一化驱动 3D 场景流速表现（设计参考流量上限 1500 m³/s，与右侧历史趋势图量级一致）
  const flowIntensity = Math.max(0, Math.min(1, state.flowRate / 1500));

  // 2026-07-14 新增：真实历史趋势——直接取上传数据的完整时间序列（而非静态 mock 数组）。
  const flowTrend = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        flow: Number(row.flowRate),
        level: Number(row.waterLevel),
      }))
    : [{ time: '--', flow: state.flowRate, level: state.waterLevel }];

  // 2026-07-14 新增：真实数据驱动的冲刷风险结论（替换原来与数值无关的固定文案）。
  const riskLevel: 'critical' | 'warning' | 'normal' =
    state.flowRate > 1200 || state.vibrationLevel > 4 ? 'critical' : state.flowRate > 900 || state.vibrationLevel > 3 ? 'warning' : 'normal';
  const conclusionText =
    riskLevel === 'critical'
      ? `当前流量 ${state.flowRate}m³/s、结构振动 ${state.vibrationLevel}mm/s，均已进入高冲刷风险区间。建议立即开启辅助溢洪道分担泄流压力，并对消能池底板安排应急巡检。`
      : riskLevel === 'warning'
      ? `当前流量 ${state.flowRate}m³/s 处于较高水平，结构振动 ${state.vibrationLevel}mm/s 略有上升。建议加强对北侧冲刷区域的巡检频次，密切关注变化趋势。`
      : `当前流量 ${state.flowRate}m³/s、结构振动 ${state.vibrationLevel}mm/s，均在安全范围内，溢洪道结构完整性良好。`;

  const handleClear = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '溢洪道冲刷与结构完整性巡检报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '实时流量', value: state.flowRate.toFixed(1), unit: 'm³/s' },
        { label: '上游水位', value: state.waterLevel.toFixed(1), unit: 'm' },
        { label: '结构振动', value: state.vibrationLevel.toFixed(2), unit: 'mm/s' },
        { label: '冲刷风险等级', value: riskLevel === 'critical' ? '严重' : riskLevel === 'warning' ? '关注' : '正常' },
      ],
      conclusion: conclusionText,
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <Waves className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">溢洪道冲刷与结构完整性监测</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Zap size={12} /> SPILLWAY_SECTOR_NORTH
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Structural Health AI Active</span>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="text-[10px] px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1 transition-colors"
              >
                <Upload size={10} /> 数据入库
              </button>
              <button
                onClick={handleClear}
                className="text-[10px] px-2 py-1 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-1 transition-colors"
              >
                <Trash2 size={10} /> 一键清空
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">实时流量</div>
            <div className="text-xl font-black text-white">{state.flowRate} <span className="text-xs">m³/s</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">结构振动</div>
            <div className="text-xl font-black text-blue-400">{state.vibrationLevel} <span className="text-xs">mm/s</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Visual Analysis */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="冲刷深度多维分析">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar
                    name="Spillway"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="异常区域清单" className="flex-1">
            <div className="space-y-3">
              {MOCK_ZONES.map(zone => (
                <div key={zone.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex justify-between items-center group hover:border-blue-500/50 transition-all">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">区域 ID: {zone.id}</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      冲刷深度: {zone.depth}mm
                      {zone.severity === 'high' && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[8px] rounded uppercase">Critical</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">受损面积</div>
                    <div className="text-sm font-bold text-blue-400">{zone.area} m²</div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <ShieldCheck size={12} /> 结构加固建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到北侧溢洪道中段存在深层冲刷，建议在枯水期进行环氧砂浆修补，并加强消能池底板监测。
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Twin */}
        <div className="col-span-6 relative">
          <SciFiCard title="溢洪道数字孪生系统" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene erosionZones={MOCK_ZONES} flowIntensity={flowIntensity} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-blue-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Gate_01: Fully Open</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Sensor_B4: High Vibration</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '上游水位', value: '152.4m', icon: Droplets, color: 'text-blue-400' },
                { label: '下游水位', value: '137.2m', icon: Waves, color: 'text-cyan-400' },
                { label: '消能效率', value: '94.2%', icon: Activity, color: 'text-green-400' },
                { label: '结构寿命', value: '42.5Y', icon: History, color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={12} className={item.color} />
                    <span className="text-[8px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-lg font-black text-white tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Right: Flow & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="泄洪流量/水位历史趋势（真实数据）">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={flowTrend}>
                  <defs>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="flow" stroke="#3b82f6" fontSize={9} tickLine={false} axisLine={false} width={30} />
                  <YAxis yAxisId="level" orientation="right" stroke="#22d3ee" fontSize={9} tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area yAxisId="flow" type="monotone" dataKey="flow" name="流量(m³/s)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} />
                  <Line yAxisId="level" type="monotone" dataKey="level" name="水位(m)" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能预警与决策" className="flex-1">
            <div className="space-y-4">
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${riskLevel === 'critical' ? 'bg-red-500/10 border-red-500/30' : riskLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <AlertTriangle className={riskLevel === 'critical' ? 'text-red-500 mt-0.5' : riskLevel === 'warning' ? 'text-yellow-500 mt-0.5' : 'text-emerald-500 mt-0.5'} size={18} />
                <div>
                  <div className={`text-xs font-bold ${riskLevel === 'critical' ? 'text-red-400' : riskLevel === 'warning' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {riskLevel === 'critical' ? '高冲刷风险预警' : riskLevel === 'warning' ? '冲刷风险关注' : '结构状态正常'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {conclusionText}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护优先级
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">闸门维护</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">底板冲刷</span>
                    <span className="text-red-500">CRITICAL</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">侧墙裂缝</span>
                    <span className="text-yellow-500">MEDIUM</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportReport}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <Settings size={14} />
                生成详细巡检报告
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
        metricsHint="flowRate(m³/s) / waterLevel(m) / vibrationLevel(mm/s)"
      />
    </div>
  );
};

export default SpillwayMonitoringView;
