
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Shield, Lock, Unlock, Eye, EyeOff, 
  Fingerprint, Key, FileKey, Server, 
  AlertOctagon, Activity, Search, Filter,
  UserCheck, Ban, Globe, Database,
  RefreshCw, Smartphone, ShieldCheck,
  ToggleLeft, ToggleRight, FileText
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// --- Types ---

type SensitivityLevel = 'L1' | 'L2' | 'L3' | 'L4';
type EncryptionType = 'AES-256' | 'RSA-2048' | 'Masking' | 'None';

interface DataAsset {
  id: string;
  name: string;
  category: string;
  sensitivity: SensitivityLevel;
  encryption: EncryptionType;
  accessCount: number; // Daily access
  riskScore: number; // 0-100
  owner: string;
}

interface AccessLog {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  result: 'Allow' | 'Deny' | 'MFA Challenge';
  ip: string;
}

interface ComplianceMetric {
  standard: string; // e.g., GDPR, CSL
  score: number;
  status: 'Pass' | 'Warning' | 'Fail';
}

// --- Mock Data ---

const DATA_ASSETS: DataAsset[] = [
  { id: 'DA-001', name: 'Customer_PII_Main', category: 'Identity', sensitivity: 'L4', encryption: 'AES-256', accessCount: 120, riskScore: 15, owner: 'Data Steward A' },
  { id: 'DA-002', name: 'Transaction_History', category: 'Finance', sensitivity: 'L3', encryption: 'Masking', accessCount: 850, riskScore: 5, owner: 'Finance Ops' },
  { id: 'DA-003', name: 'Behavior_Logs_Raw', category: 'Behavior', sensitivity: 'L2', encryption: 'None', accessCount: 2400, riskScore: 2, owner: 'Marketing AI' },
  { id: 'DA-004', name: 'Contract_Documents', category: 'Legal', sensitivity: 'L3', encryption: 'RSA-2048', accessCount: 45, riskScore: 8, owner: 'Legal Dept' },
  { id: 'DA-005', name: 'Device_Telemetry', category: 'IoT', sensitivity: 'L1', encryption: 'None', accessCount: 15000, riskScore: 0, owner: 'IoT Ops' },
];

const ACCESS_LOGS: AccessLog[] = [
  { id: 'LOG-9921', time: '10:42:05', user: 'Li Wei', role: 'Sales', action: 'View Profile', resource: 'C-001 (PII)', result: 'Allow', ip: '192.168.1.45' },
  { id: 'LOG-9920', time: '10:41:58', user: 'API_GW_02', role: 'System', action: 'Bulk Export', resource: 'Transaction_History', result: 'Deny', ip: '10.0.5.2' },
  { id: 'LOG-9919', time: '10:41:12', user: 'Zhang Admin', role: 'Admin', action: 'Decrypt Key', resource: 'Key_Vault_Master', result: 'MFA Challenge', ip: '172.16.0.8' },
  { id: 'LOG-9918', time: '10:40:30', user: 'Wang Analyst', role: 'Analyst', action: 'Query', resource: 'Behavior_Logs_Raw', result: 'Allow', ip: '192.168.2.11' },
];

const COMPLIANCE_DATA: ComplianceMetric[] = [
  { standard: 'CSL (网络安全法)', score: 98, status: 'Pass' },
  { standard: 'PIPL (个保法)', score: 95, status: 'Pass' },
  { standard: 'GDPR (欧盟)', score: 88, status: 'Warning' },
  { standard: 'ISO 27001', score: 100, status: 'Pass' },
];

const THREAT_TREND = Array.from({length: 24}, (_, i) => ({
  time: i,
  threats: Math.floor(Math.random() * 5),
  blocked: Math.floor(Math.random() * 5) + 10
}));

const SENSITIVITY_DIST = [
  { name: 'L4 (绝密)', value: 5, color: '#ef4444' },
  { name: 'L3 (机密)', value: 15, color: '#f97316' },
  { name: 'L2 (内部)', value: 45, color: '#3b82f6' },
  { name: 'L1 (公开)', value: 35, color: '#10b981' },
];

