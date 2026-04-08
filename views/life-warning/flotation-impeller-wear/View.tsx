import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, RotateCw, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/flotation-impeller-wear/ThreeScene';
import { ImpellerState } from '../../../components/life-warning/flotation-impeller-wear/three-types';

export const View: React.FC = () => {
  const [impellerState, setImpellerState] = useState<ImpellerState>({
    slurryDensity: 35, // % solids
    particleSize: 0.15, // mm
    rotationSpeed: 180, // RPM
    wearDepth: 2.5, // mm
    operatingHours: 4500, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(12000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setImpellerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate process variations
        const newDensity = Math.max(20, Math.min(50, prev.slurryDensity + (Math.random() - 0.5) * 2));
        const newParticleSize = Math.max(0.05, Math.min(0.5, prev.particleSize + (Math.random() - 0.5) * 0.02));
        const newSpeed = Math.max(150, Math.min(250, prev.rotationSpeed + (Math.random() - 0.5) * 5));

        // Wear rate depends on density, particle size (abrasiveness), and speed^3
        let wearRate = 0.0005;
        wearRate *= (newDensity / 30);
        wearRate *= Math.pow(newParticleSize / 0.1, 1.5); // Coarser particles wear much faster
        wearRate *= Math.pow(newSpeed / 180, 3); // Speed has a massive effect on wear

        const newWear = Math.min(25, prev.wearDepth + wearRate);

        const wearPenalty = Math.max(0, (newWear / 20) * 60);
        const densityPenalty = Math.max(0, (newDensity - 40) / 10) * 20;

        const health = Math.max(0, Math.floor(100 - wearPenalty - densityPenalty));
        
        const baseLife = 15000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          slurryDensity: newDensity,
          particleSize: newParticleSize,
          rotationSpeed: newSpeed,
          wearDepth: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setImpellerState({
      slurryDensity: 30,
      particleSize: 0.1,
      rotationSpeed: 180,
      wearDepth: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(15000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
            <RotateCw className="w-8 h-8" />
            选矿厂浮选机叶轮磨损预警
          </h1>
          <p className="text-slate-400 mt-1">基于矿浆浓度、粒度与转速的聚氨酯叶轮磨粒磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">叶轮健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-emerald-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换叶轮/定子</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              浮选工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="矿浆浓度 (% 固体)" value={impellerState.slurryDensity} max={60} color={impellerState.slurryDensity > 45 ? 'bg-rose-500' : impellerState.slurryDensity > 35 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setImpellerState(s => ({...s, slurryDensity: v}))} />
              <ParameterControl label="矿石粒度 P80 (mm)" value={impellerState.particleSize} max={0.5} min={0.01} color={impellerState.particleSize > 0.3 ? 'bg-rose-500' : impellerState.particleSize > 0.15 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setImpellerState(s => ({...s, particleSize: v}))} />
              <ParameterControl label="主轴转速 (RPM)" value={impellerState.rotationSpeed} max={300} min={100} color={impellerState.rotationSpeed > 220 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setImpellerState(s => ({...s, rotationSpeed: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              叶片磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">外缘磨损量 (mm)</span>
                <span className={`font-mono font-bold text-lg ${impellerState.wearDepth > 18 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {impellerState.wearDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${impellerState.wearDepth > 18 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(impellerState.wearDepth / 25) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(20 / 25) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">动力学失效临界值: 20 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            叶轮磨粒磨损与流体动力学 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={impellerState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${impellerState.slurryDensity > 45 || impellerState.particleSize > 0.3 ? 'text-rose-500' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">磨蚀强度指数</div>
                <div className={`text-xl font-mono ${impellerState.slurryDensity > 45 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (impellerState.slurryDensity / 50) * (impellerState.particleSize / 0.2) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {impellerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="叶片外缘磨损 (抽吸力下降)" value={(impellerState.wearDepth / 20) * 100} critical={85} />
              <DiagnosticItem label="定子冲击磨损 (粗颗粒/高转速)" value={(impellerState.particleSize / 0.4) * 100} critical={75} />
              <DiagnosticItem label="充气量不足风险 (间隙增大)" value={Math.max(0, (impellerState.wearDepth - 10) / 10) * 100} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-emerald-400">诊断结论与建议：</strong></p>
              {impellerState.wearDepth > 19 ? (
                <span className="text-rose-400 font-bold">【危急】 叶轮磨损严重，叶片长度大幅缩短，导致浮选机抽吸空气量急剧下降，严重影响回收率！必须立即更换叶轮和定子。</span>
              ) : impellerState.particleSize > 0.35 ? (
                <span className="text-rose-400 font-bold">【危急】 矿浆中存在大量粗颗粒（跑粗），正在对聚氨酯叶轮造成严重的切削磨损。请立即检查上游磨矿分级回路。</span>
              ) : impellerState.slurryDensity > 45 ? (
                <span className="text-amber-400">【警告】 矿浆浓度偏高，增加了流体阻力和磨粒浓度，加速叶轮磨损并增加电机负荷。建议适当补水。</span>
              ) : impellerState.wearDepth > 12 ? (
                <span className="text-yellow-400">【注意】 叶轮已出现明显磨损，定转子间隙增大，可能导致气泡分散不均。建议在下次检修时测量间隙。</span>
              ) : (
                <span className="text-emerald-400">【正常】 矿浆性质稳定，叶轮磨损速率在正常范围内，浮选动力学条件良好。</span>
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
      <span className="font-mono text-emerald-400">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
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
