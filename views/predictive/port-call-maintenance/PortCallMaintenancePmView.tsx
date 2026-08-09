
import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/port-call-maintenance/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-77]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-77';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Anchor, Navigation, Calendar, Settings, 
  AlertTriangle, Wrench, Package, DollarSign,
  TrendingUp, Clock, Map as MapIcon, Globe,
  Briefcase, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 待处理预测性工单 (Pending Work Orders)
const WORK_ORDERS = [
    { id: 'WO-2401', item: '#3 缸喷油器更换', urgency: 85, type: 'Critical', spare: 'Available', timeEst: '4h' },
    { id: 'WO-2402', item: '增压器空气滤网清洗', urgency: 60, type: 'Routine', spare: 'N/A', timeEst: '2h' },
    { id: 'WO-2403', item: '艉轴密封环检查', urgency: 72, type: 'Major', spare: 'Ordering', timeEst: '12h' },
    { id: 'WO-2404', item: '辅机滑油分油机保养', urgency: 45, type: 'Routine', spare: 'Available', timeEst: '6h' },
];

// 2. 港口能力矩阵 (Port Capabilities)
const PORT_MATRIX = [
    { id: 'SIN', name: '新加坡 (Singapore)', tech: 95, spare: 98, cost: 85, slot: 'Available' },
    { id: 'RTM', name: '鹿特丹 (Rotterdam)', tech: 92, spare: 90, cost: 90, slot: 'Limited' },
    { id: 'SUEZ', name: '苏伊士 (Suez)', tech: 50, spare: 40, cost: 60, slot: 'Emergency' },
    { id: 'SHA', name: '上海 (Shanghai)', tech: 96, spare: 95, cost: 70, slot: 'Available' },
];

// 3. 风险累积与航程预测 (Risk vs Voyage)
const VOYAGE_RISK_DATA = Array.from({ length: 20 }, (_, i) => {
    const progress = i * 5; // %
    const risk = 10 + Math.pow(i, 1.6) * 0.5 + Math.random() * 2;
    return {
        progress,
        risk: Math.min(100, risk),
        limit: 80,
        portCall: (i === 8 || i === 16) ? 100 : 0 // Potential stops
    };
});

// 4. 决策成本效益分析
const DECISION_DATA = [
    { name: '立即靠港 (SIN)', cost: 12000, riskRed: 90, downtime: 12 },
    { name: '推迟靠港 (RTM)', cost: 5000, riskRed: 40, downtime: 0 },
    { name: '海上应急维修', cost: 25000, riskRed: 60, downtime: 24 },
];

