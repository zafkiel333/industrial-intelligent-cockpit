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
  ArrowUp,
  ArrowDown,
  Layers,
  Box
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/MineHoist/ThreeScene';
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
  vibration: Math.random() * 6 + 2,
  speed: Math.random() * 2 + 8,
  tension: Math.random() * 10 + 200,
}));

const MineHoist: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [direction, setDirection] = useState<'up' | 'down' | 'stop'>('up');

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.8) setDirection(prev => prev === 'up' ? 'down' : 'up');
      if (rand > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Layers className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              矿井提升机主轴承振动监测
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest">Mine Hoist</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: MH-UNIT-01</span>
              <span className="flex items-center gap-1 font-bold text-amber-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">运行方向</div>
            <div className={`text-sm font-bold flex items-center gap-2 ${
              direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-sky-400' : 'text-slate-400'
            }`}>
              {direction === 'up' ? <ArrowUp className="w-4 h-4" /> : direction === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
              {direction.toUpperCase()}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">提升速度</div>
            <div className="text-sm font-mono font-bold text-emerald-400">12.5 m/s</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="主轴承振动幅值" subtitle="SHAFT VIBRATION">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white tracking-tighter">5.82</span>
              <span className="text-sm text-slate-400 font-mono">mm/s</span>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVib)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="关键部件状态" subtitle="COMPONENT STATUS" className="flex-1">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">提升机轴承 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono">Status: NORMAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">52.4 °C</div>
                    <div className="text-[10px] text-slate-500 font-mono">0.15 mm/s</div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="提升机数字孪生" 
            subtitle="HOIST DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-center">
                <div className="bg-slate-900/80 border border-amber-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">Wire Rope Tension</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">245.8</span>
                    <span className="text-sm text-slate-400 font-mono">kN</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">ACTIVE</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Brake: 98%</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Power: 1.2 MW</div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="振动趋势分析" subtitle="VIBRATION TREND">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断" subtitle="AI DIAGNOSTICS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-2">
                  <AlertTriangle size={12} />
                  早期故障预警
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">检测到高频冲击脉冲，疑似轴承外圈发生点蚀，建议在下次检修时重点检查。</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">关键点温度</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">主轴承 A</span>
                      <span className="font-bold text-white">52.4 °C</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[52%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">电机绕组</span>
                      <span className="font-bold text-white">78.5 °C</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[78%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MineHoist;
