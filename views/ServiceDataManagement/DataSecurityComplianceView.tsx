
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Shield, Lock, Unlock, Eye, FileWarning, 
  Globe, Server, Key, Fingerprint, Siren, 
  CheckCircle, XCircle, AlertTriangle, Terminal, 
  ShieldCheck, Activity, Network
} from 'lucide-react';

export const DataSecurityComplianceView: React.FC = () => {
  const [securityLevel, setSecurityLevel] = useState(1); // 1-5, 1 is highest threat
  const [encryptionKey, setEncryptionKey] = useState('AES-256-GCM');
  const [scanProgress, setScanProgress] = useState(0);

  // --- Mock Data ---

  // 1. Threat Map Data (Simulated Geo Scatter)
  const threatMapData = Array.from({length: 20}, () => ({
    x: Math.random() * 360 - 180,
    y: Math.random() * 180 - 90,
    z: Math.random() * 100, // Intensity
    type: Math.random() > 0.8 ? 'DDOS' : 'SQL_INJECTION'
  }));

  // 2. Traffic Analysis
  const trafficData = Array.from({length: 40}, (_, i) => ({
    time: i,
    legit: 500 + Math.sin(i*0.2)*100 + Math.random()*50,
    malicious: Math.max(0, Math.sin(i*0.5)*50 + (Math.random()-0.6)*100)
  }));

  // 3. Compliance Scores
  const complianceData = [
    { subject: '数据脱敏', A: 100, fullMark: 100 },
    { subject: '访问控制', A: 95, fullMark: 100 },
    { subject: '传输加密', A: 98, fullMark: 100 },
    { subject: '存储隔离', A: 85, fullMark: 100 },
    { subject: '审计留痕', A: 92, fullMark: 100 },
    { subject: '容灾备份', A: 88, fullMark: 100 },
  ];

  // 4. Live Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { time: '14:22:01', user: 'SYSTEM', action: 'KEY_ROTATION', status: 'SUCCESS', ip: 'INTERNAL' },
    { time: '14:21:45', user: 'admin_03', action: 'DATA_EXPORT', status: 'DENIED', ip: '192.168.1.105' },
    { time: '14:20:12', user: 'service_bot', action: 'API_ACCESS', status: 'SUCCESS', ip: '10.0.0.42' },
    { time: '14:18:30', user: 'unknown', action: 'LOGIN_ATTEMPT', status: 'BLOCKED', ip: '45.33.22.11' },
  ]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate Scan
      setScanProgress(prev => (prev + 2) % 360);
      
      // Randomly add threat log
      if (Math.random() > 0.8) {
         const types = ['SQL_INJECT', 'XSS', 'BRUTE_FORCE', 'UNAUTH_ACCESS'];
         const ips = ['211.98.x.x', '10.2.x.x', '172.16.x.x', '45.22.x.x'];
         const newLog = {
             time: new Date().toLocaleTimeString('en-GB'),
             user: Math.random() > 0.5 ? 'unknown' : 'user_x',
             action: types[Math.floor(Math.random()*types.length)],
             status: 'BLOCKED',
             ip: ips[Math.floor(Math.random()*ips.length)]
         };
         setAuditLogs(prev => [newLog, ...prev.slice(0, 8)]);
         // Trigger visual alert
         setSecurityLevel(Math.random() > 0.9 ? 2 : 1);
      } else {
         setSecurityLevel(1);
      }

    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020208] p-2 overflow-hidden select-none">
      
      {/* 顶部：防御态势感知 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950/60 via-[#0a0a20] to-transparent border-b border-indigo-500/30 rounded-t-xl relative overflow-hidden">
        {/* Animated Background Line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse"></div>
        
        <div className="flex items-center gap-5 z-10">
           <div className={`p-3 rounded-lg border shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all duration-500 ${
              securityLevel > 1 ? 'bg-red-900/20 border-red-500 animate-pulse' : 'bg-indigo-600/20 border-indigo-500/40'
           }`}>
              <ShieldCheck className={securityLevel > 1 ? 'text-red-500' : 'text-indigo-400'} size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据安全与合规管理防御矩阵</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono tracking-[0.2em]">
                 <span className="flex items-center gap-2 text-indigo-300"><Lock size={12}/> ENCRYPTION: {encryptionKey}</span>
                 <span>|</span>
                 <span className="flex items-center gap-2 text-slate-400"><Eye size={12}/> MONITORING: ACTIVE</span>
                 <span>|</span>
                 <span className={`${securityLevel > 1 ? 'text-red-500 font-black' : 'text-emerald-400 font-bold'}`}>
                    DEFCON: {securityLevel === 1 ? 'NORMAL' : 'ELEVATED'}
                 </span>
              </div>
           </div>
        </div>

        <div className="flex gap-6 z-10">
           <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Blocked Attacks (Today)</div>
              <div className="text-3xl font-mono font-black text-red-400">1,042</div>
           </div>
           <div className="w-[1px] h-10 bg-indigo-900/50"></div>
           <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Compliance Score</div>
              <div className="text-3xl font-mono font-black text-emerald-400">96.8</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left: Threat Intelligence */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Global Threat Map (Abstract) */}
           <SciFiCard title="全球威胁源追踪" subtitle="GEO-IP" className="bg-[#050510] border-indigo-900/50">
              <div className="h-56 w-full relative overflow-hidden rounded border border-indigo-500/10">
                 {/* Grid Lines representing map */}
                 <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(#1e1b4b 1px, transparent 1px), linear-gradient(90deg, #1e1b4b 1px, transparent 1px)', 
                    backgroundSize: '40px 40px',
                    opacity: 0.3
                 }}></div>
                 
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                       <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                       <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                       <ZAxis type="number" dataKey="z" range={[50, 400]} />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#000', borderColor: '#ef4444', fontSize: '10px'}} />
                       <Scatter name="Threats" data={threatMapData} fill="#ef4444" shape="cross" />
                    </ScatterChart>
                 </ResponsiveContainer>
                 
                 {/* Radar Sweep Effect */}
                 <div 
                    className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-transparent to-indigo-500/20 origin-bottom-left pointer-events-none"
                    style={{
                        transform: `translate(-50%, -50%) rotate(${scanProgress}deg)`,
                        maskImage: 'radial-gradient(circle, white 0%, transparent 70%)'
                    }}
                 ></div>
              </div>
              <div className="flex justify-between px-2 mt-2 text-[10px] text-slate-500 font-mono">
                 <span>Origin: External</span>
                 <span>Target: API Gateway</span>
              </div>
           </SciFiCard>

           {/* Traffic Analysis */}
           <SciFiCard title="流量清洗分析" subtitle="DPI" className="flex-1 border-indigo-900/50">
              <div className="h-full w-full flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-2"><Activity size={12}/> Inbound Traffic</span>
                    <span className="text-[10px] text-indigo-300">Peak: 1.2 Gbps</span>
                 </div>
                 <div className="flex-1 min-h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={trafficData}>
                          <defs>
                             <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorMal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#020810', border: 'none', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="legit" stackId="1" stroke="#3b82f6" fill="url(#colorLegit)" />
                          <Area type="monotone" dataKey="malicious" stackId="1" stroke="#ef4444" fill="url(#colorMal)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: The Security Core (SVG Animation) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#05050a] border border-indigo-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(79,70,229,0.1)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                 <Fingerprint className="text-indigo-400" size={16} />
                 <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Encryption Core Visualization</span>
              </div>
              <div className="absolute top-4 right-4 z-10 text-right">
                 <div className="text-[9px] text-slate-500">ALGORITHM</div>
                 <div className="text-xs font-mono text-emerald-400 font-bold">AES-256 + RSA-4096</div>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-8">
                 <svg className="w-full h-full" viewBox="0 0 600 400">
                    <defs>
                       <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                       <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
                       </linearGradient>
                    </defs>

                    {/* Outer Rotating Shield Rings */}
                    <g transform="translate(300, 200)">
                       <circle r="140" fill="none" stroke="#1e1b4b" strokeWidth="1" />
                       <path d="M -140 0 A 140 140 0 0 1 140 0" fill="none" stroke="#4f46e5" strokeWidth="2" className="animate-[spin_10s_linear_infinite]" filter="url(#neon-glow)" />
                       <path d="M -120 0 A 120 120 0 0 0 120 0" fill="none" stroke="#3b82f6" strokeWidth="2" className="animate-[spin_8s_linear_infinite_reverse]" />
                       
                       {/* Hexagon Mesh Background */}
                       <path d="M -80 -140 L 80 -140 L 160 0 L 80 140 L -80 140 L -160 0 Z" fill="url(#shieldGrad)" stroke="none" opacity="0.5" />
                    </g>

                    {/* Core Data Vault */}
                    <g transform="translate(300, 200)">
                       <rect x="-40" y="-50" width="80" height="100" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="2" filter="url(#neon-glow)" />
                       <path d="M -20 -30 L 20 -30 M -20 -10 L 20 -10 M -20 10 L 20 10" stroke="#4f46e5" strokeWidth="2" />
                       <circle cx="0" cy="30" r="8" fill={securityLevel > 1 ? '#ef4444' : '#10b981'} className="animate-pulse" />
                    </g>

                    {/* Incoming Data Streams */}
                    {[0, 1, 2, 3].map(i => (
                       <g key={i} transform={`rotate(${i * 90 + 45}, 300, 200)`}>
                          <line x1="300" y1="50" x2="300" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                          <circle r="3" fill="#fff" filter="url(#neon-glow)">
                             <animateMotion 
                                dur={`${2 + i*0.5}s`} 
                                repeatCount="indefinite"
                                path="M 300 50 L 300 130"
                             />
                          </circle>
                       </g>
                    ))}

                    {/* Text Labels */}
                    <text x="300" y="340" textAnchor="middle" fill="#6366f1" fontSize="12" fontFamily="monospace" letterSpacing="2">SECURE ENCLAVE</text>
                    
                    {/* Floating Lock Icon */}
                    <g transform="translate(480, 50)">
                       <rect x="0" y="0" width="100" height="60" rx="4" fill="#0f0715" stroke="#ef4444" strokeWidth="1" opacity="0.8" />
                       <text x="50" y="25" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">INTRUSION DETECTED</text>
                       <text x="50" y="45" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">0</text>
                    </g>
                 </svg>
              </div>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <button className="px-5 py-2 rounded-full bg-indigo-900/80 border border-indigo-500/30 text-indigo-200 text-xs font-bold backdrop-blur flex items-center gap-2 hover:bg-indigo-800 transition-colors">
                    <Key size={12} /> 密钥轮转 (Rotation)
                 </button>
                 <button className="px-5 py-2 rounded-full bg-red-900/80 border border-red-500/30 text-red-200 text-xs font-bold backdrop-blur flex items-center gap-2 hover:bg-red-800 transition-colors">
                    <Siren size={12} /> 紧急熔断 (Kill Switch)
                 </button>
              </div>
           </div>

           {/* Live Audit Terminal */}
           <div className="h-40 bg-[#050505] border border-slate-800 rounded-2xl p-4 flex flex-col font-mono text-xs shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Terminal size={48} className="text-indigo-500" />
              </div>
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                    <Terminal size={12} /> Security Audit Stream
                 </div>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar z-10">
                 {auditLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 hover:bg-white/5 p-0.5 rounded transition-colors text-[10px]">
                       <span className="text-slate-500">[{log.time}]</span>
                       <span className="text-indigo-400 font-bold w-16">{log.user}</span>
                       <span className="text-slate-300 flex-1">{log.action}</span>
                       <span className="text-slate-500">{log.ip}</span>
                       <span className={`font-bold w-12 text-right ${
                          log.status === 'SUCCESS' ? 'text-green-500' : 
                          log.status === 'BLOCKED' ? 'text-red-500' : 'text-yellow-500'
                       }`}>[{log.status}]</span>
                    </div>
                 ))}
                 <div className="text-green-500 animate-pulse">_</div>
              </div>
           </div>
        </div>

        {/* Right: Compliance & Standards */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Compliance Radar */}
           <SciFiCard title="合规性综合评估" subtitle="ISO/GB/GDPR" className="flex-1 border-indigo-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={complianceData}>
                       <PolarGrid stroke="#1e1b4b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Compliance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <CheckCircle className="text-green-500" size={14} />
                    <div className="text-[9px] text-slate-400">等保 2.0: <span className="text-white">三级认证</span></div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <CheckCircle className="text-green-500" size={14} />
                    <div className="text-[9px] text-slate-400">DSMM: <span className="text-white">四级</span></div>
                 </div>
              </div>
           </SciFiCard>

           {/* Security Policies */}
           <SciFiCard title="安全策略配置" subtitle="POLICIES" className="border-indigo-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                       <Network size={14} className="text-blue-400" />
                       <span className="text-xs text-white">网络白名单 (ACL)</span>
                    </div>
                    <span className="text-[9px] bg-green-900/20 text-green-400 px-1.5 rounded">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                       <FileWarning size={14} className="text-yellow-400" />
                       <span className="text-xs text-white">敏感数据防泄漏 (DLP)</span>
                    </div>
                    <span className="text-[9px] bg-green-900/20 text-green-400 px-1.5 rounded">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                       <Server size={14} className="text-purple-400" />
                       <span className="text-xs text-white">数据库审计 (Audit)</span>
                    </div>
                    <span className="text-[9px] bg-green-900/20 text-green-400 px-1.5 rounded">Enabled</span>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded text-[10px] text-indigo-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                 <FileWarning size={12} /> 生成安全审计报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
