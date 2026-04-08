import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/TurbineRunnerHoistingTraining/ThreeScene';
import { HoistingState } from '../../../components/Maintenance-Training/TurbineRunnerHoistingTraining/three-types';
import { Play, Pause, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TurbineRunnerHoistingTraining() {
  const [hoistState, setHoistState] = useState<HoistingState>({
    height: 0,
    rotation: 0,
    isHoisting: false,
    hookPosition: 10
  });

  const [step, setStep] = useState(1);

  useEffect(() => {
    let interval: any;
    if (hoistState.isHoisting) {
      interval = setInterval(() => {
        setHoistState(prev => {
          const newHeight = prev.height < 8 ? prev.height + 0.05 : prev.height;
          const newHook = prev.hookPosition > newHeight + 2 ? prev.hookPosition - 0.05 : newHeight + 2;
          
          if (newHeight >= 8 && step === 1) {
             setStep(2);
          }
          
          return {
            ...prev,
            height: newHeight,
            hookPosition: newHook
          };
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [hoistState.isHoisting, step]);

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">水轮机转轮吊装与拆卸虚拟实训</h1>
          <p className="text-sm text-slate-400 mt-1">Turbine Runner Hoisting & Disassembly VR Training</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-mono text-slate-300">系统状态: 在线</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="text-sm font-mono text-cyan-400">当前阶段: {step}/4</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Panel - Controls & Info */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="操作控制台" highlight>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className={`py-3 rounded border transition-all flex items-center justify-center gap-2 ${hoistState.isHoisting ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-600 hover:border-cyan-500'}`}
                  onClick={() => setHoistState(p => ({...p, isHoisting: !p.isHoisting}))}
                >
                  {hoistState.isHoisting ? <Pause size={18} /> : <Play size={18} />}
                  {hoistState.isHoisting ? '暂停作业' : '开始起吊'}
                </button>
                <button 
                  className="py-3 rounded border bg-slate-800 border-slate-600 hover:border-cyan-500 transition-all flex items-center justify-center gap-2"
                  onClick={() => setHoistState({ height: 0, rotation: 0, isHoisting: false, hookPosition: 10 })}
                >
                  <ArrowDown size={18} />
                  复位转轮
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">起吊高度</span>
                  <span className="font-mono text-cyan-400">{hoistState.height.toFixed(2)} m</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full transition-all duration-200" style={{ width: `${(hoistState.height / 8) * 100}%` }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">吊钩位置</span>
                  <span className="font-mono text-orange-400">{hoistState.hookPosition.toFixed(2)} m</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full transition-all duration-200" style={{ width: `${(hoistState.hookPosition / 15) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="作业指导书 (SOP)">
            <ul className="space-y-4">
              <li className={`flex gap-3 p-3 rounded border ${step >= 1 ? 'border-cyan-800 bg-cyan-950/30' : 'border-slate-800'}`}>
                {step > 1 ? <CheckCircle2 className="text-green-500 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-cyan-600 flex items-center justify-center text-xs shrink-0">1</div>}
                <div>
                  <h4 className={`text-sm font-bold ${step >= 1 ? 'text-cyan-300' : 'text-slate-500'}`}>挂装钢丝绳</h4>
                  <p className="text-xs text-slate-400 mt-1">检查吊具及钢丝绳状态，对准转轮起吊孔进行挂装，确保受力均匀。</p>
                </div>
              </li>
              <li className={`flex gap-3 p-3 rounded border ${step >= 2 ? 'border-cyan-800 bg-cyan-950/30' : 'border-slate-800'}`}>
                {step > 2 ? <CheckCircle2 className="text-green-500 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs shrink-0">2</div>}
                <div>
                  <h4 className={`text-sm font-bold ${step >= 2 ? 'text-cyan-300' : 'text-slate-500'}`}>试吊与找平</h4>
                  <p className="text-xs text-slate-400 mt-1">微升吊钩使钢丝绳受力，检查转轮水平度，误差不超过0.05mm/m。</p>
                </div>
              </li>
              <li className={`flex gap-3 p-3 rounded border ${step >= 3 ? 'border-cyan-800 bg-cyan-950/30' : 'border-slate-800'}`}>
                {step > 3 ? <CheckCircle2 className="text-green-500 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs shrink-0">3</div>}
                <div>
                  <h4 className={`text-sm font-bold ${step >= 3 ? 'text-cyan-300' : 'text-slate-500'}`}>正式起吊</h4>
                  <p className="text-xs text-slate-400 mt-1">平稳提升转轮，注意观察导水机构及机坑周围间隙，防止碰撞。</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-6 p-3 bg-orange-950/30 border border-orange-900/50 rounded flex gap-3 items-start">
              <AlertTriangle className="text-orange-500 shrink-0" size={18} />
              <div className="text-xs text-orange-200/70 leading-relaxed">
                安全提示：起吊过程中严禁人员在转轮下方停留或穿行。密切关注桥机载荷显示，防止超载。
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-2 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">实时遥测数据</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <div className="text-[10px] text-slate-500">桥机载荷</div>
                <div className="font-mono text-cyan-400 text-sm">125.4 T</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">水平倾角</div>
                <div className="font-mono text-cyan-400 text-sm">0.02°</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">提升速度</div>
                <div className="font-mono text-cyan-400 text-sm">{hoistState.isHoisting ? '1.2' : '0.0'} m/min</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">风速</div>
                <div className="font-mono text-cyan-400 text-sm">0.5 m/s</div>
              </div>
            </div>
          </div>
          <ThreeScene state={hoistState} />
          
          {/* Overlay scanning effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_4s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
