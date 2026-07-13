import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ShipAnchorChain/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-ship-anchor-chain]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-ship-anchor-chain';
import { AnchorChainState } from '@/components/computer-visual-inspection/ShipAnchorChain/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Activity, AlertTriangle, CheckCircle2, Gauge, MoveDown } from 'lucide-react';

const ShipAnchorChainView: React.FC = () => {
  const [state, setState] = useState<AnchorChainState>({
    tension: 450,
    length: 75,
    status: 'anchored',
    wearLevel: 0.22
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextTension = 400 + Math.sin(Date.now() * 0.0005) * 100;
        const nextStatus = nextTension > 600 ? 'warning' : 'anchored';
        return {
          ...prev,
          tension: parseFloat(nextTension.toFixed(1)),
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
            <Anchor className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">船舶锚链张力与磨损视觉监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">SHIP ANCHOR CHAIN TENSION & WEAR MONITORING v2.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">锚泊状态</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.status === 'anchored' ? '稳定锚泊' : '张力预警'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">实时张力</span>
            <span className="text-sm font-mono text-cyan-300">{state.tension} kN</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 锚机与锚链数字孪生" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示应力图</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <MoveDown className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">入水长度: <span className="text-cyan-400 font-mono">{state.length} M</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">锚机负载: <span className="text-cyan-400 font-mono">45%</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Tension Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">实时锚链张力</span>
                <div className="px-8 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full backdrop-blur-md">
                  <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">{state.tension} <span className="text-sm font-normal">kN</span></span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="锚链磨损率" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{(state.wearLevel * 100).toFixed(1)}%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: `${state.wearLevel * 100}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="锚机转速" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">0 RPM</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '0%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="系统自检状态" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">100%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '100%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="张力分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">平均张力</div>
                  <div className="text-xl font-mono text-cyan-400">425 kN</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">最大张力</div>
                  <div className="text-xl font-mono text-cyan-400">580 kN</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  张力事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '锚泊作业开始', type: 'info' },
                    { time: '10:42:15', event: '锚链入水 75M', type: 'info' },
                    { time: '10:43:10', event: '张力波动 50kN', type: 'info' },
                    { time: '10:44:05', event: '检测到锚地底质坚硬', type: 'warning' },
                    { time: '10:45:00', event: '锚泊稳固，进入监测模式', type: 'success' },
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
                  {state.status === 'warning' ? '张力超过阈值' : '锚泊状态安全'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.status === 'warning' 
                    ? '当前海况导致锚链张力波动较大，建议增加锚链长度至 100M 以提高锚泊稳定性。' 
                    : '锚链张力处于设计载荷的 40% 以内，锚位无偏移。建议继续维持当前锚泊配置。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ShipAnchorChainView;
