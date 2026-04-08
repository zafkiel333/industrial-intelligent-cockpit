import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/GuideVaneShearPinHandling/ThreeScene';
import { VaneState } from '../../../components/Maintenance-Training/GuideVaneShearPinHandling/three-types';
import { Settings, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function GuideVaneShearPinHandling() {
  const [state, setState] = useState<VaneState>({
    opening: 50,
    pinBroken: true,
    alignment: 0
  });

  const handleOpeningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, opening: parseInt(e.target.value) }));
  };

  const handleAlignmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, alignment: parseInt(e.target.value) }));
  };

  const repairPin = () => {
    // Can only repair if aligned within 2 degrees of target opening
    const targetAngle = (state.opening / 100) * 45; // Max 45 degrees
    if (Math.abs(state.alignment - targetAngle) <= 2) {
      setState(prev => ({ ...prev, pinBroken: false, alignment: 0 }));
    } else {
      alert("对中偏差过大，无法插入剪断销！请调整导叶角度至与控制环一致。");
    }
  };

  const breakPin = () => {
    setState(prev => ({ ...prev, pinBroken: true, alignment: 0 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">导水机构剪断销剪断故障处理演练</h1>
          <p className="text-sm text-slate-400 mt-1">Guide Vane Shear Pin Failure Handling Drill</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={breakPin}
            disabled={state.pinBroken}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle size={16} />
            模拟剪断销断裂
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="调速器控制 (Governor Control)" highlight>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">导叶开度指令 (Opening Cmd)</span>
                  <span className="text-cyan-400 font-mono">{state.opening}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={state.opening}
                  onChange={handleOpeningChange}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="text-slate-400" size={18} />
                  <h3 className="text-sm font-bold text-slate-300">系统状态反馈</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500">控制环位置</span>
                    <span className="font-mono text-cyan-400">{((state.opening / 100) * 45).toFixed(1)}°</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500">1#导叶实际位置</span>
                    <span className={`font-mono ${state.pinBroken ? 'text-red-400' : 'text-cyan-400'}`}>
                      {state.pinBroken ? state.alignment.toFixed(1) : ((state.opening / 100) * 45).toFixed(1)}°
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="现场手动操作 (Manual Ops)">
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${state.pinBroken ? 'bg-red-900/20 border-red-800' : 'bg-green-900/20 border-green-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {state.pinBroken ? <AlertTriangle className="text-red-500" size={18} /> : <CheckCircle2 className="text-green-500" size={18} />}
                  <span className={`font-bold ${state.pinBroken ? 'text-red-400' : 'text-green-400'}`}>
                    {state.pinBroken ? '1# 导叶剪断销已断裂' : '所有剪断销状态正常'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {state.pinBroken ? '请使用专用扳手手动旋转导叶，使其与控制环孔位对齐，然后插入新销。' : '设备运行正常，无需干预。'}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">手动对中微调 (Manual Alignment)</span>
                  <span className="text-yellow-400 font-mono">{state.alignment}°</span>
                </div>
                <input 
                  type="range" 
                  min="-10" 
                  max="55" 
                  value={state.alignment}
                  onChange={handleAlignmentChange}
                  disabled={!state.pinBroken}
                  className="w-full accent-yellow-500 disabled:opacity-30"
                />
              </div>

              <button 
                onClick={repairPin}
                disabled={!state.pinBroken}
                className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 border border-cyan-500 rounded-lg font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                插入新剪断销并复位
              </button>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-2">俯视图 (Top View)</h3>
            <ul className="space-y-1 text-slate-300">
              <li><span className="inline-block w-3 h-3 bg-cyan-500 mr-2 rounded-sm"></span>正常导叶</li>
              <li><span className="inline-block w-3 h-3 bg-red-500 mr-2 rounded-sm"></span>故障导叶 (1#)</li>
              <li><span className="inline-block w-3 h-3 bg-slate-500 mr-2 rounded-sm"></span>水轮机转轮</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
