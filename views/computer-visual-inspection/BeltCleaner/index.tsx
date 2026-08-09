import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/BeltCleaner/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-belt-cleaner]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-belt-cleaner';
import { BeltCleanerState, BladeData } from '@/components/computer-visual-inspection/BeltCleaner/three-types';
import { 
  Wrench, 
  Activity, 
  AlertCircle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Monitor,
  Maximize2,
  Clock,
  Gauge,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const INITIAL_BLADES: BladeData[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  wearLevel: 0.1 + Math.random() * 0.3,
  isCritical: false
}));

const BeltCleanerView: React.FC = () => {
  const [state, setState] = useState<BeltCleanerState>({
    beltSpeed: 2.5,
    vibration: 0.45,
    pressure: 12.8,
    blades: INITIAL_BLADES
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        beltSpeed: 2.5 + (Math.random() - 0.5) * 0.1,
        vibration: 0.4 + Math.random() * 0.2,
        blades: prev.blades.map(b => ({
          ...b,
          wearLevel: Math.min(1, b.wearLevel + 0.0001),
          isCritical: b.wearLevel > 0.8
        }))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <Wrench className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">皮带清扫器刮板磨损视觉监测系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> BELT_SCAN_AI_X1
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Health: Optimal</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Real-time Analysis</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Blade Status */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Monitor size={14} className="text-indigo-400" /> 刮板磨损实时分布
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.blades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="id" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="wearLevel" radius={[4, 4, 0, 0]}>
                    {state.blades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.wearLevel > 0.8 ? '#ef4444' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" /> 运行工况参数
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '皮带运行速度', value: `${state.beltSpeed.toFixed(2)} m/s`, icon: Zap, color: 'text-yellow-400' },
                { label: '清扫器振动频率', value: `${state.vibration.toFixed(2)} Hz`, icon: Activity, color: 'text-indigo-400' },
                { label: '接触压力', value: `${state.pressure.toFixed(1)} N/cm²`, icon: Gauge, color: 'text-blue-400' },
                { label: '预计剩余寿命', value: '420 h', icon: Clock, color: 'text-emerald-400' },
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
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Digital Twin Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-indigo-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-indigo-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">平均磨损率</p>
                <div className="text-2xl font-black text-white">24.5%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">清扫效率</p>
                <div className="text-2xl font-black text-emerald-400">92%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">累计运行</p>
                <div className="text-2xl font-black text-white">1,240h</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">维护状态</p>
                <div className="text-2xl font-black text-indigo-400">NORMAL</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" /> 磨损速率预测曲线
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.blades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="id" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Bar dataKey="wearLevel" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" /> 智能维护决策
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-xs font-bold text-red-400 mb-2">更换提醒</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  3号刮板磨损已接近极限值 (82%)，建议在下次停机维护时进行更换，以防划伤皮带。
                </p>
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="text-xs font-bold text-indigo-400 mb-2">优化建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  当前振动频率略高，建议检查清扫器安装架紧固螺栓，并适当调整接触压力。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 系统事件日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '10:24:12', msg: 'AI 识别: 3号刮板磨损加剧', type: 'warn' },
                { time: '10:15:30', msg: '皮带速度波动检测完成', type: 'info' },
                { time: '09:45:12', msg: '系统自检: 视觉传感器校准成功', type: 'info' },
                { time: '08:30:00', msg: '当日运行数据备份完成', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/20">
              生成详细分析报告
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

export default BeltCleanerView;
