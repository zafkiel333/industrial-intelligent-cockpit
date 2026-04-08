import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineBoilerBurnerIgnitionFailure/ThreeScene';
import { BoilerState } from '../../../components/Maintenance-Training/MarineBoilerBurnerIgnitionFailure/three-types';
import { Flame, Wind, Droplets, AlertOctagon, RefreshCw, Power } from 'lucide-react';

export default function MarineBoilerBurnerIgnitionFailure() {
  const [state, setState] = useState<BoilerState>({
    waterLevel: 60,
    burnerStatus: 'off',
    steamPressure: 2.5,
    flameSensor: false,
    fuelValve: false,
    airFan: false
  });

  const [faultType, setFaultType] = useState<'none' | 'dirty_sensor' | 'no_fuel' | 'ignition_electrode'>('none');
  const [sequenceTimer, setSequenceTimer] = useState<number>(0);

  // Boiler Control Sequence Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (state.burnerStatus !== 'off' && state.burnerStatus !== 'lockout') {
      timer = setInterval(() => {
        setSequenceTimer(prev => prev + 1);
      }, 1000);
    } else {
      setSequenceTimer(0);
    }

    return () => clearInterval(timer);
  }, [state.burnerStatus]);

  useEffect(() => {
    // Sequence Logic based on timer
    if (state.burnerStatus === 'purge' && sequenceTimer >= 5) {
      // End of purge, start ignition
      setState(prev => ({ ...prev, burnerStatus: 'ignition', fuelValve: true }));
    } else if (state.burnerStatus === 'ignition' && sequenceTimer >= 8) {
      // Ignition period over, check flame
      if (faultType === 'no_fuel' || faultType === 'ignition_electrode') {
        // Failed to ignite
        setState(prev => ({ ...prev, burnerStatus: 'lockout', fuelValve: false, airFan: false, flameSensor: false }));
      } else {
        // Ignited successfully (or simulated success before sensor failure)
        setState(prev => ({ ...prev, burnerStatus: 'firing' }));
      }
    } else if (state.burnerStatus === 'firing') {
      // While firing, check sensor
      if (faultType === 'dirty_sensor') {
        // Sensor fails to detect existing flame after a short delay
        if (sequenceTimer >= 12) {
           setState(prev => ({ ...prev, burnerStatus: 'lockout', fuelValve: false, airFan: false, flameSensor: false }));
        } else {
           setState(prev => ({ ...prev, flameSensor: true })); // Briefly detects it
        }
      } else {
        setState(prev => ({ ...prev, flameSensor: true, steamPressure: Math.min(7.0, prev.steamPressure + 0.1) }));
      }
    }
  }, [sequenceTimer, state.burnerStatus, faultType]);


  const startBoiler = () => {
    if (state.waterLevel < 30) {
      alert("水位过低，禁止启动！");
      return;
    }
    setState(prev => ({ ...prev, burnerStatus: 'purge', airFan: true, flameSensor: false, fuelValve: false }));
    setSequenceTimer(0);
  };

  const stopBoiler = () => {
    setState(prev => ({ ...prev, burnerStatus: 'off', airFan: false, fuelValve: false, flameSensor: false }));
    setSequenceTimer(0);
  };

  const resetLockout = () => {
    setState(prev => ({ ...prev, burnerStatus: 'off', airFan: false, fuelValve: false, flameSensor: false }));
    setSequenceTimer(0);
  };

  const cleanSensor = () => {
    if (faultType === 'dirty_sensor') {
      setFaultType('none');
      alert("火焰探测器(光敏电阻)已清洁。");
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">船用辅锅炉点火失败故障排查</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Auxiliary Boiler Ignition Failure Diagnosis</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
            state.burnerStatus === 'firing' ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 
            state.burnerStatus === 'lockout' ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' :
            'bg-slate-800 border-slate-600 text-slate-400'
          }`}>
            {state.burnerStatus === 'lockout' ? <AlertOctagon size={18} /> : <Flame size={18} />}
            状态: {state.burnerStatus.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="锅炉控制与状态" highlight>
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Droplets size={16}/> 锅筒水位</span>
                  <div className="text-xl font-mono text-blue-400 mt-1">{state.waterLevel}%</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Wind size={16}/> 蒸汽压力</span>
                  <div className="text-xl font-mono text-indigo-400 mt-1">{state.steamPressure.toFixed(1)} bar</div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                <h3 className="font-bold text-sm text-indigo-300 border-b border-slate-700 pb-2">燃烧程序控制 (Sequence)</h3>
                <div className="flex justify-between text-sm">
                  <span className={state.airFan ? 'text-green-400' : 'text-slate-500'}>1. 预扫风 (Purge)</span>
                  <span className={state.burnerStatus === 'ignition' ? 'text-yellow-400' : 'text-slate-500'}>2. 高压点火 (Ignition)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={state.fuelValve ? 'text-orange-400' : 'text-slate-500'}>3. 燃油电磁阀开 (Fuel)</span>
                  <span className={state.flameSensor ? 'text-green-400' : 'text-slate-500'}>4. 火焰检测 (Flame)</span>
                </div>
                {state.burnerStatus !== 'off' && state.burnerStatus !== 'lockout' && (
                  <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(sequenceTimer / 15) * 100}%` }}></div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={startBoiler} 
                  disabled={state.burnerStatus !== 'off'}
                  className="flex-1 py-3 bg-green-900/50 hover:bg-green-800/50 border border-green-500 rounded-lg text-green-400 font-bold transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <Power size={18} /> 启动燃烧器
                </button>
                <button 
                  onClick={stopBoiler}
                  disabled={state.burnerStatus === 'off' || state.burnerStatus === 'lockout'}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-30"
                >
                  手动停止
                </button>
              </div>

              {state.burnerStatus === 'lockout' && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <AlertOctagon size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">点火失败 / 熄火保护 (LOCKOUT)</strong>
                      <p className="text-sm">燃烧器程序控制器检测到异常，已切断燃油并锁定。请排查故障后复位。</p>
                    </div>
                  </div>
                  <button onClick={resetLockout} className="py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> 复位控制器 (Reset)
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="故障注入与排查">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setFaultType('none')}
                  className={`py-2 text-sm rounded border ${faultType === 'none' ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  系统正常
                </button>
                <button 
                  onClick={() => setFaultType('dirty_sensor')}
                  className={`py-2 text-sm rounded border ${faultType === 'dirty_sensor' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  光敏电阻脏污
                </button>
                <button 
                  onClick={() => setFaultType('no_fuel')}
                  className={`py-2 text-sm rounded border ${faultType === 'no_fuel' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  燃油滤器堵塞
                </button>
                <button 
                  onClick={() => setFaultType('ignition_electrode')}
                  className={`py-2 text-sm rounded border ${faultType === 'ignition_electrode' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  点火电极积碳短路
                </button>
              </div>

              {faultType === 'dirty_sensor' && (
                <div className="p-3 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-slate-300">
                  <p className="mb-2"><strong>现象：</strong>点火能成功（能看到火），但几秒后控制器报熄火故障并锁定。</p>
                  <p className="mb-3"><strong>原因：</strong>火焰探测器（光敏电阻）表面被烟灰覆盖，无法感知火焰的光信号，误认为未点火。</p>
                  <button onClick={cleanSensor} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
                    抽出并擦拭光敏电阻
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
            <h3 className="font-bold text-indigo-400 mb-1">辅锅炉炉膛透视</h3>
            <p className="text-slate-400">
              观察点火电极打火、燃油喷射及火焰形成过程。<br/>
              右侧蓝色区域为锅筒内的炉水。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
