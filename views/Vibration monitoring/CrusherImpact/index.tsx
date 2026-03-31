import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
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
  Hammer,
  Waves
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/CrusherImpact/ThreeScene';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 5 + 2,
  impact: Math.random() * 100 + 50,
  load: Math.random() * 20 + 70,
}));

const CrusherImpact: React.FC = () => {
  const [impactCount, setImpactCount] = useState(1245);

  useEffect(() => {
    const timer = setInterval(() => {
      setImpactCount(prev => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* HUD Header */}
      <header className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/50">
              <Hammer className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">破碎机冲击振动监测系统</h1>
              <p className="text-xs text-rose-400/70 font-mono">CRUSHER IMPACT VIBRATION MONITORING V2.0</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-500 font-mono uppercase">Impact Frequency</div>
            <div className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              HIGH IMPACT ZONE
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </motion.div>
      </header>

      {/* Main Layout */}
      <main className="w-full h-full grid grid-cols-12 gap-0">
        
        {/* Left Panel: Impact Metrics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> 冲击能量 (Impact Energy)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">84.2</span>
              <span className="text-sm text-slate-400 font-mono">kJ</span>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="impact" stroke="#f43f5e" fillOpacity={1} fill="url(#colorImpact)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                <Waves className="w-4 h-4" /> 瞬时振动 (Transient Vib)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">4.52</span>
              <span className="text-sm text-slate-400 font-mono">mm/s</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Peak Accel</div>
                <div className="text-sm font-bold text-rose-400">12.4 g</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">RMS Vib</div>
                <div className="text-sm font-bold text-white">1.2 mm/s</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 overflow-hidden flex flex-col"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" /> 冲击事件序列
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <Zap className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Impact #{impactCount - i}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Energy: {(Math.random() * 50 + 30).toFixed(1)} kJ</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="col-span-6 relative">
          <div className="absolute inset-0 z-0">
            <ThreeScene />
          </div>

          {/* Impact Count HUD */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
            <div className="px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-3xl flex flex-col items-center">
              <span className="text-[10px] text-rose-400 font-bold tracking-widest uppercase mb-1">Total Impacts Today</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">{impactCount}</span>
                <span className="text-sm text-slate-400 font-mono">EVENTS</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-full flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Chamber: ACTIVE</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Liner Health: 84%</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Load: 72 t/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Advanced Analysis */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-rose-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 冲击分布图
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" dataKey="time" hide />
                  <YAxis type="number" dataKey="impact" hide />
                  <ZAxis type="number" dataKey="vibration" range={[20, 200]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Impacts" data={mockData} fill="#f43f5e" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 衬板磨损诊断
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1">磨损速率增加</div>
                <p className="text-[10px] text-slate-400">检测到冲击频谱向低频偏移，表明衬板厚度已降至临界值，建议下周更换。</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400">运行效率: 94%</div>
                <p className="text-[10px] text-slate-400">当前破碎比符合预期，能耗处于最优区间。</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" /> 电机与轴承温度
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">主电机</span>
                <span className="text-xs font-bold text-white">68.2 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[68%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">偏心轴承</span>
                <span className="text-xs font-bold text-white">52.4 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[52%]" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center z-20">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Impact Status: MONITORING</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Data: SYNCED</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 CRUSHING TECHNOLOGY | UNIT_ID: CR_05
        </div>
      </footer>
    </div>
  );
};

export default CrusherImpact;
