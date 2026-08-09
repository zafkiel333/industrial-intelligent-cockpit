
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, 
  Flame, 
  AlertOctagon, 
  Activity, 
  History, 
  Search, 
  Filter, 
  ChevronRight, 
  Fingerprint, 
  Target, 
  Zap, 
  Scale, 
  Eye, 
  FileWarning, 
  ClipboardCheck, 
  TrendingUp, 
  Stethoscope,
  Siren,
  ShieldCheck,
  Cpu,
  GitBranch,
  Skull,
  TriangleAlert,
  CheckCircle2,
  Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, ComposedChart, Line, Legend,
  PieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟事故与未遂数据 ---

const INCIDENT_LOG = [
  { id: 'INC-7724', type: 'Accident', title: '高压油泵异常起火', date: '2024-03-20', severity: 'Critical', status: 'Closed', area: '1号动力站' },
  { id: 'NEAR-9022', type: 'Near Miss', title: '吊装钢丝绳崩裂先兆', date: '2024-03-22', severity: 'High', status: 'Rectifying', area: '露天堆场' },
  { id: 'INC-5510', type: 'Accident', title: '控制系统短路烧毁', date: '2024-03-18', severity: 'Medium', status: 'Analyzing', area: '中控室内' },
  { id: 'NEAR-3122', type: 'Near Miss', title: '绝缘靴底部磨穿发现', date: '2024-03-25', severity: 'Low', status: 'Closed', area: '高压变电区' },
];

const RISK_TOPOLOGY = [
  { x: 20, y: 30, z: 80, name: '机械伤害', status: 'incident' },
  { x: 45, y: 70, z: 45, name: '触电风险', status: 'nearmiss' },
  { x: 70, y: 40, z: 90, name: '火灾事故', status: 'incident' },
  { x: 10, y: 80, z: 30, name: '高处坠落', status: 'nearmiss' },
  { x: 80, y: 20, z: 20, name: '物体打击', status: 'nearmiss' },
];

const CAUSE_ANALYSIS = [
  { name: '管理漏洞', value: 35, color: '#ef4444' },
  { name: '人为违规', value: 25, color: '#f59e0b' },
  { name: '设备老化', value: 20, color: '#a855f7' },
  { name: '环境突变', value: 10, color: '#0ea5e9' },
  { name: '其他', value: 10, color: '#64748b' },
];

const SAFETY_TREND = [
  { month: '01', incidents: 2, nearmiss: 12, health: 95 },
  { month: '02', incidents: 1, nearmiss: 18, health: 98 },
  { month: '03', incidents: 3, nearmiss: 15, health: 92 },
  { month: '04', incidents: 0, nearmiss: 22, health: 99 },
  { month: '05', incidents: 2, nearmiss: 25, health: 96 },
  { month: '06', incidents: 1, nearmiss: 30, health: 97 },
];

