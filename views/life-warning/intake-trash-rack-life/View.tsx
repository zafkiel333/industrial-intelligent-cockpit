import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, ShieldAlert, RefreshCw, Waves } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/intake-trash-rack-life/ThreeScene';
import { TrashRackState } from '../../../components/life-warning/intake-trash-rack-life/three-types';

export const View: React.FC = () => {
  const [rackState, setRackState] = useState<TrashRackState>({
    waterLevelDiff: 0.2, // m
    vibrationAmplitude: 0.5, // mm
    corrosionLevel: 0.1,
    flowVelocity: 2.0, // m/s
    blockageRatio: 0.05,
    structuralStress: 40, // MPa
  });

  const [healthScore, setHealthScore] = useState(96);
  const [estimatedLife, setEstimatedLife] = useState(15); // Years

  useEffect(() => {
    const interval = setInterval(() => {
      setRackState(prev => {
        // Simulate debris accumulation (blockage)
        const newBlockage = Math.min(1.0, prev.blockageRatio + (Math.random() * 0.005));
        
        // Head loss (water level diff) increases exponentially with blockage and flow velocity
        const newHeadLoss = 0.1 + Math.pow(newBlockage, 2) * 5.0 + (prev.flowVelocity * 0.1);
        
        // Structural stress is directly related to head loss (pressure diff) and flow velocity
        const newStress = 20 + (newHeadLoss * 100) + (prev.flowVelocity * 10);
        
        // Vibration increases with flow velocity and blockage (turbulence)
        const newVibration = (prev.flowVelocity * 0.5) + (newBlockage * 2.0) + (Math.random() * 0.5);

        // Corrosion increases slowly over time
        const newCorrosion = Math.min(1.0, prev.corrosionLevel + 0.0002);

        // Health Index calculation
        // High stress, high vibration, and severe corrosion reduce health
        const stressPenalty = newStress > 150 ? (newStress - 150) * 0.5 : 0;
        const vibPenalty = newVibration > 3.0 ? (newVibration - 3.0) * 5 : 0;
        const corrPenalty = newCorrosion * 30;
        
        const health = Math.max(0, Math.floor(100 - stressPenalty - vibPenalty - corrPenalty));
        
        // Estimated Life based on health
        setEstimatedLife(Math.max(0, Math.floor(20 * (health / 100))));

        return {
          ...prev,
          waterLevelDiff: newHeadLoss,
          blockageRatio: newBlockage,
          structuralStress: newStress,
          vibrationAmplitude: newVibration,
          corrosionLevel: newCorrosion,
          // Simulate slight flow variations
          flowVelocity: Math.max(0.5, Math.min(5.0, prev.flowVelocity + (Math.random() - 0.5) * 0.2)),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClean = () => {
    setRackState(prev => ({
      ...prev,
      blockageRatio: 0.02,
      waterLevelDiff: 0.15,
      structuralStress: 30,
      vibrationAmplitude: 0.5,
    }));
  };

  const handleReplace = () => {
    setRackState({
      waterLevelDiff: 0.1,
      vibrationAmplitude: 0.2,
      corrosionLevel: 0,
      flowVelocity: 2.0,
      blockageRatio: 0,
      structuralStress: 20,
    });
    setHealthScore(100);
    setEstimatedLife(20);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <Waves className="w-8 h-8" />
            进水口拦污栅结构寿命评估
          </h1>
          <p className="text-slate-400 mt-1">基于压差、振动与流固耦合的栅体疲劳及腐蚀监测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">结构健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife} <span className="text-sm font-normal">年</span></div>
            </div>
          </div>
          <button 
            onClick={handleClean}
            className="bg-sky-900/50 hover:bg-sky-800/50 border border-sky-700 rounded-lg px-4 flex items-center gap-2 transition-colors text-sky-300"
          >
            <RefreshCw className="w-5 h-5" />
            <span>执行清污</span>
          </button>
          <button 
            onClick={handleReplace}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>更换栅体</span>
          </button>
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
              水力与动力学监测
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">栅前后压差 (水头损失)</span>
                  <span className={`font-mono text-xl font-bold ${rackState.waterLevelDiff > 1.5 ? 'text-rose-500 animate-pulse' : rackState.waterLevelDiff > 0.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {rackState.waterLevelDiff.toFixed(2)} <span className="text-sm font-normal">m</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${rackState.waterLevelDiff > 1.5 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(100, (rackState.waterLevelDiff / 2.5) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0</span><span>报警: 1.5m</span><span>极限: 2.5m</span>
                </div>
              </div>

              <ParameterControl 
                label="流速 (m/s)" 
                value={rackState.flowVelocity} 
                max={5.0} 
                color="bg-blue-400"
                onChange={(v) => setRackState(s => ({...s, flowVelocity: v}))}
              />
              
              <ParameterControl 
                label="振动幅值 (mm)" 
                value={rackState.vibrationAmplitude} 
                max={5.0} 
                color={rackState.vibrationAmplitude > 3.0 ? 'bg-rose-500' : 'bg-amber-500'}
                onChange={(v) => setRackState(s => ({...s, vibrationAmplitude: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              表面状态
            </h3>
            <div className="space-y-4">
              <ParameterControl 
                label="污物堵塞率 (%)" 
                value={rackState.blockageRatio * 100} 
                max={100} 
                color={rackState.blockageRatio > 0.6 ? 'bg-rose-500' : 'bg-amber-600'}
                onChange={(v) => setRackState(s => ({...s, blockageRatio: v / 100}))}
              />
              <ParameterControl 
                label="防腐涂层失效/锈蚀率 (%)" 
                value={rackState.corrosionLevel * 100} 
                max={100} 
                color="bg-orange-700"
                onChange={(v) => setRackState(s => ({...s, corrosionLevel: v / 100}))}
              />
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
            拦污栅流固耦合 (FSI) 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={rackState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">最大等效应力 (Von Mises)</div>
              <div className={`text-xl font-mono ${rackState.structuralStress > 150 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`}>
                {rackState.structuralStress.toFixed(1)} <span className="text-sm">MPa</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">疲劳循环次数估算</div>
              <div className="text-xl font-mono text-slate-300">
                {(rackState.vibrationAmplitude * 100000).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              结构安全评估
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="栅条弯曲屈服风险" 
                value={(rackState.structuralStress / 235) * 100} // Assuming Q235 steel yield strength
                critical={80}
              />
              <DiagnosticItem 
                label="流激振动 (共振) 风险" 
                value={(rackState.vibrationAmplitude / 5.0) * 100} 
                critical={60}
              />
              <DiagnosticItem 
                label="支撑梁剪切破坏风险" 
                value={(rackState.waterLevelDiff / 2.5) * 100} 
                critical={70}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">运维决策建议：</strong></p>
              {rackState.waterLevelDiff > 1.5 || rackState.structuralStress > 180 ? (
                <span className="text-rose-400 font-bold">【危险】 压差过大导致结构应力接近屈服极限，存在栅条断裂或整体垮塌风险。必须立即降低机组负荷，并启动清污机进行全面清污！</span>
              ) : rackState.blockageRatio > 0.4 ? (
                <span className="text-amber-400">【警告】 污物堵塞严重，水头损失增加，影响发电效率并加剧栅体受力。建议安排清污作业。</span>
              ) : rackState.vibrationAmplitude > 3.0 ? (
                <span className="text-yellow-400">【注意】 监测到异常振动，可能发生了卡门涡街共振。建议微调机组流量避开共振区，并检查栅条连接处是否松动。</span>
              ) : (
                <span className="text-emerald-400">【正常】 拦污栅结构稳定，压差与振动均在安全范围内。继续保持常规监测。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(2)}</span>
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
