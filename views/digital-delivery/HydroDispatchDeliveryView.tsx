
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-dispatch]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-dispatch';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitBranch, Code, Server, Play, 
  UploadCloud, FileCheck, CheckCircle2,
  AlertTriangle, Cpu, Network,
  BarChart4, Download, Layers, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

// --- Types ---
interface ModelVersion {
  id: string;
  name: string;
  ver: string;
  status: 'Ready' | 'Draft' | 'Validated';
  date: string;
}

// --- Mock Data ---
const MODEL_LIST: ModelVersion[] = [
  { id: 'M-FC-01', name: '防洪调度模型 (Flood Control)', ver: 'v2.4.1', status: 'Validated', date: '2023-11-10' },
  { id: 'M-PG-03', name: '发电优化模型 (Power Gen)', ver: 'v3.0.0', status: 'Draft', date: '2023-11-15' },
  { id: 'M-ECO-02', name: '生态流量约束 (Eco-Flow)', ver: 'v1.2.0', status: 'Ready', date: '2023-10-05' },
];

const SIMULATION_DATA = Array.from({length: 24}, (_, i) => ({
    hour: i,
    levelTarget: 145 + Math.sin(i * 0.2) * 2,
    levelActual: 145 + Math.sin(i * 0.2) * 2 + (Math.random()-0.5)*0.5,
    output: 300 + Math.sin((i-8)*0.3) * 100
}));

// Custom SVG Component for Logic Visualization
const LogicFlowchart = () => (
  <svg width="100%" height="100%" viewBox="0 0 300 200" className="opacity-80">
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
      </marker>
    </defs>
    
    {/* Nodes */}
    <rect x="20" y="80" width="60" height="40" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
    <text x="50" y="105" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">INPUT</text>
    
    <polygon points="120,60 180,100 120,140 60,100" fill="#312e81" stroke="#818cf8" strokeWidth="2" transform="translate(40,0) scale(0.6) translate(140, 100)" />
    {/* Diamond shape manual approximation for visual */}
    <rect x="120" y="80" width="60" height="40" rx="4" fill="#312e81" stroke="#f472b6" strokeWidth="2" transform="rotate(45 150 100)" />
    <text x="150" y="105" textAnchor="middle" fill="#f472b6" fontSize="8" fontWeight="bold">CONSTRAINTS</text>

    <rect x="220" y="80" width="60" height="40" rx="4" fill="#1e1b4b" stroke="#22d3ee" strokeWidth="2" />
    <text x="250" y="105" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="bold">OUTPUT</text>

    {/* Connections */}
    <line x1="80" y1="100" x2="110" y2="100" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <line x1="180" y1="100" x2="220" y2="100" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
    
    {/* Loopback */}
    <path d="M 250 120 L 250 150 L 150 150 L 150 130" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
  </svg>
);

