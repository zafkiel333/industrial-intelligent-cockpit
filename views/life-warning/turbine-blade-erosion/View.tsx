import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, Wind, Zap, RefreshCw } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/turbine-blade-erosion/ThreeScene';
import { ErosionState } from '../../../components/life-warning/turbine-blade-erosion/three-types';

export const View: React.FC = () => {
  const [erosionState, setErosionState] = useState<ErosionState>({
    erosionLevel: 0.1,
    waterFlowSpeed: 50,
    sedimentConcentration: 20,
    cavitationIntensity: 10,
  });

  const [healthScore, setHealthScore] = useState(95);
  const [estimatedLife, setEstimatedLife] = useState(8500); // hours

  useEffect(() => {
    const interval = setInterval(() => {
      setErosionState(prev => {
        const newErosion = Math.min(1.0, prev.erosionLevel + (prev.sedimentConcentration * prev.waterFlowSpeed * 0.00001));
        
        // Update health and life based on erosion
        setHealthScore(Math.max(0, Math.floor(100 - (newErosion * 100))));
        setEstimatedLife(Math.max(0, Math.floor(8500 * (1 - newErosion))));

        return {
          ...prev,
          erosionLevel: newErosion,
          // Add some random fluctuation to parameters
          waterFlowSpeed: Math.max(10, Math.min(100, prev.waterFlowSpeed + (Math.random() - 0.5) * 5)),
          sedimentConcentration: Math.max(0, Math.min(100, prev.sedimentConcentration + (Math.random() - 0.5) * 2)),
          cavitationIntensity: Math.max(0, Math.min(100, prev.cavitationIntensity + (Math.random() - 0.5) * 3)),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setErosionState({
      erosionLevel: 0,
      waterFlowSpeed: 50,
      sedimentConcentration: 20,
      cavitationIntensity: 10,
    });
    setHealthScore(100);
    setEstimatedLife(8500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            水轮机转轮叶片冲蚀预警系统
          </h1>
          <p className="text-slate-400 mt-1">实时监测泥沙磨损与空化剥蚀状态，预测叶片剩余寿命</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-slate-400">健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">剩余寿命预测</div>
              <div className="text-2xl font-bold text-cyan-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>重置叶片</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              水力环境参数
            </h3>
            
            <div className="space-y-6">
              <ParameterControl 
                label="水流速度 (m/s)" 
                value={erosionState.waterFlowSpeed} 
                max={100} 
                color="bg-blue-500"
                onChange={(v) => setErosionState(s => ({...s, waterFlowSpeed: v}))}
              />
              <ParameterControl 
                label="含沙量 (kg/m³)" 
                value={erosionState.sedimentConcentration} 
                max={100} 
                color="bg-amber-600"
                onChange={(v) => setErosionState(s => ({...s, sedimentConcentration: v}))}
              />
              <ParameterControl 
                label="空化强度指数" 
                value={erosionState.cavitationIntensity} 
                max={100} 
                color="bg-purple-500"
                onChange={(v) => setErosionState(s => ({...s, cavitationIntensity: v}))}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">综合冲蚀速率</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-mono text-rose-400">
                  {((erosionState.sedimentConcentration * erosionState.waterFlowSpeed) / 1000).toFixed(3)}
                </span>
                <span className="text-slate-500 mb-1">mm/100h</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              预警状态
            </h3>
            <div className="space-y-3">
              <AlertItem 
                label="泥沙磨损" 
                level={erosionState.erosionLevel > 0.7 ? 'high' : erosionState.erosionLevel > 0.4 ? 'medium' : 'low'} 
              />
              <AlertItem 
                label="空化剥蚀" 
                level={erosionState.cavitationIntensity > 70 ? 'high' : erosionState.cavitationIntensity > 40 ? 'medium' : 'low'} 
              />
              <AlertItem 
                label="叶片裂纹风险" 
                level={erosionState.erosionLevel > 0.8 ? 'high' : 'low'} 
              />
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-black/40 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            转轮叶片 3D 数字孪生
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={erosionState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">当前磨损深度</div>
              <div className="text-lg font-mono text-amber-400">{(erosionState.erosionLevel * 5).toFixed(2)} mm</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">材料损失率</div>
              <div className="text-lg font-mono text-rose-400">{(erosionState.erosionLevel * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              冲蚀分布分析
            </h3>
            
            <div className="space-y-4">
              <DistributionBar label="进水边 (Leading Edge)" value={erosionState.erosionLevel * 100} color="bg-rose-500" />
              <DistributionBar label="出水边 (Trailing Edge)" value={erosionState.erosionLevel * 60} color="bg-amber-500" />
              <DistributionBar label="叶片正面 (Pressure Side)" value={erosionState.erosionLevel * 80} color="bg-orange-500" />
              <DistributionBar label="叶片背面 (Suction Side)" value={erosionState.cavitationIntensity} color="bg-purple-500" />
              <DistributionBar label="裙边/轮毂连接处" value={erosionState.erosionLevel * 40} color="bg-blue-500" />
            </div>

            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">诊断建议：</strong></p>
              {erosionState.erosionLevel > 0.7 ? (
                <span className="text-rose-400">进水边磨损严重，建议立即安排停机检查，准备进行抗磨涂层修复或补焊。</span>
              ) : erosionState.erosionLevel > 0.4 ? (
                <span className="text-amber-400">检测到中度冲蚀，建议在下一个枯水期安排常规检查，密切关注含沙量变化。</span>
              ) : (
                <span className="text-emerald-400">叶片状态良好，涂层完整，继续保持当前运行参数。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, color, onChange }: { label: string, value: number, max: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-cyan-400">{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const AlertItem = ({ label, level }: { label: string, level: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse',
  };
  const texts = { low: '正常', medium: '注意', high: '警告' };

  return (
    <div className={`flex justify-between items-center p-2 rounded border ${colors[level]}`}>
      <span className="text-sm">{label}</span>
      <span className="text-xs font-bold px-2 py-1 rounded bg-black/20">{texts[level]}</span>
    </div>
  );
};

const DistributionBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div>
    <div className="flex justify-between text-xs text-slate-400 mb-1">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, value)}%` }}></div>
    </div>
  </div>
);
