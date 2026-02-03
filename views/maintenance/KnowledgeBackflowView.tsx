
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { KnowledgeThreeScene } from '../../components/maintenance_knowledge/ThreeScene';
import { KnowledgeNode } from '../../components/maintenance_knowledge/three-types';
import { 
  BrainCircuit, 
  Database, 
  Zap, 
  TrendingUp, 
  ClipboardCheck, 
  MessageSquareShare, 
  Microscope, 
  Fingerprint, 
  FileSearch, 
  Settings, 
  Share2, 
  Dna,
  History,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  Cpu,
  Layers,
  // Added missing icons to fix errors on lines 193, 251, 291, and 307
  RefreshCw,
  Target,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

const MOCK_NODES: KnowledgeNode[] = [
  { id: 'K01', type: 'core', position: [-4, 2, -3], label: '轴承疲劳模型' },
  { id: 'K02', type: 'core', position: [5, -2, 4], label: '油液污染标准' },
  { id: 'K03', type: 'reference', position: [0, 5, -6], label: '振动频谱基准' },
  { id: 'NEW-001', type: 'new', position: [-2, -3, 2], label: '新型密封圈适配' },
];

const IMPACT_PREDICTION = [
  { name: '响应时效', value: 85, color: '#0ea5e9' },
  { name: '一次修复率', value: 92, color: '#10b981' },
  { name: '备件损耗', value: 78, color: '#f59e0b' },
  { name: '故障预测', value: 96, color: '#8b5cf6' },
];

export const KnowledgeBackflowView: React.FC = () => {
  const [isDistilling, setIsDistilling] = useState(false);
  const [step, setStep] = useState(1);

  const handleStartDistill = () => {
    setIsDistilling(true);
    setTimeout(() => {
      setIsDistilling(false);
      setStep(2);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 头部：知识主权看板 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-purple-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-purple-400/50 relative group">
              <BrainCircuit size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-purple-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maintenance Intelligence Synthesis
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修知识 <span className="text-purple-500 italic">反哺提报中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已萃取知识 (Nodes)</div>
              <div className="text-2xl font-mono font-bold text-purple-400">1,284 <span className="text-xs text-slate-600">Active</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">全厂智慧贡献率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">22.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">算法自演化度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">98.2%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：实战案例溯源 (Field Evidence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="源工单数字化溯源" subtitle="CASE_TRACE" highlight className="border-purple-500/20">
              <div className="space-y-4 h-full flex flex-col">
                 <div className="p-3 bg-slate-950/60 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="text-[10px] text-purple-400 font-bold mb-1">源工单编号 (Origin WO)</div>
                    <div className="text-lg font-mono font-bold text-white tracking-widest uppercase">WO-77X-B-9921</div>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                       <span>执行人: 张工 (P8级)</span>
                       <span>2024-03-22 14:20</span>
                    </div>
                    <Dna className="absolute -right-4 -bottom-4 text-purple-900/10 opacity-30" size={80} />
                 </div>

                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">异常物理量特征</div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                       <span className="text-[10px] text-slate-400">振动频率波峰</span>
                       <span className="text-xs font-mono text-red-400">42.5 Hz</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                       <span className="text-[10px] text-slate-400">压力突变响应</span>
                       <span className="text-xs font-mono text-white">0.42 s</span>
                    </div>
                 </div>

                 <div className="flex-1 min-h-[120px] bg-slate-950/80 rounded border border-slate-800 p-2 overflow-hidden">
                    <div className="text-[9px] text-slate-600 mb-2 uppercase tracking-widest">现场影像存证 (Media)</div>
                    <div className="h-20 w-full bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400')] bg-cover grayscale group-hover:grayscale-0 transition-all cursor-zoom-in"></div>
                 </div>

                 <div className="pt-2 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-all">
                       <FileSearch size={12} /> 调阅完整维修日志
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold uppercase">
                 <History size={14} /> 类似案例碰撞
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed italic">
                 “当前故障模式与 2021-05 的 #2机组 缺陷匹配度 82%，彼时解决方案通过备件升级已失效，需重新萃取根因。”
              </div>
              <Fingerprint className="absolute -right-2 top-0 text-purple-500 opacity-5" size={40} />
           </div>
        </div>

        {/* 中枢：3D 知识星团与萃取 (Distillation Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-purple-900/20 rounded overflow-hidden group">
              {/* 背景装饰与网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          KNOWLEDGE NEURAL SYNC: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          知识拓扑 <span className="text-purple-500 italic">全息演化场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-purple-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">神经网络深度</div>
                       <div className="text-2xl font-mono font-bold text-purple-400 leading-none mt-1">LCI-9.4 <span className="text-sm font-normal text-slate-600">Sync</span></div>
                    </div>
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Database size={20} className="text-purple-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前焦点节点 (Focus Node)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Seal_Adapt_V3.0</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartDistill}
                         className={`px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                           ${isDistilling ? 'bg-slate-800 text-purple-500 border border-purple-500/50' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'}
                         `}
                       >
                          {isDistilling ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={16}/>}
                          {isDistilling ? '正在执行知识萃取...' : '启动智慧反哺引擎'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <KnowledgeThreeScene 
                    nodes={MOCK_NODES} 
                    isDistilling={isDistilling}
                    onNodeSelect={() => {}}
                 />
              </div>

              {/* 四角技术边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/40"></div>
           </div>

           {/* 底部：效能增益预测曲线 (Impact Simulation) */}
           <SciFiCard title="反哺后维保效能增益模拟 (Simulation)" subtitle="IMPACT_FORECAST" className="h-56 border-emerald-900/30">
              <div className="h-full flex gap-6">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={IMPACT_PREDICTION} layout="vertical" margin={{ left: -20 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'rgba(16, 185, 129, 0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px' }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                             {IMPACT_PREDICTION.map((entry, index) => (
                               <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-64 border-l border-slate-800 pl-6 flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计 MTTR 缩短</div>
                    <div className="text-3xl font-mono font-bold text-emerald-400">-14.2%</div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                       基于新提报的密封圈适配方案，同类故障的二次诊断时间可减少约 <span className="text-white font-bold">15分钟</span>。
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：智慧萃取提报表单 (Form Area) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="知识深度萃取表" subtitle="DISTILLATION_FORM" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Target size={12}/> 故障模式分类识别</label>
                       <select className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-purple-500 transition-all">
                          <option>结构疲劳引起的连锁失效</option>
                          <option>预防性维保参数漂移</option>
                          <option>突发环境过载响应</option>
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Sparkles size={12}/> 优化工艺算法反哺</label>
                       <textarea 
                          rows={4}
                          placeholder="描述改进后的工艺逻辑、扭矩基准或检测时序..."
                          className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 outline-none focus:border-purple-500 transition-all placeholder:text-slate-700"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Layers size={12}/> 替代/增强备件建议</label>
                       <input 
                          type="text" 
                          placeholder="输入建议的新型号或强化件代码..."
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-purple-500 transition-all"
                       />
                    </div>

                    <div className="p-3 bg-purple-900/10 border border-purple-500/20 rounded flex items-start gap-3">
                       <Microscope size={18} className="text-purple-400 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-slate-500 leading-normal">
                          <span className="text-purple-300 font-bold">AI 实时增强：</span> 系统已自动补充该案例相关的《金属金相分析报告》附件，建议一并归档。
                       </p>
                    </div>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800 space-y-3">
                    <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm shadow-xl shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <Share2 size={16} /> 提交反哺并更新全厂基准
                    </button>
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest flex items-center gap-1">
                          <ShieldCheck size={10} className="text-green-500" /> Digital Sign Verified
                       </span>
                       <span className="text-[9px] text-slate-600 font-mono">HASH: 0x9221_7724</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Award size={16} className="text-amber-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">提报贡献荣誉积分</div>
                    <div className="text-xs font-bold text-white">+ 450 XP <span className="text-[10px] text-slate-500 ml-1">Rank Up!</span></div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
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
          background: rgba(139, 92, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
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
