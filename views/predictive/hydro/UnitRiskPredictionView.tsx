
import React, { useState, useEffect } from 'react';
import { RiskPredictionScene } from '../../../components/predictive/hydro-risk/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-7]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-7';
import { RiskComponent } from '../../../components/predictive/hydro-risk/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  AlertOctagon, BrainCircuit, Activity, Clock, 
  Target, ShieldAlert, GitBranch, Binary,
  ChevronRight, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';

// --- Mock Data Generators ---

// Risk Components State
const INITIAL_COMPONENTS: RiskComponent[] = [
  { id: 'stator', name: '定子绝缘系统', riskLevel: 85, explodeOffset: 1 },
  { id: 'rotor', name: '转子磁极', riskLevel: 45, explodeOffset: 0.5 },
  { id: 'bearing', name: '推力轴承', riskLevel: 92, explodeOffset: 0 },
  { id: 'runner', name: '水轮机转轮', riskLevel: 60, explodeOffset: -1 },
  { id: 'cover', name: '顶盖连接', riskLevel: 20, explodeOffset: 1.5 },
  { id: 'shaft', name: '主轴', riskLevel: 10, explodeOffset: 0 },
];

// Weibull Distribution (Survival Curve)
const SURVIVAL_DATA = Array.from({length: 50}, (_, i) => {
    const t = i * 100; // hours
    // Survival probability P(t) = exp(-(t/eta)^beta)
    const prob = Math.exp(-Math.pow(t/3000, 1.5)) * 100;
    return { time: t, prob: prob };
});

// Monte Carlo Simulation Results
const MONTE_CARLO_DATA = Array.from({length: 30}, (_, i) => ({
    iter: i,
    risk: 40 + Math.random() * 40 + (Math.random() > 0.9 ? 15 : 0) // Some spikes
}));

// Fault Tree Factors (Radar)
const RISK_FACTORS = [
    { subject: 'Vibration', A: 95, fullMark: 100 },
    { subject: 'Temperature', A: 80, fullMark: 100 },
    { subject: 'Insulation', A: 60, fullMark: 100 },
    { subject: 'Oil Quality', A: 90, fullMark: 100 },
    { subject: 'Load Stress', A: 75, fullMark: 100 },
    { subject: 'Age Factor', A: 85, fullMark: 100 },
];

