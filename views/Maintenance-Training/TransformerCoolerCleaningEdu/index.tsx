import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/TransformerCoolerCleaningEdu/ThreeScene';
import { CoolerState } from '../../../components/Maintenance-Training/TransformerCoolerCleaningEdu/three-types';
import { Droplets, Thermometer, Wind, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TransformerCoolerCleaningEdu() {
  const [state, setState] = useState<CoolerState>({
    dirtLevel: 100,
    isCleaning: false,
    waterSprayPos: { x: 0, y: 0 }
  });

  const [oilTemp, setOilTemp] = useState(85); // High temp due to dirt
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isCleaning && state.dirtLevel > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          dirtLevel: Math.max(0, prev.dirtLevel - 0.5)
        }));
        setOilTemp(prev => Math.max(55, prev - 0.15));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [state.isCleaning, state.dirtLevel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setState(prev => ({ ...prev, isCleaning: true }));
    updateSprayPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (state.isCleaning) {
      updateSprayPos(e);
    }
  };

  const handlePointerUp = () => {
    setState(prev => ({ ...prev, isCleaning: false }));
  };

  const updateSprayPos = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Map mouse coordinates to 3D space roughly (-4 to 4)
    const x = ((e.clientX - rect.left) / rect.width) * 8 - 4;
    const y = -(((e.clientY - rect.top) / rect.height) * 8 - 4);
    setState(prev => ({ ...prev, waterSprayPos: { x, y } }));
  };

  const resetSimulation = () => {
    setState({ dirtLevel: 100, isCleaning: false, waterSprayPos: { x: 0, y: 0 } });
    setOilTemp(85);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">主变压器冷却器清洗工艺教学</h1>
          <p className="text-sm text-slate-400 mt-1">Main Transformer Cooler Cleaning Procedure</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={resetSimulation}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors"
          >
            重置实训
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="设备状态监控" highlight>
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={16}/> 顶层油温</span>
                  <span className={`font-mono text-2xl ${oilTemp > 75 ? 'text-red-400' : oilTemp > 65 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {oilTemp.toFixed(1)} °C
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${oilTemp > 75 ? 'bg-red-500' : oilTemp > 65 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${(oilTemp / 100) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Wind size={16}/> 散热片污垢附着率</span>
                  <span className="font-mono text-xl text-cyan-400">{state.dirtLevel.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${state.dirtLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="清洗工艺指导">
            <div className="space-y-4 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                <span><strong className="text-yellow-400">前提条件：</strong> 确认变压器已停电，或已办理带电水冲洗专项工作票，并穿戴全套绝缘防护用具。</span>
              </p>
              <p className="flex items-start gap-2">
                <Droplets className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <span><strong className="text-blue-300">冲洗方法：</strong> 使用高压水枪，水压控制在 0.2~0.3MPa。水流方向应与散热片平行，自上而下冲洗。</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span><strong className="text-green-400">验收标准：</strong> 散热片表面无油污、泥沙，露出金属本色。冲洗后观察油温下降趋势。</span>
              </p>
              
              <div className="mt-6 p-4 bg-cyan-900/30 border border-cyan-800 rounded-lg text-center">
                <p className="text-cyan-300 font-bold mb-2">交互操作说明</p>
                <p className="text-xs text-slate-400">在右侧 3D 视图中，<strong className="text-white">长按并拖动鼠标</strong> 模拟高压水枪冲洗散热片。</p>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div 
          ref={containerRef}
          className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <ThreeScene state={state} />
          
          {/* Overlay Status */}
          {state.dirtLevel === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-900/20 backdrop-blur-sm pointer-events-none">
              <div className="bg-slate-900/90 border border-green-500 p-6 rounded-xl text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">清洗完成</h2>
                <p className="text-slate-300">散热片已恢复最佳散热效率，油温已降至安全范围。</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${state.isCleaning ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="text-sm font-bold text-slate-300">{state.isCleaning ? '高压水枪喷射中...' : '水枪待命'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
