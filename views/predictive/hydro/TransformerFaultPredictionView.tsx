
import React, { useState, useEffect } from 'react';
import { TransformerFaultScene } from '../../../components/predictive/hydro-transformer-fault/ThreeScene';
import { FaultComponent } from '../../../components/predictive/hydro-transformer-fault/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ScatterChart, Scatter
} from 'recharts';
import { 
  GitFork, AlertOctagon, RefreshCw, Zap, 
  Activity, Binary, Sigma, ShieldAlert,
  ArrowRight, Search
} from 'lucide-react';

// --- Mock Data ---

// Fault Tree Structure (Simplified for UI)
const FAULT_TREE = [
  { id: 'TOP', label: 'Transformer Failure', prob: 0.082, type: 'top' },
  { id: 'E1', label: 'Dielectric Failure', prob: 0.045, parent: 'TOP', type: 'gate' },
  { id: 'E2', label: 'Thermal Failure', prob: 0.032, parent: 'TOP', type: 'gate' },
  { id: 'E3', label: 'Mechanical Failure', prob: 0.015, parent: 'TOP', type: 'gate' },
  { id: 'BE1', label: 'Oil Breakdown', prob: 0.025, parent: 'E1', type: 'basic' },
  { id: 'BE2', label: 'Paper Aging', prob: 0.020, parent: 'E1', type: 'basic' },
  { id: 'BE3', label: 'Cooling Loss', prob: 0.030, parent: 'E2', type: 'basic' },
];

// Monte Carlo Distribution
const MONTE_CARLO_DIST = Array.from({length: 50}, (_, i) => {
    // Normal distribution approximation
    const x = i;
    const y = Math.exp(-Math.pow(x - 25, 2) / 100) * 100;
    return { bin: x, freq: y };
});

// Components
const INITIAL_COMPONENTS: FaultComponent[] = [
    { id: 'winding-a', name: 'Phase A Winding', probability: 35, health: 65, type: 'winding' },
    { id: 'winding-b', name: 'Phase B Winding', probability: 42, health: 58, type: 'winding' },
    { id: 'winding-c', name: 'Phase C Winding', probability: 28, health: 72, type: 'winding' },
    { id: 'core', name: 'Iron Core', probability: 15, health: 85, type: 'core' },
    { id: 'bushing-hv', name: 'HV Bushing', probability: 65, health: 35, type: 'bushing' },
    { id: 'oltc', name: 'Tap Changer', probability: 78, health: 22, type: 'oltc' },
];

