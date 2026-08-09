import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  RotateCw, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge,
  Wind,
  Waves
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/ConicalCrusher/ThreeScene';
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
  vibration: Math.random() * 2 + 1,
  speed: Math.random() * 1 + 10,
  pressure: Math.random() * 5 + 20,
}));

const ConicalCrusher: React.FC = () => {
  const [status, setStatus] = useState('normal');

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.95) setStatus('warning');
      else if (rand > 0.99) setStatus('danger');
      else setStatus('normal');
    }, 5000);
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
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/50">
              <RotateCw className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">圆锥破碎机运行监测系统</h1>
              <p className="text-xs text-amber-400/70 font-mono">CONICAL CRUSHER MONITORING V2.0</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-500 font-mono uppercase">Crusher Status</div>
            <div className={`text-sm font-bold flex items-center gap-2 ${
              status === 'normal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                status === 'normal' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {status.toUpperCase()}
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </motion.div>
      </header>

      {/* Main Layout */}
      <main className="w-full h-full grid grid-cols-12 gap-0">
        
        {/* Left Panel: Crusher Metrics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 偏心轴振动 (Eccentric Vib)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">1.52</span>
              <span className="text-sm text-slate-400 font-mono">mm/s</span>
            </div>
            <div className="mt-4 h-24">
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                <Wind className="w-4 h-4" /> 油压监测 (Oil Pressure)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">24.5</span>
              <span className="text-sm text-slate-400 font-mono">MPa</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Oil Temp</div>
                <div className="text-sm font-bold text-emerald-400">42.8 °C</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Oil Flow</div>
                <div className="text-sm font-bold text-white">124 L/min</div>
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
              <Cpu className="w-4 h-4 text-amber-400" /> 关键部件状态
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">主轴承 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono">Status: NORMAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">45.2 °C</div>
                    <div className="text-[10px] text-slate-500 font-mono">0.12 mm/s</div>
                  </div>
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

          {/* Crushing Force HUD */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
            <div className="px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-3xl flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">Crushing Force</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">1,245</span>
                <span className="text-sm text-slate-400 font-mono">kN</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Crusher: RUNNING</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Liner Life: 78%</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Current: 450 A</span>
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
            <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 振动趋势分析
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-rose-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 智能诊断
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="text-xs font-bold text-rose-400 mb-1">过铁冲击预警</div>
                <p className="text-[10px] text-slate-400">检测到瞬时高能冲击脉冲，疑似发生过铁现象，建议检查排料口及衬板。</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400">运行效率: 92%</div>
                <p className="text-[10px] text-slate-400">当前破碎力矩稳定，能耗处于正常水平。</p>
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
              <Thermometer className="w-4 h-4 text-amber-400" /> 关键点温度
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">主轴承</span>
                <span className="text-xs font-bold text-white">52.4 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[52%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">液压油温</span>
                <span className="text-xs font-bold text-white">42.8 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[42%]" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center z-20">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Status: OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Data: REALTIME</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 CRUSHING SOLUTIONS | UNIT_ID: CC_08
        </div>
      </footer>
    </div>
  );
};

export default ConicalCrusher;
