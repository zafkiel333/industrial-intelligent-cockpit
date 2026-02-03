
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/ventilation-network/ThreeScene';
import { SolverState } from '../../components/knowledge-manage/ventilation-network/three-types';
import { 
  Wind, Activity, Network, Calculator, 
  Play, RefreshCcw, RotateCcw, AlertTriangle, Fan,
  Thermometer, GitBranch, Share2, FileCode,
  Gauge, TrendingUp, Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';

// --- MOCK DATA ---
const FAN_CURVE = Array.from({length: 20}, (_, i) => ({
    q: i * 500, // Flow
    p_static: 4000 - Math.pow(i, 1.8) * 10, // Static Pressure Curve
    p_resist: Math.pow(i, 2) * 5 // System Resistance Curve
}));

const NODE_DATA = [
    { id: 'N-01', type: 'Intake', press: 101.3, flow: 12500, gas: 0.02 },
    { id: 'N-05', type: 'Junction', press: 98.5, flow: 6200, gas: 0.15 },
    { id: 'N-12', type: 'Face', press: 96.2, flow: 4500, gas: 0.45 },
    { id: 'N-08', type: 'Return', press: 94.1, flow: 12400, gas: 0.65 },
];

const SOLVER_LOGS = [
    { step: 1, error: 0.85, status: 'Iterating' },
    { step: 2, error: 0.42, status: 'Iterating' },
    { step: 3, error: 0.15, status: 'Iterating' },
    { step: 4, error: 0.04, status: 'Iterating' },
    { step: 5, error: 0.001, status: 'Converged' },
];

export const VentilationNetworkKbView: React.FC = () => {
  const [solverState, setSolverState] = useState<SolverState>('FLOWING');
  const [iteration, setIteration] = useState(0);
  const [totalAirflow, setTotalAirflow] = useState(12500);

  // Simulation Logic
  useEffect(() => {
    let timer: any;
    if (solverState === 'SOLVING') {
        timer = setInterval(() => {
            setIteration(prev => {
                if (prev >= 100) {
                    setSolverState('FLOWING');
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    } else {
        setIteration(0);
    }
    return () => clearInterval(timer);
  }, [solverState]);

  // Random fluctuation for normal state
  useEffect(() => {
      const timer = setInterval(() => {
          if (solverState === 'FLOWING' || solverState === 'SMOKE_SIM') {
              setTotalAirflow(12500 + Math.random() * 200);
          }
      }, 1000);
      return () => clearInterval(timer);
  }, [solverState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020409] p-2 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.3)]">
             <Wind size={30} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Calculator size={12} /> Network Solver Engine
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               井下通风 <span className="text-cyan-500 italic">网络解算模型库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Airflow Q</div>
                <div className="text-2xl font-mono font-black text-white">{totalAirflow.toFixed(0)} <span className="text-sm font-normal text-slate-600">m³/min</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Network Effective Rate</div>
                <div className="text-2xl font-mono font-black text-emerald-400">88.5<span className="text-sm font-normal text-slate-600">%</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Topology & Config --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="网络拓扑结构" subtitle="TOPOLOGY" className="flex-1 border-cyan-900/30 bg-[#080b14]/90">
              <div className="flex flex-col gap-2 mt-2 h-full">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-2 mb-2">
                      <span className="flex items-center gap-1"><GitBranch size={12}/> Branch/Node Tree</span>
                      <span className="bg-slate-800 px-2 rounded text-cyan-400">V3.5.1</span>
                  </div>
                  
                  {/* Tree Structure Mock */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 p-1">
                      {['Main Intake Shaft', 'Level -400 Haulage', 'Panel 1204 Face', 'Return Airway West', 'Main Fan Station'].map((node, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer group transition-colors border border-transparent hover:border-cyan-900/50">
                              <div className={`w-2 h-2 rounded-full ${i===0?'bg-green-500':i===4?'bg-red-500':'bg-slate-600'}`}></div>
                              <span className="text-xs text-slate-300 group-hover:text-cyan-200">{node}</span>
                              <span className="ml-auto text-[10px] text-slate-600 font-mono">ID:{100+i}</span>
                          </div>
                      ))}
                  </div>

                  <div className="p-3 bg-cyan-900/10 border border-cyan-800/30 rounded mt-2">
                      <div className="text-[10px] text-cyan-400 font-bold mb-2 uppercase">Solver Configuration</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div>Algorithm:</div><div className="text-white text-right">Scott-Hinsley</div>
                          <div>Precision:</div><div className="text-white text-right">1e-6</div>
                          <div>Max Iter:</div><div className="text-white text-right">1000</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setSolverState('SOLVING')}
                 className={`py-3 rounded border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all
                    ${solverState === 'SOLVING' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}
                 `}
               >
                   <RefreshCcw size={16} className={solverState === 'SOLVING' ? 'animate-spin' : ''}/>
                   <span>全网解算</span>
               </button>
               <button 
                 onClick={() => setSolverState('SMOKE_SIM')}
                 className={`py-3 rounded border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all
                    ${solverState === 'SMOKE_SIM' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}
                 `}
               >
                   <AlertTriangle size={16} />
                   <span>灾变模拟</span>
               </button>
           </div>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={solverState} />

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-3 rounded-sm flex flex-col">
                       <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Network size={12} /> Digital Twin Network
                       </div>
                       <div className="text-xl font-black text-white">{solverState}</div>
                   </div>
               </div>

               {/* Legend */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700 flex gap-4 text-[10px] text-slate-300">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Fresh Air</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Return/Smoke</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Fan Station</div>
               </div>

               {/* Action Buttons */}
               <div className="absolute top-4 right-4 flex flex-col gap-2">
                   <button 
                     onClick={() => setSolverState('REVERSE')}
                     className="bg-slate-900/80 hover:bg-slate-800 p-2 rounded border border-slate-700 text-slate-300 hover:text-white transition-colors"
                     title="反风演习"
                   >
                       <RotateCcw size={16} />
                   </button>
                   <button 
                     onClick={() => setSolverState('FLOWING')}
                     className="bg-slate-900/80 hover:bg-slate-800 p-2 rounded border border-slate-700 text-slate-300 hover:text-white transition-colors"
                     title="稳态模拟"
                   >
                       <Play size={16} />
                   </button>
               </div>
           </div>

           {/* Performance Curve (Bottom) */}
           <div className="h-[220px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>主要通风机工况点 (Fan Characteristic Curve)</span>
                   <span className="text-cyan-500 flex items-center gap-1"><Gauge size={10}/> Efficiency: 82%</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={FAN_CURVE}>
                       <defs>
                           <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="q" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Flow Q (m³/min)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Pressure H (Pa)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                       
                       {/* Fan Static Pressure */}
                       <Area type="monotone" dataKey="p_static" stroke="#0ea5e9" fill="url(#curveGrad)" strokeWidth={2} name="P-Q Curve" />
                       
                       {/* Network Resistance */}
                       <Line type="monotone" dataKey="p_resist" stroke="#f59e0b" strokeWidth={2} dot={false} name="Network Resistance R" />
                       
                       {/* Operating Point */}
                       <ReferenceLine x={8500} stroke="#fff" strokeDasharray="3 3" label={{value:'OP', fill:'white', fontSize:10}} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Analysis & Logs --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="关键节点解算结果" subtitle="NODES" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {NODE_DATA.map((node, i) => (
                       <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all">
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-white">{node.id}</span>
                               <span className={`text-[9px] px-1.5 rounded uppercase font-black ${node.type === 'Intake' ? 'bg-green-900/30 text-green-400' : node.type === 'Return' ? 'bg-red-900/30 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                                   {node.type}
                               </span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                               <div>Press: <span className="text-cyan-300">{node.press} kPa</span></div>
                               <div>Flow: <span className="text-cyan-300">{node.flow}</span></div>
                               <div className="col-span-2 flex items-center gap-2 border-t border-slate-800 pt-1 mt-1">
                                   <Thermometer size={10} /> Gas: <span className={node.gas > 0.5 ? 'text-red-400 font-bold' : 'text-green-400'}>{node.gas}%</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="解算收敛日志" subtitle="ITERATION" className="h-[200px] border-slate-800">
               <div className="h-full flex flex-col text-[10px] font-mono">
                   <div className="grid grid-cols-3 text-slate-500 border-b border-slate-800 pb-1 mb-1">
                       <span>Step</span>
                       <span>Residual</span>
                       <span className="text-right">State</span>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                       {SOLVER_LOGS.map((log, i) => (
                           <div key={i} className="grid grid-cols-3 text-slate-300 hover:bg-slate-800/50">
                               <span>#{log.step}</span>
                               <span className={log.error < 0.01 ? 'text-green-400' : 'text-yellow-400'}>{log.error}</span>
                               <span className="text-right">{log.status}</span>
                           </div>
                       ))}
                   </div>
                   <button className="mt-2 w-full py-2 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2">
                       <FileCode size={12} /> 导出计算报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
