import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Settings, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/quay-crane-gearbox-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[quay-crane-gearbox-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/quay-crane-gearbox-life';
import { GearboxState } from '../../../components/life-warning/quay-crane-gearbox-life/three-types';

export const View: React.FC = () => {
  const [gearboxState, setGearboxState] = useState<GearboxState>({
    inputRpm: 1500,
    loadTorque: 50, // kNm
    oilTemperature: 45, // Celsius
    vibrationLevel: 2.5, // mm/s
    gearWear: 10, // %
    operatingHours: 15000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(25000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setGearboxState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate crane operation cycle (hoisting, lowering, idle)
        const cyclePhase = Math.random();
        let newRpm = prev.inputRpm;
        let newTorque = prev.loadTorque;

        if (cyclePhase > 0.6) {
            // Hoisting heavy load
            newRpm = 1450 + Math.random() * 50;
            newTorque = 80 + Math.random() * 20;
        } else if (cyclePhase > 0.3) {
            // Lowering/Empty
            newRpm = 1550 + Math.random() * 50;
            newTorque = 20 + Math.random() * 10;
        } else {
            // Idle/Standby
            newRpm = 0;
            newTorque = 0;
        }

        // Oil temperature dynamics
        let tempTarget = 40;
        if (newRpm > 0) {
            tempTarget += (newTorque / 100) * 40; // Load increases temp
            if (prev.gearWear > 50) tempTarget += 15; // Worn gears generate more heat
        }
        const newTemp = prev.oilTemperature + (tempTarget - prev.oilTemperature) * 0.05;

        // Vibration increases with wear, load, and speed
        let vibTarget = 1.0;
        if (newRpm > 0) {
            vibTarget += (newRpm / 1500) * 1.5;
            vibTarget += (newTorque / 100) * 1.0;
            vibTarget += (prev.gearWear / 100) * 5.0; // Wear has huge impact on vibration
        }
        const newVib = prev.vibrationLevel + (vibTarget - prev.vibrationLevel) * 0.1;

        // Gear wear (pitting/spalling)
        let wearRate = 0.0005;
        if (newTorque > 80) wearRate *= 3; // Heavy loads cause fatigue
        if (newTemp > 80) wearRate *= 2; // Poor lubrication at high temp
        if (newVib > 7.1) wearRate *= 5; // Severe vibration accelerates wear exponentially
        
        const newWear = Math.min(100, prev.gearWear + wearRate);

        const wearPenalty = Math.max(0, (newWear / 100) * 50);
        const vibPenalty = Math.max(0, (newVib - 4.5) / 6.5) * 30; // ISO 10816: >4.5 is restricted, >7.1 is dangerous
        const tempPenalty = newTemp > 85 ? 20 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - vibPenalty - tempPenalty));
        
        const baseLife = 40000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          inputRpm: newRpm,
          loadTorque: newTorque,
          oilTemperature: newTemp,
          vibrationLevel: newVib,
          gearWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setGearboxState({
      inputRpm: 0,
      loadTorque: 0,
      oilTemperature: 40,
      vibrationLevel: 1.0,
      gearWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(40000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-500 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            岸桥起升机构减速机寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于振动频谱与油温的齿轮点蚀、剥落及疲劳寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">减速机健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-violet-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况与状态监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="负载扭矩 (kNm)" value={gearboxState.loadTorque} max={120} color={gearboxState.loadTorque > 90 ? 'bg-rose-500' : gearboxState.loadTorque > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearboxState(s => ({...s, loadTorque: v}))} />
              <ParameterControl label="润滑油温 (°C)" value={gearboxState.oilTemperature} max={100} color={gearboxState.oilTemperature > 85 ? 'bg-rose-500' : gearboxState.oilTemperature > 70 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearboxState(s => ({...s, oilTemperature: v}))} />
              <ParameterControl label="箱体振动烈度 (mm/s)" value={gearboxState.vibrationLevel} max={15} color={gearboxState.vibrationLevel > 7.1 ? 'bg-rose-500' : gearboxState.vibrationLevel > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setGearboxState(s => ({...s, vibrationLevel: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-violet-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              齿面疲劳损伤状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">齿面点蚀/剥落率 (%)</span>
                <span className={`font-mono font-bold text-lg ${gearboxState.gearWear > 60 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {gearboxState.gearWear.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${gearboxState.gearWear > 60 ? 'bg-rose-500' : 'bg-violet-500'}`} style={{ width: `${gearboxState.gearWear}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '60%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">断齿风险临界值: 60%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            齿轮啮合、油浴润滑与振动 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={gearboxState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${gearboxState.vibrationLevel > 7.1 ? 'text-rose-500 animate-bounce' : 'text-violet-400'}`} />
              <div>
                <div className="text-xs text-slate-400">振动异常指数 (ISO 10816)</div>
                <div className={`text-xl font-mono ${gearboxState.vibrationLevel > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (gearboxState.vibrationLevel / 11) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {gearboxState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="齿面接触疲劳 (点蚀/剥落)" value={gearboxState.gearWear} critical={60} />
              <DiagnosticItem label="轴承/齿轮异常振动" value={(gearboxState.vibrationLevel / 11) * 100} critical={65} />
              <DiagnosticItem label="润滑失效 (油温过高)" value={(gearboxState.oilTemperature / 100) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-violet-400">诊断结论与建议：</strong></p>
              {gearboxState.vibrationLevel > 7.1 ? (
                <span className="text-rose-400 font-bold">【危急】 振动烈度超标，可能已发生严重断齿或轴承损坏！必须立即停机开箱检查，防止引发坠箱事故。</span>
              ) : gearboxState.gearWear > 60 ? (
                <span className="text-rose-400 font-bold">【危急】 齿面剥落严重，承载能力大幅下降，断齿风险极高。建议尽快安排大修更换齿轮组。</span>
              ) : gearboxState.oilTemperature > 85 ? (
                <span className="text-amber-400">【警告】 润滑油温过高，油膜承载力下降。请检查冷却系统或是否超载运行，建议取样进行油液分析。</span>
              ) : gearboxState.vibrationLevel > 4.5 ? (
                <span className="text-yellow-400">【注意】 振动处于受限区，齿轮或轴承存在早期磨损。建议缩短状态监测周期，关注频谱变化。</span>
              ) : (
                <span className="text-emerald-400">【正常】 减速机运行平稳，振动和油温均在正常范围内，齿轮啮合良好。</span>
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
      <span className="font-mono text-violet-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
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
