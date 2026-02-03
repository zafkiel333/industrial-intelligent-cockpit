
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Mic, Video, PhoneOff, Monitor, Share2, 
  MessageSquare, FileText, Paperclip, Send, 
  Wifi, Signal, Battery, Activity, Clock,
  User, CheckCircle2, AlertCircle, Sparkles,
  Command, Layers, Maximize2, Minimize2,
  Headphones, Radio, UploadCloud, Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';

// --- Types ---

interface Message {
  id: string;
  sender: string;
  role: 'Expert' | 'Local' | 'System' | 'AI';
  content: string;
  time: string;
  type: 'text' | 'image' | 'file' | 'audio';
}

interface Participant {
  id: string;
  name: string;
  title: string;
  location: string;
  status: 'Speaking' | 'Listening' | 'Muted';
  signal: number; // 0-100
  avatarColor: string;
}

interface AiInsight {
  id: string;
  type: 'Keyword' | 'Warning' | 'Suggestion';
  text: string;
  confidence: number;
}

// --- Mock Data ---

const PARTICIPANTS: Participant[] = [
  { id: 'EXP-01', name: 'Dr. Zhang (Chief)', title: 'Propulsion Expert', location: 'Beijing HQ', status: 'Speaking', signal: 95, avatarColor: '#f59e0b' },
  { id: 'LOC-01', name: 'Tech Liu', title: 'Site Engineer', location: 'Plant B - Zone 4', status: 'Listening', signal: 78, avatarColor: '#0ea5e9' },
  { id: 'EXP-02', name: 'Sarah Wu', title: 'Electrical Lead', location: 'Remote', status: 'Muted', signal: 92, avatarColor: '#8b5cf6' },
];

const CHAT_HISTORY: Message[] = [
  { id: '1', sender: 'System', role: 'System', content: 'Secure connection established. Session ID: #RCS-8842', time: '10:00:00', type: 'text' },
  { id: '2', sender: 'Tech Liu', role: 'Local', content: '专家您好，我已到达3号燃机现场。振动读数异常，请看摄像头画面。', time: '10:02:15', type: 'text' },
  { id: '3', sender: 'Dr. Zhang', role: 'Expert', content: '收到。请将探头靠近2号轴承座，我想听一下异响的声音特征。', time: '10:03:00', type: 'text' },
  { id: '4', sender: 'Tech Liu', role: 'Local', content: 'Audio_Sample_001.wav', time: '10:03:45', type: 'audio' },
  { id: '5', sender: 'AI Copilot', role: 'AI', content: 'Audio Analysis: Detected high-frequency squeal consistent with bearing cage failure (92% match).', time: '10:03:50', type: 'text' },
];

const AI_INSIGHTS: AiInsight[] = [
  { id: 'I1', type: 'Warning', text: 'Vibration > 8.5mm/s detected in feed', confidence: 98 },
  { id: 'I2', type: 'Suggestion', text: 'Reference Case #KB-992: Bearing Seizure', confidence: 85 },
  { id: 'I3', type: 'Keyword', text: 'Keywords: "Squeal", "Heat", "Axis 2"', confidence: 100 },
];

const AUDIO_WAVE_DATA = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  val: Math.random() * 100
}));

// --- Helper Components ---

const SignalBars = ({ strength }: { strength: number }) => (
  <div className="flex gap-0.5 items-end h-3">
    <div className={`w-1 rounded-sm ${strength > 20 ? 'bg-green-500' : 'bg-slate-700'} h-[20%]`}></div>
    <div className={`w-1 rounded-sm ${strength > 40 ? 'bg-green-500' : 'bg-slate-700'} h-[40%]`}></div>
    <div className={`w-1 rounded-sm ${strength > 60 ? 'bg-green-500' : 'bg-slate-700'} h-[60%]`}></div>
    <div className={`w-1 rounded-sm ${strength > 80 ? 'bg-green-500' : 'bg-slate-700'} h-[80%]`}></div>
  </div>
);

