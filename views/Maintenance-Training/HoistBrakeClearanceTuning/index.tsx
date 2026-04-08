import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/HoistBrakeClearanceTuning/ThreeScene';
import { BrakeState } from '../../../components/Maintenance-Training/HoistBrakeClearanceTuning/three-types';
import { Settings2, Power, Ruler, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HoistBrakeClearanceTuning() {
  const [state, setState] = useState<BrakeState>({
    clearance: 2.5, // Initial out-of-spec clearance
    isBraking: false,
    measuring: false
  });

  // Standard clearance is usually 1.0 - 1.5 mm
  const isOptimal = state.clearance >= 1.0 && state.clearance <= 1.5;

  const handleClearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, clearance: parseFloat(e.target.value) }));
  };

  const toggleBrake = () => {
    setState(prev => ({ ...prev, isBraking: !prev.isBraking, measuring: false }));
  };

  const toggleMeasure = () => {
    if (state.isBraking) {
      alert("制动状态下无法使用塞尺测量间隙！请先松闸。");
      return;
    }
    setState(prev => ({ ...prev, measuring: !prev.measuring }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-emerald-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400 tracking-wider">矿井提升机盘形制动器间隙调校实操</h1>
          <p className="text-sm text-slate-400 mt-1">Mine Hoist Disc Brake Clearance Tuning Operation</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isBraking ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-emerald-900/50 border-emerald-500 text-emerald-400'}`}>
            <Power size={18} />
            状态: {state.isBraking ? '制动抱死 (Braking)' : '松闸运行 (Released)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="精密调校面板 (Precision Tuning)" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Settings2 size={16} /> 闸瓦间隙调节
                  </span>
                  <div className="text-right">
                    <span className={`text-3xl font-mono font-bold ${isOptimal ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {state.clearance.toFixed(2)}
                    </span>
                    <span className="text-slate-500 ml-1">mm</span>
                  </div>
                </div>
                
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.5" 
                  step="0.05"
                  value={state.clearance}
                  onChange={handleClearanceChange}
                  disabled={state.isBraking}
                  className={`w-full ${isOptimal ? 'accent-emerald-500' : 'accent-yellow-500'} disabled:opacity-30`}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>0.5mm (过紧)</span>
                  <span>标准: 1.0-1.5mm</span>
                  <span>2.5mm (过松)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={toggleMeasure}
                  className={`py-3 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                    state.measuring 
                      ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' 
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  <Ruler size={18} />
                  {state.measuring ? '收回塞尺' : '塞尺测量'}
                </button>

                <button 
                  onClick={toggleBrake}
                  className={`py-3 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                    state.isBraking 
                      ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' 
                      : 'bg-red-900/50 hover:bg-red-800 border-red-500 text-red-400'
                  }`}
                >
                  <Power size={18} />
                  {state.isBraking ? '执行松闸' : '执行制动'}
                </button>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                isOptimal 
                  ? 'bg-emerald-900/20 border-emerald-800' 
                  : 'bg-yellow-900/20 border-yellow-800'
              }`}>
                {isOptimal ? <CheckCircle2 className="text-emerald-500 mt-0.5" size={20} /> : <AlertCircle className="text-yellow-500 mt-0.5" size={20} />}
                <div>
                  <h3 className={`font-bold mb-1 ${isOptimal ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {isOptimal ? '间隙符合标准 (Optimal)' : '间隙超差 (Out of Spec)'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isOptimal 
                      ? '当前闸瓦间隙在 1.0mm - 1.5mm 范围内，符合《煤矿安全规程》要求，制动力矩可靠。' 
                      : '当前间隙不在标准范围内。过大导致制动迟缓，过小导致闸瓦磨损发热。请调节碟簧预紧力。'}
                  </p>
                </div>
              </div>

            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-950">
          <ThreeScene state={state} />
          
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-4 rounded-lg text-xs w-64">
            <h3 className="font-bold text-emerald-500 mb-2">操作规范提示</h3>
            <ul className="space-y-2 text-slate-300">
              <li>1. 调校前必须确保提升机处于安全停机状态。</li>
              <li>2. 使用专用工具调节拉杆螺母，改变碟簧压缩量。</li>
              <li>3. 使用塞尺在闸瓦中心处测量间隙，确保上下均匀。</li>
              <li>4. 调校完成后，必须进行空载和重载制动试验。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
