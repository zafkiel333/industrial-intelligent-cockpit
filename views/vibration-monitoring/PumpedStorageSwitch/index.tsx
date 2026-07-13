import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge,
  Waves,
  RotateCw,
  RefreshCw,
  Wind
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/PumpedStorageSwitch/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PumpedStorageSwitch]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PumpedStorageSwitch';
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

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 4 + 2,
  speed: Math.random() * 50 + 450,
  power: Math.random() * 100 + 200,
}));

const PumpedStorageSwitch: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [mode, setMode] = useState<'pumping' | 'generating' | 'transition'>('generating');

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.8) setMode(prev => prev === 'generating' ? 'pumping' : 'generating');
      if (rand > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <RefreshCw className={`text-cyan-400 ${mode === 'transition' ? 'animate-spin' : ''}`} size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              抽水蓄能机组工况切换监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Transition Monitor</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: PS-UNIT-01</span>
              <span className="flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-wider">{mode} MODE</span>
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
          <SciFiCard title="机组振动幅值" subtitle="UNIT VIBRATION">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">3.42</span>
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
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fill="url(#vibGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="额定转速监测" subtitle="RATED SPEED">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white tracking-tighter">500.2</span>
              <span className="text-xs text-slate-500 font-mono uppercase">rpm</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Frequency</div>
                <div className="text-sm font-bold text-emerald-400">50.02 Hz</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Phase</div>
                <div className="text-sm font-bold text-white">12.4°</div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="轴承运行状态" subtitle="BEARING STATUS">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{i}# 导轴承</div>
                    <div className="text-[10px] text-slate-500 font-mono">NORMAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">48.5 °C</div>
                    <div className="text-[10px] text-slate-500 font-mono">0.08 mm</div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="机组数字孪生动态监测" 
            subtitle="UNIT DIGITAL TWIN REAL-TIME TWIN" 
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
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">切换进度</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">100 <span className="text-xs">%</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">机组效率</div>
                  <div className="text-xl font-mono font-bold text-white">94.2%</div>
                </div>
              </div>
              
              <div className="flex justify-center items-end">
                <div className="px-6 py-3 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center gap-8 pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">STABLE</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono text-white">300 MW</span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="切换过程振动趋势" subtitle="TRANSITION VIB TREND">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断" subtitle="AI DIAGNOSTICS">
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1 uppercase">过渡过程压力脉动</div>
                <p className="text-[10px] text-slate-400">检测到工况切换期间尾水管压力脉动异常，建议优化导叶开启规律。</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 uppercase">机组动平衡良好</div>
                <p className="text-[10px] text-slate-400">当前转速下各导轴承振动值均在优良范围内。</p>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="水力参数" subtitle="HYDRAULIC METRICS">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">上游水头</span>
                <span className="text-xs font-bold text-white">452.4 m</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 w-[85%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">流量</span>
                <span className="text-xs font-bold text-white">124.5 m³/s</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[60%]" />
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PumpedStorageSwitch;
