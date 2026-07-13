
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-device-fault]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-device-fault';
import { 
  Activity, Mic, MicOff, Video, PhoneOff, Wifi, 
  Cpu, Zap, Thermometer, Gauge, Crosshair, 
  MessageSquare, FileText, Send, Share2, 
  Layers, Maximize2, Aperture, Radio,
  CheckCircle2, AlertTriangle, Workflow,
  ArrowRight, Download, BrainCircuit, Scan,
  PenTool, Type
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, CartesianGrid
} from 'recharts';

// --- Mock Data ---

const VITAL_SIGNS = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibX: Math.random() * 2 + 4, // 4-6 mm/s
  vibY: Math.random() * 1.5 + 2, // 2-3.5 mm/s
  temp: 75 + Math.random() * 2, // 75-77 C
}));

const SPECTRUM_DATA = Array.from({ length: 50 }, (_, i) => ({
  freq: i * 20, // 0 - 1000 Hz
  amp: i === 12 ? 85 : i === 24 ? 30 : Math.random() * 10 // Harmonic peaks
}));

const CHAT_LOGS = [
  { id: 1, role: 'System', text: '会诊链路已建立 (加密等级: AES-256)', time: '10:00:05' },
  { id: 2, role: 'Field', text: '专家您好，#3压缩机突发异响，振动值报警。', time: '10:01:20' },
  { id: 3, role: 'Expert', text: '收到。请保持当前工况，我正在调取实时频谱。', time: '10:02:15' },
  { id: 4, role: 'AI', text: '检测到 240Hz 处存在高能峰值，疑似轴承内圈剥落。', time: '10:02:45' },
];

const SOLUTION_STEPS = [
  { id: 1, title: '紧急降负荷', desc: '将机组负荷降至 60%', status: 'Executed', time: '10:05' },
  { id: 2, title: '切断辅油泵', desc: '隔离辅助润滑油路以排查压力波动', status: 'Pending', time: '-' },
  { id: 3, title: '频谱复核', desc: '再次采集 100-500Hz 振动数据', status: 'Pending', time: '-' },
];

// --- Sub-Components ---

const HolographicModel = () => (
  <div className="w-full h-full relative bg-[#05080f] rounded-lg overflow-hidden border border-cyan-900/30 group">
    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #0ea5e9 1px, transparent 1px)',
        backgroundSize: '20px 20px'
    }}></div>
    
    {/* Simulated 3D Content */}
    <div className="absolute inset-0 flex items-center justify-center">
       <div className="relative w-48 h-48 animate-pulse-slow">
           <ThreeScene type="pump" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div> {/* Using pump model as proxy for compressor */}
       </div>
    </div>
    
    {/* Data Points Overlay */}
    <div className="absolute top-1/4 left-1/4">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="bg-black/60 border border-red-500/50 px-2 py-1 rounded text-[10px] text-red-300">
                Bearing #2 (Temp: 78°C)
            </div>
        </div>
    </div>

    <div className="absolute bottom-4 left-4 text-[10px] font-mono text-cyan-500">
        DTWIN-SYNC: <span className="text-white">LIVE (12ms)</span>
    </div>
  </div>
);

const WaveformMonitor = () => (
  <div className="w-full h-24 bg-[#080b14] border-t border-slate-800 relative">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={VITAL_SIGNS}>
        <defs>
          <linearGradient id="gradVib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="vibX" stroke="#f59e0b" strokeWidth={2} fill="url(#gradVib)" isAnimationActive={false} />
        <Line type="monotone" dataKey="vibY" stroke="#3b82f6" strokeWidth={1} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
    <div className="absolute top-2 left-2 text-[9px] text-amber-500 font-bold bg-black/50 px-1 rounded">VIB-X (mm/s)</div>
  </div>
);

