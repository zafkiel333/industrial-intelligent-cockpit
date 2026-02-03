
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, Compass, Move, Ruler, 
  Database, ShieldCheck, GitBranch, 
  FileText, Search, Activity, Wind, 
  AlertTriangle, CheckCircle2, Zap, 
  HardDrive, Share2, Maximize2, Info,
  ChevronRight, Library,
  // Fixed: Added missing Globe import
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, LineChart, Line, CartesianGrid, AreaChart, Area, Legend,
  ReferenceLine
} from 'recharts';

// --- 知识库模拟数据 ---

// 1. 浮标物理谱系
const BUOY_TAXONOMY = [
  { id: 'STEEL_10', label: '10米钢质灯浮标', type: 'Heavy-Duty', drag: 1.2, weight: '12.5t' },
  { id: 'POLY_24', label: '2.4米高分子灯浮', type: 'Light-Weight', drag: 0.8, weight: '1.5t' },
  { id: 'SPAR_B', label: '柱状型灯浮标 (Spar)', type: 'Stable-Core', drag: 0.5, weight: '8.8t' },
];

// 2. 漂移概率分布数据 (用于展示位移规律)
const DRIFT_PROBABILITY_DATA = Array.from({ length: 180 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    // 模拟正态分布，大部分点在回转半径内，少数为异常偏移
    const r = i < 150 ? Math.random() * 12 : 12 + Math.random() * 8; 
    return {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        intensity: r > 15 ? 'High Risk' : 'Standard',
        weight: Math.random() * 100
    };
});

// 3. 悬链线力学规则
const CATENARY_RULES = [
  { ratio: '1:2.0', tension: 'Critical', security: 'Low', desc: '主要用于窄水道，需配合重型沉砣' },
  { ratio: '1:3.0', tension: 'Optimal', security: 'High', desc: '标准配比，形成完美的悬链曲线' },
  { ratio: '1:4.5', tension: 'Static', security: 'Stable', desc: '极端海况下通过增加余量保障稳定' },
];

