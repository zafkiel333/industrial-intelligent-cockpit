import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Anchor, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-loader-slewing-bearing-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ship-loader-slewing-bearing-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ship-loader-slewing-bearing-life';
import { SlewingBearingState } from '../../../components/life-warning/ship-loader-slewing-bearing-life/three-types';

export const View: React.FC = () => {
  const [bearingState, setBearingState] = useState<SlewingBearingState>({
    slewingSpeed: 0.5, // RPM
    axialLoad: 850, // t
    overturningMoment: 4500, // kN.m
    greaseIronContent: 120, // ppm
    operatingHours: 15000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(25000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBearingState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate loading operations
        const isOperating = Math.random() > 0.2;
        let newSpeed = prev.slewingSpeed;
        let newLoad = prev.axialLoad;
        let newMoment = prev.overturningMoment;

        if (isOperating) {
            // Boom moving, loading material
            newSpeed = 0.2 + Math.random() * 0.8; // 0.2 - 1.0 RPM
            newLoad = 800 + Math.random() * 400; // 800 - 1200 t
            newMoment = 3000 + Math.random() * 5000; // 3000 - 8000 kN.m
        } else {
            // Idle
            newSpeed = 0;
            newLoad = 800; // Dead weight
            newMoment = 2000; // Static moment
        }

        // Iron content in grease increases slowly, faster under high load/moment
        let wearRate = 0.005;
        if (newLoad > 1000) wearRate *= 2;
        if (newMoment > 6000) wearRate *= 3; // High overturning moment causes edge loading
        
        const newIron = Math.min(800, prev.greaseIronContent + wearRate);

        // Health calculation
        const ironPenalty = Math.max(0, (newIron - 200) / 400 * 50); // >200ppm starts penalty, 600ppm is critical
        const loadPenalty = newLoad > 1100 ? 10 : 0;
        const momentPenalty = newMoment > 7000 ? 15 : 0;

        const health = Math.max(0, Math.floor(100 - ironPenalty - loadPenalty - momentPenalty));
        
        const baseLife = 50000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          slewingSpeed: newSpeed,
          axialLoad: newLoad,
          overturningMoment: newMoment,
          greaseIronContent: newIron,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBearingState({
      slewingSpeed: 0,
      axialLoad: 800,
      overturningMoment: 2000,
      greaseIronContent: 50,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-400 flex items-center gap-3">
            <Anchor className="w-8 h-8" />
            港口装船机回转支承寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于轴向载荷、倾覆力矩与润滑脂铁谱分析的大型轴承疲劳评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">支承健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-zinc-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换回转支承</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              受力工况实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="回转速度 (RPM)" value={bearingState.slewingSpeed} max={2} color="bg-zinc-500" onChange={(v) => setBearingState(s => ({...s, slewingSpeed: v}))} />
              <ParameterControl label="轴向载荷 (t)" value={bearingState.axialLoad} max={1500} min={500} color={bearingState.axialLoad > 1200 ? 'bg-rose-500' : bearingState.axialLoad > 1000 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, axialLoad: v}))} />
              <ParameterControl label="倾覆力矩 (kN.m)" value={bearingState.overturningMoment} max={10000} color={bearingState.overturningMoment > 8000 ? 'bg-rose-500' : bearingState.overturningMoment > 6000 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, overturningMoment: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              润滑脂磨损颗粒分析
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">铁元素含量 (ppm)</span>
                <span className={`font-mono font-bold text-lg ${bearingState.greaseIronContent > 400 ? 'text-rose-500 animate-pulse' : bearingState.greaseIronContent > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {bearingState.greaseIronContent.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${bearingState.greaseIronContent > 400 ? 'bg-rose-500' : bearingState.greaseIronContent > 200 ? 'bg-amber-500' : 'bg-zinc-500'}`} style={{ width: `${Math.min(100, (bearingState.greaseIronContent / 600) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(200 / 600) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(400 / 600) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>注意: 200</span>
                <span>危险: 400</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#18181b] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(113,113,122,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></div>
            滚道受力分布与剥落损伤 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={bearingState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${bearingState.overturningMoment > 8000 ? 'text-rose-500 animate-bounce' : 'text-zinc-400'}`} />
              <div>
                <div className="text-xs text-slate-400">边缘应力集中指数</div>
                <div className={`text-xl font-mono ${bearingState.overturningMoment > 8000 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (bearingState.overturningMoment / 10000) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {bearingState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="滚道接触疲劳 (点蚀/剥落)" value={(bearingState.greaseIronContent / 500) * 100} critical={80} />
              <DiagnosticItem label="倾覆力矩超载 (塑性变形)" value={(bearingState.overturningMoment / 10000) * 100} critical={80} />
              <DiagnosticItem label="密封失效/润滑不良" value={(bearingState.greaseIronContent / 600) * 100} critical={60} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-zinc-400">诊断结论与建议：</strong></p>
              {bearingState.greaseIronContent > 400 ? (
                <span className="text-rose-400 font-bold">【危急】 润滑脂中铁元素含量严重超标，表明滚道或滚动体已发生严重的疲劳剥落或异常磨损。建议立即停机进行内窥镜检查。</span>
              ) : bearingState.overturningMoment > 8000 ? (
                <span className="text-rose-400 font-bold">【危急】 倾覆力矩过大，导致单侧滚道承受极高接触应力，极易引发不可逆的塑性变形。请规范装船作业，避免偏载。</span>
              ) : bearingState.greaseIronContent > 200 ? (
                <span className="text-amber-400">【警告】 铁谱分析显示磨损加剧，可能处于疲劳点蚀初期。建议缩短润滑脂取样周期，增加注脂量。</span>
              ) : bearingState.axialLoad > 1200 ? (
                <span className="text-yellow-400">【注意】 轴向载荷偏高，长期运行将缩短支承寿命。</span>
              ) : (
                <span className="text-emerald-400">【正常】 回转支承受力均匀，润滑状态良好，未见异常磨损。</span>
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
      <span className="font-mono text-zinc-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-zinc-500" />
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
