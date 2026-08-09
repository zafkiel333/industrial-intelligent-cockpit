import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Wind, Waves, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/mine-fan-blade-fatigue/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mine-fan-blade-fatigue]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mine-fan-blade-fatigue';
import { FanBladeState } from '../../../components/life-warning/mine-fan-blade-fatigue/three-types';

export const View: React.FC = () => {
  const [fanState, setFanState] = useState<FanBladeState>({
    vibrationAmplitude: 1.5, // mm
    vibrationFrequency: 25, // Hz
    airFlow: 120, // m³/s
    dustAccumulation: 0.5, // mm
    operatingHours: 12000, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(35000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setFanState(prev => {
        const newHours = prev.operatingHours + 1;
        
        const newAirFlow = Math.max(80, Math.min(200, prev.airFlow + (Math.random() - 0.5) * 5));
        
        // Dust accumulates slowly over time, faster with higher airflow
        const newDust = Math.min(10, prev.dustAccumulation + (newAirFlow / 100) * 0.005);

        // Vibration increases with dust (unbalance) and age
        let vibTarget = 1.0 + (newDust * 0.5);
        if (newHours > 20000) vibTarget += 1.0;
        const newVibAmp = Math.max(0.5, Math.min(15, prev.vibrationAmplitude + (vibTarget - prev.vibrationAmplitude) * 0.1 + (Math.random() - 0.5) * 0.2));
        
        // Frequency shifts slightly with load
        const newVibFreq = 25 + (newAirFlow - 120) * 0.05 + (Math.random() - 0.5);

        const vibPenalty = Math.max(0, (newVibAmp - 4.5) / 5.5) * 45;
        const dustPenalty = Math.max(0, (newDust - 2) / 3) * 25;
        
        // High cycle fatigue penalty (amplitude * frequency)
        const fatigueFactor = (newVibAmp * newVibFreq) / 200;
        const fatiguePenalty = Math.max(0, fatigueFactor - 1) * 20;

        const health = Math.max(0, Math.floor(100 - vibPenalty - dustPenalty - fatiguePenalty));
        
        const baseLife = 50000;
        // Life drops exponentially with vibration amplitude
        const vibLifeFactor = Math.pow(Math.max(1, newVibAmp / 2), 2); 
        const remainingLife = Math.max(0, Math.floor((baseLife / vibLifeFactor) * (health / 100) - (newHours * 0.8)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          airFlow: newAirFlow,
          dustAccumulation: newDust,
          vibrationAmplitude: newVibAmp,
          vibrationFrequency: newVibFreq,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setFanState({
      vibrationAmplitude: 0.8,
      vibrationFrequency: 25,
      airFlow: 120,
      dustAccumulation: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Wind className="w-8 h-8" />
            矿用风机叶片疲劳预警
          </h1>
          <p className="text-slate-400 mt-1">基于高频振动、气动载荷与粉尘附着的高周疲劳寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">叶轮健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-cyan-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换叶轮总成</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="通风量 (m³/s)" value={fanState.airFlow} max={250} color={fanState.airFlow > 200 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setFanState(s => ({...s, airFlow: v}))} />
              <ParameterControl label="振动幅值 (mm)" value={fanState.vibrationAmplitude} max={10} color={fanState.vibrationAmplitude > 7.1 ? 'bg-rose-500' : fanState.vibrationAmplitude > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setFanState(s => ({...s, vibrationAmplitude: v}))} />
              <ParameterControl label="粉尘附着厚度 (mm)" value={fanState.dustAccumulation} max={8} color={fanState.dustAccumulation > 5 ? 'bg-rose-500' : fanState.dustAccumulation > 2 ? 'bg-amber-500' : 'bg-cyan-500'} onChange={(v) => setFanState(s => ({...s, dustAccumulation: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <Waves className="w-5 h-5" />
              振动频谱特征
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">主频 (Hz)</span>
                <span className={`font-mono font-bold text-lg text-cyan-400`}>
                  {fanState.vibrationFrequency.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-12 bg-slate-800 rounded-lg overflow-hidden relative flex items-end px-1 pb-1 gap-0.5">
                {/* Fake spectrum bars */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const isMainFreq = Math.abs(i * 2.5 - fanState.vibrationFrequency) < 2.5;
                  const height = isMainFreq ? (fanState.vibrationAmplitude / 10) * 100 : Math.random() * 20 + 5;
                  return (
                    <div key={i} className={`flex-1 rounded-t-sm transition-all duration-200 ${isMainFreq ? (fanState.vibrationAmplitude > 7.1 ? 'bg-rose-500' : 'bg-cyan-400') : 'bg-slate-600'}`} style={{ height: `${height}%` }}></div>
                  )
                })}
              </div>
              <div className="text-right text-xs text-slate-500">1X 转频特征明显</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(6,182,212,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            叶片应力分布与气动流场 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={fanState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${fanState.vibrationAmplitude > 7.1 ? 'text-rose-500' : 'text-cyan-400'}`} />
              <div>
                <div className="text-xs text-slate-400">高周疲劳损伤指数</div>
                <div className={`text-xl font-mono ${fanState.vibrationAmplitude > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((fanState.vibrationAmplitude * fanState.vibrationFrequency) / 250) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {fanState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="叶根疲劳裂纹 (高振幅应力)" value={(fanState.vibrationAmplitude / 10) * 100} critical={71} />
              <DiagnosticItem label="转子动不平衡 (粉尘不均匀附着)" value={(fanState.dustAccumulation / 6) * 100} critical={80} />
              <DiagnosticItem label="气动激振/失速 (超大风量)" value={Math.max(0, (fanState.airFlow - 180) / 70) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断结论与建议：</strong></p>
              {fanState.vibrationAmplitude > 7.5 ? (
                <span className="text-rose-400 font-bold">【危急】 振动幅值严重超标，叶根承受极高交变应力，存在叶片断裂飞出的致命风险！必须立即停机进行探伤检查。</span>
              ) : fanState.dustAccumulation > 4.5 ? (
                <span className="text-rose-400 font-bold">【危急】 叶片粉尘附着严重，导致转子严重动不平衡，引发强烈振动。建议立即安排停机清灰作业。</span>
              ) : fanState.vibrationAmplitude > 4.5 ? (
                <span className="text-amber-400">【警告】 振动处于报警区间，高周疲劳累积加速，建议进行现场动平衡校正，并缩短巡检周期。</span>
              ) : fanState.airFlow > 220 ? (
                <span className="text-yellow-400">【注意】 风量接近设计极限，气动载荷大，可能诱发叶片颤振，建议调整风门或变频器频率。</span>
              ) : (
                <span className="text-emerald-400">【正常】 振动平稳，气动性能良好，叶轮总成处于安全运行状态。</span>
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
      <span className="font-mono text-cyan-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
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
