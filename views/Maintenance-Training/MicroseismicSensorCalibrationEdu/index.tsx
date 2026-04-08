import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MicroseismicSensorCalibrationEdu/ThreeScene';
import { SensorState } from '../../../components/Maintenance-Training/MicroseismicSensorCalibrationEdu/three-types';
import { Activity, Radio, Play, CheckCircle, BarChart2 } from 'lucide-react';

export default function MicroseismicSensorCalibrationEdu() {
  const [state, setState] = useState<SensorState>({
    frequency: 50,
    amplitude: 2,
    isCalibrating: false,
    progress: 0
  });

  // Simulated calibration process
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isCalibrating && state.progress < 100) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(100, prev.progress + 2)
        }));
      }, 100);
    } else if (state.progress >= 100) {
      setState(prev => ({ ...prev, isCalibrating: false }));
    }
    return () => clearInterval(interval);
  }, [state.isCalibrating, state.progress]);

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, frequency: parseInt(e.target.value) }));
  };

  const handleAmpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, amplitude: parseInt(e.target.value) }));
  };

  const startCalibration = () => {
    setState(prev => ({ ...prev, isCalibrating: true, progress: 0 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">矿山微震监测系统传感器标定教学</h1>
          <p className="text-sm text-slate-400 mt-1">Mine Microseismic Sensor Calibration Training</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.progress === 100 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-cyan-900/50 border-cyan-500 text-cyan-400'}`}>
            {state.progress === 100 ? <CheckCircle size={18} /> : <Radio size={18} className={state.isCalibrating ? 'animate-pulse' : ''} />}
            状态: {state.progress === 100 ? '标定完成' : state.isCalibrating ? '标定中...' : '待机准备'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="振动台控制参数" highlight>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Activity size={16}/> 激振频率 (Frequency)</span>
                  <span className="text-cyan-400 font-mono">{state.frequency} Hz</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  value={state.frequency}
                  onChange={handleFreqChange}
                  disabled={state.isCalibrating}
                  className="w-full accent-cyan-500 disabled:opacity-30"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><BarChart2 size={16}/> 激振振幅 (Amplitude)</span>
                  <span className="text-blue-400 font-mono">{state.amplitude} mm</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={state.amplitude}
                  onChange={handleAmpChange}
                  disabled={state.isCalibrating}
                  className="w-full accent-blue-500 disabled:opacity-30"
                />
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">标定进度</span>
                  <span className="text-green-400 font-mono">{state.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${state.progress}%` }}
                  ></div>
                </div>
                
                <button 
                  onClick={startCalibration}
                  disabled={state.isCalibrating || state.amplitude === 0}
                  className={`w-full py-3 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                    state.isCalibrating 
                      ? 'bg-slate-800 border-slate-600 text-slate-500' 
                      : 'bg-cyan-900/50 hover:bg-cyan-800/50 border-cyan-500 text-cyan-400'
                  } disabled:cursor-not-allowed`}
                >
                  <Play size={18} />
                  {state.isCalibrating ? '正在采集数据...' : '开始扫频标定'}
                </button>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="标定原理与规范">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">1.</span> <strong className="text-slate-200">目的：</strong>确定微震传感器的灵敏度、频带宽度和相位响应，确保监测数据的准确性。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">2.</span> <strong className="text-slate-200">操作：</strong>将传感器刚性固定在标准振动台上，输入已知频率和振幅的激励信号。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">3.</span> <strong className="text-slate-200">数据比对：</strong>系统自动记录传感器的输出电信号，并与标准参考信号进行比对，生成标定曲线。</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">4.</span> <strong className="text-slate-200">周期：</strong>井下恶劣环境会导致传感器性能漂移，建议每半年进行一次全面标定。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">振动台状态</h3>
            <p className="text-slate-400">
              {state.isCalibrating ? (
                <span className="text-cyan-400 animate-pulse">输出正弦激励信号中...</span>
              ) : (
                '静止'
              )}
            </p>
          </div>

          {/* Simulated Waveform Overlay */}
          {state.isCalibrating && (
            <div className="absolute bottom-4 right-4 z-10 bg-black/80 backdrop-blur border border-cyan-900 p-3 rounded-lg w-48 h-24 flex items-end justify-between overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-cyan-500 rounded-t-sm"
                  style={{ 
                    height: `${20 + Math.sin((Date.now() * 0.01) + i) * 40 * (state.amplitude/10)}%`,
                    transition: 'height 0.1s'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
