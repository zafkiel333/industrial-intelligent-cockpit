
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LocalizationForgeScene } from '../../components/mine_localization/LocalizationForgeScene';
import { 
  Zap, 
  RotateCw, 
  ShieldCheck, 
  Microscope, 
  Scale, 
  History, 
  Database, 
  Globe, 
  TrendingDown, 
  Cpu, 
  ChevronRight,
  Target,
  FlaskConical,
  Binary,
  ArrowRightLeft,
  Settings,
  Factory,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Award,
  Search,
  Maximize2,
  // Fix: Added missing Activity icon to imports from lucide-react
  Activity
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend, BarChart, Bar, Cell
} from 'recharts';

const MATERIAL_GENE_COMPARISON = [
  { element: 'C (碳)', original: 0.45, local: 0.45, diff: '0.0%' },
  { element: 'Cr (铬)', original: 12.5, local: 13.2, diff: '+5.6%' },
  { element: 'Ni (镍)', original: 4.2, local: 4.3, diff: '+2.3%' },
  { element: 'Mo (钼)', original: 0.8, local: 1.1, diff: '+37.5%' },
];

const PERFORMANCE_RADAR = [
  { subject: '抗拉强度', A: 92, B: 98, fullMark: 100 },
  { subject: '疲劳极限', A: 85, B: 94, fullMark: 100 },
  { subject: '耐腐蚀性', A: 78, B: 95, fullMark: 100 },
  { subject: '加工精度', A: 100, B: 99, fullMark: 100 },
  { subject: '热稳定性', A: 88, B: 90, fullMark: 100 },
];

const RECON_TIMELINE = [
  { stage: '逆向测绘', time: 'D1-D3', status: 'done', desc: '激光点云采集与拓扑重建' },
  { stage: '材料特征分析', time: 'D4-D5', status: 'done', desc: '金相组织与光谱成分鉴定' },
  { stage: '重构仿真优化', time: 'D6-D10', status: 'active', desc: '有限元分析与国产材质适配' },
  { stage: '精密试制', time: 'D11-D20', status: 'pending', desc: '五轴联动加工与表面强化' },
  { stage: '实机挂机', time: 'D21+', status: 'pending', desc: '工况跟踪与数据闭环' },
];

