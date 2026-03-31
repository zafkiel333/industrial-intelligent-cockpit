import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/JawCrusher/ThreeScene';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import { 
  Gavel, 
  Zap, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Settings,
  ChevronRight,
  Gauge,
  Waves,
  Target
} from 'lucide-react';

const mockImpactData = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: 50 + Math.random() * 50,
  z: 10 + Math.random() * 20,
}));

const JawCrusherView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Gavel className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              破碎机主轴与衬板冲击振动监测
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 uppercase tracking-widest">Jaw Crusher</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: JAW-CR-04</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">冲击载荷</div>
            <div className="text-sm font-mono font-bold text-orange-400">845 kN</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">处理量</div>
            <div className="text-sm font-mono font-bold text-cyan-400">450 t/h</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心运行指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '主轴转速', val: '245', unit: 'RPM', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: '振动峰值', val: '12.4', unit: 'mm/s', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '衬板健康度', val: '82.5', unit: '%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
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

          <SciFiCard title="主轴承温度监控" subtitle="BEARING TEMPERATURES" className="flex-1">
            <div className="space-y-4">
              {[
                { label: '左侧轴承', val: 54.2, color: 'bg-orange-500', text: 'text-orange-400' },
                { label: '右侧轴承', val: 52.8, color: 'bg-emerald-500', text: 'text-emerald-400' }
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
            title="破碎腔动态数字孪生" 
            subtitle="CRUSHING CHAMBER TWIN" 
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
                  className="bg-slate-900/80 border border-orange-500/30 p-4 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                >
                  <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase mb-1">Impact Frequency</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">5.2</span>
                    <span className="text-sm text-slate-400 font-mono">Hz</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">ACTIVE MONITORING</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Liner Wear: 18%</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Gap: 125 mm</div>
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
          <SciFiCard title="冲击能量分布" subtitle="IMPACT ENERGY">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Scatter name="冲击事件" data={mockImpactData} fill="#fb923c" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="磨损与故障诊断" subtitle="WEAR & DIAGNOSIS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                  <AlertCircle size={12} />
                  衬板状态预警
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  监测到衬板冲击振动频谱中高频成分有所增加，结合处理量下降趋势，初步判断衬板磨损已接近临界值。建议在下个检修窗口检查衬板紧固情况及磨损深度。
                </p>
              </div>
              
              <button className="w-full py-3 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600/40 transition-all flex items-center justify-center gap-2 group">
                开启衬板磨损建模
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default JawCrusherView;
