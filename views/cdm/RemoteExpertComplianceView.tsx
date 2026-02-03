
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldCheck, Lock, FileCode, Hash, 
  History, Eye, Search, Filter, 
  Fingerprint, FileSignature, Server, 
  UserCheck, AlertTriangle, CheckCircle,
  Database, Link as LinkIcon, Mic2,
  Terminal, Shield, Activity, RefreshCw, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';

// --- Types ---

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  hash: string;
  status: 'Verified' | 'Warning' | 'Tampered';
  metadata?: string;
}

interface BlockNode {
  id: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  txCount: number;
  status: 'Immutable';
}

interface ComplianceMetric {
  category: string;
  score: number;
  fullMark: number;
}

// --- Mock Data ---

const SESSION_LOGS: AuditLog[] = [
  { id: 'LOG-001', timestamp: '10:00:05.120', actor: 'System', role: 'Host', action: 'Session Init', resource: 'Room #8842', hash: '8a2f...9c12', status: 'Verified' },
  { id: 'LOG-002', timestamp: '10:00:12.450', actor: 'Tech Liu', role: 'Client', action: 'Auth Success', resource: 'Token #A99', hash: '7b3d...112a', status: 'Verified' },
  { id: 'LOG-003', timestamp: '10:01:05.880', actor: 'Dr. Zhang', role: 'Expert', action: 'Join Room', resource: 'Video Stream', hash: 'e45c...0092', status: 'Verified' },
  { id: 'LOG-004', timestamp: '10:05:22.100', actor: 'Dr. Zhang', role: 'Expert', action: 'Send File', resource: 'Diagram_v2.pdf', hash: 'f11a...334b', status: 'Verified', metadata: 'Size: 2.4MB' },
  { id: 'LOG-005', timestamp: '10:08:45.330', actor: 'AI Monitor', role: 'Bot', action: 'Risk Alert', resource: 'Keyword: "Bypass"', hash: '002a...11bb', status: 'Warning' },
  { id: 'LOG-006', timestamp: '10:12:10.500', actor: 'Tech Liu', role: 'Client', action: 'Execute CMD', resource: 'Reset_PLC', hash: '998d...44ca', status: 'Verified' },
  { id: 'LOG-007', timestamp: '10:30:00.000', actor: 'System', role: 'Host', action: 'Session End', resource: 'Archive', hash: '112c...889d', status: 'Verified' },
];

const BLOCKCHAIN_DATA: BlockNode[] = [
  { id: 10421, hash: '0000...a1b2', prevHash: '0000...9982', timestamp: '10:00', txCount: 12, status: 'Immutable' },
  { id: 10422, hash: '0000...c3d4', prevHash: '0000...a1b2', timestamp: '10:10', txCount: 8, status: 'Immutable' },
  { id: 10423, hash: '0000...e5f6', prevHash: '0000...c3d4', timestamp: '10:20', txCount: 15, status: 'Immutable' },
  { id: 10424, hash: '0000...g7h8', prevHash: '0000...e5f6', timestamp: '10:30', txCount: 5, status: 'Immutable' },
];

const COMPLIANCE_SCORES: ComplianceMetric[] = [
  { category: 'SOP执行度', score: 95, fullMark: 100 },
  { category: '数据隐私', score: 100, fullMark: 100 },
  { category: '指令授权', score: 90, fullMark: 100 },
  { category: '语音合规', score: 85, fullMark: 100 },
  { category: '时效性', score: 92, fullMark: 100 },
  { category: '文档归档', score: 98, fullMark: 100 },
];

const RISK_KEYWORDS = [
  { word: 'Bypass', count: 2, severity: 'High' },
  { word: 'Override', count: 1, severity: 'Medium' },
  { word: 'Unofficial', count: 0, severity: 'Low' },
  { word: 'Leak', count: 0, severity: 'High' },
];

const AUDIO_WAVE = Array.from({length: 60}, (_, i) => ({
  time: i,
  amplitude: Math.abs(Math.sin(i * 0.5) * Math.random() * 100)
}));

// --- Helper Components ---

const BlockchainBlock: React.FC<{ block: BlockNode }> = ({ block }) => (
  <div className="flex items-center">
    <div className="bg-[#0b1221] border border-emerald-900/50 p-3 rounded w-32 relative group hover:border-emerald-500 transition-colors cursor-pointer">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600 opacity-50"></div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-500 font-mono">#{block.id}</span>
        <Lock size={10} className="text-emerald-500" />
      </div>
      <div className="text-[9px] text-emerald-400 font-mono truncate mb-1">H: {block.hash}</div>
      <div className="text-[9px] text-slate-600 font-mono truncate">P: {block.prevHash}</div>
      <div className="mt-2 flex justify-between text-[9px] text-slate-400">
        <span>{block.timestamp}</span>
        <span>{block.txCount} TXs</span>
      </div>
    </div>
    <div className="w-8 h-0.5 bg-slate-700 mx-1"></div>
  </div>
);