export const EquipmentFaultConsultationView: React.FC = () => {
  const [micActive, setMicActive] = useState(true);
  const [solutionStatus, setSolutionStatus] = useState<'Draft' | 'Sent' | 'Verified'>('Draft');

  const handlePushSolution = () => {
    setSolutionStatus('Sent');
    setTimeout(() => setSolutionStatus('Verified'), 3000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2">
      
      {/* 1. Command Header */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-3 rounded-lg backdrop-blur-md sticky top-0 z-50">
         <div className="flex items-center gap-4">
             <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg shadow-lg shadow-red-900/40">
                 <Activity className="text-white" size={20} />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-white tracking-wide">远程故障会诊中心</h1>
                 <div className="flex items-center gap-3 text-[10px] text-slate-400">
                     <span className="flex items-center gap-1"><Radio size={10} className="text-green-400 animate-pulse"/> 实时连线中</span>
                     <span className="w-px h-3 bg-slate-700"></span>
                     <span className="font-mono text-cyan-400">CASE-ID: #20240322-X9</span>
                     <span className="w-px h-3 bg-slate-700"></span>
                     <span>设备: 离心式压缩机 C-201</span>
                 </div>
             </div>
         </div>

         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-slate-700">
                 <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center text-[9px] font-bold text-white">Ex</div>
                     <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-black flex items-center justify-center text-[9px] font-bold text-white">Li</div>
                     <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-black flex items-center justify-center text-[9px] font-bold text-slate-400">+2</div>
                 </div>
                 <span className="text-xs text-slate-300">4 人在线</span>
             </div>
             <div className="flex gap-2">
                 <button className={`p-2 rounded-full border ${micActive ? 'bg-slate-800 border-slate-600 text-white' : 'bg-red-900/50 border-red-600 text-red-400'}`} onClick={() => setMicActive(!micActive)}>
                     {micActive ? <Mic size={16}/> : <MicOff size={16}/>}
                 </button>
                 <button className="p-2 rounded-full bg-slate-800 border border-slate-600 text-white hover:bg-slate-700">
                     <Video size={16}/>
                 </button>
                 <button className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all">
                     <PhoneOff size={14}/> 结束会诊
                 </button>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
         
         {/* LEFT: Context & Twin */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
             
             {/* Digital Twin Card */}
             <SciFiCard title="设备数字孪生 (Digital Twin)" subtitle="REAL-TIME" className="h-[280px] border-cyan-900/30" noPadding>
                 <HolographicModel />
             </SciFiCard>

             {/* Vitals */}
             <SciFiCard title="关键运行参数" subtitle="VITALS" className="border-slate-800">
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                             <Zap size={12} className="text-yellow-400"/> 负荷 (Load)
                         </div>
                         <div className="text-xl font-mono font-bold text-white">85.4 <span className="text-xs text-slate-500">%</span></div>
                     </div>
                     <div className="bg-slate-900/60 p-2 rounded border border-red-900/50 relative overflow-hidden">
                         <div className="absolute right-0 top-0 p-1"><AlertTriangle size={12} className="text-red-500 animate-pulse"/></div>
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                             <Activity size={12} className="text-red-400"/> 振动 (Vib)
                         </div>
                         <div className="text-xl font-mono font-bold text-red-400">8.2 <span className="text-xs text-red-300/70">mm/s</span></div>
                     </div>
                     <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                             <Thermometer size={12} className="text-orange-400"/> 轴温 (Temp)
                         </div>
                         <div className="text-xl font-mono font-bold text-white">78.5 <span className="text-xs text-slate-500">°C</span></div>
                     </div>
                     <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                             <Gauge size={12} className="text-cyan-400"/> 转速 (RPM)
                         </div>
                         <div className="text-xl font-mono font-bold text-white">12,450</div>
                     </div>
                 </div>
                 <div className="mt-3 pt-3 border-t border-slate-800">
                     <div className="text-[10px] text-slate-500 mb-1">振动趋势 (Vibration Trend)</div>
                     <div className="h-12 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={VITAL_SIGNS}>
                                 <Line type="monotone" dataKey="vibX" stroke="#ef4444" strokeWidth={2} dot={false} />
                             </LineChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* History Logs */}
             <SciFiCard title="报警历史" className="flex-1 border-slate-800">
                 <div className="space-y-2">
                     {[
                         { time: '10:00', code: 'E-204', desc: 'Vibration High Limit' },
                         { time: '09:58', code: 'W-102', desc: 'Oil Pressure Low' },
                         { time: '09:45', code: 'I-001', desc: 'System Auto-Balancing' },
                     ].map((log, i) => (
                         <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-900/30 rounded border border-slate-800/50 hover:bg-slate-800 transition-colors">
                             <div className="flex flex-col">
                                 <span className="font-bold text-slate-300">{log.code}</span>
                                 <span className="text-[9px] text-slate-500">{log.desc}</span>
                             </div>
                             <span className="font-mono text-slate-500 text-[10px]">{log.time}</span>
                         </div>
                     ))}
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER: Interaction & Analysis */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
             
             {/* Main Viewport (Video/AR) */}
             <div className="flex-1 bg-black rounded-lg border border-slate-800 relative overflow-hidden flex flex-col group">
                 {/* Live Video Placeholder */}
                 <div className="flex-1 relative bg-slate-900">
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center opacity-30">
                             <Video size={48} className="mx-auto mb-2 text-slate-500" />
                             <div className="text-sm font-mono">FIELD CAMERA FEED</div>
                         </div>
                     </div>
                     
                     {/* AR Overlay UI */}
                     <div className="absolute top-4 left-4 flex gap-2">
                         <div className="bg-black/60 backdrop-blur px-3 py-1 rounded text-[10px] text-green-400 border border-green-900/50 flex items-center gap-2">
                             <Scan size={12} className="animate-spin-slow"/> AR Tracking Active
                         </div>
                     </div>

                     {/* Annotation Tools */}
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/60 backdrop-blur p-2 rounded border border-slate-700">
                         <button className="p-2 hover:bg-cyan-600 rounded text-cyan-400 hover:text-white transition-colors"><Crosshair size={16}/></button>
                         <button className="p-2 hover:bg-cyan-600 rounded text-slate-300 hover:text-white transition-colors"><PenTool size={16}/></button>
                         <button className="p-2 hover:bg-cyan-600 rounded text-slate-300 hover:text-white transition-colors"><Type size={16}/></button>
                         <button className="p-2 hover:bg-cyan-600 rounded text-slate-300 hover:text-white transition-colors"><Layers size={16}/></button>
                     </div>

                     {/* Audio Waveform at bottom */}
                     <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black to-transparent">
                         <WaveformMonitor />
                     </div>
                 </div>
             </div>

             {/* Diagnostic Tools Row */}
             <div className="h-64 grid grid-cols-2 gap-4">
                 
                 {/* Spectrum Analysis */}
                 <SciFiCard title="频谱分析 (FFT Spectrum)" subtitle="LIVE" className="border-indigo-900/30">
                     <div className="w-full h-full p-2">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={SPECTRUM_DATA}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                 <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Hz', position: 'insideBottomRight', offset: -5 }} />
                                 <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f0a15', borderColor: '#8b5cf6', color: '#fff'}} />
                                 <Bar dataKey="amp" fill="#8b5cf6" barSize={4}>
                                     {SPECTRUM_DATA.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.amp > 80 ? '#ef4444' : '#8b5cf6'} />
                                     ))}
                                 </Bar>
                             </BarChart>
                         </ResponsiveContainer>
                         <div className="absolute top-8 right-4 text-[9px] text-red-400 border border-red-900/50 bg-red-900/20 px-2 py-1 rounded">
                             Anomaly @ 240Hz
                         </div>
                     </div>
                 </SciFiCard>

                 {/* Chat/Log */}
                 <SciFiCard title="会诊记录" subtitle="LOG" className="border-slate-800">
                     <div className="flex flex-col h-full">
                         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                             {CHAT_LOGS.map(msg => (
                                 <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'AI' ? 'bg-indigo-900/10 p-2 rounded border border-indigo-500/20' : ''}`}>
                                     <div className="flex justify-between items-baseline">
                                         <span className={`text-[10px] font-bold ${msg.role === 'AI' ? 'text-indigo-400' : msg.role === 'Expert' ? 'text-amber-400' : msg.role === 'System' ? 'text-slate-500' : 'text-cyan-400'}`}>
                                             {msg.role}
                                         </span>
                                         <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                                     </div>
                                     <div className={`text-xs ${msg.role === 'System' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                                         {msg.text}
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-2 pt-2 border-t border-slate-800 relative">
                             <input className="w-full bg-slate-900 border border-slate-700 rounded-full pl-3 pr-8 py-1.5 text-xs focus:border-cyan-500 outline-none text-white placeholder:text-slate-600" placeholder="Type instruction..." />
                             <Send size={12} className="absolute right-3 top-4 text-slate-500 hover:text-cyan-400 cursor-pointer" />
                         </div>
                     </div>
                 </SciFiCard>

             </div>

         </div>

         {/* RIGHT: Solution Delivery */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
             
             {/* AI Diagnosis */}
             <SciFiCard title="AI 辅助诊断" subtitle="AUTO" className="border-indigo-900/50 bg-indigo-950/10">
                 <div className="flex flex-col gap-3">
                     <div className="flex items-start gap-3">
                         <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-500/50">
                             <BrainCircuit size={20} />
                         </div>
                         <div>
                             <div className="text-xs font-bold text-white mb-1">Root Cause Analysis</div>
                             <div className="text-xl font-bold text-indigo-400">92% <span className="text-[10px] text-slate-400 font-normal">Confidence</span></div>
                         </div>
                     </div>
                     <p className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2 rounded border border-indigo-500/10">
                         故障特征与 <strong>轴承内圈剥落 (Inner Race Spalling)</strong> 模型高度匹配。建议立即执行停机检查流程。
                     </p>
                     <div className="grid grid-cols-2 gap-2">
                         <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-700">
                             <div className="text-[9px] text-slate-500 uppercase">Match ID</div>
                             <div className="text-xs font-mono text-cyan-300">#FAULT-B204</div>
                         </div>
                         <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-700">
                             <div className="text-[9px] text-slate-500 uppercase">Est. Repair</div>
                             <div className="text-xs font-mono text-white">4.5 Hours</div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Solution Delivery Panel */}
             <SciFiCard title="解决方案交付 (Solution Delivery)" subtitle="EXECUTION" className="flex-1 border-emerald-900/30">
                 <div className="flex flex-col h-full gap-4">
                     
                     {/* Steps */}
                     <div className="flex-1 space-y-3">
                         {SOLUTION_STEPS.map((step, i) => (
                             <div key={i} className={`p-3 rounded border transition-all relative overflow-hidden group
                                 ${step.status === 'Executed' ? 'bg-slate-900/30 border-slate-800 opacity-60' : 
                                   step.status === 'Pending' ? 'bg-slate-800/50 border-slate-600' : 'bg-emerald-900/20 border-emerald-500'}
                             `}>
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="text-xs font-bold text-white">{i+1}. {step.title}</span>
                                     {step.status === 'Executed' && <CheckCircle2 size={12} className="text-green-500"/>}
                                 </div>
                                 <div className="text-[10px] text-slate-400">{step.desc}</div>
                             </div>
                         ))}
                         
                         {/* Add Step Button */}
                         <button className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 text-xs hover:text-white hover:border-slate-400 transition-colors">
                             + Add Action Item
                         </button>
                     </div>

                     {/* Delivery Status */}
                     <div className="pt-4 border-t border-slate-800">
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-xs text-slate-400">Delivery Status</span>
                             <span className={`text-xs font-bold px-2 py-0.5 rounded border 
                                 ${solutionStatus === 'Verified' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                                   solutionStatus === 'Sent' ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 
                                   'bg-slate-800 text-slate-300 border-slate-600'}
                             `}>
                                 {solutionStatus}
                             </span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2">
                             <button className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                 <FileText size={14} /> Generate Report
                             </button>
                             <button 
                               onClick={handlePushSolution}
                               className={`py-2.5 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                                  ${solutionStatus === 'Verified' ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'}
                               `}
                             >
                                 {solutionStatus === 'Verified' ? <CheckCircle2 size={14} /> : <Send size={14} />}
                                 {solutionStatus === 'Verified' ? 'Closed' : 'Push Solution'}
                             </button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
