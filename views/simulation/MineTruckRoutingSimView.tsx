
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-truck]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-truck';
import { 
  Truck, Navigation, AlertTriangle, Activity, 
  Map as MapIcon, Layers, Settings, Play, 
  Pause, RotateCcw, TrendingUp, Clock,
  Cpu, Route, BarChart3, Radio
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import { SciFiCard } from '../../components/SciFiCard';

// --- Types & Data ---

const TRAFFIC_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    congestion: 20 + Math.random() * 30 + (i > 10 && i < 16 ? 40 : 0), // Peak at midday
    flow: 100 + Math.random() * 50
}));

const ROUTE_NODES = [
    { id: 'N1', name: 'Pit Bottom', status: 'Clear', load: 85 },
    { id: 'N2', name: 'Ramp A-7', status: 'Heavy', load: 92 },
    { id: 'N3', name: 'Crusher Station', status: 'Congested', load: 98 },
    { id: 'N4', name: 'Waste Dump', status: 'Clear', load: 40 },
];

const TRUCK_LIST = [
    { id: 'T-101', state: 'Hauling', eta: '4m', efficiency: 95 },
    { id: 'T-102', state: 'Queue', eta: '--', efficiency: 60 },
    { id: 'T-103', state: 'Return', eta: '12m', efficiency: 92 },
    { id: 'T-104', state: 'Loading', eta: '2m', efficiency: 88 },
];

export const MineTruckRoutingSimView: React.FC = () => {
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('RUNNING');
  const [algoMode, setAlgoMode] = useState<'STATIC' | 'AI_DYNAMIC'>('STATIC');
  const [congestionLevel, setCongestionLevel] = useState(20);
  
  // Simulation Loop for UI updates
  useEffect(() => {
    if (simState !== 'RUNNING') return;
    const interval = setInterval(() => {
        // Randomly fluctuate congestion based on "Simulated Events"
        if (algoMode === 'STATIC') {
            setCongestionLevel(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.4) * 5)));
        } else {
            // AI Mode reduces congestion
            setCongestionLevel(prev => Math.max(10, prev * 0.95)); 
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [simState, algoMode]);

  return (
    <div className="h-full w-full relative bg-[#0f172a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-truck-routing" 
            simData={{ 
                congestionLevel,
                useAI: algoMode === 'AI_DYNAMIC'
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0f172a_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      </div>

      {/* 2. TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Route size={14} /> LOGISTICS TWIN
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿山卡车 <span className="text-orange-500">运输路径与拥堵仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-6 pointer-events-auto">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Dispatch Algorithm</span>
                  <div className="flex items-center gap-2">
                      <Cpu size={14} className={algoMode === 'AI_DYNAMIC' ? 'text-green-400' : 'text-slate-500'} />
                      <span className={`font-bold text-lg ${algoMode === 'AI_DYNAMIC' ? 'text-green-400' : 'text-orange-400'}`}>
                          {algoMode === 'AI_DYNAMIC' ? 'AI DYNAMIC' : 'STATIC RULES'}
                      </span>
                  </div>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Congestion Index</span>
                  <span className={`font-mono font-bold text-2xl ${congestionLevel > 70 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                      {congestionLevel.toFixed(1)}
                  </span>
              </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Network Status */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Node Status */}
          <SciFiCard title="路网节点负荷 (Nodes)" subtitle="REAL-TIME" className="flex-1 border-orange-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="flex flex-col gap-3 p-1 overflow-y-auto custom-scrollbar">
                  {ROUTE_NODES.map((node, i) => (
                      <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                  <MapIcon size={14} className="text-orange-500"/> {node.name}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                                  ${node.status === 'Clear' ? 'bg-green-900/30 text-green-400' : 
                                    node.status === 'Heavy' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}
                              `}>
                                  {node.status}
                              </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${node.load > 90 ? 'bg-red-500' : 'bg-orange-500'}`} 
                                style={{width: `${node.load}%`}}
                              ></div>
                          </div>
                          <div className="text-[10px] text-slate-500 text-right">Traffic Load: {node.load}%</div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

          {/* Traffic Chart */}
          <SciFiCard title="拥堵趋势预测" subtitle="24H" className="h-[200px] border-orange-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TRAFFIC_DATA}>
                          <defs>
                              <linearGradient id="gradCong" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="hour" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                          <Area type="monotone" dataKey="congestion" stroke="#f97316" fill="url(#gradCong)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Dispatch Control */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Controls */}
          <div className="bg-[#0c0a09]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Settings size={16} className="text-orange-500"/> 调度策略控制
              </h3>
              
              <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-400">Optimization Mode</div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setAlgoMode('STATIC')}
                        className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                           ${algoMode === 'STATIC' ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-800 text-slate-400 border-slate-700'}
                        `}
                      >
                          Static Rules
                      </button>
                      <button 
                        onClick={() => setAlgoMode('AI_DYNAMIC')}
                        className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                           ${algoMode === 'AI_DYNAMIC' ? 'bg-green-600 text-white border-green-400' : 'bg-slate-800 text-slate-400 border-slate-700'}
                        `}
                      >
                          AI Dynamic
                      </button>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300">Simulate Incident</span>
                      </div>
                      <button 
                        onClick={() => setCongestionLevel(95)}
                        className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 text-red-300 text-xs rounded flex items-center justify-center gap-2 transition-colors"
                      >
                          <AlertTriangle size={14}/> Inject Road Blockage
                      </button>
                  </div>
              </div>
          </div>

          {/* Truck List */}
          <SciFiCard title="车辆实时监控" subtitle="FLEET" className="flex-1 border-orange-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar">
                  {TRUCK_LIST.map((truck, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded hover:border-orange-500/30 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                  <Truck size={14} />
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-white">{truck.id}</div>
                                  <div className="text-[10px] text-slate-500">{truck.state}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs font-mono text-orange-300">{truck.efficiency}% Eff</div>
                              <div className="text-[9px] text-slate-500">ETA: {truck.eta}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* 5. CENTER HUD: Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur px-6 py-3 rounded-full border border-orange-600/30 flex gap-8 items-center text-slate-300">
             <div className="flex items-center gap-2">
                 <Activity size={14} className="text-green-400" />
                 <span className="text-xs">Dispatch Logic: <span className="text-white font-bold">{algoMode === 'STATIC' ? 'Fixed Route' : 'Min-Wait (A*)'}</span></span>
             </div>
             <div className="w-px h-4 bg-slate-600"></div>
             <div className="flex items-center gap-2">
                 <Radio size={14} className="text-blue-400" />
                 <span className="text-xs">V2X Comms: <span className="text-white font-bold">Online</span></span>
             </div>
          </div>
      </div>

    </div>
  );
};
