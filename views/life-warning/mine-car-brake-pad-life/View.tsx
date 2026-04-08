import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Truck, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/mine-car-brake-pad-life/ThreeScene';
import { BrakePadState } from '../../../components/life-warning/mine-car-brake-pad-life/three-types';

export const View: React.FC = () => {
  const [brakeState, setBrakeState] = useState<BrakePadState>({
    temperature: 150, // Celsius
    brakingForce: 0, // kN
    padThickness: 18.5, // mm (New is 20mm)
    frictionCoefficient: 0.42, // 0-1
    operatingHours: 850, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(2100); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBrakeState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate driving cycle (braking vs coasting/accelerating)
        const isBraking = Math.random() > 0.7; // 30% of the time braking
        let newForce = prev.brakingForce;
        
        if (isBraking) {
            newForce = Math.min(50, prev.brakingForce + 10 + Math.random() * 5);
        } else {
            newForce = Math.max(0, prev.brakingForce - 15);
        }

        // Temperature dynamics
        let newTemp = prev.temperature;
        if (newForce > 0) {
            // Heating up during braking
            newTemp += (newForce * 0.5) * (prev.frictionCoefficient / 0.4);
        } else {
            // Cooling down
            newTemp = Math.max(50, newTemp - (newTemp - 50) * 0.05);
        }

        // Friction coefficient drops at high temps (brake fade)
        let newFriction = 0.42;
        if (newTemp > 350) {
            newFriction = Math.max(0.2, 0.42 - (newTemp - 350) * 0.001);
        }

        // Wear rate depends on force and temperature
        let wearRate = 0.00005;
        if (newForce > 0) {
            wearRate += (newForce / 50) * 0.001;
            if (newTemp > 300) wearRate *= 1.5;
            if (newTemp > 450) wearRate *= 3.0; // Accelerated wear at extreme temps
        }

        const newThickness = Math.max(2.0, prev.padThickness - wearRate);

        const thicknessPenalty = Math.max(0, (20.0 - newThickness) / 15.0) * 60; // Critical at 5mm
        const tempPenalty = newTemp > 400 ? 20 : 0;
        const fadePenalty = newFriction < 0.3 ? 20 : 0;

        const health = Math.max(0, Math.floor(100 - thicknessPenalty - tempPenalty - fadePenalty));
        
        const baseLife = 3000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          brakingForce: newForce,
          temperature: newTemp,
          frictionCoefficient: newFriction,
          padThickness: newThickness,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBrakeState({
      temperature: 50,
      brakingForce: 0,
      padThickness: 20.0,
      frictionCoefficient: 0.42,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(3000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-rose-500 flex items-center gap-3">
            <Truck className="w-8 h-8" />
            矿车制动片磨损寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于制动热衰退与摩擦磨损的重载矿车制动系统安全评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">制动系统健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-rose-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换制动片</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              制动工况实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="制动盘温度 (°C)" value={brakeState.temperature} max={600} color={brakeState.temperature > 450 ? 'bg-rose-500' : brakeState.temperature > 300 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBrakeState(s => ({...s, temperature: v}))} />
              <ParameterControl label="制动力 (kN)" value={brakeState.brakingForce} max={60} color="bg-sky-500" onChange={(v) => setBrakeState(s => ({...s, brakingForce: v}))} />
              <ParameterControl label="摩擦系数 (μ)" value={brakeState.frictionCoefficient} max={0.6} min={0.1} color={brakeState.frictionCoefficient < 0.25 ? 'bg-rose-500' : brakeState.frictionCoefficient < 0.35 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBrakeState(s => ({...s, frictionCoefficient: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-rose-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              制动片磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">当前厚度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${brakeState.padThickness < 6.0 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {brakeState.padThickness.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${brakeState.padThickness < 6.0 ? 'bg-rose-500' : 'bg-rose-500'}`} style={{ width: `${(brakeState.padThickness / 20) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(5 / 20) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">初始: 20mm | 更换限值: 5mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(244,63,94,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            制动盘热辐射与摩擦片磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={brakeState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${brakeState.padThickness < 6.0 || brakeState.frictionCoefficient < 0.25 ? 'text-rose-500' : 'text-rose-400'}`} />
              <div>
                <div className="text-xs text-slate-400">制动失效风险指数</div>
                <div className={`text-xl font-mono ${brakeState.padThickness < 6.0 || brakeState.frictionCoefficient < 0.25 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((20 - brakeState.padThickness) / 15) * 50 + ((0.42 - brakeState.frictionCoefficient) / 0.2) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {brakeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="摩擦片过度磨损 (厚度薄)" value={((20 - brakeState.padThickness) / 15) * 100} critical={90} />
              <DiagnosticItem label="热衰退失效 (高温导致摩擦力下降)" value={brakeState.temperature > 300 ? (brakeState.temperature - 300) / 2 : 0} critical={75} />
              <DiagnosticItem label="制动盘热疲劳裂纹风险" value={(brakeState.temperature / 600) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-rose-400">诊断结论与建议：</strong></p>
              {brakeState.padThickness < 5.5 ? (
                <span className="text-rose-400 font-bold">【危急】 制动片厚度已达更换极限，极易磨损到背板导致制动盘损坏和刹车失灵！必须立即回场更换。</span>
              ) : brakeState.frictionCoefficient < 0.25 ? (
                <span className="text-rose-400 font-bold">【危急】 发生严重热衰退，摩擦系数过低，制动距离将大幅延长。请立即启用辅助制动(如缓速器)并停车散热。</span>
              ) : brakeState.temperature > 400 ? (
                <span className="text-amber-400">【警告】 制动盘温度过高，磨损加剧且存在热衰退风险。建议司机改变驾驶习惯，多使用发动机制动。</span>
              ) : brakeState.padThickness < 8.0 ? (
                <span className="text-yellow-400">【注意】 制动片磨损已过半。建议在下个保养周期准备备件并安排更换。</span>
              ) : (
                <span className="text-emerald-400">【正常】 制动系统状态良好，摩擦系数稳定，热量散发正常。</span>
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
      <span className="font-mono text-rose-400">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
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
