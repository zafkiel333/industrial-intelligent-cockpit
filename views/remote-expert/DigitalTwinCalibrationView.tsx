
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-dt-calibration]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-dt-calibration';
import { 
  GitCompare, RefreshCw, Sliders, Activity, 
  Database, CheckCircle2, AlertOctagon, Save,
  RotateCcw, Play, Layers, Sparkles,
  Scale, FileCode, Cpu, Wifi,
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

// --- Types ---

interface TwinModel {
  id: string;
  name: string;
  type: string; // e.g. "Thermodynamic", "Mechanical"
  lastCalibrated: string;
  drift: number; // % deviation from reality
  status: 'Synced' | 'Drifting' | 'Desynchronized';
  version: string;
}

interface PhysicsParameter {
  id: string;
  label: string;
  value: number; // Current setting
  original: number; // Before tuning
  min: number;
  max: number;
  unit: string;
  sensitivity: 'High' | 'Medium' | 'Low';
}

interface CalibrationMetric {
  time: string;
  real: number; // Sensor data
  sim: number; // Model output
  error: number; // Absolute difference
}

// --- Mock Data ---

const MODELS: TwinModel[] = [
  { id: 'DT-GT-01', name: '#1 燃机热力学模型', type: 'Thermodynamic', lastCalibrated: '2024-02-15', drift: 12.5, status: 'Drifting', version: 'v2.4.1' },
  { id: 'DT-GEN-02', name: '发电机励磁模型', type: 'Electrical', lastCalibrated: '2024-03-20', drift: 1.2, status: 'Synced', version: 'v3.0.5' },
  { id: 'DT-VIB-03', name: '轴系振动响应模型', type: 'Mechanical', lastCalibrated: '2023-12-10', drift: 25.8, status: 'Desynchronized', version: 'v1.8.2' },
  { id: 'DT-HYD-04', name: '液压伺服系统模型', type: 'Hydraulic', lastCalibrated: '2024-03-01', drift: 5.4, status: 'Drifting', version: 'v2.1.0' },
];

const INITIAL_PARAMS: PhysicsParameter[] = [
  { id: 'P1', label: '燃烧室热容 (Heat Capacity)', value: 4.2, original: 4.2, min: 3.0, max: 6.0, unit: 'kJ/kg·K', sensitivity: 'High' },
  { id: 'P2', label: '压气机效率因子 (Eff Factor)', value: 0.88, original: 0.88, min: 0.80, max: 0.95, unit: '', sensitivity: 'High' },
  { id: 'P3', label: '透平膨胀系数 (Exp Coeff)', value: 1.35, original: 1.35, min: 1.2, max: 1.5, unit: '', sensitivity: 'Medium' },
  { id: 'P4', label: '热辐射损失 (Rad Loss)', value: 2.5, original: 2.5, min: 1.0, max: 5.0, unit: '%', sensitivity: 'Low' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Synced': 'bg-green-900/30 text-green-400 border-green-600',
    'Drifting': 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
    'Desynchronized': 'bg-red-900/30 text-red-400 border-red-600',
  }[status] || 'bg-slate-800 text-slate-400';
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 w-fit ${styles}`}>
      {status === 'Synced' ? <CheckCircle2 size={10}/> : status === 'Drifting' ? <Activity size={10}/> : <AlertOctagon size={10}/>}
      {status}
    </span>
  );
};

const ParameterTuner = ({ param, onChange }: { param: PhysicsParameter, onChange: (val: number) => void }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-cyan-500/30 transition-all group">
    <div className="flex justify-between items-center mb-2">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{param.label}</span>
        <span className={`text-[9px] ${param.sensitivity === 'High' ? 'text-red-400' : 'text-slate-500'}`}>{param.sensitivity} Sensitivity</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono font-bold text-white">{param.value.toFixed(3)}</div>
        <div className="text-[9px] text-slate-500">{param.unit}</div>
      </div>
    </div>
    <input 
      type="range" 
      min={param.min} max={param.max} step={(param.max - param.min)/100} 
      value={param.value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
    <div className="flex justify-between text-[8px] text-slate-600 mt-1">
      <span>{param.min}</span>
      <span className="text-slate-500">Original: {param.original}</span>
      <span>{param.max}</span>
    </div>
  </div>
);

export const DigitalTwinCalibrationView: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [calibData, setCalibData] = useState<CalibrationMetric[]>([]);
  const [isAutoTuning, setIsAutoTuning] = useState(false);
  const [rmse, setRmse] = useState(0);

  const activeModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  // Simulation Loop: Generates "Real" vs "Sim" data based on parameters
  useEffect(() => {
    const generateData = () => {
      // Base curve (Reality)
      const basePoints = Array.from({length: 50}, (_, i) => {
        const t = i;
        const real = 50 + 30 * Math.sin(t * 0.2) + 10 * Math.cos(t * 0.5) + Math.random() * 2;
        return { t, real };
      });

      // Sim curve (Affected by params)
      // We map param deviation to curve deviation
      const p1_dev = (params[0].value - params[0].original) * 10; // Amplitude shift
      const p2_dev = (params[1].value - params[1].original) * 5;  // Phase shift
      const p3_dev = (params[2].value - params[2].original) * 20; // Offset

      const newData = basePoints.map(p => {
        const sim = 50 + (30 + p1_dev) * Math.sin(p.t * 0.2 + p2_dev) + 10 * Math.cos(p.t * 0.5) + p3_dev;
        return {
          time: `T+${p.t}`,
          real: p.real,
          sim: sim,
          error: Math.abs(p.real - sim)
        };
      });

      // Calculate RMSE
      const totalSqErr = newData.reduce((acc, curr) => acc + curr.error * curr.error, 0);
      setRmse(Math.sqrt(totalSqErr / newData.length));

      return newData;
    };

    setCalibData(generateData());
  }, [params]);

  const handleAutoTune = () => {
    setIsAutoTuning(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      // Random walk towards original values to simulate optimization
      setParams(prev => prev.map(p => ({
        ...p,
        value: p.value + (p.original - p.value) * 0.1 // Converge 10% per step
      })));

      if (step > 20) {
        clearInterval(interval);
        setIsAutoTuning(false);
      }
    }, 100);
  };

  const handleReset = () => {
    setParams(INITIAL_PARAMS.map(p => ({ ...p, value: p.original + (Math.random()-0.5) * (p.max-p.min)*0.4 }))); // Reset to a "drifting" state for demo
  };

  // Initialize with some drift
  useEffect(() => {
    handleReset();
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020305]">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#051318] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <GitCompare size={14} className="animate-pulse" /> Model Fidelity Lab
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程数字孪生 <span className="text-cyan-500">模型校核中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Current Deviation (RMSE)</div>
                <div className={`text-2xl font-mono font-bold ${rmse < 5 ? 'text-green-400' : rmse < 15 ? 'text-yellow-400' : 'text-red-500'}`}>
                    {rmse.toFixed(2)}
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Confidence Level</div>
                <div className="text-xl font-mono font-bold text-white">
                    {(Math.max(0, 100 - rmse * 1.5)).toFixed(1)}%
                </div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                <CheckCircle2 size={16} /> 签发校核报告
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Model Registry */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
             <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
                 <span className="uppercase font-bold">Active Models</span>
                 <Database size={14} />
             </div>
             
             <div className="flex flex-col gap-3">
                 {MODELS.map(model => (
                     <div 
                       key={model.id}
                       onClick={() => setSelectedModelId(model.id)}
                       className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
                          ${selectedModelId === model.id 
                              ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                       `}
                     >
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <div className="text-[10px] font-mono text-slate-500">{model.id}</div>
                                 <div className={`font-bold text-sm ${selectedModelId === model.id ? 'text-white' : 'text-slate-300'}`}>
                                     {model.name}
                                 </div>
                             </div>
                             <StatusBadge status={model.status} />
                         </div>
                         
                         <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/50">
                             <span>Last: {model.lastCalibrated}</span>
                             <span>Ver: {model.version}</span>
                         </div>
                         
                         {/* Drift Indicator */}
                         <div className="mt-2">
                             <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                                 <span>Drift</span>
                                 <span className={model.drift > 10 ? 'text-red-400' : 'text-green-400'}>{model.drift}%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className={`h-full ${model.drift > 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(100, model.drift * 2)}%`}}></div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
             
             <div className="mt-auto p-4 bg-slate-900/50 border border-slate-800 rounded">
                 <div className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2">
                     <Wifi size={14} className="text-green-500"/> Data Stream
                 </div>
                 <div className="space-y-1 font-mono text-[10px] text-slate-500">
                     <div className="flex justify-between"><span>Source:</span> <span className="text-white">IoT-Gateway-04</span></div>
                     <div className="flex justify-between"><span>Frequency:</span> <span className="text-white">100 Hz</span></div>
                     <div className="flex justify-between"><span>Latency:</span> <span className="text-green-400">12 ms</span></div>
                 </div>
             </div>
         </div>

         {/* CENTER COLUMN: The Calibration Bench */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Visualizer */}
             <SciFiCard title="虚实映射 (Visual Mapping)" subtitle="TWIN" className="flex-[3] border-cyan-900/50 bg-[#080b14]" noPadding>
                 <div className="w-full h-full relative">
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                         backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}></div>

                     {/* 3D Model */}
                     <div className="absolute inset-0 z-0 opacity-80">
                         <ThreeScene type="generator" color="#22d3ee" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                     </div>
                     
                     {/* "Ghost" Model (Simulated) - Just a visual trick with CSS filters/opacity */}
                     <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{filter: 'blur(2px) hue-rotate(90deg)'}}>
                          {/* In a real implementation, this would be a second Three.js canvas or mesh offset */}
                     </div>

                     {/* HUD */}
                     <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                         <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                             <Layers size={14}/> Layer 1: Real-time Telemetry
                         </div>
                         <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2">
                             <FileCode size={14}/> Layer 2: Simulation Output
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Error Scope */}
             <SciFiCard title="偏差示波器 (Error Scope)" subtitle="RESIDUAL ANALYSIS" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={calibData} margin={{top: 5, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                             <Tooltip contentStyle={{backgroundColor: '#020305', borderColor: '#333', fontSize: '12px'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} verticalAlign="top" />
                             
                             <Area type="monotone" dataKey="error" name="Residual Error" stroke="none" fill="url(#colorError)" />
                             <Line type="monotone" dataKey="real" name="Real Signal" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                             <Line type="monotone" dataKey="sim" name="Model Output" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT COLUMN: Expert Tuning */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Physics Engine Parameters */}
             <SciFiCard title="物理参数调优 (Physics Tuning)" subtitle="EXPERT" className="flex-1 border-indigo-900/30">
                 <div className="flex flex-col gap-4 h-full">
                     <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                         <span>Model: <strong className="text-white">{activeModel.type}</strong></span>
                         <span className="flex items-center gap-1"><Cpu size={12}/> V2.4 Core</span>
                     </div>
                     
                     <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar" style={{maxHeight: '400px'}}>
                         {params.map(p => (
                             <ParameterTuner 
                               key={p.id} 
                               param={p} 
                               onChange={(v) => setParams(prev => prev.map(param => param.id === p.id ? { ...param, value: v } : param))} 
                             />
                         ))}
                     </div>

                     <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
                         <button 
                           onClick={handleAutoTune}
                           disabled={isAutoTuning}
                           className={`w-full py-3 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                              ${isAutoTuning ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}
                           `}
                         >
                             {isAutoTuning ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                             {isAutoTuning ? 'AI Fitting...' : 'Run Auto-Calibration'}
                         </button>
                         
                         <div className="grid grid-cols-2 gap-2">
                             <button onClick={handleReset} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                                 <RotateCcw size={12} /> Reset
                             </button>
                             <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                                 <Save size={12} /> Save Snapshot
                             </button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Calibration History */}
             <SciFiCard title="校核日志" className="h-48 border-slate-800">
                 <div className="space-y-2 text-[10px] text-slate-400">
                     <div className="flex justify-between border-b border-slate-800 pb-1">
                         <span>2024-03-22 10:42</span>
                         <span className="text-white">Dr. Zhang: Adjusted P1 +0.5</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-1">
                         <span>2024-03-22 10:30</span>
                         <span className="text-indigo-400">AI: Auto-fit converged (RMSE 3.2)</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-1">
                         <span>2024-03-22 10:15</span>
                         <span className="text-white">System: Drift Alert Triggered</span>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
