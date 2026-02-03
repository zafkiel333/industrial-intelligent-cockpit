
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Shield, Lock, Unlock, Users, FileKey, Eye, 
  AlertTriangle, CheckCircle, Search, Key, 
  Fingerprint, FileText, Ban, Activity, Server, CheckCircle2
} from 'lucide-react';

export const DataClassificationPermissionView: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<string>('L3');
  const [flowTick, setFlowTick] = useState(0);

  // --- Mock Data ---

  // 1. Classification Levels
  const levels = [
    { id: 'L4', label: '绝密 (Top Secret)', color: '#f59e0b', desc: '核心知识产权、密钥', count: 124, encryption: 'AES-256' },
    { id: 'L3', label: '机密 (Confidential)', color: '#ef4444', desc: '用户隐私、财务数据', count: 852, encryption: 'AES-128' },
    { id: 'L2', label: '内部 (Internal)', color: '#3b82f6', desc: '运行日志、维修记录', count: 14520, encryption: 'None' },
    { id: 'L1', label: '公开 (Public)', color: '#10b981', desc: '产品手册、公共资讯', count: 5200, encryption: 'None' },
  ];

  // 2. Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { time: '10:42:01', user: 'Admin_01', action: 'EXPORT', asset: 'Core_Blueprint_v2.dwg', result: 'ALLOW', level: 'L4' },
    { time: '10:42:05', user: 'Engineer_Wang', action: 'READ', asset: 'Maint_Log_882.json', result: 'ALLOW', level: 'L2' },
    { time: '10:42:12', user: 'Guest_99', action: 'WRITE', asset: 'Sys_Config.yaml', result: 'DENY', level: 'L3' },
    { time: '10:42:18', user: 'Analyst_Li', action: 'READ', asset: 'Sensor_Stream_04', result: 'ALLOW', level: 'L2' },
  ]);

  // 3. Topology Data (Roles -> Data)
  const roles = [
    { id: 'r1', name: '系统管理员', y: 50 },
    { id: 'r2', name: '运维工程师', y: 150 },
    { id: 'r3', name: '数据分析师', y: 250 },
    { id: 'r4', name: '外部访客', y: 350 },
  ];

  const dataDomains = [
    { id: 'd1', name: '核心设计图纸 (L4)', y: 50, level: 'L4' },
    { id: 'd2', name: '客户敏感信息 (L3)', y: 150, level: 'L3' },
    { id: 'd3', name: '设备运行数据 (L2)', y: 250, level: 'L2' },
    { id: 'd4', name: '公共服务文档 (L1)', y: 350, level: 'L1' },
  ];

  const permissions = [
    { from: 'r1', to: 'd1', type: 'FULL' }, { from: 'r1', to: 'd2', type: 'FULL' }, { from: 'r1', to: 'd3', type: 'FULL' }, { from: 'r1', to: 'd4', type: 'FULL' },
    { from: 'r2', to: 'd3', type: 'RW' }, { from: 'r2', to: 'd4', type: 'R' }, { from: 'r2', to: 'd1', type: 'R' },
    { from: 'r3', to: 'd2', type: 'R' }, { from: 'r3', to: 'd3', type: 'R' },
    { from: 'r4', to: 'd4', type: 'R' },
  ];

  // 4. Compliance Radar
  const complianceData = [
    { subject: '最小权限原则', A: 95 },
    { subject: '审计完整性', A: 100 },
    { subject: '数据脱敏率', A: 88 },
    { subject: '加密覆盖率', A: 92 },
    { subject: '账号合规性', A: 96 },
  ];

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowTick(t => t + 1);
      
      // Add random log
      if (Math.random() > 0.7) {
         const newLog = {
             time: new Date().toLocaleTimeString('en-US', {hour12: false}),
             user: ['Admin_01', 'Engineer_Wang', 'Analyst_Li', 'Guest_99', 'Bot_22'][Math.floor(Math.random()*5)],
             action: ['READ', 'WRITE', 'EXPORT', 'DELETE'][Math.floor(Math.random()*4)],
             asset: `Asset_${Math.floor(Math.random()*1000)}`,
             result: Math.random() > 0.9 ? 'DENY' : 'ALLOW',
             level: ['L1', 'L2', 'L3', 'L4'][Math.floor(Math.random()*4)]
         };
         setAuditLogs(prev => [newLog, ...prev.slice(0, 8)]);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0b0e11] p-2 overflow-hidden select-none">
      
      {/* 顶部：安全态势感知 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-[#161b22] to-transparent border-b border-yellow-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Lock className="text-yellow-500" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据分级分类与权限管理中心</h1>
              <div className="flex items-center gap-6 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Shield size={12}/> SECURITY LEVEL: DEFCON 3</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Users size={12}/> ACTIVE SESSIONS: 428</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">ZERO TRUST: ENABLED</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Sensitive Assets (L3/L4)</div>
              <div className="text-3xl font-mono font-black text-yellow-500">976</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Blocked Attacks (24h)</div>
              <div className="text-3xl font-mono font-black text-red-500">42</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：分级分类体系 */}
        <div className="w-full lg:w-[24%] flex flex-col gap-4">
           <SciFiCard title="数据分级金字塔" subtitle="TAXONOMY" className="flex-1 bg-[#11141a] border-slate-800">
              <div className="flex flex-col gap-2 h-full justify-center py-4">
                 {levels.map((lvl) => (
                    <div 
                      key={lvl.id}
                      onClick={() => setActiveLevel(lvl.id)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-300 group overflow-hidden ${
                         activeLevel === lvl.id 
                         ? 'bg-slate-800 border-yellow-500/50 scale-105 shadow-lg z-10' 
                         : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                       {/* Background Bar */}
                       <div 
                         className="absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500" 
                         style={{width: activeLevel === lvl.id ? '100%' : '5px', backgroundColor: lvl.color}}
                       ></div>
                       
                       <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-sm`} style={{backgroundColor: `${lvl.color}30`, color: lvl.color}}>
                                {lvl.id}
                             </div>
                             <div>
                                <div className="text-sm font-bold text-white">{lvl.label}</div>
                                <div className="text-[9px] text-slate-400">{lvl.desc}</div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-lg font-mono font-bold text-white">{lvl.count.toLocaleString()}</div>
                             <div className="text-[8px] text-slate-500 uppercase">{lvl.encryption}</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="敏感数据分布" subtitle="DISTRIBUTION">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={levels} 
                          innerRadius={40} 
                          outerRadius={60} 
                          paddingAngle={5} 
                          dataKey="count"
                       >
                          {levels.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-400 -mt-4">
                 Top Secret (L4) 占比: <span className="text-yellow-500 font-bold">0.6%</span>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：权限拓扑矩阵 */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
           <div className="flex-1 bg-[#050608] border border-slate-700/50 rounded-2xl relative overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                 <Fingerprint className="text-blue-500" size={16} />
                 <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Active Access Topology</span>
              </div>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> READ
                 </div>
                 <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> WRITE
                 </div>
                 <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> DENY
                 </div>
              </div>

              {/* SVG Topology */}
              <div className="w-full h-full p-8 flex items-center justify-center">
                 <svg className="w-full h-full" viewBox="0 0 800 500">
                    <defs>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                       <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
                       </marker>
                    </defs>

                    {/* Links */}
                    {permissions.map((perm, i) => {
                       const source = roles.find(r => r.id === perm.from)!;
                       const target = dataDomains.find(d => d.id === perm.to)!;
                       const isHighlighted = target.level === activeLevel;
                       const color = perm.type === 'FULL' ? '#f59e0b' : perm.type === 'RW' ? '#3b82f6' : '#64748b';
                       const opacity = isHighlighted ? 0.8 : 0.2;
                       const width = isHighlighted ? 2 : 1;

                       // Bezier Curve
                       const pathD = `M 150 ${source.y} C 400 ${source.y}, 400 ${target.y}, 650 ${target.y}`;

                       return (
                          <g key={i}>
                             <path d={pathD} stroke={color} strokeWidth={width} fill="none" opacity={opacity} markerEnd="url(#arrow)" />
                             {/* Traffic Particles */}
                             {isHighlighted && (
                                <circle r="3" fill="#fff" filter="url(#glow)">
                                   <animateMotion 
                                      dur={`${2 + Math.random()}s`} 
                                      repeatCount="indefinite" 
                                      path={pathD}
                                      keyPoints="0;1"
                                      keyTimes="0;1"
                                      calcMode="linear"
                                   />
                                </circle>
                             )}
                          </g>
                       );
                    })}

                    {/* Role Nodes (Left) */}
                    {roles.map(role => (
                       <g key={role.id} transform={`translate(150, ${role.y})`}>
                          <rect x="-60" y="-20" width="120" height="40" rx="4" fill="#1e293b" stroke="#334155" />
                          <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">{role.name}</text>
                          <circle cx="60" cy="0" r="4" fill="#3b82f6" />
                       </g>
                    ))}

                    {/* Data Nodes (Right) */}
                    {dataDomains.map(dom => {
                       const isActive = dom.level === activeLevel;
                       const levelColor = levels.find(l => l.id === dom.level)?.color || '#fff';
                       
                       return (
                          <g key={dom.id} transform={`translate(650, ${dom.y})`} className="cursor-pointer" onClick={() => setActiveLevel(dom.level)}>
                             <circle cx="-60" cy="0" r="4" fill={levelColor} />
                             <rect 
                                x="-60" y="-25" width="160" height="50" rx="4" 
                                fill={isActive ? `${levelColor}20` : '#0f172a'} 
                                stroke={isActive ? levelColor : '#334155'} 
                                strokeWidth={isActive ? 2 : 1}
                             />
                             <text x="20" y="-5" textAnchor="middle" fill={isActive ? '#fff' : '#94a3b8'} fontSize="12" fontWeight="bold">{dom.name}</text>
                             <text x="20" y="15" textAnchor="middle" fill={levelColor} fontSize="10">{dom.level} Restricted</text>
                          </g>
                       );
                    })}

                    {/* Column Labels */}
                    <text x="150" y="30" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="bold">SUBJECT (User)</text>
                    <text x="650" y="30" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="bold">OBJECT (Data)</text>

                 </svg>
              </div>
           </div>

           {/* Permission Matrix */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Key size={14} /> Active Policy Matrix
                 </div>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono">
                 <div className="text-slate-500"></div>
                 {roles.map(r => <div key={r.id} className="text-slate-400">{r.name}</div>)}
                 
                 {dataDomains.map(d => (
                    <React.Fragment key={d.id}>
                       <div className="text-slate-400 text-right pr-2">{d.level}</div>
                       {roles.map(r => {
                          const p = permissions.find(x => x.from === r.id && x.to === d.id);
                          return (
                             <div key={`${r.id}-${d.id}`} className={`rounded py-1 border ${
                                p ? 'bg-blue-900/30 border-blue-600 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-600'
                             }`}>
                                {p ? p.type : '--'}
                             </div>
                          );
                       })}
                    </React.Fragment>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：审计与合规 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Live Audit Log */}
           <SciFiCard title="实时访问审计日志" subtitle="AUDIT TRAIL" className="flex-1 border-slate-700 bg-slate-900/20">
              <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar h-full max-h-[300px]">
                 {auditLogs.map((log, i) => (
                    <div key={i} className={`p-2 rounded border-l-2 text-[10px] flex flex-col gap-1 ${
                       log.result === 'DENY' ? 'bg-red-950/20 border-red-500' : 'bg-slate-800/30 border-green-500'
                    }`}>
                       <div className="flex justify-between items-center text-slate-500 font-mono">
                          <span>{log.time}</span>
                          <span className="bg-slate-800 px-1 rounded text-white">{log.level}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{log.user}</span>
                          <span className="text-slate-500">via</span>
                          <span className="text-cyan-400">{log.action}</span>
                       </div>
                       <div className="flex justify-between items-center mt-1">
                          <span className="text-slate-400 truncate w-32" title={log.asset}>{log.asset}</span>
                          <span className={`font-bold ${log.result === 'DENY' ? 'text-red-500' : 'text-green-500'}`}>{log.result}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Compliance Score */}
           <SciFiCard title="合规性评估" subtitle="COMPLIANCE" className="h-[280px]">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={complianceData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-green-950/20 border border-green-900/30 rounded flex items-center gap-3">
                 <CheckCircle2 size={16} className="text-green-500" />
                 <div>
                    <div className="text-[10px] text-green-200 font-bold">合规状态: 达标</div>
                    <div className="text-[9px] text-slate-500">已通过 ISO 27001 认证要求</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
