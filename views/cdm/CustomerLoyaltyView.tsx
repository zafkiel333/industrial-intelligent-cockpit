
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Crown, Gift, Coins, TrendingUp, 
  Users, Award, Star, Zap, 
  ArrowRight, Sparkles, Trophy, Gem,
  Ticket, RefreshCw, Layers, Shield,
  FileText, BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface TierInfo {
  level: string;
  name: string;
  count: number;
  growth: number;
  color: string;
  benefits: string[];
}

interface RewardItem {
  id: string;
  name: string;
  cost: number;
  category: 'Service' | 'Physical' | 'Digital';
  popularity: number;
  stock: number;
}

interface PointTransaction {
  id: string;
  user: string;
  action: string;
  points: number;
  type: 'Earn' | 'Burn';
  time: string;
}

// --- Mock Data ---

const TIERS: TierInfo[] = [
  { level: 'L1', name: '青铜会员 (Bronze)', count: 8540, growth: 12, color: '#94a3b8', benefits: ['基础支持', '积分累积'] },
  { level: 'L2', name: '白银会员 (Silver)', count: 3200, growth: 5, color: '#e2e8f0', benefits: ['优先响应', '95折配件'] },
  { level: 'L3', name: '黄金会员 (Gold)', count: 850, growth: 2, color: '#fbbf24', benefits: ['专属顾问', '季度巡检'] },
  { level: 'L4', name: '铂金会员 (Platinum)', count: 120, growth: 0.5, color: '#e0f2fe', benefits: ['24h 极速修', '备件库共享'] },
  { level: 'L5', name: '黑钻会员 (Diamond)', count: 15, growth: 0, color: '#1e293b', benefits: ['定制化研发', 'CEO直连'] },
];

const POINTS_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  issued: Math.floor(Math.random() * 50000) + 20000,
  redeemed: Math.floor(Math.random() * 30000) + 10000,
}));

const REWARDS: RewardItem[] = [
  { id: 'R-001', name: '年度维保服务包', cost: 50000, category: 'Service', popularity: 95, stock: 999 },
  { id: 'R-002', name: '备件急送抵扣券', cost: 5000, category: 'Service', popularity: 88, stock: 150 },
  { id: 'R-003', name: '高级操作员培训', cost: 20000, category: 'Service', popularity: 75, stock: 20 },
  { id: 'R-004', name: '定制工业平板', cost: 15000, category: 'Physical', popularity: 60, stock: 45 },
  { id: 'R-005', name: '数据分析报告 (高级版)', cost: 8000, category: 'Digital', popularity: 92, stock: 999 },
];

const RECENT_ACTIVITY: PointTransaction[] = [
  { id: 'TX-992', user: 'Shanghai Heavy', action: 'Purchase Contract', points: 15000, type: 'Earn', time: '10:42:05' },
  { id: 'TX-991', user: 'Pacific Power', action: 'Redeem Service Pack', points: -50000, type: 'Burn', time: '10:35:12' },
  { id: 'TX-990', user: 'AutoWorks GmbH', action: 'Referral Bonus', points: 5000, type: 'Earn', time: '10:15:00' },
  { id: 'TX-989', user: 'Quantum Tech', action: 'Survey Completion', points: 500, type: 'Earn', time: '09:55:30' },
  { id: 'TX-988', user: 'Northern Grid', action: 'Annual Renewal', points: 25000, type: 'Earn', time: '09:30:22' },
];

const ENGAGEMENT_RADAR = [
  { subject: '登录频次', A: 85, fullMark: 100 },
  { subject: '活动参与', A: 60, fullMark: 100 },
  { subject: '积分消耗', A: 75, fullMark: 100 },
  { subject: '内容互动', A: 90, fullMark: 100 },
  { subject: '推荐意愿', A: 88, fullMark: 100 },
  { subject: '品牌反馈', A: 70, fullMark: 100 },
];

// --- Components ---

const TierBadge = ({ level, color }: { level: string, color: string }) => (
  <div className="relative group cursor-pointer">
    <div className="absolute inset-0 blur-sm opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: color }}></div>
    <div className="relative w-12 h-12 flex items-center justify-center bg-[#0b1221] border border-slate-700 rounded-lg group-hover:border-white/50 transition-colors">
      <Crown size={20} style={{ color: color }} />
      <span className="absolute -bottom-2 text-[9px] font-bold px-1.5 rounded bg-slate-800 text-slate-300 border border-slate-600">{level}</span>
    </div>
  </div>
);

