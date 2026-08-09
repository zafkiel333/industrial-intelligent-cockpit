
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/multimodal-transport/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-multimodal]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-multimodal';
import { TransportMode } from '../../components/knowledge-manage/multimodal-transport/three-types';
import { 
  Network, Truck, Ship, Train, 
  FileJson, Activity, Server, ArrowRightLeft,
  CheckCircle, AlertTriangle, Link as LinkIcon,
  Database, Code, Globe, Terminal
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const INTERFACE_STANDARDS = [
  { id: 'EDI-301', name: 'CODECO (Gate In/Out)', protocol: 'EDIFACT', type: 'Container Event', status: 'Active' },
  { id: 'EDI-322', name: 'COARRI (Load/Disch)', protocol: 'EDIFACT', type: 'Terminal Ops', status: 'Active' },
  { id: 'API-REST', name: 'TOS-Rail Interface', protocol: 'JSON/REST', type: 'Real-time', status: 'Beta' },
  { id: 'XML-12', name: 'Customs Release', protocol: 'XML', type: 'Regulatory', status: 'Active' },
];

const MESSAGE_TRAFFIC = Array.from({length: 20}, (_, i) => ({
    time: `${i}:00`,
    msgRate: 150 + Math.random() * 100,
    errors: Math.random() * 5
}));

const VALIDATION_LOGS = [
    { time: '10:42:05', msg: 'CODECO: Cont ID checksum valid', status: 'OK' },
    { time: '10:42:08', msg: 'API: Rail manifest sync success', status: 'OK' },
    { time: '10:42:15', msg: 'XML: Schema mismatch in field <wgt>', status: 'Error' },
    { time: '10:42:22', msg: 'COARRI: Vessel bay plan updated', status: 'OK' },
];

export const MultimodalTransportKbView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<TransportMode>('SEA_RAIL');
  const [apiLatency, setApiLatency] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
        setApiLatency(40 + Math.random() * 20);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020408] p-2 relative overflow-hidden">
      
      {/* Background Matrix Rain Effect (Static Image or simple CSS) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-[#0a0a14]/90 border border-purple-500/30 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-900/30 border-2 border-purple-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(168,85,247,0.3)]">
             <Network size={30} className="text-purple-400" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-purple-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ArrowRightLeft size={12} /> Intermodal Data Exchange
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               多式联运 <span className="text-purple-500 italic">接口标准库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">API Latency</div>
                <div className={`text-2xl font-mono font-black ${apiLatency > 80 ? 'text-red-500' : 'text-green-400'}`}>
                    {apiLatency.toFixed(0)} <span className="text-sm font-normal text-slate-600">ms</span>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Msg Throughput</div>
                <div className="text-2xl font-mono font-black text-purple-400">
                    2.4k <span className="text-sm font-normal text-slate-600">tps</span>
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Standards & Modes --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="联运模式切换" subtitle="MODE SELECT" className="border-purple-900/40 bg-[#0c0a16]/90">
              <div className="grid grid-cols-1 gap-2 mt-2">
                 {[
                     { id: 'SEA_RAIL', label: '海铁联运 (Sea-Rail)', icon: <Train size={16}/> },
                     { id: 'SEA_ROAD', label: '海公联运 (Sea-Road)', icon: <Truck size={16}/> },
                     { id: 'RAIL_ROAD', label: '公铁联运 (Rail-Road)', icon: <LinkIcon size={16}/> },
                 ].map(m => (
                     <button
                        key={m.id}
                        onClick={() => setActiveMode(m.id as TransportMode)}
                        className={`flex items-center gap-3 p-3 rounded border transition-all
                            ${activeMode === m.id ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800'}
                        `}
                     >
                         {m.icon}
                         <span className="text-sm font-bold">{m.label}</span>
                     </button>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="接口协议栈" subtitle="STANDARDS" className="flex-1 border-purple-900/40">
              <div className="space-y-3">
                  {INTERFACE_STANDARDS.map(std => (
                      <div key={std.id} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded flex flex-col gap-1 cursor-pointer hover:border-purple-500/50 transition-colors">
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{std.name}</span>
                              <span className="text-[10px] bg-slate-800 px-1.5 rounded text-purple-300">{std.protocol}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                              <span className="font-mono">{std.id}</span>
                              <span className={std.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}>{std.status}</span>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-purple-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene mode={activeMode} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-[#0a0a14]/80 backdrop-blur border border-purple-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-purple-500">
                       <div className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Globe size={10}/> Data Hub Twin
                       </div>
                       <div className="text-xl font-black text-white">{activeMode.replace('_', ' - ')}</div>
                       <div className="text-xs text-slate-400 mt-1">Status: Handshake OK</div>
                   </div>
               </div>
               
               <div className="absolute bottom-4 right-4 z-20 flex gap-2 pointer-events-none">
                   <div className="bg-black/60 px-3 py-1 rounded text-[10px] text-green-400 border border-green-900/50">Connection Secure</div>
                   <div className="bg-black/60 px-3 py-1 rounded text-[10px] text-purple-400 border border-purple-900/50">Data Flowing</div>
               </div>
           </div>

           {/* Traffic Chart */}
           <div className="h-[180px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>报文吞吐量趋势 (Message Traffic)</span>
                   <span className="text-purple-500">Peak: 280 msg/s</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={MESSAGE_TRAFFIC}>
                       <defs>
                           <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#a855f7'}} />
                       <Area type="monotone" dataKey="msgRate" stroke="#a855f7" fill="url(#msgGrad)" strokeWidth={2} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Validation & Logs --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="接口报文验证" subtitle="VALIDATOR" className="h-[280px] border-purple-900/30">
               <div className="flex flex-col h-full gap-2">
                   <div className="bg-[#1e1e2e] p-2 rounded text-[10px] font-mono text-green-300 border border-slate-700 h-24 overflow-hidden">
                       {`{
  "messageType": "CODECO",
  "container": "MSCU1234567",
  "status": "GATE_OUT",
  "transport": "RAIL",
  "timestamp": "${new Date().toISOString()}"
}`}
                   </div>
                   <div className="flex-1 bg-slate-900/50 rounded border border-slate-800 p-2 overflow-y-auto custom-scrollbar">
                       {VALIDATION_LOGS.map((log, i) => (
                           <div key={i} className="flex gap-2 mb-1.5 text-[10px]">
                               <span className="text-slate-500 font-mono">{log.time}</span>
                               <span className={log.status === 'OK' ? 'text-slate-300' : 'text-red-400 font-bold'}>{log.msg}</span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="系统集成状态" subtitle="HEALTH" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <Server size={14} className="text-blue-500"/> TOS Connector
                       </div>
                       <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Online</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <Database size={14} className="text-orange-500"/> Rail Billing DB
                       </div>
                       <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Syncing</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <Code size={14} className="text-purple-500"/> Customs API
                       </div>
                       <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Connected</span>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
                           <Terminal size={14} /> 启动接口调试工具
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