export const IncidentRecordView: React.FC = () => {
  const [activeIncidentId, setActiveIncidentId] = useState(INCIDENT_LOG[0].id);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：安全指挥与态势看板 */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-red-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-stone-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-400/50 relative group">
              <Siren size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-red-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-red-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Safety Incident Command & Control
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 安全事故与未遂 <span className="text-red-500 italic">全息分析系统</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           {/* 背景扫描红线 */}
           <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/20 animate-[scan_3s_ease-in-out_infinite]"></div>
           
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">连续安全工时</div>
              <div className="text-2xl font-mono font-bold text-green-400">1,424 <span className="text-xs text-slate-600 font-normal">D</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 relative z-10"></div>
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">未遂事件识别率</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">88.5 <span className="text-xs text-slate-600 font-normal">%</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 relative z-10"></div>
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">风险穿透指数</div>
              <div className="text-2xl font-mono font-bold text-red-400">Low</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：时序事件录 (Incident Chrono-Tape) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><History size={14} className="text-red-500" /> 近期事件流</span>
              <button className="hover:text-red-400 transition-colors"><Filter size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {INCIDENT_LOG.map(event => (
                <div 
                  key={event.id}
                  onClick={() => setActiveIncidentId(event.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeIncidentId === event.id 
                      ? 'bg-red-950/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-red-500 font-bold">{event.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${event.severity === 'Critical' ? 'bg-red-600 text-white' : 
                         event.severity === 'High' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}
                    `}>{event.severity}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{event.title}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1"><MapPin size={10} /> {event.area}</div>
                    <span className="font-mono">{event.date}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                     <span className={`text-[9px] font-bold px-1.5 rounded ${event.type === 'Accident' ? 'text-red-500 border border-red-900/50' : 'text-orange-400 border border-orange-900/50'}`}>
                        {event.type}
                     </span>
                     <span className="text-[9px] text-slate-600 italic">Status: {event.status}</span>
                  </div>
                  {activeIncidentId === event.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="安全合规实时审计" subtitle="AUDIT_TRAIL">
              <div className="space-y-3">
                 {[
                   { label: 'PPE 配戴率', val: 99.2, color: 'bg-green-500' },
                   { label: '违章行为发现率', val: 12.4, color: 'bg-red-500' },
                 ].map((item, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                          <span>{item.label}</span>
                          <span className="text-slate-200">{item.val}%</span>
                       </div>
                       <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：风险分布全息拓扑 (Anomaly Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-red-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景装饰与网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-red-500 font-mono text-xs mb-1">
                          <Eye size={14} className="animate-pulse" />
                          RISK SINGULARITY SCANNER v4.0
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          风险奇点 <span className="text-red-500 italic">多维分布场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-red-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">异常响应时耗 (Avg)</div>
                       <div className="text-3xl font-mono font-bold text-red-400 leading-none mt-1">12.4 <span className="text-sm font-normal text-slate-600">MIN</span></div>
                    </div>
                 </div>

                 {/* 核心可视化区：风险分布拓扑 */}
                 <div className="flex-1 w-full pointer-events-auto flex items-center justify-center relative">
                    <div className="w-full h-full max-h-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                             <XAxis type="number" dataKey="x" hide />
                             <YAxis type="number" dataKey="y" hide />
                             <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                             <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #ef4444', borderRadius: '4px', fontSize: '12px' }}
                             />
                             <Scatter name="Incidents" data={RISK_TOPOLOGY}>
                                {RISK_TOPOLOGY.map((entry, index) => (
                                   <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.status === 'incident' ? '#ef4444' : '#f59e0b'} 
                                      stroke={entry.status === 'incident' ? '#7f1d1d' : '#78350f'}
                                      className="animate-pulse"
                                      style={{ animationDuration: `${2 + index}s` }}
                                   />
                                ))}
                             </Scatter>
                          </ScatterChart>
                       </ResponsiveContainer>
                       {/* 浮动标签 */}
                       <div className="absolute inset-0 pointer-events-none">
                          {RISK_TOPOLOGY.map((node, i) => (
                             <div 
                                key={i} 
                                className="absolute text-[8px] font-bold text-slate-500 uppercase tracking-tighter"
                                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(15px, -15px)' }}
                             >
                                {node.name}
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 底部战略条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Skull size={20} className="text-red-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">严重事故频次</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">0.02 / 1k Hours</div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-3 backdrop-blur-sm">
                          <Activity size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">未遂事件转化率</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">14.2% Optimization</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/20">发起深度回溯</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">导出安全简报</button>
                    </div>
                 </div>
              </div>

              {/* 四角技术边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-500/40"></div>
           </div>

           {/* 底部：事故演化趋势图 */}
           <SciFiCard title="安全效能演化趋势" subtitle="SAFETY_EVOLUTION" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SAFETY_TREND}>
                       <defs>
                          <linearGradient id="colorHealthRecord" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" hide />
                       <YAxis yAxisId="right" orientation="right" hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area yAxisId="right" type="monotone" dataKey="health" fill="url(#colorHealthRecord)" stroke="#10b981" strokeWidth={2} name="系统安全值" />
                       <Bar yAxisId="left" dataKey="incidents" barSize={8} fill="#ef4444" radius={[2, 2, 0, 0]} name="事故数" />
                       <Line yAxisId="left" type="monotone" dataKey="nearmiss" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="未遂事件" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：根因解析与整改建议 (AI Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="根因构成解剖" subtitle="CAUSE_DECONSTRUCTION">
              <div className="h-44 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={CAUSE_ANALYSIS} 
                          cx="50%" cy="50%" 
                          innerRadius={40} 
                          outerRadius={55} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {CAUSE_ANALYSIS.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="pr-4 space-y-1.5 flex-1">
                    {CAUSE_ANALYSIS.slice(0, 4).map(item => (
                      <div key={item.name} className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="truncate">{item.name}</span>
                         <span className="text-slate-200 ml-auto">{item.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 专家风险预判" subtitle="AI_ADVISORY" className="flex-1 border-red-900/30 bg-red-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-red-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">纠偏决策建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “近期 <span className="text-red-400 font-bold">高压变电区</span> 的未遂事件（近场感应警报）频次上升 22%。分析显示多与‘非绝缘工具误带入’有关。建议立即强制更新作业票 JSA 校验环节，并对 3 号外协班组进行停工再教育。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <TriangleAlert size={12} className="text-amber-500" /> 整改闭环矩阵 (Execution)
                    </div>
                    {[
                      { label: '现场隔离区加固', status: 'done' },
                      { label: '1号机控制屏绝缘升级', status: 'pending' },
                      { label: '作业规程 V2.4 发布', status: 'doing' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className={`text-[11px] ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                         {step.status === 'done' ? <ShieldCheck size={12} className="text-green-500" /> : 
                          step.status === 'doing' ? <RotateCw size={12} className="text-cyan-500 animate-spin" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-4 py-3 bg-gradient-to-r from-red-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> 确认整改方案并签章
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">历史事故案卷库</div>
                    <div className="text-xs font-bold text-white">Safety_Archive_v2.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.6);
        }
        
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 辅助组件：地图大头针图标
const MapPin = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const PlusCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const RotateCw = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
  </svg>
);
