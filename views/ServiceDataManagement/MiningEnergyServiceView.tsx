
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { EnergyThreeScene } from '../../components/ServiceDataManagement/Energy/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  LineChart, Line
} from 'recharts';
import { 
  Zap, Database, TrendingUp, ShieldCheck, Layers, 
  Activity, Gauge, Workflow, Box, Clock, 
  Leaf, Thermometer, Battery, Terminal, Search,
  RefreshCw, BarChart3, CloudLightning
} from 'lucide-react';

export const MiningEnergyServiceView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('en-1');
  const [intensity, setIntensity] = useState(1.2);

  const energyStats = [
    { label: '瞬时全矿负荷', value: '42.5 MW', color: 'text-purple-400' },
    { label: '综合用能成本', value: '0.42 ￥/t', color: 'text-blue-400' },
    { label: '碳排放强度', value: '24.2 kg/t', color: 'text-emerald-400' },
    { label: '服务能效转化率', value: '92.4 %', color: 'text-amber-400' },
  ];

  const nodeDetails: Record<string, any> = {
    'en-1': { name: '采掘服务域', consumption: '12,450 kWh', yield: '4.2 t/kWh', risk: 'NORMAL' },
    'en-2': { name: '提升运输域', consumption: '8,900 kWh', yield: '12 m/kWh', risk: 'HIGH' },
    'en-3': { name: '通风排水域', consumption: '5,200 kWh', yield: '85 m³/kWh', risk: 'NORMAL' },
    'en-4': { name: '洗选加工域', consumption: '15,600 kWh', yield: '0.8 t/kWh', risk: 'MID' },
  };

  const loadHistory = [
    { t: '08:00', load: 35, yield: 92 },
    { t: '10:00', load: 42, yield: 88 },
    { t: '12:00', load: 38, yield: 95 },
    { t: '14:00', load: 45, yield: 90 },
    { t: '16:00', load: 40, yield: 93 },
  ];

  const energyComposition = [
    { name: '电力', value: 75, fill: '#a855f7' },
    { name: '燃油', value: 15, fill: '#3b82f6' },
    { name: '余热回收', value: 10, fill: '#10b981' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#01040a] p-2 overflow-hidden select-none">
      
      {/* 顶部：能源治理指挥条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border border-purple-500/20 rounded-2xl shadow-[inset_0_0_40px_rgba(168,85,247,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Zap className="text-purple-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山能源消耗与设备服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-purple-500/80"><Layers size={10} /> 监测网格: G-700 | 计量单元: 242</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 数据模型: ISO-50001 深度兼容</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold tracking-normal uppercase">Energy Health: Optimized</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {energyStats.map((s, i) => (
             <div key={i} className="px-5 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[130px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{s.label}</span>
                <span className={`text-xl font-mono font-black ${s.color}`}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：能效审计与负荷分析 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="能源价值审计总线" subtitle="VALUATION" className="flex-1 overflow-hidden">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-300 uppercase">当前供电品质因子</span>
                       <span className="text-emerald-400 font-mono">0.992</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-600 w-[92%] shadow-[0_0_10px_#a855f7]"></div>
                    </div>
                 </div>

                 <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={loadHistory}>
                          <defs>
                             <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="t" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis hide />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                          <Area type="monotone" dataKey="load" stroke="#a855f7" fill="url(#colorLoad)" strokeWidth={2} />
                          <Area type="monotone" dataKey="yield" stroke="#10b981" fill="transparent" strokeWidth={1} strokeDasharray="3 3" />
                       </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between px-2 mt-2">
                       <div className="flex items-center gap-1 text-[8px] text-purple-400 uppercase font-bold">● 能源负荷强度</div>
                       <div className="flex items-center gap-1 text-[8px] text-emerald-400 uppercase font-bold">● 服务产出效率</div>
                    </div>
                 </div>

                 <div className="space-y-2 pt-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1">重点异常能效点</div>
                    {['#S-12 提升机空载损耗异常', '#G-04 通风机频率偏离'].map((err, i) => (
                       <div key={i} className="flex justify-between items-center bg-red-950/10 p-2 border border-red-900/20 rounded text-[9px]">
                          <span className="text-red-400">{err}</span>
                          <button className="text-white hover:underline">处理</button>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全矿能源消费构成" subtitle="COMPOSITION">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={energyComposition} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                          {energyComposition.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：能源流向与治理大屏 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#010409] border border-purple-500/10 rounded-3xl relative overflow-hidden group">
              {/* 能效 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/40 animate-pulse">
                          <CloudLightning className="text-purple-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅能效域 (Live Sector)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{nodeDetails[selectedNode]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/10">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">周期累积功耗</div>
                             <div className="text-lg font-mono text-white font-bold">{nodeDetails[selectedNode]?.consumption}</div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">单位能效服务量</div>
                             <div className="text-lg font-mono text-emerald-400 font-bold">{nodeDetails[selectedNode]?.yield}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <EnergyThreeScene activeNodeId={selectedNode} onNodeSelect={setSelectedNode} systemIntensity={intensity} />

              <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-500 uppercase font-bold">模拟负荷强度波动</div>
                 <input 
                    type="range" min="0.5" max="3" step="0.1" value={intensity} 
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-32 accent-purple-500 h-1 bg-slate-800 rounded-full" 
                 />
              </div>
           </div>

           {/* 能源治理实时日志流 */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    <Terminal size={14} className="animate-pulse" /> 能源与碳足迹治理总线 (Energy Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">PROTOCOL: SDM-EN-FLUX-X</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:20:01]</span>
                    <span className="text-purple-500 font-bold italic">AUDIT:</span>
                    <span>解析到 101 工作面采煤机单位能耗产出比环比上升 2.4%，评估为“高效区间”。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:22:45]</span>
                    <span className="text-blue-500 font-bold italic">SYNC:</span>
                    <span>山西塔山总降压站功率因数补偿成功，电网损耗数据回执已归档。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                    <span className="text-slate-600">[16:25:01]</span>
                    <span className="text-amber-500 font-bold italic">WARN:</span>
                    <span>检测到井下提升机回馈制动能量回收率低于 75%，已自动关联维保工单审计。</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors group opacity-60">
                    <span className="text-slate-600">[16:30:22]</span>
                    <span className="text-emerald-500 font-bold italic">CARBON:</span>
                    <span>今日累计减排量 42.8t 碳指标，已完成分布式哈希账本存证。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：碳中和指数与服务权重 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="碳中和与ESG治理雷达" subtitle="ESG MATRIX" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: '能效达标', A: 95 }, { subject: '碳足迹追溯', A: 100 }, { subject: '绿色电力比', A: 65 }, { subject: '余热利用率', A: 82 }, { subject: '维保关联度', A: 92 }
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Status" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl mt-2">
                 <div className="flex items-center gap-3">
                    <Leaf className="text-emerald-500" size={20} />
                    <div>
                       <div className="text-[10px] font-bold text-emerald-300 uppercase leading-none">低碳服务优先建议</div>
                       <div className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                          当前电价处于波峰期，建议系统自动下调洗选车间 #4 生产线服务强度，负荷向 22:00 以后漂移。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="能源存储资产管理" subtitle="STORAGE">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                       <Battery className="text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">储能站 A-01 水位</span>
                          <span className="text-blue-400 font-bold">85%</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: '85%'}}></div>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mt-4">
                    <button className="flex-1 py-1.5 bg-slate-800 hover:bg-purple-600/30 rounded border border-slate-700 text-[10px] font-bold transition-all">
                       峰谷套利审计
                    </button>
                    <button className="flex-1 py-1.5 bg-slate-800 hover:bg-purple-600/30 rounded border border-slate-700 text-[10px] font-bold transition-all">
                       充放电溯源
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="治理完整性证书" className="bg-purple-950/10 border-purple-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-purple-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">全链路能效确权完成</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">能耗服务数据包已完成数字签名并与生产实绩关联，符合国家二级能效审计。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
