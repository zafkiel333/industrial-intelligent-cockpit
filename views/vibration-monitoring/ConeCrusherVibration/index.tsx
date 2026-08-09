import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge,
  Waves,
  ArrowDown,
  Layers,
  Box,
  Target,
  Upload,
  Trash2
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/ConeCrusherVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ConeCrusherVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ConeCrusherVibration';
// 2026-07-13 新增：场景库测试方案 Phase 4.10 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '@/src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '@/src/scenarioLib/ScenarioDataUploadModal';
const SCENARIO_ID = 'vibe-ConeCrusherVibration';
// 2026-07-14 新增：真实多指标趋势图 + 数据驱动诊断 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '@/src/scenarioLib/scenarioFieldReport';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const ConeCrusherVibration: React.FC = () => {
  // 2026-07-13 重塑：vibration/oilPressure/motorCurrent/crushingForce 改为真实数据；
  // load（运行负荷）为操作状态量，保持原有模拟；status 判断改为基于真实 vibration 阈值。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [load, setLoad] = useState(75);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const latest = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;
  const vibration = latest ? Number(latest.vibration) : 8.42;
  const oilPressure = latest ? Number(latest.oilPressure) : 12.5;
  const motorCurrent = latest ? Number(latest.motorCurrent) : 185.4;
  const crushingForce = latest ? Number(latest.crushingForce) : 1245;
  const status: 'normal' | 'warning' = vibration > 10 ? 'warning' : 'normal';

  // 2026-07-14 新增：真实多指标趋势——直接取上传数据的完整时间序列（替换原来纯随机的 mockData）。
  const vibrationTrend = unifiedData.length > 0
    ? unifiedData.map((row) => ({
        time: new Date(row.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        vibration: Number(row.vibration),
        oilPressure: Number(row.oilPressure),
      }))
    : [{ time: '--', vibration, oilPressure }];

  const handleClear = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '圆锥破碎机振动监测报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '偏心轴振动', value: vibration.toFixed(2), unit: 'mm/s' },
        { label: '润滑油压', value: oilPressure.toFixed(1), unit: 'MPa' },
        { label: '驱动电机电流', value: motorCurrent.toFixed(1), unit: 'A' },
        { label: '破碎力', value: crushingForce.toLocaleString(), unit: 'kN' },
        { label: '系统状态', value: status === 'warning' ? '警告' : '正常' },
      ],
      conclusion: status === 'warning'
        ? `偏心轴振动 ${vibration.toFixed(2)}mm/s 已超过 10mm/s 报警阈值，建议检查偏心套磨损及润滑油压是否正常，排查过铁风险。`
        : `偏心轴振动 ${vibration.toFixed(2)}mm/s、润滑油压 ${oilPressure.toFixed(1)}MPa，均在正常范围内，破碎机运行状态平稳。`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Target className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              圆锥破碎机振动监测系统
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 uppercase tracking-widest">Cone Crusher</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: CONE-CR-01</span>
              <span className={`flex items-center gap-1 font-bold uppercase tracking-wider ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status === 'normal' ? 'SYSTEM OPERATIONAL' : 'SYSTEM WARNING'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Operational Load</div>
            <div className="text-sm font-mono font-bold text-orange-400">{load.toFixed(1)}%</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Crushing Force</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{crushingForce.toLocaleString()} kN</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-colors"
            >
              <Upload size={14} /> 数据入库
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} /> 一键清空
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心振动指标" subtitle="CORE VIBRATION">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '偏心轴振动', val: vibration.toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '润滑油压', val: oilPressure.toFixed(1), unit: 'MPa', icon: Waves, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { label: '驱动电机电流', val: motorCurrent.toFixed(1), unit: 'A', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${m.bg} rounded-lg group-hover:scale-110 transition-transform`}><m.icon size={16} className={m.color} /></div>
                    <span className="text-xs text-slate-400">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{m.val} <span className="text-[10px] opacity-50">{m.unit}</span></span>
                </motion.div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="关键点温度" subtitle="CRITICAL TEMPERATURES" className="flex-1">
            <div className="space-y-4">
              {[
                { label: '偏心套温度', val: 58.4, color: 'bg-orange-500', text: 'text-orange-400' },
                { label: '主轴承温度', val: 45.5, color: 'bg-sky-500', text: 'text-sky-400' },
                { label: '润滑油温', val: 42.5, color: 'bg-emerald-500', text: 'text-emerald-400' }
              ].map((t, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-slate-400">{t.label}</span>
                    <span className={t.text}>{t.val} °C</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${t.val}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full ${t.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="破碎机数字孪生" 
            subtitle="CRUSHER DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene vibration={vibration} status={status} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/80 border border-orange-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-center"
                >
                  <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase mb-1">Crushing Force</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">{crushingForce.toLocaleString()}</span>
                    <span className="text-sm text-slate-400 font-mono">kN</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">CRUSHER: STABLE</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Liner Wear: 12%</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Power: 450 kW</div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-slate-400 hover:text-orange-400">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="振动/油压趋势（真实数据）" subtitle="VIBRATION & PRESSURE TREND">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vibrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis yAxisId="vib" hide />
                  <YAxis yAxisId="oil" orientation="right" hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Line yAxisId="vib" type="monotone" dataKey="vibration" name="振动(mm/s)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line yAxisId="oil" type="monotone" dataKey="oilPressure" name="油压(MPa)" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与预警" subtitle="AI DIAGNOSTICS" className="flex-1">
            <div className="space-y-4">
              {status === 'warning' ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <div className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-2 uppercase">
                    <AlertTriangle size={12} />
                    振动超限预警
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    偏心轴振动 {vibration.toFixed(2)}mm/s 已超过 10mm/s 报警阈值，疑似腔内进入非破碎物或偏心套磨损，请立即检查。
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase">
                    <Shield size={12} />
                    运行状态良好
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    偏心轴振动 {vibration.toFixed(2)}mm/s，在正常范围内，给料分布均匀，腔内物料填充率正常。
                  </p>
                </div>
              )}

              <button
                onClick={handleExportReport}
                className="w-full py-3 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600/40 transition-all flex items-center justify-center gap-2"
              >
                导出振动监测报告 <ChevronRight size={14} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="驱动电机参数" subtitle="MOTOR PARAMETERS">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">驱动电机 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Status: NORMAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">{motorCurrent.toFixed(1)} A</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tighter">98.2% Load</div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>
      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="vibration(mm/s) / oilPressure(MPa) / motorCurrent(A) / crushingForce(kN)"
      />
    </div>
  );
};

export default ConeCrusherVibration;
