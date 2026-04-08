import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, ThermometerSun, Settings } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/wind-turbine-gearbox-oil-life/ThreeScene';
import { GearboxOilState } from '../../../components/life-warning/wind-turbine-gearbox-oil-life/three-types';

export const View: React.FC = () => {
  const [oilState, setOilState] = useState<GearboxOilState>({
    temperature: 65, // Celsius
    viscosity: 320, // cSt (ISO VG 320 is common for wind turbines)
    waterContent: 150, // ppm
    metallicParticles: 10, // ppm
    operatingHours: 12000, // hours
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(25000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setOilState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Temperature fluctuates based on load (simulated)
        const newTemp = Math.max(40, Math.min(100, prev.temperature + (Math.random() - 0.5) * 2));
        
        // Viscosity drops as temperature rises (Viscosity Index simulation)
        // Base 320 cSt at 40C. At 100C it might be ~30 cSt.
        // Simplified curve for visual effect
        const targetViscosity = 320 * Math.exp(-0.03 * (newTemp - 40));
        // Also degrades over time (oxidation) leading to thickening, or shearing leading to thinning. 
        // Let's simulate shearing (thinning) over time.
        const ageDegradation = (newHours / 50000) * 50; 
        const newViscosity = Math.max(20, targetViscosity - ageDegradation);

        // Water content increases slowly (condensation/seal leaks)
        const newWater = Math.min(2000, prev.waterContent + (Math.random() > 0.8 ? Math.random() * 5 : 0));

        // Metallic particles increase (wear)
        // Accelerates if viscosity is too low or water is too high
        let wearRate = 0.05;
        if (newViscosity < 100) wearRate += 0.2; // Poor lubrication
        if (newWater > 500) wearRate += 0.1; // Corrosion/poor lubrication
        const newMetallic = Math.min(1000, prev.metallicParticles + (Math.random() > 0.5 ? wearRate : 0));

        // Health Index Calculation
        // Viscosity: ISO VG 320 should ideally stay within +/- 10% at 40C. 
        // Here we use the dynamic viscosity. If it drops too low at operating temp, it's bad.
        const viscPenalty = newViscosity < 80 ? ((80 - newViscosity) / 80) * 40 : 0;
        
        // Water: > 300ppm is warning, > 500ppm is critical
        const waterPenalty = Math.max(0, (newWater - 200) / 300) * 30;
        
        // Metallic: > 50ppm is warning, > 100ppm is critical
        const metalPenalty = Math.max(0, (newMetallic - 30) / 70) * 30;

        const health = Math.max(0, Math.floor(100 - viscPenalty - waterPenalty - metalPenalty));
        
        // Estimated Life (Hours) - Design life typically 3-5 years (25000 - 40000 hours)
        const baseLife = 40000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          temperature: newTemp,
          viscosity: newViscosity,
          waterContent: newWater,
          metallicParticles: newMetallic,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setOilState({
      temperature: 45,
      viscosity: 320,
      waterContent: 50,
      metallicParticles: 2,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(40000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            风机齿轮箱润滑油寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于理化指标与磨损颗粒物的油液状态实时监测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">油液健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计换油时间</div>
              <div className="text-2xl font-bold text-amber-500">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>执行换油维护</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              油液理化指标
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="油温 (°C)" 
                value={oilState.temperature} 
                max={100} 
                color={oilState.temperature > 85 ? 'bg-rose-500' : oilState.temperature > 70 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setOilState(s => ({...s, temperature: v}))}
              />
              
              <ParameterControl 
                label="水分含量 (ppm)" 
                value={oilState.waterContent} 
                max={1000} 
                color={oilState.waterContent > 500 ? 'bg-rose-500' : oilState.waterContent > 300 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setOilState(s => ({...s, waterContent: v}))}
              />

              <ParameterControl 
                label="铁磁性颗粒 (ppm)" 
                value={oilState.metallicParticles} 
                max={200} 
                color={oilState.metallicParticles > 100 ? 'bg-rose-500' : oilState.metallicParticles > 50 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setOilState(s => ({...s, metallicParticles: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              动态运动粘度
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">当前粘度 (cSt)</span>
                <span className={`font-mono font-bold text-lg ${oilState.viscosity < 80 ? 'text-rose-500 animate-pulse' : oilState.viscosity < 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {oilState.viscosity.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${oilState.viscosity < 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${(oilState.viscosity / 400) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/80" style={{ left: `${(320 / 400) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">基准粘度 (40°C): 320 cSt</div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            齿轮箱内部油液流场与杂质 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={oilState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <ThermometerSun className={`w-6 h-6 ${oilState.temperature > 85 ? 'text-rose-500' : 'text-amber-500'}`} />
              <div>
                <div className="text-xs text-slate-400">油膜破裂风险指数</div>
                <div className={`text-xl font-mono ${oilState.viscosity < 80 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.max(0, ((150 - oilState.viscosity) / 150) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {oilState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="粘度下降 (油膜变薄)" 
                value={Math.max(0, (320 - oilState.viscosity) / 240) * 100} 
                critical={70} // < 150 cSt
              />
              <DiagnosticItem 
                label="水分乳化 (防锈/润滑失效)" 
                value={(oilState.waterContent / 600) * 100} 
                critical={83} // > 500 ppm
              />
              <DiagnosticItem 
                label="异常磨损 (齿面剥落/点蚀)" 
                value={(oilState.metallicParticles / 120) * 100} 
                critical={83} // > 100 ppm
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-500">诊断结论与建议：</strong></p>
              {oilState.metallicParticles > 100 ? (
                <span className="text-rose-400 font-bold">【危急】 铁磁性颗粒物严重超标，齿轮或轴承可能已发生严重剥落或磨损。必须立即停机进行内窥镜检查，并更换润滑油！</span>
              ) : oilState.waterContent > 500 ? (
                <span className="text-rose-400 font-bold">【危急】 水分含量极高，油液已严重乳化，失去润滑和防锈能力。请立即启动滤油机脱水或更换新油。</span>
              ) : oilState.viscosity < 100 ? (
                <span className="text-amber-400">【警告】 运动粘度过低，高温下难以形成有效油膜，极易造成金属直接接触磨损。建议检查冷却系统或添加增粘剂。</span>
              ) : oilState.metallicParticles > 50 || oilState.waterContent > 300 ? (
                <span className="text-yellow-400">【注意】 油液指标出现劣化趋势，建议缩短油液采样化验周期，密切关注磨损颗粒物变化。</span>
              ) : (
                <span className="text-emerald-400">【正常】 润滑油各项理化指标均在正常范围内，油膜厚度充足，齿轮箱润滑状态良好。</span>
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
      <span className="font-mono text-amber-500">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
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
