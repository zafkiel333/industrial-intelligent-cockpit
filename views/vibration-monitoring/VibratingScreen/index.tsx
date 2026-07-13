import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/VibratingScreen/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-VibratingScreen]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-VibratingScreen';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Maximize2, 
  RotateCw, 
  BarChart3,
  TrendingUp,
  Cpu
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
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Simulated Data
const spectrumData = Array.from({ length: 50 }, (_, i) => ({
  freq: i * 2,
  amplitude: i === 8 ? 2.8 : Math.random() * 0.5 + 0.1,
}));

const loadDistributionData = [
  { zone: '进料区', load: 85 },
  { zone: '筛分一区', load: 65 },
  { zone: '筛分二区', load: 45 },
  { zone: '筛分三区', load: 30 },
  { zone: '出料区', load: 15 },
];

const trendData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: 2.4 + Math.random() * 0.3,
  load: 70 + Math.random() * 10,
}));

const VibratingScreenView: React.FC = () => {
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    amplitude: 2.45,
    frequency: 16.5,
    load: 78.2,
    resonanceRisk: 12,
    speed: 985,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        ...prev,
        amplitude: 2.4 + Math.random() * 0.2,
        load: 75 + Math.random() * 5,
        resonanceRisk: 10 + Math.random() * 5,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Layers className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              振动筛结构共振与物料载荷智能监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Resonance Monitor</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: VS-UNIT-04</span>
              <span className="flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-wider">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">采样频率</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-mono font-bold text-emerald-400">2048 Hz</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 transition-all">
              <Maximize2 size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心监测指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={12} className="text-cyan-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">主振频率</span>
                </div>
                <div className="text-xl font-bold text-white">{realtimeMetrics.frequency.toFixed(1)} <span className="text-[10px] text-slate-500">Hz</span></div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">共振风险</span>
                </div>
                <div className="text-xl font-bold text-white">{realtimeMetrics.resonanceRisk.toFixed(0)} <span className="text-[10px] text-slate-500">%</span></div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">健康度</span>
                </div>
                <div className="text-xl font-bold text-white">98.4 <span className="text-[10px] text-slate-500">%</span></div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={12} className="text-blue-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">平均载荷</span>
                </div>
                <div className="text-xl font-bold text-white">{realtimeMetrics.load.toFixed(1)} <span className="text-[10px] text-slate-500">T/h</span></div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="实时频谱分析" subtitle="SPECTRUM ANALYSIS">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spectrumData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="freq" hide />
                  <YAxis hide />
                  <Bar dataKey="amplitude">
                    {spectrumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.amplitude > 2 ? '#a855f7' : '#475569'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>0 Hz</span>
              <span className="text-purple-400 font-bold">主频: 16.5 Hz</span>
              <span>100 Hz</span>
            </div>
          </SciFiCard>

          <SciFiCard title="筛面载荷分布" subtitle="LOAD DISTRIBUTION">
            <div className="space-y-3">
              {loadDistributionData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-slate-400">{item.zone}</span>
                    <span className="text-cyan-400">{item.load}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
                      style={{ width: `${item.load}%` }}
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
            title="3D 数字孪生 - 激振轨迹与物料流转" 
            subtitle="3D DIGITAL TWIN - EXCITATION TRAJECTORY" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">激振器转速</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">{realtimeMetrics.speed} <span className="text-xs">RPM</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">振动振幅</div>
                  <div className="text-xl font-mono font-bold text-white">{realtimeMetrics.amplitude.toFixed(2)} mm</div>
                </div>
              </div>
              
              <div className="flex justify-center items-end">
                <div className="px-6 py-3 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center gap-8 pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <RotateCw size={16} className="text-cyan-400 animate-spin-slow" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">轨迹同步中</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="振幅变化趋势 (24H)" subtitle="AMPLITUDE TREND">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="物料载荷波动" subtitle="LOAD FLUCTUATION">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="stepAfter" dataKey="load" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断预警" subtitle="AI DIAGNOSTICS">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={16} />
              <div>
                <div className="text-[10px] font-bold text-amber-200 uppercase mb-1">载荷分布异常</div>
                <p className="text-[10px] text-amber-200/70 leading-relaxed">
                  检测到筛分二区载荷分布不均，可能导致筛网局部磨损加剧。建议检查进料口布料器状态。
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default VibratingScreenView;
