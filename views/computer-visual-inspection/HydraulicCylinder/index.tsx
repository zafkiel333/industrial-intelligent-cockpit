import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/HydraulicCylinder/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-hydraulic-cylinder]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-hydraulic-cylinder';
import { CylinderScratch, CylinderState } from '@/components/computer-visual-inspection/HydraulicCylinder/three-types';
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
  Layers
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

const MOCK_SCRATCHES: CylinderScratch[] = [
  { id: 'S-01', position: 0.3, depth: 0.12, length: 15 },
  { id: 'S-02', position: 0.7, depth: 0.05, length: 8 },
];

const PRESSURE_HISTORY = [
  { time: '18:00', val: 12.5 },
  { time: '18:05', val: 14.2 },
  { time: '18:10', val: 11.8 },
  { time: '18:15', val: 15.5 },
  { time: '18:20', val: 13.0 },
  { time: '18:25', val: 12.8 },
];

const HydraulicCylinderView: React.FC = () => {
  const [state] = useState<CylinderState>({
    pressure: 12.8,
    stroke: 450.0,
    leakage: 'slight'
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-indigo-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/40 rounded flex items-center justify-center">
            <Layers className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">液压缸活塞杆划伤视觉检测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> CYL_SCAN_14
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">HydraAI v3.2 Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">系统压力</div>
            <div className="text-xl font-black text-white">{state.pressure} <span className="text-xs">MPa</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">活塞行程</div>
            <div className="text-xl font-black text-indigo-400">{state.stroke} <span className="text-xs">mm</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Scratch Analysis */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="划伤深度分布">
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <TrendingUp size={14} className={state.leakage !== 'none' ? "text-red-500" : "text-green-500"} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">密封完整度</div>
                <div className="text-3xl font-black text-white">82.5%</div>
                <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '82.5%' }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">泄漏等级</div>
                  <div className={`text-xs font-black uppercase ${state.leakage === 'severe' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {state.leakage}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">划伤数量</div>
                  <div className="text-xs font-black text-white">{MOCK_SCRATCHES.length}</div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="划伤点位清单" className="flex-1">
            <div className="space-y-3">
              {MOCK_SCRATCHES.map(scratch => (
                <div key={scratch.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-indigo-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{scratch.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      scratch.depth > 0.1 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {scratch.depth > 0.1 ? 'Deep' : 'Surface'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">深度</div>
                      <div className="text-xs font-black text-white">{scratch.depth}mm</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">长度</div>
                      <div className="text-xs font-black text-indigo-400">{scratch.length}mm</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Cylinder */}
        <div className="col-span-6 relative">
          <SciFiCard title="液压缸数字孪生实时监测" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene scratches={MOCK_SCRATCHES} isMoving={true} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-indigo-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${state.leakage !== 'none' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">
                  {state.leakage !== 'none' ? 'Leakage Detected' : 'System Sealed'}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <Timer size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Stroke: 450mm</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '累计运行', value: '8,240h', icon: History, color: 'text-blue-400' },
                { label: '瞬时压力', value: '12.8MPa', icon: Zap, color: 'text-yellow-400' },
                { label: '密封寿命', value: '1,200h', icon: ShieldCheck, color: 'text-green-400' },
                { label: '油液清洁', value: 'NAS 7', icon: Activity, color: 'text-cyan-400' },
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

        {/* Right: Trends & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="压力历史趋势曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRESSURE_HISTORY}>
                  <defs>
                    <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorPress)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能维护决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <AlertTriangle className="text-indigo-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-indigo-400">划伤预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    检测到活塞杆表面存在 0.12mm 深度划伤。这可能导致密封圈快速磨损并引发严重泄漏。建议在下次停机维护时进行抛光处理。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <div className="text-[10px] text-indigo-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护建议
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">密封圈更换</span>
                    <span className="text-yellow-500">MEDIUM</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">活塞杆抛光</span>
                    <span className="text-green-400">LOW</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                导出液压系统诊断报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default HydraulicCylinderView;
