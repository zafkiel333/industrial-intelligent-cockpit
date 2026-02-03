
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Shield, FileCheck, AlertTriangle, 
  Calendar, Clock, CheckCircle2, XCircle, 
  Scan, Upload, Download, Eye, FileText,
  BadgeCheck, Lock, History, Filter, Plus, Database
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

// --- Types ---

type CertStatus = 'Valid' | 'Expiring' | 'Expired' | 'Missing' | 'Auditing';

interface Certificate {
  id: string;
  type: string;
  name: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  status: CertStatus;
  issuer: string;
  confidence: number; // AI Verification score
  lastAudit: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  trustLevel: 'A' | 'B' | 'C' | 'D';
  complianceScore: number;
  certificates: Certificate[];
  riskDimensions: { subject: string; A: number; fullMark: number }[];
}

// --- Mock Data ---

const CUSTOMERS: CustomerProfile[] = [
  {
    id: 'C-001',
    name: 'Shanghai Heavy Industries Ltd.',
    trustLevel: 'A',
    complianceScore: 95,
    riskDimensions: [
      { subject: 'Legal Identity', A: 100, fullMark: 100 },
      { subject: 'Financial Health', A: 90, fullMark: 100 },
      { subject: 'Safety Record', A: 95, fullMark: 100 },
      { subject: 'Quality Certs', A: 100, fullMark: 100 },
      { subject: 'Env Compliance', A: 85, fullMark: 100 },
    ],
    certificates: [
      { id: 'doc-1', type: 'Basic', name: 'Business License', docNumber: '91310000X...', issueDate: '2020-01-01', expiryDate: '2040-01-01', status: 'Valid', issuer: 'SAMR', confidence: 99, lastAudit: '2024-01-15' },
      { id: 'doc-2', type: 'Permit', name: 'Safety Production Permit', docNumber: '(Hu) FM-2021-005', issueDate: '2021-05-20', expiryDate: '2024-05-19', status: 'Expiring', issuer: 'Emergency Bureau', confidence: 98, lastAudit: '2023-12-10' },
      { id: 'doc-3', type: 'ISO', name: 'ISO 9001:2015', docNumber: 'CN/18/12345', issueDate: '2022-03-10', expiryDate: '2025-03-09', status: 'Valid', issuer: 'SGS', confidence: 95, lastAudit: '2023-03-10' },
      { id: 'doc-4', type: 'Tax', name: 'Tax Registration', docNumber: 'T-310115...', issueDate: '2019-06-01', expiryDate: 'Permanent', status: 'Valid', issuer: 'Tax Bureau', confidence: 100, lastAudit: '2023-06-01' },
      { id: 'doc-5', type: 'Env', name: 'Pollution Discharge Permit', docNumber: '-', issueDate: '-', expiryDate: '-', status: 'Missing', issuer: 'Env Bureau', confidence: 0, lastAudit: '-' },
    ]
  },
  {
    id: 'C-002',
    name: 'Pacific Power Group',
    trustLevel: 'B',
    complianceScore: 78,
    riskDimensions: [
      { subject: 'Legal Identity', A: 100, fullMark: 100 },
      { subject: 'Financial Health', A: 70, fullMark: 100 },
      { subject: 'Safety Record', A: 80, fullMark: 100 },
      { subject: 'Quality Certs', A: 60, fullMark: 100 },
      { subject: 'Env Compliance', A: 80, fullMark: 100 },
    ],
    certificates: [
      { id: 'doc-6', type: 'Basic', name: 'Business License', docNumber: '91110000Y...', issueDate: '2018-11-11', expiryDate: '2038-11-11', status: 'Valid', issuer: 'SAMR', confidence: 99, lastAudit: '2023-11-11' },
      { id: 'doc-7', type: 'ISO', name: 'ISO 14001', docNumber: 'CN/19/54321', issueDate: '2020-02-20', expiryDate: '2023-02-19', status: 'Expired', issuer: 'TUV', confidence: 90, lastAudit: '2023-01-01' },
    ]
  }
];

const COLORS = {
  Valid: '#10b981',
  Expiring: '#f59e0b',
  Expired: '#ef4444',
  Missing: '#64748b',
  Auditing: '#3b82f6'
};

