import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
// Add missing Truck and Play icon imports from lucide-react to fix "Cannot find name" errors on lines 218 and 249
import { 
  GitCommit, AlertOctagon, Waypoints, Search, 
  Database, Cpu, Clock, Zap, ChevronRight, 
  FileCode, ShieldAlert, CheckCircle2, History,
  Maximize2, Terminal, Share2, Network,
  Lock, ArrowRight, MousePointer2, AlertTriangle,
  Truck, Play
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, ScatterChart, Scatter, 
  ZAxis, Cell, Legend, AreaChart, Area
} from 'recharts';

// --- 模拟死锁案例库数据 ---

const DEADLOCK_CASES = [
  { id: 'DL-2024-001', type: 'Circular Wait', label: '四车环形等待死锁', severity: 'Critical', area: 'Block A-04 Junction', date: '2024-03-12' },
  { id: 'DL-2024-002', type: 'Head-on', label: '窄道双向路径对冲', severity: 'High', area: 'Lane 12 North', date: '2024-03-05' },
  { id: 'DL-2024-003', type: 'Re-entry', label: '充电位入库路径死锁', severity: 'Medium', area: 'Charging Station 02', date: '2024-02-28' },
  { id: 'DL-2024-004', type: 'Buffer Overflow', label: '堆场出入口队列积压', severity: 'High', area: 'Gate 05 Buffer', date: '2024-02-15' },
  { id: 'DL-2023-085', type: 'Priority Inversion', label: '紧急任务优先级倒置', severity: 'Low', area: 'Intersection X-2', date: '2023-12-10' },
];

const CONFLICT_GEOMETRY = [
  { x: 2, y: 5, id: 'AGV-42', status: 'Blocked', dir: 'N' },
  { x: 5, y: 8, id: 'AGV-15', status: 'Blocked', dir: 'W' },
  { x: 8, y: 5, id: 'AGV-09', status: 'Blocked', dir: 'S' },
  { x: 5, y: 2, id: 'AGV-33', status: 'Blocked', dir: 'E' },
];

const STATS_DATA = [
  { name: 'Junctions', value: 45, fill: '#0ea5e9' },
  { name: 'Straight', value: 15, fill: '#64748b' },
  { name: 'Charging', value: 25, fill: '#f59e0b' },
  { name: 'Buffer', value: 15, fill: '#ef4444' },
];

const LOGIC_TRACE = [
  { time: '14:25:01', unit: 'TOS-MAIN', msg: 'Assign Job #8821 to AGV-42 -> Path segment S420', type: 'cmd' },
  { time: '14:25:05', unit: 'AGV-42', msg: 'Request Lock Area [X5, Y8]', type: 'req' },
  { time: '14:25:06', unit: 'TOS-MAIN', msg: 'Lock Granted to AGV-42', type: 'ack' },
  { time: '14:25:10', unit: 'AGV-15', msg: 'Request Lock Area [X5, Y8] - Conflict detected', type: 'warn' },
  { time: '14:25:12', unit: 'SYS-MONITOR', msg: 'CIRCULAR WAIT DETECTED - ENGINE HALTED', type: 'error' },
];

