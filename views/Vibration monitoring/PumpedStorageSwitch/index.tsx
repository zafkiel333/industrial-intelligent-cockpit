import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  RefreshCw, 
  Zap, 
  Droplets, 
  Cpu, 
  AlertCircle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Wind
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/PumpedStorageSwitch/ThreeScene';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 2 + 1,
  flow: Math.random() * 500 + 1000,
  efficiency: Math.random() * 10 + 85,
}));

const PumpedStorageSwitch: React.FC = () => {
  const [mode, setMode] = useState('generating'); // generating, pumping, transitioning
  const [progress, setProgress] = useState(100);

  const handleModeSwitch = (newMode: string) => {
    if (newMode === mode) return;
    setMode('transitioning');
    setProgress(0);
    setTimeout(() => {
      setMode(newMode);
      setProgress(100);
    }, 3000);
  };

  useEffect(() => {
    if (mode === 'transitioning') {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 100));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [mode]);

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
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/50">
              <RefreshCw className={`w-6 h-6 text-blue-400 ${mode === 'transitioning' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">抽水蓄能机组工况转换监测</h1>
              <p className="text-xs text-blue-400/70 font-mono">PUMPED STORAGE UNIT SWITCH MONITORING V2.0</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex gap-4">
            <button 
              onClick={() => handleModeSwitch('generating')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'generating' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              发电模式
            </button>
            <button 
              onClick={() => handleModeSwitch('pumping')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'pumping' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              抽水模式
            </button>
          </div>
          <button className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="w-full h-full grid grid-cols-12 gap-0">
        
        {/* Left Panel: Operational Metrics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 振动幅值 (Vibration)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">2.45</span>
              <span className="text-sm text-slate-400 font-mono">μm</span>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVib)" />
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
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Droplets className="w-4 h-4" /> 实时流量 (Flow Rate)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">1,240</span>
              <span className="text-sm text-slate-400 font-mono">m³/s</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Input Pressure</div>
                <div className="text-sm font-bold text-white">4.2 MPa</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Output Pressure</div>
                <div className="text-sm font-bold text-white">0.8 MPa</div>
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
              <Cpu className="w-4 h-4 text-blue-400" /> 机组运行日志
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-white">工况转换指令</span>
                    <span className="text-[10px] text-slate-500 font-mono">10:45:22</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    机组从[发电模式]向[抽水模式]转换，当前导叶开度：15%。
                  </p>
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

          {/* Transition Progress HUD */}
          <AnimatePresence>
            {mode === 'transitioning' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center"
              >
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="96" cy="96" r="80" 
                      className="stroke-white/10 fill-none" 
                      strokeWidth="8" 
                    />
                    <motion.circle 
                      cx="96" cy="96" r="80" 
                      className="stroke-blue-500 fill-none" 
                      strokeWidth="8"
                      strokeDasharray="502.6"
                      animate={{ strokeDashoffset: 502.6 - (502.6 * progress) / 100 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{progress}%</span>
                    <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Transitioning</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${mode === 'generating' ? 'bg-blue-500' : mode === 'pumping' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-white uppercase tracking-widest">{mode} MODE</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Wind className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">375.2 RPM</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3">
                <Thermometer className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-white">42.8 °C</span>
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
            <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 转换效率分析
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="step" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEff)" />
                </AreaChart>
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
              <AlertCircle className="w-4 h-4" /> 智能预警系统
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1">轴承温度偏高</div>
                <p className="text-[10px] text-slate-400">推力轴承3号瓦温升速率异常，建议关注工况转换过程中的热稳定性。</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-1">转换平稳性评估</div>
                <p className="text-[10px] text-slate-400">当前转换过程振动幅值在安全范围内，平稳性指数：0.92。</p>
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
              <Zap className="w-4 h-4 text-blue-400" /> 能量转换统计
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Today Generated</div>
                <div className="text-xl font-bold text-white">452 MWh</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Today Pumped</div>
                <div className="text-xl font-bold text-white">389 MWh</div>
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
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Unit Status: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Sync: REALTIME</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 HYDROPOWER MONITORING | UNIT_ID: PS_04
        </div>
      </footer>
    </div>
  );
};

export default PumpedStorageSwitch;
