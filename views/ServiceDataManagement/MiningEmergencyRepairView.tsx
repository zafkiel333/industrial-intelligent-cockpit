
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { EmergencyRepairThreeScene } from '../../components/ServiceDataManagement/EmergencyRepair/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  AlertCircle, ShieldAlert, Zap, Clock, UserCheck, 
  Package, TrendingDown, ClipboardList, Activity, 
  Search, ShieldCheck, PhoneCall, Truck, MapPin
} from 'lucide-react';

export const MiningEmergencyRepairView: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<string>('F-001');

  // 管理中心KPI
  const stats = [
    { label: '待处理故障', value: '03', color: 'text-red-500', icon: ShieldAlert },
    { label: '平均修复时长 (MTTR)', value: '1.4h', color: 'text-orange-400', icon: Clock },
    { label: '抢修响应时效', value: '15min', color: 'text-cyan-400', icon: Zap },
    { label: '备件在库率', value: '94.2%', color: 'text-green-400', icon: Package },
  ];

  const activeRepairs = [
    { id: 'T-8091', asset: '采煤机摇臂', severity: 'L3', engineer: '张工', stage: '故障诊断中' },
    { id: 'T-8088', asset: '2#皮带机', severity: 'L2', engineer: '李工', stage: '备件配发中' },
    { id: 'T-8085', asset: '提升机制动', severity: 'L1', engineer: '王工', stage: '方案复核中' },
  ];

  const downtimeTrend = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 4.2 }, { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 3.5 }, { day: 'Fri', hours: 0.8 }, { day: 'Sat', hours: 2.1 }, { day: 'Sun', hours: 1.2 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020408] p-2 overflow-hidden select-none">
      
      {/* 顶部：应急指挥中心标题与统计 */}
      <div className="flex items-center justify-between px-6 py-5 bg-red-950/10 border border-red-500/20 rounded-2xl shadow-[inset_0_1px_30px_rgba(239,68,68,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-red-600/20 border border-red-500/40 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="text-red-500" size={36} />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">矿山大型装备故障停机与抢修指挥中心</h1>
              <div className="flex items-center gap-6 mt-1 text-[11px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Activity size={12} className="text-red-500" /> 运行警戒: 特别警戒级</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /> 调度中心: 华北 A-04 战区</span>
                 <span>|</span>
                 <span className="text-red-400">SESSION: EMERGENCY_READY</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {stats.map((s, i) => (
             <div key={i} className="px-5 py-2 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-end min-w-[140px]">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                   <s.icon size={10} /> {s.label}
                </span>
                <span className={`text-2xl font-mono font-black ${s.color}`}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：抢修工单流与任务分发 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="实时抢修任务管线" subtitle="ACTIVE TICKETS" className="flex-1 bg-red-950/5">
              <div className="space-y-4">
                 {activeRepairs.map((item, idx) => (
                   <div key={idx} className="group relative bg-slate-900/40 border border-slate-800 p-3 rounded-xl hover:border-red-500/50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-red-400 font-bold">{item.id}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          item.severity === 'L3' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.severity} 级告警
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-2">{item.asset} - {item.stage}</div>
                      <div className="flex justify-between items-center text-[10px]">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] border border-slate-700">
                               {item.engineer[0]}
                            </div>
                            <span className="text-slate-400">派驻: {item.engineer}</span>
                         </div>
                         <button className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                            调度指令 <Activity size={10} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="本周停机时长统计" subtitle="DOWNTIME LOSS">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={downtimeTrend}>
                    <defs>
                       <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                    <Area type="monotone" dataKey="hours" stroke="#ef4444" fill="url(#colorHr)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                 <span className="text-[10px] text-slate-500 uppercase">累计直接经济损失预测: <span className="text-red-400 font-mono">¥ 245,000</span></span>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化抢修诊断视窗 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#0a0c10] border border-red-500/10 rounded-3xl relative overflow-hidden group">
              {/* 抢修实况 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-xl border border-red-500/30 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40 animate-pulse">
                          <Activity className="text-red-500" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在诊断故障点 (Selected Node)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{selectedIncident === 'F-001' ? '采煤机主传动链' : '输送机控制终端'}</div>
                       </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">已持续时间</div>
                          <div className="text-lg font-mono text-white tracking-tight">00:45:12</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">历史故障频次</div>
                          <div className="text-lg font-mono text-red-400 tracking-tight">4 次 / 季度</div>
                       </div>
                    </div>
                 </div>
              </div>

              <EmergencyRepairThreeScene activeIncidentId={selectedIncident} onIncidentSelect={setSelectedIncident} />

              <div className="absolute bottom-6 right-6 z-10">
                 <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center gap-3">
                    <PhoneCall size={16} /> 紧急联系维保专家 (Remote Assist)
                 </button>
              </div>
           </div>

           {/* 抢修全链路数据日志 */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3 text-[11px] font-bold text-red-400 uppercase tracking-widest">
                    <ClipboardList size={16} className="animate-pulse" /> 抢修服务数据全景日志 (Emergency Data Bus)
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">ENCRYPT_MODE: TRIPLE_DES</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-600">[14:52:01]</span>
                    <span className="text-red-500 font-bold">ALARM:</span>
                    <span>设备检测到电流畸变，系统自动下发强制停机服务指令并封锁数据。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-600">[14:52:15]</span>
                    <span className="text-cyan-500 font-bold">DISPATCH:</span>
                    <span>根据故障特征，AI 自动匹配推荐抢修方案库 #8821 并推送至张工。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-600">[14:55:30]</span>
                    <span className="text-orange-500 font-bold">INVENTORY:</span>
                    <span>检索到核心备件轴承库位 A-02 有效，已生成紧急领用出库单。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors opacity-60">
                    <span className="text-slate-600">[15:01:12]</span>
                    <span className="text-green-500 font-bold">SYNC:</span>
                    <span>抢修现场数据已通过 5G 模组实时同步至总部托管数据池。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：抢修效能与备件调度 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="抢修服务效能雷达" subtitle="EFFICIENCY INDEX">
              <div className="h-52 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '响应速度', A: 95 }, { subject: '诊断准确', A: 88 }, { subject: '备件时效', A: 82 }, { subject: '一次修愈率', A: 94 }, { subject: '安全规程', A: 100 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="备件紧急调度状态" subtitle="LOGISTICS" className="flex-1">
              <div className="space-y-4 mt-2">
                 <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-300">密封组件-V2</span>
                       <span className="text-[10px] text-green-400 font-mono">已抵达</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-full"></div>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-300">润滑泵核心总成</span>
                       <span className="text-[10px] text-orange-400 font-mono">运输中 (12km)</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500 w-[65%] shadow-[0_0_10px_#f97316]"></div>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex flex-col items-center">
                    <Truck className="text-red-500 mb-2 animate-bounce" size={24} />
                    <span className="text-[10px] text-slate-500 text-center px-4 leading-relaxed">紧急物流接入：顺丰特种运输中心。预计 24 分钟后抵达 1# 矿区。</span>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数据完整性保障" className="bg-green-950/10 border-green-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-green-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase">故障证据链已锁定</div>
                    <div className="text-[9px] text-slate-500 mt-1">所有抢修动作均已哈希上链，符合审计规范要求。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
