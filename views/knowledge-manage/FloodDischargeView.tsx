
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/flood-discharge/ThreeScene';
import { FloodSimState } from '../../components/knowledge-manage/flood-discharge/three-types';
import { 
  Waves, Wind, Activity, Layers, Search, 
  ArrowRight, Shield, Zap, Info, BarChart2,
  AlertTriangle, Droplets
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ReferenceLine, LineChart, Line, BarChart, Bar, Legend
} from 'recharts';

// --- MOCK DATA ---

const SCOUR_DATA = Array.from({length: 50}, (_, i) => ({
    dist: i, // Distance from dam
    bed: 0,
    scour: i > 15 && i < 35 ? -5 * Math.exp(-Math.pow(i - 25, 2) / 20) : 0, // Scour pit shape
    limit: -8 // Safe limit
}));

const ENERGY_DATA = [
    { name: 'Kinetic', value: 65, fill: '#3b82f6' },
    { name: 'Potential', value: 15, fill: '#06b6d4' },
    { name: 'Dissipated', value: 85, fill: '#10b981' }, // Heat/Turbulence
];

const EXPERIENCE_CASES = [
    { id: 'EXP-2022-01', title: '挑流鼻坎体型优化案例', type: 'Design', tags: ['Ski-jump', 'Cavitation'] },
    { id: 'EXP-2021-09', title: '特大洪水水垫塘防护经验', type: 'Operation', tags: ['Plunge Pool', 'Erosion'] },
    { id: 'EXP-2020-05', title: '宽尾墩联合消能技术应用', type: 'Tech', tags: ['Dissipation', 'Aeration'] },
];

export const FloodDischargeView: React.FC = () => {
  const [simState, setSimState] = useState<FloodSimState>('NORMAL');
  const [params, setParams] = useState({
      flowQ: 1200,
      headH: 85,
      opening: 45
  });

  // Dynamic calculations
  const froude = (params.flowQ / 100) / Math.sqrt(9.8 * 5); // Simplified Fr
  const power = 9.8 * params.flowQ * params.headH / 1000; // MW

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#080c14] p-2 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#0e7490_0%,_transparent_60%)] opacity-20 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-800/30 border-2 border-cyan-500 rounded flex items-center justify-center relative">
             <Waves size={30} className="text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Shield size={12} /> Hydraulic Safety Core
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               泄洪消能 <span className="text-cyan-500 italic">防冲经验库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Discharge Power</div>
                <div className="text-2xl font-mono font-black text-white">{power.toFixed(0)} <span className="text-sm font-normal text-slate-600">MW</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Froude No.</div>
                <div className="text-2xl font-mono font-black text-cyan-400">{froude.toFixed(2)}</div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Controls & Parameters --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="水力参数控制" subtitle="INPUT" className="border-cyan-900/30 bg-[#0b1221]/90">
              <div className="space-y-4 pt-2">
                 <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>流量 (Discharge Q)</span>
                         <span className="font-mono text-cyan-300">{params.flowQ} m³/s</span>
                     </div>
                     <input 
                       type="range" min="500" max="5000" step="100" 
                       value={params.flowQ} 
                       onChange={(e) => setParams({...params, flowQ: parseInt(e.target.value)})}
                       className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                     />
                 </div>
                 <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>水头 (Head H)</span>
                         <span className="font-mono text-cyan-300">{params.headH} m</span>
                     </div>
                     <input 
                       type="range" min="50" max="150" step="1" 
                       value={params.headH} 
                       onChange={(e) => setParams({...params, headH: parseInt(e.target.value)})}
                       className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                     />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 pt-2">
                     <button 
                       onClick={() => setSimState('NORMAL')}
                       className={`py-2 rounded border text-xs font-bold transition-colors ${simState === 'NORMAL' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                     >
                         常规工况
                     </button>
                     <button 
                       onClick={() => setSimState('EXTREME')}
                       className={`py-2 rounded border text-xs font-bold transition-colors ${simState === 'EXTREME' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                     >
                         校核洪水
                     </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="消能率评估" subtitle="EFFICIENCY" className="flex-1 border-slate-800">
               <div className="h-full flex flex-col justify-center gap-4">
                   <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ENERGY_DATA} layout="vertical" margin={{left: 20}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                               <XAxis type="number" hide />
                               <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                               <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Total Dissipation</div>
                       <div className="text-3xl font-bold text-green-400">85.2%</div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Scene --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded flex flex-col min-w-[150px]">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Wind size={12}/> Jet Trajectory
                       </div>
                       <div className="text-xl font-mono font-bold text-white">
                           {simState === 'EXTREME' ? '125.0' : '85.5'} <span className="text-xs text-slate-500">m (Distance)</span>
                       </div>
                   </div>
               </div>

               <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                   <button 
                     onClick={() => setSimState('SCOUR_VIEW')}
                     className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 backdrop-blur transition-colors ${simState === 'SCOUR_VIEW' ? 'bg-cyan-500 text-black' : 'bg-black/60 border border-slate-600 text-slate-300'}`}
                   >
                       <Layers size={14} /> 冲刷地形图
                   </button>
               </div>
           </div>

           {/* Scour Depth Analysis */}
           <div className="h-[220px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>河床冲刷深度预测 (Scour Depth Profile)</span>
                   <span className="text-cyan-500 flex items-center gap-1"><AlertTriangle size={10}/> Limit: 8m</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={SCOUR_DATA}>
                       <defs>
                           <linearGradient id="scourGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                               <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance from Dam (m)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} domain={[-10, 2]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#ef4444'}} />
                       <ReferenceLine y={-8} stroke="orange" strokeDasharray="3 3" label={{value: 'Limit', fill: 'orange', fontSize: 10}} />
                       <Area type="monotone" dataKey="scour" stroke="#ef4444" fill="url(#scourGrad)" name="Erosion Depth" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Cases --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="典型经验案例库" subtitle="CASE STUDY" className="flex-1 border-cyan-900/40">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {EXPERIENCE_CASES.map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-cyan-500/50 transition-colors group cursor-pointer">
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.type === 'Design' ? 'bg-blue-900/30 text-blue-300' : 'bg-purple-900/30 text-purple-300'}`}>
                                   {item.type}
                               </span>
                           </div>
                           <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 mb-2">{item.title}</h4>
                           <div className="flex gap-1 flex-wrap">
                               {item.tags.map(t => (
                                   <span key={t} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">#{t}</span>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="防冲措施建议" className="border-slate-800">
               <div className="space-y-3">
                   <div className="flex items-start gap-3">
                       <Zap size={16} className="text-yellow-500 mt-1" />
                       <div>
                           <div className="text-xs font-bold text-white">掺气减蚀 (Aeration)</div>
                           <div className="text-[10px] text-slate-400">建议在流速 &gt; 30m/s 区域增设掺气坎，防止气蚀破坏。</div>
                       </div>
                   </div>
                   <div className="flex items-start gap-3">
                       <Layers size={16} className="text-blue-500 mt-1" />
                       <div>
                           <div className="text-xs font-bold text-white">二道坝防护 (Plunge Pool)</div>
                           <div className="text-[10px] text-slate-400">加深水垫塘深度至 25m 以充分消散冲击动能。</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
