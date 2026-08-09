
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-mine-processing]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-mine-processing';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitMerge, Settings, Play, CheckCircle2, 
  Terminal, Cpu, ArrowRight, Activity, 
  RefreshCcw, AlertTriangle, FileCode, Layers,
  Filter, FlaskConical, Database, ScanLine, Share2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---

const PROCESS_NODES = [
  { id: 'FEED', label: '原煤给料 (Feed)', status: 'Verified' },
  { id: 'DENSE', label: '重介分选 (Dense Medium)', status: 'Verified', active: true },
  { id: 'FLOAT', label: '浮选作业 (Flotation)', status: 'Checking' },
  { id: 'DEWATER', label: '脱水干燥 (Dewatering)', status: 'Pending' }
];

const ASSET_LIST = [
  { code: 'HMC-101', name: '重介质旋流器 A组', type: 'Primary Separation', model: '3GDMC-1200', status: 'Data Linked' },
  { code: 'HMC-102', name: '重介质旋流器 B组', type: 'Primary Separation', model: '3GDMC-1200', status: 'Data Linked' },
  { code: 'VS-201', name: '脱介筛 A', type: 'Screening', model: 'Banana-3661', status: 'Geometry OK' },
  { code: 'PUMP-305', name: '介质泵', type: 'Auxiliary', model: 'Slurry-800', status: 'Param Mismatch', warning: true },
];

const SEPARATION_CURVE = Array.from({length: 40}, (_, i) => {
    const density = 1.2 + i * 0.02; // Density 1.2 to 2.0
    // Partition curve (Tromp curve)
    const d50 = 1.5;
    const ep = 0.04;
    const partition = 100 / (1 + Math.exp(-1.099 * (density - d50) / ep));
    return { density, partition };
});

const LOGIC_VALIDATION = [
    { step: '01', check: 'PID_Density_Control', result: 'Pass', time: '12ms' },
    { step: '02', check: 'Valve_Response_Lag', result: 'Pass', time: '45ms' },
    { step: '03', check: 'Medium_Recovery_Bal', result: 'Warn', time: '120ms' },
    { step: '04', check: 'Emergency_Stop_Link', result: 'Pass', time: '8ms' },
];

