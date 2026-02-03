
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Microscope, Layers, Activity, AlertTriangle, 
  Search, FileText, Database, Share2, 
  Maximize2, Cpu, Zap, Fingerprint, 
  FlaskConical, Binary, ScanLine, Atom,
  CheckCircle2, XCircle, ArrowRight,
  BrainCircuit, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, ScatterChart, Scatter, ZAxis, Cell,
  AreaChart, Area
} from 'recharts';

// --- Types ---

interface FailureCase {
  id: string;
  componentName: string;
  model: string;
  failureMode: string; // e.g., Fatigue, Corrosion, Overload
  severity: 'Critical' | 'High' | 'Medium';
  occurredTime: string;
  material: string;
  cycles: number;
}

interface MaterialComposition {
  element: string;
  standard: number;
  actual: number;
  status: 'Normal' | 'Abnormal';
}

interface FatiguePoint {
  cycles: number;
  stress: number;
}

// --- Mock Data ---

const CASES: FailureCase[] = [
  { id: 'FA-2024-001', componentName: '一级涡轮叶片 (Turbine Blade L1)', model: 'TB-X900', failureMode: '高周疲劳断裂 (HCF)', severity: 'Critical', occurredTime: '2024-03-20', material: 'Inconel 718', cycles: 1.2e8 },
  { id: 'FA-2024-002', componentName: '主轴承内圈 (Inner Race)', model: 'SKF-NU220', failureMode: '接触疲劳剥落 (Spalling)', severity: 'High', occurredTime: '2024-03-18', material: 'GCr15', cycles: 4.5e7 },
  { id: 'FA-2024-003', componentName: '液压伺服阀芯 (Servo Spool)', model: 'SV-2004', failureMode: '冲蚀磨损 (Erosion)', severity: 'Medium', occurredTime: '2024-03-15', material: '440C SS', cycles: 8.0e5 },
];

const CHEMICAL_DATA: MaterialComposition[] = [
  { element: 'Ni (镍)', standard: 52.5, actual: 51.8, status: 'Normal' },
  { element: 'Cr (铬)', standard: 19.0, actual: 18.2, status: 'Abnormal' }, // Slightly low
  { element: 'Fe (铁)', standard: 18.5, actual: 19.1, status: 'Normal' },
  { element: 'Nb (铌)', standard: 5.1, actual: 4.8, status: 'Normal' },
  { element: 'Mo (钼)', standard: 3.0, actual: 2.9, status: 'Normal' },
  { element: 'Ti (钛)', standard: 0.9, actual: 1.2, status: 'Abnormal' }, // High impurity
];

// S-N Curve Data (Fatigue)
const SN_CURVE_DATA = Array.from({length: 20}, (_, i) => ({
  cycles: Math.pow(10, 4 + i * 0.2), // Log scale approx
  stress: 1200 - (i * 50) + (Math.random() * 20),
  limit: 1000 - (i * 40)
}));

const FAILURE_POINT = { cycles: 1.2e8, stress: 450 }; // The actual failure point

const VIBRATION_HISTORY = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  vib: i > 45 ? 5 + Math.random() * 8 : 2 + Math.random(), // Sudden spike
}));

// --- Helper Components ---

