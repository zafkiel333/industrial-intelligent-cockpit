import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Globe, 
  Truck, 
  Users, 
  ShieldCheck, 
  Zap, 
  Clock, 
  BarChart3, 
  ArrowRightLeft, 
  MapPin, 
  Activity, 
  Cpu, 
  FileSearch,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Link2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';

// --- 模拟数据 ---
const ACTIVE_OUTSOURCING = [
  { id: 'OUT-772401', provider: '通用重工 (上海)', task: '#4 压缩机异地大修', stage: '物流中', progress: 45, risk: 'Low', cost: '¥42,000' },
  { id: 'OUT-772405', provider: '精工机电 (成都)', task: '精密主轴激光淬火', stage: '诊断中', progress: 15, risk: 'Med', cost: '¥18,500' },
  { id: 'OUT-772409', provider: '蓝海液压 (武汉)', task: '液压泵组密封升级', stage: '已完工', progress: 95, risk: 'Low', cost: '¥8,200' },
];

const SLA_RADAR = [
  { subject: '响应速度', A: 92, fullMark: 100 },
  { subject: '交付质量', A: 85, fullMark: 100 },
  { subject: '成本控制', A: 78, fullMark: 100 },
  { subject: '技术能力', A: 95, fullMark: 100 },
  { subject: '合规性', A: 100, fullMark: 100 },
];

const VENDOR_NETWORK = [
  { id: 'V1', name: '通用重工', x: 200, y: 120, status: 'active' },
  { id: 'V2', name: '精工机电', x: 600, y: 150, status: 'warning' },
  { id: 'V3', name: '蓝海液压', x: 400, y: 280, status: 'active' },
];

