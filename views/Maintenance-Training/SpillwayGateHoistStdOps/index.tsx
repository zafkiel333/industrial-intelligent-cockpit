import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/SpillwayGateHoistStdOps/ThreeScene';
import { HoistState } from '../../../components/Maintenance-Training/SpillwayGateHoistStdOps/three-types';
import { ArrowUpCircle, ArrowDownCircle, StopCircle, Thermometer } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[SpillwayGateHoistStdOps]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/SpillwayGateHoistStdOps';

export default function SpillwayGateHoistStdOps() {
  const [state, setState] = useState<HoistState>({
    gateOpening: 0,
    motorTemp: 35,
    isOperating: false,
    direction: 'stop'
  });

  useEffect(() => {
    let interval: any;
    if (state.isOperating) {
      interval = setInterval(() => {
        setState(prev => {
          let newOpening = prev.gateOpening;
          if (prev.direction === 'up' && prev.gateOpening < 100) {
            newOpening += 1;
          } else if (prev.direction === 'down' && prev.gateOpening > 0) {
            newOpening -= 1;
          }

          // Stop automatically at limits
          const shouldStop = (prev.direction === 'up' && newOpening >= 100) || 
                             (prev.direction === 'down' && newOpening <= 0);

          return {
            ...prev,
            gateOpening: newOpening,
            motorTemp: Math.min(85, prev.motorTemp + 0.5),
            isOperating: !shouldStop,
            direction: shouldStop ? 'stop' : prev.direction
          };
        });
      }, 100);
    } else {
      // Cool down
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          motorTemp: Math.max(35, prev.motorTemp - 0.2)
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state.isOperating, state.direction]);

  const handleOperate = (dir: 'up' | 'down' | 'stop') => {
    setState(prev => ({
      ...prev,
      isOperating: dir !== 'stop',
      direction: dir
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">溢洪道闸门启闭机维护标准作业</h1>
          <p className="text-sm text-slate-400 mt-1">Spillway Gate Hoist Standard Operations</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="启闭机操作台" highlight>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => handleOperate('up')}
                  disabled={state.gateOpening >= 100}
                  className={`py-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${state.direction === 'up' ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-indigo-500 disabled:opacity-50'}`}
                >
                  <ArrowUpCircle size={24} />
                  <span>起门</span>
                </button>
                <button 
                  onClick={() => handleOperate('stop')}
                  className={`py-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${state.direction === 'stop' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-red-500'}`}
                >
                  <StopCircle size={24} />
                  <span>停止</span>
                </button>
                <button 
                  onClick={() => handleOperate('down')}
                  disabled={state.gateOpening <= 0}
                  className={`py-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${state.direction === 'down' ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-indigo-500 disabled:opacity-50'}`}
                >
                  <ArrowDownCircle size={24} />
                  <span>落门</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">闸门开度</span>
                  <span className="font-mono text-2xl text-indigo-400">{state.gateOpening.toFixed(1)} %</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-100"
                    style={{ width: `${state.gateOpening}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={16}/> 电机温度</span>
                  <span className={`font-mono text-xl ${state.motorTemp > 75 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.motorTemp.toFixed(1)} °C
                  </span>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="维护检查要点">
            <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside">
              <li>检查钢丝绳是否有断丝、磨损、锈蚀，排列是否整齐。</li>
              <li>检查减速箱油位是否正常，有无漏油现象。</li>
              <li>运行中监听电机、减速箱是否有异常噪音。</li>
              <li>检查制动器抱闸间隙是否符合标准，制动是否可靠。</li>
              <li><span className="text-red-400">注意：</span>电机温度超过 80°C 时应立即停机检查。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-2 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
}
