import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/PortFender/ThreeScene';
import { FenderState } from '@/components/computer-visual-inspection/PortFender/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Activity, AlertTriangle, CheckCircle2, Shield, Zap } from 'lucide-react';

const PortFenderView: React.FC = () => {
  const [state, setState] = useState<FenderState>({
    compression: 0.25,
    pressure: 120,
    status: 'normal',
    lastImpact: 450
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextCompression = Math.abs(Math.sin(Date.now() * 0.0005)) * 0.8;
        const nextPressure = nextCompression * 500;
        const nextStatus = nextCompression > 0.7 ? 'critical' : nextCompression > 0.4 ? 'warning' : 'normal';
        return {
          ...prev,
          compression: parseFloat(nextCompression.toFixed(2)),
          pressure: parseFloat(nextPressure.toFixed(0)),
          status: nextStatus
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
            <Anchor className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">码头护舷受压与变形视觉监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">PORT FENDER COMPRESSION & DEFORMATION MONITORING v1.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">受压状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.status === 'critical' ? 'bg-rose-500' : state.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.status === 'critical' ? 'text-rose-400' : state.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.status === 'normal' ? '安全受压' : state.status === 'warning' ? '高负荷预警' : '极限受压告警'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">实时压力</span>
            <span className="text-sm font-mono text-cyan-300">{state.pressure} kPa</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 护舷数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示应力图</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">变形率: <span className="text-cyan-400 font-mono">{(state.compression * 100).toFixed(1)}%</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">反力: <span className="text-cyan-400 font-mono">{state.lastImpact} kN</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            
            {/* Compression Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">护舷压缩量</span>
                <div className="px-8 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full backdrop-blur-md">
                  <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">{(state.compression * 100).toFixed(1)} <span className="text-sm font-normal">%</span></span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="吸能效率" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">92.5%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '92.5%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="反力峰值" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{state.lastImpact} kN</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: `${(state.lastImpact / 1000) * 100}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="疲劳寿命" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">8500 次</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '85%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="受压分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">平均压力</div>
                  <div className="text-xl font-mono text-cyan-400">{state.pressure} kPa</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">最大变形</div>
                  <div className="text-xl font-mono text-cyan-400">{(state.compression * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  冲击事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '船舶靠泊接触', type: 'info' },
                    { time: '10:42:15', event: '压力达到 100kPa', type: 'info' },
                    { time: '10:43:10', event: '变形率超过 40%', type: 'warning' },
                    { time: '10:44:05', event: '反力峰值 450kN', type: 'info' },
                    { time: '10:45:00', event: '压力释放，弹性恢复', type: 'success' },
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
              <div className={`p-3 rounded-lg ${state.status === 'critical' ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.status === 'critical' ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.status === 'critical' ? '护舷极限受压' : '护舷状态良好'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.status === 'critical' 
                    ? '当前压缩量已超过 70% 极限阈值，建议立即停止靠泊操作，检查护舷本体是否存在永久性塑性变形。' 
                    : '护舷吸能表现稳定，弹性恢复良好。建议定期检查紧固螺栓的预紧力。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PortFenderView;
