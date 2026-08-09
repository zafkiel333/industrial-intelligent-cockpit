
import React, { useState, useEffect } from 'react';
import { BushingScene } from '../../../components/predictive/hydro-bushing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-18]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-18';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Legend, ComposedChart, Bar, Cell
} from 'recharts';
import { 
  Zap, Activity, Thermometer, Droplets, AlertTriangle, 
  Layers, Scan, TrendingUp, Radio, Search, FileText
} from 'lucide-react';

// --- Mock Data ---

// PRPD Pattern (Phase Resolved Partial Discharge)
// A sine wave background + scatter points
const SINE_WAVE = Array.from({length: 37}, (_, i) => ({
    phase: i * 10,
    voltage: Math.sin(i * 10 * Math.PI / 180) * 100
}));

const generatePrpd = (intensity: number) => {
    const points = [];
    for(let i=0; i<300; i++) {
        // PD occurs mostly on rising edges of sine wave (0-90, 180-270)
        let phase = Math.random() * 360;
        let q = 0; // Charge
        
        // Simulating internal void discharge pattern
        if ((phase > 10 && phase < 80) || (phase > 190 && phase < 260)) {
            q = Math.random() * intensity + Math.random() * 10;
        } else {
            q = Math.random() * 5; // Noise
        }
        
        points.push({
            phase,
            q,
            count: Math.floor(Math.random() * 10)
        });
    }
    return points;
};

// Tan Delta Trend
const TAND_TREND = Array.from({length: 24}, (_, i) => ({
    month: `M-${24-i}`,
    tand: 0.3 + (i * 0.02) + Math.random() * 0.05, // Increasing trend
    cap: 100 + (i * 0.01) // Slight capacitance increase
}));

// Phase Data
const PHASES = [
    { id: 'A', status: 'Normal', pd: 45, tand: 0.35, cap: 100.2 },
    { id: 'B', status: 'Warning', pd: 450, tand: 0.62, cap: 101.5 },
    { id: 'C', status: 'Normal', pd: 50, tand: 0.38, cap: 100.4 },
];

