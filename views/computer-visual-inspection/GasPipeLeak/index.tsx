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
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Droplets,
  Waves,
  Gauge,
  Thermometer,
  Wind,
  Cloud,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Map,
  Scan,
  Camera,
  Flame,
  Wind as WindIcon,
  AlertCircle,
  Target,
  Crosshair,
  Radar
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/GasPipeLeak/ThreeScene';
import { GasLeakStatus } from '../../../components/computer-visual-inspection/GasPipeLeak/three-types';
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
  ComposedChart,
  Scatter
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  leak: Math.random() * 2,
  concentration: 10 + Math.random() * 50,
  pressure: 2.5 + Math.random() * 0.5
}));

const GasPipeLeak: React.FC = () => {
  const [status, setStatus] = useState<GasLeakStatus>({
    leakRate: 0.0,
    gasConcentration: 12,
    pressure: 2.8,
    temperature: 24.5,
    leakDetected: false,
    leakLocation: { x: 0, y: 0, z: 0 },
    lastInspectionTime: '2026-03-31 10:00:00'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const leakDetected = Math.random() > 0.8;
        const leakRate = leakDetected ? 1.5 + Math.random() * 5 : 0;
        const gasConcentration = leakDetected ? 200 + Math.random() * 800 : 10 + Math.random() * 20;
        const pressure = 2.8 - (leakRate * 0.1);
        const temperature = 24 + Math.random() * 5;
        
        const leakLocation = leakDetected ? {
          x: (Math.random() - 0.5) * 10,
          y: 0,
          z: (Math.random() - 0.5) * 2
        } : { x: 0, y: 0, z: 0 };

        return {
          ...prev,
          leakDetected,
          leakRate,
          gasConcentration,
          pressure,
          temperature,
          leakLocation,
          lastInspectionTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Flame className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              燃气管道微小泄漏视觉识别系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Gas Pipe Micro-Leak Visual Recognition
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">管网安全等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.leakDetected ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.gasConcentration > 50 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.leakDetected ? 'text-red-400' : status.gasConcentration > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.leakDetected ? 'CRITICAL' : status.gasConcentration > 50 ? 'WARNING' : 'SECURE'}
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">实时管道孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">管道压力</span>
                    <span className="text-lg font-mono text-white">{status.pressure.toFixed(2)} <span className="text-xs text-slate-500">MPa</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">泄漏速率</span>
                    <span className="text-lg font-mono text-white">{status.leakRate.toFixed(2)} <span className="text-xs text-slate-500">m³/h</span></span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '泄漏分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Radar className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">气体浓度</div>
                    <div className="text-xl font-bold text-white">{status.gasConcentration.toFixed(0)} <span className="text-xs font-normal text-slate-500">PPM</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Thermometer className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">管道温度</div>
                    <div className="text-xl font-bold text-white">{status.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">GAS-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  气体浓度变化 (PPM)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="concentration" stroke="#06b6d4" fillOpacity={1} fill="url(#colorConc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-400" />
                  管道压力监测 (MPa)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[2, 4]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
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
                { label: '泄漏速率', value: status.leakRate.toFixed(2), unit: 'm³/h', icon: WindIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '气体浓度', value: status.gasConcentration.toFixed(0), unit: 'PPM', icon: Radar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '管道压力', value: status.pressure.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-cyan-500', bg: 'bg-cyan-600/10' },
                { label: '环境温度', value: status.temperature.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
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
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold">智能泄漏诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.leakDetected ? 'bg-red-500/5 border-red-500/20' : status.gasConcentration > 50 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.leakDetected ? 'text-red-400' : status.gasConcentration > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.leakDetected ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.leakDetected ? '检测到微小泄漏' : status.gasConcentration > 50 ? '环境浓度异常' : '管道运行正常'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.leakDetected 
                    ? `视觉传感器在坐标 (${status.leakLocation.x.toFixed(1)}, ${status.leakLocation.z.toFixed(1)}) 处识别到微小气体喷射。压力出现小幅下降，请立即派人前往核实并封堵。` 
                    : status.gasConcentration > 50 
                    ? '检测到环境气体浓度持续升高，但未发现明显泄漏点。可能存在缓慢渗漏或环境积聚，建议进行全面排查。' 
                    : '管道压力稳定，视觉监测未发现气体喷射迹象。环境气体浓度处于安全区间，系统运行良好。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.leakDetected ? '启动应急响应，切断该段阀门' : '维持日常激光甲烷巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.gasConcentration > 100 ? '加强通风，寻找潜在渗漏源' : '定期校准视觉识别算法灵敏度'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                异常告警日志
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {status.leakDetected ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.leakDetected ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      管道微小泄漏告警
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Critical</span>
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

export default GasPipeLeak;
