
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-power]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-power';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Activity, AlertTriangle, ShieldAlert,
  BatteryCharging, Server, Radio, Flame, 
  RotateCcw, Sliders, Thermometer
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const NODES_LIST = [
    { id: 0, name: 'Main Substation', type: 'Source', rating: '35kV' },
    { id: 1, name: 'Dist A (West)', type: 'Dist', rating: '10kV' },
    { id: 2, name: 'Dist B (East)', type: 'Dist', rating: '10kV' },
    { id: 3, name: 'Shearer Unit', type: 'Load', rating: '1200kW' },
    { id: 4, name: 'Main Conveyor', type: 'Load', rating: '800kW' },
    { id: 5, name: 'Pump Station', type: 'Load', rating: '650kW' },
];

const HARMONICS = [
    { name: 'Fund', val: 100 },
    { name: '3rd', val: 12 },
    { name: '5th', val: 8 },
    { name: '7th', val: 5 },
    { name: '9th', val: 2 },
    { name: '11th', val: 1.5 },
];

export const MinePowerSimView: React.FC = () => {
  // State
  const [loadLevel, setLoadLevel] = useState(60); // %
  const [faultType, setFaultType] = useState<'NONE' | 'SHORT_3PH' | 'GND_FAULT' | 'OVERLOAD'>('NONE');
  const [faultNode, setFaultNode] = useState(3);
  
  // Metrics
  const [metrics, setMetrics] = useState({
    voltage: 10.2, // kV
    current: 450, // A
    pf: 0.92,
    freq: 50.00,
    temp: 65 // Transformer temp
  });

  const [waveData, setWaveData] = useState<{t: number, v: number, i: number}[]>([]);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Logic
        let v = 10.2;
        let i = (loadLevel / 100) * 800;
        let temp = 60 + (loadLevel/100) * 30;

        if (faultType === 'SHORT_3PH') {
            v = 0.5; // Dip
            i = 2500; // Spike
            temp += 5; // Fast heating
        } else if (faultType === 'OVERLOAD') {
            v = 9.8; // Sag
            i = 1200;
            temp += 2;
        }

        // Noise
        v += (Math.random()-0.5) * 0.1;
        i += (Math.random()-0.5) * 10;
        
        setMetrics(prev => ({
            voltage: v,
            current: i,
            pf: faultType === 'NONE' ? 0.92 : 0.4,
            freq: 50 + (Math.random()-0.5)*0.02,
            temp: Math.min(150, prev.temp * 0.95 + temp * 0.05)
        }));

        // Generate Waveform
        const points = [];
        for(let t=0; t<40; t++) {
            const rad = t * 0.3;
            let voltVal = Math.sin(rad);
            let currVal = Math.sin(rad - 0.2); // Phase shift
            
            if (faultType === 'SHORT_3PH') {
                voltVal *= 0.1;
                currVal *= 5.0;
            }
            
            points.push({ t, v: voltVal, i: currVal });
        }
        setWaveData(points);

    }, 200);
    return () => clearInterval(interval);
  }, [loadLevel, faultType]);

  const triggerFault = (type: typeof faultType) => {
      setFaultType(type);
      if (type !== 'NONE') {
          // Auto reset after 5s for demo
          setTimeout(() => setFaultType('NONE'), 5000);
      }
  };

  return (
    <div className="h-full w-full relative bg-[#020409] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-power" 
            simData={{ 
                loadLevel,
                faultActive: faultType !== 'NONE',
                faultNodeId: faultType === 'NONE' ? -1 : faultNode
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020409_100%)] pointer-events-none"></div>
          {faultType !== 'NONE' && (
              <div className="absolute inset-0 border-[20px] border-red-500/20 animate-pulse pointer-events-none z-10"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0e1b2e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Zap size={14} /> HIGH VOLTAGE DISTRIBUTION
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿山电力系统 <span className="text-cyan-500">负荷与故障仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto">
              <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Frequency</div>
                  <div className="text-3xl font-mono font-bold text-white">{metrics.freq.toFixed(2)} <span className="text-sm text-slate-500">Hz</span></div>
              </div>
              <div className="text-right border-l border-slate-700 pl-6">
                  <div className="text-[10px] text-slate-400 uppercase">Bus Voltage</div>
                  <div className={`text-3xl font-mono font-bold ${metrics.voltage < 9 ? 'text-red-500' : 'text-cyan-400'}`}>
                      {metrics.voltage.toFixed(1)} <span className="text-sm text-slate-500">kV</span>
                  </div>
              </div>
              <div className="text-right border-l border-slate-700 pl-6">
                  <div className="text-[10px] text-slate-400 uppercase">Power Factor</div>
                  <div className="text-3xl font-mono font-bold text-green-400">{metrics.pf.toFixed(2)}</div>
              </div>
          </div>
      </div>

      {/* LEFT PANEL: Topology & Status */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Topology List */}
          <SciFiCard title="供电网络拓扑" subtitle="STATUS" className="flex-1 border-cyan-900/50 bg-[#060b14]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar">
                  {NODES_LIST.map((node) => (
                      <div 
                        key={node.id}
                        onClick={() => setFaultNode(node.id)}
                        className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center group
                            ${faultNode === node.id ? 'border-cyan-500 bg-cyan-900/30' : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'}
                            ${faultType !== 'NONE' && faultNode === node.id ? 'border-red-500 bg-red-900/40 animate-pulse' : ''}
                        `}
                      >
                          <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                  {node.type === 'Source' ? <Server size={12}/> : <Activity size={12}/>}
                                  {node.name}
                              </div>
                              <div className="text-[10px] text-slate-500">{node.rating}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${faultType !== 'NONE' && faultNode === node.id ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

          {/* Thermal Monitor */}
          <SciFiCard title="变压器温升监测" subtitle="THERMAL" className="h-[200px] border-cyan-900/50 bg-[#060b14]/90 pointer-events-auto">
              <div className="flex flex-col h-full justify-center items-center gap-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                       <div className={`absolute inset-0 rounded-full border-4 border-slate-800 border-t-cyan-500 ${metrics.temp > 90 ? 'border-t-red-500' : ''}`} style={{transform: `rotate(${(metrics.temp/150)*270 - 135}deg)`}}></div>
                       <div className="text-center">
                           <div className={`text-3xl font-bold ${metrics.temp > 90 ? 'text-red-500' : 'text-white'}`}>
                               {metrics.temp.toFixed(0)}°C
                           </div>
                           <div className="text-[10px] text-slate-500">Core Temp</div>
                       </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Thermometer size={12}/> Oil: {(metrics.temp * 0.8).toFixed(0)}°C</span>
                      <span className="flex items-center gap-1"><Activity size={12}/> Load: {loadLevel}%</span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Oscilloscope */}
          <SciFiCard title="三相波形分析" subtitle="OSCILLOSCOPE" className="h-[250px] border-cyan-900/50 bg-[#060b14]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative bg-black/40 rounded border border-slate-800">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={waveData}>
                          <YAxis domain={[-2, 2]} hide />
                          <Line type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                          <Line type="monotone" dataKey="i" stroke="#facc15" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute top-2 right-2 text-[10px] flex gap-3">
                      <span className="text-cyan-400">Voltage (U)</span>
                      <span className="text-yellow-400">Current (I)</span>
                  </div>
              </div>
          </SciFiCard>

          {/* Harmonic Analysis */}
          <SciFiCard title="谐波畸变率 (THD)" className="h-[200px] border-cyan-900/50 bg-[#060b14]/90 pointer-events-auto">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={HARMONICS}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                           <Bar dataKey="val" fill="#8b5cf6">
                               {HARMONICS.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
          </SciFiCard>

          {/* Fault Controls */}
          <div className="flex-1 bg-[#1a0f0f]/90 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <AlertTriangle size={16} className="text-red-500"/> 故障模拟控制台
              </h3>
              
              <div className="space-y-4 mb-6">
                  <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>System Load</span>
                          <span className="text-orange-400">{loadLevel}%</span>
                      </div>
                      <input 
                         type="range" min="0" max="120" step="5" 
                         value={loadLevel} onChange={(e) => setLoadLevel(parseInt(e.target.value))}
                         className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => triggerFault('SHORT_3PH')}
                    className="flex items-center justify-between p-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded transition-colors group"
                  >
                      <span className="text-xs font-bold text-red-300">三相短路 (3-Phase Short)</span>
                      <Flame size={16} className="text-red-500 group-hover:scale-125 transition-transform" />
                  </button>
                  <button 
                    onClick={() => triggerFault('GND_FAULT')}
                    className="flex items-center justify-between p-3 bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-500/30 rounded transition-colors group"
                  >
                      <span className="text-xs font-bold text-yellow-300">单相接地 (Ground Fault)</span>
                      <Zap size={16} className="text-yellow-500 group-hover:scale-125 transition-transform" />
                  </button>
                  <button 
                    onClick={() => triggerFault('OVERLOAD')}
                    className="flex items-center justify-between p-3 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/30 rounded transition-colors group"
                  >
                      <span className="text-xs font-bold text-orange-300">过载保护 (Overload)</span>
                      <Activity size={16} className="text-orange-500 group-hover:scale-125 transition-transform" />
                  </button>
              </div>

              <div className="mt-auto pt-4 flex justify-center">
                  <button 
                    onClick={() => { setFaultType('NONE'); setLoadLevel(60); }}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                      <RotateCcw size={12}/> Reset System
                  </button>
              </div>
          </div>

      </div>

    </div>
  );
};
