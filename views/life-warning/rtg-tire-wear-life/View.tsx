import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Truck, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/rtg-tire-wear-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[rtg-tire-wear-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/rtg-tire-wear-life';
import { TireState } from '../../../components/life-warning/rtg-tire-wear-life/three-types';

export const View: React.FC = () => {
  const [tireState, setTireState] = useState<TireState>({
    pressure: 9.8, // bar
    temperature: 35, // Celsius
    load: 25, // tons
    treadDepth: 45, // mm (New is ~60mm)
    operatingHours: 4500, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(5500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setTireState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate RTG operation (lifting, gantry travel)
        const isLifting = Math.random() > 0.6;
        let newLoad = prev.load;
        
        if (isLifting) {
            newLoad = 20 + Math.random() * 20; // 20-40t load
        } else {
            newLoad = 10 + Math.random() * 5; // Empty spreader
        }

        // Pressure changes slightly with temperature and leaks
        let newPressure = prev.pressure;
        if (Math.random() > 0.95) newPressure -= 0.01; // Slow leak
        
        // Temperature rises with load, speed (simulated by time), and low pressure
        let tempTarget = 30;
        if (newLoad > 30) tempTarget += 20;
        if (newPressure < 8.0) tempTarget += 30; // Under-inflation causes severe heat
        
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        // Wear rate depends on load, temperature, and pressure
        let wearRate = 0.001;
        if (newLoad > 35) wearRate *= 2;
        if (newTemp > 60) wearRate *= 3; // Heat accelerates rubber degradation
        if (newPressure < 8.5 || newPressure > 11.0) wearRate *= 1.5; // Abnormal pressure causes uneven wear
        
        const newDepth = Math.max(0, prev.treadDepth - wearRate);

        const wearPenalty = Math.max(0, (60 - newDepth) / 50) * 50; // Critical at 10mm
        const pressurePenalty = newPressure < 8.0 ? 20 : newPressure > 11.5 ? 15 : 0;
        const tempPenalty = newTemp > 75 ? 20 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - pressurePenalty - tempPenalty));
        
        const baseLife = 10000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          load: newLoad,
          pressure: newPressure,
          temperature: newTemp,
          treadDepth: newDepth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setTireState({
      pressure: 10.0,
      temperature: 25,
      load: 10,
      treadDepth: 60,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(10000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500 flex items-center gap-3">
            <Truck className="w-8 h-8" />
            场桥轮胎磨损寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于胎压、胎温与载荷的工程轮胎异常磨损与爆胎风险评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轮胎健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-emerald-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换新胎</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              实时工况监测 (TPMS)
            </h3>
            <div className="space-y-6">
              <ParameterControl label="轮胎压力 (Bar)" value={tireState.pressure} max={12} min={6} color={tireState.pressure < 8.5 || tireState.pressure > 11 ? 'bg-rose-500' : 'bg-emerald-500'} onChange={(v) => setTireState(s => ({...s, pressure: v}))} />
              <ParameterControl label="内部胎温 (°C)" value={tireState.temperature} max={100} color={tireState.temperature > 75 ? 'bg-rose-500' : tireState.temperature > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTireState(s => ({...s, temperature: v}))} />
              <ParameterControl label="单轮动态载荷 (t)" value={tireState.load} max={45} color={tireState.load > 35 ? 'bg-amber-500' : 'bg-sky-500'} onChange={(v) => setTireState(s => ({...s, load: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              胎面磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">剩余花纹深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${tireState.treadDepth < 15 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {tireState.treadDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${tireState.treadDepth < 15 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(tireState.treadDepth / 60) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(10 / 60) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">初始: 60mm | 报废限值: 10mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#18181b] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            轮胎变形、热分布与磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={tireState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${tireState.temperature > 75 || tireState.pressure < 8.0 ? 'text-rose-500 animate-bounce' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">爆胎风险指数</div>
                <div className={`text-xl font-mono ${tireState.temperature > 75 || tireState.pressure < 8.0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (tireState.temperature / 100) * 50 + ((10 - tireState.pressure) / 4) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {tireState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
              <DiagnosticItem label="胎面过度磨损 (抓地力丧失)" value={((60 - tireState.treadDepth) / 50) * 100} critical={90} />
              <DiagnosticItem label="热剥离/爆胎风险 (高温)" value={(tireState.temperature / 90) * 100} critical={85} />
              <DiagnosticItem label="胎侧帘线疲劳 (欠压/超载)" value={tireState.pressure < 8.5 ? ((8.5 - tireState.pressure) / 2.5) * 100 : 0} critical={70} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-emerald-400">诊断结论与建议：</strong></p>
              {tireState.treadDepth < 12 ? (
                <span className="text-rose-400 font-bold">【危急】 花纹深度已接近报废极限，雨天极易打滑，且容易被异物刺穿。必须立即安排更换。</span>
              ) : tireState.temperature > 80 ? (
                <span className="text-rose-400 font-bold">【危急】 胎温极高，橡胶内部可能发生热降解，爆胎风险极大！请立即停止作业，自然冷却。</span>
              ) : tireState.pressure < 8.0 ? (
                <span className="text-amber-400">【警告】 胎压严重不足，导致胎侧过度屈伸发热，加速损坏。请立即充气至标准气压(10.0 Bar)。</span>
              ) : tireState.load > 40 ? (
                <span className="text-yellow-400">【注意】 当前处于超载状态，长期超载会显著缩短轮胎寿命。</span>
              ) : (
                <span className="text-emerald-400">【正常】 轮胎气压、温度及磨损状态均在安全范围内，可正常作业。</span>
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
      <span className="font-mono text-emerald-400">{value.toFixed(1)}</span>
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
