
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { SubstituteCompareScene } from '../../components/spare_parts_substitute/SubstituteCompareScene';
// Added RefreshCw and BrainCircuit to the import list to fix missing references
import { 
  GitCompare, 
  ArrowRightLeft, 
  Binary, 
  Cpu, 
  Database, 
  Activity, 
  Microscope, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  ArrowRight,
  Scale, 
  Search,
  Zap,
  Box,
  ChevronRight,
  Fingerprint,
  CheckCircle2,
  XCircle,
  FileText,
  Workflow,
  RefreshCw,
  BrainCircuit
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

// --- 模拟数据 ---

const PENDING_MATCHES = [
  { id: 'REQ-922', name: '主轴承 (SKF-22320)', type: 'bearing', urgency: 'Critical', date: '04-01' },
  { id: 'REQ-885', name: '液压伺服阀 (Rex-V2)', type: 'valve', urgency: 'High', date: '04-02' },
  { id: 'REQ-551', name: '驱动同步齿轮 (M4-Z24)', type: 'gear', urgency: 'Med', date: '04-02' },
];

const ATTRIBUTE_DIFF = [
  { attr: '物理尺寸', original: 'Ø 120 x 45mm', substitute: 'Ø 120 x 45mm', status: 'match' },
  { attr: '额定载荷', original: '320 kN', substitute: '315 kN', status: 'deviate' },
  { attr: '材质硬度', original: 'HRC 58-62', substitute: 'HRC 60-64', status: 'better' },
  { attr: '极限转速', original: '4800 rpm', substitute: '4600 rpm', status: 'warning' },
  { attr: '耐腐蚀性', original: 'Grade 4', substitute: 'Grade 5', status: 'better' },
];

const MATCH_RADAR = [
  { subject: '几何兼容', A: 100, fullMark: 100 },
  { subject: '材料强度', A: 95, fullMark: 100 },
  { subject: '热稳定性', A: 82, fullMark: 100 },
  { subject: '获取周期', A: 100, fullMark: 100 }, // 替代件通常获取更快
  { subject: '成本效益', A: 90, fullMark: 100 },
];

export const SubstituteMatchingView: React.FC = () => {
  const [selectedReqId, setSelectedReqId] = useState(PENDING_MATCHES[0].id);
  const [isScanning, setIsScanning] = useState(false);

  const activeReq = useMemo(() => PENDING_MATCHES.find(r => r.id === selectedReqId) || PENDING_MATCHES[0], [selectedReqId]);

  const handleStartMatch = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略资源指挥台 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-4 bg-gradient-to-r from-orange-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-orange-400/50 relative group">
              <GitCompare size={36} className="text-white group-hover:rotate-180 transition-transform duration-700" />
              <div className="absolute -inset-2 border border-orange-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Asset Interchangeability & Compliance Lab
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件替代件 <span className="text-orange-500 italic">智能匹配服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">替代库覆盖率</div>
              <div className="text-2xl font-mono font-bold text-orange-400">82.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">年均避损金额</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">¥ 2.45 <span className="text-sm font-normal text-slate-600">M</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI 适配信度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">98.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：待处理需求与源指纹 (Source Pulse) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="待匹配需求队列" subtitle="MATCH_QUEUE" highlight className="border-orange-500/20 flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索原件编码..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500" />
                 </div>
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {PENDING_MATCHES.map(req => (
                      <div 
                        key={req.id}
                        onClick={() => setSelectedReqId(req.id)}
                        className={`p-4 rounded border transition-all cursor-pointer relative group
                          ${selectedReqId === req.id 
                            ? 'bg-orange-950/20 border-orange-500 shadow-lg' 
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-orange-500 font-bold">{req.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${req.urgency === 'Critical' ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}
                          `}>{req.urgency}</span>
                        </div>
                        <div className="text-sm font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{req.name}</div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                           <span className="flex items-center gap-1 uppercase"><Database size={10} /> {req.type}</span>
                           <span>{req.date} Archive</span>
                        </div>
                        {selectedReqId === req.id && (
                          <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 animate-pulse"></div>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="源件工况指纹" subtitle="OPERATING_FINGERPRINT">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-3">
                       <Activity size={18} className="text-orange-500" />
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">峰值震动频率</div>
                          <div className="text-xs font-bold text-white">42.5 Hz / Radial</div>
                       </div>
                    </div>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                 </div>
                 <div className="p-3 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-3">
                       <Zap size={18} className="text-cyan-400" />
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase">额定工作电压</div>
                          <div className="text-xs font-bold text-white">DC 24V / 1.2A</div>
                       </div>
                    </div>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 比对仿真与属性矩阵 (Digital Lab) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#02040a] border border-orange-900/20 rounded overflow-hidden group">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Microscope size={14} className="animate-pulse" />
                          Sub-Attribute Synthesis: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          备件基因 <span className="text-orange-500 italic">数字比对室</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-orange-500/30 p-2 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">综合匹配分值</div>
                       <div className="text-3xl font-mono font-bold text-orange-400 leading-none mt-1">94.8 <span className="text-sm font-normal text-slate-600">PTS</span></div>
                    </div>
                 </div>

                 {/* 中部比对状态 (浮窗) */}
                 {isScanning && (
                   <div className="self-center bg-orange-600/10 border border-orange-500/50 p-6 rounded-full backdrop-blur-xl animate-pulse flex flex-col items-center gap-2">
                      <Binary size={40} className="text-orange-400" />
                      <div className="text-sm font-bold text-white tracking-widest uppercase">正在分析物理拓扑差异...</div>
                   </div>
                 )}

                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Fingerprint size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">替代库索引 ID</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">ALT-X88-2024</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartMatch}
                         disabled={isScanning}
                         className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
                       >
                          {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={14}/>}
                          {isScanning ? '正在解算...' : '启动跨库替代匹配'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <SubstituteCompareScene 
                    originalType={activeReq.type as any} 
                    substituteType={activeReq.type as any}
                    matchScore={94.8}
                    isScanning={isScanning}
                 />
              </div>

              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：详细属性差异矩阵 (Comparison Grid) */}
           <SciFiCard title="备件属性深度差异矩阵" subtitle="SPEC_MATRIX" className="h-64 border-cyan-900/30">
              <div className="overflow-x-auto h-full custom-scrollbar">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-[#0b1221] z-10 border-b border-slate-800">
                       <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                          <th className="py-3 px-4">属性维度</th>
                          <th className="py-3 px-4">原件要求 (Standard)</th>
                          <th className="py-3 px-4">替代件性能 (Substitute)</th>
                          <th className="py-3 px-4 text-center">判定</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                       {ATTRIBUTE_DIFF.map((row, i) => (
                          <tr key={i} className="group hover:bg-slate-900/40 transition-colors">
                             <td className="py-4 px-4 font-bold text-slate-200">{row.attr}</td>
                             <td className="py-4 px-4 text-xs font-mono text-slate-400">{row.original}</td>
                             <td className="py-4 px-4 text-xs font-mono text-white">{row.substitute}</td>
                             <td className="py-4 px-4 text-center">
                                {row.status === 'match' && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-[9px] font-bold">完全契合</span>}
                                {row.status === 'deviate' && <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-[9px] font-bold">微小偏差</span>}
                                {row.status === 'better' && <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded text-[9px] font-bold">性能增强</span>}
                                {row.status === 'warning' && <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-[9px] font-bold">受限使用</span>}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：AI 决策建议与合规认证 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 适配评估模型" subtitle="REASONING">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MATCH_RADAR}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="适配度" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.2} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="工程决策建议" subtitle="AI_ADVISORY" className="flex-1 border-orange-900/30 bg-orange-950/5">
              <div className="space-y-4 h-full flex flex-col">
                 <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <BrainCircuit size={16} className="text-orange-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">适配结论</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “{activeReq.name} 的替代型号在 <span className="text-white font-bold">极限转速</span> 维度较原件低 4%，但基于该机组过去 24 个月的运行载荷分布，其实际工况转速从未超过 4000 rpm。判定：<span className="text-emerald-400 font-bold">二级代用可行</span>。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Scale size={60} className="text-orange-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <CheckCircle2 size={12} className="text-emerald-500" /> 合规性核查状态 (Audit)
                    </div>
                    {[
                      { label: '原厂知识产权声明', status: 'pass' },
                      { label: '材质分析报告 (NDT)', status: 'pass' },
                      { label: '非原厂认证证书', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-orange-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'pass' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>

                 <div className="mt-auto pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <ShieldCheck size={16} /> 下发代用批准令
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出匹配技术规格书</div>
                    <div className="text-xs font-bold text-white">SUB_TECH_SPEC_2024.pdf</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-orange-500 transition-colors" />
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
          background: rgba(249, 115, 22, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </div>
  );
};
