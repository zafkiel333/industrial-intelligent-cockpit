
import React, { useState, useEffect } from 'react';
import { OilChromatographyScene } from '../../../components/predictive/hydro-oil-chromatography/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-17]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-17';
import { GasParticle } from '../../../components/predictive/hydro-oil-chromatography/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart, Legend
} from 'recharts';
import { 
  FlaskConical, Flame, AlertTriangle, TrendingUp, 
  Activity, Droplets, Microscope, Hexagon, Search
} from 'lucide-react';

// --- Mock Data ---

// Gas Trend History (Days)
const GAS_HISTORY = Array.from({length: 30}, (_, i) => {
    const t = i;
    // Simulate a developing thermal fault
    const heat = t > 15 ? (t-15) * 0.5 : 0; 
    return {
        day: `-${30-i}d`,
        H2: 10 + Math.random()*2 + heat,
        CH4: 5 + Math.random()*1 + heat * 1.5,
        C2H4: 2 + Math.random()*0.5 + heat * 2, // Ethylene rises with temp
        C2H2: t > 25 ? (t-25) * 0.2 : 0, // Acetylene appears late (Arcing)
        CO: 150 + i * 2,
        Total: 0 // Calc later
    };
}).map(d => ({...d, Total: d.H2 + d.CH4 + d.C2H4 + d.C2H2 + d.CO }));

// Duval Triangle Points (History)
const DUVAL_HISTORY = Array.from({length: 10}, (_, i) => ({
    ch4: 40 + i*2,
    c2h4: 20 + i*3,
    c2h2: 5 + i*0.5,
    zone: i > 7 ? 'T3' : 'T2'
}));

// Three Ratio Method Rules
const RATIO_CODES = [
    { code: '000', fault: 'Normal aging' },
    { code: '022', fault: 'High temp overheating' },
    { code: '202', fault: 'Discharges of high energy (Arcing)' },
    { code: '100', fault: 'Low temp overheating' },
];

