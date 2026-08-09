import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Grid, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/vibrating-screen-mesh-damage/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibrating-screen-mesh-damage]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibrating-screen-mesh-damage';
import { ScreenMeshState } from '../../../components/life-warning/vibrating-screen-mesh-damage/three-types';

export const View: React.FC = () => {
  const [screenState, setScreenState] = useState<ScreenMeshState>({
    vibrationAmplitude: 8.5, // mm
    vibrationFrequency: 16, // Hz
    materialLoad: 350, // t/h
    meshWear: 25, // %
    operatingHours: 850, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(650); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate feed variations
        const newLoad = Math.max(100, Math.min(600, prev.materialLoad + (Math.random() * 40 - 20)));
        
        // Vibration changes slightly with load
        const newAmp = Math.max(6.0, Math.min(12.0, 8.5 - (newLoad - 350) * 0.005 + (Math.random() - 0.5) * 0.2));
        const newFreq = 16 + (Math.random() - 0.5) * 0.1;

        // Wear rate depends on load and vibration intensity (amp * freq^2)
        let wearRate = 0.01;
        wearRate *= (newLoad / 350);
        const vibIntensity = newAmp * Math.pow(newFreq, 2);
        wearRate *= (vibIntensity / (8.5 * Math.pow(16, 2)));

        const newWear = Math.min(100, prev.meshWear + wearRate);

        const wearPenalty = Math.max(0, (newWear / 100) * 60);
        const loadPenalty = Math.max(0, (newLoad - 450) / 150) * 20;
        
        // Resonance or abnormal vibration penalty
        const vibPenalty = (newAmp > 10 || newAmp < 7) ? 20 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - loadPenalty - vibPenalty));
        
        const baseLife = 1500;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          materialLoad: newLoad,
          vibrationAmplitude: newAmp,
          vibrationFrequency: newFreq,
          meshWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setScreenState({
      vibrationAmplitude: 8.5,
      vibrationFrequency: 16,
      materialLoad: 300,
      meshWear: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(1500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-400 flex items-center gap-3">
            <Grid className="w-8 h-8" />
            振动筛筛网破损预警
          </h1>
          <p className="text-slate-400 mt-1">基于振动特性、给料负荷的聚氨酯/钢丝筛网磨损与断裂评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">筛网健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-purple-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换筛网面板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              筛分工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="给料负荷 (t/h)" value={screenState.materialLoad} max={600} color={screenState.materialLoad > 500 ? 'bg-rose-500' : screenState.materialLoad > 400 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setScreenState(s => ({...s, materialLoad: v}))} />
              <ParameterControl label="振幅 (双振幅 mm)" value={screenState.vibrationAmplitude} max={15} min={5} color={screenState.vibrationAmplitude > 11 || screenState.vibrationAmplitude < 7 ? 'bg-rose-500' : 'bg-emerald-500'} onChange={(v) => setScreenState(s => ({...s, vibrationAmplitude: v}))} />
              <ParameterControl label="激振频率 (Hz)" value={screenState.vibrationFrequency} max={20} min={10} color={screenState.vibrationFrequency > 18 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setScreenState(s => ({...s, vibrationFrequency: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              筛网破损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">综合磨损/破损率 (%)</span>
                <span className={`font-mono font-bold text-lg ${screenState.meshWear > 85 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {screenState.meshWear.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${screenState.meshWear > 85 ? 'bg-rose-500' : 'bg-purple-500'}`} style={{ width: `${screenState.meshWear}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '85%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">跑粗临界值: 85%</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(168,85,247,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            筛面物料分布与筛孔磨损扩径 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={screenState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${screenState.meshWear > 85 ? 'text-rose-500' : 'text-purple-400'}`} />
              <div>
                <div className="text-xs text-slate-400">产品跑粗率预估</div>
                <div className={`text-xl font-mono ${screenState.meshWear > 85 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.max(0, (screenState.meshWear - 60) * 0.5).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {screenState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="筛孔磨损扩径 (跑粗)" value={screenState.meshWear} critical={85} />
              <DiagnosticItem label="筛网疲劳断裂 (高振幅/共振)" value={screenState.vibrationAmplitude > 10 ? (screenState.vibrationAmplitude - 10) * 20 : 0} critical={60} />
              <DiagnosticItem label="筛面压垮/塌陷 (超载)" value={(screenState.materialLoad / 600) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-purple-400">诊断结论与建议：</strong></p>
              {screenState.meshWear > 85 ? (
                <span className="text-rose-400 font-bold">【危急】 筛网磨损严重，部分区域已破损，导致筛下产品严重跑粗，影响后续工艺！必须立即停机更换破损筛板。</span>
              ) : screenState.materialLoad > 500 ? (
                <span className="text-rose-400 font-bold">【危急】 给料负荷严重超标，料层过厚导致筛分效率急剧下降，且极易压垮筛网。请立即减少给料量。</span>
              ) : screenState.vibrationAmplitude > 11 || screenState.vibrationAmplitude < 7 ? (
                <span className="text-amber-400">【警告】 振幅异常。过大易导致筛网疲劳断裂，过小易引起堵孔。建议检查激振器偏心块或减振弹簧。</span>
              ) : screenState.meshWear > 60 ? (
                <span className="text-yellow-400">【注意】 筛网孔径已开始扩大，产品粒度上限可能略有增加。建议在下次检修时重点检查冲击区筛板。</span>
              ) : (
                <span className="text-emerald-400">【正常】 振动参数稳定，给料均匀，筛网磨损状况良好。</span>
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
      <span className="font-mono text-purple-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
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
