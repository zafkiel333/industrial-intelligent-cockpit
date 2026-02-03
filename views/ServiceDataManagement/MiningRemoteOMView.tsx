
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RemoteOMThreeScene } from '../../components/ServiceDataManagement/RemoteOM/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Wifi, ShieldCheck, Headphones, Zap, Database, 
  Terminal, Server, Globe, Lock, Cpu, Activity,
  CloudLightning, MessageSquare, UserPlus, ClipboardList, Share2
} from 'lucide-react';

export const MiningRemoteOMView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('site-a');

  const fleetStats = [
    { label: '在线无人集群', value: '42', color: 'text-cyan-400' },
    { label: '边缘计算负载', value: '68%', color: 'text-blue-400' },
    { label: '全域同步带宽', value: '12.4 Gbps', color: 'text-purple-400' },
    { label: '当前协同专家', value: '08', color: 'text-emerald-400' },
  ];

  const expertLogs = [
    { time: '14:20', node: '塔山101面', action: '远程介入诊断', expert: '张总工', status: '进行中' },
    { time: '14:15', node: '准格尔A区', action: '固件批量下发', expert: '系统自动', status: '已完成' },
    { time: '13:50', node: '红柳林202', action: '链路压力测试', expert: 'IT部李工', status: '已校验' },
    { time: '昨天', node: '黑山矿区', action: '决策模型归档', expert: 'AI引擎', status: '已存档' },
  ];

  const latencyData = [
    { t: '10:00', val: 12 }, { t: '11:00', val: 15 }, { t: '12:00', val: 45 },
    { t: '13:00', val: 18 }, { t: '14:00', val: 14 }, { t: '15:00', val: 16 }
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#010409] p-2 overflow-hidden select-none">
      
      {/* 顶部：远程运维指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/40 border border-cyan-500/20 rounded-2xl shadow-[inset_0_0_30px_rgba(14,165,233,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/40 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.2)]">
              <Headphones className="text-cyan-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山无人化装备远程运维服务管理系统</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-cyan-500/80"><Globe size={10} /> 全球站点: 12 | 活跃会话: 05</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 存储引擎: 分布式冷热对冲</span>
                 <span>|</span>
                 <span className="text-blue-400 font-bold uppercase">Archive: SECURE_OM_LEDGER</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {fleetStats.map((s, i) => (
             <div key={i} className="px-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col items-end min-w-[120px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold">{s.label}</span>
                <span className={`text-lg font-mono font-black ${s.color}`}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：专家介入与服务日志 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="专家远程协同总线" subtitle="EXPERT COLLAB" className="flex-1">
              <div className="space-y-4">
                 <button className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 rounded-xl text-xs font-black text-cyan-100 flex items-center justify-center gap-3 transition-all group">
                    <UserPlus size={16} className="group-hover:scale-125 transition-transform" /> 发起紧急远程会诊
                 </button>
                 
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1 flex justify-between items-center">
                    <span>近期管理活动日志</span>
                    <Activity size={10} />
                 </div>

                 <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[380px]">
                    {expertLogs.map((log, i) => (
                       <div key={i} className="group p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-all cursor-default">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-mono text-cyan-500">[{log.time}]</span>
                             <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                               log.status === '进行中' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'
                             }`}>{log.status}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200 mb-1">{log.node} - {log.action}</div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                             <span className="flex items-center gap-1"><Terminal size={10}/> 介入主体: {log.expert}</span>
                             <button className="text-cyan-500 hover:text-white transition-colors">溯源包</button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="边缘计算资源审计" subtitle="EDGE STATS">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Cpu size={24} className="text-blue-400" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px]">
                       <span className="text-slate-500 uppercase font-bold">推理节点负载</span>
                       <span className="text-blue-400 font-mono">68%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[68%] shadow-[0_0_8px_#3b82f6]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全域数据拓扑主屏 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#020617] border border-cyan-500/10 rounded-3xl relative overflow-hidden group">
              {/* 背景装饰网格 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 节点详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/40 animate-pulse">
                          <CloudLightning className="text-cyan-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅站点数据流 (Live Link)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{selectedNode === 'site-a' ? '山西塔山指挥站' : '远程连接节点'}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">上行服务带宽</div>
                          <div className="text-lg font-mono text-white tracking-tight">850.2 <span className="text-[10px] text-slate-600">Mbps</span></div>
                       </div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">端到端时延</div>
                          <div className="text-lg font-mono text-emerald-400 tracking-tight">15.4 <span className="text-[10px] text-slate-600">ms</span></div>
                       </div>
                       <div className="col-span-2 mt-2 pt-2 border-t border-white/10">
                          <div className="text-[9px] text-slate-500 uppercase">数据校验指纹 (SHA-256)</div>
                          <div className="text-[8px] font-mono text-cyan-700 truncate">9a2b5c7d8e1f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0...</div>
                       </div>
                    </div>
                 </div>
              </div>

              <RemoteOMThreeScene activeNodeId={selectedNode} onNodeSelect={setSelectedNode} />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-6 py-2 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                       <span className="text-[9px] text-slate-300 uppercase">稳定链路</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                       <span className="text-[9px] text-slate-300 uppercase">延迟警告</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                       <span className="text-[9px] text-slate-300 uppercase">备用链路</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* 链路质量分析图 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                    <Zap size={14} className="animate-pulse" /> 实时链路时延波动 (Telemetry)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">CHANNEL: 5G-UWB_ENCRYPTED</div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={latencyData}>
                       <defs>
                          <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="t" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 60]} />
                       <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#colorLat)" strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：安全审计与服务权重 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="数据完整性保障雷达" subtitle="INTEGRITY" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '远程指令审计', A: 100 }, { subject: '同步实时性', A: 85 }, { subject: '数据脱敏度', A: 95 }, { subject: '边缘容错率', A: 80 }, { subject: '存储一致性', A: 92 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                 <ShieldCheck className="text-emerald-500" size={18} />
                 <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase leading-none">服务数据已执行哈希上链</div>
                    <div className="text-[9px] text-slate-500 mt-1">记录 ID: TXN_88029_OM_SYNC</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="专家远程工具箱" subtitle="TOOLS">
              <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                    <Share2 className="text-cyan-400" size={20} />
                    <span className="text-[9px] uppercase font-bold text-slate-400">数据流共享</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                    <MessageSquare className="text-blue-400" size={20} />
                    <span className="text-[9px] uppercase font-bold text-slate-400">专家私聊频道</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                    <Lock className="text-emerald-400" size={20} />
                    <span className="text-[9px] uppercase font-bold text-slate-400">权限下放</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                    <ClipboardList className="text-purple-400" size={20} />
                    <span className="text-[9px] uppercase font-bold text-slate-400">一键归档</span>
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
