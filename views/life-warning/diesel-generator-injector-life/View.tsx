import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Flame, Clock } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/diesel-generator-injector-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[diesel-generator-injector-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/diesel-generator-injector-life';
import { InjectorState } from '../../../components/life-warning/diesel-generator-injector-life/three-types';

export const View: React.FC = () => {
  const [injectorState, setInjectorState] = useState<InjectorState>({
    fuelPressure: 1500, // bar (Common rail pressure)
    sprayAngle: 140, // degrees
    atomizationQuality: 98, // %
    operatingHours: 4500, // hours
    fuelImpurities: 15, // ppm
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(3500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setInjectorState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Fuel pressure fluctuates slightly
        const newPressure = Math.max(1000, Math.min(2000, prev.fuelPressure + (Math.random() - 0.5) * 50));

        // Impurities might spike occasionally
        const newImpurities = Math.max(5, Math.min(100, prev.fuelImpurities + (Math.random() > 0.9 ? Math.random() * 10 : -0.1)));

        // Coking (carbon buildup) affects spray angle and atomization
        // Accelerates with poor fuel quality (impurities) and time
        const cokingRate = (newImpurities / 100) * 0.05 + (newHours * 0.00001);
        
        // Spray angle narrows as nozzle holes clog
        const newAngle = Math.max(90, prev.sprayAngle - cokingRate * 0.5);
        
        // Atomization quality drops as holes clog or needle valve wears
        const newAtomization = Math.max(40, prev.atomizationQuality - cokingRate);

        // Health Index Calculation
        // Atomization: < 70% is critical (causes poor combustion, black smoke)
        const atomizationPenalty = Math.max(0, (90 - newAtomization) / 50) * 50;
        // Spray Angle: Deviation from 140 is bad
        const anglePenalty = Math.max(0, (140 - newAngle) / 50) * 30;
        // Pressure: Drop indicates internal leakage (wear)
        const pressurePenalty = Math.max(0, (1400 - newPressure) / 400) * 20;

        const health = Math.max(0, Math.floor(100 - atomizationPenalty - anglePenalty - pressurePenalty));
        
        // Estimated Life (Hours) - Design life typically 8000-10000 hours
        const baseLife = 8000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          fuelPressure: newPressure,
          fuelImpurities: newImpurities,
          sprayAngle: newAngle,
          atomizationQuality: newAtomization,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setInjectorState({
      fuelPressure: 1600,
      sprayAngle: 140,
      atomizationQuality: 100,
      operatingHours: 0,
      fuelImpurities: 10,
    });
    setHealthScore(100);
    setEstimatedLife(8000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3">
            <Flame className="w-8 h-8" />
            柴油发电机组喷油嘴寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于雾化质量、喷射锥角与积碳程度的喷油器健康评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">喷油器健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-orange-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换喷油嘴总成</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              燃油系统工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="共轨燃油压力 (bar)" 
                value={injectorState.fuelPressure} 
                max={2500} 
                color={injectorState.fuelPressure < 1200 ? 'bg-rose-500' : 'bg-orange-500'}
                onChange={(v) => setInjectorState(s => ({...s, fuelPressure: v}))}
              />
              
              <ParameterControl 
                label="燃油杂质含量 (ppm)" 
                value={injectorState.fuelImpurities} 
                max={100} 
                color={injectorState.fuelImpurities > 50 ? 'bg-rose-500' : injectorState.fuelImpurities > 20 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setInjectorState(s => ({...s, fuelImpurities: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400"/> 累计运行时间</span>
                  <span className="font-mono text-xl font-bold text-slate-300">
                    {injectorState.operatingHours.toLocaleString()} <span className="text-sm font-normal">h</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              喷射特性指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">喷射锥角 (°)</span>
                <span className={`font-mono font-bold text-lg ${injectorState.sprayAngle < 100 ? 'text-rose-500 animate-pulse' : injectorState.sprayAngle < 120 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {injectorState.sprayAngle.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${injectorState.sprayAngle < 100 ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${(injectorState.sprayAngle / 160) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/80" style={{ left: `${(140 / 160) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">设计标准: 140°</div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(249,115,22,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
            喷嘴积碳与燃油雾化形态 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={injectorState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Droplets className={`w-6 h-6 ${injectorState.atomizationQuality < 70 ? 'text-rose-500' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">雾化质量指数</div>
                <div className={`text-xl font-mono ${injectorState.atomizationQuality < 70 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {injectorState.atomizationQuality.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">喷孔积碳程度</div>
              <div className={`text-xl font-mono ${injectorState.atomizationQuality < 70 ? 'text-rose-500' : 'text-amber-400'}`}>
                {((100 - injectorState.atomizationQuality) * 1.5).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="喷孔积碳堵塞 (雾化不良)" 
                value={100 - injectorState.atomizationQuality} 
                critical={30} // < 70% quality
              />
              <DiagnosticItem 
                label="针阀磨损/卡滞 (滴漏风险)" 
                value={Math.max(0, (1400 - injectorState.fuelPressure) / 400) * 100} 
                critical={50} // pressure drop
              />
              <DiagnosticItem 
                label="燃油污染损伤" 
                value={(injectorState.fuelImpurities / 80) * 100} 
                critical={60} // > 50ppm
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-orange-400">诊断结论与建议：</strong></p>
              {injectorState.atomizationQuality < 60 || injectorState.sprayAngle < 90 ? (
                <span className="text-rose-400 font-bold">【危急】 喷油器严重积碳或堵塞，雾化极差，呈线状喷射。将导致严重燃烧不完全、排气管冒黑烟及活塞烧顶风险。必须立即停机更换喷油嘴！</span>
              ) : injectorState.atomizationQuality < 80 ? (
                <span className="text-amber-400 font-bold">【警告】 雾化质量明显下降，喷射锥角变窄。发动机油耗增加，动力下降。建议在近期维护中进行喷油器清洗和校验。</span>
              ) : injectorState.fuelImpurities > 40 ? (
                <span className="text-yellow-400">【注意】 燃油杂质含量偏高，将加速针阀和喷孔的磨损。建议检查燃油滤清器和油箱底部沉积物。</span>
              ) : (
                <span className="text-emerald-400">【正常】 喷射锥角标准，雾化均匀细密。燃油喷射系统工作状态良好。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-orange-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
    />
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
        {/* Critical threshold marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
