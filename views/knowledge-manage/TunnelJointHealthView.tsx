
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/tunnel-joint/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-tunnel-joint]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-tunnel-joint';
import { JointHealthState } from '../../components/knowledge-manage/tunnel-joint/three-types';
import { 
  Activity, Minimize2, Maximize2, Waves, 
  GitCommit, AlertTriangle, ArrowRight, 
  Thermometer, Ruler, Database, ScanLine,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

// GINA Compression Profile (12 points around the ring)
const COMPRESSION_PROFILE = [
  { angle: '0° (Top)', val: 95, limit: 100 },
  { angle: '30°', val: 92, limit: 100 },
  { angle: '60°', val: 88, limit: 100 },
  { angle: '90° (Right)', val: 85, limit: 100 },
  { angle: '120°', val: 88, limit: 100 },
  { angle: '150°', val: 91, limit: 100 },
  { angle: '180° (Bot)', val: 98, limit: 100 }, // Higher at bottom due to weight?
  { angle: '210°', val: 92, limit: 100 },
  { angle: '240°', val: 89, limit: 100 },
  { angle: '270° (Left)', val: 84, limit: 100 },
  { angle: '300°', val: 88, limit: 100 },
  { angle: '330°', val: 93, limit: 100 },
];

// Settlement History (1 year)
const SETTLEMENT_DATA = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    diff: 2 + Math.sin(i*0.5) * 1.5 + Math.random()*0.5, // mm
    limit: 10
}));

// Real-time Sensors
const SENSOR_STREAM = Array.from({length: 20}, (_, i) => ({
    time: i,
    waterPres: 0.35 + Math.random()*0.01, // MPa
    temp: 14 + Math.sin(i*0.2)*0.5
}));

// Joint List
const JOINT_LIST = Array.from({length: 33}, (_, i) => ({
    id: `E${i+1}-E${i+2}`,
    status: i === 15 ? 'Warning' : 'Normal',
    opening: (40 + Math.random() * 5).toFixed(1)
}));

