import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ThermometerSun, Zap, Clock } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/drainage-motor-winding-life/ThreeScene';
import { WindingState } from '../../../components/life-warning/drainage-motor-winding-life/three-types';

export const View: React.FC = () => {
  const [windingState, setWindingState] = useState<WindingState>({
    temperature: 65, // Celsius
    insulationResistance: 500, // MΩ
    partialDischarge: 50, // pC
    operatingHours: 12000, // hours
    load: 80, // %
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(40000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setWindingState(prev => {
        // Simulate operational factors
        const newLoad = Math.max(40, Math.min(110, prev.load + (Math.random() - 0.5) * 5));
        const newHours = prev.operatingHours + 1; // Accelerated time

        // Temperature rises with load and insulation degradation (I2R losses increase if turns short)
        let tempTarget = 40 + (newLoad * 0.4);
        if (prev.insulationResistance < 50) tempTarget += (50 - prev.insulationResistance) * 0.5;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Insulation resistance drops slowly over time, accelerates with high temp (Arrhenius equation)
        // Rule of thumb: life halves for every 10C rise above rating
        const tempStress = Math.pow(2, Math.max(0, newTemp - 90) / 10);
        const irDropRate = 0.01 * tempStress + (newHours * 0.000001);
        const newIR = Math.max(1, prev.insulationResistance - irDropRate - (Math.random() * 0.5));

        // Partial Discharge increases as insulation degrades and voids form
        let pdTarget = 20 + (newHours * 0.005);
        if (newIR < 100) pdTarget += (100 - newIR) * 5;
        const newPD = prev.partialDischarge + (pdTarget - prev.partialDischarge) * 0.1 + (Math.random() - 0.5) * 5;

        // Health Index Calculation
        // IR: >100MΩ is good, <5MΩ is critical
        const irPenalty = Math.max(0, (100 - newIR) / 95) * 40;
        // Temp: >90C starts penalty, >130C is critical (Class B)
        const tempPenalty = Math.max(0, (newTemp - 90) / 40) * 30;
        // PD: >500pC is warning, >1000pC is critical
        const pdPenalty = Math.max(0, (newPD - 200) / 800) * 30;

        const health = Math.max(0, Math.floor(100 - irPenalty - tempPenalty - pdPenalty));
        
        // Estimated Life (Hours) - Design life typically 50,000 - 100,000 hours
        setEstimatedLife(Math.max(0, Math.floor(80000 * Math.pow(health / 100, 2))));

        return {
          ...prev,
          load: newLoad,
          operatingHours: newHours,
          temperature: newTemp,
          insulationResistance: newIR,
          partialDischarge: newPD,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setWindingState({
      temperature: 45,
      insulationResistance: 1000,
      partialDischarge: 20,
      operatingHours: 0,
      load: 80,
    });
    setHealthScore(100);
    setEstimatedLife(80000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            排水泵站电机绕组寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于绝缘电阻、局部放电与热老化的定子绕组健康评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">绕组健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-amber-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>电机大修/重绕</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="电机负荷 (%)" 
                value={windingState.load} 
                max={120} 
                color="bg-amber-500"
                onChange={(v) => setWindingState(s => ({...s, load: v}))}
              />
              
              <ParameterControl 
                label="绕组温度 (°C)" 
                value={windingState.temperature} 
                max={150} 
                color={windingState.temperature > 120 ? 'bg-rose-500' : windingState.temperature > 90 ? 'bg-orange-500' : 'bg-emerald-500'}
                onChange={(v) => setWindingState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400"/> 累计运行时间</span>
                  <span className="font-mono text-xl font-bold text-slate-300">
                    {windingState.operatingHours.toLocaleString()} <span className="text-sm font-normal">h</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              绝缘状态指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">绝缘电阻 (MΩ)</span>
                <span className={`font-mono font-bold text-lg ${windingState.insulationResistance < 5 ? 'text-rose-500 animate-pulse' : windingState.insulationResistance < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {windingState.insulationResistance.toFixed(1)}
                </span>
              </div>
              {/* Logarithmic scale bar for IR */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${windingState.insulationResistance < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (Math.log10(windingState.insulationResistance) / 3) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            定子绕组热力与局部放电 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={windingState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Zap className={`w-6 h-6 ${windingState.partialDischarge > 1000 ? 'text-rose-500' : windingState.partialDischarge > 500 ? 'text-amber-400' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">局部放电量 (PD)</div>
                <div className={`text-xl font-mono ${windingState.partialDischarge > 1000 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {windingState.partialDischarge.toFixed(0)} <span className="text-sm">pC</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">吸收比 (R60/R15) 估算</div>
              <div className={`text-xl font-mono ${windingState.insulationResistance < 50 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {Math.max(1.0, 1.5 - (1000 - windingState.insulationResistance) / 2000).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              绝缘老化机理分析 (TEAM)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="热老化 (Thermal)" 
                value={(windingState.temperature / 130) * 100} 
                critical={90} // > 117C
              />
              <DiagnosticItem 
                label="电老化 (Electrical - PD)" 
                value={(windingState.partialDischarge / 1500) * 100} 
                critical={66} // > 1000pC
              />
              <DiagnosticItem 
                label="环境受潮 (Ambient - IR)" 
                value={Math.max(0, 100 - (windingState.insulationResistance / 10))} 
                critical={50} // < 5MΩ
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-400">诊断结论与建议：</strong></p>
              {windingState.insulationResistance < 5 || windingState.partialDischarge > 1500 ? (
                <span className="text-rose-400 font-bold">【危急】 绝缘电阻极低或局部放电剧烈，定子绕组存在严重的相间或对地短路击穿风险。必须立即停机，进行干燥处理或重绕线圈！</span>
              ) : windingState.temperature > 120 ? (
                <span className="text-rose-400 font-bold">【危急】 绕组温度超过绝缘等级允许极限，热老化急剧加速。请立即降低泵组负荷，检查电机散热系统。</span>
              ) : windingState.insulationResistance < 50 || windingState.partialDischarge > 500 ? (
                <span className="text-yellow-400">【警告】 绝缘性能明显下降，可能存在受潮或内部气隙放电。建议在下次停机时进行极化指数(PI)测试和介损测量。</span>
              ) : (
                <span className="text-emerald-400">【正常】 绝缘电阻高，局部放电量小，温度正常。电机定子绝缘系统状态良好。</span>
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
      <span className="font-mono text-amber-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
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
