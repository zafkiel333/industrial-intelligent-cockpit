
import React, { useState, useMemo } from 'react';
import { ProbabilityTimeScene } from '../../../components/predictive/hydro-probability/ThreeScene';
import { ProbComponent } from '../../../components/predictive/hydro-probability/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ComposedChart, Line, Bar, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Clock, Calendar, AlertOctagon, TrendingUp, 
  HelpCircle, ChevronRight, Play, Pause,
  Timer, Target, Zap, Activity
} from 'lucide-react';

// --- Mock Data ---

// Components with Weibull Parameters (Shape β, Characteristic Life η)
const COMPONENT_DATA: ProbComponent[] = [
    { id: 'stator', name: '定子绕组', beta: 2.5, eta: 15000, baseColor: '#3b82f6' }, // Wear-out phase
    { id: 'bearing', name: '推力轴承', beta: 1.8, eta: 8000, baseColor: '#f59e0b' },
    { id: 'runner', name: '转轮叶片', beta: 3.0, eta: 20000, baseColor: '#ef4444' }, // Definite fatigue
    { id: 'rotor', name: '转子磁极', beta: 1.2, eta: 25000, baseColor: '#10b981' }, // Random/Slow wear
    { id: 'shaft', name: '主轴系统', beta: 4.0, eta: 30000, baseColor: '#94a3b8' },
];

// Generate Probability Curves based on Time Horizon
const generateCurves = (days: number) => {
    const data = [];
    const step = Math.max(1, Math.floor(days / 50));
    
    for (let t = 0; t <= days; t += step) {
        const hours = t * 24;
        let point: any = { day: t };
        
        // Calculate P(f) for each component
        COMPONENT_DATA.forEach(comp => {
            // Weibull CDF: F(t) = 1 - exp(-(t/η)^β)
            const prob = 1 - Math.exp(-Math.pow(hours / comp.eta, comp.beta));
            point[comp.id] = (prob * 100).toFixed(2);
        });
        
        data.push(point);
    }
    return data;
};

// Optimal Maintenance Window Data
const MAINTENANCE_WINDOW = [
    { day: 30, cost: 80, risk: 10, score: 90 },
    { day: 60, cost: 75, risk: 15, score: 85 },
    { day: 90, cost: 70, risk: 25, score: 80 },
    { day: 120, cost: 65, risk: 40, score: 75 }, // Sweet spot area starts
    { day: 150, cost: 60, risk: 60, score: 65 },
    { day: 180, cost: 90, risk: 85, score: 40 }, // Corrective maintenance cost spikes
];

