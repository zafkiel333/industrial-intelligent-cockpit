
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { DowntimeThreeScene } from '../../components/maintenance_downtime/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-downtime-coding]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-downtime-coding';
import { DowntimeNode } from '../../components/maintenance_downtime/three-types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, ComposedChart, Line
} from 'recharts';
import { 
  Zap, 
  Settings, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  Cpu, 
  History, 
  Database,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  GitBranch,
  Layers,
  Binoculars,
  Fingerprint,
  RotateCw,
  Box,
  Binary,
  // Fix: CheckCircle was used in the component but was not imported from lucide-react
  CheckCircle
} from 'lucide-react';

const MOCK_NODES: DowntimeNode[] = [
  { id: 'DT-01', code: 'ME-042', category: 'mechanical', duration: 120, frequency: 15, position: [-5, 2, -4] },
  { id: 'DT-02', code: 'EL-109', category: 'electrical', duration: 45, frequency: 22, position: [6, -1, 3] },
  { id: 'DT-03', code: 'OP-001', category: 'operational', duration: 15, frequency: 45, position: [0, 4, -5] },
  { id: 'DT-04', code: 'EX-999', category: 'external', duration: 180, frequency: 2, position: [-3, -3, 6] },
  { id: 'DT-05', code: 'ME-088', category: 'mechanical', duration: 90, frequency: 8, position: [4, 3, 2] },
];

const PARETO_DATA = [
  { name: '机械疲劳', duration: 450, percentage: 42 },
  { name: '电气过载', duration: 280, percentage: 68 },
  { name: '物流延迟', duration: 150, percentage: 82 },
  { name: '误操作', duration: 100, percentage: 92 },
  { name: '能源波动', duration: 80, percentage: 100 },
];

const CATEGORIES = [
  { id: 'mechanical', label: '机械失效', count: 12, color: 'text-amber-500', bg: 'bg-amber-950/20' },
  { id: 'electrical', label: '电气故障', count: 8, color: 'text-purple-400', bg: 'bg-purple-950/20' },
  { id: 'operational', label: '操作失误', count: 15, color: 'text-emerald-400', bg: 'bg-emerald-950/20' },
  { id: 'external', label: '外部环境', count: 4, color: 'text-rose-400', bg: 'bg-rose-950/20' },
];

