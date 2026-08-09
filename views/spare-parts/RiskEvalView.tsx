
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RiskThreeScene } from '../../components/spare_parts_risk/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-risk-eval]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-risk-eval';
import { SupplyNode, LogisticsRoute } from '../../components/spare_parts_risk/three-types';
import { 
  Globe, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Anchor, 
  Truck, 
  Plane, 
  PackageSearch,
  Zap,
  Activity,
  MapPin,
  Siren,
  Gavel,
  History,
  Info,
  ChevronRight,
  ShieldCheck,
  Radar as RadarIcon,
  Factory,
  Search,
  RotateCw,
  CheckCircle2,
  FileText,
  CloudRain
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

const SUPPLY_NODES: SupplyNode[] = [
  { id: 'SUP-01', name: 'SKF (Sweden)', lat: 59.3, lon: 18.0, riskLevel: 'safe', type: 'supplier' },
  { id: 'SUP-02', name: 'Rexroth (Germany)', lat: 48.7, lon: 9.1, riskLevel: 'safe', type: 'supplier' },
  { id: 'SUP-03', name: 'Component Fab (Taiwan)', lat: 23.6, lon: 120.9, riskLevel: 'warning', type: 'supplier' }, // Geopolitical tension
  { id: 'SUP-04', name: 'Raw Material (Chile)', lat: -33.4, lon: -70.6, riskLevel: 'critical', type: 'supplier' }, // Strike
  { id: 'PORT-01', name: 'Shanghai Port', lat: 31.2, lon: 121.4, riskLevel: 'safe', type: 'port' },
  { id: 'PORT-02', name: 'Rotterdam Port', lat: 51.9, lon: 4.4, riskLevel: 'safe', type: 'port' },
  { id: 'PORT-03', name: 'Singapore Hub', lat: 1.3, lon: 103.8, riskLevel: 'safe', type: 'port' },
  { id: 'WH-LOCAL', name: 'Local Warehouse (China)', lat: 35.0, lon: 105.0, riskLevel: 'safe', type: 'warehouse' },
];

const SUPPLY_ROUTES: LogisticsRoute[] = [
  { id: 'R-01', from: 'SUP-01', to: 'PORT-02', status: 'active', load: 0.8 },
  { id: 'R-02', from: 'PORT-02', to: 'PORT-03', status: 'delayed', load: 0.9 }, // Red Sea issue
  { id: 'R-03', from: 'SUP-03', to: 'PORT-01', status: 'active', load: 0.6 },
  { id: 'R-04', from: 'SUP-04', to: 'PORT-03', status: 'blocked', load: 0 }, // Strike
  { id: 'R-05', from: 'PORT-03', to: 'PORT-01', status: 'active', load: 0.9 },
  { id: 'R-06', from: 'PORT-01', to: 'WH-LOCAL', status: 'active', load: 1.0 },
];

const RISK_ALERTS = [
  { id: 'ALT-01', type: 'Geopolitical', title: '红海航道受阻', impact: 'High', delay: '+14 Days', desc: '武装冲突导致航运公司绕行好望角。' },
  { id: 'ALT-02', type: 'Labor', title: '智利铜矿罢工', impact: 'Critical', delay: 'Indefinite', desc: '主要原料供应商停产，预计持续2周。' },
  { id: 'ALT-03', type: 'Weather', title: '台风"海葵"逼近', impact: 'Med', delay: '+2 Days', desc: '东南沿海港口可能封港。' },
];

const RISK_RADAR_DATA = [
  { subject: '地缘政治', A: 85, fullMark: 100 },
  { subject: '自然灾害', A: 40, fullMark: 100 },
  { subject: '财务健康', A: 20, fullMark: 100 },
  { subject: '产能瓶颈', A: 65, fullMark: 100 },
  { subject: '物流中断', A: 90, fullMark: 100 },
  { subject: '技术断供', A: 30, fullMark: 100 },
];

const LEAD_TIME_HISTORY = [
  { month: 'Oct', days: 25 }, { month: 'Nov', days: 28 },
  { month: 'Dec', days: 35 }, { month: 'Jan', days: 42 },
  { month: 'Feb', days: 45 }, { month: 'Mar', days: 58 },
];

const WATCHLIST = [
  { id: 'P-2230', name: '主轴承 (进口)', supplier: 'SKF', risk: 88, status: 'Critical' },
  { id: 'E-5510', name: 'IGBT模块', supplier: 'Infineon', risk: 45, status: 'Warning' },
  { id: 'H-9001', name: '伺服阀', supplier: 'Rexroth', risk: 62, status: 'Warning' },
];

export const RiskEvalView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [globeRotation, setGlobeRotation] = useState(true);

  const activeNode = useMemo(() => SUPPLY_NODES.find(n => n.id === selectedNodeId), [selectedNodeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：全球风险态势 */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-4 bg-gradient-to-r from-red-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-slate-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] border-2 border-red-400/50 relative group">
              <Globe size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-red-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-red-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Supply Chain Risk Monitor
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件供应 <span className="text-red-500 italic">全球风险评估</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">全球风险指数</div>
              <div className="text-2xl font-mono font-bold text-red-500">HIGH (82)</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">受阻物流节点</div>
              <div className="text-2xl font-mono font-bold text-amber-500">3 <span className="text-sm text-slate-600 font-normal">/ 18</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均延误</div>
              <div className="text-2xl font-mono font-bold text-white">+14 <span className="text-sm text-slate-600 font-normal">Days</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：风险预警流 (Alert Stream) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="全球突发风险事件" subtitle="LIVE_ALERTS" highlight className="border-red-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {RISK_ALERTS.map(alert => (
                    <div key={alert.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded group hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden">
                       {/* 红色闪烁边条 */}
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"></div>
                       
                       <div className="flex justify-between items-start mb-2 pl-2">
                          <div className="flex items-center gap-2">
                             {alert.type === 'Geopolitical' && <Globe size={12} className="text-red-400" />}
                             {alert.type === 'Labor' && <Factory size={12} className="text-amber-400" />}
                             {alert.type === 'Weather' && <CloudRain size={12} className="text-cyan-400" />}
                             <span className="text-xs font-bold text-white">{alert.title}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${alert.impact === 'Critical' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                             {alert.impact}
                          </span>
                       </div>
                       <p className="text-[10px] text-slate-400 pl-2 leading-relaxed">{alert.desc}</p>
                       <div className="mt-2 pl-2 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">预计延误: <span className="text-white font-mono">{alert.delay}</span></span>
                          <span className="text-red-500 font-mono">{alert.id}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="高危备件监控" subtitle="WATCHLIST">
              <div className="space-y-3">
                 {WATCHLIST.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{item.name}</div>
                          <div className="text-[9px] text-slate-500">{item.supplier}</div>
                       </div>
                       <div className="text-right">
                          <div className={`text-sm font-bold font-mono ${item.risk > 80 ? 'text-red-500' : 'text-amber-500'}`}>{item.risk}%</div>
                          <div className="text-[8px] text-slate-600 uppercase">Risk Score</div>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Search size={12} /> 添加监控对象
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 全球供应链地球 (The Globe) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#010205] border border-red-900/20 rounded-lg overflow-hidden group">
              {/* 背景星空/网格 */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
              
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-red-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          SUPPLY NETWORK TOPOLOGY
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Planetary <span className="text-red-500">Logistics</span> View
                       </div>
                    </div>
                    {activeNode ? (
                       <div className="bg-slate-900/90 border border-slate-700 p-3 rounded backdrop-blur-md pointer-events-auto animate-in slide-in-from-right-4">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Selected Node</div>
                          <div className="text-lg font-bold text-white">{activeNode.name}</div>
                          <div className="text-xs text-slate-400 font-mono mb-2">LAT: {activeNode.lat}, LON: {activeNode.lon}</div>
                          <div className={`text-xs px-2 py-1 rounded inline-block font-bold uppercase
                             ${activeNode.riskLevel === 'critical' ? 'bg-red-500 text-black' : activeNode.riskLevel === 'warning' ? 'bg-amber-500 text-black' : 'bg-green-500 text-black'}
                          `}>{activeNode.riskLevel} Status</div>
                       </div>
                    ) : (
                       <div className="bg-black/40 border border-slate-800 p-2 rounded text-[10px] text-slate-500">
                          Click nodes for details
                       </div>
                    )}
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-green-500"></div> Safe
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Critical
                        </div>
                    </div>
                    <button 
                      onClick={() => setGlobeRotation(!globeRotation)}
                      className="pointer-events-auto p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-slate-300"
                    >
                       {globeRotation ? <Activity size={16} /> : <RotateCw size={16} />}
                    </button>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0 cursor-move">
                 <RiskThreeScene 
                    nodes={SUPPLY_NODES} 
                    routes={SUPPLY_ROUTES} 
                    selectedRegion={null}
                    onNodeSelect={setSelectedNodeId}
                    globeRotation={globeRotation}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>
           </div>

           {/* 底部：交付周期趋势 */}
           <SciFiCard title="平均交付周期 (Lead Time Trend)" subtitle="LATENCY" className="h-56 border-red-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={LEAD_TIME_HISTORY}>
                       <defs>
                          <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 70]} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <ReferenceLine y={30} stroke="#10b981" strokeDasharray="5 5" label={{value: 'Target', fill:'#10b981', fontSize:10}} />
                       <Area type="monotone" dataKey="days" stroke="#ef4444" strokeWidth={2} fill="url(#colorLead)" name="Lead Time" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：多维评估与应对 (Response) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="风险维度雷达" subtitle="VULNERABILITY">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR_DATA}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk Score" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-red-400 mt-1 font-bold bg-red-950/20 p-1 rounded">
                 主要威胁：地缘政治与物流中断
              </div>
           </SciFiCard>

           <SciFiCard title="AI 应对策略建议" subtitle="STRATEGY_ENGINE" className="flex-1 border-red-900/30 bg-red-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-red-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">断供熔断机制</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “针对 <span className="text-white font-bold">SUP-04</span> 罢工事件，建议立即启动 <span className="text-amber-400 font-bold">Plan B</span>：启用二级供应商库存（溢价15%），并增加国产化替代件验证测试。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Zap size={12} className="text-amber-500" /> 缓解措施执行 (Mitigation)
                    </div>
                    {[
                      { label: '锁定现货库存 (Lock Stock)', status: 'done', eff: 'High' },
                      { label: '物流改道空运 (Air Freight)', status: 'pending', eff: 'High' },
                      { label: '调整大修计划 (Reschedule)', status: 'review', eff: 'Med' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className="text-[11px] text-slate-300">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : 
                          step.status === 'pending' ? <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> :
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-red-700 to-orange-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Siren size={16} /> 启动应急采购预案
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出风险评估报告</div>
                    <div className="text-xs font-bold text-white">RISK_REPORT_Q2.pdf</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
