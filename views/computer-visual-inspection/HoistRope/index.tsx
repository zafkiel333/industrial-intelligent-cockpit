import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/HoistRope/ThreeScene';
import { HoistRopeState, BrokenWire } from '@/components/computer-visual-inspection/HoistRope/three-types';
import { 
  Activity, 
  AlertCircle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Scan,
  Maximize2,
  Clock,
  ShieldAlert,
  ArrowDownUp,
  FileWarning
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

const INITIAL_BROKEN_WIRES: BrokenWire[] = [
  { id: 'BW-01', position: [0.3, 2, 0], severity: 'minor' },
  { id: 'BW-02', position: [-0.2, -1, 0.2], severity: 'major' },
];

const MOCK_WEAR_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: `${i}:00`,
  wear: 5 + i * 0.5 + Math.random() * 2
}));

const HoistRopeView: React.FC = () => {
  const [state, setState] = useState<HoistRopeState>({
    ropeSpeed: 8.5,
    totalBrokenWires: 2,
    diameterReduction: 1.2,
    wearLevel: 0.15,
    brokenWires: INITIAL_BROKEN_WIRES
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        ropeSpeed: 8.0 + Math.random() * 1.0,
        wearLevel: Math.min(1, prev.wearLevel + 0.0001)
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
            <ArrowDownUp className="text-red-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">矿井提升机钢丝绳断丝与磨损视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> ROPE_VISION_AI_V5
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Status: High-Speed Scanning Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Safety Status: Warning</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Rope Condition */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Scan size={14} className="text-red-400" /> 钢丝绳实时状态
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">断丝总数</p>
                  <div className="text-3xl font-black text-white">{state.totalBrokenWires} <span className="text-xs font-normal text-slate-500">处</span></div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">直径缩减</p>
                  <div className="text-xl font-black text-red-400">{state.diameterReduction}%</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-mono">
                  <span className="text-slate-500">表面磨损程度</span>
                  <span className="text-white">{(state.wearLevel * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${state.wearLevel * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-red-400" /> 提升机运行参数
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '提升运行速度', value: `${state.ropeSpeed.toFixed(1)} m/s`, icon: Zap, color: 'text-yellow-400' },
                { label: '钢丝绳张力', value: '45.2 kN', icon: Activity, color: 'text-indigo-400' },
                { label: 'AI 识别置信度', value: '98.5%', icon: ShieldAlert, color: 'text-emerald-400' },
                { label: '预计剩余寿命', value: '1,240 h', icon: Clock, color: 'text-blue-400' },
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
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">Digital Twin Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-red-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-red-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计断丝</p>
                <div className="text-2xl font-black text-white">12 处</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">识别频率</p>
                <div className="text-2xl font-black text-emerald-400">120 fps</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计提升</p>
                <div className="text-2xl font-black text-white">4,200 次</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">安全系数</p>
                <div className="text-2xl font-black text-red-400">6.2</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-red-400" /> 磨损发展趋势曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_WEAR_DATA}>
                  <defs>
                    <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="wear" stroke="#ef4444" fillOpacity={1} fill="url(#colorWear)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400" /> 智能维护决策
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-xs font-bold text-red-400 mb-2">强制报废提醒</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到集中断丝现象，且直径缩减已超过 10% 的安全红线。建议立即停止提升作业，并更换钢丝绳。
                </p>
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="text-xs font-bold text-indigo-400 mb-2">润滑建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  表面磨损速率有所增加，建议检查自动润滑系统喷嘴是否堵塞，并适当增加润滑油脂喷涂量。
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
                { time: '10:24:12', msg: 'AI 识别: 发现集中断丝 (3根)', type: 'error' },
                { time: '10:15:30', msg: '钢丝绳直径自动测量完成', type: 'info' },
                { time: '09:45:12', msg: '系统自检: 高速工业相机状态良好', type: 'info' },
                { time: '08:30:00', msg: '提升机运行数据同步成功', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'error' ? 'text-red-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
              <FileWarning size={14} /> 导出钢丝绳健康报告
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

export default HoistRopeView;
