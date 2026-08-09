
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-vent]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-vent';
import { 
  Fan, Wind, AlertTriangle, Activity, 
  Play, Pause, RotateCcw, FileText, 
  CheckCircle2, Thermometer, Zap, Layers,
  ChevronRight, ArrowRight, Gauge, Download,
  Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line
} from 'recharts';

// --- Types & Data ---

const GAS_DATA = Array.from({length: 60}, (_, i) => ({
    time: i,
    ch4: 0.2 + Math.random() * 0.05,
    co: 5 + Math.random() * 2,
    o2: 20.8 - Math.random() * 0.1
}));

const COMPLIANCE_LIST = [
    { id: 1, item: '工作面风量 (Face Air)', req: '≥ 800 m³/min', val: '850', status: 'Pass' },
    { id: 2, item: '上隅角瓦斯 (Corner CH4)', req: '≤ 1.0 %', val: '0.42', status: 'Pass' },
    { id: 3, item: '回风巷风速 (Return Vel)', req: '0.25~4 m/s', val: '1.8', status: 'Pass' },
    { id: 4, item: '主要通风机效率 (Fan Eff)', req: '≥ 85%', val: '88.5%', status: 'Pass' },
];

export const MineVentilationSimView: React.FC = () => {
  // Simulation State
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [fanSpeed, setFanSpeed] = useState(45.0); // Hz
  const [gasSource, setGasSource] = useState(0.2); // 0-1 intensity
  const [windSpeed, setWindSpeed] = useState(2.0); // m/s
  
  // Computed Metrics
  const [metrics, setMetrics] = useState({
    maxCH4: 0.42,
    avgFlow: 1250,
    resistance: 1450, // Pa
    convergence: 100 // %
  });

  // Simulation Loop
  useEffect(() => {
    if (simState !== 'RUNNING') return;
    
    const interval = setInterval(() => {
        // Physics logic simulation
        const flowFactor = (fanSpeed / 50) * 1.2;
        const gasFactor = gasSource * 2.0;
        
        const currentCH4 = 0.2 + (gasFactor / flowFactor) * 0.5 + (Math.random()-0.5)*0.05;
        
        setMetrics(prev => ({
            maxCH4: Math.max(0, currentCH4),
            avgFlow: 1000 * flowFactor,
            resistance: 1200 * (flowFactor * flowFactor),
            convergence: Math.min(100, prev.convergence + 1)
        }));

    }, 500);
    return () => clearInterval(interval);
  }, [simState, fanSpeed, gasSource]);

  return (
    <div className="h-full w-full relative bg-[#09090b] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-ventilation" 
            simData={{ 
                fanSpeed, 
                windSpeed: (fanSpeed / 50) * 4, 
                gasConcentration: gasSource + (metrics.maxCH4 > 1.0 ? 0.5 : 0) // Visual boost if high
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_100%)] pointer-events-none"></div>
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none"></div>
      </div>

      {/* 2. TOP HUD: Header & Global Status */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-green-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Wind size={14} /> CFD SIMULATION CORE
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 井下通风 <span className="text-green-500">& 有害气体扩散仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-6 pointer-events-auto">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Solver Status</span>
                  <span className={`font-mono font-bold text-xl ${simState === 'RUNNING' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {simState === 'RUNNING' ? 'CONVERGING' : 'READY'}
                  </span>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Simulation Time</span>
                  <span className="font-mono text-white font-bold text-xl">T+00:45:12</span>
              </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Controls & Parameters */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Control Deck */}
          <div className="bg-[#0c1210]/90 backdrop-blur-md border border-green-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-green-900/50 pb-2">
                  <Settings size={16} className="text-green-500"/> 边界条件设定 (Boundary)
              </h3>
              
              <div className="space-y-6">
                  {/* Fan Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Main Fan Frequency</span>
                          <span className="font-mono text-green-400">{fanSpeed.toFixed(1)} Hz</span>
                      </div>
                      <input 
                        type="range" min="0" max="60" step="0.5" 
                        value={fanSpeed} 
                        onChange={(e) => setFanSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                  </div>

                  {/* Gas Source */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Gas Emission Rate (Source)</span>
                          <span className="font-mono text-red-400">{(gasSource*10).toFixed(1)} m³/min</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={gasSource} 
                        onChange={(e) => setGasSource(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-3">
                      <button className="p-2 border border-slate-700 rounded bg-slate-800/50 hover:bg-slate-700 text-xs flex flex-col items-center gap-1 transition-colors">
                          <Fan size={16} className="text-blue-400"/>
                          <span>Local Fan: ON</span>
                      </button>
                      <button className="p-2 border border-slate-700 rounded bg-slate-800/50 hover:bg-slate-700 text-xs flex flex-col items-center gap-1 transition-colors">
                          <Layers size={16} className="text-yellow-400"/>
                          <span>Air Door: CLOSED</span>
                      </button>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${simState === 'RUNNING' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}
                    `}
                  >
                      {simState === 'RUNNING' ? <Pause size={14}/> : <Play size={14}/>}
                      {simState === 'RUNNING' ? 'PAUSE' : 'SIMULATE'}
                  </button>
                  <button 
                    onClick={() => { setSimState('IDLE'); setMetrics(m => ({...m, convergence: 0})); }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                  >
                      <RotateCcw size={14}/>
                  </button>
              </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex-1 bg-[#0c1210]/90 backdrop-blur-md border border-green-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-green-500"/> 实时解算指标
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Q (Flow)</div>
                      <div className="text-lg font-bold text-white font-mono">{metrics.avgFlow.toFixed(0)}</div>
                      <div className="text-[9px] text-green-400">m³/min</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">H (Resist)</div>
                      <div className="text-lg font-bold text-white font-mono">{metrics.resistance.toFixed(0)}</div>
                      <div className="text-[9px] text-slate-500">Pa</div>
                  </div>
              </div>

              <div className="mt-auto">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Convergence</span>
                      <span>{metrics.convergence.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-300" style={{width: `${metrics.convergence}%`}}></div>
                  </div>
              </div>
          </div>

      </div>

      {/* 4. RIGHT PANEL: Analysis & Reports */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Gas Curve */}
          <div className="h-[280px] bg-[#0c1210]/90 backdrop-blur-md border border-green-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500"/> 瓦斯浓度曲线 (CH4)
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${metrics.maxCH4 > 1.0 ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-green-900/30 text-green-400'}`}>
                      {metrics.maxCH4 > 1.0 ? 'ALARM' : 'NORMAL'}
                  </span>
              </div>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={GAS_DATA}>
                          <defs>
                              <linearGradient id="gradGas" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 2]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: '%', angle: -90, position: 'insideLeft', fill:'#64748b' }} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444', color: '#fff'}} />
                          <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                          <Area type="monotone" dataKey="ch4" stroke="#ef4444" fill="url(#gradGas)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px] text-slate-400">
                  <div className="bg-slate-900/50 rounded p-1">Peak: <span className="text-white">{metrics.maxCH4.toFixed(2)}%</span></div>
                  <div className="bg-slate-900/50 rounded p-1">Avg: <span className="text-white">{(metrics.maxCH4*0.6).toFixed(2)}%</span></div>
                  <div className="bg-slate-900/50 rounded p-1">Loc: <span className="text-white">Face</span></div>
              </div>
          </div>

          {/* Compliance Report */}
          <div className="flex-1 bg-[#0c1210]/90 backdrop-blur-md border border-green-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-green-900/50 pb-2">
                  <CheckCircle2 size={16} className="text-green-500"/> 交付合规性检查 (Audit)
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {COMPLIANCE_LIST.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded group hover:border-green-500/30 transition-colors">
                          <div>
                              <div className="text-xs font-bold text-slate-200">{item.item}</div>
                              <div className="text-[10px] text-slate-500">Req: {item.req}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-sm font-mono font-bold text-white">{item.val}</div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.status === 'Pass' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                  {item.status}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                  <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded shadow-lg shadow-green-900/30 transition-all flex items-center justify-center gap-2">
                      <Download size={14} /> 导出数字交付报告
                  </button>
              </div>
          </div>

      </div>

      {/* 5. BOTTOM OVERLAY: Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-slate-700 flex gap-6 text-[10px] text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div> Fresh Air</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div> Methane (CH4)</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Sensors</div>
      </div>

    </div>
  );
};
