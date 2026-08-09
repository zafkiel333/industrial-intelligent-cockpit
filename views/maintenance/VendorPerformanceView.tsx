
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  FileCheck, 
  Zap, 
  Target, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  Database,
  Activity,
  Fingerprint,
  Cpu,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  History
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

// --- 模拟数据 ---

const VENDORS_DB = [
  { id: 'VD-2024-001', name: '精工重型机电', category: '机组大修', tier: 'S级 战略伙伴', score: 96.5, status: 'active', region: '华东区' },
  { id: 'VD-2024-005', name: '蓝海液压工程', category: '液压维护', tier: 'A级 核心供应商', score: 92.4, status: 'active', region: '西北区' },
  { id: 'VD-2024-009', name: '博世自动化服务', category: '工控系统', tier: 'A级 核心供应商', score: 88.7, status: 'warning', region: '西南区' },
  { id: 'VD-2024-012', name: '迅捷工业清洗', category: '防腐清洗', tier: 'B级 备选伙伴', score: 75.2, status: 'active', region: '华南区' },
  { id: 'VD-2024-018', name: '通力电力保障', category: '高压试运行', tier: 'C级 淘汰边缘', score: 62.1, status: 'critical', region: '华北区' },
];

const QCDST_DATA: Record<string, any[]> = {
  'VD-2024-001': [
    { subject: '质量 (Q)', A: 98, fullMark: 100 },
    { subject: '成本 (C)', A: 85, fullMark: 100 },
    { subject: '交付 (D)', A: 95, fullMark: 100 },
    { subject: '服务 (S)', A: 92, fullMark: 100 },
    { subject: '技术 (T)', A: 99, fullMark: 100 },
  ],
  'VD-2024-018': [
    { subject: '质量 (Q)', A: 55, fullMark: 100 },
    { subject: '成本 (C)', A: 70, fullMark: 100 },
    { subject: '交付 (D)', A: 60, fullMark: 100 },
    { subject: '服务 (S)', A: 45, fullMark: 100 },
    { subject: '技术 (T)', A: 65, fullMark: 100 },
  ]
};

const AUDIT_LOG = [
  { time: '10:42', vendor: '精工重型', event: 'SOP流程完全合规', score: '+2', type: 'positive' },
  { time: '09:15', vendor: '博世自动化', event: '现场PPE穿戴不规范', score: '-5', type: 'negative' },
  { time: '昨天', vendor: '通力电力', event: '维保工单延期交付', score: '-10', type: 'negative' },
];

