import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Gavel, Scale, ShieldAlert, Globe, 
  Database, FileText, Search, Activity, 
  Map, BookOpen, AlertTriangle, CheckCircle2, 
  Layers, Compass, Link as LinkIcon, ExternalLink,
  ChevronRight, Share2, Maximize2, Terminal,
  Cpu, Filter, ListFilter, History,
  Info, BarChart3, TrendingUp,
  // Added ShieldCheck to fix the "Cannot find name 'ShieldCheck'" error on line 387
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts';

// --- 判例与法规模拟数据 ---

const INCIDENT_CATEGORIES = [
  { id: 'COLLISION', label: '碰撞事故 (Collision)', icon: <Activity size={18}/>, color: '#ef4444' },
  { id: 'GROUNDING', label: '搁浅事故 (Grounding)', icon: <AnchorIcon size={18}/>, color: '#f59e0b' },
  { id: 'FIRE', label: '火灾爆炸 (Fire/Exp)', icon: <FlameIcon size={18}/>, color: '#f97316' },
  { id: 'POLLUTION', label: '溢油污染 (Pollution)', icon: <DropletsIcon size={18}/>, color: '#10b981' },
];

const PRECEDENTS_LIST = [
  { id: 'CAS-2023-004', title: '长江口“XX”轮与“YY”轮交叉相遇碰撞案', type: 'Collision', court: '上海海事法院', date: '2023.08.15', liability: '60/40' },
  { id: 'CAS-2022-112', title: '珠江口某载砂船极端天气搁浅事故', type: 'Grounding', court: '广州海事法院', date: '2022.11.22', liability: '100% Owner' },
  { id: 'CAS-2024-012', title: '国际航线VLCC锚地溢油环境损害赔偿案', type: 'Pollution', court: '国际海事仲裁', date: '2024.01.10', liability: 'TBD' },
];

const LEGAL_FRAMEWORK = [
  { title: '1972年国际海上避碰规则', code: 'COLREGs 72', level: 'Intl', category: 'Operational' },
  { title: '中华人民共和国海商法', code: 'CMC-1992', level: 'National', category: 'Lagal' },
  { title: '海上交通安全法 (2021修订)', code: 'MTSA-2021', level: 'National', category: 'Safety' },
  { title: '内河避碰规则', code: 'IRR-2022', level: 'Regional', category: 'Inland' },
];

const STATS_DATA = [
  { name: '人为失误', value: 75, fill: '#ef4444' },
  { name: '机械故障', value: 15, fill: '#3b82f6' },
  { name: '环境恶劣', value: 10, fill: '#f59e0b' },
];

function AnchorIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12H2m20 0h-3M12 21a8 8 0 0 1-8-8V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a8 8 0 0 1-8 8z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function FlameIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}

function DropletsIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z"/><path d="M17 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z"/></svg>;
}