export const BuoyDriftKbView: React.FC = () => {
  const [activeBuoy, setActiveBuoy] = useState('STEEL_10');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 极坐标背景纹理 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
              <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="5 5" />
              <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="10 10" />
              <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#0891b2" strokeWidth="0.5" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0891b2" strokeWidth="0.5" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#0891b2" strokeWidth="0.5" />
          </svg>
      </div>

      {/* --- HEADER: 档案中心风格 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-cyan-600/20 border-2 border-cyan-500 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.3)] group">
             <Library size={36} className="text-cyan-400 group-hover:scale-110 transition-transform" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Database size={14} className="animate-pulse" /> AtoN Behavior Knowledge Archive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               助航灯浮标 <span className="text-cyan-500 italic">漂移规律知识库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">规律实体节点</div>
              <div className="text-3xl font-mono font-black text-white leading-none">5,240 <span className="text-xs text-slate-600 font-normal">NODES</span></div>
           </div>
           <div className="h-10 w-[1px] bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">关联置信度</div>
              <div className="text-3xl font-mono font-black text-emerald-400 leading-none">98.5<span className="text-xs font-normal text-slate-600">%</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Version</div>
              <div className="text-xl font-mono font-black text-cyan-400 leading-none">BK-v2.5</div>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT: 知识矩阵布局 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 机理分类与搜索 */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="机理分类导航" subtitle="TAXONOMY" className="flex-1 border-cyan-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索机理、型号、系数..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                  </div>
                  {BUOY_TAXONOMY.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setActiveBuoy(item.id)}
                      className={`p-4 rounded border transition-all cursor-pointer relative group
                        ${activeBuoy === item.id ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        {activeBuoy === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{item.label}</span>
                           <Compass size={14} className={activeBuoy === item.id ? 'text-cyan-400' : 'text-slate-600'} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                            <div className="flex flex-col"><span className="text-slate-600 uppercase">Weight</span> <span className="text-white">{item.weight}</span></div>
                            <div className="flex flex-col"><span className="text-slate-600 uppercase">Drag Coeff</span> <span className="text-amber-500">{item.drag}</span></div>
                        </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-blue-900/10 border border-blue-900/30 rounded">
                      <div className="text-[10px] text-blue-400 uppercase font-bold mb-2 flex items-center gap-2">
                          <Info size={12} /> 机理逻辑摘要
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "灯浮标漂移主受潮流动力控制，其次为风荷载。其漂移半径 R 与锚链长度 L 及沉砣抓力 F呈非线性正相关，遵循静力平衡方程 ΣF = 0。"
                      </p>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="环境响应模型" subtitle="SENSITIVITY" className="h-[240px] border-cyan-900/30">
                <div className="w-full h-full pt-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: '潮流力', A: 95, fullMark: 100 },
                          { subject: '风荷载', A: 55, fullMark: 100 },
                          { subject: '波浪冲击', A: 65, fullMark: 100 },
                          { subject: '锚链张力', A: 85, fullMark: 100 },
                          { subject: '沉渣阻力', A: 25, fullMark: 100 },
                       ]}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                           <Radar name="Sensitivity" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: 空间规律分析 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* 漂移概率分布图 */}
           <div className="flex-1 bg-[#05060a] border border-cyan-900/30 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex flex-col p-8">
              <div className="flex justify-between items-start mb-6">
                 <div className="z-10">
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Move size={14} /> Spatial Displacement Probability Map
                    </span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                       空间位移 <span className="text-cyan-500">统计规律分布图</span>
                    </h2>
                 </div>
                 <div className="flex gap-4 z-10">
                    <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-[10px] text-slate-400 font-mono">稳态回转区</span>
                    </div>
                    <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 font-mono">异常走锚阈值</span>
                    </div>
                 </div>
              </div>

              {/* 统计云图 (Recharts 散点模拟) */}
              <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <XAxis type="number" dataKey="x" domain={[-25, 25]} hide />
                          <YAxis type="number" dataKey="y" domain={[-25, 25]} hide />
                          <ZAxis type="number" dataKey="weight" range={[20, 200]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0c0e14', border: '1px solid #1e293b'}} />
                          <Scatter name="Points" data={DRIFT_PROBABILITY_DATA}>
                              {DRIFT_PROBABILITY_DATA.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.intensity === 'High Risk' ? '#ef4444' : '#0ea5e9'} 
                                    fillOpacity={0.4} 
                                  />
                              ))}
                          </Scatter>
                          <ReferenceLine x={0} stroke="#334155" />
                          <ReferenceLine y={0} stroke="#334155" />
                      </ScatterChart>
                  </ResponsiveContainer>
                  
                  {/* 中心沉砣标识 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                      <div className="w-14 h-14 border-2 border-cyan-500/50 rounded-full flex items-center justify-center bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                          <Anchor size={24} className="text-cyan-400" />
                      </div>
                      <div className="mt-2 text-[10px] text-cyan-800 font-black uppercase tracking-widest">Sinker Center</div>
                  </div>
              </div>

              {/* 规律统计指标 */}
              <div className="h-20 bg-slate-950/60 border-t border-slate-800/80 backdrop-blur px-8 flex items-center justify-between rounded-b-2xl">
                 <div className="flex gap-16">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">平均摆动半径</span>
                        <span className="text-2xl font-bold text-white font-mono tracking-tighter">14.25 <span className="text-xs text-slate-500 font-normal">M</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">规律置信区间</span>
                        <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tighter">98.2%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">关联测站数</span>
                        <span className="text-2xl font-bold text-white font-mono tracking-tighter">42 <span className="text-xs text-slate-500 font-normal">STATIONS</span></span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black uppercase rounded-sm transition-all flex items-center gap-2">
                       <Share2 size={14} /> 导出规律研究报告
                    </button>
                    <button className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-black uppercase rounded-sm transition-all shadow-lg shadow-cyan-900/40 flex items-center gap-2">
                       <Maximize2 size={14} /> 全屏规律推演
                    </button>
                 </div>
              </div>
           </div>

           {/* BOTTOM: 力学矩阵卡片 */}
           <div className="h-[220px] flex gap-4">
              <SciFiCard title="悬链线力学计算准则" subtitle="CATENARY MATRIX" className="flex-1 border-cyan-900/30 bg-[#080c14]">
                  <div className="flex h-full gap-8 items-center">
                      <div className="w-1/4 h-full relative flex items-center justify-center border-r border-slate-800/50 pr-4">
                          <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                              <path d="M10,10 Q50,90 90,10" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 2" />
                              <circle cx="10" cy="10" r="3" fill="#facc15" />
                              <circle cx="90" cy="10" r="3" fill="#facc15" />
                              <text x="50" y="85" textAnchor="middle" fill="#64748b" fontSize="8">Mooring Static Curve</text>
                          </svg>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-3">
                          {CATENARY_RULES.map((rule, i) => (
                              <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/50 transition-all group">
                                  <div className="text-xs font-bold text-white mb-1">配比比例 {rule.ratio}</div>
                                  <div className={`text-[10px] font-black mb-2 uppercase ${rule.security === 'Low' ? 'text-red-400' : 'text-cyan-400'}`}>[{rule.security}]</div>
                                  <p className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-300">{rule.desc}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>
           </div>
        </section>

        {/* RIGHT: 专家逻辑与文献库 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="专家判定逻辑树" subtitle="DECISION TREE" className="h-1/2 border-cyan-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl relative overflow-hidden group">
                       <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity"><AlertTriangle size={32} /></div>
                       <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                          <Zap size={14} /> 走锚移位判定准则
                       </h4>
                       <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "当位移半径 R &gt; 2.2 × L_chain 且 趋势线加速度 a &gt; 0.05 m/s²,系统自动标记为『疑似走锚』。需触发 PDM 维护预案。"
                       </p>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                       <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1 flex items-center gap-2">
                           <GitBranch size={12}/> 逻辑判定链路
                       </div>
                       {[
                           { label: '风向突变响应模型', val: '8-12 min lag' },
                           { label: '潮流反转回转轨迹', val: 'S-Curve Pattern' },
                           { label: '锚链有效抓力预测', val: '0.82 Coefficient' }
                       ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-3 bg-slate-900/40 rounded border border-slate-800 hover:border-cyan-500/50 cursor-pointer">
                               <span className="text-xs text-slate-300">{item.label}</span>
                               <span className="text-[10px] font-mono text-cyan-400">{item.val}</span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="维护工艺档案库" subtitle="DOCUMENTS" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { title: '特种底质抓力锚抛设规范', id: 'SOP-A1', type: 'SOP' },
                       { title: '锚链卸扣周期性疲劳评估', id: 'DOC-F2', type: 'REPORT' },
                       { title: '浮标自复位性能测试规程', id: 'PROC-C4', type: 'PROC' },
                       { title: '防台期间系泊加强方案', id: 'EMER-E1', type: 'EMER' },
                   ].map((doc, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-all cursor-pointer group">
                           <div className="p-2 rounded bg-slate-800 text-slate-500 group-hover:text-cyan-400 transition-colors">
                               <FileText size={16}/>
                           </div>
                           <div className="flex-1 overflow-hidden">
                               <div className="text-[9px] text-slate-600 font-mono">{doc.id}</div>
                               <div className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">{doc.title}</div>
                           </div>
                           <ChevronRight size={14} className="text-slate-700" />
                       </div>
                   ))}
                   <button className="mt-2 w-full py-3 bg-slate-950 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 hover:text-cyan-400 transition-all">
                       进入 PDM 完整文档中心
                   </button>
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: 状态与存证 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                PDM_DATA_SYNC: ACTIVE
            </span>
            <span className="hidden md:inline">SECURITY: SHM-AES256</span>
            <span className="hidden md:inline text-cyan-800">LAST_UPDATE: {new Date().toLocaleDateString()}</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Globe size={12} className="text-cyan-800" /> KNOWLEDGE_MATRIX: ONLINE
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
