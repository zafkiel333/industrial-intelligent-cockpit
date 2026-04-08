import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Layers, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/port-conveyor-drum-lagging-life/ThreeScene';
import { DrumState } from '../../../components/life-warning/port-conveyor-drum-lagging-life/three-types';

export const View: React.FC = () => {
  const [drumState, setDrumState] = useState<DrumState>({
    beltSpeed: 3.5, // m/s
    beltTension: 150, // kN
    slipRate: 0.5, // %
    laggingWear: 2.5, // mm (New is 0, max is ~15mm)
    operatingHours: 12000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(18000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setDrumState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate conveyor load
        const isLoaded = Math.random() > 0.3;
        let newSpeed = prev.beltSpeed;
        let newTension = prev.beltTension;

        if (isLoaded) {
            newTension = 180 + Math.random() * 40; // Heavy load
            newSpeed = Math.max(3.0, prev.beltSpeed - 0.1); // Slight speed drop under load
        } else {
            newTension = 80 + Math.random() * 20; // Empty belt
            newSpeed = Math.min(4.0, prev.beltSpeed + 0.1);
        }

        // Slip rate increases if tension is high, speed is high, or lagging is worn
        let slipTarget = 0.5;
        if (newTension > 200) slipTarget += 1.5;
        if (prev.laggingWear > 10) slipTarget += 3.0; // Worn lagging loses friction
        if (prev.laggingWear > 13) slipTarget += 5.0; // Critical wear
        
        const newSlip = prev.slipRate + (slipTarget - prev.slipRate) * 0.1 + (Math.random() * 0.2);

        // Wear rate depends on tension and slip (friction)
        let wearRate = 0.0002;
        if (newTension > 180) wearRate *= 2;
        if (newSlip > 2.0) wearRate *= 5; // Slipping grinds the rubber away
        if (newSlip > 5.0) wearRate *= 15; // Severe slip causes rapid destruction
        
        const newWear = Math.min(15.0, prev.laggingWear + wearRate);

        const wearPenalty = Math.max(0, (newWear / 15) * 60); // 15mm is critical
        const slipPenalty = newSlip > 3.0 ? 30 : newSlip > 1.5 ? 10 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - slipPenalty));
        
        const baseLife = 30000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          beltSpeed: newSpeed,
          beltTension: newTension,
          slipRate: newSlip,
          laggingWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setDrumState({
      beltSpeed: 3.5,
      beltTension: 100,
      slipRate: 0.5,
      laggingWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(30000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-500 flex items-center gap-3">
            <Layers className="w-8 h-8" />
            港口皮带机滚筒包胶寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于打滑率与张力的驱动滚筒橡胶包胶磨损与剥离失效评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">包胶健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-indigo-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>重新包胶(冷硫化/热硫化)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              传动工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="皮带带速 (m/s)" value={drumState.beltSpeed} max={6} color="bg-sky-500" onChange={(v) => setDrumState(s => ({...s, beltSpeed: v}))} />
              <ParameterControl label="皮带张力 (kN)" value={drumState.beltTension} max={300} color={drumState.beltTension > 220 ? 'bg-rose-500' : drumState.beltTension > 180 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setDrumState(s => ({...s, beltTension: v}))} />
              <ParameterControl label="滚筒打滑率 (%)" value={drumState.slipRate} max={10} color={drumState.slipRate > 5 ? 'bg-rose-500' : drumState.slipRate > 2 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setDrumState(s => ({...s, slipRate: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              包胶磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">橡胶磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${drumState.laggingWear > 12 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {drumState.laggingWear.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${drumState.laggingWear > 12 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${(drumState.laggingWear / 15) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(12 / 15) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">花纹磨平临界值: 12mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#1e1b4b] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(99,102,241,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            包胶花纹磨损与摩擦生热 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={drumState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${drumState.slipRate > 5.0 ? 'text-rose-500 animate-bounce' : 'text-indigo-400'}`} />
              <div>
                <div className="text-xs text-slate-400">打滑烧损风险指数</div>
                <div className={`text-xl font-mono ${drumState.slipRate > 5.0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (drumState.slipRate / 8) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {drumState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="表面花纹磨平 (摩擦力下降)" value={(drumState.laggingWear / 15) * 100} critical={80} />
              <DiagnosticItem label="严重打滑发热 (烧损/火灾风险)" value={(drumState.slipRate / 8) * 100} critical={60} />
              <DiagnosticItem label="包胶层脱胶/开裂 (高张力疲劳)" value={(drumState.beltTension / 300) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-indigo-400">诊断结论与建议：</strong></p>
              {drumState.slipRate > 5.0 ? (
                <span className="text-rose-400 font-bold">【危急】 发生严重打滑！摩擦产生的高温极易导致包胶烧毁甚至引发皮带火灾。请立即停机，检查张紧装置或清理滚筒表面积水/物料。</span>
              ) : drumState.laggingWear > 12 ? (
                <span className="text-rose-400 font-bold">【危急】 包胶菱形花纹已基本磨平，排水排泥能力丧失，摩擦系数大幅下降。必须尽快安排重新包胶。</span>
              ) : drumState.beltTension > 220 ? (
                <span className="text-amber-400">【警告】 皮带张力过大，包胶层承受极高的剪切应力，容易发生局部脱胶或撕裂。请检查负荷情况。</span>
              ) : drumState.slipRate > 2.0 ? (
                <span className="text-yellow-400">【注意】 存在轻微打滑现象，传动效率下降。建议检查皮带张紧度。</span>
              ) : (
                <span className="text-emerald-400">【正常】 驱动滚筒包胶状态良好，摩擦传动稳定，无明显打滑。</span>
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