export const HydroDispatchDeliveryView: React.FC = () => {
  const [activeModel, setActiveModel] = useState(MODEL_LIST[0]);
  const [simulating, setSimulating] = useState(false);

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#030712] text-slate-200 relative overflow-hidden">
      
      {/* Circuit Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-indigo-900/40 bg-gradient-to-r from-indigo-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-widest">
             <Cpu size={14} className="animate-pulse" /> Algorithmic Asset Transfer
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水库调度模型 <span className="text-indigo-500 text-shadow-glow">与规则数字交付</span>
          </h1>
        </div>
        
        {/* Action Toolbar */}
        <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded">
                 <ShieldCheck size={14} className="text-green-400"/>
                 <span className="text-xs font-bold text-indigo-200">Logic Verified</span>
             </div>
             <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg shadow-indigo-900/50 transition-all flex items-center gap-2 border border-indigo-400/50">
                 <UploadCloud size={14} /> 交付模型包 (Package)
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT COLUMN: Model Selection & Logic */}
          <div className="w-[300px] flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Model Repository */}
              <SciFiCard title="调度模型库 (Model Repo)" subtitle="VERSION CONTROL" className="h-[300px] border-indigo-900/50 bg-[#080c18]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {MODEL_LIST.map((model, i) => (
                          <div 
                            key={i}
                            onClick={() => setActiveModel(model)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeModel.id === model.id 
                                    ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-indigo-600/50'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-xs truncate w-32" title={model.name}>{model.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                      model.status === 'Validated' ? 'bg-green-900/30 border-green-500/50 text-green-400' :
                                      model.status === 'Ready' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400' :
                                      'bg-slate-800 border-slate-600 text-slate-500'
                                  }`}>{model.status}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono opacity-70">
                                  <span>ID: {model.id}</span>
                                  <span>{model.ver}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Logic Visualizer */}
              <SciFiCard title="核心算法拓扑" subtitle="LOGIC FLOW" className="flex-1 border-indigo-900/50 bg-[#080c18]/90 pointer-events-auto">
                  <div className="w-full h-full p-2 flex flex-col">
                      <div className="flex-1 border border-dashed border-indigo-900/50 rounded bg-indigo-950/10 mb-2">
                          <LogicFlowchart />
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-1">
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                              <span>Solver:</span> <span className="text-white">MILP (Gurobi)</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                              <span>Constraints:</span> <span className="text-white">124 Active</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Objective:</span> <span className="text-indigo-300">Max Revenue</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER COLUMN: The Simulation Engine */}
          <div className="flex-1 flex flex-col gap-4 relative">
              
              {/* 3D Visualization */}
              <div className="flex-1 bg-[#05060a] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* Scene */}
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-hydro-dispatch" color="#6366f1" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* Top HUD */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-indigo-500/30">
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 uppercase">Input Nodes</span>
                          <span className="text-sm font-bold text-white">14</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 uppercase">Solve Time</span>
                          <span className="text-sm font-bold text-green-400">45ms</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 uppercase">Convergence</span>
                          <span className="text-sm font-bold text-indigo-300">0.01%</span>
                      </div>
                  </div>

                  {/* Playback Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-3 flex items-center gap-4">
                      <button 
                        onClick={() => setSimulating(!simulating)}
                        className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors"
                      >
                          <Play size={16} fill="currentColor" className={simulating ? "hidden" : "block"} />
                          <div className={`w-3 h-3 bg-white rounded-sm ${simulating ? "block" : "hidden"}`}></div>
                      </button>
                      <div className="flex-1">
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>Simulation Timeline (T+24h)</span>
                              <span>14:00</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-[60%] relative overflow-hidden">
                                  {simulating && <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Simulation Chart */}
              <SciFiCard title="调度结果验证 (Validation)" subtitle="LEVEL vs TARGET" className="h-[240px] border-indigo-900/50 bg-[#080c18]" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SIMULATION_DATA}>
                              <defs>
                                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis yAxisId="left" stroke="#6366f1" tick={{fontSize: 10}} domain={['auto', 'auto']} label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6366f1' }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f472b6" tick={{fontSize: 10}} label={{ value: 'MW', angle: 90, position: 'insideRight', fontSize: 10, fill: '#f472b6' }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#6366f1'}} />
                              
                              <Area yAxisId="left" type="monotone" dataKey="levelActual" stroke="#6366f1" fill="url(#colorLevel)" strokeWidth={2} name="Actual Level" />
                              <Area yAxisId="left" type="monotone" dataKey="levelTarget" stroke="#a5b4fc" fill="none" strokeDasharray="5 5" name="Target Rule" />
                              <Area yAxisId="right" type="step" dataKey="output" stroke="#f472b6" fill="none" strokeWidth={1} name="Power Output" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT COLUMN: Delivery Artifacts */}
          <div className="w-[280px] flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="交付物清单 (Artifacts)" subtitle="PACKAGE" className="flex-1 border-indigo-900/50 bg-[#080c18]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 p-2">
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded group cursor-pointer hover:border-indigo-500 transition-colors">
                          <div className="flex items-center gap-3">
                              <Code size={16} className="text-pink-400" />
                              <div>
                                  <div className="text-xs font-bold text-white">Algorithm Source</div>
                                  <div className="text-[10px] text-slate-500">Python / C++</div>
                              </div>
                          </div>
                          <CheckCircle2 size={14} className="text-green-500" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded group cursor-pointer hover:border-indigo-500 transition-colors">
                          <div className="flex items-center gap-3">
                              <FileCheck size={16} className="text-cyan-400" />
                              <div>
                                  <div className="text-xs font-bold text-white">Constraint Config</div>
                                  <div className="text-[10px] text-slate-500">JSON / XML</div>
                              </div>
                          </div>
                          <CheckCircle2 size={14} className="text-green-500" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded group cursor-pointer hover:border-indigo-500 transition-colors">
                          <div className="flex items-center gap-3">
                              <BarChart4 size={16} className="text-yellow-400" />
                              <div>
                                  <div className="text-xs font-bold text-white">Validation Report</div>
                                  <div className="text-[10px] text-slate-500">PDF</div>
                              </div>
                          </div>
                          <Download size={14} className="text-slate-400 hover:text-white" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded group cursor-pointer hover:border-indigo-500 transition-colors">
                          <div className="flex items-center gap-3">
                              <Network size={16} className="text-purple-400" />
                              <div>
                                  <div className="text-xs font-bold text-white">API Interface Docs</div>
                                  <div className="text-[10px] text-slate-500">Swagger</div>
                              </div>
                          </div>
                          <Download size={14} className="text-slate-400 hover:text-white" />
                      </div>
                  </div>
              </SciFiCard>
              
              <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg pointer-events-auto">
                  <div className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                      <AlertTriangle size={12}/> Security Check
                  </div>
                  <div className="space-y-2 text-[10px] text-slate-300">
                      <div className="flex justify-between">
                          <span>Logic Integrity</span>
                          <span className="text-green-400">PASS</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Parameter Bounds</span>
                          <span className="text-green-400">PASS</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Encryption (AES-256)</span>
                          <span className="text-green-400">ACTIVE</span>
                      </div>
                  </div>
              </div>

          </div>

      </div>

    </div>
  );
};
