import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Sun, Battery, Lightbulb } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/nav-mark-battery-light-life/ThreeScene';
import { NavMarkState } from '../../../components/life-warning/nav-mark-battery-light-life/three-types';

export const View: React.FC = () => {
  const [navState, setNavState] = useState<NavMarkState>({
    batteryCapacity: 85, // %
    chargeRate: 45, // W
    ledLuminousFlux: 95, // %
    temperature: 25, // Celsius
    operatingDays: 450, // days
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(1200); // Days

  useEffect(() => {
    const interval = setInterval(() => {
      setNavState(prev => {
        const newDays = prev.operatingDays + 1/24; // Simulate time passing faster
        
        // Simulate Day/Night cycle for charging
        const hourOfDay = (newDays * 24) % 24;
        const isDaytime = hourOfDay > 6 && hourOfDay < 18;
        
        let newChargeRate = 0;
        if (isDaytime) {
            // Peak sun around noon (hour 12)
            const sunIntensity = Math.max(0, 1 - Math.abs(hourOfDay - 12) / 6);
            newChargeRate = sunIntensity * 80 + Math.random() * 20; // Max ~100W
        }

        // Battery logic
        let newBattery = prev.batteryCapacity;
        if (isDaytime) {
            newBattery = Math.min(100, prev.batteryCapacity + (newChargeRate / 100) * 0.5);
        } else {
            newBattery = Math.max(0, prev.batteryCapacity - 0.8); // Discharge at night
        }

        // Temperature fluctuates with day/night
        const targetTemp = isDaytime ? 35 : 15;
        const newTemp = prev.temperature + (targetTemp - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // LED Degradation (accelerated by high temp and low battery voltage)
        let ledDegradation = 0.001;
        if (newTemp > 30) ledDegradation *= 2;
        if (newBattery < 20) ledDegradation *= 1.5;
        const newFlux = Math.max(0, prev.ledLuminousFlux - ledDegradation);

        // Health calculation
        const batteryPenalty = newBattery < 30 ? (30 - newBattery) * 2 : 0;
        const ledPenalty = Math.max(0, (100 - newFlux) * 1.5);
        const health = Math.max(0, Math.floor(100 - batteryPenalty - ledPenalty));
        
        const baseLife = 1825; // ~5 years
        const remainingLife = Math.max(0, Math.floor((baseLife - newDays) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingDays: newDays,
          batteryCapacity: newBattery,
          chargeRate: newChargeRate,
          temperature: newTemp,
          ledLuminousFlux: newFlux,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setNavState({
      batteryCapacity: 100,
      chargeRate: 0,
      ledLuminousFlux: 100,
      temperature: 25,
      operatingDays: 0,
    });
    setHealthScore(100);
    setEstimatedLife(1825);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
            <Lightbulb className="w-8 h-8" />
            航标灯电池及光源寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于充放电循环、光通量衰减与环境温度的浮标能源系统评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">系统健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-yellow-400">{estimatedLife} <span className="text-sm font-normal">天</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换电池与光源</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              能源与环境监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="太阳能充电功率 (W)" value={navState.chargeRate} max={120} color="bg-yellow-500" onChange={(v) => setNavState(s => ({...s, chargeRate: v}))} icon={<Sun className="w-4 h-4" />} />
              <ParameterControl label="电池剩余电量 (%)" value={navState.batteryCapacity} max={100} color={navState.batteryCapacity < 20 ? 'bg-rose-500' : navState.batteryCapacity < 40 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setNavState(s => ({...s, batteryCapacity: v}))} icon={<Battery className="w-4 h-4" />} />
              <ParameterControl label="环境/内部温度 (°C)" value={navState.temperature} max={60} min={-20} color={navState.temperature > 45 || navState.temperature < 0 ? 'bg-rose-500' : 'bg-sky-500'} onChange={(v) => setNavState(s => ({...s, temperature: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              光源衰减状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">LED 光通量保持率 (%)</span>
                <span className={`font-mono font-bold text-lg ${navState.ledLuminousFlux < 70 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {navState.ledLuminousFlux.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${navState.ledLuminousFlux < 70 ? 'bg-rose-500' : 'bg-yellow-500'}`} style={{ width: `${navState.ledLuminousFlux}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '70%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">视距不达标临界值: 70%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#050505] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(250,204,21,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            浮标能源流动与光源状态 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={navState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Lightbulb className={`w-6 h-6 ${navState.ledLuminousFlux < 70 || navState.batteryCapacity < 10 ? 'text-rose-500 animate-pulse' : 'text-yellow-400'}`} />
              <div>
                <div className="text-xs text-slate-400">熄灯/弱光风险指数</div>
                <div className={`text-xl font-mono ${navState.ledLuminousFlux < 70 || navState.batteryCapacity < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((100 - navState.ledLuminousFlux) / 30) * 50 + ((100 - navState.batteryCapacity) / 90) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">在役运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {Math.floor(navState.operatingDays)} <span className="text-sm">天</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="电池深度放电/老化" value={100 - navState.batteryCapacity} critical={80} />
              <DiagnosticItem label="LED 光衰 (视距不足)" value={100 - navState.ledLuminousFlux} critical={30} />
              <DiagnosticItem label="太阳能板遮挡/损坏" value={navState.chargeRate === 0 && (navState.operatingDays * 24 % 24 > 6 && navState.operatingDays * 24 % 24 < 18) ? 100 : 0} critical={50} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-yellow-400">诊断结论与建议：</strong></p>
              {navState.batteryCapacity < 10 ? (
                <span className="text-rose-400 font-bold">【危急】 电池电量即将耗尽，航标灯面临熄灭风险！请立即检查太阳能充电板是否被鸟粪遮挡或损坏。</span>
              ) : navState.ledLuminousFlux < 70 ? (
                <span className="text-rose-400 font-bold">【危急】 LED 光源衰减严重，有效光强已低于标准要求，可能导致船舶触礁。必须尽快更换灯器。</span>
              ) : navState.batteryCapacity < 30 ? (
                <span className="text-amber-400">【警告】 电池处于低电量状态，若遇连续阴雨天可能导致断电。建议监控后续充电情况。</span>
              ) : navState.temperature > 45 ? (
                <span className="text-yellow-400">【注意】 内部温度偏高，可能加速电池老化和 LED 光衰。</span>
              ) : (
                <span className="text-emerald-400">【正常】 航标灯能源系统充放电正常，光源亮度符合航海保障标准。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange, icon }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void, icon?: React.ReactNode }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300 flex items-center gap-1">{icon}{label}</span>
      <span className="font-mono text-yellow-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
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
