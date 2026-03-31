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
  Waves,
  Flame,
  Droplets,
  Timer
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/SteamTrapStatus/ThreeScene';
import { TrapStatus } from '../../../components/computer-visual-inspection/SteamTrapStatus/three-types';
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
  inlet: 160 + Math.random() * 10,
  outlet: 120 + Math.random() * 20,
  leak: Math.random() > 0.8 ? 2 + Math.random() * 5 : 0
}));

const SteamTrapStatus: React.FC = () => {
  const [status, setStatus] = useState<TrapStatus>({
    inletTemp: 165,
    outletTemp: 130,
    cycleFrequency: 4,
    leakRate: 0,
    isLeaking: false,
    isBlocked: false,
    efficiency: 96
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'thermal' | 'cycle'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isLeaking = Math.random() > 0.8;
        const isBlocked = !isLeaking && Math.random() > 0.9;
        const leakRate = isLeaking ? 3 + Math.random() * 8 : 0;
        const inletTemp = 160 + Math.random() * 10;
        const outletTemp = isLeaking ? inletTemp - (5 + Math.random() * 5) : inletTemp - (30 + Math.random() * 10);
        const efficiency = isLeaking ? 60 + Math.random() * 10 : isBlocked ? 40 + Math.random() * 10 : 94 + Math.random() * 4;

        return {
          ...prev,
          inletTemp,
          outletTemp,
          cycleFrequency: isLeaking ? 12 + Math.random() * 5 : isBlocked ? 0 : 4 + Math.random() * 2,
          leakRate,
          isLeaking,
          isBlocked,
          efficiency: Math.max(0, Math.min(100, efficiency))
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
            <Droplets className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              疏水阀运行状态与内漏视觉识别系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Steam Trap Status & Internal Leakage Visual Identification
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">运行效率</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.efficiency < 80 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.efficiency < 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.efficiency.toFixed(0)}% {status.efficiency < 80 ? '异常' : '正常'}
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
                    <span className="text-sm text-slate-400">入口温度</span>
                    <span className="text-lg font-mono text-white">{status.inletTemp.toFixed(1)} <span className="text-xs text-slate-500">°C</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">出口温度</span>
                    <span className="text-lg font-mono text-white">{status.outletTemp.toFixed(1)} <span className="text-xs text-slate-500">°C</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'thermal', 'cycle'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时视图' : tab === 'thermal' ? '热力分析' : '循环监测'}
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
                    <Search className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">视觉/红外识别</div>
                    <div className="text-xl font-bold text-white">ACTIVE <span className="text-xs font-normal text-slate-500">MONITORING</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Flame className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">内漏状态</div>
                    <div className="text-xl font-bold text-white">{status.isLeaking ? 'DETECTED' : 'NORMAL'}</div>
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
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  温差变化趋势 (°C)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="inlet" stroke="#06b6d4" fillOpacity={0.1} fill="#06b6d4" strokeWidth={2} />
                    <Area type="monotone" dataKey="outlet" stroke="#f43f5e" fillOpacity={0.1} fill="#f43f5e" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Waves className="w-5 h-5 text-purple-400" />
                  蒸汽损失估算 (kg/h)
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
                    <Bar dataKey="leak" fill="#a855f7" radius={[4, 4, 0, 0]} />
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
                { label: '入口温度', value: status.inletTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '出口温度', value: status.outletTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: '循环频率', value: status.cycleFrequency.toFixed(1), unit: '次/分', icon: Timer, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '蒸汽损失', value: status.leakRate.toFixed(2), unit: 'kg/h', icon: Waves, color: 'text-slate-400', bg: 'bg-slate-500/10' },
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
              <h3 className="text-lg font-bold">智能工况诊断</h3>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {status.isLeaking ? (
                  <motion.div 
                    key="leak"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      诊断结果: 严重内漏
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      视觉与红外联合诊断显示，疏水阀出口温度异常升高，温差缩小至 {(status.inletTemp - status.outletTemp).toFixed(1)}°C。循环频率过高，判断为阀座密封失效导致蒸汽直通。
                    </p>
                  </motion.div>
                ) : status.isBlocked ? (
                  <motion.div 
                    key="block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      诊断结果: 疏水不畅/堵塞
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      检测到疏水阀无循环动作，出口温度持续下降。疑似内部浮球卡死或滤网严重堵塞，可能导致换热器积水。
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
                      诊断结果: 运行健康
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      疏水阀循环动作清晰，温差维持在正常区间。未发现内漏迹象，热力效率处于高位。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isLeaking ? '计划更换阀座密封组件' : status.isBlocked ? '立即清洗内部滤网' : '维持季度预防性检查'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.isLeaking ? '检查旁通阀是否误开启' : status.isBlocked ? '检查前端冷凝水负荷' : '记录当前热力指纹数据'}</span>
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
                {status.isLeaking || status.isBlocked ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.isLeaking ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">疏水阀内漏超标预警</span>
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

export default SteamTrapStatus;
