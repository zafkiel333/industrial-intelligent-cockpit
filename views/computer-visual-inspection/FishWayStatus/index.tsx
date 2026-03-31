import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/FishWayStatus/ThreeScene';
import { Fish, FishwayState } from '@/components/computer-visual-inspection/FishWayStatus/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Fish as FishIcon, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  Settings,
  Waves,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  Timer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';

const MOCK_FISH: Fish[] = [
  { id: 'F-01', position: [0, -2, -8], velocity: [0, 0, 0.1], species: '中华鲟', size: 120 },
  { id: 'F-02', position: [2, -1, -5], velocity: [0, 0, 0.15], species: '草鱼', size: 45 },
  { id: 'F-03', position: [-2, 0, -2], velocity: [0, 0, 0.12], species: '鲢鱼', size: 60 },
];

const PASSAGE_HISTORY = [
  { time: '08:00', count: 120 },
  { time: '10:00', count: 250 },
  { time: '12:00', count: 180 },
  { time: '14:00', count: 420 },
  { time: '16:00', count: 310 },
  { time: '18:00', count: 150 },
];

const SPECIES_DATA = [
  { name: '中华鲟', value: 12, color: '#f59e0b' },
  { name: '草鱼', value: 45, color: '#10b981' },
  { name: '鲢鱼', value: 30, color: '#0ea5e9' },
  { name: '其他', value: 13, color: '#6366f1' },
];

const FishWayStatusView: React.FC = () => {
  const [state] = useState<FishwayState>({
    totalCount: 14520,
    passageRate: 342,
    waterVelocity: 1.2,
    oxygenLevel: 8.5
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-green-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/20 border border-green-500/40 rounded flex items-center justify-center">
            <FishIcon className="text-green-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">鱼道运行状态与生物通过率监测</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                <Zap size={12} /> FISHWAY_GATE_MAIN
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Bio-Vision AI Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">累计通过数</div>
            <div className="text-xl font-black text-white">{state.totalCount.toLocaleString()} <span className="text-xs">尾</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">当前通过率</div>
            <div className="text-xl font-black text-green-400">{state.passageRate} <span className="text-xs">尾/h</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Species & Stats */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="物种分布统计">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPECIES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {SPECIES_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="实时识别队列" className="flex-1 overflow-hidden">
            <div className="space-y-2 overflow-y-auto h-full pr-2 custom-scrollbar">
              {MOCK_FISH.map(fish => (
                <div key={fish.id} className="p-2 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-3 hover:border-green-500/50 transition-all">
                  <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center">
                    <Search size={14} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white">{fish.species}</span>
                      <span className="text-[8px] text-slate-500 font-mono">ID: {fish.id}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-[8px] text-slate-400">体长: {fish.size}cm</div>
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                      <div className="text-[8px] text-slate-400">置信度: 98.2%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Fishway */}
        <div className="col-span-6 relative">
          <SciFiCard title="鱼道数字孪生系统" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene fishList={MOCK_FISH} waterVelocity={state.waterVelocity} />
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:border-green-500 transition-all backdrop-blur-sm">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Environment Stats */}
            <div className="absolute top-4 left-4 grid grid-cols-2 gap-2">
              <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm">
                <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">水流速度</div>
                <div className="text-xs font-black text-white">{state.waterVelocity} m/s</div>
              </div>
              <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-sm">
                <div className="text-[8px] text-slate-500 uppercase font-mono mb-1">溶解氧</div>
                <div className="text-xs font-black text-green-400">{state.oxygenLevel} mg/L</div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-green-400" />
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Passage Efficiency</span>
                </div>
                <span className="text-xs font-black text-green-400">89.5%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '89.5%' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                />
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right: Trends & Health */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="通过率历史趋势">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PASSAGE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="生态健康评估" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <ShieldCheck className="text-green-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-green-400">生态系统稳定</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    当前鱼道水质、流速及含氧量均处于最优区间。珍稀物种（中华鲟）通过频率较去年同期增长 15.4%。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="text-[10px] text-green-400 font-bold mb-2 flex items-center gap-1">
                  <TrendingUp size={12} /> 预测分析
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  预计未来 24 小时内将迎来洄游高峰，建议维持当前补水流量，并保持鱼道入口诱鱼灯光常亮。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold rounded hover:border-green-500 transition-all flex items-center justify-center gap-2 uppercase">
                  <History size={12} /> 历史数据
                </button>
                <button className="py-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 uppercase">
                  <Settings size={12} /> 运行调节
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default FishWayStatusView;
