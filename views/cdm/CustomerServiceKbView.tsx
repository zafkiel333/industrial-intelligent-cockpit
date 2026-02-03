
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BookOpen, Search, Filter, ThumbsUp, MessageSquare, 
  Share2, Tag, CheckCircle2, AlertTriangle, HelpCircle,
  Cpu, Server, Zap, Wrench, FileText, User, 
  ArrowRight, Clock, Star, Lightbulb, ChevronRight,
  Bookmark, Hash, Activity, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- Types ---

type CaseStatus = 'Verified' | 'Draft' | 'Outdated';
type CaseCategory = 'Hardware' | 'Software' | 'Network' | 'Usage' | 'Account';

interface CaseStep {
  order: number;
  title: string;
  description: string;
  duration?: string;
  isKeyStep?: boolean;
}

interface CaseStudy {
  id: string;
  title: string;
  category: CaseCategory;
  product: string;
  symptom: string;
  rootCause: string;
  status: CaseStatus;
  author: string;
  publishDate: string;
  views: number;
  likes: number;
  tags: string[];
  steps: CaseStep[];
  relatedAssetId?: string;
}

interface Contributor {
  id: string;
  name: string;
  avatarColor: string;
  cases: number;
  rating: number; // 0-5
}

// --- Mock Data ---

const KB_CASES: CaseStudy[] = [
  {
    id: 'KB-2024-001',
    title: '燃气轮机启动振动过大 (GT-101) 故障排查',
    category: 'Hardware',
    product: 'Siemens SGT-800',
    symptom: '机组在 2500 RPM 升速阶段，2号轴承处横向振动幅值超过 8.5mm/s，触发报警停机。',
    rootCause: '长时间停机导致转子产生热弯曲（Thermal Bow），且盘车时间不足。',
    status: 'Verified',
    author: 'Chief Eng. Zhang',
    publishDate: '2024-03-15',
    views: 1240,
    likes: 45,
    tags: ['Vibration', 'Startup', 'Thermal'],
    relatedAssetId: 'EQ-GT-101',
    steps: [
      { order: 1, title: '数据分析', description: '调取停机前 30 分钟的振动频谱数据，确认主频为 1X 转频。', duration: '15m' },
      { order: 2, title: '盘车检查', description: '手动盘车检查转子偏心度，发现最大偏心值达 0.15mm。', duration: '30m', isKeyStep: true },
      { order: 3, title: '慢速暖机', description: '在 500 RPM 维持低速盘车暖机 4 小时，消除热弯曲。', duration: '4h' },
      { order: 4, title: '再次启动', description: '偏心度恢复正常后重新启动，振动值降至 2.1mm/s。', duration: '20m' }
    ]
  },
  {
    id: 'KB-2024-042',
    title: 'PLC 控制器通信丢包解决方案',
    category: 'Network',
    product: 'Control Panel X5',
    symptom: '上位机 SCADA 系统显示部分传感器数据间歇性离线，通信错误率 > 5%。',
    rootCause: '现场强电干扰导致 Profibus 总线信号衰减，且终端电阻接触不良。',
    status: 'Verified',
    author: 'SysAdmin Li',
    publishDate: '2024-02-28',
    views: 850,
    likes: 32,
    tags: ['Communication', 'Interference', 'Fieldbus'],
    steps: [
      { order: 1, title: '物理层检查', description: '检查所有总线接头，发现 #4 站终端电阻氧化。', duration: '1h' },
      { order: 2, title: '更换部件', description: '更换新的终端电阻，并重新压接屏蔽层。', duration: '30m' },
      { order: 3, title: '接地优化', description: '将通讯线槽与动力线槽物理隔离，增加屏蔽隔板。', duration: '2h', isKeyStep: true }
    ]
  },
  {
    id: 'KB-2023-115',
    title: '液压油温过高导致举升无力',
    category: 'Hardware',
    product: 'Hydraulic Press H-500',
    symptom: '连续工作 2 小时后，主油缸举升速度下降，系统压力无法建立到额定值。',
    rootCause: '冷却器冷却水流量不足，导致油温升高粘度下降，内泄增加。',
    status: 'Verified',
    author: 'Tech Wang',
    publishDate: '2023-11-10',
    views: 620,
    likes: 18,
    tags: ['Hydraulics', 'Overheat', 'Cooling'],
    steps: [
      { order: 1, title: '温升测试', description: '红外测温枪测量油箱及冷却器进出口温度。', duration: '10m' },
      { order: 2, title: '清理水路', description: '反冲洗冷却器水路，清除积垢。', duration: '1h' }
    ]
  },
  {
    id: 'KB-2024-088',
    title: 'MES 系统工单同步失败',
    category: 'Software',
    product: 'MES v4.2',
    symptom: 'ERP 下发的生产工单在 MES 中无法显示，接口日志报错 502。',
    rootCause: '中间件消息队列堆积，导致服务超时。',
    status: 'Draft',
    author: 'Dev Chen',
    publishDate: '2024-03-20',
    views: 120,
    likes: 5,
    tags: ['Integration', 'API', 'Queue'],
    steps: [
      { order: 1, title: '日志排查', description: '检查 API Gateway 日志，确认超时错误。', duration: '10m' },
      { order: 2, title: '重启服务', description: '重启 MQ 服务并清理死信队列。', duration: '15m' }
    ]
  },
];