const LogRow: React.FC<{ log: AuditLog, active: boolean, onClick: () => void }> = ({ log, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 border-l-2 cursor-pointer transition-all hover:bg-slate-800/50
      ${active ? 'bg-slate-800/80 border-emerald-500' : 'bg-transparent border-slate-800'}
    `}
  >
    <div className="flex flex-col items-center w-12 shrink-0">
      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.split('.')[0]}</span>
      <span className="text-[8px] text-slate-600 font-mono">.{log.timestamp.split('.')[1]}</span>
    </div>
    
    <div className={`p-1.5 rounded-full ${log.status === 'Warning' ? 'bg-yellow-900/20 text-yellow-500' : 'bg-emerald-900/20 text-emerald-500'}`}>
      {log.status === 'Warning' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-200">{log.action}</span>
        <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 rounded border border-slate-700">{log.role}</span>
      </div>
      <div className="text-[10px] text-slate-400 truncate">
        <span className="text-cyan-400">{log.actor}</span> → {log.resource}
      </div>
    </div>
  </div>
);

export const RemoteExpertComplianceView: React.FC = () => {
  const [selectedLogId, setSelectedLogId] = useState(SESSION_LOGS[0].id);
  const activeLog = SESSION_LOGS.find(l => l.id === selectedLogId) || SESSION_LOGS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Trust Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
               <ShieldCheck size={14} /> Compliance & Traceability
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               服务过程 <span className="text-emerald-500">合规留痕金库</span>
            </h1>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="bg-slate-900/50 border border-emerald-500/30 px-4 py-2 rounded flex items-center gap-3">
                <div className="p-1.5 bg-emerald-900/30 rounded-full text-emerald-400 animate-pulse">
                    <Activity size={16} />
                </div>
                <div>
                    <div className="text-[9px] text-slate-500 uppercase">Blockchain Status</div>
                    <div className="text-sm font-bold text-white">SYNCED • HEIGHT 1,042,401</div>
                </div>
             </div>
             <div className="bg-slate-900/50 border border-slate-700 px-4 py-2 rounded text-right">
                <div className="text-[9px] text-slate-500 uppercase">Tamper-Proof Score</div>
                <div className="text-xl font-mono font-bold text-emerald-400">100%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Audit Trail (Timeline) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-0 overflow-hidden border border-slate-800 rounded-lg bg-[#05080e]">
           <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><History size={14}/> Event Stream</span>
              <Filter size={14} className="text-slate-500 cursor-pointer hover:text-white" />
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {SESSION_LOGS.map(log => (
                 <LogRow 
                   key={log.id} 
                   log={log} 
                   active={selectedLogId === log.id} 
                   onClick={() => setSelectedLogId(log.id)} 
                 />
              ))}
              <div className="p-4 text-center">
                  <div className="text-[10px] text-slate-600 font-mono">-- END OF STREAM --</div>
                  <div className="text-[10px] text-emerald-900/50 font-mono mt-1">HASH: 8f92a...1102 verified</div>
              </div>
           </div>
        </div>

        {/* CENTER: Digital Evidence Room */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Chain of Custody */}
           <SciFiCard title="不可篡改证据链 (Immutable Chain)" subtitle="BLOCKCHAIN LEDGER" className="border-emerald-900/50 bg-[#020408]" noPadding>
               <div className="p-4 overflow-x-auto">
                   <div className="flex items-center min-w-[600px]">
                       <div className="mr-4 text-xs text-slate-500 uppercase writing-vertical-rl rotate-180 h-16 text-center border-r border-slate-800 pr-2">
                           Block Height
                       </div>
                       {BLOCKCHAIN_DATA.map(block => (
                           <BlockchainBlock key={block.id} block={block} />
                       ))}
                       <div className="flex items-center justify-center w-16 h-16 rounded border border-dashed border-slate-700 text-slate-600">
                           <RefreshCw size={16} className="animate-spin" />
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Evidence Detail Inspector */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
               
               {/* Log Details */}
               <SciFiCard title="日志元数据透视" subtitle="RAW DATA" className="border-slate-800">
                   <div className="flex flex-col h-full gap-3 font-mono text-xs">
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                           <span className="text-slate-500">Log ID</span>
                           <span className="text-emerald-400">{activeLog.id}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                           <span className="text-slate-500">Actor Identity</span>
                           <span className="text-white">{activeLog.actor} <span className="text-slate-600">({activeLog.role})</span></span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                           <span className="text-slate-500">Action Type</span>
                           <span className="text-white">{activeLog.action}</span>
                       </div>
                       <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-400 overflow-hidden">
                           <div className="text-[9px] uppercase text-slate-600 mb-1">Content Hash (SHA-256)</div>
                           <div className="truncate">{activeLog.hash}</div>
                           <div className="truncate opacity-50">{activeLog.hash.split('').reverse().join('')}</div>
                       </div>
                       
                       {activeLog.metadata && (
                           <div className="mt-auto p-2 bg-emerald-900/10 border border-emerald-500/20 rounded text-emerald-200">
                               <div className="flex items-center gap-1 mb-1 font-bold"><FileCode size={12}/> Attachment Meta</div>
                               {activeLog.metadata}
                           </div>
                       )}
                   </div>
               </SciFiCard>

               {/* Voice/Video Verification */}
               <SciFiCard title="音视频指纹校验" subtitle="VOICEPRINT" className="border-slate-800">
                   <div className="flex flex-col h-full">
                       <div className="h-32 w-full bg-[#080b14] rounded border border-slate-800 relative overflow-hidden flex items-center mb-4">
                           {/* Waveform Visualization */}
                           <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={AUDIO_WAVE}>
                                   <defs>
                                       <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                           <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                           <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                       </linearGradient>
                                   </defs>
                                   <Area type="monotone" dataKey="amplitude" stroke="#0ea5e9" fill="url(#colorWave)" isAnimationActive={false} />
                               </AreaChart>
                           </ResponsiveContainer>
                           
                           <div className="absolute top-2 right-2 text-[9px] text-cyan-500 bg-black/60 px-2 py-0.5 rounded">
                               Segment: 10:05:20
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                               <div className="text-[9px] text-slate-500 uppercase">Biometric Match</div>
                               <div className="text-sm font-bold text-green-400 flex items-center gap-1">
                                   <Fingerprint size={12}/> 99.8%
                               </div>
                           </div>
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                               <div className="text-[9px] text-slate-500 uppercase">Integrity Check</div>
                               <div className="text-sm font-bold text-white flex items-center gap-1">
                                   <Shield size={12}/> Valid
                               </div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>
           </div>
           
           {/* 3. Sensitive Data Access Log (Horizontal) */}
           <SciFiCard title="敏感数据访问追踪" subtitle="DLP MONITOR" className="h-48 border-slate-800">
                <div className="flex items-center justify-around h-full px-4">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                            <UserCheck size={20}/>
                        </div>
                        <div className="text-xs text-slate-300">Identity Verif.</div>
                        <div className="text-[10px] text-green-500">Passed</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                            <Database size={20}/>
                        </div>
                        <div className="text-xs text-slate-300">Data Access</div>
                        <div className="text-[10px] text-green-500">Logged</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                            <Eye size={20}/>
                        </div>
                        <div className="text-xs text-slate-300">Masking</div>
                        <div className="text-[10px] text-blue-400">Applied (***)</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                            <LinkIcon size={20}/>
                        </div>
                        <div className="text-xs text-slate-300">Chain Entry</div>
                        <div className="text-[10px] text-emerald-400">Hashed</div>
                    </div>
                </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Compliance Scorecard */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Compliance Radar */}
           <SciFiCard title="合规遵从度评估" subtitle="SCORECARD" className="border-emerald-900/30">
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPLIANCE_SCORES}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Score" dataKey="score" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#05080e', borderColor: '#10b981', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
               <div className="text-center mt-[-20px]">
                   <div className="text-3xl font-bold text-white">93.5</div>
                   <div className="text-[10px] text-emerald-500 uppercase font-bold">Excellent Compliance</div>
               </div>
           </SciFiCard>

           {/* Risk Keyword Cloud */}
           <SciFiCard title="风险语义检测" subtitle="NLP ANALYSIS" className="border-slate-800">
               <div className="flex flex-wrap gap-2">
                   {RISK_KEYWORDS.map((k, i) => (
                       <span key={i} className={`px-2 py-1 rounded text-xs border flex items-center gap-1
                           ${k.severity === 'High' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 
                             k.severity === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50' : 
                             'bg-slate-800 text-slate-400 border-slate-700'}
                       `}>
                           {k.word} <span className="bg-black/30 px-1 rounded text-[9px]">{k.count}</span>
                       </span>
                   ))}
               </div>
               <div className="mt-4 p-2 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-400">
                   <Mic2 size={12} className="inline mr-1 text-slate-500"/>
                   Audio analysis detected 2 potential risk keywords during the session. Human review recommended.
               </div>
           </SciFiCard>

           {/* Export Report */}
           <div className="mt-auto">
               <button className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg">
                   <FileSignature size={14} /> 生成合规审计报告
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};
