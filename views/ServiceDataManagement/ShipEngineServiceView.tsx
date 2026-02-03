
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipEngineThreeScene } from '../../components/ServiceDataManagement/ShipEngine/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  LineChart, Line, ComposedChart
} from 'recharts';
import { 
  Anchor, Activity, Zap, Database, Terminal, 
  Settings, ShieldCheck, Gauge, Thermometer,
  CloudLightning, Layers, History, ArrowRight,
  Filter, Search, HardDrive, Share2
} from 'lucide-react';

export const ShipEngineServiceView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('me-01');

  const engineStats = [
    { label: '累计运行总时', value: '12,450 h', color: 'text-blue-400' },
    { label: '平均燃油消耗', value: '168.2 g/kWh', color: 'text-emerald-400' },
    { label: '辅机负载平衡度', value: '98.5 %', color: 'text-cyan-400' },
    { label: '数据托管完整性', value: '99.9 %', color: 'text-purple-400' },
  ];

  const nodeInfo: Record<string, any> = {
    'me-01': { name: '主机 (MAN B&W 6S60ME)', fuel: 'Heavy Fuel Oil', load: '85%', service: '运行正常' },
    'ae-01': { name: '1# 辅机 (YanMar 6EY)', fuel: 'Diesel Oil', load: '42%', service: '例行巡检中' },
    'ae-02': { name: '2# 辅机 (YanMar 6EY)', fuel: 'Diesel Oil', load: '0%', service: '待备机状态' },
    'ctrl-01': { name: '动力控制系统', fuel: 'N/A', load: 'N/A', service: '数据一致性已校验' },
  };

  const thermalTrend = [
    { time: '04:00', temp: 380, load: 70 },
    { time: '08:00', temp: 410, load: 85 },
    { time: '12:00', temp: 395, load: 80 },
    { time: '16:00', temp: 420, load: 92 },
  ];

  const serviceHistory = [
    { time: '14:20:01', node: 'ME-01', action: '排温偏差自动审计', status: 'PASS', expert: '系统自动' },
    { time: '12:15:30', node: 'AE-01', action: '燃油喷嘴寿命回溯', status: 'SYNC', expert: '轮机部李工' },
    { time: '09:00:12', node: 'CTRL-01', action: '安全网关规则更新', status: 'SUCCESS', expert: '总部IT中心' },
    { time: '昨天', node: '全动力域', action: '季度能效报告固化', status: 'ARCHIVED', expert: 'AI治理引擎' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#01040a] p-2 overflow-hidden select-none">
      
      {/* 顶部：航运动力治理指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border border-blue-500/20 rounded-2xl shadow-[inset_0_0_30px_rgba(59,130,246,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Anchor className="text-blue-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">船舶主机与辅机系统运行服务数据管理指挥中心</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-blue-500/80"><Layers size={10} /> 管理网格: SHIP-DATA-G1 | 核心节点: 04</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 托管协议: MARITIME-SLM-X</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold uppercase tracking-normal underline underline-offset-4 decoration-emerald-500/30">Registry: SECURE_VAULT_ENABLED</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {engineStats.map((s, i) => (
             <div key={i} className="px-5 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[130px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{s.label}</span>
                <span className={`text-xl font-mono font-black ${s.color}`}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：热工与负载服务分析 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="热工循环服务审计" subtitle="THERMAL AUDIT" className="flex-1 overflow-hidden">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-300 uppercase italic">主机热效率因子</span>
                       <span className="text-emerald-400 font-mono font-bold">0.942</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 w-[94%] shadow-[0_0_10px_#2563eb]"></div>
                    </div>
                 </div>

                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={thermalTrend}>
                          <defs>
                             <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis yAxisId="left" hide />
                          <YAxis yAxisId="right" orientation="right" hide />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                          <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#colorTemp)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                       </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between px-2 mt-2">
                       <div className="flex items-center gap-1 text-[8px] text-blue-400 uppercase font-bold tracking-tighter italic">● 气缸平均排温波动</div>
                       <div className="flex items-center gap-1 text-[8px] text-amber-400 uppercase font-bold tracking-tighter italic">● 推进负载映射</div>
                    </div>
                 </div>

                 <div className="pt-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1 mb-3">关键部件健康权重 (AI)</div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 uppercase">活塞环</div>
                          <div className="text-sm font-mono text-emerald-400">92%</div>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 uppercase">燃油泵</div>
                          <div className="text-sm font-mono text-white">88%</div>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="辅机负载平衡矩阵" subtitle="AUX BALANCE">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: '1# 发电机', A: 45 }, { subject: '2# 发电机', A: 0 }, { subject: '轴带发电机', A: 85 }, { subject: '应急电站', A: 0 }, { subject: '岸电输入', A: 0 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Load" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全域动力数据全息拓扑 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#010409] border border-blue-500/10 rounded-3xl relative overflow-hidden group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 动力节点详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl min-w-[300px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/40 animate-pulse">
                          <CloudLightning className="text-blue-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅动力资产 (Live Node)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{nodeInfo[selectedNode]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/10">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">燃油类型映射</div>
                             <div className="text-xs font-mono text-blue-300 mt-1">{nodeInfo[selectedNode]?.fuel}</div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">当前负载水平</div>
                             <div className="text-lg font-mono text-emerald-400 font-bold">{nodeInfo[selectedNode]?.load}</div>
                          </div>
                       </div>
                       <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                          <div className="text-[9px] text-slate-500 uppercase">服务状态背书</div>
                          <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                             <ShieldCheck className="text-emerald-500" size={14} /> {nodeInfo[selectedNode]?.service}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <ShipEngineThreeScene activeNodeId={selectedNode} onNodeSelect={setSelectedNode} />

              <div className="absolute bottom-6 right-6 z-10">
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-3">
                    <Search size={16} /> 调取全生命周期服务档案 (Full History)
                 </button>
              </div>
           </div>

           {/* 动力域数据治理日志 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Terminal size={14} className="animate-pulse" /> 推进系统数据治理总线 (Propulsion Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono tracking-tighter">PROCESS_ID: SDM-SH-7702-OM</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {serviceHistory.map((log, i) => (
                    <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className="text-blue-500 font-bold w-12">{log.node}</span>
                       <span className="flex-1 text-slate-300 italic">“{log.action}”</span>
                       <span className="text-slate-500">主体: {log.expert}</span>
                       <span className={`font-bold ${log.status === 'PASS' || log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-blue-400'}`}>[{log.status}]</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：质量监控与合规存证 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="数据托管质量雷达" subtitle="TRUST SCORE" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '实时响应', A: 99 }, { subject: '数据脱敏', A: 100 }, { subject: '模型一致', A: 92 }, { subject: '审计溯源', A: 95 }, { subject: '权限管控', A: 100 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-blue-950/10 border border-blue-900/20 rounded-xl mt-2 flex items-center gap-4">
                 <ShieldCheck className="text-blue-500" size={24} />
                 <div>
                    <div className="text-[10px] font-bold text-blue-300 uppercase">托管合规性背书 (IMO Standard)</div>
                    <div className="text-[9px] text-slate-500 mt-1">
                       该动力域所有运行服务数据均通过区块链哈希校验，符合 IMO 2024 网络安全合规审计要求。
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数字化备件流转" subtitle="LOGISTICS">
              <div className="space-y-4 py-2">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                       <Settings className="text-amber-500" size={18} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">燃油喷嘴包 (Set of 6)</span>
                          <span className="text-amber-400 font-bold uppercase">In-Transit</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[65%] shadow-[0_0_8px_#f59e0b]"></div>
                       </div>
                       <div className="text-[8px] text-slate-600 mt-1 uppercase font-mono">Carrier: DHL-Maritime-Express</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="专家服务建议箱" className="bg-emerald-950/10 border-emerald-800/20">
              <div className="flex gap-4 items-center">
                 <Activity className="text-emerald-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight italic">AI-Core 自动建议</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                       基于辅机负载历史偏差数据，建议在下一港口停靠期间执行 2# 辅机调速器灵敏度重校。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
