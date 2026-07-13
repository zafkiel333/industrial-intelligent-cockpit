import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ConveyorBeltVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ConveyorBeltVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ConveyorBeltVibration';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FastForward, 
  Zap, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Settings,
  ChevronRight,
  Gauge,
  Waves,
  ArrowRight
} from 'lucide-react';

const mockBeltData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  vibration: 2.5 + Math.sin(i * 0.4) * 0.8 + Math.random() * 0.3,
  tension: 85 + Math.random() * 5,
}));

const ConveyorBeltVibrationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <FastForward className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              矿用皮带机驱动滚筒振动监测
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">Conveyor Belt</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: CB-UNIT-07</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">皮带速度</div>
            <div className="text-sm font-mono font-bold text-emerald-400">4.2 m/s</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">运量负荷</div>
            <div className="text-sm font-mono font-bold text-cyan-400">2450 t/h</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心运行指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '电机电流', val: '145.2', unit: 'A', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: '皮带张力', val: '88.4', unit: 'kN', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '传动效率', val: '94.5', unit: '%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
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

          <SciFiCard title="托辊健康分布" subtitle="IDLER HEALTH" className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`h-8 rounded border flex items-center justify-center text-[8px] font-mono cursor-pointer transition-all hover:scale-110 ${
                      i === 7 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    }`}
                  >
                    R{i+1}
                  </motion.div>
                ))}
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase mb-1">异常预警</div>
                <div className="text-xs font-bold text-yellow-400 flex items-center gap-2">
                  <AlertCircle size={14} />
                  发现 1 处托辊异常 (ID: R-08)
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="驱动滚筒数字孪生" 
            subtitle="DRIVE DRUM DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-center">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 border border-emerald-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                >
                  <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1">Drum Vibration RMS</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">3.12</span>
                    <span className="text-sm text-slate-400 font-mono">mm/s</span>
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
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Belt Health: 92%</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Slip: 0.2%</div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-slate-400 hover:text-emerald-400">
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
                <AreaChart data={mockBeltData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="vibration" stroke="#10b981" fill="url(#colorVib)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="运行状态诊断" subtitle="STATUS DIAGNOSIS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
                  <AlertCircle size={12} />
                  智能诊断建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  驱动滚筒振动水平处于正常范围。频谱分析显示存在微弱的皮带扣冲击特征，属于正常损耗。建议在下次停机时检查皮带接头完整性。
                </p>
              </div>
              
              <button className="w-full py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600/40 transition-all flex items-center justify-center gap-2 group">
                <FastForward size={14} className="group-hover:translate-x-1 transition-transform" />
                开启全线扫描
                <ChevronRight size={14} />
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConveyorBeltVibrationView;
