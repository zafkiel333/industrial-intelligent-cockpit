
import React, { useState, useEffect } from 'react';
import { HydroCompEvalThreeScene } from '../../../components/predictive/hydro-comp-eval/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-49]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-49';
import { UnitGlobalState } from '../../../components/predictive/hydro-comp-eval/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line, ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ShieldCheck, Activity, Zap, TrendingUp, 
  AlertTriangle, Timer, Coins, Target,
  Brain, Box, Workflow, Network, 
  BarChart3, FileText, ChevronRight, Share2,
  Settings, Cpu, Globe, Scale, CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

const MOCK_UNITS: UnitGlobalState[] = [
    { id: 'U1', name: '1号机组 (Unit 1)', health: 95, load: 85, efficiency: 94, status: 'normal', position: [-20, 0, 0] },
    { id: 'U2', name: '2号机组 (Unit 2)', health: 88, load: 72, efficiency: 91, status: 'normal', position: [-5, 0, 0] },
    { id: 'U3', name: '3号机组 (Unit 3)', health: 42, load: 55, efficiency: 82, status: 'critical', position: [10, 0, 0] },
    { id: 'U4', name: '4号机组 (Unit 4)', health: 76, load: 90, efficiency: 89, status: 'warning', position: [25, 0, 0] },
];

const GLOBAL_KPI_RADAR = [
    { subject: '结构健康', A: 92, fullMark: 100 },
    { subject: '机械状态', A: 85, fullMark: 100 },
    { subject: '电气绝缘', A: 95, fullMark: 100 },
    { subject: '水力稳定', A: 78, fullMark: 100 },
    { subject: '辅助系统', A: 88, fullMark: 100 },
];

const PERFORMANCE_EVOLUTION = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    reliability: 98 - Math.sin(i*0.2)*5,
    risk: 10 + i * 1.5 + (i > 18 ? 20 : 0)
}));

const PRIORITY_MATRIX = [
    { name: '3号机推力瓦更换', cost: 45, impact: 92, urgency: 85, type: 'Mechanical' },
    { name: '4号机油样净化', cost: 12, impact: 45, urgency: 60, type: 'Auxiliary' },
    { name: '2号机组负荷微调', cost: 5, impact: 30, urgency: 20, type: 'Operational' },
    { name: '1号机局放检查', cost: 15, impact: 75, urgency: 40, type: 'Electrical' },
];

const ECONOMIC_BENEFIT = [
  { name: '减少非计划停机', value: 345, fill: '#10b981' },
  { name: '延长大修间隔', value: 180, fill: '#0ea5e9' },
  { name: '备件库存优化', value: 95, fill: '#8b5cf6' },
];

