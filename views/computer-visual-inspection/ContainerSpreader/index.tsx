import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ContainerSpreader/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-container-spreader]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-container-spreader';
import { SpreaderState } from '@/components/computer-visual-inspection/ContainerSpreader/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Box, Activity, AlertTriangle, CheckCircle2, Lock, Unlock, Target } from 'lucide-react';

const ContainerSpreaderView: React.FC = () => {
  const [state, setState] = useState<SpreaderState>({
    lockStatus: 'unlocked',
    loadWeight: 0,
    twistlockWear: 0.15,
    alignmentError: { x: 12, y: -8 }
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextX = prev.alignmentError.x + (Math.random() - 0.5) * 5;
        const nextY = prev.alignmentError.y + (Math.random() - 0.5) * 5;
        const nextStatus = Math.abs(nextX) < 10 && Math.abs(nextY) < 10 ? 'locked' : 'unlocked';
        return {
          ...prev,
          alignmentError: { x: parseFloat(nextX.toFixed(1)), y: parseFloat(nextY.toFixed(1)) },
          lockStatus: nextStatus as any,
          loadWeight: nextStatus === 'locked' ? 24.5 : 0
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
            <Box className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">集装箱吊具锁头状态与结构监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">CONTAINER SPREADER TWISTLOCK & STRUCTURAL MONITORING v2.3</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">锁头状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.lockStatus === 'locked' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-sm font-bold ${state.lockStatus === 'locked' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {state.lockStatus === 'locked' ? '已闭锁' : '开锁状态'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">当前负载</span>
            <span className="text-sm font-mono text-cyan-300">{state.loadWeight} T</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 吊具数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">对位校准</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">对位偏差: <span className="text-cyan-400 font-mono">X:{state.alignmentError.x} Y:{state.alignmentError.y} mm</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">锁头磨损: <span className="text-cyan-400 font-mono">{(state.twistlockWear * 100).toFixed(1)}%</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Lock Status Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">锁头位置确认</span>
                <div className={`px-8 py-2 border rounded-full backdrop-blur-md flex items-center gap-3 ${state.lockStatus === 'locked' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-amber-500/10 border-amber-500/50'}`}>
                  {state.lockStatus === 'locked' ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-amber-400" />}
                  <span className={`text-2xl font-mono font-bold tabular-nums ${state.lockStatus === 'locked' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {state.lockStatus === 'locked' ? 'LOCKED' : 'UNLOCKED'}
                  </span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="主梁应力" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">145 MPa</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '45%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="伸缩梁位置" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">40 FT</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '100%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="液压系统压力" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">18.5 MPa</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '75%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="吊具分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">累计吊次</div>
                  <div className="text-xl font-mono text-cyan-400">12,450</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">健康评分</div>
                  <div className="text-xl font-mono text-cyan-400">92/100</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  作业事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '吊具下降至目标高度', type: 'info' },
                    { time: '10:42:15', event: '视觉识别集装箱角件', type: 'info' },
                    { time: '10:43:10', event: '对位偏差 X:12mm Y:-8mm', type: 'warning' },
                    { time: '10:44:05', event: '锁头闭锁成功', type: 'success' },
                    { time: '10:45:00', event: '起吊负载 24.5T', type: 'info' },
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

          <SciFiCard title="智能维护建议" className="h-48">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">锁头磨损正常</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  当前锁头磨损率为 15%，处于健康范围内。建议在下一次月度维护中对旋转机构进行润滑，并检查接近开关的灵敏度。
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ContainerSpreaderView;
