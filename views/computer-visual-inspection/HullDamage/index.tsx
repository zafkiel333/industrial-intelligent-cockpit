import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/HullDamage/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-hull-damage]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-hull-damage';
import { HullState, DamagePoint } from '@/components/computer-visual-inspection/HullDamage/three-types';
import { 
  Ship, 
  Activity, 
  AlertCircle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Maximize2,
  Clock,
  Waves,
  Anchor
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

const INITIAL_DAMAGE: DamagePoint[] = [
  { id: 'D-01', type: 'crack', position: [5, 2, 1], severity: 'medium' },
  { id: 'D-02', type: 'dent', position: [-3, -1, 0.5], severity: 'high' },
  { id: 'D-03', type: 'corrosion', position: [0, 3, 0.2], severity: 'low' },
];

const MOCK_HEALTH_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${i}:00`,
  health: 95 - i * 0.2 + Math.random() * 2
}));

const HullDamageView: React.FC = () => {
  const [state, setState] = useState<HullState>({
    structuralHealth: 88.5,
    maxDeformation: 12.4,
    damagePoints: INITIAL_DAMAGE
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        structuralHealth: Math.max(0, prev.structuralHealth - 0.01),
        maxDeformation: prev.maxDeformation + Math.random() * 0.1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <Ship className="text-cyan-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">船体结构破损与变形视觉检测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> HULL_SCAN_AI_X9
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Status: Deep Structural Scan Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Vessel: MV OCEAN_PRIDE</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Integrity Metrics */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Anchor size={14} className="text-cyan-400" /> 船体结构健康度
            </h3>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - state.structuralHealth / 100)}
                    className="text-cyan-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{state.structuralHealth.toFixed(1)}%</span>
                  <span className="text-[8px] text-slate-500 uppercase font-mono">Health Index</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">最大变形量</span>
                <span className="text-lg font-black text-white">{state.maxDeformation.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">检测损伤点</span>
                <span className="text-lg font-black text-red-400">{state.damagePoints.length} 处</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" /> 环境与应力监测
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '船体应力水平', value: '145 MPa', icon: Zap, color: 'text-yellow-400' },
                { label: '海浪冲击强度', value: '4.2 kN/m²', icon: Waves, color: 'text-blue-400' },
                { label: '腐蚀速率', value: '0.12 mm/a', icon: Activity, color: 'text-indigo-400' },
                { label: '预计大修时间', value: '180 d', icon: Clock, color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-xl font-black text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="flex-[2] bg-[#0f172a]/40 border border-slate-800 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <ThreeScene state={state} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-6 left-6 z-10 space-y-3">
              <div className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Hull Digital Twin Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-cyan-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-cyan-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">扫描面积</p>
                <div className="text-2xl font-black text-white">450 m²</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">检测深度</p>
                <div className="text-2xl font-black text-emerald-400">±0.1 mm</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计损伤</p>
                <div className="text-2xl font-black text-white">12 处</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">安全状态</p>
                <div className="text-2xl font-black text-cyan-400">STABLE</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> 结构健康趋势曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HEALTH_DATA}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#22d3ee" fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-400" /> 智能维护决策
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-xs font-bold text-red-400 mb-2">紧急维修提醒</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到 D-02 处存在深度凹陷，且伴有微裂缝，位于吃水线以下。建议在下个靠港周期进行紧急补强。
                </p>
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="text-xs font-bold text-indigo-400 mb-2">防腐建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  船艏区域腐蚀速率异常，建议检查牺牲阳极状态，并考虑重新喷涂高性能防腐涂料。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 监测事件日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '09:20:12', msg: 'AI 识别: 船底发现新腐蚀点 D-04', type: 'warn' },
                { time: '08:15:30', msg: '三维激光扫描数据处理完成', type: 'info' },
                { time: '07:45:12', msg: '系统自检: 视觉传感器校准成功', type: 'info' },
                { time: '06:30:00', msg: '航行应力数据同步完成', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20">
              导出船体健康报告
            </button>
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

export default HullDamageView;