export const HydroComprehensiveEvaluationView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('U3');
  const [globalEntropy, setGlobalEntropy] = useState(1.45);
  const [activeTab, setActiveTab] = useState<'kpi' | 'maintenance' | 'economy'>('kpi');

  const selectedUnit = MOCK_UNITS.find(u => u.id === selectedId) || MOCK_UNITS[0];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：战略指挥 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <Globe size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldCheck size={14} /> Total Asset Health & Strategic Evaluation
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    水电站预测性维护 <span className="text-cyan-400 font-extrabold">综合评估全景</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">全站实时健康评分</div>
                <div className="text-4xl font-mono font-bold text-green-400 flex items-center gap-2">
                    88.4 <span className="text-sm font-normal text-slate-500 border border-slate-800 px-1 rounded">A</span>
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">年度累计避免损失</div>
                <div className="text-3xl font-mono font-bold text-white">￥1,245 <span className="text-sm text-slate-500 font-normal">W</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">AI 综合审计状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    {/* Fixed: added missing CheckCircle2 import */}
                    <CheckCircle2 size={20} className="text-green-500" /> STABLE-LOGIC
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：资产列表与告警流 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 机组集群矩阵 */}
           <SciFiCard title="机组集群健康状态" subtitle="UNIT MATRIX" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {MOCK_UNITS.map(unit => (
                       <div 
                         key={unit.id}
                         onClick={() => setSelectedId(unit.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group overflow-hidden
                            ${selectedId === unit.id ? 'bg-cyan-950/40 border-cyan-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30'}
                         `}
                       >
                           {selectedId === unit.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                           <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                   <Zap size={14} className={unit.status === 'critical' ? 'text-red-500' : 'text-cyan-500'} />
                                   <span className="text-sm font-bold text-slate-100">{unit.name}</span>
                               </div>
                               <span className={`text-xs font-mono font-bold ${unit.health > 90 ? 'text-green-400' : unit.health > 60 ? 'text-yellow-400' : 'text-red-500'}`}>
                                   {unit.health}%
                               </span>
                           </div>
                           <div className="flex justify-between items-end">
                               <div className="text-[10px] text-slate-500 font-mono">LOAD: {unit.load}% | η: {unit.efficiency}%</div>
                               <div className={`w-2 h-2 rounded-full ${unit.status === 'normal' ? 'bg-green-500' : unit.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 实时告警推演流 */}
           <SciFiCard title="AI 实时风险诊断流" subtitle="EVENT STREAM" className="h-[320px] border-cyan-900/50">
               <div className="space-y-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { time: '10:45:12', msg: '3号机组上导摆度波动超限 (0.15mm)', type: 'critical' },
                       { time: '10:42:01', msg: '全站综合效率由于4号机调相运行下降1.2%', type: 'info' },
                       { time: '10:30:55', msg: '2号机定子局放趋势匹配"放电初期"指纹', type: 'warning' },
                       { time: '09:12:44', msg: '技术供水系统A侧滤水器压差正常回落', type: 'success' },
                   ].map((item, i) => (
                       <div key={i} className="flex gap-3 text-xs border-l border-slate-800 pl-3 relative group">
                           <div className={`absolute -left-1 top-1 w-2 h-2 rounded-full ${item.type === 'critical' ? 'bg-red-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                           <div>
                               <div className="text-slate-500 font-mono text-[10px]">{item.time}</div>
                               <div className={`mt-1 font-bold ${item.type === 'critical' ? 'text-red-400' : 'text-shadow-glow'}`}>{item.msg}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* 中间：全站 3D 数字孪生视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：全站能效场 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Station Digital Twin Engine
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">系统活跃熵</div>
                               <div className="text-2xl font-mono font-bold text-white">{globalEntropy.toFixed(3)}</div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">当前全站出力</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">1,240 <span className="text-xs">MW</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：快速操作 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                    <button className="bg-slate-900/80 p-3 rounded-full border border-slate-700 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all shadow-xl">
                        <Share2 size={18} />
                    </button>
                    <button className="bg-slate-900/80 p-3 rounded-full border border-slate-700 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all shadow-xl">
                        <Settings size={18} />
                    </button>
               </div>

               {/* 选中机组浮窗 */}
               {selectedId && (
                   <div className="absolute bottom-6 left-6 right-6 z-10 bg-black/60 backdrop-blur border border-slate-700 p-4 rounded-lg flex justify-between items-center animate-in slide-in-from-bottom-4 pointer-events-auto">
                        <div className="flex gap-8">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">Unit Identifier</div>
                                <div className="text-xl font-bold text-white">{selectedUnit.name}</div>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-800 my-auto"></div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">Current Reliability</div>
                                <div className="text-xl font-mono font-bold text-cyan-300">0.9984</div>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-800 my-auto"></div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">Active Risk Factor</div>
                                <div className="text-xl font-mono font-bold text-red-500">{selectedUnit.status === 'normal' ? 'LOW' : 'HIGH'}</div>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-sm transition-all flex items-center gap-2">
                            进入专题诊断 <ChevronRight size={16}/>
                        </button>
                   </div>
               )}

               <HydroCompEvalThreeScene 
                   units={MOCK_UNITS}
                   selectedUnitId={selectedId}
                   onUnitSelect={setSelectedId}
                   globalFlowIntensity={1.2}
                   showRiskZones={true}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 性能演化趋势 */}
           <SciFiCard title="全站可靠性与风险演化趋势" subtitle="30-DAY FORECAST" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PERFORMANCE_EVOLUTION}>
                           <defs>
                               <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                               <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={3} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                           <Area type="monotone" dataKey="reliability" stroke="#10b981" fill="url(#relGrad)" name="全站可靠性" />
                           <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" name="潜在风险熵" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：多维评估与智能决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 全局评估雷达 */}
           <SciFiCard title="全站性能多维画像" subtitle="KPI RADAR" className="h-[280px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       {/* Fixed: added missing RadarChart components to Recharts imports */}
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={GLOBAL_KPI_RADAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Station" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* 决策优先级矩阵 (Scatter) */}
           <SciFiCard title="维护建议优先级矩阵" subtitle="PRIORITY MATRIX" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 20, bottom: 20, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="cost" name="成本" unit="W" stroke="#64748b" tick={{fontSize: 9}} label={{value: '成本 CapEx', position: 'insideBottom', offset: -5, fontSize: 9}} />
                           <YAxis type="number" dataKey="impact" name="收益" stroke="#64748b" tick={{fontSize: 9}} label={{value: '效益 ROI', angle: -90, position: 'insideLeft', fontSize: 9}} />
                           <ZAxis type="number" dataKey="urgency" range={[50, 400]} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                           <Scatter name="Tasks" data={PRIORITY_MATRIX}>
                               {PRIORITY_MATRIX.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.urgency > 80 ? '#ef4444' : '#0ea5e9'} fillOpacity={0.6} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 text-[8px] text-slate-500 uppercase">Bubble Size = Urgency</div>
               </div>
           </SciFiCard>

           {/* 经济性增益看板 */}
           <SciFiCard title="预测维护经济增益" className="h-[220px] border-cyan-900/50 bg-[#1a1c2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ECONOMIC_BENEFIT} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 9, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000'}} />
                                <Bar dataKey="value" barSize={10} radius={[0, 4, 4, 0]}>
                                    {ECONOMIC_BENEFIT.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded flex items-center justify-between border border-slate-800">
                        <div className="text-[10px] text-slate-500">累计预测性维护回报率 (ROI)</div>
                        <div className="text-xl font-mono font-bold text-green-400">+124.5%</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰性状态条 */}
      <div className="h-6 flex gap-4 text-[10px] text-slate-600 font-mono overflow-hidden">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_MESH: 1,420 ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> MODEL_SYNC: 0.1s LATENCY</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> AI_CONFIDENCE: 98.2%</div>
          <div className="flex-1 text-right">SYSTEM_UPTIME: 99.999% | SECURITY_ENCRYPTION: AES-256-ACTIVE</div>
      </div>
    </div>
  );
};
