import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineVentilator/ThreeScene';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  Settings, 
  Thermometer, 
  BarChart3,
  TrendingUp,
  Cpu,
  Gauge
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
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Bar
} from 'recharts';

// Simulated Data
const performanceData = Array.from({ length: 20 }, (_, i) => ({
  flow: i * 1000,
  pressure: 4000 - (i * i * 10),
  efficiency: 85 - Math.abs(i - 10) * 2,
}));

const motorVibData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i}s`,
  vibX: 1.2 + Math.sin(i * 0.5) * 0.2 + Math.random() * 0.1,
  vibY: 1.0 + Math.cos(i * 0.5) * 0.2 + Math.random() * 0.1,
}));

const stabilityData = [
  { blade: '1#', stability: 98 },
  { blade: '2#', stability: 97 },
  { blade: '3#', stability: 99 },
  { blade: '4#', stability: 96 },
  { blade: '5#', stability: 98 },
  { blade: '6#', stability: 97 },
];

const MineVentilatorView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    speed: 742,
    flow: 12450,
    pressure: 3250,
    vibration: 1.24,
    temp: 52.4,
    health: 96.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        flow: 12400 + Math.random() * 100,
        pressure: 3200 + Math.random() * 100,
        vibration: 1.2 + Math.random() * 0.1,
        temp: 52 + Math.random() * 1,
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Wind className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              矿井主通风机运行稳定性智能监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Main Fan</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: MF-UNIT-02</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">实时风量</div>
            <div className="text-sm font-mono font-bold text-cyan-400">{metrics.flow.toFixed(0)} m³/min</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">静压值</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{metrics.pressure.toFixed(0)} Pa</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心监测指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg"><Thermometer size={16} className="text-orange-400" /></div>
                  <span className="text-xs text-slate-400">电机温度</span>
                </div>
                <span className="text-sm font-bold text-white">{metrics.temp.toFixed(1)} °C</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Activity size={16} className="text-blue-400" /></div>
                  <span className="text-xs text-slate-400">振动烈度</span>
                </div>
                <span className="text-sm font-bold text-white">{metrics.vibration.toFixed(2)} mm/s</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><Zap size={16} className="text-purple-400" /></div>
                  <span className="text-xs text-slate-400">电机电流</span>
                </div>
                <span className="text-sm font-bold text-white">145 A</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="叶片运行稳定性" subtitle="BLADE STABILITY" className="flex-1">
            <div className="space-y-4">
              {stabilityData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-slate-400">{item.blade} 叶片</span>
                    <span className="text-emerald-400">{item.stability}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-full"
                      style={{ width: `${item.stability}%` }}
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
            title="通风机数字孪生" 
            subtitle="MAIN FAN DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 border border-cyan-500/30 p-4 backdrop-blur-md rounded-2xl">
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-1">Fan Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{metrics.speed}</span>
                    <span className="text-sm text-slate-400 font-mono">RPM</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-emerald-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-end">
                  <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1">Health Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{metrics.health.toFixed(1)}</span>
                    <span className="text-sm text-slate-400 font-mono">%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">REALTIME MONITORING</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Air Velocity: 12.4 m/s</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Motor Efficiency: 92.4%</div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="性能特性曲线" subtitle="PERFORMANCE CURVE">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="flow" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="pressure" stroke="#06b6d4" fillOpacity={0.2} fill="#06b6d4" />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="电机轴承振动频谱" subtitle="VIBRATION SPECTRUM">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={motorVibData}>
                  <defs>
                    <linearGradient id="colorVibX" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="vibX" stroke="#06b6d4" fill="url(#colorVibX)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与报告" subtitle="DIAGNOSTICS & REPORT" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <AlertTriangle size={12} />
                  气动稳定性预警
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">检测到4#叶片处存在轻微失速迹象，可能引起非定常气动力波动。建议检查进风口导叶开度一致性。</p>
              </div>
              
              <div className="text-[11px] text-slate-400 space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>传感器状态:</span>
                  <span className="text-emerald-400">正常</span>
                </div>
                <div className="flex justify-between">
                  <span>数据丢失率:</span>
                  <span className="text-emerald-400">0.02%</span>
                </div>
                <div className="flex justify-between">
                  <span>模型版本:</span>
                  <span className="text-cyan-400">V3.2.4</span>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MineVentilatorView;
