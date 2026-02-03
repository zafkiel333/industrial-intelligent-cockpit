
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Zap, Cpu, Search, Filter, 
  AlertTriangle, CheckCircle2, XCircle, 
  Share2, Save, RotateCw, Thermometer, 
  BarChart4, Waves, Stethoscope, Microscope,
  BrainCircuit, UserCheck, MessageSquare, History,
  FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, ReferenceLine, ComposedChart, Bar, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart
} from 'recharts';

// --- Types ---

interface AssetStatus {
  id: string;
  name: string;
  type: string;
  health: number; // 0-100
  status: 'Normal' | 'Warning' | 'Critical';
  lastUpdate: string;
}

interface DiagnosticSignal {
  time: string;
  vibration: number;
  temperature: number;
  acoustic: number;
  threshold_vib: number;
}

interface SpectrumData {
  freq: number;
  amplitude: number;
  harmonic: boolean; // Is it a harmonic frequency (1X, 2X, etc.)
}

interface FaultMatch {
  faultName: string;
  probability: number;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

// --- Mock Data ---

const ASSETS: AssetStatus[] = [
  { id: 'EQ-TUR-01', name: '#1 Gas Turbine', type: 'Rotating', health: 45, status: 'Critical', lastUpdate: 'Live' },
  { id: 'EQ-PMP-04', name: 'Feedwater Pump B', type: 'Hydraulic', health: 78, status: 'Warning', lastUpdate: 'Live' },
  { id: 'EQ-CMP-02', name: 'Air Compressor', type: 'Pneumatic', health: 92, status: 'Normal', lastUpdate: 'Live' },
  { id: 'EQ-FAN-08', name: 'Exhaust Fan', type: 'Rotating', health: 88, status: 'Normal', lastUpdate: '5m ago' },
  { id: 'EQ-GBX-03', name: 'Main Gearbox', type: 'Mechanical', health: 30, status: 'Critical', lastUpdate: 'Live' },
];

const FAULT_MATCHES: FaultMatch[] = [
  { faultName: 'Inner Race Bearing Defect', probability: 94.2, description: 'High frequency modulation detected around 2.4kHz.', severity: 'High' },
  { faultName: 'Rotor Unbalance', probability: 15.5, description: '1X amplitude is within normal range.', severity: 'Low' },
  { faultName: 'Gear Misalignment', probability: 28.0, description: '2X and 3X harmonics present but weak.', severity: 'Medium' },
];

const HEALTH_RADAR = [
  { subject: 'Vibration', A: 30, fullMark: 100 }, // Bad
  { subject: 'Thermal', A: 80, fullMark: 100 },
  { subject: 'Acoustic', A: 45, fullMark: 100 }, // Bad
  { subject: 'Lubrication', A: 90, fullMark: 100 },
  { subject: 'Electrical', A: 95, fullMark: 100 },
  { subject: 'Efficiency', A: 85, fullMark: 100 },
];

// --- Components ---

const StatusPill = ({ status }: { status: string }) => {
  const color = status === 'Normal' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-red-500';
  return <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor] animate-pulse`}></div>;
};

const SpectrumChart = () => {
  const data = Array.from({length: 60}, (_, i) => {
    let val = Math.random() * 10;
    if (i === 10) val = 80; // 1X
    if (i === 20) val = 20; // 2X
    if (i === 45) val = 60; // Fault Freq
    return { freq: i * 10, amp: val };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#fff'}} />
        <Bar dataKey="amp" fill="#ef4444" barSize={4}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.amp > 50 ? '#ef4444' : '#334155'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RemoteExpertDiagnosisView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState(ASSETS[0].id);
  const [telemetry, setTelemetry] = useState<DiagnosticSignal[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  const activeAsset = ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0];

  // Real-time Data Simulation
  useEffect(() => {
    const initData = Array.from({length: 40}, (_, i) => ({
      time: i.toString(),
      vibration: 2 + Math.random(),
      temperature: 65 + Math.random() * 2,
      acoustic: 40 + Math.random() * 5,
      threshold_vib: 4.5
    }));
    setTelemetry(initData);

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const lastT = parseInt(prev[prev.length-1].time);
        // Simulate a fault pattern
        const faultInjection = Math.sin(Date.now() / 500) * 3;
        
        const newPoint = {
          time: (lastT + 1).toString(),
          vibration: Math.max(0, 2 + Math.random() + (activeAsset.status === 'Critical' ? 3 + faultInjection : 0)),
          temperature: 65 + Math.random() + (activeAsset.status === 'Critical' ? 5 : 0),
          acoustic: 40 + Math.random() * 5 + (activeAsset.status === 'Critical' ? 15 : 0),
          threshold_vib: 4.5
        };
        return [...prev.slice(1), newPoint];
      });
    }, 200);

    return () => clearInterval(interval);
  }, [activeAsset]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* 1. Diagnostic HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/50 pb-4 bg-gradient-to-r from-[#1a0505] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-wider">
             <Stethoscope size={14} className="animate-pulse" /> Precision Diagnostics
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             智能设备 <span className="text-red-500">诊断中心</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Diagnostic Engine</div>
                <div className="text-xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                    <BrainCircuit size={16}/> ONLINE
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Active Alerts</div>
                <div className="text-xl font-mono font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle size={16}/> 3 Critical
                </div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
               <Activity size={14} /> 启动全系统扫描
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Asset Selector */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Filter assets..." className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:border-red-500 text-slate-200" />
           </div>

           <div className="flex flex-col gap-2">
               {ASSETS.map(asset => (
                   <div 
                     key={asset.id}
                     onClick={() => setSelectedAssetId(asset.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedAssetId === asset.id 
                            ? 'bg-red-950/20 border-red-500/50 shadow-[inset_4px_0_0_#ef4444]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
                           <StatusPill status={asset.status} />
                       </div>
                       <h3 className={`font-bold text-sm ${selectedAssetId === asset.id ? 'text-white' : 'text-slate-300'}`}>{asset.name}</h3>
                       
                       {/* Mini Health Bar */}
                       <div className="mt-2 flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${asset.health < 50 ? 'bg-red-500' : asset.health < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                 style={{width: `${asset.health}%`}}
                               ></div>
                           </div>
                           <span className="text-[9px] font-mono text-slate-400">{asset.health}%</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER: Deep Dive Analysis */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Multi-Signal Oscilloscope */}
           <SciFiCard title="多维信号示波器 (Signal Scope)" subtitle="REAL-TIME" className="h-[350px] border-red-900/30 bg-[#080505]" noPadding>
               <div className="w-full h-full p-2 flex flex-col">
                   <div className="flex justify-between px-4 pt-2 mb-2">
                       <div className="flex gap-4 text-xs">
                           <span className="flex items-center gap-1 text-red-400"><Activity size={12}/> Vibration X-Axis</span>
                           <span className="flex items-center gap-1 text-cyan-400"><Thermometer size={12}/> Bearing Temp</span>
                           <span className="flex items-center gap-1 text-yellow-400"><Zap size={12}/> Acoustic Emission</span>
                       </div>
                       <div className="text-[10px] text-slate-500 font-mono">Sample Rate: 2048 Hz</div>
                   </div>
                   
                   <div className="flex-1 relative overflow-hidden">
                       {/* CRT Grid Effect */}
                       <div className="absolute inset-0 pointer-events-none z-0" style={{
                           backgroundImage: 'linear-gradient(rgba(50,50,50,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(50,50,50,0.2) 1px, transparent 1px)',
                           backgroundSize: '20px 20px'
                       }}></div>

                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={telemetry} margin={{top:10, bottom:0, left:0, right:0}}>
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[0, 10]} hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                               
                               {/* Threshold Line */}
                               <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="5 5" label={{value:'ALARM', position:'right', fill:'red', fontSize:10}} />
                               
                               {/* Signals */}
                               <Area type="monotone" dataKey="acoustic" stroke="none" fill="url(#colorAcoustic)" fillOpacity={0.1} yAxisId={1}/>
                               <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                               <Line type="monotone" dataKey="temperature" stroke="#06b6d4" strokeWidth={1} dot={false} yAxisId={1} isAnimationActive={false} />
                               
                               <defs>
                                   <linearGradient id="colorAcoustic" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Advanced Analysis Row */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[280px]">
               
               {/* Frequency Spectrum */}
               <SciFiCard title="频谱特征分析 (FFT)" subtitle="FAULT SIGNATURE" className="border-slate-800">
                   <div className="w-full h-full p-2 relative">
                       <SpectrumChart />
                       <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none">
                           <div className="text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50 mb-1">
                               Harmonic: 2.4x BPFO
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Health Radar */}
               <SciFiCard title="子系统健康度雷达" subtitle="MULTI-DIMENSIONAL" className="border-slate-800">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Health" dataKey="A" stroke={activeAsset.status === 'Critical' ? '#ef4444' : '#10b981'} strokeWidth={2} fill={activeAsset.status === 'Critical' ? '#ef4444' : '#10b981'} fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#333', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT: Expert & AI Insights */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* AI Diagnosis Result */}
           <SciFiCard title="AI 故障指纹匹配" subtitle="AUTO-DIAG" className="border-red-900/50 bg-red-950/10">
               <div className="flex flex-col gap-3">
                   {FAULT_MATCHES.map((fault, i) => (
                       <div key={i} className="bg-slate-900/80 p-3 rounded border border-slate-700 hover:border-red-500/50 transition-colors group">
                           <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-bold text-slate-200 group-hover:text-white">{fault.faultName}</span>
                               <span className={`text-[10px] px-1.5 rounded font-bold ${fault.severity === 'High' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                   {fault.probability}%
                               </span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight">
                               {fault.description}
                           </p>
                       </div>
                   ))}
               </div>
               <div className="mt-4 pt-3 border-t border-red-900/30 text-center">
                   <button className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full">
                       <Microscope size={12} /> View Detailed Fault Logic
                   </button>
               </div>
           </SciFiCard>

           {/* Remote Expert Panel */}
           <SciFiCard title="远程专家会诊台" subtitle="HUMAN-IN-LOOP" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   {/* Expert Profile */}
                   <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                           W
                       </div>
                       <div className="flex-1">
                           <div className="text-sm font-bold text-white">Dr. Wang (Level 5)</div>
                           <div className="text-[10px] text-green-400 flex items-center gap-1">
                               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Reviewing Data...
                           </div>
                       </div>
                       <MessageSquare size={16} className="text-slate-500 hover:text-white cursor-pointer" />
                   </div>

                   {/* Expert Notes */}
                   <div className="flex-1 bg-slate-950/50 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed overflow-y-auto">
                       <span className="text-cyan-500">[10:42] System:</span> AI detected Inner Race fault.<br/>
                       <span className="text-indigo-400">[10:43] Dr. Wang:</span> Acknowledged. The 2.4kHz modulation is clear. However, checking lubrication records first.<br/>
                       <span className="text-indigo-400">[10:45] Dr. Wang:</span> Confirmed. Amplitude increased 20% in last 2 hours. Suggest immediate shutdown for inspection.
                   </div>

                   {/* Action Buttons */}
                   <div className="grid grid-cols-2 gap-2">
                       <button className="py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-lg shadow-red-900/20">
                           <Zap size={12} /> Stop Machine
                       </button>
                       <button className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded flex items-center justify-center gap-2">
                           <FileText size={12} /> Gen Report
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
