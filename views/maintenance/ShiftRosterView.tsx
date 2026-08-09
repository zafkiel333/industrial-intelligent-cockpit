

import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, 
  Clock, 
  Moon, 
  Sun, 
  Zap, 
  UserCheck, 
  ShieldAlert, 
  ArrowRightLeft,
  Calendar,
  RotateCw,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Activity,
  Coffee,
  UserPlus,
  BarChart3,
  TrendingUp,
  Cpu,
  Navigation,
  Sparkles,
  Search,
  // Added missing imports to fix errors on lines 332 and 370
  ChevronRight,
  FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

// --- 模拟业务数据 ---

interface Staff {
  id: string;
  name: string;
  role: string;
  skills: string[];
  fatigue: number; // 0-100
  status: 'active' | 'rest' | 'standby';
  shiftCount: number;
}

const STAFF_POOL: Staff[] = [
  { id: 'ST-01', name: '王振华', role: '机械组长', skills: ['液压', '密封'], fatigue: 42, status: 'active', shiftCount: 18 },
  { id: 'ST-02', name: '李瑞平', role: '电气专家', skills: ['PLC', '高压'], fatigue: 78, status: 'active', shiftCount: 22 },
  { id: 'ST-03', name: '张小凡', role: '初级技师', skills: ['钳工', '润滑'], fatigue: 15, status: 'rest', shiftCount: 12 },
  { id: 'ST-04', name: '赵大勇', role: '自动化工程师', skills: ['传感器', '驱动'], fatigue: 55, status: 'active', shiftCount: 15 },
  { id: 'ST-05', name: '孙晓敏', role: '安全审计员', skills: ['EHS', 'LOTO'], fatigue: 30, status: 'standby', shiftCount: 10 },
];

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const SHIFT_TYPES = [
  { id: 'day', label: '早班 (08:00 - 16:00)', icon: <Sun size={14}/>, color: '#0ea5e9' },
  { id: 'swing', label: '中班 (16:00 - 00:00)', icon: <Zap size={14}/>, color: '#f59e0b' },
  { id: 'night', label: '夜班 (00:00 - 08:00)', icon: <Moon size={14}/>, color: '#8b5cf6' },
  { id: 'off', label: '休假/轮换', icon: <Coffee size={14}/>, color: '#334155' },
];

// 模拟每周排班表
const WEEKLY_ROSTER = [
  { day: '周一', day_staff: '王振华', swing_staff: '赵大勇', night_staff: '李瑞平', status: 'optimal' },
  { day: '周二', day_staff: '王振华', swing_staff: '李瑞平', night_staff: '孙晓敏', status: 'warning' },
  { day: '周三', day_staff: '张小凡', swing_staff: '赵大勇', night_staff: '李瑞平', status: 'optimal' },
  { day: '周四', day_staff: '王振华', swing_staff: '孙晓敏', night_staff: '赵大勇', status: 'optimal' },
  { day: '周五', day_staff: '李瑞平', swing_staff: '张小凡', night_staff: '王振华', status: 'heavy' },
  { day: '周六', day_staff: '赵大勇', swing_staff: '孙晓敏', night_staff: '张小凡', status: 'optimal' },
  { day: '周日', day_staff: '孙晓敏', swing_staff: '王振华', night_staff: '李瑞平', status: 'optimal' },
];

const WORKLOAD_HISTORY = [
  { name: 'Mon', active: 12, capacity: 15 },
  { name: 'Tue', active: 14, capacity: 15 },
  { name: 'Wed', active: 11, capacity: 15 },
  { name: 'Thu', active: 15, capacity: 15 },
  { name: 'Fri', active: 16, capacity: 15 }, // Overload
  { name: 'Sat', active: 8, capacity: 15 },
  { name: 'Sun', active: 6, capacity: 15 },
];

// Added missing TRAINING_PLAN constant to fix errors on lines 346 and 348
const TRAINING_PLAN = [
  { course: '高压变频器专项研修', due: '2024-05-15', progress: 45 },
  { course: '工业网络安全(L3)', due: '2024-06-01', progress: 100 },
  { course: 'AR 数字化维保实操', due: '2024-04-20', progress: 85 },
  { course: '精益 5S 现场督导', due: '2024-05-10', progress: 20 },
];

