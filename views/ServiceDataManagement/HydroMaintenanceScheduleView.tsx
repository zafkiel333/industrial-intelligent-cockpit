
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroScheduleThreeScene } from '../../components/ServiceDataManagement/HydroMaintenanceSchedule/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-4]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-4';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, ComposedChart, Line, ReferenceLine, ScatterChart, Scatter, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  CalendarDays, Wrench, Droplets, Users, Hammer, 
  AlertTriangle, CheckSquare, Clock, ArrowRight, Layers,
  LayoutDashboard, FileText, GanttChart
} from 'lucide-react';

export const HydroMaintenanceScheduleView: React.FC = () => {
  const [activeUnit, setActiveUnit] = useState<string>('unit-2');
  const [simDay, setSimDay] = useState(0);

  // Mock Data: Hydrology vs Window
  const windowData = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    inflow: 500 + Math.sin((i)/11 * Math.PI) * 1500 + (Math.random()*200), // Peak in summer
    loadDemand: 400 + Math.sin((i+2)/11 * Math.PI) * 800,
    maintenanceWindow: i < 4 || i > 9 ? 100 : 0 // Winter is dry season
  }));

  const unitSchedules = {
    'unit-1': { status: '运行中', plan: '2024-11 C级检修', health: 92, nextAction: 'None' },
    'unit-2': { status: '检修中', plan: 'A级大修 (当前)', health: 0, nextAction: '转轮吊装' },
    'unit-3': { status: '备用', plan: '2024-08 定期巡检', health: 98, nextAction: '随时启动' },
    'unit-4': { status: '计划停机', plan: '2024-06 预防性维护', health: 85, nextAction: '排空尾水' },
  };

  const resourcePool = [
    { type: '机械班组', used: 18, total: 20, color: '#f59e0b' },
    { type: '电气班组', used: 5, total: 15, color: '#3b82f6' },
    { type: '特种起重', used: 2, total: 3, color: '#ef4444' },
    { type: '外协专家', used: 1, total: 5, color: '#10b981' },
  ];

  const tasks = [
    { id: 'T-101', name: '2#机组转轮吊出', progress: 85, status: 'delay', res: '起重机' },
    { id: 'T-102', name: '1#机组定子清扫', progress: 0, status: 'pending', res: '电气班' },
    { id: 'T-103', name: '全厂消防系统校核', progress: 40, status: 'normal', res: '综管班' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#041d1a] p-2 overflow-hidden select-none">
      
      {/* 顶部：调度指挥中心 */}
      <div className="flex items-center justify-between px-6 py-4 bg-teal-950/40 border-b border-teal-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-teal-600/20 border border-teal-500/40 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <CalendarDays className="text-teal-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电站检修窗口期与资源调度服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-teal-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Droplets size={12}/> HYDROLOGY: DRY SEASON</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Users size={12}/> MANPOWER: 82% LOAD</span>
                 <span>|</span>
                 <span className="text-amber-400 font-bold">WINDOW STATUS: OPEN (24 Days Left)</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/60 border border-teal-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-teal-500 uppercase font-bold">Active Work Orders</div>
              <div className="text-xl font-mono font-black text-white">12</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/60 border border-teal-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-teal-500 uppercase font-bold">Schedule Adherence</div>
              <div className="text-xl font-mono font-black text-amber-400">94.5%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：窗口期预测与资源池 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           {/* Hydrology & Window Forecast */}
           <SciFiCard title="检修窗口期智能预测" subtitle="HYDROLOGY MODEL" className="flex-1 border-teal-800/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={windowData}>
                       <defs>
                          <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#115e59" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'm³/s', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={false} />
                       <Tooltip contentStyle={{backgroundColor: '#042f2e', border: '1px solid #14b8a6', fontSize: '10px'}} />
                       
                       {/* Inflow Area */}
                       <Area yAxisId="left" type="monotone" dataKey="inflow" fill="url(#colorInflow)" stroke="#22d3ee" name="来水流量" />
                       
                       {/* Window Indicators (Bars at bottom) */}
                       <Bar yAxisId="right" dataKey="maintenanceWindow" fill="#10b981" barSize={20} opacity={0.3} name="推荐窗口" />
                       
                       {/* Load Demand Line */}
                       <Line yAxisId="left" type="monotone" dataKey="loadDemand" stroke="#f59e0b" strokeWidth={2} dot={false} name="负荷需求" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-teal-900/20 border border-teal-800/30 rounded mt-2">
                 <div className="flex items-start gap-2">
                    <CheckSquare className="text-emerald-400 mt-0.5" size={14} />
                    <div>
                       <div className="text-[10px] font-bold text-teal-200">最佳窗口锁定</div>
                       <div className="text-[9px] text-slate-400 leading-tight">
                          基于气象水文大数据，未来 30 天为枯水期黄金窗口，建议安排 2# 机组 A 级检修。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Resource Pool Status */}
           <SciFiCard title="检修资源负载池" subtitle="RESOURCES" className="flex-1">
              <div className="space-y-4 pt-2">
                 {resourcePool.map((res, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300 font-bold">{res.type}</span>
                          <span className="text-slate-400">{res.used} / {res.total}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${(res.used / res.total) * 100}%`, backgroundColor: res.color }}
                             ></div>
                          </div>
                          <span className={`text-[10px] font-mono ${
                             (res.used/res.total) > 0.9 ? 'text-red-400' : 'text-slate-500'
                          }`}>
                             {Math.round((res.used/res.total)*100)}%
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-4 flex gap-2">
                 <button className="flex-1 py-2 bg-slate-800 hover:bg-teal-700/30 border border-slate-700 rounded text-[9px] text-teal-300 font-bold flex items-center justify-center gap-1 transition-all">
                    <Users size={10} /> 班组排班表
                 </button>
                 <button className="flex-1 py-2 bg-slate-800 hover:bg-teal-700/30 border border-slate-700 rounded text-[9px] text-teal-300 font-bold flex items-center justify-center gap-1 transition-all">
                    <Hammer size={10} /> 特种设备台账
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 厂房调度沙盘 */}
        <div className="w-full lg:w-[46%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#022c22] to-[#041d1a] border border-teal-500/20 rounded-2xl relative overflow-hidden group">
              {/* HUD: Unit Details */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-teal-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-teal-500/20 pb-2 mb-2">
                       <LayoutDashboard className="text-teal-400" size={16} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Asset</div>
                          <div className="text-sm font-black text-white uppercase">{unitSchedules[activeUnit]?.status === '检修中' ? '⚠️ ' : ''} {unitSchedules[activeUnit]?.plan.split(' ')[0]}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-[10px] text-slate-300">
                       <div className="flex justify-between">
                          <span>当前状态:</span>
                          <span className={
                             unitSchedules[activeUnit]?.status === '运行中' ? 'text-green-400 font-bold' : 
                             unitSchedules[activeUnit]?.status === '检修中' ? 'text-amber-400 font-bold' : 'text-slate-400'
                          }>{unitSchedules[activeUnit]?.status}</span>
                       </div>
                       <div className="flex justify-between">
                          <span>健康评分:</span>
                          <span className="font-mono text-white">{unitSchedules[activeUnit]?.health}</span>
                       </div>
                       <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                          <span>下一节点:</span>
                          <span className="text-teal-200">{unitSchedules[activeUnit]?.nextAction}</span>
                       </div>
                    </div>
                 </div>
              </div>

              <HydroScheduleThreeScene
                 activeUnitId={activeUnit}
                 onUnitSelect={setActiveUnit}
                 simulationDay={simDay}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Time Control Bar */}
              <div className="absolute bottom-6 left-6 right-6 z-10 bg-black/60 backdrop-blur border border-teal-500/30 p-2 rounded-lg flex items-center gap-4">
                 <button className="text-teal-400 hover:text-white"><Clock size={20}/></button>
                 <div className="flex-1 relative h-8 bg-slate-800/50 rounded overflow-hidden flex items-center px-2">
                    {/* Gantt strip simulation */}
                    <div className="absolute left-0 h-full bg-amber-500/30 w-[20%] border-r border-amber-500/50"></div>
                    <div className="absolute left-[20%] h-full bg-blue-500/10 w-[40%]"></div>
                    
                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{left: '35%'}}></div>
                    <span className="absolute left-[36%] text-[9px] text-red-300 font-mono top-0">NOW</span>
                 </div>
                 <span className="text-xs font-mono text-white">Day +12</span>
              </div>
           </div>

           {/* Scheduling Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                    <Layers size={14} /> 调度指令与冲突日志 (Scheduling Log)
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-2 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-500">[10:00]</span>
                    <span className="text-amber-500 font-bold">CONFLICT:</span>
                    <span>2# 机组大修与 3# 机组巡检争抢起重机资源，已自动推迟 3# 机组任务。</span>
                 </div>
                 <div className="flex gap-2 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-500">[09:45]</span>
                    <span className="text-teal-400 font-bold">DISPATCH:</span>
                    <span>电气班组完成 1# 机组励磁系统检测，释放人力资源 3 人。</span>
                 </div>
                 <div className="flex gap-2 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-500">[09:10]</span>
                    <span className="text-blue-400 font-bold">UPDATE:</span>
                    <span>根据最新水文预报，建议将 4# 机组检修窗口提前 2 天。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：任务看板与冲突检测 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Gantt / Task List */}
           <SciFiCard title="当前执行任务 (TOP 3)" subtitle="GANTT VIEW" className="flex-1 border-teal-800/50">
              <div className="space-y-3 pt-1">
                 {tasks.map((task, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 bg-slate-900/40 rounded border border-slate-700">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">{task.name}</span>
                          <span className={`text-[9px] px-1.5 rounded ${
                             task.status === 'delay' ? 'bg-red-900/30 text-red-400' : 
                             task.status === 'pending' ? 'bg-slate-800 text-slate-500' : 'bg-green-900/30 text-green-400'
                          }`}>{task.status.toUpperCase()}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${
                                task.status === 'delay' ? 'bg-red-500' : 'bg-teal-500'
                             }`} style={{width: `${task.progress}%`}}></div>
                          </div>
                          <span className="text-[9px] text-slate-500">{task.progress}%</span>
                       </div>
                       <div className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Wrench size={10} /> 占用: {task.res}
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 py-2 border border-dashed border-teal-700/50 rounded text-[10px] text-teal-500 hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2">
                 <GanttChart size={12} /> 查看全厂甘特图
              </button>
           </SciFiCard>

           {/* Conflict Radar */}
           <SciFiCard title="调度冲突风险扫描" subtitle="RISK RADAR" className="h-[200px]">
              <div className="flex items-center justify-center h-full relative">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <div className="w-32 h-32 rounded-full border border-dashed border-red-500 animate-[spin_10s_linear_infinite]"></div>
                 </div>
                 <div className="text-center z-10">
                    <div className="text-[9px] text-slate-400 uppercase mb-1">当前冲突指数</div>
                    <div className="text-3xl font-black text-amber-500">LOW</div>
                    <div className="text-[9px] text-slate-500 mt-1">资源冗余度: 15%</div>
                 </div>
                 
                 {/* Decorative Points */}
                 <div className="absolute top-4 right-8 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
           </SciFiCard>

           <SciFiCard title="检修数据归档" className="bg-teal-900/10 border-teal-800/30">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <FileText className="text-teal-400" size={20} />
                    <div>
                       <div className="text-xs font-bold text-white">本次大修标准化包</div>
                       <div className="text-[9px] text-slate-500">Ver 2.1 | 128MB</div>
                    </div>
                 </div>
                 <button className="text-teal-400 hover:text-white"><ArrowRight size={16}/></button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
