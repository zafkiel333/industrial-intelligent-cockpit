import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/ExcavatorBucket/ThreeScene';
import { BucketState, CrackData } from '@/components/computer-visual-inspection/ExcavatorBucket/three-types';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Search,
  Maximize2,
  Clock,
  Hammer,
  FileText
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

const INITIAL_CRACKS: CrackData[] = [
  { id: 'C-01', position: [1.5, 1, 1.5], severity: 'medium', length: 12.5 },
  { id: 'C-02', position: [-1.2, -0.5, 1.5], severity: 'high', length: 24.8 },
  { id: 'C-03', position: [0, 1.2, -1.5], severity: 'low', length: 5.2 },
];

const MOCK_STRESS_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${i}:00`,
  stress: 180 + Math.random() * 100
}));

const ExcavatorBucketView: React.FC = () => {
  const [state, setState] = useState<BucketState>({
    totalCracks: 3,
    maxStress: 245.8,
    remainingLife: 1240,
    cracks: INITIAL_CRACKS
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        maxStress: 220 + Math.random() * 60,
        remainingLife: Math.max(0, prev.remainingLife - 1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Hammer className="text-red-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">挖掘机铲斗结构疲劳裂缝视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> BUCKET_AI_SCAN_V3
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Status: Structural Analysis Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">High Severity Alert</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Crack Summary */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search size={14} className="text-red-400" /> 裂缝检测摘要
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">裂缝总数</p>
                <div className="text-3xl font-black text-white">{state.totalCracks}</div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">高危等级</p>
                <div className="text-3xl font-black text-red-500">1</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {state.cracks.map((crack, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${crack.severity === 'high' ? 'bg-red-500' : crack.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] text-slate-300 font-mono">{crack.id}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{crack.length} mm</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-red-400" /> 结构应力监测
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '最大等效应力', value: `${state.maxStress.toFixed(1)} MPa`, icon: Zap, color: 'text-yellow-400' },
                { label: '剩余疲劳寿命', value: `${state.remainingLife} h`, icon: Clock, color: 'text-blue-400' },
                { label: '结构完整性', value: '84%', icon: ShieldAlert, color: 'text-red-400' },
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
            </div>
            
            <div className="absolute top-6 left-6 z-10 space-y-3">
              <div className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">Structural Twin Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-red-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-red-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">应力峰值</p>
                <div className="text-2xl font-black text-white">284 MPa</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">检测置信度</p>
                <div className="text-2xl font-black text-emerald-400">96.5%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计循环</p>
                <div className="text-2xl font-black text-white">42.8k</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">维护状态</p>
                <div className="text-2xl font-black text-red-400">URGENT</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-red-400" /> 应力变化趋势曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_STRESS_DATA}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="stress" stroke="#ef4444" fillOpacity={1} fill="url(#colorStress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> 智能维护建议
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-xs font-bold text-red-400 mb-2">紧急加固提醒</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  C-02号裂缝长度已超过安全阈值 (20mm)，且位于主受力焊缝处。建议立即停机进行补焊加固。
                </p>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-2">作业负荷建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到当前作业岩石硬度较高，建议适当降低满斗率，以减缓裂缝扩展速度。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 结构检测日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '14:20:12', msg: 'AI 识别: 发现新微裂缝 C-04', type: 'warn' },
                { time: '12:15:30', msg: '应力传感器数据同步完成', type: 'info' },
                { time: '10:45:12', msg: '系统自检: 视觉传感器状态良好', type: 'info' },
                { time: '08:30:00', msg: '结构疲劳寿命预测更新', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
              <FileText size={14} /> 生成结构安全报告
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

export default ExcavatorBucketView;
