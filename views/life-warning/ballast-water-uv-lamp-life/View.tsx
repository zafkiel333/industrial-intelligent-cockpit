import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Activity as VibrationIcon, Lightbulb } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ballast-water-uv-lamp-life/ThreeScene';
import { UVLampState } from '../../../components/life-warning/ballast-water-uv-lamp-life/three-types';

export const View: React.FC = () => {
  const [lampState, setLampState] = useState<UVLampState>({
    uvIntensity: 220, // W/m2
    flowRate: 500, // m3/h
    transmittance: 95, // %
    ignitionCycles: 850, // count
    operatingHours: 4500, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(3500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setLampState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate ballast operations
        const isBallasting = Math.random() > 0.2; // Mostly running when active
        let newFlow = prev.flowRate;
        let newUVT = prev.transmittance;

        if (isBallasting) {
            newFlow = 400 + Math.random() * 200; // 400 - 600 m3/h
            // Water quality varies (e.g., port water is muddy)
            if (Math.random() > 0.9) {
                newUVT = Math.max(50, prev.transmittance - Math.random() * 10); // Sudden drop in UVT
            } else {
                newUVT = Math.min(98, prev.transmittance + (90 - prev.transmittance) * 0.1 + (Math.random() - 0.5) * 2);
            }
        } else {
            newFlow = 0;
            newUVT = 100; // Clean water when stopped
        }

        // UV Intensity degrades with hours, ignition cycles, and fouling (low UVT)
        let degradationRate = 0.005;
        if (newUVT < 70) degradationRate *= 3; // Fouling on quartz sleeve
        
        // Base intensity drops over time. 
        // Note: Real UV sensors measure intensity *through* the water/sleeve, so low UVT drops the reading instantly.
        const baseIntensity = 250 - (newHours / 8000) * 100 - (prev.ignitionCycles / 2000) * 50;
        
        // Actual measured intensity is affected by water transmittance
        let newIntensity = baseIntensity * (newUVT / 100);
        newIntensity = Math.max(10, newIntensity);

        // Health calculation
        // Intensity < 100 W/m2 is warning, < 50 is critical (cannot guarantee biological efficacy)
        const intensityPenalty = Math.max(0, ((150 - newIntensity) / 100) * 60); 
        const cyclePenalty = Math.max(0, (prev.ignitionCycles / 3000) * 20);

        const health = Math.max(0, Math.floor(100 - intensityPenalty - cyclePenalty));
        
        const baseLife = 8000; // Typical UV lamp life
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          flowRate: newFlow,
          transmittance: newUVT,
          uvIntensity: newIntensity,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setLampState({
      uvIntensity: 250,
      flowRate: 500,
      transmittance: 95,
      ignitionCycles: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(8000);
  };

  const handleClean = () => {
    // Simulate mechanical/chemical cleaning of quartz sleeves
    setLampState(prev => ({
        ...prev,
        transmittance: 98,
        uvIntensity: prev.uvIntensity + 40 // Recovers some intensity lost to fouling
    }));
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-400 flex items-center gap-3">
            <Lightbulb className="w-8 h-8" />
            船舶压载水系统紫外灯管寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于紫外线透射率 (UVT)、辐射照度衰减与启停频次的杀菌效能评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">灯管健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-purple-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleClean} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span>执行套管清洗 (CIP)</span>
          </button>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换紫外灯管组</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              水质与运行参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="处理流量 (m³/h)" value={lampState.flowRate} max={1000} color="bg-blue-500" onChange={(v) => setLampState(s => ({...s, flowRate: v}))} />
              <ParameterControl label="紫外线透射率 UVT (%)" value={lampState.transmittance} max={100} color={lampState.transmittance < 60 ? 'bg-rose-500' : lampState.transmittance < 80 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setLampState(s => ({...s, transmittance: v}))} />
              
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">累计启停次数</span>
                <span className={`font-mono font-bold ${lampState.ignitionCycles > 2500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lampState.ignitionCycles} 次
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              紫外辐射照度 (UVI)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">传感器读数 (W/m²)</span>
                <span className={`font-mono font-bold text-2xl ${lampState.uvIntensity < 50 ? 'text-rose-500 animate-pulse' : lampState.uvIntensity < 100 ? 'text-amber-400' : 'text-purple-400'}`}>
                  {lampState.uvIntensity.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${lampState.uvIntensity < 50 ? 'bg-rose-500' : lampState.uvIntensity < 100 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, (lampState.uvIntensity / 300) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(50 / 300) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(100 / 300) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>失效: 50</span>
                <span>警告: 100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(168,85,247,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            紫外线反应器杀菌效能 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={lampState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <ShieldAlert className={`w-6 h-6 ${lampState.uvIntensity < 50 ? 'text-rose-500 animate-bounce' : 'text-purple-400'}`} />
              <div>
                <div className="text-xs text-slate-400">生物合规失效风险</div>
                <div className={`text-xl font-mono ${lampState.uvIntensity < 50 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, Math.max(0, ((100 - lampState.uvIntensity) / 100) * 100)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">灯管累计点亮时间</div>
              <div className="text-xl font-mono text-slate-300">
                {lampState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="电极损耗 (启停频次)" value={(lampState.ignitionCycles / 3000) * 100} critical={85} />
              <DiagnosticItem label="石英套管结垢 (低UVT)" value={lampState.transmittance < 70 ? 90 : (lampState.transmittance < 85 ? 60 : 10)} critical={80} />
              <DiagnosticItem label="灯管光衰 (运行时间)" value={(lampState.operatingHours / 8000) * 100} critical={90} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-purple-400">诊断结论与建议：</strong></p>
              {lampState.uvIntensity < 50 ? (
                <span className="text-rose-400 font-bold">【危急】 紫外辐射照度低于最低杀菌阈值 (D-2标准)。压载水处理系统已失效，无法保证排放合规。必须立即停止排放，更换老化灯管或进行深度化学清洗。</span>
              ) : lampState.transmittance < 70 ? (
                <span className="text-rose-400 font-bold">【危急】 水质透射率极低或石英套管严重结垢，导致紫外光无法穿透水体。请立即启动机械刮环或化学清洗程序 (CIP)。</span>
              ) : lampState.uvIntensity < 100 ? (
                <span className="text-amber-400">【警告】 辐射照度下降明显，系统可能需要降低处理流量以保证足够的紫外线剂量 (UV Dose)。建议准备备件。</span>
              ) : lampState.ignitionCycles > 2500 ? (
                <span className="text-yellow-400">【注意】 灯管启停次数过多，电极发射电子能力下降，可能导致点灯困难或早期黑化。</span>
              ) : (
                <span className="text-emerald-400">【正常】 反应器运行状态良好，紫外线剂量充足，满足 IMO D-2 及 USCG 排放标准。</span>
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
      <span className="font-mono text-purple-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
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
