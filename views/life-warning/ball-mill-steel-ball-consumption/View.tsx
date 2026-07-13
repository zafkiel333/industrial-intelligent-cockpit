import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, CircleDashed, Droplets, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ball-mill-steel-ball-consumption/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ball-mill-steel-ball-consumption]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ball-mill-steel-ball-consumption';
import { BallState } from '../../../components/life-warning/ball-mill-steel-ball-consumption/three-types';

export const View: React.FC = () => {
  const [ballState, setBallState] = useState<BallState>({
    oreHardness: 14, // Bond Work Index (kWh/t)
    millSpeed: 75, // % of critical speed
    slurryDensity: 65, // % solids
    ballWearRate: 450, // g/t
    operatingHours: 350, // hours since last full charge
  });

  const [chargeLevel, setChargeLevel] = useState(35); // % volume
  const [estimatedAddDays, setEstimatedAddDays] = useState(5); // Days until next ball addition

  useEffect(() => {
    const interval = setInterval(() => {
      setBallState(prev => {
        const newHours = prev.operatingHours + 1;
        
        const newHardness = Math.max(8, Math.min(25, prev.oreHardness + (Math.random() - 0.5) * 1.5));
        const newSpeed = Math.max(60, Math.min(85, prev.millSpeed + (Math.random() - 0.5) * 0.5));
        const newDensity = Math.max(50, Math.min(80, prev.slurryDensity + (Math.random() - 0.5) * 1.0));

        // Wear rate depends heavily on ore hardness, speed, and inversely on density (too thin = metal-on-metal)
        let baseWear = 300 + (newHardness * 10);
        if (newSpeed > 78) baseWear *= 1.2; // Cataracting causes more impact wear
        if (newDensity < 60) baseWear *= 1.15; // Less cushioning
        
        const newWearRate = Math.max(200, Math.min(1000, prev.ballWearRate + (baseWear - prev.ballWearRate) * 0.1 + (Math.random() - 0.5) * 10));

        // Simulate charge level dropping
        setChargeLevel(c => Math.max(20, c - (newWearRate / 10000)));

        // Estimate days until charge drops below 30% (assuming 24h operation)
        const currentCharge = chargeLevel;
        const dropRatePerHour = newWearRate / 10000;
        const hoursUntil30 = Math.max(0, (currentCharge - 30) / dropRatePerHour);
        setEstimatedAddDays(Math.max(0, Math.floor(hoursUntil30 / 24)));

        return {
          ...prev,
          operatingHours: newHours,
          oreHardness: newHardness,
          millSpeed: newSpeed,
          slurryDensity: newDensity,
          ballWearRate: newWearRate,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chargeLevel]);

  const handleReset = () => {
    setBallState(prev => ({
      ...prev,
      operatingHours: 0,
    }));
    setChargeLevel(40); // Reset to optimal charge
    setEstimatedAddDays(15);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-3">
            <CircleDashed className="w-8 h-8" />
            球磨机钢球消耗预警
          </h1>
          <p className="text-slate-400 mt-1">基于矿石功指数、磨机转速与矿浆浓度的研磨介质动态消耗模型</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">当前充填率</div>
              <div className={`text-2xl font-bold ${chargeLevel > 32 ? 'text-emerald-400' : chargeLevel > 28 ? 'text-amber-400' : 'text-rose-500'}`}>
                {chargeLevel.toFixed(1)}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计加球倒计时</div>
              <div className="text-2xl font-bold text-indigo-400">{estimatedAddDays} <span className="text-sm font-normal">天</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>执行加球作业</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              磨矿工艺参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="矿石邦德功指数 (kWh/t)" value={ballState.oreHardness} max={25} min={5} color={ballState.oreHardness > 18 ? 'bg-rose-500' : ballState.oreHardness > 12 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBallState(s => ({...s, oreHardness: v}))} />
              <ParameterControl label="磨机转速 (% 临界转速)" value={ballState.millSpeed} max={90} min={50} color={ballState.millSpeed > 80 ? 'bg-rose-500' : ballState.millSpeed > 70 ? 'bg-emerald-500' : 'bg-amber-500'} onChange={(v) => setBallState(s => ({...s, millSpeed: v}))} />
              <ParameterControl label="矿浆浓度 (% 固体)" value={ballState.slurryDensity} max={85} min={40} color={ballState.slurryDensity < 55 ? 'bg-rose-500' : ballState.slurryDensity > 75 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBallState(s => ({...s, slurryDensity: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              消耗预测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">实时单耗 (g/t)</span>
                <span className={`font-mono font-bold text-lg ${ballState.ballWearRate > 700 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {ballState.ballWearRate.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${ballState.ballWearRate > 700 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${(ballState.ballWearRate / 1000) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(800 / 1000) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">经济阈值: 800 g/t</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(99,102,241,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            磨机内部钢球运动轨迹与碰撞能量 DEM 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={ballState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${ballState.millSpeed > 80 ? 'text-rose-500' : 'text-indigo-400'}`} />
              <div>
                <div className="text-xs text-slate-400">抛落冲击能量指数</div>
                <div className={`text-xl font-mono ${ballState.millSpeed > 80 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (ballState.millSpeed / 90) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">距上次加球时间</div>
              <div className="text-xl font-mono text-slate-300">
                {ballState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              磨矿效能分析
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="充填率偏低 (效率下降)" value={Math.max(0, (35 - chargeLevel) / 15) * 100} critical={80} />
              <DiagnosticItem label="钢球碎裂风险 (高转速抛落)" value={(ballState.millSpeed / 90) * 100} critical={88} />
              <DiagnosticItem label="衬板直接冲击 (低浓度)" value={Math.max(0, (60 - ballState.slurryDensity) / 20) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-indigo-400">诊断结论与建议：</strong></p>
              {chargeLevel < 28 ? (
                <span className="text-rose-400 font-bold">【危急】 钢球充填率严重不足，磨矿效率大幅下降，且衬板直接受击磨损加剧。必须立即执行加球作业！</span>
              ) : ballState.millSpeed > 82 ? (
                <span className="text-rose-400 font-bold">【危急】 磨机转速过高，钢球呈抛落运动砸向裸露衬板，极易导致钢球碎裂和衬板断裂。请立即降低转速。</span>
              ) : ballState.slurryDensity < 55 ? (
                <span className="text-amber-400">【警告】 矿浆浓度过低，失去缓冲作用，钢球与衬板呈"干磨"状态，单耗急剧上升。建议减少给水或增加给矿。</span>
              ) : estimatedAddDays <= 3 ? (
                <span className="text-yellow-400">【注意】 预计3天内需要加球，请提前准备好对应级配的钢球，并安排停机或在线加球计划。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钢球级配与充填率良好，磨矿参数处于经济运行区间。</span>
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
      <span className="font-mono text-indigo-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
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