export const BushingInsulationView: React.FC = () => {
  // --- STATE ---
  const [activePhase, setActivePhase] = useState<'A'|'B'|'C'>('B');
  const [viewMode, setViewMode] = useState<'external' | 'internal' | 'field'>('internal');
  const [metrics, setMetrics] = useState({
      voltage: 220.5, // kV
      current: 850, // A
      temp: 45.2, // C
      oilLevel: 92, // %
      pd: 450, // pC
      tand: 0.62, // %
      c1: 420.5, // pF
  });
  
  const [prpdData, setPrpdData] = useState<any[]>([]);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Fluctuate metrics based on active phase risk
        const baseRisk = activePhase === 'B' ? 1.0 : 0.1;
        
        setMetrics(prev => ({
            ...prev,
            voltage: 220 + Math.sin(t) * 0.5,
            pd: (activePhase === 'B' ? 400 : 40) + Math.random() * 50,
            tand: (activePhase === 'B' ? 0.6 : 0.3) + Math.random() * 0.01,
            temp: (activePhase === 'B' ? 55 : 45) + Math.sin(t*0.1),
        }));

        // Refresh PRPD points
        setPrpdData(generatePrpd(activePhase === 'B' ? 80 : 10));

    }, 500);
    return () => clearInterval(interval);
  }, [activePhase]);

  const activePhaseColor = activePhase === 'B' ? 'text-yellow-400' : 'text-blue-400';
  const activePhaseBg = activePhase === 'B' ? 'bg-yellow-900/20' : 'bg-blue-900/20';

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020205] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-indigo-900/40 pb-4 bg-gradient-to-r from-indigo-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             High Voltage Insulation Diagnosis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             套管局放 <span className="text-indigo-500">与绝缘老化风险评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Max Discharge (Qmax)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.pd > 100 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {metrics.pd.toFixed(0)} <span className="text-sm text-slate-500">pC</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Dielectric Loss (tgδ)</div>
                <div className={`text-2xl font-mono font-bold ${metrics.tand > 0.5 ? 'text-yellow-400' : 'text-white'}`}>
                    {metrics.tand.toFixed(3)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Risk Level</div>
                <div className={`text-2xl font-bold ${activePhase === 'B' ? 'text-orange-500' : 'text-green-500'}`}>
                    {activePhase === 'B' ? 'WARNING' : 'NORMAL'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Selection & Trends */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Phase Selector */}
           <SciFiCard title="相别监测状态" subtitle="PHASE STATUS" className="border-indigo-900/50 bg-[#0a0a12]/80">
               <div className="grid grid-cols-1 gap-2">
                   {PHASES.map(p => (
                       <div 
                         key={p.id} 
                         onClick={() => setActivePhase(p.id as any)}
                         className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all
                            ${activePhase === p.id 
                                ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                                   ${p.id === 'A' ? 'bg-yellow-500 text-black' : p.id === 'B' ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}
                               `}>
                                   {p.id}
                               </div>
                               <div>
                                   <div className="text-xs text-slate-400">Status</div>
                                   <div className={`text-sm font-bold ${p.status === 'Warning' ? 'text-yellow-400' : 'text-green-400'}`}>{p.status}</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-[10px] text-slate-500">Tan δ</div>
                               <div className="font-mono text-white">{p.tand.toFixed(2)}%</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Dielectric Loss Trend */}
           <SciFiCard title="介损与电容变化趋势" subtitle="AGING CURVE" className="flex-1 border-indigo-900/50">
               <div className="h-full w-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={TAND_TREND}>
                           <defs>
                               <linearGradient id="colorTand" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis yAxisId="left" stroke="#8b5cf6" tick={{fontSize: 10}} label={{ value: 'Tan δ (%)', angle: -90, position: 'insideLeft', fill: '#8b5cf6', fontSize: 10 }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} domain={[99, 102]} />
                           <Tooltip contentStyle={{backgroundColor: '#05030a', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Area yAxisId="left" type="monotone" dataKey="tand" stroke="#8b5cf6" fill="url(#colorTand)" name="Tan Delta" />
                           <Line yAxisId="right" type="monotone" dataKey="cap" stroke="#3b82f6" strokeWidth={1} dot={false} name="Capacitance" />
                           <ReferenceLine yAxisId="left" y={0.5} stroke="yellow" strokeDasharray="3 3" label={{value: 'Warn', fill: 'yellow', fontSize: 9}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#05030a] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(99,102,241,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setViewMode('external')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'external' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}>External</button>
                   <button onClick={() => setViewMode('internal')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'internal' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}>Internal</button>
                   <button onClick={() => setViewMode('field')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'field' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}>E-Field</button>
               </div>

               {/* Phase Indicator */}
               <div className="absolute top-4 right-4 z-10">
                   <div className={`px-4 py-2 rounded border backdrop-blur ${activePhaseBg} border-indigo-500/30`}>
                       <span className={`text-xl font-bold ${activePhaseColor}`}>Phase {activePhase}</span>
                       <div className="text-[10px] text-slate-400 text-right">OIP Bushing 220kV</div>
                   </div>
               </div>

               <div className="absolute bottom-4 left-4 z-10 space-y-1">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">Real-time Parameters</div>
                   <div className="flex gap-4 bg-black/60 p-2 rounded border border-slate-700">
                       <div className="flex flex-col">
                           <span className="text-[9px] text-slate-400">Voltage</span>
                           <span className="text-sm font-mono text-white">{metrics.voltage.toFixed(1)} kV</span>
                       </div>
                       <div className="flex flex-col">
                           <span className="text-[9px] text-slate-400">Temperature</span>
                           <span className="text-sm font-mono text-white">{metrics.temp.toFixed(1)} °C</span>
                       </div>
                       <div className="flex flex-col">
                           <span className="text-[9px] text-slate-400">Oil Level</span>
                           <span className="text-sm font-mono text-white">{metrics.oilLevel}%</span>
                       </div>
                   </div>
               </div>

               <BushingScene 
                   phase={activePhase}
                   voltageLevel={metrics.voltage}
                   pdIntensity={metrics.pd}
                   tanDelta={metrics.tand}
                   oilLevel={metrics.oilLevel}
                   viewMode={viewMode}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Equivalent Circuit / Parameters */}
           <div className="h-[120px] grid grid-cols-3 gap-4">
               <SciFiCard title="电容 C1" className="border-indigo-900/50">
                   <div className="text-2xl font-bold text-white mt-1">{metrics.c1.toFixed(1)} <span className="text-xs font-normal text-slate-500">pF</span></div>
                   <div className="text-xs text-green-400 mt-1 flex items-center gap-1"><TrendingUp size={10} /> +0.2% vs Ref</div>
               </SciFiCard>
               <SciFiCard title="电容 C2" className="border-indigo-900/50">
                   <div className="text-2xl font-bold text-white mt-1">1250.5 <span className="text-xs font-normal text-slate-500">pF</span></div>
                   <div className="text-xs text-slate-500 mt-1">Stable</div>
               </SciFiCard>
               <SciFiCard title="末屏绝缘电阻" className="border-indigo-900/50">
                   <div className="text-2xl font-bold text-white mt-1">2500 <span className="text-xs font-normal text-slate-500">MΩ</span></div>
                   <div className="text-xs text-green-400 mt-1">Status: Good</div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT: PRPD & Diagnosis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* PRPD Analysis */}
           <SciFiCard title="PRPD 指纹图谱" subtitle="PHASE RESOLVED" className="h-[300px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   {/* Background Sine */}
                   <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={SINE_WAVE}>
                               <Line type="monotone" dataKey="voltage" stroke="#fff" strokeWidth={1} dot={false} />
                               <YAxis domain={[-110, 110]} hide />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   
                   {/* PD Scatter */}
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 10, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                           <XAxis type="number" dataKey="phase" name="Phase" unit="°" domain={[0, 360]} stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis type="number" dataKey="q" name="Charge" unit="pC" stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#05030a', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Scatter name="PD" data={prpdData} fill={activePhase === 'B' ? '#ef4444' : '#3b82f6'} shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Diagnostic Result */}
           <SciFiCard title="绝缘状态诊断" className="flex-1 border-indigo-900/50">
               <div className="flex flex-col gap-4">
                   <div className={`p-3 rounded border ${activePhase === 'B' ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-green-900/20 border-green-500/50'}`}>
                       <div className="flex items-center gap-2 mb-1">
                           <Search size={14} className={activePhase === 'B' ? 'text-yellow-400' : 'text-green-400'} />
                           <span className="text-xs font-bold text-white uppercase">AI Analysis Result</span>
                       </div>
                       <p className="text-xs text-slate-300">
                           {activePhase === 'B' 
                             ? 'Detected internal void discharge pattern (Rabbit Ear). Correlation with humidity change observed.' 
                             : 'No significant partial discharge patterns detected. Insulation system healthy.'}
                       </p>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Aging Factor</span>
                           <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500" style={{width: activePhase === 'B' ? '65%' : '25%'}}></div>
                           </div>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Breakdown Risk</span>
                           <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-red-500" style={{width: activePhase === 'B' ? '45%' : '5%'}}></div>
                           </div>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 text-xs rounded border border-indigo-900/50 flex items-center justify-center gap-2 transition-colors">
                       <FileText size={12} /> View Detailed Report
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
