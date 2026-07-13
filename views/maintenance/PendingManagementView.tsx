import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { PendingThreeScene } from '../../components/maintenance_pending/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-pending]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-pending';
import { 
  Clock, 
  PauseCircle, 
  CalendarClock, 
  ShieldAlert, 
  ChevronRight, 
  Timer, 
  Search, 
  Filter, 
  History,
  FileText,
  UserCheck,
  AlertCircle,
  Package,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

const PENDING_LIST = [
  { id: 'WO-20240315-01', target: 'P-101 循环泵', reason: '等待进口轴承', days: 5, status: '已挂起', priority: 'High' },
  { id: 'WO-20240312-05', target: 'M-202 传送带电机', reason: '专家远程诊断中', days: 8, status: '已挂起', priority: 'Med' },
  { id: 'WO-20240310-09', target: 'V-305 泄压阀', reason: '现场环境安全性受限', days: 12, status: '已挂起', priority: 'High' },
  { id: 'WO-20240318-02', target: 'E-401 换热器', reason: '等待生产停机窗口', days: 2, status: '待审核', priority: 'Low' },
];

const EXTENSION_REQUESTS = [
  { id: 'REQ-EXT-001', orderId: 'WO-20240315-01', from: '张工', originDate: '03-20', applyDate: '03-25', reason: '备件海关清关延迟' },
  { id: 'REQ-EXT-002', orderId: 'WO-20240318-02', from: '李工', originDate: '03-22', applyDate: '03-28', reason: '由于连日暴雨无法露天作业' },
];

const REASON_STATS = [
  { name: '缺件', value: 45 },
  { name: '待人', value: 20 },
  { name: '环境', value: 15 },
  { name: '生产', value: 20 },
];

export const PendingManagementView: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 font-[Rajdhani]">
      
      {/* 顶部看板 - 时效核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '累计挂起工单', value: '14', sub: '+2 较昨日', icon: PauseCircle, color: 'text-amber-400' },
          { label: '平均延期时长', value: '6.5d', sub: '-0.5d 优化中', icon: Timer, color: 'text-cyan-400' },
          { label: '待处理审批', value: '03', sub: '2条 紧急申请', icon: CalendarClock, color: 'text-red-400' },
          { label: 'SLA 合规指数', value: '92.4%', sub: '波动 -1.2%', icon: Activity, color: 'text-green-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
               <kpi.icon size={80} />
            </div>
            <div className={`p-3 rounded-full bg-slate-800/50 ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{kpi.label}</div>
              <div className="text-2xl font-bold font-mono text-white leading-none my-1">{kpi.value}</div>
              <div className="text-[10px] text-slate-500">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：工单冰封池 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                <Inbox size={16} className="text-amber-500" />
                <span className="font-bold text-slate-200">挂起工单池 (Suspension)</span>
             </div>
             <div className="flex gap-2">
                <button className="p-1 hover:text-cyan-400 text-slate-500"><Filter size={14}/></button>
                <button className="p-1 hover:text-cyan-400 text-slate-500"><Search size={14}/></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
             {PENDING_LIST.map(order => (
               <div 
                 key={order.id}
                 onClick={() => setSelectedOrder(order.id)}
                 className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedOrder === order.id 
                      ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                 `}
               >
                 <div className="flex justify-between items-start mb-2">
                   <div className="text-[10px] font-mono text-slate-500">{order.id}</div>
                   <div className={`px-1.5 rounded text-[10px] font-bold ${order.priority === 'High' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {order.priority}
                   </div>
                 </div>
                 <div className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">{order.target}</div>
                 <div className="flex items-center gap-2 mt-3">
                   <AlertCircle size={10} className="text-amber-500" />
                   <span className="text-[10px] text-slate-400 truncate">{order.reason}</span>
                 </div>
                 <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                       <Clock size={10} /> 挂起 {order.days} 天
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 rounded text-slate-400 font-bold">{order.status}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* 中间：3D 时域分析场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020617] border border-slate-800 rounded overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs">
                          <Activity size={14} className="animate-pulse" />
                          TEMPORAL ANALYSIS: ACTIVE
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Suspension <span className="text-amber-500">Spiral Map</span>
                       </div>
                    </div>
                    <div className="bg-black/60 border border-slate-700 p-2 rounded backdrop-blur text-right">
                       <div className="text-[10px] text-slate-500 uppercase">Analysis Engine</div>
                       <div className="text-xs font-mono font-bold text-cyan-400">Chronos v4.2</div>
                    </div>
                 </div>

                 {/* 核心坐标系描述 */}
                 <div className="absolute top-24 left-6 max-w-[140px] border-l border-slate-800 pl-3">
                    <div className="text-[9px] text-slate-600 leading-tight uppercase font-bold">
                       中心轴代表当前时间。离心率代表挂起时长。节点亮度代表优先级。
                    </div>
                 </div>

                 {/* 底部详情预览 - 当选中工单时 */}
                 {selectedOrder && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-80">
                       <div className="bg-slate-900/90 border border-cyan-500/50 p-4 rounded-sm backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
                          <div className="text-[10px] text-cyan-400 font-bold mb-1 tracking-widest uppercase">Node Metadata</div>
                          <div className="text-lg font-bold text-white mb-2">{selectedOrder}</div>
                          <div className="space-y-2 text-xs text-slate-400">
                             <div className="flex justify-between"><span>挂起起止:</span> <span className="text-slate-200">03.15 - 至今</span></div>
                             <div className="flex justify-between"><span>阻塞因素:</span> <span className="text-amber-400">进口轴承清关延迟</span></div>
                             <div className="flex justify-between"><span>预计复工:</span> <span className="text-green-400">03.26 (预测)</span></div>
                          </div>
                          <div className="mt-4 flex gap-2">
                             <button className="flex-1 py-1.5 bg-cyan-600 text-white text-[10px] font-bold rounded uppercase hover:bg-cyan-500 transition-colors">激活重启</button>
                             <button className="flex-1 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded uppercase border border-slate-700">调阅档案</button>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* 3D 渲染组件 */}
              <PendingThreeScene onNodeSelect={setSelectedOrder} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 背景装饰网格 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_80%)] pointer-events-none"></div>
           </div>

           {/* 底部：资源复苏预测分析 */}
           <SciFiCard title="挂起恢复与阻塞趋势预测" subtitle="FORECAST" className="h-44">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'D1', recover: 2, total: 14 },
                      { name: 'D2', recover: 5, total: 12 },
                      { name: 'D3', recover: 4, total: 11 },
                      { name: 'D4', recover: 1, total: 10 },
                      { name: 'D5', recover: 8, total: 2 },
                    ]}>
                      <defs>
                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="recover" name="预计复工数" stroke="#0ea5e9" fill="url(#colorRec)" strokeWidth={2} />
                      <Area type="step" dataKey="total" name="剩余挂起总数" stroke="#475569" fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：审批与分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-1">
          
          <SciFiCard title="延期申请审批" subtitle="WORKFLOW">
             <div className="space-y-4">
                {EXTENSION_REQUESTS.map((req, i) => (
                  <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-cyan-500">{req.orderId}</span>
                        <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                     </div>
                     <div className="text-xs font-bold text-white mb-1">申请人: {req.from}</div>
                     <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-2">
                        <CalendarClock size={10} /> {req.originDate} ➔ <span className="text-red-400 font-bold">{req.applyDate}</span>
                     </div>
                     <p className="text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded mb-3 italic">“{req.reason}”</p>
                     <div className="flex gap-2">
                        <button className="flex-1 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1">
                           <UserCheck size={10} /> 批准
                        </button>
                        <button className="flex-1 py-1 bg-slate-800 hover:bg-red-900/40 text-slate-400 text-[10px] font-bold rounded border border-slate-700">驳回</button>
                     </div>
                  </div>
                ))}
                <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                   <History size={12} /> 查看历史审批记录
                </button>
             </div>
          </SciFiCard>

          <SciFiCard title="挂起原因全要素分析" subtitle="ROOT CAUSE" className="flex-1">
             <div className="h-full flex flex-col">
                <div className="flex-1 min-h-[150px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={REASON_STATS} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={40} axisLine={false} tickLine={false} />
                         <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                         <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                            {REASON_STATS.map((entry, index) => (
                               <Cell key={index} fill={['#0ea5e9', '#8b5cf6', '#f59e0b', '#64748b'][index % 4]} fillOpacity={0.8} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                   <div className="flex items-center gap-3 p-2 bg-red-900/10 border border-red-900/30 rounded">
                      <Package size={16} className="text-red-500" />
                      <div className="flex-1">
                         <div className="text-[10px] text-slate-400">紧缺备件预警</div>
                         <div className="text-xs font-bold text-red-400">SKU-7724: 推力瓦</div>
                      </div>
                      <TrendingUp size={14} className="text-red-500" />
                   </div>
                   <div className="flex items-center gap-3 p-2 bg-cyan-900/10 border border-cyan-900/30 rounded">
                      <Activity size={16} className="text-cyan-500" />
                      <div className="flex-1">
                         <div className="text-[10px] text-slate-400">平均挂起转化率</div>
                         <div className="text-xs font-bold text-cyan-400">72.4% 已制定方案</div>
                      </div>
                   </div>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="风险穿透管理" subtitle="SAFETY">
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 flex items-center gap-1"><ShieldAlert size={12} className="text-red-500" /> 长期挂起风险项</span>
                   <span className="text-red-500 font-bold font-mono">03</span>
                </div>
                <div className="p-2 bg-slate-950/80 rounded border border-slate-800 flex items-start gap-3">
                   <div className="w-1 h-8 bg-red-500 rounded-full mt-1"></div>
                   <div className="text-[10px] text-slate-500 leading-normal">
                      检测到工单 <span className="text-white font-bold">WO-20240310-09</span> 已超过10天未有动作，且涉及重大风险源，建议立即介入。
                   </div>
                </div>
             </div>
          </SciFiCard>

        </div>
      </div>

    </div>
  );
};