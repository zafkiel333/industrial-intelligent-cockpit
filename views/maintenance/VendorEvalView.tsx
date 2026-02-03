
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { VendorThreeScene } from '../../components/maintenance_vendor/ThreeScene';
import { VendorNode } from '../../components/maintenance_vendor/three-types';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertOctagon, 
  Search, 
  Filter, 
  Star,
  ShieldCheck,
  Zap,
  Briefcase,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const VENDORS: VendorNode[] = [
  { id: 'V-001', name: '精工机电 (Precision Mech)', tier: 'strategic', score: 96, category: '机械维修', position: [0,0,0] },
  { id: 'V-002', name: '蓝海液压 (BlueOcean)', tier: 'strategic', score: 92, category: '液压系统', position: [0,0,0] },
  { id: 'V-003', name: '智控科技 (SmartControl)', tier: 'core', score: 88, category: '自动化', position: [0,0,0] },
  { id: 'V-004', name: '迅达物流 (SpeedLog)', tier: 'support', score: 75, category: '备件运输', position: [0,0,0] },
  { id: 'V-005', name: '安防卫士 (SecureGuard)', tier: 'core', score: 85, category: '安保消防', position: [0,0,0] },
  { id: 'V-006', name: '通力电力 (PowerLink)', tier: 'support', score: 65, category: '电力运维', position: [0,0,0] },
  { id: 'V-007', name: '环球清洗 (GlobalClean)', tier: 'support', score: 82, category: '工业清洗', position: [0,0,0] },
];

const PERFORMANCE_RADAR = {
  'V-001': [
    { subject: '维修质量', A: 98, fullMark: 100 },
    { subject: '响应速度', A: 95, fullMark: 100 },
    { subject: '成本控制', A: 85, fullMark: 100 },
    { subject: '安全合规', A: 100, fullMark: 100 },
    { subject: '技术能力', A: 96, fullMark: 100 },
  ],
  'V-006': [
    { subject: '维修质量', A: 70, fullMark: 100 },
    { subject: '响应速度', A: 60, fullMark: 100 },
    { subject: '成本控制', A: 80, fullMark: 100 },
    { subject: '安全合规', A: 65, fullMark: 100 },
    { subject: '技术能力', A: 75, fullMark: 100 },
  ]
};

const HISTORY_TREND = [
  { month: 'Jan', score: 92 }, { month: 'Feb', score: 94 },
  { month: 'Mar', score: 91 }, { month: 'Apr', score: 95 },
  { month: 'May', score: 96 }, { month: 'Jun', score: 96 },
];

const ACTIVE_CONTRACTS = [
  { id: 'C-2024-001', title: '主变压器年度维保', status: 'Active', value: '¥120w' },
  { id: 'C-2024-005', title: '紧急抢修备用协议', status: 'Standby', value: '¥50w' },
];

