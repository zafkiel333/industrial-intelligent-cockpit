
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CoordinationThreeScene } from '../../components/spare_parts_coordination/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-maintenance-planning]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-maintenance-planning';
import { ResourceNode, SupplyFlow } from '../../components/spare_parts_coordination/three-types';
import { 
  Timer, 
  Calendar, 
  Workflow, 
  Zap, 
  ShieldAlert, 
  Package, 
  Truck, 
  Settings2, 
  ChevronRight,
  TrendingUp,
  Activity,
  Network,
  Boxes,
  Compass,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  // Fix: Added missing FileText and Database imports from lucide-react to resolve errors at lines 288 and 296
  FileText,
  Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, ComposedChart, Line, Legend,
  // Fix: Added missing RadarChart components from recharts to resolve errors at lines 148, 155, 156, 157, 158
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// --- 模拟数据 ---
const MOCK_NODES: ResourceNode[] = [
  { id: 'WH-MAIN', type: 'warehouse', position: [-8, 0, -5], status: 'active', label: '中央总库' },
  { id: 'WH-TEMP', type: 'warehouse', position: [-2, 0, 5], status: 'loading', label: '检修前置场' },
  { id: 'UNIT-01', type: 'turbine', position: [6, 0, 0], status: 'critical', label: '#1机组检修位' },
];

const MOCK_FLOWS: SupplyFlow[] = [
  { fromId: 'WH-MAIN', toId: 'WH-TEMP', intensity: 0.8, color: '#0ea5e9' },
  { fromId: 'WH-TEMP', toId: 'UNIT-01', intensity: 0.9, color: '#10b981' },
];

const MAINTENANCE_TIMELINE = [
  { phase: '停机准备', date: '04-01', status: 'done', parts: 124 },
  { phase: '解体检查', date: '04-05', status: 'active', parts: 45 },
  { phase: '核心修复', date: '04-12', status: 'pending', parts: 12 },
  { phase: '回装调试', date: '04-20', status: 'pending', parts: 88 },
  { phase: '并网复产', date: '04-28', status: 'pending', parts: 0 },
];

const READINESS_DATA = [
  { category: '主轴轴承', ready: 100, risk: 0 },
  { category: '叶片密封', ready: 85, risk: 15 },
  { category: '液压控制', ready: 100, risk: 0 },
  { category: '励磁备件', ready: 60, risk: 40 },
  { category: '标准紧固', ready: 100, risk: 0 },
];

export const MaintenancePlanningView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：统筹指挥部抬头 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-white/20 relative group">
              <Network size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Integrated Maintenance Logistics Command
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 水电设备停机检修 <span className="text-cyan-500 italic">备件统筹指挥中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">距离下次大修</div>
              <div className="text-2xl font-mono font-bold text-orange-500">12 <span className="text-sm font-normal text-slate-600">DAYS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">物料配给状态</div>
              <div className="text-2xl font-mono font-bold text-green-400">94.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键路径阻塞</div>
              <div className="text-2xl font-mono font-bold text-red-500">01 <span className="text-sm font-normal text-slate-600">NODE</span></div>
           </div>
        </div>
      </div>

      {/* 主布局 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：检修战术序列 (Timeline & Tasks) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Clock size={14} className="text-cyan-500" /> 检修时序生命线</span>
              <button className="hover:text-cyan-400 transition-colors"><Settings2 size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 px-1 pb-4">
              {MAINTENANCE_TIMELINE.map((step, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer relative group
                    ${activeStep === idx 
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold uppercase ${step.status === 'active' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                       Phase 0{idx + 1}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                       {step.date}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 mb-3 group-hover:text-cyan-400 transition-colors">{step.phase}</div>
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1 text-slate-500">
                       <Boxes size={10} /> 需备件: <span className="text-white">{step.parts} 件</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase
                       ${step.status === 'done' ? 'bg-green-900/30 text-green-400' : step.status === 'active' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-slate-800 text-slate-500'}
                    `}>{step.status}</span>
                  </div>
                  {activeStep === idx && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="统筹效能雷达" subtitle="STRATEGY_RADAR" className="h-56 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                       { subject: '供应连续性', A: 92, fullMark: 100 },
                       { subject: '库存缓冲率', A: 85, fullMark: 100 },
                       { subject: '交付及时性', A: 78, fullMark: 100 },
                       { subject: '成本节约率', A: 95, fullMark: 100 },
                       { subject: '配套完整度', A: 88, fullMark: 100 },
                    ]}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Strategy" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 统筹态势场 (The Operations Hub) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-cyan-900/20 rounded overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Compass size={14} className="animate-spin-slow" />
                          Coordinate Matrix System: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          备件配给 <span className="text-cyan-500 italic">全息态势场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">全局物资流动指数</div>
                       <div className="text-3xl font-mono font-bold text-emerald-400 leading-none mt-1">H-0.92 <span className="text-sm font-normal text-slate-600">Stable</span></div>
                    </div>
                 </div>

                 {/* 底部详细信息条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Activity size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前检修窗口</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">2024 春季大修 - 机组 #1</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                          <Zap size={14}/> 启动资源重排 (Re-Calc)
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <CoordinationThreeScene 
                    nodes={MOCK_NODES} 
                    flows={MOCK_FLOWS} 
                    activePhase="disassembly"
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：备件备齐率 (Readiness Chart) */}
           <SciFiCard title="各分系统备件就绪度矩阵" subtitle="READINESS_AUDIT" className="h-60 border-indigo-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={READINESS_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="ready" name="已就绪" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
                       <Bar dataKey="risk" name="待补货/风险" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={20} />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：供应链与博弈分析 (Supply Chain & Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="智能统筹决策建议" subtitle="AI_ADVISORY" className="border-cyan-900/30 bg-cyan-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-red-950/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <ShieldAlert size={16} className="text-red-500 animate-pulse" />
                       <span className="text-xs font-bold text-red-200 uppercase tracking-widest">关键路径阻塞预警</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “检测到 <span className="text-white font-bold">主轴密封件</span> 的跨国物流在苏伊士运河出现 48h 延迟。建议将该工序后移 24h，并优先执行绕组绝缘测试。”
                    </p>
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500 opacity-50"></div>
                 </div>

                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-indigo-400" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">资源整合机遇</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “识别到 #2机组 仓库存在闲置 <span className="text-white font-bold">L-HM46 油液</span>，可直接调拨至 #1机组 前置场，减少外部采购周期 5 天。”
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="物流中转实时监控" subtitle="TRANSIT_HUB" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { item: '转轮平衡配重块', status: 'In-Transit', loc: '华东配送中心', eta: 'Tomorrow' },
                      { item: '导叶抗磨衬板', status: 'Loading', loc: '工厂生产线', eta: '3 Days' },
                      { item: '高压级密封包', status: 'Customs', loc: '上海港', eta: '5 Days' },
                    ].map((shipment, i) => (
                      <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{shipment.item}</span>
                            <Truck size={14} className="text-slate-500" />
                         </div>
                         <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono">
                            <span>{shipment.loc}</span>
                            <span className="text-cyan-400 font-bold">{shipment.eta}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                       <FileText size={14} /> 导出物资保障白皮书
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联检修计划系统</div>
                    <div className="text-xs font-bold text-white">Project_Spring_2024.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};
