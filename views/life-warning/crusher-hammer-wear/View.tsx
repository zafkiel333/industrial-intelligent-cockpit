import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Hammer, HardHat, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/crusher-hammer-wear/ThreeScene';
import { HammerState } from '../../../components/life-warning/crusher-hammer-wear/three-types';

export const View: React.FC = () => {
  const [hammerState, setHammerState] = useState<HammerState>({
    materialHardness: 6, // Mohs scale (e.g., 6 is Feldspar/moderate rock)
    throughput: 500, // tons/hour
    vibration: 8.5, // mm/s
    wearDepth: 15, // mm
    operatingHours: 850, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(1200); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setHammerState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        
        // Throughput fluctuates
        const newThroughput = Math.max(100, Math.min(1000, prev.throughput + (Math.random() - 0.5) * 50));

        // Hardness might change if hitting a different seam
        const newHardness = Math.max(2, Math.min(9, prev.materialHardness + (Math.random() > 0.9 ? (Math.random() - 0.5) * 2 : 0)));

        // Wear depth increases based on throughput, hardness, and hours
        // Harder material = exponentially more wear
        const wearRate = (newThroughput / 1000) * Math.pow(newHardness / 5, 2) * 0.01;
        const newWearDepth = Math.min(60, prev.wearDepth + wearRate);

        // Vibration increases as hammers wear unevenly or lose mass
        let vibIncrease = 0;
        if (newWearDepth > 30) vibIncrease += 0.05; // Imbalance starts
        if (newWearDepth > 45) vibIncrease += 0.2;  // Severe imbalance
        const newVibration = Math.max(2.0, Math.min(30, prev.vibration + (Math.random() > 0.8 ? vibIncrease : (Math.random() - 0.5) * 0.5)));

        // Health Index Calculation
        // Wear Depth: Max allowable usually ~50mm before efficiency drops or breakage risk
        const wearPenalty = Math.max(0, (newWearDepth / 50) * 60);
        
        // Vibration: > 11.2 mm/s is warning, > 18 mm/s is critical (ISO 10816 for large machines)
        const vibPenalty = Math.max(0, (newVibration - 7.1) / 10.9) * 40;

        const health = Math.max(0, Math.floor(100 - wearPenalty - vibPenalty));
        
        // Estimated Life (Hours) - Design life typically 1000 - 2000 hours depending on material
        const baseLife = 2000;
        // Hardness drastically reduces life
        const hardnessFactor = Math.pow(newHardness / 5, 1.5);
        const remainingLife = Math.max(0, Math.floor((baseLife / hardnessFactor) * (health / 100) - (newHours * 0.2)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          throughput: newThroughput,
          materialHardness: newHardness,
          wearDepth: newWearDepth,
          vibration: newVibration,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setHammerState({
      materialHardness: 5,
      throughput: 400,
      vibration: 4.5,
      wearDepth: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
            <Hammer className="w-8 h-8" />
            破碎机锤头磨损预警
          </h1>
          <p className="text-slate-400 mt-1">基于物料硬度、处理量与振动特征的耐磨件寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">锤头健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-red-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换/翻面锤头</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              破碎工况监测
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="物料莫氏硬度" 
                value={hammerState.materialHardness} 
                max={10} 
                color={hammerState.materialHardness > 7 ? 'bg-rose-500' : hammerState.materialHardness > 5 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setHammerState(s => ({...s, materialHardness: v}))}
              />
              
              <ParameterControl 
                label="实时处理量 (t/h)" 
                value={hammerState.throughput} 
                max={1200} 
                color={hammerState.throughput > 900 ? 'bg-rose-500' : hammerState.throughput > 600 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setHammerState(s => ({...s, throughput: v}))}
              />

              <ParameterControl 
                label="转子径向振动 (mm/s)" 
                value={hammerState.vibration} 
                max={25} 
                color={hammerState.vibration > 18 ? 'bg-rose-500' : hammerState.vibration > 11.2 ? 'bg-amber-500' : 'bg-red-500'}
                onChange={(v) => setHammerState(s => ({...s, vibration: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">平均磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${hammerState.wearDepth > 45 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {hammerState.wearDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${hammerState.wearDepth > 45 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${(hammerState.wearDepth / 60) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(50 / 60) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废极限: 50 mm</div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(239,68,68,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            转子锤头磨损形貌与物料冲击 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={hammerState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${hammerState.vibration > 18 ? 'text-rose-500' : 'text-red-400'}`} />
              <div>
                <div className="text-xs text-slate-400">转子不平衡度估算</div>
                <div className={`text-xl font-mono ${hammerState.vibration > 18 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (hammerState.vibration / 25) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {hammerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="端部磨料磨损 (效率下降)" 
                value={(hammerState.wearDepth / 50) * 100} 
                critical={90} // > 45mm
              />
              <DiagnosticItem 
                label="转子动平衡破坏 (高振动)" 
                value={(hammerState.vibration / 18) * 100} 
                critical={100} // > 18 mm/s
              />
              <DiagnosticItem 
                label="冲击疲劳断裂风险 (高硬度)" 
                value={(hammerState.materialHardness / 10) * 100} 
                critical={80} // > 8 Mohs
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-red-400">诊断结论与建议：</strong></p>
              {hammerState.wearDepth > 48 ? (
                <span className="text-rose-400 font-bold">【危急】 锤头磨损已达极限，破碎效率严重下降，且存在锤头断裂飞出击穿机壳的致命风险！必须立即停机更换全套锤头。</span>
              ) : hammerState.vibration > 18 ? (
                <span className="text-rose-400 font-bold">【危急】 转子振动严重超标，表明锤头磨损极不均匀或有锤头脱落，动平衡被破坏。请立即停机检查转子及轴承。</span>
              ) : hammerState.wearDepth > 35 ? (
                <span className="text-amber-400">【警告】 锤头磨损明显，建议在下一个检修窗口进行锤头翻面（若为对称设计）或准备备件。</span>
              ) : hammerState.materialHardness > 7 ? (
                <span className="text-yellow-400">【注意】 当前破碎物料硬度极高，锤头磨损将呈指数级加速，请密切关注出料粒度及振动趋势。</span>
              ) : (
                <span className="text-emerald-400">【正常】 锤头磨损在正常范围内，转子运行平稳，破碎效率良好。</span>
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
      <span className="font-mono text-red-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
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
