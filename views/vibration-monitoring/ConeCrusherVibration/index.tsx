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
  ArrowDown,
  Layers,
  Box,
  Target
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/ConeCrusherVibration/ThreeScene';
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
  vibration: Math.random() * 8 + 4,
  pressure: Math.random() * 2 + 10,
  current: Math.random() * 50 + 150,
}));

const ConeCrusherVibration: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [load, setLoad] = useState(75);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
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
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Target className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              圆锥破碎机振动监测系统
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 uppercase tracking-widest">Cone Crusher</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: CONE-CR-01</span>
              <span className={`flex items-center gap-1 font-bold uppercase tracking-wider ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status === 'normal' ? 'SYSTEM OPERATIONAL' : 'SYSTEM WARNING'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Operational Load</div>
            <div className="text-sm font-mono font-bold text-orange-400">{load.toFixed(1)}%</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Crushing Force</div>
            <div className="text-sm font-mono font-bold text-emerald-400">1,245 kN</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心振动指标" subtitle="CORE VIBRATION">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '偏心轴振动', val: '8.42', unit: 'mm/s', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '润滑油压', val: '12.5', unit: 'MPa', icon: Waves, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { label: '电机功率', val: '450', unit: 'kW', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${m.bg} rounded-lg group-hover:scale-110 transition-transform`}><m.icon size={16} className={m.color} /></div>
                    <span className="text-xs text-slate-400">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{m.val} <span className="text-[10px] opacity-50">{m.unit}</span></span>
                </motion.div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="关键点温度" subtitle="CRITICAL TEMPERATURES" className="flex-1">
            <div className="space-y-4">
              {[
                { label: '偏心套温度', val: 58.4, color: 'bg-orange-500', text: 'text-orange-400' },
                { label: '主轴承温度', val: 45.5, color: 'bg-sky-500', text: 'text-sky-400' },
                { label: '润滑油温', val: 42.5, color: 'bg-emerald-500', text: 'text-emerald-400' }
              ].map((t, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-slate-400">{t.label}</span>
                    <span className={t.text}>{t.val} °C</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${t.val}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full ${t.color} rounded-full`} 
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
            title="破碎机数字孪生" 
            subtitle="CRUSHER DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/80 border border-orange-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-center"
                >
                  <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase mb-1">Crushing Force</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">1,245</span>
                    <span className="text-sm text-slate-400 font-mono">kN</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">CRUSHER: STABLE</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Liner Wear: 12%</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Power: 450 kW</div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-slate-400 hover:text-orange-400">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="振动频谱分析" subtitle="VIBRATION SPECTRUM">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与预警" subtitle="AI DIAGNOSTICS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-2 uppercase">
                  <AlertTriangle size={12} />
                  过铁保护预警
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">检测到瞬时破碎力异常峰值，疑似腔内进入非破碎物，请注意观察。</p>
              </div>
              
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase">
                  <Shield size={12} />
                  给料均匀度良好
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">当前给料分布均匀，腔内物料填充率正常。</p>
              </div>

              <button className="w-full py-3 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600/40 transition-all flex items-center justify-center gap-2">
                查看维护记录 <ChevronRight size={14} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="驱动电机参数" subtitle="MOTOR PARAMETERS">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">驱动电机 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Status: NORMAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">185.4 A</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tighter">98.2% Load</div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConeCrusherVibration;
