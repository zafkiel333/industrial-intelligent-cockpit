
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, Beaker, Flame, Wind, 
  Thermometer, Skull, Radiation, 
  Trash2, AlertTriangle, Search, 
  Database, Info, Scale, FileText, 
  Grip, Zap, CheckCircle2, XCircle,
  HelpCircle, ChevronRight, Layers,
  Table, Binary, Microscope
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, 
  XAxis, YAxis, ZAxis, Tooltip, 
  PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- IMDG 危险品分类数据 ---
const IMDG_CLASSES = [
  { id: '1', label: '第1类: 爆炸品', color: '#ef4444', icon: <Zap size={14}/>, risk: 'Critical' },
  { id: '2', label: '第2类: 气体', color: '#3b82f6', icon: <Wind size={14}/>, risk: 'High' },
  { id: '3', label: '第3类: 易燃液体', color: '#f97316', icon: <Flame size={14}/>, risk: 'High' },
  { id: '4', label: '第4类: 易燃固体', color: '#f59e0b', icon: <Zap size={14}/>, risk: 'Med' },
  { id: '5', label: '第5类: 氧化性物质', color: '#eab308', icon: <SunIcon size={14}/>, risk: 'Med' },
  { id: '6', label: '第6类: 毒性物质', color: '#a855f7', icon: <Skull size={14}/>, risk: 'High' },
  { id: '7', label: '第7类: 放射性物质', color: '#10b981', icon: <Radiation size={14}/>, risk: 'Critical' },
  { id: '8', label: '第8类: 腐蚀性物质', color: '#6366f1', icon: <DropletIcon size={14}/>, risk: 'Med' },
  { id: '9', label: '第9类: 杂类危险品', color: '#64748b', icon: <HelpCircle size={14}/>, risk: 'Low' },
];

// --- 隔离规则矩阵 (0:无, 1:远离, 2:隔离, 3:跨格, 4:纵向隔离) ---
const SEGREGATION_MATRIX = [
  [0, 2, 2, 4, 4, 2, 4, 2, 1],
  [2, 0, 1, 2, 2, 1, 2, 1, 0],
  [2, 1, 0, 2, 2, 1, 3, 2, 0],
  [4, 2, 2, 0, 2, 1, 3, 2, 0],
  [4, 2, 2, 2, 0, 2, 3, 2, 1],
  [2, 1, 1, 1, 2, 0, 2, 1, 0],
  [4, 2, 3, 3, 3, 2, 0, 3, 0],
  [2, 1, 2, 2, 2, 1, 3, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 0],
];

const RULE_LABELS: Record<number, { label: string, color: string, desc: string }> = {
  0: { label: '无特定要求', color: 'text-slate-500', desc: '正常堆存' },
  1: { label: '远离 (Away from)', color: 'text-blue-400', desc: '水平间距 ≥ 3m' },
  2: { label: '隔离 (Separated from)', color: 'text-yellow-500', desc: '水平间距 ≥ 6m' },
  3: { label: '跨格隔离 (Separated by a complete compartment)', color: 'text-orange-500', desc: '水平间距 ≥ 12m' },
  4: { label: '纵向隔离 (Separated longitudinally)', color: 'text-red-500', desc: '禁止在同一贝位/行内堆存' },
};

function SunIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
}

function DropletIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z"/></svg>;
}

