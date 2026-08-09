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
  Sun,
  Moon,
  Lightbulb,
  LightbulbOff,
  Battery,
  ZapOff,
  Maximize2,
  Search,
  ShieldAlert,
  Layers,
  Map,
  Navigation,
  Clock
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/LightingFailure/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-lighting-failure]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-lighting-failure';
import { LightingStatus } from '../../../components/computer-visual-inspection/LightingFailure/three-types';
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

const mockHistoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  consumption: i > 18 || i < 6 ? 120 + Math.random() * 20 : 10 + Math.random() * 5,
  failures: Math.random() > 0.9 ? 1 : 0
}));

const LightingFailure: React.FC = () => {
  const [status, setStatus] = useState<LightingStatus>({
    totalLights: 120,
    activeLights: 118,
    failedLights: 2,
    coverage: 98.5,
    energyConsumption: 45.2,
    isFaulty: true,
    faultLocations: ['A区-3号路灯', 'C区-12号路灯']
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'energy' | 'map'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const failedLights = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 1;
        const activeLights = prev.totalLights - failedLights;
        const coverage = (activeLights / prev.totalLights) * 100;
        const isFaulty = failedLights > 0;

        return {
          ...prev,
          activeLights,
          failedLights,
          coverage,
          energyConsumption: 40 + Math.random() * 10,
          isFaulty,
          faultLocations: isFaulty ? Array.from({ length: failedLights }, (_, i) => `${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}区-${Math.floor(Math.random() * 30)}号路灯`) : []
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#06b6d4', '#f43f5e'];
  const pieData = [
    { name: '正常', value: status.activeLights },
    { name: '故障', value: status.failedLights },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Lightbulb className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              厂区照明系统故障自动识别系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Plant Lighting System Failure Automatic Identification
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">照明覆盖率</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.coverage < 95 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.coverage < 95 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.coverage.toFixed(1)}% {status.coverage < 95 ? '覆盖不足' : '运行良好'}
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
                    <span className="text-sm text-slate-400">总灯具数</span>
                    <span className="text-lg font-mono text-white">{status.totalLights} <span className="text-xs text-slate-500">units</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">故障灯具</span>
                    <span className="text-lg font-mono text-red-400">{status.failedLights} <span className="text-xs text-slate-500">units</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'energy', 'map'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'energy' ? '能耗分析' : '区域地图'}
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
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">视觉巡检状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Navigation className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">故障定位</div>
                    <div className="text-xl font-bold text-white">{status.isFaulty ? 'DETECTED' : 'CLEAR'}</div>
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
                  <Zap className="w-5 h-5 text-cyan-400" />
                  能耗变化趋势 (kW)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorZap" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="consumption" stroke="#06b6d4" fillOpacity={1} fill="url(#colorZap)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  故障发生频率
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Bar dataKey="failures" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                { label: '正常运行', value: status.activeLights, unit: '盏', icon: Lightbulb, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '故障灯具', value: status.failedLights, unit: '盏', icon: LightbulbOff, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: '实时能耗', value: status.energyConsumption.toFixed(1), unit: 'kW', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '照明覆盖', value: status.coverage.toFixed(1), unit: '%', icon: Map, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <h3 className="text-lg font-bold">智能故障诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className="h-48 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  诊断结果: {status.isFaulty ? '发现局部故障' : '运行正常'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isFaulty 
                    ? `视觉系统识别到 ${status.failedLights} 处灯具异常。故障表现为完全熄灭或高频闪烁，疑似驱动电源损坏或灯珠老化。` 
                    : '全厂区照明覆盖均匀，未发现黑区或灯具异常。系统自动调节亮度以优化能耗。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">故障位置清单</h4>
                {status.faultLocations.map((loc, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </SciFiCard>

          {/* Maintenance Action */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                维护任务联动
              </h3>
            </div>
            
            <div className="space-y-3">
              {status.isFaulty ? (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                  <div className="text-xs text-blue-400 font-bold mb-1">自动派单中...</div>
                  <div className="text-[10px] text-slate-400">
                    已通知电工班组前往 {status.faultLocations[0]} 进行更换。
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic text-center py-4">
                  暂无待处理维护任务
                </div>
              )}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default LightingFailure;
