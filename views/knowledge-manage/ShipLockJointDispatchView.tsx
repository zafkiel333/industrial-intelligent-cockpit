
import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/knowledge-manage/ship-lock-dispatch/ThreeScene';
import { DispatchAlgorithmMode } from '../../components/knowledge-manage/ship-lock-dispatch/three-types';
import { SciFiCard } from '../../components/SciFiCard';
// Add missing icons 'RefreshCw' and 'FileText' to imports
import { 
  GitMerge, Cpu, Zap, Activity, ShieldCheck, 
  Database, Workflow, Network, Code, BarChart4,
  Settings, Play, Terminal as TerminalIcon, Search,
  Share2, Binary, Sliders, Layers, RefreshCw, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, Cell
} from 'recharts';

// --- 模拟数据 ---
const ALGO_MATRIX = [
  { id: 'MILP', name: '混合整数线性规划 (MILP)', type: 'Mathematical', perf: 95, cost: 40, risk: 'Low', tags: ['全局最优', '离线预案'] },
  { id: 'RL', name: '深度强化学习 (DQN/PPO)', type: 'AI/ML', perf: 88, cost: 90, risk: 'High', tags: ['实时自适应', '多Agent'] },
  { id: 'GA', name: '自适应遗传算法 (AGA)', type: 'Heuristic', perf: 90, cost: 60, risk: 'Med', tags: ['快速分组', '鲁棒性强'] },
  { id: 'CO-OP', name: '梯级协同演化算法', type: 'Distributed', perf: 92, cost: 75, risk: 'Med', tags: ['跨站联动', '水位平衡'] },
];

const PARETO_DATA = Array.from({length: 30}, (_, i) => ({
    x: 40 + Math.random() * 50, // 效率
    y: 30 + Math.random() * 60, // 节水
    z: Math.random() * 10,      // 复杂度
}));

const LOGS = [
  { time: '10:45:12', msg: '初始化全流域 AIS 数据映射完成...', type: 'info' },
  { time: '10:45:15', msg: '启动 MILP 求解器，搜索空间: 1.2e+6 Nodes', type: 'process' },
  { time: '10:45:22', msg: '计算完成：发现 425 个可行调度解，Pareto 筛选中...', type: 'success' },
  { time: '10:45:30', msg: '指令同步：GZ-01 闸首预计提早 5min 开启。', type: 'action' },
];

