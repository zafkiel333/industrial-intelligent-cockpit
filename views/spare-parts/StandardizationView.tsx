import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { StandardCodingScene } from '../../components/spare_parts_standard/StandardCodingScene';
import { 
  Fingerprint, 
  Binary, 
  Cpu, 
  Database, 
  Activity, 
  ScanSearch, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  GitBranch,
  ShieldCheck,
  Zap,
  Target,
  Search,
  Box,
  Binary as BinaryIcon,
  Tag,
  Dna,
  // Fix: Added missing ChevronRight import
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, CartesianGrid,
  // Fix: Added missing AreaChart and Area imports
  AreaChart,
  Area
} from 'recharts';

// --- 模拟数据 ---

const TAXONOMY_TREE = [
  { id: 'M', label: '机械类 (Mechanical)', children: [
    { id: 'M-01', label: '传动件 (Transmission)' },
    { id: 'M-02', label: '密封件 (Sealing)' },
    { id: 'M-03', label: '紧固件 (Fastener)' },
  ]},
  { id: 'E', label: '电气类 (Electrical)', children: [
    { id: 'E-01', label: '控制模块 (Control)' },
    { id: 'E-02', label: '传感器 (Sensor)' },
  ]},
];

const CODE_SEGMENTS = [
  { segment: '分类码', bit: '4位', desc: '基于国标 GB/T 7635' },
  { segment: '特征码', bit: '6位', desc: '材质/规格/压力等级' },
  { segment: '流水码', bit: '4位', desc: '资产唯一识别号' },
  { segment: '校验位', bit: '1位', desc: 'Luhn 算法自动生成' },
];

const RAW_DATA_MOCK = [
  { raw: '轴承 6205 SKF', std: '深沟球轴承 | 6205 | SKF', confidence: 98, status: 'normalized' },
  { raw: 'SEAL RING 120-150', std: 'O型密封圈 | 120x150 | 氟橡胶', confidence: 85, status: 'enriching' },
  { raw: 'PLC CPU 模块', std: '可编程控制器 | CPU模块 | SIMATIC S7', confidence: 92, status: 'normalized' },
];

const QUALITY_STATS = [
  { name: '名称规范化', value: 94 },
  { name: '描述结构化', value: 88 },
  { name: '属性完整度', value: 76 },
  { name: '编码唯一性', value: 100 },
];

