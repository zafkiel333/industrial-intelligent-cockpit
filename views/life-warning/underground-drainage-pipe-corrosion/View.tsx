import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/underground-drainage-pipe-corrosion/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[underground-drainage-pipe-corrosion]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/underground-drainage-pipe-corrosion';
import { PipeState } from '../../../components/life-warning/underground-drainage-pipe-corrosion/three-types';

export const View: React.FC = () => {
  const [pipeState, setPipeState] = useState<PipeState>({
    phValue: 6.5, // pH
    flowVelocity: 2.5, // m/s
    pressure: 1.5, // MPa
    wallThickness: 11.5, // mm (New is 12mm)
    operatingHours: 4500, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(15000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPipeState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate water quality and flow variations
        const newPh = Math.max(3.0, Math.min(8.0, prev.phValue + (Math.random() * 0.2 - 0.1)));
        const newFlow = Math.max(1.0, Math.min(5.0, prev.flowVelocity + (Math.random() * 0.4 - 0.2)));
        const newPressure = Math.max(0.5, Math.min(4.0, prev.pressure + (Math.random() * 0.2 - 0.1)));

        // Corrosion rate depends on pH (acidic is worse), flow velocity (erosion-corrosion), and pressure
        let wearRate = 0.0001;
        if (newPh < 6.0) wearRate *= (7.0 - newPh); // Acidic corrosion
        wearRate *= Math.pow(newFlow / 2.0, 1.5); // Erosion
        if (newPressure > 2.5) wearRate *= 1.2; // Stress corrosion

        const newThickness = Math.max(4.0, prev.wallThickness - wearRate);

        const thicknessPenalty = Math.max(0, (12.0 - newThickness) / 6.0) * 60; // Critical at 6mm
        const phPenalty = newPh < 5.0 ? 15 : 0;
        const pressurePenalty = newPressure > 3.0 ? 15 : 0;

        const health = Math.max(0, Math.floor(100 - thicknessPenalty - phPenalty - pressurePenalty));
        
        const baseLife = 20000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          phValue: newPh,
          flowVelocity: newFlow,
          pressure: newPressure,
          wallThickness: newThickness,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPipeState({
      phValue: 7.0,
      flowVelocity: 2.0,
      pressure: 1.5,
      wallThickness: 12.0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(20000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            井下排水系统管路腐蚀预警
          </h1>
          <p className="text-slate-400 mt-1">基于水质pH、流速与压力的管壁减薄与应力腐蚀综合评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">管路健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
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
            <span>更换管段</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              流体工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="矿水 pH 值" value={pipeState.phValue} max={10} min={2} color={pipeState.phValue < 5.0 ? 'bg-rose-500' : pipeState.phValue < 6.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, phValue: v}))} />
              <ParameterControl label="流速 (m/s)" value={pipeState.flowVelocity} max={6} color={pipeState.flowVelocity > 4.5 ? 'bg-rose-500' : pipeState.flowVelocity > 3.0 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, flowVelocity: v}))} />
              <ParameterControl label="管内压力 (MPa)" value={pipeState.pressure} max={5} color={pipeState.pressure > 3.5 ? 'bg-rose-500' : pipeState.pressure > 2.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPipeState(s => ({...s, pressure: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              管壁厚度状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">当前壁厚 (mm)</span>
                <span className={`font-mono font-bold text-lg ${pipeState.wallThickness < 6.5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pipeState.wallThickness.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pipeState.wallThickness < 6.5 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${(pipeState.wallThickness / 12) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(6 / 12) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">初始: 12mm | 爆管临界值: 6mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
            管路内壁腐蚀坑与流体冲刷 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pipeState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${pipeState.wallThickness < 6.5 || pipeState.pressure > 3.5 ? 'text-rose-500' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">泄漏/爆管风险指数</div>
                <div className={`text-xl font-mono ${pipeState.wallThickness < 6.5 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((12 - pipeState.wallThickness) / 6) * 60 + (pipeState.pressure / 5) * 40).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pipeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
              <DiagnosticItem label="酸性电化学腐蚀 (低pH)" value={pipeState.phValue < 6 ? (6 - pipeState.phValue) * 30 : 0} critical={60} />
              <DiagnosticItem label="冲刷磨损减薄 (高流速)" value={(pipeState.flowVelocity / 6) * 100} critical={75} />
              <DiagnosticItem label="应力腐蚀开裂 (高压+减薄)" value={((12 - pipeState.wallThickness) / 6) * 50 + (pipeState.pressure / 5) * 50} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {pipeState.wallThickness < 6.5 ? (
                <span className="text-rose-400 font-bold">【危急】 管壁厚度已接近安全极限，承压能力大幅下降，随时可能发生爆管泄漏！必须立即停泵并更换该管段。</span>
              ) : pipeState.phValue < 5.0 ? (
                <span className="text-rose-400 font-bold">【危急】 矿水酸性极强，电化学腐蚀速率急剧上升。建议立即检查水处理中和系统，投加碱性药剂。</span>
              ) : pipeState.pressure > 3.5 ? (
                <span className="text-amber-400">【警告】 管内压力偏高，结合管壁减薄趋势，应力腐蚀开裂风险增加。建议检查阀门开度或清理管路结垢。</span>
              ) : pipeState.wallThickness < 9.0 ? (
                <span className="text-yellow-400">【注意】 管壁已出现明显减薄和点蚀坑。建议在下个维护周期进行超声波测厚普查。</span>
              ) : (
                <span className="text-emerald-400">【正常】 管路运行状态良好，腐蚀速率在设计允许范围内。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(2)}</span>
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
