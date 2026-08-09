import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Zap, 
  Waves, 
  Maximize2, 
  Settings, 
  Database,
  Info,
  ChevronRight,
  BarChart3,
  Cpu
} from 'lucide-react';
import { ThreeScene } from '../../../components/Vibration monitoring/DamGalleryMicroseismic/ThreeScene';
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
  energy: Math.random() * 100,
  frequency: Math.random() * 50 + 10,
  vibration: Math.random() * 2,
}));

const DamGalleryMicroseismic: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
      </div>

      {/* Header HUD */}
      <header className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-500/50">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase text-white">大坝廊道微震监测系统</h1>
              <p className="text-xs text-sky-400/70 font-mono">DAM GALLERY MICROSEISMIC MONITORING SYSTEM V2.0</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-500 font-mono uppercase">System Status</div>
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

      {/* Main Content Area */}
      <main className="relative w-full h-full grid grid-cols-12 gap-0">
        
        {/* Left Panel: Real-time Stats */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 实时震动强度
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">1.24</span>
              <span className="text-sm text-slate-400 font-mono">mm/s</span>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="vibration" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorVib)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> 累计释放能量
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tighter">45.8</span>
              <span className="text-sm text-slate-400 font-mono">kJ</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Max Energy</div>
                <div className="text-sm font-bold text-white">12.4 kJ</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">Avg Energy</div>
                <div className="text-sm font-bold text-white">2.1 kJ</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 overflow-hidden flex flex-col"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" /> 最近微震事件
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-sky-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <Waves className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Event #{1024 + i}</div>
                      <div className="text-[10px] text-slate-500 font-mono">14:23:45.00{i}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
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
          
          {/* 3D HUD Overlays */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-sky-500/30 rounded-full flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-xs font-mono text-sky-400">DAM_SECTION_01</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Sensors:</span>
                <span className="text-xs font-mono text-white">12/12 ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="absolute top-24 right-0 p-6 z-10">
            <div className="flex flex-col gap-2">
              <button className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-sky-500/20 transition-all">
                <Maximize2 className="w-5 h-5 text-slate-300" />
              </button>
              <button className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-sky-500/20 transition-all">
                <Info className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & Diagnostics */}
        <div className="col-span-3 z-10 p-6 flex flex-col gap-6 mt-24">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-sky-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 频谱分析
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                  />
                  <Line type="stepAfter" dataKey="frequency" stroke="#0ea5e9" strokeWidth={2} dot={false} />
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
              <AlertTriangle className="w-4 h-4" /> 结构健康诊断
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">稳定性指数</span>
                <span className="text-xs font-bold text-emerald-400">98.2%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98.2%' }}
                  className="h-full bg-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                当前大坝结构处于高度稳定状态，未检测到异常应力集中或结构性损伤迹象。
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" /> 智能预测
            </h3>
            <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10">
              <div className="text-xs text-sky-400 mb-2 font-bold uppercase tracking-widest">Next 24h Forecast</div>
              <div className="text-2xl font-bold text-white mb-1">LOW RISK</div>
              <div className="text-[10px] text-slate-500">基于AI模型的微震频率预测，未来24小时内发生显著微震事件的概率低于5%。</div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="absolute bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center z-20">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Network: STABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Database: SYNCED</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          © 2026 INDUSTRIAL MONITORING SOLUTIONS | LATENCY: 24ms
        </div>
      </footer>
    </div>
  );
};

export default DamGalleryMicroseismic;
