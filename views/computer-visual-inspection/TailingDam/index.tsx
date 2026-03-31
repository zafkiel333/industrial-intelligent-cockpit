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
  Waves,
  Droplets,
  Ruler,
  TrendingDown,
  Maximize2,
  Search,
  ShieldAlert,
  CloudRain,
  Mountain
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/TailingDam/ThreeScene';
import { DamStatus } from '../../../components/computer-visual-inspection/TailingDam/three-types';
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
  Bar
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  beachLength: 70 + Math.random() * 10,
  saturationLine: 4.5 + Math.random() * 0.5
}));

const TailingDam: React.FC = () => {
  const [status, setStatus] = useState<DamStatus>({
    beachLength: 75.5,
    saturationLine: 4.8,
    waterLevel: 3.2,
    displacement: 1.5,
    rainfall: 0.2,
    safetyFactor: 1.65,
    lastSurvey: '2026-03-20'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        beachLength: 70 + Math.random() * 10,
        saturationLine: 4.5 + Math.random() * 1,
        waterLevel: 3 + Math.random() * 0.5,
        displacement: 1 + Math.random() * 1,
        rainfall: Math.random() * 5,
        safetyFactor: 1.5 + Math.random() * 0.3
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Mountain className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              尾矿库干滩长度与浸润线视觉检测系统
            </h1>
            <p className="text-emerald-500/60 text-sm font-mono uppercase tracking-widest">
              Tailing Dam Beach Length & Saturation Line Visual Inspection System
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-500/50 uppercase font-mono">库区安全状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.safetyFactor < 1.2 || status.beachLength < 50 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.safetyFactor < 1.2 || status.beachLength < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.safetyFactor < 1.2 ? '安全系数低' : status.beachLength < 50 ? '干滩过短' : '运行安全'}
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
                <h3 className="text-xs font-mono text-emerald-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">干滩长度</span>
                    <span className="text-lg font-mono text-white">{status.beachLength.toFixed(1)} <span className="text-xs text-slate-500">m</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">浸润线埋深</span>
                    <span className="text-lg font-mono text-white">{status.saturationLine.toFixed(2)} <span className="text-xs text-slate-500">m</span></span>
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
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'analysis' ? '智能分析' : '历史追溯'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Search className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500/50 uppercase font-mono tracking-widest">视觉识别状态</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">SCANNING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <CloudRain className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">实时降雨量</div>
                    <div className="text-xl font-bold text-white">{status.rainfall.toFixed(1)} <span className="text-xs font-normal text-slate-500">mm/h</span></div>
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
                  <Ruler className="w-5 h-5 text-emerald-400" />
                  干滩长度趋势 (m)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-emerald-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorBeach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="beachLength" stroke="#10b981" fillOpacity={1} fill="url(#colorBeach)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  浸润线深度变化 (m)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="saturationLine" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-emerald-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '干滩长度', value: status.beachLength.toFixed(1), unit: 'm', icon: Ruler, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '浸润线埋深', value: status.saturationLine.toFixed(2), unit: 'm', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '库水位', value: status.waterLevel.toFixed(2), unit: 'm', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '安全系数', value: status.safetyFactor.toFixed(2), unit: 'Fs', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">智能安全评估</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  安全等级: A (极高)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  当前库区各项指标均在安全阈值内。干滩长度充足，浸润线埋深稳定。未发现坝体位移或渗漏迹象。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>持续关注降雨量变化，做好排洪系统巡查</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>建议在下次巡检中对坝体位移监测点进行校准</span>
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
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">0 NEW</span>
            </div>
            
            <div className="space-y-3 text-slate-500 text-xs italic text-center py-8">
              暂无异常预警记录
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default TailingDam;
