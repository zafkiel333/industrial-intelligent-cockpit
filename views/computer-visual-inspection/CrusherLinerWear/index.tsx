import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/CrusherLinerWear/ThreeScene';
import { LinerWear, CrusherState } from '@/components/computer-visual-inspection/CrusherLinerWear/three-types';
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
  Layers,
  Cpu,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const MOCK_WEARS: LinerWear[] = [
  { id: 'L-01', position: [5, 2, 0], thickness: 45, wearRate: 1.2, severity: 'high' },
  { id: 'L-08', position: [-5, -3, 2], thickness: 120, wearRate: 0.5, severity: 'low' },
];

const THICKNESS_HISTORY = [
  { time: 'Jan', val: 180 },
  { time: 'Feb', val: 165 },
  { time: 'Mar', val: 142 },
  { time: 'Apr', val: 120 },
  { time: 'May', val: 95 },
  { time: 'Jun', val: 72 },
];

const WEAR_DISTRIBUTION = [
  { name: '上部', value: 12, color: '#10b981' },
  { name: '中部', value: 45, color: '#f59e0b' },
  { name: '底部', value: 85, color: '#ef4444' },
];

const CrusherLinerWearView: React.FC = () => {
  const [state] = useState<CrusherState>({
    throughput: 1245.5,
    power: 850.2,
    vibration: 4.2
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded flex items-center justify-center">
            <Layers className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">破碎机衬板磨损视觉测量系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> CRUSHER_UNIT_03
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">WearScan AI v2.1 激活</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">实时处理量</div>
            <div className="text-xl font-black text-white">{state.throughput} <span className="text-xs">t/h</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">电机功率</div>
            <div className="text-xl font-black text-blue-400">{state.power} <span className="text-xs">kW</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Wear Stats */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="衬板磨损分布统计">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEAR_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {WEAR_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="关键磨损点监测" className="flex-1">
            <div className="space-y-3">
              {MOCK_WEARS.map(wear => (
                <div key={wear.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg group hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{wear.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                      wear.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {wear.severity === 'high' ? '严重' : '安全'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-mono">剩余厚度</div>
                      <div className="text-sm font-black text-white">{wear.thickness} mm</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500 uppercase font-mono">磨损速率</div>
                      <div className="text-sm font-black text-blue-400">{wear.wearRate} mm/kh</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Crusher */}
        <div className="col-span-6 relative">
          <SciFiCard title="破碎机衬板数字孪生" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene linerWears={MOCK_WEARS} isRotating={true} />
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-blue-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">需要更换衬板</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm flex items-center gap-3">
                <Timer size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">预计寿命: 420h</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-4">
              {[
                { label: '排料口间隙', value: '125mm', icon: History, color: 'text-blue-400' },
                { label: '振动强度', value: '4.2mm/s', icon: Zap, color: 'text-yellow-400' },
                { label: '润滑压力', value: '0.45MPa', icon: ShieldCheck, color: 'text-green-400' },
                { label: '轴承温度', value: '52.4°C', icon: Activity, color: 'text-cyan-400' },
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

        {/* Right: History & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="衬板厚度衰减趋势">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={THICKNESS_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能维护决策" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">衬板穿孔风险</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    底部衬板 L-01 剩余厚度仅 45mm，已低于安全阈值。预计在 420 小时内发生穿孔风险，建议立即排产更换。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-blue-400 font-bold mb-2 flex items-center gap-1">
                  <BarChart3 size={12} /> 维护优先级
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">衬板更换</span>
                    <span className="text-red-500">严重</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">润滑油更换</span>
                    <span className="text-yellow-500">中等</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">螺栓紧固</span>
                    <span className="text-green-400">低</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                生成详细检修方案
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default CrusherLinerWearView;
