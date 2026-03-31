import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineDrainagePump/ThreeScene';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  Droplets, 
  Settings, 
  Thermometer, 
  BarChart3,
  TrendingUp,
  Cpu,
  Gauge,
  Waves
} from 'lucide-react';
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
  ComposedChart,
  Bar,
  Cell
} from 'recharts';

// Simulated Data
const performanceData = Array.from({ length: 20 }, (_, i) => ({
  flow: i * 50,
  head: 350 - (i * i * 0.5),
  power: 100 + (i * 15),
}));

const cavitationData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i}s`,
  risk: 5 + Math.sin(i * 0.8) * 5 + Math.random() * 2,
}));

const vibrationSpectrum = Array.from({ length: 50 }, (_, i) => ({
  freq: i * 10,
  val: i === 15 ? 1.8 : Math.random() * 0.3 + 0.1,
}));

const MineDrainagePumpView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    speed: 1482,
    flow: 452,
    head: 324,
    vibration: 0.86,
    temp: 46.8,
    health: 97.5,
    cavitationRisk: 8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        flow: 450 + Math.random() * 10,
        vibration: 0.8 + Math.random() * 0.1,
        temp: 46 + Math.random() * 1,
        cavitationRisk: 5 + Math.random() * 5,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-[#020617] text-slate-200 tech-grid-bg">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
            矿井排水泵组振动与空化智能监测系统
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest">
            Mine Drainage Pump Group Vibration & Cavitation Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-950/30 border border-cyan-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-cyan-400">泵组在线</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-full text-xs text-slate-400">
            <Droplets size={14} className="text-cyan-500 animate-bounce" />
            <span>实时流量: 452 m³/h</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: 3D Visualization */}
        <div className="col-span-8 space-y-6">
          <div className="relative h-[550px]">
            <SciFiCard 
              title="3D 数字孪生 - 泵组结构与流体动态" 
              className="h-full"
              icon={<Gauge size={18} className="text-cyan-400" />}
            >
              <ThreeScene />
              
              {/* Overlay HUD Elements */}
              <div className="absolute top-16 left-6 space-y-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg">
                  <div className="text-[10px] text-cyan-500 font-bold uppercase mb-1">电机转速</div>
                  <div className="text-2xl font-black text-white italic">{metrics.speed} <span className="text-xs not-italic text-cyan-600">RPM</span></div>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg">
                  <div className="text-[10px] text-cyan-500 font-bold uppercase mb-1">扬程高度</div>
                  <div className="text-2xl font-black text-white italic">{metrics.head.toFixed(0)} <span className="text-xs not-italic text-cyan-600">m</span></div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 text-center">空化风险指数</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${metrics.cavitationRisk > 20 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${metrics.cavitationRisk}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${metrics.cavitationRisk > 20 ? 'text-red-400' : 'text-cyan-400'}`}>{metrics.cavitationRisk.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </SciFiCard>
          </div>

          {/* Bottom Trends */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="泵组性能特性曲线" icon={<TrendingUp size={18} className="text-blue-400" />}>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="flow" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="head" stroke="#06b6d4" fillOpacity={0.2} fill="#06b6d4" />
                    <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard title="实时振动频谱分析" icon={<BarChart3 size={18} className="text-purple-400" />}>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationSpectrum}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="freq" hide />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#a855f7" fillOpacity={0.3} fill="#a855f7" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Analysis & Metrics */}
        <div className="col-span-4 space-y-6">
          
          {/* Status Overview */}
          <SciFiCard title="核心监测指标" icon={<Cpu size={18} className="text-cyan-400" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl group hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={14} className="text-orange-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">轴承温度</span>
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.temp.toFixed(1)} <span className="text-xs text-slate-500 font-normal">°C</span></div>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">健康指数</span>
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.health.toFixed(1)} <span className="text-xs text-slate-500 font-normal">%</span></div>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl group hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-blue-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">振动幅值</span>
                </div>
                <div className="text-2xl font-bold text-slate-100">{metrics.vibration.toFixed(2)} <span className="text-xs text-slate-500 font-normal">mm/s</span></div>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl group hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-purple-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">电机功率</span>
                </div>
                <div className="text-2xl font-bold text-slate-100">280 <span className="text-xs text-slate-500 font-normal">kW</span></div>
              </div>
            </div>
          </SciFiCard>

          {/* Cavitation Risk Trend */}
          <SciFiCard title="空化风险实时趋势" icon={<Waves size={18} className="text-blue-400" />}>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cavitationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="step" dataKey="risk" stroke="#0ea5e9" fillOpacity={0.2} fill="#0ea5e9" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          {/* Diagnostic Alerts */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase mb-1">泵组运行状态: 优</div>
              <p className="text-[11px] text-emerald-200/70 leading-relaxed">
                当前各项指标均在安全阈值内。空化风险极低，建议维持当前工况运行。
              </p>
            </div>
          </div>

          {/* Maintenance Log */}
          <SciFiCard title="维保建议" icon={<Settings size={18} className="text-slate-400" />}>
            <div className="text-[11px] text-slate-400 space-y-3">
              <div className="p-2 bg-slate-900/30 rounded border-l-2 border-cyan-500">
                <div className="font-bold text-slate-200 mb-1">定期巡检</div>
                <div>建议在 48 小时内检查联轴器对中情况，确保长周期运行稳定性。</div>
              </div>
              <div className="p-2 bg-slate-900/30 rounded border-l-2 border-slate-700">
                <div className="font-bold text-slate-200 mb-1">润滑计划</div>
                <div>下次轴承加注润滑脂时间：2026-04-10</div>
              </div>
            </div>
          </SciFiCard>

        </div>
      </div>
    </div>
  );
};

export default MineDrainagePumpView;