const ElementBar = ({ data }: { data: MaterialComposition }) => (
  <div className="flex flex-col gap-1 mb-2">
    <div className="flex justify-between text-[10px] uppercase">
      <span className="text-slate-400 font-bold">{data.element}</span>
      <span className={data.status === 'Abnormal' ? 'text-red-400' : 'text-green-400'}>{data.status}</span>
    </div>
    <div className="w-full h-4 bg-slate-900 rounded border border-slate-700 relative overflow-hidden flex">
      {/* Standard Range Marker (Visual approximation) */}
      <div className="absolute top-0 bottom-0 w-1 bg-slate-500 z-10" style={{ left: '50%' }}></div>
      {/* Actual Value Bar */}
      <div 
        className={`h-full transition-all duration-1000 ${data.status === 'Abnormal' ? 'bg-red-500/60' : 'bg-blue-500/60'}`}
        style={{ width: `${(data.actual / (data.standard * 1.5)) * 100}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-mono text-white/80">
        <span>{data.actual.toFixed(2)}%</span>
        <span className="opacity-50">Std: {data.standard}%</span>
      </div>
    </div>
  </div>
);

const MicroStructureView = () => (
  <div className="relative w-full h-full bg-black rounded overflow-hidden group">
    {/* Simulated Grain Structure Image */}
    <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cracked-concrete.png")',
        backgroundSize: 'cover',
        filter: 'contrast(150%) brightness(80%) sepia(100%) hue-rotate(200deg)'
    }}></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
    
    {/* Scanning Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-[scan_4s_linear_infinite] opacity-50"></div>
    
    {/* Identified Defects */}
    <div className="absolute top-[30%] left-[40%] w-12 h-12 border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
    <div className="absolute top-[30%] left-[40%] text-[10px] text-red-400 font-mono translate-x-6 -translate-y-6 bg-black/60 px-2 rounded border border-red-900">
       Fatigue Striation
    </div>

    {/* Scale Bar */}
    <div className="absolute bottom-2 right-2 flex flex-col items-end">
       <div className="w-16 h-1 bg-white mb-1"></div>
       <div className="text-[9px] text-white font-mono">50 μm</div>
    </div>
  </div>
);

export const FailureAnalysisView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState(CASES[0].id);
  const [scanning, setScanning] = useState(false);
  
  const activeCase = CASES.find(c => c.id === selectedCaseId) || CASES[0];

  useEffect(() => {
    setScanning(true);
    const timer = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(timer);
  }, [selectedCaseId]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020305]">
      
      {/* 1. Header: The Lab Interface */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0a0614] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Microscope size={14} className="animate-pulse" /> Material Forensics Lab
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             关键部件 <span className="text-indigo-500">失效分析工作台</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Analysis Engine</span>
                <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <BrainCircuit size={14}/> AI-FEA Hybrid
                </span>
             </div>
             <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <FileText size={14} /> 生成鉴定报告
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Case Vault */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex items-center justify-between px-1 mb-2">
               <span className="text-xs font-bold text-slate-400 uppercase">Active Cases</span>
               <div className="flex gap-2">
                   <Filter size={14} className="text-slate-500 cursor-pointer hover:text-white" />
                   <Search size={14} className="text-slate-500 cursor-pointer hover:text-white" />
               </div>
           </div>

           <div className="flex flex-col gap-3">
               {CASES.map(c => (
                   <div 
                     key={c.id}
                     onClick={() => setSelectedCaseId(c.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
                        ${selectedCaseId === c.id 
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[9px] font-mono text-slate-500">{c.id}</span>
                           <span className={`text-[9px] px-1.5 rounded uppercase font-bold border ${
                               c.severity === 'Critical' ? 'text-red-400 border-red-900 bg-red-900/20' : 
                               c.severity === 'High' ? 'text-orange-400 border-orange-900 bg-orange-900/20' : 
                               'text-blue-400 border-blue-900 bg-blue-900/20'
                           }`}>
                               {c.severity}
                           </span>
                       </div>
                       
                       <h3 className={`font-bold text-xs mb-1 ${selectedCaseId === c.id ? 'text-white' : 'text-slate-300'}`}>
                           {c.componentName}
                       </h3>
                       <div className="text-[10px] text-slate-400 truncate">{c.failureMode}</div>
                       <div className="text-[9px] text-slate-600 mt-2">{c.occurredTime}</div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Autopsy Table */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Digital Twin & FEA Overlay */}
           <SciFiCard title="全息解剖台 (Holo-Autopsy)" subtitle="FEA STRESS MAP" className="h-[400px] border-indigo-900/50 bg-[#080a12]" noPadding>
               <div className="w-full h-full relative">
                   {/* Background Grid */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                       backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 1px, transparent 1px)',
                       backgroundSize: '30px 30px'
                   }}></div>

                   {/* 3D Model Area */}
                   <div className="absolute inset-0 z-0">
                        <ThreeScene type="turbine" color={activeCase.severity === 'Critical' ? '#ef4444' : '#f59e0b'} />
                   </div>

                   {/* Scanning Overlay Effect */}
                   {scanning && (
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-[scan_2s_ease-in-out_1] pointer-events-none"></div>
                   )}

                   {/* HUD Data Points */}
                   <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                       <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-indigo-500/30 w-48">
                           <div className="text-[9px] text-indigo-300 uppercase mb-1 font-bold">Failure Mode Identification</div>
                           <div className="text-sm text-white font-bold">{activeCase.failureMode}</div>
                           <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                               <div className="h-full bg-red-500 w-[92%] animate-pulse"></div>
                           </div>
                           <div className="flex justify-between mt-1 text-[8px] text-slate-400">
                               <span>Confidence</span>
                               <span className="text-red-400">92%</span>
                           </div>
                       </div>
                   </div>

                   <div className="absolute bottom-4 right-4 z-10">
                       <div className="flex gap-2">
                           <button className="p-2 bg-slate-800/80 border border-slate-600 rounded text-slate-300 hover:text-white hover:border-cyan-500 transition-colors">
                               <Layers size={16} />
                           </button>
                           <button className="p-2 bg-slate-800/80 border border-slate-600 rounded text-slate-300 hover:text-white hover:border-cyan-500 transition-colors">
                               <Activity size={16} />
                           </button>
                           <button className="p-2 bg-slate-800/80 border border-slate-600 rounded text-slate-300 hover:text-white hover:border-cyan-500 transition-colors">
                               <Share2 size={16} />
                           </button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Physics & Chemistry Data */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-[300px]">
               
               {/* S-N Curve (Fatigue) */}
               <SciFiCard title="疲劳寿命分析 (S-N Curve)" subtitle="STRESS LIFE" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 10}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis type="number" dataKey="cycles" name="Cycles" scale="log" domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Cycles (N)', position: 'insideBottom', offset: -5, fontSize: 10 }} allowDataOverflow />
                               <YAxis type="number" dataKey="stress" name="Stress" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f0a15', borderColor: '#6366f1', color: '#fff'}} />
                               
                               {/* Standard Curve */}
                               <Scatter name="Limit" data={SN_CURVE_DATA} line={{stroke: '#64748b', strokeWidth: 1, strokeDasharray: '5 5'}} shape={() => null} />
                               
                               {/* Failure Point */}
                               <Scatter name="Failure" data={[FAILURE_POINT]} fill="#ef4444" shape="cross" />
                               <ReferenceLine y={450} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Failure Stress', fill: 'red', fontSize: 10, position: 'insideTopRight'}} />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Failure Evolution (Vibration History) */}
               <SciFiCard title="失效演变历程" subtitle="VIBRATION HISTORY" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={VIBRATION_HISTORY}>
                               <defs>
                                   <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 15]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a15', borderColor: '#f59e0b', color: '#fff'}} />
                               <ReferenceLine x={45} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Fracture', fill: 'red', fontSize: 10}} />
                               <Area type="monotone" dataKey="vib" stroke="#f59e0b" fill="url(#colorVib)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>
        </div>

        {/* RIGHT COLUMN: Micro-Analysis & Conclusion */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1">
           
           {/* Material Spectrum */}
           <SciFiCard title="材料成分光谱 (Spectroscopy)" subtitle="CHEMISTRY" className="border-indigo-900/30">
               <div className="flex flex-col gap-2 p-2">
                   {CHEMICAL_DATA.map((item, i) => (
                       <ElementBar key={i} data={item} />
                   ))}
               </div>
               <div className="mt-2 p-2 bg-red-900/10 border border-red-500/20 rounded text-[10px] text-red-200">
                   <div className="flex items-center gap-1 font-bold mb-1"><AlertTriangle size={10} /> Contamination Alert</div>
                   Titanium content exceeds standard by 30%, indicating possible alloy segregation or foreign object damage.
               </div>
           </SciFiCard>

           {/* Microstructure */}
           <SciFiCard title="微观金相 (Metallography)" subtitle="SEM IMAGE" className="h-48 border-slate-800" noPadding>
               <div className="w-full h-full p-1">
                   <MicroStructureView />
               </div>
           </SciFiCard>

           {/* Expert Conclusion */}
           <SciFiCard title="专家鉴定结论" subtitle="VERDICT" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Primary Cause</div>
                       <div className="text-sm font-bold text-white flex items-start gap-2">
                           <ScanLine size={16} className="text-red-500 shrink-0 mt-0.5" />
                           Material impurity leading to premature fatigue crack initiation.
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Design Life</span>
                           <span className="text-white">10^9 Cycles</span>
                       </div>
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Actual Life</span>
                           <span className="text-red-400">1.2 x 10^8 Cycles</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                           <div className="bg-red-500 h-full" style={{width: '12%'}}></div>
                       </div>
                   </div>

                   <div className="mt-auto grid grid-cols-2 gap-2">
                       <button className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-[10px] text-slate-300 transition-colors">
                           Export PDF
                       </button>
                       <button className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 shadow-lg transition-colors">
                           Archive Case <ArrowRight size={10} />
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
