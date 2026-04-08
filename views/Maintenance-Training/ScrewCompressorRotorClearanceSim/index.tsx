import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ScrewCompressorRotorClearanceSim/ThreeScene';
import { RotorClearanceState } from '../../../components/Maintenance-Training/ScrewCompressorRotorClearanceSim/three-types';
import { Settings2, Wrench, Ruler, RotateCcw, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrewCompressorRotorClearanceSim() {
  const [state, setState] = useState<RotorClearanceState>({
    rotorAngle: 0,
    clearanceValue: 0.25, // Starts too wide
    feelerGaugeInserted: false,
    feelerGaugeThickness: 0.15, // Target thickness
    isAdjusting: false,
    adjustmentScrewPosition: 0.5 // Positive means too wide
  });

  const targetClearance = 0.15;

  const rotateRotor = (amount: number) => {
    setState(prev => ({ ...prev, rotorAngle: (prev.rotorAngle + amount) % 360 }));
  };

  const selectGauge = (thickness: number) => {
    setState(prev => ({ ...prev, feelerGaugeThickness: thickness }));
  };

  const toggleGauge = () => {
    setState(prev => ({ ...prev, feelerGaugeInserted: !prev.feelerGaugeInserted }));
  };

  const toggleAdjustMode = () => {
    setState(prev => ({ ...prev, isAdjusting: !prev.isAdjusting, feelerGaugeInserted: false }));
  };

  const adjustClearance = (amount: number) => {
    if (!state.isAdjusting) return;
    setState(prev => {
      const newScrewPos = Math.max(-1, Math.min(1, prev.adjustmentScrewPosition + amount));
      // Map screw pos (-1 to 1) to clearance (0.05 to 0.25)
      // 0 screw pos = 0.15 clearance
      const newClearance = 0.15 + (newScrewPos * 0.1);
      return { ...prev, adjustmentScrewPosition: newScrewPos, clearanceValue: newClearance };
    });
  };

  const isClearanceCorrect = Math.abs(state.clearanceValue - targetClearance) < 0.01;

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-purple-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-400 tracking-wider">螺杆式空压机转子间隙测量实训</h1>
          <p className="text-sm text-slate-400 mt-1">Screw Compressor Rotor Clearance Measurement & Adjustment</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${isClearanceCorrect ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-orange-900/50 border-orange-500 text-orange-400'}`}>
            {isClearanceCorrect ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            间隙状态: {isClearanceCorrect ? '合格 (0.15mm)' : `偏差 (${state.clearanceValue.toFixed(2)}mm)`}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="测量与调整工具" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><RotateCcw size={16}/> 盘车操作 (Rotate)</span>
                  <span className="font-mono text-purple-400">{state.rotorAngle.toFixed(0)}°</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => rotateRotor(-15)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-15°</button>
                  <button onClick={() => rotateRotor(15)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+15°</button>
                  <button onClick={() => rotateRotor(90)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+90°</button>
                </div>
                <p className="text-xs text-slate-500">测量时需盘动转子，在多个位置测量取平均值。</p>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Ruler size={16}/> 塞尺选择 (Feeler Gauge)</span>
                  <span className="font-mono text-yellow-400">{state.feelerGaugeThickness.toFixed(2)} mm</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.05, 0.10, 0.15, 0.20].map(val => (
                    <button 
                      key={val}
                      onClick={() => selectGauge(val)}
                      className={`py-2 border rounded text-sm ${state.feelerGaugeThickness === val ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                    >
                      {val.toFixed(2)}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={toggleGauge}
                  disabled={state.isAdjusting}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${state.feelerGaugeInserted ? 'bg-slate-700 border border-slate-500 text-slate-300' : 'bg-yellow-900/50 hover:bg-yellow-800/50 border border-yellow-500 text-yellow-400'}`}
                >
                  <Ruler size={18} />
                  {state.feelerGaugeInserted ? '拔出塞尺' : '插入塞尺测量'}
                </button>
                
                {state.feelerGaugeInserted && (
                  <div className="mt-2 text-sm">
                    {state.feelerGaugeThickness > state.clearanceValue ? (
                      <span className="text-red-400">塞尺无法插入（间隙过小）</span>
                    ) : state.feelerGaugeThickness < state.clearanceValue - 0.05 ? (
                      <span className="text-blue-400">塞尺插入松旷（间隙过大）</span>
                    ) : (
                      <span className="text-green-400">塞尺插入阻力适中（间隙合适）</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
                <button 
                  onClick={toggleAdjustMode}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${state.isAdjusting ? 'bg-purple-900/50 border border-purple-500 text-purple-400' : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300'}`}
                >
                  <Wrench size={18} />
                  {state.isAdjusting ? '完成调整' : '调整轴承座垫片 (调整间隙)'}
                </button>

                {state.isAdjusting && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-3">通过增减轴承座垫片厚度来改变转子中心距，从而调整啮合间隙。</p>
                    <div className="flex gap-2">
                      <button onClick={() => adjustClearance(-0.1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm flex items-center justify-center gap-1"><ArrowDown size={14}/>减小</button>
                      <button onClick={() => adjustClearance(0.1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm flex items-center justify-center gap-1"><ArrowUp size={14}/>增大</button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="维护规范">
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong>标准间隙：</strong>阴阳转子啮合间隙通常要求在 <strong>0.10 ~ 0.15 mm</strong> 之间。</p>
              <p><strong>间隙过大：</strong>气体泄漏量增加，容积效率下降，排气温度升高。</p>
              <p><strong>间隙过小：</strong>热膨胀后转子易发生摩擦、咬死，导致严重机械损坏。</p>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-purple-400 mb-1">螺杆转子啮合透视</h3>
            <p className="text-slate-400">
              左侧为阳转子(4齿)，右侧为阴转子(6齿)。<br/>
              使用塞尺(黄色)插入两转子啮合处测量间隙。<br/>
              若塞尺变红表示无法插入，变蓝表示太松，变绿表示合适。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
