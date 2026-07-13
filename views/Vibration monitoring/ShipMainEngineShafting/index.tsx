import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/ShipMainEngineShafting/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ShipMainEngine]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ShipMainEngine';
import { ShaftState } from '../../../components/Vibration monitoring/ShipMainEngineShafting/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const ShipMainEngineShafting: React.FC = () => {
  const [shaftState, setShaftState] = useState<ShaftState>({
    rpm: 120,
    vibrationAmplitude: 0.15,
    phaseAngle: 45
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [harmonics, setHarmonics] = useState<any[]>([]);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setShaftState(prev => {
        const nextRpm = 115 + Math.random() * 10;
        const nextVib = 0.1 + Math.random() * 0.1;
        const nextPhase = (prev.phaseAngle + 5) % 360;
        
        // Update history
        setHistoryData(h => {
          const newData = [...h, { time: new Date().toLocaleTimeString(), vib: nextVib, rpm: nextRpm }];
          return newData.slice(-20);
        });

        // Update harmonics
        setHarmonics([
          { order: '1x', amplitude: 0.08 + Math.random() * 0.02 },
          { order: '2x', amplitude: 0.04 + Math.random() * 0.01 },
          { order: '3x', amplitude: 0.02 + Math.random() * 0.01 },
          { order: '4x', amplitude: 0.01 + Math.random() * 0.005 },
          { order: '5x', amplitude: 0.005 + Math.random() * 0.002 },
        ]);

        return { rpm: nextRpm, vibrationAmplitude: nextVib, phaseAngle: nextPhase };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    if (shaftState.vibrationAmplitude > 0.25) return 'text-red-500';
    if (shaftState.vibrationAmplitude > 0.18) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [shaftState.vibrationAmplitude]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Activity className="text-cyan-500" size={32} />
            船舶主主机轴系扭振监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Ship Main Engine Shafting Torsional Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={16} />
            <span className="text-xs font-bold">系统状态: 正常运行</span>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Settings className="text-slate-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Config</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Real-time Stats & 3D */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-white/5 p-4 rounded-lg backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gauge size={64} />
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">主轴转速 (RPM)</div>
              <div className="text-4xl font-bold text-white font-mono tracking-tighter">
                {shaftState.rpm.toFixed(1)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-500">
                <RefreshCw size={10} className="animate-spin-slow" />
                <span>实时同步中</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/40 border border-white/5 p-4 rounded-lg backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={64} />
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">扭振幅值 (deg)</div>
              <div className={`text-4xl font-bold font-mono tracking-tighter ${statusColor}`}>
                {shaftState.vibrationAmplitude.toFixed(3)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>阈值: 0.250 deg</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/40 border border-white/5 p-4 rounded-lg backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={64} />
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">相位角 (Phase)</div>
              <div className="text-4xl font-bold text-white font-mono tracking-tighter">
                {shaftState.phaseAngle.toFixed(1)}°
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 uppercase">
                <span>Phase Stability: High</span>
              </div>
            </motion.div>
          </div>

          {/* 3D Digital Twin Container */}
          <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Digital Twin - Shafting System</span>
              </div>
            </div>
            
            <ThreeScene state={shaftState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <div className="p-3 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg text-[10px] font-mono">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">ENGINE_LOAD:</span>
                  <span className="text-cyan-400">85.4%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">TORQUE_VAL:</span>
                  <span className="text-cyan-400">4520 kN·m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Charts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Torsional Vibration Trend */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="text-cyan-500" size={16} />
                扭振趋势分析
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 0.3]} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '4px' }}
                    itemStyle={{ color: '#06b6d4', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="vib" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Harmonic Analysis */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="text-cyan-500" size={16} />
              谐波分量分析 (Harmonics)
            </h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={harmonics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="order" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '4px' }}
                  />
                  <Bar dataKey="amplitude" radius={[2, 2, 0, 0]}>
                    {harmonics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={16} />
              智能预警中心
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border-l-2 border-emerald-500 rounded-r-md">
                <div className="text-[10px] text-slate-500 uppercase">10:45:22</div>
                <div className="text-xs text-slate-200">主轴系对中状态检测: 优</div>
              </div>
              <div className="p-3 bg-white/5 border-l-2 border-cyan-500 rounded-r-md">
                <div className="text-[10px] text-slate-500 uppercase">09:30:15</div>
                <div className="text-xs text-slate-200">谐波共振频率避让区域计算完成</div>
              </div>
              <AnimatePresence>
                {shaftState.vibrationAmplitude > 0.2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-md"
                  >
                    <div className="text-[10px] text-red-500 uppercase font-bold">WARNING</div>
                    <div className="text-xs text-red-200">检测到扭振幅值接近临界值，建议检查燃油喷射均匀性</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShipMainEngineShafting;
