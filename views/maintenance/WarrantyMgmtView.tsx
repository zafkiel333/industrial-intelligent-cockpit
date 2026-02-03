
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldCheck, 
  Gavel, 
  Scale, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Coins, 
  Database, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronRight, 
  History,
  Briefcase,
  FileCheck,
  CheckCircle2,
  Lock,
  Stamp,
  Activity,
  Zap,
  ArrowRightLeft,
  // Added Fingerprint to the import list to resolve the missing reference on line 351
  Fingerprint
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

// --- 模拟数据 ---

const WARRANTY_DISTRIBUTION = [
  { name: '机械部件', value: 45, color: '#f59e0b' },
  { name: '电气控制', value: 25, color: '#0ea5e9' },
  { name: '液压系统', value: 20, color: '#8b5cf6' },
  { name: '辅助设施', value: 10, color: '#64748b' },
];

const CLAIM_FLUX_DATA = [
  { month: '01', applied: 12, recovered: 8 },
  { month: '02', applied: 15, recovered: 12 },
  { month: '03', applied: 8, recovered: 10 }, // 包含跨月回收
  { month: '04', applied: 22, recovered: 14 },
  { month: '05', applied: 18, recovered: 0 },
];

const ACTIVE_CLAIMS = [
  { id: 'CLM-9022', target: '主轴承裂纹缺陷', provider: '瑞典SKF', amount: '¥12.5w', status: 'Evidence', stage: '证据固化' },
  { id: 'CLM-9025', target: '变频器控制模块故障', provider: '博世自动化', amount: '¥4.8w', status: 'Negotiating', stage: '法律谈判' },
  { id: 'CLM-9029', target: '减速机密封批量渗油', provider: '通用重工', amount: '¥22.0w', status: 'Pending', stage: '初审通过' },
];

const WARRANTY_RADAR = [
  { subject: '合同合规性', A: 95, fullMark: 100 },
  { subject: '证据完整度', A: 88, fullMark: 100 },
  { subject: '索赔成功率', A: 92, fullMark: 100 },
  { subject: '响应时效', A: 85, fullMark: 100 },
  { subject: '风险规避', A: 90, fullMark: 100 },
];

