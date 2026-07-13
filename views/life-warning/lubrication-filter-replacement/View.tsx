import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Filter, Clock } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/lubrication-filter-replacement/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[lubrication-filter-replacement]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/lubrication-filter-replacement';
import { FilterState } from '../../../components/life-warning/lubrication-filter-replacement/three-types';

export const View: React.FC = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    pressureDrop: 50, // kPa
    oilViscosity: 46, // cSt (ISO VG 46)
    particulateCount: 100, // arbitrary count
    operatingHours: 1200, // hours
    flowRate: 100, // L/min
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(800); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setFilterState(prev => {
        // Simulate operational factors
        const newHours = prev.operatingHours + 1; // Accelerated time
        const newFlow = Math.max(50, Math.min(150, prev.flowRate + (Math.random() - 0.5) * 5));

        // Particulate count increases over time, spikes randomly
        const particulateIncrease = 0.5 + (Math.random() > 0.95 ? Math.random() * 50 : 0);
        const newParticulate = prev.particulateCount + particulateIncrease;

        // Pressure drop increases with particulate count and flow rate
        // Base resistance + clogging resistance
        const baseDrop = (newFlow / 100) * 20;
        const clogDrop = Math.pow(newParticulate / 200, 1.5) * 10;
        const newPressureDrop = baseDrop + clogDrop + (Math.random() - 0.5) * 2;

        // Viscosity changes slightly (simulating temperature/degradation)
        const newViscosity = prev.oilViscosity + (Math.random() - 0.5) * 0.1;

        // Health Index Calculation
        // Pressure Drop: > 250kPa is critical (bypass valve might open)
        const pressurePenalty = Math.max(0, (newPressureDrop - 100) / 150) * 60;
        // Particulate: > 1000 is very dirty
        const particulatePenalty = Math.max(0, (newParticulate - 500) / 500) * 40;

        const health = Math.max(0, Math.floor(100 - pressurePenalty - particulatePenalty));
        
        // Estimated Life (Hours) - Design life typically 2000 hours
        // If pressure is rising fast, life drops fast
        const remainingCapacity = Math.max(0, 250 - newPressureDrop);
        const rateOfRise = Math.max(0.1, (newPressureDrop - prev.pressureDrop));
        setEstimatedLife(Math.max(0, Math.floor(remainingCapacity / rateOfRise)));

        return {
          ...prev,
          operatingHours: newHours,
          flowRate: newFlow,
          particulateCount: newParticulate,
          pressureDrop: newPressureDrop,
          oilViscosity: newViscosity,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setFilterState({
      pressureDrop: 40,
      oilViscosity: 46,
      particulateCount: 50,
      operatingHours: 0,
      flowRate: 100,
    });
    setHealthScore(100);
    setEstimatedLife(2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Filter className="w-8 h-8" />
            润滑油系统滤芯更换预警
          </h1>
          <p className="text-slate-400 mt-1">基于压差突变与颗粒物浓度的滤芯堵塞状态监测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">滤芯通畅度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换新滤芯</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              流体工况
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="系统流量 (L/min)" 
                value={filterState.flowRate} 
                max={200} 
                color="bg-blue-500"
                onChange={(v) => setFilterState(s => ({...s, flowRate: v}))}
              />
              
              <ParameterControl 
                label="油液运动粘度 (cSt)" 
                value={filterState.oilViscosity} 
                max={100} 
                color={Math.abs(filterState.oilViscosity - 46) > 15 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setFilterState(s => ({...s, oilViscosity: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400"/> 滤芯已用时长</span>
                  <span className="font-mono text-xl font-bold text-slate-300">
                    {filterState.operatingHours} <span className="text-sm font-normal">h</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              核心劣化指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">滤芯前后压差 (kPa)</span>
                <span className={`font-mono font-bold text-lg ${filterState.pressureDrop > 200 ? 'text-rose-500 animate-pulse' : filterState.pressureDrop > 120 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {filterState.pressureDrop.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${filterState.pressureDrop > 200 ? 'bg-rose-500' : filterState.pressureDrop > 120 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (filterState.pressureDrop / 300) * 100)}%` }}></div>
                {/* Bypass valve open threshold */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: '83%' }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">旁通阀开启阈值: 250 kPa</div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            滤芯堵塞状态与流场 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={filterState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <Droplets className={`w-6 h-6 ${filterState.particulateCount > 800 ? 'text-amber-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">油液颗粒物浓度指数</div>
                <div className={`text-xl font-mono ${filterState.particulateCount > 1000 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {filterState.particulateCount.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">过滤效率估算</div>
              <div className={`text-xl font-mono ${filterState.pressureDrop > 250 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {filterState.pressureDrop > 250 ? '< 10%' : '99.9%'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="滤网深度堵塞" 
                value={(filterState.pressureDrop / 250) * 100} 
                critical={80} // > 200kPa
              />
              <DiagnosticItem 
                label="旁通阀开启风险 (未过滤油液循环)" 
                value={(filterState.pressureDrop / 250) * 100} 
                critical={100} // >= 250kPa
              />
              <DiagnosticItem 
                label="油液污染度超标" 
                value={(filterState.particulateCount / 1200) * 100} 
                critical={83} // > 1000
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {filterState.pressureDrop >= 250 ? (
                <span className="text-rose-400 font-bold">【危急】 压差已达到旁通阀开启阈值！含有大量杂质的未过滤油液正直接进入润滑系统，将导致轴承和齿轮严重磨损。必须立即停机更换滤芯！</span>
              ) : filterState.pressureDrop > 180 ? (
                <span className="text-amber-400 font-bold">【警告】 滤芯严重堵塞，压差急剧上升。请在未来 24 小时内安排滤芯更换作业，并检查油液污染源。</span>
              ) : filterState.particulateCount > 800 ? (
                <span className="text-yellow-400">【注意】 油液颗粒物浓度异常升高，滤芯负荷加重。建议提取油样进行理化分析，排查设备异常磨损。</span>
              ) : (
                <span className="text-emerald-400">【正常】 压差保持在正常范围内，过滤效率良好。润滑系统油液清洁度达标。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-blue-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
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
        {/* Critical threshold marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
