import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/ConveyorAlignment/ThreeScene';
import { AlignmentState, RollerStatus } from '@/components/computer-visual-inspection/ConveyorAlignment/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  Settings,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  Timer,
  Cpu,
  MoveHorizontal
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
  Area
} from 'recharts';

const MOCK_ROLLERS: RollerStatus[] = [
  { id: 'R-01', temperature: 42.5, vibration: 1.2 },
  { id: 'R-02', temperature: 58.2, vibration: 4.5 },
  { id: 'R-03', temperature: 38.4, vibration: 0.8 },
];

const DEVIATION_HISTORY = [
  { time: '12:00', val: 12 },
  { time: '12:05', val: 45 },
  { time: '12:10', val: 120 },
  { time: '12:15', val: 85 },
  { time: '12:20', val: 32 },
  { time: '12:25', val: 15 },
];

const ConveyorAlignmentView: React.FC = () => {
  const [state] = useState<AlignmentState>({
    deviation: 120.5,
    speed: 3.2,
    load: 75.4,
    isCorrecting: true
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <MoveHorizontal className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">输送带跑偏视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> ALIGN_UNIT_05
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AlignAI v2.4 Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">跑偏量</div>
            <div className="text-xl font-black text-white">{state.deviation} <span className="text-xs">mm</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">带速</div>
            <div className="text-xl font-black text-blue-400">{state.speed} <span className="text-xs">m/s</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Alignment Stats */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="跑偏风险评估">
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <TrendingUp size={14} className={Math.abs(state.deviation) > 100 ? "text-red-500" : "text-green-500"} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">对齐指数</div>
                <div className="text-3xl font-black text-white">{Math.max(0, 100 - Math.abs(state.deviation)/2).toFixed(1)}%</div>
                <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, 100 - Math.abs(state.deviation)/2)}%` }}
                    className={`h-full ${Math.abs(state.deviation) > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">纠偏状态</div>
                  <div className="text-xs font-black text-blue-400 uppercase">{state.isCorrecting ? 'Correcting' : 'Idle'}</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">负载水平</div>
                  <div className="text-xs font-black text-white">{state.load}%</div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="托辊实时状态" className="flex-1">
            <div className="space-y-3">
              {MOCK_ROLLERS.map(roller => (
                <div key={roller.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{roller.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      roller.vibration > 3 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {roller.vibration > 3 ? 'Warning' : 'Normal'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">温度</div>
                      <div className="text-xs font-black text-white">{roller.temperature}°C</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">振动</div>
                      <div className="text-xs font-black text-blue-400">{roller.vibration}mm/s</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Belt */}
        <div className="col-span-6 relative">
          <SciFiCard title="输送带数字孪生可视化" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene state={state} />
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-blue-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className={`px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3`}>
                <div className={`w-2 h-2 rounded-full ${Math.abs(state.deviation) > 100 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">
                  {Math.abs(state.deviation) > 100 ? 'Severe Misalignment' : 'Alignment Stable'}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <Timer size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Correction Active</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '累计跑偏', value: '124次', icon: History, color: 'text-blue-400' },
                { label: '瞬时负载', value: '75.4%', icon: Zap, color: 'text-yellow-400' },
                { label: '纠偏效率', value: '94%', icon: ShieldCheck, color: 'text-green-400' },
                { label: '环境湿度', value: '62%', icon: Activity, color: 'text-cyan-400' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={12} className={item.color} />
                    <span className="text-[8px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-lg font-black text-white tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Right: Trends & Alerts */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="跑偏历史趋势曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEVIATION_HISTORY}>
                  <defs>
                    <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能纠偏决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="text-yellow-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-yellow-400">跑偏预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    当前跑偏量已达 120.5mm，触发二级预警。系统已自动启动 2# 纠偏托辊，预计 30 秒内恢复对齐。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护建议
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">纠偏装置检查</span>
                    <span className="text-yellow-500">MEDIUM</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">带面张力调整</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                导出纠偏运行日志
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConveyorAlignmentView;
