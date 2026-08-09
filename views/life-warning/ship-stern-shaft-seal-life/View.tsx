import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Anchor, Droplets } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-stern-shaft-seal-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ship-stern-shaft-seal-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ship-stern-shaft-seal-life';
import { SternSealState } from '../../../components/life-warning/ship-stern-shaft-seal-life/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<SternSealState>({
    shaftSpeed: 90, // RPM
    draftDepth: 12.5, // m
    lubeOilPressure: 1.5, // bar
    sealWear: 1.2, // mm
    operatingHours: 24000, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(16000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate ship operations
        const isManeuvering = Math.random() > 0.8;
        let newSpeed = prev.shaftSpeed;
        let newDraft = prev.draftDepth;

        if (isManeuvering) {
            newSpeed = 40 + Math.random() * 60; // Variable speed
        } else {
            newSpeed = prev.shaftSpeed + (Math.random() - 0.5) * 2; // Steady cruising
        }

        // Draft changes slowly (loading/unloading or waves)
        newDraft = Math.max(8.0, Math.min(18.0, prev.draftDepth + (Math.random() - 0.5) * 0.1));

        // Seawater pressure = draft * 0.1 bar (approx)
        const waterPressure = newDraft * 0.1;
        
        // Gravity tank maintains oil pressure slightly above water pressure
        let targetOilPressure = waterPressure + 0.2; 
        
        // If seals are worn, oil pressure might drop due to leakage
        if (prev.sealWear > 3.5) {
            targetOilPressure -= 0.15;
        }
        
        const newOilPressure = prev.lubeOilPressure + (targetOilPressure - prev.lubeOilPressure) * 0.1;

        // Wear rate depends on shaft speed and pressure differential
        let wearRate = 0.0001;
        if (newSpeed > 100) wearRate *= 1.5;
        if (newOilPressure < waterPressure) wearRate *= 5; // Water ingress ruins lubrication, rapid wear
        
        const newWear = Math.min(5.0, prev.sealWear + wearRate);

        // Health calculation
        const wearPenalty = Math.max(0, (newWear / 4.0) * 60); // 4mm is critical
        const pressurePenalty = newOilPressure < waterPressure ? 30 : 0; // Negative pressure diff is very bad

        const health = Math.max(0, Math.floor(100 - wearPenalty - pressurePenalty));
        
        const baseLife = 40000; // ~5 years
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          shaftSpeed: newSpeed,
          draftDepth: newDraft,
          lubeOilPressure: newOilPressure,
          sealWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      shaftSpeed: 90,
      draftDepth: 12.5,
      lubeOilPressure: 1.45,
      sealWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(40000);
  };

  const waterPressure = sealState.draftDepth * 0.1;
  const pressureDiff = sealState.lubeOilPressure - waterPressure;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <Anchor className="w-8 h-8" />
            船舶尾轴密封装置寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于吃水压差、轴转速与橡胶唇形密封圈磨损的防漏评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">密封健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-sky-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>进坞更换密封圈</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              尾轴工况与压差监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="尾轴转速 (RPM)" value={sealState.shaftSpeed} max={150} color="bg-zinc-400" onChange={(v) => setSealState(s => ({...s, shaftSpeed: v}))} />
              <ParameterControl label="船舶吃水深度 (m)" value={sealState.draftDepth} max={25} color="bg-blue-500" onChange={(v) => setSealState(s => ({...s, draftDepth: v}))} />
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">滑油压力 vs 海水压力</span>
                  <span className={`font-mono font-bold ${pressureDiff < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    ΔP: {pressureDiff > 0 ? '+' : ''}{pressureDiff.toFixed(2)} bar
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-500 mb-1">滑油 (bar)</div>
                    <div className="text-lg font-mono text-yellow-400">{sealState.lubeOilPressure.toFixed(2)}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-500 mb-1">海水 (bar)</div>
                    <div className="text-lg font-mono text-blue-400">{waterPressure.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              橡胶唇口磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">密封圈磨损量 (mm)</span>
                <span className={`font-mono font-bold text-lg ${sealState.sealWear > 3.5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {sealState.sealWear.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${sealState.sealWear > 3.5 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${(sealState.sealWear / 5) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(4 / 5) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">泄漏临界值: 4.0mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#082f49] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
            尾轴管油水压差与密封泄漏 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Droplets className={`w-6 h-6 ${pressureDiff < 0 ? 'text-rose-500 animate-bounce' : pressureDiff < 0.1 ? 'text-amber-400' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">海水倒灌/滑油泄漏风险</div>
                <div className={`text-xl font-mono ${pressureDiff < 0 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {pressureDiff < 0 ? '高 (海水倒灌)' : pressureDiff < 0.1 ? '中 (微量泄漏)' : '低 (密封良好)'}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {sealState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="密封唇口异常磨损/老化" value={(sealState.sealWear / 5) * 100} critical={80} />
              <DiagnosticItem label="重力油箱液位/压力异常" value={pressureDiff < 0.1 ? 90 : 10} critical={80} />
              <DiagnosticItem label="尾轴承下沉/偏心磨损" value={(sealState.operatingHours / 50000) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {pressureDiff < 0 ? (
                <span className="text-rose-400 font-bold">【危急】 滑油压力低于海水压力！海水可能已倒灌进入尾轴管，将导致尾轴承迅速损坏。请立即检查重力油箱液位及管路阀门。</span>
              ) : sealState.sealWear > 4.0 ? (
                <span className="text-rose-400 font-bold">【危急】 密封圈唇口磨损严重，失去弹性，存在大量滑油外泄污染海洋或海水内漏的风险。必须安排紧急坞修更换。</span>
              ) : pressureDiff < 0.1 ? (
                <span className="text-amber-400">【警告】 油水压差过小，密封裕度不足。在船舶纵摇或吃水变化时容易发生泄漏。建议调整重力油箱高度或检查系统。</span>
              ) : sealState.sealWear > 2.5 ? (
                <span className="text-yellow-400">【注意】 密封圈已出现中度磨损，请密切关注尾轴管滑油日耗量及艉部水质。</span>
              ) : (
                <span className="text-emerald-400">【正常】 尾轴密封装置油水压差稳定，密封圈状态良好，无泄漏风险。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
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
