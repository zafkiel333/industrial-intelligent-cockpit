import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/ShipHullVerticalVibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ShipHull]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ShipHull';
import { HullState } from '../../../components/Vibration monitoring/ShipHullVerticalVibration/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Ship, Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers, Waves, Wind 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const ShipHullVerticalVibration: React.FC = () => {
  const [state, setState] = useState<HullState>({
    bendingAmplitude: 0.15,
    frequency: 0.8,
    stressLevel: 0.35,
    waveHeight: 2.5
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [stressData, setStressData] = useState<any[]>([]);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextBend = 0.1 + Math.random() * 0.1;
        const nextStress = 0.2 + Math.random() * 0.3;
        const nextWave = 2.0 + Math.random() * 1.5;
        
        // Update history
        setHistoryData(h => {
          const newData = [...h, { time: new Date().toLocaleTimeString(), bend: nextBend, wave: nextWave }];
          return newData.slice(-20);
        });

        // Update stress
        setStressData([
          { subject: 'Deck', A: 120 + Math.random() * 30, fullMark: 200 },
          { subject: 'Bottom', A: 140 + Math.random() * 40, fullMark: 200 },
          { subject: 'Side Starboard', A: 80 + Math.random() * 20, fullMark: 200 },
          { subject: 'Side Port', A: 85 + Math.random() * 20, fullMark: 200 },
          { subject: 'Bulkhead', A: 60 + Math.random() * 15, fullMark: 200 },
        ]);

        return { ...prev, bendingAmplitude: nextBend, stressLevel: nextStress, waveHeight: nextWave };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    if (state.stressLevel > 0.6) return 'text-red-500';
    if (state.stressLevel > 0.4) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [state.stressLevel]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Ship className="text-cyan-500" size={32} />
            船体结构总纵振动监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Hull Structure Vertical Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Waves className="text-cyan-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Sea State: Moderate</span>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Wind className="text-slate-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Wind: 15 knots</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: 3D & Stress Map */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* 3D Digital Twin Container */}
          <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Structural Analysis - Hull Bending</span>
              </div>
            </div>
            
            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Overlay Stats */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="p-3 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg text-[10px] font-mono">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">BENDING_MOMENT:</span>
                  <span className="text-cyan-400">125,400 kN·m</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">SHEAR_FORCE:</span>
                  <span className="text-cyan-400">45,200 kN</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">HULL_DEFLECTION:</span>
                  <span className="text-cyan-400">145 mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Cards */}
          <div className="grid grid-cols-4 gap-4 h-[120px]">
            <div className="bg-slate-900/40 border border-white/5 p-4 rounded-lg flex flex-col justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">总纵弯曲频率</div>
              <div className="text-2xl font-bold text-white font-mono">{state.frequency.toFixed(2)} <span className="text-xs text-slate-500">Hz</span></div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-4 rounded-lg flex flex-col justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">波浪高度</div>
              <div className="text-2xl font-bold text-white font-mono">{state.waveHeight.toFixed(1)} <span className="text-xs text-slate-500">m</span></div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-4 rounded-lg flex flex-col justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">结构应力水平</div>
              <div className={`text-2xl font-bold font-mono ${statusColor}`}>{(state.stressLevel * 100).toFixed(1)} <span className="text-xs text-slate-500">%</span></div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-4 rounded-lg flex flex-col justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">疲劳损伤指数</div>
              <div className="text-2xl font-bold text-white font-mono">0.042 <span className="text-xs text-slate-500">/yr</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Stress Distribution */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Stress Distribution Radar */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Layers className="text-cyan-500" size={16} />
              船体应力分布 (Stress Map)
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stressData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 200]} hide />
                  <Radar
                    name="Stress"
                    dataKey="A"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bending Trend */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="text-cyan-500" size={16} />
              总纵弯曲趋势分析
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorBend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 0.4]} hide />
                  <Area type="monotone" dataKey="bend" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Structural Health Index */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={16} />
              结构健康评估
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] uppercase mb-1">
                  <span className="text-slate-500">屈服强度裕度</span>
                  <span className="text-emerald-400">85%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase mb-1">
                  <span className="text-slate-500">屈曲稳定性</span>
                  <span className="text-cyan-400">92%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    className="h-full bg-cyan-500"
                  />
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-md border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <AlertTriangle className="text-yellow-500" size={14} />
                  <span>建议: 监测到中拱状态持续，注意大浪冲击</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShipHullVerticalVibration;