export const DangerousGoodsKbView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('3');
  const [compareClass, setCompareClass] = useState('5');
  const [hoverNode, setHoverNode] = useState<{ r: number, c: number } | null>(null);

  const activeRuleCode = SEGREGATION_MATRIX[parseInt(selectedClass) - 1][parseInt(compareClass) - 1];
  const activeRule = RULE_LABELS[activeRuleCode];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 overflow-hidden relative">
      
      {/* 背景装饰：分子结构图 */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%">
              <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                  <path d="M25 0 L50 14.4 L50 31.2 L25 43.4 L0 31.2 L0 14.4 Z" fill="none" stroke="#facc15" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
      </div>

      {/* --- HEADER --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-yellow-600/20 border-2 border-yellow-500 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(250,204,21,0.2)]">
             <ShieldAlert size={36} className="text-yellow-500 animate-pulse" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-yellow-500 mb-1 uppercase tracking-[0.4em] font-black">
               <Database size={12} /> IMDG Regulatory Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               危险货物集装箱 <span className="text-yellow-500 italic">隔离堆存规则库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前在库危化品</div>
              <div className="text-3xl font-mono font-black text-white leading-none">425 <span className="text-xs text-slate-600 font-normal">UNIT</span></div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全场风险指数</div>
              <div className="text-3xl font-mono font-black text-orange-500 leading-none">0.24 <span className="text-xs font-normal text-slate-600">SEC</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">数据库版本</div>
              <div className="text-xl font-mono font-black text-yellow-500 leading-none">Amdt. 41-22</div>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: DG Classification Explorer */}
        <section className="w-[300px] flex flex-col gap-4">
           <SciFiCard title="危化品分类" subtitle="IMDG CLASSES" className="flex-1 border-yellow-900/30">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {IMDG_CLASSES.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedClass(item.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                        ${selectedClass === item.id ? 'bg-yellow-950/40 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                               <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 text-yellow-500" style={{ color: item.color }}>
                                   {item.icon}
                               </div>
                               <span className="text-xs font-bold text-slate-200 group-hover:text-white">{item.label}</span>
                           </div>
                           {selectedClass === item.id && <CheckCircle2 size={12} className="text-yellow-500" />}
                        </div>
                        <div className="flex justify-between text-[9px] font-mono opacity-60">
                            <span className="uppercase">Risk: {item.risk}</span>
                            <span>{item.id}.0 SERIES</span>
                        </div>
                        {selectedClass === item.id && (
                            <div className="absolute right-0 top-0 h-full w-0.5 bg-yellow-500 shadow-[0_0_10px_#facc15]"></div>
                        )}
                    </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="应急处置规程 (EmS)" className="h-[200px] border-slate-800 bg-[#0c0e14]">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-2 bg-red-950/20 border border-red-900/30 rounded">
                      <div className="text-xs font-bold text-red-400">F-E</div>
                      <div className="text-[10px] text-slate-400">非水溶性易燃液体火灾</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-950/20 border border-blue-900/30 rounded">
                      <div className="text-xs font-bold text-blue-400">S-D</div>
                      <div className="text-[10px] text-slate-400">遇水反应性物质溢漏</div>
                  </div>
                  <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 border border-slate-700 rounded transition-all">
                      查看完整应急逻辑图
                  </button>
               </div>
           </SciFiCard>
        </section>

        {/* CENTER: Interactive Segregation Matrix */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           <div className="flex-1 bg-[#050608] border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner flex flex-col p-6">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Table size={14} /> Matrix Logic Core
                    </span>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">隔离要求推演矩阵</h2>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-500">主选类别:</span>
                        <span className="text-sm font-bold text-yellow-500">{selectedClass}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-500">比对类别:</span>
                        <span className="text-sm font-bold text-purple-500">{compareClass}</span>
                    </div>
                 </div>
              </div>

              {/* 矩阵容器 */}
              <div className="flex-1 flex items-center justify-center p-4">
                  <div className="grid grid-cols-10 gap-1.5 p-4 bg-slate-900/20 border border-slate-800 rounded-2xl">
                      {/* Header Row */}
                      <div className="w-10 h-10"></div>
                      {IMDG_CLASSES.map(c => (
                          <div key={c.id} className="w-10 h-10 flex items-center justify-center text-[11px] font-black text-slate-500 border border-slate-800 bg-slate-950/50">
                              {c.id}
                          </div>
                      ))}
                      
                      {/* Matrix Rows */}
                      {IMDG_CLASSES.map((row, rIdx) => (
                        <React.Fragment key={row.id}>
                            <div className="w-10 h-10 flex items-center justify-center text-[11px] font-black text-slate-500 border border-slate-800 bg-slate-950/50">
                                {row.id}
                            </div>
                            {SEGREGATION_MATRIX[rIdx].map((val, cIdx) => {
                                const isCurrent = (rIdx + 1 === parseInt(selectedClass) && cIdx + 1 === parseInt(compareClass)) || 
                                                (cIdx + 1 === parseInt(selectedClass) && rIdx + 1 === parseInt(compareClass));
                                const isHover = hoverNode?.r === rIdx && hoverNode?.c === cIdx;
                                
                                return (
                                    <div 
                                      key={cIdx}
                                      onMouseEnter={() => setHoverNode({r: rIdx, c: cIdx})}
                                      onMouseLeave={() => setHoverNode(null)}
                                      onClick={() => setCompareClass((cIdx + 1).toString())}
                                      className={`
                                        w-10 h-10 flex items-center justify-center text-[12px] font-mono font-bold rounded-sm border transition-all cursor-pointer
                                        ${val === 0 ? 'bg-slate-950/20 border-slate-900 text-slate-800 hover:border-slate-600' : ''}
                                        ${val === 1 ? 'bg-blue-900/10 border-blue-900/30 text-blue-500 hover:bg-blue-900/30' : ''}
                                        ${val === 2 ? 'bg-yellow-900/10 border-yellow-900/30 text-yellow-500 hover:bg-yellow-900/30' : ''}
                                        ${val === 3 ? 'bg-orange-900/20 border-orange-700/40 text-orange-500 hover:bg-orange-900/40' : ''}
                                        ${val === 4 ? 'bg-red-900/30 border-red-600/50 text-red-500 hover:bg-red-900/50' : ''}
                                        ${isCurrent ? 'ring-2 ring-white scale-110 z-10 shadow-[0_0_20px_white]' : ''}
                                      `}
                                    >
                                        {val || '-'}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                      ))}
                  </div>
              </div>

              {/* 规则详解浮窗 */}
              <div className="mt-4 p-5 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center gap-8 backdrop-blur-md">
                  <div className="flex flex-col items-center border-r border-slate-800 pr-8">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Code</div>
                      <div className={`text-5xl font-black ${activeRule.color}`}>{activeRuleCode}</div>
                  </div>
                  <div className="flex-1">
                      <div className={`text-lg font-bold mb-1 ${activeRule.color}`}>{activeRule.label}</div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                         "依据 IMDG Code Section 7.2.4，两类货物在堆场存放时：{activeRule.desc}。"
                      </p>
                  </div>
                  <div className="flex flex-col gap-2">
                      <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded flex items-center gap-2 border border-slate-600">
                          <FileText size={14} /> 调取公约原文
                      </button>
                      <button className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-[10px] font-bold text-black rounded flex items-center gap-2 shadow-lg shadow-yellow-900/20">
                          <CheckCircle2 size={14} /> 校验当前堆存单
                      </button>
                  </div>
              </div>
           </div>

           {/* 底部：隔离等级图例 */}
           <div className="h-[120px] flex gap-4">
               {Object.entries(RULE_LABELS).map(([code, data]) => (
                   <div key={code} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors">
                       <div className="flex justify-between items-center">
                           <span className={`text-xl font-black ${data.color}`}>{code}</span>
                           <div className={`w-1.5 h-1.5 rounded-full ${data.color.replace('text-', 'bg-')}`}></div>
                       </div>
                       <div className="text-[10px] font-bold text-slate-300 leading-tight">{data.label.split('(')[0]}</div>
                       <div className="text-[8px] text-slate-600 truncate">{data.desc}</div>
                   </div>
               ))}
           </div>
        </section>

        {/* RIGHT: Detail Knowledge Base */}
        <section className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="分类理化特性" subtitle="PHYSICOCHEMICAL" className="h-[300px] border-yellow-900/30">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                       <div className="text-[10px] text-slate-500 uppercase font-black mb-2 flex items-center gap-2">
                           <Binary size={12} /> Technical Profile: Class {selectedClass}
                       </div>
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs">
                               <span className="text-slate-400">平均闪点</span>
                               <span className="text-white font-mono">-18°C ~ 23°C</span>
                           </div>
                           <div className="flex justify-between text-xs">
                               <span className="text-slate-400">蒸气压 (20°C)</span>
                               <span className="text-white font-mono">1.2 - 3.5 kPa</span>
                           </div>
                           <div className="flex justify-between text-xs">
                               <span className="text-slate-400">爆炸极限</span>
                               <span className="text-red-400 font-mono">2.1% - 13%</span>
                           </div>
                       </div>
                   </div>

                   <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase font-black mb-2">危险特性概率</div>
                       <ResponsiveContainer width="100%" height={120}>
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                               { subject: '易燃性', A: 95, fullMark: 100 },
                               { subject: '毒性', A: 45, fullMark: 100 },
                               { subject: '腐蚀性', A: 30, fullMark: 100 },
                               { subject: '爆炸性', A: 85, fullMark: 100 },
                               { subject: '氧化性', A: 60, fullMark: 100 },
                           ]}>
                               <PolarGrid stroke="#1e293b" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                               <Radar name="Class" dataKey="A" stroke="#facc15" strokeWidth={2} fill="#facc15" fillOpacity={0.2} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="堆场设施限制" subtitle="FACILITY REQ" className="flex-1 border-yellow-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="space-y-4">
                       <div className="flex items-center gap-3 group">
                           <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-yellow-500 transition-colors">
                               <Zap size={20} />
                           </div>
                           <div className="flex-1 border-b border-slate-800 pb-1">
                               <div className="text-xs font-bold text-slate-200">防爆电气环境</div>
                               <div className="text-[9px] text-slate-500">必须在 Ex-d IIC T4 以上等级区段</div>
                           </div>
                       </div>
                       <div className="flex items-center gap-3 group">
                           <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-blue-500 transition-colors">
                               <Thermometer size={20} />
                           </div>
                           <div className="flex-1 border-b border-slate-800 pb-1">
                               <div className="text-xs font-bold text-slate-200">温控降温设施</div>
                               <div className="text-[9px] text-slate-500">顶部自动喷淋，维持地表温 &lt; 35°C</div>
                           </div>
                       </div>
                       <div className="flex items-center gap-3 group">
                           <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-500 transition-colors">
                               <Microscope size={20} />
                           </div>
                           <div className="flex-1 border-b border-slate-800 pb-1">
                               <div className="text-xs font-bold text-slate-200">独立截污管网</div>
                               <div className="text-[9px] text-slate-500">配备事故应急池，防止次生环境污染</div>
                           </div>
                       </div>
                   </div>
                   
                   <div className="mt-auto pt-4 border-t border-slate-800">
                       <div className="flex items-center gap-2 mb-2 text-red-500">
                           <AlertTriangle size={14} />
                           <span className="text-[10px] font-black uppercase">Critical Constraint</span>
                       </div>
                       <p className="text-[10px] text-red-200/60 leading-tight italic">
                           "对于第 1.1、1.2、1.5 类爆炸品，严禁在任何公共堆场长期存放，仅限直取作业。"
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: Status --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950 border-t border-yellow-900/30 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div> 
                REGULATORY_SYNC: SUCCESS
            </span>
            <span className="hidden md:inline">SYSTEM_STATUS: COMPLIANT</span>
            <span className="hidden md:inline">LAST_AUDIT: 2024-03-24 10:45:12</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Layers size={12} className="text-yellow-600" /> CROSS-CHECKING: VTS_AIS_CARGO_DATA
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #451a03; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #facc15; }
        .text-shadow-glow { text-shadow: 0 0 10px rgba(250,204,21,0.5); }
      `}</style>
    </div>
  );
};