export const PortCallMaintenancePmView: React.FC = () => {
    const [voyageProgress, setVoyageProgress] = useState(35); // %
    const [selectedPort, setSelectedPort] = useState('SIN');
    const [globalUrgency] = useState(72.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：战略决策指挥看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-indigo-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-indigo-600/20 rounded-sm border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Globe className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            预测驱动检修与靠港计划评估
                            <span className="text-xs not-italic font-bold bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 uppercase tracking-widest">Decision Support</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>航次: V-2406-EU | 目的港: ROTTERDAM</span>
                            <span>当前位置: 印度洋 (Indian Ocean)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合维护紧迫指数</div>
                        <div className="text-4xl font-mono font-bold text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            {globalUrgency}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">下个推荐窗口</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">SIN <span className="text-sm text-slate-500">(ETA: 42h)</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：预测工单池 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="预测性工单池 (Pending Tasks)" subtitle="AUTO-GENERATED" highlight className="bg-[#0c1221]">
                        <div className="space-y-3 py-2">
                            {WORK_ORDERS.map((order, i) => (
                                <div key={i} className="flex flex-col p-3 bg-slate-900/50 rounded border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${order.urgency > 80 ? 'bg-red-500 animate-pulse' : order.urgency > 60 ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                            <span className="text-xs font-bold text-slate-200 group-hover:text-white">{order.item}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">{order.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1"><Wrench size={10}/> {order.timeEst}</span>
                                        <span className="flex items-center gap-1"><Package size={10}/> {order.spare}</span>
                                        <span className={`font-bold ${order.urgency > 80 ? 'text-red-400' : 'text-slate-300'}`}>Urg: {order.urgency}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full ${order.urgency > 80 ? 'bg-red-600' : 'bg-blue-500'}`} style={{width: `${order.urgency}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    <SciFiCard title="备件库存与物流状态" subtitle="SUPPLY CHAIN">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs p-2 border-b border-slate-800">
                                <span className="text-slate-400">新加坡中心库</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Ready</span>
                            </div>
                            <div className="flex justify-between items-center text-xs p-2 border-b border-slate-800">
                                <span className="text-slate-400">鹿特丹中心库</span>
                                <span className="text-yellow-400 font-bold flex items-center gap-1"><Clock size={12}/> 3 Days</span>
                            </div>
                            <div className="flex justify-between items-center text-xs p-2">
                                <span className="text-slate-400">船上库存</span>
                                <span className="text-red-400 font-bold flex items-center gap-1"><XCircle size={12}/> Critical</span>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全球航线全息图 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 航线地球 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shadow-[0_0_10px_indigo]"></div>
                                <span className="text-[12px] text-indigo-400 font-black tracking-widest uppercase">全球航线健康风险映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前航速</span>
                                    <span className="text-white font-mono font-bold">14.2 kn</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">距离下一港 (SIN)</span>
                                    <span className="text-emerald-400 font-mono font-bold">680 nm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">风险累积速率</span>
                                    <span className="text-orange-400 font-mono font-bold">+1.2% / 100nm</span>
                                </div>
                            </div>
                        </div>

                        {/* 港口选择器 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {PORT_MATRIX.map(port => (
                                <button 
                                    key={port.id}
                                    onClick={() => setSelectedPort(port.id)}
                                    className={`px-4 py-2 text-[10px] font-bold border transition-all text-right
                                        ${selectedPort === port.id 
                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg translate-x-[-10px]' 
                                            : 'bg-black/60 border-slate-700 text-slate-400 hover:text-white'}
                                    `}
                                >
                                    {port.name}
                                </button>
                            ))}
                        </div>

                        <ThreeScene progress={voyageProgress / 100} riskAccumulation={globalUrgency / 100} selectedPort={selectedPort} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部时间轴滑块 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>航程推演 (Voyage Simulation)</span>
                                    <span className="text-cyan-400 font-mono">Progress: {voyageProgress.toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="1" 
                                    value={voyageProgress} 
                                    onChange={(e) => setVoyageProgress(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between text-[8px] text-slate-600 uppercase mt-1">
                                    <span>Shanghai</span>
                                    <span>Singapore</span>
                                    <span>Suez</span>
                                    <span>Rotterdam</span>
                                </div>
                             </div>
                        </div>
                        
                        {/* 装饰性网格 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(99,102,241,0.03)_50%)] bg-[length:100%_20px]"></div>
                    </div>

                    {/* 风险累积曲线 */}
                    <SciFiCard title="航程风险累积与靠港机会窗口" subtitle="RISK TRAJECTORY" className="h-[240px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={VOYAGE_RISK_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="progress" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '航程进度 (%)', position: 'insideBottom', offset: -5 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: '累积风险 (%)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} name="设备风险" />
                                    <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '不可接受风险', fill: '#f59e0b', fontSize: 10 }} />
                                    
                                    {/* Port Call Windows */}
                                    <Bar dataKey="portCall" barSize={20} fill="#0ea5e9" fillOpacity={0.2} name="靠港窗口" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：决策支持矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 港口能力评估 */}
                    <SciFiCard title="沿途港口技术保障能力评估" subtitle="PORT CAPABILITY">
                        <div className="flex flex-col gap-3 py-2">
                            {PORT_MATRIX.map((port, i) => (
                                <div key={i} className={`p-3 rounded border transition-all ${port.id === selectedPort ? 'bg-slate-800 border-indigo-500' : 'bg-slate-900/40 border-slate-800'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <Anchor size={14} className={port.id === selectedPort ? 'text-indigo-400' : 'text-slate-500'} />
                                            <span className="text-xs font-bold text-white">{port.name}</span>
                                        </div>
                                        <span className={`text-[9px] px-1.5 rounded ${port.slot === 'Available' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                            {port.slot}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400 text-center">
                                        <div className="bg-black/30 rounded p-1">
                                            <div>技术</div>
                                            <div className="text-white font-bold">{port.tech}</div>
                                        </div>
                                        <div className="bg-black/30 rounded p-1">
                                            <div>备件</div>
                                            <div className="text-white font-bold">{port.spare}</div>
                                        </div>
                                        <div className="bg-black/30 rounded p-1">
                                            <div>成本</div>
                                            <div className="text-white font-bold">{port.cost}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 成本效益博弈 */}
                    <SciFiCard title="决策成本效益博弈 (ROI)" subtitle="TRADE-OFF" className="flex-1">
                        <div className="h-48 w-full mt-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DECISION_DATA} layout="vertical" margin={{left: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{fill: '#94a3b8', fontSize: 9}} width={80} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="cost" name="预估成本 ($)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={10} />
                                    <Bar dataKey="riskRed" name="风险降低 (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} />
                                </BarChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-3 bg-emerald-900/10 border border-emerald-500/30 rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase size={14} className="text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-100">推荐方案</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                综合考虑航期延误与设备失效风险，系统推荐在 <span className="text-white font-bold">新加坡 (SIN)</span> 进行 12h 技术经停，集中处理高优工单。ROI 指数：<span className="text-emerald-400">4.8</span>。
                            </p>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">全球物流网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">航线优化计算: 完成</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Briefcase size={12} /> Strategic-Decision-Core v2.1 - Logistics Active
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};
