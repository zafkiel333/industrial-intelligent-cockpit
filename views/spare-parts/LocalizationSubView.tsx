
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LocalizationThreeScene } from '../../components/spare_parts_localization/ThreeScene';
import { LocalizationPart } from '../../components/spare_parts_localization/three-types';
import { 
  Dna, 
  Search, 
  RotateCw, 
  Microscope, 
  ShieldCheck, 
  Globe, 
  ChevronRight, 
  Zap, 
  Activity, 
  Box, 
  Factory, 
  Binary, 
  FileText,
  MapPin,
  TrendingUp,
  Cpu,
  ArrowRightLeft,
  Settings,
  AlertTriangle,
  ClipboardCheck,
  Award,
  History,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';

// --- 模拟业务数据 ---
const ASSET_ARCHIVE = [
  { id: 'LEG-9022', name: 'Alstom 混流转轮 (1995)', type: 'runner', origin: 'France', status: 'Scanning', age: '29 yr' },
  { id: 'LEG-8842', name: 'Voith 推力轴承支架', type: 'bearing', origin: 'Germany', status: 'Ready', age: '32 yr' },
  { id: 'LEG-1102', name: 'ABB 励磁调节组件', type: 'governor', origin: 'Switzerland', status: 'Pending', age: '25 yr' },
];

const MATERIAL_ANALYSIS = [
  { element: 'C', original: 0.45, domestic: 0.45 },
  { element: 'Cr', original: 12.5, domestic: 13.2 }, // 增强抗腐蚀
  { element: 'Ni', original: 4.2, domestic: 4.5 },
  { element: 'Mo', original: 0.8, domestic: 1.0 },
];

const PERFORMANCE_DELTA = [
  { subject: '抗气蚀性', A: 85, B: 95, fullMark: 100 },
  { subject: '疲劳寿命', A: 80, B: 92, fullMark: 100 },
  { subject: '传导效率', A: 94, B: 96, fullMark: 100 },
  { subject: '维护便捷性', A: 60, B: 98, fullMark: 100 },
  { subject: '交付周期', A: 30, B: 100, fullMark: 100 },
];

export const LocalizationSubView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(ASSET_ARCHIVE[0].id);
  const [scanProgress, setScanProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activePart = ASSET_ARCHIVE.find(a => a.id === selectedId) || ASSET_ARCHIVE[0];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 1;
        }
        return prev + 0.05;
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：国产化替代指挥中心抬头 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-white/20 relative group">
              <Dna size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Legacy Hydropower Localization Protocol
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 老旧机组备件 <span className="text-cyan-500 italic">国产化替代决策终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已实现替代率</div>
              <div className="text-2xl font-mono font-bold text-green-400">88.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">在役国产化件</div>
              <div className="text-2xl font-mono font-bold text-white">142 <span className="text-xs text-slate-600 font-normal">UNIT</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">年度降本规模</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">¥ 12.4 <span className="text-sm font-normal text-slate-600">M</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：老旧资产考古 (Legacy Archive) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><History size={14} className="text-cyan-500" /> 进口备件考古库</span>
              <button className="hover:text-cyan-400 transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {ASSET_ARCHIVE.map(item => (
                <div 
                  key={item.id}
                  onClick={() => { setSelectedId(item.id); setScanProgress(0); }}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === item.id 
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-cyan-500 font-bold">{item.id}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase border border-slate-700">
                       {item.origin} Origin
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-2 truncate">{item.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 font-bold">役龄: {item.age}</div>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${item.status === 'Scanning' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`}>
                       {item.status}
                    </span>
                  </div>
                  {selectedId === item.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="材料特征图谱" subtitle="METALLURGY" className="h-56 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MATERIAL_ANALYSIS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="element" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="original" name="原装成分" fill="#334155" radius={[2, 2, 0, 0]} />
                       <Bar dataKey="domestic" name="国产改良" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                       <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：逆向重构实验室 (Reverse Lab) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Microscope size={14} className="animate-pulse" />
                          Reverse Engineering Synthesis: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          数字化 <span className="text-cyan-500 italic">国产重构场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">逆向建模进度 (Re-Sync)</div>
                       <div className="text-4xl font-mono font-bold text-cyan-400 leading-none mt-1">{(scanProgress * 100).toFixed(0)}<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Binary size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">国产化适配模型</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">V3.14-PRO-CN</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartAnalysis}
                         disabled={isAnalyzing}
                         className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                       >
                          {isAnalyzing ? <RotateCw className="animate-spin" size={14}/> : <Zap size={14}/>}
                          {isAnalyzing ? '正在萃取物理基因...' : '启动逆向基因比对'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <LocalizationThreeScene 
                    activePart={activePart as any} 
                    scanProgress={scanProgress}
                    viewMode="ghost"
                 />
              </div>

              {/* 背景装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：性能对标与改良 (Benchmark) */}
           <SciFiCard title="国产替代件性能增益评估" subtitle="BENCHMARK_ANALYSIS" className="h-60 border-indigo-900/30">
              <div className="h-full w-full flex gap-6">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={PERFORMANCE_DELTA}>
                          <PolarGrid stroke="#1e1b4b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="进口原装 (Legacy)" dataKey="A" stroke="#64748b" strokeWidth={1} fill="#64748b" fillOpacity={0.1} strokeDasharray="5 5" />
                          <Radar name="国产替代 (Modernized)" dataKey="B" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #0ea5e9', borderRadius: '4px', fontSize: '12px' }} />
                          <Legend verticalAlign="top" align="right" layout="vertical" iconType="circle" />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-64 border-l border-slate-800 pl-6 flex flex-col justify-center gap-4">
                    <div className="p-3 bg-emerald-950/20 border-l-2 border-emerald-500 rounded-r">
                       <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">改良结论 (Optimization)</div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “通过应用国产 <span className="text-white font-bold">高硬度沉淀硬化不锈钢</span>，在保持原有尺寸精度的前提下，抗气蚀性能提升 <span className="text-emerald-400 font-bold">12.5%</span>。”
                       </p>
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] text-slate-500 uppercase font-bold">国产化综合评分</span>
                       <span className="text-2xl font-mono font-bold text-cyan-400">96.8</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：供应链地图与制造追踪 (Supply Chain) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="国产供应链匹配" subtitle="SUPPLY_NETWORK" className="h-[380px] overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 bg-slate-950 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=map')] opacity-5 grayscale group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <Globe size={180} className="text-cyan-900/30" />
                    </div>
                    
                    {/* 模拟坐标点 */}
                    {[
                      { name: '哈电集团', x: '70%', y: '30%', status: 'Primary' },
                      { name: '东方电机', x: '45%', y: '65%', status: 'Backup' },
                      { name: '浙富股份', x: '80%', y: '70%', status: 'Alternative' },
                    ].map((loc, i) => (
                       <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 group/pin" style={{ left: loc.x, top: loc.y }}>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] animate-pulse"></div>
                          <div className="absolute top-4 left-0 bg-black/80 border border-cyan-500/40 p-1.5 rounded opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-20">
                             <div className="text-[9px] font-bold text-white">{loc.name}</div>
                             <div className="text-[7px] text-cyan-500 uppercase">{loc.status} Source</div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">最优供应路径</div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                       <div className="flex items-center gap-3">
                          <Factory size={16} className="text-cyan-400" />
                          <div>
                             <div className="text-xs font-bold text-white">哈尔滨电机厂</div>
                             <div className="text-[9px] text-slate-500">资质等级: S级 (国家重点)</div>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-700" />
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="制造流程数字化追踪" subtitle="MANUFACTURING" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { label: '3D 结构优化设计', status: 'done', date: '03-15' },
                      { label: '原材料定制化熔炼', status: 'done', date: '03-22' },
                      { label: 'CNC 五轴精密联动加工', status: 'active', date: '进行中' },
                      { label: '动平衡与表面强化', status: 'pending', date: '预计04-10' },
                    ].map((task, i) => (
                      <div key={i} className="relative pl-6">
                         {i !== 3 && <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-slate-800"></div>}
                         <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#02040a] z-10
                            ${task.status === 'done' ? 'border-green-500 text-green-500' : task.status === 'active' ? 'border-cyan-500 text-cyan-500 animate-pulse' : 'border-slate-800 text-slate-800'}
                         `}>
                            {task.status === 'done' && <CheckCircle2 size={10} />}
                         </div>
                         <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${task.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>{task.label}</span>
                            <span className="text-[8px] font-mono text-slate-600">{task.date}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-cyan-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <Award size={16} /> 签署国产化合格证书 (E-Cert)
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出替代性分析白皮书</div>
                    <div className="text-xs font-bold text-white">SUB_CASE_9221_V4.pdf</div>
                 </div>
              </div>
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
          background: rgba(6, 182, 212, 0.6);
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
