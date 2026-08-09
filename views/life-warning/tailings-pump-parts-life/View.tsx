import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Waves, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/tailings-pump-parts-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[tailings-pump-parts-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/tailings-pump-parts-life';
import { PumpPartsState } from '../../../components/life-warning/tailings-pump-parts-life/three-types';

export const View: React.FC = () => {
  const [pumpState, setPumpState] = useState<PumpPartsState>({
    flowRate: 1200, // m3/h
    slurryConcentration: 35, // %
    vibration: 3.5, // mm/s
    linerWear: 8.5, // mm
    operatingHours: 2100, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(1900); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPumpState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate process variations
        const newFlow = Math.max(800, Math.min(1800, prev.flowRate + (Math.random() * 100 - 50)));
        const newConcentration = Math.max(20, Math.min(65, prev.slurryConcentration + (Math.random() * 2 - 1)));

        // Wear rate depends heavily on flow velocity (flow rate) and concentration
        let wearRate = 0.002;
        wearRate *= Math.pow(newFlow / 1200, 2); // Velocity squared relationship
        wearRate *= (newConcentration / 30); // Linear with concentration

        const newWear = Math.min(40, prev.linerWear + wearRate);

        // Vibration increases with wear (imbalance/cavitation) and flow rate
        const baseVib = 2.0 + (newWear / 30) * 6.0;
        let newVib = Math.max(1.0, Math.min(25.0, baseVib + (newFlow / 1800) * 2.0 + (Math.random() - 0.5)));
        
        // Simulate cavitation if flow is too high for the suction conditions
        if (newFlow > 1600) {
            newVib += 5.0; // Cavitation spike
        }

        const wearPenalty = Math.max(0, (newWear / 30) * 50);
        const vibPenalty = Math.max(0, (newVib - 7.1) / 5) * 30;

        const health = Math.max(0, Math.floor(100 - wearPenalty - vibPenalty));
        
        const baseLife = 4000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          flowRate: newFlow,
          slurryConcentration: newConcentration,
          vibration: newVib,
          linerWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPumpState({
      flowRate: 1200,
      slurryConcentration: 30,
      vibration: 2.0,
      linerWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(4000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Waves className="w-8 h-8" />
            尾矿泵过流件寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于流量、浓度与振动的蜗壳及护板冲刷磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">过流件健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-cyan-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换蜗壳/护板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              输送工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="输送流量 (m³/h)" value={pumpState.flowRate} max={2000} color={pumpState.flowRate > 1600 ? 'bg-rose-500' : pumpState.flowRate > 1400 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, flowRate: v}))} />
              <ParameterControl label="矿浆浓度 (Cw %)" value={pumpState.slurryConcentration} max={70} color={pumpState.slurryConcentration > 55 ? 'bg-rose-500' : pumpState.slurryConcentration > 45 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, slurryConcentration: v}))} />
              <ParameterControl label="泵体振动速度 (mm/s)" value={pumpState.vibration} max={20} color={pumpState.vibration > 11.2 ? 'bg-rose-500' : pumpState.vibration > 7.1 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPumpState(s => ({...s, vibration: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              蜗壳磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">隔舌处磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${pumpState.linerWear > 28 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pumpState.linerWear.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pumpState.linerWear > 28 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${(pumpState.linerWear / 35) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(30 / 35) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">穿孔报废临界值: 30 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(6,182,212,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            泵腔内部流场与蜗壳冲刷磨损 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pumpState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${pumpState.vibration > 11.2 || pumpState.flowRate > 1600 ? 'text-rose-500' : 'text-cyan-400'}`} />
              <div>
                <div className="text-xs text-slate-400">汽蚀/穿孔风险指数</div>
                <div className={`text-xl font-mono ${pumpState.vibration > 11.2 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (pumpState.vibration / 20) * 50 + (pumpState.linerWear / 30) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pumpState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
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
              <DiagnosticItem label="蜗壳隔舌冲刷磨损 (高流速)" value={(pumpState.linerWear / 32) * 100} critical={85} />
              <DiagnosticItem label="汽蚀损伤 (大流量/低吸入压)" value={pumpState.flowRate > 1500 ? (pumpState.flowRate - 1500) / 5 : 0} critical={60} />
              <DiagnosticItem label="转子不平衡/轴承疲劳 (高振动)" value={(pumpState.vibration / 15) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断结论与建议：</strong></p>
              {pumpState.linerWear > 29 ? (
                <span className="text-rose-400 font-bold">【危急】 蜗壳壁厚已接近穿孔极限，随时可能发生矿浆泄漏事故！必须立即停泵更换蜗壳。</span>
              ) : pumpState.vibration > 11.2 ? (
                <span className="text-rose-400 font-bold">【危急】 泵体振动剧烈，可能由于叶轮严重磨损导致不平衡，或正在发生严重汽蚀。请立即检查。</span>
              ) : pumpState.flowRate > 1600 ? (
                <span className="text-amber-400">【警告】 流量过大，偏离泵的最佳效率点(BEP)，极易引发汽蚀并加速过流件冲刷磨损。建议调整管路阻力或降低转速。</span>
              ) : pumpState.linerWear > 20 ? (
                <span className="text-yellow-400">【注意】 蜗壳及护板磨损明显，泵效可能已开始下降。建议准备备件，计划在下个检修窗口更换。</span>
              ) : (
                <span className="text-emerald-400">【正常】 渣浆泵运行平稳，过流件磨损速率在预期范围内。</span>
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
