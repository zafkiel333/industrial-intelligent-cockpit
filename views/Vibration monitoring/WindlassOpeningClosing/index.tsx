import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/WindlassOpeningClosing/ThreeScene';
import { WindlassState } from '../../../components/Vibration monitoring/WindlassOpeningClosing/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
  Anchor, Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers, ArrowUpCircle, ArrowDownCircle, StopCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const WindlassOpeningClosing: React.FC = () => {
  const [state, setState] = useState<WindlassState>({
    speed: 45,
    vibrationLevel: 0.2,
    isOperating: true,
    direction: 'down',
    chainLength: 120
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [tensionData, setTensionData] = useState<any[]>([]);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.direction === 'stop') return prev;

        const nextSpeed = 40 + Math.random() * 10;
        const nextVib = 0.15 + Math.random() * 0.15;
        const nextLength = prev.direction === 'down' ? prev.chainLength + 0.5 : prev.chainLength - 0.5;
        
        // Update history
        setHistoryData(h => {
          const newData = [...h, { time: new Date().toLocaleTimeString(), vib: nextVib, speed: nextSpeed }];
          return newData.slice(-20);
        });

        // Update tension
        setTensionData(t => {
          const nextTension = 150 + Math.random() * 50 + (nextVib * 100);
          const newData = [...t, { time: new Date().toLocaleTimeString(), tension: nextTension }];
          return newData.slice(-20);
        });

        return { ...prev, speed: nextSpeed, vibrationLevel: nextVib, chainLength: nextLength };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    if (state.vibrationLevel > 0.4) return 'text-red-500';
    if (state.vibrationLevel > 0.25) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [state.vibrationLevel]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Anchor className="text-cyan-500" size={32} />
            锚机启闭过程振动监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Windlass Opening/Closing Process Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Status: Active</span>
          </div>
          <div className="flex bg-slate-900/50 border border-white/10 rounded-sm p-1">
            <button 
              onClick={() => setState(s => ({ ...s, direction: 'up', isOperating: true }))}
              className={`p-1.5 rounded-sm transition-colors ${state.direction === 'up' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowUpCircle size={18} />
            </button>
            <button 
              onClick={() => setState(s => ({ ...s, direction: 'stop', isOperating: false }))}
              className={`p-1.5 rounded-sm transition-colors ${state.direction === 'stop' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <StopCircle size={18} />
            </button>
            <button 
              onClick={() => setState(s => ({ ...s, direction: 'down', isOperating: true }))}
              className={`p-1.5 rounded-sm transition-colors ${state.direction === 'down' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowDownCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: 3D & Real-time Stats */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* 3D Digital Twin Container */}
          <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Digital Twin - Windlass System</span>
              </div>
            </div>
            
            <ThreeScene state={state} />

            {/* Overlay Stats */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">收放速度</div>
                <div className="text-xl font-bold text-white font-mono">{state.speed.toFixed(1)} <span className="text-[10px] text-slate-500">m/min</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">振动烈度</div>
                <div className={`text-xl font-bold font-mono ${statusColor}`}>{state.vibrationLevel.toFixed(3)} <span className="text-[10px] text-slate-500">mm/s</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已放链长</div>
                <div className="text-xl font-bold text-white font-mono">{state.chainLength.toFixed(1)} <span className="text-[10px] text-slate-500">m</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">液压压力</div>
                <div className="text-xl font-bold text-white font-mono">12.5 <span className="text-[10px] text-slate-500">MPa</span></div>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-2 gap-6 h-[250px]">
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-cyan-500" size={16} />
                振动实时波形
              </h3>
              <div className="flex-1">
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
                    <YAxis domain={[0, 0.6]} hide />
                    <Area type="monotone" dataKey="vib" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap className="text-yellow-500" size={16} />
                锚链张力监测 (kN)
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tensionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 400]} hide />
                    <Line type="stepAfter" dataKey="tension" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Motor Current */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Gauge className="text-cyan-500" size={16} />
              驱动电机电流 (A)
            </h3>
            <div className="h-[150px] flex items-center justify-center relative">
              <div className="text-4xl font-bold text-white font-mono">185.4</div>
              <div className="absolute inset-0 opacity-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <Area type="monotone" dataKey="speed" stroke="#06b6d4" fill="#06b6d4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-[10px] text-slate-500 uppercase">额定电流</div>
                <div className="text-sm font-bold">220 A</div>
              </div>
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-[10px] text-slate-500 uppercase">当前负载</div>
                <div className="text-sm font-bold text-cyan-400">84.2%</div>
              </div>
            </div>
          </div>

          {/* Operation Log */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Layers className="text-cyan-500" size={16} />
              作业过程日志
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {[
                { time: '10:45:22', event: '锚机启动 - 抛锚模式', type: 'info' },
                { time: '10:45:30', event: '刹车带松开确认', type: 'info' },
                { time: '10:46:15', event: '检测到链舱振动轻微上升', type: 'warning' },
                { time: '10:47:00', event: '抛锚速度稳定在 45m/min', type: 'info' },
                { time: '10:48:12', event: '液压泵站压力波动补偿', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-slate-500 font-mono">{log.time}</span>
                  <span className={log.type === 'warning' ? 'text-yellow-500' : 'text-slate-300'}>{log.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Stop */}
          <div className="bg-red-900/20 border border-red-500/30 p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-red-500">
              <AlertTriangle size={16} />
              紧急安全控制
            </h3>
            <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-widest">
              <StopCircle size={20} />
              紧急制动 (E-STOP)
            </button>
            <p className="text-[10px] text-red-500/60 mt-3 text-center uppercase tracking-tighter">
              Warning: Immediate mechanical brake application
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WindlassOpeningClosing;
