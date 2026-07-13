import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-separator-filter-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ship-separator-filter-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ship-separator-filter-life';
import { SeparatorFilterState } from '../../../components/life-warning/ship-separator-filter-life/three-types';

export const View: React.FC = () => {
  const [filterState, setFilterState] = useState<SeparatorFilterState>({
    flowRate: 2.5, // m³/h
    oilContentIn: 5000, // ppm
    oilContentOut: 8, // ppm (Limit is 15ppm)
    pressureDrop: 0.3, // bar
    operatingHours: 1200, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(800); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setFilterState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate bilge pumping
        const isPumping = Math.random() > 0.1;
        let newFlow = prev.flowRate;
        let newOilIn = prev.oilContentIn;

        if (isPumping) {
            newFlow = 2.0 + Math.random() * 1.0;
            // Sometimes hit a heavily oiled patch of bilge water
            if (Math.random() > 0.9) {
                newOilIn = 10000 + Math.random() * 20000;
            } else {
                newOilIn = 2000 + Math.random() * 5000;
            }
        } else {
            newFlow = 0;
            newOilIn = 0;
        }

        // Filter clogging (pressure drop increases)
        // Rate depends on flow and incoming oil content
        let clogRate = 0.0001;
        if (newOilIn > 10000) clogRate *= 5; // Heavy oil clogs faster
        if (newFlow > 2.8) clogRate *= 1.5;
        
        const newPressureDrop = isPumping ? Math.min(2.0, prev.pressureDrop + clogRate) : prev.pressureDrop;

        // Separation efficiency drops as filter clogs
        // If pressure drop is high, oil gets pushed through
        let newOilOut = 5 + (newPressureDrop * 10); 
        // Add some random fluctuation based on input
        if (isPumping) {
            newOilOut += (newOilIn / 50000) * 5;
        } else {
            newOilOut = 0;
        }

        // Health calculation
        // 1.5 bar is usually the limit for filter change
        // 15 ppm is the legal discharge limit
        const pressurePenalty = Math.max(0, (newPressureDrop / 1.5) * 60); 
        const ppmPenalty = newOilOut > 14 ? 40 : 0; // Huge penalty if near legal limit

        const health = Math.max(0, Math.floor(100 - pressurePenalty - ppmPenalty));
        
        const baseLife = 2000; // ~2000 hours typical life
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          flowRate: newFlow,
          oilContentIn: newOilIn,
          oilContentOut: newOilOut,
          pressureDrop: newPressureDrop,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setFilterState({
      flowRate: 2.5,
      oilContentIn: 5000,
      oilContentOut: 5,
      pressureDrop: 0.1,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            船舶油水分离器滤芯寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于压差、处理流量与出水含油量 (15ppm) 的聚结滤芯堵塞评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">滤芯健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-teal-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换聚结滤芯</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              分离工况实时监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="处理流量 (m³/h)" value={filterState.flowRate} max={5} color="bg-blue-500" onChange={(v) => setFilterState(s => ({...s, flowRate: v}))} />
              <ParameterControl label="进水含油量 (ppm)" value={filterState.oilContentIn} max={50000} color="bg-amber-700" onChange={(v) => setFilterState(s => ({...s, oilContentIn: v}))} />
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">滤芯前后压差 (bar)</span>
                  <span className={`font-mono font-bold ${filterState.pressureDrop > 1.5 ? 'text-rose-500 animate-pulse' : filterState.pressureDrop > 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {filterState.pressureDrop.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden relative">
                  <div className={`h-full transition-all duration-300 ${filterState.pressureDrop > 1.5 ? 'bg-rose-500' : filterState.pressureDrop > 1.0 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(filterState.pressureDrop / 2.0) * 100}%` }}></div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(1.5 / 2.0) * 100}%` }}></div>
                </div>
                <div className="text-right text-xs text-slate-500 mt-1">更换报警限值: 1.5 bar</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              排放合规性监测 (15ppm 报警器)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">出水含油浓度 (ppm)</span>
                <span className={`font-mono font-bold text-2xl ${filterState.oilContentOut >= 15 ? 'text-rose-500 animate-pulse' : filterState.oilContentOut >= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {filterState.oilContentOut.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${filterState.oilContentOut >= 15 ? 'bg-rose-500' : filterState.oilContentOut >= 10 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (filterState.oilContentOut / 20) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(15 / 20) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>安全区</span>
                <span className="text-rose-400">法定上限: 15.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(20,184,166,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            聚结分离过程与滤芯堵塞 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={filterState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${filterState.oilContentOut >= 15 ? 'text-rose-500 animate-bounce' : 'text-teal-400'}`} />
              <div>
                <div className="text-xs text-slate-400">MARPOL 违规排放风险</div>
                <div className={`text-xl font-mono ${filterState.oilContentOut >= 15 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {filterState.oilContentOut >= 15 ? '极高 (自动停止排放)' : filterState.oilContentOut >= 10 ? '中高 (预警)' : '低 (合规)'}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {filterState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="滤芯深度堵塞 (压差过高)" value={(filterState.pressureDrop / 1.5) * 100} critical={100} />
              <DiagnosticItem label="聚结能力丧失 (出水超标)" value={(filterState.oilContentOut / 15) * 100} critical={100} />
              <DiagnosticItem label="乳化液过多/化学药剂失效" value={(filterState.oilContentIn / 50000) * 100} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-teal-400">诊断结论与建议：</strong></p>
              {filterState.oilContentOut >= 15 ? (
                <span className="text-rose-400 font-bold">【危急】 出水含油量达到或超过 15ppm 法定上限！15ppm 舱底水报警装置已触发，三通阀已自动切换至回流状态。必须立即停止排放，更换滤芯并清洗分离器内部。</span>
              ) : filterState.pressureDrop > 1.5 ? (
                <span className="text-rose-400 font-bold">【危急】 滤芯前后压差超过 1.5 bar，滤芯已严重堵塞，可能导致滤芯破裂或分离失效。请立即安排更换。</span>
              ) : filterState.oilContentOut >= 10 ? (
                <span className="text-amber-400">【警告】 出水含油量逼近 15ppm 限制，聚结滤芯分离效率正在下降。建议准备备件，计划在近期更换。</span>
              ) : filterState.pressureDrop > 1.0 ? (
                <span className="text-yellow-400">【注意】 压差逐渐升高，滤芯容污量已消耗大半。</span>
              ) : (
                <span className="text-emerald-400">【正常】 油水分离器运行良好，压差正常，排放水质符合 MARPOL 73/78 附则 I 要求。</span>
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
      <span className="font-mono text-teal-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
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