export const UnitRiskPredictionView: React.FC = () => {
  // --- STATE ---
  const [explode, setExplode] = useState(0.0);
  const [selectedComp, setSelectedComp] = useState<string | null>(null);
  const [simCount, setSimCount] = useState(12450);
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [globalRisk, setGlobalRisk] = useState(78.4);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setSimCount(prev => prev + Math.floor(Math.random() * 5));
        
        // Randomly fluctuate risk
        setComponents(prev => prev.map(c => ({
            ...c,
            riskLevel: Math.min(100, Math.max(0, c.riskLevel + (Math.random() - 0.5) * 2))
        })));

        setGlobalRisk(prev => prev + (Math.random() - 0.5) * 0.1);

    }, 200);
    return () => clearInterval(interval);
  }, []);

  const activeCompData = components.find(c => c.id === selectedComp);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#030008] text-purple-50 p-2 overflow-y-auto custom-scrollbar selection:bg-purple-500/30">
      
      {/* HEADER: Cyber-Gothic Style */}
      <div className="flex items-end justify-between border-b border-purple-900/40 pb-4 bg-gradient-to-r from-[#1a0524] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <BrainCircuit size={14} className="animate-pulse" />
             AI-DRIVEN PROGNOSTICS
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             机组故障风险 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">全维预测视图</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1">
                    <Binary size={10} /> Monte Carlo Iterations
                </div>
                <div className="text-2xl font-mono font-bold text-purple-300">{simCount.toLocaleString()}</div>
            </div>
            <div className="h-8 w-[1px] bg-purple-900/50"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1">
                    Global Risk Index
                </div>
                <div className={`text-3xl font-mono font-bold ${globalRisk > 80 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                    {globalRisk.toFixed(1)}<span className="text-sm">%</span>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT GRID: Asymmetrical Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Risk Drivers */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Fault Tree Radar */}
           <SciFiCard title="风险因子归因 (Risk Attribution)" subtitle="MULTI-DIMENSIONAL" className="h-[300px] border-purple-900/50 bg-[#0a0510]/80" noPadding>
               <div className="w-full h-full p-2 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_FACTORS}>
                           <PolarGrid stroke="#331c4d" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#a855f7', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Risk" dataKey="A" stroke="#d946ef" strokeWidth={2} fill="#d946ef" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#d946ef', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="absolute bottom-2 left-2 text-[10px] text-slate-500">
                       Top Driver: <span className="text-red-400 font-bold">Vibration (95%)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Anomaly Stream */}
           <SciFiCard title="实时异常特征流" subtitle="ANOMALY DETECTION" className="flex-1 border-purple-900/50">
               <div className="flex flex-col gap-3 h-full overflow-hidden">
                   {[
                       { time: 'Now', id: 'BRG-01', msg: 'Thrust pad temp gradient abnormal', prob: '92%' },
                       { time: '-2m', id: 'VIB-X', msg: '1X amplitude sudden rise', prob: '88%' },
                       { time: '-15m', id: 'OIL-P', msg: 'Lubrication pressure noise', prob: '45%' },
                       { time: '-1h', id: 'STA-T', msg: 'Slot 12 temp deviation', prob: '60%' },
                   ].map((item, i) => (
                       <div key={i} className="bg-purple-900/10 border border-purple-500/20 p-3 rounded hover:bg-purple-900/20 transition-all cursor-pointer group">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] text-purple-300 font-mono">{item.time}</span>
                               <span className="text-[10px] bg-red-900/40 text-red-300 px-1.5 rounded border border-red-900/60">{item.prob} Prob.</span>
                           </div>
                           <div className="flex items-start gap-2">
                               <AlertOctagon size={14} className="text-red-500 mt-0.5 shrink-0" />
                               <div className="text-xs text-slate-200 group-hover:text-white leading-tight">
                                   <span className="font-bold text-purple-400">{item.id}:</span> {item.msg}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Digital Crystal Ball (3D) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0510] to-[#020105] border border-purple-800/40 relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-purple-500/30 p-2 rounded flex flex-col gap-2 w-32">
                       <div className="text-[10px] text-purple-300 uppercase font-bold flex justify-between">
                           Explode View <span>{(explode*100).toFixed(0)}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={explode} onChange={(e) => setExplode(parseFloat(e.target.value))}
                         className="w-full h-1 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                       />
                   </div>
               </div>

               {/* Selected Info Overlay */}
               {activeCompData && (
                   <div className="absolute top-4 left-4 z-10 w-64 animate-in slide-in-from-left-4 fade-in duration-300">
                       <div className="bg-black/80 backdrop-blur border-l-4 border-purple-500 p-4 rounded-r-lg shadow-lg">
                           <h3 className="text-lg font-bold text-white mb-1">{activeCompData.name}</h3>
                           <div className="text-xs text-purple-300 font-mono mb-3">ID: {activeCompData.id.toUpperCase()}</div>
                           
                           <div className="space-y-3">
                               <div>
                                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                                       <span>Risk Level</span>
                                       <span className={activeCompData.riskLevel > 80 ? 'text-red-500 font-bold' : 'text-yellow-400'}>{activeCompData.riskLevel.toFixed(1)}%</span>
                                   </div>
                                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div className={`h-full ${activeCompData.riskLevel > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{width: `${activeCompData.riskLevel}%`}}></div>
                                   </div>
                               </div>
                               <div className="flex gap-2">
                                   <button className="flex-1 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded text-[10px] text-white transition-colors">
                                       Root Cause
                                   </button>
                                   <button className="flex-1 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 rounded text-[10px] text-slate-300 transition-colors">
                                       History
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* Central Status */}
               {!activeCompData && (
                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                       <div className="text-xs text-purple-400 uppercase tracking-[0.3em] mb-2">System Prediction</div>
                       <div className="text-sm text-slate-400 bg-black/50 px-3 py-1 rounded-full border border-purple-900/30">
                           Next Critical Failure in: <span className="text-white font-mono font-bold">48h 12m</span>
                       </div>
                   </div>
               )}

               <RiskPredictionScene 
                   explodeFactor={explode}
                   components={components}
                   onComponentSelect={setSelectedComp}
                   activeComponentId={selectedComp}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Monte Carlo Distribution */}
           <SciFiCard title="蒙特卡洛模拟分布 (Monte Carlo)" subtitle="PROBABILITY DENSITY" className="h-[200px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={MONTE_CARLO_DATA}>
                           <defs>
                               <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#d946ef" stopOpacity={0.5}/>
                                   <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c4d" vertical={false} />
                           <XAxis dataKey="iter" hide />
                           <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#d946ef', color: '#fff'}} cursor={{fill: '#331c4d'}} />
                           <Bar dataKey="risk" fill="url(#colorRisk)" radius={[2,2,0,0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Timeline & Actions */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Survival Curve */}
           <SciFiCard title="生存概率曲线 (Survival Analysis)" subtitle="WEIBULL" className="h-[300px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SURVIVAL_DATA}>
                           <defs>
                               <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c4d" />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Hours', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'P(t) %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#10b981', color: '#fff'}} />
                           <ReferenceLine x={2000} stroke="yellow" strokeDasharray="3 3" label={{value: 'Now', fill: 'yellow', fontSize: 10}} />
                           <Area type="monotone" dataKey="prob" stroke="#10b981" strokeWidth={2} fill="url(#colorProb)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Prescriptive Actions */}
           <SciFiCard title="规避策略建议 (Prescription)" className="flex-1 border-purple-900/50">
               <div className="flex flex-col gap-3">
                   <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-red-300 flex items-center gap-2"><ShieldAlert size={12}/> High Priority</span>
                           <span className="text-[10px] text-red-400">Immediate</span>
                       </div>
                       <p className="text-xs text-slate-300">
                           Thrust bearing film thickness dropping below critical threshold. Schedule outage for oil injection pump check.
                       </p>
                       <button className="mt-2 w-full py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs rounded transition-colors">
                           Issue Work Order
                       </button>
                   </div>

                   <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-yellow-300 flex items-center gap-2"><Clock size={12}/> Warning</span>
                           <span className="text-[10px] text-yellow-400">7 Days</span>
                       </div>
                       <p className="text-xs text-slate-300">
                           Stator partial discharge trend increasing. Plan for online PD monitoring adjustment.
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
