import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/HydraulicSupportLeakSim/ThreeScene';
import { SupportState } from '../../../components/Maintenance-Training/HydraulicSupportLeakSim/three-types';
import { Gauge, Droplets, Eye, Wrench, AlertTriangle } from 'lucide-react';

export default function HydraulicSupportLeakSim() {
  const [state, setState] = useState<SupportState>({
    pressure: 31.5, // Normal working pressure
    leaking: false,
    crossSection: false
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.leaking) {
      interval = setInterval(() => {
        setState(prev => {
          const newPressure = Math.max(0, prev.pressure - 0.5);
          if (newPressure < 20 && prev.pressure >= 20) {
            addLog("⚠️ 警告: 立柱压力低于安全阈值 (20 MPa)");
          }
          return { ...prev, pressure: newPressure };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.leaking]);

  const triggerLeak = () => {
    setState(prev => ({ ...prev, leaking: true }));
    addLog("🔴 故障注入: 活塞密封圈损坏，发生窜液");
  };

  const repairSeal = () => {
    setState(prev => ({ ...prev, leaking: false, pressure: 31.5 }));
    addLog("✅ 维修完成: 密封圈已更换，系统重新建压至 31.5 MPa");
  };

  const toggleView = () => {
    setState(prev => ({ ...prev, crossSection: !prev.crossSection }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">液压支架立柱窜液故障排查模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Hydraulic Roof Support Cylinder Internal Leakage Simulation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={triggerLeak}
            disabled={state.leaking}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle size={16} />
            模拟窜液故障
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Gauges & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="立柱压力监测 (Pressure Monitor)" highlight>
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-slate-700 rounded-full aspect-square relative mx-auto w-48">
              <Gauge size={32} className={state.pressure < 20 ? 'text-red-500' : 'text-indigo-400'} />
              <div className={`text-4xl font-mono font-bold mt-2 ${state.pressure < 20 ? 'text-red-400' : 'text-slate-200'}`}>
                {state.pressure.toFixed(1)}
              </div>
              <div className="text-sm text-slate-400 mt-1">MPa</div>
              
              {/* Simple dial indicator */}
              <div 
                className="absolute w-1 h-24 bg-red-500 origin-bottom transition-transform duration-500"
                style={{ 
                  bottom: '50%', 
                  transform: `rotate(${(state.pressure / 40) * 270 - 135}deg)` 
                }}
              ></div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">额定工作阻力</span>
                <span className="text-slate-200">31.5 MPa</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">安全阈值</span>
                <span className="text-yellow-400">20.0 MPa</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">当前状态</span>
                <span className={state.leaking ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {state.leaking ? '压力下降 (窜液中)' : '保压正常'}
                </span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="故障排查与维修">
            <div className="space-y-4">
              <button 
                onClick={toggleView}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={18} /> {state.crossSection ? '关闭剖面透视' : '开启剖面透视 (X-Ray)'}
              </button>

              <button 
                onClick={repairSeal}
                disabled={!state.leaking}
                className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500 rounded-lg font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Wrench size={18} />
                更换活塞密封组件
              </button>
            </div>

            <div className="mt-6 bg-black border border-slate-800 rounded-lg p-3 font-mono text-xs h-32 overflow-y-auto">
              <div className="text-slate-500 mb-2">--- 操作日志 ---</div>
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.includes('警告') || log.includes('故障') ? 'text-red-400' : 'text-green-400'}`}>
                  {log}
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs max-w-xs">
            <h3 className="font-bold text-indigo-400 mb-2 flex items-center gap-2"><Droplets size={16}/> 窜液现象说明</h3>
            <p className="text-slate-300 leading-relaxed">
              当立柱活塞密封损坏时，高压腔内的乳化液会越过密封圈泄漏到低压腔，导致立柱无法保持工作阻力，出现自动降柱现象。开启剖面透视可观察内部流体泄漏情况。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
