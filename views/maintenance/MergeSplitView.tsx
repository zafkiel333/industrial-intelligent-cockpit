import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitMerge, 
  GitBranch, 
  Zap, 
  Layers, 
  Cpu, 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Maximize2,
  Minimize2,
  Link,
  Unlink,
  AlertCircle,
  FileJson,
  CircleCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid
} from 'recharts';

// --- 模拟数据 ---
const SOURCE_POOL = [
  { id: 'WO-101', target: '主变压器 A', type: '巡检', cost: 120, priority: 'High', area: '变电区' },
  { id: 'WO-102', target: '主变压器 B', type: '巡检', cost: 120, priority: 'High', area: '变电区' },
  { id: 'WO-105', target: '冷却泵 P1', type: '润滑', cost: 45, priority: 'Med', area: '泵房' },
  { id: 'WO-109', target: '5G基站 R4', type: '固件', cost: 30, priority: 'Low', area: '塔楼' },
];

const IMPACT_RADAR = [
  { name: '资源复用', current: 40, projected: 85 },
  { name: '执行时效', current: 60, projected: 92 },
  { name: '物流成本', current: 30, projected: 75 },
  { name: '风险控制', current: 80, projected: 85 },
];

export const MergeSplitView: React.FC = () => {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [selectedIds, setSelectedIds] = useState<string[]>(['WO-101']);
  
  const handleToggleId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-200 animate-in zoom-in-95 duration-700">
      
      {/* 顶部：重构中心控制台 */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-sm border-2 transition-all duration-500 shadow-lg
              ${mode === 'merge' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-cyan-500/20' : 'border-orange-500 bg-orange-950/20 text-orange-400 shadow-orange-500/20'}
           `}>
              {mode === 'merge' ? <GitMerge size={32} /> : <GitBranch size={32} />}
           </div>
           <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-1">Work Order Atomic Control</div>
              <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">
                 工单原子 <span className={mode === 'merge' ? 'text-cyan-500' : 'text-orange-500'}>{mode === 'merge' ? '重构' : '裂变'}</span> 中心
              </h1>
           </div>
        </div>

        <div className="flex bg-slate-900/80 p-1.5 rounded-sm border border-slate-800">
           <button 
             onClick={() => setMode('merge')}
             className={`px-8 py-2 text-xs font-bold transition-all rounded-sm flex items-center gap-2
                ${mode === 'merge' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-300'}
             `}
           >
              <Link size={14} /> 聚合模式
           </button>
           <button 
             onClick={() => setMode('split')}
             className={`px-8 py-2 text-xs font-bold transition-all rounded-sm flex items-center gap-2
                ${mode === 'split' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}
             `}
           >
              <Unlink size={14} /> 裂变模式
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：原始工单能量池 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                 <Database size={14} className="text-cyan-500" /> 原始任务载荷
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Total: 4</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {SOURCE_POOL.map(wo => (
                <div 
                  key={wo.id}
                  onClick={() => handleToggleId(wo.id)}
                  className={`p-4 border transition-all cursor-pointer relative group overflow-hidden
                    ${selectedIds.includes(wo.id) 
                      ? (mode === 'merge' ? 'bg-cyan-950/20 border-cyan-500 shadow-lg' : 'bg-orange-950/20 border-orange-500 shadow-lg') 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{wo.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                       ${wo.priority === 'High' ? 'bg-red-900/30 text-red-500' : 'bg-slate-800 text-slate-400'}
                    `}>{wo.priority}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{wo.target}</div>
                  <div className="flex items-center justify-between text-[10px]">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Layers size={10} /> {wo.type}
                     </div>
                     <div className="text-slate-400 font-mono">{wo.cost} MIN</div>
                  </div>
                  
                  {/* 选中指示条 */}
                  {selectedIds.includes(wo.id) && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${mode === 'merge' ? 'bg-cyan-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="重构策略库" subtitle="AI_RULES" className="bg-slate-950/30">
              <div className="space-y-2">
                 {[
                    { label: '物理重合合并', id: 'POL-1' },
                    { label: '技能相似拆分', id: 'POL-2' },
                    { label: 'SLA 紧急优先', id: 'POL-3' },
                 ].map(pol => (
                    <div key={pol.id} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-400 hover:border-cyan-500/50 cursor-pointer">
                       <span>{pol.label}</span>
                       <CircleCheck size={12} className="text-slate-700" />
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：中央拓扑重构区 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#02040a] border border-slate-800/50 rounded overflow-hidden group">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          TOPOLOGY RECONFIG: ACTIVE
                       </div>
                       <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">
                          Atomic <span className={mode === 'merge' ? 'text-cyan-500' : 'text-orange-500'}>Structure</span> Canvas
                       </h3>
                    </div>
                    <div className="text-right bg-black/40 border border-slate-800 p-3 rounded backdrop-blur-sm">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest">Synergy Index</div>
                       <div className={`text-xl font-mono font-bold ${mode === 'merge' ? 'text-cyan-400' : 'text-orange-400'}`}>
                          {mode === 'merge' ? '+42.5%' : '+18.2%'}
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-center">
                    <button className={`px-12 py-4 rounded-full font-bold tracking-[0.4em] uppercase transition-all transform hover:scale-105 active:scale-95 pointer-events-auto shadow-2xl
                       ${mode === 'merge' ? 'bg-cyan-600 text-white shadow-cyan-900/40' : 'bg-orange-600 text-white shadow-orange-900/40'}
                    `}>
                       执行重构操作
                    </button>
                 </div>
              </div>

              {/* 核心拓扑图 (SVG) */}
              <div className="w-full h-full flex items-center justify-center">
                 <svg className="w-full h-full" viewBox="0 0 800 500">
                    <defs>
                       <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor={mode === 'merge' ? '#06b6d4' : '#f97316'} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={mode === 'merge' ? '#06b6d4' : '#f97316'} stopOpacity="0" />
                       </radialGradient>
                    </defs>

                    {/* 背景连线装饰 */}
                    <circle cx="400" cy="250" r="180" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />
                    <circle cx="400" cy="250" r="100" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />

                    {/* 中心锚点 */}
                    <g transform="translate(400, 250)">
                       <circle r="60" fill="url(#nodeGlow)" className="animate-pulse" />
                       <path d="M-20,-20 L20,20 M-20,20 L20,-20" stroke={mode === 'merge' ? '#06b6d4' : '#f97316'} strokeWidth="2" />
                       <text y="45" textAnchor="middle" fill="#fff" fontSize="10" className="font-bold tracking-widest uppercase">Target Kernel</text>
                    </g>

                    {/* 节点生成 */}
                    {selectedIds.map((id, i) => {
                       const angle = (i / selectedIds.length) * Math.PI * 2 - Math.PI / 2;
                       const dist = 150;
                       const x = 400 + Math.cos(angle) * dist;
                       const y = 250 + Math.sin(angle) * dist;
                       return (
                          <g key={id}>
                             {/* 动态引力线 */}
                             <line 
                               x1="400" y1="250" x2={x} y2={y} 
                               stroke={mode === 'merge' ? '#0ea5e9' : '#f97316'} 
                               strokeWidth="1.5" 
                               strokeDasharray="5 5"
                               className="animate-[dash_10s_linear_infinite]"
                             />
                             {/* 节点外壳 */}
                             <circle cx={x} cy={y} r="25" fill="#0b1221" stroke={mode === 'merge' ? '#0ea5e9' : '#f97316'} strokeWidth="2" />
                             <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" className="font-mono">{id}</text>
                             <circle cx={x} cy={y} r="35" fill="none" stroke={mode === 'merge' ? '#0ea5e9' : '#f97316'} strokeWidth="1" opacity="0.2" className="animate-ping" />
                          </g>
                       );
                    })}
                 </svg>
              </div>

              {/* 背景装饰线 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
           </div>

           {/* 底部：操作流水与审计 */}
           <SciFiCard title="重构逻辑链审计" subtitle="AUDIT_LOG" className="h-44 border-slate-800/60 overflow-hidden">
              <div className="h-full overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                 {[
                   { time: '14:20:01', action: '加压', detail: '系统载入工单 WO-101 原子指纹', type: 'info' },
                   { time: '14:20:05', action: '聚合', detail: '识别变电区空间重叠，触发融合逻辑', type: 'success' },
                   { time: '14:20:12', action: '预测', detail: 'AI 重构完成后预计节约工时 24.5%', type: 'warn' },
                   { time: '14:20:15', action: '准备', detail: '等待授权签名执行...', type: 'info' },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-4 text-[11px] py-1 font-mono border-b border-white/5">
                      <span className="text-slate-600">{log.time}</span>
                      <span className={`font-bold w-12 ${log.type === 'success' ? 'text-green-500' : log.type === 'warn' ? 'text-amber-500' : 'text-cyan-500'}`}>[{log.action}]</span>
                      <span className="text-slate-400">{log.detail}</span>
                   </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：AI 效能预测矩阵 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="重构效能评估" subtitle="IMPACT_MATRIX">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={IMPACT_RADAR} margin={{ left: -30 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                         contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px'}}
                         cursor={{fill: 'rgba(255,255,255,0.05)'}}
                       />
                       <Bar dataKey="projected" name="重构后" fill={mode === 'merge' ? '#0ea5e9' : '#f97316'} radius={[2, 2, 0, 0]} barSize={12} />
                       <Bar dataKey="current" name="当前状态" fill="#334155" radius={[2, 2, 0, 0]} barSize={6} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                 <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">工时压缩</div>
                    <div className="text-lg font-bold text-white">-24%</div>
                 </div>
                 <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">风险稀释</div>
                    <div className="text-lg font-bold text-green-400">12.5%</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 专家建议" subtitle="REASONING" className="flex-1">
              <div className="space-y-4">
                 <div className="p-3 bg-red-950/20 border border-red-900/30 rounded flex items-start gap-3 relative overflow-hidden">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-red-200">冲突检测预警</div>
                       <div className="text-[10px] text-slate-400 mt-1">
                          试图合并的工单 <span className="text-white font-bold">WO-101</span>涉及高电压操作，建议在合并时增加专职安全员。
                       </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                 </div>

                 <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded flex items-start gap-3 relative overflow-hidden">
                    <TrendingUp className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-cyan-200">路径最优化</div>
                       <div className="text-[10px] text-slate-400 mt-1">
                          检测到当前选中的 3 个工单均位于“变电区”，合并后可减少物料往返时间约 15 分钟。
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                       <FileJson size={14} /> 导出重构 XML
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  );
};
