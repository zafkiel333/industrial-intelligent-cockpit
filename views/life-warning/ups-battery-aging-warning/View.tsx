import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Battery, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ups-battery-aging-warning/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ups-battery-aging-warning]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ups-battery-aging-warning';
import { UPSBatteryState } from '../../../components/life-warning/ups-battery-aging-warning/three-types';

export const View: React.FC = () => {
  const [upsState, setUpsState] = useState<UPSBatteryState>({
    capacity: 95, // %
    internalResistance: 5.2, // mOhm
    temperature: 24, // Celsius
    dischargeTime: 120, // minutes
    operatingHours: 8760, // hours (1 year)
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(36); // Months

  useEffect(() => {
    const interval = setInterval(() => {
      setUpsState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate aging
        let newTemp = prev.temperature + (Math.random() - 0.5) * 0.2;
        if (newTemp > 35) newTemp -= 0.5;
        if (newTemp < 20) newTemp += 0.5;

        // Resistance increases, capacity decreases over time
        let agingFactor = 0.0001;
        if (newTemp > 30) agingFactor *= 2; // Heat accelerates aging
        
        const newResistance = prev.internalResistance + agingFactor * 10;
        const newCapacity = Math.max(0, prev.capacity - agingFactor * 5);
        
        // Discharge time correlates with capacity
        const newDischargeTime = Math.max(0, 120 * (newCapacity / 100));

        // Health calculation
        // Capacity < 80% is warning, < 60% is critical
        // Resistance > 10mOhm is warning, > 15mOhm is critical
        const capPenalty = Math.max(0, ((100 - newCapacity) / 40) * 50); 
        const resPenalty = Math.max(0, ((newResistance - 5) / 10) * 50);

        const health = Math.max(0, Math.floor(100 - capPenalty - resPenalty));
        
        const baseLifeMonths = 48; // 4 years typical life
        const remainingLife = Math.max(0, Math.floor(baseLifeMonths * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          temperature: newTemp,
          internalResistance: newResistance,
          capacity: newCapacity,
          dischargeTime: newDischargeTime
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setUpsState({
      capacity: 100,
      internalResistance: 4.5,
      temperature: 22,
      dischargeTime: 120,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(48);
  };

  const handleDischargeTest = () => {
    setUpsState(prev => ({
        ...prev,
        capacity: prev.capacity - 2, // Test consumes some life
        internalResistance: prev.internalResistance + 0.5,
        temperature: prev.temperature + 5 // Heats up during discharge
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Battery className="w-8 h-8" />
            UPS不间断电源电池老化预警
          </h1>
          <p className="text-slate-400 mt-1">基于内阻突变、SOH容量衰减与环境温度的后备电源可靠性评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">电池组健康度 (SOH)</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button onClick={handleDischargeTest} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-amber-400" />
            <span>执行深度放电测试</span>
          </button>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换蓄电池组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              容量与环境参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="实际容量 SOC (%)" value={upsState.capacity} max={100} color={upsState.capacity < 60 ? 'bg-rose-500' : upsState.capacity < 80 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setUpsState(s => ({...s, capacity: v}))} />
              <ParameterControl label="环境/柜内温度 (°C)" value={upsState.temperature} max={50} color={upsState.temperature > 35 ? 'bg-rose-500' : upsState.temperature > 28 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setUpsState(s => ({...s, temperature: v}))} />
              
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">预估后备时间</span>
                <span className={`font-mono font-bold ${upsState.dischargeTime < 30 ? 'text-rose-400 animate-pulse' : upsState.dischargeTime < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {upsState.dischargeTime.toFixed(0)} 分钟
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              单体平均内阻监测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">欧姆内阻 (mΩ)</span>
                <span className={`font-mono font-bold text-2xl ${upsState.internalResistance > 15 ? 'text-rose-500 animate-pulse' : upsState.internalResistance > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {upsState.internalResistance.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${upsState.internalResistance > 15 ? 'bg-rose-500' : upsState.internalResistance > 10 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (upsState.internalResistance / 20) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(10 / 20) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(15 / 20) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>警告: 10.0</span>
                <span>危险: 15.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            电池组容量衰减与内阻 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={upsState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${upsState.capacity < 60 ? 'text-rose-500 animate-bounce' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">断电宕机风险指数</div>
                <div className={`text-xl font-mono ${upsState.capacity < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((100 - upsState.capacity) / 40) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计浮充时间</div>
              <div className="text-xl font-mono text-slate-300">
                {upsState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="极板硫化/内阻增大" value={(upsState.internalResistance / 20) * 100} critical={75} />
              <DiagnosticItem label="容量衰减 (SOH下降)" value={((100 - upsState.capacity) / 50) * 100} critical={80} />
              <DiagnosticItem label="热失控风险 (高温)" value={(upsState.temperature / 50) * 100} critical={70} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {upsState.capacity < 60 || upsState.internalResistance > 15 ? (
                <span className="text-rose-400 font-bold">【危急】 电池组健康度极低，容量严重衰减或内阻过大。在市电中断时将无法提供足够的后备时间，极易导致核心设备宕机。必须立即更换整组蓄电池！</span>
              ) : upsState.capacity < 80 || upsState.internalResistance > 10 ? (
                <span className="text-amber-400">【警告】 电池组出现明显老化迹象，后备时间缩短。建议排查落后单体，执行一次充放电活化，并准备更换计划。</span>
              ) : upsState.temperature > 30 ? (
                <span className="text-yellow-400">【注意】 电池柜环境温度偏高，将加速电池干涸和老化。请检查机房空调系统。</span>
              ) : (
                <span className="text-emerald-400">【正常】 UPS蓄电池组状态良好，内阻和容量正常，后备电源系统可靠。</span>
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
      <span className="text-slate-400">{label}</span>
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
