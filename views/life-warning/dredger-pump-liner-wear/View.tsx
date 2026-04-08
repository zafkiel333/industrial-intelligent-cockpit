import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Waves, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/dredger-pump-liner-wear/ThreeScene';
import { DredgerPumpState } from '../../../components/life-warning/dredger-pump-liner-wear/three-types';

export const View: React.FC = () => {
  const [pumpState, setPumpState] = useState<DredgerPumpState>({
    slurryDensity: 1250, // kg/m3
    flowVelocity: 6.5, // m/s
    particleSize: 15, // mm
    linerThickness: 45, // mm (New is 50mm)
    operatingHours: 1200, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(3500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPumpState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate dredging conditions changing
        const soilChange = Math.random();
        let newDensity = prev.slurryDensity;
        let newVelocity = prev.flowVelocity;
        let newParticleSize = prev.particleSize;

        if (soilChange > 0.8) {
            // Hitting hard soil/rocks
            newDensity = 1350 + Math.random() * 100;
            newVelocity = Math.max(4.0, prev.flowVelocity - 0.5); // Slows down
            newParticleSize = 30 + Math.random() * 20; // Large rocks
        } else if (soilChange < 0.2) {
            // Light silt/water
            newDensity = 1050 + Math.random() * 100;
            newVelocity = Math.min(8.0, prev.flowVelocity + 0.5);
            newParticleSize = 2 + Math.random() * 5;
        } else {
            // Normal sand
            newDensity = prev.slurryDensity + (1250 - prev.slurryDensity) * 0.1 + (Math.random() - 0.5) * 20;
            newVelocity = prev.flowVelocity + (6.5 - prev.flowVelocity) * 0.1 + (Math.random() - 0.5);
            newParticleSize = prev.particleSize + (15 - prev.particleSize) * 0.1 + (Math.random() - 0.5) * 2;
        }

        // Wear rate depends heavily on velocity^3, density, and particle size
        let wearRate = 0.0005;
        wearRate *= Math.pow(newVelocity / 6.0, 3); // Velocity is dominant factor
        wearRate *= (newDensity / 1200);
        if (newParticleSize > 30) wearRate *= 2.5; // Large rocks cause impact wear
        
        const newThickness = Math.max(0, prev.linerThickness - wearRate);

        // Health calculation
        // 50mm is new, 20mm is warning, 10mm is critical (risk of casing breach)
        const wearPenalty = Math.max(0, ((50 - newThickness) / 40) * 100); 
        const health = Math.max(0, Math.floor(100 - wearPenalty));
        
        const baseLife = 5000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          slurryDensity: newDensity,
          flowVelocity: newVelocity,
          particleSize: newParticleSize,
          linerThickness: newThickness,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPumpState({
      slurryDensity: 1200,
      flowVelocity: 6.0,
      particleSize: 10,
      linerThickness: 50,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(5000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-3">
            <Waves className="w-8 h-8" />
            疏浚船泥泵衬板磨损预警
          </h1>
          <p className="text-slate-400 mt-1">基于泥浆浓度、流速与颗粒粒径的泵壳内衬冲刷磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">衬板健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 60 ? 'text-emerald-400' : healthScore > 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-orange-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换高铬合金衬板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              泥浆工况实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="泥浆密度 (kg/m³)" value={pumpState.slurryDensity} max={1600} min={1000} color={pumpState.slurryDensity > 1400 ? 'bg-rose-500' : pumpState.slurryDensity > 1300 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, slurryDensity: v}))} />
              <ParameterControl label="管内流速 (m/s)" value={pumpState.flowVelocity} max={10} color={pumpState.flowVelocity > 8 ? 'bg-rose-500' : 'bg-sky-500'} onChange={(v) => setPumpState(s => ({...s, flowVelocity: v}))} />
              <ParameterControl label="平均颗粒粒径 (mm)" value={pumpState.particleSize} max={60} color={pumpState.particleSize > 40 ? 'bg-rose-500' : pumpState.particleSize > 20 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, particleSize: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              衬板磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">剩余壁厚 (mm)</span>
                <span className={`font-mono font-bold text-lg ${pumpState.linerThickness < 15 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pumpState.linerThickness.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pumpState.linerThickness < 15 ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${(pumpState.linerThickness / 50) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(15 / 50) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">穿孔破裂临界值: 15mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#111827] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(249,115,22,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            泥泵内部流场与衬板冲刷 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pumpState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${pumpState.particleSize > 40 ? 'text-rose-500 animate-bounce' : 'text-orange-400'}`} />
              <div>
                <div className="text-xs text-slate-400">大颗粒冲击振动指数</div>
                <div className={`text-xl font-mono ${pumpState.particleSize > 40 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (pumpState.particleSize / 60) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计疏浚时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pumpState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="高流速切削磨损" value={(pumpState.flowVelocity / 10) * 100} critical={80} />
              <DiagnosticItem label="大颗粒冲击剥落" value={(pumpState.particleSize / 60) * 100} critical={70} />
              <DiagnosticItem label="衬板减薄穿孔风险" value={((50 - pumpState.linerThickness) / 40) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-orange-400">诊断结论与建议：</strong></p>
              {pumpState.linerThickness < 15 ? (
                <span className="text-rose-400 font-bold">【危急】 泥泵衬板厚度已达极限，随时可能发生泵壳击穿导致机舱进水！必须立即停止疏浚作业，开舱更换衬板。</span>
              ) : pumpState.particleSize > 40 ? (
                <span className="text-rose-400 font-bold">【危急】 吸入大量大粒径卵石/岩块，对叶轮和衬板造成严重冲击损伤。建议调整绞刀转速或提升吸口。</span>
              ) : pumpState.flowVelocity > 8 ? (
                <span className="text-amber-400">【警告】 管内流速过高，加剧了泥沙对过流部件的切削磨损。建议在保证不堵管的前提下适当降低泵速。</span>
              ) : pumpState.linerThickness < 25 ? (
                <span className="text-yellow-400">【注意】 衬板磨损已过半，请提前备件，并密切关注泵壳外部是否有渗漏迹象。</span>
              ) : (
                <span className="text-emerald-400">【正常】 泥泵运行工况良好，衬板厚度充足，未见异常冲击。</span>
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
      <span className="font-mono text-orange-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
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
