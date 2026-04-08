import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/GasPumpVacuumTroubleshoot/ThreeScene';
import { VacuumState } from '../../../components/Maintenance-Training/GasPumpVacuumTroubleshoot/three-types';
import { Gauge, Droplet, Wind, AlertTriangle, Wrench } from 'lucide-react';

export default function GasPumpVacuumTroubleshoot() {
  const [state, setState] = useState<VacuumState>({
    waterLevel: 50,
    vacuum: 0,
    rpm: 0,
    hasLeak: true
  });

  // Physics simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setState(prev => {
        let targetVacuum = 0;
        
        // Vacuum depends on RPM and Water Level
        if (prev.rpm > 500 && prev.waterLevel > 20) {
          // Ideal vacuum based on RPM and water level
          targetVacuum = -((prev.rpm / 1500) * 80) * (prev.waterLevel / 100);
          
          // Leak reduces vacuum significantly
          if (prev.hasLeak) {
            targetVacuum *= 0.4; // 60% loss
          }
        }

        // Smooth transition
        const newVacuum = prev.vacuum + (targetVacuum - prev.vacuum) * 0.1;

        return {
          ...prev,
          vacuum: newVacuum
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleRpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, rpm: parseInt(e.target.value) }));
  };

  const handleWaterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, waterLevel: parseInt(e.target.value) }));
  };

  const fixLeak = () => {
    setState(prev => ({ ...prev, hasLeak: false }));
  };

  const resetFault = () => {
    setState(prev => ({ ...prev, hasLeak: true, waterLevel: 30 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">瓦斯抽放泵水环真空度异常排查</h1>
          <p className="text-sm text-slate-400 mt-1">Gas Drainage Pump Liquid Ring Vacuum Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.vacuum < -60 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            <Gauge size={18} />
            真空度: {state.vacuum.toFixed(1)} kPa
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="运行参数与故障排查" highlight>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Wind size={16}/> 电机转速 (RPM)</span>
                  <span className="text-cyan-400 font-mono">{state.rpm}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1500" 
                  value={state.rpm}
                  onChange={handleRpmChange}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Droplet size={16}/> 供水量 (液位 %)</span>
                  <span className="text-blue-400 font-mono">{state.waterLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={state.waterLevel}
                  onChange={handleWaterChange}
                  className="w-full accent-blue-500"
                />
                {state.waterLevel < 40 && <p className="text-xs text-red-400 mt-1">警告: 供水量不足，无法形成有效水环</p>}
                {state.waterLevel > 80 && <p className="text-xs text-yellow-400 mt-1">提示: 供水量过大，增加电机负荷</p>}
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <h3 className="text-sm font-bold text-slate-300 mb-3">排查操作</h3>
                <div className="space-y-3">
                  <button 
                    onClick={fixLeak}
                    disabled={!state.hasLeak}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <Wrench size={16} /> 紧固法兰/更换密封垫 (修复漏气)
                  </button>
                  <button 
                    onClick={resetFault}
                    className="w-full py-2 bg-transparent border border-slate-700 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    重置故障场景
                  </button>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="真空度异常原因分析">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">1.</span> <strong className="text-slate-200">供水量不足：</strong>无法形成封闭的水环，气体在叶轮间隙泄漏，导致真空度下降。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">2.</span> <strong className="text-slate-200">系统漏气：</strong>吸气管路、法兰连接处或轴封漏气，外部空气进入泵内。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">3.</span> <strong className="text-slate-200">水温过高：</strong>工作液（水）温度升高，饱和蒸汽压增大，降低了泵的抽气能力。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">4.</span> <strong className="text-slate-200">转速不够：</strong>电机故障或皮带打滑导致转速达不到额定值。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-2">泵体内部状态</h3>
            <div className="space-y-1 text-slate-300">
              <p>水环形成: {state.rpm > 500 && state.waterLevel > 20 ? '已形成' : '未形成 (失效)'}</p>
              <p>管路密封: {state.hasLeak ? <span className="text-red-400 font-bold">存在漏气点</span> : '密封良好'}</p>
              <p>抽放效率: {state.vacuum < -60 ? '优' : state.vacuum < -30 ? '良' : '差'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