export const FailureProbabilityView: React.FC = () => {
  // --- STATE ---
  const [timeHorizon, setTimeHorizon] = useState<number>(90); // Days into future
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const probabilityData = useMemo(() => generateCurves(365), []);
  
  // Auto-play simulation
  React.useEffect(() => {
      let interval: any;
      if (isPlaying) {
          interval = setInterval(() => {
              setTimeHorizon(prev => (prev >= 365 ? 0 : prev + 1));
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isPlaying]);

  // Derived Metrics for selected horizon
  const currentRiskProfile = COMPONENT_DATA.map(comp => {
      const hours = timeHorizon * 24;
      const prob = 1 - Math.exp(-Math.pow(hours / comp.eta, comp.beta));
      return { ...comp, prob: prob * 100 };
  }).sort((a, b) => b.prob - a.prob);

  const highestRiskComp = currentRiskProfile[0];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1220] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Timer size={14} className="animate-pulse" />
             Predictive Analytics Engine
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             故障发生概率 <span className="text-cyan-500">& 时间窗口预测</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Prediction Horizon</div>
                <div className="text-3xl font-mono font-bold text-cyan-300">T + {timeHorizon} <span className="text-sm text-slate-500">Days</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Reliability</div>
                <div className={`text-2xl font-mono font-bold ${highestRiskComp.prob > 20 ? 'text-red-500' : 'text-green-400'}`}>
                    {(100 - highestRiskComp.prob).toFixed(1)}%
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Probability Curves */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Main PDF/CDF Chart */}
           <SciFiCard title="故障累计概率分布 (CDF)" subtitle="365 DAYS PROJECTION" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full min-h-[300px] flex flex-col">
                   <div className="flex justify-end gap-4 text-[10px] text-slate-400 mb-2">
                       <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Runner</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Bearing</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Stator</span>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={probabilityData}>
                               <defs>
                                   <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Days into Future', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Prob (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#050a15', borderColor: '#22d3ee', color: '#fff'}} />
                               
                               {/* Dynamic Reference Line for Slider */}
                               <ReferenceLine x={timeHorizon} stroke="#fff" strokeDasharray="3 3" label={{position: 'top', value: 'NOW', fill: 'white', fontSize: 10}} />

                               <Area type="monotone" dataKey="runner" stroke="#ef4444" strokeWidth={2} fill="url(#gradRisk)" />
                               <Area type="monotone" dataKey="bearing" stroke="#f59e0b" strokeWidth={2} fill="none" />
                               <Area type="monotone" dataKey="stator" stroke="#3b82f6" strokeWidth={2} fill="none" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Risk Ranking */}
           <SciFiCard title="当前预测风险排序" subtitle={`AT T+${timeHorizon}`} className="h-[250px] border-cyan-900/50">
               <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                   {currentRiskProfile.map((comp, idx) => (
                       <div key={comp.id} className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800">
                           <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx===0 ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-400'}`}>
                                   {idx+1}
                               </div>
                               <div>
                                   <div className="text-sm text-slate-200 font-bold">{comp.name}</div>
                                   <div className="text-[10px] text-slate-500">β={comp.beta} | η={comp.eta}h</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className={`text-lg font-mono font-bold ${comp.prob > 10 ? 'text-red-400' : 'text-green-400'}`}>
                                   {comp.prob.toFixed(2)}%
                               </div>
                               <div className="text-[9px] text-slate-500">Fail Prob</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Interactive Time Tunnel */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Scene Container */}
           <div className="flex-1 bg-[#03050a] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[0_0_60px_rgba(8,145,178,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded w-64">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-cyan-400 font-bold uppercase flex items-center gap-2">
                               <Clock size={12} /> Time Travel
                           </span>
                           <span className="text-xs font-mono text-white">{timeHorizon} Days</span>
                       </div>
                       <input 
                         type="range" 
                         min="0" max="365" step="1" 
                         value={timeHorizon} 
                         onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                       <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                           <span>Today</span>
                           <span>1 Year</span>
                       </div>
                   </div>
                   
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className={`flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all border
                        ${isPlaying ? 'bg-red-900/30 border-red-500 text-red-300' : 'bg-cyan-900/30 border-cyan-500 text-cyan-300'}
                     `}
                   >
                       {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                       {isPlaying ? 'PAUSE SIMULATION' : 'PLAY TIMELINE'}
                   </button>
               </div>

               {/* Center Warning Overlay */}
               {highestRiskComp.prob > 15 && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                       <div className="w-64 h-64 border border-red-500/20 rounded-full animate-ping opacity-20"></div>
                   </div>
               )}

               <ProbabilityTimeScene 
                   timeHorizon={timeHorizon}
                   components={COMPONENT_DATA}
               />
           </div>

           {/* Maintenance Window Optimizer */}
           <SciFiCard title="最佳维护窗口分析" subtitle="OPTIMIZATION" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-4">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={MAINTENANCE_WINDOW}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Days', position: 'insideBottom', offset: -5 }}/>
                               <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Cost Index', angle: -90, position: 'insideLeft' }}/>
                               <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Risk', angle: 90, position: 'insideRight' }}/>
                               <Tooltip contentStyle={{backgroundColor: '#050a15', borderColor: '#22d3ee'}} />
                               
                               <Bar yAxisId="left" dataKey="cost" fill="#3b82f6" barSize={20} fillOpacity={0.5} name="Maint. Cost" />
                               <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} name="Failure Risk" />
                               
                               {/* Optimal Zone */}
                               <ReferenceLine x={120} stroke="green" strokeDasharray="3 3" label={{value: 'Optimal', fill: 'green', fontSize: 10}} />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-48 flex flex-col justify-center gap-3 border-l border-slate-800 pl-4">
                       <div className="text-xs font-bold text-slate-400 uppercase">Recommendation</div>
                       <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
                           <div className="text-[10px] text-green-400 mb-1">Best Window</div>
                           <div className="text-lg font-bold text-white">T + 110~130</div>
                           <div className="text-[9px] text-slate-400 mt-1">Cost saving: 15%</div>
                       </div>
                       <div className="text-[10px] text-slate-500 leading-tight">
                           此时段内，部件故障风险尚未激增，且处于电网低负荷窗口，综合停机损失最小。
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Insights & Actions */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Weibull Parameters Analysis */}
           <SciFiCard title="失效模型参数 (Weibull)" subtitle="RELIABILITY ENG" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="text-xs text-slate-400 leading-relaxed">
                       基于历史运维数据拟合的威布尔分布参数，用于表征各组件的失效模式（早期失效、随机失效、磨损失效）。
                   </div>
                   
                   <div className="space-y-3">
                       {COMPONENT_DATA.map(comp => (
                           <div key={comp.id} className="bg-slate-900/40 p-2 rounded border border-slate-800">
                               <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                                   <span style={{color: comp.baseColor}}>{comp.name}</span>
                                   <span>{comp.beta > 1 ? 'Wear Out' : comp.beta < 1 ? 'Early Fail' : 'Random'}</span>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                                   <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                                       <span>β (Shape)</span>
                                       <span className="text-white">{comp.beta}</span>
                                   </div>
                                   <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                                       <span>η (Life)</span>
                                       <span className="text-white">{(comp.eta/24).toFixed(0)}d</span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Confidence Interval */}
           <SciFiCard title="预测置信度分析" className="border-cyan-900/50">
               <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center text-xs text-slate-400">
                       <span>Data Quality</span>
                       <div className="flex gap-1">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                       </div>
                   </div>
                   
                   <div className="h-24 w-full mt-2 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={[
                               {x:0, y:10, range:[9,11]}, 
                               {x:50, y:15, range:[12,18]}, 
                               {x:100, y:25, range:[18,32]}
                           ]}>
                               <Area dataKey="range" stroke="none" fill="#3b82f6" fillOpacity={0.2} />
                               <Line dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                       <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-slate-500">Uncertainty Funnel</div>
                   </div>
                   
                   <div className="p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-[10px] text-yellow-200 mt-1">
                       <AlertOctagon size={10} className="inline mr-1"/>
                       90天后的预测置信区间扩大至 ±15%，建议每30天校准模型。
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