export const TunnelJointHealthView: React.FC = () => {
  const [activeJoint, setActiveJoint] = useState('E15-E16');
  const [simState, setSimState] = useState<JointHealthState>('HEALTHY');
  const [openingVal, setOpeningVal] = useState(42.5);

  // Simulation
  useEffect(() => {
      const interval = setInterval(() => {
          if (simState === 'COMPRESSION') {
              setOpeningVal(prev => Math.max(20, prev - 0.5));
          } else if (simState === 'EXPANSION') {
              setOpeningVal(prev => Math.min(80, prev + 0.5));
          } else {
              setOpeningVal(prev => 42.5 + Math.sin(Date.now()/1000)*0.5);
          }
      }, 100);
      return () => clearInterval(interval);
  }, [simState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#22d3ee_0%,_transparent_70%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-sm flex items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.3)]">
             <GitCommit size={30} className="text-cyan-400" />
             <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> IMT Structural Health Monitoring
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水下沉管接头 <span className="text-cyan-500 italic">健康诊断模型</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Joint</div>
                <div className="text-2xl font-mono font-black text-white">{activeJoint}</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Health Score</div>
                <div className="text-2xl font-mono font-black text-emerald-400">96.5</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Joint Selector --- */}
        <div className="w-[280px] flex flex-col gap-4 bg-[#080c14]/90 border-r border-slate-800/50">
           <div className="p-3 border-b border-slate-800 bg-slate-900/50">
               <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                   <Database size={12}/> Tunnel Topology
               </div>
               <input type="text" placeholder="Search Joint ID..." className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-cyan-500 outline-none" />
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
               {JOINT_LIST.map(j => (
                   <div 
                     key={j.id}
                     onClick={() => { setActiveJoint(j.id); setSimState('HEALTHY'); }}
                     className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-all
                        ${activeJoint === j.id ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-transparent border-slate-800 hover:bg-slate-800'}
                     `}
                   >
                       <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${j.status === 'Warning' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                           <span className={`text-sm font-bold ${activeJoint === j.id ? 'text-white' : 'text-slate-400'}`}>{j.id}</span>
                       </div>
                       <span className="text-[10px] font-mono text-slate-500">{j.opening}mm</span>
                   </div>
               ))}
           </div>
        </div>

        {/* --- CENTER: 3D Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               
               {/* 3D Scene */}
               <ThreeScene state={simState} />
               <div className="absolute bottom-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlays HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-xl w-64">
                       <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Ruler size={12}/> Joint Opening (E)
                       </div>
                       <div className="text-3xl font-black text-white font-mono">{openingVal.toFixed(2)} <span className="text-sm font-normal text-slate-400">mm</span></div>
                       <div className="w-full h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                           <div className="h-full bg-cyan-500 transition-all duration-100" style={{width: `${(openingVal/100)*100}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Status Alert */}
               {simState !== 'HEALTHY' && (
                   <div className="absolute top-4 right-4 bg-red-900/80 border border-red-500 p-3 rounded backdrop-blur animate-pulse z-20 flex items-center gap-3">
                       <AlertTriangle className="text-white" size={24} />
                       <div>
                           <div className="text-xs font-bold text-red-100">DIAGNOSIS ALERT</div>
                           <div className="text-sm font-black text-white">{simState}</div>
                       </div>
                   </div>
               )}

               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/80 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   {[
                       { id: 'HEALTHY', label: '正常' },
                       { id: 'COMPRESSION', label: '受压(升温)' },
                       { id: 'EXPANSION', label: '张开(降温)' },
                       { id: 'SHEAR_STRESS', label: '剪切(沉降)' },
                       { id: 'LEAK_WARN', label: '渗漏模拟' },
                   ].map(mode => (
                       <button 
                         key={mode.id}
                         onClick={() => setSimState(mode.id as JointHealthState)}
                         className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all
                            ${simState === mode.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                         `}
                       >
                           {mode.label}
                       </button>
                   ))}
               </div>
           </div>

           {/* Bottom: Trends */}
           <div className="h-[180px] grid grid-cols-2 gap-4">
               <SciFiCard title="接头差异沉降趋势 (12 Months)" subtitle="SETTLEMENT" className="border-cyan-900/30" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={SETTLEMENT_DATA}>
                               <defs>
                                   <linearGradient id="settleGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} unit="mm" />
                               <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#f59e0b'}} />
                               <ReferenceLine y={10} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                               <Area type="monotone" dataKey="diff" stroke="#f59e0b" fill="url(#settleGrad)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="环境参数实时流" subtitle="SENSORS" className="border-cyan-900/30" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={SENSOR_STREAM}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="time" hide />
                               <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} domain={[0.3, 0.4]} />
                               <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 10}} domain={[10, 20]} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0e14'}} />
                               <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                               <Line yAxisId="left" type="monotone" dataKey="waterPres" stroke="#0ea5e9" name="水压 (MPa)" dot={false} strokeWidth={2} />
                               <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#10b981" name="管内温 (°C)" dot={false} strokeWidth={2} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Diagnostics --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="GINA 止水带压缩分布" subtitle="RADAR SCAN" className="h-[320px] border-cyan-900/30">
               <div className="w-full h-full p-2 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPRESSION_PROFILE}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="angle" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[60, 110]} tick={false} axisLine={false} />
                           <Radar name="Compression %" dataKey="val" stroke="#22d3ee" strokeWidth={2} fill="#22d3ee" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#22d3ee'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   
                   <div className="absolute top-2 right-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-400">
                       <div className="flex justify-between gap-4"><span>Avg Comp:</span> <span className="text-white font-bold">90.5%</span></div>
                       <div className="flex justify-between gap-4"><span>Eccentricity:</span> <span className="text-green-400 font-bold">Low</span></div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="诊断报告与建议" subtitle="AI REPORT" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full">
                   <div className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-xl">
                       <div className="flex items-center gap-2 mb-2 text-cyan-400">
                           <FileText size={16} /> <span className="text-xs font-bold">当前状态分析</span>
                       </div>
                       <p className="text-[11px] text-slate-300 leading-relaxed">
                           接头 E15-E16 整体状态良好。GINA 止水带压缩量均匀，未发现明显偏压。差异沉降速率为 0.05mm/月，处于收敛稳定期。
                       </p>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1">
                           <span>Upcoming Maintenance</span>
                       </div>
                       <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded transition-colors cursor-pointer">
                           <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                           <span className="text-xs text-slate-300">二次止水带注浆检查</span>
                           <span className="text-[10px] text-slate-500 ml-auto">15 Days</span>
                       </div>
                       <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded transition-colors cursor-pointer">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                           <span className="text-xs text-slate-300">剪力键间隙测量</span>
                           <span className="text-[10px] text-slate-500 ml-auto">30 Days</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
