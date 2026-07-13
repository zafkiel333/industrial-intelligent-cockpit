import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/BallMillVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-BallMillVibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-BallMillVibration';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  RotateCw, 
  Settings, 
  Thermometer, 
  BarChart3,
  TrendingUp,
  Cpu,
  Waves,
  ChevronRight,
  Gauge
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

// Simulated Data
const polarData = [
  { angle: '0°', value: 1.2 },
  { angle: '45°', value: 1.5 },
  { angle: '90°', value: 2.1 },
  { angle: '135°', value: 1.8 },
  { angle: '180°', value: 1.4 },
  { angle: '225°', value: 1.6 },
  { angle: '270°', value: 2.3 },
  { angle: '315°', value: 1.9 },
];

const gearMeshingData = Array.from({ length: 40 }, (_, i) => ({
  x: i,
  y: Math.sin(i * 0.5) * 0.5 + Math.random() * 0.2,
}));

const bearingTrendData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 45 + Math.random() * 5,
  vibration: 1.5 + Math.random() * 0.5,
}));

const BallMillVibrationView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    speed: 15.2,
    vibration: 1.85,
    temp: 48.5,
    health: 94,
    efficiency: 88.2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        vibration: 1.7 + Math.random() * 0.3,
        temp: 48 + Math.random() * 1,
        efficiency: 87 + Math.random() * 2,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <RotateCw className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              球磨机筒体与轴承振动智能监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Ball Mill</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: BM-UNIT-04</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">筒体转速</div>
            <div className="text-sm font-mono font-bold text-cyan-400">{metrics.speed} RPM</div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">研磨效率</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{metrics.efficiency.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Metrics & Status */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="核心监测指标" subtitle="CORE METRICS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '轴承温度', val: metrics.temp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '冲击脉冲', val: '12.4', unit: 'dB', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '瞬时功耗', val: '1250', unit: 'kW', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: '筒体振动', val: metrics.vibration.toFixed(2), unit: 'mm/s', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
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

          <SciFiCard title="筒体振动极坐标" subtitle="POLAR DISTRIBUTION" className="flex-1">
            <div className="h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={polarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="angle" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 3]} hide />
                  <Radar name="振动幅值" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="球磨机数字孪生" 
            subtitle="BALL MILL DIGITAL TWIN" 
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
              <div className="flex justify-between items-start">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 border border-cyan-500/30 p-4 backdrop-blur-md rounded-2xl"
                >
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-1">Vibration Amplitude</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{metrics.vibration.toFixed(2)}</span>
                    <span className="text-sm text-slate-400 font-mono">mm/s</span>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-900/80 border border-emerald-500/30 p-4 backdrop-blur-md rounded-2xl flex flex-col items-end"
                >
                  <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1">Health Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">{metrics.health}</span>
                    <span className="text-sm text-slate-400 font-mono">%</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-2 backdrop-blur-md rounded-full flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">REALTIME SYNC</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Sampling: 5kHz</div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Load: 65%</div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Advanced Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="轴承温振趋势" subtitle="BEARING TREND (24H)">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bearingTrendData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="大齿轮啮合分析" subtitle="GEAR MESHING">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" range={[2, 10]} />
                  <Scatter name="啮合脉冲" data={gearMeshingData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与维保" subtitle="DIAGNOSTICS & LOGS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-2 uppercase">
                  <AlertCircle size={12} />
                  诊断建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">检测到大齿轮啮合频率出现轻微调制现象，可能与润滑油粘度下降有关。建议检查润滑系统压力及油质。</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">近期记录</h4>
                <div className="space-y-2">
                  {[
                    { label: '主轴承润滑油更换', date: '03-15', color: 'border-emerald-500' },
                    { label: '大齿轮啮合间隙调整', date: '02-28', color: 'border-blue-500' }
                  ].map((log, i) => (
                    <div key={i} className={`flex justify-between items-center p-2 bg-white/5 rounded border-l-2 ${log.color} hover:bg-white/10 transition-all cursor-pointer`}>
                      <span className="text-[10px] text-slate-300">{log.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-600/40 transition-all flex items-center justify-center gap-2">
                生成完整报告 <ChevronRight size={14} />
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default BallMillVibrationView;
