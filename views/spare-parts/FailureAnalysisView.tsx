
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ForensicScene } from '../../components/spare_parts_failure/ForensicScene';
import { FailurePoint } from '../../components/spare_parts_failure/three-types';
import { 
  Microscope, 
  FileWarning, 
  Activity, 
  Search, 
  Zap, 
  AlertOctagon, 
  Dna, 
  FlaskConical, 
  Fingerprint, 
  TrendingUp,
  // Fix: Added missing TrendingDown import to resolve ReferenceError on line 299
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  History,
  Binary,
  Layers,
  Scan,
  RefreshCw,
  ClipboardCheck,
  Target,
  Maximize2,
  Cpu,
  FileText,
  Database
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

// --- 模拟鉴证数据 ---
const FAILURE_HISTORY = [
  { id: 'FL-202404-01', part: '主泵驱动轴 (45#钢)', date: '2024-04-12', mode: '疲劳断裂', status: 'Analysis', severity: 'Critical' },
  { id: 'FL-202404-05', part: '液压伺服阀芯', date: '2024-04-10', mode: '磨损空蚀', status: 'Completed', severity: 'High' },
  { id: 'FL-202403-28', part: '行星减速机齿轮', date: '2024-03-28', mode: '接触疲劳', status: 'Archived', severity: 'High' },
];

const FAILURE_POINTS: FailurePoint[] = [
  { id: 'P1', position: [0.5, 2, 0.5], type: 'crack', severity: 0.9, description: '主断面解理裂纹' },
  { id: 'P2', position: [-0.8, -3, 0.2], type: 'fatigue', severity: 0.6, description: '次生疲劳条纹区' },
  { id: 'P3', position: [0, 0, 1.2], type: 'corrosion', severity: 0.4, description: '局部氧化点蚀' },
];

const COMPOSITION_DATA = [
  { element: 'C (碳)', std: 0.45, act: 0.42, status: 'normal' },
  { element: 'Cr (铬)', std: 1.20, act: 1.15, status: 'normal' },
  { element: 'Ni (镍)', std: 0.80, act: 0.62, status: 'warning' },
  { element: 'Mo (钼)', std: 0.15, act: 0.14, status: 'normal' },
];

const FAILURE_MODE_DIST = [
  { name: '疲劳断裂', value: 45, color: '#ef4444' },
  { name: '腐蚀失效', value: 25, color: '#f59e0b' },
  { name: '异常磨损', value: 20, color: '#0ea5e9' },
  { name: '过载塑性变形', value: 10, color: '#8b5cf6' },
];

export const FailurespareAnalysisView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(FAILURE_HISTORY[0].id);
  const [activePointId, setActivePointId] = useState<string | null>('P1');
  const [isScanning, setIsScanning] = useState(false);

  const activeAnalysis = useMemo(() => FAILURE_HISTORY.find(h => h.id === selectedId) || FAILURE_HISTORY[0], [selectedId]);
  const activePoint = useMemo(() => FAILURE_POINTS.find(p => p.id === activePointId), [activePointId]);

  const handleStartAnalysis = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：鉴证中心态势栏 */}
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 bg-gradient-to-r from-rose-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-indigo-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] border border-rose-400/50 relative group">
              <Microscope size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-rose-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-rose-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Failure Forensic & Metallurgy Lab
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 备件失效分析 <span className="text-rose-500 italic">与根因鉴证服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月分析案例</div>
              <div className="text-2xl font-mono font-bold text-white">24 <span className="text-sm font-normal text-slate-600">CASES</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">根因识别准确率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">严重风险拦截</div>
              <div className="text-2xl font-mono font-bold text-rose-500">05</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左侧：失效任务流 (Analysis Queue) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><History size={14} className="text-rose-500" /> 鉴证待办流水</span>
              <span>Sorted by Time</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {FAILURE_HISTORY.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative overflow-hidden group
                    ${selectedId === item.id 
                      ? 'bg-rose-950/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-rose-500 mb-1 uppercase">{item.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{item.part}</h3>
                     </div>
                     <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                        ${item.severity === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-500'}
                     `}>{item.severity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 font-bold"><Zap size={10} className="text-rose-500" /> 模式: {item.mode}</div>
                    <span>{item.date}</span>
                  </div>

                  <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-800/50">
                     <span className={`text-[9px] font-bold uppercase tracking-widest
                        ${item.status === 'Analysis' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}
                     `}>
                        {item.status === 'Analysis' ? '分析中 (Analytic)' : '归档 (Closed)'}
                     </span>
                     <ChevronRight size={14} className="text-slate-700 group-hover:text-rose-500 transition-colors" />
                  </div>
                  
                  {selectedId === item.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-rose-500 shadow-[0_0_10px_#f43f5e]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="失效模式分布" subtitle="MODE_CONCENTRATION" className="h-44 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={FAILURE_MODE_DIST} 
                          cx="50%" cy="50%" 
                          innerRadius={40} 
                          outerRadius={55} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {FAILURE_MODE_DIST.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息失效鉴证场 (Forensic Lab) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-rose-900/20 rounded-sm overflow-hidden group">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f43f5e 1px, transparent 1px), linear-gradient(90deg, #f43f5e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-rose-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Scan size={14} className="animate-pulse" />
                          Component DNA Extraction Active
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          失效件 <span className="text-rose-500 italic">三维鉴证剖析</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-rose-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">根因置信度 (Confidence)</div>
                       <div className="text-3xl font-mono font-bold text-rose-400 leading-none mt-1">94.8<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Fingerprint size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">资产数字化标识</div>
                             <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">DNA_7724_FAIL</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartAnalysis}
                         disabled={isScanning}
                         className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20 flex items-center gap-2"
                       >
                          {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Scan size={14}/>}
                          {isScanning ? '正在执行材料透析...' : '启动全维度鉴证扫描'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ForensicScene 
                    points={FAILURE_POINTS} 
                    activePointId={activePointId}
                    onPointClick={setActivePointId}
                    isScanning={isScanning}
                    partType="shaft"
                 />
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-rose-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-rose-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-rose-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-rose-500/40"></div>
           </div>

           {/* 底部：金相微观鉴证 (Micro-Forensics) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-60">
              <SciFiCard title="断口金相微观形貌" subtitle="SEM_VISUALIZATION" noPadding>
                 <div className="h-full w-full relative group cursor-zoom-in">
                    <img 
                      src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600" 
                      className="w-full h-full object-cover opacity-60 mix-blend-screen grayscale" 
                      alt="microscope" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                       <div className="flex items-center gap-2 text-[10px] text-rose-400 font-bold mb-1 uppercase tracking-widest">
                          <Target size={12} className="animate-pulse" /> 解理断裂特征点 (Cleavage Facets)
                       </div>
                       <div className="text-xs text-slate-300">Magnification: 500x | Resolution: 2nm</div>
                    </div>
                    {/* 扫描十字准星 */}
                    <div className="absolute top-1/2 left-1/3 w-8 h-8 border border-rose-500 rounded-full flex items-center justify-center animate-ping opacity-30"></div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="材料化学组分偏差" subtitle="SPECTRO_ANALYSIS" noPadding>
                 <div className="h-full w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COMPOSITION_DATA}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="element" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 1.5]} tick={false} axisLine={false} />
                          <Radar name="标准要求" dataKey="std" stroke="#334155" strokeWidth={1} fill="#334155" fillOpacity={0.1} strokeDasharray="5 5" />
                          <Radar name="实测组分" dataKey="act" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.3} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：失效决策与知识库 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="根因推演矩阵" subtitle="ROOT_CAUSE_MATRIX">
              <div className="space-y-4">
                 <div className="flex flex-col gap-3">
                    {[
                      { label: '循环应力疲劳', prob: 95, icon: <TrendingDown size={14} className="text-rose-500" /> },
                      { label: '冶金质量缺陷', prob: 42, icon: <FlaskConical size={14} className="text-indigo-500" /> },
                      { label: '润滑膜破裂', prob: 18, icon: <Activity size={14} className="text-cyan-500" /> },
                    ].map((item, i) => (
                      <div key={i} className="group cursor-default">
                         <div className="flex justify-between items-center mb-1.5 px-1">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">{item.icon} {item.label}</span>
                            <span className="text-[10px] font-mono font-bold text-white">{item.prob}%</span>
                         </div>
                         <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-rose-600 to-indigo-500 transition-all duration-1000" style={{ width: `${item.prob}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 专家改进建议" subtitle="REASONING" className="flex-1 border-rose-900/30 bg-rose-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-rose-900/10 border-l-4 border-rose-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-rose-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">鉴证结论 (Verdict)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于 500x SEM 形貌观察及化学组分映射，判定该轴系失效主因为 <span className="text-white font-bold">高频交变应力诱发的解理断裂</span>。检测到 Ni 元素含量显著低于标准值，建议追溯原材料供应商批次，并加强该部位的 <span className="text-rose-400 font-bold">无损探伤 (NDT)</span> 频次。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldAlert size={12} className="text-rose-500" /> 治理闭环建议 (Mitigation)
                    </div>
                    {[
                      { label: '同批次备件强制抽检', status: 'high' },
                      { label: '优化热处理工艺曲线', status: 'med' },
                      { label: '更新供应商负面清单', status: 'done' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-rose-500/30 transition-all">
                         <span className="text-[11px] text-slate-300">{step.label}</span>
                         <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                            ${step.status === 'high' ? 'bg-red-900/40 text-red-400' : step.status === 'med' ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'}
                         `}>{step.status}</span>
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-rose-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 导出鉴证全案报告 (RCFA)
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联类似失效案例库</div>
                    <div className="text-xs font-bold text-white">FAIL_ARCHIVE_v2.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-rose-500 transition-colors" />
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
          background: rgba(244, 63, 94, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 63, 94, 0.6);
        }
        
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(200px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
