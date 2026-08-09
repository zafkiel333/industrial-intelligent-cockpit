
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, 
  Activity, Zap, Terminal, Command, 
  CheckSquare, Share2, MessageSquare, 
  Wifi, Radio, Cast, Layers, 
  PenTool, Eraser, MousePointer2,
  AlertTriangle, Play, Pause, Square,
  CheckCircle2, FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, ReferenceLine, Legend
} from 'recharts';

// --- Types ---

interface Collaborator {
  id: string;
  name: string;
  role: string;
  status: 'Speaking' | 'Listening' | 'Muted' | 'Away';
  videoOn: boolean;
  avatarColor: string;
  latency: number; // ms
}

interface ActionStep {
  id: string;
  text: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  assignee?: string;
}

interface TerminalLog {
  id: number;
  time: string;
  type: 'CMD' | 'SYS' | 'ERR' | 'ACK';
  content: string;
}

// --- Mock Data ---

const SQUAD: Collaborator[] = [
  { id: '1', name: 'Dr. Zhang (Lead)', role: 'Vibration Expert', status: 'Speaking', videoOn: true, avatarColor: '#ef4444', latency: 45 },
  { id: '2', name: 'Mike Chen', role: 'Site Engineer', status: 'Listening', videoOn: true, avatarColor: '#3b82f6', latency: 120 }, // Higher latency for field
  { id: '3', name: 'Sarah Wu', role: 'Control Sys.', status: 'Muted', videoOn: false, avatarColor: '#10b981', latency: 30 },
  { id: '4', name: 'AI Copilot', role: 'Diagnostic Bot', status: 'Listening', videoOn: false, avatarColor: '#8b5cf6', latency: 0 },
];

const SOP_STEPS: ActionStep[] = [
  { id: 'S1', text: 'Confirm Safety Lockout (LOTO)', status: 'Completed', assignee: 'Mike Chen' },
  { id: 'S2', text: 'Isolate Hydraulic Circuit B', status: 'Completed', assignee: 'Mike Chen' },
  { id: 'S3', text: 'Perform Step-Response Test', status: 'In Progress', assignee: 'Sarah Wu' },
  { id: 'S4', text: 'Analyze Frequency Spectrum', status: 'Pending', assignee: 'Dr. Zhang' },
  { id: 'S5', text: 'Reset PID Parameters', status: 'Pending' },
];

const INITIAL_LOGS: TerminalLog[] = [
  { id: 1, time: '10:42:01', type: 'SYS', content: 'Connection established to Edge Gateway [GW-992].' },
  { id: 2, time: '10:42:05', type: 'SYS', content: 'Telemetry Stream: 100Hz | 4 Channels' },
  { id: 3, time: '10:43:12', type: 'CMD', content: '> EXEC DIAGNOSTIC_ROUTINE_A1' },
  { id: 4, time: '10:43:15', type: 'ACK', content: 'Routine started. Collecting buffer...' },
];

// --- Components ---