const CATEGORY_STATS = [
  { name: 'Hardware', value: 45, color: '#f59e0b' },
  { name: 'Software', value: 25, color: '#8b5cf6' },
  { name: 'Network', value: 15, color: '#0ea5e9' },
  { name: 'Process', value: 15, color: '#10b981' },
];

const CONTRIBUTORS: Contributor[] = [
  { id: 'u1', name: 'Zhang W.', avatarColor: '#0ea5e9', cases: 124, rating: 4.9 },
  { id: 'u2', name: 'Li Q.', avatarColor: '#10b981', cases: 85, rating: 4.7 },
  { id: 'u3', name: 'Chen H.', avatarColor: '#f59e0b', cases: 62, rating: 4.5 },
];

const ACTIVITY_TREND = Array.from({length: 12}, (_, i) => ({
  month: `${i+1}月`,
  views: Math.floor(Math.random() * 500) + 200,
  newCases: Math.floor(Math.random() * 20) + 5
}));

// --- Components ---

const CategoryBadge = ({ category }: { category: string }) => {
  const styles = {
    'Hardware': 'bg-amber-900/30 text-amber-400 border-amber-800',
    'Software': 'bg-purple-900/30 text-purple-400 border-purple-800',
    'Network': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Usage': 'bg-green-900/30 text-green-400 border-green-800',
    'Account': 'bg-slate-800 text-slate-400 border-slate-700',
  }[category] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {category}
    </span>
  );
};