export const MaritimeAccidentKbView: React.FC = () => {
  const [activeCat, setActiveCat] = useState('COLLISION');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 装饰性背景：抽象法网 */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full">
              <pattern id="lawNet" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#64748b" strokeWidth="0.5"/>
                  <circle cx="50" cy="50" r="1.5" fill="#facc15" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#lawNet)" />
          </svg>
      </div>

      {/* --- HEADER --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-600/20 border-2 border-amber-500 rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(245,158,11,0.2)]">
             <Gavel size={32} className="text-amber-400" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-[0.4em] font-black">
               Maritime Justice & Regulatory Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               水上交通事故 <span className="text-amber-500 italic">判例与法规库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">入库判例</div>
              <div className="text-3xl font-mono font-black text-white leading-none">1,452 <span className="text-xs text-slate-600 font-normal">CASES</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">引用规章</div>
              <div className="text-3xl font-mono font-black text-blue-400 leading-none">84 <span className="text-xs font-normal text-slate-600">REGS</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">司法更新</div>
              <div className="text-xl font-mono font-black text-amber-400 leading-none">2024.Q1</div>
           </div>
        </div>
      </header>

      {/* --- MAIN --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 分类与判例索引 */}
        <section className="w-[340px] flex flex-col gap-4">
           <SciFiCard title="事故类型谱系" subtitle="TAXONOMY" className="flex-1 border-amber-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="检索案件关键词、船名、海域..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-700"
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                      {INCIDENT_CATEGORIES.map(cat => (
                          <div 
                            key={cat.id}
                            onClick={() => setActiveCat(cat.id)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                                ${activeCat === cat.id ? 'bg-amber-900/20 border-amber-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                            `}
                          >
                              <div className={activeCat === cat.id ? 'text-amber-400' : 'text-slate-500'}>{cat.icon}</div>
                              <span className="text-[10px] font-bold uppercase">{cat.label.split(' ')[0]}</span>
                          </div>
                      ))}
                  </div>

                  <div className="text-[10px] text-slate-500 uppercase font-bold mt-2 mb-1 pl-1">近期典型判例 (Precedents)</div>
                  {PRECEDENTS_LIST.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[9px] font-mono text-slate-500 group-hover:text-amber-400">{item.id}</span>
                           <span className="text-[9px] text-slate-600 italic">{item.date}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-300 leading-tight group-hover:text-white line-clamp-2">{item.title}</h3>
                        <div className="mt-2 flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800 pt-2">
                            <span>{item.court}</span>
                            <span className="text-amber-600 font-bold">责任: {item.liability}</span>
                        </div>
                    </div>
                  ))}
                  
                  <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-lg transition-all flex items-center justify-center gap-2">
                      <ListFilter size={14} /> 更多高级筛选选项
                  </button>
              </div>
           </SciFiCard>

           <SciFiCard title="事故成因分布" subtitle="CAUSAL ANALYSIS" className="h-[220px] border-amber-900/30">
                <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={STATS_DATA}
                             cx="50%" cy="50%"
                             innerRadius={45}
                             outerRadius={65}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                           >
                             {STATS_DATA.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.6} />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{fontSize: '9px', paddingBottom: '10px'}} />
                       </PieChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: 判例深度解剖 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 事故演进拓扑视图 */}
           <div className="flex-[1.2] bg-[#050608] border border-amber-900/30 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex flex-col p-8">
              <div className="absolute top-8 left-8 z-20">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-amber-500 p-4 rounded-sm shadow-2xl flex flex-col">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Compass size={14} /> Scenario Forensic Reconstruction
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">案件场景 2D 矢量解构</h2>
                 </div>
              </div>

              {/* 战术解构背景 */}
              <div className="flex-1 relative flex items-center justify-center p-12">
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                     <Map size={400} className="text-amber-500" />
                  </div>
                  
                  {/* 模拟碰撞矢量图 SVG */}
                  <svg viewBox="0 0 600 300" className="w-full h-full z-10 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <defs>
                        <marker id="head-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                           <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
                        </marker>
                      </defs>
                      {/* 航道背景 */}
                      <path d="M50,50 L550,50 M50,250 L550,250" stroke="#1e293b" strokeWidth="20" strokeDasharray="10 10" />
                      
                      {/* A 轮 (让路船) */}
                      <g transform="translate(150, 180) rotate(-30)">
                          <path d="M-10,-30 L10,-30 L15,30 L-15,30 Z" fill="#ef4444" fillOpacity={0.4} stroke="#ef4444" strokeWidth="2" />
                          <line x1="0" y1="-30" x2="0" y2="-80" stroke="#ef4444" strokeWidth="2" markerEnd="url(#head-v)" strokeDasharray="4 2" />
                          <text x="0" y="45" fill="#ef4444" fontSize="10" textAnchor="middle" transform="rotate(30)">Vessel A (让路船)</text>
                      </g>

                      {/* B 轮 (直航船) */}
                      <g transform="translate(400, 120) rotate(240)">
                          <path d="M-10,-30 L10,-30 L15,30 L-15,30 Z" fill="#3b82f6" fillOpacity={0.4} stroke="#3b82f6" strokeWidth="2" />
                          <line x1="0" y1="-30" x2="0" y2="-100" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#head-v)" />
                          <text x="0" y="45" fill="#3b82f6" fontSize="10" textAnchor="middle" transform="rotate(-240)">Vessel B (直航船)</text>
                      </g>

                      {/* 碰撞预期区 */}
                      <circle cx="300" cy="150" r="40" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" className="animate-pulse" />
                      <text x="300" y="150" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">碰撞点 C.O.P</text>
                  </svg>

                  {/* 右侧法律判据浮签 */}
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                     <div className="bg-slate-950/80 border border-red-500/30 p-3 rounded-lg backdrop-blur-md w-48 shadow-2xl">
                        <div className="text-[10px] text-red-500 font-black uppercase mb-1">判据 R-15</div>
                        <div className="text-xs text-slate-200">A轮未尽到早大宽清义务</div>
                     </div>
                     <div className="bg-slate-950/80 border border-blue-500/30 p-3 rounded-lg backdrop-blur-md w-48 shadow-2xl">
                        <div className="text-[10px] text-blue-500 font-black uppercase mb-1">判据 R-17</div>
                        <div className="text-xs text-slate-200">B轮未履行保速保向义务</div>
                     </div>
                  </div>
              </div>

              {/* 底部功能条 */}
              <div className="h-16 bg-slate-950/80 border-t border-slate-800/80 px-8 flex items-center justify-between rounded-b-2xl backdrop-blur">
                 <div className="flex gap-12 text-[10px] font-mono text-slate-500">
                    <div className="flex flex-col"><span className="uppercase">Relative Spd</span><span className="text-white text-sm font-bold">14.2 kn</span></div>
                    <div className="flex flex-col"><span className="uppercase">CPA Distance</span><span className="text-red-400 text-sm font-bold">0.02 nm</span></div>
                    <div className="flex flex-col"><span className="uppercase">Visibility</span><span className="text-white text-sm font-bold">Good / 8nm</span></div>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase rounded-sm border border-slate-700 transition-all flex items-center gap-2">
                       <Share2 size={12} /> 存证分发
                    </button>
                    <button className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-[10px] font-black uppercase rounded-sm transition-all shadow-lg shadow-amber-900/40 flex items-center gap-2">
                       <Maximize2 size={12} /> 进入完整推演
                    </button>
                 </div>
              </div>
           </div>

           {/* 下部：判决主文与理由 (Knowledge Extract) */}
           <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-inner">
               <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                   <div className="flex items-center gap-3">
                       <FileText size={18} className="text-amber-500" />
                       <span className="text-sm font-black text-slate-200 uppercase tracking-widest">Judgment Reasoning & Verdict</span>
                   </div>
                   <div className="flex gap-2">
                       <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded">案由: 船舶碰撞</span>
                       <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded">标的: ¥1.2M</span>
                   </div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                   <div className="space-y-4">
                       <div className="flex gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div>
                           <p className="text-xs text-slate-400 leading-relaxed">
                               <strong className="text-slate-200 block mb-1">事实认定 (Factual Finding):</strong>
                               法院查明，事故发生于当日14:30，Vessel A 处于追越状态，且未开启AIS信号。Vessel B 在发现碰撞危险后，未采取紧急倒车措施。
                           </p>
                       </div>
                       <div className="flex gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                           <p className="text-xs text-slate-400 leading-relaxed">
                               <strong className="text-slate-200 block mb-1">法律适用 (Legal Reasoning):</strong>
                               根据《国际海上避碰规则》第13条，追越船应当负有绝对让路义务。但直航船在紧迫危险阶段，应依据第17条采取避碰行动以避免碰撞。
                           </p>
                       </div>
                       <div className="flex gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                           <p className="text-xs text-emerald-100/70 leading-relaxed bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/30">
                               <strong className="text-emerald-400 block mb-1">最终裁决 (Final Verdict):</strong>
                               判令 A轮承担 70% 损失责任，B轮承担 30% 过失责任。
                           </p>
                       </div>
                   </div>
               </div>
           </div>
        </section>

        {/* RIGHT: 法规矩阵与AI分析 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="法律规则索引" subtitle="REGULATORY" className="h-1/2 border-amber-900/30">
               <div className="flex flex-col h-full gap-4">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input className="w-full bg-slate-900 border border-slate-700 rounded py-2 pl-9 pr-4 text-xs text-slate-300" placeholder="检索公约条款..." />
                   </div>
                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                       {LEGAL_FRAMEWORK.map((law, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group">
                               <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors">
                                   <Scale size={18} />
                               </div>
                               <div className="flex-1 overflow-hidden">
                                   <div className="text-[9px] text-slate-600 font-mono uppercase">{law.level} • {law.category}</div>
                                   <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate transition-colors">{law.title}</div>
                                   <div className="text-[9px] text-slate-500 font-mono">{law.code}</div>
                               </div>
                               <ExternalLink size={14} className="text-slate-700" />
                           </div>
                       ))}
                   </div>
                   <button className="mt-auto w-full py-2.5 bg-slate-950 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-all">
                       调阅 PDM 数字化规则手册
                   </button>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 法律风险洞察" subtitle="AI INSIGHTS" className="flex-1 border-amber-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-inner">
                       <div className="flex items-center gap-3 mb-3">
                           <Cpu size={20} className="text-amber-500 animate-pulse" />
                           <span className="text-xs font-bold text-slate-200">相似案例关联建议</span>
                       </div>
                       <div className="space-y-2">
                          <div className="text-[10px] text-slate-400 leading-relaxed italic">
                             "检测到当前判例与 2021 年英国高等法院案例『Aries v. Titan』在『保速保向义务』的判定逻辑上高度契合，建议引用该案第42条司法解释。"
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-amber-600 font-mono mt-4 pt-2 border-t border-slate-800">
                             <span>Match Confidence</span>
                             <span>94.2%</span>
                          </div>
                       </div>
                   </div>

                   <div className="space-y-3">
                      <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1">风险提示 (Risk Alerts)</div>
                      <div className="flex items-center justify-between p-2 bg-red-950/20 rounded border border-red-900/30">
                          <span className="text-[10px] text-red-200">新规预警：MARPOL 附则 VI 更新</span>
                          <AlertTriangle size={12} className="text-red-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-950/20 rounded border border-blue-900/30">
                          <span className="text-[10px] text-blue-200">最新修订：海警法执行细则</span>
                          <Info size={12} className="text-blue-400" />
                      </div>
                   </div>
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                MSA_LEGAL_DATABASE: CONNECTED
            </span>
            <span className="hidden md:inline">ENCRYPTION: SHA-256 SECURED</span>
            <span className="hidden md:inline">SYSTEM_ARCHIVE_NODE: HK-05-LEGAL</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <ShieldCheck size={12} className="text-amber-800" /> KNOWLEDGE_INTEGRITY: CERTIFIED
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};
