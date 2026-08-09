import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  MapPin, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge,
  Waves,
  Layers,
  Cpu,
  Radar,
  Upload,
  Trash2
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/DamGalleryMicroseism/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-DamGalleryMicroseism]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-DamGalleryMicroseism';
// 2026-07-13 新增：场景库测试方案 Phase 4.2 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '@/src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '@/src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实事件能量时间线 + 结论文案 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '@/src/scenarioLib/scenarioFieldReport';
const SCENARIO_ID = 'vibe-DamGalleryMicroseism';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const DamGalleryMicroseism: React.FC = () => {
  // 2026-07-13 重塑：真实数据接入，替换原来"rand>0.95 warning / rand>0.99 danger"的随机状态判断
  // （该判断本身有重叠 bug，danger 分支永远进不去），改成基于真实 eventEnergy/stabilityIndex 阈值判断。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const latest = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;

  const eventEnergy = latest ? Number(latest.eventEnergy) : 1.2;
  const stabilityIndex = latest ? Number(latest.stabilityIndex) : 0.98;
  const waterLevel = latest ? Number(latest.waterLevel) : 175.4;
  const crackWidth = latest ? Number(latest.crackWidth) : 0.02;
  const seepageFlow = latest ? Number(latest.seepageFlow) : 12;
  const eventCount24h = unifiedData.length > 0 ? unifiedData.length : 124;

  const status: 'normal' | 'warning' | 'danger' =
    eventEnergy > 2.0 || stabilityIndex < 0.85 ? 'danger' : eventEnergy > 1.0 || stabilityIndex < 0.95 ? 'warning' : 'normal';

  // 2026-07-14 新增：真实事件能量时间线——按上传数据的实际时间顺序展示每条记录的震级，
  // 微震监测本质是"离散事件序列"，用柱状时间线比连续曲线更贴合物理含义。
  const eventTimeline = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        energy: Number(row.eventEnergy),
      }))
    : [{ time: '--', energy: eventEnergy }];

  // 2026-07-14 新增：真实数据驱动的结论文案（替换原来与数值无关的固定文案）。
  const conclusionText =
    status === 'danger'
      ? `最新事件能量 ML ${eventEnergy.toFixed(1)}、结构稳定性指数 ${stabilityIndex.toFixed(2)}，已超出安全阈值。廊道桩号 0+450 附近存在明显活动性增强迹象，建议立即安排现场裂缝复核并加密监测频次。`
      : status === 'warning'
      ? `最新事件能量 ML ${eventEnergy.toFixed(1)}、结构稳定性指数 ${stabilityIndex.toFixed(2)}，较基线略有上升。建议加强该区域裂缝巡检，密切关注后续趋势。`
      : `最新事件能量 ML ${eventEnergy.toFixed(1)}、结构稳定性指数 ${stabilityIndex.toFixed(2)}，均在安全范围内，廊道结构状态平稳。`;

  const handleClear = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '大坝廊道微震监测分析报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '最大事件能量', value: eventEnergy.toFixed(1), unit: 'ML' },
        { label: '结构稳定性指数', value: stabilityIndex.toFixed(2) },
        { label: '库水位', value: waterLevel.toFixed(1), unit: 'm' },
        { label: '裂缝开展指数', value: crackWidth.toFixed(2), unit: 'mm' },
        { label: '渗流量', value: seepageFlow.toFixed(0), unit: 'L/min' },
        { label: '系统状态', value: status === 'danger' ? '危险' : status === 'warning' ? '警告' : '正常' },
      ],
      conclusion: conclusionText,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <Radar className="text-rose-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              大坝廊道微震监测系统
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest">Seismic Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: DAM-MS-01</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> 廊道桩号: 0+450</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统状态</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                status === 'normal' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              <span className={`text-sm font-mono font-bold ${
                status === 'normal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }`}>{status.toUpperCase()}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1 transition-colors"
            >
              <Upload size={14} /> 数据入库
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-1 transition-colors"
            >
              <Trash2 size={14} /> 一键清空
            </button>
            <button className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 transition-all">
              <Settings size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="大坝廊道微震数字孪生" 
            subtitle="DAM GALLERY SEISMIC DIGITAL TWIN" 
            className="flex-1 min-h-[450px]"
            highlight
          >
            <div className="absolute inset-0 z-0 scale-110">
              <ThreeScene status={status} intensity={Math.max(0, Math.min(1, eventEnergy / 3))} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 border-l-2 border-rose-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">最大事件能量</div>
                    <div className="text-2xl font-mono font-bold text-rose-400">ML {eventEnergy.toFixed(1)} <span className="text-xs">Mag</span></div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-sky-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">结构稳定性</div>
                    <div className="text-2xl font-mono font-bold text-sky-400">{stabilityIndex.toFixed(2)} <span className="text-xs">Index</span></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">24h 事件统计</div>
                    <div className="text-2xl font-mono font-bold text-white">{eventCount24h} <span className="text-xs text-slate-500">Events</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <Zap size={10} /> 定位精度: ±2.5m
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">当前库水位</div>
                    <div className="text-xl font-mono font-bold text-white">{waterLevel.toFixed(1)} <span className="text-xs text-slate-500">m</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-slate-400 hover:text-rose-400">
                    <Radar size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-slate-400 hover:text-rose-400">
                    <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="事件能量时间线（真实数据）" subtitle="SEISMIC EVENT ENERGY TIMELINE">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Bar dataKey="energy" name="事件能量(ML)" radius={[3, 3, 0, 0]}>
                    {eventTimeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.energy > 2.0 ? '#f43f5e' : entry.energy > 1.0 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能预警与分析" subtitle="INTELLIGENT SEISMIC ANALYSIS">
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border ${status === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 mb-1 ${status === 'danger' ? 'text-rose-400' : status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  <AlertTriangle size={14} />
                  <span className="text-xs font-bold uppercase">
                    {status === 'danger' ? '活动性增强预警' : status === 'warning' ? '活动性关注' : '状态正常'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {conclusionText}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">裂缝开展指数</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{crackWidth.toFixed(2)} <span className="text-xs font-normal opacity-50">mm</span></div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">渗流量</div>
                  <div className="text-xl font-bold font-mono text-white">{seepageFlow.toFixed(0)} <span className="text-xs font-normal opacity-50">L/min</span></div>
                </div>
              </div>

              <button
                onClick={handleExportReport}
                className="w-full py-3 bg-rose-600 border border-rose-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                导出微震分析报告
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
        metricsHint="eventEnergy(ML) / stabilityIndex(0-1) / waterLevel(m) / crackWidth(mm) / seepageFlow(L/min)"
      />
    </div>
  );
};

export default DamGalleryMicroseism;
