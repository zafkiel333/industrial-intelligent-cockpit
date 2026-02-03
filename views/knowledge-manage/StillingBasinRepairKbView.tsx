
import React, { useState } from 'react';
import { ThreeScene } from '../../components/knowledge-manage/stilling-basin/ThreeScene';
import { BasinState } from '../../components/knowledge-manage/stilling-basin/three-types';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Activity, ShieldCheck, Microscope, Database, 
  Search, Info, AlertTriangle, CheckCircle2, Zap,
  Wrench, Layers, Beaker, FileText, Anchor, Settings,
  Cpu, MousePointer2, Scan,
  /* Added missing icons to fix "Cannot find name" errors */
  Thermometer, PlayCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts';

// --- 模拟数据 ---
const MATERIAL_PROPERTIES = [
  { subject: '抗冲切', A: 95, fullMark: 100 },
  { subject: '水下不分散', A: 88, fullMark: 100 },
  { subject: '早期强度', A: 92, fullMark: 100 },
  { subject: '流平性', A: 85, fullMark: 100 },
  { subject: '粘结力', A: 90, fullMark: 100 },
];

const WEAR_HISTORY = [
  { time: '2020', depth: 2.1 },
  { time: '2021', depth: 4.5 },
  { time: '2022', depth: 8.8 },
  { time: '2023', depth: 12.4 },
  { time: '2024', depth: 15.1 },
];

const SOP_STEPS = [
  { id: 'S1', title: '数字建模', icon: <Scan size={18}/>, state: 'SURVEY', desc: 'MBES毫米级扫测。' },
  { id: 'S2', title: '高压清洗', icon: <Activity size={18}/>, state: 'CLEANING', desc: 'ROV 200MPa射流。' },
  { id: 'S3', title: '注浆修复', icon: <Wrench size={18}/>, state: 'REPAIRING', desc: '水下不分散砼浇筑。' },
  { id: 'S4', title: '精平验收', icon: <CheckCircle2 size={18}/>, state: 'INSPECT', desc: '数字化型线复核。' },
];

