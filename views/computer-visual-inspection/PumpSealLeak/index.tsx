import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  Thermometer, 
  Gauge, 
  Settings, 
  Eye, 
  BarChart3, 
  ShieldCheck,
  Zap,
  RefreshCcw,
  History,
  Cpu
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/PumpSealLeak/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-pump-seal-leak]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-pump-seal-leak';
import { PumpStatus } from '../../../components/computer-visual-inspection/PumpSealLeak/three-types';
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
  Area 
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  leak: Math.random() * 2 + (i > 15 ? 5 : 0),
  temp: 45 + Math.random() * 10,
  pressure: 1.2 + Math.random() * 0.4
}));

const PumpSealLeak: React.FC = () => {
  const [status, setStatus] = useState<PumpStatus>({
    leakRate: 0.2,
    pressure: 1.5,
    temperature: 48.5,
    vibrationLevel: 0.15,
    isLeaking: false,
    rotationSpeed: 1450
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const newLeak = Math.random() > 0.95 ? Math.random() * 8 : prev.leakRate;
        return {
          ...prev,
          leakRate: newLeak,
          isLeaking: newLeak > 2,
          temperature: 45 + Math.random() * 15,
          pressure: 1.4 + Math.random() * 0.2,
          vibrationLevel: 0.1 + Math.random() * 0.2
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
              泵组机械密封泄漏监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Pump Mechanical Seal Leakage Visual Monitoring System v4.0
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">系统状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.isLeaking ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold ${status.isLeaking ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.isLeaking ? '异常警告' : '运行正常'}
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
                    <span className="text-sm text-slate-400">转速</span>
                    <span className="text-lg font-mono text-white">{status.rotationSpeed} <span className="text-xs text-slate-500">RPM</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">密封压力</span>
                    <span className="text-lg font-mono text-white">{status.pressure.toFixed(2)} <span className="text-xs text-slate-500">MPa</span></span>
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
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">监测频率</div>
                    <div className="text-xl font-bold text-white">60 <span className="text-xs font-normal text-slate-500">FPS</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Cpu className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">AI 模型置信度</div>
                    <div className="text-xl font-bold text-white">99.2%</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">最后更新时间</div>
                <div className="text-sm font-mono text-slate-400">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  泄漏率趋势 (L/h)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorLeak" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="leak" stroke="#06b6d4" fillOpacity={1} fill="url(#colorLeak)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  密封腔温度 (°C)
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-orange-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fb923c' }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={2} dot={false} />
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
                { label: '瞬时泄漏量', value: status.leakRate.toFixed(2), unit: 'L/h', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '密封腔压力', value: status.pressure.toFixed(2), unit: 'MPa', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '运行温度', value: status.temperature.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '振动烈度', value: status.vibrationLevel.toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
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
                  <div className="h-8 w-16 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockHistoryData.slice(-5)}>
                        <Line type="monotone" dataKey="leak" stroke={item.color.includes('cyan') ? '#22d3ee' : item.color.includes('blue') ? '#60a5fa' : '#fb923c'} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">智能诊断报告</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  密封系统健康度: 94%
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  当前密封系统运行稳定，泄漏率处于正常波动范围。建议在 1500 小时后进行常规检查。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">预测性维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>检查辅助密封圈老化情况</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>监控冲洗系统流量稳定性</span>
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
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">2 NEW</span>
            </div>
            
            <div className="space-y-3">
              {[
                { time: '14:22:05', msg: '密封端面温度瞬时升高 5°C', level: 'warning' },
                { time: '10:15:30', msg: '泄漏率超过一级阈值 (2.5L/h)', level: 'error' },
                { time: '昨日 18:40', msg: '冲洗液压力波动异常', level: 'info' },
              ].map((alert, idx) => (
                <div key={idx} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                  <div className="text-[10px] font-mono text-slate-500 pt-1">{alert.time}</div>
                  <div className="flex-1">
                    <div className={`text-xs font-medium ${alert.level === 'error' ? 'text-red-400' : alert.level === 'warning' ? 'text-orange-400' : 'text-slate-300'}`}>
                      {alert.msg}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default PumpSealLeak;
