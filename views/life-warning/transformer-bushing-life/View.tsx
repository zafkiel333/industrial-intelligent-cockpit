import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Zap, Thermometer, Droplets, ShieldAlert, RefreshCw } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/transformer-bushing-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[transformer-bushing-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/transformer-bushing-life';
import { BushingState } from '../../../components/life-warning/transformer-bushing-life/three-types';

export const View: React.FC = () => {
  const [bushingState, setBushingState] = useState<BushingState>({
    oilTemperature: 45,
    oilPressure: 0.1,
    capacitance: 450, // pF (typical for 110kV bushing)
    tanDelta: 0.3, // % (typical healthy value < 0.5%)
    moistureContent: 5, // ppm
    agingFactor: 0.05,
  });

  const [healthScore, setHealthScore] = useState(95);
  const [estimatedLife, setEstimatedLife] = useState(25); // Years

  useEffect(() => {
    const interval = setInterval(() => {
      setBushingState(prev => {
        // Simulate aging based on temperature, moisture, and electrical stress
        const tempStress = Math.pow(2, (prev.oilTemperature - 40) / 10);
        const moistureStress = prev.moistureContent > 15 ? 2.0 : 1.0;
        
        const agingRate = 0.0002 * tempStress * moistureStress;
        const newAging = Math.min(1.0, prev.agingFactor + agingRate);

        // Capacitance increases slightly as insulation degrades (e.g., partial breakdown of layers)
        const newCapacitance = 450 * (1 + newAging * 0.1) + (Math.random() - 0.5) * 2;
        
        // Tan Delta (Dielectric Loss) increases significantly with aging and moisture
        const newTanDelta = 0.3 + (newAging * 2.0) + (prev.moistureContent * 0.05) + (Math.random() - 0.5) * 0.1;

        // Update health and life
        setHealthScore(Math.max(0, Math.floor(100 - (newAging * 100))));
        setEstimatedLife(Math.max(0, Math.floor(30 * (1 - newAging))));

        return {
          ...prev,
          agingFactor: newAging,
          capacitance: newCapacitance,
          tanDelta: newTanDelta,
          // Simulate environmental fluctuations
          oilTemperature: Math.max(20, Math.min(90, prev.oilTemperature + (Math.random() - 0.5) * 1.5)),
          oilPressure: Math.max(0.05, Math.min(0.3, prev.oilPressure + (Math.random() - 0.5) * 0.01)),
          moistureContent: Math.max(2, Math.min(50, prev.moistureContent + (Math.random() - 0.2) * 0.5)), // Tends to increase slowly
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBushingState({
      oilTemperature: 45,
      oilPressure: 0.1,
      capacitance: 450,
      tanDelta: 0.3,
      moistureContent: 5,
      agingFactor: 0.05,
    });
    setHealthScore(95);
    setEstimatedLife(30);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a1128] text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" />
            主变压器套管寿命预测系统
          </h1>
          <p className="text-slate-400 mt-1">基于介损、电容量及油色谱数据的绝缘状态综合评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800/80 border border-slate-600 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">套管健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">年</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-blue-900/50 hover:bg-blue-800/50 border border-blue-700 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换套管</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              介质损耗与电容监测
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="介质损耗因数 tan δ (%)" 
                value={bushingState.tanDelta} 
                max={3.0} 
                color={bushingState.tanDelta > 1.5 ? 'bg-rose-500' : bushingState.tanDelta > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setBushingState(s => ({...s, tanDelta: v}))}
              />
              <ParameterControl 
                label="主绝缘电容量 C1 (pF)" 
                value={bushingState.capacitance} 
                max={600} 
                min={400}
                color="bg-blue-500"
                onChange={(v) => setBushingState(s => ({...s, capacitance: v}))}
              />
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">电容量变化率 (ΔC/C)</div>
                <div className={`text-xl font-mono ${((bushingState.capacitance - 450) / 450) > 0.05 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(((bushingState.capacitance - 450) / 450) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              油中微水与环境
            </h3>
            <div className="space-y-4">
              <ParameterControl 
                label="微水含量 (ppm)" 
                value={bushingState.moistureContent} 
                max={50} 
                color={bushingState.moistureContent > 20 ? 'bg-rose-500' : 'bg-cyan-500'}
                onChange={(v) => setBushingState(s => ({...s, moistureContent: v}))}
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">顶层油温</span>
                <span className="font-mono text-amber-400">{bushingState.oilTemperature.toFixed(1)} °C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#050814] border border-slate-700 rounded-xl relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-600 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            OIP套管内部结构 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={bushingState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-600">
              <div className="text-xs text-slate-400">内部压力</div>
              <div className="text-xl font-mono text-cyan-400">
                {bushingState.oilPressure.toFixed(3)} <span className="text-sm">MPa</span>
              </div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-600 text-right">
              <div className="text-xs text-slate-400">绝缘纸老化度 (DP值估算)</div>
              <div className="text-xl font-mono text-amber-400">{Math.max(200, Math.floor(1000 - bushingState.agingFactor * 800))}</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              故障树分析 (FTA)
            </h3>
            
            <div className="space-y-3">
              <FaultNode 
                label="主绝缘受潮" 
                probability={bushingState.moistureContent / 50} 
                active={bushingState.moistureContent > 15}
              />
              <FaultNode 
                label="电容芯子击穿 (ΔC > 5%)" 
                probability={Math.abs((bushingState.capacitance - 450) / 450) * 10} 
                active={Math.abs((bushingState.capacitance - 450) / 450) > 0.05}
              />
              <FaultNode 
                label="油纸绝缘热老化" 
                probability={bushingState.agingFactor} 
                active={bushingState.agingFactor > 0.6}
              />
              <FaultNode 
                label="末屏接地不良" 
                probability={bushingState.tanDelta > 1.5 ? 0.8 : 0.1} 
                active={bushingState.tanDelta > 2.0}
              />
            </div>

            <div className="mt-6 p-4 bg-slate-900/60 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">运维建议：</strong></p>
              {bushingState.tanDelta > 1.5 || Math.abs((bushingState.capacitance - 450) / 450) > 0.05 ? (
                <span className="text-rose-400">介损或电容量超标严重，存在极高绝缘击穿风险。建议立即停运，进行色谱分析和局部放电测试，准备更换套管。</span>
              ) : bushingState.moistureContent > 15 ? (
                <span className="text-amber-400">微水含量偏高，绝缘受潮风险增加。建议缩短在线监测周期，安排滤油或真空脱水处理。</span>
              ) : (
                <span className="text-emerald-400">各项指标均在正常范围内，绝缘性能良好。按计划执行例行巡检。</span>
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
      <span className="font-mono text-blue-400">{value.toFixed(2)}</span>
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

const FaultNode = ({ label, probability, active }: { label: string, probability: number, active: boolean }) => (
  <div className={`p-3 rounded border ${active ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
    <div className="flex justify-between items-center mb-2">
      <span className={`text-sm ${active ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>{label}</span>
      <span className={`text-xs font-mono ${active ? 'text-rose-400' : 'text-slate-500'}`}>
        {(Math.min(1, probability) * 100).toFixed(1)}%
      </span>
    </div>
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${active ? 'bg-rose-500' : 'bg-blue-500/50'}`} style={{ width: `${Math.min(100, probability * 100)}%` }}></div>
    </div>
  </div>
);
