import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, ShieldAlert, RefreshCw, ThermometerSun, Zap, Volume2 } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/cooling-pump-bearing-life/ThreeScene';
import { BearingState } from '../../../components/life-warning/cooling-pump-bearing-life/three-types';

export const View: React.FC = () => {
  const [bearingState, setBearingState] = useState<BearingState>({
    temperature: 45, // Celsius
    vibration: 2.5, // mm/s
    oilLevel: 80, // %
    wearDepth: 5, // um
    acousticEmission: 30, // dB
    load: 75, // %
  });

  const [healthScore, setHealthScore] = useState(95);
  const [estimatedLife, setEstimatedLife] = useState(24); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setBearingState(prev => {
        // Simulate operational factors
        const time = Date.now() / 5000;
        
        // Load fluctuates slightly
        const newLoad = Math.max(30, Math.min(100, prev.load + (Math.random() - 0.5) * 5));

        // Temperature rises with load and wear, drops if oil is good
        // Base temp ~40C, +load factor, +wear friction
        let tempTarget = 30 + (newLoad * 0.3) + (prev.wearDepth * 1.5);
        if (prev.oilLevel < 40) tempTarget += (40 - prev.oilLevel) * 0.5; // Overheating due to low oil
        
        // Smooth temperature transition
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Wear increases slowly, accelerates with high temp, high load, or low oil
        const wearRateBase = 0.001 * (newLoad / 100);
        const wearTempFactor = Math.pow(1.05, Math.max(0, newTemp - 70)); // Exponential wear above 70C
        const wearOilFactor = prev.oilLevel < 30 ? 5.0 : 1.0; // 5x wear if oil is critically low
        const newWear = Math.min(100, prev.wearDepth + (wearRateBase * wearTempFactor * wearOilFactor));

        // Vibration increases with wear and load
        // Base vibration ~1.5mm/s + wear contribution + load noise
        const vibTarget = 1.0 + (newWear * 0.1) + (newLoad * 0.01);
        const newVibration = prev.vibration + (vibTarget - prev.vibration) * 0.2 + (Math.random() - 0.5) * 0.2;

        // Acoustic Emission (high frequency noise) is very sensitive to early wear (micro-spalling)
        const aeTarget = 20 + (newWear * 1.5) + (newVibration * 2);
        const newAE = prev.acousticEmission + (aeTarget - prev.acousticEmission) * 0.3 + (Math.random() - 0.5) * 2;

        // Oil level slowly decreases over time (leakage/evaporation)
        const newOilLevel = Math.max(0, prev.oilLevel - 0.05);

        // Health Index Calculation
        // Weights: Wear (40%), Temp (20%), Vib (20%), AE (10%), Oil (10%)
        const wearPenalty = (newWear / 50) * 40; // 50um is critical
        const tempPenalty = Math.max(0, (newTemp - 70) / 30) * 20; // Penalty starts > 70C
        const vibPenalty = Math.max(0, (newVibration - 4.5) / 6.5) * 20; // ISO 10816: >4.5 is warning, >11 is unacceptable
        const aePenalty = Math.max(0, (newAE - 60) / 40) * 10;
        const oilPenalty = Math.max(0, (50 - newOilLevel) / 50) * 10;

        const health = Math.max(0, Math.floor(100 - wearPenalty - tempPenalty - vibPenalty - aePenalty - oilPenalty));
        
        // Estimated Life (Months)
        // Non-linear relationship: drops fast when health is low
        setEstimatedLife(Math.max(0, Math.floor(36 * Math.pow(health / 100, 2))));

        return {
          ...prev,
          load: newLoad,
          temperature: newTemp,
          wearDepth: newWear,
          vibration: newVibration,
          acousticEmission: newAE,
          oilLevel: newOilLevel,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBearingState({
      temperature: 40,
      vibration: 1.5,
      oilLevel: 100,
      wearDepth: 0,
      acousticEmission: 20,
      load: 75,
    });
    setHealthScore(100);
    setEstimatedLife(36);
  };

  const handleAddOil = () => {
    setBearingState(s => ({ ...s, oilLevel: 100 }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin-slow" />
            冷却水泵轴承寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于振动、温度与声发射的多源融合状态监测</p>
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
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleAddOil}
              className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/50 rounded-lg px-4 py-1.5 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Droplets className="w-4 h-4" />
              <span>补充润滑油</span>
            </button>
            <button 
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-1.5 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>更换轴承</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况与状态
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="泵组负荷 (%)" 
                value={bearingState.load} 
                max={120} 
                color="bg-sky-500"
                onChange={(v) => setBearingState(s => ({...s, load: v}))}
              />
              
              <ParameterControl 
                label="轴承温度 (°C)" 
                value={bearingState.temperature} 
                max={120} 
                color={bearingState.temperature > 85 ? 'bg-rose-500' : bearingState.temperature > 70 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setBearingState(s => ({...s, temperature: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Droplets className="w-4 h-4 text-amber-400"/> 润滑油位 (%)</span>
                  <span className={`font-mono text-xl font-bold ${bearingState.oilLevel < 30 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                    {bearingState.oilLevel.toFixed(1)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${bearingState.oilLevel < 30 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${bearingState.oilLevel}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0 (干摩擦)</span><span>30 (低油位)</span><span>100 (满)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              损伤指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">滚道磨损深度 (μm)</span>
                <span className={`font-mono font-bold text-lg ${bearingState.wearDepth > 40 ? 'text-rose-500' : 'text-amber-400'}`}>
                  {bearingState.wearDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${bearingState.wearDepth > 40 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (bearingState.wearDepth / 60) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
            滚动轴承内部热力与磨损 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={bearingState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Zap className={`w-6 h-6 ${bearingState.vibration > 7.1 ? 'text-rose-500' : bearingState.vibration > 4.5 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">振动烈度 (RMS)</div>
                <div className={`text-xl font-mono ${bearingState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {bearingState.vibration.toFixed(2)} <span className="text-sm">mm/s</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3 text-right">
              <div>
                <div className="text-xs text-slate-400">高频声发射 (AE)</div>
                <div className={`text-xl font-mono ${bearingState.acousticEmission > 80 ? 'text-rose-500' : 'text-slate-200'}`}>
                  {bearingState.acousticEmission.toFixed(1)} <span className="text-sm">dB</span>
                </div>
              </div>
              <Volume2 className={`w-6 h-6 ${bearingState.acousticEmission > 80 ? 'text-rose-500' : 'text-sky-400'}`} />
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              故障特征频率分析 (Envelope)
            </h3>
            
            {/* Fake Spectrum Chart */}
            <div className="h-40 bg-slate-950 border border-slate-800 rounded-lg p-2 relative flex items-end gap-1 mb-6">
              {/* BPFO (Outer Race) */}
              <div className="flex-1 flex flex-col justify-end items-center group">
                <div className="w-full bg-slate-700 transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${20 + (bearingState.wearDepth * 0.5)}%` }}></div>
                <span className="text-[10px] text-slate-500 mt-1">BPFO</span>
              </div>
              {/* BPFI (Inner Race) */}
              <div className="flex-1 flex flex-col justify-end items-center group">
                <div className="w-full bg-slate-700 transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${10 + (bearingState.wearDepth * 1.2)}%` }}></div>
                <span className="text-[10px] text-slate-500 mt-1">BPFI</span>
              </div>
              {/* BSF (Ball Spin) */}
              <div className="flex-1 flex flex-col justify-end items-center group">
                <div className="w-full bg-slate-700 transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${15 + (bearingState.wearDepth * 0.8)}%` }}></div>
                <span className="text-[10px] text-slate-500 mt-1">BSF</span>
              </div>
              {/* FTF (Fundamental Train) */}
              <div className="flex-1 flex flex-col justify-end items-center group">
                <div className="w-full bg-slate-700 transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${5 + (bearingState.wearDepth * 0.3)}%` }}></div>
                <span className="text-[10px] text-slate-500 mt-1">FTF</span>
              </div>
              {/* 1X (Unbalance/Misalignment) */}
              <div className="flex-1 flex flex-col justify-end items-center group">
                <div className="w-full bg-slate-700 transition-all duration-300 group-hover:bg-sky-500" style={{ height: `${30 + (bearingState.vibration * 5)}%` }}></div>
                <span className="text-[10px] text-slate-500 mt-1">1X</span>
              </div>
            </div>

            <div className="space-y-4">
              <DiagnosticItem 
                label="内圈剥落风险 (BPFI 能量)" 
                value={(bearingState.wearDepth / 60) * 100} 
                critical={75}
              />
              <DiagnosticItem 
                label="润滑不良风险 (油膜破裂)" 
                value={Math.max(0, 100 - (bearingState.oilLevel * 1.5) + (bearingState.temperature > 80 ? 30 : 0))} 
                critical={60}
              />
              <DiagnosticItem 
                label="整体劣化程度 (ISO 10816)" 
                value={(bearingState.vibration / 11) * 100} 
                critical={65} // 7.1 mm/s is warning
              />
            </div>

            <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {bearingState.vibration > 11 || bearingState.wearDepth > 50 ? (
                <span className="text-rose-400 font-bold">【危急】 振动烈度达到危险级(&gt;11mm/s)或磨损超限。轴承濒临抱死或碎裂，必须立即停机更换！</span>
              ) : bearingState.temperature > 85 ? (
                <span className="text-rose-400 font-bold">【危急】 轴承温度异常升高(&gt;{bearingState.temperature.toFixed(1)}°C)，存在烧瓦风险。请立即降低负荷并检查冷却与润滑系统。</span>
              ) : bearingState.oilLevel < 30 ? (
                <span className="text-amber-400">【警告】 润滑油位过低，干摩擦导致磨损加剧和温度上升。请立即补充润滑油。</span>
              ) : bearingState.vibration > 4.5 || bearingState.wearDepth > 30 ? (
                <span className="text-yellow-400">【注意】 监测到早期剥落特征频率(BPFI)能量上升，振动处于警告区。建议缩短巡检周期，准备备件。</span>
              ) : (
                <span className="text-emerald-400">【正常】 振动平稳，温度正常，油膜形成良好。轴承处于健康运行状态。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
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
