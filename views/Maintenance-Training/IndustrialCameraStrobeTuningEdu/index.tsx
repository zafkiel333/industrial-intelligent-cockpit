import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/IndustrialCameraStrobeTuningEdu/ThreeScene';
import { IndustrialCameraState } from '../../../components/Maintenance-Training/IndustrialCameraStrobeTuningEdu/three-types';
import { Camera, Zap, Settings, Image as ImageIcon, Activity, RefreshCw } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[IndustrialCameraStrobeTuningEdu]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/IndustrialCameraStrobeTuningEdu';

export default function IndustrialCameraStrobeTuningEdu() {
  const [state, setState] = useState<IndustrialCameraState>({
    strobeFrequency: 10, // Hz
    strobeDuration: 1000, // microseconds
    cameraExposure: 1000, // microseconds
    conveyorSpeed: 1.0, // m/s
    imageBrightness: 128,
    imageSharpness: 50,
    isSynchronized: false,
    triggerMode: 'Internal',
    triggerDelay: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate image capture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawSimulatedImage = () => {
      // Clear background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate motion blur based on speed, exposure, and strobe duration
      // Effective exposure is the minimum of camera exposure and strobe duration (if synchronized)
      let effectiveExposure = state.cameraExposure;
      if (state.isSynchronized) {
        effectiveExposure = Math.min(state.cameraExposure, state.strobeDuration);
      }

      // Blur amount (pixels) = speed (m/s) * effective exposure (s) * scale factor
      const blurAmount = state.conveyorSpeed * (effectiveExposure / 1000000) * 1000;
      
      // Calculate brightness
      // Brightness depends on strobe duration and camera exposure overlap
      let brightnessFactor = 0;
      if (state.isSynchronized) {
        brightnessFactor = (effectiveExposure / 5000) * 255; // Normalize to some max exposure
      } else {
        // Asynchronous, random brightness
        brightnessFactor = Math.random() * 100 + 50;
      }
      
      const brightness = Math.min(255, Math.max(0, brightnessFactor));
      
      // Update state for UI
      setState(prev => ({
        ...prev,
        imageBrightness: brightness,
        imageSharpness: Math.max(0, 100 - blurAmount * 5)
      }));

      // Draw object
      ctx.save();
      
      // Apply blur
      if (blurAmount > 0.5) {
        ctx.filter = `blur(${blurAmount / 2}px)`;
      }

      // Draw a box representing the inspected part
      const boxWidth = 100;
      const boxHeight = 60;
      const x = canvas.width / 2 - boxWidth / 2;
      const y = canvas.height / 2 - boxHeight / 2;

      // Color based on brightness
      const colorVal = Math.floor(brightness);
      ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal + 50})`;
      ctx.fillRect(x, y, boxWidth, boxHeight);

      // Draw some details on the box
      ctx.fillStyle = `rgb(${Math.max(0, colorVal - 50)}, ${Math.max(0, colorVal - 50)}, ${Math.max(0, colorVal - 50)})`;
      ctx.fillRect(x + 10, y + 10, 20, 20);
      ctx.fillRect(x + 40, y + 10, 50, 10);

      // If not synchronized, the object might be in a random position
      if (!state.isSynchronized) {
         const offset = (Math.random() - 0.5) * 50;
         ctx.translate(offset, 0);
      }

      ctx.restore();

      // Draw overlay info
      ctx.fillStyle = '#10b981';
      ctx.font = '12px monospace';
      ctx.fillText(`EXP: ${state.cameraExposure}µs`, 10, 20);
      ctx.fillText(`STR: ${state.strobeDuration}µs`, 10, 35);
      ctx.fillText(`SYNC: ${state.isSynchronized ? 'ON' : 'OFF'}`, 10, 50);

      animationId = requestAnimationFrame(drawSimulatedImage);
    };

    drawSimulatedImage();

    return () => cancelAnimationFrame(animationId);
  }, [state.cameraExposure, state.strobeDuration, state.conveyorSpeed, state.isSynchronized]);

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">工业视觉检测相机光源频闪调试</h1>
          <p className="text-sm text-slate-400 mt-1">Industrial Vision Camera Strobe Lighting Tuning</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isSynchronized ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            <RefreshCw size={18} className={state.isSynchronized ? 'animate-spin-slow' : ''} />
            同步状态: {state.isSynchronized ? '已同步 (硬触发)' : '未同步 (自由运行)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="相机与光源控制" highlight>
            <div className="space-y-6">
              
              {/* Trigger Mode */}
              <div>
                <div className="text-sm text-indigo-300 mb-2 flex items-center gap-2"><Activity size={16}/> 触发模式</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, triggerMode: 'Internal', isSynchronized: false }))}
                    className={`flex-1 py-2 rounded border ${state.triggerMode === 'Internal' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                  >
                    内部触发 (Free Run)
                  </button>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, triggerMode: 'External', isSynchronized: true }))}
                    className={`flex-1 py-2 rounded border ${state.triggerMode === 'External' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                  >
                    外部触发 (Hardware Sync)
                  </button>
                </div>
              </div>

              {/* Camera Exposure */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Camera size={16}/> 相机曝光时间 (Exposure)</span>
                  <span className="font-mono text-cyan-400">{state.cameraExposure} µs</span>
                </div>
                <input 
                  type="range" min="100" max="10000" step="100" value={state.cameraExposure}
                  onChange={(e) => setState(prev => ({ ...prev, cameraExposure: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Strobe Duration */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Zap size={16}/> 光源频闪脉宽 (Strobe Duration)</span>
                  <span className="font-mono text-yellow-400">{state.strobeDuration} µs</span>
                </div>
                <input 
                  type="range" min="50" max="5000" step="50" value={state.strobeDuration}
                  onChange={(e) => setState(prev => ({ ...prev, strobeDuration: Number(e.target.value) }))}
                  className="w-full accent-yellow-500"
                />
                <p className="text-xs text-slate-500 mt-1">提示：脉宽越短，运动模糊越小，但图像越暗。</p>
              </div>

              {/* Conveyor Speed */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Settings size={16}/> 传送带速度</span>
                  <span className="font-mono text-slate-300">{state.conveyorSpeed.toFixed(1)} m/s</span>
                </div>
                <input 
                  type="range" min="0.1" max="5.0" step="0.1" value={state.conveyorSpeed}
                  onChange={(e) => setState(prev => ({ ...prev, conveyorSpeed: Number(e.target.value) }))}
                  className="w-full accent-slate-400"
                />
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="图像质量评估">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>图像亮度 (Brightness)</span>
                  <span className={state.imageBrightness < 50 || state.imageBrightness > 200 ? 'text-red-400' : 'text-green-400'}>
                    {state.imageBrightness.toFixed(0)} / 255
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${state.imageBrightness < 50 || state.imageBrightness > 200 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(state.imageBrightness / 255) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>图像清晰度 (Sharpness)</span>
                  <span className={state.imageSharpness < 70 ? 'text-red-400' : 'text-green-400'}>
                    {state.imageSharpness.toFixed(1)} %
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${state.imageSharpness < 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${state.imageSharpness}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                <p className="mb-1"><strong className="text-indigo-400">调试目标：</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>开启外部触发以同步相机和光源。</li>
                  <li>调整频闪脉宽以消除运动模糊（清晰度 &gt; 80%）。</li>
                  <li>调整相机曝光以获得合适的亮度（100 - 180）。</li>
                </ul>
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View & Camera View */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Simulated Camera Output */}
          <SciFiCard title="相机实时采集画面" className="flex-none">
            <div className="flex justify-center bg-black rounded-lg overflow-hidden border border-slate-700 relative">
              <canvas 
                ref={canvasRef} 
                width={640} 
                height={240} 
                className="w-full h-auto max-h-[300px] object-contain"
              />
              {!state.isSynchronized && (
                <div className="absolute top-2 right-2 bg-red-900/80 text-red-200 text-xs px-2 py-1 rounded border border-red-500 animate-pulse">
                  未同步 - 画面撕裂/跳动
                </div>
              )}
            </div>
          </SciFiCard>

          {/* 3D Environment */}
          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[300px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
              <h3 className="font-bold text-indigo-400 mb-1">产线3D环境</h3>
              <p className="text-slate-400">
                观察上方频闪光源与下方传送带物体的相对运动。
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
