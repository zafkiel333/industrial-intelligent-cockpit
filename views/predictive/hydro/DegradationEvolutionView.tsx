
import React, { useState, useEffect } from 'react';
import { DegradationEvolutionScene } from '../../../components/predictive/hydro-degradation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-9]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-9';
import { StatePoint } from '../../../components/predictive/hydro-degradation/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, ZAxis, Legend, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  GitGraph, TrendingUp, AlertTriangle, Layers, 
  Play, Pause, FastForward, Rewind, 
  Thermometer, Zap, Activity, Grid
} from 'lucide-react';

// --- Mock Data ---

// Hill Chart Background (Efficiency Contours)
const HILL_CHART_ZONES = [
    { x: 10, y: 50, z: 10, type: 'Vibration Zone' },
    { x: 80, y: 90, z: 5, type: 'Optimal Zone' },
    { x: 100, y: 110, z: 20, type: 'Overload Zone' },
];

// Operating Points History (Head vs Power)
const OPS_HISTORY = Array.from({length: 100}, (_, i) => ({
    head: 80 + Math.random() * 40, // m
    power: 20 + Math.random() * 90, // %
    efficiency: 85 + Math.random() * 10,
    time: i
}));

// Failure Mode Stream (Risk Probability over Time)
const FAILURE_STREAM = Array.from({length: 20}, (_, i) => ({
    time: `T+${i}M`,
    bearing: 10 + i * 1.5,
    cavitation: 5 + i * 0.8,
    insulation: 2 + i * 0.2,
    mechanical: 8 + Math.sin(i)*5
}));