export const CustomerCertificatesView: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMERS[0].id);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(CUSTOMERS[0].certificates[0].id);
  const [filterType, setFilterType] = useState('All');

  const activeCustomer = CUSTOMERS.find(c => c.id === selectedCustomerId) || CUSTOMERS[0];
  const activeCert = activeCustomer.certificates.find(c => c.id === selectedCertId);

  const filteredCerts = activeCustomer.certificates.filter(c => filterType === 'All' || c.status === filterType);

  // Stats for Pie Chart
  const statusStats = [
    { name: 'Valid', value: activeCustomer.certificates.filter(c => c.status === 'Valid').length },
    { name: 'Warning', value: activeCustomer.certificates.filter(c => c.status === 'Expiring' || c.status === 'Auditing').length },
    { name: 'Critical', value: activeCustomer.certificates.filter(c => c.status === 'Expired' || c.status === 'Missing').length },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0c1626] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Shield size={14} /> Compliance & Risk Control
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             资质证照 <span className="text-cyan-500">合规金库</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">
                <Clock size={14} /> Next Audit: 3 Days
            </div>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_10px_rgba(8,145,178,0.3)]">
               <Upload size={14} /> 上传新证照
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer Portfolio */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search entity..." 
                className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
              />
           </div>

           <div className="flex flex-col gap-3">
               {CUSTOMERS.map(cust => (
                   <div 
                     key={cust.id}
                     onClick={() => { setSelectedCustomerId(cust.id); setSelectedCertId(cust.certificates[0]?.id); }}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCustomerId === cust.id 
                            ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {selectedCustomerId === cust.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                       
                       <div className="flex justify-between items-start mb-2">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2
                               ${cust.trustLevel === 'A' ? 'border-green-500 text-green-400 bg-green-900/20' : 
                                 cust.trustLevel === 'B' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/20' : 
                                 'border-red-500 text-red-400 bg-red-900/20'}
                           `}>
                               {cust.trustLevel}
                           </div>
                           <span className="text-xs font-mono text-slate-500">Score: {cust.complianceScore}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${selectedCustomerId === cust.id ? 'text-white' : 'text-slate-300'}`}>
                           {cust.name}
                       </h3>
                       
                       {/* Mini Status Bar */}
                       <div className="flex gap-1 mt-2">
                           {cust.certificates.slice(0, 5).map((c, i) => (
                               <div key={i} className="h-1 flex-1 rounded-full" style={{backgroundColor: COLORS[c.status]}}></div>
                           ))}
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Certificate Vault */}
        <div className="flex-1 flex flex-col gap-6">
           
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-32">
               
               {/* Radar Score */}
               <SciFiCard className="border-slate-800 bg-[#0b1221]" noPadding>
                   <div className="flex items-center h-full px-2">
                       <div className="w-24 h-24 flex-shrink-0">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeCustomer.riskDimensions}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={false} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Score" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 pl-2">
                           <div className="text-xs text-slate-500 uppercase">Compliance Index</div>
                           <div className="text-3xl font-bold text-white">{activeCustomer.complianceScore}</div>
                           <div className="text-[10px] text-green-400 mt-1">▲ 2.5% vs Last Year</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Status Breakdown */}
               <SciFiCard className="border-slate-800 bg-[#0b1221]" noPadding>
                   <div className="flex items-center h-full px-4 gap-4">
                       <div className="w-16 h-16 relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie data={statusStats} innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                                       <Cell fill="#10b981" />
                                       <Cell fill="#f59e0b" />
                                       <Cell fill="#ef4444" />
                                   </Pie>
                               </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500">
                               {activeCustomer.certificates.length}
                           </div>
                       </div>
                       <div className="flex-1 space-y-1">
                           <div className="flex justify-between text-xs"><span className="text-green-400">Valid</span> <span>{statusStats[0].value}</span></div>
                           <div className="flex justify-between text-xs"><span className="text-yellow-400">Warning</span> <span>{statusStats[1].value}</span></div>
                           <div className="flex justify-between text-xs"><span className="text-red-400">Critical</span> <span>{statusStats[2].value}</span></div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Action Prompt */}
               <SciFiCard className="border-slate-800 bg-gradient-to-br from-yellow-900/10 to-[#0b1221] flex flex-col justify-center px-4">
                   <div className="flex items-start gap-3">
                       <AlertTriangle className="text-yellow-500 mt-1" size={20} />
                       <div>
                           <div className="text-sm font-bold text-yellow-100">Action Required</div>
                           <div className="text-xs text-yellow-500/80 mt-1">1 Permit expiring in 15 days.</div>
                           <div className="text-xs text-yellow-500/80">1 Environmental cert missing.</div>
                       </div>
                   </div>
               </SciFiCard>
           </div>

           {/* Filter Bar */}
           <div className="flex items-center gap-2 overflow-x-auto pb-1">
               {['All', 'Valid', 'Expiring', 'Missing', 'Expired'].map(type => (
                   <button 
                     key={type}
                     onClick={() => setFilterType(type)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap
                        ${filterType === type 
                            ? 'bg-slate-800 text-white border-slate-600' 
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800/50'}
                     `}
                   >
                       {type} {type === 'All' ? activeCustomer.certificates.length : activeCustomer.certificates.filter(c => c.status === type).length}
                   </button>
               ))}
               <div className="flex-1"></div>
               <button className="p-1.5 text-slate-400 hover:text-white"><Filter size={16}/></button>
           </div>

           {/* Certificate Grid (The Vault) */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-1 custom-scrollbar flex-1 content-start">
               {filteredCerts.map(cert => (
                   <div 
                     key={cert.id}
                     onClick={() => setSelectedCertId(cert.id)}
                     className={`relative bg-[#0f1521] border rounded-lg p-4 cursor-pointer transition-all duration-300 group overflow-hidden h-40 flex flex-col justify-between
                        ${selectedCertId === cert.id ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {/* Background Pattern */}
                       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                       
                       {/* Header */}
                       <div className="flex justify-between items-start z-10">
                           <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                               {cert.type === 'Basic' ? <BadgeCheck size={18}/> : cert.type === 'Permit' ? <Lock size={18}/> : <FileText size={18}/>}
                           </div>
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border
                               ${cert.status === 'Valid' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                                 cert.status === 'Expiring' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50' : 
                                 cert.status === 'Missing' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-red-900/20 text-red-400 border-red-900/50'}
                           `}>
                               {cert.status}
                           </span>
                       </div>

                       {/* Body */}
                       <div className="z-10">
                           <div className="text-sm font-bold text-slate-200 line-clamp-1 mb-1" title={cert.name}>{cert.name}</div>
                           <div className="text-[10px] text-slate-500 font-mono">{cert.docNumber}</div>
                       </div>

                       {/* Footer / Expiry Bar */}
                       <div className="z-10">
                           <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                               <span>Exp: {cert.expiryDate}</span>
                               {cert.status === 'Expiring' && <span className="text-yellow-500 animate-pulse">! 15 days</span>}
                           </div>
                           {cert.status !== 'Missing' && (
                               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full rounded-full" 
                                     style={{
                                         width: '75%', 
                                         backgroundColor: COLORS[cert.status]
                                     }}
                                   ></div>
                               </div>
                           )}
                       </div>

                       {selectedCertId === cert.id && (
                           <div className="absolute inset-0 border-2 border-cyan-500 rounded-lg pointer-events-none"></div>
                       )}
                   </div>
               ))}
               
               {/* Add New Placeholder */}
               <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-900/30 transition-colors cursor-pointer h-40">
                   <Plus size={24} />
                   <span className="text-xs font-bold">Add Document</span>
               </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Inspector */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {activeCert ? (
               <>
                   {/* Verification Status */}
                   <SciFiCard title="智能核验终端" subtitle="AI-OCR" className="border-cyan-900/50">
                       <div className="flex flex-col items-center py-4 border-b border-slate-800 mb-4">
                           <div className="relative mb-3">
                               <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold
                                   ${activeCert.confidence > 90 ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}
                               `}>
                                   {activeCert.confidence}%
                               </div>
                               <div className="absolute -bottom-2 bg-slate-900 px-2 text-[10px] text-slate-400">Confidence</div>
                           </div>
                           <div className="text-xs text-slate-400 text-center">
                               AI Verification Status: <span className="text-white font-bold">PASSED</span>
                           </div>
                       </div>

                       <div className="space-y-3">
                           <div className="flex items-center gap-2 text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                               <Scan size={14} className="text-cyan-400" />
                               <span className="text-slate-300">Format Check</span>
                               <CheckCircle2 size={12} className="text-green-500 ml-auto" />
                           </div>
                           <div className="flex items-center gap-2 text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                               <Database size={14} className="text-cyan-400" />
                               <span className="text-slate-300">Master Data Match</span>
                               <CheckCircle2 size={12} className="text-green-500 ml-auto" />
                           </div>
                           <div className="flex items-center gap-2 text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                               <Shield size={14} className="text-cyan-400" />
                               <span className="text-slate-300">Official Database Sync</span>
                               <CheckCircle2 size={12} className="text-green-500 ml-auto" />
                           </div>
                       </div>
                   </SciFiCard>

                   {/* Meta Details */}
                   <SciFiCard title="证照元数据" className="flex-1 border-slate-800">
                       <div className="space-y-4">
                           <div>
                               <div className="text-[10px] text-slate-500 uppercase mb-1">Document Name</div>
                               <div className="text-sm font-bold text-white">{activeCert.name}</div>
                           </div>
                           <div>
                               <div className="text-[10px] text-slate-500 uppercase mb-1">Cert Number</div>
                               <div className="text-sm font-mono text-cyan-300 bg-slate-900/50 p-1.5 rounded border border-slate-700">
                                   {activeCert.docNumber}
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <div className="text-[10px] text-slate-500 uppercase mb-1">Issue Date</div>
                                   <div className="text-sm text-slate-200">{activeCert.issueDate}</div>
                               </div>
                               <div>
                                   <div className="text-[10px] text-slate-500 uppercase mb-1">Issuer</div>
                                   <div className="text-sm text-slate-200">{activeCert.issuer}</div>
                               </div>
                           </div>
                           
                           {/* Actions */}
                           <div className="grid grid-cols-2 gap-2 mt-4">
                               <button className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-xs text-slate-300 transition-colors">
                                   <Eye size={14} /> Preview
                               </button>
                               <button className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-xs text-slate-300 transition-colors">
                                   <History size={14} /> Audit Log
                               </button>
                           </div>
                           
                           {activeCert.status === 'Expiring' && (
                               <button className="w-full py-2 bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded flex items-center justify-center gap-2 mt-2 hover:bg-yellow-900/50 transition-colors">
                                   <AlertTriangle size={14} /> Initiate Renewal Workflow
                               </button>
                           )}
                       </div>
                   </SciFiCard>
               </>
           ) : (
               <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded bg-slate-900/30">
                   Select a certificate to view details
               </div>
           )}

        </div>

      </div>
    </div>
  );
};
