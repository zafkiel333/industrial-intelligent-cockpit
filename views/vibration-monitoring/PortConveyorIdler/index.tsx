import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Waves,
  Maximize2,
  TrendingUp,
  Search,
  CircleDot
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/PortConveyorIdler/ThreeScene';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 2 + 0.5,
  envelope: Math.random() * 1.5 + 0.2,
  frequency: 50 + Math.random() * 500,
}));

const PortConveyorIdlerView: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [metrics, setMetrics] = useState({
    peakValue: 0.85,
    rmsValue: 0.42,
    crestFactor: 2.1,
    healthScore: 96.5,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        peakValue: 0.8 + Math.random() * 0.2,
        rmsValue: 0.4 + Math.random() * 0.1,
        crestFactor: 2 + Math.random() * 0.5,
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Search className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              皮带机托辊轴承早期故障监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Early Fault Detection</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: IDLER-BRG-08</span>
              <span className="flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-wider">SCANNING ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">健康指数</div>
            <div className="text-sm font-mono font-bold text-cyan-400">{metrics.healthScore.toFixed(1)}%</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 transition-all">
              <Settings size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="包络分析峰值" subtitle="ENVELOPE PEAK">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.peakValue.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">gE</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="envelope" stroke="#06b6d4" strokeWidth={2} fill="url(#envGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="波峰因数" subtitle="CREST FACTOR">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">{metrics.crestFactor.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">ratio</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                <span>Threshold: 4.5</span>
                <span className="text-cyan-400">NORMAL</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="高频共振分析" subtitle="HF RESONANCE">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.slice(0, 10)}>
                  <Bar dataKey="frequency">
                    {mockData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#0891b2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="托辊轴承数字孪生" 
            subtitle="BEARING DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">故障诊断状态</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">HEALTHY</div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">采样频率</div>
                  <div className="text-xl font-mono font-bold text-white">25.6 <span className="text-xs text-slate-500">kHz</span></div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">冲击检测</div>
                    <div className="text-xl font-mono font-bold text-white">0 <span className="text-xs text-slate-500">IMPACTS</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="包络频谱分析" subtitle="ENVELOPE SPECTRUM">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="envelope" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "包络谱中未发现明显的轴承故障特征频率（BPFO, BPFI, BSF, FTF）及其谐波。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="早期故障诊断" subtitle="FAULT DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">润滑状态良好</h4>
                  <p className="text-[10px] text-slate-400">高频能量水平稳定，未见润滑不良引起的高频随机振动。</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">特征频率扫描</h4>
                  <p className="text-[10px] text-slate-400">系统自动匹配轴承库特征频率，当前匹配度低于5%，无故障。 </p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="RMS趋势分析" subtitle="RMS TREND">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">RMS Stability</span>
              <span className="text-xs font-bold text-white">HIGH</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortConveyorIdlerView;
