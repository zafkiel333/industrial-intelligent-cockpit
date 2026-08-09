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
  Layers,
  Waves
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/VibratingScreen/ThreeScene';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 5 + 10,
  frequency: Math.random() * 2 + 15,
  load: Math.random() * 20 + 60,
}));

const VibratingScreen: React.FC = () => {
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
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">振动筛运行状态监测系统</h1>
              <p className="text-xs text-emerald-400/70 font-mono">VIBRATING SCREEN MONITORING V2.0</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-500 font-mono uppercase">Operational Status</div>
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
        
        {/* Left Panel: Screen Metrics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 振动幅值 (Amplitude)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">12.4</span>
              <span className="text-sm text-slate-400 font-mono">mm</span>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#10b981" fillOpacity={1} fill="url(#colorVib)" />
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
                <Waves className="w-4 h-4" /> 振动频率 (Frequency)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">15.8</span>
              <span className="text-sm text-slate-400 font-mono">Hz</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Resonance</div>
                <div className="text-sm font-bold text-emerald-400">NONE</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Stability</div>
                <div className="text-sm font-bold text-white">98.5%</div>
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
              <Cpu className="w-4 h-4 text-emerald-400" /> 关键部件监测
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">激振器 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono">Normal Operation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">42.5 °C</div>
                    <div className="text-[10px] text-slate-500 font-mono">1.2 mm/s</div>
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

          {/* Load HUD */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
            <div className="px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-3xl flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1">Current Material Load</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">72.4</span>
                <span className="text-sm text-slate-400 font-mono">t/h</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-full flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Screening: ACTIVE</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Structural Health: 96%</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Efficiency: 92.4%</span>
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
            <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 筛分效率分析
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar dataKey="load" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {mockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.4 + (index / 20) * 0.6} />
                    ))}
                  </Bar>
                </BarChart>
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
              <AlertTriangle className="w-4 h-4" /> 智能预警
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1">弹簧疲劳预警</div>
                <p className="text-[10px] text-slate-400">检测到左后侧支撑弹簧刚度下降，建议在下次停机时检查并更换。</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400">筛网完整性: 良好</div>
                <p className="text-[10px] text-slate-400">当前筛网振动频谱稳定，未检测到破损或堵塞迹象。</p>
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
              <Thermometer className="w-4 h-4 text-emerald-400" /> 激振器温度趋势
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">驱动端轴承</span>
                <span className="text-xs font-bold text-white">52.4 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[52%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">非驱动端轴承</span>
                <span className="text-xs font-bold text-white">48.8 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 w-[48%]" />
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
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Data: REALTIME</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 SCREENING SOLUTIONS | UNIT_ID: VS_09
        </div>
      </footer>
    </div>
  );
};

export default VibratingScreen;
