import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ReeferCompressorValveRepairDrill/ThreeScene';
import { ReeferState } from '../../../components/Maintenance-Training/ReeferCompressorValveRepairDrill/three-types';
import { Gauge, Power, Wrench, AlertTriangle, Thermometer, Wind } from 'lucide-react';

export default function ReeferCompressorValveRepairDrill() {
  const [state, setState] = useState<ReeferState>({
    suctionPressure: 30, // Normal ~20-40 psi
    dischargePressure: 150, // Normal ~150-250 psi
    compressorRunning: false,
    valvePlateIntact: false, // Start with a fault
    refrigerantLevel: 80,
    temperature: -18, // Target temp
    powerSupply: true,
    isLeaking: false
  });

  // Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.compressorRunning && state.powerSupply) {
      interval = setInterval(() => {
        setState(prev => {
          let newSuction = prev.suctionPressure;
          let newDischarge = prev.dischargePressure;
          let newTemp = prev.temperature;

          if (prev.valvePlateIntact) {
            // Normal operation: pull down suction, push up discharge, cool down
            newSuction = Math.max(20, prev.suctionPressure - 1);
            newDischarge = Math.min(200, prev.dischargePressure + 2);
            newTemp = Math.max(-25, prev.temperature - 0.5);
          } else {
            // Faulty valve plate: pressures equalize, no cooling
            // High suction, low discharge
            if (newSuction < 60) newSuction += 2;
            if (newDischarge > 100) newDischarge -= 2;
            // Temp rises slowly due to lack of cooling
            newTemp = Math.min(20, prev.temperature + 0.2);
          }

          return { 
            ...prev, 
            suctionPressure: newSuction,
            dischargePressure: newDischarge,
            temperature: newTemp
          };
        });
      }, 500);
    } else {
      // Stopped: Pressures slowly equalize, temp rises
      interval = setInterval(() => {
        setState(prev => {
          let newSuction = prev.suctionPressure;
          let newDischarge = prev.dischargePressure;
          
          if (newSuction < 80) newSuction += 1;
          if (newDischarge > 80) newDischarge -= 1;

          return {
            ...prev,
            suctionPressure: newSuction,
            dischargePressure: newDischarge,
            temperature: Math.min(20, prev.temperature + 0.1)
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.compressorRunning, state.powerSupply, state.valvePlateIntact]);

  const togglePower = () => {
    setState(prev => ({ ...prev, powerSupply: !prev.powerSupply, compressorRunning: false }));
  };

  const toggleCompressor = () => {
    if (!state.powerSupply) return;
    setState(prev => ({ ...prev, compressorRunning: !prev.compressorRunning }));
  };

  const repairValvePlate = () => {
    if (state.compressorRunning) {
      alert("必须先停机并切断电源才能进行维修！");
      return;
    }
    if (state.powerSupply) {
      alert("警告：带电维修极度危险！请先切断主电源。");
      return;
    }
    // Simulate repair process
    setState(prev => ({ ...prev, isLeaking: true })); // Briefly leak while opening
    setTimeout(() => {
      setState(prev => ({ ...prev, valvePlateIntact: true, isLeaking: false }));
      alert("阀板更换完成！");
    }, 2000);
  };

  const breakValvePlate = () => {
    setState(prev => ({ ...prev, valvePlateIntact: false }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">船舶冷藏集装箱压缩机阀板检修演练</h1>
          <p className="text-sm text-slate-400 mt-1">Reefer Container Compressor Valve Plate Repair Drill</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${!state.valvePlateIntact ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <AlertTriangle size={18} />
            阀板状态: {!state.valvePlateIntact ? '破损 (BROKEN)' : '正常 (INTACT)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="运行参数监控" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">主电源 (Main Power)</span>
                <button 
                  onClick={togglePower}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${state.powerSupply ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}
                >
                  <Power size={16} /> {state.powerSupply ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">压缩机启停 (Compressor)</span>
                <button 
                  onClick={toggleCompressor}
                  disabled={!state.powerSupply}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${state.compressorRunning ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}
                >
                  <Wind size={16} /> {state.compressorRunning ? 'RUNNING' : 'STOPPED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">吸气压力 (Suction)</span>
                  <span className={`font-mono text-xl ${state.suctionPressure > 50 && state.compressorRunning ? 'text-red-400' : 'text-blue-400'}`}>
                    {state.suctionPressure.toFixed(1)} psi
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">正常: 20-40 psi</p>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">排气压力 (Discharge)</span>
                  <span className={`font-mono text-xl ${state.dischargePressure < 120 && state.compressorRunning ? 'text-red-400' : 'text-red-500'}`}>
                    {state.dischargePressure.toFixed(1)} psi
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">正常: 150-250 psi</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={14}/> 箱内温度 (Box Temp)</span>
                  <span className={`font-mono text-xl ${state.temperature > -10 ? 'text-orange-400' : 'text-indigo-400'}`}>
                    {state.temperature.toFixed(1)}°C
                  </span>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="故障诊断与维修">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>故障现象：</strong>压缩机运转不停，但箱温降不下来。高低压表显示：吸气压力偏高，排气压力偏低。</p>
                <p><strong>诊断：</strong>极可能是压缩机阀板（吸/排气阀片）破损或积碳导致高低压串气。</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={repairValvePlate}
                  disabled={state.valvePlateIntact}
                  className="py-3 bg-green-900/50 hover:bg-green-800/50 disabled:opacity-50 border border-green-500 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-green-400"
                >
                  <Wrench size={20} />
                  <span className="font-bold text-sm">更换阀板总成</span>
                </button>
                
                <button 
                  onClick={breakValvePlate}
                  disabled={!state.valvePlateIntact}
                  className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-slate-300"
                >
                  <AlertTriangle size={20} />
                  <span className="font-bold text-sm">注入阀板故障</span>
                </button>
              </div>

              {!state.valvePlateIntact && state.compressorRunning && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200">
                  <strong>警告：</strong>检测到高低压串气！请立即停机检修，否则可能导致压缩机过热烧毁。
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-1">压缩机内部透视</h3>
            <p className="text-slate-400">
              灰色圆柱体为压缩机气缸体，顶部深色部分为气缸盖。<br/>
              两者之间的夹层即为阀板（Valve Plate）。<br/>
              当阀板破损时（变红），活塞压缩的气体会在高低压腔之间泄漏，导致制冷失效。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
