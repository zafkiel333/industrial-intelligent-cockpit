import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileText, Shield, Activity, Ruler, Database, 
  Search, Clipboard, Zap, Layers, Compass, 
  BookOpen, History, ExternalLink, HardDrive, 
  Cpu, AlertTriangle, CheckCircle2, ChevronRight,
  Info, BarChart3, Scan, Scale,
  // Added Clock, Maximize2, and ArrowRight to fix the missing name errors
  Clock, Maximize2, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line, ScatterChart, Scatter, 
  Legend, ReferenceLine, PieChart, Pie, Cell 
} from 'recharts';

// --- 模拟知识库数据 ---

// 1. S-N 曲线数据 (材料疲劳特性)
const SN_CURVE_DATA = [
  { cycles: 10000, stress: 450 },
  { cycles: 50000, stress: 350 },
  { cycles: 100000, stress: 280 },
  { cycles: 500000, stress: 200 },
  { cycles: 1000000, stress: 160 },
  { cycles: 5000000, stress: 110 },
  { cycles: 10000000, stress: 90 },
];

// 2. 关键节点健康度分布
const COMPONENT_HEALTH = [
  { name: '主梁连接部', value: 85, status: 'Normal' },
  { name: '海侧门框', value: 72, status: 'Warning' },
  { name: '陆侧门框', value: 94, status: 'Optimal' },
  { name: '大车平衡梁', value: 68, status: 'Action Required' },
  { name: '上横梁', value: 88, status: 'Normal' },
];

// 3. 疲劳检测历史记录
const INSPECTION_LOGS = [
  { date: '2023-11-12', method: 'UT (超声)', target: '节点 B-14', result: '无裂纹', agent: '检测一中心' },
  { date: '2023-05-20', method: 'MT (磁粉)', target: '节点 A-08', result: '表面微裂纹 (L:2mm)', agent: '第三方质检' },
  { date: '2022-10-05', method: 'VT (外观)', target: '主梁底板', result: '漆膜脱落', agent: '日常运维' },
];

// 4. 疲劳计算参数标准库
const THEORY_LIB = [
  { id: 'T1', title: 'Miner 线性累计损伤理论', ref: 'GB/T 3811-2008', desc: '用于计算变幅载荷下的疲劳损伤度。' },
  { id: 'T2', title: '雨流计数法 (Rainflow)', ref: 'ASTM E1049', desc: '将复杂载荷历程转化为一系列全循环的算法。' },
  { id: 'T3', title: '有效应力幅准则', ref: 'Eurocode 3', desc: '针对焊接节点疲劳强度的计算规范。' },
];

