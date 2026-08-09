import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ForecastThreeScene } from '../../components/spare_parts_forecast/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-demand-forecast]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-demand-forecast';
import { ForecastNode } from '../../components/spare_parts_forecast/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line, Legend
} from 'recharts';
import { 
  BrainCircuit, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Search, 
  Filter, 
  Cpu, 
  Activity, 
  Database,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  Target,
  FlaskConical,
  BarChart3,
  Factory,
  RefreshCw,
  Sliders,
  ShoppingCart,
  FileText,
  PlusCircle
} from 'lucide-react';

const MOCK_NODES: ForecastNode[] = [
  { id: 'P-101', name: '主轴承 SKF-7724', probability: 0.92, leadTime: 14, urgency: 'critical', position: [-4, 2, -3] },
  { id: 'P-102', name: '液压伺服阀 V2', probability: 0.78, leadTime: 21, urgency: 'high', position: [5, -2, 4] },
  { id: 'P-103', name: '驱动皮带 XL-500', probability: 0.45, leadTime: 5, urgency: 'med', position: [0, 5, -6] },
  { id: 'P-104', name: '传感器电缆模块', probability: 0.22, leadTime: 3, urgency: 'low', position: [-5, -3, 2] },
  { id: 'P-105', name: '减速机密封件', probability: 0.85, leadTime: 7, urgency: 'high', position: [3, 2, 8] },
];

const DEMAND_TREND = [
  { month: '04', actual: 42, predicted: 45 },
  { month: '05', actual: 38, predicted: 40 },
  { month: '06', actual: 55, predicted: 52 },
  { month: '07', actual: null, predicted: 68 }, // 未来预测
  { month: '08', actual: null, predicted: 75 },
  { month: '09', actual: null, predicted: 62 },
];

const MODEL_PERFORMANCE = [
  { name: 'LSTM', accuracy: 94 },
  { name: 'XGBoost', accuracy: 88 },
  { name: 'Prophet', accuracy: 91 },
  { name: 'Ensemble', accuracy: 96 },
];

// Fix: Resolved truncated export and implemented the full DemandForecastView component to resolve Error at line 59 and App.tsx Error at line 54
export const DemandForecastView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [productionIntensity, setProductionIntensity] = useState(1.0);

  const activeNode = useMemo(() => MOCK_NODES.find(n => n.id === selectedNodeId), [selectedNodeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/50 relative group">
              <BrainCircuit size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-indigo-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Predictive Spare Parts Analytics
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备品备件 <span className="text-indigo-500 italic">需求预测服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">预测准确率</div>
              <div className="text-2xl font-mono font-bold text-green-400">96.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">建议库存覆盖</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">92%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Forecast Items */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-indigo-500" /> 预测需求池</span>
              <span>Total: 5</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {MOCK_NODES.map(node => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedNodeId === node.id 
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{node.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${node.urgency === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                    `}>{node.urgency}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{node.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                    <span>需求概率</span>
                    <span className="font-mono text-indigo-300">{(node.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${node.probability * 100}%` }}></div>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="AI 模型优化建议" subtitle="REASONING">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/10 border-l-2 border-indigo-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Cpu size={14} className="text-indigo-400" />
                       <span className="text-[10px] font-bold text-white uppercase">季节性因子调节</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal italic">
                       “由于汛期临近，#1-#4 泵组备件需求模型已自动将‘密封件’权重提升 15%。”
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: 3D Projection */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded-lg overflow-hidden group p-6">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          DEMAND PROJECTION FIELD
                       </div>
                       <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Predictive <span className="text-indigo-500">Node Map</span>
                       </h3>
                    </div>
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">生产强度仿真</div>
                       <input 
                         type="range" min="0" max="2" step="0.1" 
                         value={productionIntensity}
                         onChange={(e) => setProductionIntensity(parseFloat(e.target.value))}
                         className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                       />
                       <div className="text-xl font-mono font-bold text-indigo-400 mt-1">{productionIntensity.toFixed(1)}x</div>
                    </div>
                 </div>
              </div>

              <div className="absolute inset-0">
                 <ForecastThreeScene 
                    nodes={MOCK_NODES} 
                    activeNodeId={selectedNodeId}
                    onNodeSelect={setSelectedNodeId}
                    productionIntensity={productionIntensity}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>
           </div>

           {/* Bottom: Trend Analysis */}
           <SciFiCard title="预测性需求走势" subtitle="TIME_EVOLUTION" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={DEMAND_TREND}>
                       <defs>
                          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#colorPredicted)" strokeWidth={2} name="预测需求" />
                       <Bar dataKey="actual" fill="#0ea5e9" barSize={12} radius={[2, 2, 0, 0]} name="实际消耗" />
                       <Legend verticalAlign="top" height={36} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* Right: Asset & Model Insights */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="选中备件透视" subtitle="NODE_INSIGHT">
              {activeNode ? (
                 <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                       <div>
                          <div className="text-[10px] font-mono text-indigo-400 mb-1">ID: {activeNode.id}</div>
                          <div className="text-lg font-bold text-white">{activeNode.name}</div>
                       </div>
                       <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${activeNode.urgency === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                       `}>{activeNode.urgency}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">采购提前期</div>
                          <div className="text-sm font-bold text-white font-mono">{activeNode.leadTime} d</div>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500 uppercase">失效概率</div>
                          <div className="text-sm font-bold text-amber-500">{(activeNode.probability * 100).toFixed(0)}%</div>
                       </div>
                    </div>

                    <div className="p-3 bg-indigo-900/10 border border-indigo-900/30 rounded">
                       <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1">建议采购方案</div>
                       <p className="text-[10px] text-slate-400 leading-normal">
                          考虑提前期，建议在 <span className="text-white font-bold">4月15日前</span> 完成下单。
                       </p>
                    </div>

                    <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all">
                       <ShoppingCart size={14} /> 加入采购计划
                    </button>
                 </div>
              ) : (
                 <div className="h-32 flex flex-col items-center justify-center text-slate-600 italic text-xs gap-3">
                    <Target size={32} className="opacity-20" />
                    <span>选择预测节点查看细节</span>
                 </div>
              )}
           </SciFiCard>

           <SciFiCard title="多模型集成评估" subtitle="MODEL_RANK">
              <div className="space-y-4">
                 {MODEL_PERFORMANCE.map(model => (
                    <div key={model.name} className="space-y-1.5">
                       <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                          <span>{model.name} Engine</span>
                          <span className="text-indigo-400">{model.accuracy}% Acc</span>
                       </div>
                       <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${model.accuracy}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="mt-auto bg-slate-900/60 border border-slate-800 rounded p-4 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><RefreshCw size={16} className="text-slate-500 group-hover:animate-spin" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">模型再训练状态</div>
                    <div className="text-xs font-bold text-white">模型已是最新 (2024.04.01)</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
           </div>

           <button className="w-full py-3 border border-dashed border-slate-800 text-slate-600 rounded text-xs hover:text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2">
              <PlusCircle size={14} /> 调取更多预测数据
           </button>
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
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};
