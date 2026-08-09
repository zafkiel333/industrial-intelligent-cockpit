import React, { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../../../components/Vibration monitoring/PortFirePumpEmergencyStart/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-PortFirePump]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-PortFirePump';
import { FirePumpState } from '../../../components/Vibration monitoring/PortFirePumpEmergencyStart/three-types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, ComposedChart 
} from 'recharts';
import { 
  Activity, Gauge, AlertTriangle, ShieldCheck, 
  Zap, Settings, RefreshCw, Layers, Droplets, Power 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const PortFirePumpEmergencyStart: React.FC = () => {
  const [state, setState] = useState<FirePumpState>({
    motorSpeed: 0,
    vibrationPeak: 0,
    pressure: 0,
    isStarting: false,
    startProgress: 0
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [transientData, setTransientData] = useState<any[]>([]);

  // Start-up Simulation logic
  const handleStart = () => {
    if (state.isStarting || state.motorSpeed > 0) return;
    
    setState(s => ({ ...s, isStarting: true, startProgress: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      if (progress >= 1) {
        clearInterval(interval);
        setState(s => ({ 
          ...s, 
          isStarting: false, 
          startProgress: 1, 
          motorSpeed: 2950, 
          pressure: 1.2,
          vibrationPeak: 0.15
        }));
      } else {
        // Transient phase
        const speed = 2950 * progress;
        const pressure = 1.2 * Math.pow(progress, 2);
        const vib = progress < 0.3 ? progress * 2 : (progress < 0.7 ? 0.6 - (progress - 0.3) : 0.15);
        
        setState(s => ({ 
          ...s, 
          startProgress: progress, 
          motorSpeed: speed, 
          pressure: pressure,
          vibrationPeak: vib
        }));

        setTransientData(t => {
          const newData = [...t, { time: progress.toFixed(2), vib, speed, pressure }];
          return newData.slice(-50);
        });
      }
    }, 100);
  };

  const handleReset = () => {
    setState({
      motorSpeed: 0,
      vibrationPeak: 0,
      pressure: 0,
      isStarting: false,
      startProgress: 0
    });
    setTransientData([]);
  };

  // Continuous monitoring simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.motorSpeed > 0 && !state.isStarting) {
        setState(prev => {
          const nextVib = 0.12 + Math.random() * 0.06;
          const nextPressure = 1.15 + Math.random() * 0.1;
          
          setHistoryData(h => {
            const newData = [...h, { time: new Date().toLocaleTimeString(), vib: nextVib, pressure: nextPressure }];
            return newData.slice(-20);
          });

          return { ...prev, vibrationPeak: nextVib, pressure: nextPressure };
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.motorSpeed, state.isStarting]);

  const statusColor = useMemo(() => {
    if (state.vibrationPeak > 0.5) return 'text-red-500';
    if (state.vibrationPeak > 0.3) return 'text-yellow-500';
    return 'text-cyan-500';
  }, [state.vibrationPeak]);

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200 font-[Rajdhani]">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Droplets className="text-cyan-500" size={32} />
            港口消防泵组紧急启动监测系统
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Port Fire Pump Set Emergency Start Vibration Monitoring System
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-sm flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Readiness: Ready</span>
          </div>
          <button 
            onClick={state.motorSpeed > 0 ? handleReset : handleStart}
            className={`px-6 py-2 rounded-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              state.motorSpeed > 0 
                ? 'bg-red-600/20 border border-red-500 text-red-500 hover:bg-red-600/40' 
                : 'bg-cyan-600 border border-cyan-500 text-white hover:bg-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            <Power size={18} />
            {state.motorSpeed > 0 ? '停止泵组' : '紧急启动'}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: 3D & Transient Analysis */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* 3D Digital Twin Container */}
          <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">3D Digital Twin - Fire Pump Set</span>
              </div>
            </div>
            
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Start-up Progress Overlay */}
            <AnimatePresence>
              {state.isStarting && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64"
                >
                  <div className="text-center mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">启动中... {(state.startProgress * 100).toFixed(0)}%</div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.startProgress * 100}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Stats Overlay */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">电机转速</div>
                <div className="text-xl font-bold text-white font-mono">{state.motorSpeed.toFixed(0)} <span className="text-[10px] text-slate-500">RPM</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">振动峰值</div>
                <div className={`text-xl font-bold font-mono ${statusColor}`}>{state.vibrationPeak.toFixed(3)} <span className="text-[10px] text-slate-500">mm/s</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">出口压力</div>
                <div className="text-xl font-bold text-white font-mono">{state.pressure.toFixed(2)} <span className="text-[10px] text-slate-500">MPa</span></div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">启动时长</div>
                <div className="text-xl font-bold text-white font-mono">4.2 <span className="text-[10px] text-slate-500">s</span></div>
              </div>
            </div>
          </div>

          {/* Bottom Transient Chart */}
          <div className="h-[250px] bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="text-cyan-500" size={16} />
              启动瞬态过程分析 (Transient Analysis)
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={transientData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '4px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="vib" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="振动" />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#06b6d4" dot={false} name="转速" />
                  <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#10b981" dot={false} name="压力" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Readiness & Diagnostics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Start-up Peak Analysis */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="text-yellow-500" size={16} />
              启动峰值监测
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">最大启动电流</div>
                <div className="text-2xl font-bold text-white font-mono">452 <span className="text-xs text-slate-500">A</span></div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1">最大冲击振动</div>
                <div className="text-2xl font-bold text-red-500 font-mono">0.65 <span className="text-xs text-slate-500">mm/s</span></div>
              </div>
            </div>
          </div>

          {/* System Readiness Checklist */}
          <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={16} />
              系统就绪状态检查
            </h3>
            <div className="space-y-3">
              {[
                { label: '进水阀门状态', status: '已开启', ok: true },
                { label: '润滑油压力', status: '0.45 MPa', ok: true },
                { label: '控制柜电源', status: '正常', ok: true },
                { label: '备用泵组状态', status: '热备中', ok: true },
                { label: '管网压力平衡', status: '0.2 MPa', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs font-bold ${item.ok ? 'text-emerald-500' : 'text-red-500'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Response Log */}
          <div className="flex-1 bg-slate-900/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Layers className="text-cyan-500" size={16} />
              应急启动日志
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {[
                { time: '10:58:38', event: '系统自检完成，处于待命状态', type: 'info' },
                { time: '10:50:00', event: '例行巡检：电机绝缘电阻测试合格', type: 'info' },
                { time: '昨天 15:30', event: '月度试运行：启动时间 4.5s，振动正常', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-slate-500 font-mono">{log.time}</span>
                  <span className="text-slate-300">{log.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Alert */}
          <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
              <RefreshCw size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase">下次例行试运行</div>
              <div className="text-[10px] text-slate-400">距离下次测试还有 12 天 4 小时</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortFirePumpEmergencyStart;
