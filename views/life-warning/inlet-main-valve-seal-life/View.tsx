import React, { useState, useEffect } from 'react';
import { Activity, Droplets, ShieldAlert, RefreshCw, ThermometerSun, Settings } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/inlet-main-valve-seal-life/ThreeScene';
import { ValveSealState } from '../../../components/life-warning/inlet-main-valve-seal-life/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<ValveSealState>({
    pressure: 2.5, // MPa
    operationCycles: 1500, // count
    leakageRate: 2.0, // L/min
    agingFactor: 0.2, // 0 to 1
    temperature: 15, // Celsius
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(36); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        // Simulate operational factors
        const time = Date.now() / 10000;
        
        // Pressure fluctuates slightly
        const newPressure = Math.max(1.0, Math.min(5.0, prev.pressure + (Math.random() - 0.5) * 0.2));
        
        // Temperature fluctuates seasonally/daily
        const newTemp = 15 + Math.sin(time) * 10 + (Math.random() - 0.5) * 2;

        // Simulate occasional valve operation
        let newCycles = prev.operationCycles;
        if (Math.random() > 0.95) {
           newCycles += 1;
        }

        // Aging increases with time, temperature, and cycles
        const tempStress = Math.pow(1.05, Math.max(0, newTemp - 20));
        const cycleStress = newCycles * 0.00001;
        const agingRate = 0.0005 * tempStress + cycleStress;
        const newAging = Math.min(1.0, prev.agingFactor + agingRate);

        // Leakage rate increases with aging, pressure, and cycles (wear)
        let newLeakage = 0.5;
        if (newAging > 0.6 || newCycles > 3000) {
           // Exponential increase when severely aged or worn
           newLeakage = Math.pow(newAging * 5, 2) * (newPressure * 0.5) + (newCycles / 1000) + (Math.random() * 2);
        } else {
           // Linear slow increase
           newLeakage = (newAging * 5) * (newPressure * 0.2) + (Math.random() * 0.5);
        }

        // Health Index Calculation
        const agingPenalty = newAging * 40;
        const leakagePenalty = Math.max(0, (newLeakage - 5) / 15) * 40; // Penalty starts > 5 L/min
        const cyclePenalty = (newCycles / 5000) * 20; // Assume 5000 is design life

        const health = Math.max(0, Math.floor(100 - agingPenalty - leakagePenalty - cyclePenalty));
        
        // Estimated Life (Months)
        setEstimatedLife(Math.max(0, Math.floor(60 * Math.pow(health / 100, 1.5))));

        return {
          ...prev,
          pressure: newPressure,
          temperature: newTemp,
          operationCycles: newCycles,
          agingFactor: newAging,
          leakageRate: newLeakage,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      pressure: 2.5,
      operationCycles: 0,
      leakageRate: 0.1,
      agingFactor: 0,
      temperature: 15,
    });
    setHealthScore(100);
    setEstimatedLife(60);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            进水主阀密封圈寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于动作频次、压力与泄漏率的密封件疲劳老化分析</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">密封健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-teal-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换密封圈</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="钢管水压 (MPa)" 
                value={sealState.pressure} 
                max={6.0} 
                color={sealState.pressure > 4.5 ? 'bg-rose-500' : 'bg-blue-400'}
                onChange={(v) => setSealState(s => ({...s, pressure: v}))}
              />
              
              <ParameterControl 
                label="水温 (°C)" 
                value={sealState.temperature} 
                max={40} 
                min={0}
                color="bg-cyan-500"
                onChange={(v) => setSealState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">累计动作次数</span>
                  <span className={`font-mono text-xl font-bold ${sealState.operationCycles > 4000 ? 'text-amber-400' : 'text-teal-400'}`}>
                    {sealState.operationCycles}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${sealState.operationCycles > 4500 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (sealState.operationCycles / 5000) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0</span><span>设计寿命: 5000次</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              密封状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">材料老化度</span>
                <span className={`font-mono font-bold ${sealState.agingFactor > 0.7 ? 'text-rose-500' : 'text-amber-400'}`}>
                  {(sealState.agingFactor * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${sealState.agingFactor > 0.7 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${sealState.agingFactor * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(20,184,166,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
            主阀密封圈受力与泄漏 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">密封面最大接触应力</div>
              <div className={`text-xl font-mono ${sealState.pressure > 4.0 ? 'text-rose-500' : 'text-teal-400'}`}>
                {(sealState.pressure * 1.5).toFixed(2)} <span className="text-sm">MPa</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">实时泄漏率</div>
              <div className={`text-xl font-mono ${sealState.leakageRate > 15 ? 'text-rose-500 animate-pulse' : sealState.leakageRate > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sealState.leakageRate.toFixed(1)} <span className="text-sm">L/min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="橡胶热氧老化龟裂" 
                value={sealState.agingFactor * 100} 
                critical={80}
              />
              <DiagnosticItem 
                label="机械磨损 (开关摩擦)" 
                value={(sealState.operationCycles / 5000) * 100} 
                critical={90}
              />
              <DiagnosticItem 
                label="高压水力劈裂风险" 
                value={sealState.leakageRate > 15 ? 95 : (sealState.pressure / 6.0) * 50 + (sealState.leakageRate / 20) * 50} 
                critical={75}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-teal-400">诊断结论与建议：</strong></p>
              {sealState.leakageRate > 20 ? (
                <span className="text-rose-400 font-bold">【危急】 泄漏率严重超标，密封圈已发生实质性破损或撕裂。必须立即关闭事故配水闸，排空钢管，进行紧急更换！</span>
              ) : sealState.operationCycles > 4800 || sealState.agingFactor > 0.8 ? (
                <span className="text-amber-400">【警告】 密封圈已接近设计寿命极限，材料严重老化或磨损。建议在下一次机组大修时强制更换。</span>
              ) : sealState.leakageRate > 5.0 ? (
                <span className="text-yellow-400">【注意】 监测到异常渗漏，可能存在密封面夹杂异物或局部磨损。建议在停机时进行内窥镜检查。</span>
              ) : (
                <span className="text-emerald-400">【正常】 密封性能良好，无明显渗漏。继续保持常规监测。</span>
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
      <span className="font-mono text-teal-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
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
