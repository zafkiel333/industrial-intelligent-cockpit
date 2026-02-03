import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LubCalendarThreeScene } from '../../components/maintenance_lub_calendar/ThreeScene';
import { LubPoint } from '../../components/maintenance_lub_calendar/three-types';
import { 
  Calendar, 
  Droplets, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ChevronRight, 
  History,
  Beaker,
  Gauge,
  Thermometer,
  MoreHorizontal,
  Play,
  RotateCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';

// --- MOCK DATA ---

const CALENDAR_DAYS = Array.from({ length: 35 }, (_, i) => {
  const day = i + 1;
  // Random status for some days
  let status = 'none';
  if (day % 7 === 0) status = 'major';
  else if (day % 3 === 0) status = 'routine';
  else if (day === 12 || day === 24) status = 'overdue';

  return { day, status };
});

const DAILY_TASKS = [
  { id: 'T-101', time: '08:00', type: 'Oil Change', machine: '#1 破碎机主轴', lubricant: 'CKD-320', amount: '200L', status: 'completed' },
  { id: 'T-102', time: '10:30', type: 'Greasing', machine: '#3 皮带输送机', lubricant: 'Li-Base #2', amount: '5kg', status: 'injecting' },
  { id: 'T-103', time: '14:00', type: 'Sampling', machine: '#2 球磨机减速箱', lubricant: 'L-HM46', amount: '50ml', status: 'pending' },
  { id: 'T-104', time: '16:00', type: 'Inspection', machine: '#1 风机轴承', lubricant: '-', amount: '-', status: 'pending' },
];

const OIL_CONSUMPTION_DATA = [
  { name: 'Mon', oil: 40, grease: 10 },
  { name: 'Tue', oil: 30, grease: 15 },
  { name: 'Wed', oil: 80, grease: 8 },
  { name: 'Thu', oil: 50, grease: 20 },
  { name: 'Fri', oil: 90, grease: 12 },
  { name: 'Sat', oil: 20, grease: 5 },
  { name: 'Sun', oil: 10, grease: 2 },
];

// 3D Visualization Points (Manifold pipes)
const LUB_POINTS: LubPoint[] = [
  { 
    id: 'T-101', machineId: 'M1', status: 'completed', 
    position: [-3, -2, -2], 
    pipePath: [[0,0,0], [-1,0,0], [-2,-1,-1], [-3,-2,-2]] 
  },
  { 
    id: 'T-102', machineId: 'M3', status: 'injecting', 
    position: [3, -2, -3], 
    pipePath: [[0,0,0], [1,0.5,0], [2,-1,-1], [3,-2,-3]] 
  },
  { 
    id: 'T-103', machineId: 'M2', status: 'pending', 
    position: [-2, -2, 3], 
    pipePath: [[0,0,0], [-0.5,1,1], [-1.5,-1,2], [-2,-2,3]] 
  },
  { 
    id: 'T-104', machineId: 'M1', status: 'pending', 
    position: [3, 1, 3], 
    pipePath: [[0,0,0], [1,1,1], [2,1,2], [3,1,3]] 
  },
];

export const LubCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(15); // Default mid-month
  const [activeTaskId, setActiveTaskId] = useState<string | null>('T-102');
  const [isInjecting, setIsInjecting] = useState(true);

  const activeTask = DAILY_TASKS.find(t => t.id === activeTaskId) || DAILY_TASKS[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：润滑时序控制台 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-amber-600 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-400/50">
              <Calendar size={30} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Smart Lubrication Schedule
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 润滑与保养 <span className="text-amber-500 italic">任务日历</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 换油
              <span className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></span> 注脂
              <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span> 逾期
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">今日合规率</div>
              <div className="text-xl font-mono font-bold text-green-400">92.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：日历矩阵与任务流 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* 日历组件 */}
           <SciFiCard title="作业计划月历 (April)" subtitle="SCHEDULE" highlight className="border-amber-900/30">
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                 {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                    <div key={d} className="text-[10px] text-slate-500 font-bold uppercase">{d}</div>
                 ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                 {CALENDAR_DAYS.map((d) => (
                    <div 
                      key={d.day}
                      onClick={() => setSelectedDate(d.day)}
                      className={`aspect-square rounded flex flex-col items-center justify-center cursor-pointer transition-all border
                         ${selectedDate === d.day 
                            ? 'bg-amber-600 border-amber-400 text-white shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}
                      `}
                    >
                       <span className="text-sm font-bold">{d.day}</span>
                       {/* 状态点 */}
                       <div className="flex gap-0.5 mt-1">
                          {d.status === 'major' && <div className="w-1 h-1 rounded-full bg-amber-400"></div>}
                          {d.status === 'routine' && <div className="w-1 h-1 rounded-full bg-cyan-400"></div>}
                          {d.status === 'overdue' && <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>}
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* 当日任务列表 */}
           <SciFiCard title={`Day ${selectedDate} 任务清单`} subtitle="TASKS" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {DAILY_TASKS.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => { setActiveTaskId(task.id); setIsInjecting(task.status === 'injecting'); }}
                      className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                         ${activeTaskId === task.id 
                            ? 'bg-amber-950/30 border-amber-500' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       {activeTaskId === task.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                       
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-slate-500">{task.time}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${task.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                               task.status === 'injecting' ? 'bg-amber-900/30 text-amber-400 animate-pulse' : 
                               'bg-slate-800 text-slate-400'}
                          `}>{task.status}</span>
                       </div>
                       <div className="text-xs font-bold text-white mb-2">{task.machine}</div>
                       <div className="flex items-center justify-between text-[10px] text-slate-400 bg-black/20 p-1.5 rounded">
                          <span className="flex items-center gap-1"><Droplets size={10}/> {task.lubricant}</span>
                          <span className="font-mono text-amber-200">{task.amount}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 润滑分配系统数字孪生 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#0a0602] border border-amber-900/30 rounded-lg overflow-hidden group">
              
              {/* HUD 叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs">
                          <RotateCw size={14} className={isInjecting ? "animate-spin" : ""} />
                          CENTRAL LUBE SYSTEM: {isInjecting ? 'PUMPING' : 'IDLE'}
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Distributor <span className="text-amber-500">Alpha-7</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="bg-black/60 border border-slate-700 px-3 py-1 rounded backdrop-blur flex items-center gap-2">
                          <Gauge size={12} className="text-cyan-400"/>
                          <span className="text-xs font-mono text-white">24.5 MPa</span>
                       </div>
                       <div className="bg-black/60 border border-slate-700 px-3 py-1 rounded backdrop-blur flex items-center gap-2">
                          <Thermometer size={12} className="text-red-400"/>
                          <span className="text-xs font-mono text-white">42.0 °C</span>
                       </div>
                    </div>
                 </div>

                 {/* 选中任务的详细操作面板 (底部) */}
                 <div className="pointer-events-auto bg-slate-900/90 border-t-2 border-amber-500 p-4 backdrop-blur-md animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-3">
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase">Active Task</div>
                          <div className="text-sm font-bold text-white">{activeTask.machine} - {activeTask.type}</div>
                       </div>
                       <button 
                         onClick={() => setIsInjecting(!isInjecting)}
                         className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                            ${isInjecting ? 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 border-slate-600 hover:border-white'}
                         `}
                       >
                          {isInjecting ? <RotateCw className="animate-spin text-white" /> : <Play className="text-white ml-1" />}
                       </button>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full bg-amber-500 transition-all duration-300 ${isInjecting ? 'w-full animate-[pulse_2s_infinite]' : 'w-0'}`}></div>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <LubCalendarThreeScene 
                    points={LUB_POINTS} 
                    activeTaskId={activeTaskId} 
                    flowSpeed={isInjecting ? 1 : 0}
                 />
              </div>
              
              {/* 背景装饰 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
           </div>
        </div>

        {/* 右侧：油品情报与消耗分析 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
           
           {/* 油品详情卡 */}
           <SciFiCard title="润滑介质情报" subtitle="FLUID_INFO" className="border-amber-900/30">
              <div className="flex gap-4 items-start">
                 <div className="w-20 h-24 bg-slate-800 rounded border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute bottom-0 w-full bg-amber-500/80 h-3/4 group-hover:h-full transition-all duration-1000"></div>
                    <Beaker className="relative z-10 text-white" size={24} />
                    <span className="relative z-10 text-[10px] font-bold text-white mt-1">75%</span>
                 </div>
                 <div className="flex-1 space-y-3">
                    <div>
                       <div className="text-xs text-slate-500 uppercase">Designation</div>
                       <div className="text-lg font-bold text-white">{activeTask.lubricant}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-900/50 p-2 rounded">
                          <div className="text-[9px] text-slate-500">Viscosity (40°C)</div>
                          <div className="text-xs font-mono text-cyan-300">320 cSt</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded">
                          <div className="text-[9px] text-slate-500">Cleanliness</div>
                          <div className="text-xs font-mono text-green-400">NAS 6</div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                 <span className="text-slate-400">下次采样日期</span>
                 <span className="text-white font-mono">2024-04-15</span>
              </div>
           </SciFiCard>

           {/* 消耗统计 */}
           <SciFiCard title="润滑消耗周报" subtitle="CONSUMPTION" className="flex-1">
              <div className="flex flex-col h-full">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={OIL_CONSUMPTION_DATA}>
                          <defs>
                             <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorGrease" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="oil" stroke="#f59e0b" fill="url(#colorOil)" strokeWidth={2} name="Oil (L)" />
                          <Area type="monotone" dataKey="grease" stroke="#0ea5e9" fill="url(#colorGrease)" strokeWidth={2} name="Grease (kg)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex items-center gap-4 mt-2 justify-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Oil</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Grease</div>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};