export const TransformerFaultPredictionView: React.FC = () => {
  // --- STATE ---
  const [components, setComponents] = useState<FaultComponent[]>(INITIAL_COMPONENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [isSimulating, setIsSimulating] = useState(false);
  const [globalProb, setGlobalProb] = useState(8.2);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setSimProgress(prev => {
                if (prev >= 1) {
                    setIsSimulating(false);
                    return 1;
                }
                return prev + 0.02;
            });
            // Update probabilities randomly during sim
            setComponents(prev => prev.map(c => ({
                ...c,
                probability: Math.min(100, Math.max(0, c.probability + (Math.random()-0.5)*5))
            })));
        }, 50);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const runSimulation = () => {
      setSimProgress(0);
      setIsSimulating(true);
      setGlobalProb(0); // Reset display
  };

  const activeComponent = components.find(c => c.id === selectedId);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02010a] text-purple-50 p-2 overflow-y-auto custom-scrollbar selection:bg-magenta-500/30">
      
      {/* HEADER: Quantum Style */}
      <div className="flex justify-between items-end border-b border-purple-900/40 pb-4 bg-gradient-to-r from-[#190326] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-fuchsia-400 mb-1 uppercase tracking-wider">
             <Binary size={14} className="animate-pulse" />
             Stochastic Risk Engine
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             变压器故障 <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">发生概率预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Failure Prob.</div>
                <div className="text-3xl font-mono font-bold text-fuchsia-300">
                    {(globalProb + simProgress * 8.2).toFixed(2)}%
                </div>
            </div>
            <div className="h-8 w-[1px] bg-purple-800/50"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Uncertainty (95% CI)</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">±1.4%</div>
            </div>
            <button 
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded border border-fuchsia-500 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)]"
            >
                <RefreshCw size={14} className={isSimulating ? "animate-spin" : ""} />
                {isSimulating ? 'SIMULATING...' : 'RUN MONTE CARLO'}
            </button>
        </div>
    </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Fault Tree Graph */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Visual Tree */}
           <SciFiCard title="动态故障树 (Dynamic Fault Tree)" subtitle="LOGIC GATES" className="flex-1 border-purple-900/50 bg-[#08020e]/80" noPadding>
               <div className="w-full h-full p-4 relative overflow-hidden flex flex-col gap-4">
                   {/* Background connectors visual (CSS lines) */}
                   <div className="absolute left-[18px] top-8 bottom-8 w-0.5 bg-purple-900/40 z-0"></div>
                   
                   {FAULT_TREE.map((node) => (
                       <div key={node.id} className="relative z-10 flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0
                               ${node.type === 'top' ? 'border-red-500 bg-red-900/20 text-red-400' : 
                                 node.type === 'gate' ? 'border-fuchsia-500 bg-fuchsia-900/20 text-fuchsia-400' : 
                                 'border-cyan-500 bg-cyan-900/20 text-cyan-400'}
                           `}>
                               {node.type === 'top' ? <AlertOctagon size={18}/> : <GitFork size={16}/>}
                           </div>
                           <div className="flex-1 bg-slate-900/60 border border-slate-700 p-2 rounded hover:border-fuchsia-500/50 transition-colors cursor-pointer">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-white">{node.label}</span>
                                   <span className="text-[10px] font-mono text-slate-400">{node.id}</span>
                               </div>
                               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                   <div className={`h-full ${node.prob > 0.05 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${node.prob * 500}%`}}></div>
                               </div>
                               <div className="text-[10px] text-right text-slate-500 mt-0.5">P={(node.prob*100).toFixed(1)}%</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* CENTER: Holographic Risk Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#030005] border border-fuchsia-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(217,70,239,0.15)]">
               
               {/* Simulation HUD */}
               <div className="absolute top-4 left-4 z-10 w-64 space-y-2 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-fuchsia-500/30 px-3 py-2 rounded">
                       <div className="text-[10px] text-fuchsia-400 font-bold uppercase mb-1 flex justify-between">
                           <span>Simulation Progress</span>
                           <span>{(simProgress * 100).toFixed(0)}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500" style={{width: `${simProgress * 100}%`}}></div>
                       </div>
                   </div>
                   
                   {activeComponent && (
                       <div className="bg-black/70 backdrop-blur border-l-2 border-cyan-400 px-3 py-2 rounded animate-in fade-in slide-in-from-left-4">
                           <div className="text-sm font-bold text-white">{activeComponent.name}</div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 mt-1">
                               <div>Risk: <span className="text-red-400 font-bold">{activeComponent.probability.toFixed(1)}%</span></div>
                               <div>Health: <span className="text-green-400 font-bold">{activeComponent.health.toFixed(1)}%</span></div>
                           </div>
                       </div>
                   )}
               </div>

               <TransformerFaultScene 
                   components={components}
                   activeComponentId={selectedId}
                   onSelect={setSelectedId}
                   simulationProgress={simProgress}
               />
           </div>

           {/* Risk Sensitivity Spectrum */}
           <SciFiCard title="风险敏感度分析 (Sensitivity)" subtitle="TORNADO CHART" className="h-[200px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={components} layout="vertical" margin={{left: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a3b" horizontal={false} />
                           <XAxis type="number" stroke="#a855f7" tick={{fontSize: 10}} domain={[0, 100]} />
                           <YAxis dataKey="name" type="category" stroke="#e879f9" width={80} tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#d946ef', color: '#fff'}} />
                           <Bar dataKey="probability" name="Risk Contribution" radius={[0, 4, 4, 0]}>
                               {components.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.probability > 60 ? '#ef4444' : entry.probability > 40 ? '#f59e0b' : '#3b82f6'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Stochastic Lab */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Histogram */}
           <SciFiCard title="故障概率分布直方图" subtitle="PDF" className="h-[300px] border-purple-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={MONTE_CARLO_DIST}>
                           <defs>
                               <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                   <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c4d" />
                           <XAxis dataKey="bin" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Probability Bin', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#06b6d4'}} />
                           <Area type="monotone" dataKey="freq" stroke="#06b6d4" fill="url(#colorFreq)" />
                           {/* P90 Line */}
                           <ReferenceLine x={35} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'P90', fill: '#ef4444', fontSize: 10}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Stats Board */}
           <SciFiCard title="模拟统计摘要" className="flex-1 border-purple-900/50">
               <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs border-b border-purple-900/30 pb-2">
                       <span className="text-slate-400">Mean Time To Failure (MTTF)</span>
                       <span className="text-white font-mono">18,450 h</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-purple-900/30 pb-2">
                       <span className="text-slate-400">Standard Deviation</span>
                       <span className="text-white font-mono">± 450 h</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-purple-900/30 pb-2">
                       <span className="text-slate-400">VaR (99%)</span>
                       <span className="text-red-400 font-bold font-mono">$ 2.4M</span>
                   </div>
                   
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-700 text-[10px] text-slate-300 mt-2">
                       <div className="flex items-center gap-2 mb-1 font-bold text-cyan-400"><ShieldAlert size={12}/> AI Insight</div>
                       Tap changer failure probability increased by 15% due to recent grid fluctuations.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
