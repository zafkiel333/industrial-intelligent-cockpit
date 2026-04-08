import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineGeneratorReversePowerSim/ThreeScene';
import { ReversePowerState } from '../../../components/Maintenance-Training/MarineGeneratorReversePowerSim/three-types';
import { Zap, AlertTriangle, ShieldAlert, PowerOff, ShieldCheck } from 'lucide-react';

export default function MarineGeneratorReversePowerSim() {
  const [state, setState] = useState<ReversePowerState>({
    activePower: 800, // kW
    breakerClosed: true,
    fuelInput: 80, // %
    tripTime: 0
  });

  const [tripTimer, setTripTimer] = useState<number | null>(null);

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.breakerClosed) {
      interval = setInterval(() => {
        setState(prev => {
          // Power is proportional to fuel input (simplified)
          // 0 fuel = -200kW (motoring), 100 fuel = 1000kW
          const targetPower = (prev.fuelInput / 100) * 1200 - 200;
          
          let newPower = prev.activePower;
          if (newPower < targetPower) newPower += 10;
          if (newPower > targetPower) newPower -= 10;

          // Reverse power protection logic (Trip at -80kW for 5 seconds)
          let newTripTime = prev.tripTime;
          let newBreaker = prev.breakerClosed;

          if (newPower <= -80) {
            newTripTime += 0.5; // Increment by interval (500ms)
            if (newTripTime >= 5) {
              newBreaker = false; // TRIP!
              newTripTime = 0;
            }
          } else {
            newTripTime = 0; // Reset if power recovers
          }

          return { ...prev, activePower: newPower, tripTime: newTripTime, breakerClosed: newBreaker };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state.breakerClosed]);

  const adjustFuel = (amount: number) => {
    setState(prev => ({
      ...prev,
      fuelInput: Math.max(0, Math.min(100, prev.fuelInput + amount))
    }));
  };

  const resetBreaker = () => {
    setState(prev => ({
      ...prev,
      breakerClosed: true,
      fuelInput: 80, // Reset fuel to normal
      activePower: 800,
      tripTime: 0
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-green-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-green-400 tracking-wider">船舶电站发电机逆功率保护测试模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Generator Reverse Power Protection Test</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.breakerClosed ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400 animate-pulse'}`}>
            {state.breakerClosed ? <ShieldCheck size={18} /> : <PowerOff size={18} />}
            主开关状态: {state.breakerClosed ? '闭合 (并网运行)' : '跳闸断开 (TRIP)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="发电机控制面板" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Zap size={16}/> 有功功率 (Active Power)</span>
                  <span className={`font-mono font-bold text-2xl ${state.activePower < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.activePower.toFixed(0)} kW
                  </span>
                </div>
                {/* Zero-centered progress bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden mt-4">
                  <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-slate-500 z-10"></div> {/* Zero line */}
                  <div 
                    className={`absolute top-0 bottom-0 transition-all duration-300 ${state.activePower < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ 
                      left: state.activePower < 0 ? `${20 + (state.activePower / 1000) * 80}%` : '20%',
                      right: state.activePower > 0 ? `${80 - (state.activePower / 1000) * 80}%` : '80%'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>-200kW (逆功)</span>
                  <span>0</span>
                  <span>1000kW (正功)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">原动机油门给定 (Fuel Input)</span>
                  <span className="text-green-400 font-mono">{state.fuelInput}%</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => adjustFuel(-10)} disabled={!state.breakerClosed} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors disabled:opacity-30">减小油门 (-10%)</button>
                  <button onClick={() => adjustFuel(10)} disabled={!state.breakerClosed} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors disabled:opacity-30">增大油门 (+10%)</button>
                </div>
                <p className="text-xs text-slate-500 mt-2">提示：减小油门模拟原动机失去动力，导致发电机变为电动机运行（逆功率）。</p>
              </div>

              {state.tripTime > 0 && state.breakerClosed && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="animate-pulse" />
                    <span>逆功率延时保护中...</span>
                  </div>
                  <span className="font-mono font-bold text-lg">{state.tripTime.toFixed(1)}s / 5.0s</span>
                </div>
              )}

              {!state.breakerClosed && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">逆功率保护动作 (Reverse Power Trip)</strong>
                      <p className="text-sm">发电机吸收电网有功功率超过设定值（-80kW）并持续5秒，主开关已自动跳闸，保护原动机免受拖动损坏。</p>
                    </div>
                  </div>
                  <button onClick={resetBreaker} className="py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                    复位保护并重新并网
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="逆功率保护原理">
            <ul className="space-y-2 text-sm text-slate-300">
              <li>1. <strong>定义：</strong>当并联运行的发电机失去原动力（如柴油机断油）时，发电机将作为同步电动机从电网吸收有功功率，拖动原动机旋转。</li>
              <li>2. <strong>危害：</strong>逆功率运行不仅消耗电网功率，还可能导致柴油机气缸干摩擦损坏或汽轮机叶片过热。</li>
              <li>3. <strong>整定值：</strong>柴油发电机逆功率整定值通常为额定功率的 8% ~ 15%，延时 3 ~ 10 秒。</li>
              <li>4. <strong>测试方法：</strong>在并网状态下，手动减小待测机组的油门（或调速器设定），观察功率表反向偏转，直至主开关跳闸，记录动作功率和延时时间。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-green-400 mb-1">发电机与主开关透视</h3>
            <p className="text-slate-400">
              绿色粒子向外流动表示发电机向电网输出正功。<br/>
              红色粒子向内流动表示发电机从电网吸收逆功（电动机状态）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