export const StandardizationView: React.FC = () => {
  const [codingProgress, setCodingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPart, setSelectedPart] = useState('valve');

  const startNormalization = () => {
    setIsProcessing(true);
    setCodingProgress(0);
    const interval = setInterval(() => {
      setCodingProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          setIsProcessing(false);
          return 1;
        }
        return prev + 0.05;
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#020617]">
      
      {/* 顶部：战略治理抬头 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 relative group">
              <Fingerprint size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Spare Parts Identity & Standardization
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件标准化 <span className="text-cyan-500 italic">与数字化编码服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">主数据标准度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">94.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已治理条目</div>
              <div className="text-2xl font-mono font-bold text-indigo-400">12,840</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">重复率削减</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">-18.4%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：知识分类树 (Taxonomy) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="编码分类目录 (L1-L4)" subtitle="TAXONOMY_TREE" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索分类..." className="w-full bg-slate-950 border border-slate-800 rounded py-1.5 pl-9 pr-4 text-xs outline-none focus:border-cyan-500" />
                 </div>
                 {TAXONOMY_TREE.map(cat => (
                    <div key={cat.id} className="space-y-1">
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-800 rounded text-xs font-bold text-slate-300">
                          <Layers size={14} className="text-cyan-500" /> {cat.label}
                       </div>
                       <div className="pl-6 space-y-1">
                          {cat.children.map(child => (
                             <div key={child.id} className="p-2 text-xs text-slate-500 hover:text-cyan-400 cursor-pointer flex items-center gap-2 border-l border-slate-800 hover:border-cyan-500 transition-all">
                                <GitBranch size={10} /> {child.label}
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="主数据健康态势" subtitle="QUALITY_INDEX">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={QUALITY_STATS} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={60} />
                       <Tooltip cursor={{fill: 'rgba(6, 182, 212, 0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {QUALITY_STATS.map((entry, index) => (
                             <Cell key={index} fill={entry.value > 90 ? '#10b981' : entry.value > 80 ? '#0ea5e9' : '#f59e0b'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：编码生成引擎与3D视觉 (The Generator) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-cyan-900/20 rounded overflow-hidden group">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Coding Neural Synthesis: {isProcessing ? 'Active' : 'Standby'}
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          备件数字化 <span className="text-cyan-500 italic">编码重构引擎</span>
                       </h2>
                    </div>
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="flex bg-slate-950/80 p-1 rounded border border-slate-800">
                          {['valve', 'sensor', 'bolt'].map(t => (
                             <button key={t} onClick={() => setSelectedPart(t)} className={`px-4 py-1 text-[10px] uppercase font-bold rounded-sm transition-all ${selectedPart === t ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                {t}
                             </button>
                          ))}
                       </div>
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">编码唯一性校验</div>
                          <div className="text-xs font-mono font-bold text-green-400">PASSED: UUID_9X-882</div>
                       </div>
                    </div>
                 </div>

                 {/* 核心编码生成展示 */}
                 <div className="self-center flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                       {['SP', '012', 'M03', '7724', 'X'].map((seg, i) => (
                         <div key={i} className="flex flex-col items-center">
                            <div className={`w-16 h-20 border-2 rounded flex items-center justify-center text-2xl font-mono font-bold transition-all duration-700
                               ${codingProgress > (i/5) ? 'border-cyan-500 text-white bg-cyan-950/20' : 'border-slate-800 text-slate-800'}
                            `}>
                               {codingProgress > (i/5) ? seg : '??'}
                            </div>
                            <div className="text-[8px] text-slate-600 mt-1 uppercase font-bold">BIT_0{i+1}</div>
                         </div>
                       ))}
                    </div>
                    {isProcessing && (
                      <div className="text-sm font-bold text-cyan-400 animate-pulse tracking-[0.5em] uppercase">
                         正在萃取物理基因 (Extracting DNA)...
                      </div>
                    )}
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Dna size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前编码信度 (Confidence)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">High / 98.4%</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={startNormalization}
                         disabled={isProcessing}
                         className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                       >
                          {isProcessing ? <RefreshCw className="animate-spin" size={14}/> : <BinaryIcon size={14}/>}
                          {isProcessing ? '正在生成...' : '启动归一化编码生成'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染 */}
              <div className="absolute inset-0">
                 <StandardCodingScene 
                    codingFactor={codingProgress} 
                    partType={selectedPart as any}
                    isProcessing={isProcessing}
                 />
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：编码结构解析与历史趋势 */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-48">
              <SciFiCard title="编码段规则解析" subtitle="LOGIC_STRUCTURE" className="md:col-span-7 border-slate-800">
                 <div className="grid grid-cols-4 gap-4 h-full items-center">
                    {CODE_SEGMENTS.map((seg, i) => (
                      <div key={i} className="flex flex-col gap-1 border-r border-slate-800 last:border-0 pr-4">
                         <div className="text-[10px] text-cyan-500 font-bold">{seg.segment}</div>
                         <div className="text-lg font-bold text-white font-mono">{seg.bit}</div>
                         <div className="text-[9px] text-slate-500 leading-tight">{seg.desc}</div>
                      </div>
                    ))}
                 </div>
              </SciFiCard>
              <SciFiCard title="数据质量提升曲线" subtitle="DATA_GROWTH" className="md:col-span-5 border-slate-800">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       {/* Fix: Resolved find name errors by importing AreaChart and Area */}
                       <AreaChart data={[
                         { name: 'W1', val: 65 }, { name: 'W2', val: 78 }, { name: 'W3', val: 82 }, { name: 'W4', val: 94 }
                       ]}>
                          <defs>
                             <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" hide />
                          <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#colorQuality)" strokeWidth={2} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 归一化工作流 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 属性萃取引擎" subtitle="NORMALIZATION">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">属性归一化 (Step 1)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                       <span className="text-slate-500 italic">原始输入:</span>
                       <span className="text-slate-300 font-mono">Bearin 6205 SKF</span>
                    </div>
                    <div className="flex items-center justify-center py-1">
                       <ArrowRight size={14} className="text-slate-700" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                       <span className="text-slate-500 italic">纠偏结果:</span>
                       <span className="text-emerald-400 font-bold">深沟球轴承 (Bearing)</span>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <GitBranch size={12} className="text-cyan-500" /> 属性映射状态
                    </div>
                    {[
                      { label: '主材质 (Material)', status: 'Verified', val: 'Steel' },
                      { label: '规格 (Spec)', status: 'Verified', val: 'DN100' },
                      { label: '压力 (Pressure)', status: 'Extracted', val: '1.6MPa' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500">{step.label}</span>
                            <span className="text-xs font-bold text-slate-200">{step.val}</span>
                         </div>
                         <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${step.status === 'Verified' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                            {step.status}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数据重复性核查" subtitle="DEDUPLICATION" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {RAW_DATA_MOCK.map((item, i) => (
                      <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-sm group hover:border-cyan-500/50 transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                               <RefreshCw size={8} className="animate-spin-slow" /> Confidence: {item.confidence}%
                            </div>
                            <CheckCircle2 size={12} className="text-green-500" />
                         </div>
                         <div className="text-xs text-slate-400 mb-1 line-through opacity-50 truncate">{item.raw}</div>
                         <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{item.std}</div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出主数据字典 (MDM)
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Tag size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 物料主档</div>
                    <div className="text-xs font-bold text-white">SAP_MM_CORE_0922</div>
                 </div>
              </div>
              {/* Fix: Added missing ChevronRight component */}
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
    </div>
  );
};