export const VendorPerformanceView: React.FC = () => {
  const [selectedId, setSelectedId] = useState('VD-2024-001');
  const [searchTerm, setSearchTerm] = useState('');

  const activeVendor = useMemo(() => VENDORS_DB.find(v => v.id === selectedId) || VENDORS_DB[0], [selectedId]);
  const activeRadar = useMemo(() => QCDST_DATA[selectedId] || QCDST_DATA['VD-2024-001'], [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#02040a]">
      
      {/* 顶部：战略协同仪表盘 */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 bg-gradient-to-r from-indigo-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/50 relative">
              <Award size={36} className="text-white" />
              <div className="absolute -inset-2 border border-indigo-500/20 rounded-sm animate-[pulse_3s_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Vendor Intelligence & Performance Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 外包服务商 <span className="text-indigo-500 italic">绩效评价中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">合格供应商总数</div>
              <div className="text-2xl font-mono font-bold text-white">128 <span className="text-xs text-slate-600 font-normal">UNIT</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月平均绩效</div>
              <div className="text-2xl font-mono font-bold text-indigo-400">88.4</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">违规待处理项</div>
              <div className="text-2xl font-mono font-bold text-red-500">03</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：供应商名录与过滤 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Database size={14} className="text-indigo-500" /> 注册服务商矩阵</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Filter size={14}/></button>
           </div>
           
           <div className="relative px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="检索服务商/类别/区域..." 
                className="w-full bg-slate-900 border border-slate-800 rounded py-2 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {VENDORS_DB.map(vendor => (
                <div 
                  key={vendor.id}
                  onClick={() => setSelectedId(vendor.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === vendor.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-100 text-sm truncate">{vendor.name}</h3>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{vendor.category}</div>
                     </div>
                     <div className={`text-xl font-mono font-bold ${vendor.score >= 90 ? 'text-green-400' : vendor.score >= 80 ? 'text-indigo-400' : 'text-red-400'}`}>
                        {vendor.score}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border
                        ${vendor.tier.includes('S级') ? 'border-purple-500/50 bg-purple-950/40 text-purple-300' : 'border-slate-700 bg-slate-800 text-slate-400'}
                     `}>{vendor.tier}</span>
                     <span className="text-[9px] text-slate-600 font-mono">{vendor.region}</span>
                  </div>

                  {selectedId === vendor.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* 中间：全息画像与服务拓扑 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           {/* 供应商全息画像区 */}
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded overflow-hidden group">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
              
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1">
                          <Fingerprint size={14} className="animate-pulse" />
                          DIGITAL VENDOR IDENTITY CARD
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activeVendor.name} <span className="text-xl text-slate-600 ml-2 font-light">[{activeVendor.id}]</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">综合信任指数</div>
                       <div className="text-4xl font-mono font-bold text-indigo-400 leading-none mt-1">99.2<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 中部核心可视化：QCDST 雷达图 */}
                 <div className="flex-1 flex flex-col md:flex-row items-center gap-8 py-4 pointer-events-auto">
                    <div className="flex-1 h-full min-h-[320px] relative">
                       <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <Globe size={240} className="text-indigo-900" />
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activeRadar}>
                             <PolarGrid stroke="#1e1b4b" strokeDasharray="3 3" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar 
                                name="绩效指标" 
                                dataKey="A" 
                                stroke="#6366f1" 
                                strokeWidth={3} 
                                fill="#6366f1" 
                                fillOpacity={0.2} 
                             />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #4f46e5', borderRadius: '4px', fontSize: '12px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                             />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>

                    {/* 右侧：关键准入资质列表 */}
                    <div className="w-full md:w-64 space-y-4">
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-3 mb-4">核心准入资质</div>
                       {[
                         { name: '承装/修电力设施许可', level: '一级', status: 'valid' },
                         { name: '特种设备维修许可证', level: '压力容器', status: 'valid' },
                         { name: 'ISO 9001 质量管理体系', level: '核心', status: 'valid' },
                         { name: '高危作业人员保险', level: '已全覆', status: 'valid' },
                       ].map((cert, i) => (
                         <div key={i} className="bg-slate-900/60 p-3 rounded border border-slate-800 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                            <div className="min-w-0">
                               <div className="text-[11px] font-bold text-slate-200 truncate">{cert.name}</div>
                               <div className="text-[9px] text-slate-500 uppercase">{cert.level}</div>
                            </div>
                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* 底部：协同动态 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Activity size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前在研项目</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">#3 机组主轴承改造</div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <TrendingUp size={20} className="text-green-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">年度履约率</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">98.5% Excellent</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20">下发警告</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">调阅合同</button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/40"></div>
           </div>
        </div>

        {/* 右侧：风险穿透与审计流水 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="绩效历史趋势" subtitle="MTBF_TREND">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HISTORY_TREND}>
                       <defs>
                          <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[80, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreColor)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="风险穿透审计" subtitle="RISK_AUDIT" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {AUDIT_LOG.map((log, i) => (
                      <div key={i} className={`p-3 rounded-sm border-l-2 flex flex-col gap-1 relative overflow-hidden group transition-all
                         ${log.type === 'positive' ? 'bg-emerald-950/10 border-emerald-500' : 'bg-red-950/10 border-red-500'}
                      `}>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                            <span className={`text-xs font-bold ${log.type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>{log.score}</span>
                         </div>
                         <div className="text-xs font-bold text-slate-200">{log.vendor}</div>
                         <p className="text-[10px] text-slate-400 leading-normal italic">“{log.event}”</p>
                         {/* 背景修饰图标 */}
                         <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                            {log.type === 'positive' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">
                       <span>数据真实性核验</span>
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-3">
                       <ShieldCheck size={20} className="text-indigo-500" />
                       <div className="text-[10px] text-slate-400 leading-relaxed italic">
                          “所有评价数据均由现场作业闭环自动生成，经由三方数字水印加密。”
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 <span>黑名单与黑名单预警</span>
                 <AlertTriangle size={12} className="text-red-500" />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                       <img key={i} src={`https://api.dicebear.com/7.x/initials/svg?seed=${i}`} className="w-6 h-6 rounded-full border border-slate-900" alt="v" />
                    ))}
                 </div>
                 <span className="text-[10px] text-red-400 font-bold">2 家企业处于观察期</span>
                 <ChevronRight size={14} className="text-slate-700" />
              </div>
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
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};

const HISTORY_TREND = [
  { month: '01', score: 88 },
  { month: '02', score: 92 },
  { month: '03', score: 89 },
  { month: '04', score: 94 },
  { month: '05', score: 95 },
  { month: '06', score: 96.5 },
];
