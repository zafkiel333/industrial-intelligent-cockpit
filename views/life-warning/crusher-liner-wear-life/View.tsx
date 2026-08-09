import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Layers, HardHat, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/crusher-liner-wear-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[crusher-liner-wear-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/crusher-liner-wear-life';
import { LinerState } from '../../../components/life-warning/crusher-liner-wear-life/three-types';

export const View: React.FC = () => {
  const [linerState, setLinerState] = useState<LinerState>({
    materialAbrasiveness: 5, // Index 1-10
    throughput: 500, // tons/hour
    impactForce: 150, // kN
    wearDepth: 10, // mm
    operatingHours: 1200, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(2500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setLinerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        const newThroughput = Math.max(100, Math.min(1000, prev.throughput + (Math.random() - 0.5) * 50));
        const newAbrasiveness = Math.max(1, Math.min(10, prev.materialAbrasiveness + (Math.random() > 0.9 ? (Math.random() - 0.5) * 2 : 0)));
        
        const newImpact = Math.max(50, Math.min(500, prev.impactForce + (newThroughput - prev.throughput) * 0.5 + (Math.random() - 0.5) * 20));

        const wearRate = (newThroughput / 1000) * (newAbrasiveness / 5) * 0.02;
        const newWearDepth = Math.min(80, prev.wearDepth + wearRate);

        const wearPenalty = Math.max(0, (newWearDepth / 60) * 60);
        const impactPenalty = Math.max(0, (newImpact - 300) / 200) * 40;

        const health = Math.max(0, Math.floor(100 - wearPenalty - impactPenalty));
        
        const baseLife = 4000;
        const wearFactor = Math.pow(newAbrasiveness / 5, 1.2);
        const remainingLife = Math.max(0, Math.floor((baseLife / wearFactor) * (health / 100) - (newHours * 0.3)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          throughput: newThroughput,
          materialAbrasiveness: newAbrasiveness,
          impactForce: newImpact,
          wearDepth: newWearDepth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setLinerState({
      materialAbrasiveness: 5,
      throughput: 400,
      impactForce: 100,
      wearDepth: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(4000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Layers className="w-8 h-8" />
            破碎机衬板磨损寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于物料磨蚀性、处理量与冲击载荷的腔型演变评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">衬板健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换定/动锥衬板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              破碎工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="物料磨蚀性指数 (Ai)" value={linerState.materialAbrasiveness} max={10} color={linerState.materialAbrasiveness > 8 ? 'bg-rose-500' : linerState.materialAbrasiveness > 5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setLinerState(s => ({...s, materialAbrasiveness: v}))} />
              <ParameterControl label="实时处理量 (t/h)" value={linerState.throughput} max={1200} color={linerState.throughput > 900 ? 'bg-rose-500' : linerState.throughput > 600 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setLinerState(s => ({...s, throughput: v}))} />
              <ParameterControl label="瞬时冲击载荷 (kN)" value={linerState.impactForce} max={600} color={linerState.impactForce > 400 ? 'bg-rose-500' : linerState.impactForce > 250 ? 'bg-amber-500' : 'bg-blue-500'} onChange={(v) => setLinerState(s => ({...s, impactForce: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              腔型磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">平行区磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${linerState.wearDepth > 50 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {linerState.wearDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${linerState.wearDepth > 50 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${(linerState.wearDepth / 80) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(60 / 80) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废极限: 60 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            破碎腔型演变与冲击载荷 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={linerState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${linerState.impactForce > 400 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">过铁/硬岩冲击风险</div>
                <div className={`text-xl font-mono ${linerState.impactForce > 400 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (linerState.impactForce / 600) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {linerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="平行区磨料磨损 (排矿变粗)" value={(linerState.wearDepth / 60) * 100} critical={85} />
              <DiagnosticItem label="衬板塑性变形/开裂 (高冲击)" value={(linerState.impactForce / 600) * 100} critical={80} />
              <DiagnosticItem label="腔型破坏 (效率下降)" value={Math.max(0, (linerState.wearDepth - 20) / 40) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {linerState.wearDepth > 55 ? (
                <span className="text-rose-400 font-bold">【危急】 衬板磨损已达极限，平行区消失，产品粒度严重超标，且存在衬板碎裂卡机的风险！必须立即停机更换衬板。</span>
              ) : linerState.impactForce > 450 ? (
                <span className="text-rose-400 font-bold">【危急】 频繁检测到极高冲击载荷，可能混入不可破碎物（如铁件）或岩石硬度超标。请立即检查除铁器及给料情况。</span>
              ) : linerState.wearDepth > 40 ? (
                <span className="text-amber-400">【警告】 衬板磨损明显，破碎腔型已发生改变，建议调整排矿口（CSS）以维持产品粒度，并准备备件。</span>
              ) : linerState.materialAbrasiveness > 8 ? (
                <span className="text-yellow-400">【注意】 当前处理物料磨蚀性极强，衬板寿命将大幅缩短，建议优化给料级配。</span>
              ) : (
                <span className="text-emerald-400">【正常】 衬板磨损正常，破碎腔型保持良好，设备运行平稳。</span>
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
