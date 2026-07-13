import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ThermometerSun, Zap, Wifi } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/dam-sensor-battery-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dam-sensor-battery-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dam-sensor-battery-life';
import { BatteryState } from '../../../components/life-warning/dam-sensor-battery-life/three-types';

export const View: React.FC = () => {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    voltage: 3.6, // V (Typical for Li-SOCl2)
    temperature: 15, // Celsius
    internalResistance: 50, // mΩ
    transmissionFrequency: 4, // times/day
    capacity: 85, // %
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(48); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryState(prev => {
        // Simulate environmental and operational factors
        const time = Date.now() / 10000;
        
        // Temperature fluctuates seasonally/daily
        const newTemp = 15 + Math.sin(time) * 15 + (Math.random() - 0.5) * 2;

        // Capacity drops based on transmission frequency and self-discharge (temperature dependent)
        const selfDischargeRate = 0.0001 * Math.pow(1.05, Math.max(0, newTemp - 20)); // Accelerates at higher temps
        const usageRate = prev.transmissionFrequency * 0.0005;
        const newCapacity = Math.max(0, prev.capacity - selfDischargeRate - usageRate);

        // Internal resistance increases as capacity drops and temperature drops (passivation)
        let irTarget = 50 + (100 - newCapacity) * 2;
        if (newTemp < 0) irTarget += Math.abs(newTemp) * 5; // Cold increases IR significantly
        const newIR = prev.internalResistance + (irTarget - prev.internalResistance) * 0.1 + (Math.random() - 0.5) * 2;

        // Voltage drops slightly with capacity, but drops sharply near the end or under high load (high IR)
        let newVoltage = 3.6;
        if (newCapacity < 20) {
           newVoltage = 3.6 - ((20 - newCapacity) * 0.05);
        }
        // Voltage sag during transmission (simulated by average drop based on IR)
        newVoltage -= (newIR / 1000) * 0.1; 

        // Health Index Calculation
        const capacityPenalty = (100 - newCapacity) * 0.5;
        const irPenalty = Math.max(0, (newIR - 150) / 150) * 30; // >150mΩ starts penalty
        const voltagePenalty = Math.max(0, (3.2 - newVoltage) / 0.4) * 40; // <3.2V is critical

        const health = Math.max(0, Math.floor(100 - capacityPenalty - irPenalty - voltagePenalty));
        
        // Estimated Life (Months)
        // Base life ~5 years (60 months) at 1 tx/day, 20C
        const baseLife = 60 * (1 / Math.max(1, prev.transmissionFrequency));
        setEstimatedLife(Math.max(0, Math.floor(baseLife * (newCapacity / 100) * Math.pow(health / 100, 0.5))));

        return {
          ...prev,
          temperature: newTemp,
          capacity: newCapacity,
          internalResistance: newIR,
          voltage: Math.max(0, newVoltage),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBatteryState({
      voltage: 3.6,
      temperature: 15,
      internalResistance: 50,
      transmissionFrequency: 4,
      capacity: 100,
    });
    setHealthScore(100);
    setEstimatedLife(60);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Wifi className="w-8 h-8" />
            坝体监测传感器电池寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于内阻、电压与环境温度的无线传感器节点电量预测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">电池健康度 (SOH)</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-cyan-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换电池组</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况与环境
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="数据传输频率 (次/天)" 
                value={batteryState.transmissionFrequency} 
                max={24} 
                min={1}
                color="bg-cyan-500"
                onChange={(v) => setBatteryState(s => ({...s, transmissionFrequency: v}))}
              />
              
              <ParameterControl 
                label="环境温度 (°C)" 
                value={batteryState.temperature} 
                max={50} 
                min={-30}
                color={batteryState.temperature > 40 ? 'bg-rose-500' : batteryState.temperature < -10 ? 'bg-blue-500' : 'bg-emerald-500'}
                onChange={(v) => setBatteryState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">剩余电量 (SOC)</span>
                  <span className={`font-mono text-xl font-bold ${batteryState.capacity < 20 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                    {batteryState.capacity.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${batteryState.capacity < 20 ? 'bg-rose-500' : batteryState.capacity < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${batteryState.capacity}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              电气特性
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">端电压 (V)</span>
                <span className={`font-mono font-bold text-lg ${batteryState.voltage < 3.0 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
                  {batteryState.voltage.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${batteryState.voltage < 3.0 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${(batteryState.voltage / 3.6) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(34,211,238,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            嵌入式传感器节点与电池状态 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={batteryState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">电池内阻估算</div>
              <div className={`text-xl font-mono ${batteryState.internalResistance > 200 ? 'text-rose-500' : 'text-amber-400'}`}>
                {batteryState.internalResistance.toFixed(0)} <span className="text-sm">mΩ</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">平均功耗</div>
              <div className="text-xl font-mono text-slate-300">
                {(batteryState.transmissionFrequency * 0.15).toFixed(2)} <span className="text-sm">mAh/天</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="电量耗尽风险" 
                value={Math.max(0, 100 - batteryState.capacity)} 
                critical={80} // < 20% capacity
              />
              <DiagnosticItem 
                label="电压跌落 (欠压) 风险" 
                value={Math.max(0, (3.4 - batteryState.voltage) / 0.6) * 100} 
                critical={66} // < 3.0V
              />
              <DiagnosticItem 
                label="钝化层增厚 (高内阻)" 
                value={(batteryState.internalResistance / 300) * 100} 
                critical={66} // > 200mΩ
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断结论与建议：</strong></p>
              {batteryState.voltage < 2.8 || batteryState.capacity < 5 ? (
                <span className="text-rose-400 font-bold">【危急】 电池电量即将耗尽或电压过低，传感器节点面临断联风险。必须立即安排人员前往坝体更换电池！</span>
              ) : batteryState.internalResistance > 250 && batteryState.temperature < 0 ? (
                <span className="text-amber-400">【警告】 低温导致电池严重钝化，内阻急剧升高，可能在数据传输时发生电压骤降导致重启。建议降低传输频率。</span>
              ) : batteryState.capacity < 20 ? (
                <span className="text-yellow-400">【注意】 剩余电量不足20%，已进入寿命末期。建议将该节点列入下个月的维护计划。</span>
              ) : (
                <span className="text-emerald-400">【正常】 电池电压稳定，内阻正常，电量充足。传感器节点运行状态良好。</span>
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
      <span className="font-mono text-cyan-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
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
