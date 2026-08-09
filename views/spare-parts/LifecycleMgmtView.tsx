
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LifecycleThreeScene } from '../../components/spare_parts_lifecycle/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-lifecycle-mgmt]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-lifecycle-mgmt';
import { LifecycleStage } from '../../components/spare_parts_lifecycle/three-types';
import { 
  Dna, 
  History, 
  Database, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Recycle, 
  FileText, 
  MapPin, 
  Clock, 
  DollarSign,
  Box,
  Fingerprint,
  Link,
  ChevronRight,
  GitCommit,
  Leaf,
  Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, ComposedChart, Line, Legend
} from 'recharts';

// --- MOCK DATA ---
const ASSET_INFO = {
  id: 'PART-UUID-9221-X',
  name: '高压主轴承组件 (Main Bearing Assembly)',
  spec: 'SKF-22320-E1',
  serial: 'SN-20210512-004',
  batch: 'BATCH-SE-99',
  manufacturer: 'SKF Sweden',
  installDate: '2021-06-15',
  status: 'In-Service',
};

const LIFECYCLE_STAGES: LifecycleStage[] = [
  { id: 'design', label: '设计与选型 (Design)', status: 'completed', health: 100, timestamp: '2021-01-10' },
  { id: 'procure', label: '采购与制造 (Procure)', status: 'completed', health: 100, timestamp: '2021-03-22' },
  { id: 'logistics', label: '物流与入库 (Logistics)', status: 'completed', health: 99, timestamp: '2021-05-08' },
  { id: 'install', label: '安装调试 (Install)', status: 'completed', health: 98, timestamp: '2021-06-15' },
  { id: 'operation', label: '在役运行 (Operation)', status: 'active', health: 82, timestamp: 'Present' },
  { id: 'maintain', label: '维护保养 (Maintain)', status: 'pending', health: 85, timestamp: 'Planned' },
  { id: 'retire', label: '报废/再生 (End-of-Life)', status: 'pending', health: 0, timestamp: 'Est. 2028' },
];

const TCO_DATA = [
  { year: '2021', cost: 45000, value: 45000 },
  { year: '2022', cost: 48000, value: 42000 },
  { year: '2023', cost: 55000, value: 38000 },
  { year: '2024', cost: 62000, value: 35000 },
  { year: '2025', cost: 65000, value: 30000 }, // Forecast
];

const CARBON_FOOTPRINT = [
  { name: '制造', value: 45, color: '#64748b' },
  { name: '运输', value: 15, color: '#94a3b8' },
  { name: '运行', value: 30, color: '#f59e0b' },
  { name: '处置', value: 10, color: '#10b981' },
];

const BLOCKCHAIN_LOG = [
  { hash: '0x9a...e1', event: '出厂质检合格', time: '2021-04-12', node: 'Factory_QC' },
  { hash: '0xb2...c4', event: '入库扫码确认', time: '2021-05-09', node: 'WMS_System' },
  { hash: '0x7c...f9', event: '安装扭矩核验', time: '2021-06-15', node: 'Field_Tablet' },
  { hash: '0x3d...a2', event: '2023年度大修', time: '2023-11-20', node: 'Maint_Log' },
];

