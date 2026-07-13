import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Compass, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-steering-pump-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ship-steering-pump-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ship-steering-pump-life';
import { PumpState } from '../../../components/life-warning/ship-steering-pump-life/three-types';

export const View: React.FC = () => {
  const [pumpState, setPumpState] = useState<PumpState>({
    pressure: 12.5, // MPa
    oilTemperature: 45, // Celsius
    flowRate: 120, // L/min
    internalLeakage: 5, // %
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(15000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPumpState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate steering commands (frequent pressure spikes)
        const isSteering = Math.random() > 0.4;
        let newPressure = prev.pressure;
        let newFlow = prev.flowRate;

        if (isSteering) {
            newPressure = 15 + Math.random() * 10; // 15-25 MPa during steering
            newFlow = 150 + Math.random() * 50;
        } else {
            newPressure = 5 + Math.random() * 5; // Standby pressure
            newFlow = 50 + Math.random() * 20;
        }

        // Temperature rises with high pressure and high leakage
        let tempTarget = 40;
        if (newPressure > 20) tempTarget += 20;
        if (prev.internalLeakage > 15) tempTarget += 25; // Leakage generates heat
        const newTemp = prev.oilTemperature + (tempTarget - prev.oilTemperature) * 0.05 + (Math.random() - 0.5);

        // Wear (internal leakage) increases with pressure and temperature
        let wearRate = 0.001;
        if (newPressure > 22) wearRate *= 3;
        if (newTemp > 70) wearRate *= 2; // Oil thins, wear increases
        const newLeakage = Math.min(100, prev.internalLeakage + wearRate);

        const leakagePenalty = Math.max(0, (newLeakage / 30) * 60); // 30% leakage is critical
        const tempPenalty = newTemp > 75 ? 20 : 0;
        const pressurePenalty = newPressure > 28 ? 15 : 0;

        const health = Math.max(0, Math.floor(100 - leakagePenalty - tempPenalty - pressurePenalty));
        
        const baseLife = 25000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          pressure: newPressure,
          flowRate: newFlow,
          oilTemperature: newTemp,
          internalLeakage: newLeakage,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPumpState({
      pressure: 10,
      oilTemperature: 40,
      flowRate: 100,
      internalLeakage: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(25000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <Compass className="w-8 h-8" />
            船舶舵机液压泵寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于系统压力、油温与内泄率的柱塞泵磨损与容积效率评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">液压泵健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>大修/更换液压泵</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              液压系统实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="系统压力 (MPa)" value={pumpState.pressure} max={35} color={pumpState.pressure > 28 ? 'bg-rose-500' : pumpState.pressure > 22 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, pressure: v}))} />
              <ParameterControl label="液压油温 (°C)" value={pumpState.oilTemperature} max={100} color={pumpState.oilTemperature > 75 ? 'bg-rose-500' : pumpState.oilTemperature > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, oilTemperature: v}))} />
              <ParameterControl label="输出流量 (L/min)" value={pumpState.flowRate} max={250} color="bg-blue-500" onChange={(v) => setPumpState(s => ({...s, flowRate: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              容积效率状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">泵体内部泄漏率 (%)</span>
                <span className={`font-mono font-bold text-lg ${pumpState.internalLeakage > 25 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pumpState.internalLeakage.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pumpState.internalLeakage > 25 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${(pumpState.internalLeakage / 40) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(30 / 40) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">舵效迟缓临界值: 30%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
            柱塞泵内部流场与泄漏 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pumpState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${pumpState.internalLeakage > 25 || pumpState.oilTemperature > 75 ? 'text-rose-500' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">失舵风险指数</div>
                <div className={`text-xl font-mono ${pumpState.internalLeakage > 25 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (pumpState.internalLeakage / 35) * 60 + (pumpState.oilTemperature / 90) * 40).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pumpState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="配流盘/柱塞磨损 (内泄增加)" value={(pumpState.internalLeakage / 30) * 100} critical={85} />
              <DiagnosticItem label="油液变质/粘度下降 (高温)" value={(pumpState.oilTemperature / 85) * 100} critical={80} />
              <DiagnosticItem label="系统超压溢流风险" value={(pumpState.pressure / 35) * 100} critical={90} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {pumpState.internalLeakage > 28 ? (
                <span className="text-rose-400 font-bold">【危急】 液压泵内泄严重，容积效率极低，可能导致打舵缓慢甚至失舵！必须立即切换至备用泵，并安排大修。</span>
              ) : pumpState.oilTemperature > 75 ? (
                <span className="text-rose-400 font-bold">【危急】 液压油温过高，油膜极易破裂导致干摩擦烧泵。请立即检查液压油冷却器及冷却水系统。</span>
              ) : pumpState.pressure > 28 ? (
                <span className="text-amber-400">【警告】 系统压力频繁逼近安全阀设定值，可能存在外部机械卡滞或溢流阀故障。建议检查舵杆及舵承。</span>
              ) : pumpState.internalLeakage > 15 ? (
                <span className="text-yellow-400">【注意】 泵体内部已出现明显磨损，内泄率上升导致油温容易升高。建议在下个坞修期进行解体检查。</span>
              ) : (
                <span className="text-emerald-400">【正常】 舵机液压泵运行平稳，压力响应迅速，容积效率高。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
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