export const CustomerServiceKbView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState(KB_CASES[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const activeCase = KB_CASES.find(c => c.id === selectedCaseId) || KB_CASES[0];

  const filteredCases = KB_CASES.filter(c => 
    (filterCategory === 'All' || c.category === filterCategory) &&
    (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#140f26] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <BookOpen size={14} /> Service Knowledge Base
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户服务与 <span className="text-indigo-500">支持案例库</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center mt-4 md:mt-0">
            <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                {['All', 'Hardware', 'Software', 'Network'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all
                        ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
                      `}
                    >
                      {cat}
                    </button>
                ))}
            </div>
            <button className="p-2 bg-indigo-900/20 border border-indigo-500/50 text-indigo-400 rounded hover:bg-indigo-900/40 transition-colors">
                <Bookmark size={18} />
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Case Library */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Search */}
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="搜索故障现象、代码或关键词..." 
                className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* Stats Summary */}
           <div className="grid grid-cols-2 gap-2">
               <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center">
                   <span className="text-[10px] text-slate-500 uppercase">Total Solutions</span>
                   <span className="text-lg font-bold text-white">1,248</span>
               </div>
               <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center">
                   <span className="text-[10px] text-slate-500 uppercase">Solved Rate</span>
                   <span className="text-lg font-bold text-green-400">96.5%</span>
               </div>
           </div>

           {/* List */}
           <div className="flex flex-col gap-3">
               {filteredCases.map(c => (
                   <div 
                     key={c.id}
                     onClick={() => setSelectedCaseId(c.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCaseId === c.id 
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <CategoryBadge category={c.category} />
                           <span className="text-[10px] text-slate-500">{c.publishDate}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${selectedCaseId === c.id ? 'text-white' : 'text-slate-300'}`}>
                           {c.title}
                       </h3>
                       <div className="text-[10px] text-slate-500 truncate mb-3">{c.product}</div>

                       <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/50 pt-2">
                           <div className="flex gap-3">
                               <span className="flex items-center gap-1"><Eye size={10}/> {c.views}</span>
                               <span className="flex items-center gap-1"><ThumbsUp size={10}/> {c.likes}</span>
                           </div>
                           <span className="flex items-center gap-1"><User size={10}/> {c.author}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Knowledge Core */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Case Detail Card */}
           <SciFiCard className="border-indigo-900/50 bg-[#080a14]" noPadding>
               <div className="p-6">
                   {/* Title Area */}
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono border border-slate-700">{activeCase.id}</span>
                               {activeCase.status === 'Verified' && (
                                   <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">
                                       <CheckCircle2 size={10} /> Verified Solution
                                   </span>
                               )}
                           </div>
                           <h2 className="text-2xl font-bold text-white leading-tight">{activeCase.title}</h2>
                       </div>
                       <div className="flex gap-2">
                           <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"><Share2 size={16}/></button>
                           <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"><Star size={16}/></button>
                       </div>
                   </div>

                   {/* Content Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       {/* Symptom */}
                       <div className="bg-red-950/10 border border-red-900/30 p-4 rounded">
                           <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase mb-2">
                               <AlertTriangle size={14} /> 故障现象 (Symptom)
                           </div>
                           <p className="text-sm text-slate-300 leading-relaxed">
                               {activeCase.symptom}
                           </p>
                       </div>
                       
                       {/* Root Cause */}
                       <div className="bg-blue-950/10 border border-blue-900/30 p-4 rounded">
                           <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-2">
                               <Search size={14} /> 根因分析 (Root Cause)
                           </div>
                           <p className="text-sm text-slate-300 leading-relaxed">
                               {activeCase.rootCause}
                           </p>
                       </div>
                   </div>

                   {/* Resolution Steps - Visual Timeline */}
                   <div className="mb-6">
                       <div className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase mb-4">
                           <Wrench size={14} /> 处置流程 (Resolution Protocol)
                       </div>
                       <div className="space-y-4 relative pl-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                           {activeCase.steps.map((step) => (
                               <div key={step.order} className="relative">
                                   <div className={`absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-slate-950 z-10 
                                       ${step.isKeyStep ? 'border-amber-500 shadow-[0_0_8px_orange]' : 'border-slate-600'}
                                   `}></div>
                                   <div className="bg-slate-900/50 border border-slate-700 p-3 rounded flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
                                       <div>
                                           <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
                                               Step {step.order}: {step.title}
                                               {step.isKeyStep && <span className="text-[9px] bg-amber-900/30 text-amber-400 px-1.5 rounded">KEY</span>}
                                           </div>
                                           <div className="text-xs text-slate-400">{step.description}</div>
                                       </div>
                                       {step.duration && (
                                           <div className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                                               <Clock size={10} /> {step.duration}
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Tags & Meta */}
                   <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                       <Tag size={14} className="text-slate-500" />
                       {activeCase.tags.map(tag => (
                           <span key={tag} className="text-xs text-slate-400 hover:text-white cursor-pointer hover:underline">#{tag}</span>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Row 2: Charts & Trends */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="知识库访问热度" subtitle="VIEWS TREND" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ACTIVITY_TREND}>
                               <defs>
                                   <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="url(#colorViews)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="问题类型分布" subtitle="CATEGORIES" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={CATEGORY_STATS} 
                                     innerRadius={40} 
                                     outerRadius={60} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {CATEGORY_STATS.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.color} />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                               </PieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 space-y-2">
                           {CATEGORY_STATS.map((item, i) => (
                               <div key={i} className="flex justify-between items-center text-xs pr-4">
                                   <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                       <span className="text-slate-300">{item.name}</span>
                                   </div>
                                   <span className="font-bold text-white">{item.value}%</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Community & AI */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Ask AI */}
           <SciFiCard title="智能问答助手" subtitle="AI ASSISTANT" className="border-indigo-900/50 bg-indigo-950/10">
               <div className="flex flex-col gap-3">
                   <div className="flex items-start gap-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                           <BotIcon />
                       </div>
                       <div className="bg-slate-800/80 p-2 rounded-tr-lg rounded-bl-lg rounded-br-lg text-xs text-slate-300">
                           Based on this case, do you need the spare part list for {activeCase.product}?
                       </div>
                   </div>
                   <div className="mt-auto pt-2">
                       <input 
                         type="text" 
                         placeholder="Ask a question..." 
                         className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                       />
                   </div>
               </div>
           </SciFiCard>

           {/* Contributors */}
           <SciFiCard title="知识贡献榜" subtitle="TOP AUTHORS" className="border-slate-800">
               <div className="flex flex-col gap-3">
                   {CONTRIBUTORS.map((user, i) => (
                       <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors">
                           <div className="flex items-center gap-3">
                               <div className="relative">
                                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor: user.avatarColor}}>
                                       {user.name.charAt(0)}
                                   </div>
                                   {i === 0 && <div className="absolute -top-1 -right-1 text-yellow-400"><Star size={10} fill="currentColor"/></div>}
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-slate-200">{user.name}</div>
                                   <div className="text-[10px] text-slate-500">{user.cases} Solutions</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs font-bold text-yellow-400">{user.rating}</div>
                               <div className="text-[9px] text-slate-600">Rating</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Quick Tools */}
           <div className="grid grid-cols-2 gap-2">
               <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 flex flex-col items-center gap-1 transition-colors">
                   <FileText size={16} className="text-cyan-400" />
                   Create Case
               </button>
               <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 flex flex-col items-center gap-1 transition-colors">
                   <Activity size={16} className="text-green-400" />
                   My Drafts
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};

// Helper Icon
const BotIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);
