
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Video, Mic, MicOff, PhoneOff, PenTool, 
  Type, MousePointer2, Eraser, Layers, 
  FileText, CheckSquare, AlertTriangle, 
  Wifi, Battery, Signal, Maximize2, 
  ChevronRight, BrainCircuit, ScanLine,
  ArrowRight, Activity, Crosshair, Zap,
  Thermometer, Gauge
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

// --- Types ---

interface Step {
  id: number;
  text: string;
  status: 'Pending' | 'Active' | 'Completed';
  timeEstimate: string;
  warning?: string;
}

interface TelemetryData {
  time: string;
  torque: number; // Nm
  speed: number; // RPM
  current: number; // A
}

// --- Mock Data ---

const SOP_STEPS: Step[] = [
  { id: 1, text: '隔离主电源并锁定 (LOTO)', status: 'Completed', timeEstimate: '2m' },
  { id: 2, text: '拆除伺服电机后盖防护板', status: 'Completed', timeEstimate: '5m' },
  { id: 3, text: '断开编码器通信线缆 (X3接口)', status: 'Active', timeEstimate: '1m', warning: '注意卡扣位置，勿用力过猛' },
  { id: 4, text: '松开联轴器紧固螺丝', status: 'Pending', timeEstimate: '3m' },
  { id: 5, text: '校准零位并重新上电测试', status: 'Pending', timeEstimate: '10m' },
];

const INITIAL_TELEMETRY: TelemetryData[] = Array.from({length: 60}, (_, i) => ({
  time: i.toString(),
  torque: 0,
  speed: 0,
  current: 0.5 + Math.random() * 0.1
}));

// --- Components ---

const ARAnnotation = ({ type, x, y, label }: { type: 'arrow' | 'circle' | 'text', x: number, y: number, label?: string }) => {
  return (
    <div 
      className="absolute pointer-events-none animate-in fade-in zoom-in duration-300"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {type === 'circle' && (
        <div className="w-16 h-16 border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_red] animate-pulse"></div>
      )}
      {type === 'arrow' && (
        <div className="-translate-x-1/2 -translate-y-1/2">
           <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
             <path d="M10 50 L50 10 M50 10 L20 10 M50 10 L50 40" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
        </div>
      )}
      {label && (
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black/70 border border-red-500 text-red-100 text-xs px-2 py-1 rounded whitespace-nowrap backdrop-blur-md">
          {label}
        </div>
      )}
    </div>
  );
};

