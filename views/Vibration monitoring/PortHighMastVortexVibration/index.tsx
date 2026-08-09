import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/PortHighMastVortexVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PortLightingTower]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PortLightingTower';
import { MastState } from '../../../components/Vibration monitoring/PortHighMastVortexVibration/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { 
  Wind, Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers, Compass, Lightbulb 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const PortHighMastVortexVibration: React.FC = () => {
  const [state, setState] = useState<MastState>({
    windSpeed: 8.5,
    windDirection: 120,
    vibrationAmplitude: 12,
    isLockIn: false
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [vortexData, setVortexData] = useState<any[]>([]);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextWind = 5 + Math.random() * 15;
        const nextDir = (prev.windDirection + (Math.random() * 10 - 5)) % 360;
        
        // Vortex-induced vibration logic (Lock-in resonance)
        // Assume resonance occurs around 12 m/s
        const isLockIn = nextWind > 11 && nextWind < 13;
        const nextVib = isLockIn ? 40 + Math.random() * 20 : (nextWind * 1.5 + Math.random() * 5);
        
        // Update history
        setHistoryData(h => {
          const newData = [...h, { time: new Date().toLocaleTimeString(), vib: nextVib, wind: nextWind }];
          return newData.slice(-20);
        });

        // Update vortex scatter
        setVortexData(v => {
          const newData = [...v, { x: nextWind, y: nextVib, z: isLockIn ? 100 : 20 }];
          return newData.slice(-50);
        });

        return { windSpeed: nextWind, windDirection: nextDir, vibrationAmplitude: nextVib, isLockIn };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    if (state.isLockIn) return 'text-red-500';
    if (state.vibrationAmplitude > 30) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [state.isLockIn, state.vibrationAmplitude]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Lightbulb className="text-cyan-500" size={32} />
            港口高杆灯风诱发涡激振动监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Port High Mast Wind-induced Vortex Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Wind className="text-cyan-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Wind Speed: {state.windSpeed.toFixed(1)} m/s</span>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Compass className="text-slate-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Dir: {state.windDirection.toFixed(0)}°</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: 3D & Wind Analysis */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* 3D Digital Twin Container */}
          <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Digital Twin - High Mast Structure</span>
              </div>
            </div>
            
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Overlay Resonance Alert */}
            <AnimatePresence>
              {state.isLockIn && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                >
                  <div className="px-6 py-3 bg-red-600/20 backdrop-blur-xl border border-red-500/50 rounded-lg text-center">
                    <div className="text-red-500 font-bold text-xl uppercase tracking-widest animate-pulse">Lock-in Resonance Detected</div>
                    <div className="text-red-200 text-xs mt-1">涡激振动锁定共振区域</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Stats Overlay */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">振幅 (P-P)</div>
                <div className={`text-xl font-bold font-mono ${statusColor}`}>{state.vibrationAmplitude.toFixed(1)} <span className="text-[10px] text-slate-500">mm</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">斯特罗哈尔数 (St)</div>
                <div className="text-xl font-bold text-white font-mono">0.185</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">结构阻尼比</div>
                <div className="text-xl font-bold text-white font-mono">0.008</div>
              </div>
            </div>
          </div>

          {/* Bottom Trends */}
          <div className="grid grid-cols-2 gap-6 h-[220px]">
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-cyan-500" size={16} />
                振动幅值趋势
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
                    <YAxis domain={[0, 80]} hide />
                    <Area type="monotone" dataKey="vib" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="text-cyan-500" size={16} />
                风速-振幅相关性 (V-A Curve)
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                    <XAxis type="number" dataKey="x" name="Wind Speed" unit="m/s" axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="Amplitude" unit="mm" axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <ZAxis type="number" dataKey="z" range={[20, 100]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Vortex" data={vortexData} fill="#06b6d4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fatigue & Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Fatigue Life Analysis */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="text-yellow-500" size={16} />
              疲劳寿命评估
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase mb-2">剩余疲劳寿命 (估计)</div>
                <div className="text-3xl font-bold text-white font-mono">12.4 <span className="text-xs text-slate-500">YEARS</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">累计损伤</div>
                  <div className="text-sm font-bold">0.185</div>
                </div>
                <div className="p-3 bg-white/5 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">检测周期</div>
                  <div className="text-sm font-bold text-cyan-400">180 Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wind Rose / Directional Analysis */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Compass className="text-cyan-500" size={16} />
              主导风向分析
            </h3>
            <div className="h-[200px] flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: state.windDirection }}
                  className="w-1 h-16 bg-gradient-to-t from-transparent to-cyan-500 rounded-full origin-bottom"
                />
                <div className="absolute text-[10px] text-slate-500 -top-2">N</div>
                <div className="absolute text-[10px] text-slate-500 -bottom-2">S</div>
                <div className="absolute text-[10px] text-slate-500 -left-2">W</div>
                <div className="absolute text-[10px] text-slate-500 -right-2">E</div>
              </div>
            </div>
          </div>

          {/* Maintenance Recommendations */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={16} />
              运维决策建议
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border-l-2 border-emerald-500 rounded-r-md">
                <div className="text-[10px] text-slate-500 uppercase">结构完整性</div>
                <div className="text-xs text-slate-200">法兰连接处螺栓紧固状态: 良好</div>
              </div>
              <div className="p-3 bg-white/5 border-l-2 border-cyan-500 rounded-r-md">
                <div className="text-[10px] text-slate-500 uppercase">减振器状态</div>
                <div className="text-xs text-slate-200">主动阻尼器运行参数正常</div>
              </div>
              <AnimatePresence>
                {state.isLockIn && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-md"
                  >
                    <div className="text-[10px] text-red-500 uppercase font-bold">ACTION REQUIRED</div>
                    <div className="text-xs text-red-200">共振幅值超标，建议启用顶部扰流板或调整阻尼器频率</div>
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

export default PortHighMastVortexVibration;