// --- 视觉组件：技术图纸 ---
const CraneBluePrint = ({ activePoint }: { activePoint: string | null }) => {
    return (
        <div className="w-full h-full relative bg-[#0a0f1e] rounded-lg border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
            {/* CAD 风格网格背景 */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            
            <svg viewBox="0 0 800 500" className="w-full h-full relative z-10">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                    </marker>
                </defs>
                
                {/* 岸桥线框示意图 */}
                <g stroke="#334155" fill="none" strokeWidth="1.5">
                    {/* 陆侧门框 */}
                    <path d="M200,450 L200,150 L250,150 L250,450" />
                    {/* 海侧门框 */}
                    <path d="M500,450 L500,150 L550,150 L550,450" />
                    {/* 主梁 */}
                    <path d="M50,150 L750,150 L750,180 L50,180 Z" />
                    {/* 拉杆 */}
                    <path d="M200,150 L350,50 L500,150" />
                </g>

                {/* 疲劳敏感热点标注 */}
                <g>
                    {/* 节点 1: 主梁根部 */}
                    <circle cx="200" cy="165" r="8" fill={activePoint === 'P1' ? '#f59e0b' : '#1e293b'} stroke="#f59e0b" className="cursor-pointer hover:r-10 transition-all" />
                    <text x="215" y="155" fill="#94a3b8" fontSize="10">Node: GB-01 (主梁根部)</text>
                    
                    {/* 节点 2: 门框节点 */}
                    <circle cx="500" cy="300" r="8" fill={activePoint === 'P2' ? '#ef4444' : '#1e293b'} stroke="#ef4444" className="cursor-pointer" />
                    <text x="515" y="295" fill="#94a3b8" fontSize="10">Node: FR-04 (海侧应力集中点)</text>
                    
                    {/* 节点 3: 支撑梁 */}
                    <circle cx="250" cy="400" r="8" fill="#1e293b" stroke="#10b981" />
                </g>

                {/* 标注线 */}
                <line x1="550" y1="150" x2="650" y2="100" stroke="#475569" strokeDasharray="5 5" />
                <text x="660" y="95" fill="#0ea5e9" fontSize="10" fontWeight="bold">累计循环: 1,245,000</text>
            </svg>
            
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Drawing No.</div>
                <div className="text-sm font-mono text-slate-300">ZPMC-STS-2024-ARCHIVE-V1</div>
            </div>
        </div>
    );
};

export const CraneFatigueArchiveView: React.FC = () => {
  const [selectedCrane, setSelectedCrane] = useState('STS-01');
  const [activePoint, setActivePoint] = useState<string | null>('P2');

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#02040a] text-slate-200 p-2 overflow-hidden relative">
      
      {/* --- 全局装饰背景 --- */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      {/* --- TOP HEADER: 档案身份识别 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600/20 border-2 border-indigo-500 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(99,102,241,0.2)]">
             <Database size={36} className="text-indigo-400" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Shield size={12} /> Structural Asset Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               岸桥金属结构 <span className="text-indigo-500 italic">疲劳寿命数字化档案</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12 items-center">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前存证主体</span>
              <select 
                value={selectedCrane} 
                onChange={(e) => setSelectedCrane(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xl font-mono font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                  <option>STS-01</option>
                  <option>STS-02</option>
                  <option>STS-05</option>
              </select>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">设计服役期</div>
              <div className="text-2xl font-mono font-black text-white leading-none">25 <span className="text-sm font-normal text-slate-600">YEARS</span></div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">设计总循环</div>
              <div className="text-2xl font-mono font-black text-white leading-none">2.0M <span className="text-sm font-normal text-slate-600">CYCLES</span></div>
           </div>
        </div>
      </header>

      {/* --- MAIN CONTENT: 知识索引布局 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: 剩余寿命评估与关键统计 */}
        <section className="w-[380px] flex flex-col gap-4">
           
           <SciFiCard title="寿命耗损画像" subtitle="LIFE CONSUMPTION" className="h-[280px] border-indigo-900/30">
              <div className="flex flex-col h-full justify-between py-2">
                 <div className="flex items-end justify-between px-2">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">剩余经济寿命</div>
                        <div className="text-4xl font-mono font-black text-green-400 tracking-tighter">
                           16.4 <span className="text-lg">YRS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">累计损伤度 (D)</div>
                        <div className="text-2xl font-mono font-bold text-yellow-500">0.342</div>
                    </div>
                 </div>

                 {/* 进度条显示 */}
                 <div className="mt-6 px-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>已服役时间 (8.6 Yrs)</span>
                        <span>损伤临界值 (1.0)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                        <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" style={{ width: '34%' }}></div>
                        <div className="absolute top-0 left-[34%] h-full w-[2px] bg-white animate-pulse"></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mt-4">
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col items-center">
                         <Clock size={16} className="text-indigo-400 mb-1" />
                         <span className="text-[9px] text-slate-500 uppercase">年度平均循环</span>
                         <span className="text-lg font-bold text-white font-mono">14.5W</span>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col items-center">
                         <Activity size={16} className="text-cyan-400 mb-1" />
                         <span className="text-[9px] text-slate-500 uppercase">最大应力幅值</span>
                         <span className="text-lg font-bold text-white font-mono">185MPa</span>
                     </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="结构件健康评估矩阵" subtitle="HEALTH MATRIX" className="flex-1 border-indigo-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {COMPONENT_HEALTH.map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-indigo-500/40 transition-all cursor-pointer">
                           <div className="flex justify-between items-center mb-1.5">
                               <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                               <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status.includes('Normal') ? 'bg-green-900/30 text-green-400' : 
                                     item.status.includes('Warning') ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/40 text-red-400'}
                               `}>{item.status.toUpperCase()}</span>
                           </div>
                           <div className="flex items-center gap-4">
                               <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full transition-all duration-1000 ${item.value < 70 ? 'bg-red-500' : item.value < 80 ? 'bg-yellow-500' : 'bg-indigo-500'}`} 
                                      style={{width: `${item.value}%`}}
                                   ></div>
                               </div>
                               <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{item.value}%</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </section>

        {/* CENTER: 数字化图纸与疲劳曲线 */}
        <section className="flex-1 flex flex-col gap-5 min-w-0">
           
           {/* 图纸交互视窗 */}
           <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] group flex flex-col">
              <div className="absolute top-6 left-6 z-20">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-indigo-500 p-4 rounded-sm shadow-2xl flex flex-col">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Scan size={14} /> Interactive Blueprint Engine
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">结构热点检测视图</h2>
                 </div>
              </div>

              {/* 核心图纸区域 */}
              <div className="flex-1">
                  <CraneBluePrint activePoint={activePoint} />
              </div>

              {/* 下部数据标签 */}
              <div className="h-20 bg-slate-950/60 border-t border-slate-800/80 backdrop-blur px-6 flex items-center justify-between">
                 <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">钢材牌号 (Steel)</span>
                        <span className="text-sm font-bold text-slate-200">Q345D (Low Temp Resistant)</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">弹性模量 (E)</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">206 GPa</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">泊松比 (v)</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">0.3</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold rounded-sm transition-all flex items-center gap-2">
                        <Maximize2 size={12} /> 放大全图
                    </button>
                    <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-sm transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-2">
                        <Layers size={12} /> 切换至应力云图
                    </button>
                 </div>
              </div>
           </div>

           {/* 下部：疲劳机理分析 (S-N 曲线图表) */}
           <div className="h-[240px] flex gap-5">
               <SciFiCard title="材料 S-N 疲劳曲线" subtitle="LOGARITHMIC SCALE" className="flex-1 border-indigo-900/30" noPadding>
                   <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={SN_CURVE_DATA} margin={{top: 20, right: 30, left: 10, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="cycles" type="number" scale="log" domain={[1000, 10000000]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Cycles (N)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                            <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Stress Range (MPa)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#8b5cf6', color: '#fff'}} />
                            <Line type="monotone" dataKey="stress" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                            {/* 设计工作点 */}
                            <ReferenceLine x={2000000} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Design Limit', fill:'#f59e0b', fontSize:10}} />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <div className="w-[280px] bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                      <BarChart3 size={16} className="text-indigo-400" /> 应力谱权重分析
                   </div>
                   <div className="flex-1 flex flex-col gap-3 justify-center">
                       {[
                           { label: '满载起升 (Full)', val: 45, color: '#ef4444' },
                           { label: '偏载作业 (Off-center)', val: 25, color: '#f59e0b' },
                           { label: '空载往复 (Light)', val: 30, color: '#3b82f6' }
                       ].map(item => (
                           <div key={item.label}>
                               <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                   <span>{item.label}</span>
                                   <span className="font-mono">{item.val}%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="text-[9px] text-slate-500 italic bg-slate-950/50 p-2 rounded">
                       注：偏载作业对连接焊缝的疲劳损伤贡献率较设计值高出 12%。
                   </div>
               </div>
           </div>
        </section>

        {/* RIGHT: 知识库理论标准与检测档案 */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="疲劳计算标准库" subtitle="KNOWLEDGE BASE" className="h-[300px] border-indigo-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {THEORY_LIB.map(theory => (
                       <div key={theory.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl group hover:border-indigo-500/50 transition-all cursor-pointer">
                           <div className="flex justify-between items-start mb-1">
                               <h4 className="text-xs font-bold text-indigo-300 group-hover:text-white transition-colors">{theory.title}</h4>
                               <span className="text-[9px] text-slate-600 font-mono">{theory.id}</span>
                           </div>
                           <div className="text-[9px] text-slate-500 mb-2 flex items-center gap-1">
                               <BookOpen size={10} /> 引用标准: {theory.ref}
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight group-hover:text-slate-300">{theory.desc}</p>
                       </div>
                   ))}
                   <button className="w-full py-2 mt-auto border border-dashed border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-500 text-xs transition-all flex items-center justify-center gap-2">
                       <ExternalLink size={12} /> 访问 PDM 标准文档库
                   </button>
               </div>
           </SciFiCard>

           <SciFiCard title="无损检测 (NDT) 档案" subtitle="INSPECTION RECORDS" className="flex-1 border-indigo-900/30 flex flex-col">
               <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                   {INSPECTION_LOGS.map((log, i) => (
                       <div key={i} className="flex gap-4 p-3 bg-slate-950/50 border border-slate-900 rounded-lg relative group">
                           <div className="flex flex-col items-center gap-1 border-r border-slate-800 pr-3">
                               <span className="text-[9px] text-slate-500 uppercase">Date</span>
                               <span className="text-xs font-mono font-bold text-slate-300">{log.date.split('-')[1]}/{log.date.split('-')[2]}</span>
                           </div>
                           <div className="flex-1">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-white">{log.target}</span>
                                   <span className="text-[9px] bg-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-800/30">{log.method}</span>
                               </div>
                               <div className="flex items-center gap-2 text-[10px]">
                                   <span className={log.result.includes('裂纹') ? 'text-red-400' : 'text-green-500'}>
                                       {log.result}
                                   </span>
                                   <span className="text-slate-600">• {log.agent}</span>
                               </div>
                           </div>
                           <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <FileText size={14} className="text-slate-500 cursor-pointer hover:text-indigo-400" />
                           </div>
                       </div>
                   ))}
               </div>
               
               <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded-xl flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                       <Scan size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-white uppercase tracking-tighter">Next Scheduled Test</div>
                       <div className="text-lg font-mono font-bold text-blue-300">2024.12.15</div>
                       <div className="text-[9px] text-slate-500">检测计划: 结构核心受力节点全覆盖扫描</div>
                   </div>
                   <ArrowRight size={16} className="text-slate-600" />
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: 系统状态与存证溯源 --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/80 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 
                PDM DATA SYNC: SUCCESS
            </span>
            <span className="hidden md:inline">KERNEL: STRUCTURE-AI V4.2</span>
            <span className="hidden md:inline">LAST AUDIT: 2024-03-22 10:45:00</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Shield size={12} className="text-indigo-600" /> BLOCKCHAIN VERIFIED: X882-AB01
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        .text-shadow-glow { text-shadow: 0 0 10px rgba(99,102,241,0.5); }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
