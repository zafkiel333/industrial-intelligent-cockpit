
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Shield, Lock, Unlock, Eye, EyeOff, 
  Share2, Globe, Server, UserCog, Key, 
  FileKey, AlertOctagon, Activity, RefreshCw,
  ToggleLeft, ToggleRight, Fingerprint, Network,
  Ban, CheckCircle2, Users
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// --- Types ---

type SensitivityLevel = 'L1' | 'L2' | 'L3' | 'L4';
type MaskingRule = 'None' | 'Partial' | 'Full' | 'Hash';

interface DataFieldRule {
  id: string;
  field: string;
  category: string;
  sensitivity: SensitivityLevel;
  masking: MaskingRule;
  encryption: boolean;
}

interface RoleProfile {
  id: string;
  name: string;
  level: number;
  usersCount: number;
  description: string;
  permissions: string[];
}

interface IntegrationChannel {
  id: string;
  name: string;
  type: 'Inbound' | 'Outbound' | 'Bi-directional';
  status: 'Active' | 'Paused' | 'Blocked';
  protocol: 'REST API' | 'SOAP' | 'SFTP';
  lastSync: string;
  volume: string;
}

// --- Mock Data ---

const ROLES: RoleProfile[] = [
  { id: 'admin', name: 'Global Administrator', level: 10, usersCount: 3, description: 'Full access to all data and configurations.', permissions: ['All'] },
  { id: 'manager', name: 'Data Steward (Manager)', level: 5, usersCount: 12, description: 'Can view/edit PII, approve sharing requests.', permissions: ['Read', 'Write', 'Approve'] },
  { id: 'sales', name: 'Sales Representative', level: 3, usersCount: 45, description: 'View assigned customers. PII masked by default.', permissions: ['Read-Assigned'] },
  { id: 'analyst', name: 'Data Analyst', level: 2, usersCount: 8, description: 'Access to aggregated/anonymized datasets only.', permissions: ['Read-Aggregated'] },
  { id: 'api', name: 'External API Client', level: 1, usersCount: 5, description: 'Machine account for 3rd party integrations.', permissions: ['API-Read'] },
];

const DATA_RULES: DataFieldRule[] = [
  { id: 'f1', field: 'Customer Name', category: 'Basic Info', sensitivity: 'L1', masking: 'None', encryption: false },
  { id: 'f2', field: 'Phone Number', category: 'Contact', sensitivity: 'L3', masking: 'Partial', encryption: true },
  { id: 'f3', field: 'Email Address', category: 'Contact', sensitivity: 'L3', masking: 'Partial', encryption: true },
  { id: 'f4', field: 'Tax ID / USCC', category: 'Legal', sensitivity: 'L2', masking: 'None', encryption: false },
  { id: 'f5', field: 'Bank Account', category: 'Financial', sensitivity: 'L4', masking: 'Full', encryption: true },
  { id: 'f6', field: 'Credit Limit', category: 'Financial', sensitivity: 'L3', masking: 'None', encryption: true },
  { id: 'f7', field: 'Contract Value', category: 'Commercial', sensitivity: 'L2', masking: 'None', encryption: false },
];

const INTEGRATIONS: IntegrationChannel[] = [
  { id: 'int-1', name: 'Salesforce CRM', type: 'Bi-directional', status: 'Active', protocol: 'REST API', lastSync: '2 min ago', volume: '1.2 GB/d' },
  { id: 'int-2', name: 'SAP ERP (Finance)', type: 'Inbound', status: 'Active', protocol: 'SOAP', lastSync: '1 hour ago', volume: '500 MB/d' },
  { id: 'int-3', name: 'Marketing Automation', type: 'Outbound', status: 'Paused', protocol: 'REST API', lastSync: '2 days ago', volume: '0 B/d' },
];

const AUDIT_LOGS = [
  { time: '10:42:05', user: 'Li Wei (Sales)', action: 'View Profile', target: 'C-001', status: 'Success' },
  { time: '10:41:12', user: 'API-Gateway', action: 'Bulk Export', target: 'Dataset-A', status: 'Blocked', reason: 'Rate Limit' },
  { time: '10:35:00', user: 'Admin', action: 'Change Permission', target: 'Role: Sales', status: 'Success' },
  { time: '10:30:22', user: 'Unknown', action: 'Login Attempt', target: 'System', status: 'Blocked', reason: 'Bad IP' },
];

