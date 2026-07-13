import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/EngineRoomOilMist/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-engine-room-oil-mist]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-engine-room-oil-mist';
import { OilMistState } from '@/components/computer-visual-inspection/EngineRoomOilMist/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Activity, AlertTriangle, CheckCircle2, Thermometer, Flame } from 'lucide-react';

const EngineRoomOilMistView: React.FC = () => {
  const [state, setState] = useState<OilMistState>({
    concentration: 0.15,
    temperature: 82,
    status: 'normal',
    hotspots: [
      { x: 2.5, y: 1.2, z: 0.5, temp: 125 }
    ]
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextConcentration = 0.1 + Math.sin(Date.now() * 0.001) * 0.2;
        const nextTemp = 80 + Math.random() * 5;
        const nextStatus = nextConcentration > 0.5 ? 'danger' : nextConcentration > 0.3 ? 'warning' : 'normal';
        return {
          ...prev,
          concentration: parseFloat(nextConcentration.toFixed(2)),
          temperature: parseFloat(nextTemp.toFixed(1)),
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
            <Wind className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">机舱油雾浓度与火灾预警视觉系统</h1>
            <p className="text-xs text-slate-400 font-mono">ENGINE ROOM OIL MIST & FIRE EARLY WARNING v1.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">火灾风险</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.status === 'danger' ? 'bg-rose-500' : state.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.status === 'danger' ? 'text-rose-400' : state.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.status === 'normal' ? '低风险' : state.status === 'warning' ? '中等风险' : '极高风险'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">油雾浓度</span>
            <span className="text-sm font-mono text-cyan-300">{state.concentration} mg/L</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 机舱数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示热点</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">机舱温度: <span className="text-cyan-400 font-mono">{state.temperature}°C</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">传感器状态: <span className="text-emerald-400 font-mono">ONLINE</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Concentration Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">油雾浓度指数</span>
                <div className="px-8 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full backdrop-blur-md">
                  <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">{state.concentration} <span className="text-sm font-normal">mg/L</span></span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="通风系统流量" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">1250 m³/h</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '65%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="可燃气体比例" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">0.02% LEL</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '15%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="系统响应延迟" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">45 ms</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '20%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="油雾分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">平均浓度</div>
                  <div className="text-xl font-mono text-cyan-400">0.18 mg/L</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">最高温度</div>
                  <div className="text-xl font-mono text-cyan-400">{state.temperature}°C</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  环境事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '视觉系统自检完成', type: 'info' },
                    { time: '10:42:15', event: '检测到局部油气挥发', type: 'info' },
                    { time: '10:43:10', event: '浓度上升至 0.3mg/L', type: 'warning' },
                    { time: '10:44:05', event: '开启辅助通风系统', type: 'info' },
                    { time: '10:45:00', event: '浓度回落，风险解除', type: 'success' },
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
              <div className={`p-3 rounded-lg ${state.status === 'danger' ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.status === 'danger' ? (
                  <Flame className="w-6 h-6 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.status === 'danger' ? '高浓度油雾警报' : '环境状态安全'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.status === 'danger' 
                    ? '检测到油雾浓度超过爆炸下限 10%，且存在局部高温点。建议立即切断燃油供应，启动机舱灭火预案。' 
                    : '当前油雾浓度处于极低水平，通风系统运行正常。建议继续维持机舱环境监测。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default EngineRoomOilMistView;
