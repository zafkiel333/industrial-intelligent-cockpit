
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Layers, Package, Truck, Anchor, 
  Settings, Zap, BarChart3, ArrowRight,
  Database, CheckCircle2, Box, Cpu,
  Briefcase, TrendingUp, Share2, PlusCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- Types ---
interface EquipmentNode {
  id: string;
  name: string;
  type: string;
  role: string;
  count: number;
  efficiency: string;
}

interface Scenario {
  id: string;
  title: string;
  category: string;
  description: string;
  efficiencyRating: number; // 0-100
  costRating: number; // 0-100 (CapEx)
  flow: string[]; // Steps in the process
  equipment: EquipmentNode[];
  kpis: { name: string; value: number; fullMark: number }[];
  throughput: number; // TEU/h or Ton/h
  energy: number; // kWh/unit
}

// --- Mock Data ---
const SCENARIOS: Scenario[] = [
  {
    id: 'S-AUTO-CT',
    title: '全自动化集装箱码头方案',
    category: 'Container',
    description: '采用双小车岸桥、AGV水平运输及ARMG自动化堆场的高效低碳作业模式。适用于年吞吐量 > 200万TEU 的大型枢纽港。',
    efficiencyRating: 95,
    costRating: 85, // High cost
    flow: ['Ship Unloading', 'Horizontal Transport', 'Yard Stacking', 'Gate Out'],
    equipment: [
      { id: 'STS-01', name: '双小车自动化岸桥', type: 'STS', role: 'Quayside', count: 12, efficiency: '35 Move/h' },
      { id: 'AGV-01', name: '磁钉导航 AGV', type: 'AGV', role: 'Transport', count: 70, efficiency: '6 m/s' },
      { id: 'ARMG-01', name: '自动化轨道吊', type: 'ARMG', role: 'Yard', count: 30, efficiency: '30 Move/h' },
      { id: 'TOS-01', name: '智能TOS系统', type: 'Software', role: 'Control', count: 1, efficiency: 'AI Opt' },
    ],
    kpis: [
      { name: '作业效率', value: 95, fullMark: 100 },
      { name: '自动化程度', value: 100, fullMark: 100 },
      { name: '安全性', value: 98, fullMark: 100 },
      { name: '维护成本', value: 60, fullMark: 100 }, // Lower score means higher cost/harder
      { name: '环保指标', value: 92, fullMark: 100 },
    ],
    throughput: 450, // TEU/h (Berth)
    energy: 12.5, // kWh/TEU
  },
  {
    id: 'S-TRAD-BULK',
    title: '传统干散货矿石码头方案',
    category: 'Bulk',
    description: '经典的抓斗卸船机配合皮带输送机系统。技术成熟，适应性强，适合铁矿石、煤炭等大宗散货作业。',
    efficiencyRating: 75,
    costRating: 40, // Low cost
    flow: ['Unloading', 'Conveying', 'Stacking', 'Reclaiming'],
    equipment: [
      { id: 'GSU-01', name: '桥式抓斗卸船机', type: 'Unloader', role: 'Quayside', count: 4, efficiency: '1200 t/h' },
      { id: 'BELT-01', name: '气垫带式输送机', type: 'Conveyor', role: 'Transport', count: 1, efficiency: '3 m/s' },
      { id: 'SR-01', name: '斗轮堆取料机', type: 'Stacker', role: 'Yard', count: 3, efficiency: '3000 t/h' },
    ],
    kpis: [
      { name: '作业效率', value: 75, fullMark: 100 },
      { name: '自动化程度', value: 40, fullMark: 100 },
      { name: '安全性', value: 70, fullMark: 100 },
      { name: '维护成本', value: 85, fullMark: 100 }, // High score = Low cost
      { name: '环保指标', value: 60, fullMark: 100 },
    ],
    throughput: 3600, // Ton/h
    energy: 0.85, // kWh/Ton
  },
  {
    id: 'S-SEMI-CT',
    title: '半自动化堆场改造方案',
    category: 'Container',
    description: '针对老旧码头的升级方案。岸边采用传统人工操作，堆场升级为远程操控RTG，平衡成本与效率。',
    efficiencyRating: 82,
    costRating: 60,
    flow: ['Ship Unloading', 'Truck Transport', 'Yard Stacking', 'Gate Out'],
    equipment: [
      { id: 'STS-02', name: '单小车岸桥', type: 'STS', role: 'Quayside', count: 8, efficiency: '28 Move/h' },
      { id: 'TRK-01', name: '集卡 (内集卡)', type: 'Truck', role: 'Transport', count: 50, efficiency: '40 km/h' },
      { id: 'ERTG-01', name: '电动轮胎吊 (E-RTG)', type: 'RTG', role: 'Yard', count: 24, efficiency: '25 Move/h' },
    ],
    kpis: [
      { name: '作业效率', value: 82, fullMark: 100 },
      { name: '自动化程度', value: 65, fullMark: 100 },
      { name: '安全性', value: 80, fullMark: 100 },
      { name: '维护成本', value: 75, fullMark: 100 },
      { name: '环保指标', value: 70, fullMark: 100 },
    ],
    throughput: 220, // TEU/h
    energy: 18.2, // kWh/TEU
  }
];

