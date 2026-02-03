
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, 
  BrainCircuit, 
  Trophy, 
  GraduationCap, 
  Zap, 
  Activity, 
  Briefcase, 
  Medal, 
  TrendingUp, 
  Network, 
  UserCheck,
  Search,
  BookOpen,
  Award,
  ShieldCheck,
  Cpu,
  Flame,
  Wrench,
  Target,
  FileText,
  Star,
  ChevronRight,
  Fingerprint,
  Microscope,
  // Added missing imports to fix errors on lines 371 and 385
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

// --- 模拟人才大数据 ---

interface TechPerson {
  id: string;
  name: string;
  role: string;
  level: string;
  status: 'online' | 'busy' | 'training';
  powerScore: number;
  tags: string[];
  avatar: string;
}

const TALENT_POOL: TechPerson[] = [
  { id: 'TECH-001', name: '张大伟', role: '高级机械工程师', level: 'P8 / 资深', status: 'online', powerScore: 94, tags: ['混流机组', '轴承诊断', '应急指挥'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'TECH-002', name: '萨拉', role: '电气自动化专家', level: 'P7 / 专家', status: 'busy', powerScore: 89, tags: ['PLC编程', '高压变频', 'SCADA'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'TECH-003', name: '李晓明', role: '液压系统技师', level: 'P6 / 骨干', status: 'online', powerScore: 82, tags: ['伺服控制', '油质分析'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: 'TECH-004', name: '赵强', role: '初级维保工', level: 'P3 / 见习', status: 'training', powerScore: 65, tags: ['基础钳工', '安规培训'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'TECH-005', name: '王玲', role: '安全质量审计员', level: 'P7 / 专家', status: 'online', powerScore: 91, tags: ['LOTO执行', '事故根因'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
];

const SKILL_RADAR_MAP: Record<string, any[]> = {
  'TECH-001': [
    { subject: '机械维保', A: 98, fullMark: 100 },
    { subject: '电气控制', A: 75, fullMark: 100 },
    { subject: '数字化工具', A: 85, fullMark: 100 },
    { subject: '应急响应', A: 95, fullMark: 100 },
    { subject: '团队管理', A: 92, fullMark: 100 },
    { subject: '安全规程', A: 100, fullMark: 100 },
  ],
  'TECH-002': [
    { subject: '机械维保', A: 60, fullMark: 100 },
    { subject: '电气控制', A: 100, fullMark: 100 },
    { subject: '数字化工具', A: 95, fullMark: 100 },
    { subject: '应急响应', A: 80, fullMark: 100 },
    { subject: '团队管理', A: 75, fullMark: 100 },
    { subject: '安全规程', A: 90, fullMark: 100 },
  ]
};

const MICRO_SKILLS: Record<string, any[]> = {
  'TECH-001': [
    { name: '精密测量 (μm)', val: 95, color: '#06b6d4' },
    { name: '振动频谱分析', val: 92, color: '#06b6d4' },
    { name: '热成像诊断', val: 88, color: '#06b6d4' },
    { name: 'PLC 逻辑追踪', val: 74, color: '#8b5cf6' },
    { name: '液压回路排障', val: 82, color: '#8b5cf6' },
  ],
  'TECH-002': [
    { name: '变频器参数调优', val: 100, color: '#8b5cf6' },
    { name: '控制逻辑编写', val: 98, color: '#8b5cf6' },
    { name: '现场通信组网', val: 92, color: '#8b5cf6' },
    { name: '机械拆装基础', val: 55, color: '#06b6d4' },
  ]
};

// Added missing TRAINING_PLAN constant to fix errors on lines 346 and 348
const TRAINING_PLAN = [
  { course: '高压变频器专项研修', due: '2024-05-15', progress: 45 },
  { course: '工业网络安全(L3)', due: '2024-06-01', progress: 100 },
  { course: 'AR 数字化维保实操', due: '2024-04-20', progress: 85 },
  { course: '精益 5S 现场督导', due: '2024-05-10', progress: 20 },
];

export const SkillMatrixView: React.FC = () => {
  const [activeId, setActiveId] = useState('TECH-001');
  const [searchTerm, setSearchTerm] = useState('');

  const activeTech = useMemo(() => TALENT_POOL.find(t => t.id === activeId) || TALENT_POOL[0], [activeId]);
  const radarData = useMemo(() => SKILL_RADAR_MAP[activeId] || SKILL_RADAR_MAP['TECH-001'], [activeId]);
  const skillBars = useMemo(() => MICRO_SKILLS[activeId] || MICRO_SKILLS['TECH-001'], [activeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#02040a]">
      
      {/* 顶部：战略人才看板 */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 bg-gradient-to-r from-purple-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-purple-400/50 relative">
              <BrainCircuit size={36} className="text-white" />
              <div className="absolute -inset-2 border border-purple-500/20 rounded animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Personnel Strategic Asset Matrix
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 人才效能 <span className="text-purple-500 italic">全息数字化矩阵</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">团队平均战力</div>
              <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                 <Zap size={18} className="text-amber-500" /> 88.4
              </div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键技能覆盖</div>
              <div className="text-2xl font-mono font-bold text-green-400">100%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">认证时效性</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">96.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：菁英人才库 (档案列表) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Users size={14} className="text-purple-500" /> 菁英人才池</span>
              <span>Count: 5</span>
           </div>
           
           <div className="flex flex-col gap-2 mb-2 px-1">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                 <input 
                    type="text" 
                    placeholder="检索姓名/技能关键词..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-purple-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {TALENT_POOL.map(tech => (
                <div 
                  key={tech.id}
                  onClick={() => setActiveId(tech.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${activeId === tech.id 
                      ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex gap-4 items-center mb-3">
                     <div className="relative">
                        <img src={tech.avatar} alt={tech.name} className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#02040a]
                           ${tech.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_lime]' : tech.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}
                        `}></div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                           <h3 className="font-bold text-slate-100 text-base">{tech.name}</h3>
                           <span className="text-xl font-mono font-bold text-purple-400">{tech.powerScore}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{tech.role}</div>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                     {tech.tags.slice(0, 2).map(tag => (
                       <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 group-hover:text-purple-300 transition-colors">{tag}</span>
                     ))}
                     {tech.tags.length > 2 && <span className="text-[9px] text-slate-600">+{tech.tags.length-2}</span>}
                  </div>

                  {activeId === tech.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* 中间：全息数字化指纹 (核心展示区) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-purple-900/20 rounded overflow-hidden group">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4c1d95 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1">
                          <Fingerprint size={14} className="animate-pulse" />
                          BIOMETRIC SKILL FINGERPRINT
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activeTech.name} <span className="text-xl text-slate-600 ml-2 font-light">[{activeTech.level}]</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-purple-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Comprehensive Power</div>
                       <div className="text-4xl font-mono font-bold text-purple-400 leading-none mt-1">{activeTech.powerScore}<span className="text-sm font-normal text-slate-600">/100</span></div>
                    </div>
                 </div>

                 {/* 中部可视化：雷达图 + 微观技能条 */}
                 <div className="flex-1 flex flex-col md:flex-row items-center gap-8 py-4 pointer-events-auto">
                    {/* 雷达图 */}
                    <div className="flex-1 h-full min-h-[300px] relative">
                       <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <Network size={200} className="text-purple-900" />
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
                             <PolarGrid stroke="#1e1b4b" strokeDasharray="3 3" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar 
                                name="能力值" 
                                dataKey="A" 
                                stroke="#a855f7" 
                                strokeWidth={3} 
                                fill="#a855f7" 
                                fillOpacity={0.2} 
                             />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #7e22ce', borderRadius: '4px', fontSize: '12px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                             />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>

                    {/* 细节垂直进度条 */}
                    <div className="w-full md:w-64 space-y-6">
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">核心子项分值</div>
                       {skillBars.map((skill, i) => (
                         <div key={i} className="group">
                            <div className="flex justify-between items-center mb-1.5">
                               <span className="text-xs font-bold text-slate-300 group-hover:text-purple-400 transition-colors">{skill.name}</span>
                               <span className="text-[10px] font-mono font-bold text-white">{skill.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                               <div 
                                  className="h-full rounded-full transition-all duration-1000 ease-out"
                                  style={{ 
                                     width: `${skill.val}%`, 
                                     backgroundColor: skill.color,
                                     boxShadow: `0 0 10px ${skill.color}80`
                                  }}
                               ></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* 底部功能栏 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Activity size={20} className="text-green-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">健康评价 (Human Health)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Optimal / 优</div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Target size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">适配任务 (Ideal Task)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">精密检修 C-04</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20">下发工单</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">导出画像</button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/40"></div>
           </div>
        </div>

        {/* 右侧：勋章与成长路径 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="资质勋章墙" subtitle="AWARDS_CABINET" className="border-slate-800">
              <div className="grid grid-cols-4 gap-3 py-2">
                 {[
                   { name: '机械能手', icon: <Wrench />, color: 'text-amber-500', bg: 'bg-amber-950/20', level: 'Lv.4' },
                   { name: '电工大师', icon: <Zap />, color: 'text-cyan-400', bg: 'bg-cyan-950/20', level: 'Lv.5' },
                   { name: '安全模范', icon: <ShieldCheck />, color: 'text-emerald-400', bg: 'bg-emerald-950/20', level: 'Elite' },
                   { name: '创新先锋', icon: <Cpu />, color: 'text-purple-400', bg: 'bg-purple-950/20', level: 'Adv' },
                   { name: '消防卫士', icon: <Flame />, color: 'text-red-500', bg: 'bg-red-950/20', level: 'Certified' },
                   { name: '质量标兵', icon: <Award />, color: 'text-blue-400', bg: 'bg-blue-950/20', level: 'L2' },
                 ].map((award, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 group cursor-help">
                       <div className={`w-12 h-12 rounded-full ${award.bg} border border-slate-800 flex items-center justify-center ${award.color} transition-all group-hover:scale-110 group-hover:border-purple-500/50 shadow-[0_0_10px_rgba(0,0,0,0.3)]`}>
                          {award.icon}
                       </div>
                       <div className="text-[8px] text-slate-600 font-bold uppercase text-center truncate w-full">{award.name}</div>
                    </div>
                 ))}
                 <div className="flex flex-col items-center gap-1 opacity-20">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 border-dashed flex items-center justify-center text-slate-700">
                       <Star size={16} />
                    </div>
                    <div className="text-[8px] text-slate-800 font-bold uppercase text-center">LOCKED</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="进阶成长路径" subtitle="PATHWAY" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {TRAINING_PLAN.map((plan, i) => (
                      <div key={i} className="relative pl-6">
                         {i !== TRAINING_PLAN.length - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-slate-800"></div>
                         )}
                         <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#02040a] z-10
                            ${plan.progress === 100 ? 'border-green-500 text-green-500' : 'border-purple-500 text-purple-500'}
                         `}>
                            <div className={`w-1.5 h-1.5 rounded-full ${plan.progress === 100 ? 'bg-green-500' : 'bg-purple-500 animate-pulse'}`}></div>
                         </div>
                         <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-sm group hover:border-purple-500/40 transition-all">
                            <div className="flex justify-between items-center mb-1.5">
                               <span className="text-xs font-bold text-slate-200">{plan.course}</span>
                               <span className="text-[9px] font-mono text-slate-600">{plan.due}</span>
                            </div>
                            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000" style={{ width: `${plan.progress}%` }}></div>
                            </div>
                            <div className="text-right text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Status: {plan.progress}% Data Loaded</div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-2 p-3 bg-amber-900/10 border border-amber-900/30 rounded flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-[10px] text-amber-300 font-bold uppercase mb-1">技能盲区警报 (Gap Alert)</div>
                       <p className="text-[9px] text-slate-400 leading-normal">
                          团队在“特高压变流器故障诊断”领域存在技能缺口。建议选派 <span className="text-white font-bold">{activeTech.name}</span> 参加下季度高阶进修。
                       </p>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 <span>档案完整度系统审计</span>
                 <CheckCircle2 size={12} className="text-green-500" />
              </div>
              <div className="flex items-center gap-3">
                 <Microscope size={20} className="text-purple-500" />
                 <div className="text-[10px] text-slate-400 leading-relaxed italic">
                    “生物识别、证书验证及作业绩效三方数据已同步核验，当前画像信度系数：0.992。”
                 </div>
              </div>
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
      `}</style>
    </div>
  );
};