export const OutsourcingTrackerView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(ACTIVE_OUTSOURCING[0].id);
  const [pulseTime, setPulseTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPulseTime(p => p + 1), 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000">
      
      {/* 顶部：战略协同看板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '在途外协工单', value: '12', sub: '3项 跨省运输', icon: ArrowRightLeft, color: 'text-purple-400' },
          { label: '供应商在线率', value: '94.2%', sub: '13家 已就绪', icon: Users, color: 'text-cyan-400' },
          { label: 'SLA 合规指数', value: '98.5', sub: '同比 +0.4%', icon: ShieldCheck, color: 'text-emerald-400' },
          { label: '外协支出占比', value: '18.4%', sub: '预算内受控', icon: Zap, color: 'text-amber-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-5 rounded relative overflow-hidden group hover:border-purple-500/50 transition-all">
             <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <kpi.icon size={80} />
             </div>
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-sm bg-slate-800/50 ${kpi.color}`}>
                   <kpi.icon size={20} />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">{kpi.label}</div>
                   <div className="text-2xl font-bold font-mono leading-none my-1">{kpi.value}</div>
                   <div className="text-[10px] text-slate-500">{kpi.sub}</div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：外协协作序列 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Activity size={14} className="text-purple-500" /> 实时协作流</span>
              <span>Sorted by Priority</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {ACTIVE_OUTSOURCING.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${selectedId === order.id 
                      ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">{order.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${order.risk === 'Low' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}
                    `}>Risk: {order.risk}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">{order.task}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">供</div>
                    <span className="text-xs text-slate-300">{order.provider}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                       <span>当前阶段: {order.stage}</span>
                       <span>{order.progress}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ${order.progress > 90 ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                        style={{ width: `${order.progress}%` }}
                       ></div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/50 pt-3">
                     <span className="font-mono">{order.cost}</span>
                     <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">追踪详情 <ChevronRight size={10}/></button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* 中间：SVG 全球服务拓扑图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#030712] border border-slate-800/50 rounded-sm overflow-hidden flex flex-col">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1">
                          <Globe size={14} className="animate-spin-slow" />
                          SYNERGY NETWORK: LIVE
                       </div>
                       <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">
                          Star-Link <span className="text-purple-500">Topology</span>
                       </h3>
                    </div>
                    <div className="text-right bg-black/40 border border-slate-800 p-2 rounded backdrop-blur-sm">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest">Network Latency</div>
                       <div className="text-xs font-mono font-bold text-cyan-400">14 ms / 0.001% PL</div>
                    </div>
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="max-w-[180px] space-y-2">
                       <div className="text-[10px] text-slate-600 leading-tight uppercase font-bold">
                          实时路径分析显示，当前 12 个外协节点的平均协作效率为 88.4%，处于安全阈值。
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 rounded text-[10px] text-purple-300 font-bold uppercase">实时追踪模式</div>
                       <div className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-500 font-bold uppercase">全景视图</div>
                    </div>
                 </div>
              </div>

              {/* 核心拓扑图 (SVG) */}
              <div className="flex-1 relative flex items-center justify-center">
                 <svg className="w-full h-full max-h-[500px]" viewBox="0 0 800 400">
                    <defs>
                       <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                       </radialGradient>
                       <filter id="neonGlow">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                       </filter>
                    </defs>

                    {/* 中心总部节点 */}
                    <circle cx="400" cy="200" r="60" fill="url(#hubGlow)" />
                    <rect x="375" y="175" width="50" height="50" fill="none" stroke="#a855f7" strokeWidth="2" transform="rotate(45 400 200)" filter="url(#neonGlow)" />
                    <text x="400" y="200" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="12" fontWeight="bold">HQ</text>

                    {/* 连线与动画 */}
                    {VENDOR_NETWORK.map(v => {
                      const dashOffset = -pulseTime % 100;
                      return (
                        <g key={v.id}>
                           <path 
                             d={`M 400 200 Q ${(400+v.x)/2} ${(200+v.y)/2 - 40} ${v.x} ${v.y}`} 
                             fill="none" 
                             stroke="#334155" 
                             strokeWidth="1.5" 
                             strokeDasharray="10 5" 
                           />
                           <path 
                             d={`M 400 200 Q ${(400+v.x)/2} ${(200+v.y)/2 - 40} ${v.x} ${v.y}`} 
                             fill="none" 
                             stroke="#a855f7" 
                             strokeWidth="2" 
                             strokeDasharray="20 80" 
                             strokeDashoffset={dashOffset}
                             filter="url(#neonGlow)"
                           />
                           
                           {/* 供应商节点 */}
                           <g transform={`translate(${v.x}, ${v.y})`}>
                              <circle r="20" fill="#0f172a" stroke={v.status === 'warning' ? '#f59e0b' : '#3b82f6'} strokeWidth="2" />
                              <circle r="4" fill={v.status === 'warning' ? '#f59e0b' : '#3b82f6'} className="animate-pulse" />
                              <text y="35" textAnchor="middle" fill="#94a3b8" fontSize="10">{v.name}</text>
                           </g>
                        </g>
                      );
                    })}
                 </svg>
              </div>
              
              {/* 背景装饰背景线 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
           </div>

           {/* 底部：协同工单审计链 */}
           <SciFiCard title="协作数字化审计链 (Blockchain-style Audit)" subtitle="AUDIT TRAIL" className="h-44 border-emerald-900/30">
              <div className="flex items-center justify-between h-full px-4 relative">
                 {/* 装饰中线 */}
                 <div className="absolute left-10 right-10 top-1/2 h-[1px] bg-slate-800"></div>
                 
                 {[
                   { label: '委外申请', date: '03-20 10:00', icon: FileSearch, done: true },
                   { label: '发货离厂', date: '03-21 14:30', icon: Truck, done: true },
                   { label: '异地接收', date: '03-22 09:15', icon: MapPin, done: true },
                   { label: '开箱诊断', date: '03-22 16:40', icon: Cpu, done: true },
                   { label: '方案核准', date: '进行中', icon: ShieldCheck, done: false },
                 ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 relative z-10 group">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                          ${step.done ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}
                          group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor]
                       `}>
                          <step.icon size={20} />
                       </div>
                       <div className="text-center">
                          <div className={`text-xs font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</div>
                          <div className="text-[9px] font-mono text-slate-600 uppercase">{step.date}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：深度效能分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="供应商综合效能评估" subtitle="SLA METRICS">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SLA_RADAR}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Performance" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-800 flex items-center gap-4">
                 <TrendingUp className="text-emerald-500" size={24} />
                 <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">本季度趋势</div>
                    <div className="text-sm font-bold text-white">质量表现提升 12.4%</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="外协支出趋势分析" subtitle="FINANCE" className="flex-1">
              <div className="h-full w-full min-h-[160px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: '01', value: 3400 }, { name: '02', value: 2800 },
                      { name: '03', value: 4500 }, { name: '04', value: 3900 },
                    ]}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="供应商风险雷达" subtitle="EXTERNAL RISK">
              <div className="space-y-3">
                 <div className="p-3 bg-red-900/10 border border-red-900/20 rounded flex items-start gap-3 relative overflow-hidden group">
                    <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-red-200">精工机电 - 响应预警</div>
                       <div className="text-[10px] text-slate-500 leading-normal mt-1">
                          检测到该供应商近期主轴修复单平均延期 <span className="text-red-400">14%</span>，建议备份备件库。
                       </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500 opacity-50"></div>
                 </div>
                 
                 <div className="p-3 bg-blue-900/10 border border-blue-900/20 rounded flex items-start gap-3 relative overflow-hidden">
                    <Link2 className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-blue-200">AR 远程协同就绪</div>
                       <div className="text-[10px] text-slate-500 leading-normal mt-1">
                          通用重工已连接 AR 远程终端，可随时进行异地开箱核验。
                       </div>
                    </div>
                    <button className="absolute right-2 bottom-2 text-blue-400 hover:text-blue-300"><ExternalLink size={12} /></button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>
    </div>
  );
};