const RewardCard: React.FC<{ item: RewardItem }> = ({ item }) => (
  <div className="relative p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden">
    {/* Shine effect */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    
    <div className="flex justify-between items-start mb-2">
      <div className={`p-1.5 rounded ${item.category === 'Service' ? 'bg-blue-900/30 text-blue-400' : item.category === 'Physical' ? 'bg-amber-900/30 text-amber-400' : 'bg-purple-900/30 text-purple-400'}`}>
        {item.category === 'Service' ? <Wrench size={14} /> : item.category === 'Physical' ? <Box size={14} /> : <FileText size={14} />}
      </div>
      <div className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-400">Inventory: {item.stock}</div>
    </div>
    
    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white mb-1 line-clamp-1">{item.name}</h4>
    
    <div className="flex justify-between items-end mt-2">
      <div className="text-xs font-mono text-yellow-400 flex items-center gap-1">
        <Coins size={12} /> {item.cost.toLocaleString()}
      </div>
      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-green-500" style={{width: `${item.popularity}%`}}></div>
      </div>
    </div>
  </div>
);

function Wrench(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function Box(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

export const CustomerLoyaltyView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState('L3');
  
  const activeTierInfo = TIERS.find(t => t.level === selectedTier) || TIERS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#140a26] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <Gem size={14} className="animate-pulse" /> Customer Value Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户忠诚度 <span className="text-purple-500">与奖励体系</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Members</div>
                <div className="text-xl font-mono font-bold text-white">12,725</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Points Liability</div>
                <div className="text-xl font-mono font-bold text-yellow-400 flex items-center justify-end gap-1">
                    <Coins size={16}/> 45.2M
                </div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
               <Zap size={14} /> 发布新活动
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Membership Hierarchy */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1">
           
           <SciFiCard title="会员等级金字塔" subtitle="TIER STRUCTURE" className="h-full border-purple-900/50">
               <div className="flex flex-col gap-2 h-full">
                   {/* Pyramid List */}
                   <div className="flex-1 flex flex-col justify-center gap-3 py-4">
                       {TIERS.slice().reverse().map((tier) => (
                           <div 
                             key={tier.level}
                             onClick={() => setSelectedTier(tier.level)}
                             className={`relative p-3 rounded border transition-all cursor-pointer flex justify-between items-center group
                                ${selectedTier === tier.level 
                                    ? 'bg-purple-900/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                             `}
                           >
                               <div className="flex items-center gap-3">
                                   <Crown size={16} style={{ color: tier.color }} />
                                   <span className={`font-bold text-sm ${selectedTier === tier.level ? 'text-white' : 'text-slate-300'}`}>
                                       {tier.name.split(' ')[0]}
                                   </span>
                               </div>
                               <div className="text-right">
                                   <div className="text-xs font-mono text-slate-200">{tier.count}</div>
                                   <div className={`text-[9px] ${tier.growth > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                                       +{tier.growth}%
                                   </div>
                               </div>
                               
                               {/* Active Indicator */}
                               {selectedTier === tier.level && (
                                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l"></div>
                               )}
                           </div>
                       ))}
                   </div>

                   {/* Benefits Preview */}
                   <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">
                           {activeTierInfo.name} 权益
                       </div>
                       <div className="flex flex-wrap gap-2">
                           {activeTierInfo.benefits.map((b, i) => (
                               <span key={i} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1">
                                   <Star size={8} className="text-yellow-500" /> {b}
                               </span>
                           ))}
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Points Economy */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Points Flow Chart */}
           <SciFiCard title="积分经济流转 (Points Economy)" subtitle="EARN vs BURN" className="h-[320px] border-purple-900/50 bg-[#080514]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-2 px-2">
                       <div className="flex gap-4 text-xs">
                           <span className="flex items-center gap-1 text-slate-300"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 发放 (Earn)</span>
                           <span className="flex items-center gap-1 text-slate-300"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> 消耗 (Burn)</span>
                       </div>
                       <div className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                           Burn Rate: <span className="text-purple-400 font-bold">62%</span>
                       </div>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={POINTS_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                               <Area type="monotone" dataKey="issued" stackId="1" stroke="#10b981" fill="url(#colorEarn)" name="Issued" />
                               <Area type="monotone" dataKey="redeemed" stackId="1" stroke="#8b5cf6" fill="url(#colorBurn)" name="Redeemed" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Middle: Reward Marketplace */}
           <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center">
                   <h3 className="text-sm font-bold text-white flex items-center gap-2">
                       <Gift size={16} className="text-purple-400" /> 热门兑换商品 (Rewards)
                   </h3>
                   <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                       Manage Catalog <ArrowRight size={12} />
                   </button>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                   {REWARDS.map((item, i) => (
                       <RewardCard key={i} item={item} />
                   ))}
               </div>
           </div>

           {/* Bottom: Engagement Radar */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               <SciFiCard title="会员互动活跃度" subtitle="ENGAGEMENT" className="border-slate-800">
                   <div className="h-full w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ENGAGEMENT_RADAR}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Activity" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#0ea5e9', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
               
               <SciFiCard title="活动任务达成率" subtitle="CAMPAIGNS" className="border-slate-800">
                   <div className="space-y-4">
                       {[
                           { name: '双11 配件狂欢节', rate: 92, status: 'Completed' },
                           { name: 'Q1 巡检邀约', rate: 65, status: 'Active' },
                           { name: '新产品试用申请', rate: 40, status: 'Active' },
                           { name: '老客户推荐计划', rate: 25, status: 'Active' },
                       ].map((c, i) => (
                           <div key={i}>
                               <div className="flex justify-between items-center text-xs mb-1">
                                   <span className="text-slate-300">{c.name}</span>
                                   <span className={`text-[9px] px-1.5 rounded ${c.status === 'Completed' ? 'bg-slate-800 text-slate-500' : 'bg-green-900/20 text-green-400'}`}>{c.status}</span>
                               </div>
                               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                   <div className={`h-full ${c.status === 'Completed' ? 'bg-slate-500' : 'bg-purple-500'}`} style={{width: `${c.rate}%`}}></div>
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Gamification & Stream */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Achievement Badges */}
           <SciFiCard title="企业成就勋章" subtitle="GAMIFICATION" className="border-purple-900/50">
               <div className="grid grid-cols-3 gap-3">
                   {[
                       { name: 'Early Adopter', icon: Sparkles, color: '#f59e0b' },
                       { name: 'Top Spender', icon: Trophy, color: '#ec4899' },
                       { name: 'Tech Pioneer', icon: Zap, color: '#0ea5e9' },
                       { name: 'Loyal Partner', icon: Shield, color: '#10b981' },
                       { name: 'Innovator', icon: BrainCircuit, color: '#8b5cf6' },
                       { name: 'Community Star', icon: Users, color: '#f43f5e' },
                   ].map((badge, i) => (
                       <div key={i} className="flex flex-col items-center gap-1 p-2 bg-slate-900/40 rounded border border-slate-800 hover:border-purple-500/50 cursor-pointer group transition-all">
                           <div className="p-2 rounded-full bg-slate-950 shadow-inner group-hover:scale-110 transition-transform">
                               <badge.icon size={16} style={{color: badge.color}} />
                           </div>
                           <span className="text-[9px] text-center text-slate-400 leading-tight">{badge.name}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Live Transaction Feed */}
           <SciFiCard title="实时积分变动" subtitle="LIVE FEED" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-0 h-full overflow-y-auto custom-scrollbar relative">
                   <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800"></div>
                   
                   {RECENT_ACTIVITY.map((tx, i) => (
                       <div key={i} className="relative pl-6 py-2 group">
                           <div className={`absolute left-[6px] top-3.5 w-2 h-2 rounded-full border-2 border-[#0b1221] z-10 
                               ${tx.type === 'Earn' ? 'bg-green-500' : 'bg-purple-500'}
                           `}></div>
                           <div className="bg-slate-900/40 p-2 rounded border border-slate-800 hover:border-purple-500/30 transition-colors">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] text-slate-500 font-mono">{tx.time}</span>
                                   <span className={`text-[10px] font-bold ${tx.type === 'Earn' ? 'text-green-400' : 'text-purple-400'}`}>
                                       {tx.type === 'Earn' ? '+' : ''}{tx.points}
                                   </span>
                               </div>
                               <div className="text-xs font-bold text-slate-200">{tx.user}</div>
                               <div className="text-[10px] text-slate-400 truncate">{tx.action}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Recommendation */}
           <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex items-start gap-2">
               <Ticket size={16} className="text-indigo-400 mt-0.5" />
               <div>
                   <div className="text-xs font-bold text-indigo-200">AI Next Best Offer</div>
                   <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                       Client <strong>Shanghai Heavy</strong> has accummulated 150k pts. Recommend "Premium Training" to reduce churn risk.
                   </p>
                   <button className="mt-2 w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-[9px] text-white rounded font-bold transition-colors">
                       Push Offer
                   </button>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
