import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
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
  Radio
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/PortSubstation/ThreeScene';
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
  vibration: Math.random() * 2 + 1,
  magnetic: Math.sin(i * 0.5) * 10 + 50,
  temp: 45 + Math.random() * 5,
}));

const PortSubstationView: React.FC = () => {
  const [status, setStatus] = useState('normal');

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Zap className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              港口变电站变压器电磁震动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Core Monitoring</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: PORT-SUB-01</span>
              <span className="flex items-center gap-1"><Radio size={12} /> 磁场强度: 52.4 μT</span>
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
          <SciFiCard title="电磁震动幅值" subtitle="ELECTROMAGNETIC VIBRATION">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">2.45</span>
              <span className="text-xs text-slate-500 font-mono uppercase">mm/s</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="磁场强度监测" subtitle="MAGNETIC FIELD STRENGTH">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">52.4</span>
              <span className="text-xs text-slate-500 font-mono uppercase">μT</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="magnetic" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="变压器温度" subtitle="TRANSFORMER TEMP">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">48.2</span>
              <span className="text-xs text-slate-500 font-mono uppercase">°C</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                <span>Safe Range: 0-85°C</span>
                <span className="text-emerald-400">NORMAL</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: '56%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="变压器数字孪生动态监测" 
            subtitle="TRANSFORMER DIGITAL TWIN" 
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
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">核心震动频率</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">100.2 <span className="text-xs">Hz</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">绝缘健康度</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">99.5%</div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">负载率</div>
                    <div className="text-xl font-mono font-bold text-white">65.4%</div>
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
                  <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "主频集中在100Hz及其倍频，符合电磁震动特征，幅值稳定。"
              </p>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断预警" subtitle="AI DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">运行状态正常</h4>
                  <p className="text-[10px] text-slate-400">各项震动指标均在安全阈值内，变压器运行平稳。</p>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex gap-3">
                <Cpu className="w-4 h-4 text-cyan-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">电磁平衡度高</h4>
                  <p className="text-[10px] text-slate-400">三相电磁力分布均匀，未见局部过热或松动迹象。</p>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="历史趋势" subtitle="HISTORICAL TREND">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono">24H Avg Temp</span>
              <span className="text-xs font-bold text-white">47.5 °C</span>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortSubstationView;
