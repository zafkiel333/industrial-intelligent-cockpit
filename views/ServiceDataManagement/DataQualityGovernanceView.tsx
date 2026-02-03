
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ShieldCheck, AlertOctagon, Filter, Database, 
  FileCheck, RefreshCw, Layers, Binary, 
  CheckCircle2, XCircle, Search, GitBranch,
  Terminal, Activity, Zap, Settings
} from 'lucide-react';

export const DataQualityGovernanceView: React.FC = () => {
  const [activeStage, setActiveStage] = useState('validation');
  const [pipelineSpeed, setPipelineSpeed] = useState(1);
  
  // --- Mock Data ---

  // 1. Overall Quality Score
  const qualityScore = 92.4;

  // 2. Six Dimensions Radar
  const qualityDimensions = [
    { subject: '完整性 (Completeness)', A: 95, fullMark: 100 },
    { subject: '准确性 (Accuracy)', A: 88, fullMark: 100 },
    { subject: '一致性 (Consistency)', A: 92, fullMark: 100 },
    { subject: '及时性 (Timeliness)', A: 98, fullMark: 100 },
    { subject: '唯一性 (Uniqueness)', A: 100, fullMark: 100 },
    { subject: '有效性 (Validity)', A: 85, fullMark: 100 },
  ];

  // 3. Data Volume & Error Trend
  const trendData = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    volume: 5000 + Math.sin(i*0.5)*2000,
    errors: 100 + Math.random() * 50
  }));

  // 4. Governance Logs (Anomaly Detection)
  const logs = [
    { id: 'ERR-9021', time: '10:42:05', field: 'temp_val', issue: 'Out of Range (>1200)', status: 'Quarantined' },
    { id: 'ERR-9022', time: '10:42:08', field: 'device_id', issue: 'Null Value', status: 'Auto-Filled' },
    { id: 'ERR-9023', time: '10:42:15', field: 'timestamp', issue: 'Future Date', status: 'Rejected' },
    { id: 'ERR-9024', time: '10:42:30', field: 'pressure', issue: 'Type Mismatch', status: 'Quarantined' },
  ];

  // 5. Rules Engine
  const activeRules = [
    { name: 'ISO-8601 日期格式校验', type: 'Syntax', impact: 'High' },
    { name: '主键唯一性约束 (UUID)', type: 'Structure', impact: 'Critical' },
    { name: '传感器物理极值过滤', type: 'Business', impact: 'Medium' },
    { name: '多源数据时间戳对齐', type: 'Consistency', impact: 'High' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-cyan-50 bg-[#020810] p-2 overflow-hidden select-none">
      
      {/* 顶部：治理指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/40 via-blue-900/20 to-transparent border-b border-cyan-500/30 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/10 border border-cyan-500/40 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.2)] animate-pulse">
              <ShieldCheck className="text-cyan-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据质量评估与治理中心</h1>
              <div className="flex items-center gap-6 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Database size={12}/> PROCESSED: 45.2 TB</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Filter size={12}/> RULES ACTIVE: 142</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">GOVERNANCE LEVEL: L4 (Proactive)</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Global Quality Score (DQI)</div>
              <div className="text-3xl font-mono font-black text-white">{qualityScore} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
           </div>
           <div className="w-[1px] h-10 bg-cyan-900/50"></div>
           <div className="text-right">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Error Rate</div>
              <div className="text-3xl font-mono font-black text-emerald-400">0.04%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left: Quality Metrics & Assessment */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* 6-Dimensions Radar */}
           <SciFiCard title="数据质量六维评估" subtitle="ASSESSMENT" className="bg-[#080c14]/80 border-cyan-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={qualityDimensions}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Quality" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#020810', border: '1px solid #06b6d4', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 px-2 pb-2">
                 <div className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-400">最低维度</span>
                    <span className="text-yellow-400 font-bold">有效性 (Validity) - 85</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Domain Scorecards */}
           <SciFiCard title="业务域质量概览" subtitle="DOMAINS" className="flex-1 border-cyan-900/50">
              <div className="space-y-3">
                 {[
                   { name: '传感器时序数据', score: 98, status: 'EXCELLENT', color: 'text-green-400' },
                   { name: '维修工单记录', score: 82, status: 'GOOD', color: 'text-blue-400' },
                   { name: '备件库存档案', score: 95, status: 'EXCELLENT', color: 'text-green-400' },
                   { name: '人工巡检日志', score: 76, status: 'WARNING', color: 'text-yellow-400' },
                 ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded border border-slate-800 hover:border-cyan-500/30 transition-all">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{d.name}</div>
                          <div className={`text-[9px] font-bold ${d.color} mt-1`}>{d.status}</div>
                       </div>
                       <div className="text-xl font-mono font-bold text-white">{d.score}</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* Center: The Purification Pipeline (Visual Engine) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#05070e] border border-cyan-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(6,182,212,0.1)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur">
                    <Activity className="text-cyan-400" size={14} />
                    <span className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest">Live Pipeline Visualizer</span>
                 </div>
              </div>

              {/* SVG Pipeline */}
              <div className="w-full h-full p-6 flex items-center justify-center">
                 <svg className="w-full h-full" viewBox="0 0 800 500">
                    <defs>
                       <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
                       </linearGradient>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                       <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                       </marker>
                    </defs>

                    {/* Main Flow Path */}
                    <path d="M 50 250 L 200 250 L 350 250 L 500 250 L 750 250" stroke="#1e293b" strokeWidth="4" fill="none" />
                    
                    {/* Processing Nodes */}
                    {[
                      { id: 'ingest', label: 'INGEST', x: 100, y: 250, color: '#94a3b8' },
                      { id: 'validate', label: 'VALIDATION', x: 275, y: 250, color: '#06b6d4' },
                      { id: 'clean', label: 'CLEANSING', x: 425, y: 250, color: '#3b82f6' },
                      { id: 'master', label: 'MASTERING', x: 575, y: 250, color: '#10b981' },
                    ].map((node, i) => (
                       <g key={node.id} onClick={() => setActiveStage(node.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
                          {/* Node Box */}
                          <rect 
                             x={node.x - 40} y={node.y - 25} width="80" height="50" rx="8" 
                             fill="#0f172a" stroke={activeStage === node.id ? '#fff' : node.color} strokeWidth="2" 
                             className="filter drop-shadow-lg"
                          />
                          <text x={node.x} y={node.y+5} textAnchor="middle" fill={activeStage === node.id ? '#fff' : node.color} fontSize="10" fontWeight="bold">
                             {node.label}
                          </text>
                          
                          {/* Connector Pulse */}
                          {i < 3 && (
                             <circle r="3" fill="#fff">
                                <animateMotion 
                                   dur={`${2/pipelineSpeed}s`} 
                                   repeatCount="indefinite" 
                                   path={`M ${node.x+40} ${node.y} L ${node.x+135} ${node.y}`}
                                />
                             </circle>
                          )}
                       </g>
                    ))}

                    {/* Rejection Path (Dropdown) */}
                    <path d="M 275 275 Q 275 350 200 350 L 150 350" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" fill="none" markerEnd="url(#arrow)" />
                    <g transform="translate(100, 335)">
                       <rect x="0" y="0" width="80" height="30" rx="4" fill="#1a0505" stroke="#ef4444" strokeWidth="1" />
                       <text x="40" y="20" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">QUARANTINE</text>
                    </g>
                    
                    {/* Rejected Particles */}
                    <circle r="2" fill="#ef4444">
                       <animateMotion dur="2s" repeatCount="indefinite" path="M 275 275 Q 275 350 200 350 L 150 350" />
                    </circle>

                    {/* Data Quality Metrics (Overlaid on Diagram) */}
                    <text x="275" y="215" textAnchor="middle" fill="#06b6d4" fontSize="9">12k rec/s</text>
                    <text x="425" y="215" textAnchor="middle" fill="#3b82f6" fontSize="9">Dedupe</text>
                    <text x="575" y="215" textAnchor="middle" fill="#10b981" fontSize="9">Enrich</text>
                 </svg>
              </div>

              {/* Bottom Control */}
              <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
                 <span className="text-[9px] text-slate-500 uppercase font-bold">Processing Speed</span>
                 <input 
                    type="range" min="0.5" max="3" step="0.1" 
                    value={pipelineSpeed}
                    onChange={(e) => setPipelineSpeed(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-slate-800 rounded-full accent-cyan-400 cursor-pointer"
                 />
              </div>
           </div>

           {/* Throughput & Error Chart */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Activity size={14} /> Data Throughput vs Errors
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                       <defs>
                          <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="left" stroke="#06b6d4" tick={{fontSize: 9}} />
                       <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#020810', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#06b6d4" fill="url(#colorVol)" name="Records/Min" />
                       <Area yAxisId="right" type="step" dataKey="errors" stroke="#ef4444" fill="transparent" name="Invalid" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right: Rules & Remediation */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Active Rules */}
           <SciFiCard title="治理规则引擎 (Active Rules)" subtitle="LOGIC" className="flex-1 border-cyan-900/50">
              <div className="space-y-3 pt-1">
                 {activeRules.map((rule, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-cyan-500/30 transition-all cursor-default">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{rule.name}</div>
                          <div className="text-[9px] text-slate-500 flex gap-2">
                             <span>Type: {rule.type}</span>
                          </div>
                       </div>
                       <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          rule.impact === 'Critical' ? 'bg-red-900/30 text-red-400' : 
                          rule.impact === 'High' ? 'bg-orange-900/30 text-orange-400' : 'bg-blue-900/30 text-blue-400'
                       }`}>{rule.impact}</span>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 py-2 border border-dashed border-slate-600 text-[10px] text-slate-400 hover:text-white hover:border-white transition-all rounded flex items-center justify-center gap-2">
                 <Settings size={12} /> Configure Ruleset
              </button>
           </SciFiCard>

           {/* Anomaly Log */}
           <SciFiCard title="异常数据拦截日志" subtitle="QUARANTINE" className="flex-1 bg-red-950/5 border-red-900/20">
              <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[200px]">
                 {logs.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-900/80 rounded border-l-2 border-red-500 flex flex-col gap-1">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-red-400 font-bold">{log.id}</span>
                          <span className="text-[9px] text-slate-500">{log.time}</span>
                       </div>
                       <div className="text-[10px] text-slate-300">
                          Field: <span className="text-white font-bold">{log.field}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-red-300 italic">{log.issue}</span>
                          <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400">{log.status}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Quick Actions */}
           <SciFiCard title="治理工具箱" className="bg-cyan-900/10 border-cyan-800/20">
              <div className="grid grid-cols-2 gap-2">
                 <button className="flex items-center justify-center gap-2 p-2 bg-slate-800 hover:bg-cyan-700/50 rounded border border-slate-700 text-[10px] text-white transition-all">
                    <RefreshCw size={12} /> Re-run Pipeline
                 </button>
                 <button className="flex items-center justify-center gap-2 p-2 bg-slate-800 hover:bg-red-700/50 rounded border border-slate-700 text-[10px] text-white transition-all">
                    <XCircle size={12} /> Purge Invalid
                 </button>
                 <button className="flex items-center justify-center gap-2 p-2 bg-slate-800 hover:bg-blue-700/50 rounded border border-slate-700 text-[10px] text-white transition-all col-span-2">
                    <FileCheck size={12} /> Generate Quality Report
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
