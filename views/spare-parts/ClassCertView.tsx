
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Award, 
  Database, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Globe, 
  Zap, 
  Activity,
  History,
  Lock,
  Stamp,
  ChevronRight,
  Gavel,
  Fingerprint,
  RotateCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';

const CERT_LOG = [
  { id: 'CERT-001', part: '主轴承', type: 'DNV', date: '2024-03-15', expiry: '2029-03', status: 'Valid' },
  { id: 'CERT-042', part: '气缸套', type: 'CCS', date: '2023-11-20', expiry: '2028-11', status: 'Valid' },
  { id: 'CERT-088', part: '高压油管', type: 'LR', date: '2024-02-10', expiry: '2025-02', status: 'warning' },
];

const COMPLIANCE_TREND = [
  { month: '01', val: 95 }, { month: '02', val: 96 },
  { month: '03', val: 98 }, { month: '04', val: 99 },
];

export const ClassCertView: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border-2 border-indigo-400/50 relative group">
              <Award size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maritime Class Certification & Provenance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船级社认证 <span className="text-indigo-500 italic">备件溯源服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">认证覆盖率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">100%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">待更新证书</div>
              <div className="text-2xl font-mono font-bold text-amber-500">01</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：证书名录 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="认证资产索引" subtitle="CERT_REGISTRY" highlight className="flex-1">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2 px-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="输入备件SN/证书号..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-indigo-500 transition-all" />
                 </div>
                 
                 {CERT_LOG.map(cert => (
                    <div 
                      key={cert.id}
                      className={`p-3 rounded border transition-all cursor-pointer relative group bg-slate-900 border-slate-800 hover:border-indigo-500/50`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-indigo-400 font-bold">{cert.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${cert.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{cert.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{cert.part} <span className="text-xs text-slate-500">[{cert.type}]</span></div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>过期: <span className={cert.status === 'warning' ? 'text-amber-400 font-bold' : 'text-slate-300'}>{cert.expiry}</span></span>
                          <span className="font-mono">{cert.date}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：数字化签署与区块链审计 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded-lg overflow-hidden flex flex-col p-8">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
                 <div className="w-32 h-32 rounded border-4 border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center relative mb-8">
                    <Fingerprint size={64} className="text-indigo-400 animate-pulse" />
                    <div className="absolute -inset-4 border border-dashed border-indigo-500/30 rounded animate-[spin_30s_linear_infinite]"></div>
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white uppercase tracking-[0.3em] mb-4">区块链证书存证系统</h2>
                 <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    所有备件材质证明 (MTC)、原产地证明 (COO) 及船级社认证证书均已通过分布式账本加密，确保在船舶全球运营中的技术合规可追溯性。
                 </p>

                 <div className="grid grid-cols-3 gap-6 w-full max-w-xl">
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
                       <div className="text-[10px] text-slate-500 uppercase mb-2">合约状态</div>
                       <div className="text-lg font-bold text-green-400">ACTIVE</div>
                    </div>
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
                       <div className="text-[10px] text-slate-500 uppercase mb-2">共识节点</div>
                       <div className="text-lg font-bold text-indigo-400">152</div>
                    </div>
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
                       <div className="text-[10px] text-slate-500 uppercase mb-2">最后同步</div>
                       <div className="text-lg font-bold text-white font-mono">0s ago</div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                 <button className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/30">签署认证报告</button>
                 <button className="px-10 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-[0.2em] border border-slate-700">调取原始图纸</button>
              </div>
           </div>

           <SciFiCard title="全船认证合规度趋势" subtitle="COMPLIANCE_FLUX" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={COMPLIANCE_TREND}>
                       <defs>
                          <linearGradient id="colorCert" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[90, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} fill="url(#colorCert)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：规则与审计 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           <SciFiCard title="AI 法律审计建议" subtitle="AI_ADVISORY" className="border-indigo-900/30 bg-indigo-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                       <Gavel size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">合规性风险提示</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “<span className="text-white font-bold">高压油管</span> 证书将于明年2月到期。由于其属于关键安全件，DNV 要求每 12 个月进行一次耐压试验记录核销。建议在本季度厂修中同步完成。”
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3 mt-auto">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 <span>同步 DNV/CCS 数据库</span>
                 <CheckCircle2 size={12} className="text-green-500" />
              </div>
              <div className="flex items-center gap-3">
                 <Database size={20} className="text-indigo-500" />
                 <div className="text-[10px] text-slate-400 italic">
                    “已成功匹配 124 项现役备件的电子证书哈希，数据一致性校验成功。”
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
