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
  Thermometer,
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Waves,
  ZapOff,
  Box,
  Layers,
  Container,
  Database,
  Radio,
  Signal,
  Wind,
  Droplets
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/SubstationVibration/ThreeScene';
import { SubstationStatus } from '../../../components/computer-visual-inspection/SubstationVibration/three-types';
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  amplitude: 15 + Math.random() * 10,
  frequency: 45 + Math.random() * 10,
  temp: 40 + Math.random() * 15
}));

const SubstationVibration: React.FC = () => {
  const [status, setStatus] = useState<SubstationStatus>({
    vibrationAmplitude: 18.5,
    vibrationFrequency: 50.2,
    transformerTemp: 48.5,
    oilLevel: 92,
    healthScore: 96,
    isOperating: true,
    alertLevel: 'normal'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'spectrum' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const vibrationAmplitude = 10 + Math.random() * 40;
        const vibrationFrequency = 40 + Math.random() * 20;
        const transformerTemp = 40 + Math.random() * 40;
        const healthScore = 100 - (vibrationAmplitude / 2) - (transformerTemp > 65 ? (transformerTemp - 65) : 0);
        const alertLevel = healthScore < 70 ? 'critical' : healthScore < 85 ? 'warning' : 'normal';

        return {
          ...prev,
          vibrationAmplitude,
          vibrationFrequency,
          transformerTemp,
          healthScore,
          alertLevel,
          oilLevel: 90 + Math.random() * 5
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-purple-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-purple-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              矿用变电所设备振动监测系统
            </h1>
            <p className="text-purple-500/60 text-sm font-mono uppercase tracking-widest">
              Mine Substation Equipment Vibration Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-purple-500/50 uppercase font-mono">设备健康指数</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.alertLevel === 'critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.alertLevel === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.alertLevel === 'critical' ? 'text-red-400' : status.alertLevel === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.healthScore.toFixed(1)}
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
                <h3 className="text-xs font-mono text-purple-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">振动幅值</span>
                    <span className="text-lg font-mono text-white">{status.vibrationAmplitude.toFixed(1)} <span className="text-xs text-slate-500">μm</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">运行状态</span>
                    <span className={`text-sm font-bold ${status.isOperating ? 'text-emerald-400' : 'text-red-400'}`}>
                      {status.isOperating ? '负载运行' : '空载/停机'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'spectrum', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'spectrum' ? '频谱分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Radio className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-purple-500/50 uppercase font-mono tracking-widest">主频分析</div>
                    <div className="text-xl font-bold text-white">{status.vibrationFrequency.toFixed(1)} <span className="text-xs font-normal text-slate-500">Hz</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Thermometer className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">变压器温度</div>
                    <div className="text-xl font-bold text-white">{status.transformerTemp.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Signal className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">SENSOR-04 CONNECTED</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  振动幅值趋势 (μm)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorAmplitude" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Area type="monotone" dataKey="amplitude" stroke="#a855f7" fillOpacity={1} fill="url(#colorAmplitude)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  温度波动记录 (°C)
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
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
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
            <h3 className="text-sm font-mono text-purple-500/50 uppercase tracking-widest mb-6">核心监测指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '振动幅值', value: status.vibrationAmplitude.toFixed(1), unit: 'μm', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: '变压器温度', value: status.transformerTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '油位高度', value: status.oilLevel.toFixed(1), unit: '%', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '运行主频', value: status.vibrationFrequency.toFixed(1), unit: 'Hz', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
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
              <Cpu className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold">智能振动诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.alertLevel === 'critical' ? 'bg-red-500/5 border-red-500/20' : status.alertLevel === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.alertLevel === 'critical' ? 'text-red-400' : status.alertLevel === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {status.alertLevel === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.alertLevel === 'critical' ? '严重振动异常' : status.alertLevel === 'warning' ? '发现轻微振动' : '运行平稳'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.alertLevel === 'critical' 
                    ? '检测到变压器外壳振动幅值严重超标，且伴随温度异常升高。可能存在内部绕组松动或铁芯故障。建议立即申请停电检修。' 
                    : status.alertLevel === 'warning' 
                    ? '振动幅值出现小幅波动，主频分布正常。请关注紧固件是否松动，并加强巡检频次。' 
                    : '变压器运行参数正常，振动频谱符合健康基准，未发现潜在机械或电气故障。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>{status.vibrationAmplitude > 30 ? '检查变压器底座紧固螺栓' : '维持日常红外测温巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>{status.transformerTemp > 60 ? '检查冷却系统循环泵及风扇' : '定期进行绝缘油色谱分析'}</span>
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
                {status.alertLevel !== 'normal' ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.alertLevel !== 'normal' ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      {status.alertLevel === 'critical' ? '变压器振动幅值超限' : '变压器温升异常'}
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

export default SubstationVibration;
