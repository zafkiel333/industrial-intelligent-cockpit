import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineSteeringGearHydraulicFault/ThreeScene';
import { SteeringGearState } from '../../../components/Maintenance-Training/MarineSteeringGearHydraulicFault/three-types';
import { Settings, AlertTriangle, Droplets, Activity, Anchor, RefreshCw } from 'lucide-react';

export default function MarineSteeringGearHydraulicFault() {
  const [state, setState] = useState<SteeringGearState>({
    pump1Active: true,
    pump2Active: false,
    rudderAngle: 0,
    targetAngle: 0,
    hydraulicPressure: 120,
    oilLevel: 85,
    filterClogged: false
  });

  const [faultType, setFaultType] = useState<'none' | 'filter_clogged' | 'oil_leak'>('none');

  // Steering logic simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    interval = setInterval(() => {
      setState(prev => {
        let newAngle = prev.rudderAngle;
        let newPressure = prev.hydraulicPressure;
        let newOilLevel = prev.oilLevel;
        let isClogged = prev.filterClogged;

        // Determine active pumps
        const activePumps = (prev.pump1Active ? 1 : 0) + (prev.pump2Active ? 1 : 0);
        
        // Base turning speed
        let turnSpeed = activePumps * 2; // degrees per interval

        // Fault effects
        if (faultType === 'filter_clogged') {
          isClogged = true;
          turnSpeed *= 0.3; // Sluggish steering
          newPressure = activePumps > 0 ? 180 : 0; // High pressure due to blockage
        } else if (faultType === 'oil_leak') {
          newOilLevel = Math.max(0, prev.oilLevel - 0.5); // Leak oil
          if (newOilLevel < 20) {
             turnSpeed = 0; // Loss of steering
             newPressure = 0; // Loss of pressure
          } else {
             newPressure = activePumps > 0 ? 80 : 0; // Low pressure
          }
        } else {
          isClogged = false;
          newPressure = activePumps > 0 ? 120 : 0; // Normal pressure
        }

        // Move rudder towards target
        if (activePumps > 0 && turnSpeed > 0) {
          if (Math.abs(prev.targetAngle - prev.rudderAngle) > turnSpeed) {
            newAngle += prev.targetAngle > prev.rudderAngle ? turnSpeed : -turnSpeed;
          } else {
            newAngle = prev.targetAngle;
          }
        }

        return { 
          ...prev, 
          rudderAngle: newAngle, 
          hydraulicPressure: newPressure,
          oilLevel: newOilLevel,
          filterClogged: isClogged
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [faultType]);

  const setTarget = (angle: number) => {
    setState(prev => ({ ...prev, targetAngle: angle }));
  };

  const togglePump = (pumpNum: 1 | 2) => {
    setState(prev => ({
      ...prev,
      pump1Active: pumpNum === 1 ? !prev.pump1Active : prev.pump1Active,
      pump2Active: pumpNum === 2 ? !prev.pump2Active : prev.pump2Active,
    }));
  };

  const cleanFilter = () => {
    if (faultType === 'filter_clogged') {
      setFaultType('none');
      alert("液压油滤器已清洗/更换，系统恢复正常。");
    }
  };

  const repairLeak = () => {
    if (faultType === 'oil_leak') {
      setFaultType('none');
      setState(prev => ({ ...prev, oilLevel: 85 })); // Refill oil
      alert("液压管路漏点已修复，并补充液压油至正常液位。");
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-teal-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">船用舵机液压系统故障排查</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Steering Gear Hydraulic System Fault Diagnosis</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.oilLevel < 30 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Droplets size={18} />
            油箱液位: {state.oilLevel.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="驾驶台操舵台 (Steering Stand)" highlight>
            <div className="space-y-6">
              
              <div className="flex flex-col items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg relative">
                <span className="text-sm text-slate-400 mb-2">实际舵角 (Rudder Angle)</span>
                <div className="text-3xl font-mono font-bold text-teal-400">
                  {state.rudderAngle > 0 ? `右 ${state.rudderAngle.toFixed(1)}°` : state.rudderAngle < 0 ? `左 ${Math.abs(state.rudderAngle).toFixed(1)}°` : '0.0°'}
                </div>
                <div className="w-full mt-4 flex justify-between text-xs text-slate-500">
                  <span>左 35°</span>
                  <span>0°</span>
                  <span>右 35°</span>
                </div>
                {/* Rudder Indicator Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full mt-1 relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-500 z-10"></div>
                  <div 
                    className="absolute top-0 bottom-0 bg-teal-500 rounded-full transition-all duration-200"
                    style={{ 
                      left: state.rudderAngle < 0 ? `${50 + (state.rudderAngle / 35) * 50}%` : '50%',
                      right: state.rudderAngle > 0 ? `${50 - (state.rudderAngle / 35) * 50}%` : '50%'
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-400 block mb-2">指令舵角 (Command)</span>
                <div className="flex gap-2">
                  <button onClick={() => setTarget(-35)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">左满舵</button>
                  <button onClick={() => setTarget(-10)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">左10°</button>
                  <button onClick={() => setTarget(0)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm font-bold text-teal-300">正舵</button>
                  <button onClick={() => setTarget(10)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">右10°</button>
                  <button onClick={() => setTarget(35)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">右满舵</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => togglePump(1)}
                  className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-colors ${state.pump1Active ? 'bg-teal-900/50 border border-teal-500 text-teal-400' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}
                >
                  <Settings size={20} className={state.pump1Active ? 'animate-spin-slow' : ''} />
                  1号液压泵
                </button>
                <button 
                  onClick={() => togglePump(2)}
                  className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-colors ${state.pump2Active ? 'bg-teal-900/50 border border-teal-500 text-teal-400' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}
                >
                  <Settings size={20} className={state.pump2Active ? 'animate-spin-slow' : ''} />
                  2号液压泵
                </button>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg flex justify-between items-center">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Activity size={16}/> 系统油压 (Pressure)</span>
                <span className={`font-mono font-bold text-xl ${state.hydraulicPressure > 150 ? 'text-red-400' : state.hydraulicPressure < 50 ? 'text-yellow-400' : 'text-teal-400'}`}>
                  {state.hydraulicPressure.toFixed(0)} bar
                </span>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="故障注入与排查">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setFaultType('none')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'none' ? 'bg-teal-900/50 border-teal-500 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  系统正常
                </button>
                <button 
                  onClick={() => setFaultType('filter_clogged')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'filter_clogged' ? 'bg-orange-900/50 border-orange-500 text-orange-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  液压油滤器堵塞 (转舵慢)
                </button>
                <button 
                  onClick={() => setFaultType('oil_leak')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'oil_leak' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  管路严重漏油 (失舵危险)
                </button>
              </div>

              {faultType === 'filter_clogged' && (
                <div className="p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg text-sm text-orange-200">
                  <strong>现象：</strong>操舵时舵叶转动缓慢（跑舵时间长），系统油压异常升高，滤器压差报警。
                  <br/><strong>原因：</strong>液压油变质或杂质过多堵塞滤芯，导致流量受限。
                  <button onClick={cleanFilter} className="mt-3 w-full py-2 bg-orange-800 hover:bg-orange-700 text-white rounded transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> 清洗/更换滤芯
                  </button>
                </div>
              )}

              {faultType === 'oil_leak' && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200">
                  <strong>现象：</strong>油箱液位持续下降，系统油压降低。当液位过低时，油泵吸空，彻底失去转舵能力（失舵）。
                  <br/><strong>原因：</strong>高压管路破裂或油缸密封件严重损坏。
                  <button onClick={repairLeak} className="mt-3 w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-2">
                    <Anchor size={16} /> 修复漏点并补油
                  </button>
                </div>
              )}
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-teal-400 mb-1">舵机液压执行机构透视</h3>
            <p className="text-slate-400">
              观察液压缸推动舵柄转动舵杆的过程。<br/>
              绿色方块为液压泵，灰色圆柱为滤器。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
