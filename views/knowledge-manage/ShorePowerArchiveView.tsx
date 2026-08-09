
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, ShieldCheck, Ship, Anchor, 
  Database, FileText, Search, Activity, 
  Leaf, BatteryCharging, Link, 
  Binary, Compass, ClipboardList, Info,
  ChevronRight, Share2, Maximize2, Terminal,
  Cpu, LayoutGrid, Scale, Globe, History,
  Plug, Power, Sliders, FileSearch, BookOpen,
  CheckCircle2, AlertTriangle, Fingerprint, BarChart3,
  // Added TrendingDown to fix the "Cannot find name 'TrendingDown'" error on line 259
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

// --- 模拟档案库深度数据 ---

const VESSEL_ARCHIVES = [
  { id: 'VES-001', name: 'MSC ISABELLA', type: 'Container (24k TEU)', voltage: '6.6kV', freq: '60Hz', plugs: 2, socket: 'Port Side Aft', status: 'Certified' },
  { id: 'VES-002', name: 'COSCO STAR', type: 'Bulk Carrier', voltage: '11kV', freq: '50Hz', plugs: 1, socket: 'Starboard Mid', status: 'Pending' },
  { id: 'VES-003', name: 'MAERSK SEOUL', type: 'Container (18k TEU)', voltage: '6.6kV', freq: '60Hz', plugs: 2, socket: 'Port Side Aft', status: 'Certified' },
  { id: 'VES-004', name: 'QUEEN MARY II', type: 'Cruise Ship', voltage: '11kV', freq: '60Hz', plugs: 4, socket: 'Special Stern', status: 'Restricted' },
];

const STANDARDS_LIBRARY = [
  { code: 'IEC/IEEE 80005-1', title: 'High Voltage Shore Connection (HVSC)', category: 'Safety', relevance: 98 },
  { code: 'ISO 28005', title: 'Electronic Port Clearance', category: 'Data', relevance: 75 },
  { code: 'GB/T 30845', title: '高压岸电连接系统技术要求', category: 'Regional', relevance: 100 },
];

const COMPATIBILITY_MATRIX = [
  { subject: '电压平衡', score: 95, detail: '岸船电压差 < 3%' },
  { subject: '频率同步', score: 100, detail: '变频器精准对齐 60Hz' },
  { subject: '物理跨距', score: 82, detail: '电缆余量 2.5m (警告)' },
  { subject: '协议校验', score: 98, detail: 'IEC 61850 通讯正常' },
  { subject: '接地型式', score: 90, detail: '中性点电阻接地匹配' },
];

// --- 核心组件 ---