export const DegradationEvolutionView: React.FC = () => {
  // --- STATE ---
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeStep, setTimeStep] = useState(0);
  
  // 3D Data State
  const [historyPath, setHistoryPath] = useState<StatePoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<StatePoint>({x:0, y:0, z:0});
  const [predictions, setPredictions] = useState<StatePoint[][]>([]);

  // Simulation Loop
  useEffect(() => {
    // Generate initial history
    const initPath: StatePoint[] = [];
    let cx = 0, cy = 0, cz = 0;
    for(let i=0; i<50; i++) {
        cx += (Math.random()-0.4); // Drift towards X+ (Load/Wear)
        cy += (Math.random()-0.5) * 0.5 + (cx/10); // Vib increases with Load
        cz += (Math.random()-0.5) * 0.5 + (cx/15); // Temp increases
        initPath.push({ x: cx, y: cy, z: cz });
    }
    setHistoryPath(initPath);
    setCurrentPoint(initPath[initPath.length-1]);

    const interval = setInterval(() => {
        if (!isPlaying) return;

        setTimeStep(prev => prev + 1);

        // Update Current Point (Random Walk with Drift)
        setCurrentPoint(prev => {
            const next = {
                x: prev.x + 0.05 + (Math.random()-0.5)*0.2,
                y: prev.y + (Math.random()-0.5)*0.5 + 0.01,
                z: prev.z + (Math.random()-0.5)*0.3 + 0.01
            };
            setHistoryPath(h => [...h.slice(1), next]); // Sliding window
            return next;
        });

        // Generate Predictions based on current point
        const pred1 = []; // Likely
        const pred2 = []; // Worst Case
        let p1 = {...currentPoint};
        let p2 = {...currentPoint};
        for(let j=0; j<20; j++) {
            p1.x += 0.1; p1.y += 0.05; p1.z += 0.05;
            pred1.push({...p1});
            
            p2.x += 0.15; p2.y += 0.2; p2.z += 0.1; // Divergent
            pred2.push({...p2});
        }
        setPredictions([pred1, pred2]);

    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020202] text-indigo-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-indigo-900/40 pb-4 bg-gradient-to-r from-[#0a0514] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <GitGraph size={14} className="animate-pulse" />
             Multi-State Evolution Analysis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             机组多工况 <span className="text-indigo-500">劣化演化路径分析</span>
          </h1>
        </div>
        
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Degradation Rate</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">+0.042 <span className="text-sm text-slate-500">%/h</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">State Entropy</div>
                <div className="text-3xl font-mono font-bold text-white">4.85 <span className="text-sm text-slate-500">bit</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Operating Context */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Operating Hill Chart */}
           <SciFiCard title="运行工况分布 (Hill Chart)" subtitle="HISTORY MAPPING" className="h-[320px] border-indigo-900/50 bg-[#05050a]" noPadding>
               <div className="w-full h-full p-2 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                           <XAxis type="number" dataKey="power" name="Power" unit="%" stroke="#64748b" domain={[0, 120]} label={{ value: 'Output (%)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis type="number" dataKey="head" name="Head" unit="m" stroke="#64748b" domain={[60, 140]} label={{ value: 'Head (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#6366f1'}} />
                           
                           {/* Zones Background (Simulated by large scatters or reference areas - simplified here) */}
                           
                           <Scatter name="History" data={OPS_HISTORY} fill="#6366f1" fillOpacity={0.6} shape="circle" />
                           <Scatter name="Current" data={[OPS_HISTORY[OPS_HISTORY.length-1]]} fill="#fff" shape="cross" />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 text-[9px] text-slate-500 bg-black/60 p-1 rounded">
                       • Points: Operating Hours
                   </div>
               </div>
           </SciFiCard>

           {/* Stress Accumulation */}
           <SciFiCard title="累积应力损伤 (Stress)" className="flex-1 border-indigo-900/50">
               <div className="space-y-4">
                   <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Start/Stop Cycles</span>
                           <span className="text-white">1,240</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{width: '60%'}}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Cavitation Zone Time</span>
                           <span className="text-white">450 hrs</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500" style={{width: '25%'}}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Overload Duration</span>
                           <span className="text-white">120 hrs</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-yellow-500" style={{width: '10%'}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: The Evolution Engine (3D Phase Space) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           <div className="flex-1 min-h-[400px] bg-[#000000] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(99,102,241,0.1)]">
               
               {/* HUD Overlay */}
               <div className="absolute top-4 left-4 z-10 pointer-events-none">
                   <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <Grid size={12}/> Phase Space Trajectory
                   </div>
                   <div className="flex gap-4 text-xs font-mono text-slate-300">
                       <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> X: Vibration</div>
                       <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Y: Temperature</div>
                       <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Z: Load</div>
                   </div>
               </div>

               {/* Time Controls */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-slate-900/80 p-1 rounded border border-slate-700">
                   <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><Rewind size={16}/></button>
                   <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white shadow-lg">
                       {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
                   </button>
                   <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><FastForward size={16}/></button>
               </div>

               <DegradationEvolutionScene 
                   currentPoint={currentPoint}
                   historyPath={historyPath}
                   predictionPaths={predictions}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Failure Probability Stream */}
           <SciFiCard title="失效模式演化概率流 (Failure Stream)" subtitle="RISK EVOLUTION" className="h-[250px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={FAILURE_STREAM} stackOffset="expand">
                           <defs>
                               <linearGradient id="colBearing" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/></linearGradient>
                               <linearGradient id="colCav" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/></linearGradient>
                               <linearGradient id="colIns" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#6366f1'}} />
                           <Legend iconType="circle" wrapperStyle={{fontSize:'10px'}} />
                           <Area type="monotone" dataKey="bearing" stackId="1" stroke="#f59e0b" fill="url(#colBearing)" name="Bearing Wear" />
                           <Area type="monotone" dataKey="cavitation" stackId="1" stroke="#0ea5e9" fill="url(#colCav)" name="Cavitation" />
                           <Area type="monotone" dataKey="insulation" stackId="1" stroke="#8b5cf6" fill="url(#colIns)" name="Insulation Aging" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Critical Path Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           <SciFiCard title="关键演化路径推演" subtitle="CRITICAL PATH" className="flex-1 border-indigo-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-900/50">
                   
                   <div className="relative">
                       <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                       <div className="text-xs text-slate-400 mb-1">Current State</div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-white font-bold text-sm">Vibration Increasing</div>
                           <div className="text-[10px] text-slate-500">Due to extended partial load ops</div>
                       </div>
                   </div>

                   <div className="relative">
                       <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-black"></div>
                       <div className="text-xs text-yellow-500 mb-1">T + 3 Months</div>
                       <div className="bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                           <div className="text-yellow-200 font-bold text-sm">Bearing Clearance &gt; Limit</div>
                           <div className="text-[10px] text-slate-500">Prob: 65%</div>
                       </div>
                   </div>

                   <div className="relative">
                       <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></div>
                       <div className="text-xs text-red-500 mb-1">T + 8 Months</div>
                       <div className="bg-red-900/10 p-2 rounded border border-red-900/30">
                           <div className="text-red-200 font-bold text-sm">Major Failure Risk</div>
                           <div className="text-[10px] text-slate-500">Shaft runout exceeds safety margin</div>
                       </div>
                   </div>

               </div>
           </SciFiCard>

           <SciFiCard title="干预效果模拟" className="border-indigo-900/50">
               <div className="space-y-3">
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <span className="text-xs text-slate-300">调整运行区间</span>
                       <span className="text-green-400 text-xs font-bold">+120 Days Life</span>
                   </div>
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <span className="text-xs text-slate-300">更换润滑油</span>
                       <span className="text-green-400 text-xs font-bold">+45 Days Life</span>
                   </div>
                   <button className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">
                       Apply Mitigation Strategy
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