export const MineProcessingDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0f0a14] text-slate-200 relative overflow-hidden">
      
      {/* Background: Chemical/Process aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-[#0f0a14] to-black pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
               backgroundImage: 'repeating-linear-gradient(90deg, #7c3aed 0, #7c3aed 1px, transparent 0, transparent 40px)', 
               backgroundSize: '40px 100%'
           }}>
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-violet-900/40 bg-gradient-to-r from-violet-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-widest">
             <FlaskConical size={14} className="animate-bounce" /> Mineral Processing Digital Twin
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             智能选矿与洗选系统 <span className="text-violet-500 text-shadow-glow">数字交付中心</span>
          </h1>
        </div>
        
        {/* Delivery Stats */}
        <div className="flex gap-8 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Process Logic</span>
                 <div className="flex items-center gap-2 text-green-400 font-bold font-mono">
                     <CheckCircle2 size={14}/> Verified
                 </div>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Asset Binding</span>
                 <span className="font-mono text-white font-bold text-lg">98.2%</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold rounded-sm shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all flex items-center gap-2 border border-violet-400/50">
                 <Share2 size={14} /> 签署交付证书
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Process Flow & Logic */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Process Navigator */}
              <SciFiCard title="工艺流程节点 (Flow)" subtitle="LIVE" className="flex-1 border-violet-900/50 bg-[#0a0510]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 p-2 relative h-full">
                      {/* Vertical Line */}
                      <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-800 -z-10"></div>
                      
                      {PROCESS_NODES.map((node, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-pointer">
                              <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-[#0f0a14] z-10 transition-all
                                  ${node.active 
                                      ? 'border-violet-500 text-violet-400 shadow-[0_0_10px_#8b5cf6]' 
                                      : 'border-slate-700 text-slate-500 group-hover:border-violet-700'}
                              `}>
                                  {node.id === 'DENSE' ? <Filter size={20}/> : <Layers size={20}/>}
                              </div>
                              <div className="flex-1 p-3 bg-slate-900/50 border border-slate-800 rounded hover:bg-slate-800 transition-colors">
                                  <div className="text-sm font-bold text-slate-200">{node.label}</div>
                                  <div className={`text-[10px] ${node.status === 'Verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {node.status}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
              
              {/* Logic Verification */}
              <SciFiCard title="控制逻辑仿真验证" subtitle="PLC TWIN" className="h-[250px] border-violet-900/50 bg-[#0a0510]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 p-1 font-mono text-xs">
                      {LOGIC_VALIDATION.map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-2 border-b border-slate-800 last:border-0">
                              <div className="flex flex-col">
                                  <span className="text-slate-300">{item.check}</span>
                                  <span className="text-[9px] text-slate-500">Step {item.step}</span>
                              </div>
                              <div className="text-right">
                                  <span className={`font-bold ${item.result === 'Pass' ? 'text-green-500' : 'text-yellow-500'}`}>{item.result}</span>
                                  <div className="text-[9px] text-slate-500">{item.time}</div>
                              </div>
                          </div>
                      ))}
                      <div className="mt-2 text-center">
                          <button className="text-violet-400 hover:text-white text-[10px] flex items-center justify-center gap-1 w-full">
                              <Terminal size={10} /> View Logic Script
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              
              {/* 3D Scene Container */}
              <div className="flex-1 bg-[#050308] border border-violet-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-mine-processing" color="#8b5cf6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD: Density Control */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-violet-500/30 px-4 py-2 rounded flex items-center gap-4">
                          <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Medium Density</span>
                              <span className="text-lg font-bold text-white font-mono">1.50 g/cm³</span>
                          </div>
                          <div className="w-px h-6 bg-slate-600"></div>
                          <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Cyclone Pressure</span>
                              <span className="text-lg font-bold text-cyan-300 font-mono">145 kPa</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Visual Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-2 rounded border border-violet-900 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Clean Coal (Product)</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Gangue (Waste)</div>
                  </div>
              </div>

              {/* Bottom: Separation Efficiency Curve */}
              <SciFiCard title="分选效率曲线 (Tromp Curve)" subtitle="THEORETICAL vs ACTUAL" className="h-[220px] border-violet-900/50 bg-[#0a0510]" noPadding>
                  <div className="w-full h-full p-2 flex gap-4">
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={SEPARATION_CURVE}>
                                  <defs>
                                      <linearGradient id="splitGrad" x1="0" y1="0" x2="1" y2="0">
                                          <stop offset="0%" stopColor="#facc15" stopOpacity={0.8}/> {/* Coal */}
                                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                          <stop offset="100%" stopColor="#64748b" stopOpacity={0.8}/> {/* Waste */}
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                                  <XAxis dataKey="density" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Density (g/cm³)', position: 'insideBottom', offset: -5, fontSize: 10 }} domain={[1.2, 2.0]} type="number" tickCount={5} />
                                  <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Partition %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                  <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#8b5cf6', color: '#fff'}} />
                                  
                                  <Area type="monotone" dataKey="partition" stroke="#8b5cf6" strokeWidth={2} fill="url(#splitGrad)" name="Partition Coeff" />
                                  
                                  <ReferenceLine x={1.5} stroke="#fff" strokeDasharray="3 3" label={{value: 'D50', fill: '#fff', fontSize: 10}} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="w-32 flex flex-col justify-center gap-2 text-xs border-l border-slate-800 pl-4">
                          <div className="text-slate-400">Ep Value</div>
                          <div className="text-xl font-bold text-green-400">0.040</div>
                          <div className="text-slate-500 text-[10px]">High Precision</div>
                          
                          <div className="mt-2 text-slate-400">Imperfection (I)</div>
                          <div className="text-xl font-bold text-violet-300">0.025</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Asset List & Handover */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="主要设备交付清单" subtitle="ASSET HANDOVER" className="flex-1 border-violet-900/50 bg-[#0a0510]/90 pointer-events-auto">
                  <div className="flex flex-col gap-1 h-full">
                      {/* Filter Tabs */}
                      <div className="flex gap-2 mb-2">
                          <button className="flex-1 py-1 text-[10px] bg-violet-900/40 text-white rounded border border-violet-500/50">Mechanical</button>
                          <button className="flex-1 py-1 text-[10px] bg-slate-800 text-slate-400 rounded hover:bg-slate-700">Electrical</button>
                          <button className="flex-1 py-1 text-[10px] bg-slate-800 text-slate-400 rounded hover:bg-slate-700">Automation</button>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                          {ASSET_LIST.map((asset, i) => (
                              <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 hover:border-violet-500/30 transition-colors group cursor-pointer">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">{asset.name}</span>
                                      <span className="text-[9px] font-mono text-slate-500">{asset.code}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-slate-400">{asset.model}</span>
                                      <div className={`flex items-center gap-1 ${asset.warning ? 'text-yellow-400' : 'text-green-400'}`}>
                                          {asset.warning && <AlertTriangle size={8} />}
                                          {asset.status}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Doc Summary */}
                      <div className="mt-auto pt-3 border-t border-slate-800 text-xs text-slate-400">
                          <div className="flex justify-between mb-1">
                              <span>3D Models (STEP/IFC)</span>
                              <span className="text-white">142 Files</span>
                          </div>
                          <div className="flex justify-between mb-1">
                              <span>O&M Manuals</span>
                              <span className="text-white">58 Docs</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Spare Part Lists</span>
                              <span className="text-white">24 XLS</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