export const WarrantyMgmtView: React.FC = () => {
  const [activeClaimId, setActiveClaimId] = useState(ACTIVE_CLAIMS[0].id);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：资产权益全景抬头 */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-amber-950/10 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-stone-800 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-amber-400/50 relative group">
              <ShieldCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Asset Rights & Warranty Intelligence
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 索赔与质保期 <span className="text-amber-500 italic">全息管理中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本年挽回损失</div>
              <div className="text-2xl font-mono font-bold text-green-400">¥ 1,425,800</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">待决索赔总额</div>
              <div className="text-2xl font-mono font-bold text-white">¥ 842,500</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">临期资产占比</div>
              <div className="text-2xl font-mono font-bold text-amber-500">12.5%</div>
           </div>
           {/* 背景动态光斑 */}
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：索赔实战流 (Active Claims) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Gavel size={14} className="text-amber-500" /> 索赔执行队列</span>
              <span>LIVE FEED</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {ACTIVE_CLAIMS.map(claim => (
                <div 
                  key={claim.id}
                  onClick={() => setActiveClaimId(claim.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeClaimId === claim.id 
                      ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-amber-500 font-bold">{claim.id}</span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
                       <Clock size={10} /> {claim.stage}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{claim.target}</div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-600 uppercase">供应商</span>
                        <span className="text-xs text-slate-300 font-bold">{claim.provider}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[9px] text-slate-600 uppercase">索赔估值</span>
                        <div className="text-sm font-bold text-amber-500 font-mono">{claim.amount}</div>
                     </div>
                  </div>
                  {activeClaimId === claim.id && (
                     <div className="absolute right-0 top-0 h-full w-0.5 bg-amber-500"></div>
                  )}
                </div>
              ))}
              <button className="w-full py-3 border border-dashed border-slate-700 text-slate-500 rounded text-xs hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2">
                 <PlusCircleIcon size={14} /> 发起新索赔申请
              </button>
           </div>
        </div>

        {/* 中枢：质保时空螺旋 (Main Visualization) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-amber-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          WARRANTY TIME-FLUX ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          权益 <span className="text-amber-500 italic">时空演化场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-amber-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">权益合规评分</div>
                       <div className="text-4xl font-mono font-bold text-amber-400 leading-none mt-1">94.2<span className="text-sm font-normal text-slate-600">/100</span></div>
                    </div>
                 </div>

                 {/* 底部摘要区 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <div className="p-2 bg-amber-900/30 rounded-full"><TrendingUp size={20} className="text-amber-400" /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">索赔成功指数</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">High / 高可靠</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20">查看合同原文</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">导出分析报告</button>
                    </div>
                 </div>
              </div>

              {/* 中央可视化图表：索赔趋势图 */}
              <div className="flex-1 w-full flex flex-col justify-center pointer-events-auto">
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={CLAIM_FLUX_DATA}>
                          <defs>
                             <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis hide />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #d97706', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area type="monotone" dataKey="applied" stroke="#f59e0b" strokeWidth={3} fill="url(#colorApplied)" name="申请金额" />
                          <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={3} fill="url(#colorRecovered)" name="回收金额" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-4 gap-4 mt-8 px-4">
                    {[
                      { label: '质保覆盖', val: '842', unit: 'Items', icon: <Database size={12}/> },
                      { label: '平均赔付期', val: '14.5', unit: 'Days', icon: <Clock size={12}/> },
                      { label: '拒赔率', val: '4.2', unit: '%', icon: <AlertTriangle size={12}/> },
                      { label: '存证节点', val: '15k+', unit: 'Hash', icon: <Zap size={12}/> },
                    ].map((kpi, i) => (
                      <div key={i} className="text-center group">
                         <div className="flex justify-center mb-1 text-slate-500 group-hover:text-amber-500 transition-colors">
                            {kpi.icon}
                         </div>
                         <div className="text-xl font-bold font-mono text-white leading-none">{kpi.val}</div>
                         <div className="text-[9px] text-slate-600 uppercase mt-1">{kpi.label}</div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 四角技术边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/40"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="质保到期热力分布" subtitle="EXPIRY_MAP">
                 <div className="h-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={WARRANTY_DISTRIBUTION} 
                            cx="50%" cy="50%" 
                            innerRadius={45} outerRadius={60} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                             {WARRANTY_DISTRIBUTION.map((entry, index) => (
                               <Cell key={index} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="pr-4 space-y-2">
                       {WARRANTY_DISTRIBUTION.map(item => (
                         <div key={item.name} className="flex items-center gap-2 text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-slate-400 truncate">{item.name}</span>
                            <span className="text-white font-bold ml-auto">{item.value}%</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="法律证据合规雷达" subtitle="EVIDENCE_AUDIT">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={WARRANTY_RADAR}>
                          <PolarGrid stroke="#1e1b4b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="合规分" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 风险审计与推演 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-1">
           
           <SciFiCard title="AI 权益审计建议" subtitle="AI_ADVISORY">
              <div className="space-y-4">
                 <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-amber-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase">发现索赔机遇</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “通过比对历史振动模型，发现 <span className="text-white font-bold">#4 压缩机</span> 的性能下降符合 <span className="text-amber-400">‘早期非预期磨损’</span> 条款。建议在质保到期前（距今12天）发起末次深度索赔。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Scale size={60} className="text-amber-500" />
                    </div>
                 </div>
                 
                 <div className="bg-slate-900/60 border border-slate-800 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">总体权益保障率</span>
                       <span className="text-xs text-green-400 font-bold">96.8%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[96%] shadow-[0_0_10px_#22c55e]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="索赔证据链摘要" subtitle="CASE_METADATA" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                    {[
                      { label: '物料缺陷实验室报告', date: '04-01', status: 'verified', icon: <MicroscopeIcon /> },
                      { label: '现场维修工时确认单', date: '03-28', status: 'verified', icon: <FileCheck size={14}/> },
                      { label: '供应商往来沟通邮件', date: '03-25', status: 'pending', icon: <ArrowRightLeft size={14}/> },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/50 transition-all">
                            {doc.icon}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-200 truncate">{doc.label}</div>
                            <div className="text-[9px] text-slate-500">{doc.date} Archive</div>
                         </div>
                         {doc.status === 'verified' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></div>}
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="bg-slate-950 p-3 rounded flex items-center justify-between border border-slate-800 cursor-pointer hover:border-amber-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          <Fingerprint size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase">电子签署节点</div>
                             <div className="text-xs font-bold text-white">Legal_Hash_0x7724</div>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-700" />
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs uppercase tracking-[0.2em] rounded shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <Stamp size={16} /> 提交最终索赔协议
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联合同管理系统</div>
                    <div className="text-xs font-bold text-white">Contract_Vault_2024.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.6);
        }
      `}</style>
    </div>
  );
};

const PlusCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const MicroscopeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v4a2 2 0 1 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
  </svg>
);
