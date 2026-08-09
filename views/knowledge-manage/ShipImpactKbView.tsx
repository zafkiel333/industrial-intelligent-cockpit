import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Ship, Anchor, Ruler, Activity, 
  Scale, AlertTriangle, BookOpen, 
  Database, ShieldCheck, FileText,
  Search, GitBranch, Zap, Layers,
  Compass, Info, ChevronRight, Share2,
  Maximize2, HardDrive, Target, Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
  ScatterChart, Scatter, Legend, ReferenceLine
} from 'recharts';

// --- 模拟知识库核心数据 ---

// 1. 船舶吨位分类
const SHIP_CATEGORIES = [
  { id: 'CONT_5', label: '5万吨级集装箱船', dwt: '50,000', speed: '0.15-0.20 m/s' },
  { id: 'BULK_10', label: '10万吨级散货船', dwt: '100,000', speed: '0.12-0.15 m/s' },
  { id: 'TANK_30', label: '30万吨级VLCC', dwt: '300,000', speed: '0.08-0.10 m/s' },
];

// 2. 撞击力经验矩阵数据 (吨位 vs 速度 -> 撞击力 KN)
const IMPACT_MATRIX_DATA = [
  { tonnage: '50k', slow: 1240, med: 2450, fast: 3800 },
  { tonnage: '100k', slow: 2100, med: 4200, fast: 5600 },
  { tonnage: '150k', slow: 3500, med: 5800, fast: 8200 },
  { tonnage: '200k', slow: 4800, med: 7500, fast: 11000 },
  { tonnage: '300k', slow: 6200, med: 9800, fast: 14500 },
];

// 3. 行业标准与规范
const STANDARDS_LIB = [
  { code: 'JTS 167-2-2009', title: '《码头结构设计规范》', country: 'CN', status: 'Active' },
  { code: 'PIANC WG 121', title: 'Berthing Velocities Guideline', country: 'INT', status: 'Active' },
  { code: 'BS 6349', title: 'Maritime Structures Standards', country: 'UK', status: 'Ref' },
];

// 4. 历史过载案例
const CASE_ARCHIVE = [
  { date: '2023-08', vessel: 'MARCO POLO', force: '12,500 KN', outcome: '护舷受损', level: 'Severe' },
  { date: '2022-11', vessel: 'ASIA GLORY', force: '8,400 KN', outcome: '正常吸收', level: 'Safe' },
  { date: '2021-04', vessel: 'OCEAN STAR', force: '15,200 KN', outcome: '码头基柱裂缝', level: 'Critical' },
];

