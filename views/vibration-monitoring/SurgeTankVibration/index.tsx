import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Waves,
  ArrowUp,
  ArrowDown,
  Droplets,
  TrendingUp,
  Wind
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/SurgeTankVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-SurgeTankVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-SurgeTankVibration';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 3 + 1,
  level: Math.sin(i * 0.4) * 20 + 60,
  pressure: Math.random() * 5 + 25,
}));

const SurgeTankVibration: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [trend, setTrend] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const timer = setInterval(() => {
      setTrend(Math.random() > 0.5 ? 'up' : 'down');
      if (Math.random() > 0.9) setStatus('warning');
      else setStatus('normal');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
            <Wind className="text-sky-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              调压室振动监测
              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/30 uppercase tracking-widest">Live Analysis</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: SURGE-TK-01</span>
              <span className="flex items-center gap-1"><Droplets size={12} /> 当前水位: 62.4m</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">运行状态</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'normal' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-sm font-mono font-bold ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.toUpperCase()}</span>
            </div>
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
          <SciFiCard title="筒体振动监测" subtitle="TANK VIBRATION">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">1.85</span>
              <span className="text-xs text-slate-500 font-mono uppercase">mm/s</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#0ea5e9" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="水位波动监测" subtitle="WATER LEVEL SURGE">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">62.4</span>
              <span className="text-xs text-slate-500 font-mono uppercase">m</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                <span>Range: 40m - 80m</span>
                <span className={trend === 'up' ? 'text-emerald-400' : 'text-amber-400'}>
                  {trend === 'up' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />}
                  {trend.toUpperCase()}
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full border border-slate-800 p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.4)]"
                  initial={{ width: 0 }}
                  animate={{ width: '62.4%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="水锤压力分析" subtitle="WATER HAMMER PRESSURE">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">28.5</span>
              <span className="text-xs text-slate-500 font-mono uppercase">kPa</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="pressure" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="调压室数字孪生动态监测" 
            subtitle="SURGE TANK DIGITAL TWIN" 
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
                <div className="bg-slate-900/80 border-l-2 border-sky-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">涌浪周期</div>
                  <div className="text-2xl font-mono font-bold text-sky-400">124.5 <span className="text-xs">sec</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">阻尼比</div>
                  <div className="text-xl font-mono font-bold text-white">0.085</div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Max Surge</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">78.2 <span className="text-xs text-slate-500">m</span></div>
                  </div>
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Min Surge</div>
                    <div className="text-xl font-mono font-bold text-amber-400">42.5 <span className="text-xs text-slate-500">m</span></div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="频谱分析" subtitle="SPECTRUM ANALYSIS">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "检测到调压室水位长周期波动，频率 0.008Hz，符合正常涌浪特性。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断预警" subtitle="AI DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">结构稳定性良好</h4>
                  <p className="text-[10px] text-slate-400">筒体振动幅值处于极低水平，未发现共振风险。</p>
                </div>
              </div>
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex gap-3">
                <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-sky-400 uppercase mb-1">涌浪衰减正常</h4>
                  <p className="text-[10px] text-slate-400">负荷变动后水位波动衰减系数符合设计要求。</p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="历史趋势" subtitle="HISTORICAL TREND">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="level" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">24H Average Level</span>
              <span className="text-xs font-bold text-white">61.5 m</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SurgeTankVibration;