export const StillingBasinRepairKbView: React.FC = () => {
  const [activeState, setActiveState] = useState<BasinState>('SURVEY');
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="h-full flex flex-col bg-[#02040a] text-slate-100 font-[Rajdhani] overflow-hidden relative">
      
      {/* 1. 背景 3D 渲染层 - 填充整个容器 */}
      <div className="absolute inset-0 z-0">
         <ThreeScene state={activeState} />
         {/* 遮罩，增加UI可读性 */}
         <div className="absolute inset-0 bg-gradient-to-r from-[#02040a] via-transparent to-[#02040a] opacity-60 pointer-events-none"></div>
      </div>

      {/* 2. 顶部导航与全局指标 */}
      <header className="z-20 flex items-center justify-between bg-slate-950/80 border-b border-cyan-500/20 px-6 py-4 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
             <Anchor size={28} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Repair Knowledge Engine
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
               水下消力池 <span className="text-blue-400 italic">磨损修复工艺库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">工艺节点数</div>
              <div className="text-2xl font-mono font-bold text-white leading-none">245</div>
           </div>
           <div className="text-right border-l border-slate-800 pl-8">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">修复可靠性指数</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 leading-none">98.2%</div>
           </div>
        </div>
      </header>

      {/* 3. 主体交互层 - 固定高度，内部滚动 */}
      <main className="flex-1 flex justify-between p-4 gap-6 z-10 min-h-0 relative">
        
        {/* 左侧控制台：感知与检索 */}
        <aside className="w-[360px] flex flex-col gap-4 min-h-0">
           <SciFiCard title="磨损数据档案" subtitle="CHRONO-DATA" className="h-1/3 border-blue-900/30">
              <div className="w-full h-full flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs text-blue-400 font-bold">冲刷坑深度演变 (cm)</span>
                     <span className="text-[10px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded">Alert Level High</span>
                  </div>
                  <div className="flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WEAR_HISTORY}>
                           <defs>
                              <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Area type="monotone" dataKey="depth" stroke="#ef4444" fill="url(#wearGrad)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="语义化工艺检索" subtitle="AI SEARCH" className="flex-1 border-blue-900/30">
              <div className="flex flex-col h-full gap-4">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-all" placeholder="输入关键字，如'环氧砂浆'..." />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {[
                          { title: '水下不分散混凝土施工规范', id: 'DOC-01' },
                          { title: '特大冲刷坑ROV填筑工艺', id: 'DOC-02' },
                          { title: '环氧基料水下粘结力试验', id: 'DOC-03' },
                          { title: '消力池底板空蚀修复复盘', id: 'DOC-04' },
                          { title: '高压射流表面清理作业指导', id: 'DOC-05' },
                      ].map((item, i) => (
                          <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <FileText size={16} className="text-slate-500 group-hover:text-blue-400" />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">{item.title}</div>
                                    <div className="text-[9px] text-slate-600 mt-1">Ref ID: {item.id}</div>
                                </div>
                             </div>
                          </div>
                      ))}
                  </div>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      <Database size={14} /> 导出结构化知识包
                  </button>
              </div>
           </SciFiCard>
        </aside>

        {/* 右侧控制台：材料与限制 */}
        <aside className="w-[360px] flex flex-col gap-4 min-h-0">
           <SciFiCard title="材料力学雷达" subtitle="MATERIAL" className="h-1/3 border-emerald-900/30">
               <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="55%" outerRadius="75%" data={MATERIAL_PROPERTIES}>
                          <PolarGrid stroke="#064e3b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="修复料" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                      </RadarChart>
                  </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="作业工况硬约束" subtitle="SAFETY LIMIT" className="flex-1 border-blue-900/30">
               <div className="flex flex-col gap-4 h-full justify-center">
                   <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity"><Waves size={48} /></div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">环境流速上限 (Flow Velocity)</div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-mono font-bold text-white">≤ 1.5</span>
                         <span className="text-sm text-slate-500 font-bold">m/s</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[75%]"></div>
                      </div>
                   </div>

                   <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity"><Thermometer size={48} /></div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">最低水下温度 (Temp)</div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-mono font-bold text-white">≥ 5.0</span>
                         <span className="text-sm text-slate-500 font-bold">°C</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[45%]"></div>
                      </div>
                   </div>

                   <div className="mt-auto p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex items-start gap-3">
                       <AlertTriangle className="text-red-500 shrink-0" size={18} />
                       <p className="text-[11px] text-red-200/80 leading-relaxed italic">
                           注意：超过 2.0m/s 流速将导致高强修补料大量流失，必须采用钢板围堰防护。
                       </p>
                   </div>
               </div>
           </SciFiCard>
        </aside>

        {/* 4. 底部 HUD 工艺进度条 - 浮动在 3D 层之上 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
           <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4 flex gap-4 backdrop-blur-xl shadow-2xl items-center">
              <div className="flex-shrink-0 px-4 border-r border-slate-800 mr-4">
                  <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Active Step</div>
                  <div className="text-xl font-bold text-white italic">SB-{activeState}</div>
              </div>
              
              <div className="flex-1 flex gap-3">
                  {SOP_STEPS.map((step, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setActiveState(step.state as BasinState); setSelectedStep(idx); }}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
                        ${selectedStep === idx ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        <div className={`p-2 rounded-lg ${selectedStep === idx ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                           {step.icon}
                        </div>
                        <div className="text-left hidden md:block">
                           <div className={`text-xs font-bold ${selectedStep === idx ? 'text-white' : 'text-slate-400'}`}>{step.title}</div>
                           <div className="text-[9px] text-slate-500 truncate w-32">{step.desc}</div>
                        </div>
                    </button>
                  ))}
              </div>

              <div className="flex-shrink-0 pl-4">
                  <button className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90">
                      <PlayCircle size={28} />
                  </button>
              </div>
           </div>
        </div>

      </main>

      {/* 4. 全局状态脚注 */}
      <footer className="z-20 h-10 bg-slate-950 border-t border-white/5 flex items-center px-6 justify-between text-[10px] font-mono text-slate-500">
         <div className="flex gap-6 items-center uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Local Server Node: 124.0.1</span>
            <span>Kernel: V2.5.8-STILLING</span>
         </div>
         <div className="flex gap-4">
            <span className="text-blue-400">ROV DATA SYNC: ACTIVE</span>
            <span>GPU_LOAD: 24%</span>
         </div>
      </footer>

      {/* 动画定义 */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};
