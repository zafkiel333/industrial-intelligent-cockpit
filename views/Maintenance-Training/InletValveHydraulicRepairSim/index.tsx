import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/InletValveHydraulicRepairSim/ThreeScene';
import { HydraulicState } from '../../../components/Maintenance-Training/InletValveHydraulicRepairSim/three-types';
import { Wrench, Droplet, Gauge, Power } from 'lucide-react';

export default function InletValveHydraulicRepairSim() {
  const [state, setState] = useState<HydraulicState>({
    pressure: 16.0,
    valveOpen: true,
    leakActive: false,
    oilLevel: 85
  });

  const [pumpActive, setPumpActive] = useState(true);

  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
      setState(prev => {
        let newPressure = prev.pressure;
        let newOilLevel = prev.oilLevel;

        if (prev.leakActive) {
          newPressure = Math.max(0, prev.pressure - 0.5);
          newOilLevel = Math.max(0, prev.oilLevel - 1);
        } else if (pumpActive && prev.pressure < 16.0) {
          newPressure = Math.min(16.0, prev.pressure + 0.2);
        }

        return {
          ...prev,
          pressure: newPressure,
          oilLevel: newOilLevel
        };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [pumpActive, state.leakActive]);

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-teal-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">进水蝶阀液压系统检修演练</h1>
          <p className="text-sm text-slate-400 mt-1">Inlet Butterfly Valve Hydraulic System Repair</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setState(p => ({...p, leakActive: !p.leakActive}))}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.leakActive ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-teal-500'}`}
          >
            <Droplet size={18} />
            {state.leakActive ? '封堵漏油点' : '模拟密封失效漏油'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="液压站控制" highlight>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPumpActive(!pumpActive)}
                  className={`py-3 rounded border flex items-center justify-center gap-2 transition-all ${pumpActive ? 'bg-teal-900/50 border-teal-500 text-teal-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                >
                  <Power size={18} />
                  {pumpActive ? '油泵运行中' : '启动油泵'}
                </button>
                <button 
                  onClick={() => setState(p => ({...p, valveOpen: !p.valveOpen}))}
                  className="py-3 rounded border bg-slate-800 border-slate-600 hover:border-teal-500 transition-all flex items-center justify-center gap-2"
                >
                  <Wrench size={18} />
                  {state.valveOpen ? '执行关阀' : '执行开阀'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Gauge size={16}/> 系统油压</span>
                  <span className={`font-mono text-xl ${state.pressure < 10 ? 'text-red-400' : 'text-teal-400'}`}>
                    {state.pressure.toFixed(1)} MPa
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${state.pressure < 10 ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${(state.pressure / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Droplet size={16}/> 油箱液位</span>
                  <span className={`font-mono text-xl ${state.oilLevel < 30 ? 'text-red-400' : 'text-blue-400'}`}>
                    {state.oilLevel.toFixed(0)} %
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${state.oilLevel < 30 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${state.oilLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="检修指导">
            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-teal-400 font-bold">常见故障：接力器密封漏油</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>发现油压异常下降或油箱液位降低时，首先检查管路及接力器密封。</li>
                <li>确认漏油点后，<span className="text-red-400">必须先停泵并泄压</span>，方可进行拆卸作业。</li>
                <li>更换密封圈时，注意检查活塞杆表面是否有划伤。</li>
                <li>更换完毕后，启动油泵打压，保压测试 30 分钟无渗漏为合格。</li>
              </ol>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-2 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
        </div>
      </div>
    </div>
  );
}
