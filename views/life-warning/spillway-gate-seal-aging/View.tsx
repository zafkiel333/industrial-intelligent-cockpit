import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, ShieldAlert, RefreshCw, ThermometerSun } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/spillway-gate-seal-aging/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[spillway-gate-seal-aging]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/spillway-gate-seal-aging';
import { SealState } from '../../../components/life-warning/spillway-gate-seal-aging/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<SealState>({
    pressure: 0.5, // MPa (50m water head)
    temperature: 20, // Celsius
    compression: 5, // mm (initial pre-compression)
    hardness: 65, // Shore A (typical for new rubber)
    agingFactor: 0.1,
    leakageRate: 0.5, // L/min (acceptable seepage)
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(8); // Years

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        // Simulate environmental factors
        const time = Date.now() / 10000;
        // Temperature fluctuates daily/seasonally
        const newTemp = 20 + Math.sin(time) * 15 + (Math.random() - 0.5) * 2;
        
        // Pressure fluctuates with reservoir level
        const newPressure = Math.max(0.1, Math.min(1.0, prev.pressure + (Math.random() - 0.5) * 0.05));

        // Aging accelerates with temperature (thermal oxidation) and UV (if exposed)
        const tempStress = Math.pow(2, (newTemp - 25) / 10);
        const agingRate = 0.0005 * tempStress;
        const newAging = Math.min(1.0, prev.agingFactor + agingRate);

        // Hardness increases as rubber ages (becomes brittle)
        const newHardness = 65 + (newAging * 25) + (Math.random() - 0.5);

        // Compression set (permanent deformation) increases with aging and pressure
        // Actual compression decreases as it loses elasticity
        const compressionLoss = newAging * 3.0; // Lose up to 3mm of compression
        const newCompression = Math.max(0, 5 - compressionLoss);

        // Leakage rate increases exponentially as compression drops below critical threshold (e.g., 2mm)
        // and pressure increases
        let newLeakage = 0.5;
        if (newCompression < 2.5) {
           newLeakage = Math.pow((2.5 - newCompression) * 2, 2) * (newPressure * 10) + (Math.random() * 2);
        } else if (newAging > 0.8) {
           // Cracking causes leakage even with some compression
           newLeakage = (newAging - 0.8) * 50 * newPressure + (Math.random() * 5);
        }

        // Health Index
        const health = Math.max(0, Math.floor(100 - (newAging * 100) - (newLeakage > 10 ? 20 : 0)));
        
        // Estimated Life
        setEstimatedLife(Math.max(0, Math.floor(10 * (health / 100))));

        return {
          ...prev,
          temperature: newTemp,
          pressure: newPressure,
          agingFactor: newAging,
          hardness: newHardness,
          compression: newCompression,
          leakageRate: newLeakage,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      pressure: 0.5,
      temperature: 20,
      compression: 5,
      hardness: 65,
      agingFactor: 0,
      leakageRate: 0.1,
    });
    setHealthScore(100);
    setEstimatedLife(10);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            泄洪洞闸门止水橡胶老化预警
          </h1>
          <p className="text-slate-400 mt-1">基于硬度、压缩永久变形与泄漏率的密封失效预测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">密封健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-teal-400">{estimatedLife} <span className="text-sm font-normal">年</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换止水</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <ThermometerSun className="w-5 h-5" />
              环境与材料物性
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="环境温度 (°C)" 
                value={sealState.temperature} 
                max={60} 
                min={-20}
                color={sealState.temperature > 40 ? 'bg-rose-500' : sealState.temperature < 0 ? 'bg-blue-500' : 'bg-amber-500'}
                onChange={(v) => setSealState(s => ({...s, temperature: v}))}
              />
              
              <ParameterControl 
                label="水头压力 (MPa)" 
                value={sealState.pressure} 
                max={1.5} 
                color="bg-blue-400"
                onChange={(v) => setSealState(s => ({...s, pressure: v}))}
              />

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">邵氏硬度 (Shore A)</span>
                  <span className={`font-mono text-xl font-bold ${sealState.hardness > 85 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {sealState.hardness.toFixed(1)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${sealState.hardness > 85 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, ((sealState.hardness - 50) / 50) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>50 (软)</span><span>新: 65</span><span>硬化极限: 85</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              密封状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">有效压缩量 (mm)</span>
                <span className={`font-mono font-bold text-lg ${sealState.compression < 2.0 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                  {sealState.compression.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">材料老化度</span>
                <span className={`font-mono font-bold ${sealState.agingFactor > 0.8 ? 'text-rose-500' : 'text-amber-400'}`}>
                  {(sealState.agingFactor * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(20,184,166,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
            P型止水橡皮压缩与泄漏 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">接触面比压估算</div>
              <div className={`text-xl font-mono ${sealState.compression < 2.0 ? 'text-rose-500' : 'text-teal-400'}`}>
                {Math.max(0, (sealState.compression * 0.5 * (sealState.hardness / 65))).toFixed(2)} <span className="text-sm">MPa</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">实时泄漏率</div>
              <div className={`text-xl font-mono ${sealState.leakageRate > 10 ? 'text-rose-500 animate-pulse' : sealState.leakageRate > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sealState.leakageRate.toFixed(1)} <span className="text-sm">L/min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="压缩永久变形 (失去弹性)" 
                value={((5 - sealState.compression) / 5) * 100} 
                critical={60}
              />
              <DiagnosticItem 
                label="热氧老化龟裂" 
                value={sealState.agingFactor * 100} 
                critical={80}
              />
              <DiagnosticItem 
                label="接触面水力劈裂风险" 
                value={sealState.leakageRate > 10 ? 90 : (sealState.pressure / 1.5) * 50 + (sealState.leakageRate / 10) * 50} 
                critical={75}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-teal-400">诊断结论与建议：</strong></p>
              {sealState.leakageRate > 20 ? (
                <span className="text-rose-400 font-bold">【危急】 泄漏率严重超标，止水橡皮已完全失效或发生撕裂。必须立即下放检修门，排空积水，进行紧急更换！</span>
              ) : sealState.hardness > 85 || sealState.compression < 2.0 ? (
                <span className="text-amber-400">【警告】 橡胶严重硬化，失去回弹性，有效压缩量不足。密封性能大幅下降，建议在下一个枯水期安排更换。</span>
              ) : sealState.leakageRate > 2.0 ? (
                <span className="text-yellow-400">【注意】 监测到异常渗漏，可能存在局部磨损或夹杂异物。建议进行水下机器人(ROV)探查，清理密封面。</span>
              ) : (
                <span className="text-emerald-400">【正常】 止水橡皮弹性良好，压缩量充足，无明显渗漏。继续保持监测。</span>
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
      <span className="font-mono text-teal-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
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