export const MineLocalizationView: React.FC = () => {
  const [reconProgress, setReconProgress] = useState(0.42);
  const [selectedAsset, setSelectedAsset] = useState('MAIN_SHAFT_X7');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#020408] overflow-hidden p-2">
      
      {/* 顶部：战略主权与价值看板 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 relative group">
              <RotateCw size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Mining Asset Sovereign Replacement Protocol
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿山设备 <span className="text-cyan-500 italic">国产化替代与重构</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">供应链安全指数</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">99.8%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均降本率 (LCC)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">-42.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">重构模型置信度</div>
              <div className="text-2xl font-mono font-bold text-amber-400">98.4</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：基因解码与材料分析 (The Analytical Wing) */}
        <div className="xl:col-span-3 flex flex-col gap-5 overflow-hidden">
           <SciFiCard title="材料基因对标" subtitle="METALLURGY_GENOME" highlight className="border-cyan-900/30">
              <div className="space-y-4 py-2 h-full overflow-y-auto custom-scrollbar">
                 {MATERIAL_GENE_COMPARISON.map((item, i) => (
                    <div key={i} className="group cursor-default">
                       <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">{item.element}</span>
                          <span className="text-[10px] font-mono text-emerald-400">优化差值: {item.diff}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex-1 space-y-1">
                             <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-600" style={{ width: `${item.original * 4}%` }}></div>
                             </div>
                             <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" style={{ width: `${item.local * 4}%` }}></div>
                             </div>
                          </div>
                          <div className="text-[10px] font-mono text-slate-200">
                             <div>{item.original}%</div>
                             <div className="text-cyan-400 font-bold">{item.local}%</div>
                          </div>
                       </div>
                    </div>
                 ))}
                 <div className="p-3 bg-cyan-900/20 border border-cyan-800/30 rounded mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 mb-2">
                       <Microscope size={12}/> 晶格分析结论
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                       “通过增加 Mo (钼) 含量并优化热处理温度曲线，国产件在保持原有硬度的同时，抗冲击韧性提升了 12.4%。”
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="性能冗余评估" subtitle="REDUNDANCY_RADAR" className="flex-1">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    {/* Fix: PERFORMANCE_DELTA was a typo for PERFORMANCE_RADAR as defined on line 54 */}
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERFORMANCE_RADAR}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="进口原装" dataKey="A" stroke="#475569" strokeWidth={1} fill="#475569" fillOpacity={0.1} strokeDasharray="5 5" />
                       <Radar name="国产替代" dataKey="B" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 重构实验室 (The Forge) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020306] border border-cyan-900/20 rounded-2xl overflow-hidden group">
              {/* HUD 界面 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Holographic Reverse Engineering
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          数字化 <span className="text-cyan-500 italic">基因重构舱</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">重构完成度 (Recon)</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">{(reconProgress * 100).toFixed(0)}%</div>
                       </div>
                       <div className="flex gap-2">
                          <button className="px-4 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full text-[10px] font-bold uppercase transition-all">切换截面 (X-Ray)</button>
                          <button className="px-4 py-1.5 bg-cyan-600/20 border border-cyan-500 text-cyan-400 rounded-full text-[10px] font-bold uppercase hover:bg-cyan-600 hover:text-white transition-all">拓扑优化</button>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm group hover:border-cyan-500/50 transition-all">
                          <div className="p-2 bg-cyan-900/30 rounded text-cyan-400"><Binary size={18} /></div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">适配协议 (Protocol)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">LOCAL_GEN_V3.1</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Geometric Accuracy</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">±0.002<span className="text-xs text-slate-600 ml-1">mm</span></div>
                       </div>
                       <button className="w-10 h-10 rounded bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-colors">
                          <Maximize2 size={18} />
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <LocalizationForgeScene 
                    activeNode={{
                       id: 'MAIN_SHAFT_X7',
                       name: '主驱动轴',
                       type: 'shaft' as any,
                       importedHealth: 0.2,
                       domesticHealth: 1.0,
                       isSynthesizing: true,
                       position: [0, 0, 0]
                    }}
                    reconstructionProgress={reconProgress}
                    showXRay={false}
                    onPartClick={() => {}}
                 />
              </div>

              {/* 装饰网格背景 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none tech-grid-bg"></div>
           </div>

           {/* 底部：重构里程碑时序 (Timeline) */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10% 100%' }}></div>
              
              {RECON_TIMELINE.map((step, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 z-10 relative flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700
                       ${step.status === 'done' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 
                         step.status === 'active' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-600'}
                    `}>
                       <CheckCircle2 size={14} />
                    </div>
                    <div className="text-center">
                       <div className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>{step.stage}</div>
                       <div className="text-[9px] font-mono text-slate-500 mt-0.5">{step.time}</div>
                    </div>
                    {i < RECON_TIMELINE.length - 1 && (
                      <div className="absolute top-4 left-[60%] w-full h-[1px] bg-slate-800 -z-10"></div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* 右翼：战略影响与供应链 (Strategy & Impact) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="经济效益推演" subtitle="TCO_OPTIMIZATION">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                       { name: '进口原装', val: 100, color: '#475569' },
                       { name: '国产重构', val: 58, color: '#06b6d4' },
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={35}>
                          { [0, 1].map((entry, index) => (
                             <Cell key={index} fill={index === 0 ? '#475569' : '#0ea5e9'} />
                          ))}
                       </Bar>
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0c0a09', border: 'none'}} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 p-3 bg-cyan-950/20 border border-cyan-800/30 rounded flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold uppercase">预期年度节约</span>
                 <span className="text-xl font-bold text-cyan-400 font-mono">¥ 2,450k</span>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 供应链决策" subtitle="SLA_INTELLIGENCE" className="flex-1 border-cyan-900/30 bg-cyan-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">推荐替代决策</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “识别到 <span className="text-white font-bold">哈尔滨电机厂</span> 具备该型号曲轴的精密锻造能力。预计物流期从 65 天缩短至 <span className="text-cyan-400 font-bold">12 天</span>。风险评估：低。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-emerald-500" /> 替代件合规性验证 (Verified)
                    </div>
                    {[
                      { label: '3D 拓扑一致性核验', status: 'pass' },
                      { label: '极限载荷疲劳仿真', status: 'pass' },
                      { label: '特种材料自主权审计', status: 'pass' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <CheckCircle2 size={12} className="text-green-500" />
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <ClipboardCheck size={16} /> 下达国产化试制指令
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联逆向工程库</div>
                    <div className="text-xs font-bold text-white">REV_ENG_INDEX_V4.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.6);
        }
        @keyframes scan {
          0% { transform: translateY(-300px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}} />
    </div>
  );
};