const UserBadge: React.FC<{ user: Collaborator }> = ({ user }) => (
  <div className={`relative flex items-center justify-between p-2 rounded border transition-all duration-300
    ${user.status === 'Speaking' ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900/40 border-slate-800'}
  `}>
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg" style={{backgroundColor: user.avatarColor}}>
          {user.name.charAt(0)}
        </div>
        <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700`}>
          {user.videoOn ? <Video size={8} className="text-green-400"/> : <VideoOff size={8} className="text-slate-500"/>}
        </div>
      </div>
      <div>
        <div className={`text-xs font-bold ${user.status === 'Speaking' ? 'text-indigo-200' : 'text-slate-300'}`}>{user.name}</div>
        <div className="text-[9px] text-slate-500 flex items-center gap-1">
          {user.role} 
          <span className={`w-1.5 h-1.5 rounded-full ${user.latency < 50 ? 'bg-green-500' : user.latency < 150 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
        </div>
      </div>
    </div>
    <div className="text-right">
       {user.status === 'Speaking' ? (
           <div className="flex gap-0.5 items-end h-3">
               {[1,2,3,4].map(i => (
                   <div key={i} className="w-0.5 bg-indigo-400 animate-pulse" style={{height: `${Math.random()*100}%`, animationDuration: '0.2s'}}></div>
               ))}
           </div>
       ) : user.status === 'Muted' ? (
           <MicOff size={12} className="text-red-500"/>
       ) : (
           <Mic size={12} className="text-slate-600"/>
       )}
    </div>
  </div>
);

const SignalChart = () => {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate initial wave
    const initial = Array.from({length: 60}, (_, i) => ({
      time: i,
      ch1: Math.sin(i * 0.2) * 40 + 50,
      ch2: Math.cos(i * 0.3) * 30 + 40,
      ch3: Math.sin(i * 0.5) * 20 + 60 + (Math.random() * 10)
    }));
    setData(initial);

    const interval = setInterval(() => {
      setData(prev => {
        const nextTime = prev[prev.length - 1].time + 1;
        const newPoint = {
          time: nextTime,
          ch1: Math.sin(nextTime * 0.2) * 40 + 50 + (Math.random()*5),
          ch2: Math.cos(nextTime * 0.3) * 30 + 40 + (Math.random()*5),
          ch3: Math.sin(nextTime * 0.5) * 20 + 60 + (Math.random()*15) // Noisy channel
        };
        return [...prev.slice(1), newPoint];
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
             <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
             </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 120]} />
          <Tooltip contentStyle={{backgroundColor: '#0f0a15', borderColor: '#333'}} itemStyle={{fontSize: '10px'}} />
          <Area type="monotone" dataKey="ch3" stackId="1" stroke="#ef4444" fill="transparent" strokeWidth={1} />
          <Area type="monotone" dataKey="ch2" stackId="2" stroke="#10b981" fill="transparent" strokeWidth={2} />
          <Area type="monotone" dataKey="ch1" stackId="3" stroke="#0ea5e9" fill="url(#grad1)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Live Overlay */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-400"></div> VIB-X: 0.45 mm/s</span>
          <span className="text-[9px] text-green-400 font-mono flex items-center gap-1"><div className="w-2 h-0.5 bg-green-400"></div> VIB-Y: 0.32 mm/s</span>
          <span className="text-[9px] text-red-400 font-mono flex items-center gap-1"><div className="w-2 h-0.5 bg-red-400"></div> VIB-Z: 1.20 mm/s (ALERT)</span>
      </div>
    </div>
  );
};

export const RemoteExpertCollaborationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'whiteboard'>('telemetry');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [cmdInput, setCmdInput] = useState('');

  const handleSendCmd = () => {
    if(!cmdInput) return;
    const newLog: TerminalLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-US', {hour12: false}),
      type: 'CMD',
      content: `> ${cmdInput}`
    };
    setLogs(prev => [...prev, newLog]);
    setCmdInput('');
    // Simulate Response
    setTimeout(() => {
        setLogs(prev => [...prev, {
            id: Date.now() + 1,
            time: new Date().toLocaleTimeString('en-US', {hour12: false}),
            type: 'SYS',
            content: 'Command executed. Retcode: 0'
        }]);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0a0514] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" /> Live Session #8842
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             专家协同 <span className="text-indigo-500">处置工作台</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
             <div className="px-3 py-1 bg-red-900/20 border border-red-500/50 rounded text-xs text-red-400 font-bold animate-pulse flex items-center gap-2">
                 <Radio size={14} /> LIVE: 00:45:12
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Share2 size={14} /> 邀请专家
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors">
                <CheckSquare size={14} /> 结束会诊
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Team & Context */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Squad List */}
           <SciFiCard title="协同小组 (Squad)" subtitle="4 ONLINE" className="border-indigo-900/30">
               <div className="flex flex-col gap-2">
                   {SQUAD.map(u => <UserBadge key={u.id} user={u} />)}
               </div>
           </SciFiCard>

           {/* Case Brief */}
           <SciFiCard title="工单摘要" className="flex-1 border-slate-800">
               <div className="space-y-4 text-xs">
                   <div>
                       <div className="text-slate-500 mb-1">Equipment</div>
                       <div className="text-white font-bold">Gas Turbine GT-101</div>
                       <div className="text-[10px] text-slate-500">Serial: SN-X992-04</div>
                   </div>
                   <div>
                       <div className="text-slate-500 mb-1">Issue</div>
                       <div className="text-yellow-400 font-bold bg-yellow-900/20 px-2 py-1 rounded border border-yellow-800/50">
                           Abnormal Vibration (Zone 2)
                       </div>
                   </div>
                   <div>
                       <div className="text-slate-500 mb-1">Context</div>
                       <p className="text-slate-300 leading-relaxed">
                           Vibration spiked to 8.5mm/s during load change. Auto-shutdown triggered. Field engineer requests support for restart analysis.
                       </p>
                   </div>
                   <div className="pt-2 border-t border-slate-800">
                       <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                           <span>Files</span>
                           <span className="text-indigo-400 cursor-pointer">View All (3)</span>
                       </div>
                       <div className="flex gap-2">
                           <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">LOG</div>
                           <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">IMG</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Canvas */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
           
           {/* Toolbar */}
           <div className="flex justify-between items-center bg-[#080b16] p-2 rounded border border-slate-800">
               <div className="flex gap-2">
                   <button 
                     onClick={() => setActiveTab('telemetry')}
                     className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all
                        ${activeTab === 'telemetry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}
                     `}
                   >
                       <Activity size={14} /> Telemetry
                   </button>
                   <button 
                     onClick={() => setActiveTab('whiteboard')}
                     className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all
                        ${activeTab === 'whiteboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}
                     `}
                   >
                       <PenTool size={14} /> Whiteboard
                   </button>
               </div>
               
               <div className="flex gap-2 text-slate-500">
                   <button className="p-1.5 hover:bg-slate-800 rounded"><Monitor size={16}/></button>
                   <button className="p-1.5 hover:bg-slate-800 rounded"><Cast size={16}/></button>
                   <button className="p-1.5 hover:bg-slate-800 rounded"><Layers size={16}/></button>
               </div>
           </div>

           {/* Main Visualization Area */}
           <div className="flex-1 bg-black border border-slate-800 rounded relative overflow-hidden group">
               {/* Background Grid */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                   backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px), linear-gradient(0deg, transparent 95%, #4f46e5 100%)',
                   backgroundSize: '40px 40px, 100% 100%'
               }}></div>

               {activeTab === 'telemetry' ? (
                   <div className="w-full h-full p-4 relative">
                       <SignalChart />
                       
                       {/* Playback Controls Overlay */}
                       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-slate-300 hover:text-white"><Square size={14}/></button>
                           <button className="text-white hover:text-indigo-400"><Pause size={20}/></button>
                           <div className="text-[10px] font-mono text-cyan-400">LIVE</div>
                       </div>
                   </div>
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-600">
                       <div className="text-center">
                           <PenTool size={48} className="mx-auto mb-2 opacity-20" />
                           <div className="text-sm">Interactive Whiteboard Active</div>
                           <div className="text-xs opacity-50">Dr. Zhang is annotating...</div>
                       </div>
                       {/* Simulated Cursor */}
                       <div className="absolute top-1/3 left-1/3 text-indigo-500 flex flex-col items-center animate-bounce">
                           <MousePointer2 size={24} className="fill-indigo-500" />
                           <span className="text-[10px] bg-indigo-600 text-white px-1 rounded">Dr. Zhang</span>
                       </div>
                   </div>
               )}
           </div>

           {/* Command Terminal (Bottom) */}
           <div className="h-48 bg-[#05060a] border border-slate-800 rounded flex flex-col font-mono text-xs overflow-hidden">
               <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex justify-between items-center">
                   <span className="text-slate-400 flex items-center gap-2"><Terminal size={12}/> Remote Shell (SSH-Secure)</span>
                   <div className="flex gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                       <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
               </div>
               <div className="flex-1 p-2 overflow-y-auto text-slate-300 space-y-1">
                   {logs.map(log => (
                       <div key={log.id} className="flex gap-2">
                           <span className="text-slate-600">[{log.time}]</span>
                           <span className={
                               log.type === 'CMD' ? 'text-cyan-400' : 
                               log.type === 'ERR' ? 'text-red-400' : 
                               log.type === 'ACK' ? 'text-green-400' : 'text-slate-400'
                           }>{log.type}</span>
                           <span>{log.content}</span>
                       </div>
                   ))}
               </div>
               <div className="p-2 border-t border-slate-800 flex items-center gap-2 bg-slate-900/30">
                   <span className="text-green-500 animate-pulse">➜</span>
                   <input 
                     type="text" 
                     className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-700"
                     placeholder="Enter remote command..."
                     value={cmdInput}
                     onChange={(e) => setCmdInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendCmd()}
                   />
               </div>
           </div>

        </div>

        {/* RIGHT: Tactical Column */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* SOP Checklist */}
           <SciFiCard title="协同处置 SOP" subtitle="PROGRESS" className="border-indigo-900/50">
               <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   {SOP_STEPS.map((step, i) => (
                       <div key={step.id} className="relative group">
                           <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 z-10 flex items-center justify-center
                               ${step.status === 'Completed' ? 'bg-green-500 border-green-500' : 
                                 step.status === 'In Progress' ? 'bg-indigo-900 border-indigo-500 animate-pulse' : 'bg-slate-900 border-slate-600'}
                           `}>
                               {step.status === 'Completed' && <CheckCircle2 size={10} className="text-black" />}
                           </div>
                           
                           <div className={`p-2 rounded border transition-colors
                               ${step.status === 'In Progress' ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900/30 border-slate-800'}
                           `}>
                               <div className="text-xs font-bold text-slate-200">{step.text}</div>
                               <div className="flex justify-between mt-1">
                                   <span className="text-[10px] text-slate-500">{step.assignee || 'Unassigned'}</span>
                                   <span className={`text-[10px] ${step.status === 'Completed' ? 'text-green-500' : step.status === 'In Progress' ? 'text-indigo-400' : 'text-slate-600'}`}>
                                       {step.status}
                                   </span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Insights */}
           <SciFiCard title="AI 辅助分析" subtitle="AUTO" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3">
                   <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <Zap size={14} className="text-yellow-400" />
                           <span className="text-xs font-bold text-indigo-200">Root Cause Probability</span>
                       </div>
                       <div className="space-y-2">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>Bearing Wear</span>
                               <span className="text-white">85%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                               <div className="bg-yellow-500 h-full" style={{width: '85%'}}></div>
                           </div>
                           
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>Misalignment</span>
                               <span className="text-white">12%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                               <div className="bg-slate-500 h-full" style={{width: '12%'}}></div>
                           </div>
                       </div>
                   </div>

                   <div className="p-3 bg-slate-900/50 border border-slate-800 rounded text-xs text-slate-300">
                       <div className="flex items-center gap-2 mb-2 font-bold text-slate-400">
                           <FileText size={14} /> Relevant Cases
                       </div>
                       <ul className="space-y-1 text-[10px] list-disc list-inside text-cyan-400">
                           <li className="cursor-pointer hover:underline">Case #8821: GT-102 High Vib</li>
                           <li className="cursor-pointer hover:underline">Case #7743: Bearing Replacement</li>
                       </ul>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};