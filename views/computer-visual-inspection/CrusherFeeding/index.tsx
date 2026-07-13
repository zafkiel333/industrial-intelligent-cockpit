import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/CrusherFeeding/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-crusher-feeding]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-crusher-feeding';
import { RockParticle, FeedingState } from '@/components/computer-visual-inspection/CrusherFeeding/three-types';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3,
  History,
  Settings,
  Zap,
  ShieldCheck,
  TrendingUp,
  Timer,
  Cpu,
  Box,
  Layers,
  Eye,
  Database,
  RefreshCw,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Mock Data ---
const generateRocks = (): RockParticle[] => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `R-${i}`,
    size: Math.random() * 400 + 20,
    position: [Math.random() * 12 - 6, Math.random() * 0.5, Math.random() * 4 - 2],
    isOversized: Math.random() > 0.85,
    velocity: Math.random() * 0.05 + 0.03,
    rotationSpeed: [Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02]
  }));
};

const SIZE_DIST_DATA = [
  { name: '0-50mm', value: 400, color: '#06b6d4' },
  { name: '50-150mm', value: 300, color: '#0891b2' },
  { name: '150-300mm', value: 200, color: '#0e7490' },
  { name: '300mm+', value: 100, color: '#ef4444' },
];

const TREND_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${10 + Math.floor(i/12)}:${(i*5)%60}`,
  throughput: 1200 + Math.random() * 300,
  efficiency: 85 + Math.random() * 10
}));

// --- Sub-components ---

const StatPanel: React.FC<{ label: string; value: string | number; unit?: string; icon: any; color: string }> = ({ label, value, unit, icon: Icon, color }) => (
  <div className="bg-[#0f172a]/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-white flex items-baseline gap-1">
          {value}
          {unit && <span className="text-xs text-slate-500 font-normal">{unit}</span>}
        </h3>
      </div>
      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 transition-colors`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

const CrusherFeedingView: React.FC = () => {
  const [rocks, setRocks] = useState<RockParticle[]>(generateRocks());
  const [state, setState] = useState<FeedingState>({
    throughput: 1250.4,
    avgSize: 142.8,
    oversizeCount: 8,
    uniformityIndex: 0.88,
    moistureContent: 4.5,
    systemLoad: 72
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        throughput: 1200 + Math.random() * 100,
        avgSize: 140 + Math.random() * 10,
        systemLoad: 70 + Math.random() * 5
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-[Rajdhani] p-6 overflow-hidden select-none">
      
      {/* Header Section */}
      <header className="flex justify-between items-end mb-8">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl flex items-center justify-center relative z-10">
              <Layers className="text-cyan-400" size={32} />
            </div>
            <div className="absolute -inset-2 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">
              破碎机给料粒度 <span className="text-cyan-500">视觉分析系统</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={12} /> 系统运行正常
              </div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                节点: CRUSH-AI-04 // 延迟: 12ms
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold hover:border-cyan-500 transition-all">
            <RefreshCw size={14} className="text-cyan-500" /> 重新校准
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all">
            <Settings size={14} /> 系统配置
          </button>
        </motion.div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-6 min-h-0">
        
        {/* Top Stats Row */}
        <div className="col-span-3 row-span-1">
          <StatPanel label="瞬时处理量" value={state.throughput.toFixed(1)} unit="t/h" icon={Zap} color="bg-cyan-500" />
        </div>
        <div className="col-span-3 row-span-1">
          <StatPanel label="平均粒径" value={state.avgSize.toFixed(1)} unit="mm" icon={Box} color="bg-blue-500" />
        </div>
        <div className="col-span-3 row-span-1">
          <StatPanel label="系统负荷" value={state.systemLoad} unit="%" icon={Activity} color="bg-indigo-500" />
        </div>
        <div className="col-span-3 row-span-1">
          <StatPanel label="超限预警" value={state.oversizeCount} unit="次/min" icon={AlertTriangle} color="bg-red-500" />
        </div>

        {/* Center 3D Scene - Large Bento Box */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-6 row-span-4 bg-[#0f172a]/40 border border-slate-800 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 z-0">
            <ThreeScene rocks={rocks} isFeeding={true} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          
          {/* HUD Overlays */}
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">数字孪生激活</span>
            </div>
          </div>

          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-cyan-500 transition-all">
              <Maximize2 size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-3 gap-4 pointer-events-none">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-cyan-400" />
                <span className="text-[10px] text-slate-500 uppercase font-mono">AI 识别置信度</span>
              </div>
              <div className="text-xl font-black text-white">98.4%</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-cyan-500 w-[98.4%]" />
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-blue-400" />
                <span className="text-[10px] text-slate-500 uppercase font-mono">采样频率</span>
              </div>
              <div className="text-xl font-black text-white">60 FPS</div>
              <div className="text-[10px] text-slate-600 mt-1 italic">实时处理激活</div>
            </div>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-[10px] text-slate-500 uppercase font-mono">均匀度指数</span>
              </div>
              <div className="text-xl font-black text-white">{state.uniformityIndex}</div>
              <div className="text-[10px] text-emerald-500 mt-1">处于最佳范围</div>
            </div>
          </div>
        </motion.div>

        {/* Left Analysis Column */}
        <div className="col-span-3 row-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-500" /> 粒度分布占比
              </h4>
            </div>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SIZE_DIST_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SIZE_DIST_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Total Scan</span>
                <span className="text-xl font-black text-white">1,000</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {SIZE_DIST_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
              <History size={16} className="text-blue-500" /> 历史趋势分析
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase font-mono">Peak Throughput</span>
                <span className="text-white font-bold">1,482 t/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Insights Column */}
        <div className="col-span-3 row-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-emerald-500" /> 智能优化决策
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="text-xs font-bold text-emerald-400 mb-1">给料速率建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到当前粒径分布均匀，破碎机负荷较低。建议将给料速度提高 <span className="text-emerald-400 font-bold">12%</span> 以最大化产出。
                </p>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="text-xs font-bold text-amber-400 mb-1">维护预警</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  破碎机衬板磨损率达到 <span className="text-amber-400 font-bold">78%</span>。预计在下个检修周期（48小时内）需要更换。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
              <Timer size={16} className="text-indigo-500" /> 实时诊断日志
            </h4>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '10:24:12', msg: '检测到特大块矿石 (342mm)', type: 'warn' },
                { time: '10:23:45', msg: 'AI 模型参数自动校准完成', type: 'info' },
                { time: '10:22:10', msg: '给料带速度同步异常 (纠偏中)', type: 'error' },
                { time: '10:21:05', msg: '系统自检: 视觉传感器状态良好', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-cyan-500 transition-all flex items-center justify-center gap-2">
              查看完整日志 <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="col-span-12 row-span-1 bg-[#0f172a]/80 border border-slate-800 rounded-2xl px-8 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">摄像头 01: 在线</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">推理引擎: 激活</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">PLC 同步: 稳定</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
            <span>存储: 84%</span>
            <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[84%]" />
            </div>
            <span className="text-slate-300">2026-03-24 10:24:55</span>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default CrusherFeedingView;
