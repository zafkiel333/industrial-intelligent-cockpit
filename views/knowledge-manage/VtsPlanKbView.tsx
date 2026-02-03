
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radio, ShieldAlert, Navigation, Anchor, 
  Database, FileText, Search, Activity, 
  Wind, CloudRain, Siren, LifeBuoy, 
  GitBranch, ListFilter, BookOpen, Scale,
  ChevronRight, Share2, Maximize2, Terminal,
  MessageSquare, Users, Eye, Target,
  // Added missing imports to fix "Cannot find name" errors
  Info, Zap, CheckCircle2, Shield, History
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, BarChart, Bar, Cell, Legend
} from 'recharts';

// --- 知识库模拟数据 ---

const PLAN_CATEGORIES = [
  { id: 'TRAFFIC_ORG', label: '常规交通组织', sub: 'Standard Ops', icon: <Navigation size={18}/>, color: '#0ea5e9' },
  { id: 'WEATHER_RESP', label: '极端天气响应', sub: 'Meteorology', icon: <CloudRain size={18}/>, color: '#f59e0b' },
  { id: 'EMERGENCY', label: '突发事故救援', sub: 'SAR/Emergency', icon: <Siren size={18}/>, color: '#ef4444' },
  { id: 'SPECIAL_VESS', label: '特种船舶过境', sub: 'HVV Protection', icon: <Anchor size={18}/>, color: '#10b981' },
];

const PLAN_LIST = [
  { id: 'VTS-P-001', title: '单向航道高峰时段交管预案', level: 'Level 2', update: '2024-03-10', status: 'Active' },
  { id: 'VTS-P-005', title: '能见度不足500m禁航管制预案', level: 'Level 1', update: '2023-11-15', status: 'Active' },
  { id: 'VTS-P-012', title: 'VLCC超大型油轮进港护航规程', level: 'Level 3', update: '2024-01-20', status: 'Review' },
  { id: 'VTS-P-008', title: '危险品锚地溢油应急处置预案', level: 'Level 1', update: '2023-08-05', status: 'Active' },
];

const PERFORMANCE_DATA = [
  { subject: '指令准确度', A: 95, fullMark: 100 },
  { subject: '资源响应速度', A: 82, fullMark: 100 },
  { subject: '决策冲突率', A: 15, fullMark: 100 },
  { subject: '法规适配性', A: 98, fullMark: 100 },
  { subject: '演练覆盖率', A: 88, fullMark: 100 },
];

const LOGIC_NODES = [
  { label: '能见度 < 1000m', result: '触发预警' },
  { label: '风力 > 8级', result: '禁止引航' },
  { label: '车流 > 5艘/km', result: '单向管制' },
];

