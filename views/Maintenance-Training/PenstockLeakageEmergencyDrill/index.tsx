import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/PenstockLeakageEmergencyDrill/ThreeScene';
import { LeakageState } from '../../../components/Maintenance-Training/PenstockLeakageEmergencyDrill/three-types';
import { Droplets, Wrench, ShieldAlert, CheckCircle2, AlertTriangle, Hammer } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[PenstockLeakageEmergencyDrill]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/PenstockLeakageEmergencyDrill';

export default function PenstockLeakageEmergencyDrill() {
  const [state, setState] = useState<LeakageState>({
    leakRate: 100,
    pressure: 8.5, // MPa
    toolSelected: 'none',
    repairProgress: 0
  });

  const [isApplying, setIsApplying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isApplying && state.toolSelected !== 'none' && state.repairProgress < 100) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(100, prev.repairProgress + 2);
          // Leak rate decreases as progress increases
          const newLeakRate = 100 - newProgress;
          return {
            ...prev,
            repairProgress: newProgress,
            leakRate: newLeakRate
          };
        });
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isApplying, state.toolSelected, state.repairProgress]);

  const handleToolSelect = (tool: 'clamp' | 'sealant' | 'wrench') => {
    setState(prev => ({ ...prev, toolSelected: tool }));
  };

  const resetDrill = () => {
    setState({
      leakRate: 100,
      pressure: 8.5,
      toolSelected: 'none',
      repairProgress: 0
    });
    setIsApplying(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">压力钢管伸缩节漏水应急封堵演练</h1>
          <p className="text-sm text-slate-400 mt-1">Penstock Expansion Joint Leakage Emergency Plugging Drill</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={resetDrill}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors"
          >
            重置演练
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="应急抢险状态" highlight>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><AlertTriangle size={14}/> 漏水强度</div>
                <div className={`font-mono text-2xl ${state.leakRate > 50 ? 'text-red-400' : state.leakRate > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {state.leakRate.toFixed(0)} <span className="text-sm text-slate-500">%</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Droplets size={14}/> 钢管水压</div>
                <div className="font-mono text-2xl text-cyan-400">
                  {state.pressure.toFixed(1)} <span className="text-sm text-slate-500">MPa</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">封堵作业进度</span>
                <span className="font-mono text-xl text-green-400">{state.repairProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${state.repairProgress}%` }}
                ></div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="抢险工具箱">
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button 
                onClick={() => handleToolSelect('clamp')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${state.toolSelected === 'clamp' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500'}`}
              >
                <ShieldAlert size={24} />
                <span className="text-xs font-bold">哈夫节/抱箍</span>
              </button>
              <button 
                onClick={() => handleToolSelect('sealant')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${state.toolSelected === 'sealant' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500'}`}
              >
                <Droplets size={24} />
                <span className="text-xs font-bold">速凝堵漏剂</span>
              </button>
              <button 
                onClick={() => handleToolSelect('wrench')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${state.toolSelected === 'wrench' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500'}`}
              >
                <Hammer size={24} />
                <span className="text-xs font-bold">液压扳手</span>
              </button>
            </div>

            <button
              onPointerDown={() => setIsApplying(true)}
              onPointerUp={() => setIsApplying(false)}
              onPointerLeave={() => setIsApplying(false)}
              disabled={state.toolSelected === 'none' || state.repairProgress >= 100}
              className="w-full py-4 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 rounded-lg font-bold text-red-300 tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors select-none touch-none"
            >
              {state.repairProgress >= 100 ? '封堵完成' : state.toolSelected === 'none' ? '请先选择工具' : '长按执行封堵作业'}
            </button>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          {/* Overlay Status */}
          {state.repairProgress >= 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-900/20 backdrop-blur-sm pointer-events-none">
              <div className="bg-slate-900/90 border border-green-500 p-6 rounded-xl text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">抢险成功</h2>
                <p className="text-slate-300">漏水点已成功封堵，系统压力恢复稳定。</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs text-slate-400">
            <p className="font-bold text-cyan-400 mb-1">应急预案执行中</p>
            <p>1. 穿戴防水服及安全带</p>
            <p>2. 选择合适的封堵工具</p>
            <p>3. 迎水面带压作业</p>
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
}
