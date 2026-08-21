import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { DispatchThreeScene } from '../../components/dispatch/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-dispatch]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-dispatch';
import { 
  Users, 
  Clock, 
  Map as MapIcon, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Filter,
  UserCheck,
  UserMinus,
  Navigation,
  Cpu,
  TrendingUp,
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

const PENDING_ORDERS = [
  { id: 'WO-2024-001', type: '紧急抢修', device: 'M-101', priority: 'High', time: '12min前', label: '主轴承过热' },
  { id: 'WO-2024-002', type: '预防保养', device: 'M-102', priority: 'Low', time: '1h前', label: '季度常规检查' },
  { id: 'WO-2024-003', type: '故障报修', device: 'M-303', priority: 'Med', time: '25min前', label: '进料斗卡死' },
  { id: 'WO-2024-004', type: '故障报修', device: 'M-202', priority: 'Med', time: '40min前', label: '传感器失准' },
];

const TECHNICIANS = [
  { name: '王利民', status: 'available', load: 20, skill: '机械控制', exp: '12yr' },
  { name: '李思源', status: 'working', load: 85, skill: '电气工程', exp: '5yr' },
  { name: '张志恒', status: 'available', load: 10, skill: '液压系统', exp: '8yr' },
  { name: '赵婉莹', status: 'working', load: 95, skill: '自动化调优', exp: '10yr' },
];

const STATS_DATA = [
  { name: '08:00', load: 30 },
  { name: '10:00', load: 65 },
  { name: '12:00', load: 45 },
  { name: '14:00', load: 88 },
  { name: '16:00', load: 55 },
];

export const DispatchConsoleView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | undefined>(undefined);

  const handleOrderClick = (order: any) => {
    setActiveOrder(order.id);
    setSelectedMachine(order.device);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 font-[Rajdhani]">
      
      {/* 顶部全局 KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'SLA 达成率', value: '98.5%', icon: ShieldCheck, color: 'text-green-400' },
          { label: '平均响应时间', value: '8.4min', icon: Clock, color: 'text-cyan-400' },
          { label: '待处理工单', value: '14', icon: AlertCircle, color: 'text-orange-400' },
          { label: 'AI 优化效能', value: '+22%', icon: Cpu, color: 'text-purple-400' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</div>
              <div className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</div>
            </div>
            <item.icon size={24} className="text-slate-700" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：待派工单池 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-500" />
                <span className="font-bold text-slate-200">待派工单池</span>
             </div>
             <button className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1">
                <Filter size={10} /> 筛选
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
             {PENDING_ORDERS.map(order => (
               <div 
                 key={order.id}
                 onClick={() => handleOrderClick(order)}
                 className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                    ${activeOrder === order.id 
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-600'}
                 `}
               >
                 {order.priority === 'High' && (
                   <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                      <div className="bg-red-500 text-[8px] text-white font-bold py-1 w-20 text-center transform rotate-45 translate-x-3 -translate-y-1">紧急</div>
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                   <div className="text-[10px] font-mono text-slate-500">{order.id}</div>
                   <div className="text-[9px] text-slate-500">{order.time}</div>
                 </div>
                 <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">{order.label}</div>
                 <div className="flex justify-between items-center mt-3">
                   <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{order.device}</span>
                   <span className="text-[10px] text-cyan-500 font-bold">{order.type}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* 中间：数字化车间图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020617] border border-slate-800 rounded-sm overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs">
                          <Navigation size={14} className="animate-pulse" />
                          COMMAND CENTER: ACTIVE
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Plant Dispatch Matrix <span className="text-purple-500 italic">v2.4</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="bg-black/60 border border-slate-800 p-2 rounded backdrop-blur">
                          <div className="text-[9px] text-slate-500 uppercase">Load Balance</div>
                          <div className="h-1 w-20 bg-slate-800 mt-1 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-500 w-[65%]"></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 中部悬浮提示 */}
                 {selectedMachine && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                      <div className="bg-cyan-900/90 border border-cyan-500/50 p-3 rounded backdrop-blur-md animate-in zoom-in duration-300">
                         <div className="text-[10px] text-cyan-300 font-bold mb-1">SELECTED ASSET</div>
                         <div className="text-lg font-bold text-white font-mono">{selectedMachine}</div>
                         <div className="flex gap-4 mt-2">
                            <button className="text-[9px] bg-cyan-500 text-black px-2 py-1 font-bold rounded">调取监控</button>
                            <button className="text-[9px] bg-slate-800 text-white px-2 py-1 font-bold rounded border border-slate-700">查看BOM</button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {/* 3D 渲染组件 */}
              <DispatchThreeScene 
                activeMachineId={selectedMachine} 
                onMachineClick={setSelectedMachine}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 2026-08-21：移除会被主平台浅色主题转为不透明色块的下半区装饰遮罩。 */}

           </div>

           {/* 底部 AI 推荐 */}
           <SciFiCard title="AI 智能派单推荐" subtitle="SUGGESTIONS" className="h-44 border-purple-900/30 bg-purple-950/5">
              <div className="flex items-center gap-6 h-full">
                 <div className="w-16 h-16 bg-purple-900/40 rounded-full flex items-center justify-center border border-purple-500/50 relative">
                    <Zap className="text-purple-400 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
                 </div>
                 <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-300">
                       检测到工单 <span className="text-white font-bold">WO-2024-001</span> 为最高优先级。推荐指派 
                       <span className="text-cyan-400 font-bold mx-1">王利民</span>，其技能匹配度 96%，距离目标设备 45米。
                    </p>
                    <div className="flex gap-4 pt-2">
                       <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-sm shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">一键派发建议</button>
                       <button className="px-6 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-sm border border-slate-700 hover:bg-slate-700">重新计算</button>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：资源状态与分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
          
          <SciFiCard title="技师状态监控" subtitle="TEAM STATUS">
             <div className="space-y-4">
                {TECHNICIANS.map((tech, i) => (
                  <div key={i} className="flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${tech.status === 'available' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                           <span className="text-xs font-bold text-slate-200">{tech.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">EXP: {tech.exp}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${tech.load > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${tech.load}%`}}></div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 w-6">{tech.load}%</span>
                     </div>
                     <div className="flex justify-between text-[9px] text-slate-500 italic">
                        <span>技能: {tech.skill}</span>
                        <div className="flex gap-1">
                           <button className="p-1 hover:bg-slate-800 rounded"><MessageSquare size={10}/></button>
                           <button className="p-1 hover:bg-slate-800 rounded"><Navigation size={10}/></button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </SciFiCard>

          <SciFiCard title="车间负载趋势" subtitle="LOAD TREND" className="flex-1">
             <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={STATS_DATA}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#e2e8f0', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="load" stroke="#8b5cf6" fill="url(#colorLoad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </SciFiCard>

          <SciFiCard title="调度中心控制" subtitle="SYSTEM">
             <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded transition-all gap-2">
                   <Calendar size={18} className="text-slate-400" />
                   <span className="text-[10px] text-slate-500 font-bold uppercase">排班管理</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded transition-all gap-2">
                   <TrendingUp size={18} className="text-slate-400" />
                   <span className="text-[10px] text-slate-500 font-bold uppercase">效率分析</span>
                </button>
             </div>
          </SciFiCard>

        </div>
      </div>

    </div>
  );
};
