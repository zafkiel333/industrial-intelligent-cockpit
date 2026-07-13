import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ShipPropeller/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-ship-propeller]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-ship-propeller';
import { PropellerState } from '@/components/computer-visual-inspection/ShipPropeller/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Activity, AlertTriangle, CheckCircle2, Gauge, ShieldAlert } from 'lucide-react';

const ShipPropellerView: React.FC = () => {
  const [state, setState] = useState<PropellerState>({
    rotationSpeed: 1.2,
    cavitationIntensity: 0.35,
    damageDetected: true,
    damagePoints: [
      { x: 1.2, y: 0.5, z: 0.2, severity: 'medium' },
      { x: -0.8, y: -1.1, z: 0.1, severity: 'low' }
    ]
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextCavitation = 0.3 + Math.sin(Date.now() * 0.001) * 0.1;
        return {
          ...prev,
          cavitationIntensity: parseFloat(nextCavitation.toFixed(2))
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
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">船舶螺旋桨空泡与损伤监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">PROPELLER CAVITATION & DAMAGE MONITORING SYSTEM v2.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">空泡强度</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.cavitationIntensity > 0.5 ? 'bg-amber-500' : 'bg-cyan-500'}`} />
              <span className={`text-sm font-bold ${state.cavitationIntensity > 0.5 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {state.cavitationIntensity > 0.5 ? '高强度空泡' : '正常空泡'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">损伤状态</span>
            <span className={`text-sm font-bold ${state.damageDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {state.damageDetected ? '检测到表面损伤' : '表面完好'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-7 flex flex-col gap-6">
          <SciFiCard title="3D 螺旋桨数字孪生" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">旋转锁定</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示热图</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">转速: <span className="text-cyan-400 font-mono">120 RPM</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">空泡系数: <span className="text-cyan-400 font-mono">{state.cavitationIntensity}</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Damage Markers List */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="space-y-2">
                <span className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest">损伤标记点</span>
                <div className="flex gap-2">
                  {state.damagePoints.map((p, i) => (
                    <div key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/50 rounded text-[10px] text-rose-400">
                      #{i+1} {p.severity.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Cavitation Analysis */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="空泡频谱分析" className="h-40">
              <div className="flex items-end gap-1 h-full pb-4">
                {[40, 60, 80, 50, 90, 70, 40, 30, 60, 80, 90, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    className="flex-1 bg-cyan-500/50 rounded-t"
                    animate={{ height: `${h}%` }}
                    transition={{ repeat: Infinity, duration: 1 + Math.random(), repeatType: 'reverse' }}
                  />
                ))}
              </div>
            </SciFiCard>
            <SciFiCard title="振动能级监测" className="h-40">
              <div className="flex items-center justify-center h-full">
                <div className="relative w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center">
                  <div className="text-xl font-mono text-cyan-400">0.85g</div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="48" cy="48" r="44" 
                      fill="none" stroke="currentColor" strokeWidth="4" 
                      className="text-cyan-500"
                      strokeDasharray={276}
                      strokeDashoffset={276 * (1 - 0.85)}
                    />
                  </svg>
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Detailed Analysis */}
        <div className="col-span-5 flex flex-col gap-6">
          <SciFiCard title="损伤细节评估" className="flex-1">
            <div className="space-y-6">
              <div className="space-y-4">
                {state.damagePoints.map((p, i) => (
                  <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${p.severity === 'high' ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                        <ShieldAlert className={`w-6 h-6 ${p.severity === 'high' ? 'text-rose-400' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">损伤点 #{i+1}</div>
                        <div className="text-[10px] text-slate-500 font-mono">坐标: ({p.x}, {p.y}, {p.z})</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold uppercase ${p.severity === 'high' ? 'text-rose-400' : 'text-amber-400'}`}>{p.severity}</div>
                      <div className="text-[10px] text-slate-400">建议立即检修</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2">智能诊断结论</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  检测到螺旋桨叶片边缘存在空泡剥蚀迹象。空泡强度在当前转速下处于临界状态，建议降低巡航速度 10% 以减缓剥蚀进度。
                </p>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="维护建议" className="h-48">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">计划外坞修预警</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  根据损伤扩展速率预测，建议在未来 <span className="text-amber-400 font-bold">45天</span> 内安排潜水员进行水下打磨修复，以防止损伤进一步恶化导致推进效率下降。
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ShipPropellerView;
