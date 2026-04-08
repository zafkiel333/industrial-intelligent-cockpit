import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Wind, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-turbocharger-bearing-life/ThreeScene';
import { TurbochargerState } from '../../../components/life-warning/ship-turbocharger-bearing-life/three-types';

export const View: React.FC = () => {
  const [turboState, setTurboState] = useState<TurbochargerState>({
    rotorSpeed: 15000, // RPM
    exhaustTemp: 450, // Celsius
    lubeOilPressure: 3.5, // bar
    vibration: 2.5, // mm/s
    operatingHours: 18000, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(6000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setTurboState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate engine load changes
        const loadChange = Math.random();
        let newSpeed = prev.rotorSpeed;
        let newTemp = prev.exhaustTemp;

        if (loadChange > 0.8) {
            // High load (accelerating)
            newSpeed = Math.min(25000, prev.rotorSpeed + 500 + Math.random() * 500);
            newTemp = Math.min(650, prev.exhaustTemp + 10 + Math.random() * 10);
        } else if (loadChange < 0.2) {
            // Low load (decelerating)
            newSpeed = Math.max(8000, prev.rotorSpeed - 500 - Math.random() * 500);
            newTemp = Math.max(300, prev.exhaustTemp - 10 - Math.random() * 10);
        } else {
            // Steady state
            newSpeed = prev.rotorSpeed + (Math.random() - 0.5) * 200;
            newTemp = prev.exhaustTemp + (Math.random() - 0.5) * 5;
        }

        // Oil pressure might drop slightly over time or fluctuate
        let newPressure = prev.lubeOilPressure + (Math.random() - 0.5) * 0.1;
        // If speed is very low, pressure drops
        if (newSpeed < 10000) newPressure -= 0.2;
        newPressure = Math.max(1.0, Math.min(5.0, newPressure));

        // Vibration increases with speed, and spikes if oil pressure is low
        let targetVib = 2.0 + (newSpeed / 25000) * 3.0; // Base vibration based on speed
        if (newPressure < 2.0) targetVib += 4.0; // Low oil pressure causes severe vibration
        if (newHours > 20000) targetVib += 1.5; // Age factor
        
        const newVibration = prev.vibration + (targetVib - prev.vibration) * 0.1 + (Math.random() - 0.5) * 0.5;

        // Health calculation
        const vibPenalty = Math.max(0, (newVibration - 4.5) * 15); // >4.5 is warning
        const pressurePenalty = newPressure < 2.0 ? (2.0 - newPressure) * 40 : 0;
        const tempPenalty = newTemp > 600 ? (newTemp - 600) * 0.5 : 0;

        const health = Math.max(0, Math.floor(100 - vibPenalty - pressurePenalty - tempPenalty));
        
        const baseLife = 24000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          rotorSpeed: newSpeed,
          exhaustTemp: newTemp,
          lubeOilPressure: newPressure,
          vibration: Math.max(0.5, newVibration),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setTurboState({
      rotorSpeed: 12000,
      exhaustTemp: 400,
      lubeOilPressure: 4.0,
      vibration: 1.5,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(24000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-3">
            <Wind className="w-8 h-8" />
            船舶增压器轴承寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于转子转速、排气温度与润滑油压的高速轴承疲劳与烧损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轴承健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-teal-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换转子与轴承组件</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              增压器工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="转子转速 (RPM)" value={turboState.rotorSpeed} max={30000} color={turboState.rotorSpeed > 26000 ? 'bg-rose-500' : turboState.rotorSpeed > 22000 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTurboState(s => ({...s, rotorSpeed: v}))} />
              <ParameterControl label="透平排气温度 (°C)" value={turboState.exhaustTemp} max={800} color={turboState.exhaustTemp > 650 ? 'bg-rose-500' : turboState.exhaustTemp > 550 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTurboState(s => ({...s, exhaustTemp: v}))} />
              <ParameterControl label="润滑油压力 (bar)" value={turboState.lubeOilPressure} max={6} min={0} color={turboState.lubeOilPressure < 1.5 ? 'bg-rose-500' : turboState.lubeOilPressure < 2.5 ? 'bg-amber-500' : 'bg-sky-500'} onChange={(v) => setTurboState(s => ({...s, lubeOilPressure: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              轴承振动状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">轴承座振动速度 (mm/s)</span>
                <span className={`font-mono font-bold text-lg ${turboState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : turboState.vibration > 4.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {turboState.vibration.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${turboState.vibration > 7.1 ? 'bg-rose-500' : turboState.vibration > 4.5 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (turboState.vibration / 12) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(4.5 / 12) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(7.1 / 12) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>报警: 4.5</span>
                <span>停机: 7.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(20,184,166,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            转子高速旋转与热负荷 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={turboState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${turboState.lubeOilPressure < 1.5 ? 'text-rose-500 animate-bounce' : 'text-teal-400'}`} />
              <div>
                <div className="text-xs text-slate-400">轴承干摩擦/烧损风险</div>
                <div className={`text-xl font-mono ${turboState.lubeOilPressure < 1.5 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, Math.max(0, (2.5 - turboState.lubeOilPressure) / 1.5 * 100)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {turboState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="润滑不良/油膜破裂" value={turboState.lubeOilPressure < 2.0 ? 90 : turboState.lubeOilPressure < 3.0 ? 50 : 10} critical={80} />
              <DiagnosticItem label="转子动平衡破坏 (振动)" value={(turboState.vibration / 10) * 100} critical={71} />
              <DiagnosticItem label="透平端高温结焦/热疲劳" value={(turboState.exhaustTemp / 700) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-teal-400">诊断结论与建议：</strong></p>
              {turboState.lubeOilPressure < 1.5 ? (
                <span className="text-rose-400 font-bold">【危急】 润滑油压极低！浮动轴承油膜已破裂，极易发生干摩擦导致轴承烧毁和转子抱死。必须立即降速并检查滑油系统。</span>
              ) : turboState.vibration > 7.1 ? (
                <span className="text-rose-400 font-bold">【危急】 振动速度超过停机限值。可能存在叶片损坏、严重积碳或轴承过度磨损。建议立即停机解体检查。</span>
              ) : turboState.exhaustTemp > 650 ? (
                <span className="text-amber-400">【警告】 排气温度过高，易导致透平端轴承结焦和材料蠕变。请检查主机燃烧状况及扫气压力。</span>
              ) : turboState.vibration > 4.5 ? (
                <span className="text-yellow-400">【注意】 振动值达到报警线，转子动平衡可能开始恶化。建议缩短监测周期，准备备件。</span>
              ) : (
                <span className="text-emerald-400">【正常】 增压器运行平稳，润滑良好，振动及温度均在正常范围内。</span>
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
      <span className="font-mono text-teal-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
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
