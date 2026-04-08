import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ThermometerSun, Zap, Waves } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/inverter-capacitor-aging/ThreeScene';
import { CapacitorState } from '../../../components/life-warning/inverter-capacitor-aging/three-types';

export const View: React.FC = () => {
  const [capState, setCapState] = useState<CapacitorState>({
    temperature: 45, // Celsius
    rippleCurrent: 30, // A
    capacitance: 4700, // uF (Nominal)
    esr: 15, // mΩ
    voltage: 600, // V
  });

  const [healthScore, setHealthScore] = useState(95);
  const [estimatedLife, setEstimatedLife] = useState(40000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setCapState(prev => {
        // Simulate operational factors
        const time = Date.now() / 5000;
        
        // Ripple current fluctuates with inverter load
        const newRipple = Math.max(10, Math.min(100, prev.rippleCurrent + (Math.random() - 0.5) * 10));

        // Temperature rises with ambient and internal heating (I^2 * ESR)
        const internalHeat = Math.pow(newRipple, 2) * (prev.esr / 1000) * 0.5;
        let tempTarget = 35 + internalHeat;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Aging: Capacitance drops, ESR increases. Accelerates with temperature (Arrhenius law)
        // Life halves for every 10C rise above rating (e.g., 85C or 105C)
        const tempStress = Math.pow(2, Math.max(0, newTemp - 85) / 10);
        
        // Capacitance drops (electrolyte evaporation)
        const capDropRate = 0.05 * tempStress;
        const newCap = Math.max(3000, prev.capacitance - capDropRate - (Math.random() * 0.1));

        // ESR increases as electrolyte dries out
        const esrRiseRate = 0.001 * tempStress;
        const newESR = prev.esr + esrRiseRate + (Math.random() * 0.05);

        // Health Index Calculation
        // Capacitance: 20% drop (to 3760uF) is considered end of life
        const capPenalty = Math.max(0, (4700 - newCap) / 940) * 50;
        // ESR: 2x initial (to 30mΩ) is considered end of life
        const esrPenalty = Math.max(0, (newESR - 15) / 15) * 30;
        // Temp: >85C starts penalty
        const tempPenalty = Math.max(0, (newTemp - 85) / 20) * 20;

        const health = Math.max(0, Math.floor(100 - capPenalty - esrPenalty - tempPenalty));
        
        // Estimated Life (Hours) - Base life e.g., 5000h at 105C, much longer at lower temps
        const baseLife = 5000 * Math.pow(2, Math.max(0, 105 - newTemp) / 10);
        setEstimatedLife(Math.max(0, Math.floor(baseLife * Math.pow(health / 100, 2))));

        return {
          ...prev,
          rippleCurrent: newRipple,
          temperature: newTemp,
          capacitance: newCap,
          esr: newESR,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setCapState({
      temperature: 40,
      rippleCurrent: 30,
      capacitance: 4700,
      esr: 15,
      voltage: 600,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-fuchsia-400 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            变频器直流电容老化预警
          </h1>
          <p className="text-slate-400 mt-1">基于容值衰减、ESR突变与纹波发热的电解电容寿命预测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">电容组健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-fuchsia-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换电容组</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-fuchsia-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="纹波电流 (A)" 
                value={capState.rippleCurrent} 
                max={150} 
                color={capState.rippleCurrent > 100 ? 'bg-rose-500' : 'bg-fuchsia-500'}
                onChange={(v) => setCapState(s => ({...s, rippleCurrent: v}))}
              />
              
              <ParameterControl 
                label="表面温度 (°C)" 
                value={capState.temperature} 
                max={120} 
                color={capState.temperature > 85 ? 'bg-rose-500' : capState.temperature > 70 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setCapState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Zap className="w-4 h-4 text-slate-400"/> 直流母线电压</span>
                  <span className="font-mono text-xl font-bold text-slate-300">
                    {capState.voltage.toFixed(0)} <span className="text-sm font-normal">V</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-fuchsia-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              核心劣化指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">等效串联电阻 ESR (mΩ)</span>
                <span className={`font-mono font-bold text-lg ${capState.esr > 30 ? 'text-rose-500 animate-pulse' : capState.esr > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {capState.esr.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${capState.esr > 30 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (capState.esr / 40) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(217,70,239,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></div>
            电解电容热膨胀与纹波发热 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={capState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Waves className={`w-6 h-6 ${capState.capacitance < 3760 ? 'text-rose-500' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">实时电容量 (C)</div>
                <div className={`text-xl font-mono ${capState.capacitance < 3760 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {capState.capacitance.toFixed(0)} <span className="text-sm">μF</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">容值衰减率 (ΔC/C0)</div>
              <div className={`text-xl font-mono ${capState.capacitance < 3760 ? 'text-rose-500' : 'text-amber-400'}`}>
                {(((4700 - capState.capacitance) / 4700) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-fuchsia-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="电解液干涸 (容值下降)" 
                value={((4700 - capState.capacitance) / 940) * 100} 
                critical={80} // 20% drop is 100% failure
              />
              <DiagnosticItem 
                label="内部发热激增 (ESR上升)" 
                value={((capState.esr - 15) / 15) * 100} 
                critical={80} // 2x initial is 100% failure
              />
              <DiagnosticItem 
                label="防爆阀冲开风险 (热膨胀)" 
                value={(capState.temperature / 105) * 100} 
                critical={90} // > 95C
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-fuchsia-400">诊断结论与建议：</strong></p>
              {capState.capacitance < 3760 || capState.esr > 30 ? (
                <span className="text-rose-400 font-bold">【危急】 电容量衰减超过20%或ESR翻倍，电容已达寿命终点。纹波电压将大幅增加，极易引发IGBT炸机或电容爆裂。必须立即停机更换！</span>
              ) : capState.temperature > 85 ? (
                <span className="text-rose-400 font-bold">【危急】 电容表面温度过高，电解液加速挥发。请立即检查变频器散热风扇及风道，并降低负载运行。</span>
              ) : capState.capacitance < 4000 || capState.esr > 22 ? (
                <span className="text-yellow-400">【警告】 监测到明显的容值下降和ESR上升，电容进入快速老化期。建议在接下来的1-3个月内安排预防性更换。</span>
              ) : (
                <span className="text-emerald-400">【正常】 容值与ESR保持稳定，温升正常。直流母线滤波状态良好。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-fuchsia-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
    />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        {/* Critical threshold marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
