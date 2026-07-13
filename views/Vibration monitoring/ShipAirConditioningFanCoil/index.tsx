import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/ShipAirConditioningFanCoil/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ShipAirConditioning]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ShipAirConditioning';
import { FanCoilState } from '../../../components/Vibration monitoring/ShipAirConditioningFanCoil/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, ComposedChart 
} from 'recharts';
import { 
  Wind, Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers, Thermometer, Volume2 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const ShipAirConditioningFanCoil: React.FC = () => {
  const [state, setState] = useState<FanCoilState>({
    fanSpeed: 1200,
    vibrationIntensity: 0.12,
    temperature: 22.5,
    isAbnormal: false
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [spectrumData, setSpectrumData] = useState<any[]>([]);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextSpeed = 1150 + Math.random() * 100;
        const nextVib = 0.08 + Math.random() * 0.1;
        const nextTemp = 22 + Math.random() * 2;
        const isAbnormal = nextVib > 0.15;
        
        // Update history
        setHistoryData(h => {
          const newData = [...h, { time: new Date().toLocaleTimeString(), vib: nextVib, temp: nextTemp }];
          return newData.slice(-20);
        });

        // Update spectrum
        setSpectrumData([
          { freq: '50Hz', amp: 0.05 + Math.random() * 0.02 },
          { freq: '100Hz', amp: 0.12 + Math.random() * 0.05 },
          { freq: '150Hz', amp: 0.03 + Math.random() * 0.01 },
          { freq: '200Hz', amp: 0.01 + Math.random() * 0.005 },
          { freq: '250Hz', amp: 0.005 + Math.random() * 0.002 },
        ]);

        return { fanSpeed: nextSpeed, vibrationIntensity: nextVib, temperature: nextTemp, isAbnormal };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    if (state.isAbnormal) return 'text-red-500';
    if (state.vibrationIntensity > 0.12) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [state.isAbnormal, state.vibrationIntensity]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Wind className="text-cyan-500" size={32} />
            船舶中央空调风机盘管监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Ship Central AC Fan Coil Unit Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Thermometer className="text-cyan-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Temp: {state.temperature.toFixed(1)}°C</span>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <Volume2 className="text-slate-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Noise: 52 dB</span>
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
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Digital Twin - Fan Coil Unit</span>
              </div>
            </div>
            
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Overlay Stats */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">风机转速</div>
                <div className="text-xl font-bold text-white font-mono">{state.fanSpeed.toFixed(0)} <span className="text-[10px] text-slate-500">RPM</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">振动烈度</div>
                <div className={`text-xl font-bold font-mono ${statusColor}`}>{state.vibrationIntensity.toFixed(3)} <span className="text-[10px] text-slate-500">mm/s</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">滤网压差</div>
                <div className="text-xl font-bold text-white font-mono">125 <span className="text-[10px] text-slate-500">Pa</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">电机温度</div>
                <div className="text-xl font-bold text-white font-mono">42.5 <span className="text-[10px] text-slate-500">°C</span></div>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-2 gap-6 h-[220px]">
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-cyan-500" size={16} />
                振动趋势分析
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
                    <YAxis domain={[0, 0.3]} hide />
                    <Area type="monotone" dataKey="vib" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVib)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="text-cyan-500" size={16} />
                频谱分析 (Spectrum)
              </h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spectrumData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="freq" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis hide />
                    <Bar dataKey="amp" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostics & Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Health Score */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={16} />
              设备健康评分
            </h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-slate-800"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="stroke-cyan-500"
                    strokeWidth="3"
                    strokeDasharray="92, 100"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: "92, 100" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">92</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-[10px] text-slate-500 uppercase">轴承寿命</div>
                <div className="text-sm font-bold text-emerald-400">85%</div>
              </div>
              <div className="p-2 bg-white/5 rounded text-center">
                <div className="text-[10px] text-slate-500 uppercase">动平衡状态</div>
                <div className="text-sm font-bold text-cyan-400">优</div>
              </div>
            </div>
          </div>

          {/* Fault Diagnosis */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={16} />
              智能故障诊断
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase mb-1">诊断结果</div>
                <div className="text-xs text-slate-200">当前运行平稳，未检测到典型故障特征。</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-500">不平衡概率</span>
                  <span className="text-slate-400">12%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[12%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-500">轴承磨损概率</span>
                  <span className="text-slate-400">8%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[8%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-slate-500">松动/共振概率</span>
                  <span className="text-slate-400">5%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[5%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Log */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings className="text-slate-400" size={16} />
              维护保养记录
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">2026-03-15</span>
                <span className="text-slate-300">滤网清洗与更换</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">2026-01-10</span>
                <span className="text-slate-300">电机轴承加注润滑脂</span>
              </div>
              <div className="mt-4">
                <button className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded transition-colors">
                  发起维护申请
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShipAirConditioningFanCoil;
