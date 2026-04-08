import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Zap, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/explosion-proof-motor-bearing-life/ThreeScene';
import { MotorBearingState } from '../../../components/life-warning/explosion-proof-motor-bearing-life/three-types';

export const View: React.FC = () => {
  const [bearingState, setBearingState] = useState<MotorBearingState>({
    temperature: 65, // Celsius
    vibrationVelocity: 2.5, // mm/s
    acousticEmission: 35, // dB
    greaseLife: 80, // %
    operatingHours: 4500, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(12000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBearingState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Grease degrades over time and with temperature
        let greaseDegradation = 0.005;
        if (prev.temperature > 80) greaseDegradation *= 2;
        if (prev.temperature > 100) greaseDegradation *= 5;
        const newGreaseLife = Math.max(0, prev.greaseLife - greaseDegradation);

        // Acoustic emission (high freq) detects early spalling
        let newAE = prev.acousticEmission;
        if (newGreaseLife < 40 && Math.random() > 0.9) newAE += 0.5;
        if (prev.vibrationVelocity > 4.5) newAE += 1.0;
        newAE = Math.min(100, Math.max(20, newAE + (Math.random() - 0.5) * 2));

        // Vibration (low freq) detects later stage damage
        let newVib = prev.vibrationVelocity;
        if (newAE > 60) newVib += 0.05;
        newVib = Math.min(15, Math.max(1.0, newVib + (Math.random() - 0.5) * 0.2));

        // Temperature rises with friction (poor grease or high vibration)
        let tempTarget = 50;
        if (newGreaseLife < 30) tempTarget += 20;
        if (newVib > 7.1) tempTarget += 30;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        const tempPenalty = Math.max(0, (newTemp - 85) / 25) * 30;
        const vibPenalty = Math.max(0, (newVib - 4.5) / 6.7) * 40;
        const aePenalty = Math.max(0, (newAE - 50) / 50) * 30;

        const health = Math.max(0, Math.floor(100 - tempPenalty - vibPenalty - aePenalty));
        
        const baseLife = 20000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          temperature: newTemp,
          vibrationVelocity: newVib,
          acousticEmission: newAE,
          greaseLife: newGreaseLife,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBearingState({
      temperature: 50,
      vibrationVelocity: 1.5,
      acousticEmission: 25,
      greaseLife: 100,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(20000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            矿用防爆电机轴承寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于振动、声发射与温度的多参量轴承早期故障与润滑状态评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轴承健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-amber-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换轴承/注脂</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="轴承温度 (°C)" value={bearingState.temperature} max={120} color={bearingState.temperature > 95 ? 'bg-rose-500' : bearingState.temperature > 80 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, temperature: v}))} />
              <ParameterControl label="振动速度 (mm/s)" value={bearingState.vibrationVelocity} max={15} color={bearingState.vibrationVelocity > 11.2 ? 'bg-rose-500' : bearingState.vibrationVelocity > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, vibrationVelocity: v}))} />
              <ParameterControl label="高频声发射 (dB)" value={bearingState.acousticEmission} max={100} color={bearingState.acousticEmission > 75 ? 'bg-rose-500' : bearingState.acousticEmission > 55 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, acousticEmission: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              润滑脂状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">剩余有效润滑 (%)</span>
                <span className={`font-mono font-bold text-lg ${bearingState.greaseLife < 20 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {bearingState.greaseLife.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${bearingState.greaseLife < 20 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${bearingState.greaseLife}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '20%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">干摩擦临界值: 20%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            轴承内部热分布与早期剥落 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={bearingState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${bearingState.acousticEmission > 75 || bearingState.vibrationVelocity > 7.1 ? 'text-rose-500' : 'text-amber-400'}`} />
              <div>
                <div className="text-xs text-slate-400">抱死/烧毁风险指数</div>
                <div className={`text-xl font-mono ${bearingState.temperature > 100 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (bearingState.temperature / 120) * 50 + (bearingState.vibrationVelocity / 15) * 50).toFixed(1)}%
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
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="早期微观剥落 (声发射异常)" value={(bearingState.acousticEmission / 100) * 100} critical={75} />
              <DiagnosticItem label="晚期宏观损伤 (低频振动大)" value={(bearingState.vibrationVelocity / 11.2) * 100} critical={80} />
              <DiagnosticItem label="润滑失效/过热烧伤" value={((100 - bearingState.greaseLife) / 80) * 50 + (bearingState.temperature / 110) * 50} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-400">诊断结论与建议：</strong></p>
              {bearingState.vibrationVelocity > 11.2 ? (
                <span className="text-rose-400 font-bold">【危急】 振动速度进入危险区，轴承可能已发生严重剥落或保持架断裂，极易引发电机扫膛！必须立即停机更换。</span>
              ) : bearingState.temperature > 95 ? (
                <span className="text-rose-400 font-bold">【危急】 轴承温度过高，润滑脂已流失或碳化，存在抱死烧毁风险。请立即检查冷却系统并补充润滑脂。</span>
              ) : bearingState.acousticEmission > 60 ? (
                <span className="text-amber-400">【警告】 高频声发射信号异常，表明滚道或滚动体表面已出现早期微裂纹或剥落。建议缩短监测周期，准备备件。</span>
              ) : bearingState.greaseLife < 30 ? (
                <span className="text-yellow-400">【注意】 润滑脂效能下降明显，油膜变薄。建议在近期维护窗口进行注脂保养。</span>
              ) : (
                <span className="text-emerald-400">【正常】 轴承运行平稳，振动与温度均在正常范围内，润滑良好。</span>
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
      <span className="font-mono text-amber-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
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