export const ShiftRosterView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('周三');
  const [activeStaffId, setActiveStaffId] = useState('ST-02');
  // Fix: Added missing searchTerm state on lines 155/156
  const [searchTerm, setSearchTerm] = useState('');

  const activeStaff = useMemo(() => STAFF_POOL.find(s => s.id === activeStaffId) || STAFF_POOL[0], [activeStaffId]);

  // Fix: Implemented filteredStaff logic to support the search input
  const filteredStaff = useMemo(() => {
    return STAFF_POOL.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#02040a]">
      
      {/* 顶部：战略指挥中心仪表盘 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/50 relative group">
              <BrainCircuit size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-indigo-500/20 rounded animate-[spin_12s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Workforce Intelligence Command
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修排班 <span className="text-indigo-500 italic">与智能轮岗中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="grid grid-cols-3 gap-6 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前在岗率</div>
                 <div className="text-2xl font-mono font-bold text-green-400">93.3%</div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700"></div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均疲劳度</div>
                 <div className="text-2xl font-mono font-bold text-amber-500">42.8</div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700"></div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI 轮岗评分</div>
                 <div className="text-2xl font-mono font-bold text-indigo-400">优 A+</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：动态人员效能画像 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Users size={14} className="text-indigo-500" /> 技师效能阵列</span>
              <span>Online: 4</span>
           </div>
           
           <div className="flex flex-col gap-2 mb-2 px-1">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                 <input 
                    type="text" 
                    placeholder="检索姓名/技能关键词..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-purple-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {/* Fix: Map over filteredStaff instead of STAFF_POOL to reflect search results */}
              {filteredStaff.map(staff => (
                <div 
                  key={staff.id}
                  onClick={() => setActiveStaffId(staff.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${activeStaffId === staff.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex gap-4 items-center mb-3">
                     <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} alt={staff.name} className="w-12 h-12 rounded bg-slate-800 border border-slate-700" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#02040a]
                           ${staff.status === 'active' ? 'bg-green-500 shadow-[0_0_5px_lime]' : staff.status === 'rest' ? 'bg-slate-600' : 'bg-amber-500'}
                        `}></div>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center">
                           <h3 className="font-bold text-slate-100 text-sm">{staff.name}</h3>
                           <span className="text-[10px] text-indigo-400 font-mono">#{staff.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{staff.role}</div>
                     </div>
                  </div>
                  
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] uppercase text-slate-500 font-bold">
                        <span>疲劳风险 (Fatigue)</span>
                        <span className={staff.fatigue > 70 ? 'text-red-400' : 'text-slate-300'}>{staff.fatigue}%</span>
                     </div>
                     <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${staff.fatigue > 70 ? 'bg-red-500' : staff.fatigue > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${staff.fatigue}%` }}></div>
                     </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                     {staff.skills.map(skill => (
                       <span key={skill} className="text-[8px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">{skill}</span>
                     ))}
                  </div>

                  {activeStaffId === staff.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* 中间：全息数字化排班全景矩阵 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1e1b4b 1px, transparent 1px), linear-gradient(90deg, #1e1b4b 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* 核心排班矩阵 HUD */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <LayoutGrid size={14} className="animate-pulse" />
                          Master Shift Roster Grid
                       </div>
                       <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
                          本周 <span className="text-indigo-500 italic">多维排班矩阵</span>
                       </h2>
                    </div>
                    <div className="flex gap-2">
                       {SHIFT_TYPES.map(type => (
                         <div key={type.id} className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded text-[9px] text-slate-400 font-bold uppercase backdrop-blur-sm">
                            <span style={{ color: type.color }}>{type.icon}</span> {type.label.split('(')[0]}
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* 交互式表格 */}
                 <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b border-slate-800">
                             <th className="py-4 px-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest w-16">时间轴</th>
                             {WEEKLY_ROSTER.map(r => (
                               <th key={r.day} onClick={() => setSelectedDay(r.day)} className={`py-4 px-2 text-center cursor-pointer transition-colors ${selectedDay === r.day ? 'bg-indigo-950/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                  <div className="text-xs font-bold">{r.day}</div>
                                  <div className={`mt-1 h-1 w-8 mx-auto rounded-full ${r.status === 'heavy' ? 'bg-red-500' : r.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                               </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/30">
                          {[
                            { key: 'day_staff', label: '早班', icon: <Sun size={12}/>, color: 'text-cyan-400' },
                            { key: 'swing_staff', label: '中班', icon: <Zap size={12}/>, color: 'text-amber-400' },
                            { key: 'night_staff', label: '夜班', icon: <Moon size={12}/>, color: 'text-indigo-400' },
                          ].map(row => (
                            <tr key={row.key} className="group hover:bg-slate-900/20 transition-all">
                               <td className="py-6 px-2">
                                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase ${row.color}`}>
                                     {row.icon} {row.label}
                                  </div>
                               </td>
                               {WEEKLY_ROSTER.map(r => (
                                 <td key={r.day} className={`p-2 text-center transition-all ${selectedDay === r.day ? 'bg-indigo-950/10 scale-105' : ''}`}>
                                    <div className="bg-slate-900/60 border border-slate-800 p-2 rounded hover:border-indigo-500/50 cursor-pointer group/cell relative overflow-hidden">
                                       <div className="text-xs font-bold text-slate-200">{(r as any)[row.key]}</div>
                                       <div className="text-[8px] text-slate-600 mt-1 uppercase">Assigned</div>
                                       <div className="absolute -right-1 -top-1 opacity-0 group-hover/cell:opacity-20">
                                          <ArrowRightLeft size={30} className="text-indigo-500" />
                                       </div>
                                    </div>
                                 </td>
                               ))}
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 {/* 底部功能条 */}
                 <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4">
                          <div className="p-2 bg-indigo-900/30 rounded-full"><Sparkles size={20} className="text-indigo-400" /></div>
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI 自动排班引擎</div>
                             <div className="text-sm font-bold text-white">Version: NeuroShift 2.4</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all flex items-center gap-2">
                          <RotateCw size={14}/> 重新平衡轮岗
                       </button>
                       <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">
                          发布排班
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：智能分析与轮岗逻辑 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="轮岗压力监测" subtitle="FATIGUE_MODEL">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WORKLOAD_HISTORY}>
                       <defs>
                          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="active" stroke="#6366f1" fill="url(#colorActive)" strokeWidth={2} />
                       <Area type="step" dataKey="capacity" stroke="#ef4444" fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-slate-500 leading-relaxed italic text-center">
                 红色虚线代表人员负载阈值。周五由于计划大修，负载处于<span className="text-red-400 font-bold">超载区</span>。
              </div>
           </SciFiCard>

           <SciFiCard title="智能轮岗推荐" subtitle="AI_LOGIC" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="p-3 bg-indigo-900/10 border-l-2 border-indigo-500 rounded flex flex-col gap-2 relative overflow-hidden group">
                       <div className="absolute right-0 top-0 p-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-bold">RECOMMENDED</div>
                       <div className="flex items-center gap-2">
                          <ArrowRightLeft size={16} className="text-indigo-400" />
                          <span className="text-xs font-bold text-white">李瑞平 ➔ 周二夜班</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal">
                          检测到李瑞平当前疲劳度为 78%，建议将周二夜班与张小凡进行对调。
                       </p>
                       <button className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1 mt-1 font-bold">
                          一键应用 <ChevronRight size={10} />
                       </button>
                    </div>

                    <div className="p-3 bg-amber-900/10 border-l-2 border-amber-500 rounded flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-amber-500" />
                          <span className="text-xs font-bold text-white">技能失衡警报</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal">
                          周五白班组缺少“高压电工”资质人员。建议从备班库增调孙晓敏。
                       </p>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">
                       <span>数据完整性核验</span>
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-900 rounded"><Cpu size={16} className="text-slate-500" /></div>
                       <div className="text-[10px] text-slate-400 italic">
                          “所有班次均符合 12 小时最小休息间隔法规要求。”
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="值班日志索引" subtitle="ARCHIVE">
              <div className="space-y-2">
                 {[
                   { date: '2024-03-20', team: 'Alpha', result: '无异常' },
                   { date: '2024-03-19', team: 'Beta', result: '处理工单 5 项' },
                 ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950/50 border border-slate-800 rounded group hover:border-indigo-500/30 cursor-pointer transition-colors">
                       <div className="flex items-center gap-3">
                          <FileText size={14} className="text-slate-500 group-hover:text-indigo-400" />
                          <div className="text-[10px] font-mono text-slate-400">{log.date}</div>
                       </div>
                       <span className="text-[10px] text-slate-600">{log.team}</span>
                    </div>
                 ))}
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
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};
