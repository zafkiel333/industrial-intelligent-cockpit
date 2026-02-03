
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ProcurementGlobeScene } from '../../components/procurement_collab/ProcurementGlobeScene';
import { 
  Handshake, 
  Globe, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Clock, 
  Truck, 
  Database, 
  Scale, 
  Cpu,
  ChevronRight,
  UserPlus,
  ArrowRightLeft,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Link2,
  Activity,
  Maximize2,
  Package,
  PlusCircle,
  History,
  Send,
  Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- 模拟工程数据 ---
const COLLAB_MISSIONS = [
  { id: 'ORD-9221-A', title: '高压级联泵活塞组', priority: 'High', supplier: 'SKF Sweden', stage: '商务谈判', budget: '¥12.5w', progress: 65, status: 'In-Negotiation' },
  { id: 'ORD-8842-B', title: '西门子主控PLC板卡', priority: 'Critical', supplier: 'Siemens AG', stage: '技术核验', budget: '¥4.8w', progress: 35, status: 'Verification' },
  { id: 'ORD-1102-C', title: '进口耐磨衬板 (Batch 04)', priority: 'Normal', supplier: 'Metso Outotec', stage: '物流配送', budget: '¥22.0w', progress: 92, status: 'Shipping' },
];

const COLLAB_LOGS = [
  { time: '14:20', user: '采购经理', text: '针对交付期是否可缩短至14天？', type: 'user' },
  { time: '14:25', user: 'SKF 销售端', text: '若采用空运直达，可满足要求，但单价需上浮3%。', type: 'vendor' },
  { time: '14:30', user: 'AI 审计', text: '识别到运费波动，建议参考 Plan B 长期协议价。', type: 'ai' },
  { time: '14:42', user: '合规办', text: 'HS编码 8413.91.00 已自动匹配，税率执行正常。', type: 'system' },
];

const GEO_NODES: any[] = [
  { id: 'SUP-SWE', name: 'SKF Sweden', type: 'supplier', risk: 'low', position: [59.3, 18.0, 0] },
  { id: 'SUP-GER', name: 'Siemens Germany', type: 'supplier', risk: 'low', position: [51.1, 10.4, 0] },
  { id: 'PORT-SHA', name: 'Shanghai Port', type: 'port', risk: 'low', position: [31.2, 121.4, 0] },
  { id: 'SITE-MN', name: '鄂尔多斯矿区', type: 'warehouse', risk: 'med', position: [39.6, 109.8, 0] },
];

const SUPPLY_ROUTES: any[] = [
  { id: 'R1', from: 'SUP-SWE', to: 'PORT-SHA', status: 'active', progress: 0.6 },
  { id: 'R2', from: 'PORT-SHA', to: 'SITE-MN', status: 'active', progress: 0.3 },
];

const SUPPLIER_PERFORMANCE = [
  { subject: '质量交付', A: 92, fullMark: 100 },
  { subject: '价格弹性', A: 85, fullMark: 100 },
  { subject: '合规响应', A: 95, fullMark: 100 },
  { subject: '物流协同', A: 78, fullMark: 100 },
  { subject: '技术配合', A: 88, fullMark: 100 },
];

export const ProcurementCollabView: React.FC = () => {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(COLLAB_MISSIONS[0].id);

  const activeMission = useMemo(() => 
    COLLAB_MISSIONS.find(m => m.id === activeOrderId) || COLLAB_MISSIONS[0], 
  [activeOrderId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：全球协同指挥中心抬头 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border-2 border-indigo-400/50 relative group">
              <Handshake size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-indigo-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Unified Procurement Collaboration Platform
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 备件采购 <span className="text-indigo-500 italic">全球协同服务中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">活跃协同项目</div>
              <div className="text-2xl font-mono font-bold text-white">24 <span className="text-sm text-slate-600 font-normal">Active</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SLA 达成信心</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">96.8%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-sm font-bold transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2">
              <PlusCircle size={18} /> 发起全球比选
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：协同任务流 (The Mission Orbit) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><ArrowRightLeft size={14} className="text-indigo-500" /> 正在进行的协同单</span>
              <History size={14} className="cursor-pointer hover:text-white" />
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {COLLAB_MISSIONS.map(mission => (
                <div 
                  key={mission.id}
                  onClick={() => setActiveOrderId(mission.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeOrderId === mission.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{mission.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${mission.priority === 'Critical' ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-500'}
                    `}>{mission.priority}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{mission.title}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1 font-bold"><Database size={10} /> {mission.supplier}</div>
                    <span className="text-indigo-300">{mission.stage}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                     <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: `${mission.progress}%`}}></div>
                     </div>
                     <span className="text-[9px] font-mono text-slate-500">{mission.progress}%</span>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="市场价格指数预测" subtitle="MARKET_VOLATILITY" className="h-44 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: '1', val: 100 }, { name: '2', val: 120 }, { name: '3', val: 110 }, { name: '4', val: 140 },
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="val" fill="#6366f1" fillOpacity={0.1} stroke="#6366f1" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：全球物流与协同 3D 场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020306] border border-indigo-900/20 rounded-2xl overflow-hidden group shadow-[inset_0_0_100px_rgba(99,102,241,0.05)]">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Globe size={14} className="animate-spin-slow" />
                          Global Supply Chain Telemetry
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          全球供应 <span className="text-indigo-500 italic">协同脉动场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">正在配送节点</div>
                       <div className="text-3xl font-mono font-bold text-indigo-400 leading-none mt-1">05 <span className="text-sm font-normal text-slate-600 uppercase">Hubs</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Truck size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">在途状态 (Logistic)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">In-Transit / SGP HUB</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3 group cursor-pointer hover:border-indigo-500/30 transition-all">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Data Synchronization</div>
                          <div className="text-lg font-bold text-white font-mono leading-none tracking-tighter">100% SECURE</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                          <Maximize2 size={18} className="text-indigo-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ProcurementGlobeScene 
                    nodes={GEO_NODES} 
                    routes={SUPPLY_ROUTES} 
                    activeOrderId={activeOrderId}
                    onNodeClick={() => {}}
                    isSimulating={true}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：数字化磋商室 (Negotiation Terminal) */}
           <div className="h-48 bg-slate-900/60 border border-slate-800 rounded p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <MessageSquare size={14} /> 协同磋商实时终端 (Secure Chat)
                 </div>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-500 border border-slate-700">AES-256 加密</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-900/30 text-[10px] text-indigo-400 border border-indigo-700/50 flex items-center gap-1">
                       <Activity size={10} /> AI 审计在线
                    </span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                 {COLLAB_LOGS.map((log, i) => (
                    <div key={i} className={`flex gap-4 items-start animate-in slide-in-from-left-2 fade-in duration-500`}>
                       <div className={`text-[10px] font-mono shrink-0 w-12 text-slate-500`}>{log.time}</div>
                       <div className={`text-xs flex-1`}>
                          <span className={`font-bold mr-2 
                             ${log.type === 'ai' ? 'text-purple-400' : log.type === 'system' ? 'text-emerald-400' : 'text-slate-300'}`}>
                             [{log.user}]
                          </span>
                          <span className={`${log.type === 'ai' || log.type === 'system' ? 'text-slate-400 italic' : 'text-slate-200'}`}>
                             {log.text}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="flex gap-2 mt-2 bg-slate-950 p-1 rounded border border-slate-800">
                 <input 
                   type="text" 
                   placeholder="输入协商指令或澄清意见..." 
                   className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-200 outline-none"
                 />
                 <button className="px-6 py-2 bg-indigo-600 text-white rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-indigo-500 transition-colors">
                    发送指令 <Send size={14} />
                 </button>
              </div>
           </div>
        </div>

        {/* 右翼：智能洞察与决策 (Strategic Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="供应商综合效能评估" subtitle="SUPPLIER_RADAR">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={SUPPLIER_PERFORMANCE}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Performance" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center px-4 mt-2">
                 <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">响应等级</div>
                    <div className="text-lg font-bold text-white">Tier 1</div>
                 </div>
                 <div className="h-8 w-[1px] bg-slate-800"></div>
                 <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">信誉分</div>
                    <div className="text-lg font-bold text-emerald-400">98.5</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 采购决策引擎" subtitle="STRATEGY_AI" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">智能偏差澄清</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “识别到 <span className="text-white font-bold">ORD-8842-B</span> 的技术附件 V2.1 与机组现有固件版本存在 <span className="text-amber-400 font-bold">0.5%</span> 的兼容性风险。已自动发起技术回执询价。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Scale size={60} className="text-indigo-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-emerald-500" /> 数字化审计核验链 (Blockchain)
                    </div>
                    {[
                      { label: '原产地证明哈希匹配', status: 'pass' },
                      { label: '材质报告证书核验', status: 'pass' },
                      { label: '商务合同电子签署', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-indigo-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'pass' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Fingerprint size={16} /> 下达数字化订单指令
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">历史询价记录库</div>
                    <div className="text-xs font-bold text-white">PROC_HISTORY_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}} />
    </div>
  );
};
