import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/MooringTension/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-mooring-tension]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-mooring-tension';
import { MooringState } from '@/components/computer-visual-inspection/MooringTension/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Activity, AlertTriangle, CheckCircle2, MoveHorizontal, MoveVertical } from 'lucide-react';

const MooringTensionView: React.FC = () => {
  const [state, setState] = useState<MooringState>({
    lines: [
      { id: 'L1', tension: 120, status: 'normal' },
      { id: 'L2', tension: 145, status: 'normal' },
      { id: 'L3', tension: 280, status: 'warning' },
      { id: 'L4', tension: 110, status: 'normal' }
    ],
    shipMovement: { x: 12, y: 2, z: -8 }
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextX = prev.shipMovement.x + (Math.random() - 0.5) * 2;
        const nextZ = prev.shipMovement.z + (Math.random() - 0.5) * 2;
        const nextLines = prev.lines.map(l => {
          const nextTension = 100 + Math.random() * 200;
          const nextStatus = nextTension > 250 ? 'critical' : nextTension > 180 ? 'warning' : 'normal';
          return { ...l, tension: parseFloat(nextTension.toFixed(1)), status: nextStatus as any };
        });
        return {
          ...prev,
          shipMovement: { x: parseFloat(nextX.toFixed(1)), y: 2, z: parseFloat(nextZ.toFixed(1)) },
          lines: nextLines
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
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">船舶系泊缆绳张力与姿态视觉监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">MOORING LINE TENSION & SHIP ATTITUDE MONITORING v1.8</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">系泊安全</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.lines.some(l => l.status === 'critical') ? 'bg-rose-500' : state.lines.some(l => l.status === 'warning') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.lines.some(l => l.status === 'critical') ? 'text-rose-400' : state.lines.some(l => l.status === 'warning') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.lines.some(l => l.status === 'critical') ? '极限张力告警' : state.lines.some(l => l.status === 'warning') ? '张力不均预警' : '系泊稳固'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">最大张力</span>
            <span className="text-sm font-mono text-cyan-300">{Math.max(...state.lines.map(l => l.tension))} kN</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 系泊数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示应力图</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <MoveHorizontal className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">纵向偏移: <span className="text-cyan-400 font-mono">{state.shipMovement.x} mm</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <MoveVertical className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">横向偏移: <span className="text-cyan-400 font-mono">{state.shipMovement.z} mm</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Line Status Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between gap-4">
              {state.lines.map(l => (
                <div key={l.id} className={`flex-1 p-2 border rounded backdrop-blur-md ${l.status === 'critical' ? 'bg-rose-500/10 border-rose-500/50' : l.status === 'warning' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-cyan-500/10 border-cyan-500/50'}`}>
                  <div className="text-[10px] text-slate-500 uppercase mb-1">缆绳 {l.id}</div>
                  <div className={`text-lg font-mono font-bold ${l.status === 'critical' ? 'text-rose-400' : l.status === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {l.tension} <span className="text-[10px] font-normal">kN</span>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="平均张力" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">165.2 kN</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '55%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="张力不平衡度" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">12.5%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '12.5%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="缆绳疲劳指数" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">0.42</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '42%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="系泊分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">累计冲击</div>
                  <div className="text-xl font-mono text-cyan-400">1,245 次</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">安全系数</div>
                  <div className="text-xl font-mono text-cyan-400">3.2</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  张力事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '系泊作业完成，开启监测', type: 'info' },
                    { time: '10:42:15', event: '检测到涌浪导致张力波动', type: 'info' },
                    { time: '10:43:10', event: '缆绳 L3 张力超过 250kN', type: 'warning' },
                    { time: '10:44:05', event: '自动调整系泊绞车张力', type: 'info' },
                    { time: '10:45:00', event: '张力恢复至平衡状态', type: 'success' },
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
              <div className={`p-3 rounded-lg ${state.lines.some(l => l.status === 'critical') ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.lines.some(l => l.status === 'critical') ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.lines.some(l => l.status === 'critical') ? '缆绳张力过高' : '系泊状态安全'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.lines.some(l => l.status === 'critical') 
                    ? '检测到 L3 缆绳张力已接近断裂负荷，建议立即通过系泊绞车进行松缆操作，并检查缆绳是否存在断丝。' 
                    : '各缆绳张力分布均匀，船舶偏移量处于安全范围内。建议继续维持当前系泊状态。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MooringTensionView;
