import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, RefreshCw, Zap, ThermometerSun, Activity as ResistanceIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/substation-breaker-contact-life/ThreeScene';
import { CircuitBreakerState } from '../../../components/life-warning/substation-breaker-contact-life/three-types';

export const View: React.FC = () => {
  const [breakerState, setBreakerState] = useState<CircuitBreakerState>({
    contactWear: 15, // %
    arcCount: 1250, // operations
    temperature: 45, // Celsius
    contactResistance: 25, // micro-ohms
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedOperations, setEstimatedOperations] = useState(8750); // Remaining operations

  // Ref to hold the latest state for the manual trigger
  const stateRef = useRef(breakerState);
  useEffect(() => {
    stateRef.current = breakerState;
  }, [breakerState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreakerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Temperature fluctuates slightly with ambient/load
        let tempTarget = 40 + (prev.contactResistance - 20) * 0.5;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Resistance increases slowly with wear and oxidation
        const newResistance = prev.contactResistance + (prev.contactWear / 100) * 0.01;

        const wearPenalty = prev.contactWear * 0.5;
        const resPenalty = Math.max(0, (newResistance - 40) / 20) * 30;
        const tempPenalty = Math.max(0, (newTemp - 70) / 20) * 20;

        const health = Math.max(0, Math.floor(100 - wearPenalty - resPenalty - tempPenalty));
        
        const maxOperations = 10000;
        // Remaining operations decrease faster if health is poor
        const remainingOps = Math.max(0, Math.floor((maxOperations - prev.arcCount) * (health / 100)));
        setEstimatedOperations(remainingOps);

        return {
          ...prev,
          operatingHours: newHours,
          temperature: newTemp,
          contactResistance: newResistance,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTrip = () => {
    // Simulate a breaker trip/operation
    setBreakerState(prev => {
      // Each operation causes a jump in wear and resistance due to arcing
      const wearJump = 0.1 + Math.random() * 0.2; // %
      const resJump = 0.5 + Math.random() * 1.0; // micro-ohms
      const tempJump = 5 + Math.random() * 10; // C

      return {
        ...prev,
        arcCount: prev.arcCount + 1,
        contactWear: Math.min(100, prev.contactWear + wearJump),
        contactResistance: prev.contactResistance + resJump,
        temperature: prev.temperature + tempJump,
      };
    });
  };

  const handleReset = () => {
    setBreakerState({
      contactWear: 0,
      arcCount: 0,
      temperature: 30,
      contactResistance: 15,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedOperations(10000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            矿用变电站断路器触头寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于电弧烧蚀、接触电阻与温升的真空灭弧室健康评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">触头健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余操作次数</div>
              <div className="text-2xl font-bold text-blue-500">{estimatedOperations} <span className="text-sm font-normal">次</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换灭弧室</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              电气参数监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="接触电阻 (μΩ)" value={breakerState.contactResistance} max={100} color={breakerState.contactResistance > 60 ? 'bg-rose-500' : breakerState.contactResistance > 40 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBreakerState(s => ({...s, contactResistance: v}))} />
              <ParameterControl label="触头温升 (°C)" value={breakerState.temperature} max={120} color={breakerState.temperature > 90 ? 'bg-rose-500' : breakerState.temperature > 70 ? 'bg-amber-500' : 'bg-blue-500'} onChange={(v) => setBreakerState(s => ({...s, temperature: v}))} />
              <ParameterControl label="电弧烧蚀磨损率 (%)" value={breakerState.contactWear} max={100} color={breakerState.contactWear > 80 ? 'bg-rose-500' : breakerState.contactWear > 50 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBreakerState(s => ({...s, contactWear: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3 flex flex-col justify-center items-center">
             <button 
                onClick={handleTrip}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <Zap className="w-6 h-6" />
                模拟断路器分合闸 (产生电弧)
             </button>
             <p className="text-xs text-slate-400 mt-4 text-center">每次分合闸都会产生电弧，导致触头金属气化，增加接触电阻和磨损。</p>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            真空灭弧室内部触头状态与电弧 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={breakerState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <ResistanceIcon className={`w-6 h-6 ${breakerState.contactResistance > 60 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">累计动作次数</div>
                <div className={`text-xl font-mono ${breakerState.arcCount > 8000 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {breakerState.arcCount} <span className="text-sm">次</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">投运时间</div>
              <div className="text-xl font-mono text-slate-300">
                {breakerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="触头烧损超限 (电弧侵蚀)" value={breakerState.contactWear} critical={80} />
              <DiagnosticItem label="接触不良发热 (电阻增大)" value={(breakerState.contactResistance / 100) * 100} critical={60} />
              <DiagnosticItem label="真空度下降风险 (热应力)" value={(breakerState.temperature / 120) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {breakerState.contactWear > 85 ? (
                <span className="text-rose-400 font-bold">【危急】 触头电弧烧损已达极限，可能导致无法可靠开断短路电流，存在爆炸风险！必须立即停电更换灭弧室。</span>
              ) : breakerState.contactResistance > 65 ? (
                <span className="text-rose-400 font-bold">【危急】 接触电阻严重超标，导致触头异常发热，可能引发绝缘件老化或熔焊。建议立即安排回路电阻测试。</span>
              ) : breakerState.temperature > 80 ? (
                <span className="text-amber-400">【警告】 触头温升偏高，请检查负荷电流是否超载，或增加变电站通风散热。</span>
              ) : breakerState.arcCount > 8000 ? (
                <span className="text-yellow-400">【注意】 累计动作次数已接近机械寿命后期，建议缩短预防性试验周期，重点监测真空度。</span>
              ) : (
                <span className="text-emerald-400">【正常】 接触电阻稳定，触头磨损在正常范围内，灭弧室状态良好。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-blue-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