const UserAvatar = ({ user, size = 'md' }: { user: Participant, size?: 'sm'|'md'|'lg' }) => {
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-800 shadow-lg`} style={{backgroundColor: user.avatarColor}}>
        {user.name.charAt(0)}
      </div>
      {user.status === 'Speaking' && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border border-black animate-pulse">
           <Mic size={size === 'lg' ? 12 : 8} className="text-white"/>
        </div>
      )}
      {user.status === 'Muted' && (
        <div className="absolute -bottom-1 -right-1 bg-red-500 p-1 rounded-full border border-black">
           <PhoneOff size={size === 'lg' ? 12 : 8} className="text-white"/>
        </div>
      )}
    </div>
  );
};

export const RemoteExpertConsultationView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('video'); // video, whiteboard, data
  const [audioData, setAudioData] = useState(AUDIO_WAVE_DATA);

  // Simulate audio wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioData(prev => {
        const next = [...prev];
        next.shift();
        next.push({ time: Date.now(), val: Math.random() * 100 });
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020408]">
      
      {/* 1. Header Status Bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-slate-900/80 border-b border-cyan-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm">
              <Radio className="animate-pulse" size={16} /> Live Consultation
           </div>
           <div className="h-4 w-px bg-slate-700"></div>
           <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-white">Ticket #8842</span>
              <span>•</span>
              <span>Gas Turbine Vibration Issue</span>
           </div>
        </div>
        
        <div className="flex items-center gap-6 text-xs font-mono">
           <div className="flex items-center gap-2 text-green-400">
              <Wifi size={14} /> Stable (12ms)
           </div>
           <div className="flex items-center gap-2 text-blue-400">
              <Activity size={14} /> Bandwidth: 4.5 MB/s
           </div>
           <div className="bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900/50 animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div> REC 00:15:24
           </div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded font-bold transition-colors shadow-lg shadow-red-900/20">
              End Session
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden px-4 pb-4">
        
        {/* LEFT: Communication Hub (Chat & Participants) */}
        <div className="w-[320px] flex flex-col gap-4">
           
           {/* Participants Card */}
           <SciFiCard title="参会人员 (Participants)" className="border-slate-800 bg-[#0b0e17]">
               <div className="flex flex-col gap-3">
                   {PARTICIPANTS.map(p => (
                       <div key={p.id} className={`flex items-center justify-between p-2 rounded border transition-colors ${p.status === 'Speaking' ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
                           <div className="flex items-center gap-3">
                               <UserAvatar user={p} />
                               <div>
                                   <div className="text-xs font-bold text-slate-200">{p.name}</div>
                                   <div className="text-[10px] text-slate-500">{p.title}</div>
                               </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                               <SignalBars strength={p.signal} />
                               <span className="text-[9px] text-slate-500 uppercase">{p.location}</span>
                           </div>
                       </div>
                   ))}
                   <button className="mt-2 w-full py-2 border border-dashed border-slate-600 rounded text-slate-400 text-xs hover:text-white hover:border-cyan-500 transition-colors flex items-center justify-center gap-2">
                       <User size={12} /> Invite Expert
                   </button>
               </div>
           </SciFiCard>

           {/* Chat Stream */}
           <div className="flex-1 flex flex-col bg-[#0b0e17] border border-slate-800 rounded-lg overflow-hidden">
               <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                       <MessageSquare size={12} /> Session Log
                   </span>
                   <button className="text-slate-500 hover:text-white"><FileText size={14}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                   {CHAT_HISTORY.map(msg => (
                       <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'Local' ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-2 text-[10px] text-slate-500">
                               <span className="font-bold text-slate-300">{msg.sender}</span>
                               <span>{msg.time}</span>
                           </div>
                           
                           {msg.type === 'audio' ? (
                               <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center gap-2 w-48">
                                   <div className="p-1.5 bg-cyan-900/50 rounded-full text-cyan-400"><Headphones size={12}/></div>
                                   <div className="flex-1 h-6 flex items-center gap-0.5">
                                       {Array.from({length:15}).map((_,i) => (
                                           <div key={i} className="w-1 bg-cyan-500/50 rounded-full" style={{height: `${Math.random()*100}%`}}></div>
                                       ))}
                                   </div>
                               </div>
                           ) : msg.role === 'AI' ? (
                               <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3 text-xs text-indigo-200 max-w-[90%]">
                                   <div className="flex items-center gap-1 mb-1 text-indigo-400 font-bold uppercase text-[9px]"><Sparkles size={10}/> Insight</div>
                                   {msg.content}
                               </div>
                           ) : (
                               <div className={`rounded-lg p-2 text-xs max-w-[90%] text-slate-200 border
                                   ${msg.role === 'Local' ? 'bg-cyan-900/20 border-cyan-800' : 'bg-slate-800 border-slate-700'}
                               `}>
                                   {msg.content}
                               </div>
                           )}
                       </div>
                   ))}
               </div>

               <div className="p-3 bg-slate-900/80 border-t border-slate-800">
                   <div className="flex items-center gap-2 bg-black/40 border border-slate-700 rounded-full px-2 py-1">
                       <input 
                         type="text" 
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         placeholder="Type message..."
                         className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 h-8"
                       />
                       <button className="text-slate-500 hover:text-cyan-400"><Paperclip size={14}/></button>
                       <button className="p-1.5 bg-cyan-600 rounded-full text-white hover:bg-cyan-500"><Send size={12}/></button>
                   </div>
               </div>
           </div>

        </div>

        {/* CENTER: Main Stage (Visual Collaboration) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* Viewport Controls */}
           <div className="flex items-center justify-between">
               <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
                   {['video', 'whiteboard', 'data'].map(mode => (
                       <button
                         key={mode} 
                         onClick={() => setActiveTab(mode)}
                         className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-2
                             ${activeTab === mode ? 'bg-cyan-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}
                         `}
                       >
                           {mode === 'video' && <Video size={14}/>}
                           {mode === 'whiteboard' && <Layers size={14}/>}
                           {mode === 'data' && <Activity size={14}/>}
                           {mode}
                       </button>
                   ))}
               </div>
               
               <div className="flex gap-2">
                   <button className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white"><Share2 size={16}/></button>
                   <button className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white"><Maximize2 size={16}/></button>
               </div>
           </div>

           {/* Main Viewport */}
           <div className="flex-1 bg-black rounded-lg border border-slate-800 relative overflow-hidden group">
               {/* Grid Overlay */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                   backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                   backgroundSize: '40px 40px'
               }}></div>

               {/* Simulated AR View / Shared Screen */}
               <div className="absolute inset-0 flex items-center justify-center">
                   {activeTab === 'video' && (
                       <div className="relative w-full h-full">
                           {/* Main Feed (Site) */}
                           <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                               {/* Placeholder for video stream */}
                               <div className="text-slate-600 flex flex-col items-center gap-4">
                                   <div className="w-20 h-20 border-4 border-slate-700 rounded-full border-t-cyan-500 animate-spin"></div>
                                   <span className="text-sm font-mono uppercase tracking-widest">Receiving Stream...</span>
                               </div>
                               
                               {/* Mock AR Overlay Elements */}
                               <div className="absolute top-[20%] left-[30%] border border-green-500/50 bg-green-500/10 p-2 rounded text-[10px] text-green-400 animate-pulse">
                                   Temp: 65°C [Normal]
                               </div>
                               <div className="absolute bottom-[30%] right-[40%] border border-red-500/50 bg-red-500/10 p-2 rounded text-[10px] text-red-400">
                                   Vib: 8.5mm/s [Alert]
                               </div>
                           </div>

                           {/* PIP (Expert) */}
                           <div className="absolute top-4 right-4 w-48 h-32 bg-slate-800 rounded border border-slate-600 shadow-xl overflow-hidden">
                               <div className="w-full h-full flex items-center justify-center bg-[#1a1d2d]">
                                   <User size={32} className="text-slate-500" />
                               </div>
                               <div className="absolute bottom-1 left-1 text-[9px] bg-black/60 px-1 rounded text-white">Dr. Zhang</div>
                           </div>
                       </div>
                   )}
                   
                   {activeTab === 'data' && (
                       <div className="w-full h-full p-8 grid grid-cols-2 gap-8">
                           <SciFiCard title="实时波形 (Real-time Waveform)" className="border-cyan-900/50">
                               <div className="h-full w-full">
                                   <ResponsiveContainer width="100%" height="100%">
                                       <AreaChart data={audioData}>
                                           <defs>
                                               <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                               </linearGradient>
                                           </defs>
                                           <Area type="monotone" dataKey="val" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorWave)" isAnimationActive={false} />
                                       </AreaChart>
                                   </ResponsiveContainer>
                               </div>
                           </SciFiCard>
                           <div className="grid grid-rows-3 gap-4">
                               <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex justify-between items-center">
                                   <span className="text-sm text-slate-400">RPM</span>
                                   <span className="text-2xl font-mono font-bold text-white">3,000</span>
                               </div>
                               <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex justify-between items-center">
                                   <span className="text-sm text-slate-400">Load</span>
                                   <span className="text-2xl font-mono font-bold text-green-400">85%</span>
                               </div>
                               <div className="bg-slate-900/50 border border-red-900/50 p-4 rounded flex justify-between items-center">
                                   <span className="text-sm text-slate-400">Vibration (X)</span>
                                   <span className="text-2xl font-mono font-bold text-red-500 animate-pulse">8.5 mm/s</span>
                               </div>
                           </div>
                       </div>
                   )}
               </div>

               {/* Bottom Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-2xl z-20">
                   <button className="p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"><Mic size={20}/></button>
                   <button className="p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"><Video size={20}/></button>
                   <button className="p-3 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 transition-colors shadow-[0_0_15px_#0ea5e9]"><Monitor size={20}/></button>
                   <button className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors ml-4"><PhoneOff size={20}/></button>
               </div>
           </div>

        </div>

        {/* RIGHT: Intelligence Sidebar */}
        <div className="w-[300px] flex flex-col gap-4">
           
           {/* AI Transcription */}
           <SciFiCard title="智能语音转录 (Live Transcript)" subtitle="AI-NLP" className="h-[250px] border-slate-800">
               <div className="flex flex-col h-full gap-2 overflow-y-auto custom-scrollbar pr-1">
                   <div className="text-[10px] text-slate-500 italic text-center py-1">Session started 10:00 AM</div>
                   <div className="text-xs">
                       <span className="text-cyan-400 font-bold">Tech Liu:</span> <span className="text-slate-300">Readings are fluctuating.</span>
                   </div>
                   <div className="text-xs">
                       <span className="text-amber-400 font-bold">Dr. Zhang:</span> <span className="text-slate-300">Check the coupling alignment first.</span>
                   </div>
                   <div className="text-xs">
                       <span className="text-purple-400 font-bold">AI Bot:</span> <span className="text-slate-400 italic">Reference manual p.45 "Alignment Specs" linked.</span>
                   </div>
                   {/* Streaming placeholder */}
                   <div className="flex gap-1 mt-2">
                       <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
                       <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
               </div>
           </SciFiCard>

           {/* Insights Deck */}
           <SciFiCard title="AI 诊断洞察" subtitle="INSIGHTS" className="flex-1 border-indigo-900/50">
               <div className="flex flex-col gap-3">
                   {AI_INSIGHTS.map(insight => (
                       <div key={insight.id} className={`p-3 rounded border text-xs flex flex-col gap-1
                           ${insight.type === 'Warning' ? 'bg-red-900/20 border-red-500/30' : 
                             insight.type === 'Suggestion' ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-slate-900/40 border-slate-700'}
                       `}>
                           <div className="flex justify-between items-center">
                               <span className={`font-bold flex items-center gap-1
                                   ${insight.type === 'Warning' ? 'text-red-400' : insight.type === 'Suggestion' ? 'text-indigo-300' : 'text-slate-400'}
                               `}>
                                   {insight.type === 'Warning' ? <AlertCircle size={12}/> : 
                                    insight.type === 'Suggestion' ? <Command size={12}/> : <Search size={12}/>}
                                   {insight.type}
                               </span>
                               <span className="text-[9px] text-slate-500">{insight.confidence}% Conf.</span>
                           </div>
                           <p className="text-slate-300 leading-tight">{insight.text}</p>
                       </div>
                   ))}
               </div>
               
               <div className="mt-auto pt-4">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Recommended Tools</div>
                   <div className="grid grid-cols-2 gap-2">
                       <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 flex items-center justify-center gap-1 transition-colors">
                           <UploadCloud size={12} /> Send Docs
                       </button>
                       <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 flex items-center justify-center gap-1 transition-colors">
                           <Layers size={12} /> 3D Explode
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
