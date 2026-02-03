
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ReferenceLine, LineChart, Line, Legend, BarChart, Bar, Cell
} from 'recharts';
import { 
  Waves, AlertTriangle, ShieldAlert, ArrowRight, 
  Activity, Settings, Info, GripHorizontal, 
  Trash2, Wind, RefreshCw, FileText
} from 'lucide-react';

// --- MOCK DATA ---

// Theoretical Head Loss Curves (H = k * Q^2)
const FLOW_RANGE = Array.from({length: 20}, (_, i) => i * 50 + 100); // 100 to 1050 m3/s

const HEAD_LOSS_DATA = FLOW_RANGE.map(q => {
    const v = q / 100; // Simplified velocity proxy
    return {
        flow: q,
        clean: 0.05 * Math.pow(v, 2),        // K=0.05
        blocked10: 0.08 * Math.pow(v, 2),    // 10% Blocked
        blocked30: 0.2 * Math.pow(v, 2),     // 30% Blocked
        blocked50: 0.6 * Math.pow(v, 2),     // 50% Blocked
    };
});

const THRESHOLDS = [
    { level: 'I', label: '正常运行 (Normal)', range: '0 - 2.0 m', color: '#10b981', action: '定期巡检' },
    { level: 'II', label: '预警值 (Warning)', range: '2.0 - 3.5 m', color: '#f59e0b', action: '启动清污机' },
    { level: 'III', label: '报警值 (Alarm)', range: '3.5 - 5.0 m', color: '#f97316', action: '减负荷运行' },
    { level: 'IV', label: '停机值 (Trip)', range: '> 5.0 m', color: '#ef4444', action: '紧急停机' },
];

const DEBRIS_TYPES = [
    { name: '树枝木材', value: 45, color: '#854d0e' },
    { name: '生活垃圾', value: 25, color: '#64748b' },
    { name: '水草浮萍', value: 20, color: '#10b981' },
    { name: '冰凌雪块', value: 10, color: '#0ea5e9' },
];

// --- SVG COMPONENTS ---

const RackSchematic = ({ deltaP, flow, blockage }: { deltaP: number, flow: number, blockage: number }) => {
    // Visual calculation
    const waterBase = 150;
    const drop = Math.min(80, deltaP * 15); // Scale deltaP for visual
    
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c1220] rounded border border-slate-700/50">
            <svg viewBox="0 0 400 250" className="w-full h-full">
                <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9"/>
                    </linearGradient>
                    <pattern id="gridPat" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1"/>
                    </pattern>
                </defs>
                
                {/* Background Grid */}
                <rect width="400" height="250" fill="url(#gridPat)" />

                {/* Structure: Concrete Piers */}
                <path d="M0,0 L180,0 L180,40 L160,250 L0,250 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
                <path d="M220,0 L400,0 L400,250 L240,250 L220,40 Z" fill="#334155" stroke="#475569" strokeWidth="2" />

                {/* Trash Rack (Grid Lines) */}
                <g transform="translate(195, 40)">
                    <rect x="0" y="0" width="10" height="210" fill="#475569" />
                    {/* Horizontal Bars */}
                    {Array.from({length: 10}).map((_, i) => (
                        <line key={i} x1="0" y1={i*20} x2="10" y2={i*20} stroke="#94a3b8" strokeWidth="2" />
                    ))}
                    {/* Debris Clumps */}
                    {blockage > 20 && <circle cx="5" cy="50" r="12" fill="#5c4033" opacity="0.8" />}
                    {blockage > 40 && <circle cx="2" cy="120" r="15" fill="#3f6212" opacity="0.8" />}
                    {blockage > 60 && <circle cx="8" cy="180" r="18" fill="#1e293b" opacity="0.8" />}
                </g>

                {/* Water Upstream */}
                <path d={`M0,${waterBase} L195,${waterBase} L195,250 L0,250 Z`} fill="url(#waterGrad)" />
                <line x1="0" y1={waterBase} x2="195" y2={waterBase} stroke="#bae6fd" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />

                {/* Water Downstream (Lower) */}
                <path d={`M205,${waterBase + drop} L400,${waterBase + drop} L400,250 L205,250 Z`} fill="url(#waterGrad)" />
                <line x1="205" y1={waterBase + drop} x2="400" y2={waterBase + drop} stroke="#bae6fd" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />

                {/* Differential Marker */}
                <g transform={`translate(280, ${waterBase})`}>
                    <line x1="-100" y1="0" x2="20" y2="0" stroke="#facc15" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="-20" y1={drop} x2="20" y2={drop} stroke="#facc15" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="10" y1="0" x2="10" y2={drop} stroke="#facc15" strokeWidth="2" markerEnd="url(#arrow)" />
                    <text x="15" y={drop/2 + 5} fill="#facc15" fontSize="12" fontWeight="bold">ΔH = {deltaP.toFixed(2)}m</text>
                </g>

                {/* Flow Particles */}
                {Array.from({length: 5}).map((_, i) => (
                    <circle key={i} r="2" fill="#fff" opacity="0.6">
                        <animateMotion 
                            dur={`${2 - flow/1000}s`} 
                            repeatCount="indefinite" 
                            path={`M20,${waterBase + 50 + i*30} L180,${waterBase + 50 + i*30} L220,${waterBase + 50 + i*30 + drop} L380,${waterBase + 50 + i*30 + drop}`}
                            begin={`${i * 0.5}s`}
                        />
                    </circle>
                ))}
            </svg>
        </div>
    );
};

