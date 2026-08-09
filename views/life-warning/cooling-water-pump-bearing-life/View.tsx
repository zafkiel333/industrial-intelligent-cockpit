import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/cooling-water-pump-bearing-life/ThreeScene';
import { PumpBearingState } from '../../../components/life-warning/cooling-water-pump-bearing-life/three-types';

export const View: React.FC = () => {
  const [bearingState, setBearingState] = useState<PumpBearingState>({
    vibrationVelocity: 1.8, // mm/s (Low Freq - Unbalance/Misalignment)
    vibrationAcceleration: 0.5, // G (High Freq - Bearing defect/Acoustic Emission)
    temperature: 45, // Celsius
    load: 80, // %
    operatingHours: 15000, // hours
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(35000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBearingState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Load fluctuates
        const newLoad = Math.max(50, Math.min(100, prev.load + (Math.random() - 0.5) * 5));

        // Velocity (Low Freq) increases slowly with wear/misalignment
        let velIncrease = 0;
        if (newHours > 20000) velIncrease += 0.01;
        const newVelocity = Math.max(0.5, Math.min(15, prev.vibrationVelocity + (Math.random() > 0.9 ? velIncrease : (Math.random() - 0.5) * 0.1)));

        // Acceleration (High Freq/AE) spikes when metal-to-metal contact occurs (spalling)
        // Accelerates rapidly if velocity is high (pounding) or temp is high (lubrication failure)
        let accIncrease = 0;
        if (newVelocity > 4.5) accIncrease += 0.05; // Pounding
        if (prev.temperature > 80) accIncrease += 0.1; // Lube failure
        if (newHours > 25000) accIncrease += 0.02; // Fatigue
        const newAcceleration = Math.max(0.1, Math.min(10, prev.vibrationAcceleration + (Math.random() > 0.8 ? accIncrease : (Math.random() - 0.5) * 0.05)));

        // Temperature rises with friction (acceleration/spalling) and load
        let tempTarget = 35 + (newLoad / 10) + (newAcceleration * 5);
        // If spalling is severe, temp skyrockets
        if (newAcceleration > 5.0) tempTarget += (newAcceleration - 5) * 10;
        
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        // Health Index Calculation
        // Temperature: > 70C is warning, > 90C is critical
        const tempPenalty = Math.max(0, (newTemp - 60) / 30) * 30;
        
        // Velocity (ISO 10816): > 4.5 mm/s is warning, > 7.1 mm/s is critical
        const velPenalty = Math.max(0, (newVelocity - 2.8) / 4.3) * 30;
        
        // Acceleration (Bearing Defect): > 2G is warning, > 5G is critical
        const accPenalty = Math.max(0, (newAcceleration - 1.0) / 4.0) * 40;

        const health = Math.max(0, Math.floor(100 - tempPenalty - velPenalty - accPenalty));
        
        // Estimated Life (Hours) - L10 life typically 40,000 - 50,000 hours
        const baseLife = 50000;
        // High acceleration (spalling) drastically reduces life
        const damageFactor = Math.pow(Math.max(1, newAcceleration), 1.5);
        const remainingLife = Math.max(0, Math.floor((baseLife / damageFactor) * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          load: newLoad,
          vibrationVelocity: newVelocity,
          vibrationAcceleration: newAcceleration,
          temperature: newTemp,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBearingState({
      vibrationVelocity: 1.0,
      vibrationAcceleration: 0.2,
      temperature: 40,
      load: 80,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            冷却水泵轴承寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于高频声发射与低频振动包络分析的滚动轴承疲劳评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轴承健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命 (L10)</div>
              <div className="text-2xl font-bold text-cyan-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换泵端轴承</span>
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
              振动与声发射监测
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="低频振动速度 (mm/s) [不平衡/不对中]" 
                value={bearingState.vibrationVelocity} 
                max={15} 
                color={bearingState.vibrationVelocity > 7.1 ? 'bg-rose-500' : bearingState.vibrationVelocity > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setBearingState(s => ({...s, vibrationVelocity: v}))}
              />
              
              <ParameterControl 
                label="高频振动加速度 (G) [轴承缺陷/剥落]" 
                value={bearingState.vibrationAcceleration} 
                max={10} 
                color={bearingState.vibrationAcceleration > 5.0 ? 'bg-rose-500' : bearingState.vibrationAcceleration > 2.0 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setBearingState(s => ({...s, vibrationAcceleration: v}))}
              />

              <ParameterControl 
                label="轴承座表面温度 (°C)" 
                value={bearingState.temperature} 
                max={120} 
                color={bearingState.temperature > 90 ? 'bg-rose-500' : bearingState.temperature > 70 ? 'bg-amber-500' : 'bg-cyan-500'}
                onChange={(v) => setBearingState(s => ({...s, temperature: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              运行状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">水泵负载率 (%)</span>
                <span className={`font-mono font-bold text-lg ${bearingState.load > 95 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {bearingState.load.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${bearingState.load > 95 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${bearingState.load}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(6,182,212,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            轴承内部剥落损伤与高频声发射 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={bearingState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${bearingState.vibrationAcceleration > 5.0 ? 'text-rose-500' : 'text-cyan-400'}`} />
              <div>
                <div className="text-xs text-slate-400">滚道/滚动体剥落面积估算</div>
                <div className={`text-xl font-mono ${bearingState.vibrationAcceleration > 5.0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (bearingState.vibrationAcceleration / 10) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {bearingState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
                label="滚动体/滚道疲劳剥落 (高频G)" 
                value={(bearingState.vibrationAcceleration / 10) * 100} 
                critical={50} // > 5G
              />
              <DiagnosticItem 
                label="转子不平衡/不对中 (低频mm/s)" 
                value={(bearingState.vibrationVelocity / 15) * 100} 
                critical={47} // > 7.1 mm/s
              />
              <DiagnosticItem 
                label="润滑失效/干摩擦 (温升)" 
                value={(bearingState.temperature / 120) * 100} 
                critical={75} // > 90C
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断结论与建议：</strong></p>
              {bearingState.vibrationAcceleration > 6.0 ? (
                <span className="text-rose-400 font-bold">【危急】 高频加速度极高，伴随强烈声发射。轴承内部已发生严重疲劳剥落或保持架断裂，随时可能抱死烧毁电机！必须立即停机更换！</span>
              ) : bearingState.temperature > 90 ? (
                <span className="text-rose-400 font-bold">【危急】 轴承座温度异常升高，润滑脂可能已流失或碳化，处于干摩擦状态。请立即停机检查润滑系统。</span>
              ) : bearingState.vibrationVelocity > 7.1 ? (
                <span className="text-amber-400">【警告】 低频振动速度超标，可能存在泵轴不对中、地脚松动或叶轮不平衡。建议安排激光对中和动平衡测试。</span>
              ) : bearingState.vibrationAcceleration > 2.0 ? (
                <span className="text-yellow-400">【注意】 高频包络信号出现早期冲击特征，轴承可能出现微小点蚀。建议缩短振动监测周期，准备备件。</span>
              ) : (
                <span className="text-emerald-400">【正常】 振动速度与加速度均在ISO标准优秀范围内，温升正常，轴承运转平稳。</span>
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
