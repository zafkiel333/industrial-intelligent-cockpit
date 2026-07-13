import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Navigation, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/propeller-blade-cavitation/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[propeller-blade-cavitation]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/propeller-blade-cavitation';
import { PropellerState } from '../../../components/life-warning/propeller-blade-cavitation/three-types';

export const View: React.FC = () => {
  const [propState, setPropState] = useState<PropellerState>({
    rpm: 90, // Rotations per minute
    shipSpeed: 18.5, // knots
    waterDepth: 12.0, // meters (draft/submergence)
    cavitationArea: 5.0, // %
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(21000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPropState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate sea conditions
        // Pitching/Rolling affects submergence depth
        const depthFluctuation = Math.sin(Date.now() / 2000) * 2.0; 
        const newDepth = Math.max(2.0, 12.0 + depthFluctuation);

        // RPM varies slightly
        const newRpm = Math.max(40, Math.min(120, prev.rpm + (Math.random() - 0.5)));
        
        // Ship speed lags behind RPM
        const targetSpeed = newRpm * 0.2;
        const newSpeed = prev.shipSpeed + (targetSpeed - prev.shipSpeed) * 0.05;

        // Cavitation generation logic
        // High RPM + Low Pressure (shallow depth) = Cavitation
        let cavIntensity = 0;
        if (newRpm > 80) {
            // Base cavitation at high speed
            cavIntensity += (newRpm - 80) * 0.1;
            // Depth penalty (closer to surface = lower pressure = more cavitation)
            if (newDepth < 10) {
                cavIntensity += (10 - newDepth) * 0.5;
            }
        }

        // Wear (pitting) accumulates based on cavitation intensity
        // Cavitation bubble collapse causes shockwaves that erode metal
        let wearRate = 0.0001;
        if (cavIntensity > 2.0) wearRate *= 10;
        if (cavIntensity > 5.0) wearRate *= 50;
        
        const newArea = Math.min(100, prev.cavitationArea + wearRate);

        const areaPenalty = Math.max(0, (newArea / 30) * 60); // 30% area is critical
        const activeCavPenalty = Math.min(20, cavIntensity * 2);

        const health = Math.max(0, Math.floor(100 - areaPenalty - activeCavPenalty));
        
        const baseLife = 40000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          rpm: newRpm,
          shipSpeed: newSpeed,
          waterDepth: newDepth,
          cavitationArea: newArea,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPropState({
      rpm: 90,
      shipSpeed: 18.0,
      waterDepth: 12.0,
      cavitationArea: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(40000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-3">
            <Navigation className="w-8 h-8" />
            螺旋桨叶片空泡腐蚀预警
          </h1>
          <p className="text-slate-400 mt-1">基于转速、航速与吃水深度的螺旋桨梢涡空化与剥蚀损伤评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">叶片结构健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>进坞修复/更换螺旋桨</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              航行工况实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="螺旋桨转速 (RPM)" value={propState.rpm} max={150} color={propState.rpm > 110 ? 'bg-rose-500' : propState.rpm > 90 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPropState(s => ({...s, rpm: v}))} />
              <ParameterControl label="船舶航速 (Knots)" value={propState.shipSpeed} max={30} color="bg-sky-500" onChange={(v) => setPropState(s => ({...s, shipSpeed: v}))} />
              <ParameterControl label="螺旋桨沉浸深度 (m)" value={propState.waterDepth} max={20} min={0} color={propState.waterDepth < 5 ? 'bg-rose-500' : propState.waterDepth < 8 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPropState(s => ({...s, waterDepth: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              叶片剥蚀状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">空泡剥蚀面积占比 (%)</span>
                <span className={`font-mono font-bold text-lg ${propState.cavitationArea > 25 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {propState.cavitationArea.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${propState.cavitationArea > 25 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${(propState.cavitationArea / 40) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(30 / 40) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">效率严重下降临界值: 30%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#000814] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            梢涡空化与叶面剥蚀 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={propState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${propState.rpm > 100 && propState.waterDepth < 8 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">当前空化剧烈程度</div>
                <div className={`text-xl font-mono ${propState.rpm > 100 && propState.waterDepth < 8 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.max(0, Math.min(100, (propState.rpm - 70) * 1.5 + (10 - propState.waterDepth) * 5)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {propState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="叶面剥蚀损伤 (面积扩大)" value={(propState.cavitationArea / 30) * 100} critical={85} />
              <DiagnosticItem label="梢涡空化风险 (高转速/浅吃水)" value={Math.max(0, (propState.rpm - 80) * 1.5 + (12 - propState.waterDepth) * 5)} critical={70} />
              <DiagnosticItem label="推进效率下降 (推力损失)" value={(propState.cavitationArea / 40) * 100} critical={60} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {propState.cavitationArea > 28 ? (
                <span className="text-rose-400 font-bold">【危急】 叶片剥蚀面积过大，表面严重蜂窝状损伤，推进效率大幅下降且伴随强烈振动！必须在下次进坞时进行焊补修复或更换。</span>
              ) : (propState.rpm > 100 && propState.waterDepth < 6) ? (
                <span className="text-rose-400 font-bold">【危急】 浅水高转速导致极强烈的空化效应，气泡溃灭正快速侵蚀叶片！请立即降低主机转速。</span>
              ) : propState.waterDepth < 8 ? (
                <span className="text-amber-400">【警告】 船舶吃水较浅，螺旋桨静水压力不足，容易诱发空化。建议在浅水区或压载航行时控制航速。</span>
              ) : propState.cavitationArea > 15 ? (
                <span className="text-yellow-400">【注意】 叶片已出现明显剥蚀坑，建议在水下检验时重点关注，并优化日常航行转速区间。</span>
              ) : (
                <span className="text-emerald-400">【正常】 螺旋桨水动力性能良好，未发生严重空化，叶片表面完整。</span>
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
      <span className="font-mono text-blue-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
