import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PortPipeline/ThreeScene';
import { 
  Activity, 
  Droplets, 
  Waves, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  Settings,
  ChevronRight,
  Gauge,
  Thermometer,
  Wind
} from 'lucide-react';
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

const mockFlowData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  vibration: 1.5 + Math.random() * 1.5,
  pressure: 40 + Math.random() * 10,
}));

const PortPipelineView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Droplets className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              码头装卸油管路流体诱发震动
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Port Pipeline</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: PIPE-SEC-08</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">FLOW STABLE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前流速</div>
            <div className="text-sm font-mono font-bold text-cyan-400">4.2 m/s</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">管路压力</div>
            <div className="text-sm font-mono font-bold text-blue-400">0.85 MPa</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Flow Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="流体动力指标" subtitle="FLUID DYNAMICS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '震动峰值', val: '2.45', unit: 'mm/s', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '流体脉动', val: '0.12', unit: 'bar', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '管壁应力', val: '145', unit: 'MPa', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: '结构完整性', val: '98.2', unit: '%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
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

          <SciFiCard title="震动趋势分析" subtitle="VIBRATION TREND" className="flex-1">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockFlowData}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 5]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">流体诱发震动特征</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">主频分量</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">12.5 Hz</span>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="管路系统数字孪生" 
            subtitle="PIPELINE DIGITAL TWIN" 
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
                  className="bg-slate-900/80 border border-cyan-500/30 p-4 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                >
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-1">Flow Velocity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">4.2</span>
                    <span className="text-sm text-slate-400 font-mono">m/s</span>
                  </div>
                </motion.div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Reynolds Number</div>
                    <div className="text-sm font-bold text-white font-mono">2.4e5</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">REAL-TIME TELEMETRY</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Turbulence Level: Low</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Cavitation Risk: 2%</div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Diagnostics & Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="压力脉动监测" subtitle="PRESSURE PULSATION">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[30, 60]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断报告" subtitle="DIAGNOSTIC REPORT" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  系统运行评估
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  当前管路震动主频稳定在12.5Hz，幅值处于安全阈值范围内。流体脉动与管路压力匹配良好，未发现明显的流固耦合共振风险。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">管路支撑状态</h4>
                {[
                  { label: '支撑 A-12', status: 'Secure', color: 'text-emerald-400' },
                  { label: '支撑 B-04', status: 'Secure', color: 'text-emerald-400' },
                  { label: '弯头支撑', status: 'Nominal', color: 'text-cyan-400' }
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">{s.label}</span>
                    <span className={`font-bold ${s.color} uppercase`}>{s.status}</span>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-600/40 transition-all flex items-center justify-center gap-2 group">
                导出完整分析报告
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortPipelineView;