export const VendorEvalView: React.FC = () => {
  const [selectedVendorId, setSelectedVendorId] = useState('V-001');
  const [searchTerm, setSearchTerm] = useState('');

  const activeVendor = VENDORS.find(v => v.id === selectedVendorId) || VENDORS[0];
  const radarData = PERFORMANCE_RADAR[selectedVendorId as keyof typeof PERFORMANCE_RADAR] || PERFORMANCE_RADAR['V-001'];

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'strategic': return 'text-purple-400 bg-purple-950/30 border-purple-500/50';
      case 'core': return 'text-cyan-400 bg-cyan-950/30 border-cyan-500/50';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const filteredVendors = VENDORS.filter(v => v.name.includes(searchTerm) || v.category.includes(searchTerm));

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：生态看板 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-purple-600/20 border-2 border-purple-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              <Users size={32} className="text-purple-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Vendor Ecosystem Management
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 外包服务商 <span className="text-purple-500 italic">绩效评价中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">合作总数</div>
              <div className="text-xl font-mono font-bold text-white">24</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">战略伙伴</div>
              <div className="text-xl font-mono font-bold text-purple-400">03</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均绩效</div>
              <div className="text-xl font-mono font-bold text-green-400">89.2</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：服务商名录 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="服务商名录" subtitle="PARTNERS" highlight className="flex-1 border-purple-900/30">
              <div className="flex flex-col h-full">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="搜索服务商..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-purple-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {filteredVendors.map(vendor => (
                       <div 
                         key={vendor.id}
                         onClick={() => setSelectedVendorId(vendor.id)}
                         className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden flex justify-between items-center
                            ${selectedVendorId === vendor.id 
                               ? 'bg-purple-950/30 border-purple-500 shadow-lg' 
                               : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                          {selectedVendorId === vendor.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                          
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-white">{vendor.name}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getTierColor(vendor.tier)}`}>
                                   {vendor.tier}
                                </span>
                                <span className="text-[10px] text-slate-500">{vendor.category}</span>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <div className={`text-xl font-bold font-mono ${getScoreColor(vendor.score)}`}>{vendor.score}</div>
                             <div className="text-[9px] text-slate-600 uppercase">Score</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 rounded p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                 <AlertOctagon size={14} className="text-red-500" /> 待处理异常
              </div>
              <div className="text-[10px] bg-red-950/20 border border-red-900/50 p-2 rounded text-red-200">
                 <span className="font-bold">通力电力:</span> 本月累计出现 2 次响应超时，建议发起约谈。
              </div>
           </div>
        </div>

        {/* 中间：3D 生态星云 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#05020a] border border-purple-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs">
                          <Users size={14} className="animate-pulse" />
                          ECOSYSTEM TOPOLOGY
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Partner <span className="text-purple-500">Galaxy</span>
                       </div>
                    </div>
                 </div>

                 {/* 选中服务商详情悬浮窗 */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-80">
                     <div className="bg-slate-900/90 border border-purple-500/50 p-4 rounded backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">Selected Partner</div>
                              <div className="text-lg font-bold text-white">{activeVendor.name}</div>
                              <div className="text-xs text-slate-400">{activeVendor.category} • ID: {activeVendor.id}</div>
                           </div>
                           <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800">
                              <span className={`text-lg font-bold ${getScoreColor(activeVendor.score)}`}>{activeVendor.score}</span>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
                              <FileCheck size={14} /> 查看报告
                           </button>
                           <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 transition-all flex items-center justify-center gap-2">
                              <Briefcase size={14} /> 合同管理
                           </button>
                        </div>
                     </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <VendorThreeScene 
                    vendors={VENDORS} 
                    selectedVendorId={selectedVendorId}
                    onVendorSelect={setSelectedVendorId}
                 />
              </div>
              
              {/* 装饰背景 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(circle at center, transparent 0%, #05020a 100%)'}}></div>
           </div>
        </div>

        {/* 右侧：绩效深度画像 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="多维绩效雷达 (QCDST)" subtitle="EVALUATION" className="h-64 border-purple-900/30">
              <div className="w-full h-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Score" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#fff', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
                 <div className="absolute top-0 right-0 flex flex-col items-end pointer-events-none">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Rank Level</div>
                    <div className="flex gap-1 mt-1">
                       {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= (activeVendor.score/20) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'} />)}
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="历史评分趋势" subtitle="HISTORY" className="h-48 border-slate-800">
              <div className="w-full h-full pt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HISTORY_TREND}>
                       <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{value: '合格线', fill: '#f59e0b', fontSize: 8}} />
                       <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#colorScore)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="活跃服务合约" subtitle="CONTRACTS" className="flex-1">
              <div className="space-y-3">
                 {ACTIVE_CONTRACTS.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{c.title}</div>
                          <div className="text-[10px] text-slate-500">{c.id}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-bold text-white">{c.value}</div>
                          <span className={`text-[9px] px-1.5 rounded ${c.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                             {c.status}
                          </span>
                       </div>
                    </div>
                 ))}
                 
                 <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-green-900/20 hover:text-green-400 text-slate-400 rounded text-xs transition-colors flex items-center justify-center gap-1">
                        <ThumbsUp size={12} /> 续签推荐
                     </button>
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 rounded text-xs transition-colors flex items-center justify-center gap-1">
                        <ThumbsDown size={12} /> 发起警告
                     </button>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
