import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/LubeSystemValveUnblockingDrill/ThreeScene';
import { LubeValveState } from '../../../components/Maintenance-Training/LubeSystemValveUnblockingDrill/three-types';
import { Power, Flame, Wrench, AlertTriangle, Droplets, Activity } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[LubeSystemValveUnblockingDrill]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/LubeSystemValveUnblockingDrill';

export default function LubeSystemValveUnblockingDrill() {
  const [state, setState] = useState<LubeValveState>({
    pressure: 0,
    isPumpOn: false,
    valve1Blocked: false,
    valve2Blocked: true, // Initially blocked
    valve3Blocked: false,
    valve1Flow: 0,
    valve2Flow: 0,
    valve3Flow: 0,
    isHeating: false,
    temperature: 25,
    selectedValve: null
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Temperature logic
        if (next.isHeating) {
          next.temperature = Math.min(80, next.temperature + 2); // Heat up to 80C
        } else {
          next.temperature = Math.max(25, next.temperature - 0.5); // Cool down to 25C
        }

        // Pressure logic
        if (next.isPumpOn) {
          // Base pressure
          let targetPressure = 150; // bar
          
          // Blockages increase pressure
          const blockCount = [next.valve1Blocked, next.valve2Blocked, next.valve3Blocked].filter(Boolean).length;
          targetPressure += blockCount * 50;

          // Heat reduces viscosity, slightly lowering pressure
          targetPressure -= (next.temperature - 25) * 0.5;

          next.pressure = next.pressure + (targetPressure - next.pressure) * 0.2;
        } else {
          next.pressure = Math.max(0, next.pressure - 10);
        }

        // Flow logic
        const calculateFlow = (isBlocked: boolean) => {
          if (!next.isPumpOn) return 0;
          if (isBlocked) {
            // Slight flow if heated and high pressure, simulating slow unblocking
            if (next.temperature > 60 && next.pressure > 200) {
              return 10;
            }
            return 0;
          }
          // Normal flow depends on pressure and temp
          return Math.min(100, (next.pressure / 150) * 50 + (next.temperature / 80) * 50);
        };

        next.valve1Flow = calculateFlow(next.valve1Blocked);
        next.valve2Flow = calculateFlow(next.valve2Blocked);
        next.valve3Flow = calculateFlow(next.valve3Blocked);

        // Auto-unblock if heated and high pressure applied for a while (simulated by random chance here for simplicity, but tied to conditions)
        if (next.valve2Blocked && next.temperature > 70 && next.pressure > 220 && Math.random() > 0.8) {
           next.valve2Blocked = false;
        }

        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const togglePump = () => setState(prev => ({ ...prev, isPumpOn: !prev.isPumpOn }));
  const toggleHeat = () => setState(prev => ({ ...prev, isHeating: !prev.isHeating }));
  
  const selectValve = (id: number) => setState(prev => ({ ...prev, selectedValve: prev.selectedValve === id ? null : id }));

  const manualClean = () => {
    if (state.selectedValve && !state.isPumpOn) {
      setState(prev => {
        const next = { ...prev };
        if (next.selectedValve === 1) next.valve1Blocked = false;
        if (next.selectedValve === 2) next.valve2Blocked = false;
        if (next.selectedValve === 3) next.valve3Blocked = false;
        return next;
      });
    }
  };

  const injectFault = () => {
    setState(prev => ({ ...prev, valve2Blocked: true, valve3Blocked: Math.random() > 0.5 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-yellow-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">集中润滑系统分配阀堵塞疏通演练</h1>
          <p className="text-sm text-slate-400 mt-1">Centralized Lubrication System Valve Unblocking Drill</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg border bg-slate-900/50 border-slate-600 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            系统压力: <span className="font-mono text-blue-400">{state.pressure.toFixed(0)} bar</span>
          </div>
          <div className="px-4 py-2 rounded-lg border bg-slate-900/50 border-slate-600 flex items-center gap-2">
            <Flame size={18} className={state.isHeating ? "text-red-500" : "text-slate-500"} />
            油温: <span className="font-mono text-red-400">{state.temperature.toFixed(1)} °C</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="系统控制" highlight>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={togglePump}
                className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-colors ${state.isPumpOn ? 'bg-green-900/50 border border-green-500 text-green-400' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}
              >
                <Power size={24} />
                {state.isPumpOn ? '润滑泵运行中' : '启动润滑泵'}
              </button>
              
              <button 
                onClick={toggleHeat}
                className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-colors ${state.isHeating ? 'bg-red-900/50 border border-red-500 text-red-400' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}
              >
                <Flame size={24} />
                {state.isHeating ? '加热器开启' : '开启加热器'}
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="分配阀状态与操作">
            <div className="space-y-4">
              {[
                { id: 1, blocked: state.valve1Blocked, flow: state.valve1Flow },
                { id: 2, blocked: state.valve2Blocked, flow: state.valve2Flow },
                { id: 3, blocked: state.valve3Blocked, flow: state.valve3Flow }
              ].map(valve => (
                <div 
                  key={valve.id}
                  onClick={() => selectValve(valve.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                    state.selectedValve === valve.id ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${valve.blocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="font-bold">分配阀 #{valve.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={valve.blocked ? 'text-red-400' : 'text-green-400'}>
                      {valve.blocked ? '堵塞' : '正常'}
                    </span>
                    <span className="font-mono text-yellow-400 w-16 text-right">
                      {valve.flow.toFixed(0)}% 流速
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-700">
                <button 
                  onClick={manualClean}
                  disabled={!state.selectedValve || state.isPumpOn}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 rounded-lg flex items-center justify-center gap-2 text-slate-300"
                >
                  <Wrench size={18} />
                  人工拆洗疏通 (需停泵)
                </button>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  提示：轻微堵塞可通过加热降低油脂粘度，并利用泵压冲开。严重堵塞需停泵人工拆洗。
                </p>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="故障模拟">
            <button 
              onClick={injectFault}
              className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-center gap-2"
            >
              <AlertTriangle size={18} />
              注入堵塞故障
            </button>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-yellow-400 mb-1">润滑分配器透视</h3>
            <p className="text-slate-400">
              黄色粒子代表润滑脂流动。<br/>
              红色阀体表示发生堵塞。<br/>
              底部红色条带代表加热器工作状态。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
