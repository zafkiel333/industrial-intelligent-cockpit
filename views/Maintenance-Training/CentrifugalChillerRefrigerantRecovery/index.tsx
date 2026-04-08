import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/CentrifugalChillerRefrigerantRecovery/ThreeScene';
import { ChillerState } from '../../../components/Maintenance-Training/CentrifugalChillerRefrigerantRecovery/three-types';
import { Gauge, Power, Settings2, Droplet, Wind, AlertTriangle } from 'lucide-react';

export default function CentrifugalChillerRefrigerantRecovery() {
  const [state, setState] = useState<ChillerState>({
    systemPressure: 850, // Initial pressure in chiller (kPa)
    recoveryCylinderPressure: 100, // Empty cylinder
    compressorRunning: false,
    valves: {
      liquidLine: false,
      vaporLine: false,
      recoveryInlet: false,
      recoveryOutlet: false
    },
    refrigerantAmount: 500, // Total kg in chiller
    recoveredAmount: 0,
    mode: 'idle',
    fault: false
  });

  // Recovery Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.compressorRunning) {
      interval = setInterval(() => {
        setState(prev => {
          let newChillerAmount = prev.refrigerantAmount;
          let newRecoveredAmount = prev.recoveredAmount;
          let newChillerPressure = prev.systemPressure;
          let newCylPressure = prev.recoveryCylinderPressure;
          let isFault = prev.fault;

          // Check if flow path is open
          const pathOpen = prev.valves.recoveryInlet && prev.valves.recoveryOutlet && 
                           ((prev.mode === 'liquid_recovery' && prev.valves.liquidLine) || 
                            (prev.mode === 'vapor_recovery' && prev.valves.vaporLine));

          if (pathOpen) {
            // Recovery rate depends on mode
            const rate = prev.mode === 'liquid_recovery' ? 5 : 1; // Liquid is faster

            if (newChillerAmount > 0) {
              const amountMoved = Math.min(rate, newChillerAmount);
              newChillerAmount -= amountMoved;
              newRecoveredAmount += amountMoved;

              // Pressure changes
              newChillerPressure = Math.max(0, newChillerPressure - (amountMoved * 1.5));
              newCylPressure = Math.min(2000, newCylPressure + (amountMoved * 2)); // Cylinder pressure rises

              // Fault condition: Cylinder overpressure
              if (newCylPressure > 1800) {
                 isFault = true;
                 console.warn("Recovery cylinder overpressure!");
              }
            }
          } else if (prev.valves.recoveryInlet || prev.valves.recoveryOutlet) {
             // Compressor running against closed valves - bad practice, simulate fault after a while
             if (Math.random() > 0.9) {
                 isFault = true;
             }
          }

          return { 
            ...prev, 
            refrigerantAmount: newChillerAmount,
            recoveredAmount: newRecoveredAmount,
            systemPressure: newChillerPressure,
            recoveryCylinderPressure: newCylPressure,
            fault: isFault,
            compressorRunning: isFault ? false : prev.compressorRunning // Auto stop on fault
          };
        });
      }, 500);
    }

    return () => clearInterval(interval);
  }, [state.compressorRunning]);

  const toggleValve = (valve: keyof ChillerState['valves']) => {
    setState(prev => ({
      ...prev,
      valves: { ...prev.valves, [valve]: !prev.valves[valve] }
    }));
  };

  const setMode = (mode: ChillerState['mode']) => {
    setState(prev => ({ ...prev, mode, compressorRunning: false })); // Stop compressor when changing modes
  };

  const toggleCompressor = () => {
    if (state.fault) {
      alert("系统存在故障，请先排除！");
      return;
    }
    setState(prev => ({ ...prev, compressorRunning: !prev.compressorRunning }));
  };

  const resetFault = () => {
    setState(prev => ({ ...prev, fault: false, recoveryCylinderPressure: 100, recoveredAmount: 0 })); // Reset cylinder for demo
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">离心式冷水机组冷媒回收与加注实操</h1>
          <p className="text-sm text-slate-400 mt-1">Centrifugal Chiller Refrigerant Recovery & Charging</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.fault ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <AlertTriangle size={18} />
            系统状态: {state.fault ? '高压报警 (FAULT)' : '正常 (NORMAL)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="回收机控制面板" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">回收机电源 (Recovery Unit)</span>
                <button 
                  onClick={toggleCompressor}
                  disabled={state.fault}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${state.compressorRunning ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}
                >
                  <Power size={16} /> {state.compressorRunning ? 'RUNNING' : 'STOPPED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">机组压力 (Chiller)</span>
                  <span className="font-mono text-xl text-blue-400">{state.systemPressure.toFixed(0)} kPa</span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">钢瓶压力 (Cylinder)</span>
                  <span className={`font-mono text-xl ${state.recoveryCylinderPressure > 1500 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.recoveryCylinderPressure.toFixed(0)} kPa
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">操作模式 (Mode)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMode('liquid_recovery')}
                    className={`py-2 rounded border flex items-center justify-center gap-2 text-sm transition-colors ${state.mode === 'liquid_recovery' ? 'bg-blue-900/50 border-blue-500 text-blue-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                  >
                    <Droplet size={14} /> 液态回收 (Liquid)
                  </button>
                  <button 
                    onClick={() => setMode('vapor_recovery')}
                    className={`py-2 rounded border flex items-center justify-center gap-2 text-sm transition-colors ${state.mode === 'vapor_recovery' ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                  >
                    <Wind size={14} /> 气态回收 (Vapor)
                  </button>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="阀门与管路控制">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>操作规范：</strong>先进行液态回收（速度快），待机组内无液体后，切换至气态回收（速度慢，抽真空）。</p>
                <p><strong>注意：</strong>启动回收机前必须确保管路阀门已正确开启，防止憋压损坏设备。</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => toggleValve('liquid_recovery' === state.mode ? 'liquidLine' : 'vaporLine')}
                  className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-colors ${state.valves['liquid_recovery' === state.mode ? 'liquidLine' : 'vaporLine'] ? 'bg-green-900/50 border border-green-500 text-green-400' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
                >
                  <Settings2 size={18} />
                  <span className="text-sm">机组侧阀门</span>
                  <span className="text-xs font-normal opacity-70">{state.valves['liquid_recovery' === state.mode ? 'liquidLine' : 'vaporLine'] ? 'OPEN' : 'CLOSED'}</span>
                </button>
                <button 
                  onClick={() => toggleValve('recoveryInlet')}
                  className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-colors ${state.valves.recoveryInlet ? 'bg-green-900/50 border border-green-500 text-green-400' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
                >
                  <Settings2 size={18} />
                  <span className="text-sm">回收机进口阀</span>
                  <span className="text-xs font-normal opacity-70">{state.valves.recoveryInlet ? 'OPEN' : 'CLOSED'}</span>
                </button>
                <button 
                  onClick={() => toggleValve('recoveryOutlet')}
                  className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-colors ${state.valves.recoveryOutlet ? 'bg-green-900/50 border border-green-500 text-green-400' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
                >
                  <Settings2 size={18} />
                  <span className="text-sm">回收机出口阀</span>
                  <span className="text-xs font-normal opacity-70">{state.valves.recoveryOutlet ? 'OPEN' : 'CLOSED'}</span>
                </button>
              </div>

              <div className="flex justify-between text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span>机组剩余: <strong className="text-blue-400">{state.refrigerantAmount.toFixed(1)} kg</strong></span>
                <span>已回收: <strong className="text-green-400">{state.recoveredAmount.toFixed(1)} kg</strong></span>
              </div>

              {state.fault && (
                <button onClick={resetFault} className="w-full py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-500 text-red-400 rounded-lg text-sm transition-colors">
                  复位故障并更换空钢瓶
                </button>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-blue-400 mb-1">冷媒回收系统透视</h3>
            <p className="text-slate-400">
              左侧：离心式冷水机组 (蓝:蒸发器, 红:冷凝器)<br/>
              中间：冷媒回收机 (橙色)<br/>
              右侧：回收钢瓶 (绿色)<br/>
              红色阀门表示关闭，绿色表示开启。管路颜色随模式变化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