const TechnicalDrawing = ({ activeId }: { activeId: string }) => (
    <div className="w-full h-full relative bg-[#050a10] rounded-xl border border-slate-800 p-6 overflow-hidden">
        {/* 技术图纸背景网格 */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                        <Maximize2 size={12} /> Technical Schematic: AMP Interface
                    </div>
                    <h2 className="text-xl font-black text-white italic">岸船连接物理拓扑图解</h2>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                    DWG: 2024-PORT-AMP-042<br/>SCALE: 1:50 (REF)
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <svg viewBox="0 0 600 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <defs>
                        <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
                            <circle cx="3" cy="3" r="2" fill="#10b981" />
                        </marker>
                    </defs>
                    {/* 岸基 CMS 系统 (简笔线条风) */}
                    <rect x="50" y="80" width="120" height="140" rx="4" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
                    <text x="110" y="70" fill="#10b981" fontSize="12" textAnchor="middle" fontWeight="bold">岸基电缆管理系统 (CMS)</text>
                    
                    {/* 船端插座箱 (AMP) */}
                    <rect x="420" y="100" width="100" height="100" rx="4" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <text x="470" y="90" fill="#3b82f6" fontSize="12" textAnchor="middle" fontWeight="bold">船端接电箱 (AMP)</text>

                    {/* 跨接电缆路径 */}
                    <path d="M170,150 C250,150 340,150 420,150" fill="none" stroke="#10b981" strokeWidth="3" markerStart="url(#dot)" markerEnd="url(#dot)" className="animate-[dash_2s_linear_infinite]" strokeDasharray="10 5" />
                    
                    {/* 数据节点标注 */}
                    <g transform="translate(295, 140)">
                        <rect x="-40" y="-30" width="80" height="25" fill="#020617" stroke="#1e293b" />
                        <text y="-12" textAnchor="middle" fill="#94a3b8" fontSize="9">跨距: 14.5m</text>
                        <line x1="0" y1="-5" x2="0" y2="10" stroke="#1e293b" />
                    </g>
                </svg>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-4 border-t border-slate-800 pt-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">插头规格</span>
                    <span className="text-sm font-bold text-slate-200">IEC 62613-2 (Standard)</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">控制信号</span>
                    <span className="text-sm font-bold text-slate-200">Fiber Optic (LC-LC)</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">联锁保护</span>
                    <span className="text-sm font-bold text-emerald-400">PILOT LOOP: ACTIVE</span>
                </div>
            </div>
        </div>
    </div>
);

export const ShorePowerArchiveView: React.FC = () => {
  const [activeVesId, setActiveVesId] = useState('VES-001');
  const activeVes = VESSEL_ARCHIVES.find(v => v.id === activeVesId) || VESSEL_ARCHIVES[0];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 overflow-hidden">
      
      {/* --- TOP HUD: 档案中心概览 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* 装饰性流动光条 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <Fingerprint size={32} className="text-emerald-400" />
             <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-[0.4em] font-black">
               Vessel Compatibility Knowledge Database
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               绿色港口岸电 <span className="text-emerald-500 italic">兼容性数字档案库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全球建档船舶</div>
              <div className="text-3xl font-mono font-black text-white leading-none">8,245 <span className="text-xs text-slate-600 font-normal">SHIPS</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">年度减碳贡献</div>
              <div className="text-3xl font-mono font-black text-emerald-400 leading-none">12.5<span className="text-xs font-normal text-slate-600">k tCO₂</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Protocol</div>
              <div className="text-xl font-mono font-black text-blue-400 leading-none">IEC-80005</div>
           </div>
        </div>
      </header>

      {/* --- MAIN: 知识管理矩阵 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 船舶谱系目录 (Directory) */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="船舶技术档案索引" subtitle="DIRECTORY" className="flex-1 border-slate-800 bg-[#080c14]/90">
              <div className="flex flex-col gap-2 h-full">
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索船舶、IMO、所属公司..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                      {VESSEL_ARCHIVES.map(v => (
                          <div 
                            key={v.id}
                            onClick={() => setActiveVesId(v.id)}
                            className={`p-3 rounded border transition-all cursor-pointer relative group
                              ${activeVesId === v.id ? 'bg-emerald-950/40 border-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                            `}
                          >
                              <div className="flex justify-between items-center mb-1">
                                 <div className="flex items-center gap-2">
                                     <Ship size={14} className={activeVesId === v.id ? 'text-emerald-400' : 'text-slate-500'} />
                                     <span className="text-xs font-bold text-slate-200 group-hover:text-white">{v.name}</span>
                                 </div>
                                 <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                                    ${v.status === 'Certified' ? 'bg-emerald-900/40 text-emerald-400' : 
                                      v.status === 'Restricted' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                                      {v.status.toUpperCase()}
                                 </span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                                  <span>{v.type}</span>
                                  <span>{v.voltage}/{v.freq}</span>
                              </div>
                              {activeVesId === v.id && (
                                  <div className="absolute right-0 top-0 h-full w-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="mt-4 p-3 bg-emerald-900/10 border border-emerald-900/30 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Activity size={14} className="text-emerald-400" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Live Audit Stream</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-500">SYNCHRONIZED</span>
                  </div>
              </div>
           </SciFiCard>
        </section>

        {/* CENTER: 技术解析与验证 (Analysis) */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 技术图纸 */}
           <div className="flex-[1.2] min-h-0">
               <TechnicalDrawing activeId={activeVesId} />
           </div>

           {/* 下部：兼容性验证矩阵 */}
           <div className="flex-1 grid grid-cols-12 gap-4">
               <SciFiCard title="兼容性验证得分 (Compatibility)" className="col-span-7 border-slate-800 bg-[#080c14]/90" noPadding>
                   <div className="w-full h-full p-4 flex gap-6">
                       <div className="w-1/3">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPATIBILITY_MATRIX}>
                                  <PolarGrid stroke="#1e293b" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                                  <Radar name="Compatibility" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                              </RadarChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex-1 flex flex-col justify-center gap-3">
                           {COMPATIBILITY_MATRIX.map((m, i) => (
                               <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-1.5 last:border-0">
                                   <div className="flex flex-col">
                                       <span className="text-xs font-bold text-slate-300">{m.subject}</span>
                                       <span className="text-[9px] text-slate-500 font-mono italic">{m.detail}</span>
                                   </div>
                                   <div className="text-right">
                                       <span className={`text-sm font-mono font-bold ${m.score >= 90 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                                           {m.score}%
                                       </span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="减排指标审计" subtitle="AUDIT" className="col-span-5 border-slate-800">
                   <div className="flex flex-col h-full gap-4">
                       <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                               <span className="text-[10px] text-slate-500 uppercase">Est. CO₂ Reduction</span>
                               <span className="text-3xl font-black text-white font-mono leading-none">142.5 <span className="text-xs">kg/h</span></span>
                           </div>
                           <TrendingDown size={32} className="text-emerald-500 mb-1" />
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-[65%]"></div>
                       </div>
                       <div className="space-y-2 mt-2">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>SOx Reduction</span>
                               <span className="text-white font-mono">1.2 kg/h</span>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>NOx Reduction</span>
                               <span className="text-white font-mono">3.8 kg/h</span>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>Particulate Matter</span>
                               <span className="text-white font-mono">0.4 kg/h</span>
                           </div>
                       </div>
                   </div>
               </SciFiCard>
           </div>
        </section>

        {/* RIGHT: 法规与参考 (Regulatory) */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="标准与法规档案" subtitle="REGULATORY" className="h-1/2 border-blue-900/30">
               <div className="flex flex-col h-full gap-3">
                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                       {STANDARDS_LIBRARY.map((std, i) => (
                           <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group">
                               <div className="flex items-center gap-4">
                                   <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors">
                                       <Scale size={18} />
                                   </div>
                                   <div className="flex-1 overflow-hidden">
                                       <div className="text-[10px] text-slate-500 font-mono uppercase">{std.category} • REF</div>
                                       <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{std.code}</div>
                                       <div className="text-[9px] text-slate-500 truncate">{std.title}</div>
                                   </div>
                               </div>
                               <div className="mt-3 flex justify-between items-center border-t border-slate-800/50 pt-2">
                                   <span className="text-[9px] text-slate-600 font-bold uppercase">Relevance Index</span>
                                   <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-blue-500" style={{ width: `${std.relevance}%` }}></div>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                   <button className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 hover:text-blue-400 transition-all">
                       进入 PDM 全球规范中心
                   </button>
               </div>
           </SciFiCard>

           <SciFiCard title="历史连接异常案例库" subtitle="ANOMALIES" className="flex-1 border-red-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { date: '2023.11.12', title: '高频共模电压导致变频器跳闸', severity: 'High' },
                       { date: '2023.08.05', title: '插座高度受极端低潮位影响偏移', severity: 'Med' },
                       { date: '2023.04.22', title: '光纤通讯链路握手协议失败', severity: 'Low' },
                   ].map((c, i) => (
                       <div key={i} className="flex gap-4 p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group">
                           <div className="flex flex-col items-center gap-1 border-r border-slate-800 pr-3">
                               <span className="text-[9px] text-slate-500 uppercase font-black">Date</span>
                               <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white">{c.date.split('.')[2]}/{c.date.split('.')[1]}</span>
                           </div>
                           <div className="flex-1">
                               <div className={`text-[10px] font-black uppercase mb-1 ${c.severity === 'High' ? 'text-red-400' : 'text-yellow-500'}`}>
                                   [{c.severity}]
                               </div>
                               <div className="text-xs font-bold text-slate-300 group-hover:text-white line-clamp-1">{c.title}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: 系统状态与存证溯源 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                PDM_SERVER_NODE: GLOBAL-04
            </span>
            <span className="hidden md:inline">ENCRYPTION: AES-256-GCM</span>
            <span className="hidden md:inline text-blue-800">LAST_COMMIT: {new Date().toLocaleTimeString()}</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <ShieldCheck size={12} className="text-emerald-600" /> KNOWLEDGE_INTEGRITY: CERTIFIED
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};
