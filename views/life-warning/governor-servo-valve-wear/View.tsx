import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Settings2, Droplets, ShieldAlert, RefreshCw } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/governor-servo-valve-wear/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[governor-servo-valve-wear]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/governor-servo-valve-wear';
import { ValveState } from '../../../components/life-warning/governor-servo-valve-wear/three-types';

export const View: React.FC = () => {
  const [valveState, setValveState] = useState<ValveState>({
    oilCleanliness: 6, // NAS grade
    spoolDisplacement: 0, // mm
    pressureDrop: 10, // MPa
    frictionForce: 150, // N
    wearDepth: 5, // um
    healthIndex: 95,
  });

  const [estimatedLife, setEstimatedLife] = useState(8000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setValveState(prev => {
        // Simulate operation: spool moves back and forth
        const time = Date.now() / 1000;
        const targetDisplacement = Math.sin(time * 0.5) * 2.0; // +/- 2mm stroke
        
        // Friction increases with wear and poor oil cleanliness
        const baseFriction = 100;
        const wearFriction = prev.wearDepth * 5;
        const oilFriction = Math.pow(prev.oilCleanliness - 5, 2) * 10;
        const newFriction = baseFriction + wearFriction + oilFriction + (Math.random() - 0.5) * 20;

        // Wear rate depends on friction, displacement, and oil contamination
        const isMoving = Math.abs(targetDisplacement - prev.spoolDisplacement) > 0.1;
        const wearRate = isMoving ? (newFriction / 1000) * (prev.oilCleanliness / 5) * 0.01 : 0;
        const newWear = Math.min(100, prev.wearDepth + wearRate); // Max 100um wear

        // Pressure drop fluctuates with flow/displacement and wear (internal leakage)
        const leakageDrop = newWear * 0.05;
        const newPressure = Math.max(5, 10 - leakageDrop + (Math.random() - 0.5) * 0.5);

        // Health Index
        const health = Math.max(0, Math.floor(100 - (newWear / 100) * 100 - (prev.oilCleanliness > 9 ? 20 : 0)));
        
        // Estimated Life
        setEstimatedLife(Math.max(0, Math.floor(10000 * (health / 100))));

        return {
          ...prev,
          spoolDisplacement: targetDisplacement,
          frictionForce: newFriction,
          wearDepth: newWear,
          pressureDrop: newPressure,
          healthIndex: health,
          // Oil slowly degrades
          oilCleanliness: Math.min(12, prev.oilCleanliness + 0.0005 + (Math.random() * 0.001)),
        };
      });
    }, 1000); // 1s updates

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setValveState({
      oilCleanliness: 5,
      spoolDisplacement: 0,
      pressureDrop: 10,
      frictionForce: 100,
      wearDepth: 0,
      healthIndex: 100,
    });
    setEstimatedLife(10000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Settings2 className="w-8 h-8" />
            调速器伺服阀磨损预警系统
          </h1>
          <p className="text-slate-400 mt-1">基于摩擦力、内泄漏与油液污染度的阀芯磨损实时诊断</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">伺服阀健康度</div>
              <div className={`text-2xl font-bold ${valveState.healthIndex > 70 ? 'text-emerald-400' : valveState.healthIndex > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {valveState.healthIndex}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-cyan-400">{estimatedLife.toLocaleString()} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换伺服阀</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行状态监测
            </h3>
            
            <div className="space-y-6">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">阀芯位移 (mm)</span>
                  <span className="font-mono text-cyan-400">{valveState.spoolDisplacement.toFixed(2)}</span>
                </div>
                {/* Visual displacement indicator */}
                <div className="w-full h-2 bg-slate-700 rounded-full relative mt-2">
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-slate-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div 
                    className="absolute top-1/2 w-3 h-3 bg-cyan-500 rounded-full transform -translate-y-1/2 transition-all duration-100"
                    style={{ left: `calc(50% + ${(valveState.spoolDisplacement / 2.5) * 50}%)` }}
                  ></div>
                </div>
              </div>

              <ParameterControl 
                label="驱动摩擦力 (N)" 
                value={valveState.frictionForce} 
                max={1000} 
                color={valveState.frictionForce > 600 ? 'bg-rose-500' : valveState.frictionForce > 300 ? 'bg-amber-500' : 'bg-emerald-500'}
                onChange={(v) => setValveState(s => ({...s, frictionForce: v}))}
              />
              
              <ParameterControl 
                label="控制油压降 (MPa)" 
                value={valveState.pressureDrop} 
                max={15} 
                color="bg-blue-500"
                onChange={(v) => setValveState(s => ({...s, pressureDrop: v}))}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              油液污染度 (NAS 1638)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold font-mono text-amber-400">{valveState.oilCleanliness.toFixed(1)}</span>
                <span className={`px-3 py-1 rounded text-sm font-bold ${valveState.oilCleanliness > 9 ? 'bg-rose-500/20 text-rose-400' : valveState.oilCleanliness > 7 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {valveState.oilCleanliness > 9 ? '严重污染' : valveState.oilCleanliness > 7 ? '轻度污染' : '清洁'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" style={{ width: `${(valveState.oilCleanliness / 12) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            电液伺服阀内部流场与磨损 3D 映射
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={valveState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">阀芯棱边磨损深度</div>
              <div className={`text-xl font-mono ${valveState.wearDepth > 50 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                {valveState.wearDepth.toFixed(1)} <span className="text-sm">μm</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">内泄漏量估算</div>
              <div className="text-xl font-mono text-rose-400">
                {(valveState.wearDepth * 0.15).toFixed(2)} <span className="text-sm">L/min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              故障诊断与建议
            </h3>
            
            <div className="space-y-4">
              <DiagnosticItem 
                label="阀芯卡涩风险" 
                value={(valveState.frictionForce / 1000) * 100} 
                critical={80}
              />
              <DiagnosticItem 
                label="零位漂移 (内漏引起)" 
                value={(valveState.wearDepth / 100) * 100} 
                critical={60}
              />
              <DiagnosticItem 
                label="动态响应滞后" 
                value={Math.min(100, (valveState.frictionForce / 500) * 50 + (valveState.oilCleanliness / 12) * 50)} 
                critical={70}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-cyan-400">智能运维策略：</strong></p>
              {valveState.wearDepth > 80 || valveState.frictionForce > 800 ? (
                <span className="text-rose-400 font-bold">【紧急】 伺服阀磨损严重，摩擦力过大，存在卡死导致机组失控风险。必须立即停机更换伺服阀，并彻底清洗液压系统。</span>
              ) : valveState.oilCleanliness > 9 ? (
                <span className="text-amber-400">【警告】 油液污染度超标 (NAS &gt; 9)，加速了阀芯磨损。建议立即启动在线滤油机，并安排油液取样化验。</span>
              ) : valveState.wearDepth > 40 ? (
                <span className="text-yellow-400">【注意】 阀芯出现中度磨损，内泄漏量增加可能影响调速精度。建议在下一次计划停机时进行静态特性测试。</span>
              ) : (
                <span className="text-emerald-400">【正常】 伺服阀运行平稳，摩擦力与内泄漏均在设计允许范围内。继续保持油液清洁。</span>
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
