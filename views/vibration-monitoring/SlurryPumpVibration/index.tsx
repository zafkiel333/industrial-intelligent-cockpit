import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/SlurryPumpVibration/ThreeScene';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Droplets, 
  Zap, 
  Activity, 
  ShieldAlert, 
  AlertTriangle,
  Settings,
  ChevronRight,
  Gauge,
  Thermometer,
  Waves
} from 'lucide-react';

const mockSlurryData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.2 + Math.sin(i * 0.4) * 0.5 + Math.random() * 0.3,
  density: 1.35 + Math.random() * 0.1,
}));

const SlurryPumpVibrationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Droplets className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              渣浆泵振动与磨损智能监测
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest">Slurry Pump</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: SL-PUMP-07</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">PUMP OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">矿浆密度</div>
            <div className="text-sm font-mono font-bold text-amber-400">1.42 t/m³</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">处理流量</div>
            <div className="text-sm font-mono font-bold text-cyan-400">850 m³/h</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="运行核心指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '电机功率', val: '185.5', unit: 'kW', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: '轴承温度', val: '54.2', unit: '℃', icon: Thermometer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '叶轮磨损度', val: '12.5', unit: '%', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: '泵速', val: '1200', unit: 'RPM', icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' }
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

          <SciFiCard title="历史磨损趋势" subtitle="WEAR HISTORY" className="flex-1">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{name: 'M1', v: 5}, {name: 'M2', v: 8}, {name: 'M3', v: 12}, {name: 'M4', v: 15}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 20]} />
                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Bar dataKey="v" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">磨损预测</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">预计更换周期</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">45 Days</span>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="渣浆泵运行数字孪生" 
            subtitle="SLURRY PUMP TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/80 border border-amber-500/30 p-4 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                >
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">Impeller Vibration</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">2.15</span>
                    <span className="text-sm text-slate-400 font-mono">mm/s</span>
                  </div>
                </motion.div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Cavitation Index</div>
                    <div className="text-sm font-bold text-white font-mono">0.08</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">ACTIVE MONITORING</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Flow: 850 m³/h</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Efficiency: 78%</div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-amber-500/20 hover:border-amber-500/50 transition-all text-slate-400 hover:text-amber-400">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="实时振动趋势" subtitle="VIBRATION TREND">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSlurryData}>
                  <defs>
                    <linearGradient id="colorVibe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 3]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="vibration" stroke="#f59e0b" fill="url(#colorVibe)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="磨损状态诊断" subtitle="WEAR DIAGNOSIS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle size={12} />
                  智能诊断建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  监测到叶轮通过频率（BPF）分量有所增加，结合矿浆密度波动，判断为叶轮局部磨损导致的动不平衡。建议在下次停机时检查泵壳内衬及叶轮磨损情况。
                </p>
              </div>
              
              <button className="w-full py-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600/40 transition-all flex items-center justify-center gap-2 group">
                开启详细诊断
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SlurryPumpVibrationView;
