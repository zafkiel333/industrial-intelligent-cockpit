import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/MineHoist/ThreeScene';
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
  speed: Math.random() * 5 + 10,
  tension: Math.random() * 100 + 500,
}));

const MineHoist: React.FC = () => {
  const [direction, setDirection] = useState('up'); // up, down, idle
  const [depth, setDepth] = useState(450);

  useEffect(() => {
    const interval = setInterval(() => {
      setDepth(prev => {
        if (direction === 'up') return Math.max(0, prev - 1);
        if (direction === 'down') return Math.min(800, prev + 1);
        return prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [direction]);

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
              <ArrowUpCircle className={`w-6 h-6 text-amber-400 ${direction === 'up' ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">矿井提升机综合监测系统</h1>
              <p className="text-xs text-amber-400/70 font-mono">MINE HOIST INTEGRATED MONITORING SYSTEM V2.0</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex gap-4">
            <button 
              onClick={() => setDirection('up')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${direction === 'up' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              提升 (UP)
            </button>
            <button 
              onClick={() => setDirection('down')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${direction === 'down' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              下放 (DOWN)
            </button>
            <button 
              onClick={() => setDirection('idle')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${direction === 'idle' ? 'bg-slate-700 text-white' : 'hover:bg-white/5 text-slate-400'}`}
            >
              停止
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="w-full h-full grid grid-cols-12 gap-0">
        
        {/* Left Panel: Hoist Metrics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> 当前深度 (Current Depth)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">{depth.toFixed(1)}</span>
              <span className="text-sm text-slate-400 font-mono">m</span>
            </div>
            <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500"
                animate={{ width: `${(depth / 800) * 100}%` }}
              />
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
                <Activity className="w-4 h-4" /> 钢丝绳张力 (Tension)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">542.8</span>
              <span className="text-sm text-slate-400 font-mono">kN</span>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="tension" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTension)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 overflow-hidden flex flex-col"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" /> 系统运行状态
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">主轴承 {i}#</div>
                    <div className="text-[10px] text-slate-500 font-mono">Normal Operation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">42.5 °C</div>
                    <div className="text-[10px] text-slate-500 font-mono">0.45 mm/s</div>
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

          {/* Speed HUD */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
            <div className="px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-3xl flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">Current Speed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">12.4</span>
                <span className="text-sm text-slate-400 font-mono">m/s</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Brake System: READY</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Safety Factor: 8.5</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">Load: 45.2 t</span>
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
              <BarChart3 className="w-4 h-4" /> 振动频谱分析
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
              <AlertTriangle className="w-4 h-4" /> 故障诊断报告
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="text-xs font-bold text-rose-400 mb-1">钢丝绳疲劳预警</div>
                <p className="text-[10px] text-slate-400">检测到主绳左侧存在微小频率偏移，建议在下次检修时进行磁粉探伤。</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400">系统健康度: 92%</div>
                <p className="text-[10px] text-slate-400">整体运行平稳，各项指标均在安全阈值内。</p>
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
              <Thermometer className="w-4 h-4 text-amber-400" /> 关键部件温度
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">电机绕组</span>
                <span className="text-xs font-bold text-white">72.4 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[72%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">减速箱油温</span>
                <span className="text-xs font-bold text-white">54.8 °C</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[54%]" />
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
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System: OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Mode: AUTOMATIC</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 MINING TECHNOLOGY SOLUTIONS | HOIST_ID: MH_07
        </div>
      </footer>
    </div>
  );
};

export default MineHoist;