export const TransformerOilAnalysisView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      oilTemp: 55.4,
      tdg: 320, // Total Dissolved Gas
      moisture: 12, // ppm
      breakdownVoltage: 58, // kV
      dielectricLoss: 0.005,
      acidity: 0.08, // mgKOH/g
  });

  const [gasData, setGasData] = useState<GasParticle[]>([
      { type: 'H2', concentration: 15 },
      { type: 'CH4', concentration: 25 },
      { type: 'C2H2', concentration: 2 },
      { type: 'C2H4', concentration: 10 },
      { type: 'CO', concentration: 180 },
  ]);

  const [diagnosis, setDiagnosis] = useState({
      code: 'T2',
      type: 'Thermal Fault (300-700°C)',
      status: 'WARNING',
      prob: 85
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Sim gas generation
        setGasData(prev => prev.map(g => ({
            ...g,
            concentration: g.concentration + (Math.random() - 0.2) * (g.type === 'C2H4' ? 0.5 : 0.1) // C2H4 growing
        })));

        setMetrics(prev => ({
            ...prev,
            oilTemp: 55 + Math.sin(t*0.1)*2,
            tdg: prev.tdg + 0.1
        }));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0500] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#291b00] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <FlaskConical size={14} className="animate-pulse" />
             Chemical Diagnosis System
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             主变油色谱 <span className="text-amber-500">异常趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Diagnosis Result</div>
                <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle size={20} /> {diagnosis.type}
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Total Dissolved Gas (TDG)</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.tdg.toFixed(1)} <span className="text-sm text-slate-500">ppm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Oil Quality</div>
                <div className="text-2xl font-mono font-bold text-green-400">GOOD</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Gas Trends */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Key Gases Monitor */}
           <SciFiCard title="特征气体监测 (Key Gases)" subtitle="PPM" className="border-amber-900/50 bg-[#140a00]/80">
               <div className="grid grid-cols-2 gap-3">
                   {gasData.map((g, i) => (
                       <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col relative overflow-hidden group">
                           <div className="flex justify-between items-center z-10">
                               <span className="text-xs font-bold text-slate-400">{g.type}</span>
                               <span className={`text-sm font-mono font-bold ${g.type === 'C2H2' && g.concentration > 0 ? 'text-red-500' : 'text-white'}`}>
                                   {g.concentration.toFixed(1)}
                               </span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden z-10">
                               <div className="bg-amber-500 h-full" style={{width: `${(g.concentration / 200)*100}%`}}></div>
                           </div>
                           {/* BG Molecule Decoration */}
                           <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Hexagon size={40} className="text-amber-500" />
                           </div>
                       </div>
                   ))}
               </div>
               
               <div className="mt-4 pt-3 border-t border-slate-800">
                   <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                       <span>Gas Growth Rate</span>
                       <span className="text-red-400 font-bold flex items-center gap-1"><TrendingUp size={12}/> +1.5 ppm/day</span>
                   </div>
                   <div className="text-[10px] text-slate-500">
                       Significant rise in C2H4 indicates increasing thermal fault temperature.
                   </div>
               </div>
           </SciFiCard>

           {/* Trend Chart */}
           <SciFiCard title="产气速率趋势 (30 Days)" subtitle="HISTORY" className="flex-1 border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={GAS_HISTORY}>
                           <defs>
                               <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="day" stroke="#78350f" tick={{fontSize: 10}} />
                           <YAxis stroke="#78350f" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0500', borderColor: '#f59e0b', color: '#fff'}} />
                           <Area type="monotone" dataKey="Total" stroke="#f59e0b" fill="url(#colorTotal)" name="Total Hydrocarbons" />
                           <Line type="monotone" dataKey="C2H4" stroke="#ef4444" strokeWidth={2} dot={false} name="Ethylene" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050200] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)]">
               
               {/* HUD Overlay */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                   <div className="text-[10px] text-amber-400 font-bold uppercase mb-1 flex items-center gap-2">
                       <Microscope size={12} /> Dissolved Gas Simulation
                   </div>
                   <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded border border-amber-500/20 backdrop-blur">
                       <span className="w-3 h-3 rounded-full bg-blue-500"></span> <span className="text-[10px] text-slate-300 mr-2">H2</span>
                       <span className="w-3 h-3 rounded-full bg-yellow-400"></span> <span className="text-[10px] text-slate-300 mr-2">CH4</span>
                       <span className="w-3 h-3 rounded-full bg-red-500"></span> <span className="text-[10px] text-slate-300">C2H2</span>
                   </div>
               </div>

               <div className="absolute bottom-4 right-4 z-10 text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Fault Localization</div>
                   <div className="text-lg font-bold text-white">Phase B - Top Winding</div>
                   <div className="text-[10px] text-red-500 font-mono">X:0.2 Y:0.8 Z:0.0</div>
               </div>

               <OilChromatographyScene 
                   oilTemp={metrics.oilTemp}
                   gasData={gasData}
                   faultLocation={[0.2, 0.5, 0]} // Simulate fault in upper winding
                   oilClarity={0.85}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Oil Quality Parameters */}
           <SciFiCard title="油质理化指标" className="h-[180px] border-amber-900/50">
               <div className="grid grid-cols-4 gap-4 h-full items-center">
                   <div className="text-center p-2 border-r border-slate-800">
                       <div className="text-xs text-slate-500 mb-1">Moisture</div>
                       <div className="text-2xl font-mono text-white">{metrics.moisture}</div>
                       <div className="text-[10px] text-slate-600">ppm</div>
                   </div>
                   <div className="text-center p-2 border-r border-slate-800">
                       <div className="text-xs text-slate-500 mb-1">Breakdown V</div>
                       <div className="text-2xl font-mono text-green-400">{metrics.breakdownVoltage}</div>
                       <div className="text-[10px] text-slate-600">kV</div>
                   </div>
                   <div className="text-center p-2 border-r border-slate-800">
                       <div className="text-xs text-slate-500 mb-1">Dielectric</div>
                       <div className="text-2xl font-mono text-white">{metrics.dielectricLoss}</div>
                       <div className="text-[10px] text-slate-600">tanδ</div>
                   </div>
                   <div className="text-center p-2">
                       <div className="text-xs text-slate-500 mb-1">Acidity</div>
                       <div className="text-2xl font-mono text-white">{metrics.acidity}</div>
                       <div className="text-[10px] text-slate-600">mgKOH/g</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnosis Logic (Duval) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Duval Triangle Visualization (SVG Custom) */}
           <SciFiCard title="大卫三角诊断 (Duval Triangle 1)" subtitle="FAULT TYPE" className="flex-1 border-amber-900/50 bg-[#160c00]">
               <div className="w-full h-full flex flex-col items-center justify-center p-2">
                   <div className="relative w-56 h-48">
                       {/* Triangle SVG */}
                       <svg width="100%" height="100%" viewBox="0 0 200 173">
                           {/* Zones - Simplified for UI look */}
                           <path d="M0,173 L100,0 L200,173 Z" fill="none" stroke="#64748b" strokeWidth="2" />
                           
                           {/* Zone Separators (Approximate for visual style) */}
                           <path d="M60,173 L85,130" stroke="#444" strokeDasharray="2 2" />
                           <path d="M140,173 L115,130" stroke="#444" strokeDasharray="2 2" />
                           <path d="M100,0 L100,60" stroke="#444" strokeDasharray="2 2" />
                           
                           {/* Labels */}
                           <text x="5" y="170" fontSize="8" fill="#aaa">CH4</text>
                           <text x="95" y="10" fontSize="8" fill="#aaa">C2H2</text>
                           <text x="180" y="170" fontSize="8" fill="#aaa">C2H4</text>
                           
                           {/* Zone Labels */}
                           <text x="100" y="150" fontSize="10" fill="#3b82f6" textAnchor="middle">T3</text>
                           <text x="50" y="150" fontSize="10" fill="#10b981" textAnchor="middle">PD</text>
                           <text x="150" y="150" fontSize="10" fill="#ef4444" textAnchor="middle">D1</text>
                           
                           {/* Data Points */}
                           {DUVAL_HISTORY.map((p, i) => {
                               // Map 3 coordinates to Barycentric (Rough approximation for demo)
                               // C2H2 is top, CH4 is left, C2H4 is right
                               const sum = p.ch4 + p.c2h4 + p.c2h2;
                               const c2h2_pct = p.c2h2 / sum;
                               const c2h4_pct = p.c2h4 / sum;
                               
                               const x = 200 * c2h4_pct + 100 * c2h2_pct; 
                               const y = 173 * (1 - c2h2_pct); 
                               
                               const px = 100 * c2h2_pct + 0 * (p.ch4/sum) + 200 * (p.c2h4/sum);
                               const py = 0 * c2h2_pct + 173 * (p.ch4/sum) + 173 * (p.c2h4/sum);
                               
                               return (
                                   <circle key={i} cx={px} cy={py} r={i===DUVAL_HISTORY.length-1 ? 4 : 2} fill={i===DUVAL_HISTORY.length-1 ? '#fff' : '#f59e0b'} opacity={0.5 + i/20} />
                               );
                           })}
                       </svg>
                   </div>
                   
                   <div className="w-full mt-4 p-2 bg-slate-900/50 rounded text-xs text-center border border-slate-800">
                       <span className="text-slate-400">Current Zone:</span> <span className="text-white font-bold">T3 (Thermal &gt; 700°C)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Three Ratio Codes */}
           <SciFiCard title="三比值法编码 (IEC 60599)" className="border-amber-900/50">
               <div className="space-y-2">
                   {RATIO_CODES.map((r, i) => (
                       <div key={i} className={`flex justify-between items-center p-2 rounded border ${diagnosis.code === r.code.substring(0,2) ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/30 border-slate-800'}`}>
                           <span className="font-mono text-xs font-bold text-amber-500">{r.code}</span>
                           <span className="text-[10px] text-slate-300">{r.fault}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Action */}
           <button className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs rounded border border-red-900/50 flex items-center justify-center gap-2 transition-colors">
               <Search size={12} /> 启动在线脱气程序
           </button>

        </div>

      </div>
    </div>
  );
};
