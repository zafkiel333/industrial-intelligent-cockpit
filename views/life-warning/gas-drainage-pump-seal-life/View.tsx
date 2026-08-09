import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Wind, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/gas-drainage-pump-seal-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[gas-drainage-pump-seal-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/gas-drainage-pump-seal-life';
import { PumpSealState } from '../../../components/life-warning/gas-drainage-pump-seal-life/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<PumpSealState>({
    waterLevel: 95, // %
    waterTemperature: 25, // Celsius
    vacuumDegree: 85, // kPa
    sealWear: 15, // %
    operatingHours: 3200, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(4500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate water supply and temperature
        let newLevel = prev.waterLevel;
        // Water evaporates/leaks over time, faster if hot
        newLevel -= 0.05 * (prev.waterTemperature / 25);
        // Random refill/fluctuation
        if (Math.random() > 0.8) newLevel += Math.random() * 2;
        newLevel = Math.max(0, Math.min(100, newLevel));

        // Temperature rises if water level is low or vacuum is high
        let tempTarget = 25;
        if (newLevel < 60) tempTarget += 30;
        if (prev.vacuumDegree > 90) tempTarget += 15;
        const newTemp = prev.waterTemperature + (tempTarget - prev.waterTemperature) * 0.05 + (Math.random() - 0.5);

        // Wear increases with temperature (cavitation/boiling) and low water level
        let wearRate = 0.005;
        if (newTemp > 60) wearRate *= 3;
        if (newLevel < 50) wearRate *= 5; // Dry friction
        const newWear = Math.min(100, prev.sealWear + wearRate);

        // Vacuum drops if seal is worn or water level is low
        let newVacuum = 85;
        if (newWear > 50) newVacuum -= (newWear - 50) * 0.5;
        if (newLevel < 70) newVacuum -= (70 - newLevel) * 0.8;
        newVacuum = Math.max(0, Math.min(100, newVacuum + (Math.random() - 0.5)));

        const wearPenalty = Math.max(0, (newWear / 100) * 50);
        const levelPenalty = Math.max(0, (70 - newLevel) / 70) * 30;
        const tempPenalty = Math.max(0, (newTemp - 50) / 30) * 20;

        const health = Math.max(0, Math.floor(100 - wearPenalty - levelPenalty - tempPenalty));
        
        const baseLife = 8000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          waterLevel: newLevel,
          waterTemperature: newTemp,
          vacuumDegree: newVacuum,
          sealWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      waterLevel: 100,
      waterTemperature: 20,
      vacuumDegree: 90,
      sealWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(8000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-3">
            <Wind className="w-8 h-8" />
            瓦斯抽采泵站密封水环寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于水位、水温与真空度的水环真空泵密封失效与叶轮汽蚀评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">密封系统健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
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
            <span>更换叶轮/分配板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              水环工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="工作液位 (%)" value={sealState.waterLevel} max={100} color={sealState.waterLevel < 60 ? 'bg-rose-500' : sealState.waterLevel < 80 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, waterLevel: v}))} />
              <ParameterControl label="工作水温 (°C)" value={sealState.waterTemperature} max={80} color={sealState.waterTemperature > 60 ? 'bg-rose-500' : sealState.waterTemperature > 45 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, waterTemperature: v}))} />
              <ParameterControl label="抽气真空度 (kPa)" value={sealState.vacuumDegree} max={100} color={sealState.vacuumDegree < 60 ? 'bg-rose-500' : sealState.vacuumDegree < 75 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, vacuumDegree: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              内部磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">叶轮/分配板磨损率 (%)</span>
                <span className={`font-mono font-bold text-lg ${sealState.sealWear > 75 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {sealState.sealWear.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${sealState.sealWear > 75 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${sealState.sealWear}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '75%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">密封失效临界值: 75%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(45,212,191,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            水环动态形成与叶轮汽蚀 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${sealState.vacuumDegree < 60 ? 'text-rose-500' : 'text-teal-400'}`} />
              <div>
                <div className="text-xs text-slate-400">抽采失效风险指数</div>
                <div className={`text-xl font-mono ${sealState.vacuumDegree < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((100 - sealState.vacuumDegree) / 40) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {sealState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
              <DiagnosticItem label="水环破坏 (液位过低)" value={sealState.waterLevel < 80 ? (80 - sealState.waterLevel) * 2.5 : 0} critical={50} />
              <DiagnosticItem label="叶轮汽蚀损伤 (水温过高)" value={(sealState.waterTemperature / 80) * 100} critical={75} />
              <DiagnosticItem label="分配板磨损内漏 (真空度下降)" value={sealState.sealWear} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-teal-400">诊断结论与建议：</strong></p>
              {sealState.vacuumDegree < 60 ? (
                <span className="text-rose-400 font-bold">【危急】 真空度严重下降，瓦斯抽采能力丧失！可能由于水环破裂或分配板严重磨损导致内漏。必须立即停机检修。</span>
              ) : sealState.waterTemperature > 60 ? (
                <span className="text-rose-400 font-bold">【危急】 工作水温过高，水环内极易发生汽蚀，严重破坏叶轮。请立即检查冷却水循环系统。</span>
              ) : sealState.waterLevel < 60 ? (
                <span className="text-amber-400">【警告】 工作液位偏低，无法形成完整水环进行有效密封。请检查补水管路及阀门。</span>
              ) : sealState.sealWear > 50 ? (
                <span className="text-yellow-400">【注意】 叶轮与分配板间隙增大，容积效率开始下降。建议在下次检修时测量间隙并考虑更换分配板。</span>
              ) : (
                <span className="text-emerald-400">【正常】 水环真空泵运行稳定，密封水环形成良好，抽采真空度达标。</span>
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