export const TrashRackThresholdView: React.FC = () => {
  const [simFlow, setSimFlow] = useState(600); // m3/s
  const [simBlockage, setSimBlockage] = useState(10); // %
  
  // Calculate Head Loss based on simplified physical model: H = K * Q^2
  // K increases exponentially with blockage
  const kBase = 0.000005; 
  const kBlock = Math.pow(1 + simBlockage / 20, 2); 
  const currentDeltaP = kBase * kBlock * Math.pow(simFlow, 2) / 100; // Adjusted for visual scale (approx 0-6m)

  // Determine Alert Level
  const alertLevel = THRESHOLDS.find((t, i) => {
      const next = THRESHOLDS[i+1];
      // Simple logic: check if value < upper limit of current range. 
      // Limits are 2.0, 3.5, 5.0
      if (currentDeltaP <= 2.0) return t.level === 'I';
      if (currentDeltaP <= 3.5) return t.level === 'II';
      if (currentDeltaP <= 5.0) return t.level === 'III';
      return t.level === 'IV';
  });

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#080c14] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-black pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-900/30 border-2 border-blue-500 rounded flex items-center justify-center relative">
             <GripHorizontal size={32} className="text-blue-400" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 border border-blue-500 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldAlert size={12} /> Hydraulic Safety Standard
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               进水口拦污栅 <span className="text-blue-500 italic">压差阈值标准库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Standard</div>
                <div className="text-lg font-mono font-bold text-white">DL/T 5077-1997</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Safety Margin</div>
                <div className="text-2xl font-mono font-black text-green-400">
                    {Math.max(0, 5.0 - currentDeltaP).toFixed(2)} m
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Real-time Simulation --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="压差实时监测仿真" subtitle="SIMULATION" className="h-[300px] border-blue-900/30 bg-[#0b1221]/90" noPadding>
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 relative">
                      <RackSchematic deltaP={currentDeltaP} flow={simFlow} blockage={simBlockage} />
                      
                      {/* Overlay Status */}
                      <div className={`absolute top-2 left-2 px-3 py-1 rounded border backdrop-blur-md flex items-center gap-2
                          ${alertLevel?.color === '#10b981' ? 'bg-green-900/40 border-green-500 text-green-300' : 
                            alertLevel?.color === '#ef4444' ? 'bg-red-900/40 border-red-500 text-red-300 animate-pulse' : 
                            'bg-yellow-900/40 border-yellow-500 text-yellow-300'}
                      `}>
                          <Activity size={14} />
                          <span className="font-bold text-sm">LEVEL {alertLevel?.level}</span>
                      </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="mt-2 grid grid-cols-1 gap-3 bg-slate-900/50 p-3 rounded border border-slate-800">
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                              <span>过栅流量 (Flow)</span>
                              <span className="text-cyan-400 font-mono">{simFlow} m³/s</span>
                          </div>
                          <input 
                            type="range" min="100" max="1000" step="10" 
                            value={simFlow} 
                            onChange={(e) => setSimFlow(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                      </div>
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                              <span>污物堵塞率 (Blockage)</span>
                              <span className="text-orange-400 font-mono">{simBlockage}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="80" step="5" 
                            value={simBlockage} 
                            onChange={(e) => setSimBlockage(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="当前状态评估" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full justify-center">
                   <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="flex items-center gap-3">
                           <div className="p-2 rounded bg-slate-800 text-slate-400"><Waves size={20}/></div>
                           <div>
                               <div className="text-xs text-slate-500">Current ΔH</div>
                               <div className="text-2xl font-bold text-white font-mono">{currentDeltaP.toFixed(3)} m</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-xs text-slate-500">Design Max</div>
                           <div className="text-sm font-bold text-slate-300 font-mono">6.000 m</div>
                       </div>
                   </div>

                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className="p-2 rounded bg-slate-800 text-slate-400"><Wind size={20}/></div>
                           <div>
                               <div className="text-xs text-slate-500">Velocity V</div>
                               <div className="text-xl font-bold text-white font-mono">{(simFlow/200).toFixed(2)} m/s</div>
                           </div>
                       </div>
                       <div className="h-10 w-1 bg-slate-700"></div>
                       <div className="text-right">
                            <div className="text-xs text-slate-500">Head Loss Coeff</div>
                            <div className="text-sm font-bold text-blue-400 font-mono">ξ = {(currentDeltaP / Math.pow(simFlow/200, 2)).toFixed(2)}</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Theoretical Analysis --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           <SciFiCard title="水头损失特性曲线 (Head Loss Characteristic)" subtitle="THEORETICAL MODEL" className="flex-1 border-blue-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={HEAD_LOSS_DATA} margin={{top: 20, right: 20, bottom: 20, left: 10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="flow" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Flow Q (m³/s)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Head Loss (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} domain={[0, 6]} />
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                           
                           <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="5 5" label={{value: 'Warn', fill: '#f59e0b', fontSize: 10}} />
                           <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="5 5" label={{value: 'Trip', fill: '#ef4444', fontSize: 10}} />
                           
                           <Line type="monotone" dataKey="clean" stroke="#10b981" name="Clean Rack" strokeWidth={2} dot={false} />
                           <Line type="monotone" dataKey="blocked30" stroke="#f59e0b" name="30% Blocked" strokeWidth={2} dot={false} />
                           <Line type="monotone" dataKey="blocked50" stroke="#ef4444" name="50% Blocked" strokeWidth={2} dot={false} />
                           
                           {/* Current Operating Point */}
                           <ReferenceLine x={simFlow} stroke="#fff" strokeDasharray="2 2" />
                           {/* This would be better as a Scatter, but mixing Line/Scatter in Recharts can be tricky with types in TS sometimes. Using ReferenceDot approach via a separate layer or just ReferenceLine crossing. */}
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <div className="h-[240px] grid grid-cols-2 gap-4">
               <SciFiCard title="污物成分统计" subtitle="COMPOSITION" className="border-slate-800">
                   <div className="w-full h-full p-2 flex items-center">
                       <div className="flex-1 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={DEBRIS_TYPES} layout="vertical">
                                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b"/>
                                   <XAxis type="number" hide />
                                   <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={60} />
                                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a'}} />
                                   <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                                       {DEBRIS_TYPES.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.color} />
                                       ))}
                                   </Bar>
                               </BarChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </SciFiCard>
               
               <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col justify-center gap-4">
                   <div className="flex items-start gap-3">
                       <Trash2 size={24} className="text-slate-500" />
                       <div>
                           <div className="text-xs font-bold text-white">清污机状态</div>
                           <div className="text-[10px] text-slate-400">TRM-02 (Gantry Type)</div>
                           <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded mt-1 inline-block">Standby</span>
                       </div>
                   </div>
                   <div className="h-[1px] bg-slate-800 w-full"></div>
                   <div className="flex items-start gap-3">
                       <RefreshCw size={24} className="text-slate-500" />
                       <div>
                           <div className="text-xs font-bold text-white">上次清污时间</div>
                           <div className="text-[10px] text-slate-400">2024-03-20 08:30</div>
                       </div>
                   </div>
               </div>
           </div>

        </div>

        {/* --- RIGHT: Standards & Guidelines --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="压差阈值矩阵" subtitle="SAFETY LIMITS" className="flex-1 border-blue-900/30">
               <div className="flex flex-col gap-0 border border-slate-800 rounded overflow-hidden">
                   <div className="flex bg-slate-800 p-2 text-[10px] font-bold text-slate-400 uppercase">
                       <div className="w-12">Level</div>
                       <div className="w-24">Range</div>
                       <div className="flex-1">Required Action</div>
                   </div>
                   {THRESHOLDS.map((t, i) => (
                       <div key={i} className={`flex items-center p-3 border-b border-slate-800/50 last:border-0 transition-colors
                           ${alertLevel?.level === t.level ? 'bg-white/5' : ''}
                       `}>
                           <div className="w-12 font-bold" style={{color: t.color}}>{t.level}</div>
                           <div className="w-24 text-xs font-mono text-slate-300">{t.range}</div>
                           <div className="flex-1 text-[10px] text-slate-400 bg-black/20 p-1.5 rounded border border-slate-700/50 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: t.color}}></div>
                               {t.action}
                           </div>
                       </div>
                   ))}
               </div>
               
               <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded">
                   <div className="flex items-center gap-2 mb-2">
                       <Info size={16} className="text-blue-400" />
                       <span className="text-xs font-bold text-blue-200">标准说明 (GB/T 15468)</span>
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed">
                       压差阈值设定需考虑栅条结构强度及机组允许的吸出高度减少量。当压差超过 4m 时，可能导致栅条屈服变形，甚至被吸入流道损坏水轮机。
                   </p>
               </div>
           </SciFiCard>

           <SciFiCard title="应急处置预案" subtitle="SOP" className="h-[280px] border-slate-800">
               <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700 py-2">
                   {[
                       { step: 1, title: '监测确认', desc: '确认压差传感器读数，排除仪表故障。' },
                       { step: 2, title: '减负荷', desc: '若压差 >3.5m，立即降低机组出力，减小过流量。' },
                       { step: 3, title: '启动清污', desc: '投入自动清污机进行全断面清污作业。' },
                       { step: 4, title: '停机检查', desc: '若清污无效且压差 >5m，申请停机进行潜水排查。' },
                   ].map((s) => (
                       <div key={s.step} className="relative">
                           <div className="absolute -left-[13px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-[8px] text-white">
                               {s.step}
                           </div>
                           <div className="text-xs font-bold text-slate-200 mb-0.5">{s.title}</div>
                           <div className="text-[10px] text-slate-500">{s.desc}</div>
                       </div>
                   ))}
               </div>
               
               <button className="mt-auto w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold border border-red-900/50 rounded flex items-center justify-center gap-2 transition-colors">
                   <AlertTriangle size={12} /> 上报压差异常事件
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
