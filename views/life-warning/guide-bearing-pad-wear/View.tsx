import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Droplets, ShieldAlert, RefreshCw, ThermometerSun, Zap } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/guide-bearing-pad-wear/ThreeScene';
import { BearingPadState } from '../../../components/life-warning/guide-bearing-pad-wear/three-types';

export const View: React.FC = () => {
  const [padState, setPadState] = useState<BearingPadState>({
    temperature: 45, // Celsius
    oilFilmThickness: 80, // um
    wearDepth: 10, // um
    vibration: 1.5, // mm/s
    load: 75, // %
    rotorSpeed: 300, // RPM
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(48); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setPadState(prev => {
        // Simulate operational factors
        const time = Date.now() / 5000;
        
        // Load and speed fluctuate slightly
        const newLoad = Math.max(30, Math.min(110, prev.load + (Math.random() - 0.5) * 5));
        const newSpeed = Math.max(100, Math.min(600, prev.rotorSpeed + (Math.random() - 0.5) * 10));

        // Oil film thickness depends on speed (hydrodynamic effect) and load
        // Higher speed = thicker film, higher load = thinner film
        let filmTarget = 20 + (newSpeed * 0.15) - (newLoad * 0.3);
        // Wear reduces effective film thickness capability
        filmTarget -= prev.wearDepth * 0.2;
        const newFilm = Math.max(5, prev.oilFilmThickness + (filmTarget - prev.oilFilmThickness) * 0.1 + (Math.random() - 0.5));

        // Temperature rises with load, speed, and thin oil film (friction)
        let tempTarget = 35 + (newLoad * 0.2) + (newSpeed * 0.05);
        if (newFilm < 30) tempTarget += (30 - newFilm) * 1.5; // Overheating due to boundary lubrication
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Wear increases slowly, accelerates with high temp or thin oil film
        const wearRateBase = 0.002 * (newLoad / 100);
        const wearTempFactor = Math.pow(1.05, Math.max(0, newTemp - 65)); // Exponential wear above 65C
        const wearFilmFactor = newFilm < 20 ? 5.0 : 1.0; // 5x wear if film is critically thin
        const newWear = Math.min(200, prev.wearDepth + (wearRateBase * wearTempFactor * wearFilmFactor));

        // Vibration increases with wear and thin oil film (oil whip/whirl)
        const vibTarget = 1.0 + (newWear * 0.02) + (newFilm < 20 ? 2.0 : 0);
        const newVibration = prev.vibration + (vibTarget - prev.vibration) * 0.2 + (Math.random() - 0.5) * 0.1;

        // Health Index Calculation
        const wearPenalty = (newWear / 150) * 40; // 150um is critical
        const tempPenalty = Math.max(0, (newTemp - 70) / 20) * 25; // Penalty starts > 70C
        const vibPenalty = Math.max(0, (newVibration - 4.5) / 5.5) * 20;
        const filmPenalty = Math.max(0, (30 - newFilm) / 30) * 15;

        const health = Math.max(0, Math.floor(100 - wearPenalty - tempPenalty - vibPenalty - filmPenalty));
        
        // Estimated Life (Months)
        setEstimatedLife(Math.max(0, Math.floor(60 * Math.pow(health / 100, 2))));

        return {
          ...prev,
          load: newLoad,
          rotorSpeed: newSpeed,
          temperature: newTemp,
          oilFilmThickness: newFilm,
          wearDepth: newWear,
          vibration: newVibration,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPadState({
      temperature: 40,
      oilFilmThickness: 80,
      wearDepth: 0,
      vibration: 1.0,
      load: 75,
      rotorSpeed: 300,
    });
    setHealthScore(100);
    setEstimatedLife(60);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            导轴承瓦面磨损趋势预警
          </h1>
          <p className="text-slate-400 mt-1">基于油膜厚度、瓦温与振动的巴氏合金磨损状态监测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轴瓦健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-indigo-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换轴瓦</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况与状态
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="机组负荷 (%)" 
                value={padState.load} 
                max={120} 
                color="bg-indigo-500"
                onChange={(v) => setPadState(s => ({...s, load: v}))}
              />
              
              <ParameterControl 
                label="转子转速 (RPM)" 
                value={padState.rotorSpeed} 
                max={800} 
                color="bg-blue-400"
                onChange={(v) => setPadState(s => ({...s, rotorSpeed: v}))}
              />

              <ParameterControl 
                label="导轴瓦温度 (°C)" 
                value={padState.temperature} 
                max={100} 
                color={padState.temperature > 75 ? 'bg-rose-500' : padState.temperature > 65 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setPadState(s => ({...s, temperature: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              润滑与磨损指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">最小油膜厚度 (μm)</span>
                <span className={`font-mono font-bold text-lg ${padState.oilFilmThickness < 20 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {padState.oilFilmThickness.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${padState.oilFilmThickness < 20 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (padState.oilFilmThickness / 100) * 100)}%` }}></div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-400">累计磨损深度 (μm)</span>
                <span className={`font-mono font-bold text-lg ${padState.wearDepth > 120 ? 'text-rose-500' : 'text-slate-300'}`}>
                  {padState.wearDepth.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(99,102,241,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
            导轴承油膜与瓦面热力学 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={padState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Zap className={`w-6 h-6 ${padState.vibration > 6.0 ? 'text-rose-500' : padState.vibration > 3.5 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">轴颈振动 (摆度)</div>
                <div className={`text-xl font-mono ${padState.vibration > 6.0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {padState.vibration.toFixed(2)} <span className="text-sm">mm/s</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">润滑状态评估</div>
              <div className={`text-xl font-bold ${padState.oilFilmThickness < 15 ? 'text-rose-500' : padState.oilFilmThickness < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {padState.oilFilmThickness < 15 ? '边界润滑 (危险)' : padState.oilFilmThickness < 30 ? '混合润滑' : '流体动力润滑'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="巴氏合金烧瓦风险" 
                value={(padState.temperature / 90) * 100} 
                critical={85} // 76.5C
              />
              <DiagnosticItem 
                label="油膜破裂/干摩擦风险" 
                value={Math.max(0, 100 - (padState.oilFilmThickness * 2))} 
                critical={70} // < 15um
              />
              <DiagnosticItem 
                label="轴瓦间隙过大 (磨损超限)" 
                value={(padState.wearDepth / 150) * 100} 
                critical={80} // 120um
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-indigo-400">诊断结论与建议：</strong></p>
              {padState.temperature > 80 || padState.oilFilmThickness < 10 ? (
                <span className="text-rose-400 font-bold">【危急】 瓦温极高或油膜濒临破裂，极易发生烧瓦事故。必须立即紧急停机，检查冷却水及高压顶起装置！</span>
              ) : padState.wearDepth > 120 ? (
                <span className="text-rose-400 font-bold">【危急】 累计磨损量超限，轴承间隙过大导致机组振动加剧。建议尽快安排停机检修，重新刮瓦。</span>
              ) : padState.temperature > 65 || padState.vibration > 4.5 ? (
                <span className="text-amber-400">【警告】 瓦温偏高或振动增大，可能存在油质劣化或负荷不平衡。建议取样化验润滑油，并调整机组运行工况。</span>
              ) : (
                <span className="text-emerald-400">【正常】 油膜厚度充足，瓦温与振动均在安全范围内。导轴承运行状态良好。</span>
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
      <span className="font-mono text-indigo-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