// --- Sub-Components ---

const ProcessFlow = ({ scenario }: { scenario: Scenario }) => {
  return (
    <div className="w-full h-full flex items-center justify-between px-10 relative">
      {/* Connecting Line */}
      <div className="absolute left-10 right-10 top-1/2 h-1 bg-slate-800 -z-0"></div>
      
      {/* Steps */}
      {scenario.flow.map((step, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center group">
          <div className={`w-16 h-16 rounded-full border-2 bg-[#0b1221] flex items-center justify-center transition-all duration-500
             ${i === 0 ? 'border-cyan-500 text-cyan-400' : 
               i === scenario.flow.length - 1 ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-400 group-hover:border-cyan-500 group-hover:text-cyan-400'}
          `}>
             {i === 0 ? <Anchor size={24} /> : 
              i === scenario.flow.length - 1 ? <CheckCircle2 size={24} /> : 
              <ArrowRight size={24} />}
          </div>
          <div className="mt-4 text-center">
             <div className="text-sm font-bold text-slate-200">{step}</div>
             <div className="text-[10px] text-slate-500 uppercase tracking-wider">Stage 0{i+1}</div>
          </div>
          
          {/* Equipment mapping for this step (Simplified logic) */}
          <div className="absolute top-20 w-32 bg-slate-900/80 border border-slate-700 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <div className="text-[10px] text-slate-400 mb-1">Equipment Assigned:</div>
             {scenario.equipment.filter((e, idx) => Math.floor(idx * (scenario.flow.length / scenario.equipment.length)) === i).map(e => (
               <div key={e.id} className="text-xs text-cyan-300 font-bold">{e.name}</div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PortComboKbView: React.FC = () => {
  const [activeId, setActiveId] = useState('S-AUTO-CT');
  const activeScenario = SCENARIOS.find(s => s.id === activeId) || SCENARIOS[0];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f0a20] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Layers size={14} /> Solution Library / 方案库
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             港口装备组合 <span className="text-indigo-500">方案配置中心</span>
          </h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors">
              <PlusCircle size={14} /> 新建组合方案
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 transition-colors">
              <Share2 size={14} /> 导出方案报告
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Scenario Selector */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="text-xs font-bold text-slate-500 uppercase px-1">Available Templates</div>
           {SCENARIOS.map(scenario => (
             <div 
               key={scenario.id}
               onClick={() => setActiveId(scenario.id)}
               className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                  ${activeId === scenario.id 
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
               `}
             >
                {activeId === scenario.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded bg-slate-800 ${activeId === scenario.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                         {scenario.category === 'Container' ? <Box size={14} /> : <Database size={14} />}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{scenario.id}</span>
                   </div>
                   <span className="text-xs font-bold text-indigo-400">{scenario.efficiencyRating}% Eff</span>
                </div>
                
                <h3 className={`text-sm font-bold mb-1 ${activeId === scenario.id ? 'text-white' : 'text-slate-300'}`}>
                   {scenario.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{scenario.description}</p>
             </div>
           ))}

           {/* Comparison Tool */}
           <div className="mt-auto bg-slate-900/30 p-3 rounded border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                 <TrendingUp size={14} /> 方案对比
              </div>
              <div className="h-1 bg-slate-800 rounded overflow-hidden flex">
                 <div className="bg-indigo-500 h-full w-1/2"></div>
                 <div className="bg-slate-600 h-full w-1/3"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                 <span>Auto</span>
                 <span>Semi</span>
                 <span>Trad</span>
              </div>
           </div>
        </div>

        {/* CENTER COLUMN: Visualization & Details */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top Visual: Process Flow */}
           <SciFiCard title="工艺流程可视化" subtitle="WORKFLOW" className="h-[220px] border-indigo-900/50 bg-[#080c14]" noPadding>
              <ProcessFlow scenario={activeScenario} />
           </SciFiCard>

           {/* Middle: Equipment Configuration Table */}
           <SciFiCard title="核心装备配置清单" subtitle="CONFIGURATION" className="border-indigo-900/50">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-300">
                       <tr>
                          <th className="px-4 py-3 rounded-tl">Equipment Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Quantity</th>
                          <th className="px-4 py-3 rounded-tr">Performance</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {activeScenario.equipment.map((eq, idx) => (
                          <tr key={eq.id} className="hover:bg-indigo-900/10 transition-colors">
                             <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                {eq.name}
                             </td>
                             <td className="px-4 py-3 font-mono text-xs">{eq.type}</td>
                             <td className="px-4 py-3">
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{eq.role}</span>
                             </td>
                             <td className="px-4 py-3 font-bold text-indigo-300">{eq.count} <span className="text-[10px] text-slate-500 font-normal">units</span></td>
                             <td className="px-4 py-3 text-green-400 font-mono text-xs">{eq.efficiency}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SciFiCard>

           {/* Bottom: Charts */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SciFiCard title="方案综合效能评估" subtitle="KPI RADAR" className="border-indigo-900/50">
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeScenario.kpis}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1', color: '#e2e8f0'}} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>

              <SciFiCard title="预期产出与能耗" subtitle="ESTIMATION" className="border-indigo-900/50">
                 <div className="flex flex-col justify-center h-full gap-6 px-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-green-900/20 rounded-full border border-green-500/30">
                          <Package size={24} className="text-green-400" />
                       </div>
                       <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wider">Throughput Capacity</div>
                          <div className="text-3xl font-bold text-white font-mono">
                             {activeScenario.throughput} <span className="text-sm text-slate-500 font-normal">{activeScenario.category === 'Container' ? 'TEU/h' : 't/h'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="w-full h-[1px] bg-slate-800"></div>

                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-500/30">
                          <Zap size={24} className="text-yellow-400" />
                       </div>
                       <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wider">Energy Consumption</div>
                          <div className="text-3xl font-bold text-white font-mono">
                             {activeScenario.energy} <span className="text-sm text-slate-500 font-normal">kWh/{activeScenario.category === 'Container' ? 'TEU' : 't'}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Configuration Panel */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6">
           
           <SciFiCard title="参数配置面板" subtitle="SETTINGS" className="border-slate-800">
              <div className="flex flex-col gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Briefcase size={10}/> 目标年吞吐量 Target</label>
                    <div className="flex items-center gap-2">
                       <input type="range" min="100" max="500" defaultValue="250" className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                       <span className="text-xs font-mono w-8 text-right">2.5M</span>
                    </div>
                 </div>
                 
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Cpu size={10}/> 自动化等级 Automation</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-indigo-500">
                       <option>L4 (Fully Auto)</option>
                       <option>L3 (Remote)</option>
                       <option>L2 (Semi)</option>
                    </select>
                 </div>

                 <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-200 leading-relaxed">
                    <span className="font-bold flex items-center gap-1 mb-1"><Settings size={10} /> 兼容性检查</span>
                    当前配置下的AGV数量 (70) 与岸桥作业效率匹配良好，但在峰值作业时堆场ARMG可能成为瓶颈。建议增加ARMG至35台。
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="成功案例参考" subtitle="CASE STUDIES" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-3">
                 {[
                    { name: 'Shanghai Yangshan IV', type: 'Auto-CT', match: '98%' },
                    { name: 'Qingdao QQCTN', type: 'Auto-CT', match: '95%' },
                    { name: 'Rotterdam RWG', type: 'Auto-CT', match: '92%' },
                 ].map((c, i) => (
                    <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                       <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm text-slate-200 group-hover:text-white">{c.name}</span>
                          <span className="text-xs font-bold text-green-400">{c.match}</span>
                       </div>
                       <div className="text-[10px] text-slate-500">{c.type} • Detailed Report Available</div>
                    </div>
                 ))}
                 <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 transition-colors">
                    查看所有案例
                 </button>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
