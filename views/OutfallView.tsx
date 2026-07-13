import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-4]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-4';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';
import { 
  Droplets, Microscope, AlertTriangle, FileCheck, ScanEye, 
  Waves, Activity, Beaker, Fingerprint 
} from 'lucide-react';

export const OutfallView: React.FC = () => {
  // --- STATE ---
  const [waterMetrics, setWaterMetrics] = useState({
    cod: 28.5, // Chemical Oxygen Demand (mg/L)
    nh3n: 0.45, // Ammonia Nitrogen (mg/L)
    tp: 0.12, // Total Phosphorus (mg/L)
    ph: 7.4,
    turbidity: 4.2, // NTU
    flowRate: 1250, // m3/h
    temp: 18.5
  });

  const [compliance, setCompliance] = useState({
    grade: 'I', // Surface Water Quality Standard
    status: 'NORMAL',
    lastCheck: '10s ago'
  });

  // Spectral Data (simulating a spectrometer reading)
  const [spectralData, setSpectralData] = useState<any[]>([]);
  
  // History Data
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    // Init Spectral Data (Wavelength 200nm - 800nm)
    const initSpectrum = [];
    for(let w = 200; w <= 800; w+=10) {
        initSpectrum.push({ nm: w, abs: Math.random() * 0.5 });
    }
    setSpectralData(initSpectrum);

    // Init History Data
    const initHistory = Array.from({length: 24}, (_, i) => ({
        time: i,
        cod: 25 + Math.random() * 10,
        limit: 50 // Regulatory limit
    }));
    setHistoryData(initHistory);

    const interval = setInterval(() => {
      // 1. Update Metrics
      setWaterMetrics(prev => ({
        cod: Math.max(0, 28.5 + (Math.random() - 0.5) * 5),
        nh3n: Math.max(0, 0.45 + (Math.random() - 0.5) * 0.1),
        tp: Math.max(0, 0.12 + (Math.random() - 0.5) * 0.02),
        ph: 7.4 + (Math.random() - 0.5) * 0.2,
        turbidity: Math.max(0, 4.2 + (Math.random() - 0.5) * 1),
        flowRate: 1250 + (Math.random() - 0.5) * 50,
        temp: 18.5 + (Math.random() - 0.5) * 0.1,
      }));

      // 2. Animate Spectrum (simulate noise)
      setSpectralData(prev => prev.map(p => ({
          ...p,
          abs: Math.max(0, p.abs + (Math.random() - 0.5) * 0.05)
      })));

    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const radarData = [
    { subject: 'COD', A: waterMetrics.cod, fullMark: 50 },
    { subject: 'NH3-N', A: waterMetrics.nh3n * 20, fullMark: 50 }, // Scaled for viz
    { subject: 'TP', A: waterMetrics.tp * 100, fullMark: 50 }, // Scaled
    { subject: 'SS', A: waterMetrics.turbidity * 2, fullMark: 50 },
    { subject: 'TOC', A: 15, fullMark: 50 },
    { subject: 'Cond', A: 30, fullMark: 50 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-emerald-50 selection:bg-emerald-500/30">
      
      {/* HEADER: Outfall Specific */}
      <div className="flex items-end justify-between border-b border-emerald-500/30 pb-4 bg-gradient-to-r from-emerald-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Droplets size={12} className="animate-bounce" />
             ENVIRONMENTAL PROTECTION
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-emerald-400 text-shadow-glow">排污口</span> 智能监管中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">OUTFALL-04</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Discharge Flow</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">{waterMetrics.flowRate.toFixed(0)} <span className="text-sm text-slate-500">m³/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">pH Level</div>
                <div className="text-2xl font-mono font-bold text-white">{waterMetrics.ph.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Compliance</div>
                <div className="text-2xl font-mono font-bold text-green-400 bg-green-900/20 px-2 rounded">GRADE {compliance.grade}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Water Quality Data */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Real-time Pollutants */}
           <SciFiCard title="水质多参数实时监测" subtitle="WQI METRICS" className="border-emerald-900/50">
              <div className="grid grid-cols-1 gap-4">
                 
                 {/* COD */}
                 <div className="p-3 bg-white/5 rounded border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs text-emerald-400 font-bold">化学需氧量 (COD)</div>
                            <div className="text-xs text-slate-500">Limit: &lt;50 mg/L</div>
                        </div>
                        <Beaker size={16} className="text-emerald-600"/>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-white">{waterMetrics.cod.toFixed(1)}</span>
                        <span className="text-xs text-slate-400">mg/L</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{width: `${(waterMetrics.cod/50)*100}%`}}></div>
                    </div>
                 </div>

                 {/* NH3-N */}
                 <div className="p-3 bg-white/5 rounded border-l-4 border-cyan-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs text-cyan-400 font-bold">氨氮 (NH3-N)</div>
                            <div className="text-xs text-slate-500">Limit: &lt;1.5 mg/L</div>
                        </div>
                        <Activity size={16} className="text-cyan-600"/>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-white">{waterMetrics.nh3n.toFixed(3)}</span>
                        <span className="text-xs text-slate-400">mg/L</span>
                    </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{width: `${(waterMetrics.nh3n/1.5)*100}%`}}></div>
                    </div>
                 </div>

                 {/* TP */}
                 <div className="p-3 bg-white/5 rounded border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs text-yellow-400 font-bold">总磷 (TP)</div>
                            <div className="text-xs text-slate-500">Limit: &lt;0.3 mg/L</div>
                        </div>
                        <Microscope size={16} className="text-yellow-600"/>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-white">{waterMetrics.tp.toFixed(3)}</span>
                        <span className="text-xs text-slate-400">mg/L</span>
                    </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-yellow-500 h-full" style={{width: `${(waterMetrics.tp/0.3)*100}%`}}></div>
                    </div>
                 </div>

              </div>
           </SciFiCard>

           {/* Water Quality Radar */}
           <SciFiCard title="综合水质指数" className="flex-1 border-emerald-900/50">
              <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 60]} tick={false} axisLine={false} />
                    <Radar name="Water Quality" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[300px] bg-[#020d08] border border-emerald-800/40 relative rounded overflow-hidden shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]">
              {/* HUD Visual Analysis */}
              <div className="absolute top-4 left-4 z-10 w-64 bg-black/60 border border-emerald-500/30 backdrop-blur rounded p-2">
                 <div className="flex items-center gap-2 mb-2">
                     <ScanEye className="text-emerald-400 animate-pulse" size={16} />
                     <span className="text-xs text-emerald-100 font-bold">AI VISION ANALYSIS</span>
                 </div>
                 <div className="space-y-1">
                     <div className="flex justify-between text-[10px] text-slate-300">
                         <span>Surface Oil Sheen</span>
                         <span className="text-green-400">NOT DETECTED</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-300">
                         <span>Color Anomaly</span>
                         <span className="text-green-400">NONE</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-300">
                         <span>Floatables</span>
                         <span className="text-green-400">CLEAR</span>
                     </div>
                 </div>
              </div>

              {/* Valve Status */}
              <div className="absolute bottom-4 right-4 z-10">
                 <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] text-slate-500 uppercase">Discharge Valve</div>
                    <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1 rounded border border-emerald-500/50">
                       <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                       <span className="text-sm font-bold text-white">OPEN 100%</span>
                    </div>
                 </div>
              </div>

              <ThreeScene type="outfall" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Spectral Analysis */}
           <SciFiCard title="光谱指纹水质预警" subtitle="UV-VIS SPECTROSCOPY" className="h-[280px] border-emerald-900/50" noPadding>
              <div className="w-full h-full p-4 flex flex-col">
                 <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                     <Fingerprint size={12} className="text-emerald-500" />
                     <span>Fingerprint Matching: <span className="text-emerald-300">Match 98.2% (Standard Industrial Effluent)</span></span>
                 </div>
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spectralData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="nm" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Wavelength (nm)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Abs', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                        <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#10b981', color: '#fff'}} />
                        <Line type="monotone" dataKey="abs" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: History & Report */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 24H COD Trend */}
           <SciFiCard title="COD 排放趋势 (24H)" className="flex-1 border-emerald-900/50">
               <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                    <defs>
                        <linearGradient id="colorCod" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                    <YAxis stroke="#666" tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#10b981', color: '#fff'}} />
                    <ReferenceLine y={50} label={{ position: 'insideTopRight',  value: 'Limit', fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="cod" stroke="#10b981" fill="url(#colorCod)" />
                    </AreaChart>
                </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Compliance Report Card */}
           <SciFiCard title="排放合规性报告" subtitle="AUTO-GENERATED" className="border-emerald-900/50">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 p-3 bg-emerald-900/20 rounded border border-emerald-800/50">
                     <FileCheck size={24} className="text-emerald-400" />
                     <div>
                         <div className="text-sm font-bold text-white">Daily Permit Check</div>
                         <div className="text-xs text-green-400">PASSED</div>
                     </div>
                 </div>

                 <div className="space-y-2">
                     <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                         <span className="text-slate-400">Total Discharge</span>
                         <span className="text-white font-mono">15,402 m³</span>
                     </div>
                     <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                         <span className="text-slate-400">Permitted Limit</span>
                         <span className="text-slate-500 font-mono">20,000 m³</span>
                     </div>
                     <div className="flex justify-between items-center text-xs pt-1">
                         <span className="text-slate-400">Load Rate</span>
                         <span className="text-emerald-400 font-mono">77.0%</span>
                     </div>
                 </div>

                 <button className="w-full py-2 bg-emerald-700/30 hover:bg-emerald-600/50 text-emerald-200 text-xs uppercase tracking-wider rounded border border-emerald-600/50 transition-colors">
                     Download Full Report
                 </button>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};