export const DowntimeCodingView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleDeepScan = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 头部：诱因解算面板 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/50 relative group">
              <Binary size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-indigo-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Loss Root Cause Taxonomy & Analysis
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 停机原因 <span className="text-indigo-500 italic">编码深度解算中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">MTTR 均值</div>
              <div className="text-2xl font-mono font-bold text-indigo-400">4.2 <span className="text-xs text-slate-600">HR</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">价值蒸发率</div>
              <div className="text-2xl font-mono font-bold text-rose-500">¥ 12.4k <span className="text-xs text-slate-600">/HR</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">模式重合度</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">92.4%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：编码本体分类 (Taxonomy) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-indigo-500" /> 停机本体库架构</span>
              <span>v2.5.0</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeCategory === cat.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded ${cat.bg} ${cat.color}`}>
                          {cat.id === 'mechanical' ? <Settings size={18}/> : cat.id === 'electrical' ? <Zap size={18}/> : <Activity size={18}/>}
                       </div>
                       <h3 className="font-bold text-slate-100 text-sm">{cat.label}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{cat.count} Codes</span>
                  </div>
                  
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] uppercase text-slate-500 font-bold">
                        <span>损失贡献 (Impact)</span>
                        <span className={cat.id === 'mechanical' ? 'text-rose-400' : 'text-slate-300'}>
                           {cat.id === 'mechanical' ? 'High' : 'Normal'}
                        </span>
                     </div>
                     <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${cat.id === 'mechanical' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: cat.id === 'mechanical' ? '82%' : '45%' }}></div>
                     </div>
                  </div>

                  {activeCategory === cat.id && (
                     <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                        <div className="text-[9px] bg-black/40 p-1.5 rounded text-slate-400 border border-slate-800">ME-042 轴承失效</div>
                        <div className="text-[9px] bg-black/40 p-1.5 rounded text-slate-400 border border-slate-800">ME-088 链条断裂</div>
                     </div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="知识图谱完整度" subtitle="GRAPH_SYNC" className="h-32">
              <div className="flex items-center gap-4 h-full">
                 <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                    <GitBranch size={20} className="text-indigo-400" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">归一化匹配度</div>
                    <div className="text-xl font-bold text-white">99.2%</div>
                    <p className="text-[9px] text-slate-600">已同步集团 1.4W 条编码基准</p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 停机轨迹分布场 (Entropy Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded-lg overflow-hidden group">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4c1d95 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Binoculars size={14} className="animate-pulse" />
                          DOWNTIME TEMPORAL ENTROPY FIELD
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Loss <span className="text-indigo-500">Distribution</span>
                       </div>
                    </div>
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">样本重构深度</div>
                       <div className="text-2xl font-mono font-bold text-indigo-400 leading-none mt-1">LCI-9.4 <span className="text-sm font-normal text-slate-600">Sync</span></div>
                    </div>
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Fingerprint size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前焦点事件 (Focus Event)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{selectedNode || 'GLOBAL_VIEW'}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleDeepScan}
                         className={`px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                           ${isCalculating ? 'bg-slate-800 text-indigo-500 border border-indigo-500/50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'}
                         `}
                       >
                          {isCalculating ? <RotateCw className="animate-spin" size={14}/> : <Zap size={16}/>}
                          {isCalculating ? '正在执行特征聚类...' : '启动深度解算引擎'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <DowntimeThreeScene 
                    nodes={MOCK_NODES} 
                    activeCategoryId={activeCategory}
                    onNodeSelect={setSelectedNode}
                    isCalculating={isCalculating}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/40"></div>
           </div>

           {/* 底部：帕累托分析图 (Pareto Analytics) */}
           <SciFiCard title="停机损失帕累托分析 (Loss Concentration)" subtitle="PARETO_8020" className="h-56 border-rose-900/30">
              <div className="h-full flex gap-6">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={PARETO_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" stroke="#475569" fontSize={10} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px' }} />
                          <Bar yAxisId="left" dataKey="duration" fill="#1e293b" barSize={30} radius={[4, 4, 0, 0]}>
                             {PARETO_DATA.map((entry, index) => (
                               <Cell key={index} fill={index === 0 ? '#ef4444' : '#6366f1'} fillOpacity={0.8} />
                             ))}
                          </Bar>
                          <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-64 border-l border-slate-800 pl-6 flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">关键诱因聚焦 (Vital Few)</div>
                    <div className="text-3xl font-mono font-bold text-rose-400">82.4%</div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                       排名前 3 的故障编码（机械疲劳、电气过载、物流）贡献了总停机时长的 <span className="text-white font-bold">82.4%</span>。建议优先针对此三项发起技改流程。
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：特征推演与治理 (Action Matrix) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="编码诱因诊断结论" subtitle="CONCLUSION">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase">主因锁定：共振失效</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “通过对编码 ME-042 的聚类分析，该停机多发于 #2 机组 14Hz 负载点，判定为结构共振引起的长期疲劳。建议调整变频器‘禁止频率’。”
                    </p>
                    <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500 opacity-50"></div>
                 </div>
                 
                 <div className="bg-slate-900/60 border border-slate-800 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">治理闭环率</span>
                       <span className="text-xs text-indigo-400 font-bold">78%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[78%] shadow-[0_0_10px_#6366f1]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="诱因治理任务流" subtitle="TASK_FLOW" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { label: '变频器死区补偿升级', target: 'EL-109', status: 'done' },
                      { label: '主轴承支架加固工程', target: 'ME-042', status: 'active' },
                      { label: '供应链冗余策略更新', target: 'EX-999', status: 'pending' },
                      { label: '操作员SOP模拟训练', target: 'OP-001', status: 'pending' },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all">
                         <div className="min-w-0">
                            <div className={`text-xs font-bold ${task.status === 'done' ? 'text-slate-500' : 'text-slate-200'}`}>{task.label}</div>
                            <div className="text-[9px] text-slate-600 font-mono uppercase">Link: {task.target}</div>
                         </div>
                         {task.status === 'done' ? <CheckCircle size={16} className="text-green-500" /> : 
                          task.status === 'active' ? <Activity size={16} className="text-indigo-400 animate-pulse" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="bg-slate-950 p-3 rounded flex items-center justify-between border border-slate-800 cursor-pointer hover:border-indigo-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          <History size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase">模式回溯分析</div>
                             <div className="text-xs font-bold text-white">Compare with 2023_Q4</div>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-700" />
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <Box size={16} /> 导出诱因解算全量白皮书
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Layers size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 停机台账</div>
                    <div className="text-xs font-bold text-white">ERP_DT_SYNC_9924</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
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
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