export const VtsPlanKbView: React.FC = () => {
  const [activeCat, setActiveCat] = useState('TRAFFIC_ORG');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 经纬网格背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
              <pattern id="radarGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  <circle cx="30" cy="30" r="1" fill="#0ea5e9" opacity="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />
          </svg>
      </div>

      {/* --- HEADER --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(59,130,246,0.3)]">
             <Radio size={32} className="text-blue-400" />
             <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-[0.4em] font-black">
               VTS Command Knowledge Archive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               VTS 交通组织 <span className="text-blue-500 italic">知识预案库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">已备案流程</div>
              <div className="text-3xl font-mono font-black text-white leading-none">124 <span className="text-xs text-slate-600 font-normal">PLANS</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">法律合规率</div>
              <div className="text-3xl font-mono font-black text-emerald-400 leading-none">100<span className="text-xs font-normal text-slate-600">%</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">版本状态</div>
              <div className="text-xl font-mono font-black text-blue-400 leading-none">PRO-2024.1</div>
           </div>
        </div>
      </header>

      {/* --- MAIN --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 战略分类与搜索 */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="预案战略分类" subtitle="TAXONOMY" className="flex-1 border-blue-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="检索预案、法规或关键词..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                  </div>
                  {PLAN_CATEGORIES.map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => setActiveCat(cat.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group
                        ${activeCat === cat.id ? 'bg-blue-950/40 border-blue-500 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        {activeCat === cat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-3">
                               <div className="p-2 rounded bg-slate-800 text-blue-400 group-hover:text-blue-200 transition-colors">
                                   {cat.icon}
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-slate-200">{cat.label}</div>
                                   <div className="text-[10px] text-slate-500 uppercase font-mono">{cat.sub}</div>
                               </div>
                           </div>
                           {activeCat === cat.id && <ChevronRight size={14} className="text-blue-500" />}
                        </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-indigo-900/10 border border-indigo-900/30 rounded-xl">
                      <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2 flex items-center gap-2">
                          <Info size={12} /> 知识点：VTS服务性质
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "信息服务、助航服务、交通组织服务是VTS的三大核心。预案库通过结构化决策逻辑，旨在减少人为指令的随意性。"
                      </p>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="预案覆盖完整度" subtitle="COMPLETENESS" className="h-[220px] border-blue-900/30">
                <div className="w-full h-full pt-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERFORMANCE_DATA}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                           <Radar name="Coverage" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: 决策逻辑与预案列表 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 决策逻辑触发引擎 */}
           <div className="h-1/2 bg-[#05060a] border border-blue-900/30 rounded-3xl overflow-hidden relative shadow-inner flex flex-col p-8">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <GitBranch size={14} /> Automatic Trigger Logic
                    </span>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">预案触发决策逻辑树</h2>
                 </div>
                 <button className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-500/30 transition-all flex items-center gap-2">
                    <Maximize2 size={12} /> 全屏逻辑推演
                 </button>
              </div>

              {/* 逻辑流转视觉化 */}
              <div className="flex-1 flex items-center justify-between px-10 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Zap size={200} className="text-blue-500" />
                  </div>
                  {LOGIC_NODES.map((node, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-3 z-10">
                            <div className="w-24 h-14 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-center p-2 group hover:border-blue-500 transition-all shadow-xl cursor-default">
                                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">{node.label}</span>
                            </div>
                            <div className="h-4 w-px bg-slate-800"></div>
                            <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-[10px] text-blue-300 font-mono">
                                {node.result}
                            </div>
                        </div>
                        {i < LOGIC_NODES.length - 1 && (
                            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent mx-2 mb-10"></div>
                        )}
                    </React.Fragment>
                  ))}
              </div>

              <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg animate-pulse">
                          <CheckCircle2 size={18} />
                      </div>
                      <div className="text-xs text-slate-400 leading-tight">
                          当前环境感知数据符合 <span className="text-white font-bold font-mono">STANDBY</span> 级别，逻辑链路自检 100% 通过。
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                  </div>
              </div>
           </div>

           {/* 详细档案列表 */}
           <SciFiCard title="预案档案列表" subtitle="PLAN ARCHIVE" className="flex-1 border-blue-900/30">
              <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {PLAN_LIST.map((plan) => (
                    <div key={plan.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl group hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <div className="text-[10px] text-slate-500 font-mono mb-1">{plan.id}</div>
                              <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{plan.title}</h4>
                           </div>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${plan.level === 'Level 1' ? 'bg-red-900/40 text-red-400' : 'bg-blue-900/40 text-blue-400'}`}>
                              {plan.level}
                           </span>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <History size={12} /> 更新: {plan.update}
                            </div>
                            <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FileText size={14} />
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
           </SciFiCard>
        </section>

        {/* RIGHT: 指令集与法规 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="标准指令字典 (SMCP)" subtitle="STANDARD PHRASES" className="h-1/2 border-blue-900/30">
               <div className="flex flex-col h-full gap-4">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input className="w-full bg-slate-900 border border-slate-700 rounded py-2 pl-9 pr-4 text-xs text-slate-300" placeholder="检索指令..." />
                   </div>
                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                       {[
                           { cmd: 'Proceed with Caution', usage: '能见度受限或交通拥挤时。' },
                           { cmd: 'Negative. No Transit Allowed', usage: '实施单向管控或全线封航时。' },
                           { cmd: 'Overtaking Forbidden', usage: '在弯道或狭水道航段。' },
                           { cmd: 'Adjust to Safe Speed', usage: '接近作业区或泊位时。' },
                       ].map((item, i) => (
                           <div key={i} className="p-3 bg-slate-950/50 border-l-2 border-blue-500 rounded-r hover:bg-slate-900 transition-all cursor-help group">
                               <div className="text-xs font-mono font-bold text-blue-400 mb-1 group-hover:text-blue-300 tracking-tight">"{item.cmd}"</div>
                               <div className="text-[10px] text-slate-500">{item.usage}</div>
                           </div>
                       ))}
                   </div>
                   <div className="mt-2 text-center">
                       <button className="text-[10px] text-slate-600 hover:text-blue-400 font-bold uppercase transition-all flex items-center gap-2 justify-center w-full">
                           <BookOpen size={12} /> 下载 VTS 标准通讯手册
                       </button>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="法律法规关联库" subtitle="REGULATORY" className="flex-1 border-blue-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { title: '海上交通安全法', id: 'LAW-CH-01', cat: 'National' },
                       { title: 'VTS 管理运行规范', id: 'ST-MSA-42', cat: 'Internal' },
                       { title: '国际避碰规则 (COLREGs)', id: 'IMO-72', cat: 'International' },
                   ].map((law, i) => (
                       <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group">
                           <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors">
                               <Scale size={18} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                               <div className="text-[10px] text-slate-500 font-mono uppercase">{law.cat}</div>
                               <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{law.title}</div>
                               <div className="text-[10px] text-slate-600 font-mono">{law.id}</div>
                           </div>
                           <Share2 size={14} className="text-slate-700" />
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: 指挥链状态 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                MSA_NETWORK: ENCRYPTED
            </span>
            <span className="hidden md:inline">SYSTEM_ARCHIVE_NODE: HK-01-VTS</span>
            <span className="hidden md:inline text-blue-800">LAST_VERSION_UPDATE: 2024.03.22</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Shield size={12} className="text-blue-800" /> KNOWLEDGE_INTEGRITY: CERTIFIED
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};