const SECURITY_SCORE_DATA = [
  { subject: 'Encryption', A: 95, fullMark: 100 },
  { subject: 'Access Control', A: 88, fullMark: 100 },
  { subject: 'Audit Logging', A: 100, fullMark: 100 },
  { subject: 'Data Masking', A: 85, fullMark: 100 },
  { subject: 'Compliance', A: 92, fullMark: 100 },
];

// --- Helper Components ---

const SensitivityTag = ({ level }: { level: SensitivityLevel }) => {
  const colors = {
    'L1': 'bg-green-900/40 text-green-400 border-green-700/50', // Public
    'L2': 'bg-blue-900/40 text-blue-400 border-blue-700/50',   // Internal
    'L3': 'bg-orange-900/40 text-orange-400 border-orange-700/50', // Confidential
    'L4': 'bg-red-900/40 text-red-400 border-red-700/50',     // Top Secret
  }[level];
  return <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${colors}`}>{level}</span>;
};

const MaskingVisualizer = ({ rule, value }: { rule: MaskingRule, value: string }) => {
  if (rule === 'None') return <span className="font-mono text-white">{value}</span>;
  if (rule === 'Full') return <span className="font-mono text-slate-500 tracking-widest">********</span>;
  if (rule === 'Hash') return <span className="font-mono text-xs text-slate-500 truncate max-w-[100px] inline-block align-bottom">e10adc3949ba...</span>;
  // Partial (Assume Phone/Email logic)
  return <span className="font-mono text-cyan-300">138****1234</span>;
};

export const CustomerSecurityView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('sales');
  const [dataRules, setDataRules] = useState(DATA_RULES);

  const toggleMasking = (id: string) => {
    setDataRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = r.masking === 'None' ? 'Partial' : r.masking === 'Partial' ? 'Full' : 'None';
        return { ...r, masking: next };
      }
      return r;
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#051119] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Shield size={14} /> Data Governance & Security
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             数据权限与 <span className="text-cyan-500">共享边界控制</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Security Score</div>
                <div className="text-xl font-mono font-bold text-green-400">92/100</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Active Sessions</div>
                <div className="text-xl font-mono font-bold text-white">42</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]">
               <AlertOctagon size={14} /> 紧急封锁
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Role Hierarchy */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1">
           
           <SciFiCard title="角色与身份 (RBAC)" subtitle="HIERARCHY" className="h-full border-cyan-900/50">
               <div className="flex flex-col gap-3 h-full">
                   {ROLES.map(role => (
                       <div 
                         key={role.id}
                         onClick={() => setSelectedRole(role.id)}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                            ${selectedRole === role.id 
                                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                   <UserCog size={14} className={selectedRole === role.id ? 'text-white' : 'text-slate-500'}/>
                                   <span className={`text-sm font-bold ${selectedRole === role.id ? 'text-cyan-100' : 'text-slate-300'}`}>{role.name}</span>
                               </div>
                               <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Lv.{role.level}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 leading-tight mb-2">{role.description}</p>
                           <div className="flex justify-between items-center text-[10px]">
                               <span className="text-slate-400 flex items-center gap-1"><Users size={10}/> {role.usersCount} Users</span>
                               <span className="text-cyan-600 font-mono">ID: {role.id}</span>
                           </div>
                       </div>
                   ))}
                   
                   <button className="mt-auto w-full py-2 border border-dashed border-slate-600 text-slate-400 text-xs rounded hover:text-white hover:border-cyan-500 transition-all flex items-center justify-center gap-2">
                       <Key size={12} /> Configure Permissions
                   </button>
               </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Data Matrix & Masking */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* The Matrix */}
           <SciFiCard title="数据敏感度与脱敏矩阵" subtitle="DATA GOVERNANCE" className="flex-1 border-cyan-900/50 bg-[#080c14]" noPadding>
               <div className="w-full overflow-x-auto">
                   <table className="w-full text-left text-sm">
                       <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400">
                           <tr>
                               <th className="px-6 py-4">Data Field</th>
                               <th className="px-6 py-4">Category</th>
                               <th className="px-6 py-4">Sensitivity</th>
                               <th className="px-6 py-4">Encryption</th>
                               <th className="px-6 py-4">Masking Rule</th>
                               <th className="px-6 py-4 text-right">Role Preview</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/50">
                           {dataRules.map((rule) => (
                               <tr key={rule.id} className="hover:bg-cyan-900/10 transition-colors group">
                                   <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                       <FileKey size={14} className="text-slate-500 group-hover:text-cyan-400" />
                                       {rule.field}
                                   </td>
                                   <td className="px-6 py-4 text-slate-400 text-xs">{rule.category}</td>
                                   <td className="px-6 py-4">
                                       <SensitivityTag level={rule.sensitivity} />
                                   </td>
                                   <td className="px-6 py-4">
                                       <div className="flex items-center gap-2">
                                           {rule.encryption ? <Lock size={14} className="text-green-500"/> : <Unlock size={14} className="text-slate-600"/>}
                                           <span className={`text-xs ${rule.encryption ? 'text-green-400' : 'text-slate-500'}`}>
                                               {rule.encryption ? 'AES-256' : 'Plain'}
                                           </span>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4">
                                       <button 
                                         onClick={() => toggleMasking(rule.id)}
                                         className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-600 rounded hover:border-cyan-500 transition-colors"
                                       >
                                           {rule.masking === 'None' ? <Eye size={12}/> : <EyeOff size={12} className="text-cyan-400"/>}
                                           <span className="text-xs">{rule.masking}</span>
                                       </button>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                       <MaskingVisualizer rule={selectedRole === 'admin' ? 'None' : rule.masking} value="Example" />
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </SciFiCard>

           {/* Security Charts Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="数据访问热度" subtitle="24H TRAFFIC" className="border-slate-800">
                   <div className="h-full w-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length: 24}, (_, i) => ({ time: i, traffic: Math.random() * 100 }))}>
                               <defs>
                                   <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis hide />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                               <Area type="monotone" dataKey="traffic" stroke="#0ea5e9" fill="url(#colorTraffic)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="安全合规雷达" subtitle="ASSESSMENT" className="border-slate-800">
                   <div className="h-full w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SECURITY_SCORE_DATA}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Integration & Audit */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Sharing Boundaries */}
           <SciFiCard title="外部共享边界 (Integrations)" subtitle="GATEWAY" className="border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   {INTEGRATIONS.map(int => (
                       <div key={int.id} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors group">
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                   <div className={`p-1.5 rounded bg-slate-800 ${int.status === 'Active' ? 'text-green-400' : int.status === 'Paused' ? 'text-yellow-400' : 'text-red-400'}`}>
                                       {int.type === 'Bi-directional' ? <RefreshCw size={12}/> : int.type === 'Inbound' ? <Server size={12}/> : <Share2 size={12}/>}
                                   </div>
                                   <span className="font-bold text-sm text-slate-200">{int.name}</span>
                               </div>
                               <div className="relative">
                                   {int.status === 'Active' ? <ToggleRight size={24} className="text-green-500 cursor-pointer"/> : <ToggleLeft size={24} className="text-slate-600 cursor-pointer"/>}
                               </div>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-500">
                               <span>{int.protocol}</span>
                               <span className="font-mono text-cyan-500">{int.volume}</span>
                           </div>
                           <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                               <div className={`h-full ${int.status === 'Active' ? 'bg-cyan-500' : 'bg-slate-600'} animate-pulse`} style={{width: '60%'}}></div>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-4 py-2 bg-slate-800 border border-dashed border-slate-600 rounded text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
                   <Network size={12} /> Configure API Gateway
               </button>
           </SciFiCard>

           {/* Audit Stream */}
           <SciFiCard title="安全审计日志 (Audit Log)" subtitle="REAL-TIME" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-0 h-full overflow-y-auto custom-scrollbar relative">
                   {/* Timeline Line */}
                   <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800"></div>
                   
                   {AUDIT_LOGS.map((log, i) => (
                       <div key={i} className="relative pl-8 py-2 group">
                           <div className={`absolute left-[7px] top-3.5 w-2 h-2 rounded-full border-2 border-[#0b1221] z-10 
                               ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}
                           `}></div>
                           <div className="text-[10px] text-slate-500 mb-0.5">{log.time}</div>
                           <div className="text-xs text-slate-200 font-bold">{log.action}</div>
                           <div className="text-[10px] text-slate-400">
                               User: <span className="text-cyan-300">{log.user}</span>
                           </div>
                           <div className="text-[10px] text-slate-500 truncate">Target: {log.target}</div>
                           {log.reason && (
                               <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                   <Ban size={10} /> {log.reason}
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
