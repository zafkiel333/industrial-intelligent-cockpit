import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/BerthingDistance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-berthing-distance]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-berthing-distance';
import { BerthingState } from '@/components/computer-visual-inspection/BerthingDistance/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Navigation, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BerthingDistanceView: React.FC = () => {
  const [state, setState] = useState<BerthingState>({
    distance: 12.4,
    angle: 2.5,
    speed: 0.15,
    status: 'approaching'
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextDistance = Math.max(0.5, prev.distance - 0.01);
        const nextSpeed = nextDistance < 2 ? 0.05 : 0.15;
        const nextStatus = nextDistance < 1 ? 'docked' : nextDistance < 5 ? 'warning' : 'approaching';
        return {
          ...prev,
          distance: parseFloat(nextDistance.toFixed(2)),
          speed: nextSpeed,
          status: nextStatus as any
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg text-slate-100">
      {/* Header with Status Bar */}
      <div className="flex justify-between items-center bg-slate-900/80 p-4 border border-cyan-500/30 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-full border border-cyan-500/50">
            <Ship className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">船舶靠泊距离与姿态视觉测量系统</h1>
            <p className="text-xs text-slate-400 font-mono">BERTHING DISTANCE & ATTITUDE VISUAL MEASUREMENT SYSTEM v4.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">系统状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.status === 'warning' ? 'bg-amber-500' : state.status === 'docked' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
              <span className={`text-sm font-bold ${state.status === 'warning' ? 'text-amber-400' : state.status === 'docked' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {state.status === 'approaching' ? '正常进港' : state.status === 'warning' ? '近距离预警' : '安全靠泊'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">实时时间</span>
            <span className="text-sm font-mono text-cyan-300">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">重置视角</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">航向角: <span className="text-cyan-400 font-mono">{state.angle}°</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">靠泊速度: <span className="text-cyan-400 font-mono">{state.speed} m/s</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Distance Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">离岸距离</span>
                <div className="px-8 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full backdrop-blur-md">
                  <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">{state.distance} <span className="text-sm font-normal">M</span></span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="纵摇 (Pitch)" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">0.42°</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '40%' }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="横摇 (Roll)" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">1.15°</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '60%' }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: 'reverse' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="艏摇 (Yaw)" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{state.angle}°</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: `${(state.angle / 10) * 100}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="视觉分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">平均速度</div>
                  <div className="text-xl font-mono text-cyan-400">0.12 m/s</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">预估靠泊时间</div>
                  <div className="text-xl font-mono text-cyan-400">01:42</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  实时事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '进入视觉捕捉范围', type: 'info' },
                    { time: '10:42:15', event: '识别到船首特征点', type: 'info' },
                    { time: '10:43:10', event: '姿态角偏离修正', type: 'warning' },
                    { time: '10:44:05', event: '距离小于5米，开启高频监测', type: 'warning' },
                    { time: '10:45:00', event: '靠泊完成，系统锁定', type: 'success' },
                  ].map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 text-[11px] border-b border-slate-800 pb-2"
                    >
                      <span className="text-cyan-500 font-mono">{log.time}</span>
                      <span className={log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                        {log.event}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能决策建议" className="h-48">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${state.status === 'warning' ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.status === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.status === 'warning' ? '建议减速' : '保持当前航向'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.status === 'warning' 
                    ? '当前离岸距离过近，建议引航员降低推进器转速，并注意船首横向偏移。' 
                    : '船舶姿态平稳，各项参数处于安全阈值内，建议维持当前靠泊策略。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default BerthingDistanceView;