export const AgvDeadlockKbView: React.FC = () => {
  const [selectedId, setSelectedId] = useState('DL-2024-001');
  const activeCase = DEADLOCK_CASES.find(c => c.id === selectedId) || DEADLOCK_CASES[0];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 overflow-hidden relative">
      
      {/* 背景装饰：网格与取证线 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-cyan-500/20 shadow-[0_0_15px_cyan]"></div>
          <div className="absolute top-1/3 left-0 w-full h-[1px] bg-red-500/10 shadow-[0_0_10px_red]"></div>
      </div>

      {/* --- TOP: Header HUD --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-cyan-600/20 border-2 border-cyan-500 rounded-xl flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.2)] group">
             <Waypoints size={36} className="text-cyan-400 group-hover:rotate-90 transition-transform duration-700" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.4em] font-black">
               <Database size={12} /> AGV Routing Intelligence Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               AGV 路径死锁 <span className="text-cyan-500 italic">取证与策略案例库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">案例收录总数</div>
              <div className="text-3xl font-mono font-black text-white leading-none">256 <span className="text-xs text-slate-600 font-normal">NODES</span></div>
           </div>
           <div className="h-10 w-[1px] bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">今日自动识别</div>
              <div className="text-3xl font-mono font-black text-orange-400 leading-none">02 <span className="text-xs text-orange-900 font-normal">ALERTS</span></div>
           </div>
           <div className="h-10 w-[1px] bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">知识库状态</div>
              <div className="text-xl font-mono font-black text-cyan-400 leading-none">V2.8-CORE</div>
           </div>
        </div>
      </header>

      {/* --- MAIN: Knowledge Portal --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* LEFT: Case Directory */}
        <section className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="历史死锁记录" subtitle="ARCHIVE" className="flex-1 border-cyan-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索案例ID、区域..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                  </div>
                  {DEADLOCK_CASES.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3 rounded border transition-all cursor-pointer relative group
                        ${selectedId === item.id ? 'bg-cyan-900/20 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                        {selectedId === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400">{item.id}</span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                              ${item.severity === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                {item.severity}
                           </span>
                        </div>
                        <h3 className={`text-xs font-bold ${selectedId === item.id ? 'text-white' : 'text-slate-300'}`}>{item.label}</h3>
                        <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-mono italic">
                            <span>{item.area}</span>
                            <span>{item.date}</span>
                        </div>
                    </div>
                  ))}
                  <button className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-700 rounded text-[10px] text-slate-500 uppercase font-black tracking-widest transition-all">
                      + 录入离线演练案例
                  </button>
              </div>
           </SciFiCard>

           <SciFiCard title="多发区域统计" subtitle="HOTSPOTS" className="h-[220px] border-cyan-900/30">
                <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={STATS_DATA} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fontSize: 10}} width={60} />
                           <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                               {STATS_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </section>

        {/* CENTER: Forensic Visualizer */}
        <section className="flex-1 flex flex-col gap-4 min-w-0 relative">
           
           {/* 冲突几何重构视窗 */}
           <div className="flex-1 bg-black border border-cyan-900/30 rounded-3xl overflow-hidden relative shadow-inner group flex flex-col">
              <div className="absolute top-6 left-6 z-20">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-2xl flex flex-col">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Maximize2 size={14} /> Deadlock Geometry Reconstruction
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                       {activeCase.label}
                    </h2>
                    <div className="flex gap-4 mt-3">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase">Conflict Type</span>
                          <span className="text-sm font-bold text-cyan-500">{activeCase.type}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-800"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase">Wait Loop</span>
                          <span className="text-sm font-bold text-red-500">4 Vehicles</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 拓扑背景 */}
              <div className="flex-1 relative p-12">
                  <div className="w-full h-full border border-slate-800 rounded-lg relative bg-[#02040a]">
                      {/* 渲染取证线条 */}
                      <svg width="100%" height="100%" className="absolute inset-0">
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                              </marker>
                          </defs>
                          <g stroke="#1e293b" strokeWidth="20" fill="none" strokeLinecap="round">
                              <path d="M100,50 L100,450" />
                              <path d="M50,250 L750,250" />
                              <path d="M300,50 L300,450" />
                              <path d="M500,50 L500,450" />
                          </g>
                          {/* 渲染冲突关系 */}
                          <path d="M200,200 L400,200 L400,400 L200,400 Z" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                          <line x1="200" y1="200" x2="190" y2="150" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />
                          <line x1="400" y1="200" x2="450" y2="190" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />
                      </svg>
                      
                      {/* 车辆节点 */}
                      {CONFLICT_GEOMETRY.map((v) => (
                          <div 
                            key={v.id} 
                            className="absolute flex flex-col items-center group cursor-pointer" 
                            style={{ left: `${v.x * 10}%`, top: `${v.y * 10}%`, transform: 'translate(-50%, -50%)' }}
                          >
                              <div className="w-10 h-10 bg-slate-900 border-2 border-red-500 rounded flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                  <Truck size={20} />
                              </div>
                              <div className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-red-900/50 text-[10px] font-bold text-white whitespace-nowrap">
                                  {v.id} | <span className="text-red-400">{v.status}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* 底部详情标签 */}
              <div className="h-20 bg-slate-950/80 border-t border-slate-800 backdrop-blur px-8 flex items-center justify-between">
                 <div className="flex gap-12">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">故障坐标 (X, Y)</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">1,245.5 / 882.2</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">系统采样率</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">200 Hz</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black">平均解除时耗</span>
                        <span className="text-sm font-bold text-orange-400 font-mono">42.5 SEC</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-black uppercase rounded-sm transition-all flex items-center gap-2">
                       <Maximize2 size={12} /> 导出全息取证
                    </button>
                    <button className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-black uppercase rounded-sm transition-all shadow-lg shadow-cyan-900/40 flex items-center gap-2">
                       <Play size={12} fill="currentColor" /> 模拟路径回放
                    </button>
                 </div>
              </div>
           </div>

           {/* 指令追踪终端 (Logic Trace) */}
           <div className="h-[200px] bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
               <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-2 flex items-center gap-2">
                   <Terminal size={12} className="text-cyan-500" /> Command Sequence Audit Trail
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-2">
                   {LOGIC_TRACE.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all ${log.type === 'error' ? 'text-red-400 bg-red-900/10' : 'text-slate-400 hover:text-cyan-300'}`}>
                           <span className="opacity-40">{log.time}</span>
                           <span className="text-cyan-800 font-bold w-20">[{log.unit}]</span>
                           <span className="flex-1">{log.msg}</span>
                       </div>
                   ))}
               </div>
           </div>
        </section>

        {/* RIGHT: Prevention & Reasoning */}
        <section className="w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="专家推理引擎" subtitle="AI REASONING" className="h-[300px] border-cyan-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-xl relative overflow-hidden">
                       <div className="absolute right-0 top-0 p-2 opacity-10"><AlertTriangle size={32} /></div>
                       <h4 className="text-xs font-bold text-red-300 mb-2 flex items-center gap-2">
                          <Cpu size={14} /> 冲突机理分析
                       </h4>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          "本死锁属于典型的‘资源有限性导致的循环等待’。AGV-42 占用了 X5 通道并请求进入 Y8，而 AGV-15 已在 Y8 等待 X5 释放。由于系统缺乏跨区域锁闭预测，导致逻辑回环。"
                       </p>
                   </div>

                   <div className="flex-1 min-h-0">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">算法决策因子 (Weights)</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length:10}, (_, i) => ({ t: i, val: Math.random() * 100 }))}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="t" hide />
                               <YAxis hide />
                               <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>

                   <div className="bg-slate-900/50 border border-slate-800 p-2 rounded flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 uppercase">Confidence Level</span>
                      <span className="text-green-400 font-bold">98.2%</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="防御性规则库" subtitle="PREVENTION" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full">
                   <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                       {[
                           { id: 'REG-12', label: '节点互斥区域扩容', desc: '在交叉口设置最小 15m 的防冲突缓冲区。' },
                           { id: 'REG-25', label: '动态优先级强制覆盖', desc: '当等待时长 > 30s 时，自动提升链尾车辆权重。' },
                           { id: 'REG-08', label: '多步锁闭预测协议', desc: '车辆必须提前 2 个步段申请锁定权限。' },
                       ].map((reg, i) => (
                           <div key={i} className="p-2 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] font-bold text-cyan-300">RULE {reg.id}</span>
                                   <CheckCircle2 size={12} className="text-green-500" />
                               </div>
                               <div className="text-xs font-bold text-white group-hover:text-cyan-100 transition-colors">{reg.label}</div>
                               <p className="text-[9px] text-slate-500 mt-1">{reg.desc}</p>
                           </div>
                       ))}
                   </div>
                   <button className="mt-auto w-full py-3 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition-all">
                       <ShieldAlert size={14} /> 部署规则至实时 TOS 系统
                   </button>
               </div>
           </SciFiCard>

        </section>
      </main>

      {/* --- FOOTER: Global Status --- */}
      <footer className="z-10 h-10 flex items-center px-6 justify-between bg-slate-950/60 border-t border-white/5 rounded-b-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                PDM_SERVER: CONNECTED [HK-CENTER-02]
            </span>
            <span className="hidden md:inline">SYSTEM_INTEGRITY: SECURED</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
               <Network size={12} className="text-cyan-800" /> DISTRIBUTED_REASONING: ACTIVE
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
