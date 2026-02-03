
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BrainCircuit, 
  Target, 
  Zap, 
  TrendingUp, 
  GraduationCap, 
  Dna, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Activity, 
  History,
  FileText,
  Microscope,
  Network,
  Binary,
  Flame,
  MousePointer2,
  // Added Clock import to fix error on line 311
  Clock
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟数据 ---

const SKILL_GAPS = [
  { subject: '特高压变流', current: 65, required: 95, fullMark: 100 },
  { subject: 'AR远程协作', current: 40, required: 85, fullMark: 100 },
  { subject: '工业网络安全', current: 55, required: 90, fullMark: 100 },
  { subject: '液压伺服调优', current: 78, required: 92, fullMark: 100 },
  { subject: '振动频谱诊断', current: 70, required: 95, fullMark: 100 },
  { subject: '精益5S管理', current: 88, required: 85, fullMark: 100 },
];

const PERSONNEL_SKILLS = [
  { id: 'T-001', name: '王振华', role: '机械组长', level: 'P8', score: 94, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
  { id: 'T-005', name: '李瑞平', role: '电气专家', level: 'P7', score: 89, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
  { id: 'T-012', name: '赵大勇', role: '自动化工程师', level: 'P6', score: 72, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
];

const FAULT_CORRELATION = [
  { name: '轴承过热', frequency: 12, complexity: 85, reqSkill: '精密对中' },
  { name: '控制逻辑丢失', frequency: 8, complexity: 92, reqSkill: 'PLC冗余架构' },
  { name: '密封件异常磨损', frequency: 15, complexity: 65, reqSkill: '密封材料学' },
  { name: '母线绝缘偏低', frequency: 5, complexity: 78, reqSkill: '高压预防性试验' },
];

const RECOMMENDED_COURSES = [
  { id: 'C-01', title: '高压变频器深度维修实务', duration: '24h', priority: 'High', tags: ['电气', '核心'] },
  { id: 'C-04', title: 'AR数字化维保终端操作', duration: '8h', priority: 'Med', tags: ['数字化'] },
  { id: 'C-09', title: '基于AI的振动故障特征提取', duration: '16h', priority: 'High', tags: ['诊断', '前沿'] },
];

export const TrainingAnalysisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('gap');
  const [selectedPerson, setSelectedPerson] = useState('T-001');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战略培训指挥面板 */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 relative group">
              <BrainCircuit size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-emerald-500/20 rounded animate-[spin_12s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Personnel Knowledge Architecture Matrix
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修培训 <span className="text-emerald-500 italic">需求分析中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="grid grid-cols-3 gap-6 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均技能缺口</div>
                 <div className="text-2xl font-mono font-bold text-red-400">-24.5%</div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700"></div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键岗位备考</div>
                 <div className="text-2xl font-mono font-bold text-emerald-400">12 <span className="text-xs text-slate-600 font-normal">UNIT</span></div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700"></div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">知识滴灌效率</div>
                 <div className="text-2xl font-mono font-bold text-cyan-400">92%</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：人才基因图谱 (人员DNA) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Dna size={14} className="text-emerald-500" /> 人才效能阵列</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {PERSONNEL_SKILLS.map(person => (
                <div 
                  key={person.id}
                  onClick={() => setSelectedPerson(person.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${selectedPerson === person.id 
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex gap-4 items-center mb-3">
                     <div className="relative">
                        <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#02040a] bg-emerald-500 shadow-[0_0_5px_lime]"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                           <h3 className="font-bold text-slate-100 text-sm truncate">{person.name}</h3>
                           <span className="text-[10px] text-emerald-400 font-mono">#{person.level}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{person.role}</div>
                     </div>
                  </div>
                  
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] uppercase text-slate-500 font-bold">
                        <span>能力值 (Power Score)</span>
                        <span className="text-slate-300">{person.score}%</span>
                     </div>
                     <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${person.score}%` }}></div>
                     </div>
                  </div>

                  {selectedPerson === person.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                  )}
                </div>
              ))}
              
              <button className="w-full py-3 border border-dashed border-slate-800 text-slate-600 rounded text-xs hover:text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                 <Binary size={14} /> 调取更多人才档案
              </button>
           </div>
        </div>

        {/* 中枢：技能鸿沟多维推演场 (核心区) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-emerald-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#065f46 1px, transparent 1px), linear-gradient(90deg, #065f46 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* 核心推演 HUD */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Network size={14} className="animate-pulse" />
                          Skill Gap Projection Engine
                       </div>
                       <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
                          技能鸿沟 <span className="text-emerald-500 italic">深度对比视图</span>
                       </h2>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setActiveTab('gap')} className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all ${activeTab === 'gap' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>鸿沟分析</button>
                       <button onClick={() => setActiveTab('fault')} className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all ${activeTab === 'fault' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>故障关联</button>
                    </div>
                 </div>

                 {/* 数据展示区 */}
                 <div className="flex-1 w-full min-h-[350px]">
                    {activeTab === 'gap' ? (
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAPS}>
                             <PolarGrid stroke="#064e3b" strokeDasharray="3 3" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="当前能力" dataKey="current" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                             <Radar name="岗位要求" dataKey="required" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} strokeDasharray="5 5" />
                             <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #059669', borderRadius: '4px', fontSize: '12px' }} />
                             <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          </RadarChart>
                       </ResponsiveContainer>
                    ) : (
                       <div className="h-full flex flex-col gap-6">
                          <div className="grid grid-cols-2 gap-4">
                             {FAULT_CORRELATION.map((fault, i) => (
                               <div key={i} className="p-4 bg-slate-950/60 border border-slate-800 rounded group hover:border-emerald-500/40 transition-all flex justify-between items-center">
                                  <div>
                                     <div className="text-[10px] text-emerald-500 font-bold uppercase mb-1">故障场景: {fault.name}</div>
                                     <div className="text-lg font-bold text-white tracking-tight">{fault.reqSkill} <span className="text-xs text-slate-600 font-normal">需强化</span></div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-[10px] text-slate-500">相关频次</div>
                                     <div className="text-xl font-mono text-emerald-400">{fault.frequency}</div>
                                  </div>
                               </div>
                             ))}
                          </div>
                          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded p-4 relative overflow-hidden">
                             <div className="absolute top-2 left-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Zap size={10} /> AI 关联性聚类分析
                             </div>
                             <div className="h-full w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="80%">
                                   <BarChart data={FAULT_CORRELATION}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                      <YAxis hide />
                                      <Bar dataKey="complexity" radius={[4, 4, 0, 0]} barSize={30}>
                                         {FAULT_CORRELATION.map((entry, index) => (
                                            <Cell key={index} fill={entry.complexity > 85 ? '#ef4444' : '#10b981'} />
                                         ))}
                                      </Bar>
                                   </BarChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* 底部摘要操作条 */}
                 <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4">
                          <div className="p-2 bg-emerald-900/30 rounded-full"><Activity size={20} className="text-emerald-400" /></div>
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">学习就绪度 (Learning Readiness)</div>
                             <div className="text-sm font-bold text-white">96.8% HIGH</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-2">
                          <Microscope size={14}/> 发起技能测评
                       </button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-500/30"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-500/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-500/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-500/30"></div>
           </div>
        </div>

        {/* 右翼：AI 课程精准滴灌系统 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-1">
           
           <SciFiCard title="智能推演建议" subtitle="AI_ADVISORY">
              <div className="space-y-4">
                 <div className="p-3 bg-red-950/20 border border-red-900/30 rounded flex items-start gap-3 relative overflow-hidden group">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-red-200 uppercase">高危技能断层</div>
                       <div className="text-[10px] text-slate-400 leading-normal mt-1 italic">
                          “检测到当前班组在 <span className="text-white font-bold">5G专用网关调试</span> 技能点上全员缺失。建议立即选派 P7 级以上专家进行专项研修，以应对下月升级计划。”
                       </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500 opacity-50"></div>
                 </div>

                 <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded flex items-start gap-3 relative overflow-hidden">
                    <TrendingUp className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-cyan-200 uppercase">效能提升预测</div>
                       <div className="text-[10px] text-slate-400 leading-normal mt-1">
                          若完成“数字化诊断”培训，预计 <span className="text-white">MTTR</span> (平均修复时间) 将缩短约 <span className="text-emerald-400 font-bold">14.2%</span>。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="精准滴灌课程" subtitle="CURATED_TRACKS" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {RECOMMENDED_COURSES.map(course => (
                      <div key={course.id} className="bg-slate-900/60 border border-slate-800 p-3 rounded group hover:border-emerald-500/40 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-emerald-500 font-bold">{course.id}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${course.priority === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                               {course.priority} Priority
                            </span>
                         </div>
                         <div className="text-xs font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{course.title}</div>
                         <div className="flex justify-between items-center text-[10px]">
                            <div className="flex gap-1">
                               {course.tags.map(t => <span key={t} className="text-[8px] text-slate-600">#{t}</span>)}
                            </div>
                            <span className="text-slate-500 flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-widest">
                       <span>培训预算执行度</span>
                       <span className="text-white">62.5%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500" style={{ width: '62.5%' }}></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">生成年度培训大纲</div>
                    <div className="text-xs font-bold text-white">Project_Training_2024.pdf</div>
                 </div>
              </div>
              <button className="text-emerald-500 hover:text-white transition-colors">
                 <ChevronRight size={20} />
              </button>
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
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};
