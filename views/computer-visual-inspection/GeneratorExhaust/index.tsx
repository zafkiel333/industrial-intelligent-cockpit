import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  Eye, 
  BarChart3, 
  ShieldCheck,
  Zap,
  RefreshCcw,
  History,
  Cpu,
  Wind,
  Cloud,
  Thermometer,
  Gauge,
  TrendingDown,
  Maximize2,
  Search,
  ShieldAlert,
  Layers,
  ArrowDownToLine,
  Flame,
  Droplets
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/GeneratorExhaust/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-generator-exhaust]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-generator-exhaust';
import { ExhaustStatus } from '../../../components/computer-visual-inspection/GeneratorExhaust/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  co2: 400 + Math.random() * 100,
  nox: 50 + Math.random() * 20,
  opacity: 0.1 + Math.random() * 0.2
}));

const GeneratorExhaust: React.FC = () => {
  const [status, setStatus] = useState<ExhaustStatus>({
    smokeColor: 'normal',
    opacity: 0.15,
    co2Level: 420,
    noxLevel: 55,
    efficiency: 94,
    isAbnormal: false,
    engineRpm: 1500
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isAbnormal = Math.random() > 0.8;
        const smokeColor = isAbnormal ? (Math.random() > 0.5 ? 'black' : 'white') : 'normal';
        return {
          ...prev,
          smokeColor,
          opacity: isAbnormal ? 0.6 + Math.random() * 0.3 : 0.1 + Math.random() * 0.1,
          co2Level: isAbnormal ? 600 + Math.random() * 200 : 400 + Math.random() * 50,
          noxLevel: isAbnormal ? 100 + Math.random() * 50 : 50 + Math.random() * 10,
          efficiency: isAbnormal ? 75 + Math.random() * 10 : 92 + Math.random() * 5,
          isAbnormal,
          engineRpm: 1450 + Math.random() * 100
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Wind className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              柴油发电机排烟颜色与成分视觉分析系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Diesel Generator Exhaust Smoke & Composition Visual Analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">燃烧状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isAbnormal ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.isAbnormal ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.isAbnormal ? '燃烧异常' : '运行高效'}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <SciFiCard className="h-[600px] relative overflow-hidden group">
            {/* 3D Scene Overlay */}
            <div className="absolute top-6 left-6 z-10 space-y-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">烟气黑度</span>
                    <span className="text-lg font-mono text-white">{(status.opacity * 5).toFixed(1)} <span className="text-xs text-slate-500">Ringelmann</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">燃烧效率</span>
                    <span className="text-lg font-mono text-white">{status.efficiency.toFixed(1)} <span className="text-xs text-slate-500">%</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'analysis', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'analysis' ? '智能分析' : '历史追溯'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Search className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">排烟视觉识别</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">ANALYZING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Cloud className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">排烟颜色</div>
                    <div className="text-xl font-bold text-white">
                      {status.smokeColor === 'normal' ? '无色/浅灰' : 
                       status.smokeColor === 'black' ? '黑色' : 
                       status.smokeColor === 'white' ? '白色' : '蓝色'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <Maximize2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cyan-400" />
                  气体成分趋势 (ppm)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="co2" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCO2)" strokeWidth={2} />
                    <Area type="monotone" dataKey="nox" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  烟气黑度记录 (Ringelmann)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Line type="monotone" dataKey="opacity" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Metrics */}
          <SciFiCard className="p-6">
            <h3 className="text-sm font-mono text-cyan-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'CO2 浓度', value: status.co2Level.toFixed(0), unit: 'ppm', icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'NOx 浓度', value: status.noxLevel.toFixed(0), unit: 'ppm', icon: Wind, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: '发动机转速', value: status.engineRpm.toFixed(0), unit: 'RPM', icon: Gauge, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '排烟黑度', value: (status.opacity * 5).toFixed(1), unit: '级', icon: Eye, color: 'text-slate-400', bg: 'bg-slate-500/10' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                      <div className="text-xl font-bold font-mono">{item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold">智能燃烧诊断</h3>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {status.isAbnormal ? (
                  <motion.div 
                    key="abnormal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      诊断结果: {status.smokeColor === 'black' ? '燃烧不完全' : '冷却液渗漏'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {status.smokeColor === 'black' 
                        ? '排烟呈现黑色，林格曼黑度超过3级。初步判断为喷油嘴雾化不良或空气滤清器严重堵塞，导致混合气过浓。' 
                        : '排烟呈现白色，疑似冷却液进入燃烧室。请立即检查缸垫密封性及中冷器状态。'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="normal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      诊断结果: 燃烧工况优良
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      排烟几乎无色，各项排放指标均在国家标准范围内。发动机运行平稳，建议维持当前维护周期。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isAbnormal ? '立即停机检查燃油系统压力' : '定期检查空气滤清器清洁度'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isAbnormal ? '清洗喷油嘴并校对喷油提前角' : '维持现有低硫柴油使用标准'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                异常预警日志
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {status.isAbnormal ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isAbnormal ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">排烟黑度超标预警</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">JUST NOW</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic text-center py-4">
                  暂无异常预警记录
                </div>
              )}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default GeneratorExhaust;
