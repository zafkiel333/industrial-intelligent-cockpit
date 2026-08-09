import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { UnifiedGovernanceThreeScene } from '../../components/ServiceDataManagement/UnifiedGovernance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[int-1]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/int-1';
import { DomainType } from '../../components/ServiceDataManagement/UnifiedGovernance/three-types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Sankey, AreaChart, Area
} from 'recharts';
import { 
  Database, Server, ShieldCheck, Filter, Globe, 
  GitMerge, Box, FileJson, Activity, Zap, CheckCircle2, 
  AlertTriangle, RefreshCw, Layers
} from 'lucide-react';

export const UnifiedGovernanceView: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<DomainType | null>(null);
  const [processingLoad, setProcessingLoad] = useState(0.6);

  // Stats
  const globalStats = [
    { label: 'Data Lake Volume', val: '42.8 PB', icon: Database, color: 'text-purple-400' },
    { label: 'Ingestion Rate', val: '1.2 GB/s', icon: Activity, color: 'text-green-400' },
    { label: 'Unified Models', val: '845', icon: Box, color: 'text-blue-400' },
    { label: 'API Calls (24h)', val: '12.5 M', icon: Globe, color: 'text-cyan-400' },
  ];

  // Mock Logs
  const governanceLogs = [
    { time: '10:42:01', domain: 'MINING', action: 'PROTOCOL_ADAPT', msg: 'Convert Modbus RTU to MQTT JSON', status: 'OK' },
    { time: '10:42:05', domain: 'SHIPPING', action: 'DATA_CLEAN', msg: 'Remove GPS drift outliers (>50m)', status: 'OK' },
    { time: '10:42:12', domain: 'HYDRO', action: 'TIME_ALIGN', msg: 'Sync sensor timestamps to NTP stratum 1', status: 'OK' },
    { time: '10:42:18', domain: 'MINING', action: 'SCHEMA_VALID', msg: 'Field "vibration_x" missing type definition', status: 'WARN' },
    { time: '10:42:25', domain: 'CORE', action: 'AGGREGATE', msg: 'Generated hourly summary for Region-North', status: 'OK' },
  ];

  const filteredLogs = activeDomain 
    ? governanceLogs.filter(l => l.domain === activeDomain.toUpperCase() || l.domain === 'CORE')
    : governanceLogs;

  // Data Quality Metrics
  const qualityData = [
    { name: '完整性', mining: 92, shipping: 88, hydro: 95 },
    { name: '一致性', mining: 85, shipping: 90, hydro: 92 },
    { name: '及时性', mining: 98, shipping: 75, hydro: 96 },
    { name: '准确性', mining: 94, shipping: 92, hydro: 98 },
  ];

  // Ingestion Trend
  const ingestionTrend = Array.from({length: 20}, (_, i) => ({
    time: i,
    mining: 40 + Math.random() * 20,
    shipping: 30 + Math.random() * 15,
    hydro: 20 + Math.random() * 10
  }));

  // Protocols
  const protocolDistribution = [
    { name: 'OPC-UA', value: 35, color: '#f59e0b' },
    { name: 'MQTT', value: 25, color: '#3b82f6' },
    { name: 'Modbus', value: 20, color: '#ef4444' },
    { name: 'IEC-104', value: 15, color: '#06b6d4' },
    { name: 'RestAPI', value: 5, color: '#8b5cf6' },
  ];

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setProcessingLoad(0.4 + Math.random() * 0.4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#030005] p-2 overflow-hidden select-none">
      
      {/* 顶部：统一治理指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-purple-950/20 border-b border-purple-500/20 rounded-t-xl backdrop-blur-md">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse">
              <GitMerge className="text-purple-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">矿山航运水利装备服务数据统一汇聚与治理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-purple-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Server size={12}/> CLUSTER: UNIFIED_CORE_01</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><ShieldCheck size={12}/> GOVERNANCE: ENFORCED</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">HEALTH: 98.2%</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           {globalStats.map((s, i) => (
              <div key={i} className="text-right">
                 <div className="text-[9px] text-slate-500 uppercase font-bold flex items-center justify-end gap-1">
                    <s.icon size={10} className={s.color.replace('text-', 'text-opacity-50 ')} /> {s.label}
                 </div>
                 <div className={`text-xl font-mono font-black ${s.color}`}>{s.val}</div>
              </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：接入源与协议 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Ingestion Monitor */}
           <SciFiCard title="多源异构数据接入" subtitle="INGESTION" className="flex-1 bg-[#0a0514]/80 border-purple-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ingestionTrend} stackOffset="expand">
                       <defs>
                          <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorShip" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#050308', border: '1px solid #7c3aed', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="mining" stackId="1" stroke="#f59e0b" fill="url(#colorMin)" />
                       <Area type="monotone" dataKey="shipping" stackId="1" stroke="#3b82f6" fill="url(#colorShip)" />
                       <Area type="monotone" dataKey="hydro" stackId="1" stroke="#06b6d4" fill="url(#colorHydro)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-400">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Mining</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Shipping</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div> Hydro</span>
              </div>
           </SciFiCard>

           {/* Protocol Distribution */}
           <SciFiCard title="协议适配分布" subtitle="ADAPTERS" className="border-purple-900/50">
              <div className="flex items-center gap-4 h-40">
                 <div className="h-full w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={protocolDistribution} 
                            innerRadius={30} 
                            outerRadius={50} 
                            paddingAngle={5} 
                            dataKey="value" 
                            stroke="none"
                          >
                             {protocolDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#050308', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex-1 space-y-1">
                    {protocolDistribution.map((p, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: p.color}}></div>
                             {p.name}
                          </span>
                          <span className="font-mono text-white">{p.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：融合核心 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0f0718] to-[#020205] border border-purple-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(147,51,234,0.1)]">
              {/* HUD: Active Domain Info */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-purple-500/20 pb-2 mb-2">
                       <Layers className="text-purple-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Domain</div>
                          <div className="text-sm font-black text-white uppercase">{activeDomain ? activeDomain : 'GLOBAL VIEW'}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                       <div>Load: <span className="text-white">{(processingLoad * 100).toFixed(0)}%</span></div>
                       <div>Latency: <span className="text-emerald-400">12ms</span></div>
                       <div className="col-span-2 text-purple-300 border-t border-white/10 pt-1 mt-1">
                          Status: Normalizing Data Models...
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <UnifiedGovernanceThreeScene
                 activeDomain={activeDomain}
                 onDomainSelect={setActiveDomain}
                 globalProcessingLoad={processingLoad}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-purple-500/30">
                    <RefreshCw size={12} className="text-purple-400 animate-spin" />
                    <span className="text-[10px] text-purple-100 font-bold">LIVE ETL PIPELINE</span>
                 </div>
              </div>
           </div>

           {/* Governance Logs */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    <FileJson size={14} /> Governance Execution Log
                 </div>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {filteredLogs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors items-center">
                       <span className="text-slate-600 w-12">[{log.time}]</span>
                       <span className={`w-16 font-bold ${
                          log.domain === 'MINING' ? 'text-amber-500' : 
                          log.domain === 'SHIPPING' ? 'text-blue-500' : 
                          log.domain === 'HYDRO' ? 'text-cyan-500' : 'text-purple-500'
                       }`}>{log.domain}</span>
                       <span className="text-slate-300 w-24">[{log.action}]</span>
                       <span className="flex-1 text-slate-400 truncate">{log.msg}</span>
                       {log.status === 'WARN' ? <AlertTriangle size={10} className="text-yellow-500" /> : <CheckCircle2 size={10} className="text-green-500" />}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：质量与价值 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Data Quality */}
           <SciFiCard title="数据质量多维评估" subtitle="DQ SCORE" className="flex-1 border-purple-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityData} layout="vertical" margin={{left: 10, right: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" horizontal={false} />
                       <XAxis type="number" domain={[0, 100]} hide />
                       <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={40} />
                       <Tooltip contentStyle={{backgroundColor: '#050308', border: 'none', fontSize: '10px'}} />
                       <Bar dataKey="mining" stackId="a" fill="#f59e0b" radius={[0, 2, 2, 0]} barSize={8} name="Mining" />
                       <Bar dataKey="shipping" stackId="b" fill="#3b82f6" radius={[0, 2, 2, 0]} barSize={8} name="Shipping" />
                       <Bar dataKey="hydro" stackId="c" fill="#06b6d4" radius={[0, 2, 2, 0]} barSize={8} name="Hydro" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Value Generation */}
           <SciFiCard title="数据服务价值产出" subtitle="API SERVICES" className="border-purple-900/50">
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Predictive Maint. API</div>
                    <div className="text-xs font-bold text-white">4.2M Req/d</div>
                 </div>
                 <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Energy Opt. Model</div>
                    <div className="text-xs font-bold text-white">1.8M Req/d</div>
                 </div>
                 <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Digital Twin Sync</div>
                    <div className="text-xs font-bold text-white">850k Req/d</div>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-purple-700/20 hover:bg-purple-600/30 border border-purple-600/40 rounded text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                 <Zap size={12} /> Access Service Catalog
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};