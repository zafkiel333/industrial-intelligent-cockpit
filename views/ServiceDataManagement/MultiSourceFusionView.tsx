
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Scatter, ScatterChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey, Cell, Legend
} from 'recharts';
import { 
  GitMerge, Database, Share2, Network, Cpu, 
  Layers, RefreshCw, Globe, Server, Activity, 
  Zap, FileJson, Link, Box, ArrowRightLeft, Radio, ShieldCheck
} from 'lucide-react';

export const MultiSourceFusionView: React.FC = () => {
  const [fusionLoad, setFusionLoad] = useState(0.7);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // --- Mock Data ---

  // 1. Ingestion Stats
  const inputStreams = [
    { id: 'src-iot', name: 'IoT 传感器流', type: 'MQTT/OPC', speed: '450 MB/s', status: 'stable', color: '#f472b6' },
    { id: 'src-erp', name: 'ERP 业务数据', type: 'REST/SQL', speed: '12 MB/s', status: 'syncing', color: '#3b82f6' },
    { id: 'src-log', name: '非结构化日志', type: 'Syslog', speed: '120 MB/s', status: 'burst', color: '#f59e0b' },
    { id: 'src-vid', name: '视觉视频流', type: 'RTSP', speed: '850 MB/s', status: 'stable', color: '#10b981' },
  ];

  // 2. Fusion Efficiency
  const fusionTrend = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    raw: 100 + Math.random() * 50 + (i > 10 ? 100 : 0),
    fused: 80 + Math.random() * 20 + (i > 10 ? 80 : 0),
    latency: 15 + Math.random() * 5
  }));

  // 3. API Consumption
  const apiConsumers = [
    { name: 'Digital Twin App', reqs: 4500, lat: 12 },
    { name: 'BI Dashboard', reqs: 1200, lat: 45 },
    { name: 'Mobile Field', reqs: 850, lat: 24 },
    { name: '3rd Party Audit', reqs: 120, lat: 150 },
  ];

  // 4. Data Lineage (Sankey-like data structure for custom rendering)
  const lineageSteps = [
    { stage: 'RAW_INGEST', count: '1.5 TB', quality: 'N/A' },
    { stage: 'CLEANING', count: '1.2 TB', quality: '92%' },
    { stage: 'MAPPING', count: '1.2 TB', quality: '98%' },
    { stage: 'ENRICHMENT', count: '1.4 TB', quality: '99%' },
    { stage: 'SERVING', count: 'API Ready', quality: '100%' },
  ];

  // Animation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setFusionLoad(0.5 + Math.random() * 0.4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#030008] p-2 overflow-hidden select-none">
      
      {/* 顶部：融合指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950/60 via-indigo-900/40 to-transparent border-b border-purple-500/30 rounded-t-xl backdrop-blur-md">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-purple-600/20 border border-purple-500/50 rounded-lg shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-pulse">
              <GitMerge className="text-purple-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据多源融合与共享中心</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-purple-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Network size={12}/> SOURCES: 142</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><RefreshCw size={12}/> FUSION RATE: 1.4 GB/s</span>
                 <span>|</span>
                 <span className="text-cyan-400 font-bold">UNIFIED SCHEMA: V4.0 ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">API 调用热度</span>
              <span className="text-xl font-mono font-black text-white">45.2 <span className="text-xs text-slate-500">k/min</span></span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">模型一致性</span>
              <span className="text-xl font-mono font-black text-emerald-400">99.8%</span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">融合延迟</span>
              <span className="text-xl font-mono font-black text-purple-400">12ms</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：输入源与协议适配 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Ingestion Stream */}
           <SciFiCard title="多源数据接入流" subtitle="INGESTION" className="flex-1 bg-purple-950/10 border-purple-900/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-full">
                 {inputStreams.map((src, i) => (
                    <div 
                       key={src.id}
                       onMouseEnter={() => setActiveSource(src.id)}
                       onMouseLeave={() => setActiveSource(null)}
                       className={`relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                          activeSource === src.id ? 'bg-purple-900/30 border-purple-500' : 'bg-slate-900/40 border-slate-800'
                       }`}
                    >
                       {/* Animated Flow Bar */}
                       <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                          <div 
                             className="h-full transition-all duration-1000 animate-pulse" 
                             style={{
                                width: '100%', 
                                backgroundColor: src.color,
                                animationDuration: `${2000 / parseInt(src.speed)}s`
                             }}
                          ></div>
                       </div>

                       <div className="flex justify-between items-start mb-2 relative z-10">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                             <Database size={12} style={{color: src.color}} /> {src.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                             src.status === 'burst' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>{src.status}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400 relative z-10">
                          <span className="font-mono">{src.type}</span>
                          <span className="font-mono text-white">{src.speed}</span>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-4 p-3 border border-dashed border-slate-700 rounded-xl bg-slate-900/20 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-purple-400 hover:border-purple-500/50 transition-all cursor-pointer">
                    <Link size={16} />
                    <span className="text-[10px] font-bold">配置新数据源接入</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Protocol Distribution */}
           <SciFiCard title="协议适配器状态" subtitle="ADAPTERS" className="h-1/3 border-purple-900/50">
              <div className="h-full flex flex-col justify-center gap-3">
                 <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400">OPC-UA</span>
                    <div className="flex gap-1">
                       {[1,1,1,1,1,0].map((v,i) => <div key={i} className={`w-3 h-1.5 rounded-sm ${v?'bg-emerald-500':'bg-slate-800'}`}></div>)}
                    </div>
                 </div>
                 <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400">Modbus TCP</span>
                    <div className="flex gap-1">
                       {[1,1,1,1,0,0].map((v,i) => <div key={i} className={`w-3 h-1.5 rounded-sm ${v?'bg-emerald-500':'bg-slate-800'}`}></div>)}
                    </div>
                 </div>
                 <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400">HTTP/REST</span>
                    <div className="flex gap-1">
                       {[1,1,1,1,1,1].map((v,i) => <div key={i} className={`w-3 h-1.5 rounded-sm ${v?'bg-emerald-500':'bg-slate-800'}`}></div>)}
                    </div>
                 </div>
                 <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400">CAN Bus</span>
                    <div className="flex gap-1">
                       {[1,1,1,0,0,0].map((v,i) => <div key={i} className={`w-3 h-1.5 rounded-sm ${v?'bg-yellow-500':'bg-slate-800'}`}></div>)}
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: The Fusion Reactor (Visual) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#05040a] border border-purple-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(168,85,247,0.1)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <Cpu className="text-purple-400" size={18} />
                    <span className="text-xs font-bold text-purple-100 uppercase tracking-widest">Unified Fusion Engine</span>
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">KERNEL_ID: FUSE-X992</div>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-4">
                 <svg className="w-full h-full" viewBox="0 0 600 400">
                    <defs>
                       <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                          <stop offset="40%" stopColor="#a855f7" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                       </radialGradient>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                    </defs>

                    {/* Rotating Rings */}
                    <g transform="translate(300, 200)">
                       {/* Outer Ring */}
                       <circle r="140" fill="none" stroke="#1e293b" strokeWidth="1" />
                       <path d="M -140 0 A 140 140 0 0 1 140 0" fill="none" stroke="#4c1d95" strokeWidth="2" strokeDasharray="20 10" className="animate-[spin_10s_linear_infinite]" />
                       
                       {/* Mid Ring */}
                       <circle r="100" fill="none" stroke="#334155" strokeWidth="1" />
                       <path d="M 0 -100 A 100 100 0 0 0 0 100" fill="none" stroke="#0ea5e9" strokeWidth="2" className="animate-[spin_6s_linear_infinite_reverse]" />

                       {/* Inner Core */}
                       <circle r="40" fill="url(#coreGrad)" filter="url(#glow)">
                          <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                       </circle>
                       
                       {/* Connecting Beams (Input) */}
                       {[0, 1, 2, 3].map(i => (
                          <line 
                             key={i}
                             x1={Math.cos(i*1.57)*180} y1={Math.sin(i*1.57)*180}
                             x2={Math.cos(i*1.57)*40} y2={Math.sin(i*1.57)*40}
                             stroke={inputStreams[i].color} strokeWidth="2" opacity="0.3"
                          />
                       ))}
                       
                       {/* Input Particles */}
                       {[0, 1, 2, 3].map(i => (
                          <circle key={`p-${i}`} r="3" fill={inputStreams[i].color}>
                             <animateMotion 
                                dur={`${1 + Math.random()}s`} 
                                repeatCount="indefinite"
                                path={`M ${Math.cos(i*1.57)*180} ${Math.sin(i*1.57)*180} L ${Math.cos(i*1.57)*40} ${Math.sin(i*1.57)*40}`}
                             />
                          </circle>
                       ))}

                       {/* Output Beams (Sharing) */}
                       <path d="M 40 0 L 250 -50" stroke="#a855f7" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
                       <path d="M 40 0 L 250 50" stroke="#a855f7" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
                       <circle r="2" fill="#fff">
                          <animateMotion dur="1s" repeatCount="indefinite" path="M 40 0 L 250 -50" />
                       </circle>
                       <circle r="2" fill="#fff">
                          <animateMotion dur="1.2s" repeatCount="indefinite" path="M 40 0 L 250 50" />
                       </circle>

                    </g>

                    {/* Stats Labels on SVG */}
                    <text x="300" y="380" textAnchor="middle" fill="#64748b" fontSize="10" letterSpacing="2">REAL-TIME FUSION KERNEL</text>
                 </svg>
              </div>

              {/* Bottom Load Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 w-64">
                 <div className="flex justify-between w-full text-[9px] text-purple-300">
                    <span>KERNEL LOAD</span>
                    <span>{(fusionLoad * 100).toFixed(0)}%</span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-500" style={{width: `${fusionLoad * 100}%`}}></div>
                 </div>
              </div>
           </div>

           {/* Fusion Trends */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    <Activity size={14} /> Throughput & Latency Trend
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fusionTrend}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="left" stroke="#a855f7" tick={{fontSize: 9}} label={{ value: 'Vol (GB)', angle: -90, position: 'insideLeft', fill: '#a855f7', fontSize: 9 }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 9}} label={{ value: 'Lat (ms)', angle: 90, position: 'insideRight', fill: '#0ea5e9', fontSize: 9 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="fused" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} name="Fused Volume" />
                       <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Latency" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right: Sharing & Value */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Downstream Consumers */}
           <SciFiCard title="数据共享服务拓扑" subtitle="CONSUMERS" className="flex-1 border-purple-900/50">
              <div className="space-y-4 pt-2">
                 {apiConsumers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border border-slate-800 bg-slate-900/40">
                       <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-800 rounded text-purple-400">
                             {i===0 ? <Box size={14}/> : i===1 ? <BarChart3 size={14}/> : i===2 ? <Radio size={14}/> : <ShieldCheck size={14}/>}
                          </div>
                          <div>
                             <div className="text-xs font-bold text-slate-200">{c.name}</div>
                             <div className="text-[9px] text-slate-500">{c.reqs} req/min</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className={`text-xs font-mono font-bold ${c.lat > 100 ? 'text-red-400' : 'text-green-400'}`}>{c.lat}ms</div>
                          <div className="text-[8px] text-slate-600 uppercase">Latency</div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-4 p-3 bg-purple-900/10 border border-purple-800/30 rounded flex items-center gap-3">
                 <Server size={18} className="text-purple-400" />
                 <div>
                    <div className="text-[10px] font-bold text-purple-200 uppercase">API Gateway Health</div>
                    <div className="text-[9px] text-slate-400 mt-1">
                       All endpoints operational. Rate limiting active on Node-3.
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* API Gateway Stats */}
           <SciFiCard title="共享服务鉴权审计" subtitle="SECURITY" className="border-purple-900/50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Auth Success</div>
                    <div className="text-lg font-bold text-green-400">99.9%</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Blocked</div>
                    <div className="text-lg font-bold text-red-400">142</div>
                 </div>
              </div>
              <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded text-[10px] text-purple-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                 <FileJson size={12} /> 查看调用日志
              </button>
           </SciFiCard>

        </div>

      </div>

      {/* Bottom: Lineage Flow (Simplified Visual) */}
      <div className="h-24 bg-slate-900/30 border border-slate-800 rounded-xl flex items-center px-6 gap-4">
         <div className="text-[10px] font-bold text-slate-400 uppercase w-24">Data Value Chain</div>
         <div className="flex-1 flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -z-10"></div>
            
            {lineageSteps.map((step, i) => (
               <div key={i} className="flex flex-col items-center gap-2 bg-[#030008] px-2 z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                     i === lineageSteps.length-1 ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'border-purple-500 bg-purple-900/20 text-purple-400'
                  }`}>
                     <span className="text-[10px] font-bold">{i+1}</span>
                  </div>
                  <div className="text-center">
                     <div className="text-[10px] font-bold text-slate-200">{step.stage}</div>
                     <div className="text-[9px] text-slate-500">{step.count}</div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

// Helper Icon for BarChart3 import fix
const BarChart3 = ({size, className}: {size?:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);
