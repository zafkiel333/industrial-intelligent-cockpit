import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Zap, Thermometer, Droplets, ShieldAlert } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/generator-insulation-aging/ThreeScene';
import { InsulationState } from '../../../components/life-warning/generator-insulation-aging/three-types';

export const View: React.FC = () => {
  const [insulationState, setInsulationState] = useState<InsulationState>({
    temperature: 65,
    humidity: 40,
    voltageStress: 18, // kV
    partialDischarge: 50, // pC
    insulationResistance: 500, // MOhms
    agingFactor: 0.1,
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(15); // Years

  useEffect(() => {
    const interval = setInterval(() => {
      setInsulationState(prev => {
        // Complex aging model based on Arrhenius equation and electrical stress
        const tempFactor = Math.pow(2, (prev.temperature - 60) / 10); // Rule of thumb: life halves every 10C rise
        const voltageFactor = Math.pow(prev.voltageStress / 18, 2); // Stress increases non-linearly
        const pdFactor = prev.partialDischarge > 1000 ? 1.5 : 1.0; // High PD accelerates aging

        const agingRate = 0.0005 * tempFactor * voltageFactor * pdFactor;
        const newAging = Math.min(1.0, prev.agingFactor + agingRate);

        // Update PD based on aging and voltage
        const newPD = Math.max(10, prev.partialDischarge + (newAging * 50) + (Math.random() - 0.5) * 20);
        
        // Insulation resistance drops as aging increases
        const newIR = Math.max(10, 500 * Math.exp(-newAging * 3) + (Math.random() - 0.5) * 10);

        // Update health and life
        setHealthScore(Math.max(0, Math.floor(100 - (newAging * 100))));
        setEstimatedLife(Math.max(0, Math.floor(20 * (1 - newAging))));

        return {
          ...prev,
          agingFactor: newAging,
          partialDischarge: newPD,
          insulationResistance: newIR,
          // Add some random fluctuation to environment
          temperature: Math.max(40, Math.min(120, prev.temperature + (Math.random() - 0.5) * 2)),
          humidity: Math.max(20, Math.min(80, prev.humidity + (Math.random() - 0.5) * 1)),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setInsulationState({
      temperature: 65,
      humidity: 40,
      voltageStress: 18,
      partialDischarge: 50,
      insulationResistance: 500,
      agingFactor: 0.1,
    });
    setHealthScore(92);
    setEstimatedLife(18);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            发电机定子线棒绝缘老化监测
          </h1>
          <p className="text-slate-400 mt-1">基于多物理场耦合的局部放电与绝缘劣化实时评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-slate-400">绝缘健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-indigo-400">{estimatedLife} <span className="text-sm font-normal">年</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换线棒</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Environment & Stress */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              运行环境与电应力
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="定子温度 (°C)" 
                value={insulationState.temperature} 
                max={150} 
                color={insulationState.temperature > 100 ? 'bg-rose-500' : 'bg-orange-500'}
                onChange={(v) => setInsulationState(s => ({...s, temperature: v}))}
              />
              <ParameterControl 
                label="环境湿度 (%)" 
                value={insulationState.humidity} 
                max={100} 
                color="bg-blue-400"
                onChange={(v) => setInsulationState(s => ({...s, humidity: v}))}
              />
              <ParameterControl 
                label="运行电压 (kV)" 
                value={insulationState.voltageStress} 
                max={24} 
                color="bg-indigo-500"
                onChange={(v) => setInsulationState(s => ({...s, voltageStress: v}))}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">热老化加速因子 (Arrhenius)</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-mono text-amber-400">
                  {Math.pow(2, (insulationState.temperature - 60) / 10).toFixed(2)}x
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              绝缘状态指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">绝缘电阻 (MΩ)</span>
                <span className={`font-mono font-bold ${insulationState.insulationResistance < 100 ? 'text-rose-500' : 'text-emerald-400'}`}>
                  {insulationState.insulationResistance.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">介质损耗因数 (tan δ)</span>
                <span className="font-mono font-bold text-amber-400">
                  {(0.01 + insulationState.agingFactor * 0.05).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#0a0a0a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
            定子线棒绝缘层 3D 剖析
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={insulationState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">局部放电量 (PD)</div>
              <div className={`text-xl font-mono ${insulationState.partialDischarge > 2000 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                {insulationState.partialDischarge.toFixed(0)} <span className="text-sm">pC</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">绝缘劣化程度</div>
              <div className="text-xl font-mono text-amber-400">{(insulationState.agingFactor * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              局部放电图谱 (PRPD) 模拟
            </h3>
            
            {/* Simulated PRPD Scatter Plot Area */}
            <div className="h-48 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden mb-6">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
                backgroundSize: '20px 20px'
              }}></div>
              {/* Generate random dots based on PD intensity */}
              {Array.from({ length: Math.min(100, Math.floor(insulationState.partialDischarge / 50)) }).map((_, i) => {
                // Simulate typical PRPD pattern (clusters around 45 and 225 degrees)
                const phase = Math.random() > 0.5 ? 45 + (Math.random() - 0.5) * 30 : 225 + (Math.random() - 0.5) * 30;
                const amplitude = Math.random() * (insulationState.partialDischarge / 5000) * 100;
                return (
                  <div 
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      left: `${(phase / 360) * 100}%`,
                      bottom: `${amplitude}%`,
                      backgroundColor: amplitude > 80 ? '#ef4444' : amplitude > 50 ? '#f59e0b' : '#3b82f6',
                      opacity: 0.7
                    }}
                  />
                );
              })}
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-slate-500">
                <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-indigo-400">诊断结论：</strong></p>
              {insulationState.partialDischarge > 2000 ? (
                <span className="text-rose-400">严重局部放电，主绝缘可能存在贯穿性缺陷。建议立即停机进行直流耐压和泄漏电流试验。</span>
              ) : insulationState.agingFactor > 0.5 ? (
                <span className="text-amber-400">绝缘老化明显，热应力导致云母带分层。建议缩短巡检周期，准备大修计划。</span>
              ) : (
                <span className="text-emerald-400">绝缘状态良好，局部放电在正常范围内。继续监测温度和振动趋势。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, color, onChange }: { label: string, value: number, max: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-indigo-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

// Add RefreshCw icon if not imported
import { RefreshCw } from 'lucide-react';
