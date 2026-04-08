import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, BatteryWarning, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/emergency-generator-battery-life/ThreeScene';
import { EmergencyBatteryState } from '../../../components/life-warning/emergency-generator-battery-life/three-types';

export const View: React.FC = () => {
  const [batteryState, setBatteryState] = useState<EmergencyBatteryState>({
    voltage: 26.5, // V (24V system float voltage)
    internalResistance: 4.5, // mOhm
    temperature: 25, // Celsius
    chargeCycles: 45, // count
    operatingHours: 12000, // hours
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(24); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate float charging and occasional self-discharge
        let newVoltage = prev.voltage;
        let newTemp = prev.temperature;

        // Small random fluctuations
        newVoltage += (Math.random() - 0.5) * 0.05;
        // Keep float voltage around 26.4 - 27.0
        if (newVoltage > 27.2) newVoltage -= 0.1;
        if (newVoltage < 26.0) newVoltage += 0.1;

        // Temperature fluctuates slightly with ambient
        newTemp += (Math.random() - 0.5) * 0.2;
        if (newTemp > 35) newTemp -= 0.5;
        if (newTemp < 15) newTemp += 0.5;

        // Internal resistance slowly increases over time (sulfation/grid corrosion)
        let resIncrease = 0.0001;
        if (newTemp > 30) resIncrease *= 2; // Heat accelerates aging
        const newResistance = prev.internalResistance + resIncrease;

        // Health calculation
        // Resistance > 10mOhm is warning, > 15mOhm is critical (for a typical 24V block)
        const resPenalty = Math.max(0, ((newResistance - 6) / 9) * 60); 
        const tempPenalty = Math.max(0, ((newTemp - 25) / 15) * 20);

        const health = Math.max(0, Math.floor(100 - resPenalty - tempPenalty));
        
        const baseLifeMonths = 48; // 4 years typical life
        const remainingLife = Math.max(0, Math.floor(baseLifeMonths * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          voltage: newVoltage,
          temperature: newTemp,
          internalResistance: newResistance,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBatteryState({
      voltage: 26.8,
      internalResistance: 3.5,
      temperature: 22,
      chargeCycles: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(48);
  };

  const handleTest = () => {
    // Simulate a load test (voltage drop, resistance spike)
    setBatteryState(prev => ({
        ...prev,
        voltage: 22.5, // Drops under load
        temperature: prev.temperature + 2, // Heats up
        chargeCycles: prev.chargeCycles + 1
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-indigo-950 text-indigo-100 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-indigo-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
            <BatteryWarning className="w-8 h-8" />
            船舶应急发电机启动电瓶寿命预警
          </h1>
          <p className="text-indigo-300 mt-1">基于内阻突变、浮充电压与极板硫化效应的启动可靠性评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-indigo-900/40 border border-indigo-800/50 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-indigo-300">电瓶健康度 (SOH)</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-indigo-800"></div>
            <div className="text-center">
              <div className="text-sm text-indigo-300">预计剩余寿命</div>
              <div className="text-2xl font-bold text-emerald-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button onClick={handleTest} className="bg-indigo-800/50 hover:bg-indigo-700/50 border border-indigo-600/50 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-amber-400" />
            <span>执行大电流放电测试</span>
          </button>
          <button onClick={handleReset} className="bg-indigo-800/50 hover:bg-indigo-700/50 border border-indigo-600/50 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换蓄电池组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              充放电与环境参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="端电压 (V)" value={batteryState.voltage} max={30} min={20} color={batteryState.voltage < 23 ? 'bg-rose-500' : batteryState.voltage > 28 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBatteryState(s => ({...s, voltage: v}))} />
              <ParameterControl label="环境/壳体温度 (°C)" value={batteryState.temperature} max={60} color={batteryState.temperature > 40 ? 'bg-rose-500' : batteryState.temperature > 30 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBatteryState(s => ({...s, temperature: v}))} />
              
              <div className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-800/50 flex justify-between items-center">
                <span className="text-sm text-indigo-300">深度充放电循环</span>
                <span className={`font-mono font-bold ${batteryState.chargeCycles > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {batteryState.chargeCycles} 次
                </span>
              </div>
            </div>
          </div>
          <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              交流注入法内阻监测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-300">欧姆内阻 (mΩ)</span>
                <span className={`font-mono font-bold text-2xl ${batteryState.internalResistance > 15 ? 'text-rose-500 animate-pulse' : batteryState.internalResistance > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {batteryState.internalResistance.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${batteryState.internalResistance > 15 ? 'bg-rose-500' : batteryState.internalResistance > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (batteryState.internalResistance / 20) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(10 / 20) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(15 / 20) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-indigo-400/70">
                <span>警告: 10.0</span>
                <span>危险: 15.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#1e1b4b] border border-indigo-800/50 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(52,211,153,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-indigo-950/80 backdrop-blur px-3 py-1.5 rounded-md border border-indigo-800/50 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            极板不可逆硫化与离子流 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={batteryState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-indigo-950/80 backdrop-blur px-4 py-2 rounded-lg border border-indigo-800/50 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${batteryState.internalResistance > 15 ? 'text-rose-500 animate-bounce' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-indigo-300">启动失败风险指数</div>
                <div className={`text-xl font-mono ${batteryState.internalResistance > 15 ? 'text-rose-500 animate-pulse' : 'text-indigo-100'}`}>
                  {Math.min(100, (batteryState.internalResistance / 18) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-indigo-950/80 backdrop-blur px-4 py-2 rounded-lg border border-indigo-800/50 text-right">
              <div className="text-xs text-indigo-300">累计浮充时间</div>
              <div className="text-xl font-mono text-indigo-200">
                {batteryState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="极板不可逆硫化 (高内阻)" value={(batteryState.internalResistance / 18) * 100} critical={83} />
              <DiagnosticItem label="板栅腐蚀/失水 (高温/过充)" value={(batteryState.temperature / 50) * 100} critical={80} />
              <DiagnosticItem label="活性物质脱落 (深循环)" value={(batteryState.chargeCycles / 200) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-indigo-950/40 rounded-lg border border-indigo-800/50 text-sm text-indigo-200 leading-relaxed">
              <p className="mb-2"><strong className="text-emerald-400">诊断结论与建议：</strong></p>
              {batteryState.internalResistance > 15 ? (
                <span className="text-rose-400 font-bold">【危急】 电池内阻严重超标，极板已发生不可逆硫化或断格。在紧急情况下将无法提供足够的 CCA (冷启动电流) 启动应急发电机。必须立即更换该组蓄电池！</span>
              ) : batteryState.voltage < 23 ? (
                <span className="text-rose-400 font-bold">【危急】 端电压过低，电池处于严重亏电状态或存在内部短路。请检查充电机输出是否正常。</span>
              ) : batteryState.internalResistance > 10 ? (
                <span className="text-amber-400">【警告】 内阻明显增大，电池容量 (SOC) 和健康度 (SOH) 下降。建议执行一次均衡充电或活化放电测试，并准备备件。</span>
              ) : batteryState.temperature > 35 ? (
                <span className="text-yellow-400">【注意】 电池环境温度偏高，将加速电解液干涸和板栅腐蚀。请改善电瓶间通风。</span>
              ) : (
                <span className="text-emerald-400">【正常】 蓄电池组内阻稳定，浮充电压正常，具备可靠的应急启动能力。</span>
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
      <span className="text-indigo-300">{label}</span>
      <span className="font-mono text-emerald-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
    <div className="w-full h-1.5 bg-indigo-900/50 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-indigo-300 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
