
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/unmanned-ship/ThreeScene';
import { TrainingPhase } from '../../components/knowledge-manage/unmanned-ship/three-types';
import { 
  Ship, Cpu, Database, Target, 
  Play, Pause, RotateCcw, Crosshair, 
  Wind, Waves, CloudRain, Sun, 
  Code, GitBranch, Terminal, Layers,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';

// --- MOCK DATA ---
const SCENARIOS = [
    { id: 'S-CALM', label: '平静海域 (Calm Sea)', difficulty: 1, samples: 12000, color: '#10b981' },
    { id: 'S-PORT', label: '繁忙港口 (Busy Port)', difficulty: 4, samples: 8500, color: '#f59e0b' },
    { id: 'S-STORM', label: '风浪海况 (Storm)', difficulty: 5, samples: 4200, color: '#ef4444' },
    { id: 'S-NARROW', label: '狭窄水道 (Narrow)', difficulty: 3, samples: 6800, color: '#3b82f6' },
];

const TRAINING_LOSS = Array.from({length: 50}, (_, i) => ({
    epoch: i,
    loss: 1.5 * Math.exp(-0.1 * i) + Math.random() * 0.1,
    reward: Math.log(i + 1) * 10 + Math.random() * 5
}));

const SENSOR_STATS = [
  { subject: 'LiDAR', A: 95, fullMark: 100 },
  { subject: 'Visual Cam', A: 85, fullMark: 100 },
  { subject: 'Thermal', A: 70, fullMark: 100 },
  { subject: 'Radar', A: 90, fullMark: 100 },
  { subject: 'Sonar', A: 60, fullMark: 100 },
  { subject: 'GPS/IMU', A: 98, fullMark: 100 },
];

export const UnmannedShipKbView: React.FC = () => {
  const [phase, setPhase] = useState<TrainingPhase>('MODEL_TRAINING');
  const [activeScenario, setActiveScenario] = useState('S-PORT');
  const [epoch, setEpoch] = useState(420);
  const [accuracy, setAccuracy] = useState(88.5);

  // Sim loop
  useEffect(() => {
    const interval = setInterval(() => {
        if (phase === 'MODEL_TRAINING') {
            setEpoch(e => e + 1);
            setAccuracy(acc => Math.min(99.9, acc + Math.random() * 0.1));
        }
    }, 500);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* Background Tech Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_#0ea5e9_0%,_transparent_60%)]"></div>
      
      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
             <Ship size={28} className="text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Cpu size={12} /> Autonomous Navigation Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               无人船巡航避障 <span className="text-cyan-500 italic">算法训练集</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Training Epochs</div>
                <div className="text-2xl font-mono font-black text-white">{epoch.toLocaleString()}</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model Accuracy</div>
                <div className="text-2xl font-mono font-black text-emerald-400">{accuracy.toFixed(2)}%</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Data & Scenarios --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="训练场景库" subtitle="DATASET" className="border-cyan-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-2 mt-2">
                 {SCENARIOS.map((sc) => (
                    <div 
                      key={sc.id}
                      onClick={() => setActiveScenario(sc.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                        ${activeScenario === sc.id 
                            ? 'bg-cyan-900/20 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        {activeScenario === sc.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                        
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold text-white group-hover:text-cyan-300">{sc.label}</span>
                           <span className="text-[10px] font-mono text-slate-500">{sc.samples} sets</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                            {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i < sc.difficulty ? 'bg-current' : 'bg-slate-800'}`} style={{color: sc.color}}></div>
                            ))}
                        </div>
                    </div>
                 ))}
              </div>
              <div className="mt-4 p-3 bg-cyan-900/10 border border-cyan-800/30 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold">
                      <Database size={14}/> Total Samples
                  </div>
                  <div className="text-lg font-mono text-white">31,500</div>
              </div>
           </SciFiCard>

           <SciFiCard title="传感器融合权重" subtitle="FUSION" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SENSOR_STATS}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Weights" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Simulation & Controls --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene phase={phase} />

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-cyan-500">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Target size={12}/> Target Lock
                       </div>
                       <div className="text-lg font-black text-white">WP-Alpha-04</div>
                       <div className="text-xs text-slate-400 mt-1">Dist: 145.2m | ETA: 45s</div>
                   </div>
               </div>

               {/* Sensor Feed Placeholders */}
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 w-32">
                   <div className="bg-black/60 border border-slate-700 aspect-video rounded flex items-center justify-center">
                       <div className="text-[9px] text-slate-500">LiDAR Feed</div>
                   </div>
                   <div className="bg-black/60 border border-slate-700 aspect-video rounded flex items-center justify-center">
                       <div className="text-[9px] text-slate-500">Camera 01</div>
                   </div>
               </div>

               {/* Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   <button 
                     onClick={() => setPhase('DATA_COLLECTION')}
                     className={`p-3 rounded-full transition-all ${phase === 'DATA_COLLECTION' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                     title="Data Replay"
                   >
                       <RotateCcw size={18} />
                   </button>
                   <button 
                     onClick={() => setPhase('MODEL_TRAINING')}
                     className={`p-3 rounded-full transition-all ${phase === 'MODEL_TRAINING' ? 'bg-cyan-600 text-white animate-pulse' : 'text-slate-400 hover:text-white'}`}
                     title="Start Training"
                   >
                       <Play size={18} fill="currentColor"/>
                   </button>
                   <button 
                     onClick={() => setPhase('VALIDATION')}
                     className={`p-3 rounded-full transition-all ${phase === 'VALIDATION' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                     title="Validation"
                   >
                       <CheckCircle2 size={18} />
                   </button>
               </div>
           </div>

           {/* Training Metrics Chart */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>训练收敛曲线 (Loss vs Reward)</span>
                   <span className="text-cyan-500">Auto-Optimization ON</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={TRAINING_LOSS}>
                       <defs>
                           <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="epoch" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} width={30} />
                       <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 10}} width={30} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#334155'}} />
                       <Legend wrapperStyle={{fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" fill="url(#lossGrad)" strokeWidth={2} name="Loss" />
                       <Area yAxisId="right" type="monotone" dataKey="reward" stroke="#10b981" fill="url(#rewardGrad)" strokeWidth={2} name="Reward" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Algorithm Details --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="强化学习模型参数" subtitle="HYPERPARAMS" className="flex-1 border-cyan-900/30">
               <div className="space-y-4 pt-2">
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Learning Rate (α)</span>
                           <span className="font-mono text-cyan-300">0.003</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                           <div className="h-full bg-cyan-600 w-[30%]"></div>
                       </div>
                   </div>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Discount Factor (γ)</span>
                           <span className="font-mono text-cyan-300">0.99</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                           <div className="h-full bg-cyan-600 w-[99%]"></div>
                       </div>
                   </div>
                   
                   <div className="p-3 bg-slate-900/60 border border-slate-700 rounded-lg space-y-2">
                       <div className="flex items-center gap-2 text-xs text-slate-300 font-bold border-b border-slate-800 pb-1">
                           <Code size={12} /> Algorithm Stack
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                           <div>Core: <span className="text-white">PPO</span></div>
                           <div>Backbone: <span className="text-white">ResNet50</span></div>
                           <div>Fusion: <span className="text-white">Kalman</span></div>
                           <div>Env: <span className="text-white">Unity ML</span></div>
                       </div>
                   </div>

                   <div className="h-[120px] bg-black/40 border border-slate-800 rounded p-2 font-mono text-[9px] text-green-400 overflow-hidden relative">
                       <div className="absolute inset-0 opacity-10 bg-green-500/20"></div>
                       <div className="opacity-70">
                           {`> Epoch 418: Loss=0.042
> Validating... OK
> Obstacle Avoidance: 99.1%
> Path Optimality: 94.5%
> Saving Checkpoint...`}
                       </div>
                       <div className="animate-pulse">_</div>
                   </div>
               </div>
           </SciFiCard>

           <button className="w-full py-3 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/50 rounded text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-all group">
               <Terminal size={14} className="group-hover:text-white"/> 导出模型权重 (ONNX)
           </button>

        </div>

      </div>
    </div>
  );
};