export const LifecycleMgmtView: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('operation');
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);

  const activeStageInfo = useMemo(() => LIFECYCLE_STAGES.find(s => s.id === activeStageId) || LIFECYCLE_STAGES[0], [activeStageId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：生命周期指挥台 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 relative group">
              <Dna size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Full Lifecycle Management
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件 <span className="text-cyan-500 italic">全生命周期数字档案</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前役龄</div>
              <div className="text-2xl font-mono font-bold text-white">3.8 <span className="text-xs text-slate-600">YEARS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">健康指数</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">82.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">全周期成本</div>
              <div className="text-2xl font-mono font-bold text-amber-500">¥ 62k</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：数字出生证 (Identity) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="数字出生证明" subtitle="IDENTITY_DNA" highlight className="border-cyan-500/20">
              <div className="space-y-4">
                 <div className="p-4 bg-slate-950/60 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Fingerprint size={80} className="text-cyan-500" />
                    </div>
                    <div className="text-[10px] text-cyan-500 font-bold uppercase mb-1 tracking-widest">Global Asset ID</div>
                    <div className="text-lg font-mono font-bold text-white break-all leading-tight">{ASSET_INFO.id}</div>
                    
                    <div className="mt-4 space-y-2">
                       <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1">
                          <span className="text-slate-500">物料名称</span>
                          <span className="text-slate-200">{ASSET_INFO.name}</span>
                       </div>
                       <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1">
                          <span className="text-slate-500">规格型号</span>
                          <span className="text-cyan-300 font-mono">{ASSET_INFO.spec}</span>
                       </div>
                       <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1">
                          <span className="text-slate-500">序列号 (SN)</span>
                          <span className="text-slate-200 font-mono">{ASSET_INFO.serial}</span>
                       </div>
                       <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">制造厂商</span>
                          <span className="text-slate-200">{ASSET_INFO.manufacturer}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/60 border border-slate-800 p-3 rounded flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                       <Link size={12} className="text-indigo-500" /> 关联系统
                    </div>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-indigo-900/30 text-indigo-300 text-[9px] rounded border border-indigo-500/30">ERP: SAP-MM</span>
                       <span className="px-2 py-1 bg-indigo-900/30 text-indigo-300 text-[9px] rounded border border-indigo-500/30">EAM: Maximo</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全息溯源链条" subtitle="BLOCKCHAIN_LOG" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                    {BLOCKCHAIN_LOG.map((log, i) => (
                       <div key={i} className="relative pl-6 pb-2 group">
                          {i !== BLOCKCHAIN_LOG.length - 1 && (
                             <div className="absolute left-[5px] top-2 bottom-0 w-[1px] bg-slate-800 group-hover:bg-cyan-900 transition-colors"></div>
                          )}
                          <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-cyan-500 z-10"></div>
                          
                          <div className="bg-slate-900/40 p-2 rounded border border-slate-800/50 group-hover:border-cyan-500/30 transition-all">
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-cyan-200 font-bold">{log.event}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{log.time}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 flex items-center gap-1"><GitCommit size={8}/> {log.node}</span>
                                <span className="text-[8px] text-slate-600 font-mono truncate max-w-[80px]">{log.hash}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="pt-2 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2">
                       <ShieldCheck size={12} /> 验证存证完整性
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 螺旋时间轴 (The Helix) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          LIFECYCLE TRAJECTORY: {activeStageInfo.label}
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Time-Space <span className="text-cyan-500 italic">Helix</span>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Stage Health</div>
                          <div className={`text-xl font-mono font-bold ${activeStageInfo.health > 80 ? 'text-green-400' : 'text-amber-400'}`}>
                             {activeStageInfo.health}%
                          </div>
                       </div>
                       <input 
                         type="range" min="0" max="2" step="0.1" 
                         value={simulationSpeed}
                         onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                         className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         title="Simulation Speed"
                       />
                    </div>
                 </div>

                 {/* 选中阶段详情浮窗 */}
                 <div className="absolute bottom-6 left-6 pointer-events-auto bg-slate-900/90 border-l-4 border-cyan-500 p-4 rounded-r-sm backdrop-blur-md animate-in slide-in-from-bottom-4 w-64 shadow-2xl">
                    <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Active Phase Detail</div>
                    <div className="text-lg font-bold text-white mb-2">{activeStageInfo.label}</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                       <div className="flex flex-col">
                          <span className="uppercase">Timestamp</span>
                          <span className="text-slate-200 font-mono">{activeStageInfo.timestamp}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="uppercase">Status</span>
                          <span className={`font-bold uppercase ${activeStageInfo.status === 'active' ? 'text-green-400' : 'text-slate-300'}`}>
                             {activeStageInfo.status}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <LifecycleThreeScene 
                    stages={LIFECYCLE_STAGES} 
                    activeStageId={activeStageId}
                    onStageSelect={setActiveStageId}
                    speed={simulationSpeed}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 四角边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40"></div>
           </div>

           {/* 底部：总拥有成本 (TCO) 分析 */}
           <SciFiCard title="总拥有成本累积曲线 (TCO)" subtitle="COST_ACCUMULATION" className="h-56 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={TCO_DATA}>
                       <defs>
                          <linearGradient id="colorCostTco" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="cost" name="累积成本" stroke="#f59e0b" fill="url(#colorCostTco)" strokeWidth={2} />
                       <Line type="monotone" dataKey="value" name="剩余残值" stroke="#0ea5e9" strokeWidth={2} dot={{r:4}} />
                       <Legend verticalAlign="top" height={36} iconType="circle" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：价值与环保 (Value & ESG) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="碳足迹构成" subtitle="ESG_IMPACT">
              <div className="h-44 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={CARBON_FOOTPRINT} 
                          cx="50%" cy="50%" 
                          innerRadius={40} 
                          outerRadius={55} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {CARBON_FOOTPRINT.map((entry, index) => (
                             <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="pr-4 space-y-1.5 flex-1">
                    {CARBON_FOOTPRINT.map(item => (
                      <div key={item.name} className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="truncate">{item.name}</span>
                         <span className="text-slate-200 ml-auto">{item.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="mt-2 text-center">
                 <div className="inline-flex items-center gap-2 bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/30">
                    <Leaf size={10} /> 绿色等级: A (低碳)
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="生命周期决策建议" subtitle="AI_DECISION" className="flex-1 border-cyan-900/30 bg-cyan-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-cyan-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">延寿机遇</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “通过再制造修复核心表面，可将资产寿命延长 <span className="text-white font-bold">1.5年</span>，且成本仅为新购的 35%。建议在 2024 Q3 执行翻新。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Box size={12} className="text-emerald-500" /> 报废回收评估
                    </div>
                    {[
                      { label: '金属回收价值', val: '¥ 2,400', status: 'High' },
                      { label: '环境处置成本', val: '¥ 500', status: 'Low' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <span className="font-mono text-[10px] font-bold text-white">{step.val}</span>
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 生成全寿命分析报告
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 财务系统</div>
                    <div className="text-xs font-bold text-white">SAP_FIN_MOD_99</div>
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
      `}</style>
    </div>
  );
};