export const ShipLockJointDispatchView: React.FC = () => {
  const [activeAlgo, setActiveAlgo] = useState('MILP');
  const [simMode, setSimMode] = useState<DispatchAlgorithmMode>('EFFICIENCY_FIRST');
  const [terminalLogs, setTerminalLogs] = useState(LOGS);

  // 模拟终端实时日志
  useEffect(() => {
    const timer = setInterval(() => {
        const newLog = {
            time: new Date().toLocaleTimeString(),
            msg: `正在根据「${simMode}」模式重新计算资源权重...`,
            type: 'info'
        };
        setTerminalLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 5000);
    return () => clearInterval(timer);
  }, [simMode]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 relative overflow-hidden">
      
      {/* 背景动态装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      {/* --- 顶部区域：算法库核心概览 --- */}
      <header className="z-10 flex items-center justify-between bg-slate-900/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group">
             <Binary size={36} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-1 uppercase tracking-[0.4em] font-black">
               <GitMerge size={12} /> Optimization Algorithm Repository
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               船闸通航 <span className="text-blue-500 italic">联合调度算法库</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-12">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">已训练模型数</div>
              <div className="text-3xl font-mono font-black text-white leading-none">12 <span className="text-xs text-slate-600 font-normal">MODELS</span></div>
           </div>
           <div className="text-right border-l border-slate-800 pl-12">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均通过能力提升</div>
              <div className="text-3xl font-mono font-black text-green-400 leading-none">+18.5<span className="text-xs font-normal text-slate-600">%</span></div>
           </div>
           <div className="text-right border-l border-slate-800 pl-12">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">资源调度版本</div>
              <div className="text-xl font-mono font-black text-blue-400 leading-none">V4.2.0-STABLE</div>
           </div>
        </div>
      </header>

      {/* --- 主体区域 --- */}
      <main className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* 左侧：算法矩阵与逻辑 */}
        <section className="w-[380px] flex flex-col gap-4">
           <SciFiCard title="计算模型矩阵" subtitle="ALGO SELECTOR" className="flex-1 border-blue-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {ALGO_MATRIX.map((algo) => (
                    <div 
                      key={algo.id}
                      onClick={() => setActiveAlgo(algo.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group
                        ${activeAlgo === algo.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-white group-hover:text-blue-400">{algo.name}</span>
                           {activeAlgo === algo.id && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {algo.tags.map(tag => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">{tag}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                            <div className="flex flex-col">
                                <span className="text-slate-600 uppercase">求解效率</span>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{width: `${algo.perf}%`}}></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-slate-600 uppercase">计算资源</span>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{width: `${algo.cost}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="参数调优面板" subtitle="HYPERPARAMETERS" className="h-[220px] border-blue-900/30">
               <div className="flex flex-col gap-4">
                  <div className="space-y-3">
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">时间步长 (Delta T)</span>
                              <span className="text-white font-mono">15s</span>
                          </div>
                          <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">收敛容忍度 (Epsilon)</span>
                              <span className="text-white font-mono">1e-6</span>
                          </div>
                          <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                      </div>
                  </div>
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40">
                      <RefreshCw size={14} /> 重新训练当前模型
                  </button>
               </div>
           </SciFiCard>
        </section>

        {/* 中央：3D 孪生引擎 */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
           <div className="flex-1 bg-black border border-white/5 rounded-3xl overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
              <ThreeScene mode={simMode} />
              
              {/* 3D 浮层 HUD */}
              <div className="absolute top-6 left-6 pointer-events-none">
                 <div className="bg-slate-950/80 backdrop-blur border-l-4 border-blue-500 p-5 rounded shadow-2xl flex flex-col">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                       <Workflow size={14} /> Virtual Simulation Engine
                    </span>
                    <h2 className="text-2xl font-black text-white italic uppercase">{simMode.replace('_', ' ')}</h2>
                    <div className="mt-3 flex gap-4">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase">Solve Time</span>
                          <span className="text-lg font-mono text-white">45ms</span>
                       </div>
                       <div className="w-px h-8 bg-slate-800"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase">Search space</span>
                          <span className="text-lg font-mono text-white">1.2M</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 模式快速切换 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full p-2 gap-2 shadow-2xl z-20">
                  {[
                    { id: 'EFFICIENCY_FIRST', label: '通航最优' },
                    { id: 'WATER_SAVING', label: '极致节水' },
                    { id: 'PRIORITY_EXEC', label: '应急优先' },
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSimMode(m.id as any)}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all
                        ${simMode === m.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-transparent text-slate-500 hover:text-slate-300'}
                      `}
                    >
                      {m.label}
                    </button>
                  ))}
              </div>

              {/* 右下角：计算状态 */}
              <div className="absolute bottom-6 right-8 flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 bg-black/60 rounded-full border border-blue-500/30 text-[10px] text-blue-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    COMPUTING: PDS_OPTIMIZER
                 </div>
              </div>
           </div>

           {/* 底部：实时计算日志 */}
           <div className="h-[160px] bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-6 overflow-hidden">
               <div className="w-1/3 border-r border-slate-800 pr-6 flex flex-col">
                  <div className="text-[10px] text-slate-500 uppercase font-black mb-3 flex items-center gap-2">
                    <TerminalIcon size={12} /> Runtime Kernel Console
                  </div>
                  <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className={`flex gap-2 ${log.type === 'success' ? 'text-green-500' : log.type === 'action' ? 'text-blue-400' : 'text-slate-400'}`}>
                           <span className="opacity-40">{log.time}</span>
                           <span>{log.msg}</span>
                        </div>
                      ))}
                  </div>
               </div>
               <div className="flex-1 flex flex-col">
                  <div className="text-[10px] text-slate-500 uppercase font-black mb-3">Resource Flow Map</div>
                  <div className="flex-1 flex items-center justify-between px-10">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded border flex items-center justify-center ${i <= 3 ? 'border-blue-500 bg-blue-900/20' : 'border-slate-800 bg-slate-900'}`}>
                               <Layers size={18} className={i <= 3 ? 'text-blue-400' : 'text-slate-700'} />
                            </div>
                            <div className="w-0.5 h-4 bg-slate-800"></div>
                            <span className="text-[8px] text-slate-600">NODE_{i*25}</span>
                        </div>
                      ))}
                      {/* 连接线动画 */}
                      <div className="absolute left-[35%] right-8 top-[65%] h-px bg-slate-800 -z-0"></div>
                  </div>
               </div>
           </div>
        </section>

        {/* 右侧：效能分析与目标 */}
        <section className="w-[340px] flex flex-col gap-4">
           <SciFiCard title="帕累托前沿分析" subtitle="MULTI-OBJECTIVE" className="h-[300px] border-blue-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 20, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis type="number" dataKey="x" name="Efficiency" hide />
                           <YAxis type="number" dataKey="y" name="Saving" hide />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Scatter name="Solutions" data={PARETO_DATA} fill="#0ea5e9" opacity={0.6}>
                               {PARETO_DATA.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={index === 5 ? '#ef4444' : '#0ea5e9'} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
               <div className="mt-2 flex justify-between px-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Candidate Set</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Current Choice</span>
               </div>
           </SciFiCard>

           <SciFiCard title="算法能效评分" subtitle="BENCHMARK" className="flex-1 border-blue-900/30">
                <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: '时效性', A: 95, fullMark: 100 },
                          { subject: '稳定性', A: 92, fullMark: 100 },
                          { subject: '鲁棒性', A: 85, fullMark: 100 },
                          { subject: '资源占用', A: 60, fullMark: 100 },
                          { subject: '扩展性', A: 88, fullMark: 100 },
                       ]}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Performance" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>

           <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-2xl flex flex-col gap-3">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-400" size={18} />
                  <span className="text-xs font-bold text-white">模型安全性校验</span>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  "当前选择的 MILP 求解器已通过极端载荷工况测试，验证逻辑符合《全流域枢纽联合调度规范2024》之规定。"
               </p>
               <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2">
                   <FileText size={12} /> 查看校验报告
               </button>
           </div>
        </section>
      </main>

      {/* --- 全局状态页脚 --- */}
      <footer className="z-10 h-12 flex items-center px-6 justify-between bg-slate-950/60 border border-white/5 rounded-2xl">
         <div className="flex gap-8 items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> KERNEL_HEALTH: EXCELLENT</span>
            <span>GPU_SOLVER: ACTIVE [NVIDIA RTX 4090 CLUSTER]</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 text-blue-400/60 text-[10px] font-black tracking-widest uppercase">
               <Database size={14} /> SYNCING WITH CLOUD DATA LAKE
            </div>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
