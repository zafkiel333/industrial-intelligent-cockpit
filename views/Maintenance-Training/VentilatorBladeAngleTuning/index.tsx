import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/VentilatorBladeAngleTuning/ThreeScene';
import { VentilatorState } from '../../../components/Maintenance-Training/VentilatorBladeAngleTuning/three-types';
import { Wind, Power, Settings2, AlertTriangle } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[VentilatorBladeAngleTuning]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/VentilatorBladeAngleTuning';

export default function VentilatorBladeAngleTuning() {
  const [state, setState] = useState<VentilatorState>({
    bladeAngle: 0,
    airflow: 50,
    isRunning: false
  });

  // Calculate airflow based on angle
  useEffect(() => {
    if (state.isRunning) {
      // Base airflow is 50 at 0 degrees. Range is -15 to +15.
      // -15 deg -> 20 airflow, +15 deg -> 80 airflow
      const calculatedFlow = 50 + (state.bladeAngle * 2);
      setState(prev => ({ ...prev, airflow: calculatedFlow }));
    } else {
      setState(prev => ({ ...prev, airflow: 0 }));
    }
  }, [state.bladeAngle, state.isRunning]);

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.isRunning) return; // Cannot adjust while running
    setState(prev => ({ ...prev, bladeAngle: parseInt(e.target.value) }));
  };

  const togglePower = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-sky-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-400 tracking-wider">矿井主通风机叶片角度调整实训</h1>
          <p className="text-sm text-slate-400 mt-1">Mine Main Ventilator Blade Angle Adjustment Training</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Power size={18} />
            状态: {state.isRunning ? '运转中' : '停机 (可调)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="调节控制台" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Wind size={16} /> 实时风量估算
                  </span>
                  <span className="text-2xl font-mono font-bold text-sky-400">
                    {state.airflow} m³/s
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${state.airflow}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Settings2 size={16} /> 叶片安装角偏移
                  </span>
                  <span className={`font-mono ${state.isRunning ? 'text-slate-500' : 'text-yellow-400'}`}>
                    {state.bladeAngle > 0 ? '+' : ''}{state.bladeAngle}°
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-15" 
                  max="15" 
                  step="1"
                  value={state.bladeAngle}
                  onChange={handleAngleChange}
                  disabled={state.isRunning}
                  className="w-full accent-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>-15° (小风量)</span>
                  <span>0° (基准)</span>
                  <span>+15° (大风量)</span>
                </div>
              </div>

              <button 
                onClick={togglePower}
                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                  state.isRunning 
                    ? 'bg-red-900/50 hover:bg-red-800/50 border-red-500 text-red-400' 
                    : 'bg-green-900/50 hover:bg-green-800/50 border-green-500 text-green-400'
                }`}
              >
                <Power size={18} />
                {state.isRunning ? '紧急停机' : '启动风机测试'}
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="操作规程">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2 text-red-400"><AlertTriangle size={16} className="shrink-0"/> <strong className="font-bold">安全红线：</strong>严禁在风机运转时调整叶片角度！必须停机、断电、挂牌。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">1.</span> 根据矿井通风网络阻力变化和需风量要求，计算所需叶片角度。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">2.</span> 松开叶片根部紧固螺母，使用专用工具旋转叶片至刻度线。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">3.</span> <strong className="text-yellow-400">关键点：</strong>所有叶片的安装角度必须保持一致，误差不得超过 ±0.5°，否则会导致转子动平衡破坏，引起剧烈振动。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">4.</span> 紧固螺母，盘车检查无卡阻后，方可启动试运行。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-sky-400 mb-1">3D 视图说明</h3>
            <p className="text-slate-400">观察叶片角度变化对气流（白色粒子）的影响</p>
          </div>
        </div>
      </div>
    </div>
  );
}
