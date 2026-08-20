
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-mining-emergency]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-mining-emergency';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Siren, Phone, Activity, HeartPulse, UserCheck, 
  Truck, ShieldAlert, Radio, Wind, Timer, 
  MapPin, Flame, AlertOctagon, Microscope, Crosshair, Zap
} from 'lucide-react';

// --- MOCK DATA ---
const VITALS_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    hr: 110 + Math.random() * 20, // High heart rate due to stress
    spo2: 95 + Math.random() * 3
}));

const GAS_LEVELS = Array.from({length: 20}, (_, i) => ({
    time: i,
    co: 25 + Math.random() * 5, // ppm
    ch4: 0.8 + Math.random() * 0.1 // %
}));

const CHAT_LOG = [
    { id: 1, time: '14:32:05', role: 'Command', msg: 'Rescue Team Alpha, report status.' },
    { id: 2, time: '14:32:15', role: 'Alpha Leader', msg: 'Reaching Sector 4. Rubble encountered.' },
    { id: 3, time: '14:32:45', role: 'Sensor Ops', msg: 'Warning: CO spike detected in adjacent shaft.' },
    { id: 4, time: '14:33:10', role: 'Command', msg: 'Deploy drone for visual confirmation.' },
];

export const MiningEmergencyView: React.FC = () => {
  const [incidentTime, setIncidentTime] = useState(0);
  const [drillDepth, setDrillDepth] = useState(45.2);
  const [targetDepth] = useState(120.0);

  // Timer Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setIncidentTime(prev => prev + 1);
        setDrillDepth(prev => Math.min(targetDepth, prev + 0.05));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Time H:M:S
  const formatTime = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#050000] text-red-50 relative overflow-hidden">
      
      {/* Red Alert Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#7f1d1d_0%,_transparent_70%)] opacity-20 animate-pulse pointer-events-none"></div>

      {/* HEADER: War Room Style */}
      <div className="flex items-end justify-between border-b-2 border-red-600 pb-4 bg-gradient-to-r from-red-950 to-transparent z-10 px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-widest font-bold">
             <ShieldAlert size={14} className="animate-ping" /> Emergency Response Active
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             矿山应急救援 <span className="text-red-600">作战指挥中心</span>
             <span className="text-sm font-mono bg-red-900/50 px-2 py-1 rounded border border-red-500/50 text-red-300">INCIDENT #902</span>
          </h1>
        </div>
        
        {/* Critical Clock */}
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-red-400 uppercase font-bold">Time Since Incident</div>
                <div className="text-4xl font-mono font-bold text-white tracking-widest flex items-center gap-2">
                    <Timer size={24} className="text-red-500"/> {formatTime(incidentTime)}
                </div>
            </div>
            <div className="text-right pl-8 border-l border-red-800">
                <div className="text-[10px] text-red-400 uppercase font-bold">Rescue Level</div>
                <div className="text-3xl font-black text-red-500 bg-black px-4 py-1 border-2 border-red-600 rounded">
                    LEVEL I
                </div>
            </div>
        </div>
      </div>

      {/* MAIN BATTLEFIELD */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Intelligence & Vitals */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Vital Signs (Simulated from Bio-Trackers) */}
              <SciFiCard title="被困人员生命体征" subtitle="BIO-TELEMETRY" className="border-red-800/60 bg-red-950/20" noPadding>
                  <div className="p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center text-xs text-red-300 mb-1">
                          <span>Detected: 3 Signals</span>
                          <span className="animate-pulse">● Live</span>
                      </div>
                      
                      {/* Heart Rate Graph */}
                      <div className="h-24 w-full bg-black/40 rounded border border-red-900/50 relative overflow-hidden">
                          <div className="absolute top-1 left-1 text-[10px] text-red-500 font-bold flex items-center gap-1"><HeartPulse size={10}/> HR Avg</div>
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={VITALS_DATA}>
                                  <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                              </LineChart>
                          </ResponsiveContainer>
                          <div className="absolute bottom-1 right-1 text-lg font-bold text-red-500">118 <span className="text-[10px]">bpm</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/40 p-2 rounded border border-red-900/50 text-center">
                              <div className="text-[10px] text-red-400">SpO2</div>
                              <div className="text-xl font-bold text-white">96%</div>
                          </div>
                          <div className="bg-black/40 p-2 rounded border border-red-900/50 text-center">
                              <div className="text-[10px] text-red-400">Temp</div>
                              <div className="text-xl font-bold text-white">36.8°C</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Gas Environment */}
              <SciFiCard title="环境气体危急监测" className="flex-1 border-red-800/60 bg-red-950/20">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="flex items-center gap-3 p-2 border-b border-red-900/30">
                          <Flame className="text-orange-500" />
                          <div className="flex-1">
                              <div className="flex justify-between text-sm font-bold">
                                  <span>CH4 (Methane)</span>
                                  <span className="text-orange-400">0.85%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div className="bg-orange-500 h-full" style={{width: '40%'}}></div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 border-b border-red-900/30">
                          <AlertOctagon className="text-red-500" />
                          <div className="flex-1">
                              <div className="flex justify-between text-sm font-bold">
                                  <span>CO (Carbon Monoxide)</span>
                                  <span className="text-red-500 animate-pulse">28 ppm</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div className="bg-red-500 h-full" style={{width: '60%'}}></div>
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 min-h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={GAS_LEVELS}>
                                  <defs>
                                      <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis hide />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #ef4444'}} />
                                  <Area type="monotone" dataKey="co" stroke="#ef4444" fill="url(#colorGas)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Tactical Map (3D) */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-black border-2 border-red-900/60 relative rounded-lg overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  {/* Tactical Overlays */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-red-950/80 backdrop-blur border border-red-500 p-2 rounded flex items-center gap-3 shadow-lg shadow-red-900/50">
                          <Crosshair size={20} className="text-white animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-red-300 font-bold uppercase">Target Zone</div>
                              <div className="text-lg font-mono font-bold text-white">SECTOR 04-B</div>
                          </div>
                      </div>
                  </div>

                  {/* Drilling Progress Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-2/3 bg-black/80 border border-slate-700 p-3 rounded-full flex items-center gap-4">
                      <div className="text-xs font-bold text-slate-300 whitespace-nowrap">RESCUE DRILL DEPTH</div>
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                            style={{ width: `${(drillDepth / targetDepth) * 100}%` }}
                          ></div>
                          {/* Stripe animation */}
                          <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
                      </div>
                      <div className="text-sm font-mono font-bold text-green-400 w-20 text-right">{drillDepth.toFixed(1)}m</div>
                  </div>

                  <ThreeScene type="mining-rescue" color="#ef4444" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              {/* Comms Log (Terminal Style) */}
              <SciFiCard title="指挥通信记录" subtitle="ENCRYPTED CHANNEL" className="h-[200px] border-red-900/50 bg-black" noPadding>
                  <div className="flex flex-col h-full font-mono text-xs p-2 overflow-y-auto custom-scrollbar">
                      {CHAT_LOG.map((log) => (
                          <div key={log.id} className="mb-2 border-l-2 border-slate-700 pl-2 hover:border-red-500 transition-colors">
                              <span className="text-slate-500 mr-2">[{log.time}]</span>
                              <span className="text-red-400 font-bold mr-2">{log.role}:</span>
                              <span className="text-slate-300">{log.msg}</span>
                          </div>
                      ))}
                      {/* Typing simulation line */}
                      <div className="flex items-center gap-1 text-slate-500 mt-2">
                          <span className="animate-pulse">_</span> Awaiting transmission...
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Resources & Status */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Rescue Teams */}
              <SciFiCard title="救援力量部署" subtitle="TEAMS STATUS" className="flex-1 border-red-800/60 bg-red-950/20">
                  <div className="flex flex-col gap-4">
                      {/* Team A */}
                      <div className="p-3 bg-slate-900/60 border-l-4 border-green-500 rounded flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <UserCheck size={14}/> A组救援队
                              </div>
                              <div className="text-[10px] text-slate-400">位置：主隧道交汇处</div>
                          </div>
                          <div className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded border border-green-800">正在前进</div>
                      </div>

                      {/* Team B */}
                      <div className="p-3 bg-slate-900/60 border-l-4 border-yellow-500 rounded flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <UserCheck size={14}/> B组救援队
                              </div>
                              <div className="text-[10px] text-slate-400">位置：地面基地</div>
                          </div>
                          <div className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-1 rounded border border-yellow-800">待命</div>
                      </div>

                      {/* Medical */}
                      <div className="p-3 bg-slate-900/60 border-l-4 border-blue-500 rounded flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <Truck size={14}/> 医疗救援组
                              </div>
                              <div className="text-[10px] text-slate-400">位置：检伤分类帐篷</div>
                          </div>
                          <div className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded border border-blue-800">就绪</div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Equipment Status */}
              <SciFiCard title="关键救援装备" className="border-red-800/60 bg-red-950/20">
                  <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-red-900/30 pb-2">
                          <span className="text-xs text-slate-300 flex items-center gap-2"><Wind size={12}/> Ventilation Booster</span>
                          <span className="text-xs font-mono font-bold text-green-400">100%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-red-900/30 pb-2">
                          <span className="text-xs text-slate-300 flex items-center gap-2"><Radio size={12}/> Underground Comms</span>
                          <span className="text-xs font-mono font-bold text-yellow-400">Weak (-85dBm)</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-300 flex items-center gap-2"><Zap size={12}/> Emergency Power</span>
                          <span className="text-xs font-mono font-bold text-green-400">Online (Diesel)</span>
                      </div>
                  </div>
              </SciFiCard>

              {/* Big Red Button (Visual Only) */}
              <div className="mt-auto">
                  <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400 transition-all flex items-center justify-center gap-2">
                      <Siren className="animate-bounce" /> INITIATE EVACUATION
                  </button>
              </div>

          </div>

      </div>
    </div>
  );
};
