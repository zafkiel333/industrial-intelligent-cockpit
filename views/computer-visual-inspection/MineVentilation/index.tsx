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
  Gauge,
  Thermometer,
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Fan,
  Waves,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Cloud,
  ZapOff
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/MineVentilation/ThreeScene';
import { VentilationStatus } from '../../../components/computer-visual-inspection/MineVentilation/three-types';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  volume: 450 + Math.random() * 50,
  pressure: 2800 + Math.random() * 200,
  vibration: 2 + Math.random() * 3
}));

const mockRadarData = [
  { subject: '风量', A: 85, fullMark: 100 },
  { subject: '风压', A: 90, fullMark: 100 },
  { subject: '振动', A: 95, fullMark: 100 },
  { subject: '温度', A: 88, fullMark: 100 },
  { subject: '能效', A: 92, fullMark: 100 },
];

const MineVentilation: React.FC = () => {
  const [status, setStatus] = useState<VentilationStatus>({
    airVolume: 485.5,
    staticPressure: 2950,
    fanSpeed: 720,
    vibration: 2.4,
    motorTemp: 52.5,
    healthScore: 94,
    isOperating: true,
    alertLevel: 'normal'
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const airVolume = 450 + Math.random() * 100;
        const staticPressure = 2500 + Math.random() * 1000;
        const vibration = 1 + Math.random() * 8;
        const motorTemp = 45 + Math.random() * 20;
        const healthScore = 100 - (vibration * 2) - (motorTemp > 60 ? (motorTemp - 60) : 0);
        const alertLevel = healthScore < 70 ? 'critical' : healthScore < 85 ? 'warning' : 'normal';

        return {
          ...prev,
          airVolume,
          staticPressure,
          vibration,
          motorTemp,
          healthScore,
          alertLevel,
          fanSpeed: prev.isOperating ? 700 + Math.random() * 50 : 0
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
            <Wind className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              矿井通风机运行状态监测系统
            </h1>
            <p className="text-cyan-500/60 text-sm font-mono uppercase tracking-widest">
              Mine Ventilation Fan Operational Status Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan-500/50 uppercase font-mono">风机健康指数</span>
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
                <h3 className="text-xs font-mono text-cyan-500/70 uppercase mb-3 tracking-wider">实时数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">风机转速</span>
                    <span className="text-lg font-mono text-white">{status.fanSpeed.toFixed(0)} <span className="text-xs text-slate-500">RPM</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">运行状态</span>
                    <span className={`text-sm font-bold ${status.isOperating ? 'text-emerald-400' : 'text-red-400'}`}>
                      {status.isOperating ? '运行中' : '已停机'}
                    </span>
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
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '性能分析' : '历史趋势'}
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
                    <Waves className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-widest">实时风量</div>
                    <div className="text-xl font-bold text-white">{status.airVolume.toFixed(1)} <span className="text-xs font-normal text-slate-500">m³/s</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Gauge className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">静压</div>
                    <div className="text-xl font-bold text-white">{status.staticPressure.toFixed(0)} <span className="text-xs font-normal text-slate-500">Pa</span></div>
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
                  <Activity className="w-5 h-5 text-cyan-400" />
                  风量与风压趋势
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="volume" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <RadarChart className="w-5 h-5 text-purple-400" />
                  综合性能评估
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-purple-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis stroke="#1e293b" tick={false} axisLine={false} />
                    <Radar
                      name="性能"
                      dataKey="A"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
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
                { label: '风机转速', value: status.fanSpeed.toFixed(0), unit: 'RPM', icon: Fan, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '电机温度', value: status.motorTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '机壳振动', value: status.vibration.toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: '运行效率', value: (status.healthScore * 0.95).toFixed(1), unit: '%', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
              <h3 className="text-lg font-bold">智能工况诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.alertLevel === 'critical' ? 'bg-red-500/5 border-red-500/20' : status.alertLevel === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.alertLevel === 'critical' ? 'text-red-400' : status.alertLevel === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {status.alertLevel === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.alertLevel === 'critical' ? '严重故障预警' : status.alertLevel === 'warning' ? '运行状态异常' : '运行平稳'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.alertLevel === 'critical' 
                    ? '检测到风机振动剧烈且电机温度过高。可能存在轴承损坏或叶片失衡风险。建议立即停机检查。' 
                    : status.alertLevel === 'warning' 
                    ? '风量波动较大，且电机温度有上升趋势。请关注润滑系统及进风口通畅情况。' 
                    : '风机各项参数处于最优区间，通风效率稳定，未发现潜在故障风险。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">维护建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.vibration > 5 ? '执行动平衡校验及轴承润滑' : '维持日常巡检频率'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{status.motorTemp > 55 ? '检查电机冷却风扇及散热片' : '定期清理叶片积尘'}</span>
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
                      {status.alertLevel === 'critical' ? '风机振动超限' : '电机温度预警'}
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

export default MineVentilation;
