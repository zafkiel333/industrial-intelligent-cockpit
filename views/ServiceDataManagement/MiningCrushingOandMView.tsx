
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MiningSystemThreeScene } from '../../components/ServiceDataManagement/MiningSystem/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area
} from 'recharts';
import { 
  Database, ShieldCheck, ClipboardList, Settings, Server, 
  Workflow, Zap, Activity, Clock, ArrowRight, AlertTriangle, 
  BarChart3, RefreshCcw, Box, Truck, TrendingUp
} from 'lucide-react';

export const MiningCrushingOandMView: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<'crushing' | 'conveying' | 'hoisting'>('crushing');

  const systemDetails = {
    crushing: { title: '矿山破碎系统', color: 'text-amber-500', icon: Zap, metrics: ['衬板磨损率: 12.5%', '入料量: 4500 t/h'] },
    conveying: { title: '皮带输送系统', color: 'text-emerald-500', icon: TrendingUp, metrics: ['带面损伤点: 2', '运行速度: 4.5 m/s'] },
    hoisting: { title: '主井提升系统', color: 'text-purple-500', icon: Box, metrics: ['提升循环: 142次/h', '钢丝绳应力: 正常'] },
  };

  const workOrders = [
    { id: 'WO-8801', name: '破碎机主轴承润滑审计', status: '进行中', urgency: '高', time: '14:20' },
    { id: 'WO-8805', name: '2号输送带接头超声波探伤', status: '已完成', urgency: '中', time: '10:15' },
    { id: 'WO-8809', name: '提升机首绳末端探伤同步', status: '待审核', urgency: '低', time: '09:00' },
    { id: 'WO-8812', name: '全链路振动频谱异常校验', status: '预警', urgency: '紧急', time: '刚才' },
  ];

  const distributionData = [
    { name: '破碎数据', value: 35, color: '#f59e0b' },
    { name: '输送数据', value: 40, color: '#10b981' },
    { name: '提升数据', value: 25, color: '#8b5cf6' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部标题栏：服务管理身份感 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/20 border-b border-white/5 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.15)]">
              <Workflow className="text-blue-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-bold tracking-tight">矿山破碎、输送、提升系统运维服务数据管理</h1>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4 mt-1 font-mono">
                 <span>集群编号: SC-700-ALPHA</span>
                 <span>|</span>
                 <span>服务主节点: 华北矿区节点-02</span>
                 <span>|</span>
                 <span>运行状态: 高度可控</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold">总托管资产包</div>
              <div className="text-xl font-mono text-blue-400">1,402,550 <span className="text-xs">UNIT</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-800"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold">同步健康率</div>
              <div className="text-xl font-mono text-green-400">99.98%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：运维服务工单链 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="实时运维服务流" subtitle="SERVICE PIPELINE" className="flex-1">
              <div className="space-y-4">
                 {workOrders.map((order, i) => (
                   <div key={i} className="group relative bg-slate-900/40 border border-slate-800 p-3 rounded-lg hover:border-blue-500/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-blue-400">{order.id}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded uppercase font-bold ${
                          order.urgency === '紧急' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {order.urgency}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{order.name}</div>
                      <div className="flex justify-between items-center mt-3 text-[10px]">
                         <span className="text-slate-500 flex items-center gap-1"><Clock size={10}/> {order.time}</span>
                         <span className={`font-bold ${order.status === '进行中' ? 'text-blue-400' : 'text-green-500'}`}>{order.status}</span>
                      </div>
                      <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowRight size={14} className="text-blue-500" />
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="服务效率评估" subtitle="EFFICIENCY">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '08:00', val: 82 }, { time: '10:00', val: 95 }, { time: '12:00', val: 88 }, { time: '14:00', val: 92 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                 <span className="text-[10px] text-slate-500 uppercase">工单平均处理时效: <span className="text-blue-400 font-mono">1.2h</span></span>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全链路数字化底座 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-slate-900/50 to-transparent border border-blue-500/10 rounded-2xl relative overflow-hidden group">
              {/* 装饰层 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.03)_0%,_transparent_70%)] pointer-events-none"></div>
              
              {/* 系统即时参数 HUD */}
              <div className="absolute top-6 left-6 z-10">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
                    <div className={`text-xl font-bold flex items-center gap-3 ${systemDetails[activeSystem].color}`}>
                       {React.createElement(systemDetails[activeSystem].icon, { size: 24 })} 
                       {systemDetails[activeSystem].title}
                    </div>
                    <div className="mt-4 space-y-2">
                       {systemDetails[activeSystem].metrics.map((m, i) => (
                         <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {m}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* 节点选择器 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 {(['crushing', 'conveying', 'hoisting'] as const).map(s => (
                   <button 
                     key={s}
                     onClick={() => setActiveSystem(s)}
                     className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${
                       activeSystem === s 
                       ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                       : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500'
                     }`}
                   >
                     切换{systemDetails[s].title.split('系统')[0]}
                   </button>
                 ))}
              </div>

              <MiningSystemThreeScene activeSystem={activeSystem} onSystemSelect={setActiveSystem} />
           </div>

           {/* 底部数据中心总线 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Activity size={14} className="animate-pulse" /> 实时管理服务日志流 (Live Service Bus)
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">
                    RULE_ENGINE: V2.44-STABLE
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-3"><span className="text-slate-600">[14:42:01]</span><span className="text-amber-500">CRUSH_MNGR:</span> 解析到破碎机负载激增数据，系统已自动调配给料补偿。</div>
                 <div className="flex gap-3"><span className="text-slate-600">[14:41:55]</span><span className="text-emerald-500">CONV_NODE:</span> 3号输送带偏移量回归正常，历史纠偏记录已归档至云端。</div>
                 <div className="flex gap-3 opacity-60"><span className="text-slate-600">[14:41:30]</span><span className="text-purple-500">HOIST_SERV:</span> 检测到提升机钢丝绳磁粉探伤完整度达100%，生成季度评估报告。</div>
                 <div className="flex gap-3"><span className="text-slate-600">[14:41:12]</span><span className="text-blue-500">SECURITY:</span> 数据脱敏引擎对导出请求进行拦截：检测到非授权IP。</div>
                 <div className="flex gap-3"><span className="text-slate-600">[14:40:45]</span><span className="text-red-500">ALARM:</span> 井工矿102工作面通信链路延迟 &gt 150ms，切换至边缘缓存模式。</div>
              </div>
           </div>
        </div>

        {/* 右侧：治理、分布与合规 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="数据治理评分" subtitle="GOVERNANCE">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: '实时性', A: 98 }, { subject: '一致性', A: 92 }, { subject: '准确性', A: 85 }, { subject: '完整度', A: 99 }, { subject: '规范性', A: 94 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="资产分布结构" subtitle="DISTRIBUTION" className="flex-1">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={distributionData}
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={8}
                         dataKey="value"
                       >
                          {distributionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                 {distributionData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded" style={{backgroundColor: d.color}}></div>
                          <span className="text-slate-400">{d.name}</span>
                       </div>
                       <span className="font-mono text-slate-200">{d.value}%</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="安全合规状态" className="bg-green-950/10 border-green-800/30">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-green-500/20 rounded border border-green-500/40">
                    <ShieldCheck className="text-green-500" size={24} />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-green-400 uppercase">国标 GB/T 35273 生效</div>
                    <div className="text-[9px] text-slate-500 mt-1">所有托管数据均已执行AES-256链路加密</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
