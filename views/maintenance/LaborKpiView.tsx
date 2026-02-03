
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  Trophy, 
  Target, 
  Activity, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Timer, 
  UserCheck, 
  ShieldAlert, 
  Cpu, 
  Search,
  ChevronRight,
  Flame,
  Award,
  Binary,
  History,
  Dna,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid, Legend, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- 模拟数据 ---

const TEAM_STATS = [
  { name: '机械一组', hours: 420, efficiency: 92, status: 'active' },
  { name: '电气二组', hours: 380, efficiency: 95, status: 'active' },
  { name: '液压专项', hours: 240, efficiency: 88, status: 'warning' },
  { name: '自动化组', hours: 510, efficiency: 97, status: 'active' },
  { name: '安全审计', hours: 120, efficiency: 99, status: 'active' },
];

const INDIVIDUAL_RANKING = [
  { id: '01', name: '王利民', role: '高级技师', score: 98, hours: 168, trend: '+2.4%', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
  { id: '02', name: '李晓峰', role: '电气工程师', score: 95, hours: 155, trend: '+1.2%', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
  { id: '03', name: '张建国', role: '机械工', score: 92, hours: 172, trend: '-0.5%', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
  { id: '04', name: '赵婉莹', role: '自动化专家', score: 91, hours: 140, trend: '+5.1%', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D' },
];

const LABOR_TYPE_DIST = [
  { name: '直接维修', value: 65, color: '#8b5cf6' },
  { name: '故障诊断', value: 15, color: '#0ea5e9' },
  { name: '物料等待', value: 10, color: '#f59e0b' },
  { name: '行政记录', value: 10, color: '#64748b' },
];

const WEEKLY_TREND = [
  { day: 'Mon', productive: 45, overhead: 10 },
  { day: 'Tue', productive: 52, overhead: 8 },
  { day: 'Wed', productive: 48, overhead: 12 },
  { day: 'Thu', productive: 61, overhead: 15 },
  { day: 'Fri', productive: 55, overhead: 10 },
  { day: 'Sat', productive: 32, overhead: 5 },
  { day: 'Sun', productive: 28, overhead: 5 },
];

const RADAR_DATA = [
  { subject: '响应时效', A: 95, fullMark: 100 },
  { subject: '工序合规', A: 88, fullMark: 100 },
  { subject: '质量复检', A: 92, fullMark: 100 },
  { subject: '物料平衡', A: 85, fullMark: 100 },
  { subject: '安全规程', A: 100, fullMark: 100 },
];

export const LaborKpiView: React.FC = () => {
  const [activeTeam, setActiveTeam] = useState('自动化组');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：效能指控中心抬头 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-purple-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-purple-400/50 relative group">
              <Zap size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-purple-500/20 rounded animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Labor Efficiency Strategic Matrix
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修工时 <span className="text-purple-500 italic">绩效分析中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月总工时投入</div>
              <div className="text-2xl font-mono font-bold text-white">14,285 <span className="text-xs text-slate-600">HRS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">工时产出效能</div>
              <div className="text-2xl font-mono font-bold text-green-400">92.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">异常闲置预警</div>
              <div className="text-2xl font-mono font-bold text-amber-500">02 <span className="text-xs text-slate-600">TEAM</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：菁英绩效天梯 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Trophy size={14} className="text-amber-500" /> 菁英绩效天梯 (Top Performers)</span>
              <span>Monthly</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {INDIVIDUAL_RANKING.map((person, idx) => (
                <div key={person.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm group hover:border-purple-500/50 transition-all relative overflow-hidden">
                   <div className="absolute top-0 left-0 text-[40px] font-black text-white/5 italic -ml-2 -mt-2">{person.id}</div>
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                         <img src={person.avatar} className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-950" alt="avatar" />
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold border-2 border-[#02040a]">
                            #{idx + 1}
                         </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white text-base">{person.name}</h3>
                            <span className="text-lg font-mono font-bold text-purple-400">{person.score}</span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-slate-500 uppercase">{person.role}</span>
                            <span className="text-[9px] text-green-500 font-bold">{person.trend}</span>
                         </div>
                      </div>
                   </div>
                   <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
                      <div className="flex flex-col">
                         <span className="text-[9px] text-slate-600 uppercase">累计工时</span>
                         <span className="text-xs font-mono font-bold">{person.hours} h</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] text-slate-600 uppercase">任务闭环率</span>
                         <span className="text-xs font-mono font-bold">100%</span>
                      </div>
                   </div>
                   {/* 底部装饰进度条 */}
                   <div className="absolute bottom-0 left-0 h-0.5 bg-purple-500" style={{ width: `${person.score}%` }}></div>
                </div>
              ))}
           </div>

           <SciFiCard title="团队负载概览" subtitle="TEAM_LOAD">
              <div className="space-y-4">
                 {TEAM_STATS.map(team => (
                   <div key={team.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                         <span>{team.name}</span>
                         <span className={team.efficiency > 95 ? 'text-purple-400' : 'text-slate-300'}>{team.efficiency}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${team.status === 'warning' ? 'bg-red-500' : 'bg-indigo-500'}`}
                           style={{ width: `${team.efficiency}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：核心工序耗时时空场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-purple-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4c1d95 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1">
                          <Binary size={14} className="animate-pulse" />
                          TEMPORAL PERFORMANCE FIELD
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          工时效能 <span className="text-purple-500 italic">动态时空场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-purple-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">单位产出价值</div>
                       <div className="text-3xl font-mono font-bold text-purple-400 leading-none mt-1">¥ 1,420 <span className="text-sm font-normal text-slate-600">/H</span></div>
                    </div>
                 </div>

                 {/* 中部核心可视化：周期演化图 */}
                 <div className="flex-1 w-full pointer-events-auto flex items-center justify-center">
                    <div className="w-full h-full max-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={WEEKLY_TREND}>
                             <defs>
                                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                             <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis hide />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #4c1d95', borderRadius: '4px', fontSize: '12px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                             />
                             <Area type="monotone" dataKey="productive" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorProd)" name="生产工时" />
                             <Area type="monotone" dataKey="overhead" stroke="#f43f5e" strokeWidth={1} fill="transparent" strokeDasharray="5 5" name="管理损耗" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* 底部战略快报 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Timer size={20} className="text-purple-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">平均任务周期 (MTTR)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">4.2 HR <span className="text-green-500 text-[8px] ml-1">-12%</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Activity size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">工时负荷率</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">88.5% STABLE</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20">下发绩效指标</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">调阅班组记录</button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/40"></div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <SciFiCard title="工种工时分布" subtitle="DISTRIBUTION" noPadding>
                 <div className="h-40 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={LABOR_TYPE_DIST} 
                            cx="50%" cy="50%" 
                            innerRadius={45} outerRadius={60} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                             {LABOR_TYPE_DIST.map((entry, index) => (
                               <Cell key={index} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f051a', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="pr-8 space-y-1">
                       {LABOR_TYPE_DIST.map(item => (
                         <div key={item.name} className="flex items-center gap-2 text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-slate-400">{item.name}</span>
                            <span className="text-white font-bold ml-auto">{item.value}%</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="班组战斗力评估" subtitle="TEAM_KPI">
                 <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                          <PolarGrid stroke="#1e1b4b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar 
                            name="评估分值" 
                            dataKey="A" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            fill="#06b6d4" 
                            fillOpacity={0.3} 
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 效能预测与风险 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 劳动力推演" subtitle="AI_REASONING">
              <div className="space-y-5">
                 <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-purple-400" />
                       <span className="text-xs font-bold text-white uppercase">智慧排班建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于下周 #4 破碎机组的大修计划，预测‘机械组’将出现 15% 的工时缺口，建议从‘备班库’临时增调 2 名高阶技师。”
                    </p>
                 </div>
                 
                 <div className="bg-slate-900/40 border border-slate-800 p-3 rounded relative group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">工时合规性风险</span>
                       <ShieldAlert size={14} className="text-red-500" />
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="text-2xl font-mono font-bold text-red-500">03</div>
                       <div className="text-[10px] text-slate-400">检测到 3 名成员连续加班超过 12 小时，触发疲劳预警。</div>
                    </div>
                    <div className="absolute top-0 right-0 h-full w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="技能工时分布" subtitle="SKILL_HOURS" className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { skill: '精修', val: 450 },
                         { skill: '调试', val: 320 },
                         { skill: '点检', val: 280 },
                         { skill: '应急', val: 150 },
                         { skill: '培训', val: 90 },
                       ]} layout="vertical" margin={{ left: -30 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="skill" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={12}>
                             {Array.from({length: 5}).map((_, i) => (
                               <Cell key={i} fill={i === 0 ? '#8b5cf6' : '#1e293b'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                       <span>高阶技能利用率</span>
                       <span className="text-white font-bold">82.4%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 w-[82.4%]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数据真实性审计" subtitle="AUDIT_VERIFIED">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-green-900/10 border border-green-500/30 rounded flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-green-500" />
                 </div>
                 <div className="flex-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Blockchain Hash</div>
                    <div className="text-[9px] font-mono text-slate-400 break-all leading-tight opacity-60">
                       0x7724...9221_VERIFIED_BY_FIELD_ID_CORE_SENSORS
                    </div>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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