export const RemoteExpertGuidanceView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>(INITIAL_TELEMETRY);
  const [activeTool, setActiveTool] = useState<'pointer' | 'pen' | 'text' | 'eraser'>('pointer');
  const [isLive, setIsLive] = useState(true);

  // Simulate telemetry stream based on "Active Step" context
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const lastT = parseInt(prev[prev.length - 1].time);
        // Simulate a slight perturbation representing "handling"
        const noise = Math.random();
        const newPoint = {
          time: (lastT + 1).toString(),
          torque: noise * 0.5,
          speed: 0,
          current: 0.5 + noise * 0.2
        };
        return [...prev.slice(1), newPoint];
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#000]">
      
      {/* 1. Top Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-red-900/30 border border-red-900 text-red-500 px-3 py-1 rounded text-xs font-bold animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div> LIVE
             </div>
             <div className="h-6 w-px bg-slate-700"></div>
             <div>
                <div className="text-[10px] text-slate-500 uppercase">Case ID</div>
                <div className="text-sm font-mono font-bold text-white">#REQ-8842-FIX</div>
             </div>
             <div>
                <div className="text-[10px] text-slate-500 uppercase">Remote Tech</div>
                <div className="text-sm font-bold text-cyan-400">Li Engineer (Site B)</div>
             </div>
         </div>

         <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                 <div className="flex items-center gap-1"><Wifi size={14} className="text-green-500"/> 5G Stable</div>
                 <div className="flex items-center gap-1"><Battery size={14} className="text-green-500"/> 82%</div>
                 <div className="flex items-center gap-1"><Signal size={14} className="text-green-500"/> -42dBm</div>
             </div>
             <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                <PhoneOff size={16} /> End Call
             </button>
         </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 px-4 pb-4">
         
         {/* LEFT: AR Video Feed & Tools */}
         <div className="flex-1 flex flex-col gap-4 relative">
             
             {/* The "Video Feed" */}
             <div className="flex-1 bg-[#0a0f18] rounded-lg border border-slate-700 relative overflow-hidden group">
                 
                 {/* Simulated Video Content (Static BG for now with CSS grid) */}
                 <div className="absolute inset-0 opacity-20" style={{
                     backgroundImage: 'radial-gradient(#1e293b 2px, transparent 2px)',
                     backgroundSize: '40px 40px'
                 }}></div>
                 
                 {/* Simulated Camera View - Servo Motor Schematic Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative w-[60%] h-[60%] border-2 border-slate-600/50 rounded-lg flex items-center justify-center">
                         <div className="text-slate-700 font-bold text-9xl select-none opacity-20">SERVO MOTOR</div>
                         
                         {/* AR Object Detection Bounding Box */}
                         <div className="absolute top-10 right-10 w-32 h-32 border-2 border-cyan-500/80 rounded corner-bracket">
                             <div className="absolute -top-3 left-2 bg-cyan-900 text-cyan-300 text-[10px] px-1">Encoder X3</div>
                         </div>
                         
                         {/* AR Annotations */}
                         <ARAnnotation type="circle" x={75} y={35} label="Disconnect Here" />
                         <ARAnnotation type="arrow" x={65} y={45} />
                     </div>
                 </div>

                 {/* HUD Overlays */}
                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                     <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-slate-600 text-xs text-white font-mono flex items-center gap-2">
                        <ScanLine size={14} className="text-cyan-400" /> Object Tracking: ACTIVE
                     </div>
                 </div>

                 {/* Toolbar (Bottom Center) */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-full shadow-2xl">
                     <button onClick={() => setActiveTool('pointer')} className={`p-3 rounded-full transition-all ${activeTool === 'pointer' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                         <MousePointer2 size={20} />
                     </button>
                     <button onClick={() => setActiveTool('pen')} className={`p-3 rounded-full transition-all ${activeTool === 'pen' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                         <PenTool size={20} />
                     </button>
                     <button onClick={() => setActiveTool('text')} className={`p-3 rounded-full transition-all ${activeTool === 'text' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                         <Type size={20} />
                     </button>
                     <div className="w-px h-8 bg-slate-700 mx-1"></div>
                     <button className="p-3 rounded-full hover:bg-slate-800 text-slate-400">
                         <Eraser size={20} />
                     </button>
                     <button className="p-3 rounded-full hover:bg-slate-800 text-slate-400">
                         <Layers size={20} />
                     </button>
                     <div className="w-px h-8 bg-slate-700 mx-1"></div>
                     <button className="p-3 rounded-full hover:bg-red-900/50 text-red-400">
                         <Mic size={20} />
                     </button>
                     <button className="p-3 rounded-full bg-slate-800 text-white border border-slate-600">
                         <Video size={20} />
                     </button>
                 </div>
             </div>

             {/* Bottom Telemetry Panel */}
             <div className="h-40 grid grid-cols-3 gap-4">
                 
                 <SciFiCard title="实时扭矩 (Torque)" className="border-slate-800 bg-slate-900/20" noPadding>
                     <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={telemetry}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <YAxis hide domain={[0, 1]} />
                              <Area type="monotone" dataKey="torque" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} isAnimationActive={false} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                 </SciFiCard>

                 <SciFiCard title="电机电流 (Current)" className="border-slate-800 bg-slate-900/20" noPadding>
                     <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={telemetry}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <YAxis hide domain={[0, 2]} />
                              <Area type="monotone" dataKey="current" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} isAnimationActive={false} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                 </SciFiCard>

                 <div className="grid grid-rows-2 gap-2">
                     <div className="bg-slate-900/50 border border-slate-700 rounded p-2 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-slate-400 text-xs">
                             <Thermometer size={14} className="text-red-400"/> Core Temp
                         </div>
                         <span className="font-mono font-bold text-white">45.2°C</span>
                     </div>
                     <div className="bg-slate-900/50 border border-slate-700 rounded p-2 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-slate-400 text-xs">
                             <Gauge size={14} className="text-green-400"/> Bus Voltage
                         </div>
                         <span className="font-mono font-bold text-white">380.5V</span>
                     </div>
                 </div>
             </div>

         </div>

         {/* RIGHT: SOP & Chat */}
         <div className="w-[320px] flex flex-col gap-4">
             
             {/* SOP Checklist */}
             <SciFiCard title="操作指引 (SOP)" subtitle="STEP 3/5" className="flex-1 border-cyan-900/50">
                 <div className="flex flex-col gap-0 h-full overflow-y-auto custom-scrollbar">
                     {SOP_STEPS.map((step, i) => (
                         <div key={step.id} className={`relative p-3 border-l-2 transition-colors ${
                             step.status === 'Active' ? 'border-cyan-500 bg-cyan-900/10' : 
                             step.status === 'Completed' ? 'border-green-500 bg-green-900/5 opacity-60' : 'border-slate-700'
                         }`}>
                             <div className="flex justify-between items-start mb-1">
                                 <span className={`text-xs font-bold ${step.status === 'Active' ? 'text-cyan-300' : 'text-slate-300'}`}>
                                     Step {step.id}
                                 </span>
                                 <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-400">{step.timeEstimate}</span>
                             </div>
                             <p className={`text-sm ${step.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                 {step.text}
                             </p>
                             {step.warning && (
                                 <div className="mt-2 flex items-start gap-1 text-[10px] text-yellow-500 bg-yellow-900/20 p-1.5 rounded border border-yellow-900/50">
                                     <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                                     {step.warning}
                                 </div>
                             )}
                             {step.status === 'Active' && (
                                 <button className="mt-3 w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                                     <CheckSquare size={12} /> Mark Complete
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Smart Assist */}
             <SciFiCard title="AI 辅助提示" subtitle="ASSISTANT" className="h-[180px] border-indigo-900/50">
                 <div className="flex flex-col gap-3">
                     <div className="p-2 bg-indigo-900/20 border border-indigo-500/30 rounded flex items-start gap-2">
                         <BrainCircuit size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                         <div>
                             <div className="text-xs font-bold text-indigo-200">Safety Check</div>
                             <p className="text-[10px] text-slate-400 leading-tight">
                                 Detected high voltage proximity. Ensure technician is wearing insulated gloves.
                             </p>
                         </div>
                     </div>
                     <div className="p-2 bg-slate-900/50 border border-slate-700 rounded flex items-start gap-2">
                         <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                         <div>
                             <div className="text-xs font-bold text-slate-200">Related Doc</div>
                             <p className="text-[10px] text-cyan-400 cursor-pointer hover:underline">
                                 Manual_Servo_v2.pdf (Page 45)
                             </p>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