// --- Helper Components ---

const SensitivityBadge = ({ level }: { level: SensitivityLevel }) => {
  const styles = {
    'L4': 'bg-red-950/40 text-red-400 border-red-800 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    'L3': 'bg-orange-950/40 text-orange-400 border-orange-800',
    'L2': 'bg-blue-900/40 text-blue-400 border-blue-800',
    'L1': 'bg-green-900/40 text-green-400 border-green-800',
  }[level];
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles}`}>{level}</span>;
};

const EncryptionIcon = ({ type }: { type: EncryptionType }) => {
  if (type === 'AES-256') return <Lock size={12} className="text-green-400" />;
  if (type === 'RSA-2048') return <Key size={12} className="text-purple-400" />;
  if (type === 'Masking') return <EyeOff size={12} className="text-blue-400" />;
  return <Unlock size={12} className="text-slate-500" />;
};

export const CustomerDataPrivacyView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState(DATA_ASSETS[0].id);
  const [maskingEnabled, setMaskingEnabled] = useState(true);

  const activeAsset = DATA_ASSETS.find(d => d.id === selectedAssetId) || DATA_ASSETS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#021812] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <ShieldCheck size={14} className="animate-pulse" /> Data Security Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户数据安全与 <span className="text-emerald-500">隐私保护堡垒</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Threat Level</div>
                <div className="text-xl font-mono font-bold text-green-400">LOW</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Protection Score</div>
                <div className="text-xl font-mono font-bold text-white">96.5</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Encrypted Assets</div>
                <div className="text-xl font-mono font-bold text-emerald-400">85%</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Identity & Access */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Access Control Radar */}
           <SciFiCard title="访问控制态势" subtitle="IAM METRICS" className="border-emerald-900/50">
              <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: '身份认证', A: 95, fullMark: 100 },
                          { subject: '最小权限', A: 88, fullMark: 100 },
                          { subject: '异常监控', A: 92, fullMark: 100 },
                          { subject: '特权管理', A: 85, fullMark: 100 },
                          { subject: '审计合规', A: 98, fullMark: 100 },
                      ]}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                          <Tooltip contentStyle={{backgroundColor: '#021812', borderColor: '#10b981', color: '#fff'}} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Real-time Access Stream */}
           <SciFiCard title="实时访问审计日志" subtitle="AUDIT TRAIL" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-0 relative h-full overflow-y-auto custom-scrollbar">
                   {/* Timeline Line */}
                   <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800"></div>
                   
                   {ACCESS_LOGS.map((log, i) => (
                       <div key={i} className="relative pl-6 py-2 group">
                           <div className={`absolute left-[6px] top-3.5 w-2 h-2 rounded-full border-2 border-[#0b1221] z-10 
                               ${log.result === 'Allow' ? 'bg-green-500' : log.result === 'Deny' ? 'bg-red-500' : 'bg-yellow-500'}
                           `}></div>
                           <div className="bg-slate-900/40 p-2 rounded border border-slate-800 hover:border-emerald-500/30 transition-colors">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                                   <span className={`text-[9px] px-1.5 rounded ${
                                       log.result === 'Allow' ? 'bg-green-900/20 text-green-400' : 
                                       log.result === 'Deny' ? 'bg-red-900/20 text-red-400' : 'bg-yellow-900/20 text-yellow-400'
                                   }`}>{log.result}</span>
                               </div>
                               <div className="text-xs font-bold text-slate-200">
                                   <span className="text-emerald-400">{log.user}</span> {log.action}
                               </div>
                               <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                                   <span className="truncate max-w-[100px]">{log.resource}</span>
                                   <span className="font-mono">{log.ip}</span>
                               </div>
                           </div>
                       </div>
                   ))}
                   
                   <div className="pl-6 py-2">
                        <div className="text-[10px] text-slate-600 animate-pulse">Monitoring access stream...</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Data Assets & Protection */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Classification & Encryption Status */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[320px]">
               
               {/* Data Asset Matrix */}
               <SciFiCard title="数据资产分级矩阵" subtitle="CLASSIFICATION" className="border-emerald-900/50 bg-[#05110e]">
                   <div className="flex flex-col h-full">
                       <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                           {['Identity', 'Finance', 'Legal', 'Behavior'].map(cat => (
                               <button key={cat} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 hover:text-white hover:border-emerald-500 transition-colors">
                                   {cat}
                               </button>
                           ))}
                       </div>
                       
                       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                           {DATA_ASSETS.map(asset => (
                               <div 
                                 key={asset.id}
                                 onClick={() => setSelectedAssetId(asset.id)}
                                 className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-all
                                    ${selectedAssetId === asset.id 
                                        ? 'bg-emerald-950/30 border-emerald-500/50' 
                                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                                 `}
                               >
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded bg-slate-950 ${asset.sensitivity === 'L4' ? 'text-red-400' : 'text-slate-400'}`}>
                                           <Database size={16} />
                                       </div>
                                       <div>
                                           <div className={`text-sm font-bold ${selectedAssetId === asset.id ? 'text-white' : 'text-slate-300'}`}>{asset.name}</div>
                                           <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                               {asset.category} • Owner: {asset.owner}
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex flex-col items-end gap-1">
                                       <SensitivityBadge level={asset.sensitivity} />
                                       <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                           <EncryptionIcon type={asset.encryption} /> {asset.encryption}
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

               {/* Active Protection Details */}
               <SciFiCard title="数据安全防护引擎" subtitle="ENCRYPTION CORE" className="border-emerald-900/50">
                   <div className="flex flex-col h-full gap-4">
                       
                       <div className="bg-slate-900/50 p-4 rounded border border-slate-700 flex items-start gap-4">
                           <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                               <Fingerprint size={32} className="text-emerald-400" />
                           </div>
                           <div className="flex-1">
                               <div className="flex justify-between items-start">
                                   <div>
                                       <div className="text-lg font-bold text-white">{activeAsset.name}</div>
                                       <div className="text-xs text-slate-400 font-mono">ID: {activeAsset.id}</div>
                                   </div>
                                   <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase">Risk Score</div>
                                        <div className={`text-xl font-bold ${activeAsset.riskScore > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {activeAsset.riskScore}/100
                                        </div>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* Dynamic Masking Demo */}
                       <div className="flex-1 bg-[#020610] rounded border border-slate-800 p-4 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2">
                               <div 
                                 className="flex items-center gap-2 cursor-pointer"
                                 onClick={() => setMaskingEnabled(!maskingEnabled)}
                               >
                                   <span className="text-[10px] text-slate-400">Dynamic Masking</span>
                                   {maskingEnabled ? <ToggleRight size={24} className="text-emerald-500"/> : <ToggleLeft size={24} className="text-slate-600"/>}
                               </div>
                           </div>

                           <div className="text-xs text-slate-500 mb-2 uppercase font-bold">Data Preview (Role: Analyst)</div>
                           <div className="space-y-2 font-mono text-sm">
                               <div className="flex justify-between border-b border-slate-800 pb-1">
                                   <span className="text-slate-400">Name:</span>
                                   <span className="text-emerald-300">{maskingEnabled ? 'Li ***' : 'Li Wei'}</span>
                               </div>
                               <div className="flex justify-between border-b border-slate-800 pb-1">
                                   <span className="text-slate-400">ID Card:</span>
                                   <span className="text-emerald-300">{maskingEnabled ? '310************88' : '310115199001018888'}</span>
                               </div>
                               <div className="flex justify-between border-b border-slate-800 pb-1">
                                   <span className="text-slate-400">Phone:</span>
                                   <span className="text-emerald-300">{maskingEnabled ? '139****1234' : '13900001234'}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-400">Address:</span>
                                   <span className="text-emerald-300">{maskingEnabled ? 'Shanghai Pudong ******' : 'Shanghai Pudong Century Ave 88'}</span>
                               </div>
                           </div>
                       </div>

                       <div className="flex gap-2">
                           <button className="flex-1 py-2 bg-slate-800 border border-slate-600 hover:border-emerald-500 text-slate-300 text-xs rounded transition-colors flex items-center justify-center gap-2">
                               <Key size={14} /> Rotate Keys
                           </button>
                           <button className="flex-1 py-2 bg-slate-800 border border-slate-600 hover:border-red-500 text-slate-300 text-xs rounded transition-colors flex items-center justify-center gap-2">
                               <Ban size={14} /> Revoke Access
                           </button>
                       </div>

                   </div>
               </SciFiCard>

           </div>

           {/* Bottom: Threat Intelligence & Distribution */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="威胁拦截趋势 (24H)" subtitle="WAF / DLP" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={THREAT_TREND}>
                               <defs>
                                   <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorBlock" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#333'}} />
                               <Area type="monotone" dataKey="blocked" stackId="1" stroke="#10b981" fill="url(#colorBlock)" name="Blocked" />
                               <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="url(#colorThreat)" name="Threats" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="敏感数据分布" subtitle="SENSITIVITY" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={SENSITIVITY_DIST} 
                                     innerRadius={40} 
                                     outerRadius={60} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {SENSITIVITY_DIST.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.color} />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#333'}} />
                               </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                               <span className="text-2xl font-bold text-white">4.2TB</span>
                               <span className="text-[9px] text-slate-500 uppercase">Total Data</span>
                           </div>
                       </div>
                       <div className="flex-1 space-y-2 pr-4">
                           {SENSITIVITY_DIST.map((item, i) => (
                               <div key={i} className="flex justify-between items-center text-xs">
                                   <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                       <span className="text-slate-300">{item.name}</span>
                                   </div>
                                   <span className="font-mono text-white">{item.value}%</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Compliance & Governance */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Compliance Scorecard */}
           <SciFiCard title="合规遵从性 (Compliance)" subtitle="STANDARDS" className="border-emerald-900/50">
               <div className="flex flex-col gap-3">
                   {COMPLIANCE_DATA.map((comp, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded">
                           <div>
                               <div className="text-xs font-bold text-white mb-1">{comp.standard}</div>
                               <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${comp.score === 100 ? 'bg-green-500' : comp.score > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                     style={{width: `${comp.score}%`}}
                                   ></div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className={`text-lg font-bold ${comp.status === 'Pass' ? 'text-green-400' : 'text-yellow-400'}`}>
                                   {comp.score}
                               </div>
                               <div className="text-[9px] text-slate-500 uppercase">{comp.status}</div>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-4 py-2 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 hover:text-white hover:border-emerald-500 flex items-center justify-center gap-2 transition-colors">
                   <FileText size={14} /> Generate Compliance Report
               </button>
           </SciFiCard>

           {/* Policy Controls */}
           <SciFiCard title="安全策略控制" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors">
                       <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-200">Force MFA</span>
                           <span className="text-[9px] text-slate-500">Require 2FA for L3+ access</span>
                       </div>
                       <ToggleRight size={24} className="text-green-500 cursor-pointer" />
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors">
                       <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-200">Geo-Fencing</span>
                           <span className="text-[9px] text-slate-500">Block non-CN IP addresses</span>
                       </div>
                       <ToggleRight size={24} className="text-green-500 cursor-pointer" />
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors">
                       <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-200">Session Timeout</span>
                           <span className="text-[9px] text-slate-500">Auto-lock after 15 mins</span>
                       </div>
                       <ToggleRight size={24} className="text-green-500 cursor-pointer" />
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors">
                       <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-200">API Throttling</span>
                           <span className="text-[9px] text-slate-500">Limit external requests</span>
                       </div>
                       <ToggleLeft size={24} className="text-slate-600 cursor-pointer" />
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
