import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Settings, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/underground-loader-gear-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[underground-loader-gear-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/underground-loader-gear-life';
import { GearboxState } from '../../../components/life-warning/underground-loader-gear-life/three-types';

export const View: React.FC = () => {
  const [gearState, setGearState] = useState<GearboxState>({
    torque: 800, // Nm
    oilTemperature: 65, // Celsius
    vibration: 2.5, // mm/s
    gearWear: 45, // um
    operatingHours: 3200, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(6800); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setGearState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate load cycles (mucking, tramming, dumping)
        const loadCycle = Math.random();
        let newTorque = prev.torque;
        if (loadCycle > 0.8) { // Mucking (high load)
            newTorque = Math.max(1500, Math.min(2500, prev.torque + (Math.random() * 500)));
        } else if (loadCycle > 0.4) { // Tramming loaded
            newTorque = Math.max(800, Math.min(1500, prev.torque + (Math.random() * 200 - 100)));
        } else { // Empty/Idling
            newTorque = Math.max(200, Math.min(800, prev.torque - 200));
        }

        // Temperature rises with sustained high torque
        let tempTarget = 60 + (newTorque / 2500) * 40;
        // Vibration increases temperature slightly due to friction
        tempTarget += prev.vibration * 2;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        // Wear rate depends on torque and temperature (oil film breakdown)
        let wearRate = 0.005;
        wearRate *= (newTorque / 1000);
        if (newTemp > 90) wearRate *= 2.0; // Oil viscosity drops
        if (newTemp > 105) wearRate *= 5.0; // Severe boundary lubrication

        const newWear = Math.min(300, prev.gearWear + wearRate);

        // Vibration increases with wear and torque
        const baseVib = 1.0 + (newWear / 200) * 8.0;
        const newVib = Math.max(1.0, Math.min(20.0, baseVib + (newTorque / 2500) * 2.0 + (Math.random() - 0.5)));

        const wearPenalty = Math.max(0, (newWear / 150) * 40);
        const tempPenalty = Math.max(0, (newTemp - 85) / 25) * 30;
        const vibPenalty = Math.max(0, (newVib - 7.1) / 4) * 30;

        const health = Math.max(0, Math.floor(100 - wearPenalty - tempPenalty - vibPenalty));
        
        const baseLife = 10000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          torque: newTorque,
          oilTemperature: newTemp,
          vibration: newVib,
          gearWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setGearState({
      torque: 500,
      oilTemperature: 50,
      vibration: 1.0,
      gearWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(10000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-pink-500 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            地下装载机变速箱齿轮寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于扭矩、油温与振动的行星齿轮点蚀与磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">变速箱健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-pink-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>大修/更换齿轮组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-pink-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              传动工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="输出扭矩 (Nm)" value={gearState.torque} max={2500} color={gearState.torque > 2000 ? 'bg-rose-500' : gearState.torque > 1500 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearState(s => ({...s, torque: v}))} />
              <ParameterControl label="润滑油温 (°C)" value={gearState.oilTemperature} max={120} color={gearState.oilTemperature > 100 ? 'bg-rose-500' : gearState.oilTemperature > 85 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearState(s => ({...s, oilTemperature: v}))} />
              <ParameterControl label="箱体振动速度 (mm/s)" value={gearState.vibration} max={15} color={gearState.vibration > 11.2 ? 'bg-rose-500' : gearState.vibration > 7.1 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearState(s => ({...s, vibration: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-pink-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              齿面磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">齿面磨损/点蚀深度 (μm)</span>
                <span className={`font-mono font-bold text-lg ${gearState.gearWear > 150 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {gearState.gearWear.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${gearState.gearWear > 150 ? 'bg-rose-500' : 'bg-pink-500'}`} style={{ width: `${(gearState.gearWear / 200) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(150 / 200) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">大修临界值: 150 μm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(236,72,153,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            齿轮啮合热应力与磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={gearState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${gearState.vibration > 11.2 ? 'text-rose-500' : 'text-pink-400'}`} />
              <div>
                <div className="text-xs text-slate-400">断齿/胶合风险指数</div>
                <div className={`text-xl font-mono ${gearState.vibration > 11.2 || gearState.oilTemperature > 105 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (gearState.vibration / 15) * 50 + (gearState.oilTemperature / 120) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {gearState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-pink-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="齿面接触疲劳 (点蚀/剥落)" value={(gearState.gearWear / 180) * 100} critical={83} />
              <DiagnosticItem label="润滑失效/胶合 (高温)" value={(gearState.oilTemperature / 110) * 100} critical={90} />
              <DiagnosticItem label="齿根弯曲疲劳 (高扭矩/振动)" value={(gearState.vibration / 12) * 100} critical={93} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-pink-400">诊断结论与建议：</strong></p>
              {gearState.vibration > 11.2 ? (
                <span className="text-rose-400 font-bold">【危急】 变速箱振动速度超过 11.2 mm/s (ISO 10816 危险区)，极可能已发生断齿或严重剥落！必须立即停机开箱检查。</span>
              ) : gearState.oilTemperature > 100 ? (
                <span className="text-rose-400 font-bold">【危急】 润滑油温过高，油膜极易破裂导致齿面胶合。请立即减载怠速冷却，并检查冷却器和油位。</span>
              ) : gearState.gearWear > 150 ? (
                <span className="text-amber-400">【警告】 齿面磨损深度已达大修标准，齿廓变形导致啮合冲击增大。建议安排近期进行变速箱大修。</span>
              ) : gearState.vibration > 7.1 ? (
                <span className="text-yellow-400">【注意】 振动水平处于报警区，可能存在早期点蚀或轴承轻微磨损。建议进行油液铁谱分析。</span>
              ) : (
                <span className="text-emerald-400">【正常】 变速箱运行平稳，油温正常，齿轮啮合状态良好。</span>
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
      <span className="font-mono text-pink-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
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