export const ShipImpactKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('BULK_10');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 结构化背景装饰 */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <svg className="w-full h-full">
              <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#1e40af" strokeWidth="0.5" strokeDasharray="10 5" />
          </svg>
      </div>

      {/* --- HEADER --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-blue-500/20 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-xl flex items-center justify-center relative group">
             <Scale size={36} className="text-blue-400 group-hover:rotate-12 transition-transform" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Database size={14} className="animate-pulse" /> Marine Engineering Knowledge Base
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               船舶靠泊撞击力 <span className="text-blue-500 italic">经验参数库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">收录实体</div>
              <div className="text-3xl font-mono font-black text-white leading-none">1,824 <span className="text-xs text-slate-600 font-normal">NODES</span></div>
           </div>
           <div className="h-10 w-[1px] bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">计算模型置信度</div>
              <div className="text-3xl font-mono font-black text-emerald-400 leading-none">96.8<span className="text-xs font-normal text-slate-600">%</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Version</div>
              <div className="text-xl font-mono font-black text-blue-400 leading-none">KB-MAR-V1.2</div>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 船舶分类索引 */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="船舶谱系分类" subtitle="TAXONOMY" className="flex-1 border-blue-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索吨位或船型..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                  </div>
                  {SHIP_CATEGORIES.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setActiveCategory(item.id)}
                      className={`p-4 rounded border transition-all cursor-pointer relative group
                        ${activeCategory === item.id ? 'bg-blue-950/40 border-blue-500 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{item.label}</span>
                           <Ship size={14} className={activeCategory === item.id ? 'text-blue-400' : 'text-slate-600'} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                            <div className="flex flex-col"><span className="text-slate-600 uppercase">DWT</span> <span className="text-white">{item.dwt}</span></div>
                            <div className="flex flex-col"><span className="text-slate-600 uppercase">Std Vel.</span> <span className="text-amber-500">{item.speed}</span></div>
                        </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-indigo-900/10 border border-indigo-900/30 rounded">
                      <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2 flex items-center gap-2">
                          <Info size={12} /> 知识点：靠泊动能
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "能量 E = (1/2) * M * V² * Ce * Cm * Cs * Cc。其中有效质量 M 包括船舶排水量及其引起的附连水质量。"
                      </p>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="环境载荷影响" subtitle="SENSITIVITY" className="h-[240px] border-blue-900/30">
                <div className="w-full h-full pt-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: '横流速', A: 95, fullMark: 100 },
                          { subject: '风力载荷', A: 65, fullMark: 100 },
                          { subject: '靠泊角度', A: 85, fullMark: 100 },
                          { subject: '潮差波动', A: 45, fullMark: 100 },
                          { subject: '船员熟练度', A: 25, fullMark: 100 },
                       ]}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                           <Radar name="Sensitivity" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: 经验矩阵与参数化解析 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 核心经验矩阵 */}
           <div className="flex-1 bg-[#05060a] border border-blue-900/30 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex flex-col p-8">
              <div className="flex justify-between items-start mb-6">
                 <div className="z-10">
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Layers size={14} /> Empirical Force Matrix
                    </span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                       吨位-速度 <span className="text-blue-500">撞击力经验矩阵图</span>
                    </h2>
                 </div>
                 <div className="flex gap-4 z-10">
                    <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] text-slate-400 font-mono">标准能耗区</span>
                    </div>
                    <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 font-mono">高风险载荷区</span>
                    </div>
                 </div>
              </div>

              {/* 矩阵分析图表 */}
              <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={IMPACT_MATRIX_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="tonnage" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Tonnage (DWT)', position: 'insideBottomRight', offset: -10, fill: '#475569', fontSize: 10 }} />
                          <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Impact Force (KN)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: '1px solid #1e293b', borderRadius: '8px'}} />
                          <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize: '10px', paddingBottom: '20px'}} />
                          <Bar dataKey="slow" name="0.10 m/s" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="med" name="0.15 m/s" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="fast" name="0.20 m/s" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '护舷极限值', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>

              {/* 底部数据指标 */}
              <div className="h-20 bg-slate-950/60 border-t border-slate-800/80 backdrop-blur px-8 flex items-center justify-between rounded-b-2xl">
                 <div className="flex gap-16">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">平均反力峰值</span>
                        <span className="text-xl font-bold text-white font-mono tracking-tighter">4,250 <span className="text-xs text-slate-500 font-normal">KN</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">能量吸收密度</span>
                        <span className="text-xl font-bold text-emerald-400 font-mono tracking-tighter">0.85 <span className="text-xs text-slate-500 font-normal">KJ/m³</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">经验样本基数</span>
                        <span className="text-xl font-bold text-white font-mono tracking-tighter">15,400 <span className="text-xs text-slate-500 font-normal">SAMPLES</span></span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black uppercase rounded-sm transition-all flex items-center gap-2">
                       <Share2 size={14} /> 导出参数报告
                    </button>
                    <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-black text-[10px] font-black uppercase rounded-sm transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2">
                       <Maximize2 size={14} /> 深度数据探索
                    </button>
                 </div>
              </div>
           </div>

           {/* 底部：力学解析与系数参考 */}
           <div className="h-[220px] flex gap-4">
              <SciFiCard title="力学解析与系数参考" subtitle="MECHANICS" className="flex-1 border-blue-900/30 bg-[#080c14]">
                  <div className="flex h-full gap-8 items-center">
                      <div className="w-1/3 h-full relative flex items-center justify-center border-r border-slate-800/50 pr-6">
                          {/* 靠泊示意图简化版 */}
                          <svg viewBox="0 0 200 100" className="w-full h-full opacity-60">
                              <rect x="10" y="80" width="180" height="10" fill="#334155" />
                              <path d="M40,20 L160,20 L150,60 L50,60 Z" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                              <line x1="100" y1="20" x2="130" y2="80" stroke="#f97316" strokeDasharray="4 2" />
                              <circle cx="130" cy="80" r="3" fill="#ef4444" />
                              <text x="140" y="75" fill="#ef4444" fontSize="8">Impact Point</text>
                              <text x="100" y="15" textAnchor="middle" fill="#64748b" fontSize="8">Angle θ = 15°</text>
                          </svg>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                          {[
                              { label: '偏心系数 (Ce)', val: '0.55 - 0.85', desc: '根据触碰点距重心距离修正' },
                              { label: '附连水质量系数 (Cm)', val: '1.3 - 1.8', desc: '考虑船体周围流体惯性力' },
                              { label: '柔软性系数 (Cs)', val: '0.90 - 0.95', desc: '船体与护舷弹性消耗' },
                              { label: '泊位配置系数 (Cc)', val: '1.0', desc: '开敞式或遮蔽式泊位修正' },
                          ].map((coeff, i) => (
                              <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-blue-500/50 transition-all">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-white">{coeff.label}</span>
                                      <span className="text-[10px] font-mono text-blue-400">{coeff.val}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 leading-tight group-hover:text-slate-300">{coeff.desc}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>
           </div>
        </section>

        {/* RIGHT: 标准规范与典型案例 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="法律法规与技术规范" subtitle="REGULATORY" className="h-1/2 border-blue-900/30">
               <div className="flex flex-col gap-3 h-full">
                   {STANDARDS_LIB.map((std, i) => (
                       <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group">
                           <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors">
                               <FileText size={18} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                               <div className="text-[10px] text-slate-500 font-mono uppercase">{std.country} • {std.status}</div>
                               <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{std.code}</div>
                               <div className="text-[10px] text-slate-500 truncate">{std.title}</div>
                           </div>
                           <ChevronRight size={14} className="text-slate-700" />
                       </div>
                   ))}
                   <button className="mt-auto w-full py-3 bg-slate-950 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 hover:text-blue-400 transition-all">
                       进入 PDM 全球规范中心
                   </button>
               </div>
           </SciFiCard>

           <SciFiCard title="典型历史过载档案" subtitle="CASE ARCHIVE" className="flex-1 border-blue-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {CASE_ARCHIVE.map((doc, i) => (
                       <div key={i} className="flex flex-col gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-red-500/30 transition-all cursor-pointer">
                           <div className="flex justify-between items-center">
                               <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase 
                                 ${doc.level === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-orange-900/40 text-orange-400'}`}>
                                   {doc.level}
                               </span>
                           </div>
                           <div className="text-xs font-bold text-slate-200 group-hover:text-white">{doc.vessel} 靠泊冲击过载</div>
                           <div className="flex justify-between text-[10px] text-slate-500">
                               <span>Peak Force: <span className="text-white">{doc.force}</span></span>
                               <span className="text-red-400">{doc.outcome}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                ENGINE_STATUS: SYNCED [NODE-GLOBAL-01]
            </span>
            <span className="hidden md:inline">SECURITY: SHA-256 ENCRYPTED</span>
            <span className="hidden md:inline text-blue-800">LAST_UPDATE: {new Date().toLocaleDateString()}</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <ShieldCheck size={12} className="text-blue-800" /> KNOWLEDGE_INTEGRITY: VERIFIED
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
